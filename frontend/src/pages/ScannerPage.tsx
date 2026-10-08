import React, { useState, useRef } from "react";
import { Camera, Upload, AlertTriangle, RefreshCw, Sparkles } from "lucide-react";
import { useTranslation } from "../i18n/I18nContext";
import { analyzeCropImageAPI } from "../services/api";

interface ScannerPageProps {
  onDiagnosisComplete: (resultData: any) => void;
  selectedSample?: string | null;
}

export const ScannerPage: React.FC<ScannerPageProps> = ({ onDiagnosisComplete }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [qualityError, setQualityError] = useState<string | null>(null);

  const processImageFile = async (file: File, field_id = "fld-01") => {
    setIsAnalyzing(true);
    setQualityError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("field_id", field_id);
    formData.append("leaf_part", "leaf");
    formData.append("client_scan_id", `scan-${Date.now()}`);

    const res = await analyzeCropImageAPI(formData);
    setIsAnalyzing(false);

    if (res.success) {
      onDiagnosisComplete(res.data);
    } else if (res.quality && res.quality.status !== "GOOD") {
      setQualityError(res.quality.reasons[0] || "Image quality is insufficient. Please retake photo.");
    } else {
      setQualityError("Unable to diagnose image. Please take a clearer photo.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const triggerSampleTest = (type: string) => {
    // Generate synthetic mock File matching test scenario
    let fileName = "early_blight_tomato.jpg";
    if (type === "blurry") fileName = "blurry_leaf.jpg";
    else if (type === "dark") fileName = "dark_leaf.jpg";
    else if (type === "late_blight") fileName = "late_blight_tomato.jpg";
    else if (type === "healthy") fileName = "healthy_tomato.jpg";
    else if (type === "lowconf") fileName = "lowconf_unclear.jpg";

    const mockFile = new File(["dummy_image_content"], fileName, { type: "image/jpeg" });
    processImageFile(mockFile);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-slate-900">{t("scanMyCrop")}</h2>
        <p className="text-xs text-slate-600 font-medium">
          {t("placeLeafInFrame")}
        </p>
      </div>

      {/* CAMERA VIEWFINDER FRAME */}
      <div className="relative aspect-square max-w-sm mx-auto bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-emerald-500 flex flex-col items-center justify-center p-6 text-center">
        {/* Frame Overlay Guide */}
        <div className="absolute inset-8 border-2 border-dashed border-emerald-400/70 rounded-2xl pointer-events-none flex items-center justify-center">
          <span className="text-[10px] text-emerald-300 bg-black/60 px-2 py-1 rounded-md font-mono">
            Center Leaf Affected Area Here
          </span>
        </div>

        {isAnalyzing ? (
          <div className="space-y-4 z-10">
            <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin mx-auto" />
            <p className="text-sm font-bold text-white tracking-wide animate-pulse">
              {t("analyzing")}
            </p>
          </div>
        ) : (
          <div className="space-y-4 z-10">
            <div className="w-20 h-20 bg-emerald-800/80 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-400 shadow-inner">
              <Camera className="w-10 h-10 text-emerald-300" />
            </div>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              Hold camera steady in natural sunlight. Keep leaf 15-20 cm away.
            </p>
          </div>
        )}
      </div>

      {/* IMAGE QUALITY WARNING BADGE (REQUIREMENT 10) */}
      {qualityError && (
        <div className="bg-amber-100 border-2 border-amber-400 text-amber-900 rounded-2xl p-4 flex items-start gap-3 shadow-md animate-shake">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Image Quality Issue Detected</h4>
            <p className="text-xs mt-1 font-medium text-amber-800">{qualityError}</p>
            <div className="mt-2 text-[11px] font-bold text-amber-900 underline">
              Tip: Move to brighter sunlight and keep your hand steady.
            </div>
          </div>
        </div>
      )}

      {/* SCAN ACTION BUTTONS */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isAnalyzing}
          className="py-4 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition"
        >
          <Camera className="w-5 h-5" />
          <span>{t("takePhoto")}</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isAnalyzing}
          className="py-4 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition"
        >
          <Upload className="w-5 h-5" />
          <span>{t("uploadGallery")}</span>
        </button>
      </div>

      {/* QUICK PRE-SET SAMPLE SCENARIOS */}
      <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-bold text-slate-800 uppercase">Or Select Sample Test Photo:</h4>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <button
            onClick={() => triggerSampleTest("early_blight")}
            className="p-2.5 bg-white rounded-xl border border-slate-300 hover:border-emerald-500 font-semibold text-slate-700 shadow-sm"
          >
            🍅 Early Blight (94%)
          </button>
          <button
            onClick={() => triggerSampleTest("late_blight")}
            className="p-2.5 bg-white rounded-xl border border-slate-300 hover:border-emerald-500 font-semibold text-slate-700 shadow-sm"
          >
            🍂 Late Blight (92%)
          </button>
          <button
            onClick={() => triggerSampleTest("healthy")}
            className="p-2.5 bg-white rounded-xl border border-slate-300 hover:border-emerald-500 font-semibold text-slate-700 shadow-sm"
          >
            🌱 Healthy (96%)
          </button>
          <button
            onClick={() => triggerSampleTest("blurry")}
            className="p-2.5 bg-white rounded-xl border border-slate-300 hover:border-amber-500 font-semibold text-slate-700 shadow-sm"
          >
            🌀 Test Blur Check
          </button>
          <button
            onClick={() => triggerSampleTest("dark")}
            className="p-2.5 bg-white rounded-xl border border-slate-300 hover:border-amber-500 font-semibold text-slate-700 shadow-sm"
          >
            🌑 Test Dark Check
          </button>
          <button
            onClick={() => triggerSampleTest("lowconf")}
            className="p-2.5 bg-white rounded-xl border border-slate-300 hover:border-amber-500 font-semibold text-slate-700 shadow-sm"
          >
            ❓ Test Low Conf (42%)
          </button>
        </div>
      </div>
    </div>
  );
};
