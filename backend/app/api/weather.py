from fastapi import APIRouter, Query
from app.services.weather_service import WeatherService

router = APIRouter(prefix="/weather", tags=["Weather"])

@router.get("/")
async def get_weather(lat: float = Query(11.0168), lng: float = Query(76.9558)):
    weather_data = await WeatherService.get_weather(lat, lng)
    return {"success": True, "data": weather_data}
