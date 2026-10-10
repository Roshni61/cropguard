import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, Loader2, ArrowLeft, AlertCircle } from "lucide-react";
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
    <div className="min-h-screen bg-paper text-ink flex flex-col justify-center items-center p-4 grid-texture">
      {/* Top Back Button */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-1.5 text-xs font-bold text-forest hover:text-forest-2 transition px-3 py-1.5 rounded-xl bg-white border border-line shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-forest" />
          <span className="font-extrabold text-forest text-sm">CropGuard AI</span>
        </div>
      </div>

      {/* Auth Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-line space-y-6"
      >
        {/* Header Tabs */}
        <div className="flex bg-paper p-1 rounded-2xl border border-line">
          <button
            type="button"
            onClick={() => { setMode("login"); setErrorMsg(null); }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition ${
              mode === "login" ? "bg-forest text-lime shadow-sm" : "text-ink-2 hover:text-ink"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setErrorMsg(null); }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition ${
              mode === "register" ? "bg-forest text-lime shadow-sm" : "text-ink-2 hover:text-ink"
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-forest">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-xs text-ink-2">
            {mode === "login"
              ? "Access your farm health analytics, weather alerts, and crop diagnoses."
              : "Register to start scanning crops, receiving advisories, and consulting experts."}
          </p>
        </div>

        {/* Error Alert Banner */}
        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-start gap-2.5 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-bold text-forest mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Roshni Sharma"
                className="w-full px-3.5 py-2.5 bg-paper border border-line rounded-xl text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-forest mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              className="w-full px-3.5 py-2.5 bg-paper border border-line rounded-xl text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-forest"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-forest mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-paper border border-line rounded-xl text-sm font-medium text-ink pr-10 focus:outline-none focus:ring-2 focus:ring-forest"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-2 hover:text-ink"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-forest mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2.5 bg-paper border border-line rounded-xl text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-forest cursor-pointer"
                  >
                    <option value="FARMER">🌾 Farmer</option>
                    <option value="EXPERT">🩺 Expert</option>
                    <option value="OFFICER">🏛️ Field Officer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-forest mb-1">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2.5 bg-paper border border-line rounded-xl text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-forest cursor-pointer"
                  >
                    <option value="en">English</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                    <option value="hi">हिंदी (Hindi)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-forest mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 bg-paper border border-line rounded-xl text-xs font-medium text-ink"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-forest mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-paper border border-line rounded-xl text-xs font-medium text-ink"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-forest hover:bg-forest-2 text-lime font-extrabold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-lime" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{mode === "login" ? "Sign In to Dashboard" : "Register Account"}</span>
            )}
          </button>
        </form>

        {/* Footer switch prompt */}
        <div className="text-center text-xs text-ink-2 pt-2 border-t border-line">
          {mode === "login" ? (
            <span>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => { setMode("register"); setErrorMsg(null); }}
                className="font-extrabold text-forest hover:underline ml-1"
              >
                Register now
              </button>
            </span>
          ) : (
            <span>
              Already registered?{" "}
              <button
                type="button"
                onClick={() => { setMode("login"); setErrorMsg(null); }}
                className="font-extrabold text-forest hover:underline ml-1"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
};
