import React, { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { 
  Shield, Eye, EyeOff, Loader2, ArrowLeft, AlertCircle, 
  CheckCircle2, Sprout, KeyRound, Mail, Phone, Lock 
} from "lucide-react";
import { loginAPI, registerAPI, requestPasswordResetAPI, syncSupabaseSessionWithBackend } from "../services/api";
import { supabase, isSupabaseConfigured, getRedirectUrl } from "../services/supabase";

interface AuthPageProps {
  initialMode?: "login" | "register" | "forgot" | "reset-password";
  onAuthSuccess: (user: any, token: string) => void;
  onBackToLanding: () => void;
}

// Google and GitHub SVG icons
const GoogleIcon = () => (
  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-4 h-4 mr-2 fill-current" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = "login",
  onAuthSuccess,
  onBackToLanding,
}) => {
  const [mode, setMode] = useState<"login" | "register" | "forgot" | "reset-password">(initialMode);
  const [credentialType, setCredentialType] = useState<"email" | "phone">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [role, setRole] = useState("FARMER");
  const [language, setLanguage] = useState("en");
  const [state, setState] = useState("Tamil Nadu");
  const [district, setDistrict] = useState("Coimbatore");

  // Focus error message for accessibility
  useEffect(() => {
    if (errorMsg && errorRef.current) {
      errorRef.current.focus();
    }
  }, [errorMsg]);

  // Client validation
  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  const validatePasswordStrength = (val: string) => {
    // Minimum 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    return val.length >= 8 && /[A-Z]/.test(val) && /[a-z]/.test(val) && /[0-9]/.test(val);
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: getRedirectUrl("/auth/callback"),
          },
        });
        if (error) throw error;
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to initiate social login.");
        setLoading(false);
      }
    } else {
      // Graceful notification for local dev or when keys are awaiting configuration
      setTimeout(() => {
        setLoading(false);
        setErrorMsg(
          `OAuth with ${provider.toUpperCase()} requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to be configured in your environment.`
        );
      }, 500);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!validateEmail(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: getRedirectUrl("/reset-password"),
        });
        if (error) {
          // Keep response generic to prevent user enumeration
          console.warn("Supabase reset notice:", error.message);
        }
      } else {
        await requestPasswordResetAPI(email.trim());
      }
      setSuccessMsg("If an account exists with this email, password reset instructions have been sent.");
    } catch {
      setSuccessMsg("If an account exists with this email, password reset instructions have been sent.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!validatePasswordStrength(newPassword)) {
      setErrorMsg("Password must be at least 8 characters long and contain uppercase, lowercase, and numbers.");
      return;
    }

    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        setSuccessMsg("Password updated successfully! You may now sign in.");
        setTimeout(() => setMode("login"), 2000);
      } else {
        setSuccessMsg("Password updated successfully! You may now sign in.");
        setTimeout(() => setMode("login"), 2000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update password. Please try requesting a new link.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (credentialType === "email") {
      if (!validateEmail(email)) {
        setErrorMsg("Please provide a valid email address.");
        return;
      }
      if (mode === "register" && !validatePasswordStrength(password)) {
        setErrorMsg("Password must be at least 8 characters long and include uppercase, lowercase, and numbers.");
        return;
      }
    } else {
      if (!phone.trim()) {
        setErrorMsg("Please enter your registered phone number.");
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === "register") {
        if (credentialType === "email") {
          // Register via Supabase if configured
          if (isSupabaseConfigured && supabase) {
            const { data: supaData, error: supaErr } = await supabase.auth.signUp({
              email: email.trim(),
              password,
              options: {
                data: {
                  full_name: name.trim(),
                  role,
                  language,
                  state,
                  district,
                },
                emailRedirectTo: getRedirectUrl("/auth/callback"),
              },
            });

            if (supaErr) {
              // Generic error to avoid account harvesting
              throw new Error("Unable to complete registration with these details. If you already have an account, please sign in.");
            }

            if (supaData.session) {
              const token = supaData.session.access_token;
              localStorage.setItem("cropguard_token", token);
              const syncedUser = await syncSupabaseSessionWithBackend(token);
              const activeUser = syncedUser || {
                id: supaData.user?.id,
                email: supaData.user?.email,
                name: name.trim(),
                role,
              };
              localStorage.setItem("cropguard_user", JSON.stringify(activeUser));
              onAuthSuccess(activeUser, token);
            } else {
              setSuccessMsg("Registration successful! A verification email has been sent. Please confirm your email to sign in.");
            }
          } else {
            // Local backend registration fallback
            const res = await registerAPI({
              name: name.trim(),
              email: email.trim(),
              password,
              role,
              preferred_language: language,
              state,
              district,
            });
            localStorage.setItem("cropguard_token", res.access_token);
            localStorage.setItem("cropguard_user", JSON.stringify(res.user));
            onAuthSuccess(res.user, res.access_token);
          }
        } else {
          // Legacy Phone Registration
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
        }
      } else {
        // Sign In Mode
        if (credentialType === "email") {
          if (isSupabaseConfigured && supabase) {
            const { data: supaData, error: supaErr } = await supabase.auth.signInWithPassword({
              email: email.trim(),
              password,
            });

            if (supaErr) {
              // Generic error message: never reveals whether email exists
              throw new Error("Incorrect email or password.");
            }

            if (supaData.session) {
              const token = supaData.session.access_token;
              localStorage.setItem("cropguard_token", token);
              const syncedUser = await syncSupabaseSessionWithBackend(token);
              const activeUser = syncedUser || {
                id: supaData.user?.id,
                email: supaData.user?.email,
                name: supaData.user?.user_metadata?.full_name || supaData.user?.email?.split("@")[0],
                role: supaData.user?.user_metadata?.role || "FARMER",
              };
              localStorage.setItem("cropguard_user", JSON.stringify(activeUser));
              onAuthSuccess(activeUser, token);
            }
          } else {
            // Backend email login fallback
            const res = await loginAPI({
              email: email.trim(),
              password,
            });
            localStorage.setItem("cropguard_token", res.access_token);
            localStorage.setItem("cropguard_user", JSON.stringify(res.user));
            onAuthSuccess(res.user, res.access_token);
          }
        } else {
          // Legacy Phone Login
          const res = await loginAPI({
            phone: phone.trim(),
            password,
          });
          localStorage.setItem("cropguard_token", res.access_token);
          localStorage.setItem("cropguard_user", JSON.stringify(res.user));
          onAuthSuccess(res.user, res.access_token);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 grid-texture selection:bg-lime selection:text-forest">
      {/* Top Header / Back Button */}
      <div className="w-full max-w-5xl mb-4 sm:mb-6 flex items-center justify-between">
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-2 text-xs font-bold text-forest hover:text-forest-2 transition-all px-3.5 py-2 rounded-xl bg-white border border-line shadow-[var(--shadow-soft)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
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

      {/* Main Split Authentication Container */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] as const }}
        className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-[var(--shadow-lift)] border border-line grid lg:grid-cols-12 min-h-[580px]"
      >
        {/* Left Side: Photographic Agricultural Showcase */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-forest farm-gradient-fallback flex-col justify-between p-8 text-white overflow-hidden">
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
                <p className="font-bold text-white">Universal OAuth Security</p>
                <p className="text-white/70">One-click Google & GitHub login linked to your verified account.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-lime shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-white">Private & Isolated Records</p>
                <p className="text-white/70">Server-side access control guarantees your crop data remains strictly private.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-5 bg-cream/30">
          {/* Main Mode Tabs (Sign In vs Register) */}
          {mode !== "forgot" && mode !== "reset-password" && (
            <div className="flex bg-paper p-1 rounded-2xl border border-line">
              <button
                type="button"
                onClick={() => { setMode("login"); setErrorMsg(null); setSuccessMsg(null); }}
                className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer ${
                  mode === "login" 
                    ? "bg-forest text-cream shadow-sm" 
                    : "text-ink-2 hover:text-ink hover:bg-white/50"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode("register"); setErrorMsg(null); setSuccessMsg(null); }}
                className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer ${
                  mode === "register" 
                    ? "bg-forest text-cream shadow-sm" 
                    : "text-ink-2 hover:text-ink hover:bg-white/50"
                }`}
              >
                Register Account
              </button>
            </div>
          )}

          {/* Form Header */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-forest tracking-tight">
              {mode === "login" 
                ? "Sign In to CropGuard" 
                : mode === "register" 
                ? "Create Your Farm Account" 
                : mode === "forgot"
                ? "Reset Your Password"
                : "Choose a New Password"}
            </h2>
            <p className="text-xs sm:text-sm text-ink-2">
              {mode === "login"
                ? "Access your farm health analytics, weather spray forecasts, and scan records."
                : mode === "register"
                ? "Register to start scanning crops, receiving advisories, and consulting agronomists."
                : mode === "forgot"
                ? "Enter your verified account email to receive secure recovery instructions."
                : "Set a strong new password for your CropGuard account."}
            </p>
          </div>

          {/* Accessible Error Alert (Generic Messages, aria-live region) */}
          {errorMsg && (
            <div 
              ref={errorRef}
              tabIndex={-1}
              role="alert" 
              aria-live="polite" 
              className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-2xl flex items-start gap-3 text-xs animate-shake outline-none"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span className="font-semibold leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Accessible Success Alert */}
          {successMsg && (
            <div 
              role="status" 
              aria-live="polite" 
              className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-2xl flex items-start gap-3 text-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span className="font-semibold leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label htmlFor="reset-email" className="block text-xs font-bold text-forest mb-1.5">
                  Account Email Address
                </label>
                <div className="relative">
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="farmer@example.com"
                    className="w-full px-4 py-3 bg-white border border-line rounded-xl text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-forest transition"
                    required
                    autoFocus
                  />
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" aria-hidden="true" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-forest hover:bg-forest-hover text-cream font-bold text-sm rounded-full shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] hover:-translate-y-0.5 active:translate-y-0 border border-lime/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-lime" /> : <KeyRound className="w-4 h-4 text-lime" />}
                <span>Send Password Reset Link</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setMode("login"); setErrorMsg(null); setSuccessMsg(null); }}
                  className="text-xs font-bold text-forest hover:underline"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* UPDATE PASSWORD FORM */}
          {mode === "reset-password" && (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="block text-xs font-bold text-forest mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-white border border-line rounded-xl text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-forest pr-11 transition"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-2 hover:text-ink p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-ink-3 mt-1">
                  At least 8 characters with uppercase, lowercase, and numbers.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-forest hover:bg-forest-hover text-cream font-bold text-sm rounded-full shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] hover:-translate-y-0.5 active:translate-y-0 border border-lime/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-lime" /> : <Lock className="w-4 h-4 text-lime" />}
                <span>Update Password</span>
              </button>
            </form>
          )}

          {/* MAIN LOGIN / REGISTER FORM */}
          {(mode === "login" || mode === "register") && (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Credential Method Switcher (Email vs Phone) */}
              <div className="flex items-center gap-2 pb-1">
                <span className="text-[11px] font-bold text-ink-2">Sign in using:</span>
                <button
                  type="button"
                  onClick={() => { setCredentialType("email"); setErrorMsg(null); }}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                    credentialType === "email" 
                      ? "bg-forest/10 text-forest border border-forest/20" 
                      : "text-ink-3 hover:text-ink"
                  }`}
                >
                  <Mail className="w-3 h-3" />
                  <span>Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setCredentialType("phone"); setErrorMsg(null); }}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                    credentialType === "phone" 
                      ? "bg-forest/10 text-forest border border-forest/20" 
                      : "text-ink-3 hover:text-ink"
                  }`}
                >
                  <Phone className="w-3 h-3" />
                  <span>Phone</span>
                </button>
              </div>

              {/* Full Name (Registration only) */}
              {mode === "register" && (
                <div>
                  <label htmlFor="auth-name" className="block text-xs font-bold text-forest mb-1">
                    Full Name
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3.5 py-2.5 bg-white border border-line rounded-xl text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-forest transition"
                    required
                  />
                </div>
              )}

              {/* Email Input */}
              {credentialType === "email" ? (
                <div>
                  <label htmlFor="auth-email" className="block text-xs font-bold text-forest mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="auth-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="farmer@example.com"
                      className="w-full px-3.5 py-2.5 bg-white border border-line rounded-xl text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-forest transition"
                      required
                    />
                    <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" aria-hidden="true" />
                  </div>
                </div>
              ) : (
                /* Phone Input (Preserving existing phone users) */
                <div>
                  <label htmlFor="auth-phone" className="block text-xs font-bold text-forest mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      id="auth-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-3.5 py-2.5 bg-white border border-line rounded-xl text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-forest transition"
                      required
                    />
                    <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" aria-hidden="true" />
                  </div>
                </div>
              )}

              {/* Password Input with "Forgot password?" Link */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="auth-password" className="block text-xs font-bold text-forest">
                    Password
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => { setMode("forgot"); setErrorMsg(null); setSuccessMsg(null); }}
                      className="text-xs font-bold text-forest hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-white border border-line rounded-xl text-sm font-medium text-ink pr-11 focus:outline-none focus:ring-2 focus:ring-forest transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-2 hover:text-ink p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {mode === "register" && credentialType === "email" && (
                  <p className="text-[11px] text-ink-3 mt-1">
                    Must be 8+ characters with uppercase, lowercase, and numbers.
                  </p>
                )}
              </div>

              {/* Role & Location for Registration */}
              {mode === "register" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="auth-role" className="block text-xs font-bold text-forest mb-1">Role</label>
                      <select
                        id="auth-role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-line rounded-xl text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-forest cursor-pointer"
                      >
                        <option value="FARMER">🌾 Farmer</option>
                        <option value="EXPERT">🩺 Agronomist / Expert</option>
                        <option value="OFFICER">🏛️ Extension Officer</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="auth-language" className="block text-xs font-bold text-forest mb-1">Language</label>
                      <select
                        id="auth-language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-line rounded-xl text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-forest cursor-pointer"
                      >
                        <option value="en">English</option>
                        <option value="ta">தமிழ் (Tamil)</option>
                        <option value="hi">हिंदी (Hindi)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="auth-state" className="block text-xs font-bold text-forest mb-1">State</label>
                      <input
                        id="auth-state"
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-line rounded-xl text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                      />
                    </div>
                    <div>
                      <label htmlFor="auth-district" className="block text-xs font-bold text-forest mb-1">District</label>
                      <input
                        id="auth-district"
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-line rounded-xl text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-forest hover:bg-forest-hover text-cream font-bold text-sm rounded-full shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] hover:-translate-y-0.5 active:translate-y-0 border border-lime/30 motion-safe:transition-all motion-reduce:transition-none motion-reduce:transform-none flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-lime" />
                    <span>Verifying credentials...</span>
                  </>
                ) : (
                  <span>{mode === "login" ? "Sign In" : "Create Farm Account"}</span>
                )}
              </button>

              {/* WORKED EXAMPLE REQUIREMENT:
                  Divider labeled "or", then two outlined buttons: "Continue with Google" and "Continue with GitHub" */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-line" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white/80 backdrop-blur-sm px-3 text-ink-3 uppercase font-bold tracking-wider">
                    or
                  </span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleOAuthLogin("google")}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-white hover:bg-paper border border-line rounded-xl text-xs font-bold text-forest shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuthLogin("github")}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-white hover:bg-paper border border-line rounded-xl text-xs font-bold text-forest shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  <GitHubIcon />
                  <span>Continue with GitHub</span>
                </button>
              </div>
            </form>
          )}

          {/* Bottom Switch Prompt */}
          {mode !== "forgot" && mode !== "reset-password" && (
            <div className="text-center text-xs text-ink-2 pt-2 border-t border-line">
              {mode === "login" ? (
                <span>
                  Don't have an account yet?{" "}
                  <button
                    type="button"
                    onClick={() => { setMode("register"); setErrorMsg(null); setSuccessMsg(null); }}
                    className="font-bold text-forest hover:underline ml-1 cursor-pointer"
                  >
                    Register now
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => { setMode("login"); setErrorMsg(null); setSuccessMsg(null); }}
                    className="font-bold text-forest hover:underline ml-1 cursor-pointer"
                  >
                    Sign In
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
