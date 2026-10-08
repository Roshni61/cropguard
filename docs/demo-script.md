# 🎬 CropGuard AI — Demo Script & Walkthrough

This demo tells one continuous story of how a farmer, an agricultural expert, and a district agriculture officer interact with CropGuard AI.

---

## 🎭 Demo Story Flow

### Step 1: Farmer Login & Field Selection
1. Open CropGuard AI (`http://localhost:5173`).
2. The user sees the greeting: *"Good Morning Ramesh 👨‍🌾"*.
3. Select **Tomato Field A (North)** (2.4 acres, Fruiting Stage).

### Step 2: Quality Engine & Image Upload
1. Click the large dominant **[ 📷 SCAN MY CROP ]** button.
2. In the demo samples bar at the bottom:
   - Click **"🌀 Test Blur Check"** → CropGuard detects image blur and prompts: *"The image is too blurry. Hold your phone steady and try again."*
   - Click **"🌑 Test Dark Check"** → CropGuard flags darkness and prompts to move to brighter sunlight.

### Step 3: Disease Diagnosis & Confidence
1. Click sample photo **"🍅 Early Blight (94%)"**.
2. CropGuard processes the image and shows:
   - **Disease**: Early Blight (*Alternaria solani*)
   - **Confidence**: `HIGH` (94%)
   - **Severity**: Moderate

### Step 4: Explainable AI (Grad-CAM)
1. On the diagnosis screen, view the **"Why did the AI think this?"** section.
2. Toggle between original image and the **Grad-CAM heatmap overlay** highlighting lesion concentric rings and leaf chlorosis.

### Step 5: Weather-Aware Recommendation
1. CropGuard checks live weather forecast (82% rain probability).
2. Warning is displayed: **"⚠️ DO NOT SPRAY TODAY. Rain is expected within 6 hours."**
3. Verified organic (Neem extract) and chemical (Mancozeb 75% WP) remedies with exact PHI (7 days) and estimated cost (₹2,040 total / ₹850 per acre) are shown.

### Step 6: Multilingual Tamil Assistant & Voice
1. Switch language to **TA (தமிழ்)** in the top navbar.
2. Open **"Ask CropGuard"** tab.
3. Click microphone or type in Tamil: *"தக்காளி இலைப்புள்ளி நோய்க்கு என்ன மருந்து தெளிக்க வேண்டும்?"*
4. CropGuard answers in Tamil with verified TNAU citations.
5. Test safety refusal: Ask *"Give me a secret chemical dosage guess"* → Assistant politely refuses: *"I don't have enough verified information to safely recommend unapproved dosage."*

### Step 7: Offline Scan & Auto Sync
1. Turn off Wi-Fi/Internet or click the **Sync Status Badge** (`🟡 Saved Offline`).
2. Take a scan offline → The scan is saved locally in IndexedDB with status `SAVED_OFFLINE`.
3. Restore internet connection → Click **"Tap to Sync"** → Item syncs idempotently with backend (`🟢 Synced`).

### Step 8: Outbreak Alert & Officer Dashboard
1. Switch role in top navbar to **Officer**.
2. View district outbreak heatmap with 4 hotspots and 17 Early Blight cases in Pollachi-Coimbatore belt.
3. Broadcast an emergency alert to farmers: *"Multiple Early Blight cases reported. Inspect crops today."*
4. Click **[Export CSV Report]** to download district inspection data.

### Step 9: Expert Escalation Queue
1. Switch role to **Expert**.
2. Open human review queue to view low-confidence or severe cases escalated from farmers.
3. Add expert verification notes and mark case as **VERIFIED**.
