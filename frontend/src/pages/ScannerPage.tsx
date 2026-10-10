import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Upload, AlertTriangle, Sparkles } from "lucide-react";
import { useTranslation } from "../i18n/I18nContext";
import { analyzeCropImageAPI } from "../services/api";
import { LeafScanner, SCAN_STAGES } from "../components/LeafScanner";

interface ScannerPageProps {
  onDiagnosisComplete: (resultData: any) => void;
  selectedSample?: string | null;
}

const SAMPLES: [string, string, string][] = [
  ["early_blight", "Early blight sample", "early_blight_tomato.jpg"],
  ["late_blight", "Late blight sample", "late_blight_tomato.jpg"],
  ["healthy", "Healthy sample", "healthy_tomato.jpg"],
  ["blurry", "Blurry image test", "blurry_leaf.jpg"],
  ["dark", "Dark image test", "dark_leaf.jpg"],
  ["lowconf", "Uncertain case test", "lowconf_unclear.jpg"],
];

export const ScannerPage: React.FC<ScannerPageProps> = ({ onDiagnosisComplete }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stage, setStage] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [qualityError, setQualityError] = useState<string | null>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const processImageFile = async (file: File, isSample = false) => {
    setQualityError(null);
    setPreview(isSample ? null : URL.createObjectURL(file));
    setStage(0);
    setIsAnalyzing(true);

    // Stages advance on a timer while the request runs; the last stage waits for the real response.
    const tick = setInterval(() => setStage(s => Math.min(s + 1, SCAN_STAGES.length - 1)), 650);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("field_id", "fld-01");
    formData.append("leaf_part", "leaf");
    formData.append("client_scan_id", `scan-${Date.now()}`);

    const [res] = await Promise.all([analyzeCropImageAPI(formData), new Promise(r => setTimeout(r, 3200))]);
    clearInterval(tick);
    setStage(SCAN_STAGES.length);
    await new Promise(r => setTimeout(r, 450));
    setIsAnalyzing(false);

    if (res.success) onDiagnosisComplete(res.data);
    else if (res.quality && res.quality.status !== "GOOD")
      setQualityError(res.quality.reasons[0] || "Image quality is insufficient. Please retake the photo.");
    else setQualityError("We couldn't diagnose this image. Please take a clearer photo.");
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\/(jpeg|png|webp)$/.test(f.type)) return setQualityError("Please choose a JPG, PNG or WebP image.");
    processImageFile(f);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-3xl space-y-6 pb-12">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-forest-2">Crop Doctor</p>
        <h2 className="text-3xl font-extrabold text-forest">{t("scanMyCrop")}</h2>
        <p className="text-sm text-ink-2">{t("placeLeafInFrame")}</p>
      </header>

      <LeafScanner src={preview} stage={stage} active={isAnalyzing} />

      {qualityError && (
        <div role="alert" className="animate-shake flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <div>
            <h3 className="text-sm font-bold">We won't guess from this image</h3>
            <p className="mt-1 text-sm">{qualityError}</p>
            <p className="mt-1 text-xs">Tip: use bright, indirect daylight and hold steady about 15–20 cm from the leaf.</p>
          </div>
        </div>
      )}

      <input type="file" ref={fileInputRef} onChange={onFile} accept="image/jpeg,image/png,image/webp" capture="environment" className="hidden" />
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => fileInputRef.current?.click()} disabled={isAnalyzing} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-forest font-semibold text-lime shadow-[var(--shadow-soft)] transition active:scale-[.98] disabled:opacity-50">
          <Camera className="h-5 w-5" aria-hidden /> {t("takePhoto")}
        </button>
        <button onClick={() => fileInputRef.current?.click()} disabled={isAnalyzing} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-line bg-white font-semibold text-forest transition active:scale-[.98] disabled:opacity-50">
          <Upload className="h-5 w-5" aria-hidden /> {t("uploadGallery")}
        </button>
      </div>

      <section className="rounded-2xl border border-line bg-white p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-2">
          <Sparkles className="h-4 w-4 text-forest-2" aria-hidden /> Demo samples (not real photos)
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SAMPLES.map(([key, label, file]) => (
            <button key={key} disabled={isAnalyzing} onClick={() => processImageFile(new File(["demo"], file, { type: "image/jpeg" }), true)} className="min-h-11 rounded-xl border border-line px-3 text-sm font-medium text-ink transition hover:border-forest-2 hover:bg-paper disabled:opacity-50">
              {label}
            </button>
          ))}
        </div>
      </section>
    </motion.div>
  );
};
