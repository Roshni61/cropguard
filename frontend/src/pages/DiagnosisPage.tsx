import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle, CloudRain, UserPlus, RefreshCw, Volume2, ShieldCheck, Sprout, FlaskConical, CheckCircle2 } from "lucide-react";
import { useTranslation } from "../i18n/I18nContext";
import { GradCamViewer } from "../components/GradCamViewer";

interface DiagnosisPageProps {
  data: any;
  onScanAgain: () => void;
  onAskExpert: () => void;
}

export const DiagnosisPage: React.FC<DiagnosisPageProps> = ({ data, onScanAgain, onAskExpert }) => {
  const { t, speakText, isSpeaking } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

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
    <motion.div 
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] as const }}
      className="max-w-3xl mx-auto space-y-6 pb-16"
    >
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold uppercase tracking-wider">
            <Sprout className="w-3.5 h-3.5" />
            <span>Pathology Diagnostic Report • Tomato</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-forest tracking-tight">Crop Health Analysis</h2>
        </div>

        {/* Read Aloud Audio Button */}
        <button
          onClick={handleReadAloud}
          aria-label={isSpeaking ? "Speaking diagnosis" : "Read diagnosis aloud"}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
            isSpeaking 
              ? "bg-amber-300 text-amber-950 animate-pulse border border-amber-400" 
              : "bg-white hover:bg-paper text-forest border border-line hover:border-forest-2 hover:-translate-y-0.5 active:translate-y-0"
          }`}
        >
          <Volume2 className="w-4 h-4 text-forest" />
          <span>{isSpeaking ? "Speaking..." : t("readAloud")}</span>
        </button>
      </div>

      {/* 2. Low Confidence Fallback Screen */}
      {isLowConfidence ? (
        <div className="bg-amber-50/90 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 space-y-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-200/60 border border-amber-300 flex items-center justify-center shrink-0">
              <AlertCircle className="w-7 h-7 text-amber-800" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-black text-amber-950">
                Confidence Below Threshold (Threshold: 60%)
              </h3>
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-normal">
                The top computer vision match has only <strong>{confidence}% confidence</strong>. To protect your crop and prevent incorrect chemical applications, we do not issue an unconfirmed diagnosis.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-ink-2 uppercase tracking-wider">
              Top Diagnostic Possibilities:
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-xs sm:text-sm font-semibold text-amber-950">
                <span>1. {diseaseName}</span>
                <span className="font-black text-amber-800">{confidence}% match</span>
              </div>
              {alternatives.map((alt: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-paper rounded-xl border border-line text-xs sm:text-sm font-medium text-ink">
                  <span>{idx + 2}. {alt.disease}</span>
                  <span className="font-bold text-ink-2">{Math.round(alt.confidence * 100)}% match</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <button
              onClick={onScanAgain}
              className="py-3.5 px-6 bg-forest hover:bg-forest-hover text-cream font-bold rounded-full text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[var(--shadow-soft)] hover:-translate-y-0.5 active:translate-y-0 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-lime" />
              <span>Capture Clearer Photo</span>
            </button>
            <button
              onClick={onAskExpert}
              className="py-3.5 px-6 bg-amber-400 hover:bg-amber-300 text-amber-950 font-extrabold rounded-full text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 active:translate-y-0 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-amber-950" />
              <span>{t("askExpert")} (Escalate)</span>
            </button>
          </div>
        </div>
      ) : (
        /* 3. High / Medium Confidence Diagnostic Showcase */
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[var(--shadow-lift)] border border-line space-y-6">
          {/* Diagnostic Badge & Disease Title */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-line pb-5">
            <div className="space-y-1.5">
              <span className="inline-block text-[11px] font-extrabold uppercase px-3 py-1 rounded-full bg-forest/10 text-forest tracking-wider">
                🍅 TOMATO CROP
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-forest">{diseaseName}</h3>
            </div>
            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 text-right">
              <span className={`inline-block px-3.5 py-1.5 rounded-full text-xs font-black shadow-xs ${
                confLevel === "HIGH" 
                  ? "bg-emerald-100 text-emerald-950 border border-emerald-200" 
                  : "bg-amber-100 text-amber-950 border border-amber-200"
              }`}>
                {t("confidence")}: {confidence}% ({confLevel})
              </span>
              <div className="text-xs font-semibold text-ink-2 mt-1">
                {t("severity")}: <span className="text-forest font-bold">{severity}</span>
              </div>
            </div>
          </div>

          {/* Grad-CAM Attention Heatmap Component */}
          <GradCamViewer
            originalImageUrl="/images/farmer_crop_inspection.jpg"
            gradCamUrl={gradCamUrl}
            diseaseName={diseaseName}
            alternatives={alternatives}
          />

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
              {treatments.weather_warning || weather.spray_window_advice}
            </p>
          </div>

          {/* Agronomic Treatments Section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-base sm:text-lg text-forest tracking-tight flex items-center gap-2">
                <Sprout className="w-5 h-5 text-forest" />
                <span>{t("whatToDoNow")}</span>
              </h4>
              <span className="inline-flex items-center gap-1 text-[10px] bg-forest text-lime font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified by TNAU</span>
              </span>
            </div>

            {/* Immediate Action */}
            <div className="p-4 bg-paper rounded-2xl border border-line text-xs sm:text-sm text-ink whitespace-pre-line font-medium leading-relaxed">
              <span className="font-bold text-forest block mb-1">Immediate Field Steps:</span>
              {treatments.immediate_action}
            </div>

            {/* Organic Options */}
            <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-200/80 space-y-3">
              <h5 className="font-bold text-xs uppercase text-emerald-900 tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>{t("organicOptions")} (Biological Control)</span>
              </h5>
              {treatments.organic_options?.map((org: any, i: number) => (
                <div key={i} className="text-xs sm:text-sm text-emerald-950 space-y-1">
                  <p className="font-bold text-forest">{org.title || org}</p>
                  <p className="text-emerald-900 leading-relaxed font-normal">{org.details}</p>
                </div>
              ))}
            </div>

            {/* Chemical Options */}
            <div className="bg-white rounded-2xl p-5 border border-line shadow-xs space-y-3">
              <h5 className="font-bold text-xs uppercase text-ink-2 tracking-wider flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4 text-forest" />
                <span>{t("chemicalOptions")} (University Prescribed)</span>
              </h5>
              {treatments.chemical_options?.map((chem: any, i: number) => (
                <div key={i} className="text-xs sm:text-sm space-y-1.5 text-ink">
                  <p className="font-black text-forest text-sm sm:text-base">{chem.product_name}</p>
                  <div className="flex flex-wrap gap-2 text-xs pt-0.5">
                    <span className="px-2 py-0.5 rounded-md bg-paper border border-line font-bold text-forest">
                      Dosage: {chem.dosage}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-paper border border-line text-ink-2 font-medium">
                      Active: {chem.active_ingredient}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-bold">
                      Pre-Harvest Interval (PHI): {chem.pre_harvest_interval_days || 7} days
                    </span>
                  </div>
                  {chem.safety_precautions && (
                    <p className="text-xs text-ink-2 italic pt-1">
                      ⚠️ Safety precaution: {chem.safety_precautions}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Treatment Cost Planning Card */}
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
                {t("askExpert")}
              </button>
            </div>
          </div>

          {/* Action Footer Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4 border-t border-line">
            <button
              onClick={onScanAgain}
              className="py-4 px-6 bg-forest hover:bg-forest-hover text-cream font-bold rounded-full text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] hover:-translate-y-0.5 active:translate-y-0 border border-lime/30 motion-safe:transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-lime" />
              <span>{t("scanAgain")}</span>
            </button>
            <button
              onClick={onAskExpert}
              className="py-4 px-6 bg-white hover:bg-paper text-forest font-bold rounded-full text-xs sm:text-sm flex items-center justify-center gap-2 border border-line shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 motion-safe:transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-forest" />
              <span>Request Extension Escalation</span>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
