import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.api.auth import create_access_token
from app.db.database import get_db, Base, sync_engine, SyncSessionLocal
from app.db.models import User, Farm, Field, Scan
from app.security.pwd import hash_password
from jose import jwt
from app.config import settings

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=sync_engine)

@pytest.mark.anyio
async def test_email_registration_and_login():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        email = f"test_{int(pytest.__version__.replace('.', '')[:3])}_farmer@cropguard.agri"
        
        # 1. Register with email + password
        reg_resp = await ac.post("/api/v1/auth/register", json={
            "name": "Test Email Farmer",
            "email": email,
            "password": "StrongPassword123!",
            "role": "FARMER"
        })
        assert reg_resp.status_code in [200, 400] # 200 or already registered in test run
        
        # 2. Login with correct email and password
        login_resp = await ac.post("/api/v1/auth/login", json={
            "email": email,
            "password": "StrongPassword123!"
        })
        assert login_resp.status_code == 200
        token_data = login_resp.json()
        assert "access_token" in token_data
        assert token_data["user"]["email"] == email

@pytest.mark.anyio
async def test_wrong_credentials_returns_generic_error():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Must return generic message that does not reveal if email exists
        resp = await ac.post("/api/v1/auth/login", json={
            "email": "nonexistent_email_12345@cropguard.agri",
            "password": "WrongPassword999!"
        })
        assert resp.status_code == 401
        assert "Incorrect email, phone or password." in resp.json()["detail"]

@pytest.mark.anyio
async def test_duplicate_registration_returns_generic_error():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        email = "duplicate_test@cropguard.agri"
        # First registration
        await ac.post("/api/v1/auth/register", json={
            "name": "Original User",
            "email": email,
            "password": "Password123!",
            "role": "FARMER"
        })
        
        # Second registration with same email
        resp2 = await ac.post("/api/v1/auth/register", json={
            "name": "Imposter User",
            "email": email,
            "password": "Password123!",
            "role": "FARMER"
        })
        assert resp2.status_code == 400
        # Generic message: does not reveal raw DB schema or exact account state
        assert "Unable to complete registration" in resp2.json()["detail"]

@pytest.mark.anyio
async def test_password_reset_generic_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post("/api/v1/auth/reset-password", json={
            "email": "anyone@cropguard.agri"
        })
        assert resp.status_code == 200
        assert resp.json()["success"] == True
        assert "password reset instructions have been dispatched" in resp.json()["message"]

@pytest.mark.anyio
async def test_cross_user_access_returns_404_leak_proof():
    """
    WORKED EXAMPLE REQUIREMENT:
    GET /scans/{id} with User B's token on User A's scan returns 404 and leaks no data.
    """
    # 1. Create User A and User B in database
    db = SyncSessionLocal()
    user_a = User(
        id="usr-test-a",
        name="User A",
        email="usera@test.com",
        phone="9000000001",
        password_hash=hash_password("PassA123!")
    )
    user_b = User(
        id="usr-test-b",
        name="User B",
        email="userb@test.com",
        phone="9000000002",
        password_hash=hash_password("PassB123!")
    )
    farm_a = Farm(
        id="farm-test-a",
        user_id="usr-test-a",
        name="Farm of User A"
    )
    field_a = Field(
        id="field-test-a",
        farm_id="farm-test-a",
        name="Field A"
    )
    scan_a = Scan(
        id="scan-test-a",
        field_id="field-test-a",
        image_url="data:image/jpeg;base64,...",
        disease_name="Early Blight",
        confidence=0.95
    )
    db.merge(user_a)
    db.merge(user_b)
    db.merge(farm_a)
    db.merge(field_a)
    db.merge(scan_a)
    db.commit()
    db.close()

    # Create tokens for User A and User B
    token_a = create_access_token({"sub": "usr-test-a", "role": "FARMER"})
    token_b = create_access_token({"sub": "usr-test-b", "role": "FARMER"})

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # User A accessing their own scan -> 200 OK
        resp_a = await ac.get("/api/v1/scans/scan-test-a", headers={"Authorization": f"Bearer {token_a}"})
        assert resp_a.status_code == 200
        assert resp_a.json()["data"]["disease_name"] == "Early Blight"

        # User B accessing User A's scan -> MUST RETURN 404 NOT FOUND (WORKED EXAMPLE)
        resp_b = await ac.get("/api/v1/scans/scan-test-a", headers={"Authorization": f"Bearer {token_b}"})
        assert resp_b.status_code == 404
        assert "Scan record not found" in resp_b.json()["detail"]

        # User B requesting User A's farm -> MUST RETURN 404 NOT FOUND
        resp_farm_b = await ac.get("/api/v1/farms/user/usr-test-a", headers={"Authorization": f"Bearer {token_b}"})
        assert resp_farm_b.status_code == 404

        # Request without any token -> MUST RETURN 401 UNAUTHORIZED
        resp_unauth = await ac.get("/api/v1/scans/scan-test-a")
        assert resp_unauth.status_code == 401

@pytest.mark.anyio
async def test_supabase_token_auto_linking():
    """Test backend verification of Supabase JWT and auto-creation/linking of SQLite user."""
    # Create simulated Supabase JWT
    supabase_uuid = "supabase-uuid-999"
    email = "oauth_farmer@gmail.com"
    supabase_token = jwt.encode(
        {
            "sub": supabase_uuid,
            "email": email,
            "aud": "authenticated",
            "role": "authenticated",
            "exp": 9999999999,
            "user_metadata": {"full_name": "OAuth Google Farmer"}
        },
        settings.SECRET_KEY, # In dev unverified claims or SECRET_KEY matches
        algorithm="HS256"
    )

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post("/api/v1/auth/supabase-sync", headers={"Authorization": f"Bearer {supabase_token}"})
        assert resp.status_code == 200
        user_data = resp.json()["user"]
        assert user_data["supabase_user_id"] == supabase_uuid
        assert user_data["email"] == email
        assert user_data["name"] == "OAuth Google Farmer"
