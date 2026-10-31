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
    crop: Optional[str] = Form("Tomato"),
    district: Optional[str] = Form("Coimbatore"),
    growth_stage: Optional[str] = Form("Vegetative"),
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

    # 1. Run Vision Pipeline with Crop Hint and District
    result = VisionModelService.diagnose_image(
        image_bytes,
        file.filename or "",
        crop_hint=crop,
        district=district
    )
    quality = result["quality"]

    # If quality check rejected the image (TOO_BLURRY, TOO_DARK, OVEREXPOSED, NO_LEAF_DETECTED, TOO_FAR)
    if quality["status"] != "GOOD":
        return {
            "success": False,
            "quality": quality,
            "error": {
                "code": f"IMAGE_{quality['status']}",
                "message": quality["reasons"][0] if quality["reasons"] else "Image quality is insufficient for accurate AI diagnosis.",
                "guidance": quality.get("guidance", "Please position the affected leaf under natural daylight and hold steady.")
            }
        }

    diagnosis = result["diagnosis"]
    resolved_crop = diagnosis.get("crop", crop or "Tomato")
    disease_name = diagnosis["disease_name"]
    severity = diagnosis["severity"]
    conf = diagnosis["confidence"]
    is_low_conf = diagnosis.get("is_low_confidence", False)

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
                name=f"{resolved_crop} Field A",
                crop=resolved_crop,
                area=2.4,
                variety="Hybrid"
            )
            db.add(field)
            await db.commit()
            await db.refresh(field)

    field_id = field.id
    field_area = field.area if field else 1.0

    # 4. Generate Verified Agronomic Treatment (No generic fallbacks!)
    treatment_recs = TreatmentEngine.generate_recommendation(
        crop=resolved_crop,
        disease_name=disease_name,
        severity=severity,
        weather=weather,
        field_area_acres=field_area,
        is_low_confidence=is_low_conf
    )

    b64_img = base64.b64encode(image_bytes).decode("utf-8")
    image_url = f"data:image/jpeg;base64,{b64_img[:50000]}..."

    # 5. Persist Scan History to Database
    symptom_regions = diagnosis.get("symptom_regions", [])
    scan = Scan(
        client_scan_id=client_scan_id,
        field_id=field_id,
        image_url=image_url,
        leaf_part=leaf_part,
        crop=resolved_crop,
        district=district or "Coimbatore",
        growth_stage=growth_stage or "Vegetative",
        symptom_regions=symptom_regions,
        location_lat=lat,
        location_lng=lng,
        quality_status=quality["status"],
        quality_reasons=quality.get("reasons", []),
        disease_name=disease_name,
        confidence=conf,
        confidence_level=diagnosis["confidence_level"],
        severity=severity,
        severity_confidence=diagnosis["severity_confidence"],
        alternatives=diagnosis["alternatives"],
        grad_cam_url=diagnosis.get("grad_cam_url"),
        weather_snapshot=weather,
        treatment_recommendations=treatment_recs,
        spray_window_advice=weather.get("spray_window_advice"),
        sync_status="SYNCED"
    )
    db.add(scan)

    await db.commit()
    await db.refresh(scan)

    expert_review_needed = diagnosis.get("expert_review_needed", is_low_conf or severity == "Severe")
    expert_review_reason = diagnosis.get(
        "expert_review_reason",
        "Expert verification recommended based on severity or uncertainty thresholds."
    )

    return {
        "success": True,
        "data": {
            "id": scan.id,
            "crop": resolved_crop,
            "district": district or "Coimbatore",
            "growth_stage": growth_stage or "Vegetative",
            "quality": quality,
            "disease_name": disease_name,
            "confidence": conf,
            "confidence_level": diagnosis["confidence_level"],
            "is_low_confidence": is_low_conf,
            "severity": severity,
            "severity_confidence": diagnosis["severity_confidence"],
            "symptoms": diagnosis.get("symptoms", ""),
            "causes": diagnosis.get("causes", ""),
            "preventive_measures": diagnosis.get("preventive_measures", ""),
            "alternatives": diagnosis["alternatives"],
            "symptom_regions": symptom_regions,
            "expert_review_needed": expert_review_needed,
            "expert_review_reason": expert_review_reason,
            "confidence_disclaimer": diagnosis.get(
                "confidence_disclaimer",
                "AI confidence indicates pattern correlation with verified agricultural pathology datasets. It is not an absolute guarantee of laboratory accuracy. Always verify symptoms with physical field scouting."
            ),
            "grad_cam_url": diagnosis.get("grad_cam_url"),
            "has_real_grad_cam": diagnosis.get("has_real_grad_cam", False),
            "explainability_note": diagnosis.get("explainability_note", ""),
            "weather": weather,
            "treatments": treatment_recs,
            "can_ask_followup": True
        }
    }

@router.get("/user/history")
async def get_user_scan_history(
    limit: int = 15,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Returns authenticated user's scan history with full diagnostic records."""
    stmt = (
        select(Scan)
        .join(Field, Scan.field_id == Field.id)
        .join(Farm, Field.farm_id == Farm.id)
        .filter(Farm.user_id == current_user.id)
        .order_by(Scan.created_at.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    scans = result.scalars().all()

    history = []
    for s in scans:
        history.append({
            "id": s.id,
            "crop": s.crop or "Tomato",
            "district": s.district or "Coimbatore",
            "growth_stage": s.growth_stage or "Vegetative",
            "disease_name": s.disease_name,
            "confidence": s.confidence,
            "confidence_level": s.confidence_level,
            "severity": s.severity,
            "quality_status": s.quality_status,
            "image_url": s.image_url,
            "symptom_regions": s.symptom_regions or [],
            "alternatives": s.alternatives or [],
            "created_at": s.created_at.strftime("%Y-%m-%d %H:%M") if s.created_at else "",
            "spray_window_advice": s.spray_window_advice,
            "treatments": s.treatment_recommendations
        })
    return {"success": True, "data": history}

@router.get("/{scan_id}")
async def get_scan_by_id(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Returns full scan diagnostic report with authorization check."""
    stmt = (
        select(Scan)
        .join(Field, Scan.field_id == Field.id)
        .join(Farm, Field.farm_id == Farm.id)
        .filter(Scan.id == scan_id)
    )
    result = await db.execute(stmt)
    scan = result.scalars().first()

    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan record not found."
        )

    # Check farm ownership
    farm_stmt = select(Farm).join(Field, Field.farm_id == Farm.id).filter(Field.id == scan.field_id)
    farm_res = await db.execute(farm_stmt)
    farm = farm_res.scalars().first()

    if not farm or (farm.user_id != current_user.id and current_user.role not in ["EXPERT", "FIELD_OFFICER", "OFFICER", "SYS_ADMIN"]):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan record not found."
        )

    return {
        "success": True,
        "data": {
            "id": scan.id,
            "crop": scan.crop or "Tomato",
            "district": scan.district or "Coimbatore",
            "growth_stage": scan.growth_stage or "Vegetative",
            "disease_name": scan.disease_name,
            "confidence": scan.confidence,
            "confidence_level": scan.confidence_level,
            "severity": scan.severity,
            "quality_status": scan.quality_status,
            "quality_reasons": scan.quality_reasons or [],
            "image_url": scan.image_url,
            "symptom_regions": scan.symptom_regions or [],
            "alternatives": scan.alternatives or [],
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
    if not farm or (farm.user_id != current_user.id and current_user.role not in ["EXPERT", "FIELD_OFFICER", "OFFICER", "SYS_ADMIN"]):
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
