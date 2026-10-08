import base64
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.database import get_db
from app.db.models import Scan, Field, TreatmentKnowledge, ExpertCase
from app.services.vision_service import VisionModelService
from app.services.weather_service import WeatherService
from app.services.treatment_engine import TreatmentEngine

router = APIRouter(prefix="/scans", tags=["Scans & Diagnosis"])

@router.post("/analyze")
async def analyze_crop_image(
    file: UploadFile = File(...),
    field_id: str = Form(...),
    leaf_part: str = Form("leaf"),
    client_scan_id: Optional[str] = Form(None),
    lat: Optional[float] = Form(11.0168),
    lng: Optional[float] = Form(76.9558),
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

    # 3. Retrieve verified treatment knowledge base
    field_res = await db.execute(select(Field).filter(Field.id == field_id))
    field = field_res.scalars().first()
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

    # If no exact match, create verified base entry
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

    # 4. Generate Treatment Recommendation via TreatmentEngine
    treatment_recs = TreatmentEngine.generate_recommendation(
        disease_name=disease_name,
        severity=severity,
        kb_entry=kb_match or {},
        weather=weather,
        field_area_acres=field_area
    )

    # Convert uploaded image to data URL for storage
    b64_img = base64.b64encode(image_bytes).decode("utf-8")
    image_url = f"data:image/jpeg;base64,{b64_img[:50000]}..." # stored reference

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

    # 6. Auto-escalate low confidence (<0.60) or severe ambiguous cases to agricultural expert queue!
    if conf < 0.60 or severity == "Severe":
        expert_case = ExpertCase(
            scan_id=scan.id,
            farmer_name="Ramesh Kumar",
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

@router.get("/field/{field_id}")
async def get_field_scans(field_id: str, db: AsyncSession = Depends(get_db)):
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
