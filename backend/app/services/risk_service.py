from typing import List, Dict, Any

class RiskPredictionService:
    @staticmethod
    def calculate_disease_risk(
        crop: str,
        district: str,
        weather: Dict[str, Any],
        recent_scans_count: int = 14
    ) -> Dict[str, Any]:
        """
        Calculates disease risk percentage based on temperature, humidity, rainfall, and local scan density.
        """
        temp = weather.get("temperature_c", 28.0)
        humidity = weather.get("humidity_percent", 75)
        rain_prob = weather.get("rain_probability_percent", 20)

        # Early Blight / Fungal disease risk score calculation (0 to 100%)
        risk_score = 30 # baseline
        
        if humidity > 70:
            risk_score += 25
        if rain_prob > 50:
            risk_score += 20
        if 20.0 <= temp <= 30.0:
            risk_score += 15
        if recent_scans_count > 10:
            risk_score += 10

        risk_score = min(95, risk_score)

        if risk_score >= 75:
            level = "HIGH"
            advisory = f"⚠️ High Early Blight Risk ({risk_score}%) in {district}. Warm temperatures ({temp}°C) and high humidity ({humidity}%) create ideal conditions for fungal spore spread."
        elif risk_score >= 50:
            level = "MEDIUM"
            advisory = f"🟡 Moderate Disease Risk ({risk_score}%) in {district}. Inspect foliage daily for brown leaf spots."
        else:
            level = "LOW"
            advisory = f"🟢 Low Disease Risk ({risk_score}%) in {district}. Maintain regular crop monitoring."

        return {
            "crop": crop,
            "district": district,
            "risk_score_percent": risk_score,
            "risk_level": level,
            "contributing_factors": [
                f"High relative humidity ({humidity}%)",
                f"Rainfall probability ({rain_prob}%)",
                f"Cluster cases in district: {recent_scans_count} scans in last 7 days"
            ],
            "advisory": advisory
        }
