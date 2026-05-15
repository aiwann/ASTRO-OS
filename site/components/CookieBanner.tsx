"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export const COOKIE_STORAGE_KEY = "astro-cookie-consent";
export const COOKIE_CONSENT_EVENT = "astro-cookie-consent-change";

export type CookieConsent = "all" | "necessary";

/**
 * Helper за други компоненти (напр. Clarity, Pixel) — да проверяват
 * текущото съгласие без да достъпват директно localStorage.
 */
export function getCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(COOKIE_STORAGE_KEY);
  return v === "all" || v === "necessary" ? v : null;
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (!stored) {
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = (choice: CookieConsent) => {
    localStorage.setItem(COOKIE_STORAGE_KEY, choice);
    // Информираме другите слушатели (Clarity, Pixel и т.н.), че имаме съгласие.
    window.dispatchEvent(
      new CustomEvent(COOKIE_CONSENT_EVENT, { detail: choice }),
    );
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 sm:pb-6 animate-fade-in">
      <div className="mx-auto max-w-4xl rounded-xl border border-gold/30 bg-card/95 backdrop-blur-md shadow-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <p className="text-sm sm:text-base text-parchment/90 flex-1">
            Използваме бисквитки за функционалност, анализ и маркетинг.
            Виж нашата{" "}
            <Link
              href="/privacy"
              className="text-gold hover:text-gold-light underline underline-offset-2"
            >
              политика за поверителност
            </Link>
            .
          </p>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => accept("necessary")}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium border border-gold/50 text-gold-light rounded-md hover:bg-gold/10 transition-colors"
            >
              Само необходимите
            </button>
            <button
              onClick={() => accept("all")}
              className="flex-1 sm:flex-none px-5 py-2 text-sm font-semibold bg-gold text-dark rounded-md hover:bg-gold-light transition-colors"
            >
              Приемам всички
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
