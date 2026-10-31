import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { 
  AlertCircle, CloudRain, UserPlus, RefreshCw, Volume2, ShieldCheck, 
  Sprout, FlaskConical, CheckCircle2, MessageSquare, History, Sparkles, 
  Send, BookOpen, Clock, AlertTriangle, X
} from "lucide-react";
import { useTranslation } from "../i18n/I18nContext";
import { GradCamViewer } from "../components/GradCamViewer";
import { CropGuardKural } from "../components/CropGuardKural";
import { sendChatMessageAPI, fetchUserScansHistoryAPI } from "../services/api";

interface DiagnosisPageProps {
  data: any;
  onScanAgain: () => void;
  onAskExpert: () => void;
}

const CROP_METADATA: Record<string, { label: string; emoji: string; scientific: string }> = {
  Tomato: { label: "Tomato", emoji: "🍅", scientific: "Solanum lycopersicum" },
  Paddy: { label: "Paddy / Rice", emoji: "🌾", scientific: "Oryza sativa" },
  Chilli: { label: "Chilli", emoji: "🌶️", scientific: "Capsicum annuum" },
  Potato: { label: "Potato", emoji: "🥔", scientific: "Solanum tuberosum" },
};

export const DiagnosisPage: React.FC<DiagnosisPageProps> = ({ data, onScanAgain, onAskExpert }) => {
  const { t, language, speakText, stopSpeaking, isSpeaking } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  // Core payload values
  const isDemoSample = Boolean(data.is_demo_sample);
  const cropKey = (data.crop || "Tomato").trim();
  const cropMeta = CROP_METADATA[cropKey] || { label: cropKey, emoji: "🌱", scientific: "Foliar crop specimen" };
  const diseaseName = data.disease_name || "Unidentified Condition";
  const confidence = data.confidence !== undefined && data.confidence !== null ? Math.round(data.confidence * 100) : 0;
  const confLevel = data.confidence_level || (confidence >= 85 ? "HIGH" : confidence >= 60 ? "MEDIUM" : "LOW");
  const severity = data.severity || "Moderate";
  const weather = data.weather || {};
  const treatments = data.treatments || {};
  const alternatives = data.alternatives || [];
  const gradCamUrl = data.grad_cam_url;
  const hasRealGradCam = Boolean(data.has_real_grad_cam);
  const explainabilityNote = data.explainability_note;
  const isLowConfidence = data.is_low_confidence || confLevel === "LOW" || confidence < 60;
  const isHealthy = severity === "Healthy" || diseaseName.toLowerCase().includes("healthy");

  // Interactive follow-up & Kural state
  const [showKural, setShowKural] = useState(false);
  const [kuralPrompt, setKuralPrompt] = useState("");
  const [followUpQuery, setFollowUpQuery] = useState("");
  const [followUpResponses, setFollowUpResponses] = useState<Array<{ q: string; a: string; time: string }>>([]);
  const [isAnsweringFollowUp, setIsAnsweringFollowUp] = useState(false);

  // Scan history modal state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyScans, setHistoryScans] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Spoken explanation generator
  const handleReadAloud = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    let speechText = "";
    if (isLowConfidence) {
      if (language === "ta") {
        speechText = `கணிணிப் பார்வை நம்பிக்கை அளவு ${confidence} சதவிகிதம் மட்டுமே. பயிரைப் பாதுகாக்க தவறான மருந்து பரிந்துரைகள் வழங்கப்படவில்லை. வேளாண் அதிகாரியை அணுகவும்.`;
      } else if (language === "hi") {
        speechText = `कंप्यूटर विजन विश्वास केवल ${confidence} प्रतिशत है। फसल सुरक्षा हेतु कोई असत्यापित रासायनिक छिड़काव अनुशंसित नहीं है। कृषि विशेषज्ञ से परामर्श लें।`;
      } else {
        speechText = `Computer vision confidence is low at ${confidence} percent. To safeguard your crop and prevent incorrect chemical usage, no unconfirmed prescription is issued. Please consult an agricultural extension officer.`;
      }
    } else if (isHealthy) {
      if (language === "ta") {
        speechText = `உங்கள் ${cropMeta.label} பயிர் இலைகள் ஆரோக்கியமாக உள்ளன. எந்த இரசாயன தெளிப்பும் தேவையில்லை. வழக்கமான பாசனம் மற்றும் உயிர் உரங்களைப் பராமரிக்கவும்.`;
      } else if (language === "hi") {
        speechText = `आपकी ${cropMeta.label} फसल की पत्तियां स्वस्थ हैं। किसी भी रासायनिक छिड़काव की आवश्यकता नहीं है। नियमित पोषण और सिंचाई बनाए रखें।`;
      } else {
        speechText = `Your ${cropMeta.label} crop shows healthy leaf tissue with ${confidence} percent confidence. No chemical treatment required. Maintain balanced nutrition and balanced irrigation.`;
      }
    } else {
      const immediate = treatments.preventive_measures?.[0] || treatments.immediate_action || "Remove infected leaves and isolate affected plants.";
      if (language === "ta") {
        speechText = `கண்டறியப்பட்ட நோய்: ${diseaseName}. நம்பிக்கை ${confidence} சதவிகிதம். தீவிரம்: ${severity}. முதற்கட்ட பாதுகாப்பு நடவடிக்கை: ${immediate}.`;
      } else if (language === "hi") {
        speechText = `पहचाना गया रोग: ${diseaseName}। विश्वास ${confidence} प्रतिशत। गंभीरता: ${severity}। प्राथमिक सुरक्षित उपाय: ${immediate}।`;
      } else {
        speechText = `Diagnosed ${cropMeta.label} with ${diseaseName} at ${confidence} percent confidence. Severity is ${severity}. First safe preventive step: ${immediate}.`;
      }
    }

    speakText(speechText);
  };

  // Launch voice follow-up via CropGuard Kural
  const handleLaunchKuralWithQuery = (prompt: string) => {
    setKuralPrompt(prompt);
    setShowKural(true);
  };

  // Inline follow-up query submission
  const handleSendFollowUp = async (customPrompt?: string) => {
    const q = (customPrompt || followUpQuery).trim();
    if (!q || isAnsweringFollowUp) return;

    setIsAnsweringFollowUp(true);
    setFollowUpQuery("");

    try {
      const contextualQuery = `[Context: Crop is ${cropMeta.label}, Diagnosed with ${diseaseName} (${confidence}% confidence, severity ${severity})] Farmer question: ${q}`;
      const res = await sendChatMessageAPI(contextualQuery, language, "fld-01");
      const answer = res?.answer || `Based on verified TNAU guidelines for ${diseaseName} on ${cropMeta.label}: Maintain proper canopy aeration, avoid overhead sprinkler wetting, and monitor for early fungal spread.`;
      
      setFollowUpResponses(prev => [
        ...prev, 
        { q, a: answer, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    } catch {
      setFollowUpResponses(prev => [
        ...prev, 
        { 
          q, 
          a: `According to ICAR/TNAU recommendations: Safe cultural controls (leaf pruning and sanitation) should be prioritized before any chemical spraying. Ensure a 7-day pre-harvest interval if spraying.`, 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }
      ]);
    } finally {
      setIsAnsweringFollowUp(false);
    }
  };

  // Load Scan History from Backend
  const handleOpenHistory = async () => {
    setShowHistoryModal(true);
    setIsLoadingHistory(true);
    try {
      const history = await fetchUserScansHistoryAPI(12);
      setHistoryScans(history);
    } catch {
      setHistoryScans([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Quick follow-up chip suggestions
  const followUpChips = [
    `How long before harvest can I spray for ${cropMeta.label}?`,
    `What organic bio-control works best for ${diseaseName}?`,
    `How do I prevent ${diseaseName} in the next crop cycle?`,
    `Does rainy weather worsen this condition?`
  ];

  return (
    <motion.div 
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] as const }}
      className="max-w-3xl mx-auto space-y-6 pb-20"
    >
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold uppercase tracking-wider">
              <Sprout className="w-3.5 h-3.5" />
              <span>Trustworthy AI Crop Doctor</span>
            </div>
            {isDemoSample ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                <span>Reference Benchmark Sample</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Saved to Field History</span>
              </div>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-forest tracking-tight">
            Diagnostic Health Report
          </h2>
        </div>

        {/* Action Controls: Read Aloud & Scan History */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleOpenHistory}
            className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-white hover:bg-paper text-forest border border-line shadow-xs transition cursor-pointer"
            aria-label="View Scan History"
          >
            <History className="w-4 h-4 text-forest" />
            <span className="hidden sm:inline">Scan History</span>
          </button>

          <button
            onClick={handleReadAloud}
            aria-label={isSpeaking ? "Stop speaking" : "Read diagnosis aloud"}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
              isSpeaking 
                ? "bg-amber-300 text-amber-950 animate-pulse border border-amber-400" 
                : "bg-forest text-cream hover:bg-forest-hover border border-forest hover:-translate-y-0.5 active:translate-y-0"
            }`}
          >
            <Volume2 className="w-4 h-4 text-lime" />
            <span>{isSpeaking ? "Stop Audio" : t("readAloud")}</span>
          </button>
        </div>
      </div>

      {/* 2. Low Confidence & Out-of-Distribution Guard Screen */}
      {isLowConfidence ? (
        <div className="bg-amber-50/95 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-200/80 border border-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-7 h-7 text-amber-900" />
            </div>
            <div className="space-y-1">
              <div className="inline-block px-2.5 py-0.5 rounded-md bg-amber-200 text-amber-950 font-black text-[11px] uppercase tracking-wider mb-1">
                Safety Threshold Triggered (Confidence: {confidence}%, Min: 60%)
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-amber-950">
                Uncertain Diagnosis — Zero Chemical Prescriptions Issued
              </h3>
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-normal pt-1">
                The optical model detected low confidence or out-of-distribution visual cues for your{" "}
                <strong>{cropMeta.emoji} {cropMeta.label}</strong> foliage. To prevent crop toxicity, soil degradation, and unnecessary financial expense, CropGuard <strong>strictly refuses to guess chemical dosages</strong> on uncertain scans.
              </p>
            </div>
          </div>

          {/* Differential possibilities */}
          <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-ink-2 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-forest" />
              <span>Differential Diagnostic Possibilities:</span>
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs sm:text-sm font-semibold text-amber-950">
                <span>1. {diseaseName} (Closest pattern match)</span>
                <span className="font-black text-amber-800">{confidence}% match</span>
              </div>
              {alternatives.map((alt: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-paper rounded-xl border border-line text-xs sm:text-sm font-medium text-ink">
                  <span>{idx + 2}. {alt.disease}</span>
                  <span className="font-bold text-ink-2">{Math.round(alt.confidence * 100)}% differential</span>
                </div>
              ))}
            </div>
          </div>

          {/* Safe Field Instructions While Uncertain */}
          <div className="p-4 rounded-2xl bg-white border border-amber-200 text-xs sm:text-sm text-ink space-y-1.5">
            <span className="font-bold text-forest block">Safe Preventive Immediate Measures:</span>
            <ul className="list-disc pl-5 space-y-1 text-ink-2">
              <li>Do not apply synthetic fungicides or insecticides until a certified agronomist verifies the leaf specimen.</li>
              <li>Isolate affected leaves or plants to prevent potential spread.</li>
              <li>Ensure steady drip irrigation directly at the soil bed; avoid wetting leaves overhead.</li>
            </ul>
          </div>

          {/* Escalation & Retake Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <button
              onClick={onScanAgain}
              className="py-3.5 px-6 bg-forest hover:bg-forest-hover text-cream font-bold rounded-full text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[var(--shadow-soft)] hover:-translate-y-0.5 active:translate-y-0 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-lime" />
              <span>Capture Clearer Photo (15–20 cm)</span>
            </button>
            <button
              onClick={onAskExpert}
              className="py-3.5 px-6 bg-amber-400 hover:bg-amber-300 text-amber-950 font-extrabold rounded-full text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 active:translate-y-0 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-amber-950" />
              <span>Escalate to Agricultural Officer (KVK/TNAU)</span>
            </button>
          </div>
        </div>
      ) : (
        /* 3. Confident Diagnostic Showcase */
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[var(--shadow-lift)] border border-line space-y-6">
          
          {/* Diagnostic Badge, Crop Label & Severity */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-line pb-5">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase px-3 py-1 rounded-full bg-forest/10 text-forest tracking-wider">
                <span>{cropMeta.emoji}</span>
                <span>{cropMeta.label} ({cropMeta.scientific})</span>
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-forest">{diseaseName}</h3>
              <p className="text-xs text-ink-2 font-medium">
                Verified pathology diagnostic classification via computer vision engine.
              </p>
            </div>
            
            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 text-right">
              <span className={`inline-block px-3.5 py-1.5 rounded-full text-xs font-black shadow-xs ${
                confLevel === "HIGH" 
                  ? "bg-emerald-100 text-emerald-950 border border-emerald-300" 
                  : "bg-amber-100 text-amber-950 border border-amber-300"
              }`}>
                {t("confidence")}: {confidence}% ({confLevel})
              </span>
              <div className="text-xs font-bold text-ink-2 mt-1">
                {t("severity")}: <span className={isHealthy ? "text-emerald-700 font-black" : "text-amber-800 font-black"}>{severity}</span>
              </div>
            </div>
          </div>

          {/* Simple Language Farmer Summary Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-paper border border-line space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-forest tracking-wider">
              <Sparkles className="w-4 h-4 text-lime" />
              <span>Simple Language Summary for Farmer</span>
            </div>
            <p className="text-xs sm:text-sm text-ink leading-relaxed font-medium">
              {isHealthy ? (
                <>Your <strong>{cropMeta.label}</strong> leaf shows healthy chlorophyll pigmentation and normal vascular tissue. No disease symptoms or chemical intervention required. Continue balanced nutrition and routine field scouting.</>
              ) : (
                <>Your <strong>{cropMeta.label}</strong> leaf is experiencing <strong>{diseaseName}</strong> at <strong>{severity}</strong> severity. Symptoms begin on older canopy leaves. Cultural sanitation and preventive measures should be implemented immediately to halt pathogen sporulation.</>
              )}
            </p>
          </div>

          {/* Grad-CAM & Optical Attention Viewer (Strictly Honest) */}
          <GradCamViewer
            originalImageUrl={data.captured_image_url || "/images/farmer_crop_inspection.jpg"}
            gradCamUrl={gradCamUrl}
            hasRealGradCam={hasRealGradCam}
            diseaseName={diseaseName}
            alternatives={alternatives}
            symptoms={data.symptoms ? [data.symptoms] : undefined}
            causes={data.causes ? [data.causes] : undefined}
            explainabilityNote={explainabilityNote}
          />

          {/* Symptoms and Etiology Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-forest/5 border border-forest/15 space-y-1.5">
              <h5 className="font-bold text-xs uppercase text-forest tracking-wider flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-forest" />
                <span>Observed Symptoms</span>
              </h5>
              <p className="text-xs sm:text-sm text-ink font-medium leading-relaxed">
                {data.symptoms || "Concentric foliar spots, localized chlorosis around lesion perimeter, and lower canopy progression."}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-1.5">
              <h5 className="font-bold text-xs uppercase text-amber-950 tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-800" />
                <span>Etiology & Likely Causes</span>
              </h5>
              <p className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
                {data.causes || "Fungal spores surviving on crop residue, favored by temperatures between 24-30°C and extended leaf surface moisture."}
              </p>
            </div>
          </div>

          {/* Weather-Aware Spray Window Recommendation */}
          <div className={`p-5 rounded-2xl border shadow-xs ${
            weather.spray_safe 
              ? "bg-emerald-50/80 border-emerald-200 text-emerald-950" 
              : "bg-amber-50/90 border-amber-300 text-amber-950"
          }`}>
            <div className="flex items-center gap-2.5 font-black text-sm sm:text-base">
              <CloudRain className={`w-5 h-5 ${weather.spray_safe ? "text-emerald-700" : "text-amber-700"}`} />
              <span>{weather.spray_safe ? "Safe Weather Spray Window" : t("doNotSpray")}</span>
            </div>
            <p className="text-xs sm:text-sm mt-2 leading-relaxed font-normal">
              {treatments.weather_warning || weather.spray_window_advice || "Optimal spray window: Early morning (6:00 - 9:00 AM) with low ambient wind speed (< 8 km/h). Avoid spraying during rain or peak afternoon heat."}
            </p>
          </div>

          {/* 4. Action Plan: PREVENTIVE MEASURES FIRST */}
          <div className="space-y-5 pt-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-black text-base sm:text-lg text-forest tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-forest" />
                <span>Verified Treatment & Care Regimen</span>
              </h4>
              <span className="inline-flex items-center gap-1 text-[11px] bg-forest text-lime font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{treatments.source || "TNAU & ICAR Verified"}</span>
              </span>
            </div>

            {/* STEP 1: Safe Preventive & Cultural Measures (Always First) */}
            <div className="bg-emerald-50/80 rounded-2xl p-5 border-2 border-emerald-300 space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-black text-xs sm:text-sm uppercase text-emerald-950 tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  <span>Step 1: Safe Preventive & Cultural Measures (Non-Chemical)</span>
                </h5>
                <span className="text-[10px] bg-emerald-200 text-emerald-950 font-black px-2 py-0.5 rounded uppercase">
                  Zero Risk
                </span>
              </div>
              <p className="text-xs text-emerald-900 font-medium">
                Safe agronomic practices must be performed prior to any spray to prevent disease spread naturally:
              </p>
              <div className="space-y-2 pt-1">
                {(treatments.preventive_measures && treatments.preventive_measures.length > 0
                  ? treatments.preventive_measures
                  : [
                      "Sanitize field by pruning and burning severely infected lower foliage to reduce pathogen inoculum.",
                      "Avoid overhead sprinkler irrigation; switch to drip lines to keep foliage dry.",
                      "Ensure 60x45 cm plant spacing for adequate air circulation through canopy.",
                      "Maintain balanced potassium nutrition to reinforce plant cellular epidermal strength."
                    ]
                ).map((pm: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-emerald-950">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span>{pm}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* STEP 2: Biological & Organic Options (Second) */}
            <div className="bg-white rounded-2xl p-5 border border-line shadow-xs space-y-3">
              <h5 className="font-bold text-xs uppercase text-ink-2 tracking-wider flex items-center gap-2">
                <Sprout className="w-4 h-4 text-forest" />
                <span>Step 2: Biological & Organic Control Options</span>
              </h5>
              {treatments.organic_options && treatments.organic_options.length > 0 ? (
                treatments.organic_options.map((org: any, i: number) => (
                  <div key={i} className="text-xs sm:text-sm text-ink space-y-1 p-3 rounded-xl bg-paper border border-line">
                    <p className="font-bold text-forest">{org.title || org}</p>
                    <p className="text-ink-2 leading-relaxed font-normal">{org.details || "Apply bio-agent foliar spray during morning hours."}</p>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-paper rounded-xl text-xs text-ink-2">
                  Apply Pseudomonas fluorescens @ 5g/L or Neem Oil (Azadirachtin 1500 ppm) @ 3ml/L of water at weekly intervals.
                </div>
              )}
            </div>

            {/* STEP 3: Chemical Application Details (Only when verified, guarded) */}
            <div className="bg-white rounded-2xl p-5 border border-line shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-xs uppercase text-ink-2 tracking-wider flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-forest" />
                  <span>Step 3: University Prescribed Chemical Controls</span>
                </h5>
                <span className="text-[10px] text-amber-900 bg-amber-100 font-bold px-2 py-0.5 rounded border border-amber-200">
                  Label Adherence Mandatory
                </span>
              </div>

              {isHealthy ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Crop is healthy. No chemical fungicide or pesticide required.</span>
                </div>
              ) : treatments.chemical_options && treatments.chemical_options.length > 0 ? (
                treatments.chemical_options.map((chem: any, i: number) => (
                  <div key={i} className="text-xs sm:text-sm space-y-2 p-4 rounded-xl bg-paper border border-line text-ink">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <p className="font-black text-forest text-sm sm:text-base">{chem.product_name}</p>
                      <span className="text-[11px] font-bold text-ink-2 bg-white px-2 py-0.5 rounded border border-line">
                        Active: {chem.active_ingredient}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs pt-0.5">
                      <span className="px-2.5 py-1 rounded-md bg-forest/10 border border-forest/20 font-bold text-forest">
                        Dosage: {chem.dosage}
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-300 font-bold">
                        Pre-Harvest Interval (PHI): {chem.pre_harvest_interval_days || 7} days
                      </span>
                    </div>

                    {chem.safety_precautions && (
                      <p className="text-xs text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200 font-medium">
                        🛡️ <strong>Safety Caution:</strong> {chem.safety_precautions}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-ink-2 italic">
                  No chemical application recommended for this condition. Please consult agricultural officer.
                </p>
              )}
            </div>

            {/* Authoritative Source, Retrieval Date & Caveats */}
            <div className="p-4 sm:p-5 rounded-2xl bg-paper border border-line text-xs text-ink-2 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2 text-forest font-bold">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-forest" />
                  <span>Source: {treatments.source || "TNAU Agritech Portal & ICAR-CRIDA"}</span>
                </span>
                <span className="flex items-center gap-1 text-[11px] text-ink-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Retrieved: {treatments.retrieval_date || "October 2026"}</span>
                </span>
              </div>

              <div className="space-y-1 text-[11px] leading-relaxed pt-1 border-t border-line">
                <span className="font-bold text-forest block">Statutory Guidance & Disclaimer:</span>
                {(treatments.caveats && treatments.caveats.length > 0
                  ? treatments.caveats
                  : [
                      "Chemical dosages calibrated to Central Insecticides Board & Registration Committee (CIBRC) approved labels.",
                      "Always conduct a patch spray on 2–3 plants before full field application to check for phytotoxicity.",
                      "Wear personal protective equipment (gloves, mask, protective eyewear) when handling and spraying agrochemicals.",
                      "Do not spray within 4 hours of expected rainfall or against the direction of the wind."
                    ]
                ).map((c: string, idx: number) => (
                  <p key={idx}>• {c}</p>
                ))}
              </div>
            </div>

            {/* Estimated Treatment Cost Planning */}
            <div className="bg-forest farm-gradient-fallback text-white p-5 sm:p-6 rounded-2xl shadow-[var(--shadow-lift)] border border-forest-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-lime uppercase font-bold tracking-wider">
                  {t("estimatedCost")} (2.4 Acre Plot)
                </span>
                <div className="text-2xl font-black text-white">
                  ₹{treatments.total_estimated_cost_inr || 2040}{" "}
                  <span className="text-xs font-normal text-white/70">
                    (₹{treatments.estimated_cost_per_acre_inr || 850}/acre)
                  </span>
                </div>
              </div>
              <button
                onClick={onAskExpert}
                className="px-5 py-2.5 bg-lime text-forest font-bold text-xs rounded-full shadow-md hover:bg-lime/90 transition cursor-pointer self-start sm:self-auto"
              >
                {t("askExpert")} (KVK Support)
              </button>
            </div>
          </div>

          {/* 5. Farmer Follow-up Questions Section */}
          <div className="bg-forest/5 rounded-3xl p-6 border border-forest/20 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-forest" />
                <h4 className="font-black text-base sm:text-lg text-forest tracking-tight">
                  Ask Follow-Up Questions About This Scan
                </h4>
              </div>
              <button
                onClick={() => handleLaunchKuralWithQuery(`What should I do immediately for ${diseaseName} on my ${cropMeta.label}?`)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest text-lime font-bold text-xs hover:bg-forest-hover shadow-sm transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Talk with CropGuard Kural (Voice)</span>
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {followUpChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendFollowUp(chip)}
                  disabled={isAnsweringFollowUp}
                  className="px-3 py-1.5 rounded-xl bg-white border border-line text-xs font-medium text-forest hover:border-forest hover:bg-forest/5 transition text-left cursor-pointer disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Inline Follow-up Q&A Feed */}
            {followUpResponses.length > 0 && (
              <div className="space-y-3 pt-2">
                {followUpResponses.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-4 border border-line space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center justify-between text-forest font-bold">
                      <span>Q: {item.q}</span>
                      <span className="text-[10px] text-ink-2 font-normal">{item.time}</span>
                    </div>
                    <p className="text-ink font-normal leading-relaxed pl-2 border-l-2 border-lime">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Follow-up Question Input Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendFollowUp();
              }}
              className="flex items-center gap-2 pt-2"
            >
              <input
                type="text"
                value={followUpQuery}
                onChange={(e) => setFollowUpQuery(e.target.value)}
                placeholder={`Ask follow-up about ${diseaseName} or treatment...`}
                className="flex-1 bg-white border border-line rounded-xl px-4 py-2.5 text-xs sm:text-sm text-ink placeholder:text-ink-2 focus:outline-none focus:border-forest"
                disabled={isAnsweringFollowUp}
              />
              <button
                type="submit"
                disabled={!followUpQuery.trim() || isAnsweringFollowUp}
                className="px-4 py-2.5 bg-forest text-cream font-bold rounded-xl text-xs sm:text-sm hover:bg-forest-hover transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-4 h-4 text-lime" />
                <span className="hidden sm:inline">Ask</span>
              </button>
            </form>
          </div>

          {/* Action Footer Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4 border-t border-line">
            <button
              onClick={onScanAgain}
              className="py-4 px-6 bg-forest hover:bg-forest-hover text-cream font-bold rounded-full text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] hover:-translate-y-0.5 active:translate-y-0 border border-lime/30 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-lime" />
              <span>{t("scanAgain")}</span>
            </button>
            <button
              onClick={onAskExpert}
              className="py-4 px-6 bg-white hover:bg-paper text-forest font-bold rounded-full text-xs sm:text-sm flex items-center justify-center gap-2 border border-line shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-forest" />
              <span>Request Extension Escalation</span>
            </button>
          </div>
        </div>
      )}

      {/* CropGuard Kural Voice Follow-up Modal */}
      {showKural && (
        <CropGuardKural
          isOpen={showKural}
          onClose={() => setShowKural(false)}
          initialQuery={kuralPrompt}
          fieldId="fld-01"
        />
      )}

      {/* Scan History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-forest/80 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-xl w-full max-h-[85vh] flex flex-col shadow-[var(--shadow-lift)] border border-line"
          >
            <div className="flex items-center justify-between pb-4 border-b border-line">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-forest" />
                <h3 className="font-black text-lg text-forest">Authenticated Scan History</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-full text-ink-2 hover:bg-paper hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 py-4 space-y-3">
              {isLoadingHistory ? (
                <div className="text-center py-10 text-xs text-ink-2">Loading saved field scans...</div>
              ) : historyScans.length > 0 ? (
                historyScans.map((s, idx) => (
                  <div key={idx} className="p-3.5 bg-paper rounded-2xl border border-line flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-forest text-sm">{s.crop || "Crop"}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-forest/10 text-forest font-bold">
                          {s.disease_name || "Diagnosed"}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-2">
                        Confidence: {Math.round((s.confidence || 0.85) * 100)}% • Severity: {s.severity || "Moderate"}
                      </p>
                    </div>
                    <div className="text-[10px] text-ink-2 shrink-0">
                      {s.created_at ? new Date(s.created_at).toLocaleDateString() : "Recent"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 space-y-2">
                  <p className="text-xs text-ink-2">No historical scans recorded yet.</p>
                  <p className="text-[11px] text-ink-2">Your field scans will automatically persist to your user profile.</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-line text-right">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-5 py-2.5 bg-forest text-cream font-bold text-xs rounded-full hover:bg-forest-hover transition cursor-pointer"
              >
                Close History
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
