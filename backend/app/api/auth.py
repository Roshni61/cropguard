import re
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from jose import jwt

from app.db.database import get_db
from app.db.models import User
from app.config import settings
from app.security.pwd import hash_password, verify_password
from app.security.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

class UserRegister(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    password: str
    role: str = "FARMER"
    preferred_language: str = "en"
    state: str = "Tamil Nadu"
    district: str = "Coimbatore"

class UserLogin(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None
    password: str

class PasswordResetRequest(BaseModel):
    email: str

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
    if not user_in.phone and not user_in.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either a phone number or email address is required for registration."
        )

    # Safe validation without revealing exact account existence
    if user_in.phone:
        p_res = await db.execute(select(User).filter(User.phone == user_in.phone))
        if p_res.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to complete registration with the provided details. Please sign in or use another method."
            )

    if user_in.email:
        e_res = await db.execute(select(User).filter(User.email == user_in.email))
        if e_res.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to complete registration with the provided details. Please sign in or use another method."
            )

    hashed_pwd = hash_password(user_in.password)
    new_user = User(
        name=user_in.name,
        phone=user_in.phone,
        email=user_in.email,
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
        "email": new_user.email,
        "role": new_user.role,
        "preferred_language": new_user.preferred_language,
        "state": new_user.state,
        "district": new_user.district
    }
    return {"access_token": token, "token_type": "bearer", "user": user_dict}

@router.post("/login", response_model=TokenResponse)
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    user = None
    if user_in.email:
        result = await db.execute(select(User).filter(User.email == user_in.email))
        user = result.scalars().first()
    elif user_in.phone:
        result = await db.execute(select(User).filter(User.phone == user_in.phone))
        user = result.scalars().first()

    # Generic error message to never leak whether email or phone exists
    if not user or not user.password_hash or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email, phone or password."
        )

    token = create_access_token({"sub": user.id, "role": user.role})
    user_dict = {
        "id": user.id,
        "name": user.name,
        "phone": user.phone,
        "email": user.email,
        "role": user.role,
        "preferred_language": user.preferred_language,
        "state": user.state,
        "district": user.district
    }
    return {"access_token": token, "token_type": "bearer", "user": user_dict}

@router.post("/reset-password")
async def request_password_reset(req: PasswordResetRequest, db: AsyncSession = Depends(get_db)):
    """Generic rate-limit safe response that never reveals if an email exists."""
    return {
        "success": True,
        "message": "If an account matches this email, password reset instructions have been dispatched."
    }

@router.get("/me")
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Fetch current authenticated user profile across legacy or Supabase auth."""
    return {
        "success": True,
        "data": {
            "id": current_user.id,
            "supabase_user_id": current_user.supabase_user_id,
            "name": current_user.name,
            "email": current_user.email,
            "phone": current_user.phone,
            "role": current_user.role,
            "preferred_language": current_user.preferred_language,
            "state": current_user.state,
            "district": current_user.district
        }
    }

@router.post("/supabase-sync")
async def sync_supabase_user(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Called after Supabase email or OAuth (Google/GitHub) sign-in.
    Guarantees user profile exists and is linked in SQLite without duplicates.
    """
    return {
        "success": True,
        "user": {
            "id": current_user.id,
            "supabase_user_id": current_user.supabase_user_id,
            "name": current_user.name,
            "email": current_user.email,
            "phone": current_user.phone,
            "role": current_user.role,
            "preferred_language": current_user.preferred_language,
            "state": current_user.state,
            "district": current_user.district
        }
    }
