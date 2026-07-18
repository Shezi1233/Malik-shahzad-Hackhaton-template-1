"use client";

import { useTranslation } from "@/i18n/useTranslation";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "ur", label: "اردو" },
  { code: "ar", label: "العربية" },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useTranslation();

  return (
    <div className="flex items-center gap-1">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code as any)}
          className={`text-[10px] px-1.5 py-0.5 rounded font-medium transition-colors ${
            lang === l.code ? "bg-black text-white" : "text-gray-400 hover:text-black"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
