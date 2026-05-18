"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { PRODUCTS, formatEUR } from "@/lib/products";

const FREE_TOOLS = [
  { slug: "personal-number", title: "Личен Код", tag: "Нумерология" },
  { slug: "love-percentage", title: "Любовен Процент", tag: "Съвместимост" },
  { slug: "archetype", title: "Архетип Профил", tag: "Архетипи" },
  { slug: "energy", title: "Енергийно Отражение", tag: "Стихии" },
  { slug: "social-image", title: "Социален Образ", tag: "Образ" },
];

const PAID_ORDER = [
  "personal-profile",
  "archetype-profile",
  "yearly-analysis",
  "life-map",
  "hidden-potential",
  "energy-profile",
  "synastry",
  "ideal-partner",
  "full-life-code",
];

export default function Navigation() {
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [deepOpen, setDeepOpen] = useState(false);
  const quickRef = useRef<HTMLDivElement>(null);
  const deepRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) setQuickOpen(false);
      if (deepRef.current && !deepRef.current.contains(e.target as Node)) setDeepOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);
  const paidProducts = PAID_ORDER.map((s) => PRODUCTS[s]).filter(Boolean);

  return (
    <>
      {/* Promo banner */}
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
          {/* Logo */}
          <Link
            href="/"
            onClick={closeMobile}
            className="font-serif text-2xl sm:text-3xl tracking-[0.25em] text-gold hover:text-gold-light transition-colors"
          >
            АСТРО ОС
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {/* Бързи Анализи dropdown */}
            <div ref={quickRef} className="relative">
              <button
                onClick={() => { setQuickOpen((v) => !v); setDeepOpen(false); }}
                className="flex items-center gap-1 px-4 py-2 text-sm text-parchment/90 hover:text-gold-light transition-colors"
              >
                {t("nav.quickAnalyses")}
                <span className={`text-gold/60 text-xs transition-transform ${quickOpen ? "rotate-180" : ""}`}>▾</span>
              </button>

              {quickOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 rounded-xl border border-gold/20 bg-[#0e0b16]/95 backdrop-blur-md shadow-[0_8px_40px_rgba(0,0,0,0.6)] overflow-hidden">
                  <div className="px-3 pt-3 pb-1">
                    <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 mb-2">Безплатни инструменти</p>
                  </div>
                  {FREE_TOOLS.map((tool) => (
                    <Link
                      key={tool.slug}
                      href={`/free-tools/${tool.slug}`}
                      onClick={() => setQuickOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-sm text-parchment/80 hover:text-gold-light hover:bg-gold/5 transition-colors group"
                    >
                      <span>{tool.title}</span>
                      <span className="text-[10px] text-parchment/30 group-hover:text-gold/50">{tool.tag}</span>
                    </Link>
                  ))}
                  <div className="px-3 py-2 border-t border-gold/10 mt-1">
                    <Link
                      href="/quick-analyses"
                      onClick={() => setQuickOpen(false)}
                      className="text-xs text-gold/60 hover:text-gold transition-colors"
                    >
                      Виж всички →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Задълбочени Анализи dropdown */}
            <div ref={deepRef} className="relative">
              <button
                onClick={() => { setDeepOpen((v) => !v); setQuickOpen(false); }}
                className="flex items-center gap-1 px-4 py-2 text-sm text-parchment/90 hover:text-gold-light transition-colors"
              >
                {t("nav.deepAnalyses")}
                <span className={`text-gold/60 text-xs transition-transform ${deepOpen ? "rotate-180" : ""}`}>▾</span>
              </button>

              {deepOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 rounded-xl border border-gold/20 bg-[#0e0b16]/95 backdrop-blur-md shadow-[0_8px_40px_rgba(0,0,0,0.6)] overflow-hidden max-h-[70vh] overflow-y-auto">
                  <div className="px-3 pt-3 pb-1">
                    <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 mb-2">AI Анализи • PDF</p>
                  </div>
                  {paidProducts.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/products/${p.slug}`}
                      onClick={() => setDeepOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-sm text-parchment/80 hover:text-gold-light hover:bg-gold/5 transition-colors group"
                    >
                      <span className={p.featured ? "text-gold/90" : ""}>{p.title}</span>
                      <span className="text-xs text-emerald-400/80 ml-2 shrink-0">{formatEUR(p.newPrice)}</span>
                    </Link>
                  ))}
                  <div className="px-3 py-2 border-t border-gold/10 mt-1">
                    <Link
                      href="/deep-analyses"
                      onClick={() => setDeepOpen(false)}
                      className="text-xs text-gold/60 hover:text-gold transition-colors"
                    >
                      Виж всички →
                    </Link>
                  </div>
                </div>
              )}
            </div>

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
              {t("nav.startNow")} →
            </Link>

            {/* Hamburger — mobile only */}
            <button
              type="button"
              aria-label={mobileOpen ? t("nav.closeMenu") : t("nav.openMenu")}
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-[6px] rounded-md hover:bg-gold/10 transition-colors"
            >
              <span className={`block w-6 h-px bg-gold transition-all origin-center ${mobileOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
              <span className={`block w-6 h-px bg-gold transition-all ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block w-6 h-px bg-gold transition-all origin-center ${mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-dark animate-fade-in overflow-y-auto md:hidden">
          <div className="flex items-center justify-between px-6 h-20 border-b border-gold/15">
            <Link href="/" onClick={closeMobile} className="font-serif text-2xl tracking-[0.25em] text-gold">
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

          <div className="px-6 py-8 space-y-1">
            {/* Бързи анализи — мобилна секция */}
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 px-0 pb-2 pt-2">Бързи Анализи</p>
            {FREE_TOOLS.map((tool) => (
              <Link
                key={tool.slug}
                href={`/free-tools/${tool.slug}`}
                onClick={closeMobile}
                className="flex items-center justify-between py-3 border-b border-gold/10 text-base text-parchment/80 hover:text-gold-light transition-colors group"
              >
                <span>{tool.title}</span>
                <span className="text-gold/50 group-hover:text-gold text-sm">→</span>
              </Link>
            ))}

            {/* Задълбочени анализи — мобилна секция */}
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 px-0 pb-2 pt-5">Задълбочени Анализи</p>
            {paidProducts.map((p) => (
              <Link
                key={p.slug}
                href={`/products/${p.slug}`}
                onClick={closeMobile}
                className="flex items-center justify-between py-3 border-b border-gold/10 text-base text-parchment/80 hover:text-gold-light transition-colors group"
              >
                <span className={p.featured ? "text-gold/90" : ""}>{p.title}</span>
                <span className="text-emerald-400/80 text-sm">{formatEUR(p.newPrice)}</span>
              </Link>
            ))}

            <div className="flex gap-3 pt-4 border-b border-gold/10 pb-3">
              <Link
                href="/faq"
                onClick={closeMobile}
                className="flex-1 py-3 text-center text-sm text-parchment/60 hover:text-gold-light transition-colors"
              >
                {t("nav.faq")}
              </Link>
              <Link
                href="/about"
                onClick={closeMobile}
                className="flex-1 py-3 text-center text-sm text-parchment/60 hover:text-gold-light transition-colors"
              >
                {t("nav.about")}
              </Link>
            </div>

            <div className="pt-6">
              <Link
                href="/products/personal-profile"
                onClick={closeMobile}
                className="block w-full text-center py-4 bg-gold text-dark font-semibold rounded-md hover:bg-gold-light transition-colors text-lg"
              >
                {t("nav.startNow")} →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
