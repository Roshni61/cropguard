import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "CropGuard AI"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("JWT_SECRET", "cropguard_super_secret_jwt_key_2026_safe")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./cropguard.db")
    SYNC_DATABASE_URL: str = os.getenv("SYNC_DATABASE_URL", "sqlite:///./cropguard.db")
    
    OPEN_METEO_URL: str = "https://api.open-meteo.com/v1/forecast"

settings = Settings()
