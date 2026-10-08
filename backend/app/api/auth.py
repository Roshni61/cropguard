from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from jose import jwt, JWTError

from app.db.database import get_db
from app.db.models import User
from app.config import settings
from app.security.pwd import hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Auth"])

class UserRegister(BaseModel):
    name: str
    phone: str
    password: str
    role: str = "FARMER"
    preferred_language: str = "en"
    state: str = "Tamil Nadu"
    district: str = "Coimbatore"

class UserLogin(BaseModel):
    phone: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

@router.post("/register", response_model=TokenResponse)
async def register(user_in: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.phone == user_in.phone))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Phone number already registered")

    hashed_pwd = hash_password(user_in.password)
    new_user = User(
        name=user_in.name,
        phone=user_in.phone,
        password_hash=hashed_pwd,
        role=user_in.role.upper(),
        preferred_language=user_in.preferred_language,
        state=user_in.state,
        district=user_in.district
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    token = create_access_token({"sub": new_user.id, "role": new_user.role})
    user_dict = {
        "id": new_user.id,
        "name": new_user.name,
        "phone": new_user.phone,
        "role": new_user.role,
        "preferred_language": new_user.preferred_language,
        "state": new_user.state,
        "district": new_user.district
    }
    return {"access_token": token, "token_type": "bearer", "user": user_dict}

@router.post("/login", response_model=TokenResponse)
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.phone == user_in.phone))
    user = result.scalars().first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid phone or password")

    token = create_access_token({"sub": user.id, "role": user.role})
    user_dict = {
        "id": user.id,
        "name": user.name,
        "phone": user.phone,
        "role": user.role,
        "preferred_language": user.preferred_language,
        "state": user.state,
        "district": user.district
    }
    return {"access_token": token, "token_type": "bearer", "user": user_dict}
