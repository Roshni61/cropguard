import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, nullable=True)
    role = Column(String, default="FARMER") # FARMER, EXPERT, FIELD_OFFICER, DISTRICT_ADMIN, SYS_ADMIN
    preferred_language = Column(String, default="en") # en, ta, hi
    state = Column(String, default="Tamil Nadu")
    district = Column(String, default="Coimbatore")
    measurement_unit = Column(String, default="acre") # acre, hectare
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    farms = relationship("Farm", back_populates="user", cascade="all, delete-orphan")

class Farm(Base):
    __tablename__ = "farms"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    address = Column(String, nullable=True)
    total_area = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="farms")
    fields = relationship("Field", back_populates="farm", cascade="all, delete-orphan")

class Field(Base):
    __tablename__ = "fields"

    id = Column(String, primary_key=True, default=generate_uuid)
    farm_id = Column(String, ForeignKey("farms.id"), nullable=False)
    name = Column(String, nullable=False)
    area = Column(Float, default=1.0)
    crop = Column(String, default="Tomato")
    variety = Column(String, default="Arka Rakshak")
    sowing_date = Column(String, nullable=True)
    expected_harvest_date = Column(String, nullable=True)
    crop_stage = Column(String, default="Vegetative") # Seedling, Vegetative, Flowering, Fruiting, Harvesting
    soil_type = Column(String, default="Red Loam")
    irrigation_type = Column(String, default="Drip")
    health_score = Column(Integer, default=88) # 0-100 score
    created_at = Column(DateTime, default=datetime.utcnow)

    farm = relationship("Farm", back_populates="fields")
    scans = relationship("Scan", back_populates="field", cascade="all, delete-orphan")

class Scan(Base):
    __tablename__ = "scans"

    id = Column(String, primary_key=True, default=generate_uuid)
    client_scan_id = Column(String, unique=True, index=True, nullable=True) # for offline sync deduplication
    field_id = Column(String, ForeignKey("fields.id"), nullable=False)
    image_url = Column(String, nullable=False)
    leaf_part = Column(String, default="leaf") # leaf, fruit, stem
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    
    # Image Quality Results
    quality_status = Column(String, default="GOOD") # GOOD, TOO_BLURRY, TOO_DARK, TOO_FAR, NO_LEAF_DETECTED
    quality_reasons = Column(JSON, default=list)
    
    # AI Diagnosis Results
    disease_name = Column(String, nullable=True)
    confidence = Column(Float, default=0.0) # 0.0 to 1.0
    confidence_level = Column(String, default="HIGH") # HIGH, MEDIUM, LOW
    severity = Column(String, default="Mild") # Mild, Moderate, Severe, Unavailable
    severity_confidence = Column(Float, default=0.85)
    alternatives = Column(JSON, default=list) # [{disease: '...', confidence: 0.3}]
    grad_cam_url = Column(String, nullable=True)
    
    # Weather Snapshot & Recommendations
    weather_snapshot = Column(JSON, default=dict)
    treatment_recommendations = Column(JSON, default=dict)
    spray_window_advice = Column(String, nullable=True)
    
    sync_status = Column(String, default="SYNCED") # SAVED_OFFLINE, SYNCING, SYNCED, FAILED
    follow_up_status = Column(String, default="NONE") # NONE, PENDING, COMPLETED
    created_at = Column(DateTime, default=datetime.utcnow)

    field = relationship("Field", back_populates="scans")

class TreatmentKnowledge(Base):
    __tablename__ = "treatment_knowledge"

    id = Column(String, primary_key=True, default=generate_uuid)
    crop = Column(String, nullable=False, index=True)
    disease = Column(String, nullable=False, index=True)
    symptoms = Column(Text, nullable=False)
    causes = Column(Text, nullable=False)
    organic_treatment = Column(JSON, nullable=False)
    chemical_treatment = Column(JSON, nullable=False)
    active_ingredients = Column(String, nullable=True)
    dosage = Column(String, nullable=True)
    application_timing = Column(String, nullable=True)
    safety_precautions = Column(Text, nullable=True)
    pre_harvest_interval_days = Column(Integer, default=7)
    crop_stage_compatibility = Column(String, default="All Stages")
    weather_restrictions = Column(Text, nullable=True)
    verification_status = Column(String, default="VERIFIED") # VERIFIED, NOT_VERIFIED
    verified_by = Column(String, default="TNAU Agricultural Advisory Board")
    source_url = Column(String, default="https://tnau.ac.in/expert-system/")
    last_reviewed_date = Column(String, default="2026-01-15")

class OutbreakCluster(Base):
    __tablename__ = "outbreak_clusters"

    id = Column(String, primary_key=True, default=generate_uuid)
    crop = Column(String, nullable=False)
    disease = Column(String, nullable=False)
    district = Column(String, nullable=False)
    location_lat = Column(Float, nullable=False)
    location_lng = Column(Float, nullable=False)
    radius_km = Column(Float, default=10.0)
    case_count = Column(Integer, default=1)
    risk_level = Column(String, default="MEDIUM") # LOW, MEDIUM, HIGH
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    district = Column(String, nullable=False)
    crop = Column(String, default="Tomato")
    disease = Column(String, nullable=True)
    alert_type = Column(String, default="OUTBREAK_WARNING") # OUTBREAK_WARNING, WEATHER_WARNING, ADVISORY
    sender_name = Column(String, default="District Agriculture Officer")
    created_at = Column(DateTime, default=datetime.utcnow)

class ExpertCase(Base):
    __tablename__ = "expert_cases"

    id = Column(String, primary_key=True, default=generate_uuid)
    scan_id = Column(String, ForeignKey("scans.id"), nullable=False)
    farmer_name = Column(String, nullable=False)
    farmer_phone = Column(String, nullable=True)
    field_name = Column(String, nullable=False)
    crop = Column(String, default="Tomato")
    ai_disease = Column(String, nullable=True)
    ai_confidence = Column(Float, default=0.5)
    ai_severity = Column(String, default="Moderate")
    status = Column(String, default="PENDING") # PENDING, VERIFIED, CORRECTED, REJECTED
    expert_diagnosis = Column(String, nullable=True)
    expert_notes = Column(Text, nullable=True)
    expert_treatment = Column(Text, nullable=True)
    expert_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class MarketPrice(Base):
    __tablename__ = "market_prices"

    id = Column(String, primary_key=True, default=generate_uuid)
    crop = Column(String, nullable=False, index=True)
    market_name = Column(String, nullable=False)
    district = Column(String, nullable=False)
    state = Column(String, default="Tamil Nadu")
    price_per_kg = Column(Float, nullable=False)
    min_price = Column(Float, nullable=False)
    max_price = Column(Float, nullable=False)
    price_trend_7d = Column(String, default="+4.2%")
    updated_at = Column(DateTime, default=datetime.utcnow)

class GovernmentScheme(Base):
    __tablename__ = "government_schemes"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    category = Column(String, default="Crop Insurance & Subsidy")
    description = Column(Text, nullable=False)
    eligibility = Column(Text, nullable=False)
    subsidy_percentage = Column(String, default="50% - 80%")
    application_link = Column(String, nullable=False)
    source = Column(String, default="AgriPortal Govt of India")
    last_verified = Column(String, default="2026-02-01")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    sender = Column(String, default="user") # user, assistant
    text = Column(Text, nullable=False)
    language = Column(String, default="en") # en, ta, hi
    citations = Column(JSON, default=list) # verified knowledge citations
    field_context = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
