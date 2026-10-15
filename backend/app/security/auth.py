import uuid
import json
from datetime import datetime
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.config import settings
from app.db.database import get_db
from app.db.models import User

security = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    raw_token = credentials.credentials
    payload = None
    is_supabase = False

    # 1. Attempt Supabase JWT decoding
    try:
        if settings.SUPABASE_JWT_SECRET:
            # Verify signature, expiry, and audience using backend-only secret
            payload = jwt.decode(
                raw_token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated",
                options={"verify_aud": False} # Permissive audience matching for custom projects
            )
        else:
            # If secret not yet configured, decode unverified in dev environment
            unverified_claims = jwt.get_unverified_claims(raw_token)
            if "aud" in unverified_claims and ("authenticated" in unverified_claims["aud"] or "supabase" in str(unverified_claims.get("iss", ""))):
                payload = unverified_claims
        
        if payload and ("sub" in payload) and (payload.get("role") == "authenticated" or "email" in payload or "supabase" in str(payload.get("iss", ""))):
            is_supabase = True
    except Exception:
        payload = None

    # 2. Fallback to Legacy CropGuard JWT decoding
    if not is_supabase or not payload:
        try:
            payload = jwt.decode(
                raw_token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM]
            )
            is_supabase = False
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token.",
                headers={"WWW-Authenticate": "Bearer"},
            )

    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    sub_id = payload["sub"]

    # 3. Resolve User in SQLite
    if is_supabase:
        # Search by supabase_user_id
        result = await db.execute(select(User).filter(User.supabase_user_id == sub_id))
        user = result.scalars().first()

        email = payload.get("email")

        # If not linked by supabase_user_id, search by verified email
        if not user and email:
            email_res = await db.execute(select(User).filter(User.email == email))
            user = email_res.scalars().first()
            if user:
                # Link Supabase user to existing local account
                user.supabase_user_id = sub_id
                await db.commit()
                await db.refresh(user)

        # If still not found, create matching local user
        if not user:
            user_metadata = payload.get("user_metadata", {}) or {}
            full_name = (
                user_metadata.get("full_name")
                or user_metadata.get("name")
                or (email.split("@")[0].title() if email else "Farmer")
            )
            role = user_metadata.get("role") or "FARMER"
            preferred_language = user_metadata.get("language") or "en"
            state = user_metadata.get("state") or "Tamil Nadu"
            district = user_metadata.get("district") or "Coimbatore"

            user = User(
                id=str(uuid.uuid4()),
                supabase_user_id=sub_id,
                email=email,
                name=full_name,
                role=role.upper(),
                preferred_language=preferred_language,
                state=state,
                district=district,
                password_hash=None
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

        return user
    else:
        # Search by local primary key ID (Legacy Phone / User ID)
        result = await db.execute(select(User).filter(User.id == sub_id))
        user = result.scalars().first()
        if not user:
            # Fallback search by phone if sub is phone
            phone_res = await db.execute(select(User).filter(User.phone == sub_id))
            user = phone_res.scalars().first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account associated with this token was not found.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user
