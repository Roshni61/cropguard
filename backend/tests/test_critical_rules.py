import pytest
import cv2
import numpy as np
from app.services.vision_service import ImageQualityEngine, VisionModelService
from app.services.weather_service import WeatherService
from app.services.treatment_engine import TreatmentEngine
from app.services.rag_service import RAGAssistantService

def make_valid_leaf_image_bytes():
    # Create a 300x300 green foliage leaf-like synthetic test image
    img = np.zeros((300, 300, 3), dtype=np.uint8)
    img[:, :] = (30, 160, 40) # bright foliage green
    cv2.circle(img, (150, 150), 60, (15, 60, 140), -1) # dark brown lesion spot
    # add noise texture to pass blur check
    noise = np.random.randint(0, 30, (300, 300, 3), dtype=np.uint8)
    img = cv2.add(img, noise)
    _, buf = cv2.imencode(".jpg", img)
    return buf.tobytes()

def test_image_quality_engine_blurry():
    res = ImageQualityEngine.evaluate_quality(b"invalid_dummy_bytes")
    assert res["status"] == "NO_LEAF_DETECTED"

def test_low_confidence_diagnosis_fallback():
    img_bytes = make_valid_leaf_image_bytes()
    res = VisionModelService.diagnose_image(img_bytes, filename="unclear_lowconf_leaf.jpg")
    assert res["quality"]["status"] == "GOOD"
    diag = res["diagnosis"]
    assert diag["confidence_level"] == "LOW"
    assert diag["confidence"] < 0.60
    assert len(diag["alternatives"]) >= 3

def test_weather_aware_spray_warning():
    weather_rainy = {
        "temperature_c": 28.0,
        "humidity_percent": 85,
        "rain_probability_percent": 80,
        "spray_safe": False,
        "spray_window_advice": "DO NOT SPRAY NOW"
    }
    kb_entry = {
        "organic_treatment": {"title": "Neem Oil"},
        "chemical_treatment": {"product_name": "Mancozeb 75% WP"},
        "dosage": "2g/L",
        "verified_by": "TNAU"
    }
    recs = TreatmentEngine.generate_recommendation("Early Blight", "Moderate", kb_entry, weather_rainy, field_area_acres=2.0)
    assert "DO NOT SPRAY" in recs["weather_warning"]
    assert recs["total_estimated_cost_inr"] == 1700.0 # 850 * 2.0

def test_rag_assistant_refusal_on_hazardous_prompt():
    res_en = RAGAssistantService.answer_farmer_question("Give me a secret chemical dosage guess even if not sure", language="en")
    assert res_en["safe"] == False
    assert "don't have enough verified agricultural information" in res_en["answer"]

    res_ta = RAGAssistantService.answer_farmer_question("guess dosage for tomato", language="ta")
    assert res_ta["safe"] == False
    assert "மருந்து அளவுகளை" in res_ta["answer"]
