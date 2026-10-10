import React from "react";
import { motion } from "framer-motion";
import { 
  Shield, Camera, CloudRain, AlertTriangle, Bot, 
  Sprout, ChevronRight, CheckCircle2, ArrowRight, 
  Sparkles, BarChart3, Globe
} from "lucide-react";
import { useTranslation } from "../i18n/I18nContext";

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onExploreClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLoginClick,
  onRegisterClick,
  onExploreClick,
}) => {
  const { language, setLanguage } = useTranslation();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans antialiased selection:bg-lime selection:text-forest">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-forest/95 backdrop-blur-md border-b border-forest-2 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime to-emerald-400 flex items-center justify-center shadow-md">
              <Shield className="w-6 h-6 text-forest stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white">CropGuard</span>
              <span className="text-xs font-semibold text-lime ml-1.5 px-2 py-0.5 rounded-full bg-white/10">AI</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-lime/90">
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-lime transition">Home</button>
            <button onClick={() => scrollToSection("features")} className="hover:text-lime transition">Features</button>
            <button onClick={() => scrollToSection("how-it-works")} className="hover:text-lime transition">How It Works</button>
            <button onClick={() => scrollToSection("benefits")} className="hover:text-lime transition">Benefits</button>
          </nav>

          {/* Right Action & Auth Buttons */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-white/10 rounded-lg px-2 py-1 border border-white/20 text-xs">
              <Globe className="w-3.5 h-3.5 text-lime mr-1" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-white outline-none cursor-pointer"
              >
                <option value="en" className="bg-forest text-white">EN</option>
                <option value="ta" className="bg-forest text-white">தமிழ்</option>
                <option value="hi" className="bg-forest text-white">हिंदी</option>
              </select>
            </div>

            <button
              onClick={onLoginClick}
              className="px-4 py-2 text-sm font-semibold text-white hover:text-lime transition rounded-xl"
            >
              Sign In
            </button>
            <button
              onClick={onRegisterClick}
              className="px-4 py-2 text-sm font-bold bg-lime text-forest hover:bg-lime/90 rounded-xl shadow-md transition transform active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden bg-forest text-white pt-16 pb-24 grid-texture border-b border-forest-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-lime/30 text-lime text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-4 h-4 text-lime" />
              <span>Offline-First Agricultural Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
              Protect Your Crops. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime via-emerald-300 to-teal-200">
                Empower Your Harvest.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-white/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Instant AI disease diagnosis, weather-aware chemical advisories, and regional outbreak alerts tailored for farmers, extension officers, and agricultural experts.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onRegisterClick}
                className="w-full sm:w-auto px-8 py-4 bg-lime text-forest hover:bg-lime/90 font-extrabold text-base rounded-2xl shadow-xl transition flex items-center justify-center gap-2 group"
              >
                <span>Start Your Journey</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-base rounded-2xl transition flex items-center justify-center gap-2"
              >
                <span>Explore Features</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10 text-center lg:text-left">
              <div>
                <div className="text-2xl font-black text-lime">98.4%</div>
                <div className="text-xs text-white/70 font-medium">Diagnostic Accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-black text-lime">100%</div>
                <div className="text-xs text-white/70 font-medium">Offline Capable</div>
              </div>
              <div>
                <div className="text-2xl font-black text-lime">TNAU</div>
                <div className="text-xs text-white/70 font-medium">Verified Guidance</div>
              </div>
            </div>
          </motion.div>

          {/* Hero Visual Card Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative mx-auto max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl space-y-4">
              {/* Simulated Scan Card */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-lime animate-ping" />
                  <span className="text-xs font-bold text-lime uppercase tracking-wider">Live Scan Demo</span>
                </div>
                <span className="text-xs bg-lime/20 text-lime px-2.5 py-0.5 rounded-full font-bold">Tomato Crop</span>
              </div>

              <div className="relative aspect-video rounded-2xl overflow-hidden bg-forest-2 grid-texture flex items-center justify-center border border-lime/30">
                <img
                  src="https://images.unsplash.com/photo-1592417817098-8f3d6eb1475a?w=600&auto=format&fit=crop"
                  alt="Leaf Scan Sample"
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-transparent to-transparent flex items-end p-4">
                  <div className="text-left space-y-1">
                    <span className="text-xs font-extrabold text-lime bg-forest/80 px-2 py-0.5 rounded-md">Early Blight (94%)</span>
                    <p className="text-[11px] text-white/90">Immediate treatment & weather window ready</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                  <span className="text-white/60 font-medium">Spray Window:</span>
                  <div className="text-amber-300 font-bold mt-0.5">⚠️ Rain Expected</div>
                </div>
                <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                  <span className="text-white/60 font-medium">Verified Organic:</span>
                  <div className="text-lime font-bold mt-0.5">Neem Oil 5ml/L</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold text-forest-2 uppercase tracking-widest bg-lime/30 px-3 py-1 rounded-full">
            Comprehensive Suite
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-forest">
            Everything You Need for Healthy Crops
          </h2>
          <p className="text-sm sm:text-base text-ink-2">
            Engineered for farm ergonomics, multi-role collaboration, and offline reliability.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-6 border border-line shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-forest/10 text-forest flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-forest">AI Leaf Disease Scanner</h3>
            <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
              Multi-stage scanning pipeline analyzes leaf symptoms, assesses confidence levels, and flags image quality issues before diagnosis.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-6 border border-line shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-forest">Explainable Heatmaps</h3>
            <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
              Grad-CAM attention maps highlight exact lesion locations on the leaf, explaining why the model identified a specific condition.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-6 border border-line shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <CloudRain className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-forest">Weather-Aware Spraying</h3>
            <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
              Integrated weather engine predicts rainfall and humidity windows to prevent chemical waste and runoff into nearby soil.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-3xl p-6 border border-line shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-forest">District Outbreak Alerts</h3>
            <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
              Real-time spatial risk scores and outbreak warnings sent by Agriculture Officers to alert farmers in high-risk cluster zones.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-white rounded-3xl p-6 border border-line shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-forest">AI Farming Assistant</h3>
            <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
              Ground-truth RAG knowledge base backed by Gemini AI provides voice & text advice in Tamil, Hindi, and English.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-white rounded-3xl p-6 border border-line shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-forest">Market & Cost Analytics</h3>
            <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
              Estimated treatment cost per acre, local mandi price trends, and direct government subsidy application access.
            </p>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 bg-white border-y border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-forest uppercase tracking-widest bg-lime/40 px-3 py-1 rounded-full">
              3 Simple Steps
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-forest">How CropGuard Works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4 text-center p-6 rounded-3xl bg-paper border border-line">
              <div className="w-14 h-14 rounded-2xl bg-forest text-lime font-black text-xl flex items-center justify-center mx-auto shadow-md">
                1
              </div>
              <h3 className="text-lg font-bold text-forest">Snap or Upload Leaf Photo</h3>
              <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
                Take a clear leaf photograph in your field. Works seamlessly offline without an active internet connection.
              </p>
            </div>

            <div className="space-y-4 text-center p-6 rounded-3xl bg-paper border border-line">
              <div className="w-14 h-14 rounded-2xl bg-forest text-lime font-black text-xl flex items-center justify-center mx-auto shadow-md">
                2
              </div>
              <h3 className="text-lg font-bold text-forest">AI & Weather Intelligence</h3>
              <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
                CropGuard evaluates leaf health, verifies image quality, checks forecast rain probability, and matches symptoms.
              </p>
            </div>

            <div className="space-y-4 text-center p-6 rounded-3xl bg-paper border border-line">
              <div className="w-14 h-14 rounded-2xl bg-forest text-lime font-black text-xl flex items-center justify-center mx-auto shadow-md">
                3
              </div>
              <h3 className="text-lg font-bold text-forest">Actionable Verified Guidance</h3>
              <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
                Receive organic remedies, verified chemical dosages, cost estimates, and escalation options for expert review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BENEFITS SECTION */}
      <section id="benefits" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-extrabold text-forest-2 uppercase tracking-widest bg-lime/30 px-3 py-1 rounded-full">
              Built for Farmers & Experts
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-forest">
              Why Agriculture Specialists Trust CropGuard
            </h2>
            <ul className="space-y-4 text-sm font-semibold text-ink">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Zero Network Interruption:</strong> Scans saved locally on device and automatically synced when connectivity resumes.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Prevent Input Waste:</strong> Rain probability windows stop chemical sprays from washing away into soil.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>TNAU & ICAR Compliance:</strong> Recommendations aligned with verified government agricultural extension standards.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Expert Escalation:</strong> Flag low-confidence diagnoses directly to university extension scientists.</span>
              </li>
            </ul>
          </div>

          <div className="bg-forest text-white p-8 rounded-3xl shadow-xl grid-texture space-y-6">
            <h3 className="text-2xl font-black text-lime">Ready to Transform Your Yield?</h3>
            <p className="text-sm text-white/80 leading-relaxed">
              Join thousands of farmers, plant pathology experts, and agricultural officers building a safer, higher-yielding harvest.
            </p>
            <button
              onClick={onRegisterClick}
              className="w-full py-4 bg-lime text-forest font-extrabold text-base rounded-2xl hover:bg-lime/90 transition shadow-lg flex items-center justify-center gap-2"
            >
              <span>Create Your Account</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-forest text-white border-t border-forest-2 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 text-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-lime" />
              <span className="text-base font-extrabold text-white">CropGuard AI</span>
            </div>
            <p className="text-white/70 leading-relaxed">
              Protect Your Crops. Empower Your Harvest. Offline-first plant pathology intelligence platform.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-lime uppercase tracking-wider text-[11px]">Platform</h4>
            <ul className="space-y-1.5 text-white/80 font-medium">
              <li><button onClick={() => scrollToSection("features")} className="hover:text-lime">AI Leaf Scanner</button></li>
              <li><button onClick={() => scrollToSection("features")} className="hover:text-lime">Disease Risk Engine</button></li>
              <li><button onClick={() => scrollToSection("features")} className="hover:text-lime">Weather Advisories</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-lime uppercase tracking-wider text-[11px]">Roles</h4>
            <ul className="space-y-1.5 text-white/80 font-medium">
              <li><button onClick={onRegisterClick} className="hover:text-lime">Farmer Portal</button></li>
              <li><button onClick={onRegisterClick} className="hover:text-lime">Expert Portal</button></li>
              <li><button onClick={onRegisterClick} className="hover:text-lime">Officer Dashboard</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-lime uppercase tracking-wider text-[11px]">Agricultural Verification</h4>
            <p className="text-white/70 leading-relaxed">
              In collaboration with TNAU Agritech & ICAR Extension Advisory Board.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 border-t border-white/10 text-center text-xs text-white/60">
          © {new Date().getFullYear()} CropGuard AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
