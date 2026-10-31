import React, { createContext, useContext, useState } from "react";
import en from "./en.json";
import ta from "./ta.json";
import hi from "./hi.json";

type Language = "en" | "ta" | "hi";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof en, fallback?: string) => string;
  speakText: (text: string, onEnd?: () => void) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

const dictionaries: Record<Language, any> = { en, ta, hi };

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("cropguard_lang") as Language) || "en";
  });
  const [isSpeaking, setIsSpeaking] = useState(false);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("cropguard_lang", lang);
  };

  const t = (key: keyof typeof en, fallback?: string): string => {
    const dict = dictionaries[language] || en;
    return dict[key] || en[key] || fallback || key;
  };

  const speakText = (text: string, onEnd?: () => void) => {
    if (!("speechSynthesis" in window) || !text.trim()) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92; // Slightly measured pace for rural low-literacy farmers

    if (language === "ta") {
      utterance.lang = "ta-IN";
    } else if (language === "hi") {
      utterance.lang = "hi-IN";
    } else {
      utterance.lang = "en-IN";
    }

    // Try finding a matching language voice if loaded
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const targetLang = language === "ta" ? "ta" : language === "hi" ? "hi" : "en";
      const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(targetLang));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, speakText, stopSpeaking, isSpeaking }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useTranslation must be used within an I18nProvider");
  return context;
};
