"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";

export default function Navigation() {
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Promo banner — fixed above the header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0810] border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-4 py-2 text-center">
          <p className="text-[11px] sm:text-xs tracking-[0.18em] sm:tracking-[0.25em] uppercase text-parchment/80">
            <span className="text-gold">✦</span>{" "}
            <span className="text-gold/90">ПРОМОЦИЯ САМО СЕГА</span>{" "}
            <span className="text-parchment/60">—</span>{" "}
            <span className="hidden sm:inline">Пълен Анализ от 11.99 евро</span>
            <span className="sm:hidden">от 11.99 €</span>{" "}
            <span className="text-gold">✦</span>
          </p>
        </div>
      </div>

      <header className="fixed top-9 left-0 right-0 z-40 backdrop-blur-md bg-dark/70 border-b border-gold/15">
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            href="/"
            onClick={closeMobile}
            className="font-serif text-2xl sm:text-3xl tracking-[0.25em] text-gold hover:text-gold-light transition-colors"
          >
            АСТРО ОС
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/quick-analyses"
              className="px-4 py-2 text-sm text-parchment/90 hover:text-gold-light transition-colors"
            >
              {t("nav.quickAnalyses")}
            </Link>
            <Link
              href="/deep-analyses"
              className="px-4 py-2 text-sm text-parchment/90 hover:text-gold-light transition-colors"
            >
              {t("nav.deepAnalyses")}
            </Link>
            <Link
              href="/faq"
              className="px-4 py-2 text-sm text-parchment/90 hover:text-gold-light transition-colors"
            >
              {t("nav.faq")}
            </Link>
            <Link
              href="/about"
              className="px-4 py-2 text-sm text-parchment/90 hover:text-gold-light transition-colors"
            >
              {t("nav.about")}
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/products/personal-profile"
              className="hidden sm:inline-flex items-center gap-1 px-5 py-2.5 text-sm font-medium border border-gold text-gold rounded-md hover:bg-gold hover:text-dark transition-colors"
            >
              {t("nav.startNow")}
            </Link>

            {/* Hamburger — mobile only */}
            <button
              type="button"
              aria-label={mobileOpen ? t("nav.closeMenu") : t("nav.openMenu")}
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-[6px] rounded-md hover:bg-gold/10 transition-colors"
            >
              <span
                className={`block w-6 h-px bg-gold transition-all origin-center ${
                  mobileOpen ? "rotate-45 translate-y-[7px]" : ""
                }`}
              />
              <span
                className={`block w-6 h-px bg-gold transition-all ${
                  mobileOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block w-6 h-px bg-gold transition-all origin-center ${
                  mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""
                }`}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-dark animate-fade-in overflow-y-auto md:hidden">
          <div className="flex items-center justify-between px-6 h-20 border-b border-gold/15">
            <Link
              href="/"
              onClick={closeMobile}
              className="font-serif text-2xl tracking-[0.25em] text-gold"
            >
              АСТРО ОС
            </Link>
            <button
              type="button"
              aria-label={t("nav.closeMenu")}
              onClick={closeMobile}
              className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gold/10 transition-colors text-gold text-2xl leading-none"
            >
              ✕
            </button>
          </div>

          <div className="px-6 py-8 space-y-3">

            <Link
              href="/quick-analyses"
              onClick={closeMobile}
              className="flex items-center justify-between py-4 border-b border-gold/10 text-lg text-parchment/90 hover:text-gold-light transition-colors group"
            >
              <span>{t("nav.quickAnalyses")}</span>
              <span className="text-gold/50 group-hover:text-gold">→</span>
            </Link>

            <Link
              href="/deep-analyses"
              onClick={closeMobile}
              className="flex items-center justify-between py-4 border-b border-gold/10 text-lg text-parchment/90 hover:text-gold-light transition-colors group"
            >
              <span>{t("nav.deepAnalyses")}</span>
              <span className="text-gold/50 group-hover:text-gold">→</span>
            </Link>

            <Link
              href="/faq"
              onClick={closeMobile}
              className="flex items-center justify-between py-4 border-b border-gold/10 text-lg text-parchment/90 hover:text-gold-light transition-colors group"
            >
              <span>{t("nav.faq")}</span>
              <span className="text-gold/50 group-hover:text-gold">→</span>
            </Link>

            <Link
              href="/about"
              onClick={closeMobile}
              className="flex items-center justify-between py-4 border-b border-gold/10 text-lg text-gold/80 hover:text-gold-light transition-colors group"
            >
              <span>{t("nav.about")}</span>
              <span className="text-gold/50 group-hover:text-gold">→</span>
            </Link>

            <div className="pt-6">
              <Link
                href="/products/personal-profile"
                onClick={closeMobile}
                className="block w-full text-center py-4 bg-gold text-dark font-semibold rounded-md hover:bg-gold-light transition-colors text-lg"
              >
                {t("nav.startNow")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
