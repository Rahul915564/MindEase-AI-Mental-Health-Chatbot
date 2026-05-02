import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

const translations: Translations = {
  "peace of mind": { en: "peace of mind", hi: "मन की शांति" },
  "my feelings": { en: "my feelings", hi: "मेरी भावनाएं" },
  "breathe": { en: "breathe", hi: "साँस लें" },
  "how are you today?": { en: "how are you today?", hi: "आज आप कैसे हैं?" },
  "log your mood": { en: "log your mood", hi: "अपना मूड दर्ज करें" },
  "Dashboard": { en: "Dashboard", hi: "डैशबोर्ड" },
  "Chat": { en: "Chat", hi: "चैट" },
  "Breathing": { en: "Breathing", hi: "साँस लेने का व्यायाम" },
  "Mood": { en: "Mood", hi: "मूड" },
  "Notifications": { en: "Notifications", hi: "सूचनाएं" },
  "Settings": { en: "Settings", hi: "सेटिंग्स" },
  "Welcome back": { en: "Welcome back", hi: "वापसी पर स्वागत है" },
  "Recent Chat": { en: "Recent Chat", hi: "हाल की चैट" },
  "Mood Stats": { en: "Mood Stats", hi: "मूड के आँकड़े" },
  "Average Mood": { en: "Average Mood", hi: "औसत मूड" },
  "Total Entries": { en: "Total Entries", hi: "कुल प्रविष्टियां" },
  "Streak": { en: "Streak", hi: "लगातार दिन" },
  "Trend": { en: "Trend", hi: "रुझान" },
  "Start a new chat": { en: "Start a new chat", hi: "नई चैट शुरू करें" },
  "New Conversation": { en: "New Conversation", hi: "नई बातचीत" },
  "Send": { en: "Send", hi: "भेजें" },
  "Type your message...": { en: "Type your message...", hi: "अपना संदेश लिखें..." },
  "Inhale": { en: "Inhale", hi: "साँस अंदर लें" },
  "Exhale": { en: "Exhale", hi: "साँस बाहर छोड़ें" },
  "Hold": { en: "Hold", hi: "रोक कर रखें" },
  "Box Breathing (4-4-4-4)": { en: "Box Breathing (4-4-4-4)", hi: "बॉक्स ब्रीदिंग (4-4-4-4)" },
  "4-7-8 Breathing": { en: "4-7-8 Breathing", hi: "4-7-8 ब्रीदिंग" },
  "Belly Breathing (5-5)": { en: "Belly Breathing (5-5)", hi: "बेली ब्रीदिंग (5-5)" },
  "Alternate Nostril (4-4-8)": { en: "Alternate Nostril (4-4-8)", hi: "अनुलोम विलोम (4-4-8)" },
  "Note (optional)": { en: "Note (optional)", hi: "टिप्पणी (वैकल्पिक)" },
  "Save Mood": { en: "Save Mood", hi: "मूड सहेजें" },
  "Mark as read": { en: "Mark as read", hi: "पढ़ा हुआ चिह्नित करें" },
  "Mark all as read": { en: "Mark all as read", hi: "सभी को पढ़ा हुआ चिह्नित करें" },
  "Dark Mode": { en: "Dark Mode", hi: "डार्क मोड" },
  "Language": { en: "Language", hi: "भाषा" },
  "Sign In": { en: "Sign In", hi: "साइन इन करें" },
  "Sign Up": { en: "Sign Up", hi: "साइन अप करें" },
  "Sign Out": { en: "Sign Out", hi: "साइन आउट करें" },
  "English": { en: "English", hi: "अंग्रेज़ी" },
  "Hindi": { en: "Hindi", hi: "हिंदी" },
  "MindEase": { en: "MindEase", hi: "माइंडईज़" },
  "A warm digital sanctuary where you feel heard, supported, and gently guided toward wellbeing.": { en: "A warm digital sanctuary where you feel heard, supported, and gently guided toward wellbeing.", hi: "एक गर्म डिजिटल अभयारण्य जहाँ आप महसूस करते हैं कि आपको सुना जाता है, समर्थन दिया जाता है, और धीरे से कल्याण की ओर निर्देशित किया जाता है।" },
  "Your mental health companion": { en: "Your mental health companion", hi: "आपका मानसिक स्वास्थ्य साथी" }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('mindease-language') as Language;
    if (saved && (saved === 'en' || saved === 'hi')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('mindease-language', lang);
  };

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language] || key;
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
