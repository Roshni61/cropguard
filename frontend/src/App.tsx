import React, { useState, useEffect } from "react";
import { I18nProvider, useTranslation } from "./i18n/I18nContext";
import { Navbar } from "./components/Navbar";
import { FarmerHome } from "./pages/FarmerHome";
import { ScannerPage } from "./pages/ScannerPage";
import { DiagnosisPage } from "./pages/DiagnosisPage";
import { FieldsPage } from "./pages/FieldsPage";
import { AssistantPage } from "./pages/AssistantPage";
import { AlertsPage } from "./pages/AlertsPage";
import { ExpertDashboardPage } from "./pages/ExpertDashboardPage";
import { OfficerDashboardPage } from "./pages/OfficerDashboardPage";
import { MarketSchemesPage } from "./pages/MarketSchemesPage";
import { fetchWeather, fetchDiseaseRisk } from "./services/api";
import { Camera, Home, Sprout, Bot, Bell, TrendingUp } from "lucide-react";

const MainApp: React.FC = () => {
  const { t } = useTranslation();
  const [role, setRole] = useState("FARMER");
  const [activeTab, setActiveTab] = useState("home");
  const [diagnosisData, setDiagnosisData] = useState<any>(null);
  const [selectedSample, setSelectedSample] = useState<string | null>(null);

  const [weatherData, setWeatherData] = useState<any>({
    temperature_c: 29.2,
    humidity_percent: 78,
    rain_probability_percent: 82,
    wind_speed_kmh: 12.4,
    condition: "Humid / Expected Rain",
    spray_safe: false,
    spray_window_advice: "⚠️ DO NOT SPRAY NOW. Rain expected within 6 hours (82% probability)."
  });

  const [riskData, setRiskData] = useState<any>({
    crop: "Tomato",
    district: "Coimbatore",
    risk_score_percent: 81,
    risk_level: "HIGH",
    contributing_factors: [
      "High relative humidity (78%)",
      "Rainfall probability (82%)",
      "17 cluster cases in district"
    ],
    advisory: "⚠️ High Early Blight Risk (81%) in Coimbatore. Warm temperatures and high humidity create ideal conditions for fungal spore spread."
  });

  useEffect(() => {
    fetchWeather().then(w => w && setWeatherData(w));
    fetchDiseaseRisk().then(r => r && setRiskData(r));
  }, []);

  const handleDiagnosisComplete = (data: any) => {
    setDiagnosisData(data);
    setActiveTab("diagnosis");
  };

  const handleSampleSelect = (sampleKey: string) => {
    setSelectedSample(sampleKey);
    setActiveTab("scanner");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col antialiased">
      {/* Top Header & Navigation */}
      <Navbar currentRole={role} setRole={setRole} activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Screen Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
        {role === "EXPERT" ? (
          <ExpertDashboardPage />
        ) : role === "OFFICER" ? (
          <OfficerDashboardPage />
        ) : (
          <>
            {activeTab === "home" && (
              <FarmerHome
                onScanClick={() => setActiveTab("scanner")}
                onNavigate={setActiveTab}
                weatherData={weatherData}
                riskData={riskData}
                onSelectSampleImage={handleSampleSelect}
              />
            )}

            {activeTab === "scanner" && (
              <ScannerPage
                onDiagnosisComplete={handleDiagnosisComplete}
                selectedSample={selectedSample}
              />
            )}

            {activeTab === "diagnosis" && diagnosisData && (
              <DiagnosisPage
                data={diagnosisData}
                onScanAgain={() => setActiveTab("scanner")}
                onAskExpert={() => setActiveTab("assistant")}
              />
            )}

            {activeTab === "fields" && <FieldsPage />}

            {activeTab === "assistant" && <AssistantPage />}

            {activeTab === "alerts" && <AlertsPage riskData={riskData} />}

            {activeTab === "market" && <MarketSchemesPage />}
          </>
        )}
      </main>

      {/* Bottom Navigation Bar for Mobile Outdoor Ergonomics (FARMER ROLE) */}
      {role === "FARMER" && (
        <footer className="sticky bottom-0 z-40 bg-white/90 backdrop-blur-lg border-t border-slate-200 py-2 px-4 shadow-2xl">
          <div className="max-w-md mx-auto flex items-center justify-around">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex flex-col items-center gap-1 font-bold text-[10px] transition ${
                activeTab === "home" ? "text-emerald-600 scale-105" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveTab("fields")}
              className={`flex flex-col items-center gap-1 font-bold text-[10px] transition ${
                activeTab === "fields" ? "text-emerald-600 scale-105" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Sprout className="w-5 h-5" />
              <span>{t("myFields")}</span>
            </button>

            <button
              onClick={() => setActiveTab("scanner")}
              className="flex flex-col items-center gap-1 font-bold text-[10px] text-white -mt-6"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-600 to-green-500 flex items-center justify-center shadow-xl border-4 border-white animate-pulse">
                <Camera className="w-7 h-7 stroke-[2.5]" />
              </div>
              <span className="text-emerald-800 font-extrabold -mt-1">SCAN</span>
            </button>

            <button
              onClick={() => setActiveTab("assistant")}
              className={`flex flex-col items-center gap-1 font-bold text-[10px] transition ${
                activeTab === "assistant" ? "text-emerald-600 scale-105" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Bot className="w-5 h-5" />
              <span>Assistant</span>
            </button>

            <button
              onClick={() => setActiveTab("alerts")}
              className={`flex flex-col items-center gap-1 font-bold text-[10px] transition ${
                activeTab === "alerts" ? "text-emerald-600 scale-105" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Bell className="w-5 h-5" />
              <span>Alerts</span>
            </button>

            <button
              onClick={() => setActiveTab("market")}
              className={`flex flex-col items-center gap-1 font-bold text-[10px] transition ${
                activeTab === "market" ? "text-emerald-600 scale-105" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Market</span>
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default function App() {
  return (
    <I18nProvider>
      <MainApp />
    </I18nProvider>
  );
}
