from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.database import get_db
from app.db.models import MarketPrice

router = APIRouter(prefix="/market", tags=["Market Prices"])

@router.get("/")
async def get_market_prices(crop: str = "Tomato", db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MarketPrice).filter(MarketPrice.crop == crop))
    prices = result.scalars().all()
    output = []
    for p in prices:
        output.append({
            "id": p.id,
            "crop": p.crop,
            "market_name": p.market_name,
            "district": p.district,
            "state": p.state,
            "price_per_kg": p.price_per_kg,
            "min_price": p.min_price,
            "max_price": p.max_price,
            "price_trend_7d": p.price_trend_7d,
            "updated_at": p.updated_at.strftime("%Y-%m-%d") if p.updated_at else ""
        })
    return {"success": True, "data": output}
