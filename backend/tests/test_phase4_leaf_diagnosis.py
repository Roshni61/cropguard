import io
import numpy as np
import cv2
import pytest
from pydantic import ValidationError
from app.services.vision_service import (
    VisionModelService,
    ImageQualityEngine,
    SymptomRegionDetector
)
from app.services.treatment_engine import TreatmentEngine
from app.api.experts import EscalateRequest

def create_synthetic_leaf(texture_noise=True, dark=False, blur=False):
    img = np.full((320, 320, 3), (35, 140, 45), dtype=np.uint8)
    if texture_noise:
        noise = np.random.randint(-25, 25, (320, 320, 3), dtype=np.int16)
        img = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    # Add dark necrotic lesion
    cv2.circle(img, (160, 160), 45, (20, 40, 50), -1)
    cv2.circle(img, (160, 160), 55, (30, 190, 200), 2)
    if dark:
        img = np.clip(img.astype(np.float32) * 0.15, 0, 255).astype(np.uint8)
    if blur:
        img = cv2.GaussianBlur(img, (31, 31), 0)
    _, buf = cv2.imencode(".jpg", img)
    return buf.tobytes()

def test_cotton_and_banana_treatments():
    weather_ok = {"temperature_c": 27.0, "humidity_percent": 65, "rain_probability_percent": 10, "spray_safe": True}
    
    # Cotton Bacterial Blight
    cotton_recs = TreatmentEngine.generate_recommendation("Cotton", "Bacterial Blight / Angular Leaf Spot", "Moderate", weather=weather_ok)
    assert "chemical_options" in cotton_recs
    chem_str = str(cotton_recs.get("chemical_options", []))
    assert "Copper" in chem_str or "Streptocycline" in chem_str
    assert len(cotton_recs.get("preventive_measures", [])) > 0
    assert "differential_factors_note" in cotton_recs
    assert "deficiency" in cotton_recs["differential_factors_note"].lower()
    
    # Banana Sigatoka
    banana_recs = TreatmentEngine.generate_recommendation("Banana", "Sigatoka Leaf Spot", "Moderate", weather=weather_ok)
    assert len(banana_recs.get("preventive_measures", [])) > 0
    assert "label_compliance_disclaimer" in banana_recs

def test_low_confidence_prevents_chemical_prescriptions():
    weather_ok = {"temperature_c": 27.0, "humidity_percent": 65, "rain_probability_percent": 10, "spray_safe": True}
    low_conf_recs = TreatmentEngine.generate_recommendation(
        "Tomato", 
        "Early Blight", 
        "Moderate", 
        weather=weather_ok, 
        is_low_confidence=True
    )
    assert low_conf_recs["status"] == "UNCERTAIN"
    assert len(low_conf_recs["chemical_options"]) == 0
    assert "no chemical treatment is prescribed" in low_conf_recs["immediate_action"].lower()

def test_symptom_region_detector_extracts_real_boxes():
    img_bytes = create_synthetic_leaf(texture_noise=True)
    regions = SymptomRegionDetector.detect_symptom_regions(img_bytes)
    assert isinstance(regions, list)
    assert len(regions) >= 1
    assert "x_percent" in regions[0]
    assert "y_percent" in regions[0]
    assert "width_percent" in regions[0]
    assert "height_percent" in regions[0]
    assert "label" in regions[0]

def test_image_quality_engine_blurry():
    img_bytes = create_synthetic_leaf(texture_noise=False, blur=True)
    res = ImageQualityEngine.evaluate_quality(img_bytes)
    assert res["status"] in ["TOO_BLURRY", "NO_LEAF_DETECTED"]

def test_image_quality_engine_dark():
    img_bytes = create_synthetic_leaf(texture_noise=True, dark=True)
    res = ImageQualityEngine.evaluate_quality(img_bytes)
    assert res["status"] in ["TOO_DARK", "NO_LEAF_DETECTED"]

def test_vision_service_confidence_disclaimer_and_escalation():
    img_bytes = create_synthetic_leaf(texture_noise=True)
    result = VisionModelService.diagnose_image(
        img_bytes, 
        filename="cotton_leaf.jpg", 
        crop_hint="Cotton",
        district="Coimbatore",
        growth_stage="Flowering"
    )
    diag = result["diagnosis"]
    assert "confidence_disclaimer" in diag
    assert "guarantee" in diag["confidence_disclaimer"].lower()
    assert "expert_review_needed" in diag
    assert "symptom_regions" in diag

def test_expert_escalation_request_validation():
    req = EscalateRequest(
        scan_id="scn-test-123",
        farmer_consent=True,
        farmer_notes="Lesions appeared after continuous rainfall."
    )
    assert req.farmer_consent is True
    assert req.scan_id == "scn-test-123"
