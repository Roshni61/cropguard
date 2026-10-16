import React, { useState, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Camera, Upload, AlertTriangle, Sparkles, Sprout } from "lucide-react";
import { useTranslation } from "../i18n/I18nContext";
import { analyzeCropImageAPI } from "../services/api";
import { LeafScanner, SCAN_STAGES } from "../components/LeafScanner";

interface ScannerPageProps {
  onDiagnosisComplete: (resultData: any) => void;
  selectedSample?: string | null;
}

const SAMPLES: [string, string, string][] = [
  ["early_blight", "Early Blight (Tomato)", "early_blight_tomato.jpg"],
  ["late_blight", "Late Blight (Severe)", "late_blight_tomato.jpg"],
  ["healthy", "Healthy Leaf (96% Conf)", "healthy_tomato.jpg"],
  ["blurry", "Blurry Photo (Quality Check)", "blurry_leaf.jpg"],
  ["dark", "Dark Photo (Lighting Check)", "dark_leaf.jpg"],
  ["lowconf", "Ambiguous Leaf (42% Conf)", "lowconf_unclear.jpg"],
];

export const ScannerPage: React.FC<ScannerPageProps> = ({ onDiagnosisComplete, selectedSample }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stage, setStage] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [qualityError, setQualityError] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const processImageFile = React.useCallback(async (file: File, isSample = false) => {
    setQualityError(null);
    setPreview(isSample ? null : URL.createObjectURL(file));
    setStage(0);
    setIsAnalyzing(true);

    // Progressive stage advancement
    const tick = setInterval(() => setStage(s => Math.min(s + 1, SCAN_STAGES.length - 1)), 650);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("field_id", "fld-01");
    formData.append("leaf_part", "leaf");
    formData.append("client_scan_id", `scan-${Date.now()}`);

    const [res] = await Promise.all([
      analyzeCropImageAPI(formData), 
      new Promise(r => setTimeout(r, 3000))
    ]);
    
    clearInterval(tick);
    setStage(SCAN_STAGES.length);
    await new Promise(r => setTimeout(r, 400));
    setIsAnalyzing(false);

    if (res.success) {
      onDiagnosisComplete({
        ...res.data,
        is_demo_sample: isSample,
      });
    } else if (res.quality && res.quality.status !== "GOOD") {
      setQualityError(res.quality.reasons?.[0] || "Image quality is insufficient. Please hold steady and retake the photo.");
    } else {
      setQualityError("Unable to diagnose this photo. Please capture a clear leaf photo in good natural daylight.");
    }
  }, [onDiagnosisComplete]);

  // Trigger sample if selected
  useEffect(() => {
    if (selectedSample) {
      const match = SAMPLES.find(s => s[0] === selectedSample);
      if (match) {
        processImageFile(new File(["demo"], match[2], { type: "image/jpeg" }), true);
      }
    }
  }, [selectedSample, processImageFile]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\/(jpeg|png|webp)$/.test(f.type)) {
      return setQualityError("Please choose a JPG, PNG or WebP image.");
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
      {/* Header - spacing prevents clipping under sticky navbar */}
      <header className="space-y-1.5 pt-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold uppercase tracking-wider">
          <Sprout className="w-3.5 h-3.5" />
          <span>Pathology Vision Scanner</span>
        </div>
        <h2 className="text-3xl font-black text-forest tracking-tight">{t("scanMyCrop")}</h2>
        <p className="text-sm text-ink-2">{t("placeLeafInFrame")}</p>
      </header>

      {/* Leaf Scanner Component */}
      <LeafScanner src={preview} stage={stage} active={isAnalyzing} />

      {/* Quality Error State Banner */}
      {qualityError && (
        <div role="alert" className="animate-shake flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-amber-900 shadow-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-amber-950">We won't guess from an unclear image</h3>
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">{qualityError}</p>
            <p className="text-xs text-amber-800 font-medium pt-1">
              💡 <strong>Agronomist Tip:</strong> Hold your camera steady 15–20 cm from the affected leaf area under bright, indirect daylight.
            </p>
          </div>
        </div>
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

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <button 
          onClick={() => fileInputRef.current?.click()} 
          disabled={isAnalyzing} 
          className="flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-forest hover:bg-forest-hover font-bold text-cream text-sm sm:text-base shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] hover:-translate-y-0.5 active:translate-y-0 border border-lime/30 motion-safe:transition-all motion-reduce:transition-none motion-reduce:transform-none disabled:opacity-50 cursor-pointer"
        >
          <Camera className="h-5 w-5 text-lime" aria-hidden /> 
          <span>{t("takePhoto")}</span>
        </button>

        <button 
          onClick={() => fileInputRef.current?.click()} 
          disabled={isAnalyzing} 
          className="flex min-h-14 items-center justify-center gap-2.5 rounded-full border border-line bg-white hover:bg-paper font-bold text-forest text-sm sm:text-base shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 motion-safe:transition-all motion-reduce:transition-none motion-reduce:transform-none disabled:opacity-50 cursor-pointer"
        >
          <Upload className="h-5 w-5 text-forest" aria-hidden /> 
          <span>{t("uploadGallery")}</span>
        </button>
      </div>

      {/* Demo Samples Showcase - Hidden in Production, shown only when VITE_DEMO_MODE=true */}
      {isDemoMode && (
        <section className="rounded-3xl border border-line bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-2">
            <Sparkles className="h-4 w-4 text-forest" aria-hidden /> 
            <span>Demo Calibration Samples (Offline Test Suite)</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {SAMPLES.map(([key, label, file]) => (
              <button 
                key={key} 
                disabled={isAnalyzing} 
                onClick={() => processImageFile(new File(["demo"], file, { type: "image/jpeg" }), true)} 
                className="min-h-12 rounded-2xl border border-line px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-ink transition-all hover:border-forest-2 hover:bg-paper hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer text-left flex items-center justify-between"
              >
                <span className="text-xs font-semibold leading-snug break-words pr-1">{label}</span>
                <span className="text-[10px] text-forest/70 font-bold shrink-0 ml-1">Run</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
};
