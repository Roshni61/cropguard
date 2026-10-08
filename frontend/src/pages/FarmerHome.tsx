import React from "react";
import { Camera, Sun, ShieldAlert, Sparkles, Sprout, ArrowRight, Activity } from "lucide-react";
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

  return (
    <div className="space-y-6 pb-12">
      {/* Farmer Greeting Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-700 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between border border-emerald-600/30">
        <div>
          <span className="inline-block px-3 py-1 bg-emerald-950/40 text-emerald-200 rounded-full text-xs font-semibold mb-2">
            📍 Coimbatore, Tamil Nadu
          </span>
          <h2 className="text-2xl font-black text-emerald-50">{t("greeting")}</h2>
          <p className="text-sm text-emerald-100 mt-1">{t("subGreeting")}</p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-emerald-600/40 flex items-center justify-center border border-emerald-400/40">
          <Sprout className="w-8 h-8 text-emerald-200" />
        </div>
      </div>

      {/* DOMINANT SCAN MY CROP BUTTON (REQUIREMENT 4 & 5) */}
      <div className="text-center bg-white rounded-3xl p-6 shadow-lg border border-emerald-100 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-100 rounded-full blur-2xl opacity-60 pointer-events-none" />
        
        <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3">
          Instant Crop Disease Diagnosis
        </p>

        <button
          onClick={onScanClick}
          className="w-full max-w-md mx-auto py-5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-black text-xl tracking-wide shadow-xl hover:shadow-2xl transition transform active:scale-98 flex items-center justify-center gap-3 border-2 border-emerald-300"
        >
          <Camera className="w-8 h-8 stroke-[2.5] animate-bounce" />
          <span>{t("scanMyCrop")}</span>
        </button>

        <p className="text-xs text-slate-500 mt-3 font-medium">
          📸 Takes 1 second • Works offline • Instant Grad-CAM & Weather advice
        </p>
      </div>

      {/* QUICK DEMO SAMPLE TESTERS (REQUIREMENT 70) */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-900 uppercase">Test Demo Sample Images</span>
          </div>
          <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md font-bold">1-Click Test</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <button
            onClick={() => onSelectSampleImage("early_blight")}
            className="p-2 bg-white border border-amber-200 rounded-xl text-center text-xs hover:border-amber-500 hover:bg-amber-100 transition shadow-sm"
          >
            <div className="text-lg">🍅</div>
            <div className="font-bold text-slate-800 text-[11px]">Early Blight</div>
            <div className="text-[9px] text-emerald-600 font-bold">High Conf</div>
          </button>
          <button
            onClick={() => onSelectSampleImage("late_blight")}
            className="p-2 bg-white border border-amber-200 rounded-xl text-center text-xs hover:border-amber-500 hover:bg-amber-100 transition shadow-sm"
          >
            <div className="text-lg">🍂</div>
            <div className="font-bold text-slate-800 text-[11px]">Late Blight</div>
            <div className="text-[9px] text-red-600 font-bold">Severe</div>
          </button>
          <button
            onClick={() => onSelectSampleImage("healthy")}
            className="p-2 bg-white border border-amber-200 rounded-xl text-center text-xs hover:border-amber-500 hover:bg-amber-100 transition shadow-sm"
          >
            <div className="text-lg">🌱</div>
            <div className="font-bold text-slate-800 text-[11px]">Healthy</div>
            <div className="text-[9px] text-emerald-600 font-bold">96% Conf</div>
          </button>
          <button
            onClick={() => onSelectSampleImage("blurry")}
            className="p-2 bg-white border border-amber-200 rounded-xl text-center text-xs hover:border-amber-500 hover:bg-amber-100 transition shadow-sm"
          >
            <div className="text-lg">🌀</div>
            <div className="font-bold text-slate-800 text-[11px]">Blurry Photo</div>
            <div className="text-[9px] text-amber-700 font-bold">Quality Error</div>
          </button>
          <button
            onClick={() => onSelectSampleImage("dark")}
            className="p-2 bg-white border border-amber-200 rounded-xl text-center text-xs hover:border-amber-500 hover:bg-amber-100 transition shadow-sm"
          >
            <div className="text-lg">🌑</div>
            <div className="font-bold text-slate-800 text-[11px]">Too Dark</div>
            <div className="text-[9px] text-amber-700 font-bold">Quality Error</div>
          </button>
          <button
            onClick={() => onSelectSampleImage("lowconf")}
            className="p-2 bg-white border border-amber-200 rounded-xl text-center text-xs hover:border-amber-500 hover:bg-amber-100 transition shadow-sm"
          >
            <div className="text-lg">❓</div>
            <div className="font-bold text-slate-800 text-[11px]">Unclear Leaf</div>
            <div className="text-[9px] text-amber-700 font-bold">Low Conf (42%)</div>
          </button>
        </div>
      </div>

      {/* WEATHER & RISK SUMMARY WIDGETS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Weather Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Weather Outlook</span>
            </div>
            <div className="text-xl font-black text-slate-800 mt-1">
              {weatherData.temperature_c}°C <span className="text-sm font-normal text-slate-500">| {weatherData.condition}</span>
            </div>
            <div className="text-xs text-amber-700 font-semibold mt-1">
              🌧️ Rain Prob: {weatherData.rain_probability_percent}% • Wind: {weatherData.wind_speed_kmh} km/h
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-xl text-xs font-bold text-center ${weatherData.spray_safe ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
            {weatherData.spray_safe ? "Spray Safe" : "DO NOT SPRAY"}
          </div>
        </div>

        {/* Nearby Outbreak Risk Card */}
        <div 
          onClick={() => onNavigate("alerts")}
          className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 cursor-pointer hover:border-amber-400 transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <span>Nearby Disease Risk</span>
            </div>
            <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded-md uppercase">
              {riskData.risk_level} Risk ({riskData.risk_score_percent}%)
            </span>
          </div>
          <div className="text-sm font-bold text-slate-800 mt-2">
            Early Blight Cluster detected in Coimbatore
          </div>
          <p className="text-xs text-slate-500 line-clamp-1 mt-1">
            {riskData.advisory}
          </p>
        </div>
      </div>

      {/* MY FIELDS QUICK SUMMARY */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-800">{t("myFields")}</h3>
          </div>
          <button
            onClick={() => onNavigate("fields")}
            className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-lg font-bold">
                🍅
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">Tomato Field A (North)</h4>
                <p className="text-xs text-slate-500">2.4 acres • Stage: Fruiting • Health Score: 82%</p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg">
                Moderate Risk
              </span>
              <p className="text-[10px] text-slate-400 mt-1">Last scan: Today</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-lg font-bold">
                🌱
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">Tomato Field B (South)</h4>
                <p className="text-xs text-slate-500">2.1 acres • Stage: Vegetative • Health Score: 94%</p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg">
                Healthy
              </span>
              <p className="text-[10px] text-slate-400 mt-1">Last scan: 2 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
