import React, { useState } from "react";
import { Eye, Layers } from "lucide-react";
import { useTranslation } from "../i18n/I18nContext";

interface GradCamViewerProps {
  originalImageUrl: string;
  gradCamUrl?: string;
  diseaseName: string;
}

export const GradCamViewer: React.FC<GradCamViewerProps> = ({ originalImageUrl, gradCamUrl, diseaseName }) => {
  const { t } = useTranslation();
  const [showHeatmap, setShowHeatmap] = useState(true);

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-base text-slate-100">{t("whyAiThoughtThis")}</h3>
        </div>
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{showHeatmap ? "Show Original Image" : "Show AI Attention Heatmap"}</span>
        </button>
      </div>

      <div className="relative aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-700">
        {showHeatmap && gradCamUrl ? (
          <img src={gradCamUrl} alt="Grad-CAM Heatmap" className="w-full h-full object-contain" />
        ) : (
          <img src={originalImageUrl} alt="Crop Leaf" className="w-full h-full object-contain" />
        )}

        <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-medium text-emerald-300 flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full ${showHeatmap ? "bg-red-500 animate-ping" : "bg-emerald-400"}`} />
          <span>{showHeatmap ? "Grad-CAM Attention Overlay" : "Original Capture"}</span>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-300 leading-relaxed bg-slate-800/80 p-3 rounded-xl border border-slate-700">
        💡 <strong className="text-emerald-300">{t("gradCamExplanation")}</strong> The red & yellow hotspot regions highlight where the vision neural network identified concentric lesion rings and foliage chlorosis characteristic of <em>{diseaseName}</em>.
      </p>
    </div>
  );
};
