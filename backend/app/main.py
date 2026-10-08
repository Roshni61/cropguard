from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import auth, farms, scans, treatments, weather, risk, chat, experts, officer, market, schemes, sync

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Offline-First, Explainable AI Crop Doctor & Agricultural Intelligence Platform",
    version="1.0.0"
)

# CORS configuration for local dev and PWA frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(farms.router, prefix=settings.API_V1_STR)
app.include_router(scans.router, prefix=settings.API_V1_STR)
app.include_router(treatments.router, prefix=settings.API_V1_STR)
app.include_router(weather.router, prefix=settings.API_V1_STR)
app.include_router(risk.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(experts.router, prefix=settings.API_V1_STR)
app.include_router(officer.router, prefix=settings.API_V1_STR)
app.include_router(market.router, prefix=settings.API_V1_STR)
app.include_router(schemes.router, prefix=settings.API_V1_STR)
app.include_router(sync.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "title": "CropGuard AI API",
        "tagline": "See. Diagnose. Act. Protect.",
        "status": "ONLINE",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "CropGuard Backend"}
