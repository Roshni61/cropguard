import React, { useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { 
  Mic, Camera, CloudRain, Sun, PhoneCall, Volume2, 
  VolumeX, HelpCircle, ArrowRight, LayoutDashboard, CheckCircle2, 
  X, AlertTriangle, MapPin, Sparkles
} from "lucide-react";
import { useTranslation } from "../i18n/I18nContext";
import { CropGuardKural } from "./CropGuardKural";

interface FarmerSimpleModeProps {
  onScanClick: () => void;
  onNavigateToTab: (tab: string) => void;
  onSwitchToFull: () => void;
  weatherData: any;
  riskData: any;
  userName?: string;
  userDistrict?: string;
}

export const FarmerSimpleMode: React.FC<FarmerSimpleModeProps> = ({
  onScanClick,
  onNavigateToTab,
  onSwitchToFull,
  weatherData,
  riskData,
  userName = "Farmer",
  userDistrict = "Coimbatore",
}) => {
  const { t, language, speakText, stopSpeaking, isSpeaking } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  // Modals
  const [showGuide, setShowGuide] = useState(() => {
    return !localStorage.getItem("cropguard_simple_guide_seen");
  });
  const [guideStep, setGuideStep] = useState(1);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showFarmTodayModal, setShowFarmTodayModal] = useState(false);

  const isRainRisk = weatherData?.rain_probability_percent > 50 || !weatherData?.spray_safe;

  // Spoken Walkthrough Scripts
  const getWalkthroughSpeech = (step: number) => {
    if (language === "ta") {
      switch (step) {
        case 1:
          return "படி ஒன்று: உங்கள் தக்காளி செடியில் நோய் தாக்கிய இலையை நல்ல வெளிச்சத்தில் கேமரா முன் பிடித்து படம் எடுங்கள்.";
        case 2:
          return "படி இரண்டு: எங்கள் செயற்கை நுண்ணறிவு உடனடியாக இலையை ஸ்கேன் செய்து, அது இலைப்புள்ளி நோயா அல்லது கருகல் நோயா என கண்டறியும்.";
        case 3:
          return "படி மூன்று: நோய் தீர சரியான இயற்கை மருந்து அல்லது இரசாயன மருந்து அளவை உங்களுக்கு எளிதாக சொல்லும்.";
        case 4:
          return "படி நான்கு: மழை வரும் போது மருந்து தெளிக்க வேண்டாம். எங்கள் வானிலை எச்சரிக்கையை பார்த்து உங்கள் பணத்தை பாதுகாத்துக் கொள்ளுங்கள்.";
        default:
          return "க்ராப்கார்ட் எளிய முறைக்கு நல்வரவு. நான்கு எளிய படிகளில் உங்கள் பயிரை பாதுகாத்துக் கொள்ளுங்கள்.";
      }
    } else if (language === "hi") {
      switch (step) {
        case 1:
          return "पहला चरण: अपने पौधे की बीमार पत्ती को दिन की रोशनी में कैमरे के सामने रखकर फोटो खींचें।";
        case 2:
          return "दूसरा चरण: हमारा एआई तुरंत पत्ती की जांच करके बीमारी का नाम बता देगा।";
        case 3:
          return "तीसरा चरण: बीमारी से बचाव के लिए सुरक्षित जैविक दवा या सही रासायनिक मात्रा जानें।";
        case 4:
          return "चौथा चरण: बारिश से पहले कभी छिड़काव न करें। मौसम देखकर अपनी दवा और मेहनत बचाएं।";
        default:
          return "क्रॉपगार्ड सरल किसान मोड में आपका स्वागत है। चार आसान चरणों में अपनी फसल की रक्षा करें।";
      }
    } else {
      switch (step) {
        case 1:
          return "Step one: Take a clear photo of the sick or discolored crop leaf in daylight.";
        case 2:
          return "Step two: CropGuard AI instantly analyzes the leaf spots to identify the disease.";
        case 3:
          return "Step three: Learn safe organic treatments and exact chemical dosages.";
        case 4:
          return "Step four: Always check rain advice before spraying to prevent medicine runoff.";
        default:
          return "Welcome to CropGuard Simple Mode. Protect your farm in four easy steps.";
      }
    }
  };

  const handlePlayGuideAudio = (step = guideStep) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(getWalkthroughSpeech(step));
    }
  };

  const handleDismissGuide = () => {
    stopSpeaking();
    setShowGuide(false);
    localStorage.setItem("cropguard_simple_guide_seen", "true");
  };

  return (
    <div className="space-y-6 pb-20 selection:bg-lime selection:text-forest">
      {/* 1. TOP HEADER BAR: MODE SWITCHER & AUDIO GUIDE TRIGGER */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-white/80 backdrop-blur-md p-3.5 sm:p-4 rounded-3xl border border-line shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-forest flex items-center justify-center text-lime shadow-sm">
            <span className="text-xl">🌾</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-forest">
                {t("simpleMode")}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-lime text-forest text-[10px] font-black tracking-widest uppercase">
                Active
              </span>
            </div>
            <p className="text-[11px] text-ink-2 font-medium">
              {userName} • <MapPin className="w-3 h-3 inline text-forest-2 -mt-0.5" /> {userDistrict}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Walkthrough Helper Button */}
          <button
            type="button"
            onClick={() => {
              setShowGuide(true);
              setGuideStep(1);
              handlePlayGuideAudio(1);
            }}
            aria-label="Open voice guided setup"
            className="min-h-[48px] px-3.5 py-2 rounded-2xl bg-paper hover:bg-white text-forest border border-line hover:border-forest-2 font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs active:scale-95"
          >
            <HelpCircle className="w-4 h-4 text-forest" />
            <span className="hidden sm:inline">{t("guideTitle")}</span>
            <span className="sm:hidden">Guide</span>
          </button>

          {/* Switch to Full Dashboard Button */}
          <button
            type="button"
            onClick={onSwitchToFull}
            aria-label={t("switchToFull")}
            className="min-h-[48px] px-4 py-2 rounded-2xl bg-forest hover:bg-forest-hover text-cream font-bold text-xs flex items-center gap-2 border border-lime/30 shadow-[var(--shadow-soft)] hover:shadow-md transition cursor-pointer active:scale-95"
          >
            <LayoutDashboard className="w-4 h-4 text-lime" />
            <span>{t("switchToFull")}</span>
            <ArrowRight className="w-3.5 h-3.5 text-lime" />
          </button>
        </div>
      </div>

      {/* 2. PHOTOGRAPHIC FARMER BANNER */}
      <div className="relative rounded-3xl overflow-hidden shadow-[var(--shadow-lift)] border border-line bg-forest min-h-[170px] sm:min-h-[200px] flex flex-col justify-end p-6 text-white">
        <img
          src="/images/farmer_digital_field.jpg"
          alt="Farmer checking crops with smartphone"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-45 mix-blend-luminosity filter brightness-95"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/crop_field_sunrise.jpg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/70 to-transparent" />

        <div className="relative z-10 space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-lime text-xs font-black uppercase tracking-wider border border-lime/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CropGuard 2.0 • Easy Touch</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            {t("greeting")}
          </h2>
          <p className="text-xs sm:text-sm text-white/85 font-normal">
            {language === "ta" 
              ? "உங்கள் பயிரை பாதுகாக்க கீழே உள்ள 4 பெரிய பட்டன்களைத் தொடவும்."
              : language === "hi"
              ? "अपनी फसल की सुरक्षा के लिए नीचे दिए 4 बड़े बटन दबाएं।"
              : "Tap any of the 4 big cards below to protect your crops today."}
          </p>
        </div>
      </div>

      {/* 3. FOUR PRIMARY ACTION CARDS (CORE REQUIREMENT) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* ACTION 1: TALK (பேசுங்கள் / बात करें) */}
        <motion.button
          type="button"
          onClick={() => setShowVoiceModal(true)}
          whileHover={shouldReduceMotion ? {} : { scale: 1.015, y: -2 }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.985 }}
          className="min-h-[130px] sm:min-h-[150px] p-6 rounded-3xl bg-gradient-to-br from-emerald-800 to-forest text-white border-2 border-emerald-500/30 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition text-left flex items-center justify-between gap-4 cursor-pointer group relative overflow-hidden"
        >
          <div className="space-y-1.5 z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-lime text-[11px] font-bold uppercase tracking-wider">
              <span>🎙️ {language === "ta" ? "குரல் வழி" : language === "hi" ? "आवाज द्वारा" : "Voice AI"}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{t("talkAction")}</span>
            </h3>
            <p className="text-xs sm:text-sm text-lime/90 font-medium">
              {t("talkSub")}
            </p>
            <p className="text-[11px] text-white/70">
              {language === "ta" 
                ? "தமிழ், ஹிந்தி அல்லது ஆங்கிலத்தில் கேளுங்கள்"
                : language === "hi"
                ? "हिंदी, तमिल या अंग्रेजी में बोलें"
                : "Ask anything in Tamil, Hindi or English"}
            </p>
          </div>

          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-lime/20 border-2 border-lime/40 flex items-center justify-center shrink-0 text-lime group-hover:scale-110 transition-transform shadow-inner">
            <Mic className="w-9 h-9 stroke-[2.5]" />
          </div>
        </motion.button>

        {/* ACTION 2: SCAN CROP (பயிரை ஸ்கேன் செய் / फसल स्कैन करें) */}
        <motion.button
          type="button"
          onClick={onScanClick}
          whileHover={shouldReduceMotion ? {} : { scale: 1.015, y: -2 }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.985 }}
          className="min-h-[130px] sm:min-h-[150px] p-6 rounded-3xl bg-gradient-to-br from-lime-400 via-lime to-emerald-400 text-forest border-2 border-lime/60 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-glow)] transition text-left flex items-center justify-between gap-4 cursor-pointer group relative overflow-hidden"
        >
          <div className="space-y-1.5 z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-forest/15 text-forest text-[11px] font-black uppercase tracking-wider">
              <span>📸 {language === "ta" ? "கேமரா" : language === "hi" ? "कैमरा" : "Camera AI"}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-forest tracking-tight">
              {t("scanAction")}
            </h3>
            <p className="text-xs sm:text-sm text-forest-2 font-bold">
              {t("scanSub")}
            </p>
            <p className="text-[11px] text-forest/75 font-medium">
              {language === "ta" 
                ? "1 வினாடியில் உடனடி நோய் ஆய்வு"
                : language === "hi"
                ? "1 सेकंड में तुरंत बीमारी की पहचान"
                : "1-second photo check • Works offline"}
            </p>
          </div>

          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-forest text-lime flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-md">
            <Camera className="w-9 h-9 stroke-[2.5]" />
          </div>
        </motion.button>

        {/* ACTION 3: MY FARM TODAY (இன்று என் பண்ணை / आज मेरा खेत) */}
        <motion.button
          type="button"
          onClick={() => setShowFarmTodayModal(true)}
          whileHover={shouldReduceMotion ? {} : { scale: 1.015, y: -2 }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.985 }}
          className={`min-h-[130px] sm:min-h-[150px] p-6 rounded-3xl border-2 transition text-left flex items-center justify-between gap-4 cursor-pointer group shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] ${
            isRainRisk 
              ? "bg-amber-50/90 border-amber-300 text-ink" 
              : "bg-emerald-50/90 border-emerald-300 text-ink"
          }`}
        >
          <div className="space-y-1.5 z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-white border border-line">
              <span>{isRainRisk ? "🌧️ Weather Warning" : "☀️ Clear Weather"}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-forest tracking-tight">
              {t("farmTodayAction")}
            </h3>
            <p className="text-xs sm:text-sm text-ink font-bold">
              {weatherData?.temperature_c || 29}°C • {weatherData?.condition || "Humid"}
            </p>

            {/* Spray advisory banner badge */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black ${
              isRainRisk 
                ? "bg-orange-600 text-white shadow-xs" 
                : "bg-emerald-700 text-white shadow-xs"
            }`}>
              {isRainRisk ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{t("sprayDangerTitle")}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t("spraySafeTitle")}</span>
                </>
              )}
            </div>
          </div>

          <div className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner ${
            isRainRisk 
              ? "bg-amber-100 border-amber-300 text-amber-800" 
              : "bg-emerald-100 border-emerald-300 text-emerald-800"
          }`}>
            {isRainRisk ? (
              <CloudRain className="w-9 h-9 stroke-[2.2]" />
            ) : (
              <Sun className="w-9 h-9 stroke-[2.2]" />
            )}
          </div>
        </motion.button>

        {/* ACTION 4: GET HELP (உதவி பெறுங்கள் / मदद लें) */}
        <motion.button
          type="button"
          onClick={() => setShowHelpModal(true)}
          whileHover={shouldReduceMotion ? {} : { scale: 1.015, y: -2 }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.985 }}
          className="min-h-[130px] sm:min-h-[150px] p-6 rounded-3xl bg-white border-2 border-line hover:border-forest-2 text-ink shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition text-left flex items-center justify-between gap-4 cursor-pointer group"
        >
          <div className="space-y-1.5 z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-paper text-forest text-[11px] font-bold uppercase tracking-wider border border-line">
              <span>📞 {language === "ta" ? "நேரடி அழைப்பு" : language === "hi" ? "सीधी कॉल" : "Direct Helpline"}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-forest tracking-tight">
              {t("helpAction")}
            </h3>
            <p className="text-xs sm:text-sm text-ink font-bold">
              {t("helpSub")}
            </p>
            <p className="text-[11px] text-ink-3">
              Toll-Free 1800-180-1551 • KVK Coimbatore
            </p>
          </div>

          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-paper border border-line text-forest flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-xs">
            <PhoneCall className="w-9 h-9 text-forest stroke-[2.2]" />
          </div>
        </motion.button>
      </div>

      {/* 4. GUIDED SETUP MODAL / VOICE WALKTHROUGH */}
      <AnimatePresence>
        {showGuide && (
          <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-heading"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-line space-y-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime/20 text-forest text-xs font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t("guideTitle")}</span>
                  </div>
                  <h3 id="guide-heading" className="text-xl sm:text-2xl font-black text-forest">
                    {guideStep === 1 && t("guideStep1Title")}
                    {guideStep === 2 && t("guideStep2Title")}
                    {guideStep === 3 && t("guideStep3Title")}
                    {guideStep === 4 && t("guideStep4Title")}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={handleDismissGuide}
                  aria-label={t("close")}
                  className="min-h-[48px] min-w-[48px] p-2 rounded-xl text-ink-2 hover:text-ink hover:bg-paper transition flex items-center justify-center cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Step Graphic & Description */}
              <div className="p-6 bg-paper rounded-2xl border border-line text-center space-y-3">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-white border border-line shadow-xs flex items-center justify-center text-4xl">
                  {guideStep === 1 && "📸"}
                  {guideStep === 2 && "🔬"}
                  {guideStep === 3 && "🌿"}
                  {guideStep === 4 && "🌧️"}
                </div>
                <p className="text-sm sm:text-base text-ink font-medium leading-relaxed">
                  {guideStep === 1 && t("guideStep1Desc")}
                  {guideStep === 2 && t("guideStep2Desc")}
                  {guideStep === 3 && t("guideStep3Desc")}
                  {guideStep === 4 && t("guideStep4Desc")}
                </p>
              </div>

              {/* Audio Listen / Stop Controls */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => handlePlayGuideAudio(guideStep)}
                  className={`min-h-[48px] px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer shadow-xs ${
                    isSpeaking 
                      ? "bg-amber-300 text-amber-950 border border-amber-400 animate-pulse" 
                      : "bg-forest text-lime hover:bg-forest-hover"
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isSpeaking ? t("stopAudio") : t("listenGuide")}</span>
                </button>

                <div className="flex items-center gap-1.5 text-xs font-bold text-ink-3">
                  <span>{t("step")} {guideStep} {t("of")} 4</span>
                </div>
              </div>

              {/* Step Navigation Dots & Next Button */}
              <div className="flex items-center justify-between pt-2 border-t border-line">
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setGuideStep(s);
                        handlePlayGuideAudio(s);
                      }}
                      aria-label={`Go to step ${s}`}
                      className={`min-h-[48px] min-w-[28px] px-2 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                        guideStep === s
                          ? "bg-forest text-lime"
                          : "bg-paper text-ink-2 hover:bg-line"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {guideStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => {
                      const next = guideStep + 1;
                      setGuideStep(next);
                      handlePlayGuideAudio(next);
                    }}
                    className="min-h-[48px] px-5 py-2.5 bg-forest hover:bg-forest-hover text-cream font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-4 h-4 text-lime" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDismissGuide}
                    className="min-h-[48px] px-5 py-2.5 bg-forest hover:bg-forest-hover text-lime font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-lime" />
                    <span>Got It! Start</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. CROPGUARD KURAL: MULTILINGUAL VOICE FARMING AGENT */}
      <CropGuardKural
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
      />

      {/* 6. GET HELP DIRECT DIAL MODAL */}
      <AnimatePresence>
        {showHelpModal && (
          <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-modal-heading"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-line space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-forest flex items-center justify-center text-lime shadow-sm">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 id="help-modal-heading" className="text-xl font-black text-forest">
                      {t("emergencyHelpline")}
                    </h3>
                    <p className="text-xs text-ink-2">
                      {language === "ta" 
                        ? "உடனடி உதவிக்கு கீழே உள்ள எண்களைத் தொடவும்"
                        : language === "hi"
                        ? "तुरंत मदद के लिए नीचे दिए नंबर पर कॉल करें"
                        : "Tap to call government agriculture helplines"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  aria-label={t("close")}
                  className="min-h-[48px] min-w-[48px] p-2 rounded-xl text-ink-2 hover:text-ink hover:bg-paper transition flex items-center justify-center cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Direct Call Helplines */}
              <div className="space-y-3">
                {/* Kisan Call Center */}
                <a
                  href="tel:18001801551"
                  className="min-h-[64px] p-4 bg-emerald-50 hover:bg-emerald-100/80 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3 transition cursor-pointer group"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded">
                      Govt of India • Toll Free
                    </span>
                    <h4 className="text-sm sm:text-base font-black text-forest mt-1">
                      Kisan Call Center
                    </h4>
                    <p className="text-xs text-ink-2 font-bold">1800-180-1551 (6 AM - 10 PM)</p>
                  </div>
                  <div className="px-4 py-2 bg-forest text-lime rounded-xl text-xs font-black flex items-center gap-1 group-hover:scale-105 transition-transform">
                    <PhoneCall className="w-4 h-4" />
                    <span>{t("callNow")}</span>
                  </div>
                </a>

                {/* Local KVK Extension Center */}
                <a
                  href="tel:04222432123"
                  className="min-h-[64px] p-4 bg-paper hover:bg-white rounded-2xl border border-line flex items-center justify-between gap-3 transition cursor-pointer group"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-ink-2 bg-line px-2 py-0.5 rounded">
                      {userDistrict} District
                    </span>
                    <h4 className="text-sm sm:text-base font-black text-forest mt-1">
                      Krishi Vigyan Kendra (KVK)
                    </h4>
                    <p className="text-xs text-ink-2 font-bold">0422-2432123 • TNAU Center</p>
                  </div>
                  <div className="px-4 py-2 bg-paper border border-forest/30 text-forest rounded-xl text-xs font-black flex items-center gap-1 group-hover:scale-105 transition-transform">
                    <PhoneCall className="w-4 h-4" />
                    <span>{t("callNow")}</span>
                  </div>
                </a>

                {/* Ask Online Expert */}
                <button
                  type="button"
                  onClick={() => {
                    setShowHelpModal(false);
                    onNavigateToTab("assistant");
                  }}
                  className="w-full min-h-[64px] p-4 bg-forest text-white rounded-2xl border border-forest-2 flex items-center justify-between gap-3 transition cursor-pointer group"
                >
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase tracking-wider text-lime bg-white/10 px-2 py-0.5 rounded">
                      Digital Consult
                    </span>
                    <h4 className="text-sm sm:text-base font-black text-white mt-1">
                      Ask Agronomist & Chat
                    </h4>
                    <p className="text-xs text-white/80">Submit photos for specialist review</p>
                  </div>
                  <div className="px-4 py-2 bg-lime text-forest rounded-xl text-xs font-black flex items-center gap-1 group-hover:scale-105 transition-transform">
                    <span>Open Chat</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. MY FARM TODAY WEATHER & SPRAY DETAIL MODAL */}
      <AnimatePresence>
        {showFarmTodayModal && (
          <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="farm-today-heading"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-line space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm ${
                    isRainRisk ? "bg-amber-600" : "bg-emerald-600"
                  }`}>
                    {isRainRisk ? <CloudRain className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 id="farm-today-heading" className="text-xl font-black text-forest">
                      {t("farmTodayAction")}
                    </h3>
                    <p className="text-xs text-ink-2">
                      {userDistrict} • Live Weather Engine
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFarmTodayModal(false)}
                  aria-label={t("close")}
                  className="min-h-[48px] min-w-[48px] p-2 rounded-xl text-ink-2 hover:text-ink hover:bg-paper transition flex items-center justify-center cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Dominant Spray Verdict */}
              <div className={`p-6 rounded-2xl border-2 space-y-2 text-center ${
                isRainRisk 
                  ? "bg-amber-50 border-amber-400 text-amber-950" 
                  : "bg-emerald-50 border-emerald-400 text-emerald-950"
              }`}>
                <div className="text-3xl mb-1">
                  {isRainRisk ? "⚠️" : "✅"}
                </div>
                <h4 className="text-lg font-black tracking-tight">
                  {isRainRisk ? t("sprayDangerTitle") : t("spraySafeTitle")}
                </h4>
                <p className="text-xs sm:text-sm font-medium leading-relaxed">
                  {weatherData?.spray_window_advice || (isRainRisk ? t("sprayDangerDesc") : t("spraySafeDesc"))}
                </p>
              </div>

              {/* Weather Metrics */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-paper rounded-2xl border border-line">
                  <span className="text-[10px] font-bold text-ink-3 uppercase">Temp</span>
                  <p className="text-lg font-black text-forest mt-0.5">{weatherData?.temperature_c || 29}°C</p>
                </div>
                <div className="p-3 bg-paper rounded-2xl border border-line">
                  <span className="text-[10px] font-bold text-ink-3 uppercase">Rain Chance</span>
                  <p className="text-lg font-black text-forest mt-0.5">{weatherData?.rain_probability_percent || 82}%</p>
                </div>
                <div className="p-3 bg-paper rounded-2xl border border-line">
                  <span className="text-[10px] font-bold text-ink-3 uppercase">Wind</span>
                  <p className="text-lg font-black text-forest mt-0.5">{weatherData?.wind_speed_kmh || 12} km/h</p>
                </div>
              </div>

              {/* Disease Risk Overview */}
              {riskData && (
                <div className="p-4 bg-paper rounded-2xl border border-line space-y-1">
                  <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                    {riskData.risk_level || "HIGH"} Outbreak Risk ({riskData.risk_score_percent || 81}%)
                  </span>
                  <p className="text-xs text-ink font-medium">
                    {riskData.advisory}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowFarmTodayModal(false);
                  onNavigateToTab("alerts");
                }}
                className="w-full min-h-[48px] py-3 text-xs font-bold text-forest border border-line rounded-2xl bg-paper hover:bg-white transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Full Outbreak Alerts & Forecast</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PERSISTENT "TALK TO CROPGUARD" VOICE TRIGGER */}
      <div className="fixed bottom-20 right-4 sm:right-6 z-40">
        <button
          type="button"
          onClick={() => setShowVoiceModal(true)}
          className="min-h-[52px] px-4 py-2.5 rounded-full bg-forest hover:bg-forest-hover text-lime font-black text-xs sm:text-sm shadow-xl hover:shadow-2xl border-2 border-lime/40 flex items-center gap-2.5 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          aria-label={t("talkToCropguard")}
        >
          <div className="w-8 h-8 rounded-full bg-forest-hover flex items-center justify-center text-lime group-hover:rotate-12 transition-transform shadow-inner">
            <Mic className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span>{t("talkToCropguard")}</span>
          <span className="w-2.5 h-2.5 rounded-full bg-lime animate-pulse" />
        </button>
      </div>
    </div>
  );
};
