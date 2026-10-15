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
    <header className="sticky top-0 z-50 bg-forest/95 backdrop-blur-md text-white shadow-[var(--shadow-soft)] border-b border-forest-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setActiveTab("home")}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-lime to-emerald-400 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
            <Shield className="w-5 h-5 text-forest stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white leading-tight">CropGuard</h1>
              <span className="text-[10px] font-bold text-lime px-1.5 py-0.2 rounded-md bg-white/10 uppercase tracking-widest">
                AI
              </span>
            </div>
            <p className="text-[10px] text-lime/80 uppercase font-semibold tracking-wider">
              {t("tagline")}
            </p>
          </div>
        </div>

        {/* Sync Status & Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <SyncBadge />

          {/* Language Selector */}
          <div className="relative flex items-center bg-white/10 hover:bg-white/15 rounded-xl px-2 py-1 border border-white/15 transition">
            <Globe className="w-3.5 h-3.5 text-lime mr-1.5" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              aria-label="Language selector"
              className="bg-transparent text-xs font-semibold text-white outline-none cursor-pointer pr-1"
            >
              <option value="en" className="bg-forest text-white">EN</option>
              <option value="ta" className="bg-forest text-white">TA (தமிழ்)</option>
              <option value="hi" className="bg-forest text-white">HI (हिंदी)</option>
            </select>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center bg-black/25 rounded-2xl p-1 border border-white/15 text-xs">
            <button
              onClick={() => setRole("FARMER")}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                currentRole === "FARMER" 
                  ? "bg-lime text-forest shadow-sm" 
                  : "text-white/80 hover:text-white"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Farmer</span>
            </button>
            <button
              onClick={() => setRole("EXPERT")}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                currentRole === "EXPERT" 
                  ? "bg-amber-300 text-amber-950 shadow-sm" 
                  : "text-white/80 hover:text-white"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Expert</span>
            </button>
            <button
              onClick={() => setRole("OFFICER")}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                currentRole === "OFFICER" 
                  ? "bg-teal-300 text-teal-950 shadow-sm" 
                  : "text-white/80 hover:text-white"
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
                <span>{user.name || user.email || user.phone}</span>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="p-2 rounded-xl bg-white/10 hover:bg-red-500/20 text-white hover:text-red-300 border border-white/15 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
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
