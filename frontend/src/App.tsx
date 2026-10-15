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
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { fetchWeather, fetchDiseaseRisk } from "./services/api";
import { Camera, Home, Sprout, Bot, Bell, TrendingUp } from "lucide-react";

interface MainDashboardProps {
  user: any;
  onLogout: () => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({ user, onLogout }) => {
  const { t } = useTranslation();
  const [role, setRole] = useState(user?.role || "FARMER");
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
    district: user?.district || "Coimbatore",
    risk_score_percent: 81,
    risk_level: "HIGH",
    contributing_factors: [
      "High relative humidity (78%)",
      "Rainfall probability (82%)",
      "17 cluster cases in district"
    ],
    advisory: `⚠️ High Early Blight Risk (81%) in ${user?.district || "Coimbatore"}. Warm temperatures and high humidity create ideal conditions for fungal spore spread.`
  });

  useEffect(() => {
    fetchWeather().then(w => w && setWeatherData(w));
    fetchDiseaseRisk(user?.district || "Coimbatore").then(r => r && setRiskData(r));
  }, [user]);

  const handleDiagnosisComplete = (data: any) => {
    setDiagnosisData(data);
    setActiveTab("diagnosis");
  };

  const handleSampleSelect = (sampleKey: string) => {
    setSelectedSample(sampleKey);
    setActiveTab("scanner");
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans flex flex-col antialiased">
      {/* Top Header & Navigation */}
      <Navbar
        currentRole={role}
        setRole={setRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={onLogout}
      />

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
        <footer className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-line py-2.5 px-4 shadow-[var(--shadow-lift)]">
          <div className="max-w-md mx-auto flex items-center justify-around">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex flex-col items-center gap-1 font-bold text-[10px] transition-all cursor-pointer ${
                activeTab === "home" ? "text-forest scale-105 font-black" : "text-ink-2 hover:text-ink"
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveTab("fields")}
              className={`flex flex-col items-center gap-1 font-bold text-[10px] transition-all cursor-pointer ${
                activeTab === "fields" ? "text-forest scale-105 font-black" : "text-ink-2 hover:text-ink"
              }`}
            >
              <Sprout className="w-5 h-5" />
              <span>{t("myFields")}</span>
            </button>

            <button
              onClick={() => setActiveTab("scanner")}
              className="flex flex-col items-center gap-1 font-bold text-[10px] text-white -mt-6 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-forest flex items-center justify-center shadow-lg border-4 border-white hover:scale-105 active:scale-95 transition-transform">
                <Camera className="w-7 h-7 stroke-[2.5] text-lime" />
              </div>
              <span className="text-forest font-black -mt-0.5 tracking-wider">SCAN</span>
            </button>

            <button
              onClick={() => setActiveTab("assistant")}
              className={`flex flex-col items-center gap-1 font-bold text-[10px] transition-all cursor-pointer ${
                activeTab === "assistant" ? "text-forest scale-105 font-black" : "text-ink-2 hover:text-ink"
              }`}
            >
              <Bot className="w-5 h-5" />
              <span>Assistant</span>
            </button>

            <button
              onClick={() => setActiveTab("alerts")}
              className={`flex flex-col items-center gap-1 font-bold text-[10px] transition-all cursor-pointer ${
                activeTab === "alerts" ? "text-forest scale-105 font-black" : "text-ink-2 hover:text-ink"
              }`}
            >
              <Bell className="w-5 h-5" />
              <span>Alerts</span>
            </button>

            <button
              onClick={() => setActiveTab("market")}
              className={`flex flex-col items-center gap-1 font-bold text-[10px] transition-all cursor-pointer ${
                activeTab === "market" ? "text-forest scale-105 font-black" : "text-ink-2 hover:text-ink"
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
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("cropguard_token"));
  const [user, setUser] = useState<any>(() => {
    try {
      const stored = localStorage.getItem("cropguard_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [view, setView] = useState<"landing" | "login" | "register" | "dashboard">(() => {
    return token && user ? "dashboard" : "landing";
  });

  const handleAuthSuccess = (authUser: any, authToken: string) => {
    setUser(authUser);
    setToken(authToken);
    setView("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("cropguard_token");
    localStorage.removeItem("cropguard_user");
    setUser(null);
    setToken(null);
    setView("landing");
  };

  return (
    <I18nProvider>
      {view === "landing" && (
        <LandingPage
          onLoginClick={() => setView("login")}
          onRegisterClick={() => setView("register")}
          onExploreClick={() => {
            if (token && user) setView("dashboard");
            else setView("login");
          }}
        />
      )}

      {(view === "login" || view === "register") && (
        <AuthPage
          initialMode={view}
          onAuthSuccess={handleAuthSuccess}
          onBackToLanding={() => setView("landing")}
        />
      )}

      {view === "dashboard" && (
        <MainDashboard user={user} onLogout={handleLogout} />
      )}
    </I18nProvider>
  );
}
