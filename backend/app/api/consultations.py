import uuid
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_

from app.db.database import get_db, SyncSessionLocal
from app.db.models import (
    User, Scan, ExpertCase, ExpertProfile,
    ConsultationAppointment, ConsultationMessage
)
from app.security.auth import get_current_user

router = APIRouter(prefix="/consultations", tags=["Expert Consultation System"])

# ============================================================================
# WEBSOCKET REAL-TIME CONNECTION & WEBRTC SIGNALING MANAGER
# ============================================================================
class ConsultationConnectionManager:
    """Manages active WebSockets for real-time text chat and WebRTC P2P video signaling."""
    def __init__(self):
        # Room -> list of (WebSocket, user_info dict)
        self.active_rooms: Dict[str, List[Dict[str, Any]]] = {}

    async def connect(self, room_id: str, websocket: WebSocket, user_info: Dict[str, Any]):
        await websocket.accept()
        if room_id not in self.active_rooms:
            self.active_rooms[room_id] = []
        
        self.active_rooms[room_id].append({
            "socket": websocket,
            "user": user_info
        })

        # Broadcast participant join notice
        await self.broadcast(room_id, {
            "type": "peer_joined",
            "peer_count": len(self.active_rooms[room_id]),
            "user": user_info,
            "timestamp": datetime.utcnow().isoformat()
        }, exclude=websocket)

    def disconnect(self, room_id: str, websocket: WebSocket):
        if room_id in self.active_rooms:
            self.active_rooms[room_id] = [
                p for p in self.active_rooms[room_id] if p["socket"] != websocket
            ]
            if not self.active_rooms[room_id]:
                del self.active_rooms[room_id]

    async def broadcast(self, room_id: str, payload: dict, exclude: Optional[WebSocket] = None):
        if room_id in self.active_rooms:
            dead_sockets = []
            for participant in self.active_rooms[room_id]:
                sock = participant["socket"]
                if sock != exclude:
                    try:
                        await sock.send_text(json.dumps(payload))
                    except Exception:
                        dead_sockets.append(sock)
            
            for dead in dead_sockets:
                self.disconnect(room_id, dead)

    def get_peer_count(self, room_id: str) -> int:
        return len(self.active_rooms.get(room_id, []))

manager = ConsultationConnectionManager()


# ============================================================================
# PYDANTIC SCHEMAS
# ============================================================================
class ConsultationRequest(BaseModel):
    expert_id: Optional[str] = None
    scan_id: Optional[str] = None
    crop: str = "Tomato"
    problem_description: str
    consultation_type: str = "CHAT"  # CHAT or VIDEO
    scheduled_time: str
    shared_image_url: Optional[str] = None
    farmer_consent: bool = True

class ConsultationMessageCreate(BaseModel):
    message: str
    image_url: Optional[str] = None
    message_type: str = "TEXT"  # TEXT, IMAGE, IMAGE_REQUEST, PRESCRIPTION, SYSTEM

class ExpertReviewAction(BaseModel):
    expert_assessment: str
    expert_treatment_recommendation: Optional[str] = None
    additional_images_requested: bool = False
    additional_images_request_note: Optional[str] = None
    outcome: str = "RESOLVED"  # RESOLVED, PRESCRIPTION_ISSUED, ESCALATED
    status: str = "COMPLETED"

class AdminVerifyExpertRequest(BaseModel):
    expert_id: str
    verification_status: str  # VERIFIED, PENDING, SUSPENDED
    admin_notes: Optional[str] = None


