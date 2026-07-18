"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import translations from "./translations.json";

type Lang = "en" | "ur" | "ar";

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (path: string) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) return { t: (p: string) => p, lang: "en" as Lang, setLang: () => {}, dir: "ltr" as const };
  return ctx;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang;
    if (saved && ["en", "ur", "ar"].includes(saved)) setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  const t = (path: string): string => {
    const keys = path.split(".");
    let result: any = (translations as any)[lang];
    for (const key of keys) {
      if (result) result = result[key];
    }
    return typeof result === "string" ? result : path;
  };

  const dir = lang === "ur" || lang === "ar" ? "rtl" : "ltr";

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir }}>
      <div dir={dir}>{children}</div>
    </I18nContext.Provider>
  );
}
