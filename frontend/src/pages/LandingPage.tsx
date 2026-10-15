import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { 
  Shield, Camera, CloudRain, AlertTriangle, Bot, 
  Sprout, ChevronRight, CheckCircle2, 
  Sparkles, BarChart3, Globe, Layers, ArrowUpRight
} from "lucide-react";
import { useTranslation } from "../i18n/I18nContext";

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onExploreClick: () => void;
}

const CURRENT_YEAR = 2026;

export const LandingPage: React.FC<LandingPageProps> = ({
  onLoginClick,
  onRegisterClick,
  onExploreClick,
}) => {
  const { language, setLanguage } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth" });
  };

  const containerVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 16 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: shouldReduceMotion ? 0 : 0.45, 
        ease: [0.22, 1, 0.36, 1] as const
      } 
    },
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans antialiased selection:bg-lime selection:text-forest">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-forest/95 backdrop-blur-md border-b border-forest-2 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          {/* Brand Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none" 
            onClick={() => window.scrollTo({ top: 0, behavior: shouldReduceMotion ? "auto" : "smooth" })}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-lime to-emerald-400 flex items-center justify-center shadow-[var(--shadow-soft)]">
              <Shield className="w-5 h-5 text-forest stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white">CropGuard</span>
              <span className="text-[10px] font-bold text-lime ml-2 px-2 py-0.5 rounded-full bg-white/10 uppercase tracking-widest">
                AI
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: shouldReduceMotion ? "auto" : "smooth" })} 
              className="hover:text-lime transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection("features")} 
              className="hover:text-lime transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection("how-it-works")} 
              className="hover:text-lime transition-colors"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection("benefits")} 
              className="hover:text-lime transition-colors"
            >
              Benefits
            </button>
          </nav>

          {/* Right Action & Auth Buttons */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-white/10 hover:bg-white/15 rounded-xl px-2.5 py-1.5 border border-white/20 text-xs transition">
              <Globe className="w-3.5 h-3.5 text-lime mr-1.5" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                aria-label="Select language"
                className="bg-transparent text-xs font-semibold text-white outline-none cursor-pointer"
              >
                <option value="en" className="bg-forest text-white">EN</option>
                <option value="ta" className="bg-forest text-white">தமிழ்</option>
                <option value="hi" className="bg-forest text-white">हिंदी</option>
              </select>
            </div>

            <button
              onClick={onLoginClick}
              className="px-4 py-2 text-xs font-bold text-white/90 hover:text-white transition rounded-xl"
            >
              Sign In
            </button>
            <button
              onClick={onRegisterClick}
              className="px-4 py-2 text-xs font-extrabold bg-lime text-forest hover:bg-lime/90 rounded-xl shadow-sm hover:shadow-md transition active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden bg-forest text-white pt-16 sm:pt-20 pb-20 sm:pb-28 grid-texture border-b border-forest-2">
        {/* Atmospheric ambient lighting */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-lime/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 grid lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.55 }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-lime/30 text-lime text-xs font-bold tracking-wide uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-lime" />
              <span>Offline-First Agricultural Intelligence</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
              Detect Crop Diseases. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime via-emerald-300 to-teal-200">
                Protect Every Harvest.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-white/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              AI-assisted crop health analysis, diagnostic attention heatmaps, and rainfall-aware spray schedules — empowering growers with university-verified agronomic protection.
            </p>

            {/* CTAs matching required Worked Example */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
              {/* Worked Example: Hero CTA button: bg forest green, cream text, rounded-full, hover lifts 2px with a soft shadow, and the transition is disabled under prefers-reduced-motion */}
              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto px-8 py-4 bg-forest text-cream font-bold text-sm sm:text-base rounded-full shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] border border-lime/40 ring-2 ring-lime/20 motion-safe:transition-all motion-safe:duration-200 motion-reduce:transition-none motion-reduce:transform-none flex items-center justify-center gap-2.5 group active:translate-y-0"
              >
                <Camera className="w-5 h-5 text-lime" />
                <span>Analyze a Leaf</span>
                <ArrowUpRight className="w-4 h-4 text-lime/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                onClick={() => scrollToSection("features")}
                className="w-full sm:w-auto px-7 py-4 bg-white/10 hover:bg-white/15 text-white/90 hover:text-white border border-white/20 font-semibold text-sm sm:text-base rounded-full transition duration-200 flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Explore Features</span>
                <ChevronRight className="w-4 h-4 text-lime" />
              </button>
            </div>

            {/* Real capabilities badge list (No fake numbers) */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/15 text-center lg:text-left">
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-black text-lime">Instant</div>
                <div className="text-xs text-white/70 font-medium">On-Device Diagnosis</div>
              </div>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-black text-lime">100%</div>
                <div className="text-xs text-white/70 font-medium">Offline Queued Sync</div>
              </div>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-black text-lime">TNAU & ICAR</div>
                <div className="text-xs text-white/70 font-medium">Aligned Protocols</div>
              </div>
            </div>
          </motion.div>

          {/* Hero Visual Card Showcase */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: shouldReduceMotion ? 0 : 0.15 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-5 sm:p-6 rounded-3xl shadow-2xl space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-lime" />
                  </span>
                  <span className="text-xs font-bold text-lime uppercase tracking-wider">Diagnostic Analysis</span>
                </div>
                <span className="text-[11px] bg-lime/20 text-lime px-2.5 py-0.5 rounded-full font-bold">
                  Tomato Crop
                </span>
              </div>

              {/* Photo with Graceful Fallback */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-forest-2 farm-gradient-fallback border border-lime/30 group">
                <img
                  src="/images/farmer_crop_inspection.jpg"
                  alt="Farmer inspecting crop leaf"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    // Graceful fallback to gradient background if local image is unavailable
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest/95 via-forest/30 to-transparent flex items-end p-4">
                  <div className="text-left space-y-1">
                    <span className="text-xs font-extrabold text-lime bg-forest/90 px-2.5 py-1 rounded-lg border border-lime/30 shadow-sm inline-block">
                      Early Blight Identified (94%)
                    </span>
                    <p className="text-xs text-white/90">Concentric brown lesions detected on lower canopy</p>
                  </div>
                </div>
              </div>

              {/* Advisory Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white/10 p-3 rounded-2xl border border-white/10 space-y-1">
                  <span className="text-white/70 font-medium">Spraying Forecast</span>
                  <div className="text-amber-300 font-bold flex items-center gap-1">
                    <CloudRain className="w-3.5 h-3.5" />
                    <span>Rain Expected (82%)</span>
                  </div>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl border border-white/10 space-y-1">
                  <span className="text-white/70 font-medium">Recommended Remedy</span>
                  <div className="text-lime font-bold flex items-center gap-1">
                    <Sprout className="w-3.5 h-3.5" />
                    <span>Neem Oil 5ml/L</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold text-forest uppercase tracking-widest bg-lime/40 px-3.5 py-1 rounded-full inline-block">
            Comprehensive Capability
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-forest">
            Engineered for Precision Agriculture
          </h2>
          <p className="text-sm sm:text-base text-ink-2">
            Multi-stage diagnostics, real-time spatial alerts, and practical guidance built for extreme field conditions.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Feature 1 */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 sm:p-7 border border-line shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-forest/10 text-forest flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-forest">AI Leaf Disease Scanner</h3>
            <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
              Multi-stage scanning pipeline analyzes leaf symptoms, detects image quality errors (blur, poor lighting), and predicts infection stages.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 sm:p-7 border border-line shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-forest">Explainable Heatmaps</h3>
            <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
              Grad-CAM attention overlays highlight exact lesion boundaries on the leaf, explaining the evidence behind every diagnosis.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 sm:p-7 border border-line shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <CloudRain className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-forest">Weather-Aware Spraying</h3>
            <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
              Real-time precipitation forecasting advises safe spraying windows to prevent costly chemical wash-off and environmental damage.
            </p>
          </motion.div>

          {/* Feature 4 */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 sm:p-7 border border-line shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-forest">District Outbreak Alerts</h3>
            <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
              Proactive geographical risk scoring and pathogen spread warnings coordinated directly with local Agriculture Officers.
            </p>
          </motion.div>

          {/* Feature 5 */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 sm:p-7 border border-line shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-forest">Grounded AI Agronomist</h3>
            <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
              RAG knowledge base delivering conversational guidance in Tamil, Hindi, and English, backed by university-published extension literature.
            </p>
          </motion.div>

          {/* Feature 6 */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 sm:p-7 border border-line shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-forest">Treatment Cost Planning</h3>
            <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
              Transparent cost-per-acre estimates for both organic and chemical protocols with pre-harvest safety interval calculations.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 bg-white border-y border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-forest uppercase tracking-widest bg-lime/40 px-3.5 py-1 rounded-full inline-block">
              Field Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-forest">
              Three Steps to Harvest Security
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4 text-center p-7 rounded-3xl bg-paper border border-line shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-forest text-lime font-black text-xl flex items-center justify-center mx-auto shadow-md">
                1
              </div>
              <h3 className="text-lg font-bold text-forest">Snap Leaf Photo</h3>
              <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
                Take a clear leaf photograph in your field. Works seamlessly offline even in remote zones without cell coverage.
              </p>
            </div>

            <div className="space-y-4 text-center p-7 rounded-3xl bg-paper border border-line shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-forest text-lime font-black text-xl flex items-center justify-center mx-auto shadow-md">
                2
              </div>
              <h3 className="text-lg font-bold text-forest">AI Symptom Diagnosis</h3>
              <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
                Vision models inspect symptoms, assess confidence, generate explainable heatmaps, and evaluate current weather conditions.
              </p>
            </div>

            <div className="space-y-4 text-center p-7 rounded-3xl bg-paper border border-line shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-forest text-lime font-black text-xl flex items-center justify-center mx-auto shadow-md">
                3
              </div>
              <h3 className="text-lg font-bold text-forest">Verified Action Plan</h3>
              <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
                Receive certified organic options, chemical dosages with spray safety windows, and direct escalation to university experts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BENEFITS SECTION */}
      <section id="benefits" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-extrabold text-forest uppercase tracking-widest bg-lime/40 px-3.5 py-1 rounded-full inline-block">
              Field-Tested Trust
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-forest">
              Built for Farmers, Agronomists & Officers
            </h2>
            <ul className="space-y-4 text-sm font-semibold text-ink">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Zero Network Interruption:</strong> Local IndexedDB stores all scans and automatically syncs when connectivity resumes.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Prevent Chemical Waste:</strong> Rain probability calculations stop pesticide spraying right before heavy rainfall.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Standardized Extension Guidance:</strong> Recommendations align with TNAU and ICAR package of agricultural practices.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Expert Review Escalation:</strong> Low-confidence diagnoses are routed to university plant pathologists with one click.</span>
              </li>
            </ul>
          </div>

          <div className="bg-forest text-white p-8 sm:p-10 rounded-3xl shadow-xl grid-texture border border-forest-2 space-y-6">
            <h3 className="text-2xl sm:text-3xl font-black text-lime">
              Ready to Safeguard Your Crop Yield?
            </h3>
            <p className="text-sm text-white/80 leading-relaxed font-normal">
              Join farming communities and agricultural specialists leveraging AI intelligence to diagnose diseases early and minimize chemical costs.
            </p>
            <button
              onClick={onRegisterClick}
              className="w-full py-4 bg-lime text-forest font-extrabold text-base rounded-2xl hover:bg-lime/90 transition shadow-lg flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Create Your Account</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-forest text-white border-t border-forest-2 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 text-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-lime" />
              <span className="text-base font-extrabold text-white">CropGuard AI</span>
            </div>
            <p className="text-white/70 leading-relaxed font-normal">
              Detect Crop Diseases. Protect Every Harvest. Offline-first plant pathology intelligence platform.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-lime uppercase tracking-wider text-[11px]">Platform</h4>
            <ul className="space-y-2 text-white/80 font-medium">
              <li><button onClick={() => scrollToSection("features")} className="hover:text-lime transition">AI Leaf Scanner</button></li>
              <li><button onClick={() => scrollToSection("features")} className="hover:text-lime transition">Disease Risk Engine</button></li>
              <li><button onClick={() => scrollToSection("features")} className="hover:text-lime transition">Weather Advisories</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-lime uppercase tracking-wider text-[11px]">Portals</h4>
            <ul className="space-y-2 text-white/80 font-medium">
              <li><button onClick={onRegisterClick} className="hover:text-lime transition">Farmer Portal</button></li>
              <li><button onClick={onRegisterClick} className="hover:text-lime transition">Expert Portal</button></li>
              <li><button onClick={onRegisterClick} className="hover:text-lime transition">Officer Dashboard</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-lime uppercase tracking-wider text-[11px]">Agronomic Verification</h4>
            <p className="text-white/70 leading-relaxed font-normal">
              In collaboration with state agricultural universities and extension advisory councils.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 border-t border-white/10 text-center text-xs text-white/60">
          © {CURRENT_YEAR} CropGuard AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
