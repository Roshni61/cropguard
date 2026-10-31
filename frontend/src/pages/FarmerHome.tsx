import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { 
  Camera, Sun, CloudRain, ShieldAlert, Sparkles, Sprout, 
  ArrowRight, Activity, MapPin, TrendingUp, Droplets, Wind, 
  CheckCircle2, Clock, Phone, Building2, BookOpen, History, Store
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useTranslation } from "../i18n/I18nContext";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { LocationSelectorModal } from "../components/LocationSelectorModal";
import { TN_DISTRICTS, type TNDistrict, type VillageTown, getTNDistrictById } from "../data/tamilNaduLocations";
import { fetchUserFieldsAPI, fetchRecentScansAPI, type FieldItem, type RecentScanItem } from "../services/api";

interface FarmerHomeProps {
  onScanClick: () => void;
  onNavigate: (tab: string) => void;
  weatherData: any;
  riskData: any;
  onSelectSampleImage: (sampleKey: string) => void;
  onSwitchToSimple?: () => void;
  user?: any;
  currentDistrict?: TNDistrict;
  currentTown?: VillageTown;
  onLocationChange?: (district: TNDistrict, town: VillageTown) => void;
}

export const FarmerHome: React.FC<FarmerHomeProps> = ({
  onScanClick,
  onNavigate,
  weatherData,
  riskData,
  onSelectSampleImage,
  onSwitchToSimple,
  user,
  currentDistrict,
  currentTown,
  onLocationChange,
}) => {
  const { t, language } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

  // Location Management
  const [district, setDistrict] = useState<TNDistrict>(() => {
    if (currentDistrict) return currentDistrict;
    const stored = localStorage.getItem("cropguard_district_id");
    return stored ? getTNDistrictById(stored) : TN_DISTRICTS.coimbatore;
  });

  const [town, setTown] = useState<VillageTown>(() => {
    if (currentTown) return currentTown;
    const storedTown = localStorage.getItem("cropguard_town_name");
    const matched = district.townsAndVillages.find(t => t.name === storedTown);
    return matched || district.townsAndVillages[0];
  });

  const [showLocationModal, setShowLocationModal] = useState(false);

  // Real fields & recent scans
  const [fields, setFields] = useState<FieldItem[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>("fld-demo-01");
  const [recentScans, setRecentScans] = useState<RecentScanItem[]>([]);

  useEffect(() => {
    if (currentDistrict) setDistrict(currentDistrict);
    if (currentTown) setTown(currentTown);
  }, [currentDistrict, currentTown]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([fetchUserFieldsAPI(), fetchRecentScansAPI()]).then(([fList, sList]) => {
      if (isMounted) {
        setFields(fList);
        if (fList.length > 0) setSelectedFieldId(fList[0].id);
        setRecentScans(sList);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const handleLocationSelected = (newDist: TNDistrict, newTown: VillageTown) => {
    setDistrict(newDist);
    setTown(newTown);
    localStorage.setItem("cropguard_district_id", newDist.id);
    localStorage.setItem("cropguard_town_name", newTown.name);
    if (onLocationChange) {
      onLocationChange(newDist, newTown);
    }
  };

  const activeField = fields.find(f => f.id === selectedFieldId) || fields[0] || {
    id: "fld-demo-01",
    name: "Tomato Field A (North)",
    area: 2.4,
    crop: "Tomato",
    variety: "Arka Rakshak",
    crop_stage: "Fruiting Stage",
    soil_type: "Red Loam",
    irrigation_type: "Drip Irrigation",
    health_score: 82,
    health_trend: [72, 75, 78, 82]
  };

  // Personalized greeting calculation
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    const userName = user?.name ? user.name.split(" ")[0] : "Farmer";
    if (language === "ta") {
      if (hour < 12) return `காலை வணக்கம், ${userName}! 👨‍🌾`;
      if (hour < 17) return `மதிய வணக்கம், ${userName}! 👨‍🌾`;
      return `மாலை வணக்கம், ${userName}! 👨‍🌾`;
    }
    if (hour < 12) return `Good Morning, ${userName}! 👨‍🌾`;
    if (hour < 17) return `Good Afternoon, ${userName}! 👨‍🌾`;
    return `Good Evening, ${userName}! 👨‍🌾`;
  }, [user?.name, language]);

  const containerVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  // Trend data for active field
  const trendChartData = [
    { label: "W1", score: activeField.health_trend?.[0] || 72 },
    { label: "W2", score: activeField.health_trend?.[1] || 75 },
    { label: "W3", score: activeField.health_trend?.[2] || 78 },
    { label: "Current", score: activeField.health_score || 82 }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-16"
    >
      {/* 1. Personalized Farmer Greeting Banner with Location Selector */}
      <motion.div 
        variants={itemVariants}
        className="relative bg-forest farm-gradient-fallback rounded-3xl p-6 sm:p-8 text-white shadow-[var(--shadow-lift)] border border-forest-2 overflow-hidden"
      >
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-lime/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            {/* Location Pill with Change Action */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-lime rounded-full text-xs font-semibold backdrop-blur-sm border border-white/10">
              <MapPin className="w-3.5 h-3.5 text-lime" />
              <span>
                {town.name}, {district.name} ({district.zone})
              </span>
              <button
                type="button"
                onClick={() => setShowLocationModal(true)}
                className="ml-1 text-[10px] bg-lime text-forest font-black px-2 py-0.5 rounded-full hover:bg-lime/90 transition cursor-pointer"
              >
                {language === "ta" ? "மாற்று" : "Change"}
              </button>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {greeting}
            </h2>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl font-normal leading-relaxed">
              {language === "ta"
                ? `உங்கள் ${activeField.name} ஆரோக்கிய நிலை கண்காணிக்கப்படுகிறது. இன்றைய வானிலை மற்றும் நோய் தடுப்பு வழிகாட்டிகளை கீழே காண்க.`
                : `Crop health analytics and real-time disease intelligence for your active fields in ${district.name}.`}
            </p>

            {onSwitchToSimple && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onSwitchToSimple}
                  className="min-h-[44px] px-4 py-2 bg-lime hover:bg-lime/90 text-forest font-black text-xs rounded-2xl shadow-sm transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>🌾 {t("switchToSimple")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="hidden md:flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 border border-white/20 text-center shrink-0">
            <span className="text-[11px] font-bold text-lime uppercase tracking-wider">Active Field Score</span>
            <span className="text-3xl font-black text-white mt-0.5">{activeField.health_score}%</span>
            <span className="text-[10px] text-white/70">{activeField.crop} ({activeField.crop_stage})</span>
          </div>
        </div>
      </motion.div>

      {/* 2. Prominent Hero "Scan My Crop" Button Card */}
      <motion.div 
        variants={itemVariants}
        className="text-center bg-white rounded-3xl p-6 sm:p-8 shadow-[var(--shadow-soft)] border border-line relative overflow-hidden group hover:border-forest-2/60 transition-colors"
      >
        <div className="absolute top-0 right-0 w-44 h-44 bg-leaf-light rounded-full blur-3xl opacity-60 pointer-events-none" />
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-forest text-xs font-bold mb-3 border border-emerald-100">
          <Sparkles className="w-3.5 h-3.5 text-leaf" />
          <span>{language === "ta" ? "உடனடி தாவர நோய் கண்டறிதல்" : "Instant On-Device Diagnostic Engine"}</span>
        </div>

        {/* Hero-Styled Scan Button */}
        <button
          onClick={onScanClick}
          className="w-full max-w-md mx-auto py-5 px-8 rounded-full bg-forest hover:bg-forest-hover text-cream font-extrabold text-lg sm:text-xl tracking-wide shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] hover:-translate-y-0.5 active:translate-y-0 border border-lime/40 ring-4 ring-lime/20 motion-safe:transition-all motion-reduce:transition-none motion-reduce:transform-none flex items-center justify-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-full bg-lime/20 flex items-center justify-center">
            <Camera className="w-6 h-6 text-lime stroke-[2.5] group-hover:scale-110 transition-transform" />
          </div>
          <span>{t("scanMyCrop")}</span>
        </button>

        <p className="text-xs text-ink-2 mt-3.5 font-medium max-w-md mx-auto">
          {language === "ta" 
            ? "📸 1-வினாடியில் உடனடி நோய் ஆய்வு • ஆஃப்லைனிலும் செயல்படும் • விரிவான சிகிச்சை வழிகாட்டுதல்" 
            : "📸 1-second capture • Works 100% offline in field • Grad-CAM attention heatmap explanation"}
        </p>
      </motion.div>

      {/* 3. Demo Sample Testers - Shown in development/demo */}
      {isDemoMode && (
        <motion.div 
          variants={itemVariants}
          className="bg-cream border border-line rounded-3xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-forest" />
              <span className="text-xs font-bold text-forest uppercase tracking-wider">
                Preloaded Diagnostic Samples (Evaluation Suite)
              </span>
            </div>
            <span className="text-[10px] bg-forest/10 text-forest px-2.5 py-0.5 rounded-full font-bold">
              Test Pipeline
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
              <div className="text-[9px] text-amber-700 font-bold">Low Conf (&lt;60%)</div>
            </button>
          </div>
        </motion.div>
      )}

      {/* 4. Weather & Rainfall Intelligence (Configured Weather API) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weather Card */}
        <div className="bg-white rounded-3xl p-5 shadow-[var(--shadow-soft)] border border-line flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-line pb-2.5">
            <div className="flex items-center gap-2 text-xs text-ink-2 font-bold uppercase tracking-wider">
              {weatherData.rain_probability_percent > 40 ? (
                <CloudRain className="w-4 h-4 text-blue-600" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              <span>{district.name} Weather Outlook</span>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
              weatherData.spray_safe 
                ? "bg-emerald-100 text-emerald-900 border border-emerald-200" 
                : "bg-red-100 text-red-900 border border-red-200"
            }`}>
              {weatherData.spray_safe ? "✓ Spray Safe" : "⚠️ DO NOT SPRAY"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <div className="text-3xl font-black text-forest">
                {weatherData.temperature_c}°C
              </div>
              <p className="text-xs font-semibold text-ink-2 mt-0.5">{weatherData.condition}</p>
            </div>

            <div className="space-y-1.5 text-xs text-ink-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5 text-blue-500" /> Rain Prob:</span>
                <strong className="text-forest">{weatherData.rain_probability_percent}%</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-teal-500" /> Humidity:</span>
                <strong className="text-forest">{weatherData.humidity_percent}%</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Wind className="w-3.5 h-3.5 text-indigo-500" /> Wind:</span>
                <strong className="text-forest">{weatherData.wind_speed_kmh} km/h</strong>
              </div>
            </div>
          </div>

          {/* Spray Window Advisory */}
          <div className={`p-3 rounded-2xl text-xs font-medium border ${
            weatherData.spray_safe 
              ? "bg-emerald-50 text-emerald-900 border-emerald-200" 
              : "bg-red-50 text-red-900 border-red-200"
          }`}>
            <p className="leading-relaxed">{weatherData.spray_window_advice}</p>
          </div>

          {/* Source Attribution */}
          <div className="flex items-center justify-between text-[10px] text-ink-3 pt-1 border-t border-line">
            <span>Source: {weatherData.source || "Open-Meteo Weather API"}</span>
            {weatherData.updated_at && <span>Updated: {weatherData.updated_at}</span>}
          </div>
        </div>

        {/* District Disease Risk & Cluster Alert */}
        <div 
          onClick={() => onNavigate("alerts")}
          className="bg-white rounded-3xl p-5 shadow-[var(--shadow-soft)] border border-line cursor-pointer hover:border-forest-2 hover:shadow-[var(--shadow-lift)] transition-all flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between border-b border-line pb-2.5">
            <div className="flex items-center gap-2 text-xs text-ink-2 font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>District Epidemiological Risk</span>
            </div>
            <span className="px-2.5 py-0.5 bg-red-100 text-red-900 border border-red-200 text-[10px] font-bold rounded-full uppercase">
              {riskData.risk_level || "HIGH"} Risk ({riskData.risk_score_percent || 81}%)
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-forest">
              {riskData.crop || "Tomato"} Outbreak Zone • {district.name}
            </h4>
            <p className="text-xs text-ink-2 leading-relaxed line-clamp-3">
              {riskData.advisory || `High humidity and warm canopy temperatures in ${district.name} elevate spore germination.`}
            </p>
          </div>

          <div className="pt-2 border-t border-line flex items-center justify-between text-xs text-forest font-bold">
            <span>View Full District Alert Map</span>
            <ArrowRight className="w-3.5 h-3.5 text-forest" />
          </div>
        </div>
      </motion.div>

      {/* 5. My Fields with Real Field Information & Active Selector */}
      <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-[var(--shadow-soft)] border border-line space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-forest" />
            <h3 className="font-bold text-base text-forest">{t("myFields")}</h3>
            <span className="text-xs bg-paper px-2.5 py-0.5 rounded-full text-ink-2 border border-line">
              {fields.length} Registered Plots
            </span>
          </div>
          <button
            onClick={() => onNavigate("fields")}
            className="text-xs text-forest hover:text-forest-2 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Manage All Fields</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Field Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {fields.map((f) => {
            const isSelected = f.id === selectedFieldId;
            return (
              <div
                key={f.id}
                onClick={() => setSelectedFieldId(f.id)}
                className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-2.5 ${
                  isSelected 
                    ? "bg-emerald-50/50 border-forest shadow-xs ring-2 ring-lime/40" 
                    : "bg-paper border-line hover:border-forest/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-forest truncate max-w-[140px]">{f.name}</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                    f.health_score >= 90 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
                  }`}>
                    {f.health_score}%
                  </span>
                </div>

                <div className="text-[11px] text-ink-2 space-y-0.5">
                  <p>{f.area} acres • {f.crop} ({f.variety})</p>
                  <p className="font-semibold text-forest">Stage: {f.crop_stage}</p>
                  <p className="text-ink-3">{f.irrigation_type}</p>
                </div>

                {isSelected && (
                  <div className="text-[10px] text-leaf font-bold flex items-center gap-1 pt-1 border-t border-forest/15">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active Selected Field</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* 6. Crop Health Trends & Follow-ups (Recharts) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Trend Graph */}
        <div className="md:col-span-2 bg-white rounded-3xl p-5 shadow-[var(--shadow-soft)] border border-line space-y-3">
          <div className="flex items-center justify-between border-b border-line pb-2.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-forest" />
              <div>
                <h4 className="font-bold text-sm text-forest">
                  Crop Health Trend • {activeField.name}
                </h4>
                <p className="text-[10px] text-ink-3">Sequential Diagnostic Progression (Past 4 Weeks)</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              ↗ +10% Improving
            </span>
          </div>

          <div className="h-44 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendChartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stop-color="#1B4332" stop-opacity={0.35}/>
                    <stop offset="95%" stop-color="#1B4332" stop-opacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                <YAxis domain={[50, 100]} stroke="#64748b" fontSize={11} />
                <Tooltip formatter={(value: any) => [`${value}% Health Index`, "Health Score"]} />
                <Area type="monotone" dataKey="score" stroke="#1B4332" strokeWidth={2.5} fillOpacity={1} fill="url(#healthGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Seasonal Farming Tip */}
        <div className="md:col-span-1 bg-amber-50/70 border border-amber-200 rounded-3xl p-5 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 text-amber-900 mb-1">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span className="text-xs font-black uppercase tracking-wider">Seasonal Farming Advisory</span>
            </div>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              {district.zone}
            </span>

            <p className="text-xs text-amber-950 font-medium mt-2.5 leading-relaxed">
              {language === "ta" 
                ? `${district.name} பகுதியில் தக்காளிக்கு பூக்கும் பருவத்தில் போரான் (1g/L) தெளிக்கவும். மழை பெய்வதற்கு முன் வேப்ப எண்ணெய் அல்லது ட்ரைக்கோடெர்மா தெளித்து இலைப்புள்ளியை தடுக்கவும்.`
                : `For ${activeField.crop} during ${activeField.crop_stage}: Maintain drip fertigation in morning. Spray bio-fungicide Trichoderma viride @ 5g/L preventatively after rainfall stops.`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("cropguide")}
            className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{language === "ta" ? "பயிர் வழிகாட்டியை பார்" : "Explore Crop Guide"}</span>
          </button>
        </div>
      </motion.div>

      {/* 7. Recent Disease Scans & Treatment History */}
      <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-[var(--shadow-soft)] border border-line space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-forest" />
            <h3 className="font-bold text-base text-forest">Recent Disease Scans & Treatment History</h3>
          </div>
          <span className="text-xs text-ink-3">Live & Offline Queued Records</span>
        </div>

        <div className="space-y-3">
          {recentScans.map((scan) => (
            <div key={scan.id} className="p-4 bg-paper rounded-2xl border border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-forest-2 shrink-0 border border-line">
                  <ImageWithFallback
                    src={scan.image_url}
                    alt={scan.disease_name}
                    aspectRatioClass="aspect-square"
                    language={language}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-black text-sm text-forest">{scan.disease_name}</h4>
                    <span className="text-[10px] font-extrabold text-lime-900 bg-lime/40 px-2 py-0.5 rounded-full">
                      {Math.round(scan.confidence * 100)}% Conf
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      scan.severity === "Severe" ? "bg-red-100 text-red-900" : "bg-amber-100 text-amber-900"
                    }`}>
                      {scan.severity}
                    </span>
                  </div>
                  <p className="text-xs text-ink-2 mt-1">{scan.treatment_action}</p>
                  <p className="text-[10px] text-ink-3 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{scan.created_at}</span>
                  </p>
                </div>
              </div>

              <div className="shrink-0 w-full sm:w-auto text-right">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg inline-block ${
                  scan.treatment_status === "TREATED"
                    ? "bg-emerald-100 text-emerald-900"
                    : scan.treatment_status === "OBSERVATION"
                    ? "bg-blue-100 text-blue-900"
                    : "bg-amber-100 text-amber-900 border border-amber-200"
                }`}>
                  {scan.treatment_status === "TREATED" ? "✓ Treated" : scan.treatment_status === "OBSERVATION" ? "👀 Monitored" : "⚠️ Treatment Pending"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 8. Nearby Agricultural Services Directory (District KVK / TNAU / Agri Depots) */}
      <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-[var(--shadow-soft)] border border-line space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-forest" />
            <div>
              <h3 className="font-bold text-base text-forest">
                Nearby Agricultural Extension Centers • {district.name}
              </h3>
              <p className="text-xs text-ink-2">Certified TNAU & ICAR Public Extension Support</p>
            </div>
          </div>
          <span className="text-xs font-bold text-forest bg-forest/10 px-3 py-1 rounded-full">
            {district.services.length} Centers
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {district.services.map((svc, sIdx) => (
            <div key={sIdx} className="p-4 bg-paper rounded-2xl border border-line flex flex-col justify-between space-y-2">
              <div>
                <span className="text-[10px] font-bold text-forest-2 uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-line">
                  {svc.type.replace(/_/g, " ")}
                </span>
                <h4 className="font-black text-xs text-forest mt-1.5">
                  {language === "ta" ? svc.nameTa : svc.name}
                </h4>
                <p className="text-[11px] text-ink-2 mt-1 line-clamp-2">{svc.address}</p>

                <div className="flex flex-wrap gap-1 mt-2">
                  {svc.services.map((item, iIdx) => (
                    <span key={iIdx} className="text-[9px] bg-white text-ink-2 px-1.5 py-0.5 rounded border border-line">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-line flex items-center justify-between">
                <a
                  href={`tel:${svc.phone.replace(/[^0-9+]/g, "")}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:text-forest-2"
                >
                  <Phone className="w-3.5 h-3.5 text-lime-800" />
                  <span>{svc.phone}</span>
                </a>
                <span className="text-[10px] text-ink-3">Free Public Extension</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 9. Local Agri Input Retailers & Mandi Rates */}
      <motion.div variants={itemVariants} className="bg-emerald-50/90 border border-emerald-200 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-300 flex items-center justify-center shrink-0 shadow-xs">
            <Store className="w-6 h-6 text-forest" />
          </div>
          <div>
            <h4 className="font-black text-sm sm:text-base text-forest">
              {language === "ta" ? "உள்ளூர் உழவர் இடுபொருள் கடைகள் & மண்டி விலை" : "Local Agri Input Retailers & Mandi Rates"}
            </h4>
            <p className="text-xs text-ink-2 mt-0.5 leading-relaxed">
              {language === "ta"
                ? `${district.name} வட்டாரத்தில் அங்கீகரிக்கப்பட்ட உழவர் கூட்டுறவு சங்கங்கள் (PACCS), பூச்சிக்கொல்லி கடைகள் மற்றும் தினசரி மண்டி விலைகளை அறியவும்.`
                : `Locate licensed input dealers, cooperatives (PACCS), and check today's APMC mandi commodity prices in ${district.name}.`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("market")}
          className="shrink-0 px-4 py-2.5 bg-forest hover:bg-forest-hover text-cream font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
        >
          <span>{language === "ta" ? "கடைகள் & சந்தை காண்க" : "Find Shops & Rates"}</span>
          <ArrowRight className="w-3.5 h-3.5 text-lime" />
        </button>
      </motion.div>

      {/* Location Selector Modal */}
      <LocationSelectorModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        currentDistrictId={district.id}
        currentTownName={town.name}
        onSelectLocation={handleLocationSelected}
      />
    </motion.div>
  );
};
