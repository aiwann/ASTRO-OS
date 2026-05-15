"use client";

import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import { TranslationKey } from "@/lib/i18n";

const SYSTEM_CARDS: { emoji: string; titleKey: TranslationKey; bodyKey: TranslationKey }[] = [
  { emoji: "🪐", titleKey: "home.tech.card1.title", bodyKey: "home.tech.card1.body" },
  { emoji: "🏠", titleKey: "home.tech.card2.title", bodyKey: "home.tech.card2.body" },
  { emoji: "☌", titleKey: "home.tech.card3.title", bodyKey: "home.tech.card3.body" },
  { emoji: "🔢", titleKey: "home.tech.card4.title", bodyKey: "home.tech.card4.body" },
  { emoji: "♾", titleKey: "home.tech.card5.title", bodyKey: "home.tech.card5.body" },
  { emoji: "🌊", titleKey: "home.tech.card6.title", bodyKey: "home.tech.card6.body" },
  { emoji: "👁", titleKey: "home.tech.card7.title", bodyKey: "home.tech.card7.body" },
];

const WHY_CARDS: { emoji: string; titleKey: TranslationKey; bodyKey: TranslationKey }[] = [
  { emoji: "⚡", titleKey: "home.why.fast.title", bodyKey: "home.why.fast.body" },
  { emoji: "🎯", titleKey: "home.why.accurate.title", bodyKey: "home.why.accurate.body" },
  { emoji: "💎", titleKey: "home.why.affordable.title", bodyKey: "home.why.affordable.body" },
];

export default function Home() {
  const { t } = useLanguage();

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <p className="text-gold/70 text-xs sm:text-sm tracking-[0.4em] uppercase mb-6">
            {t("home.badge")}
          </p>

          <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-tight leading-[0.95]">
            <span className="gold-gradient-text">{t("home.title")}</span>
          </h1>

          <div className="mt-8 mx-auto w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

          <p className="mt-10 text-lg sm:text-xl text-parchment/80 max-w-2xl mx-auto leading-relaxed">
            {t("home.subtitle1")}
          </p>
          <p className="mt-3 text-base sm:text-lg text-parchment/65 max-w-2xl mx-auto leading-relaxed">
            {t("home.subtitle2")}
          </p>

          <div className="mt-12 flex justify-center">
            <Link
              href="/analyses"
              className="group px-8 py-4 bg-gold text-dark font-semibold rounded-md hover:bg-gold-light transition-all hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] inline-flex items-center gap-2"
            >
              {t("home.cta.viewAnalyses")}
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative px-6 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.3em] uppercase text-gold/70 mb-3">
              {t("home.tech.kicker")}
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light">
              <span className="gold-gradient-text">{t("home.tech.title")}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {SYSTEM_CARDS.map((card) => (
              <div
                key={card.titleKey}
                className="rounded-xl border border-gold/20 bg-card/50 backdrop-blur-sm p-5 hover:border-gold/40 hover:bg-card/70 transition-all"
              >
                <div className="text-3xl mb-3">{card.emoji}</div>
                <h3 className="font-serif text-lg font-light text-parchment mb-2">
                  {t(card.titleKey)}
                </h3>
                <p className="text-sm text-parchment/65 leading-relaxed">
                  {t(card.bodyKey)}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-12 text-center font-serif text-xl sm:text-2xl italic text-parchment/80">
            {t("home.tech.result.prefix")}{" "}
            <span className="gold-gradient-text">
              {t("home.tech.result.highlight")}
            </span>{" "}
            {t("home.tech.result.suffix")}
          </p>
        </div>
      </section>

      {/* Why Astro OS */}
      <section className="relative px-6 pb-24 sm:pb-32">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.3em] uppercase text-gold/70 mb-3">
              {t("home.why.kicker")}
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light">
              <span className="gold-gradient-text">{t("home.why.title")}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {WHY_CARDS.map((card) => (
              <div
                key={card.titleKey}
                className="rounded-2xl border border-gold/25 bg-card/60 backdrop-blur-sm p-8 text-center hover:border-gold/50 transition-all"
              >
                <div className="text-4xl mb-4">{card.emoji}</div>
                <h3 className="font-serif text-2xl font-light gold-gradient-text mb-3">
                  {t(card.titleKey)}
                </h3>
                <p className="text-parchment/70 leading-relaxed text-sm">
                  {t(card.bodyKey)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/products/personal-profile"
              className="group px-10 py-4 bg-gold text-dark font-semibold rounded-md hover:bg-gold-light transition-all hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] inline-flex items-center gap-2 text-lg"
            >
              {t("home.cta.startNow")}
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
            <p className="mt-4 text-xs text-muted tracking-wider uppercase">
              {t("home.cta.deliveryNote")}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
