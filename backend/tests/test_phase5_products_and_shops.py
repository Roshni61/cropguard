import pytest
from app.db.database import SyncSessionLocal, ensure_schema_migrations
from app.db.seed import init_phase5_products_and_shops
from app.db.models import AgriProduct, AgriShop, ShopInventory
from app.services.retailer_service import calculate_distance_km

@pytest.fixture(scope="module", autouse=True)
def setup_seed_data():
    ensure_schema_migrations()
    db = SyncSessionLocal()
    init_phase5_products_and_shops(db)
    db.close()

def test_haversine_distance_calculation():
    # Pollachi (10.6609, 77.0048) to Coimbatore TNAU (11.0130, 76.9350) is ~39.8 km
    dist = calculate_distance_km(10.6609, 77.0048, 11.0130, 76.9350)
    assert 35.0 <= dist <= 45.0
    
    # Distance to identical point is 0.0 km
    assert calculate_distance_km(11.0, 77.0, 11.0, 77.0) == 0.0

def test_verified_products_authoritative_metadata():
    db = SyncSessionLocal()
    try:
        products = db.query(AgriProduct).all()
        assert len(products) >= 6

        # Verify Indofil M-45
        mancozeb = db.query(AgriProduct).filter_by(id="prod-cibrc-01").first()
        assert mancozeb is not None
        assert "Mancozeb 75% WP" in mancozeb.active_ingredient
        assert "Indofil" in mancozeb.manufacturer
        assert "Tomato" in mancozeb.target_crops
        assert "Early Blight" in mancozeb.target_diseases
        assert mancozeb.pre_harvest_interval_days == 7
        assert "gloves" in mancozeb.safety_precautions.lower() or "mask" in mancozeb.safety_precautions.lower()
        assert "CIBRC" in mancozeb.verified_source
        assert mancozeb.registration_number is not None

        # Verify Tata Blitox for Cotton
        blitox = db.query(AgriProduct).filter_by(id="prod-cibrc-02").first()
        assert blitox is not None
        assert "Cotton" in blitox.target_crops
        assert "Copper Oxychloride" in blitox.active_ingredient

        # Verify Banana Sigatoka (Tilt 25 EC)
        tilt = db.query(AgriProduct).filter_by(id="prod-cibrc-03").first()
        assert tilt is not None
        assert "Banana" in tilt.target_crops
        assert "Sigatoka" in str(tilt.target_diseases)
        assert tilt.pre_harvest_interval_days == 30
    finally:
        db.close()

def test_shop_inventory_verified_and_unverified_status():
    db = SyncSessionLocal()
    try:
        # Verified item: Indofil M-45 at Sri Murugan Agro
        inv_verified = db.query(ShopInventory).filter_by(id="inv-01").first()
        assert inv_verified is not None
        assert inv_verified.price_verified is True
        assert inv_verified.price_inr == 375.0
        assert inv_verified.stock_status == "IN_STOCK"

        # Unverified item: Bayer Nativo at Sri Murugan Agro (missing live verification)
        inv_unverified = db.query(ShopInventory).filter_by(id="inv-04").first()
        assert inv_unverified is not None
        assert inv_unverified.price_verified is False
        assert inv_unverified.price_inr is None
        assert inv_unverified.stock_status == "CALL_TO_VERIFY"
        assert "Price or availability not verified" in inv_unverified.notes

        # PACCS cooperative subsidized rates
        paccs_inv = db.query(ShopInventory).filter_by(id="inv-06").first()
        assert paccs_inv is not None
        assert paccs_inv.price_inr == 180.0
        assert "subsidized" in paccs_inv.notes.lower()
    finally:
        db.close()

def test_local_shops_location_and_license():
    db = SyncSessionLocal()
    try:
        coimbatore_shops = db.query(AgriShop).filter_by(district="Coimbatore").all()
        assert len(coimbatore_shops) >= 3
        for shop in coimbatore_shops:
            assert shop.license_number is not None
            assert shop.phone is not None
            assert shop.pincode is not None
            assert shop.latitude is not None and shop.longitude is not None
    finally:
        db.close()
