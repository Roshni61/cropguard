from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.database import get_db
from app.db.models import Field
from app.services.rag_service import RAGAssistantService

router = APIRouter(prefix="/chat", tags=["CropGuard AI Assistant"])

class ChatRequest(BaseModel):
    query: str
    language: str = "en"
    field_id: Optional[str] = None

@router.post("/query")
async def chat_query(req: ChatRequest, db: AsyncSession = Depends(get_db)):
    field_context = None
    if req.field_id:
        f_res = await db.execute(select(Field).filter(Field.id == req.field_id))
        field_obj = f_res.scalars().first()
        if field_obj:
            field_context = {
                "name": field_obj.name,
                "crop": field_obj.crop,
                "crop_stage": field_obj.crop_stage
            }

    res = RAGAssistantService.answer_farmer_question(
        user_query=req.query,
        language=req.language,
        field_context=field_context
    )

    return {"success": True, "data": res}
