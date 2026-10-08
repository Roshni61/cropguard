from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.database import get_db
from app.db.models import TreatmentKnowledge

router = APIRouter(prefix="/treatments", tags=["Verified Knowledge Base"])

@router.get("/")
async def list_treatments(crop: str = "Tomato", db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TreatmentKnowledge).filter(TreatmentKnowledge.crop == crop))
    entries = result.scalars().all()
    
    output = []
    for e in entries:
        output.append({
            "id": e.id,
            "crop": e.crop,
            "disease": e.disease,
            "symptoms": e.symptoms,
            "causes": e.causes,
            "organic_treatment": e.organic_treatment,
            "chemical_treatment": e.chemical_treatment,
            "active_ingredients": e.active_ingredients,
            "dosage": e.dosage,
            "application_timing": e.application_timing,
            "safety_precautions": e.safety_precautions,
            "pre_harvest_interval_days": e.pre_harvest_interval_days,
            "verification_status": e.verification_status,
            "verified_by": e.verified_by,
            "source_url": e.source_url
        })
    return {"success": True, "data": output}
