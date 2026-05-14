"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatEUR } from "@/lib/products";

type Offer = {
  title: string;
  hook: string;
  oldPrice: number;
  newPrice: number;
  includes: string[];
  buttonLabel: string;
  featured?: boolean;
};

const OFFERS: Offer[] = [
  {
    title: "VIP Животен Код",
    hook: "Всичките 8 анализа в един луксозен PDF",
    oldPrice: 124.99,
    newPrice: 49.99,
    includes: [
      "Личен Профил",
      "Любовна Съвместимост",
      "Годишен Анализ",
      "Архетип",
      "Карта на Живота",
      "Скрит Потенциал",
      "Енергиен Профил",
      "Идеален Партньор",
    ],
    buttonLabel: "Да, добави към поръчката →",
    featured: true,
  },
  {
    title: "Дълбок Психологически Профил",
    hook: "Shadow traits, поведенчески модели, емоционални блокажи",
    oldPrice: 74.99,
    newPrice: 29.99,
    includes: [
      "Shadow traits анализ",
      "Поведенчески модели",
      "Емоционални блокажи",
      "Трансформационен план",
    ],
    buttonLabel: "Добави за €29.99",
  },
  {
    title: "Любовна Съвместимост",
    hook: "Анализ на двойката — chemistry, динамика, предизвикателства",
    oldPrice: 37.49,
    newPrice: 14.99,
    includes: [
      "Compatibility score",
      "Емоционална динамика",
      "Силни страни и предизвикателства",
      "Кармичен урок на връзката",
    ],
    buttonLabel: "Добави за €14.99",
  },
];

const COUNTDOWN_SECONDS = 5 * 60;

function formatTime(s: number): string {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

export default function UpsellPage() {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 animate-fade-in">
      <header className="text-center mb-10">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light leading-tight">
          <span className="gold-gradient-text">
            ✦ Изчакай — специална еднократна оферта ✦
          </span>
        </h1>
        <p className="mt-3 text-parchment/70 text-base sm:text-lg">
          Само за следващите 5 минути
        </p>
        <div className="mt-6 inline-flex items-baseline gap-3 px-6 py-3 rounded-xl border border-gold/30 bg-card/70">
          <span className="text-xs tracking-widest uppercase text-muted">
            Остават
          </span>
          <span
            className={`font-serif text-3xl sm:text-4xl font-semibold tabular-nums ${
              secondsLeft === 0 ? "text-red-400" : "text-gold-light"
            }`}
          >
            {formatTime(secondsLeft)}
          </span>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {OFFERS.map((offer, i) => (
          <OfferCard key={i} offer={offer} />
        ))}
      </section>

      <div className="mt-12 text-center">
        <Link
          href="/downsell"
          className="text-sm text-muted hover:text-gold-light transition-colors underline-offset-4 hover:underline"
        >
          Не, отказвам всички оферти →
        </Link>
      </div>
    </div>
  );
}

function OfferCard({ offer }: { offer: Offer }) {
  const discount = Math.round(
    ((offer.oldPrice - offer.newPrice) / offer.oldPrice) * 100,
  );

  return (
    <article
      className={`relative rounded-2xl bg-card/80 backdrop-blur-sm p-6 sm:p-7 flex flex-col ${
        offer.featured
          ? "border-2 border-gold shadow-[0_0_40px_rgba(212,175,55,0.25)]"
          : "border border-gold/25"
      }`}
    >
      {offer.featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold tracking-widest uppercase text-dark bg-gold rounded-full whitespace-nowrap">
          ✦ BEST VALUE
        </span>
      )}

      <h2 className="font-serif text-xl sm:text-2xl text-parchment text-center mt-2">
        {offer.title}
      </h2>
      <p className="mt-2 text-sm text-parchment/70 text-center min-h-[2.5rem]">
        {offer.hook}
      </p>

      <div className="mt-5 flex items-baseline justify-center gap-3">
        <span className="text-red-400/80 line-through text-base">
          {formatEUR(offer.oldPrice)}
        </span>
        <span className="font-serif text-3xl sm:text-4xl font-semibold text-emerald-400">
          {formatEUR(offer.newPrice)}
        </span>
        <span className="text-xs font-semibold tracking-widest text-red-300 bg-red-900/30 border border-red-500/40 rounded-full px-2 py-0.5">
          -{discount}%
        </span>
      </div>

      <ul className="mt-6 space-y-2 text-sm text-parchment/85 flex-1">
        {offer.includes.map((inc, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-gold shrink-0">✦</span>
            <span>{inc}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/thank-you"
        className={`mt-7 block text-center px-5 py-3.5 rounded-md font-semibold transition-all ${
          offer.featured
            ? "bg-gold text-dark hover:bg-gold-light hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
            : "border border-gold text-gold hover:bg-gold hover:text-dark"
        }`}
      >
        {offer.buttonLabel}
      </Link>
    </article>
  );
}
