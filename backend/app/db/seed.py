from app.db.database import SyncSessionLocal, sync_engine, Base
from app.db.models import (
    User, Farm, Field, Scan, TreatmentKnowledge,
    OutbreakCluster, Alert, ExpertCase, MarketPrice,
    GovernmentScheme, AgriProduct, AgriShop, ShopInventory,
    ExpertProfile, ConsultationAppointment, ConsultationMessage
)
from app.security.pwd import hash_password

def init_demo_accounts(db=None):
    """Safely initialize or update the 3 demo accounts without duplicating or affecting existing data."""
    from app.config import settings
    if not settings.DEMO_LOGIN_ENABLED:
        return

    Base.metadata.create_all(bind=sync_engine)
    should_close = False
    if db is None:
        db = SyncSessionLocal()
        should_close = True

    try:
        # 1. Farmer Demo Account (farmer@cropguard.demo / Farmer@123)
        farmer_email = "farmer@cropguard.demo"
        farmer_user = db.query(User).filter_by(email=farmer_email).first()
        if not farmer_user:
            farmer_user = User(
                id="usr-demo-farmer",
                name="Ramesh Kumar (Demo Farmer)",
                email=farmer_email,
                role="FARMER",
                preferred_language="en",
                state="Tamil Nadu",
                district="Coimbatore",
                measurement_unit="acre",
                password_hash=hash_password("Farmer@123")
            )
            db.add(farmer_user)
            db.commit()
            db.refresh(farmer_user)
        else:
            farmer_user.password_hash = hash_password("Farmer@123")
            farmer_user.role = "FARMER"
            db.commit()

        # Ensure demo farmer has Farm and Field for dashboard experience
        demo_farm = db.query(Farm).filter_by(user_id=farmer_user.id).first()
        if not demo_farm:
            demo_farm = Farm(
                id="frm-demo-01",
                user_id=farmer_user.id,
                name="Green Valley Demo Farm",
                location_lat=11.0168,
                location_lng=76.9558,
                address="Pollachi Road, Coimbatore",
                total_area=4.5
            )
            db.add(demo_farm)
            db.commit()

            demo_field1 = Field(
                id="fld-demo-01",
                farm_id="frm-demo-01",
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
            demo_field2 = Field(
                id="fld-demo-02",
                farm_id="frm-demo-01",
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
            db.add_all([demo_field1, demo_field2])
            db.commit()

        # 2. Agricultural Expert Demo Account (expert@cropguard.demo / Expert@123)
        expert_email = "expert@cropguard.demo"
        expert_user = db.query(User).filter_by(email=expert_email).first()
        if not expert_user:
            expert_user = User(
                id="usr-demo-expert",
                name="Dr. S. Lakshmi (Demo Expert)",
                email=expert_email,
                role="EXPERT",
                preferred_language="en",
                state="Tamil Nadu",
                district="Coimbatore",
                password_hash=hash_password("Expert@123")
            )
            db.add(expert_user)
            db.commit()
            db.refresh(expert_user)
        else:
            expert_user.password_hash = hash_password("Expert@123")
            expert_user.role = "EXPERT"
            db.commit()

        # 3. District Officer Demo Account (officer@cropguard.demo / Officer@123)
        officer_email = "officer@cropguard.demo"
        officer_user = db.query(User).filter_by(email=officer_email).first()
        if not officer_user:
            officer_user = User(
                id="usr-demo-officer",
                name="Officer V. Arumugam (Demo Officer)",
                email=officer_email,
                role="OFFICER",
                preferred_language="en",
                state="Tamil Nadu",
                district="Coimbatore",
                password_hash=hash_password("Officer@123")
            )
            db.add(officer_user)
            db.commit()
            db.refresh(officer_user)
        else:
            officer_user.password_hash = hash_password("Officer@123")
            officer_user.role = "OFFICER"
            db.commit()

        # Ensure demo expert has at least one pending case in queue
        demo_case = db.query(ExpertCase).first()
        if not demo_case:
            # Check or create a sample scan
            demo_scan = db.query(Scan).first()
            if not demo_scan:
                field_for_scan = db.query(Field).first()
                demo_scan = Scan(
                    id="scn-demo-01",
                    field_id=field_for_scan.id if field_for_scan else "fld-demo-01",
                    image_url="/samples/sample_early_blight.jpg",
                    disease_name="Early Blight",
                    confidence=0.76,
                    confidence_level="MEDIUM",
                    severity="Moderate",
                    quality_status="PASSED"
                )
                db.add(demo_scan)
                db.commit()

            new_case = ExpertCase(
                id="exp-case-demo-01",
                scan_id=demo_scan.id,
                farmer_name="Ramesh Kumar (Demo Farmer)",
                farmer_phone="9876543210",
                field_name="Tomato Field A (North)",
                crop="Tomato",
                ai_disease="Early Blight",
                ai_confidence=0.76,
                ai_severity="Moderate",
                status="PENDING",
                expert_notes=""
            )
            db.add(new_case)
            db.commit()

        print("[DEMO_INIT] Demo accounts verified & initialized successfully.")
    except Exception as e:
        print(f"[DEMO_INIT] Notice during initialization: {e}")
        db.rollback()
    finally:
        if should_close:
            db.close()

def seed_database():
    Base.metadata.create_all(bind=sync_engine)
    db = SyncSessionLocal()

    # Check if already seeded
    if db.query(User).filter_by(phone="9876543210").first():
        init_demo_accounts(db)
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

    init_demo_accounts(db)
    init_phase5_products_and_shops(db)

    db.commit()
    db.close()
    print("[SUCCESS] Seed completed successfully!")

def init_phase5_products_and_shops(db=None):
    """Initializes CIBRC-registered treatment products, authorized Tamil Nadu shops, and inventory."""
    Base.metadata.create_all(bind=sync_engine)
    should_close = False
    if db is None:
        db = SyncSessionLocal()
        should_close = True

    try:
        # 1. Seed Verified CIBRC Products
        if db.query(AgriProduct).count() == 0:
            products = [
                AgriProduct(
                    id="prod-cibrc-01",
                    name="Indofil M-45 (Mancozeb 75% WP)",
                    active_ingredient="Mancozeb 75% WP",
                    category="Fungicide",
                    manufacturer="Indofil Industries Ltd",
                    target_crops=["Tomato", "Potato", "Chilli", "Paddy"],
                    target_diseases=["Early Blight", "Late Blight", "Leaf Spot", "Anthracnose"],
                    approved_usage_and_label="Foliar spray @ 2.0g to 2.5g per 1 Litre of water (approx. 500g/acre in 200–250L water). Spray at first notice of leaf spot symptoms; repeat at 10-day intervals if humid conditions persist. Ensure thorough coverage of both leaf surfaces.",
                    safety_precautions="Blue Triangle (Moderately Toxic). Wear chemical-resistant gloves, face mask, and eye goggles. Do not spray against wind direction. Avoid contamination of nearby water bodies, ponds, and animal fodder.",
                    pre_harvest_interval_days=7,
                    registration_number="CIR-1205/85-Mancozeb(WP)-12",
                    verified_source="Central Insecticides Board & Registration Committee (CIBRC) & TNAU Agritech Portal",
                    last_verified_date="2026-03-01"
                ),
                AgriProduct(
                    id="prod-cibrc-02",
                    name="Tata Blitox 50 (Copper Oxychloride 50% WP)",
                    active_ingredient="Copper Oxychloride 50% WP",
                    category="Bactericide / Fungicide",
                    manufacturer="Rallis India Ltd (A Tata Enterprise)",
                    target_crops=["Tomato", "Cotton", "Chilli", "Banana"],
                    target_diseases=["Bacterial Spot", "Early Blight", "Bacterial Blight / Angular Leaf Spot", "Anthracnose"],
                    approved_usage_and_label="Foliar spray @ 2.5g to 3.0g per 1 Litre of water (approx. 500–600g/acre). For bacterial blight on cotton, tank-mix with Streptocycline @ 0.1g/L per TNAU package of practices.",
                    safety_precautions="Blue Triangle (Moderately Toxic). Use personal protective equipment (PPE). Conduct test spray on 2–3 plants before full application to verify phytotoxicity tolerance.",
                    pre_harvest_interval_days=10,
                    registration_number="CIR-3211/90-CopperOxychloride(WP)-44",
                    verified_source="CIBRC & ICAR-CICR Cotton Advisory Panel",
                    last_verified_date="2026-03-01"
                ),
                AgriProduct(
                    id="prod-cibrc-03",
                    name="Tilt 25 EC (Propiconazole 25% EC)",
                    active_ingredient="Propiconazole 25% EC",
                    category="Systemic Fungicide",
                    manufacturer="Syngenta India Ltd",
                    target_crops=["Banana", "Paddy", "Wheat"],
                    target_diseases=["Sigatoka Leaf Spot", "Rice Blast", "Sheath Blight", "Yellow Rust"],
                    approved_usage_and_label="Foliar spray @ 1.0 ml per 1 Litre of water (approx. 200 ml/acre). For Banana Sigatoka: Mix with horticultural mineral spray oil @ 10 ml/L for enhanced trans-laminar penetration.",
                    safety_precautions="Yellow Triangle (Highly Toxic). Strictly observe protective respirator mask, rubber gloves, and rubber boots. Toxic to aquatic organisms. Do not apply when bees are actively foraging.",
                    pre_harvest_interval_days=30,
                    registration_number="CIR-1890/2001-Propiconazole(EC)-89",
                    verified_source="CIBRC & ICAR National Research Centre for Banana (NRCB)",
                    last_verified_date="2026-03-01"
                ),
                AgriProduct(
                    id="prod-cibrc-04",
                    name="Multiplex Bio-Neem (Azadirachtin 1500 ppm)",
                    active_ingredient="Azadirachtin 1500 ppm (0.15% EC)",
                    category="Botanical Bio-Control",
                    manufacturer="Multiplex Biotech International",
                    target_crops=["Tomato", "Cotton", "Paddy", "Chilli", "Banana", "Potato"],
                    target_diseases=["Foliar Blight Suppression", "Whitefly Vector", "Aphids", "Thrips", "Early Mildew"],
                    approved_usage_and_label="Foliar spray @ 3.0 ml to 5.0 ml per 1 Litre of water (approx. 1 Litre/acre in 200L water). Apply in cool morning (6:30–9:00 AM) or late afternoon. Re-apply every 7–10 days as preventive organic barrier.",
                    safety_precautions="Green Triangle (Practically Non-Toxic). Safe to beneficial honeybees, predators, and earthworms when used per directions. Wear basic face mask during application.",
                    pre_harvest_interval_days=3,
                    registration_number="CIR-8990/2005-Azadirachtin(EC)-31",
                    verified_source="CIBRC Approved Botanical & TNAU Organic Agriculture Directorate",
                    last_verified_date="2026-03-01"
                ),
                AgriProduct(
                    id="prod-cibrc-05",
                    name="TNAU Trichoderma Viride (1.5% WP)",
                    active_ingredient="Trichoderma viride 1.5% WP (2x10^8 CFU/g)",
                    category="Biological Antagonist",
                    manufacturer="TNAU Bio-Control Laboratory, Coimbatore",
                    target_crops=["Tomato", "Banana", "Paddy", "Cotton", "Chilli", "Potato"],
                    target_diseases=["Fusarium Wilt / Panama Wilt", "Damping-off", "Root Rot", "Foliar Blights"],
                    approved_usage_and_label="Soil application @ 2.5 kg/acre mixed with 250 kg well-rotted FYM. Foliar spray @ 5.0g per 1 Litre water against airborne fungal spores. Do not mix with synthetic chemical copper or sulfur fungicides.",
                    safety_precautions="Green Label (Zero Synthetic Chemical Toxicity). Zero chemical residues. Organic certified by TNOCD (Tamil Nadu Organic Certification Department).",
                    pre_harvest_interval_days=0,
                    registration_number="CIBRC/BIO/TV-2003-49",
                    verified_source="TNAU Department of Plant Pathology & Bio-Fertilizers",
                    last_verified_date="2026-03-01"
                ),
                AgriProduct(
                    id="prod-cibrc-06",
                    name="Bayer Nativo 75 WG (Tebuconazole + Trifloxystrobin)",
                    active_ingredient="Tebuconazole 50% + Trifloxystrobin 25% WG",
                    category="Broad-Spectrum Systemic Fungicide",
                    manufacturer="Bayer CropScience Ltd",
                    target_crops=["Paddy", "Tomato", "Chilli"],
                    target_diseases=["Rice Blast (Pyricularia oryzae)", "Sheath Blight", "Early Blight", "Anthracnose"],
                    approved_usage_and_label="Foliar spray @ 0.4g per 1 Litre water (approx. 80g to 100g/acre in 200L water). Apply at initial panicle initiation or disease appearance.",
                    safety_precautions="Blue Triangle (Moderately Toxic). Wear protective clothing, goggles, and mask. Avoid inhalation of spray mist. Do not allow livestock to graze treated fields.",
                    pre_harvest_interval_days=21,
                    registration_number="CIR-24110/2008-Tebuconazole+Trifloxystrobin(WG)-52",
                    verified_source="CIBRC & ICAR Indian Institute of Rice Research (IIRR)",
                    last_verified_date="2026-03-01"
                ),
                AgriProduct(
                    id="prod-cibrc-07",
                    name="Streptocycline 90:10 (Streptomycin + Tetracycline)",
                    active_ingredient="Streptomycin sulphate 90% + Tetracycline hydrochloride 10% SP",
                    category="Agricultural Antibiotic / Bactericide",
                    manufacturer="Hindustan Antibiotics Ltd",
                    target_crops=["Cotton", "Tomato", "Paddy"],
                    target_diseases=["Bacterial Blight / Angular Leaf Spot", "Bacterial Leaf Blight (BLB)", "Bacterial Canker"],
                    approved_usage_and_label="Foliar spray @ 0.1g to 0.15g per 1 Litre of water (approx. 20g packet in 200 Litres water). Usually tank-mixed with Copper Oxychloride 50% WP @ 2.5g/L for broad-spectrum anti-bacterial knockdown.",
                    safety_precautions="Blue Triangle. Highly specific antibiotic formulation. Use only upon confirmed bacterial diagnosis; never use prophylactically without bacterial symptoms.",
                    pre_harvest_interval_days=15,
                    registration_number="CIR-5401/87-Streptomycin+Tetracycline-09",
                    verified_source="CIBRC & TNAU Department of Plant Pathology",
                    last_verified_date="2026-03-01"
                )
            ]
            db.add_all(products)
            db.commit()

        # 2. Seed Authorized Tamil Nadu Input Shops & Cooperatives
        if db.query(AgriShop).count() == 0:
            shops = [
                AgriShop(
                    id="shop-cbe-01",
                    name="Sri Murugan Agro Inputs & Fertilizers",
                    type="LICENSED_RETAILER",
                    license_number="TN/CBE/RET-4829/2024",
                    district="Coimbatore",
                    taluk_or_town="Pollachi",
                    pincode="642001",
                    address="Shop No. 14, Opposite New Bus Stand, Pollachi, Coimbatore - 642001",
                    latitude=10.6609,
                    longitude=77.0048,
                    phone="+91 4259 224455",
                    whatsapp="+91 94432 11223",
                    operating_hours="Mon-Sat: 8:00 AM - 8:00 PM",
                    verified_status="VERIFIED_DEALER",
                    last_verified_date="2026-03-01"
                ),
                AgriShop(
                    id="shop-cbe-02",
                    name="Pollachi Primary Agricultural Co-op Society (PACCS)",
                    type="COOPERATIVE_SOCIETY",
                    license_number="PACCS/CBE-012",
                    district="Coimbatore",
                    taluk_or_town="Pollachi",
                    pincode="642001",
                    address="Cooperative Bank Complex, Market Road, Pollachi, Coimbatore - 642001",
                    latitude=10.6620,
                    longitude=77.0060,
                    phone="+91 4259 223388",
                    whatsapp="+91 94880 33445",
                    operating_hours="Mon-Fri: 9:00 AM - 5:30 PM, Sat: 9:00 AM - 1:00 PM",
                    verified_status="AUTHORIZED_COOPERATIVE",
                    last_verified_date="2026-03-01"
                ),
                AgriShop(
                    id="shop-cbe-03",
                    name="TNAU Agri-Clinic & Seed Sales Counter",
                    type="GOVT_AGRI_DEPOT",
                    license_number="GOVT/TNAU/SALES-01",
                    district="Coimbatore",
                    taluk_or_town="Coimbatore West",
                    pincode="641003",
                    address="Marudhamalai Road, TNAU Campus, Coimbatore - 641003",
                    latitude=11.0130,
                    longitude=76.9350,
                    phone="+91 422 6611200",
                    whatsapp="+91 94422 55667",
                    operating_hours="Mon-Fri: 9:30 AM - 5:00 PM",
                    verified_status="GOVT_INSTITUTION",
                    last_verified_date="2026-03-01"
                ),
                AgriShop(
                    id="shop-cbe-04",
                    name="Kovai Kisan Seva Kendra & Seed Store",
                    type="LICENSED_RETAILER",
                    license_number="TN/CBE/RET-5102/2024",
                    district="Coimbatore",
                    taluk_or_town="Thondamuthur",
                    pincode="641109",
                    address="45 Siruvani Main Road, Thondamuthur, Coimbatore - 641109",
                    latitude=10.9980,
                    longitude=76.8520,
                    phone="+91 422 2614120",
                    whatsapp="+91 98422 77889",
                    operating_hours="Mon-Sat: 7:30 AM - 7:30 PM",
                    verified_status="VERIFIED_DEALER",
                    last_verified_date="2026-03-01"
                ),
                AgriShop(
                    id="shop-thanj-01",
                    name="Aduthurai Delta Agro Chemicals & Seeds",
                    type="LICENSED_RETAILER",
                    license_number="TN/TNJ/RET-3210/2023",
                    district="Thanjavur",
                    taluk_or_town="Aduthurai",
                    pincode="612101",
                    address="TRRI Main Road, Aduthurai, Thanjavur - 612101",
                    latitude=11.0040,
                    longitude=79.4890,
                    phone="+91 435 2472900",
                    whatsapp="+91 94431 88990",
                    operating_hours="Mon-Sat: 8:00 AM - 8:00 PM",
                    verified_status="VERIFIED_DEALER",
                    last_verified_date="2026-03-01"
                ),
                AgriShop(
                    id="shop-thanj-02",
                    name="Kumbakonam PACCS Agricultural Input Store",
                    type="COOPERATIVE_SOCIETY",
                    license_number="PACCS/TNJ-084",
                    district="Thanjavur",
                    taluk_or_town="Kumbakonam",
                    pincode="612001",
                    address="Railway Station Road, Kumbakonam, Thanjavur - 612001",
                    latitude=10.9602,
                    longitude=79.3845,
                    phone="+91 435 2420111",
                    whatsapp="+91 94862 11334",
                    operating_hours="Mon-Sat: 9:00 AM - 6:00 PM",
                    verified_status="AUTHORIZED_COOPERATIVE",
                    last_verified_date="2026-03-01"
                ),
                AgriShop(
                    id="shop-mdu-01",
                    name="Meenakshi Agro Agencies & Fertilizers",
                    type="LICENSED_RETAILER",
                    license_number="TN/MDU/RET-7891/2024",
                    district="Madurai",
                    taluk_or_town="Melur",
                    pincode="625106",
                    address="Tiruchirappalli Road, Melur, Madurai - 625106",
                    latitude=10.0330,
                    longitude=78.3340,
                    phone="+91 452 2531234",
                    whatsapp="+91 98421 44556",
                    operating_hours="Mon-Sat: 8:00 AM - 8:00 PM",
                    verified_status="VERIFIED_DEALER",
                    last_verified_date="2026-03-01"
                ),
                AgriShop(
                    id="shop-slm-01",
                    name="Salem Farmers Service Co-operative Society",
                    type="COOPERATIVE_SOCIETY",
                    license_number="TN/SLM/COOP-112",
                    district="Salem",
                    taluk_or_town="Salem",
                    pincode="636002",
                    address="Shevapet Bazaar Street, Salem - 636002",
                    latitude=11.6643,
                    longitude=78.1460,
                    phone="+91 427 2212345",
                    whatsapp="+91 94433 77889",
                    operating_hours="Mon-Sat: 9:00 AM - 6:30 PM",
                    verified_status="AUTHORIZED_COOPERATIVE",
                    last_verified_date="2026-03-01"
                )
            ]
            db.add_all(shops)
            db.commit()

        # 3. Seed Inventory Mapping (Including Verified and Unverified items)
        if db.query(ShopInventory).count() == 0:
            inventories = [
                # Pollachi Shop 1 (Verified items + 1 Unverified item)
                ShopInventory(
                    id="inv-01",
                    shop_id="shop-cbe-01",
                    product_id="prod-cibrc-01",
                    package_size="500g",
                    price_inr=375.0,
                    price_verified=True,
                    stock_status="IN_STOCK",
                    stock_verified=True,
                    last_verified_date="2026-03-01",
                    notes="Batch #IND-2026-B. Sealed manufacturer foil pack."
                ),
                ShopInventory(
                    id="inv-02",
                    shop_id="shop-cbe-01",
                    product_id="prod-cibrc-02",
                    package_size="500g",
                    price_inr=410.0,
                    price_verified=True,
                    stock_status="IN_STOCK",
                    stock_verified=True,
                    last_verified_date="2026-03-01",
                    notes="Tata Rallis original tamper-proof pack."
                ),
                ShopInventory(
                    id="inv-03",
                    shop_id="shop-cbe-01",
                    product_id="prod-cibrc-04",
                    package_size="1L",
                    price_inr=460.0,
                    price_verified=True,
                    stock_status="IN_STOCK",
                    stock_verified=True,
                    last_verified_date="2026-03-01",
                    notes="Organic bio-agent Azadirachtin 1500 ppm."
                ),
                ShopInventory(
                    id="inv-04",
                    shop_id="shop-cbe-01",
                    product_id="prod-cibrc-06",
                    package_size="100g",
                    price_inr=None,
                    price_verified=False,
                    stock_status="CALL_TO_VERIFY",
                    stock_verified=False,
                    last_verified_date="2026-02-10",
                    notes="Price or availability not verified — Call dealer to confirm counter availability."
                ),

                # Pollachi PACCS (Cooperative Subsidized Rates)
                ShopInventory(
                    id="inv-05",
                    shop_id="shop-cbe-02",
                    product_id="prod-cibrc-01",
                    package_size="1kg",
                    price_inr=680.0,
                    price_verified=True,
                    stock_status="IN_STOCK",
                    stock_verified=True,
                    last_verified_date="2026-03-01",
                    notes="PACCS subsidized rate for registered farmers with Kisan Credit Card (KCC)."
                ),
                ShopInventory(
                    id="inv-06",
                    shop_id="shop-cbe-02",
                    product_id="prod-cibrc-05",
                    package_size="1kg",
                    price_inr=180.0,
                    price_verified=True,
                    stock_status="IN_STOCK",
                    stock_verified=True,
                    last_verified_date="2026-03-01",
                    notes="Government subsidized bio-control depot stock."
                ),

                # TNAU Campus Sales Counter
                ShopInventory(
                    id="inv-07",
                    shop_id="shop-cbe-03",
                    product_id="prod-cibrc-05",
                    package_size="1kg",
                    price_inr=175.0,
                    price_verified=True,
                    stock_status="IN_STOCK",
                    stock_verified=True,
                    last_verified_date="2026-03-01",
                    notes="Freshly cultured TNAU Bio-Control Laboratory batch."
                ),

                # Thondamuthur Shop
                ShopInventory(
                    id="inv-08",
                    shop_id="shop-cbe-04",
                    product_id="prod-cibrc-07",
                    package_size="20g",
                    price_inr=85.0,
                    price_verified=True,
                    stock_status="IN_STOCK",
                    stock_verified=True,
                    last_verified_date="2026-03-01",
                    notes="Streptocycline 90:10 original pouch."
                ),
                ShopInventory(
                    id="inv-09",
                    shop_id="shop-cbe-04",
                    product_id="prod-cibrc-03",
                    package_size="250ml",
                    price_inr=None,
                    price_verified=False,
                    stock_status="CALL_TO_VERIFY",
                    stock_verified=False,
                    last_verified_date="2026-02-15",
                    notes="Price or availability not verified — Call dealer to verify current stock."
                ),

                # Thanjavur Aduthurai Shop
                ShopInventory(
                    id="inv-10",
                    shop_id="shop-thanj-01",
                    product_id="prod-cibrc-06",
                    package_size="100g",
                    price_inr=820.0,
                    price_verified=True,
                    stock_status="IN_STOCK",
                    stock_verified=True,
                    last_verified_date="2026-03-01",
                    notes="Bayer CropScience original formulation."
                ),
                ShopInventory(
                    id="inv-11",
                    shop_id="shop-thanj-01",
                    product_id="prod-cibrc-05",
                    package_size="1kg",
                    price_inr=190.0,
                    price_verified=True,
                    stock_status="IN_STOCK",
                    stock_verified=True,
                    last_verified_date="2026-03-01",
                    notes="Trichoderma viride organic bio-agent."
                ),

                # Thanjavur Kumbakonam PACCS
                ShopInventory(
                    id="inv-12",
                    shop_id="shop-thanj-02",
                    product_id="prod-cibrc-01",
                    package_size="500g",
                    price_inr=360.0,
                    price_verified=True,
                    stock_status="IN_STOCK",
                    stock_verified=True,
                    last_verified_date="2026-03-01",
                    notes="Cooperative society subsidized price."
                ),

                # Madurai Melur Shop
                ShopInventory(
                    id="inv-13",
                    shop_id="shop-mdu-01",
                    product_id="prod-cibrc-02",
                    package_size="500g",
                    price_inr=405.0,
                    price_verified=True,
                    stock_status="IN_STOCK",
                    stock_verified=True,
                    last_verified_date="2026-03-01",
                    notes="Copper Oxychloride 50% WP."
                ),

                # Salem Shop
                ShopInventory(
                    id="inv-14",
                    shop_id="shop-slm-01",
                    product_id="prod-cibrc-04",
                    package_size="500ml",
                    price_inr=250.0,
                    price_verified=True,
                    stock_status="IN_STOCK",
                    stock_verified=True,
                    last_verified_date="2026-03-01",
                    notes="Neem oil organic botanical formulation."
                )
            ]
            db.add_all(inventories)
            db.commit()

    except Exception as e:
        print(f"[SEED] Phase 5 products/shops seed notice: {e}")
        if db:
            db.rollback()
    finally:
        if should_close and db:
            db.close()


def init_phase6_experts_and_consultations(db=None):
    """Seed verified agricultural experts and demo consultations for Phase 6."""
    Base.metadata.create_all(bind=sync_engine)
    should_close = False
    if db is None:
        db = SyncSessionLocal()
        should_close = True

    try:
        # Check if expert profiles already exist
        if db.query(ExpertProfile).count() == 0:
            experts = [
                ExpertProfile(
                    id="exp-01",
                    user_id="usr-demo-expert",
                    name="Dr. S. Lakshmi",
                    designation="Senior Plant Pathologist & Extension Agronomist",
                    institution="Tamil Nadu Agricultural University (TNAU), Coimbatore",
                    qualifications="Ph.D. Plant Pathology (TNAU), B.Sc. Agriculture (Honours)",
                    specializations=[
                        "Solanaceous Vegetables (Tomato, Chilli, Brinjal)",
                        "Foliar Fungal Blights & Cankers",
                        "Biological Control & Trichoderma Formulations"
                    ],
                    languages=["Tamil", "English"],
                    experience_years=14,
                    verification_status="VERIFIED",
                    avatar_url="https://images.unsplash.com/photo-1594824813571-638f0263613b?auto=format&fit=crop&w=300&q=80",
                    rating=4.9,
                    consultation_count=138,
                    available_days=["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                    available_hours="09:30 AM - 05:00 PM",
                    available_slots=[
                        "Today 02:30 PM - 03:00 PM",
                        "Today 04:00 PM - 04:30 PM",
                        "Tomorrow 10:30 AM - 11:00 AM",
                        "Tomorrow 03:00 PM - 03:30 PM"
                    ]
                ),
                ExpertProfile(
                    id="exp-02",
                    user_id=None,
                    name="Dr. K. Murugan",
                    designation="Chief Agricultural Entomologist",
                    institution="Agricultural College & Research Institute, Madurai",
                    qualifications="Ph.D. Entomology (IARI New Delhi), M.Sc. Agri (TNAU)",
                    specializations=[
                        "Paddy / Rice Stem Borer & Leaf Folder",
                        "Cotton Bollworm & Sucking Pest Complex",
                        "Integrated Pest Management (IPM)"
                    ],
                    languages=["Tamil", "English", "Hindi"],
                    experience_years=11,
                    verification_status="VERIFIED",
                    avatar_url="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80",
                    rating=4.8,
                    consultation_count=96,
                    available_days=["Monday", "Wednesday", "Thursday", "Friday", "Saturday"],
                    available_hours="10:00 AM - 05:30 PM",
                    available_slots=[
                        "Today 03:30 PM - 04:00 PM",
                        "Tomorrow 11:30 AM - 12:00 PM",
                        "Tomorrow 02:00 PM - 02:30 PM"
                    ]
                ),
                ExpertProfile(
                    id="exp-03",
                    user_id=None,
                    name="Dr. P. Ramanathan",
                    designation="Horticultural Pathologist & Banana Specialist",
                    institution="ICAR - National Research Centre for Banana (NRCB), Tiruchirappalli",
                    qualifications="Ph.D. Horticultural Pathology (TNAU), Post-Doctoral Fellow (IARI)",
                    specializations=[
                        "Banana Sigatoka & Fusarium Wilt (TR4)",
                        "Papaya Ringspot & Viral Foliar Diseases",
                        "Drip Fertigation & Soil Micro-biome Health"
                    ],
                    languages=["Tamil", "English"],
                    experience_years=16,
                    verification_status="VERIFIED",
                    avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
                    rating=4.9,
                    consultation_count=154,
                    available_days=["Tuesday", "Wednesday", "Thursday", "Friday"],
                    available_hours="09:00 AM - 04:30 PM",
                    available_slots=[
                        "Today 05:00 PM - 05:30 PM",
                        "Tomorrow 09:30 AM - 10:00 AM",
                        "Tomorrow 04:00 PM - 04:30 PM"
                    ]
                ),
                ExpertProfile(
                    id="exp-04",
                    user_id="usr-demo-officer",
                    name="Thiru. R. Selvakumar",
                    designation="District Agricultural Extension Officer",
                    institution="Krishi Vigyan Kendra (KVK), Aduthurai, Thanjavur",
                    qualifications="M.Sc. Agronomy (Annamalai University), B.Sc. Agriculture",
                    specializations=[
                        "Paddy Blast & Bacterial Leaf Blight",
                        "Certified Seed Treatments & Nursery Care",
                        "State Agrochemical Subsidy Directives"
                    ],
                    languages=["Tamil", "English"],
                    experience_years=9,
                    verification_status="VERIFIED",
                    avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
                    rating=4.7,
                    consultation_count=82,
                    available_days=["Monday", "Tuesday", "Wednesday", "Friday"],
                    available_hours="08:30 AM - 04:00 PM",
                    available_slots=[
                        "Today 04:30 PM - 05:00 PM",
                        "Tomorrow 10:00 AM - 10:30 AM"
                    ]
                )
            ]
            db.add_all(experts)
            db.commit()

        # Check if demo consultation exists
        if db.query(ConsultationAppointment).count() == 0:
            demo_consultation = ConsultationAppointment(
                id="cns-demo-01",
                farmer_id="usr-demo-farmer",
                farmer_name="Ramesh Kumar (Demo Farmer)",
                farmer_phone="+91 94431 82740",
                farmer_district="Coimbatore",
                expert_id="exp-01",
                expert_name="Dr. S. Lakshmi",
                scan_id="scn-demo-01",
                case_id=None,
                consultation_type="VIDEO",
                problem_description="Concentric brown lesions observed on lower leaves of tomato plants (Arka Rakshak). Yellow halos spreading after consecutive evening rains in Pollachi.",
                crop="Tomato",
                shared_image_url="/samples/sample_early_blight.jpg",
                farmer_consent=True,
                scheduled_time="Today 02:30 PM - 03:00 PM",
                status="CONFIRMED",
                room_id="room-cropguard-demo-01",
                expert_assessment="Early Blight (Alternaria solani) confirmed visually. Lower canopy infection favored by 78% relative humidity and recent rainfall.",
                expert_treatment_recommendation="Immediate lower canopy leaf pruning (bagged and removed). Once weather clears, apply Mancozeb 75% WP (Indofil M-45) @ 2.0g/L or bio-agent Trichoderma viride @ 5g/L. Strictly observe 7-day PHI.",
                additional_images_requested=False,
                outcome="PRESCRIPTION_ISSUED"
            )
            db.add(demo_consultation)
            db.commit()

            # Seed initial messages for consultation
            messages = [
                ConsultationMessage(
                    id="msg-cns-01",
                    consultation_id="cns-demo-01",
                    sender_id=None,
                    sender_name="CropGuard System",
                    sender_role="SYSTEM",
                    message="Consultation confirmed with Dr. S. Lakshmi (TNAU Senior Plant Pathologist). WebRTC Video Room is ready.",
                    message_type="SYSTEM"
                ),
                ConsultationMessage(
                    id="msg-cns-02",
                    consultation_id="cns-demo-01",
                    sender_id="usr-demo-farmer",
                    sender_name="Ramesh Kumar",
                    sender_role="FARMER",
                    message="Vanakkam Doctor. Concentric dark rings started appearing on my tomato bottom leaves after 3 days of rain. I shared my leaf scan and field location with consent.",
                    image_url="/samples/sample_early_blight.jpg",
                    message_type="IMAGE"
                ),
                ConsultationMessage(
                    id="msg-cns-03",
                    consultation_id="cns-demo-01",
                    sender_id="usr-demo-expert",
                    sender_name="Dr. S. Lakshmi",
                    sender_role="EXPERT",
                    message="Vanakkam Ramesh. I inspected your leaf image. The 'target board' concentric rings clearly show Early Blight (Alternaria solani). Do not apply overhead sprinkler water. Please join our video session to inspect whole-field canopy aeration.",
                    message_type="TEXT"
                )
            ]
            db.add_all(messages)
            db.commit()

    except Exception as e:
        print(f"[SEED] Phase 6 experts/consultations seed notice: {e}")
        if db:
            db.rollback()
    finally:
        if should_close and db:
            db.close()

if __name__ == "__main__":
    seed_database()
