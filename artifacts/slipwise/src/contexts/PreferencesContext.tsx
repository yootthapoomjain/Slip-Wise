import React, { createContext, useContext, useState, useEffect } from "react";
import type { Language } from "@/i18n/translations";
import { translations } from "@/i18n/translations";

export type Currency = "THB" | "USD" | "EUR" | "GBP" | "JPY" | "SGD";
export type CalendarEra = "gregorian" | "buddhist";
export type DateFormatType = "long" | "short" | "numeric";

interface PreferencesContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  calendarEra: CalendarEra;
  setCalendarEra: (era: CalendarEra) => void;
  dateFormat: DateFormatType;
  setDateFormat: (f: DateFormatType) => void;
  t: typeof translations.th;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

const STORAGE_KEY = "slipwise-prefs";

function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (!v) return fallback;
    const parsed = JSON.parse(v);
    return (parsed[key] as T) ?? fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    const parsed = v ? JSON.parse(v) : {};
    parsed[key] = value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // ignore
  }
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [language, _setLanguage] = useState<Language>(() => load("language", "th"));
  const [currency, _setCurrency] = useState<Currency>(() => load("currency", "THB"));
  const [calendarEra, _setCalendarEra] = useState<CalendarEra>(() => load("calendarEra", "buddhist"));
  const [dateFormat, _setDateFormat] = useState<DateFormatType>(() => load("dateFormat", "short"));

  const setLanguage = (lang: Language) => { save("language", lang); _setLanguage(lang); };
  const setCurrency = (c: Currency) => { save("currency", c); _setCurrency(c); };
  const setCalendarEra = (era: CalendarEra) => { save("calendarEra", era); _setCalendarEra(era); };
  const setDateFormat = (f: DateFormatType) => { save("dateFormat", f); _setDateFormat(f); };

  const t = translations[language];

  return (
    <PreferencesContext.Provider value={{ language, setLanguage, currency, setCurrency, calendarEra, setCalendarEra, dateFormat, setDateFormat, t }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used inside PreferencesProvider");
  return ctx;
}
