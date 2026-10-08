from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.database import get_db
from app.db.models import Scan

router = APIRouter(prefix="/sync", tags=["Offline Sync Engine"])

class SyncScanItem(BaseModel):
    client_scan_id: str
    field_id: str
    disease_name: str
    confidence: float
    confidence_level: str
    severity: str
    quality_status: str
    grad_cam_url: Optional[str] = None
    weather_snapshot: Optional[Dict[str, Any]] = None
    treatment_recommendations: Optional[Dict[str, Any]] = None
    created_at_client: Optional[str] = None

class BatchSyncRequest(BaseModel):
    scans: List[SyncScanItem]

@router.post("/batch")
async def sync_offline_scans(req: BatchSyncRequest, db: AsyncSession = Depends(get_db)):
    synced_ids = []
    skipped_ids = []

    for item in req.scans:
        # Check if already synced using client_scan_id (Idempotent Check)
        res = await db.execute(select(Scan).filter(Scan.client_scan_id == item.client_scan_id))
        existing = res.scalars().first()

        if existing:
            skipped_ids.append(item.client_scan_id)
            continue

        new_scan = Scan(
            client_scan_id=item.client_scan_id,
            field_id=item.field_id,
            image_url="data:image/jpeg;base64,/offline_sync_image_data...",
            leaf_part="leaf",
            quality_status=item.quality_status,
            disease_name=item.disease_name,
            confidence=item.confidence,
            confidence_level=item.confidence_level,
            severity=item.severity,
            grad_cam_url=item.grad_cam_url,
            weather_snapshot=item.weather_snapshot or {},
            treatment_recommendations=item.treatment_recommendations or {},
            sync_status="SYNCED"
        )
        db.add(new_scan)
        synced_ids.append(item.client_scan_id)

    await db.commit()

    return {
        "success": True,
        "data": {
            "synced_count": len(synced_ids),
            "synced_ids": synced_ids,
            "duplicate_skipped_count": len(skipped_ids),
            "skipped_ids": skipped_ids
        }
    }
