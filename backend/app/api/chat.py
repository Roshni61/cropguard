from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field as PydanticField
from typing import Optional, List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.database import get_db
from app.db.models import Field, Farm
from app.services.rag_service import RAGAssistantService

router = APIRouter(prefix="/chat", tags=["CropGuard AI Assistant"])

class ChatMessage(BaseModel):
    role: str = PydanticField(..., description="user or assistant")
    content: str = PydanticField(..., description="Message text")

class ChatRequest(BaseModel):
    query: str = PydanticField(..., min_length=1, max_length=1000, description="Farmer query text")
    language: str = PydanticField(default="en", description="Language code: en, ta, or hi")
    field_id: Optional[str] = None
    crop: Optional[str] = None
    location: Optional[str] = None
    history: Optional[List[ChatMessage]] = None

@router.post("/query")
async def chat_query(req: ChatRequest, db: AsyncSession = Depends(get_db)):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    # Normalize language
    lang = req.language.lower().strip()
    if lang not in ("en", "ta", "hi"):
        lang = "en"

    field_context = None
    crop = req.crop
    location = req.location

    if req.field_id:
        try:
            f_res = await db.execute(select(Field).filter(Field.id == req.field_id))
            field_obj = f_res.scalars().first()
            if field_obj:
                field_context = {
                    "name": field_obj.name,
                    "crop": field_obj.crop,
                    "crop_stage": field_obj.crop_stage,
                    "variety": field_obj.variety,
                    "soil_type": field_obj.soil_type,
                    "irrigation_type": field_obj.irrigation_type,
                }
                if not crop and field_obj.crop:
                    crop = field_obj.crop

                # Try loading parent farm location
                if field_obj.farm_id:
                    farm_res = await db.execute(select(Farm).filter(Farm.id == field_obj.farm_id))
                    farm_obj = farm_res.scalars().first()
                    if farm_obj and farm_obj.address:
                        field_context["address"] = farm_obj.address
                        if not location:
                            location = farm_obj.address
        except Exception as e:
            # Continue gracefully if DB context fetch fails
            pass

    history_dicts = None
    if req.history:
        history_dicts = [{"role": m.role, "content": m.content} for m in req.history]

    res = RAGAssistantService.answer_farmer_question(
        user_query=req.query,
        language=lang,
        field_context=field_context,
        crop=crop,
        location=location,
        history=history_dicts
    )

    return {"success": True, "data": res}
