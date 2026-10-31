import math
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.db.models import AgriProduct, AgriShop, ShopInventory

def calculate_distance_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculates great-circle distance between two GPS coordinates using Haversine formula."""
    try:
        R = 6371.0  # Earth radius in kilometers
        d_lat = math.radians(lat2 - lat1)
        d_lng = math.radians(lng2 - lng1)
        a = (
            math.sin(d_lat / 2.0) ** 2
            + math.cos(math.radians(lat1))
            * math.cos(math.radians(lat2))
            * math.sin(d_lng / 2.0) ** 2
        )
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return round(R * c, 1)
    except Exception:
        return 0.0

class RetailerService:
    """
    Configurable Provider Integration for verified crop-protection products
    and licensed local agricultural retailer inventory.
    Adheres strictly to CIBRC & TNAU statutory guidelines.
    """

    @staticmethod
    async def get_verified_products(
        db: AsyncSession,
        crop: Optional[str] = None,
        disease: Optional[str] = None,
        category: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        stmt = select(AgriProduct)
        result = await db.execute(stmt)
        products = result.scalars().all()

        output = []
        for p in products:
            # Crop match filter
            if crop and crop.lower() != "all":
                target_crops_lower = [c.lower() for c in (p.target_crops or [])]
                if crop.lower() not in target_crops_lower and "all" not in target_crops_lower:
                    continue

            # Disease match filter (strict: never assume suitability merely because similar)
            if disease and disease.lower() != "all":
                target_diseases_lower = [d.lower() for d in (p.target_diseases or [])]
                disease_matched = any(
                    disease.lower() in td or td in disease.lower()
                    for td in target_diseases_lower
                )
                if not disease_matched:
                    continue

            # Category filter
            if category and category.lower() != "all":
                if p.category.lower() != category.lower():
                    continue

            # Search text filter
            if search:
                s_lower = search.lower()
                in_name = s_lower in p.name.lower()
                in_active = s_lower in p.active_ingredient.lower()
                in_mfr = s_lower in p.manufacturer.lower()
                if not (in_name or in_active or in_mfr):
                    continue

            output.append({
                "id": p.id,
                "name": p.name,
                "active_ingredient": p.active_ingredient,
                "category": p.category,
                "manufacturer": p.manufacturer,
                "target_crops": p.target_crops or [],
                "target_diseases": p.target_diseases or [],
                "approved_usage_and_label": p.approved_usage_and_label,
                "safety_precautions": p.safety_precautions,
                "pre_harvest_interval_days": p.pre_harvest_interval_days,
                "registration_number": p.registration_number,
                "verified_source": p.verified_source,
                "last_verified_date": p.last_verified_date,
            })
        return output

    @staticmethod
    async def get_product_by_id(db: AsyncSession, product_id: str) -> Optional[Dict[str, Any]]:
        stmt = select(AgriProduct).filter(AgriProduct.id == product_id)
        result = await db.execute(stmt)
        p = result.scalars().first()
        if not p:
            return None
        return {
            "id": p.id,
            "name": p.name,
            "active_ingredient": p.active_ingredient,
            "category": p.category,
            "manufacturer": p.manufacturer,
            "target_crops": p.target_crops or [],
            "target_diseases": p.target_diseases or [],
            "approved_usage_and_label": p.approved_usage_and_label,
            "safety_precautions": p.safety_precautions,
            "pre_harvest_interval_days": p.pre_harvest_interval_days,
            "registration_number": p.registration_number,
            "verified_source": p.verified_source,
            "last_verified_date": p.last_verified_date,
        }

    @staticmethod
    async def search_shops(
        db: AsyncSession,
        district: Optional[str] = None,
        query: Optional[str] = None,
        pincode: Optional[str] = None,
        user_lat: Optional[float] = None,
        user_lng: Optional[float] = None,
        max_distance_km: float = 60.0
    ) -> List[Dict[str, Any]]:
        stmt = select(AgriShop).options(selectinload(AgriShop.inventories).selectinload(ShopInventory.product))
        result = await db.execute(stmt)
        shops = result.scalars().all()

        output = []
        for s in shops:
            # District filter
            if district and district.lower() != "all":
                if s.district.lower() != district.lower():
                    continue

            # Pincode filter
            if pincode and pincode.strip():
                if s.pincode and pincode.strip() != s.pincode:
                    continue

            # Query filter (matches shop name, town, or address)
            if query and query.strip():
                q_lower = query.lower().strip()
                in_name = q_lower in s.name.lower()
                in_town = q_lower in s.taluk_or_town.lower()
                in_addr = q_lower in s.address.lower()
                if not (in_name or in_town or in_addr):
                    continue

            # Distance calculation if coordinates available
            distance_km = None
            if user_lat is not None and user_lng is not None and s.latitude and s.longitude:
                distance_km = calculate_distance_km(user_lat, user_lng, s.latitude, s.longitude)
                if max_distance_km and distance_km > max_distance_km:
                    continue

            # Inventory mapping with strict verification flags
            inv_list = []
            for inv in s.inventories:
                prod = inv.product
                inv_list.append({
                    "inventory_id": inv.id,
                    "product_id": inv.product_id,
                    "product_name": prod.name if prod else "Agro Product",
                    "active_ingredient": prod.active_ingredient if prod else "",
                    "category": prod.category if prod else "Fungicide",
                    "package_size": inv.package_size,
                    "price_inr": inv.price_inr if inv.price_verified else None,
                    "price_verified": inv.price_verified,
                    "price_display": f"₹{inv.price_inr:.2f}" if (inv.price_verified and inv.price_inr is not None) else "Price or availability not verified",
                    "stock_status": inv.stock_status,
                    "stock_verified": inv.stock_verified,
                    "last_verified_date": inv.last_verified_date,
                    "notes": inv.notes or ("Call shop to verify current counter stock" if not inv.stock_verified else None)
                })

            output.append({
                "id": s.id,
                "name": s.name,
                "type": s.type,
                "license_number": s.license_number,
                "district": s.district,
                "taluk_or_town": s.taluk_or_town,
                "pincode": s.pincode,
                "address": s.address,
                "latitude": s.latitude,
                "longitude": s.longitude,
                "phone": s.phone,
                "whatsapp": s.whatsapp,
                "operating_hours": s.operating_hours,
                "verified_status": s.verified_status,
                "last_verified_date": s.last_verified_date,
                "distance_km": distance_km,
                "inventory": inv_list
            })

        # Sort by distance if calculated, else by verified status
        if user_lat is not None and user_lng is not None:
            output.sort(key=lambda x: (x["distance_km"] if x["distance_km"] is not None else 9999.0))
        else:
            output.sort(key=lambda x: x["name"])

        return output

    @staticmethod
    async def get_product_availability(
        db: AsyncSession,
        product_id: str,
        district: Optional[str] = None,
        pincode: Optional[str] = None,
        user_lat: Optional[float] = None,
        user_lng: Optional[float] = None
    ) -> Dict[str, Any]:
        """Returns availability of a specific product across all local shops."""
        prod = await RetailerService.get_product_by_id(db, product_id)
        if not prod:
            return {"success": False, "detail": "Product not found in authorized register"}

        stmt = (
            select(ShopInventory)
            .filter(ShopInventory.product_id == product_id)
            .options(selectinload(ShopInventory.shop))
        )
        result = await db.execute(stmt)
        inventories = result.scalars().all()

        shop_availability = []
        for inv in inventories:
            shop = inv.shop
            if not shop:
                continue

            if district and district.lower() != "all" and shop.district.lower() != district.lower():
                continue

            if pincode and pincode.strip() and shop.pincode and pincode.strip() != shop.pincode:
                continue

            distance_km = None
            if user_lat is not None and user_lng is not None and shop.latitude and shop.longitude:
                distance_km = calculate_distance_km(user_lat, user_lng, shop.latitude, shop.longitude)

            shop_availability.append({
                "shop_id": shop.id,
                "shop_name": shop.name,
                "shop_type": shop.type,
                "license_number": shop.license_number,
                "district": shop.district,
                "town": shop.taluk_or_town,
                "address": shop.address,
                "phone": shop.phone,
                "whatsapp": shop.whatsapp,
                "distance_km": distance_km,
                "package_size": inv.package_size,
                "price_inr": inv.price_inr if inv.price_verified else None,
                "price_verified": inv.price_verified,
                "price_display": f"₹{inv.price_inr:.2f}" if (inv.price_verified and inv.price_inr is not None) else "Price or availability not verified",
                "stock_status": inv.stock_status,
                "stock_verified": inv.stock_verified,
                "last_verified_date": inv.last_verified_date,
                "notes": inv.notes
            })

        if user_lat is not None and user_lng is not None:
            shop_availability.sort(key=lambda x: (x["distance_km"] if x["distance_km"] is not None else 9999.0))

        return {
            "success": True,
            "product": prod,
            "availability": shop_availability,
            "total_shops_stocking": len(shop_availability)
        }
