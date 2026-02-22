'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import en from './locales/en.json';
import es from './locales/es.json';

// ── Types ──────────────────────────────────────────────
type TranslationMap = Record<string, Record<string, string>>;

export type Locale = 'en' | 'es';

const translations: Record<Locale, TranslationMap> = { en, es };

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
};

// ── Context ────────────────────────────────────────────
interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
});

// ── Provider ───────────────────────────────────────────
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('locale') as Locale) || 'en';
    }
    return 'en';
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', l);
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      // key format: "section.key", e.g. "common.save"
      const [section, ...rest] = key.split('.');
      const field = rest.join('.');
      const map = translations[locale];
      return map?.[section]?.[field] ?? key;
    },
    [locale]
  );

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

// ── Hook ───────────────────────────────────────────────
export function useTranslation() {
  return useContext(I18nContext);
}
