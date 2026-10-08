from app.db.database import SyncSessionLocal, sync_engine, Base
from app.db.models import (
    User, Farm, Field, Scan, TreatmentKnowledge,
    OutbreakCluster, Alert, ExpertCase, MarketPrice,
    GovernmentScheme
)
from app.security.pwd import hash_password

def seed_database():
    Base.metadata.create_all(bind=sync_engine)
    db = SyncSessionLocal()

    # Check if already seeded
    if db.query(User).filter_by(phone="9876543210").first():
        db.close()
        return

    print("[SEED] Seeding CropGuard AI database...")

    # 1. Seed Demo Users
    hashed_pwd = hash_password("farmer123")

    farmer = User(
        id="usr-farmer-01",
        name="Ramesh Kumar",
        phone="9876543210",
        email="ramesh@cropguard.agri",
        role="FARMER",
        preferred_language="en",
        state="Tamil Nadu",
        district="Coimbatore",
        measurement_unit="acre",
        password_hash=hashed_pwd
    )

    expert = User(
        id="usr-expert-01",
        name="Dr. S. Lakshmi (Pathologist)",
        phone="9876543211",
        email="lakshmi@tnau.ac.in",
        role="EXPERT",
        preferred_language="en",
        state="Tamil Nadu",
        district="Coimbatore",
        password_hash=hashed_pwd
    )

    officer = User(
        id="usr-officer-01",
        name="Officer V. Arumugam",
        phone="9876543212",
        email="officer.coimbatore@agri.tn.gov.in",
        role="FIELD_OFFICER",
        preferred_language="en",
        state="Tamil Nadu",
        district="Coimbatore",
        password_hash=hashed_pwd
    )

    db.add_all([farmer, expert, officer])
    db.commit()

    # 2. Seed Farm and Field
    farm = Farm(
        id="frm-01",
        user_id="usr-farmer-01",
        name="Green Valley Organics",
        location_lat=11.0168,
        location_lng=76.9558,
        address="Pollachi Road, Coimbatore",
        total_area=4.5
    )
    db.add(farm)
    db.commit()

    field1 = Field(
        id="fld-01",
        farm_id="frm-01",
        name="Tomato Field A (North)",
        area=2.4,
        crop="Tomato",
        variety="Arka Rakshak",
        sowing_date="2026-08-15",
        expected_harvest_date="2026-11-20",
        crop_stage="Fruiting",
        soil_type="Red Loam",
        irrigation_type="Drip Irrigation",
        health_score=82
    )

    field2 = Field(
        id="fld-02",
        farm_id="frm-01",
        name="Tomato Field B (South)",
        area=2.1,
        crop="Tomato",
        variety="Pusa Ruby",
        sowing_date="2026-09-01",
        expected_harvest_date="2026-12-05",
        crop_stage="Vegetative",
        soil_type="Black Cotton",
        irrigation_type="Drip Irrigation",
        health_score=94
    )
    db.add_all([field1, field2])
    db.commit()

    # 3. Seed Verified Treatment Knowledge Base
    kb_early_blight = TreatmentKnowledge(
        id="tk-01",
        crop="Tomato",
        disease="Early Blight (Alternaria solani)",
        symptoms="Dark brown circular lesions with concentric rings (target-like pattern) on lower leaves, surrounded by yellowing halos.",
        causes="Fungal pathogen Alternaria solani spread by splashing rain, high humidity (>75%), and temperatures between 24 deg C and 29 deg C.",
        organic_treatment={
            "title": "Neem Oil & Trichoderma viride Spray",
            "details": "Foliar spray of 5% Neem Seed Kernel Extract (NSKE) or Trichoderma viride @ 5g per litre of water. Repeat every 7-10 days."
        },
        chemical_treatment={
            "product_name": "Mancozeb 75% WP or Chlorothalonil 75% WP",
            "details": "Dissolve 2g of Mancozeb 75% WP per 1 litre of water. Ensure thorough coverage of lower foliage."
        },
        active_ingredients="Mancozeb 75% WP / Copper Oxychloride 50% WP",
        dosage="2.0 grams per 1 Litre of clean water (approx. 400g / acre)",
        application_timing="Early morning between 6:30 AM and 9:00 AM",
        safety_precautions="Wear protective face mask, goggles, and rubber gloves. Do not spray against wind direction.",
        pre_harvest_interval_days=7,
        crop_stage_compatibility="Vegetative, Flowering, Fruiting",
        weather_restrictions="Do not spray if rain is expected within 6 hours or wind speed exceeds 20 km/h.",
        verification_status="VERIFIED",
        verified_by="TNAU Agricultural Advisory Board & ICAR Krishi Vigyan Kendra",
        source_url="https://tnau.ac.in/expert-system/tomato/early-blight"
    )

    kb_late_blight = TreatmentKnowledge(
        id="tk-02",
        crop="Tomato",
        disease="Late Blight (Phytophthora infestans)",
        symptoms="Large water-soaked dark gray/brown spots with fine white cottony mold under leaves in cool humid weather.",
        causes="Oomycete pathogen Phytophthora infestans favoured by cool (15-22 deg C) wet weather.",
        organic_treatment={
            "title": "Copper Sulfate + Lime (Bordeaux Mixture 1%)",
            "details": "Spray freshly prepared 1% Bordeaux mixture on foliage."
        },
        chemical_treatment={
            "product_name": "Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold)",
            "details": "Spray Metalaxyl + Mancozeb @ 2g/L water."
        },
        active_ingredients="Metalaxyl 8% + Mancozeb 64% WP",
        dosage="2.0 grams per Litre water",
        application_timing="Immediate upon first symptom appearance",
        safety_precautions="Full protective gear required. Keep animals out of field for 48 hours.",
        pre_harvest_interval_days=14,
        verification_status="VERIFIED",
        verified_by="TNAU Agricultural Advisory Board",
        source_url="https://tnau.ac.in/expert-system/tomato/late-blight"
    )

    db.add_all([kb_early_blight, kb_late_blight])
    db.commit()

    # 4. Seed Outbreak Clusters & Alerts
    cluster = OutbreakCluster(
        id="cluster-01",
        crop="Tomato",
        disease="Early Blight",
        district="Coimbatore",
        location_lat=11.0168,
        location_lng=76.9558,
        radius_km=8.5,
        case_count=17,
        risk_level="HIGH",
        summary="Cluster of 17 Early Blight detections in Pollachi-Coimbatore agricultural belt following recent rainfall."
    )
    db.add(cluster)

    alert = Alert(
        id="alt-01",
        title="Early Blight Alert - Coimbatore District",
        message="Multiple Early Blight cases (17 reported) detected within an 8km radius. High relative humidity (78%) favours spore spread. Tomato farmers are advised to inspect foliage today.",
        district="Coimbatore",
        crop="Tomato",
        disease="Early Blight",
        alert_type="OUTBREAK_WARNING",
        sender_name="District Agriculture Officer Arumugam"
    )
    db.add(alert)

    # 5. Seed Market Prices
    mp1 = MarketPrice(id="mp-01", crop="Tomato", market_name="Coimbatore MGR Wholesale Market", district="Coimbatore", state="Tamil Nadu", price_per_kg=34.50, min_price=30.0, max_price=38.0, price_trend_7d="+5.2%")
    mp2 = MarketPrice(id="mp-02", crop="Tomato", market_name="Pollachi Uzhavar Sandhai", district="Coimbatore", state="Tamil Nadu", price_per_kg=36.00, min_price=32.0, max_price=40.0, price_trend_7d="+3.8%")
    db.add_all([mp1, mp2])

    # 6. Seed Government Schemes
    gs1 = GovernmentScheme(
        id="gs-01",
        title="Pradhan Mantri Fasal Bima Yojana (PMFBY) - Crop Insurance",
        category="Crop Insurance & Financial Protection",
        description="Comprehensive yield insurance covering localized natural calamities, post-harvest losses, and disease outbreaks for horticultural crops.",
        eligibility="All farmers growing notified crops (Tomato, Chilli, Brinjal) in notified areas.",
        subsidy_percentage="Up to 90% Premium Subsidy by Govt",
        application_link="https://pmfby.gov.in"
    )
    gs2 = GovernmentScheme(
        id="gs-02",
        title="National Horticulture Mission (NHM) Drip Irrigation Subsidy",
        category="Irrigation & Infrastructure",
        description="Financial assistance for installing micro-drip irrigation systems to prevent leaf surface wetness and conserve water.",
        eligibility="Small and Marginal farmers possessing agricultural land.",
        subsidy_percentage="100% for Small/Marginal Farmers in TN, 75% for others",
        application_link="https://tnhorticulture.tn.gov.in"
    )
    db.add_all([gs1, gs2])

    db.commit()
    db.close()
    print("[SUCCESS] Seed completed successfully!")

if __name__ == "__main__":
    seed_database()
