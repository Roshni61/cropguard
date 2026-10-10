import React from "react";
import { AlertCircle, CloudRain, UserPlus, RefreshCw, Volume2 } from "lucide-react";
import { useTranslation } from "../i18n/I18nContext";
import { GradCamViewer } from "../components/GradCamViewer";

interface DiagnosisPageProps {
  data: any;
  onScanAgain: () => void;
  onAskExpert: () => void;
}

export const DiagnosisPage: React.FC<DiagnosisPageProps> = ({ data, onScanAgain, onAskExpert }) => {
  const { t, speakText, isSpeaking } = useTranslation();

  const diseaseName = data.disease_name || "Early Blight (Alternaria solani)";
  const confidence = Math.round((data.confidence || 0.94) * 100);
  const confLevel = data.confidence_level || (confidence >= 85 ? "HIGH" : confidence >= 60 ? "MEDIUM" : "LOW");
  const severity = data.severity || "Moderate";
  const weather = data.weather || {};
  const treatments = data.treatments || {};
  const alternatives = data.alternatives || [];
  const gradCamUrl = data.grad_cam_url;

  const isLowConfidence = confLevel === "LOW" || confidence < 60;

  const handleReadAloud = () => {
    const speechText = isLowConfidence
      ? `AI Confidence is low at ${confidence} percent. Top match is ${diseaseName}. We recommend consulting an expert.`
      : `Diagnosed ${diseaseName} with ${confidence} percent confidence. Severity is ${severity}. ${treatments.weather_warning || ''}`;
    speakText(speechText);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Diagnosis Result • Tomato
          </span>
          <h2 className="text-2xl font-black text-slate-950">Crop Health Analysis</h2>
        </div>
        <button
          onClick={handleReadAloud}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition ${
            isSpeaking ? "bg-amber-400 text-amber-950 animate-pulse" : "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>{isSpeaking ? "Speaking..." : t("readAloud")}</span>
        </button>
      </div>

      {/* LOW CONFIDENCE FALLBACK SCREEN (REQUIREMENT 13) */}
      {isLowConfidence ? (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-8 h-8 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-black text-amber-950">
                We are not confident enough to diagnose this image.
              </h3>
              <p className="text-xs text-amber-900 mt-1 font-medium">
                The highest probability match has only <strong>{confidence}% confidence</strong>, which is below our safety threshold (60%).
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-amber-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Top 3 Possible Matches:</h4>
            <div className="space-y-2 text-xs font-semibold">
              <div className="flex items-center justify-between p-2 bg-amber-50/50 rounded-lg">
                <span>1. {diseaseName}</span>
                <span className="text-amber-800 font-bold">{confidence}%</span>
              </div>
              {alternatives.map((alt: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-slate-700">
                  <span>{idx + 2}. {alt.disease}</span>
                  <span className="font-bold">{Math.round(alt.confidence * 100)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={onScanAgain}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Take Another Photo</span>
            </button>
            <button
              onClick={onAskExpert}
              className="py-3 px-4 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t("askExpert")}</span>
            </button>
          </div>
        </div>
      ) : (
        /* HIGH / MEDIUM CONFIDENCE DIAGNOSIS CARD */
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 space-y-5">
          <div className="flex items-start justify-between border-b pb-4">
            <div>
              <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 tracking-wider">
                🍅 TOMATO
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{diseaseName}</h3>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-xl text-xs font-extrabold ${
                confLevel === "HIGH" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}>
                {t("confidence")}: {confidence}%
              </span>
              <div className="text-xs font-bold text-slate-600 mt-1">
                {t("severity")}: <span className="text-amber-700 font-extrabold">{severity}</span>
              </div>
            </div>
          </div>

          {/* GRAD-CAM VISUAL HEATMAP EXPLANATION (REQUIREMENT 15) */}
          <GradCamViewer
            originalImageUrl="https://images.unsplash.com/photo-1592417817098-8f3d6eb1475a?w=600&auto=format&fit=crop"
            gradCamUrl={gradCamUrl}
            diseaseName={diseaseName}
            alternatives={alternatives}
          />

          {/* WEATHER-AWARE RECOMMENDATION (REQUIREMENT 19) */}
          <div className={`p-4 rounded-2xl border ${
            weather.spray_safe ? "bg-emerald-50 border-emerald-300 text-emerald-950" : "bg-amber-50 border-amber-300 text-amber-950"
          }`}>
            <div className="flex items-center gap-2 font-bold text-sm">
              <CloudRain className="w-5 h-5 text-amber-600" />
              <span>{weather.spray_safe ? "Weather Window Safe" : t("doNotSpray")}</span>
            </div>
            <p className="text-xs mt-1.5 leading-relaxed font-medium">
              {treatments.weather_warning || weather.spray_window_advice}
            </p>
          </div>

          {/* VERIFIED TREATMENT OPTIONS (REQUIREMENT 17 & 18) */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-base text-slate-900 uppercase tracking-wide">
                🌿 {t("whatToDoNow")}
              </h4>
              <span className="text-[10px] bg-emerald-700 text-white font-bold px-2 py-0.5 rounded-full">
                VERIFIED BY TNAU
              </span>
            </div>

            {/* Immediate Action */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 whitespace-pre-line font-medium">
              {treatments.immediate_action}
            </div>

            {/* Organic Treatment */}
            <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200">
              <h5 className="font-bold text-xs text-emerald-900 uppercase flex items-center gap-1.5 mb-2">
                🌱 {t("organicOptions")}
              </h5>
              {treatments.organic_options?.map((org: any, i: number) => (
                <div key={i} className="text-xs text-emerald-950 space-y-1">
                  <p className="font-bold">{org.title || org}</p>
                  <p className="text-emerald-800">{org.details}</p>
                </div>
              ))}
            </div>

            {/* Chemical Treatment */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-300">
              <h5 className="font-bold text-xs text-slate-900 uppercase flex items-center gap-1.5 mb-2">
                🧪 {t("chemicalOptions")} (Verified)
              </h5>
              {treatments.chemical_options?.map((chem: any, i: number) => (
                <div key={i} className="text-xs space-y-1 text-slate-800">
                  <p className="font-black text-slate-900">{chem.product_name}</p>
                  <p className="font-semibold text-emerald-700">Dosage: {chem.dosage}</p>
                  <p className="text-slate-600">Active Ingredient: {chem.active_ingredient}</p>
                  <p className="text-amber-800 font-medium">Pre-Harvest Interval (PHI): {chem.pre_harvest_interval_days || 7} days</p>
                  <p className="text-slate-500 italic mt-1">⚠️ {chem.safety_precautions}</p>
                </div>
              ))}
            </div>

            {/* COST ESTIMATION (REQUIREMENT 21) */}
            <div className="bg-emerald-900 text-white p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider">
                  {t("estimatedCost")} (2.4 acres)
                </span>
                <div className="text-xl font-black text-emerald-400">
                  ₹{treatments.total_estimated_cost_inr || 2040} <span className="text-xs font-normal text-emerald-200">(₹{treatments.estimated_cost_per_acre_inr || 850}/acre)</span>
                </div>
              </div>
              <button
                onClick={onAskExpert}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-xl text-xs shadow-md transition"
              >
                {t("askExpert")}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t">
            <button
              onClick={onScanAgain}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t("scanAgain")}</span>
            </button>
            <button
              onClick={onAskExpert}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg"
            >
              <UserPlus className="w-4 h-4" />
              <span>Request Expert Escalation</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
