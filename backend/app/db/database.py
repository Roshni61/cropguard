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
    """Ensure supabase_user_id column exists and phone is nullable without data loss."""
    try:
        db_file = settings.SYNC_DATABASE_URL.replace("sqlite:///", "").replace("sqlite+aiosqlite:///", "")
        if db_file and not db_file.startswith(":memory:") and os.path.exists(db_file):
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
