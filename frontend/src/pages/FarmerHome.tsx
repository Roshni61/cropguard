import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Camera, Sun, CloudRain, ShieldAlert, Sparkles, Sprout, ArrowRight, Activity, MapPin } from "lucide-react";
import { useTranslation } from "../i18n/I18nContext";

interface FarmerHomeProps {
  onScanClick: () => void;
  onNavigate: (tab: string) => void;
  weatherData: any;
  riskData: any;
  onSelectSampleImage: (sampleKey: string) => void;
}

export const FarmerHome: React.FC<FarmerHomeProps> = ({
  onScanClick,
  onNavigate,
  weatherData,
  riskData,
  onSelectSampleImage
}) => {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

  const containerVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.07,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.35,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-16"
    >
      {/* 1. Farmer Greeting Banner */}
      <motion.div 
        variants={itemVariants}
        className="relative bg-forest farm-gradient-fallback rounded-3xl p-6 sm:p-8 text-white shadow-[var(--shadow-lift)] border border-forest-2 overflow-hidden"
      >
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-lime/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-lime rounded-full text-xs font-semibold backdrop-blur-sm border border-white/10">
              <MapPin className="w-3.5 h-3.5 text-lime" />
              <span>Coimbatore, Tamil Nadu</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t("greeting")}
            </h2>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl font-normal">
              {t("subGreeting")}
            </p>
          </div>
          <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-white/10 border border-white/20 items-center justify-center shrink-0 shadow-inner">
            <Sprout className="w-8 h-8 text-lime" />
          </div>
        </div>
      </motion.div>

      {/* 2. Dominant Scan Crop Card */}
      <motion.div 
        variants={itemVariants}
        className="text-center bg-white rounded-3xl p-6 sm:p-8 shadow-[var(--shadow-soft)] border border-line relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-36 h-36 bg-leaf-light rounded-full blur-2xl opacity-70 pointer-events-none" />
        
        <p className="text-xs font-bold text-forest uppercase tracking-widest mb-3">
          Instant Crop Disease Diagnosis
        </p>

        {/* Hero-Styled Scan Button */}
        <button
          onClick={onScanClick}
          className="w-full max-w-md mx-auto py-5 px-8 rounded-full bg-forest hover:bg-forest-hover text-cream font-extrabold text-lg sm:text-xl tracking-wide shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] hover:-translate-y-0.5 active:translate-y-0 border border-lime/30 motion-safe:transition-all motion-reduce:transition-none motion-reduce:transform-none flex items-center justify-center gap-3 cursor-pointer group"
        >
          <Camera className="w-7 h-7 text-lime stroke-[2.5] group-hover:scale-110 transition-transform" />
          <span>{t("scanMyCrop")}</span>
        </button>

        <p className="text-xs text-ink-2 mt-3.5 font-medium">
          📸 Quick 1-second capture • Works offline without network • Instant Grad-CAM explanation
        </p>
      </motion.div>

      {/* 3. Demo Sample Testers - Hidden in production unless VITE_DEMO_MODE=true */}
      {isDemoMode && (
        <motion.div 
          variants={itemVariants}
          className="bg-cream border border-line rounded-3xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-forest" />
              <span className="text-xs font-bold text-forest uppercase tracking-wider">
                Diagnostic Test Samples
              </span>
            </div>
            <span className="text-[10px] bg-forest/10 text-forest px-2.5 py-0.5 rounded-full font-bold">
              Demo Test
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            <button
              onClick={() => onSelectSampleImage("early_blight")}
              className="p-3 bg-white border border-line rounded-2xl text-center text-xs hover:border-forest-2 hover:shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <div className="text-xl mb-1">🍅</div>
              <div className="font-bold text-ink text-[11px] truncate">Early Blight</div>
              <div className="text-[9px] text-leaf font-bold">High Conf</div>
            </button>

            <button
              onClick={() => onSelectSampleImage("late_blight")}
              className="p-3 bg-white border border-line rounded-2xl text-center text-xs hover:border-forest-2 hover:shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <div className="text-xl mb-1">🍂</div>
              <div className="font-bold text-ink text-[11px] truncate">Late Blight</div>
              <div className="text-[9px] text-amber-700 font-bold">Severe</div>
            </button>

            <button
              onClick={() => onSelectSampleImage("healthy")}
              className="p-3 bg-white border border-line rounded-2xl text-center text-xs hover:border-forest-2 hover:shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <div className="text-xl mb-1">🌱</div>
              <div className="font-bold text-ink text-[11px] truncate">Healthy</div>
              <div className="text-[9px] text-leaf font-bold">96% Conf</div>
            </button>

            <button
              onClick={() => onSelectSampleImage("blurry")}
              className="p-3 bg-white border border-line rounded-2xl text-center text-xs hover:border-forest-2 hover:shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <div className="text-xl mb-1">🌀</div>
              <div className="font-bold text-ink text-[11px] truncate">Blurry Photo</div>
              <div className="text-[9px] text-amber-700 font-bold">Quality Error</div>
            </button>

            <button
              onClick={() => onSelectSampleImage("dark")}
              className="p-3 bg-white border border-line rounded-2xl text-center text-xs hover:border-forest-2 hover:shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <div className="text-xl mb-1">🌑</div>
              <div className="font-bold text-ink text-[11px] truncate">Too Dark</div>
              <div className="text-[9px] text-amber-700 font-bold">Quality Error</div>
            </button>

            <button
              onClick={() => onSelectSampleImage("lowconf")}
              className="p-3 bg-white border border-line rounded-2xl text-center text-xs hover:border-forest-2 hover:shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <div className="text-xl mb-1">❓</div>
              <div className="font-bold text-ink text-[11px] truncate">Unclear Leaf</div>
              <div className="text-[9px] text-amber-700 font-bold">Low Conf (42%)</div>
            </button>
          </div>
        </motion.div>
      )}

      {/* 4. Weather & Outbreak Risk Widgets */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Weather Card */}
        <div className="bg-white rounded-3xl p-5 shadow-[var(--shadow-soft)] border border-line flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs text-ink-2 font-bold uppercase tracking-wider">
              {weatherData.rain_probability_percent > 50 ? (
                <CloudRain className="w-4 h-4 text-blue-600" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              <span>Weather Outlook</span>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
              weatherData.spray_safe 
                ? "bg-emerald-100 text-emerald-900" 
                : "bg-red-100 text-red-900 border border-red-200"
            }`}>
              {weatherData.spray_safe ? "✓ Spray Safe" : "⚠️ DO NOT SPRAY"}
            </span>
          </div>

          <div>
            <div className="text-2xl font-black text-forest">
              {weatherData.temperature_c}°C{" "}
              <span className="text-xs font-semibold text-ink-2">| {weatherData.condition}</span>
            </div>
            <div className="text-xs text-ink-2 font-medium mt-1.5 flex items-center gap-2">
              <span>🌧️ Rain Prob: <strong className="text-forest">{weatherData.rain_probability_percent}%</strong></span>
              <span>•</span>
              <span>💨 Wind: <strong className="text-forest">{weatherData.wind_speed_kmh} km/h</strong></span>
            </div>
          </div>
        </div>

        {/* Nearby Outbreak Risk Card */}
        <div 
          onClick={() => onNavigate("alerts")}
          className="bg-white rounded-3xl p-5 shadow-[var(--shadow-soft)] border border-line cursor-pointer hover:border-forest-2 hover:shadow-[var(--shadow-lift)] transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs text-ink-2 font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>District Risk Engine</span>
            </div>
            <span className="px-2.5 py-0.5 bg-red-100 text-red-900 border border-red-200 text-[10px] font-bold rounded-full uppercase">
              {riskData.risk_level} Risk ({riskData.risk_score_percent}%)
            </span>
          </div>

          <div>
            <div className="text-sm font-bold text-forest line-clamp-1">
              Early Blight Cluster detected in {riskData.district || "Coimbatore"}
            </div>
            <p className="text-xs text-ink-2 line-clamp-2 mt-1">
              {riskData.advisory}
            </p>
          </div>
        </div>
      </motion.div>

      {/* 5. My Fields Summary */}
      <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-[var(--shadow-soft)] border border-line">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-forest" />
            <h3 className="font-bold text-base text-forest">{t("myFields")}</h3>
          </div>
          <button
            onClick={() => onNavigate("fields")}
            className="text-xs text-forest hover:text-forest-2 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-paper rounded-2xl border border-line flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white border border-line flex items-center justify-center text-xl shadow-xs">
                🍅
              </div>
              <div>
                <h4 className="font-bold text-sm text-forest">Tomato Field A (North)</h4>
                <p className="text-xs text-ink-2">2.4 acres • Stage: Fruiting • Health Score: 82%</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-lg inline-block">
                Moderate Risk
              </span>
              <p className="text-[10px] text-ink-3 mt-1">Last scan: Today</p>
            </div>
          </div>

          <div className="p-4 bg-paper rounded-2xl border border-line flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white border border-line flex items-center justify-center text-xl shadow-xs">
                🌱
              </div>
              <div>
                <h4 className="font-bold text-sm text-forest">Tomato Field B (South)</h4>
                <p className="text-xs text-ink-2">2.1 acres • Stage: Vegetative • Health Score: 94%</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-lg inline-block">
                Healthy
              </span>
              <p className="text-[10px] text-ink-3 mt-1">Last scan: 2 days ago</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
