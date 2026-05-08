import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import arLocale from '../locales/ar.json';
import enLocale from '../locales/en.json';

type Language = 'ar' | 'en';

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, defaultValue?: string) => string;
  dir: 'rtl' | 'ltr';
  locale: Record<string, any>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const locales: Record<Language, Record<string, any>> = {
  ar: arLocale,
  en: enLocale,
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    // Try to get from localStorage, default to 'ar' for Saudi/UAE market
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('language');
      if (stored === 'ar' || stored === 'en') {
        return stored;
      }
    }
    return 'ar';
  });

  useEffect(() => {
    // Update document attributes for RTL/LTR
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    // Store language preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  }, [lang]);

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
  };

  // Deep get function to handle nested keys like "dashboard.title"
  const getNestedValue = (obj: Record<string, any>, path: string): string => {
    const keys = path.split('.');
    let value: any = obj;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return path; // Return the key path if not found
      }
    }
    
    return typeof value === 'string' ? value : path;
  };

  const t = (key: string, defaultValue?: string): string => {
    const locale = locales[lang];
    const translation = getNestedValue(locale, key);
    
    if (translation === key && defaultValue) {
      return defaultValue;
    }
    
    return translation;
  };

  const value: I18nContextType = {
    lang,
    setLang: handleSetLang,
    t,
    dir: lang === 'ar' ? 'rtl' : 'ltr',
    locale: locales[lang],
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

// Helper hook for language switcher
export function useLanguageSwitcher() {
  const { lang, setLang } = useI18n();
  
  const toggleLanguage = () => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  };
  
  return { lang, setLang, toggleLanguage };
}
