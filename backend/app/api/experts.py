from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.database import get_db
from app.db.models import ExpertCase, Scan

router = APIRouter(prefix="/experts", tags=["Expert Escalations"])

class ReviewRequest(BaseModel):
    case_id: str
    status: str = "VERIFIED" # VERIFIED, CORRECTED, REJECTED
    expert_diagnosis: str
    expert_notes: Optional[str] = None
    expert_treatment: Optional[str] = None
    expert_name: str = "Dr. S. Lakshmi"

@router.get("/cases")
async def get_pending_cases(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ExpertCase).order_by(ExpertCase.created_at.desc()))
    cases = result.scalars().all()
    
    output = []
    for c in cases:
        scan_res = await db.execute(select(Scan).filter(Scan.id == c.scan_id))
        scan = scan_res.scalars().first()
        output.append({
            "id": c.id,
            "scan_id": c.scan_id,
            "farmer_name": c.farmer_name,
            "field_name": c.field_name,
            "crop": c.crop,
            "ai_disease": c.ai_disease,
            "ai_confidence": c.ai_confidence,
            "ai_severity": c.ai_severity,
            "status": c.status,
            "expert_diagnosis": c.expert_diagnosis,
            "expert_notes": c.expert_notes,
            "expert_treatment": c.expert_treatment,
            "expert_name": c.expert_name,
            "grad_cam_url": scan.grad_cam_url if scan else None,
            "created_at": c.created_at.strftime("%Y-%m-%d %H:%M") if c.created_at else ""
        })
    return {"success": True, "data": output}

@router.post("/review")
async def review_case(req: ReviewRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ExpertCase).filter(ExpertCase.id == req.case_id))
    case_obj = result.scalars().first()
    if not case_obj:
        raise HTTPException(status_code=404, detail="Case not found")

    case_obj.status = req.status
    case_obj.expert_diagnosis = req.expert_diagnosis
    case_obj.expert_notes = req.expert_notes
    case_obj.expert_treatment = req.expert_treatment
    case_obj.expert_name = req.expert_name

    await db.commit()
    return {"success": True, "message": "Expert review recorded successfully."}
