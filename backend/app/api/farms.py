from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.database import get_db
from app.db.models import Farm, Field, User
from app.security.auth import get_current_user

router = APIRouter(prefix="/farms", tags=["Farms & Fields"])

class FieldCreate(BaseModel):
    name: str
    area: float = 1.0
    crop: str = "Tomato"
    variety: Optional[str] = "Arka Rakshak"
    crop_stage: Optional[str] = "Vegetative"
    soil_type: Optional[str] = "Red Loam"
    irrigation_type: Optional[str] = "Drip Irrigation"

class FarmCreate(BaseModel):
    name: str
    location_lat: Optional[float] = 11.0168
    location_lng: Optional[float] = 76.9558
    address: Optional[str] = "Coimbatore, Tamil Nadu"
    total_area: float = 2.5
    fields: Optional[List[FieldCreate]] = []
    # user_id is optional and NEVER trusted from client
    user_id: Optional[str] = None

@router.get("/")
@router.get("/my")
async def get_my_farms(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve farms owned strictly by the authenticated user."""
    return await _get_farms_for_user(current_user.id, db)

@router.get("/user/{user_id}")
async def get_user_farms(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Ensure user_id belongs strictly to the authenticated user.
    Reject cross-user requests with 404 to avoid leaking existence of records.
    """
    if user_id != current_user.id and current_user.role not in ["SYS_ADMIN", "DISTRICT_ADMIN", "FIELD_OFFICER"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm records not found."
        )
    return await _get_farms_for_user(user_id, db)

@router.get("/{farm_id}")
async def get_farm_by_id(
    farm_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve single farm if and only if owned by the authenticated user."""
    result = await db.execute(select(Farm).filter(Farm.id == farm_id))
    farm = result.scalars().first()
    if not farm or (farm.user_id != current_user.id and current_user.role not in ["SYS_ADMIN", "DISTRICT_ADMIN", "FIELD_OFFICER"]):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found."
        )
    
    f_res = await db.execute(select(Field).filter(Field.farm_id == farm.id))
    fields = f_res.scalars().all()
    return {
        "success": True,
        "data": {
            "id": farm.id,
            "name": farm.name,
            "location_lat": farm.location_lat,
            "location_lng": farm.location_lng,
            "total_area": farm.total_area,
            "fields": [
                {
                    "id": f.id,
                    "name": f.name,
                    "area": f.area,
                    "crop": f.crop,
                    "variety": f.variety,
                    "crop_stage": f.crop_stage,
                    "soil_type": f.soil_type,
                    "irrigation_type": f.irrigation_type,
                    "health_score": f.health_score
                } for f in fields
            ]
        }
    }

@router.post("/")
async def create_farm(
    farm_in: FarmCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a farm, strictly binding it to current_user.id."""
    new_farm = Farm(
        user_id=current_user.id,
        name=farm_in.name,
        location_lat=farm_in.location_lat,
        location_lng=farm_in.location_lng,
        address=farm_in.address,
        total_area=farm_in.total_area
    )
    db.add(new_farm)
    await db.commit()
    await db.refresh(new_farm)

    if farm_in.fields:
        for f_data in farm_in.fields:
            new_field = Field(
                farm_id=new_farm.id,
                name=f_data.name,
                area=f_data.area,
                crop=f_data.crop,
                variety=f_data.variety,
                crop_stage=f_data.crop_stage,
                soil_type=f_data.soil_type,
                irrigation_type=f_data.irrigation_type
            )
            db.add(new_field)
        await db.commit()

    return {"success": True, "data": {"id": new_farm.id, "name": new_farm.name}}

async def _get_farms_for_user(user_id: str, db: AsyncSession):
    result = await db.execute(select(Farm).filter(Farm.user_id == user_id))
    farms = result.scalars().all()
    
    farms_data = []
    for farm in farms:
        f_res = await db.execute(select(Field).filter(Field.farm_id == farm.id))
        fields = f_res.scalars().all()
        farms_data.append({
            "id": farm.id,
            "name": farm.name,
            "location_lat": farm.location_lat,
            "location_lng": farm.location_lng,
            "total_area": farm.total_area,
            "fields": [
                {
                    "id": f.id,
                    "name": f.name,
                    "area": f.area,
                    "crop": f.crop,
                    "variety": f.variety,
                    "crop_stage": f.crop_stage,
                    "soil_type": f.soil_type,
                    "irrigation_type": f.irrigation_type,
                    "health_score": f.health_score
                } for f in fields
            ]
        })
    return {"success": True, "data": farms_data}
