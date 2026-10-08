import React, { createContext, useContext, useState } from "react";
import en from "./en.json";
import ta from "./ta.json";
import hi from "./hi.json";

type Language = "en" | "ta" | "hi";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof en, fallback?: string) => string;
  speakText: (text: string) => void;
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

  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (language === "ta") utterance.lang = "ta-IN";
    else if (language === "hi") utterance.lang = "hi-IN";
    else utterance.lang = "en-US";

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

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
