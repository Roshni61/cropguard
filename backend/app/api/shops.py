from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.db.models import AgriShop, ShopInventory
from app.services.retailer_service import RetailerService

router = APIRouter(prefix="/shops", tags=["Local Agricultural Input Shops"])

@router.get("/")
async def search_agricultural_shops(
    district: Optional[str] = Query(None, description="District name (e.g. Coimbatore, Thanjavur, Madurai)"),
    query: Optional[str] = Query(None, description="Village, town, or shop keyword"),
    pincode: Optional[str] = Query(None, description="6-digit postal PIN code"),
    lat: Optional[float] = Query(None, description="Current latitude"),
    lng: Optional[float] = Query(None, description="Current longitude"),
    max_distance_km: float = Query(60.0, description="Max search radius in kilometers"),
    db: AsyncSession = Depends(get_db)
):
    """
    Searches authorized agricultural input shops, PACCS cooperatives, KVK sales counters,
    and licensed private dealers with calculated distance and verified inventory.
    """
    shops = await RetailerService.search_shops(
        db,
        district=district,
        query=query,
        pincode=pincode,
        user_lat=lat,
        user_lng=lng,
        max_distance_km=max_distance_km
    )
    return {
        "success": True,
        "count": len(shops),
        "data": shops
    }

@router.get("/{shop_id}/inventory")
async def get_shop_inventory_details(shop_id: str, db: AsyncSession = Depends(get_db)):
    """
    Retrieves a specific shop's product inventory, package sizes, stock status,
    and verified price or contact inquiry advisory.
    """
    stmt = (
        select(AgriShop)
        .filter(AgriShop.id == shop_id)
        .options(selectinload(AgriShop.inventories).selectinload(ShopInventory.product))
    )
    result = await db.execute(stmt)
    shop = result.scalars().first()
    if not shop:
        raise HTTPException(status_code=404, detail="Agricultural shop not found.")

    items = []
    for inv in shop.inventories:
        p = inv.product
        items.append({
            "inventory_id": inv.id,
            "product_id": inv.product_id,
            "product_name": p.name if p else "Agro Product",
            "active_ingredient": p.active_ingredient if p else "",
            "category": p.category if p else "Fungicide",
            "package_size": inv.package_size,
            "price_inr": inv.price_inr if inv.price_verified else None,
            "price_verified": inv.price_verified,
            "price_display": f"₹{inv.price_inr:.2f}" if (inv.price_verified and inv.price_inr is not None) else "Price or availability not verified",
            "stock_status": inv.stock_status,
            "stock_verified": inv.stock_verified,
            "last_verified_date": inv.last_verified_date,
            "notes": inv.notes
        })

    return {
        "success": True,
        "shop": {
            "id": shop.id,
            "name": shop.name,
            "type": shop.type,
            "license_number": shop.license_number,
            "district": shop.district,
            "taluk_or_town": shop.taluk_or_town,
            "address": shop.address,
            "phone": shop.phone,
            "whatsapp": shop.whatsapp,
            "operating_hours": shop.operating_hours,
            "verified_status": shop.verified_status,
            "last_verified_date": shop.last_verified_date
        },
        "inventory": items
    }
