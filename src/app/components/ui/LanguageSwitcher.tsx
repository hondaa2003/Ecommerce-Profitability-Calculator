import React from 'react';
import { useI18n } from '../i18n';

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();

  const toggleLanguage = () => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle language"
      title={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      <span className="text-sm font-medium">
        {lang === 'ar' ? 'EN' : 'العربية'}
      </span>
    </button>
  );
}

// Compact version for header
export function LanguageSwitcherCompact() {
  const { lang, toggleLanguage } = useLanguageSwitcher();

  return (
    <button
      onClick={toggleLanguage}
      className="text-sm font-medium px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle language"
    >
      {lang === 'ar' ? 'EN' : 'AR'}
    </button>
  );
}

// Dropdown version for settings
export function LanguageSelector() {
  const { lang, setLang } = useLanguageSwitcher();

  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value as 'ar' | 'en')}
      className="px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white"
    >
      <option value="ar">العربية</option>
      <option value="en">English</option>
    </select>
  );
}
