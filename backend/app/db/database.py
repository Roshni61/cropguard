from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.config import settings

# Async Engine for FastAPI routes
async_engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(async_engine, expire_on_commit=False, class_=AsyncSession)

# Sync Engine for Seeding and background tasks
sync_engine = create_engine(settings.SYNC_DATABASE_URL, connect_args={"check_same_thread": False})
SyncSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
