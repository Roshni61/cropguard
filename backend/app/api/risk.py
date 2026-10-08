from fastapi import APIRouter, Query
from app.services.risk_service import RiskPredictionService
from app.services.weather_service import WeatherService

router = APIRouter(prefix="/risk", tags=["Disease Risk & Outbreak Intelligence"])

@router.get("/")
async def get_disease_risk(
    crop: str = Query("Tomato"),
    district: str = Query("Coimbatore"),
    lat: float = Query(11.0168),
    lng: float = Query(76.9558)
):
    weather = await WeatherService.get_weather(lat, lng)
    risk_info = RiskPredictionService.calculate_disease_risk(
        crop=crop,
        district=district,
        weather=weather,
        recent_scans_count=17
    )
    return {"success": True, "data": risk_info}
