# 🌿 CropGuard AI — Protect Your Crops. Empower Your Harvest.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-CropGuard%20AI%20Platform-123B2A?style=for-the-badge&logo=vercel&logoColor=C5F078)](https://cropguard-ochre.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Roshni61%2Fcropguard-181717?style=for-the-badge&logo=github)](https://github.com/Roshni61/cropguard)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

---

### 📌 Live Deployment & Production Links

- 🌐 **Live Web Application**: [https://cropguard-ochre.vercel.app](https://cropguard-ochre.vercel.app)
- 💻 **GitHub Repository**: [https://github.com/Roshni61/cropguard](https://github.com/Roshni61/cropguard)
- ⚙️ **Backend API**: [https://cropguard-c7tl.onrender.com/api/v1](https://cropguard-c7tl.onrender.com/api/v1) *(or local `http://localhost:8000/api/v1`)*
- 📖 **Interactive Swagger Docs**: [https://cropguard-c7tl.onrender.com/docs](https://cropguard-c7tl.onrender.com/docs) *(or local `http://localhost:8000/docs`)*

---

## 🌾 About CropGuard AI

**CropGuard AI** is a production-grade agricultural intelligence and decision-support platform designed for Indian farmers, certified agronomists, and district agricultural officers. The platform delivers instant foliar disease diagnosis with explainable AI (Grad-CAM heatmaps & lesion localization), weather-aware spray window safety, CIBRC-registered treatment product catalogs, local agricultural input availability, and a real-time WebRTC video/chat expert consultation clinic—operating seamlessly both online and offline.

---

## 🌟 Comprehensive Feature Set

### 1. 🔐 Multi-Role Authentication & 1-Click Demo Access
- **Role-Based Portals**: Tailored interfaces for **Farmers**, **Plant Pathology Experts**, and **District Agriculture Officers**.
- **Instant Demo Access**: Pre-provisioned demo accounts with full role permissions:
  - 👨‍🌾 **Farmer**: `farmer@cropguard.demo` / `Farmer@123`
  - 🔬 **Agricultural Expert**: `expert@cropguard.demo` / `Expert@123`
  - 🏛️ **District Officer**: `officer@cropguard.demo` / `Officer@123`
- **Dual Authentication**: Hybrid Supabase OAuth (Google/GitHub/Email) + FastAPI JWT with automated local session synchronization.

### 2. 📷 Leaf Scanner with Intelligent Quality Engine
- **Pre-Diagnostic Defect Prevention**: Assesses leaf photographs in real time before inference to detect blurriness, extreme underexposure, excessive distance, or missing foliage.
- **Multi-Device Capture**: Seamless mobile camera integration with rear/front switching and desktop drag-and-drop file upload.
- **Supported Crops**: Tailored computer vision models and reference datasets for Tomato, Paddy/Rice, Cotton, Banana, Chilli, and Potato.

### 3. 🧠 Confidence-Aware AI, Severity Estimation & Etiology
- **Calibrated Confidence Thresholds**: Categorized as `HIGH` (≥ 85%), `MEDIUM` (60–85%), or `LOW` (< 60%).
- **Safety First for Farmers**: When AI confidence is below 60%, the system refuses to issue unconfirmed chemical prescriptions, provides top alternative causes, and flags the case for expert verification.
- **Nutrient & Abiotic Stress Mimicry Notice**: Explains how visual symptoms (e.g. leaf yellowing, marginal necrosis) can also stem from physiological stress (nitrogen/potassium deficiency, soil salinity, water stagnation).

### 4. 🔍 Explainable AI (Grad-CAM Heatmaps & Lesion Bounding Boxes)
- **Interactive Visual Explainability**: Overlay Grad-CAM attention heatmaps showing *where* the neural network focused its diagnostic decision.
- **Bounding Box Lesion Localization**: Displays bounding boxes highlighting necrotic spots and chlorotic halos with toggle controls.
- **Simple-Language Farmer Summary**: Translates complex pathological terminology into actionable, straightforward advice.

### 5. 🛡️ 3-Step Hierarchical Treatment Framework
- **Step 1: Immediate Non-Chemical Actions & Field Hygiene (Always First)**: Cultural sanitation, pruning infected leaves, drip irrigation adjustments, and tool sterilization to arrest spore spread without chemical risk.
- **Step 2: Biological & Organic Controls**: Application rates for bio-agents (*Trichoderma viride*, *Pseudomonas fluorescens*, cold-pressed Neem Oil 1500 ppm).
- **Step 3: CIBRC-Approved Chemical Controls (When Verified)**: University-prescribed active ingredients (*Mancozeb 75% WP*, *Copper Oxychloride 50% WP*, *Propiconazole 25% EC*).
- **Statutory Caveats**: Pre-Harvest Intervals (PHI in days), Personal Protective Equipment (PPE) requirements, and small patch spray warnings. Never calculates or invents chemical dosages.

### 6. 🌧️ Weather-Aware Spray Window Intelligence
- **Microclimate Integration**: Real-time temperature, humidity, rainfall probability, and wind speed from Open-Meteo.
- **Intelligent Spray Safety Advisory**: Issues clear actionable alerts (e.g. `⚠️ DO NOT SPRAY NOW: Rain expected within 6 hours (82% probability)`) to avoid chemical wash-off and environmental damage.

### 7. 🏪 CIBRC-Verified Products & Local Agricultural Shop Directory
- **Official Agrochemical Catalog**: Commercial formulations registered with the Central Insecticides Board & Registration Committee (CIBRC) with toxicity classification triangles (Green, Blue, Yellow).
- **Local Input Retailers & Cooperatives**: Directory of licensed dealers, Primary Agricultural Cooperative Credit Societies (PACCS), and KVK sales counters across Tamil Nadu (Coimbatore, Thanjavur, Madurai, Salem).
- **GPS Distance Calculation**: Real-time Haversine radial distance calculation from user location or selected town.
- **Strict Verification Standards**: When live prices cannot be confirmed, explicitly displays `"Price or availability not verified"` and provides a direct click-to-call button to verify counter inventory.
- **Mandi Wholesale Rates & Govt Subsidies**: Live APMC commodity price trends and state agricultural subsidy guidance.

### 8. 📹 Expert Consultation System (WebRTC Video & Real-Time Chat)
- **Appointment Booking**: Farmers can describe symptoms, attach leaf scans with consent, choose between **Live Video Call** or **Real-Time Chat**, and pick an appointment slot.
- **Verified Expert Directory**: Accredited public specialists from Tamil Nadu Agricultural University (TNAU), ICAR-NRCB, and KVK with verified credentials, specializations, and languages (Tamil, English, Hindi).
- **Genuine HTML5 WebRTC Video Call**:
  - Peer-to-peer audio/video streaming via Google STUN servers (`stun:stun.l.google.com:19302`).
  - Camera & microphone permission handling with automated fallback to chat when video is unavailable.
  - In-room local self-view (picture-in-picture), remote full-frame stream, mute audio, toggle camera, and hang-up controls.
- **Persistent Real-Time Chat**: Persistent WebSocket connection with message history, macro photo zoom, and photo request notices.
- **Clinical Prescription Workflow**: Experts can request extra field photos, record clinical determinations, transmit verified prescriptions, and synchronize with the review queue.
- **Admin Verification Desk**: Workflow for administrators to verify, approve, or audit agricultural specialist accreditations.

### 9. 🤖 Multilingual Voice Assistant (CropGuard Kural)
- **Languages**: English, Tamil (தமிழ்), and Hindi (हिंदी).
- **Speech Capabilities**: Hands-free voice input and speech synthesis read-aloud for outdoor field accessibility.
- **Agricultural Grounding**: Powered by TNAU/ICAR agronomic knowledge with optional Google Gemini AI assistant fallback.

### 10. 🌐 Offline-First Architecture & Background Sync
- **PWA Ready**: Works offline in remote rural fields via IndexedDB local storage.
- **Queue & Sync**: Field scans recorded offline receive client UUIDs and sync idempotently to the backend when connectivity resumes.

### 11. 📡 District Outbreak Intelligence (Officer Command)
- **Spatial Outbreak Clusters**: Aggregates geo-located scans into epidemiological clusters.
- **Geographic Visualizations**: District hotspot mapping, weekly outbreak curves, broadcast advisory dispatch, and CSV audit export.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite 8 |
| **UI Styling & Motion** | Tailwind CSS v4, `@tailwindcss/vite`, Framer Motion, Lucide React |
| **Real-Time Video** | WebRTC (`RTCPeerConnection`), Google STUN (`stun:stun.l.google.com:19302`) |
| **Real-Time Messaging**| WebSockets (`ws://.../api/v1/consultations/ws/{room_id}`), REST Fallback |
| **Offline Storage** | IndexedDB (`idb` wrapper) |
| **Backend Framework** | Python 3.11, FastAPI, Uvicorn, Starlette |
| **Database & ORM** | SQLite, SQLAlchemy Async (`aiosqlite`), Pydantic v2 |
| **Authentication** | JWT Bearer Tokens, Passlib (bcrypt), Supabase Auth |
| **AI & Explainability** | Custom Vision Model Service, Grad-CAM Heatmap Synthesis, Google Gen AI SDK |
| **Deployment** | Vercel (Frontend), Render / Railway (Backend) |

---

## 🏗️ Architecture Pipeline

```
  [ Farmer Leaf Capture / Upload ]
                │
                ▼
  [ Image Quality Engine ] ────(Blur/Dark)────► [ Guided Retake Screen ]
                │ (Passed)
                ▼
  [ Foliar Vision Model ] 
                │
                ▼
  [ Confidence & Severity Evaluator ] ──(<60%)──► [ Safe Cultural Measures & Expert Review ]
                │ (≥60%)
                ▼
  [ Grad-CAM & Lesion Localization ]
                │
                ▼
  [ 3-Step Treatment Engine + CIBRC Catalog ]
                │
                ▼
  [ Weather-Aware Spray Window (Open-Meteo) ]
                │
                ▼
  [ Local Input Shops & PACCS Locator (Haversine GPS) ]
                │
                ▼
  [ Live Expert Consultation (WebRTC Video & Real-Time Chat) ]
```

---

## 🚀 Local Installation & Quick Start

### 1. Prerequisites
- **Python**: Version 3.11+
- **Node.js**: Version 20+ (NPM v10+)
- **Git**

### 2. Backend Setup (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv

# On Windows PowerShell:
.\venv\Scripts\activate
# On Linux / macOS:
source venv/bin/activate

# Install dependencies:
pip install -r requirements.txt

# Run database migrations and start server:
uvicorn app.main:app --reload --port 8000
```
- Interactive API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### 3. Frontend Setup (React + Vite)

```bash
# Open a second terminal and navigate to frontend directory
cd frontend

# Install packages:
npm install

# Start Vite development server:
npm run dev
```
- Open local web app: [http://localhost:5173](http://localhost:5173)

---

## ⚙️ Environment Variables Reference

### Frontend Configuration (`frontend/.env`)
```ini
VITE_API_BASE=http://localhost:8000/api/v1
VITE_DEMO_MODE=true

# Video consultation provider: 'webrtc' (native self-hosted, $0 cost) or 'jitsi'
VITE_VIDEO_PROVIDER=webrtc
VITE_STUN_SERVER=stun:stun.l.google.com:19302

# Optional Supabase Auth (if social login enabled)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### Backend Configuration (`backend/.env`)
```ini
PROJECT_NAME=CropGuard AI
API_V1_STR=/api/v1
SECRET_KEY=cropguard_super_secret_jwt_key_2026_safe
ALGORITHM=HS256
DEMO_LOGIN_ENABLED=True

# SQLite Database connection strings
DATABASE_URL=sqlite+aiosqlite:///./cropguard.db
SYNC_DATABASE_URL=sqlite:///./cropguard.db

# Optional Gemini API key for assistant voice chat
GEMINI_API_KEY=
```

---

## 🧪 Automated Testing Suite

The repository includes a comprehensive automated test suite covering safety rules, computer vision diagnostics, shop locator calculations, and expert consultation workflows:

```bash
# From repository root with backend virtual environment active:
$env:PYTHONPATH="backend"
.\backend\venv\Scripts\python.exe -m pytest backend/tests/test_critical_rules.py backend/tests/test_phase4_leaf_diagnosis.py backend/tests/test_phase5_products_and_shops.py backend/tests/test_phase6_consultations.py
```

### Verified Test Coverage (19/19 Tests Passing):
1. **Critical Safety Rules (`test_critical_rules.py`)**: Low-confidence non-chemical refusals, weather spray window safety, and image quality rejection.
2. **Phase 4 Leaf Diagnosis (`test_phase4_leaf_diagnosis.py`)**: Multi-crop classification, Grad-CAM heatmap generation, and 3-step treatment recommendations.
3. **Phase 5 Products & Shops (`test_phase5_products_and_shops.py`)**: Haversine distance calculations, CIBRC active ingredient validation, and unverified price warnings.
4. **Phase 6 Expert Consultations (`test_phase6_consultations.py`)**: Schema integrity, expert profile accreditations, appointment booking with farmer consent, and WebSocket connection lifecycle.

---

## 🌐 Deploying to Production

### Deploying Frontend to Vercel
1. Fork or push to GitHub: `https://github.com/Roshni61/cropguard.git`
2. In [Vercel Dashboard](https://vercel.com/new), import repository.
3. Set **Root Directory** to `frontend`.
4. Build command: `npm run build` | Output directory: `dist`.
5. Add environment variable:
   - `VITE_API_BASE`: `https://your-backend-service.onrender.com/api/v1`
6. Click **Deploy**.

### Deploying Backend to Render / Railway
1. Create a new Web Service from the GitHub repository.
2. Set **Root Directory** to `backend`.
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Configure environment variables (`SECRET_KEY`, `DEMO_LOGIN_ENABLED=True`).

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.
