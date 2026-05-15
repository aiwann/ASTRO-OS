"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatEUR } from "@/lib/products";

type Offer = {
  title: string;
  badge?: string;
  hook: string;
  description: string;
  oldPrice: number;
  newPrice: number;
  delivery: string;
  pages: string;
  whatYouGet: string[];
  whoFor: string;
  buttonLabel: string;
  featured?: boolean;
};

const OFFERS: Offer[] = [
  {
    title: "VIP Животен Код",
    badge: "✦ BEST VALUE",
    hook: "Всичките 8 анализа в един луксозен PDF — пълна картина на твоята съдба",
    description:
      "Цялостен пакет с всичките ни задълбочени анализи в един обширен документ. Получаваш пълна декодирана картина на личността, връзките, кариерата, скритите дарби и кармичните уроци — построена върху твоята натална карта, нумерология и архетипи.",
    oldPrice: 124.99,
    newPrice: 49.99,
    delivery: "📩 Имейл доставка",
    pages: "📄 80+ страници PDF",
    whatYouGet: [
      "Личен Профил (натална карта + личност)",
      "Любовна Съвместимост анализ",
      "Годишен Прогноз за следващите 12 месеца",
      "Архетип — твоята душевна роля",
      "Карта на Живота (житейски пътища и цикли)",
      "Скрит Потенциал — таланти, които не познаваш",
      "Енергиен Профил — твоят ритъм и циклите ти",
      "Идеален Партньор — астро и психологически портрет",
    ],
    whoFor:
      "За тези, които искат пълна, дълбока яснота — без нужда да поръчват анализ след анализ.",
    buttonLabel: "Да, добави към поръчката →",
    featured: true,
  },
  {
    title: "Дълбок Психологически Профил",
    hook: "Shadow traits, поведенчески модели и емоционални блокажи",
    description:
      "Аналитичен поглед в сенчестите страни на личността ти — какво те задържа, какви модели повтаряш и кои емоционални блокажи блокират растежа ти. Базиран на психоастрология и архетипна работа.",
    oldPrice: 74.99,
    newPrice: 29.99,
    delivery: "📩 Имейл доставка",
    pages: "📄 35+ страници PDF",
    whatYouGet: [
      "Shadow traits — несъзнаваните ти страни",
      "Поведенчески модели — какво повтаряш и защо",
      "Емоционални блокажи — какво те задържа",
      "Трансформационен план — конкретни стъпки",
      "Карта на детските рани и тяхното влияние",
    ],
    whoFor:
      "За тези, които искат истинска психологическа дълбочина — не повърхностен хороскоп.",
    buttonLabel: "Добави за €29.99",
  },
  {
    title: "Любовна Съвместимост",
    hook: "Анализ на двойката — chemistry, динамика, кармичен урок",
    description:
      "Сравнителен астро-психологически анализ между теб и твоят партньор (или потенциален). Виж къде се допълвате, къде се сблъсквате и какъв е дълбокият урок на тази връзка.",
    oldPrice: 37.49,
    newPrice: 14.99,
    delivery: "📩 Имейл доставка",
    pages: "📄 25+ страници PDF",
    whatYouGet: [
      "Compatibility score — детайлна оценка",
      "Емоционална динамика — как се чувствате заедно",
      "Силни страни на връзката",
      "Предизвикателства и слепи точки",
      "Кармичен урок на връзката",
      "Препоръки за дълготрайност",
    ],
    whoFor:
      "За двойки или хора, които искат да разберат дали връзката има дългосрочен потенциал.",
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 animate-fade-in">
      {/* Confirmation banner */}
      <div className="max-w-2xl mx-auto mb-10 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 backdrop-blur-sm p-5 text-center">
        <div className="text-2xl mb-2">✓</div>
        <p className="text-emerald-300 font-medium">
          Поръчката ти е приета — PDF-ът е на път към имейла ти
        </p>
      </div>

      <header className="text-center mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-gold/70 mb-3">
          Еднократна оферта
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light leading-tight">
          <span className="gold-gradient-text">
            Преди да си тръгнеш — отвори това
          </span>
        </h1>
        <p className="mt-4 text-parchment/75 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Добавѝ някой от тези анализи към поръчката си с до{" "}
          <span className="text-gold-light font-semibold">60% отстъпка</span> —
          валидна само сега.
        </p>

        <div className="mt-6 inline-flex items-baseline gap-3 px-6 py-3 rounded-xl border border-gold/30 bg-card/70">
          <span className="text-xs tracking-widest uppercase text-muted">
            Офертата изтича след
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

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {OFFERS.map((offer, i) => (
          <OfferCard key={i} offer={offer} />
        ))}
      </section>

      <div className="mt-12 text-center">
        <Link
          href="/downsell"
          className="text-sm text-muted hover:text-gold-light transition-colors underline-offset-4 hover:underline"
        >
          Не, благодаря — продължи без оферта →
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
      {offer.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold tracking-widest uppercase text-dark bg-gold rounded-full whitespace-nowrap">
          {offer.badge}
        </span>
      )}

      <h2 className="font-serif text-xl sm:text-2xl text-parchment text-center mt-2">
        {offer.title}
      </h2>
      <p className="mt-2 text-sm text-gold/80 text-center italic">
        {offer.hook}
      </p>

      {/* Price */}
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

      {/* Meta */}
      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-parchment/60">
        <span>{offer.pages}</span>
        <span>{offer.delivery}</span>
      </div>

      {/* Description */}
      <p className="mt-5 text-sm text-parchment/80 leading-relaxed">
        {offer.description}
      </p>

      {/* What you get */}
      <div className="mt-5">
        <p className="text-xs tracking-[0.2em] uppercase text-gold/60 mb-2">
          Какво ще получиш
        </p>
        <ul className="space-y-2 text-sm text-parchment/85">
          {offer.whatYouGet.map((inc, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-gold shrink-0 mt-0.5">✦</span>
              <span>{inc}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Who it's for */}
      <div className="mt-5 p-3 rounded-md border border-gold/15 bg-gold/5 flex-1">
        <p className="text-xs tracking-[0.2em] uppercase text-gold/60 mb-1">
          За кого
        </p>
        <p className="text-xs text-parchment/70 italic leading-relaxed">
          {offer.whoFor}
        </p>
      </div>

      <Link
        href="/thank-you"
        className={`mt-6 block text-center px-5 py-3.5 rounded-md font-semibold transition-all ${
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
