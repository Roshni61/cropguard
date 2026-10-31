import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.database import Base, sync_engine, SyncSessionLocal
from app.db.models import User
from app.db.seed import init_demo_accounts
from app.config import settings

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=sync_engine)
    init_demo_accounts()

@pytest.mark.anyio
async def test_demo_accounts_exist_with_correct_roles():
    db = SyncSessionLocal()
    farmer = db.query(User).filter_by(email="farmer@cropguard.demo").first()
    expert = db.query(User).filter_by(email="expert@cropguard.demo").first()
    officer = db.query(User).filter_by(email="officer@cropguard.demo").first()
    db.close()

    assert farmer is not None
    assert farmer.role == "FARMER"
    assert expert is not None
    assert expert.role == "EXPERT"
    assert officer is not None
    assert officer.role == "OFFICER"

@pytest.mark.anyio
async def test_demo_farmer_login():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post("/api/v1/auth/login", json={
            "email": "farmer@cropguard.demo",
            "password": "Farmer@123"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["email"] == "farmer@cropguard.demo"
        assert data["user"]["role"] == "FARMER"

@pytest.mark.anyio
async def test_demo_expert_login():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post("/api/v1/auth/login", json={
            "email": "expert@cropguard.demo",
            "password": "Expert@123"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["email"] == "expert@cropguard.demo"
        assert data["user"]["role"] == "EXPERT"

@pytest.mark.anyio
async def test_demo_officer_login():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post("/api/v1/auth/login", json={
            "email": "officer@cropguard.demo",
            "password": "Officer@123"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["email"] == "officer@cropguard.demo"
        assert data["user"]["role"] == "OFFICER"

@pytest.mark.anyio
async def test_demo_login_with_wrong_password_fails():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post("/api/v1/auth/login", json={
            "email": "farmer@cropguard.demo",
            "password": "WrongPassword123!"
        })
        assert resp.status_code == 401
        assert "Incorrect email, phone or password." in resp.json()["detail"]

@pytest.mark.anyio
async def test_demo_config_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get("/api/v1/auth/demo-config")
        assert resp.status_code == 200
        data = resp.json()
        assert "demo_enabled" in data
        if data["demo_enabled"]:
            roles = [acc["role"] for acc in data["accounts"]]
            assert "FARMER" in roles
            assert "EXPERT" in roles
            assert "OFFICER" in roles
