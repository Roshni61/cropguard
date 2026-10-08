import React from "react";
import { Shield, Globe, UserCheck, Stethoscope, Landmark } from "lucide-react";
import { useTranslation } from "../i18n/I18nContext";
import { SyncBadge } from "./SyncBadge";

interface NavbarProps {
  currentRole: string;
  setRole: (role: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRole, setRole, setActiveTab }) => {
  const { language, setLanguage, t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 bg-emerald-900 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setActiveTab("home")}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-emerald-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-emerald-50">CropGuard AI</h1>
            <p className="text-[10px] text-emerald-200 uppercase font-semibold tracking-wider">
              {t("tagline")}
            </p>
          </div>
        </div>

        {/* Sync Status & Action Bar */}
        <div className="flex items-center gap-3">
          <SyncBadge />

          {/* Language Selector */}
          <div className="relative flex items-center bg-emerald-800 rounded-lg p-1 border border-emerald-700">
            <Globe className="w-4 h-4 text-emerald-300 ml-1 mr-1" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-emerald-100 outline-none cursor-pointer pr-1"
            >
              <option value="en" className="bg-emerald-900 text-white">EN (English)</option>
              <option value="ta" className="bg-emerald-900 text-white">TA (தமிழ்)</option>
              <option value="hi" className="bg-emerald-900 text-white">HI (हिंदी)</option>
            </select>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center bg-emerald-950/80 rounded-xl p-1 border border-emerald-700 text-xs">
            <button
              onClick={() => setRole("FARMER")}
              className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                currentRole === "FARMER" ? "bg-emerald-500 text-emerald-950 font-bold shadow" : "text-emerald-200 hover:text-white"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Farmer</span>
            </button>
            <button
              onClick={() => setRole("EXPERT")}
              className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                currentRole === "EXPERT" ? "bg-amber-400 text-amber-950 font-bold shadow" : "text-emerald-200 hover:text-white"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Expert</span>
            </button>
            <button
              onClick={() => setRole("OFFICER")}
              className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                currentRole === "OFFICER" ? "bg-blue-400 text-blue-950 font-bold shadow" : "text-emerald-200 hover:text-white"
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Officer</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
