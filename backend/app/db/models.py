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
    phone = Column(String, unique=True, index=True, nullable=True)
    email = Column(String, unique=True, index=True, nullable=True)
    supabase_user_id = Column(String, unique=True, index=True, nullable=True)
    role = Column(String, default="FARMER") # FARMER, EXPERT, FIELD_OFFICER, DISTRICT_ADMIN, SYS_ADMIN
    preferred_language = Column(String, default="en") # en, ta, hi
    state = Column(String, default="Tamil Nadu")
    district = Column(String, default="Coimbatore")
    measurement_unit = Column(String, default="acre") # acre, hectare
    password_hash = Column(String, nullable=True)
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
    
    # Metadata & Context
    crop = Column(String, default="Tomato")
    district = Column(String, default="Coimbatore")
    growth_stage = Column(String, default="Vegetative")
    symptom_regions = Column(JSON, default=list)
    
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
    farmer_notes = Column(Text, nullable=True)
    farmer_consent = Column(Boolean, default=True)
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


class AgriProduct(Base):
    __tablename__ = "agri_products"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, index=True)
    active_ingredient = Column(String, nullable=False)
    category = Column(String, default="Fungicide") # Fungicide, Bio-Control, Bactericide, Botanical, Micro-Nutrient
    manufacturer = Column(String, nullable=False)
    target_crops = Column(JSON, default=list)
    target_diseases = Column(JSON, default=list)
    approved_usage_and_label = Column(Text, nullable=False)
    safety_precautions = Column(Text, nullable=False)
    pre_harvest_interval_days = Column(Integer, default=7)
    registration_number = Column(String, nullable=True)
    verified_source = Column(String, default="CIBRC & TNAU Agritech Portal")
    last_verified_date = Column(String, default="2026-03-01")
    created_at = Column(DateTime, default=datetime.utcnow)

    inventories = relationship("ShopInventory", back_populates="product", cascade="all, delete-orphan")


