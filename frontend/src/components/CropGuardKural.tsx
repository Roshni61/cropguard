import React, { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Mic, Square, Volume2, Sparkles, X,
  ShieldAlert, CheckCircle2,
  ArrowRight, Send, AlertTriangle
} from "lucide-react";
import { useTranslation } from "../i18n/I18nContext";
import { sendChatMessageAPI, type ChatAnswerData } from "../services/api";

interface CropGuardKuralProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  fieldId?: string;
}

type AgentState = "IDLE" | "LISTENING" | "THINKING" | "SPEAKING" | "ANSWERED" | "ERROR";

export const CropGuardKural: React.FC<CropGuardKuralProps> = ({
  isOpen,
  onClose,
  initialQuery = "",
  fieldId = "fld-01"
}) => {
  const { t, language, setLanguage, speakText, stopSpeaking, isSpeaking } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  const [agentState, setAgentState] = useState<AgentState>("IDLE");
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [typedInput, setTypedInput] = useState("");
  const [answerData, setAnswerData] = useState<ChatAnswerData | null>(null);
  const [isSimplifiedView, setIsSimplifiedView] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Recognition instance ref
  const recognitionRef = useRef<any>(null);

  // Check speech recognition support on mount
  useEffect(() => {
    const hasSpeech = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
    setSpeechSupported(hasSpeech);
  }, []);

  // Reset state when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      if (initialQuery) {
        setTranscript(initialQuery);
        handleAskQuestion(initialQuery);
      }
    } else {
      handleStopAll();
      setTranscript("");
      setInterimTranscript("");
      setAnswerData(null);
      setIsSimplifiedView(false);
      setErrorMessage(null);
      setAgentState("IDLE");
    }
  }, [isOpen]);

  // Clean up audio & recognition on unmount
  useEffect(() => {
    return () => {
      handleStopAll();
    };
  }, []);

  // Update recognition language if language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === "ta" ? "ta-IN" : language === "hi" ? "hi-IN" : "en-IN";
    }
  }, [language]);

  const handleStopAll = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    stopSpeaking();
  };

  // Start Voice Recognition
  const handleStartListening = () => {
    handleStopAll();
    setErrorMessage(null);
    setInterimTranscript("");

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setSpeechSupported(false);
      setErrorMessage(t("micUnsupported"));
      setAgentState("ERROR");
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === "ta" ? "ta-IN" : language === "hi" ? "hi-IN" : "en-IN";

      recognition.onstart = () => {
        setAgentState("LISTENING");
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) setInterimTranscript(interim);
        if (final) {
          setTranscript(final);
          setInterimTranscript("");
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setErrorMessage(t("micDenied"));
        } else if (event.error === "no-speech") {
          setErrorMessage(
            language === "ta"
              ? "குரல் கேட்கவில்லை. மீண்டும் மைக்கை அழுத்தி பேசவும்."
              : language === "hi"
              ? "कोई आवाज़ नहीं सुनाई दी। कृपया दोबारा बोलें।"
              : "No speech detected. Please tap microphone and speak again."
          );
        } else {
          setErrorMessage(
            language === "ta"
              ? "ஒலி அறிவதில் சிக்கல். கீழே உள்ள கேள்விகளை தேர்வு செய்யவும்."
              : language === "hi"
              ? "आवाज़ पहचानने में समस्या हुई। कृपया नीचे से चुनें।"
              : "Speech recognition interrupted. Please use text or quick chips below."
          );
        }
        setAgentState("ERROR");
      };

      recognition.onend = () => {
        // If we captured a final transcript, ask the question
        if (transcript.trim() && agentState === "LISTENING") {
          handleAskQuestion(transcript.trim());
        } else {
          setAgentState(prev => (prev === "LISTENING" ? "IDLE" : prev));
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error("Failed to start speech recognition:", err);
      setErrorMessage(t("micDenied"));
      setAgentState("ERROR");
    }
  };

  // Stop Listening immediately
  const handleStopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (interimTranscript.trim() && !transcript.trim()) {
      setTranscript(interimTranscript.trim());
      handleAskQuestion(interimTranscript.trim());
    } else if (transcript.trim()) {
      handleAskQuestion(transcript.trim());
    } else {
      setAgentState("IDLE");
    }
  };

  // Submit Farming Question to Backend RAG
  const handleAskQuestion = async (queryText: string) => {
    if (!queryText.trim()) return;
    handleStopAll();
    setAgentState("THINKING");
    setErrorMessage(null);
    setIsSimplifiedView(false);

    try {
      const result = await sendChatMessageAPI(queryText, language, fieldId);
      setAnswerData(result);
      setAgentState("ANSWERED");

      // Read aloud automatically
      const speechToPlay = result.simple_answer && isSimplifiedView ? result.simple_answer : result.answer;
      speakText(speechToPlay);
    } catch (err) {
      console.warn("Agricultural query error:", err);
      setErrorMessage(
        language === "ta"
          ? "வேளாண் பதிலைப் பெறுவதில் பிழை. மீண்டும் முயற்சிக்கவும்."
          : language === "hi"
          ? "उत्तर प्राप्त करने में त्रुटि हुई। कृपया पुनः प्रयास करें।"
          : "Could not fetch agricultural guidance. Please retry."
      );
      setAgentState("ERROR");
    }
  };

  // "Say it again" Action
  const handleSayItAgain = () => {
    if (!answerData) return;
    const textToRead = isSimplifiedView && answerData.simple_answer ? answerData.simple_answer : answerData.answer;
    speakText(textToRead);
  };

  // "Simplify" Action
  const handleToggleSimplify = () => {
    if (!answerData) return;
    const nextState = !isSimplifiedView;
    setIsSimplifiedView(nextState);
    const textToRead = nextState && answerData.simple_answer ? answerData.simple_answer : answerData.answer;
    speakText(textToRead);
  };

  // 1-Tap Illustrated Low-Literacy Quick Questions
  const quickFarmingTopics = [
    {
      id: "blight",
      icon: "🍅",
      label: {
        ta: "தக்காளி இலைப்புள்ளி மருந்து",
        hi: "टमाटर झुलसा रोग की दवा",
        en: "Tomato Blight Remedy"
      },
      query: {
        ta: "தக்காளி இலைப்புள்ளி நோய்க்கு என்ன மருந்து தெளிக்க வேண்டும்?",
        hi: "टमाटर के अगेती झुलसा के लिए कौन सी दवा डालें?",
        en: "What is the best treatment for Tomato Early Blight?"
      }
    },
    {
      id: "weather_spray",
      icon: "🌧️",
      label: {
        ta: "இன்று மருந்து தெளிக்கலாமா?",
        hi: "क्या आज छिड़काव कर सकते हैं?",
        en: "Can I Spray Today?"
      },
      query: {
        ta: "இன்று மழை வருமா? மருந்து அடிக்கலாமா?",
        hi: "क्या आज बारिश होगी? क्या छिड़काव सुरक्षित है?",
        en: "Will it rain today? Is it safe to spray pesticides?"
      }
    },
    {
      id: "fruit_borer",
      icon: "🐛",
      label: {
        ta: "காய்ப்புழு கட்டுப்பாடு",
        hi: "फल छेदक कीट रोकथाम",
        en: "Fruit Borer Pest Control"
      },
      query: {
        ta: "தக்காளி காய்ப்புழு மற்றும் பூச்சி தாக்குதலை எப்படி கட்டுப்படுத்துவது?",
        hi: "टमाटर में फल छेदक कीड़े और सुंडी को कैसे रोकें?",
        en: "How to control tomato fruit borer and whiteflies?"
      }
    },
    {
      id: "irrigation",
      icon: "💧",
      label: {
        ta: "சொட்டு நீர் பாசனம் அளவு",
        hi: "ड्रिप सिंचाई में पानी की मात्रा",
        en: "Drip Irrigation Schedule"
      },
      query: {
        ta: "தக்காளி செடிக்கு ஒரு நாளைக்கு எவ்வளவு தண்ணீர் பாய்ச்ச வேண்டும்?",
        hi: "टमाटर के पौधे को ड्रिप से कितना पानी देना चाहिए?",
        en: "How much water does a tomato plant need per day with drip?"
      }
    },
    {
      id: "fertilizer",
      icon: "🧪",
      label: {
        ta: "உரம் & பழம் கருப்பாகுதல்",
        hi: "खाद और फल का काला पड़ना",
        en: "Soil Fertilizer & Blossom Rot"
      },
      query: {
        ta: "தக்காளி பழத்தின் அடிப்பகுதி கருப்பாக மாறுகிறது, என்ன உரம் இட வேண்டும்?",
        hi: "टमाटर का निचला हिस्सा काला पड़ रहा है, कौन सी खाद डालें?",
        en: "Tomato bottom is turning black and rotting. What fertilizer is needed?"
      }
    },
    {
      id: "subsidy",
      icon: "📜",
      label: {
        ta: "அரசு மானியம் & சொட்டு நீர்",
        hi: "सरकारी योजना और ड्रिप सब्सिडी",
        en: "Govt Subsidy & Schemes"
      },
      query: {
        ta: "சொட்டு நீர் பாசனத்திற்கு அரசு மானியம் மற்றும் பயிர் காப்பீடு எப்படி பெறுவது?",
        hi: "ड्रिप सिंचाई पर सरकारी सब्सिडी और फसल बीमा कैसे मिलेगा?",
        en: "What government subsidies are available for drip irrigation and PMFBY?"
      }
    }
  ];

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cropguard-kural-heading"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all"
    >
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-line flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* 1. Header with Language Switch & Exit */}
        <div className="p-4 sm:p-5 bg-paper border-b border-line flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-forest flex items-center justify-center text-lime shadow-sm">
              <Mic className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 id="cropguard-kural-heading" className="text-lg font-black text-forest">
                  {t("kuralTitle")}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-forest text-lime text-[10px] font-black uppercase tracking-wider">
                  Voice Agent
                </span>
                {!speechSupported && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                    Text Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-2 font-medium">
                {t("kuralSub")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Language Selector Pills */}
            <div className="flex bg-cream rounded-xl p-0.5 border border-line text-[11px] font-bold">
              <button
                type="button"
                onClick={() => {
                  setLanguage("ta");
                  stopSpeaking();
                }}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  language === "ta" ? "bg-forest text-lime shadow-xs font-black" : "text-ink-2 hover:text-ink"
                }`}
              >
                தமிழ்
              </button>
              <button
                type="button"
                onClick={() => {
                  setLanguage("hi");
                  stopSpeaking();
                }}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  language === "hi" ? "bg-forest text-lime shadow-xs font-black" : "text-ink-2 hover:text-ink"
                }`}
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => {
                  setLanguage("en");
                  stopSpeaking();
                }}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  language === "en" ? "bg-forest text-lime shadow-xs font-black" : "text-ink-2 hover:text-ink"
                }`}
              >
                English
              </button>
            </div>

            {/* Exit Control */}
            <button
              type="button"
              onClick={() => {
                handleStopAll();
                onClose();
              }}
              aria-label={t("close")}
              className="min-h-[48px] min-w-[48px] p-2 text-ink-2 hover:text-ink hover:bg-cream-card rounded-xl transition flex items-center justify-center cursor-pointer"
            >
              <X className="w-6 h-6 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* 2. Scrollable Interaction Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Central Voice Action Area */}
          <div className="text-center py-2 space-y-3">
            {/* Microphone Button with Pulse Rings */}
            <div className="relative inline-flex items-center justify-center">
              {agentState === "LISTENING" && (
                <span className="absolute w-36 h-36 rounded-full bg-red-500/20 animate-ping" />
              )}
              {isSpeaking && (
                <span className="absolute w-36 h-36 rounded-full bg-lime/30 animate-pulse" />
              )}

              <button
                type="button"
                onClick={agentState === "LISTENING" ? handleStopListening : handleStartListening}
                disabled={agentState === "THINKING"}
                aria-label={agentState === "LISTENING" ? t("stopSpeaking") : t("tapToSpeak")}
                className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-lg transition-all cursor-pointer ${
                  agentState === "LISTENING"
                    ? "bg-red-500 text-white ring-8 ring-red-100 hover:bg-red-600 scale-105"
                    : isSpeaking
                    ? "bg-forest text-lime ring-8 ring-lime/20"
                    : agentState === "THINKING"
                    ? "bg-forest/60 text-cream cursor-wait"
                    : "bg-forest hover:bg-forest-hover text-lime hover:scale-105 active:scale-95 shadow-[var(--shadow-soft)]"
                }`}
              >
                {agentState === "LISTENING" ? (
                  <>
                    <Square className="w-10 h-10 fill-current mb-1" />
                    <span className="text-[10px] font-black tracking-wider uppercase">STOP</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-11 h-11 stroke-[2.4] mb-0.5" />
                    <span className="text-[10px] font-black tracking-wider uppercase">
                      {isSpeaking ? "Speaking" : t("tapToSpeak")}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Listening / Thinking Status Message */}
            <div className="space-y-1">
              <p className="text-sm font-black text-forest">
                {agentState === "LISTENING"
                  ? (language === "ta" ? "உங்கள் கேள்வியைக் கேட்கிறது... பேசி முடிக்கவும்" : language === "hi" ? "आपकी बात सुन रहे हैं... कृपया बोलें" : "Listening to your farm question...")
                  : agentState === "THINKING"
                  ? (language === "ta" ? "வேளாண் விடையை தேடுகிறது..." : language === "hi" ? "सटीक उत्तर तैयार किया जा रहा है..." : "Finding verified agricultural advisory...")
                  : isSpeaking
                  ? (language === "ta" ? "பதிலை வாசிக்கிறது..." : language === "hi" ? "सलाह सुनाई जा रही है..." : "Reading advice aloud...")
                  : (language === "ta" ? "ஒரு முறை ஒரு கேள்வி பேசவும்" : language === "hi" ? "एक समय में एक प्रश्न पूछें" : t("askOneAtATime"))}
              </p>
              <p className="text-[11px] text-ink-3">
                {t("privacyNotice")}
              </p>
            </div>
          </div>

          {/* Live Speech Recognition Transcript Box */}
          {(transcript || interimTranscript || agentState === "LISTENING") && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-paper rounded-2xl border border-line text-xs sm:text-sm space-y-1"
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-ink-2">
                <span>{language === "ta" ? "நீங்கள் கேட்டது:" : language === "hi" ? "आपका प्रश्न:" : "You asked:"}</span>
                {agentState === "LISTENING" && (
                  <span className="flex items-center gap-1 text-red-500 font-black animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Live
                  </span>
                )}
              </div>
              <p className="font-bold text-forest text-sm">
                "{transcript || interimTranscript || (language === "ta" ? "பேசத் தொடங்குங்கள்..." : language === "hi" ? "बोलना शुरू करें..." : "Speak now...")}"
              </p>
            </motion.div>
          )}

          {/* Error / Denial / Unsupported Alert */}
          {errorMessage && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 text-xs sm:text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">{errorMessage}</p>
                <p className="text-[11px] text-amber-800">
                  {language === "ta"
                    ? "கீழே உள்ள விரைவு பொத்தான்களை தொடலாம் அல்லது தட்டச்சு செய்யலாம்."
                    : language === "hi"
                    ? "नीचे दिए गए बटनों को दबाएं या टाइप करके पूछें।"
                    : "You can tap any illustrated topic below or type your question."}
                </p>
              </div>
            </div>
          )}

          {/* 3. Assistant Answer Card */}
          {answerData && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-5 rounded-3xl border shadow-sm space-y-4 ${
                answerData.safe === false
                  ? "bg-red-50/70 border-red-200"
                  : answerData.clarification_needed
                  ? "bg-amber-50/70 border-amber-200"
                  : "bg-emerald-50/80 border-emerald-200"
              }`}
            >
              {/* Answer Header & Controls */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {answerData.safe === false ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-black">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Safety Caution
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Grounded Advisory
                    </span>
                  )}

                  {isSpeaking && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-forest text-lime text-xs font-black animate-pulse">
                      <Volume2 className="w-3.5 h-3.5" />
                      Speaking
                    </span>
                  )}
                </div>

                {/* Audio Action Buttons: Say it again & Simplify */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleSayItAgain}
                    className="min-h-[48px] px-3.5 py-2 rounded-xl bg-white hover:bg-cream text-forest font-bold text-xs border border-line shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 text-forest" />
                    <span>{t("sayItAgain")}</span>
                  </button>

                  {answerData.simple_answer && (
                    <button
                      type="button"
                      onClick={handleToggleSimplify}
                      className={`min-h-[48px] px-3.5 py-2 rounded-xl font-bold text-xs border shadow-xs flex items-center gap-1.5 transition cursor-pointer ${
                        isSimplifiedView
                          ? "bg-forest text-lime border-forest"
                          : "bg-white hover:bg-cream text-forest border-line"
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isSimplifiedView ? "Full Answer" : t("simplify")}</span>
                    </button>
                  )}

                  {/* Immediate Stop Audio Button */}
                  {isSpeaking && (
                    <button
                      type="button"
                      onClick={stopSpeaking}
                      className="min-h-[48px] px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-xs flex items-center gap-1 transition cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>{t("stopSpeaking")}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Spoken & Written Answer Content */}
              <div className="space-y-2 text-forest-2">
                <p className="text-sm sm:text-base font-semibold leading-relaxed text-forest">
                  {isSimplifiedView && answerData.simple_answer
                    ? answerData.simple_answer
                    : answerData.answer}
                </p>

                {isSimplifiedView && (
                  <span className="inline-block text-[11px] font-bold text-forest/70 bg-lime/30 px-2 py-0.5 rounded-md">
                    ⚡ {language === "ta" ? "எளிய உரை முறை" : language === "hi" ? "सरल भाषा मोड" : "Simplified farmer language"}
                  </span>
                )}
              </div>

              {/* Clarification Choice Chips (if user query was vague or crop missing) */}
              {answerData.clarification_needed && answerData.suggested_chips && (
                <div className="pt-2 border-t border-amber-200/60 space-y-2">
                  <span className="text-xs font-black uppercase text-amber-900">
                    {language === "ta" ? "உங்கள் பயிரைத் தேர்ந்தெடுக்கவும்:" : language === "hi" ? "अपनी फसल चुनें:" : "Select your crop:"}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {answerData.suggested_chips.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const fullQ = `${chip}: ${transcript || "leaf disease"}`;
                          setTranscript(fullQ);
                          handleAskQuestion(fullQ);
                        }}
                        className="min-h-[48px] px-4 py-2 bg-white hover:bg-forest hover:text-cream rounded-xl text-xs font-bold text-forest border border-amber-300 shadow-xs transition cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Agricultural Citations */}
              {answerData.citations && answerData.citations.length > 0 && (
                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-ink-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-forest">{t("citations")}:</span>
                    {answerData.citations.map((cite, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-line text-[10px] font-medium text-ink-2">
                        <span>🏛️</span>
                        <span>{cite}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* 4. Large Illustrated 1-Tap Farming Topics (Low-Literacy Friendly) */}
          <div className="space-y-2 pt-2 border-t border-line">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-ink-2 uppercase tracking-wider">
                {language === "ta" ? "விரைவு கேள்விகள் (1 தொடுதல்)" : language === "hi" ? "त्वरित प्रश्न (1 टैप)" : "Quick Questions (1 Tap)"}
              </span>
              <span className="text-[11px] text-ink-3">
                {language === "ta" ? "பேசாமல் தெரிந்துகொள்ள" : language === "hi" ? "बिना बोले जानें" : "Instant answers"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickFarmingTopics.map((topic) => {
                const topicLabel = topic.label[language as "ta" | "hi" | "en"] || topic.label.en;
                const topicQuery = topic.query[language as "ta" | "hi" | "en"] || topic.query.en;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => {
                      setTranscript(topicQuery);
                      handleAskQuestion(topicQuery);
                    }}
                    className="min-h-[52px] p-3 rounded-2xl bg-paper hover:bg-cream-card text-left text-xs font-bold text-forest border border-line hover:border-forest-2 shadow-xs transition flex items-center gap-2.5 cursor-pointer group"
                  >
                    <span className="text-xl p-1.5 rounded-xl bg-white shadow-xs border border-line group-hover:scale-110 transition-transform">
                      {topic.icon}
                    </span>
                    <span className="flex-1 leading-snug">{topicLabel}</span>
                    <ArrowRight className="w-4 h-4 text-ink-3 group-hover:text-forest transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 5. Bottom Accessible Text Input Alternative */}
        <div className="p-3 sm:p-4 bg-paper border-t border-line">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (typedInput.trim()) {
                const q = typedInput.trim();
                setTranscript(q);
                setTypedInput("");
                handleAskQuestion(q);
              }
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder={
                language === "ta"
                  ? "அல்லது உங்கள் கேள்வியை இங்கே தட்டச்சு செய்யவும்..."
                  : language === "hi"
                  ? "या अपना प्रश्न यहाँ लिखकर पूछें..."
                  : "Or type your crop question here..."
              }
              className="flex-1 min-h-[48px] px-4 rounded-xl bg-white border border-line text-xs sm:text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest font-medium"
            />
            <button
              type="submit"
              disabled={!typedInput.trim() || agentState === "THINKING"}
              aria-label="Send query"
              className="min-h-[48px] px-4 rounded-xl bg-forest hover:bg-forest-hover disabled:bg-forest/40 text-lime font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask</span>
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
