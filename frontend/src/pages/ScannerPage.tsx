import React, { useState, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Camera, Upload, AlertTriangle, Sparkles, Sprout,
  Sun, Focus, Maximize2, History
} from "lucide-react";
import { useTranslation } from "../i18n/I18nContext";
import { analyzeCropImageAPI, fetchUserScansHistoryAPI } from "../services/api";
import { LeafScanner, SCAN_STAGES } from "../components/LeafScanner";

interface ScannerPageProps {
  onDiagnosisComplete: (resultData: any) => void;
  selectedSample?: string | null;
}

const CROPS = [
  { id: "Tomato", label: "Tomato", icon: "🍅", ta: "தக்காளி", hi: "टमाटर" },
  { id: "Paddy", label: "Paddy (Rice)", icon: "🌾", ta: "நெல்", hi: "धान" },
  { id: "Chilli", label: "Chilli", icon: "🌶️", ta: "மிளகாய்", hi: "मिर्च" },
  { id: "Potato", label: "Potato", icon: "🥔", ta: "உருளைக்கிழங்கு", hi: "आलू" },
  { id: "Auto-Detect", label: "Help Identify Crop", icon: "🔍", ta: "பயிரை கண்டறி", hi: "फसल पहचानें" }
];

const BENCHMARK_SAMPLES: [string, string, string, string][] = [
  ["early_blight", "Early Blight (Tomato)", "early_blight_tomato.jpg", "Tomato"],
  ["late_blight", "Late Blight (Severe)", "late_blight_tomato.jpg", "Tomato"],
  ["healthy", "Healthy Leaf (96% Conf)", "healthy_tomato.jpg", "Tomato"],
  ["paddy_blast", "Rice Blast (Paddy)", "blast_paddy.jpg", "Paddy"],
  ["chilli_rot", "Anthracnose (Chilli)", "dieback_chilli.jpg", "Chilli"],
  ["blurry", "Blurry Photo (Quality Check)", "blurry_leaf.jpg", "Tomato"],
  ["dark", "Dark Photo (Lighting Check)", "dark_leaf.jpg", "Tomato"],
  ["lowconf", "Ambiguous Leaf (42% Conf)", "lowconf_unclear.jpg", "Tomato"]
];