# ============================================================================
# 1. EXPERT PROFILES & DIRECTORY
# ============================================================================
@router.get("/experts")
async def list_verified_experts(
    crop: Optional[str] = None,
    language: Optional[str] = None,
    verification_status: str = "VERIFIED",
    db: AsyncSession = Depends(get_db)
):
    """List agricultural expert profiles with qualifications, specializations and available slots."""
    query = select(ExpertProfile)
    if verification_status and verification_status != "ALL":
        query = query.filter(ExpertProfile.verification_status == verification_status)

    result = await db.execute(query.order_by(ExpertProfile.rating.desc()))
    experts = result.scalars().all()

    output = []
    for exp in experts:
        # Filter in Python for JSON array containment
        if crop and crop.lower() != "all":
            crop_match = any(crop.lower() in str(s).lower() for s in (exp.specializations or []))
            if not crop_match:
                continue

        if language and language.lower() != "all":
            lang_match = any(language.lower() in str(l).lower() for l in (exp.languages or []))
            if not lang_match:
                continue

        output.append({
            "id": exp.id,
            "user_id": exp.user_id,
            "name": exp.name,
            "designation": exp.designation,
            "institution": exp.institution,
            "qualifications": exp.qualifications,
            "specializations": exp.specializations or [],
            "languages": exp.languages or [],
            "experience_years": exp.experience_years,
            "verification_status": exp.verification_status,
            "avatar_url": exp.avatar_url,
            "rating": exp.rating,
            "consultation_count": exp.consultation_count,
            "available_days": exp.available_days or [],
            "available_hours": exp.available_hours,
            "available_slots": exp.available_slots or []
        })

    return {"success": True, "data": output}


@router.get("/experts/{expert_id}")
async def get_expert_detail(expert_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ExpertProfile).filter(ExpertProfile.id == expert_id))
    exp = result.scalars().first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expert profile not found.")
    
    return {
        "success": True,
        "data": {
            "id": exp.id,
            "user_id": exp.user_id,
            "name": exp.name,
            "designation": exp.designation,
            "institution": exp.institution,
            "qualifications": exp.qualifications,
            "specializations": exp.specializations or [],
            "languages": exp.languages or [],
            "experience_years": exp.experience_years,
            "verification_status": exp.verification_status,
            "avatar_url": exp.avatar_url,
            "rating": exp.rating,
            "consultation_count": exp.consultation_count,
            "available_days": exp.available_days or [],
            "available_hours": exp.available_hours,
            "available_slots": exp.available_slots or []
        }
    }


