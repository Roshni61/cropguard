from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.database import get_db
from app.db.models import ExpertCase, Scan, User, Farm, Field
from app.security.auth import get_current_user

router = APIRouter(prefix="/experts", tags=["Expert Escalations"])

class EscalateRequest(BaseModel):
    scan_id: str
    farmer_consent: bool = True
    farmer_notes: Optional[str] = None

class ReviewRequest(BaseModel):
    case_id: str
    status: str = "VERIFIED" # VERIFIED, CORRECTED, REJECTED
    expert_diagnosis: str
    expert_notes: Optional[str] = None
    expert_treatment: Optional[str] = None
    expert_name: str = "Dr. S. Lakshmi"

@router.post("/escalate")
async def escalate_case_to_expert(
    req: EscalateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not req.farmer_consent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Farmer consent is required to share scan details with the agricultural expert network."
        )

    scan_res = await db.execute(select(Scan).filter(Scan.id == req.scan_id))
    scan = scan_res.scalars().first()
    if not scan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan record not found.")

    # Check ownership
    farm_res = await db.execute(select(Farm).join(Field, Field.farm_id == Farm.id).filter(Field.id == scan.field_id))
    farm = farm_res.scalars().first()
    if not farm or (farm.user_id != current_user.id and current_user.role not in ["EXPERT", "FIELD_OFFICER", "OFFICER", "SYS_ADMIN"]):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to escalate this scan.")

    # Check if case already exists
    existing_case_res = await db.execute(select(ExpertCase).filter(ExpertCase.scan_id == req.scan_id))
    existing_case = existing_case_res.scalars().first()
    if existing_case:
        return {
            "success": True,
            "message": "Case is already pending review in the extension queue.",
            "data": {
                "case_id": existing_case.id,
                "status": existing_case.status,
                "created_at": existing_case.created_at.strftime("%Y-%m-%d %H:%M") if existing_case.created_at else ""
            }
        }

    field_res = await db.execute(select(Field).filter(Field.id == scan.field_id))
    field = field_res.scalars().first()

    new_case = ExpertCase(
        scan_id=scan.id,
        farmer_name=current_user.name,
        farmer_phone=current_user.phone or "Not provided",
        field_name=field.name if field else f"{scan.crop or 'Crop'} Plot",
        crop=scan.crop or "Tomato",
        ai_disease=scan.disease_name or "Unidentified Condition",
        ai_confidence=scan.confidence or 0.5,
        ai_severity=scan.severity or "Moderate",
        status="PENDING",
        farmer_notes=req.farmer_notes,
        farmer_consent=req.farmer_consent
    )
    db.add(new_case)
    await db.commit()
    await db.refresh(new_case)

    return {
        "success": True,
        "message": "Scan successfully escalated to district agricultural expert queue.",
        "data": {
            "case_id": new_case.id,
            "status": new_case.status,
            "created_at": new_case.created_at.strftime("%Y-%m-%d %H:%M") if new_case.created_at else ""
        }
    }

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
            "location": "Pollachi, Coimbatore, Tamil Nadu",
            "image_url": scan.image_url if (scan and scan.image_url) else "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=800&q=80",
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
