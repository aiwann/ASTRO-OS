"use client";

import { useCallback, useEffect, useState } from "react";
import {
  I18N_EVENT,
  I18N_STORAGE_KEY,
  Language,
  TranslationKey,
  translate,
} from "@/lib/i18n";

function readStored(): Language {
  if (typeof window === "undefined") return "bg";
  const v = window.localStorage.getItem(I18N_STORAGE_KEY);
  return v === "en" ? "en" : "bg";
}

export function useLanguage() {
  const [language, setLanguage] = useState<Language>("bg");

  useEffect(() => {
    setLanguage(readStored());
    const handler = (e: Event) => {
      const next = (e as CustomEvent<Language>).detail;
      if (next === "bg" || next === "en") setLanguage(next);
    };
    window.addEventListener(I18N_EVENT, handler);
    return () => window.removeEventListener(I18N_EVENT, handler);
  }, []);

  const switchLanguage = useCallback((lang: Language) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(I18N_STORAGE_KEY, lang);
    window.dispatchEvent(new CustomEvent(I18N_EVENT, { detail: lang }));
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) =>
      translate(language, key, vars),
    [language],
  );

  return { language, switchLanguage, t };
}
