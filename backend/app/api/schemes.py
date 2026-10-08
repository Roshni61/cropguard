from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.database import get_db
from app.db.models import GovernmentScheme

router = APIRouter(prefix="/schemes", tags=["Government Schemes"])

@router.get("/")
async def get_schemes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GovernmentScheme))
    schemes = result.scalars().all()
    output = []
    for s in schemes:
        output.append({
            "id": s.id,
            "title": s.title,
            "category": s.category,
            "description": s.description,
            "eligibility": s.eligibility,
            "subsidy_percentage": s.subsidy_percentage,
            "application_link": s.application_link,
            "source": s.source
        })
    return {"success": True, "data": output}
