import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Shield, Eye, EyeOff, Loader2, ArrowLeft, AlertCircle, CheckCircle2, Sprout } from "lucide-react";
import { loginAPI, registerAPI } from "../services/api";

interface AuthPageProps {
  initialMode?: "login" | "register";
  onAuthSuccess: (user: any, token: string) => void;
  onBackToLanding: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = "login",
  onAuthSuccess,
  onBackToLanding,
}) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Form States
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("FARMER");
  const [language, setLanguage] = useState("en");
  const [state, setState] = useState("Tamil Nadu");
  const [district, setDistrict] = useState("Coimbatore");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === "register") {
        if (!name.trim() || !phone.trim() || !password.trim()) {
          throw new Error("Please fill in all required fields.");
        }
        const res = await registerAPI({
          name: name.trim(),
          phone: phone.trim(),
          password,
          role,
          preferred_language: language,
          state,
          district,
        });
        localStorage.setItem("cropguard_token", res.access_token);
        localStorage.setItem("cropguard_user", JSON.stringify(res.user));
        onAuthSuccess(res.user, res.access_token);
      } else {
        if (!phone.trim() || !password.trim()) {
          throw new Error("Please enter your phone number and password.");
        }
        const res = await loginAPI({
          phone: phone.trim(),
          password,
        });
        localStorage.setItem("cropguard_token", res.access_token);
        localStorage.setItem("cropguard_user", JSON.stringify(res.user));
        onAuthSuccess(res.user, res.access_token);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 grid-texture">
      {/* Top Navigation Bar */}
      <div className="w-full max-w-5xl mb-4 sm:mb-6 flex items-center justify-between">
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-2 text-xs font-bold text-forest hover:text-forest-2 transition-all px-3.5 py-2 rounded-xl bg-white border border-line shadow-[var(--shadow-soft)] hover:-translate-y-0.5 active:translate-y-0"
        >
          <ArrowLeft className="w-4 h-4 text-forest" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-forest flex items-center justify-center text-lime shadow-sm">
            <Shield className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-forest text-base tracking-tight">CropGuard AI</span>
        </div>
      </div>

      {/* Main Split Container */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] as const }}
        className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-[var(--shadow-lift)] border border-line grid lg:grid-cols-12 min-h-[580px]"
      >
        {/* Left Side: Real Agricultural Photography Showcase */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-forest farm-gradient-fallback flex-col justify-between p-8 text-white overflow-hidden">
          {/* Real Crop-Field Image with graceful gradient fallback */}
          <img
            src="/images/crop_field_sunrise.jpg"
            alt="Lush agricultural crop field at sunrise"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-luminosity"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/80 to-transparent" />

          {/* Top Badge */}
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-lime/30 text-lime text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Sprout className="w-3.5 h-3.5" />
              <span>Smart Farming Intelligence</span>
            </div>
            <h3 className="text-2xl font-black text-white leading-snug">
              Protect Your Fields with Instant AI Pathology
            </h3>
          </div>

          {/* Bottom Trust Highlights */}
          <div className="relative z-10 space-y-4 pt-8 border-t border-white/20">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-lime shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-white">Full Offline Reliability</p>
                <p className="text-white/70">Scans work and store locally without active internet.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-lime shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-white">Verified Extension Protocols</p>
                <p className="text-white/70">Dosages and spray windows aligned with TNAU practices.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-6 bg-cream/30">
          {/* Header Tabs */}
          <div className="flex bg-paper p-1 rounded-2xl border border-line">
            <button
              type="button"
              onClick={() => { setMode("login"); setErrorMsg(null); }}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-200 ${
                mode === "login" 
                  ? "bg-forest text-cream shadow-sm" 
                  : "text-ink-2 hover:text-ink hover:bg-white/50"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setErrorMsg(null); }}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-200 ${
                mode === "register" 
                  ? "bg-forest text-cream shadow-sm" 
                  : "text-ink-2 hover:text-ink hover:bg-white/50"
              }`}
            >
              Register Account
            </button>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-forest tracking-tight">
              {mode === "login" ? "Welcome Back to CropGuard" : "Create Your Farm Account"}
            </h2>
            <p className="text-xs sm:text-sm text-ink-2">
              {mode === "login"
                ? "Enter your credentials to access crop analytics, spray forecasts, and scan records."
                : "Register in seconds to start scanning leaves and receiving verified agricultural guidance."}
            </p>
          </div>

          {/* Error Alert Banner */}
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-900 rounded-2xl flex items-start gap-2.5 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-bold text-forest mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-4 py-3 bg-white border border-line rounded-xl text-sm font-medium text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-forest transition"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-forest mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-4 py-3 bg-white border border-line rounded-xl text-sm font-medium text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-forest transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-forest mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white border border-line rounded-xl text-sm font-medium text-ink placeholder:text-ink-3 pr-11 focus:outline-none focus:ring-2 focus:ring-forest transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-2 hover:text-ink p-1 rounded-lg transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-forest mb-1.5">Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-line rounded-xl text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-forest cursor-pointer"
                    >
                      <option value="FARMER">🌾 Farmer</option>
                      <option value="EXPERT">🩺 Agronomist / Expert</option>
                      <option value="OFFICER">🏛️ Extension Officer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-forest mb-1.5">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-line rounded-xl text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-forest cursor-pointer"
                    >
                      <option value="en">English</option>
                      <option value="ta">தமிழ் (Tamil)</option>
                      <option value="hi">हिंदी (Hindi)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-forest mb-1.5">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-line rounded-xl text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-forest mb-1.5">District</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-line rounded-xl text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-forest hover:bg-forest-hover text-cream font-bold text-sm rounded-full shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] hover:-translate-y-0.5 active:translate-y-0 border border-lime/30 motion-safe:transition-all motion-reduce:transition-none motion-reduce:transform-none flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-lime" />
                  <span>Processing credentials...</span>
                </>
              ) : (
                <span>{mode === "login" ? "Sign In to Dashboard" : "Create Farm Account"}</span>
              )}
            </button>
          </form>

          {/* Toggle Prompt */}
          <div className="text-center text-xs text-ink-2 pt-2 border-t border-line">
            {mode === "login" ? (
              <span>
                Don't have an account yet?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("register"); setErrorMsg(null); }}
                  className="font-bold text-forest hover:underline ml-1"
                >
                  Register now
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("login"); setErrorMsg(null); }}
                  className="font-bold text-forest hover:underline ml-1"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