export const ScannerPage: React.FC<ScannerPageProps> = ({ onDiagnosisComplete, selectedSample }) => {
  const { t, language } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedCrop, setSelectedCrop] = useState<string>("Tomato");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stage, setStage] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [qualityError, setQualityError] = useState<{ code: string; message: string; guidance?: string } | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

  useEffect(() => {
    return () => {
      if (preview && !preview.startsWith("data:") && !preview.startsWith("/images/")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const loadHistory = async () => {
    const list = await fetchUserScansHistoryAPI(8);
    setRecentScans(list);
    setShowHistoryModal(true);
  };

  const processImageFile = React.useCallback(async (file: File, isSample = false, sampleCrop?: string) => {
    setQualityError(null);
    const activeCrop = sampleCrop || selectedCrop;
    const previewUrl = isSample ? null : URL.createObjectURL(file);
    setPreview(previewUrl);
    setStage(0);
    setIsAnalyzing(true);

    // Progressive stage advancement
    const tick = setInterval(() => setStage(s => Math.min(s + 1, SCAN_STAGES.length - 1)), 600);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("crop", activeCrop);
    formData.append("field_id", "fld-01");
    formData.append("leaf_part", "leaf");
    formData.append("client_scan_id", `scan-${Date.now()}`);

    try {
      const [res] = await Promise.all([
        analyzeCropImageAPI(formData), 
        new Promise(r => setTimeout(r, 2200))
      ]);
      
      clearInterval(tick);
      setStage(SCAN_STAGES.length);
      await new Promise(r => setTimeout(r, 300));
      setIsAnalyzing(false);

      if (res && res.success && res.data) {
        onDiagnosisComplete({
          ...res.data,
          is_demo_sample: isSample,
          captured_image_url: previewUrl
        });
      } else if (res && res.quality && res.quality.status !== "GOOD") {
        setQualityError({
          code: res.quality.status,
          message: res.quality.reasons?.[0] || "Image quality is insufficient.",
          guidance: res.quality.guidance || "Please position the affected leaf under natural daylight and hold steady."
        });
      } else {
        setQualityError({
          code: "QUALITY_REJECTED",
          message: "Unable to identify leaf symptoms clearly.",
          guidance: "Hold your phone 15–20 cm away from the leaf under bright daylight and keep camera steady."
        });
      }
    } catch (err: any) {
      clearInterval(tick);
      setIsAnalyzing(false);
      setQualityError({
        code: "ANALYSIS_ERROR",
        message: "Diagnostic service connection failed.",
        guidance: "Please check your network connection and try again."
      });
    }
  }, [selectedCrop, onDiagnosisComplete]);

  // Trigger sample if selected
  useEffect(() => {
    if (selectedSample) {
      const match = BENCHMARK_SAMPLES.find(s => s[0] === selectedSample);
      if (match) {
        processImageFile(new File(["demo"], match[2], { type: "image/jpeg" }), true, match[3]);
      }
    }
  }, [selectedSample, processImageFile]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\/(jpeg|png|webp)$/i.test(f.type)) {
      return setQualityError({
        code: "INVALID_FORMAT",
        message: "Unsupported file format.",
        guidance: "Please select or take a photo in JPG, PNG, or WebP format."
      });
    }
    processImageFile(f);
  };

  return (
    <motion.div 
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] as const }} 
      className="mx-auto max-w-3xl space-y-6 pt-4 sm:pt-6 pb-16"
    >
      {/* 1. Header Bar with Recent History Button */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold uppercase tracking-wider">
            <Sprout className="w-3.5 h-3.5" />
            <span>AI Crop Doctor Vision Scanner</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-forest tracking-tight">
            {t("scanMyCrop")}
          </h2>
          <p className="text-xs sm:text-sm text-ink-2">
            Instant pathology inspection grounded in TNAU & ICAR agricultural research.
          </p>
        </div>

        <button
          type="button"
          onClick={loadHistory}
          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white hover:bg-paper text-forest font-bold text-xs border border-line shadow-xs flex items-center gap-1.5 transition cursor-pointer"
        >
          <History className="w-4 h-4 text-forest" />
          <span>Scan History</span>
        </button>
      </header>

      {/* 2. Step 1: Crop Selection Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-line shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-forest tracking-wider">
            Step 1: Select Your Crop:
          </span>
          <span className="text-[11px] text-ink-3">
            {selectedCrop === "Auto-Detect" ? "AI will auto-identify crop" : `Active: ${selectedCrop}`}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {CROPS.map((c) => {
            const isSelected = selectedCrop === c.id;
            const displayLabel = language === "ta" ? c.ta : language === "hi" ? c.hi : c.label;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCrop(c.id)}
                className={`min-h-[48px] p-2.5 rounded-2xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? "bg-forest text-lime border-forest shadow-sm"
                    : "bg-paper hover:bg-cream-card text-ink border-line hover:border-forest-2"
                }`}
              >
                <span className="text-base">{c.icon}</span>
                <span className="truncate">{displayLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Step 2: Visual Photo Instructions Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-paper p-3.5 rounded-2xl border border-line flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Sun className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-forest">Natural Daylight</p>
            <p className="text-ink-2 text-[11px]">Avoid dark shadows & midday flash glare.</p>
          </div>
        </div>

        <div className="bg-paper p-3.5 rounded-2xl border border-line flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Focus className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-forest">Sharp Focus (15–20 cm)</p>
            <p className="text-ink-2 text-[11px]">Hold camera steady, tap lesion to focus.</p>
          </div>
        </div>

        <div className="bg-paper p-3.5 rounded-2xl border border-line flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
            <Maximize2 className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-forest">Frame Single Leaf</p>
            <p className="text-ink-2 text-[11px]">Position affected leaf flat in center.</p>
          </div>
        </div>
      </div>

      {/* 4. Leaf Scanner Component */}
      <LeafScanner src={preview} stage={stage} active={isAnalyzing} />

      {/* 5. Quality Rejection Alert Banner with Actionable Guidance */}
      {qualityError && (
        <motion.div 
          role="alert" 
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="animate-shake flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50/95 p-4 text-amber-950 shadow-sm"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-amber-950">
                Photo Quality Check: Unsuitable for Safe Diagnosis
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 px-2 py-0.5 rounded-md text-amber-900">
                {qualityError.code}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-amber-900 font-semibold leading-relaxed">
              {qualityError.message}
            </p>
            {qualityError.guidance && (
              <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200/80 text-xs text-amber-900 leading-normal">
                💡 <strong>Agronomist Guidance:</strong> {qualityError.guidance}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onFile} 
        accept="image/jpeg,image/png,image/webp" 
        capture="environment" 
        className="hidden" 
      />

      {/* 6. Primary Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <button 
          onClick={() => fileInputRef.current?.click()} 
          disabled={isAnalyzing} 
          className="flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-forest hover:bg-forest-hover font-bold text-cream text-sm sm:text-base shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] hover:-translate-y-0.5 active:translate-y-0 border border-lime/30 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Camera className="h-5 w-5 text-lime" aria-hidden /> 
          <span>{t("takePhoto")} (Camera)</span>
        </button>

        <button 
          onClick={() => fileInputRef.current?.click()} 
          disabled={isAnalyzing} 
          className="flex min-h-14 items-center justify-center gap-2.5 rounded-full border border-line bg-white hover:bg-paper font-bold text-forest text-sm sm:text-base shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Upload className="h-5 w-5 text-forest" aria-hidden /> 
          <span>{t("uploadGallery")}</span>
        </button>
      </div>

      {/* 7. Benchmark Reference Samples (Clearly labeled so never confused with real diagnosis) */}
      {isDemoMode && (
        <section className="rounded-3xl border border-line bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-2">
              <Sparkles className="h-4 w-4 text-forest" aria-hidden /> 
              <span>Reference Benchmark Suite (Verification Samples)</span>
            </div>
            <span className="text-[10px] bg-paper px-2 py-0.5 rounded text-ink-3">
              Tagged as Demo Benchmark
            </span>
          </div>

          <p className="text-[11px] text-ink-3">
            Pre-calibrated test leaves for testing edge-cases: healthy leaves, severe blights, paddy blast, blurry rejection, and low-confidence handling.
          </p>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {BENCHMARK_SAMPLES.map(([key, label, file, crop]) => (
              <button 
                key={key} 
                disabled={isAnalyzing} 
                onClick={() => processImageFile(new File(["demo"], file, { type: "image/jpeg" }), true, crop)} 
                className="min-h-12 rounded-2xl border border-line p-2.5 text-xs font-semibold text-ink transition-all hover:border-forest-2 hover:bg-paper hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer text-left flex flex-col justify-between"
              >
                <span className="font-bold text-forest leading-snug">{label}</span>
                <div className="flex items-center justify-between mt-1 text-[10px] text-ink-3">
                  <span>{crop}</span>
                  <span className="font-bold text-lime bg-forest px-1.5 py-0.2 rounded">Test</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 8. Recent Scan History Modal */}
      {showHistoryModal && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-line space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-forest" />
                <h3 className="font-black text-lg text-forest">Your Saved Scans</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="min-h-[44px] min-w-[44px] p-2 text-ink-2 hover:text-ink rounded-xl"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {recentScans.length === 0 ? (
                <p className="text-center py-8 text-xs text-ink-3">No scans saved yet. Snap a photo to create your first report.</p>
              ) : (
                recentScans.map((s, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-paper border border-line text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-forest">
                      <span>{s.disease_name || "Crop Scan"}</span>
                      <span className="text-[11px] font-normal text-ink-3">{s.created_at}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-ink-2">
                      <span>Confidence: {Math.round((s.confidence || 0) * 100)}%</span>
                      <span>•</span>
                      <span>Severity: {s.severity || "Moderate"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
