import React from "react";
import { Shield, Globe, UserCheck, Stethoscope, Landmark, LogOut, User } from "lucide-react";
import { useTranslation } from "../i18n/I18nContext";
import { SyncBadge } from "./SyncBadge";

interface NavbarProps {
  currentRole: string;
  setRole: (role: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: any;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  setRole,
  setActiveTab,
  user,
  onLogout,
}) => {
  const { language, setLanguage, t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 bg-forest text-white shadow-md border-b border-forest-2">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-2 flex-wrap">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setActiveTab("home")}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime to-emerald-400 flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-forest stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">CropGuard AI</h1>
            <p className="text-[10px] text-lime uppercase font-semibold tracking-wider">
              {t("tagline")}
            </p>
          </div>
        </div>

        {/* Sync Status & Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <SyncBadge />

          {/* Language Selector */}
          <div className="relative flex items-center bg-white/10 rounded-lg p-1 border border-white/20">
            <Globe className="w-4 h-4 text-lime ml-1 mr-1" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-white outline-none cursor-pointer pr-1"
            >
              <option value="en" className="bg-forest text-white">EN</option>
              <option value="ta" className="bg-forest text-white">TA (தமிழ்)</option>
              <option value="hi" className="bg-forest text-white">HI (हिंदी)</option>
            </select>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center bg-black/30 rounded-xl p-1 border border-white/20 text-xs">
            <button
              onClick={() => setRole("FARMER")}
              className={`px-2 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                currentRole === "FARMER" ? "bg-lime text-forest font-bold shadow" : "text-white/80 hover:text-white"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Farmer</span>
            </button>
            <button
              onClick={() => setRole("EXPERT")}
              className={`px-2 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                currentRole === "EXPERT" ? "bg-amber-400 text-amber-950 font-bold shadow" : "text-white/80 hover:text-white"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Expert</span>
            </button>
            <button
              onClick={() => setRole("OFFICER")}
              className={`px-2 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                currentRole === "OFFICER" ? "bg-blue-400 text-blue-950 font-bold shadow" : "text-white/80 hover:text-white"
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Officer</span>
            </button>
          </div>

          {/* User Session & Logout */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-white/20">
              <div className="hidden md:flex items-center gap-1.5 text-xs text-lime font-bold">
                <User className="w-3.5 h-3.5" />
                <span>{user.name || user.phone}</span>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="p-2 rounded-xl bg-white/10 hover:bg-red-500/20 text-white hover:text-red-300 border border-white/20 transition flex items-center gap-1 text-xs font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