# ============================================================================
# 2. FARMER CONSULTATION BOOKING & MANAGEMENT
# ============================================================================
@router.post("/request")
async def request_consultation(
    req: ConsultationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Farmer requests a chat or video consultation with consent and appointment slot."""
    if not req.farmer_consent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Explicit farmer consent is required to share leaf images, location, and field history with experts."
        )

    if not req.problem_description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a brief description of the crop symptoms or field condition."
        )

    # 1. Resolve Expert
    expert_id = req.expert_id
    expert_name = "Next Available Agronomist"
    if expert_id:
        exp_res = await db.execute(select(ExpertProfile).filter(ExpertProfile.id == expert_id))
        expert = exp_res.scalars().first()
        if expert:
            expert_name = expert.name
        else:
            expert_id = None

    if not expert_id:
        # Auto-assign next available verified expert
        def_exp_res = await db.execute(
            select(ExpertProfile).filter(ExpertProfile.verification_status == "VERIFIED").order_by(ExpertProfile.rating.desc())
        )
        def_expert = def_exp_res.scalars().first()
        if def_expert:
            expert_id = def_expert.id
            expert_name = def_expert.name

    # 2. Check or create linked ExpertCase in the review queue
    case_id = None
    if req.scan_id:
        case_res = await db.execute(select(ExpertCase).filter(ExpertCase.scan_id == req.scan_id))
        case_obj = case_res.scalars().first()
        if case_obj:
            case_id = case_obj.id
        else:
            scan_res = await db.execute(select(Scan).filter(Scan.id == req.scan_id))
            scan_obj = scan_res.scalars().first()
            new_case = ExpertCase(
                scan_id=req.scan_id,
                farmer_name=current_user.name,
                farmer_phone=current_user.phone or "Not provided",
                field_name=f"{req.crop} Field Plot",
                crop=req.crop,
                ai_disease=scan_obj.disease_name if scan_obj else "Unidentified Foliar Condition",
                ai_confidence=scan_obj.confidence if scan_obj else 0.75,
                ai_severity=scan_obj.severity if scan_obj else "Moderate",
                status="PENDING",
                farmer_notes=req.problem_description,
                farmer_consent=req.farmer_consent,
                expert_name=expert_name
            )
            db.add(new_case)
            await db.commit()
            await db.refresh(new_case)
            case_id = new_case.id

    # 3. Create Consultation Appointment
    room_uuid = f"room-{uuid.uuid4().hex[:12]}"
    new_consultation = ConsultationAppointment(
        farmer_id=current_user.id,
        farmer_name=current_user.name,
        farmer_phone=current_user.phone or "+91 94431 82740",
        farmer_district=current_user.district or "Coimbatore",
        expert_id=expert_id,
        expert_name=expert_name,
        scan_id=req.scan_id,
        case_id=case_id,
        consultation_type=req.consultation_type.upper(),
        problem_description=req.problem_description.strip(),
        crop=req.crop,
        shared_image_url=req.shared_image_url,
        farmer_consent=req.farmer_consent,
        scheduled_time=req.scheduled_time,
        status="CONFIRMED",
        room_id=room_uuid
    )
    db.add(new_consultation)
    await db.commit()
    await db.refresh(new_consultation)

    # 4. Add initial system message & farmer problem summary
    welcome_msg = ConsultationMessage(
        consultation_id=new_consultation.id,
        sender_id=None,
        sender_name="CropGuard System",
        sender_role="SYSTEM",
        message=f"Consultation confirmed with {expert_name}. {req.consultation_type.upper()} consultation room is active for {req.scheduled_time}.",
        message_type="SYSTEM"
    )
    db.add(welcome_msg)

    if req.shared_image_url:
        farmer_initial_msg = ConsultationMessage(
            consultation_id=new_consultation.id,
            sender_id=current_user.id,
            sender_name=current_user.name,
            sender_role="FARMER",
            message=f"Farmer Field Observation: {req.problem_description}",
            image_url=req.shared_image_url,
            message_type="IMAGE"
        )
        db.add(farmer_initial_msg)

    await db.commit()

    return {
        "success": True,
        "message": f"Consultation scheduled successfully with {expert_name}.",
        "data": {
            "id": new_consultation.id,
            "room_id": new_consultation.room_id,
            "expert_name": new_consultation.expert_name,
            "consultation_type": new_consultation.consultation_type,
            "scheduled_time": new_consultation.scheduled_time,
            "status": new_consultation.status,
            "crop": new_consultation.crop
        }
    }


@router.get("/my")
async def get_my_consultations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve consultation list based on role (Farmer sees theirs, Expert sees assigned/queue)."""
    if current_user.role in ["EXPERT", "OFFICER", "SYS_ADMIN"]:
        # Experts see consultations assigned to their profile or all open requests
        exp_profile_res = await db.execute(select(ExpertProfile).filter(ExpertProfile.user_id == current_user.id))
        exp_profile = exp_profile_res.scalars().first()
        
        if exp_profile:
            query = select(ConsultationAppointment).filter(
                or_(
                    ConsultationAppointment.expert_id == exp_profile.id,
                    ConsultationAppointment.status.in_(["REQUESTED", "CONFIRMED", "IN_PROGRESS"])
                )
            )
        else:
            query = select(ConsultationAppointment)
    else:
        # Farmers see only their own consultations
        query = select(ConsultationAppointment).filter(ConsultationAppointment.farmer_id == current_user.id)

    result = await db.execute(query.order_by(ConsultationAppointment.created_at.desc()))
    items = result.scalars().all()

    output = []
    for c in items:
        output.append({
            "id": c.id,
            "farmer_id": c.farmer_id,
            "farmer_name": c.farmer_name,
            "farmer_phone": c.farmer_phone,
            "farmer_district": c.farmer_district,
            "expert_id": c.expert_id,
            "expert_name": c.expert_name,
            "scan_id": c.scan_id,
            "case_id": c.case_id,
            "consultation_type": c.consultation_type,
            "problem_description": c.problem_description,
            "crop": c.crop,
            "shared_image_url": c.shared_image_url,
            "farmer_consent": c.farmer_consent,
            "scheduled_time": c.scheduled_time,
            "status": c.status,
            "room_id": c.room_id,
            "expert_assessment": c.expert_assessment,
            "expert_treatment_recommendation": c.expert_treatment_recommendation,
            "additional_images_requested": c.additional_images_requested,
            "additional_images_request_note": c.additional_images_request_note,
            "outcome": c.outcome,
            "created_at": c.created_at.strftime("%Y-%m-%d %H:%M") if c.created_at else ""
        })

    return {"success": True, "data": output}


@router.get("/{consultation_id}")
async def get_consultation_details(
    consultation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve consultation record, security check, and case context."""
    result = await db.execute(select(ConsultationAppointment).filter(ConsultationAppointment.id == consultation_id))
    c = result.scalars().first()
    if not c:
        raise HTTPException(status_code=404, detail="Consultation appointment not found.")

    # Access control: Farmer can only view their own; Experts & Admins can view assigned or queue
    if current_user.role == "FARMER" and c.farmer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this private consultation.")

    # Fetch expert profile details if available
    expert_meta = None
    if c.expert_id:
        exp_res = await db.execute(select(ExpertProfile).filter(ExpertProfile.id == c.expert_id))
        exp = exp_res.scalars().first()
        if exp:
            expert_meta = {
                "id": exp.id,
                "name": exp.name,
                "designation": exp.designation,
                "institution": exp.institution,
                "qualifications": exp.qualifications,
                "avatar_url": exp.avatar_url
            }

    # Fetch messages
    msg_res = await db.execute(
        select(ConsultationMessage)
        .filter(ConsultationMessage.consultation_id == consultation_id)
        .order_by(ConsultationMessage.created_at.asc())
    )
    messages = [
        {
            "id": m.id,
            "sender_id": m.sender_id,
            "sender_name": m.sender_name,
            "sender_role": m.sender_role,
            "message": m.message,
            "image_url": m.image_url,
            "message_type": m.message_type,
            "created_at": m.created_at.strftime("%H:%M") if m.created_at else ""
        }
        for m in msg_res.scalars().all()
    ]

    return {
        "success": True,
        "data": {
            "id": c.id,
            "farmer_id": c.farmer_id,
            "farmer_name": c.farmer_name,
            "farmer_phone": c.farmer_phone,
            "farmer_district": c.farmer_district,
            "expert_id": c.expert_id,
            "expert_name": c.expert_name,
            "expert_meta": expert_meta,
            "scan_id": c.scan_id,
            "case_id": c.case_id,
            "consultation_type": c.consultation_type,
            "problem_description": c.problem_description,
            "crop": c.crop,
            "shared_image_url": c.shared_image_url,
            "farmer_consent": c.farmer_consent,
            "scheduled_time": c.scheduled_time,
            "status": c.status,
            "room_id": c.room_id,
            "expert_assessment": c.expert_assessment,
            "expert_treatment_recommendation": c.expert_treatment_recommendation,
            "additional_images_requested": c.additional_images_requested,
            "additional_images_request_note": c.additional_images_request_note,
            "outcome": c.outcome,
            "created_at": c.created_at.strftime("%Y-%m-%d %H:%M") if c.created_at else "",
            "messages": messages
        }
    }


@router.post("/{consultation_id}/cancel")
async def cancel_consultation(
    consultation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Cancel an upcoming consultation appointment."""
    result = await db.execute(select(ConsultationAppointment).filter(ConsultationAppointment.id == consultation_id))
    c = result.scalars().first()
    if not c:
        raise HTTPException(status_code=404, detail="Consultation not found.")

    if current_user.role == "FARMER" and c.farmer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this appointment.")

    c.status = "CANCELLED"
    await db.commit()

    # Broadcast status change to room
    await manager.broadcast(c.room_id, {
        "type": "consultation_status_change",
        "status": "CANCELLED",
        "cancelled_by": current_user.name
    })

    return {"success": True, "message": "Consultation cancelled successfully."}


# ============================================================================
# 3. PERSISTENT CHAT MESSAGING
# ============================================================================
@router.get("/{consultation_id}/messages")
async def get_consultation_messages(
    consultation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(ConsultationMessage)
        .filter(ConsultationMessage.consultation_id == consultation_id)
        .order_by(ConsultationMessage.created_at.asc())
    )
    messages = result.scalars().all()
    return {
        "success": True,
        "data": [
            {
                "id": m.id,
                "sender_id": m.sender_id,
                "sender_name": m.sender_name,
                "sender_role": m.sender_role,
                "message": m.message,
                "image_url": m.image_url,
                "message_type": m.message_type,
                "created_at": m.created_at.strftime("%H:%M") if m.created_at else ""
            }
            for m in messages
        ]
    }


@router.post("/{consultation_id}/messages")
async def send_consultation_message(
    consultation_id: str,
    req: ConsultationMessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send and persist a message to consultation history (REST fallback)."""
    c_res = await db.execute(select(ConsultationAppointment).filter(ConsultationAppointment.id == consultation_id))
    consultation = c_res.scalars().first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found.")

    sender_role = "EXPERT" if current_user.role in ["EXPERT", "OFFICER", "SYS_ADMIN"] else "FARMER"
    new_msg = ConsultationMessage(
        consultation_id=consultation_id,
        sender_id=current_user.id,
        sender_name=current_user.name,
        sender_role=sender_role,
        message=req.message.strip(),
        image_url=req.image_url,
        message_type=req.message_type
    )
    db.add(new_msg)
    await db.commit()
    await db.refresh(new_msg)

    # Broadcast via WebSocket if room active
    payload = {
        "type": "chat_message",
        "id": new_msg.id,
        "sender_id": new_msg.sender_id,
        "sender_name": new_msg.sender_name,
        "sender_role": new_msg.sender_role,
        "message": new_msg.message,
        "image_url": new_msg.image_url,
        "message_type": new_msg.message_type,
        "created_at": new_msg.created_at.strftime("%H:%M") if new_msg.created_at else ""
    }
    await manager.broadcast(consultation.room_id, payload)

    return {"success": True, "data": payload}


# ============================================================================
# 4. EXPERT CLINICAL REVIEW WORKFLOW
# ============================================================================
@router.post("/{consultation_id}/review")
async def expert_review_consultation(
    consultation_id: str,
    action: ExpertReviewAction,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Authorized agronomist records clinical diagnosis, issues prescription, or requests extra pictures."""
    if current_user.role not in ["EXPERT", "OFFICER", "SYS_ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only verified agricultural experts or officers are authorized to issue clinical reviews."
        )

    res = await db.execute(select(ConsultationAppointment).filter(ConsultationAppointment.id == consultation_id))
    c = res.scalars().first()
    if not c:
        raise HTTPException(status_code=404, detail="Consultation appointment not found.")

    # Update appointment assessment fields
    c.expert_assessment = action.expert_assessment
    c.expert_treatment_recommendation = action.expert_treatment_recommendation
    c.additional_images_requested = action.additional_images_requested
    c.additional_images_request_note = action.additional_images_request_note
    c.outcome = action.outcome
    c.status = action.status

    # Synchronize linked ExpertCase if exists
    if c.case_id:
        case_res = await db.execute(select(ExpertCase).filter(ExpertCase.id == c.case_id))
        case_obj = case_res.scalars().first()
        if case_obj:
            case_obj.expert_diagnosis = action.expert_assessment
            case_obj.expert_notes = action.additional_images_request_note
            case_obj.expert_treatment = action.expert_treatment_recommendation
            case_obj.expert_name = current_user.name
            case_obj.status = "VERIFIED" if action.outcome == "RESOLVED" else "CORRECTED"

    # Post system message to consultation thread
    review_summary = f"📋 Clinical Assessment by {current_user.name}: {action.expert_assessment}."
    if action.expert_treatment_recommendation:
        review_summary += f"\nPrescription: {action.expert_treatment_recommendation}"
    if action.additional_images_requested:
        review_summary += f"\n📸 Additional Photo Requested: {action.additional_images_request_note}"

    sys_msg = ConsultationMessage(
        consultation_id=c.id,
        sender_id=current_user.id,
        sender_name=current_user.name,
        sender_role="EXPERT",
        message=review_summary,
        message_type="PRESCRIPTION" if action.expert_treatment_recommendation else "TEXT"
    )
    db.add(sys_msg)
    await db.commit()

    # Broadcast to live room
    await manager.broadcast(c.room_id, {
        "type": "expert_review_updated",
        "expert_name": current_user.name,
        "assessment": action.expert_assessment,
        "prescription": action.expert_treatment_recommendation,
        "additional_images_requested": action.additional_images_requested,
        "additional_images_request_note": action.additional_images_request_note,
        "outcome": action.outcome,
        "status": action.status
    })

    return {"success": True, "message": "Clinical review and prescription recorded successfully."}


# ============================================================================
# 5. ADMIN VERIFICATION WORKFLOW
# ============================================================================
@router.post("/admin/verify-expert")
async def admin_verify_expert(
    req: AdminVerifyExpertRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Administrator workflow to verify or update agricultural expert accreditation."""
    if current_user.role not in ["SYS_ADMIN", "OFFICER"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator or senior officer privileges required to verify expert credentials."
        )

    res = await db.execute(select(ExpertProfile).filter(ExpertProfile.id == req.expert_id))
    exp = res.scalars().first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expert profile not found.")

    exp.verification_status = req.verification_status
    await db.commit()

    return {
        "success": True,
        "message": f"Expert {exp.name} verification status updated to {req.verification_status}."
    }


# ============================================================================
# 6. WEBSOCKET REAL-TIME CHAT & WEBRTC P2P SIGNALING
# ============================================================================
@router.websocket("/ws/{room_id}")
async def consultation_websocket_endpoint(
    websocket: WebSocket,
    room_id: str,
    token: Optional[str] = Query(None)
):
    """
    Real-time persistent messaging & WebRTC P2P signaling endpoint.
    Handles:
    - chat_message: persist and broadcast
    - webrtc_offer, webrtc_answer, webrtc_ice_candidate: P2P video signaling
    - request_photo, send_prescription
    """
    # Simple user resolution for websocket
    user_info = {"id": "guest", "name": "Participant", "role": "FARMER"}
    if token:
        # Resolve user name from database if token matches
        try:
            with SyncSessionLocal() as s_db:
                # Basic lookup or decode
                u = s_db.query(User).filter(or_(User.id == token, User.email == token)).first()
                if u:
                    user_info = {"id": u.id, "name": u.name, "role": u.role}
        except Exception:
            pass

    await manager.connect(room_id, websocket, user_info)

    try:
        while True:
            raw_data = await websocket.receive_text()
            try:
                data = json.loads(raw_data)
            except json.JSONDecodeError:
                continue

            event_type = data.get("type", "chat_message")

            # A. Real-Time Chat Message (Persist to SQLite & Broadcast)
            if event_type == "chat_message":
                text = (data.get("message") or "").strip()
                image_url = data.get("image_url")
                message_type = data.get("message_type", "TEXT")
                sender_name = data.get("sender_name") or user_info["name"]
                sender_role = data.get("sender_role") or user_info["role"]
                consultation_id = data.get("consultation_id")

                # Persist to database if consultation_id provided
                msg_id = f"msg-{uuid.uuid4().hex[:8]}"
                if consultation_id and text:
                    try:
                        with SyncSessionLocal() as s_db:
                            c_record = s_db.query(ConsultationAppointment).filter_by(room_id=room_id).first()
                            if c_record:
                                db_msg = ConsultationMessage(
                                    id=msg_id,
                                    consultation_id=c_record.id,
                                    sender_id=user_info["id"],
                                    sender_name=sender_name,
                                    sender_role=sender_role,
                                    message=text,
                                    image_url=image_url,
                                    message_type=message_type
                                )
                                s_db.add(db_msg)
                                s_db.commit()
                    except Exception as e:
                        print(f"[WS] Message persistence notice: {e}")

                # Broadcast to all peers in room
                await manager.broadcast(room_id, {
                    "type": "chat_message",
                    "id": msg_id,
                    "sender_id": user_info["id"],
                    "sender_name": sender_name,
                    "sender_role": sender_role,
                    "message": text,
                    "image_url": image_url,
                    "message_type": message_type,
                    "created_at": datetime.utcnow().strftime("%H:%M")
                })

            # B. WebRTC P2P Video Signaling (Relayed between peers)
            elif event_type in ["webrtc_offer", "webrtc_answer", "webrtc_ice_candidate", "webrtc_ready"]:
                # Relay signaling payload directly to other peer(s) in room
                await manager.broadcast(room_id, data, exclude=websocket)

            # C. In-Call Photo Request from Agronomist
            elif event_type == "request_photo":
                await manager.broadcast(room_id, {
                    "type": "request_photo",
                    "sender_name": user_info["name"],
                    "note": data.get("note", "Please capture a clear photo of the lower stem and soil bed."),
                    "timestamp": datetime.utcnow().strftime("%H:%M")
                })

            # D. In-Call Prescription Notice
            elif event_type == "send_prescription":
                await manager.broadcast(room_id, {
                    "type": "send_prescription",
                    "sender_name": user_info["name"],
                    "prescription": data.get("prescription", ""),
                    "timestamp": datetime.utcnow().strftime("%H:%M")
                })

    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)
        await manager.broadcast(room_id, {
            "type": "peer_left",
            "peer_count": manager.get_peer_count(room_id),
            "user": user_info,
            "timestamp": datetime.utcnow().isoformat()
        })
