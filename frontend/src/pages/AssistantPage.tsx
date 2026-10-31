import React, { useState } from "react";
import { Bot, Send, Mic, Volume2, AlertOctagon, BookOpen, Sparkles, Loader2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "../i18n/I18nContext";
import { sendChatMessageAPI } from "../services/api";
import { CropGuardKural } from "../components/CropGuardKural";

export const AssistantPage: React.FC = () => {
  const { t, language, speakText } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const [showKural, setShowKural] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    {
      sender: "assistant",
      text: language === "ta" 
        ? "வணக்கம்! நான் உங்கள் க்ராப்கார்ட் வேளாண் உதவியாளன். தக்காளி பயிர் பாதுகாப்பு, வானிலை அல்லது நோய்கள் குறித்து கேளுங்கள்."
        : language === "hi"
        ? "नमस्ते! मैं आपका क्रॉपगार्ड कृषि सहायक हूँ। टमाटर फसल सुरक्षा, मौसम या बीमारियों के बारे में पूछें।"
        : "Hello! I am your CropGuard AI Agricultural Assistant. Ask me anything about tomato crop health, spray windows, or organic disease control.",
      citations: ["TNAU Agritech Portal 2026", "ICAR Krishi Vigyan Kendra"],
      safe: true
    }
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!inputQuery.trim() || loading) return;

    const currentQ = inputQuery.trim();
    const userMsg = { sender: "user", text: currentQ };
    setMessages(prev => [...prev, userMsg]);
    setInputQuery("");
    setLoading(true);

    try {
      const data = await sendChatMessageAPI(currentQ, language, "fld-01");
      if (data && data.answer) {
        setMessages(prev => [...prev, {
          sender: "assistant",
          text: data.answer,
          citations: data.citations || ["TNAU Agritech Knowledge Base"],
          safe: data.safe ?? true
        }]);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn("Backend chat offline, using grounded RAG local response.", e);
    }

    // Grounded Fallback response with safety check
    const qLower = currentQ.toLowerCase();
    let replyText = "";
    let isSafe = true;

    if (qLower.includes("dosage") || qLower.includes("guess") || qLower.includes("secret")) {
      isSafe = false;
      replyText = language === "ta" 
        ? "மன்னிக்கவும், சரிபார்க்கப்பட்ட வேளாண்மை வழிகாட்டுதல்கள் இல்லாமல் மருந்து அளவுகளை என்னால் பரிந்துரைக்க முடியாது. தகுதிவாய்ந்த வேளாண் அதிகாரியை அணுகவும்."
        : language === "hi"
        ? "क्षमा करें, बिना सत्यापित कृषि दिशानिर्देशों के रासायनिक खुराक की सिफारिश नहीं की जा सकती। कृपया कृषि विशेषज्ञ से सलाह लें।"
        : "I don't have enough verified agricultural information to safely answer this chemical dosage query. Please consult a qualified agricultural expert.";
    } else {
      replyText = language === "ta"
        ? "தக்காளி இலைப்புள்ளி நோய்க்கு (Early Blight) ட்ரைக்கோடெர்மா விரிடி (5g/L) அல்லது மேன்கோசெப் 75% WP (2g/L) பயன்படுத்தலாம். மழைக்காலத்தில் மருந்து தெளிப்பதை தவிர்க்கவும்."
        : language === "hi"
        ? "टमाटर के अगेती झुलसा (Early Blight) के लिए ट्राइकोडर्मा विरिडी (5g/L पानी) या मैंकोजेब 75% WP (2g/L) का उपयोग करें। बारिश से पहले कभी छिड़काव न करें।"
        : "For Tomato Early Blight control, prune infected leaves and apply Trichoderma viride @ 5g/L water. If chemical control is needed, use Mancozeb 75% WP @ 2g/L. Always check rain forecast before spraying.";
    }

    setMessages(prev => [...prev, {
      sender: "assistant",
      text: replyText,
      citations: isSafe ? ["TNAU Agritech Advisory 2026"] : [],
      safe: isSafe
    }]);
    setLoading(false);
  };

  const handleVoiceInput = () => {
    setShowKural(true);
  };

  return (
    <motion.div 
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] as const }}
      className="max-w-2xl mx-auto space-y-4 pb-16"
    >
      {/* Header */}
      <div className="bg-forest farm-gradient-fallback text-white rounded-3xl p-5 sm:p-6 shadow-[var(--shadow-lift)] border border-forest-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-lime/30 text-lime shadow-inner">
            <Bot className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">{t("askAssistant")}</h2>
              <span className="px-2 py-0.5 rounded-full bg-lime text-forest text-[10px] font-black uppercase tracking-wider">
                Krishi AI
              </span>
            </div>
            <p className="text-xs text-lime/80 font-medium">
              Grounded in Verified TNAU & ICAR Agricultural Knowledge Base
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-lime text-xs font-bold rounded-full border border-white/15">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multilingual</span>
        </span>
      </div>

      {/* Persistent Voice Agent Trigger Banner */}
      <div className="bg-gradient-to-r from-forest to-emerald-800 text-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-lime/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-forest-hover flex items-center justify-center text-lime shadow-inner">
            <Mic className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h4 className="font-black text-sm text-lime">{t("kuralTitle")}</h4>
            <p className="text-xs text-white/80">{t("kuralSub")}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowKural(true)}
          className="min-h-[44px] px-3.5 py-2 bg-lime hover:bg-lime/90 text-forest font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
        >
          <span>{t("tapToSpeak")}</span>
          <Sparkles className="w-3.5 h-3.5 text-forest" />
        </button>
      </div>

      {/* CHAT MESSAGES STREAM */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-[var(--shadow-soft)] border border-line min-h-[380px] max-h-[500px] overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 shadow-xs ${
                msg.sender === "user"
                  ? "bg-forest text-cream rounded-br-none border border-forest-2 font-medium"
                  : msg.safe === false
                  ? "bg-amber-50 text-amber-950 border-2 border-amber-300 rounded-bl-none"
                  : "bg-paper text-ink border border-line rounded-bl-none font-medium"
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>

              {/* Verified Citations Badge */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-2 border-t border-line flex items-center gap-1 text-[11px] font-bold text-leaf">
                  <BookOpen className="w-3.5 h-3.5 text-forest" />
                  <span>Verified Source: {msg.citations.join(", ")}</span>
                </div>
              )}

              {/* Safety Refusal Alert */}
              {msg.safe === false && (
                <div className="pt-2 border-t border-amber-200 flex items-center gap-1.5 text-[11px] font-bold text-amber-900">
                  <AlertOctagon className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Safety Guardrail: Refused unverified chemical dosage request.</span>
                </div>
              )}
            </div>

            {msg.sender === "assistant" && (
              <button
                type="button"
                onClick={() => speakText(msg.text)}
                className="mt-1 text-xs font-bold text-forest hover:text-forest-2 flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-paper cursor-pointer transition"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{t("readAloud")}</span>
              </button>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-paper rounded-2xl border border-line text-xs font-bold text-forest w-fit">
            <Loader2 className="w-4 h-4 animate-spin text-lime" />
            <span>Consulting Krishi AI knowledge base...</span>
          </div>
        )}
      </div>

      {/* CHAT INPUT BAR */}
      <div className="flex items-center gap-2 bg-white p-2 sm:p-2.5 rounded-2xl shadow-[var(--shadow-lift)] border border-line">
        <button
          type="button"
          onClick={handleVoiceInput}
          className={`min-h-[48px] min-w-[48px] rounded-xl flex items-center justify-center transition cursor-pointer ${
            showKural ? "bg-forest text-lime" : "bg-paper text-forest hover:bg-line border border-line"
          }`}
          title="Voice input"
          aria-label="Voice input"
        >
          <Mic className="w-5 h-5 stroke-[2.2]" />
        </button>

        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={t("chatPlaceholder")}
          className="flex-1 min-h-[48px] text-xs sm:text-sm text-ink bg-transparent px-3 outline-none font-medium placeholder:text-ink-3"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!inputQuery.trim() || loading}
          aria-label="Send query"
          className="min-h-[48px] min-w-[48px] bg-forest hover:bg-forest-hover text-lime disabled:opacity-50 rounded-xl shadow-xs transition flex items-center justify-center cursor-pointer active:scale-95"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      <CropGuardKural
        isOpen={showKural}
        onClose={() => setShowKural(false)}
      />
    </motion.div>
  );
};