class AgriShop(Base):
    __tablename__ = "agri_shops"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, index=True)
    type = Column(String, default="LICENSED_RETAILER") # LICENSED_RETAILER, COOPERATIVE_SOCIETY, KVK_SALES_COUNTER, GOVT_AGRI_DEPOT, FPO_OUTLET
    license_number = Column(String, nullable=True)
    district = Column(String, nullable=False, index=True)
    taluk_or_town = Column(String, nullable=False, index=True)
    pincode = Column(String, nullable=True, index=True)
    address = Column(Text, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    phone = Column(String, nullable=True)
    whatsapp = Column(String, nullable=True)
    operating_hours = Column(String, default="Mon-Sat: 8:00 AM - 7:30 PM")
    verified_status = Column(String, default="VERIFIED_DEALER") # VERIFIED_DEALER, AUTHORIZED_COOPERATIVE, GOVT_INSTITUTION
    last_verified_date = Column(String, default="2026-03-01")
    created_at = Column(DateTime, default=datetime.utcnow)

    inventories = relationship("ShopInventory", back_populates="shop", cascade="all, delete-orphan")


class ShopInventory(Base):
    __tablename__ = "shop_inventory"

    id = Column(String, primary_key=True, default=generate_uuid)
    shop_id = Column(String, ForeignKey("agri_shops.id"), nullable=False, index=True)
    product_id = Column(String, ForeignKey("agri_products.id"), nullable=False, index=True)
    package_size = Column(String, nullable=False) # e.g. "500g", "1L", "250g"
    price_inr = Column(Float, nullable=True) # None when unverified
    price_verified = Column(Boolean, default=True) # False if live price cannot be confirmed
    stock_status = Column(String, default="IN_STOCK") # IN_STOCK, LOW_STOCK, OUT_OF_STOCK, CALL_TO_VERIFY
    stock_verified = Column(Boolean, default=True) # False if live stock cannot be confirmed
    last_verified_date = Column(String, default="2026-03-01")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    shop = relationship("AgriShop", back_populates="inventories")
    product = relationship("AgriProduct", back_populates="inventories")


class ExpertProfile(Base):
    __tablename__ = "expert_profiles"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    name = Column(String, nullable=False, index=True)
    designation = Column(String, nullable=False) # e.g. "Senior Plant Pathologist"
    institution = Column(String, nullable=False) # e.g. "Tamil Nadu Agricultural University (TNAU), Coimbatore"
    qualifications = Column(String, nullable=False) # e.g. "Ph.D. Plant Pathology (TNAU)"
    specializations = Column(JSON, default=list) # e.g. ["Solanaceous Vegetables", "Fungal Blights", "Bio-Control"]
    languages = Column(JSON, default=list) # e.g. ["Tamil", "English"]
    experience_years = Column(Integer, default=12)
    verification_status = Column(String, default="VERIFIED", index=True) # VERIFIED, PENDING, SUSPENDED
    avatar_url = Column(String, nullable=True)
    rating = Column(Float, default=4.9)
    consultation_count = Column(Integer, default=45)
    available_days = Column(JSON, default=list)
    available_hours = Column(String, default="09:00 AM - 05:30 PM")
    available_slots = Column(JSON, default=list) # e.g. ["Today 10:00 AM - 10:30 AM", "Today 02:30 PM - 03:00 PM"]
    created_at = Column(DateTime, default=datetime.utcnow)

    consultations = relationship("ConsultationAppointment", back_populates="expert")


class ConsultationAppointment(Base):
    __tablename__ = "consultations"

    id = Column(String, primary_key=True, default=generate_uuid)
    farmer_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    farmer_name = Column(String, nullable=False)
    farmer_phone = Column(String, nullable=True)
    farmer_district = Column(String, default="Coimbatore")
    expert_id = Column(String, ForeignKey("expert_profiles.id"), nullable=True, index=True)
    expert_name = Column(String, nullable=True)
    scan_id = Column(String, ForeignKey("scans.id"), nullable=True, index=True)
    case_id = Column(String, ForeignKey("expert_cases.id"), nullable=True, index=True)
    consultation_type = Column(String, default="CHAT") # CHAT, VIDEO
    problem_description = Column(Text, nullable=False)
    crop = Column(String, default="Tomato")
    shared_image_url = Column(String, nullable=True)
    farmer_consent = Column(Boolean, default=True)
    scheduled_time = Column(String, nullable=False)
    status = Column(String, default="REQUESTED", index=True) # REQUESTED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
    room_id = Column(String, default=generate_uuid, index=True) # WebRTC/chat room identifier
    expert_assessment = Column(Text, nullable=True)
    expert_treatment_recommendation = Column(Text, nullable=True)
    additional_images_requested = Column(Boolean, default=False)
    additional_images_request_note = Column(Text, nullable=True)
    outcome = Column(String, nullable=True) # RESOLVED, PRESCRIPTION_ISSUED, ESCALATED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    expert = relationship("ExpertProfile", back_populates="consultations")
    messages = relationship("ConsultationMessage", back_populates="consultation", cascade="all, delete-orphan", order_by="ConsultationMessage.created_at")


class ConsultationMessage(Base):
    __tablename__ = "consultation_messages"

    id = Column(String, primary_key=True, default=generate_uuid)
    consultation_id = Column(String, ForeignKey("consultations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_id = Column(String, nullable=True)
    sender_name = Column(String, nullable=False)
    sender_role = Column(String, default="FARMER") # FARMER, EXPERT, SYSTEM
    message = Column(Text, nullable=False)
    image_url = Column(String, nullable=True)
    message_type = Column(String, default="TEXT") # TEXT, IMAGE, IMAGE_REQUEST, PRESCRIPTION, SYSTEM
    created_at = Column(DateTime, default=datetime.utcnow)

    consultation = relationship("ConsultationAppointment", back_populates="messages")

