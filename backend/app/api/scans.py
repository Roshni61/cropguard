import base64
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.database import get_db
from app.db.models import Scan, Field, Farm, TreatmentKnowledge, ExpertCase, User
from app.services.vision_service import VisionModelService
from app.services.weather_service import WeatherService
from app.services.treatment_engine import TreatmentEngine
from app.security.auth import get_current_user

router = APIRouter(prefix="/scans", tags=["Scans & Diagnosis"])

@router.post("/analyze")
async def analyze_crop_image(
    file: UploadFile = File(...),
    field_id: Optional[str] = Form("fld-01"),
    leaf_part: str = Form("leaf"),
    client_scan_id: Optional[str] = Form(None),
    lat: Optional[float] = Form(11.0168),
    lng: Optional[float] = Form(76.9558),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty image file uploaded")

    # 1. Run Vision Pipeline
    result = VisionModelService.diagnose_image(image_bytes, file.filename or "")
    quality = result["quality"]

    # If quality is below threshold (TOO_BLURRY, TOO_DARK, NO_LEAF_DETECTED)
    if quality["status"] != "GOOD":
        return {
            "success": False,
            "quality": quality,
            "error": {
                "code": f"IMAGE_{quality['status']}",
                "message": quality["reasons"][0] if quality["reasons"] else "Image quality is insufficient for accurate AI diagnosis."
            }
        }

    diagnosis = result["diagnosis"]
    disease_name = diagnosis["disease_name"]
    severity = diagnosis["severity"]
    conf = diagnosis["confidence"]

    # 2. Fetch live weather & spray advisory
    weather = await WeatherService.get_weather(lat or 11.0168, lng or 76.9558)

    # 3. Ownership-Bound Field Resolution: Ensure field belongs to current_user
    field = None
    if field_id:
        stmt = (
            select(Field)
            .join(Farm, Field.farm_id == Farm.id)
            .filter(Field.id == field_id, Farm.user_id == current_user.id)
        )
        f_res = await db.execute(stmt)
        field = f_res.scalars().first()

    # If user doesn't own this field or it's a generic demo ID, find/create their own farm and field
    if not field:
        user_farm_res = await db.execute(select(Farm).filter(Farm.user_id == current_user.id))
        user_farm = user_farm_res.scalars().first()
        if not user_farm:
            user_farm = Farm(
                user_id=current_user.id,
                name="Primary Farm Plot",
                location_lat=lat or 11.0168,
                location_lng=lng or 76.9558,
                total_area=2.4
            )
            db.add(user_farm)
            await db.commit()
            await db.refresh(user_farm)

        user_field_res = await db.execute(select(Field).filter(Field.farm_id == user_farm.id))
        field = user_field_res.scalars().first()
        if not field:
            field = Field(
                farm_id=user_farm.id,
                name="Tomato Field A (North)",
                crop="Tomato",
                area=2.4,
                variety="Arka Rakshak"
            )
            db.add(field)
            await db.commit()
            await db.refresh(field)

    field_id = field.id
    field_area = field.area if field else 1.0
    crop_name = field.crop if field else "Tomato"

    # Match exact disease in KB
    kb_res = await db.execute(select(TreatmentKnowledge).filter(TreatmentKnowledge.crop == crop_name))
    kb_entries = kb_res.scalars().all()
    kb_match = None
    for entry in kb_entries:
        if entry.disease.lower() in disease_name.lower() or disease_name.lower() in entry.disease.lower():
            kb_match = {
                "organic_treatment": entry.organic_treatment,
                "chemical_treatment": entry.chemical_treatment,
                "active_ingredients": entry.active_ingredients,
                "dosage": entry.dosage,
                "application_timing": entry.application_timing,
                "safety_precautions": entry.safety_precautions,
                "pre_harvest_interval_days": entry.pre_harvest_interval_days,
                "verified_by": entry.verified_by,
                "verification_status": entry.verification_status,
                "source_url": entry.source_url
            }
            break

    if not kb_match and kb_entries:
        entry = kb_entries[0]
        kb_match = {
            "organic_treatment": entry.organic_treatment,
            "chemical_treatment": entry.chemical_treatment,
            "active_ingredients": entry.active_ingredients,
            "dosage": entry.dosage,
            "application_timing": entry.application_timing,
            "safety_precautions": entry.safety_precautions,
            "pre_harvest_interval_days": entry.pre_harvest_interval_days,
            "verified_by": entry.verified_by,
            "verification_status": entry.verification_status,
            "source_url": entry.source_url
        }

    # 4. Generate Treatment Recommendation
    treatment_recs = TreatmentEngine.generate_recommendation(
        disease_name=disease_name,
        severity=severity,
        kb_entry=kb_match or {},
        weather=weather,
        field_area_acres=field_area
    )

    b64_img = base64.b64encode(image_bytes).decode("utf-8")
    image_url = f"data:image/jpeg;base64,{b64_img[:50000]}..."

    # 5. Persist Scan
    scan = Scan(
        client_scan_id=client_scan_id,
        field_id=field_id,
        image_url=image_url,
        leaf_part=leaf_part,
        location_lat=lat,
        location_lng=lng,
        quality_status=quality["status"],
        quality_reasons=quality["reasons"],
        disease_name=disease_name,
        confidence=conf,
        confidence_level=diagnosis["confidence_level"],
        severity=severity,
        severity_confidence=diagnosis["severity_confidence"],
        alternatives=diagnosis["alternatives"],
        grad_cam_url=diagnosis["grad_cam_url"],
        weather_snapshot=weather,
        treatment_recommendations=treatment_recs,
        spray_window_advice=weather.get("spray_window_advice"),
        sync_status="SYNCED"
    )
    db.add(scan)

    if conf < 0.60 or severity == "Severe":
        expert_case = ExpertCase(
            scan_id=scan.id,
            farmer_name=current_user.name,
            field_name=field.name if field else "Tomato Field",
            crop=crop_name,
            ai_disease=disease_name,
            ai_confidence=conf,
            ai_severity=severity,
            status="PENDING"
        )
        db.add(expert_case)

    await db.commit()
    await db.refresh(scan)

    return {
        "success": True,
        "data": {
            "id": scan.id,
            "quality": quality,
            "disease_name": disease_name,
            "confidence": conf,
            "confidence_level": diagnosis["confidence_level"],
            "severity": severity,
            "severity_confidence": diagnosis["severity_confidence"],
            "alternatives": diagnosis["alternatives"],
            "grad_cam_url": diagnosis["grad_cam_url"],
            "weather": weather,
            "treatments": treatment_recs,
            "auto_escalated_to_expert": conf < 0.60 or severity == "Severe"
        }
    }

@router.get("/{scan_id}")
async def get_scan_by_id(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    WORKED EXAMPLE REQUIREMENT:
    GET /scans/{id} with User B's token on User A's scan returns 404 and leaks no data.
    """
    stmt = (
        select(Scan)
        .join(Field, Scan.field_id == Field.id)
        .join(Farm, Field.farm_id == Farm.id)
        .filter(Scan.id == scan_id)
    )
    result = await db.execute(stmt)
    scan = result.scalars().first()

    # If scan does not exist, return 404
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan record not found."
        )

    # Check farm ownership
    farm_stmt = select(Farm).join(Field, Field.farm_id == Farm.id).filter(Field.id == scan.field_id)
    farm_res = await db.execute(farm_stmt)
    farm = farm_res.scalars().first()

    # Reject if owned by another user and current_user is not an authorized officer/expert
    if not farm or (farm.user_id != current_user.id and current_user.role not in ["EXPERT", "FIELD_OFFICER", "SYS_ADMIN"]):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan record not found."
        )

    return {
        "success": True,
        "data": {
            "id": scan.id,
            "disease_name": scan.disease_name,
            "confidence": scan.confidence,
            "confidence_level": scan.confidence_level,
            "severity": scan.severity,
            "quality_status": scan.quality_status,
            "created_at": scan.created_at.strftime("%Y-%m-%d %H:%M") if scan.created_at else "",
            "spray_window_advice": scan.spray_window_advice,
            "treatments": scan.treatment_recommendations,
            "weather": scan.weather_snapshot,
            "grad_cam_url": scan.grad_cam_url
        }
    }

@router.get("/field/{field_id}")
async def get_field_scans(
    field_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Ensure field belongs strictly to authenticated user before returning scan list."""
    f_stmt = (
        select(Field)
        .join(Farm, Field.farm_id == Farm.id)
        .filter(Field.id == field_id)
    )
    f_res = await db.execute(f_stmt)
    field = f_res.scalars().first()

    if not field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Field not found."
        )

    # Check ownership
    farm_res = await db.execute(select(Farm).filter(Farm.id == field.farm_id))
    farm = farm_res.scalars().first()
    if not farm or (farm.user_id != current_user.id and current_user.role not in ["EXPERT", "FIELD_OFFICER", "SYS_ADMIN"]):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Field not found."
        )

    result = await db.execute(select(Scan).filter(Scan.field_id == field_id).order_by(Scan.created_at.desc()))
    scans = result.scalars().all()
    
    scans_list = []
    for s in scans:
        scans_list.append({
            "id": s.id,
            "disease_name": s.disease_name,
            "confidence": s.confidence,
            "confidence_level": s.confidence_level,
            "severity": s.severity,
            "quality_status": s.quality_status,
            "created_at": s.created_at.strftime("%Y-%m-%d %H:%M") if s.created_at else "",
            "spray_window_advice": s.spray_window_advice
        })
    return {"success": True, "data": scans_list}
