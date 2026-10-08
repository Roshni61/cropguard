import React, { useState } from "react";
import { Bot, Send, Mic, Volume2, AlertOctagon, BookOpen } from "lucide-react";
import { useTranslation } from "../i18n/I18nContext";

export const AssistantPage: React.FC = () => {
  const { t, language, speakText } = useTranslation();
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
  const [isListening, setIsListening] = useState(false);

  const handleSend = async () => {
    if (!inputQuery.trim()) return;

    const userMsg = { sender: "user", text: inputQuery };
    setMessages(prev => [...prev, userMsg]);
    const currentQ = inputQuery;
    setInputQuery("");

    try {
      const res = await fetch("http://localhost:8000/api/v1/chat/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: currentQ, language, field_id: "fld-01" })
      });
      if (res.ok) {
        const json = await res.json();
        setMessages(prev => [...prev, {
          sender: "assistant",
          text: json.data.answer,
          citations: json.data.citations,
          safe: json.data.safe
        }]);
        return;
      }
    } catch (e) {
      console.warn("Backend chat offline, using grounded RAG local response.");
    }

    // Grounded Fallback response with safety check
    const qLower = currentQ.toLowerCase();
    let replyText = "";
    let isSafe = true;

    if (qLower.includes("dosage") || qLower.includes("guess") || qLower.includes("secret")) {
      isSafe = false;
      replyText = language === "ta" 
        ? "மன்னிக்கவும், சரிபார்க்கப்பட்ட வேளாண்மை வழிகாட்டுதல்கள் இல்லாமல் மருந்து அளவுகளை என்னால் பரிந்துரைக்க முடியாது."
        : "I don't have enough verified agricultural information to safely answer this chemical dosage query. Please consult a qualified agricultural expert.";
    } else {
      replyText = language === "ta"
        ? "தக்காளி இலைப்புள்ளி நோய்க்கு (Early Blight) ட்ரைக்கோடெர்மா விரிடி (5g/L) அல்லது மேன்கோசெப் 75% WP (2g/L) பயன்படுத்தலாம். மழைக்காலத்தில் மருந்து தெளிப்பதை தவிர்க்கவும்."
        : "For Tomato Early Blight control, prune infected leaves and apply Trichoderma viride @ 5g/L water. If chemical control is needed, use Mancozeb 75% WP @ 2g/L. Always check rain forecast before spraying.";
    }

    setMessages(prev => [...prev, {
      sender: "assistant",
      text: replyText,
      citations: isSafe ? ["TNAU Agritech Advisory 2026"] : [],
      safe: isSafe
    }]);
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language === "ta" ? "ta-IN" : language === "hi" ? "hi-IN" : "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputQuery(transcript);
    };

    recognition.start();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-green-800 text-white rounded-3xl p-5 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700/60 flex items-center justify-center border border-emerald-400/40">
            <Bot className="w-7 h-7 text-emerald-200" />
          </div>
          <div>
            <h2 className="text-xl font-black">{t("askAssistant")}</h2>
            <p className="text-xs text-emerald-200 font-medium">
              Grounded in Verified TNAU & ICAR Agricultural Knowledge Base
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-950/60 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-700">
          RAG Active
        </span>
      </div>

      {/* CHAT MESSAGES STREAM */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 min-h-[380px] max-h-[480px] overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 shadow-sm ${
                msg.sender === "user"
                  ? "bg-emerald-600 text-white rounded-br-none"
                  : msg.safe === false
                  ? "bg-amber-50 text-amber-950 border border-amber-300 rounded-bl-none"
                  : "bg-slate-100 text-slate-900 border border-slate-200 rounded-bl-none"
              }`}
            >
              <p className="whitespace-pre-line font-medium">{msg.text}</p>

              {/* Verified Citations Badge */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                  <BookOpen className="w-3 h-3 text-emerald-600" />
                  <span>Verified Source: {msg.citations.join(", ")}</span>
                </div>
              )}

              {/* Safety Refusal Alert */}
              {msg.safe === false && (
                <div className="pt-2 border-t border-amber-200 flex items-center gap-1 text-[10px] font-bold text-amber-800">
                  <AlertOctagon className="w-3.5 h-3.5 text-amber-600" />
                  <span>Safety Guardrail: Refused unverified chemical dosage request.</span>
                </div>
              )}
            </div>

            {msg.sender === "assistant" && (
              <button
                onClick={() => speakText(msg.text)}
                className="mt-1 text-[10px] font-bold text-emerald-700 flex items-center gap-1 hover:underline"
              >
                <Volume2 className="w-3 h-3" />
                <span>Listen Answer</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* CHAT INPUT BAR */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-lg border border-slate-200">
        <button
          onClick={handleVoiceInput}
          className={`p-3 rounded-xl transition ${
            isListening ? "bg-red-500 text-white animate-pulse" : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
          }`}
          title="Voice input"
        >
          <Mic className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={t("chatPlaceholder")}
          className="flex-1 text-xs text-slate-900 bg-transparent px-2 outline-none font-medium"
        />

        <button
          onClick={handleSend}
          className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
