from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.services.retailer_service import RetailerService

router = APIRouter(prefix="/products", tags=["Verified Crop Products"])

@router.get("/")
async def list_verified_products(
    crop: Optional[str] = Query(None, description="Target crop (e.g. Tomato, Cotton, Paddy, Banana)"),
    disease: Optional[str] = Query(None, description="Target crop disease (e.g. Early Blight, Blast, Sigatoka)"),
    category: Optional[str] = Query(None, description="Fungicide, Bio-Control, Bactericide, Botanical"),
    search: Optional[str] = Query(None, description="Keyword search in product name, active ingredient, brand"),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns eligible treatment products strictly supported by authoritative CIBRC & TNAU registrations.
    """
    products = await RetailerService.get_verified_products(
        db, crop=crop, disease=disease, category=category, search=search
    )
    return {
        "success": True,
        "count": len(products),
        "data": products
    }

@router.get("/{product_id}")
async def get_product_detail(product_id: str, db: AsyncSession = Depends(get_db)):
    """
    Returns verified product card with active ingredient, manufacturer, CIBRC label directions,
    safety precautions, PPE requirements, Pre-Harvest Interval (PHI), and source timestamp.
    """
    prod = await RetailerService.get_product_by_id(db, product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found in authorized CIBRC registry.")
    return {
        "success": True,
        "data": prod
    }

@router.get("/{product_id}/availability")
async def get_product_shop_availability(
    product_id: str,
    district: Optional[str] = Query(None, description="Filter by district"),
    pincode: Optional[str] = Query(None, description="Filter by 6-digit PIN code"),
    lat: Optional[float] = Query(None, description="User latitude for distance calculation"),
    lng: Optional[float] = Query(None, description="User longitude for distance calculation"),
    db: AsyncSession = Depends(get_db)
):
    """
    Finds licensed local input retailers, PACCS cooperatives, and KVK counters stocking this product,
    with calculated distance (km), verified price or 'Price or availability not verified' indicator.
    """
    res = await RetailerService.get_product_availability(
        db, product_id=product_id, district=district, pincode=pincode, user_lat=lat, user_lng=lng
    )
    return res

