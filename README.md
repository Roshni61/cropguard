# 🌿 CropGuard AI — Protect Your Crops. Empower Your Harvest.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-CropGuard%20AI%20Platform-123B2A?style=for-the-badge&logo=vercel&logoColor=C5F078)](https://cropguard.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Roshni61%2Fcropguard-181717?style=for-the-badge&logo=github)](https://github.com/Roshni61/cropguard)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

---

### 📌 Live Deployment & Production Links

- 🌐 **Live Website**: [https://cropguard.vercel.app](https://cropguard.vercel.app)
- 💻 **GitHub Repository**: [https://github.com/Roshni61/cropguard](https://github.com/Roshni61/cropguard)
- ⚙️ **Backend API**: [https://cropguard-backend.onrender.com/api/v1](https://cropguard-backend.onrender.com/api/v1) *(or local `http://localhost:8000/api/v1`)*
- 📖 **API Documentation**: [https://cropguard-backend.onrender.com/docs](https://cropguard-backend.onrender.com/docs) *(or local `http://localhost:8000/docs`)*

---

## 🌾 About CropGuard AI

**CropGuard AI** is a production-grade agricultural decision-support platform designed to help farmers diagnose crop diseases, analyze weather suitability before applying treatments, receive explainable AI visualisations (Grad-CAM), consult grounded agricultural assistants, and track field health—even when completely offline.

---

## 🌟 Key Features

1. **🏡 Premium Landing Page & Role Portals**
   - Professional landing page (*"Protect Your Crops. Empower Your Harvest."*) with feature highlights, 3-step workflow, and farmer benefits.
   - Dedicated user role dashboards for **Farmers**, **Plant Pathology Experts**, and **District Agriculture Officers**.

2. **🔐 Authentication & Role-Based Access Control**
   - Secure phone/email registration and login powered by FastAPI, SQLite/SQLAlchemy, and JWT bearer tokens.

3. **📷 Crop Scanner with Real-Time Quality Engine**
   - Detects image defects (blur, darkness, distance, leaf visibility) *before* running disease diagnosis.
   - Prevents invalid predictions on bad photographs.

4. **🧠 Confidence-Aware AI & Severity Estimation**
   - Evaluates diagnosis confidence (`HIGH` ≥ 85%, `MEDIUM` 60–85%, `LOW` < 60%).
   - When AI confidence is low (<60%), refuses definitive diagnosis and presents top 3 alternative matches.

5. **🔍 Explainable AI (Grad-CAM Attention Map)**
   - Displays interactive Grad-CAM heatmaps overlaying damaged leaf spots to show *why* the AI predicted a specific disease.

6. **🌧️ Weather-Aware Spray Window Advice**
   - Integrates live Open-Meteo weather data.
   - Issues warnings (e.g. `⚠️ DO NOT SPRAY TODAY - 82% rain probability`) to avoid chemical waste and environmental runoff.

7. **🌿 Verified Agricultural Knowledge Base**
   - Grounded in verified TNAU (Tamil Nadu Agricultural University) & ICAR Krishi Vigyan Kendra guidance.
   - Authoritative organic & chemical treatments with exact active ingredients, dosage, application timing, and pre-harvest intervals (PHI).

8. **🤖 Multilingual Voice & AI Assistant (Gemini + RAG)**
   - Supports **English, Tamil (தமிழ்), and Hindi (हिंदी)**.
   - Voice input (microphone) and Read-Aloud text-to-speech.
   - Optional Google Gemini AI model integration with fallback to verified RAG knowledge base.

9. **🌐 Offline-First Architecture & Sync Engine**
   - Full PWA capabilities backed by IndexedDB storage.
   - Captures and saves crop scans offline with client UUIDs (`SAVED_OFFLINE`).
   - Automatically synchronizes idempotently (`SYNCING` -> `SYNCED`) when internet connection is restored.

10. **📡 Outbreak Intelligence & Officer Command**
    - Aggregates spatial scan clusters to detect disease outbreaks.
    - District outbreak heatmaps, weekly disease trend charts (Recharts), broadcast alert system, and CSV report export.

---

## 🛠️ Technology Stack

| Layer | Technology Used |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite 8 |
| **Styling & Motion** | Tailwind CSS v4, `@tailwindcss/vite`, Framer Motion, Lucide React |
| **Offline Storage** | IndexedDB (`idb` library) |
| **Backend API** | Python 3.11, FastAPI, Uvicorn |
| **Database & ORM** | SQLite, SQLAlchemy Async, Pydantic v2 |
| **AI & RAG Engine** | Google Gen AI SDK (`google-genai`), Custom Grounded RAG Service |
| **Deployment** | Vercel (Frontend), Render / Railway (Backend) |

---

## 🏗️ Architecture Pipeline

```
PHOTO → IMAGE QUALITY ENGINE → VISION AI MODEL → CONFIDENCE ENGINE → SEVERITY ESTIMATOR → GRAD-CAM EXPLAINABILITY → VERIFIED KNOWLEDGE BASE → WEATHER ENGINE → PERSONALIZED RECOMMENDATION
```

---

## 🚀 Environment Setup & Local Installation

### 1. Environment Variables

#### Frontend Configuration (`frontend/.env`)
```ini
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

#### Backend Configuration (`backend/.env`)
```ini
PROJECT_NAME=CropGuard AI
API_V1_STR=/api/v1
JWT_SECRET=cropguard_super_secret_jwt_key_2026_safe
DATABASE_URL=sqlite+aiosqlite:///./cropguard.db
SYNC_DATABASE_URL=sqlite:///./cropguard.db

# Optional Gemini AI Assistant Integration
GEMINI_API_KEY=
```

---

### 2. Quick Start Instructions

#### Prerequisites
- Python 3.11+
- Node.js v20+ / NPM v10+

#### Step A: Backend Setup (FastAPI)

```bash
cd backend
python -m venv venv

# On Windows PowerShell:
.\venv\Scripts\activate

# Install dependencies:
pip install -r requirements.txt

# Run FastAPI backend server:
uvicorn app.main:app --reload --port 8000
```
- API Documentation: `http://localhost:8000/docs`

#### Step B: Frontend Setup (Vite + React)

```bash
cd frontend
npm install
npm run dev
```
- Open application at: `http://localhost:5173`

---

## 🌐 Deploying to Vercel

1. Push code to GitHub: `https://github.com/Roshni61/cropguard.git`
2. Import project into Vercel dashboard ([vercel.com/new](https://vercel.com/new)).
3. Set **Root Directory** to `frontend`.
4. Set **Build Command** to `npm run build` and **Output Directory** to `dist`.
5. Add Environment Variable `VITE_API_BASE_URL` pointing to your deployed backend URL.
6. Click **Deploy**.

---

## 🧪 Automated Testing

Run automated safety tests verifying low-confidence fallbacks, weather spray warnings, RAG safety refusals, and image quality checks:

```bash
cd backend
.\venv\Scripts\python -m pytest -o pythonpath=.
```

---

## 📜 Walkthrough & Documentation
For demonstration steps, consult [`docs/demo-script.md`](file:///c:/Users/rosha/Documents/Cropguard/docs/demo-script.md).
