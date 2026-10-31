import pytest
from app.db.database import SyncSessionLocal, ensure_schema_migrations
from app.db.models import ExpertProfile, ConsultationAppointment, ConsultationMessage, User
from app.db.seed import init_phase6_experts_and_consultations
from app.api.consultations import manager

def test_phase6_schema_and_expert_profiles():
    """Verify Phase 6 tables exist and verified expert profiles are seeded with authentic credentials."""
    ensure_schema_migrations()
    init_phase6_experts_and_consultations()
    with SyncSessionLocal() as db:
        experts = db.query(ExpertProfile).all()
        assert len(experts) >= 3, "At least 3 verified agricultural experts should be seeded"
        
        # Test Dr. S. Lakshmi profile
        lakshmi = db.query(ExpertProfile).filter_by(name="Dr. S. Lakshmi").first()
        assert lakshmi is not None
        assert "TNAU" in lakshmi.institution
        assert "Pathologist" in lakshmi.designation
        assert lakshmi.verification_status == "VERIFIED"
        assert len(lakshmi.specializations) > 0
        assert "Tamil" in lakshmi.languages
        assert len(lakshmi.available_slots) > 0


def test_consultation_appointment_and_consent():
    """Verify consultation record has farmer consent, room ID, and appointment slot."""
    with SyncSessionLocal() as db:
        consultation = db.query(ConsultationAppointment).first()
        assert consultation is not None
        assert consultation.farmer_consent is True
        assert consultation.room_id is not None
        assert consultation.scheduled_time is not None
        assert consultation.status in ["REQUESTED", "CONFIRMED", "IN_PROGRESS", "COMPLETED"]


def test_consultation_messages_persistence():
    """Verify persistent messages are saved with role, type, and consultation association."""
    with SyncSessionLocal() as db:
        consultation = db.query(ConsultationAppointment).first()
        assert consultation is not None

        messages = db.query(ConsultationMessage).filter_by(consultation_id=consultation.id).all()
        assert len(messages) >= 2, "Demo consultation should contain initial messages"
        
        # Check message types and roles
        roles = [m.sender_role for m in messages]
        assert "FARMER" in roles or "SYSTEM" in roles


def test_websocket_manager_lifecycle():
    """Verify WebSocket connection manager handles active rooms and peer counts correctly."""
    assert manager.get_peer_count("test-room-nonexistent") == 0
    manager.active_rooms["test-room-phase6"] = []
    assert manager.get_peer_count("test-room-phase6") == 0
    # Clean up test room
    del manager.active_rooms["test-room-phase6"]
