import os
import sqlite3
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.config import settings

# Async Engine for FastAPI routes
async_engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(async_engine, expire_on_commit=False, class_=AsyncSession)

# Sync Engine for Seeding and background tasks
sync_engine = create_engine(settings.SYNC_DATABASE_URL, connect_args={"check_same_thread": False})
SyncSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

Base = declarative_base()

def ensure_schema_migrations():
    """Ensure supabase_user_id column exists, phone is nullable, and new phase columns exist."""
    try:
        raw_db = settings.SYNC_DATABASE_URL.replace("sqlite:///", "").replace("sqlite+aiosqlite:///", "")
        targets = set(filter(os.path.exists, [raw_db, os.path.join("backend", raw_db), "cropguard.db", "backend/cropguard.db"]))
        for db_file in targets:
            conn = sqlite3.connect(db_file)
            cur = conn.cursor()
            cur.execute("PRAGMA table_info(users)")
            cols = {r[1]: r for r in cur.fetchall()}
            if cols:
                if "supabase_user_id" not in cols:
                    cur.execute("ALTER TABLE users ADD COLUMN supabase_user_id VARCHAR")
                    cur.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_supabase_user_id ON users (supabase_user_id)")
                    conn.commit()
                if "phone" in cols and cols["phone"][3] == 1:
                    cur.execute("PRAGMA foreign_keys=OFF")
                    cur.execute("""
                    CREATE TABLE IF NOT EXISTS users_temp (
                        id VARCHAR PRIMARY KEY,
                        name VARCHAR NOT NULL,
                        phone VARCHAR UNIQUE,
                        email VARCHAR UNIQUE,
                        supabase_user_id VARCHAR UNIQUE,
                        role VARCHAR DEFAULT 'FARMER',
                        preferred_language VARCHAR DEFAULT 'en',
                        state VARCHAR DEFAULT 'Tamil Nadu',
                        district VARCHAR DEFAULT 'Coimbatore',
                        measurement_unit VARCHAR DEFAULT 'acre',
                        password_hash VARCHAR,
                        created_at DATETIME
                    )
                    """)
                    cur.execute("INSERT OR IGNORE INTO users_temp SELECT id, name, phone, email, supabase_user_id, role, preferred_language, state, district, measurement_unit, password_hash, created_at FROM users")
                    cur.execute("DROP TABLE users")
                    cur.execute("ALTER TABLE users_temp RENAME TO users")
                    cur.execute("CREATE INDEX IF NOT EXISTS ix_users_phone ON users (phone)")
                    cur.execute("CREATE INDEX IF NOT EXISTS ix_users_email ON users (email)")
                    cur.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_supabase_user_id ON users (supabase_user_id)")
                    cur.execute("PRAGMA foreign_keys=ON")
                    conn.commit()

            # Ensure scans table has crop, district, growth_stage, symptom_regions
            cur.execute("PRAGMA table_info(scans)")
            scan_cols = {r[1]: r for r in cur.fetchall()}
            if scan_cols:
                if "crop" not in scan_cols:
                    cur.execute("ALTER TABLE scans ADD COLUMN crop VARCHAR DEFAULT 'Tomato'")
                if "district" not in scan_cols:
                    cur.execute("ALTER TABLE scans ADD COLUMN district VARCHAR DEFAULT 'Coimbatore'")
                if "growth_stage" not in scan_cols:
                    cur.execute("ALTER TABLE scans ADD COLUMN growth_stage VARCHAR DEFAULT 'Vegetative'")
                if "symptom_regions" not in scan_cols:
                    cur.execute("ALTER TABLE scans ADD COLUMN symptom_regions JSON DEFAULT '[]'")
                conn.commit()

            # Ensure expert_cases table has farmer_notes, farmer_consent
            cur.execute("PRAGMA table_info(expert_cases)")
            exp_cols = {r[1]: r for r in cur.fetchall()}
            if exp_cols:
                if "farmer_notes" not in exp_cols:
                    cur.execute("ALTER TABLE expert_cases ADD COLUMN farmer_notes TEXT")
                if "farmer_consent" not in exp_cols:
                    cur.execute("ALTER TABLE expert_cases ADD COLUMN farmer_consent BOOLEAN DEFAULT 1")
                conn.commit()

            # Phase 5: Ensure agri_products table exists
            cur.execute("""
                CREATE TABLE IF NOT EXISTS agri_products (
                    id VARCHAR PRIMARY KEY,
                    name VARCHAR NOT NULL,
                    active_ingredient VARCHAR NOT NULL,
                    category VARCHAR NOT NULL DEFAULT 'Fungicide',
                    manufacturer VARCHAR NOT NULL,
                    target_crops JSON DEFAULT '[]',
                    target_diseases JSON DEFAULT '[]',
                    approved_usage_and_label TEXT NOT NULL,
                    safety_precautions TEXT NOT NULL,
                    pre_harvest_interval_days INTEGER DEFAULT 7,
                    registration_number VARCHAR,
                    verified_source VARCHAR DEFAULT 'CIBRC & TNAU Agritech Portal',
                    last_verified_date VARCHAR DEFAULT '2026-03-01',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            cur.execute("CREATE INDEX IF NOT EXISTS ix_agri_products_name ON agri_products (name)")

            # Phase 5: Ensure agri_shops table exists
            cur.execute("""
                CREATE TABLE IF NOT EXISTS agri_shops (
                    id VARCHAR PRIMARY KEY,
                    name VARCHAR NOT NULL,
                    type VARCHAR DEFAULT 'LICENSED_RETAILER',
                    license_number VARCHAR,
                    district VARCHAR NOT NULL,
                    taluk_or_town VARCHAR NOT NULL,
                    pincode VARCHAR,
                    address TEXT NOT NULL,
                    latitude FLOAT,
                    longitude FLOAT,
                    phone VARCHAR,
                    whatsapp VARCHAR,
                    operating_hours VARCHAR DEFAULT 'Mon-Sat: 8:00 AM - 7:30 PM',
                    verified_status VARCHAR DEFAULT 'VERIFIED_DEALER',
                    last_verified_date VARCHAR DEFAULT '2026-03-01',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            cur.execute("CREATE INDEX IF NOT EXISTS ix_agri_shops_district ON agri_shops (district)")
            cur.execute("CREATE INDEX IF NOT EXISTS ix_agri_shops_town ON agri_shops (taluk_or_town)")
            cur.execute("CREATE INDEX IF NOT EXISTS ix_agri_shops_pincode ON agri_shops (pincode)")

            # Phase 5: Ensure shop_inventory table exists
            cur.execute("""
                CREATE TABLE IF NOT EXISTS shop_inventory (
                    id VARCHAR PRIMARY KEY,
                    shop_id VARCHAR NOT NULL REFERENCES agri_shops(id),
                    product_id VARCHAR NOT NULL REFERENCES agri_products(id),
                    package_size VARCHAR NOT NULL,
                    price_inr FLOAT,
                    price_verified BOOLEAN DEFAULT 1,
                    stock_status VARCHAR DEFAULT 'IN_STOCK',
                    stock_verified BOOLEAN DEFAULT 1,
                    last_verified_date VARCHAR DEFAULT '2026-03-01',
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            cur.execute("CREATE INDEX IF NOT EXISTS ix_shop_inventory_shop ON shop_inventory (shop_id)")
            cur.execute("CREATE INDEX IF NOT EXISTS ix_shop_inventory_product ON shop_inventory (product_id)")

            # Phase 6: Ensure expert_profiles table exists
            cur.execute("""
                CREATE TABLE IF NOT EXISTS expert_profiles (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR REFERENCES users(id),
                    name VARCHAR NOT NULL,
                    designation VARCHAR NOT NULL,
                    institution VARCHAR NOT NULL,
                    qualifications VARCHAR NOT NULL,
                    specializations JSON DEFAULT '[]',
                    languages JSON DEFAULT '[]',
                    experience_years INTEGER DEFAULT 12,
                    verification_status VARCHAR DEFAULT 'VERIFIED',
                    avatar_url VARCHAR,
                    rating FLOAT DEFAULT 4.9,
                    consultation_count INTEGER DEFAULT 45,
                    available_days JSON DEFAULT '[]',
                    available_hours VARCHAR DEFAULT '09:00 AM - 05:30 PM',
                    available_slots JSON DEFAULT '[]',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            cur.execute("CREATE INDEX IF NOT EXISTS ix_expert_profiles_name ON expert_profiles (name)")
            cur.execute("CREATE INDEX IF NOT EXISTS ix_expert_profiles_status ON expert_profiles (verification_status)")

            # Phase 6: Ensure consultations table exists
            cur.execute("""
                CREATE TABLE IF NOT EXISTS consultations (
                    id VARCHAR PRIMARY KEY,
                    farmer_id VARCHAR REFERENCES users(id),
                    farmer_name VARCHAR NOT NULL,
                    farmer_phone VARCHAR,
                    farmer_district VARCHAR DEFAULT 'Coimbatore',
                    expert_id VARCHAR REFERENCES expert_profiles(id),
                    expert_name VARCHAR,
                    scan_id VARCHAR REFERENCES scans(id),
                    case_id VARCHAR REFERENCES expert_cases(id),
                    consultation_type VARCHAR DEFAULT 'CHAT',
                    problem_description TEXT NOT NULL,
                    crop VARCHAR DEFAULT 'Tomato',
                    shared_image_url VARCHAR,
                    farmer_consent BOOLEAN DEFAULT 1,
                    scheduled_time VARCHAR NOT NULL,
                    status VARCHAR DEFAULT 'REQUESTED',
                    room_id VARCHAR NOT NULL,
                    expert_assessment TEXT,
                    expert_treatment_recommendation TEXT,
                    additional_images_requested BOOLEAN DEFAULT 0,
                    additional_images_request_note TEXT,
                    outcome VARCHAR,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            cur.execute("CREATE INDEX IF NOT EXISTS ix_consultations_farmer ON consultations (farmer_id)")
            cur.execute("CREATE INDEX IF NOT EXISTS ix_consultations_expert ON consultations (expert_id)")
            cur.execute("CREATE INDEX IF NOT EXISTS ix_consultations_status ON consultations (status)")
            cur.execute("CREATE INDEX IF NOT EXISTS ix_consultations_room ON consultations (room_id)")

            # Phase 6: Ensure consultation_messages table exists
            cur.execute("""
                CREATE TABLE IF NOT EXISTS consultation_messages (
                    id VARCHAR PRIMARY KEY,
                    consultation_id VARCHAR NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
                    sender_id VARCHAR,
                    sender_name VARCHAR NOT NULL,
                    sender_role VARCHAR DEFAULT 'FARMER',
                    message TEXT NOT NULL,
                    image_url VARCHAR,
                    message_type VARCHAR DEFAULT 'TEXT',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            cur.execute("CREATE INDEX IF NOT EXISTS ix_consultation_messages_consultation ON consultation_messages (consultation_id)")
            conn.commit()

            conn.close()
    except Exception as e:
        print(f"[MIGRATION] Migration check notice: {e}")

ensure_schema_migrations()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
