# 🌿 CropGuard AI — Offline-First, Explainable AI Crop Doctor

### *"See. Diagnose. Act. Protect."*

CropGuard AI is a production-quality agricultural decision-support platform designed to help farmers diagnose crop diseases, analyze weather suitability before applying treatments, receive explainable AI attention visualisations (Grad-CAM), consult grounded agricultural assistants, and track field health—even when completely offline.

---

## 🌟 Key Features

1. **📷 Crop Scanner with Real-Time Quality Engine**
   - Detects image defects (blur, darkness, distance, leaf visibility) *before* running disease diagnosis.
   - Prevents invalid predictions on bad photographs.

2. **🧠 Confidence-Aware AI & Severity Estimation**
   - Evaluates diagnosis confidence (`HIGH` ≥ 85%, `MEDIUM` 60–85%, `LOW` < 60%).
   - When AI confidence is low (<60%), refuses definitive diagnosis and presents top 3 alternative matches.

3. **🔍 Explainable AI (Grad-CAM Attention Map)**
   - Displays interactive Grad-CAM heatmaps overlaying damaged leaf spots to show *why* the AI predicted a specific disease.

4. **🌧️ Weather-Aware Spray Window Advice**
   - Integrates live Open-Meteo weather data.
   - Issues warnings (e.g. `⚠️ DO NOT SPRAY TODAY - 82% rain probability`) to avoid chemical waste and environmental runoff.

5. **🌿 Verified Agricultural Knowledge Base**
   - Grounded in verified TNAU (Tamil Nadu Agricultural University) & ICAR Krishi Vigyan Kendra guidance.
   - Authoritative organic & chemical treatments with exact active ingredients, dosage, application timing, and pre-harvest intervals (PHI).

6. **🌐 Offline-First Architecture & Sync Engine**
   - Full PWA capabilities backed by IndexedDB storage.
   - Captures and saves crop scans offline with client UUIDs (`SAVED_OFFLINE`).
   - Automatically synchronizes idempotently (`SYNCING` -> `SYNCED`) when internet connection is restored.

7. **🗣️ Multilingual & Voice Assistant (RAG)**
   - Supports **English, Tamil (தமிழ்), and Hindi (हिंदी)**.
   - Voice input (microphone) and Read-Aloud text-to-speech.
   - AI assistant grounded in verified knowledge documents; refuses hazardous dosage hallucinations.

8. **📡 Outbreak Intelligence & Risk Prediction**
   - Aggregates spatial scan clusters to detect disease outbreaks.
   - Predicts disease risk score based on humidity, temperature, and local scan density.

9. **🩺 Agricultural Expert Review Queue**
   - Automatically escalates low-confidence (<60%) or severe cases to human pathologists for verification.

10. **🏛️ Officer Command Dashboard**
    - Aggregated district outbreak heatmaps, weekly disease trend charts (Recharts), broadcast alert system, and CSV report export.

---

## 🏗️ Architecture Pipeline

```
PHOTO → IMAGE QUALITY ENGINE → VISION AI MODEL → CONFIDENCE ENGINE → SEVERITY ESTIMATOR → GRAD-CAM EXPLAINABILITY → VERIFIED KNOWLEDGE BASE → WEATHER ENGINE → PERSONALIZED RECOMMENDATION
```

---

## 🚀 Quick Start Instructions

### Prerequisites
- Python 3.11+
- Node.js v20+ / NPM v10+

### 1. Backend Setup (FastAPI + SQLite/SQLAlchemy)

```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
pip install -r requirements.txt
pip install greenlet

# Seed initial verified database:
python -m app.db.seed

# Run backend API server:
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at: `http://localhost:8000/docs`

### 2. Frontend Setup (Vite + React + TypeScript + Tailwind CSS)

```bash
cd frontend
npm install
npm run dev
```
Open application at: `http://localhost:5173`

---

## 🧪 Automated Testing

### Backend Unit & Safety Tests
Run automated safety tests verifying low-confidence fallbacks, weather spray warnings, RAG safety refusals, and image quality checks:

```bash
cd backend
.\venv\Scripts\python -m pytest -o pythonpath=.
```

---

## 📜 Demo Script Walkthrough
For step-by-step demonstration instructions, consult [`docs/demo-script.md`](file:///c:/Users/rosha/Documents/Cropguard/docs/demo-script.md).
