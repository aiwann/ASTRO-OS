"use client";

import Link from "next/link";
import { useRef, useState } from "react";

const SIGNS = [
  { slug: "aries",       name: "Овен",      symbol: "♈", dates: "21 март – 19 април" },
  { slug: "taurus",      name: "Телец",     symbol: "♉", dates: "20 април – 20 май" },
  { slug: "gemini",      name: "Близнаци",  symbol: "♊", dates: "21 май – 20 юни" },
  { slug: "cancer",      name: "Рак",       symbol: "♋", dates: "21 юни – 22 юли" },
  { slug: "leo",         name: "Лъв",       symbol: "♌", dates: "23 юли – 22 август" },
  { slug: "virgo",       name: "Дева",      symbol: "♍", dates: "23 август – 22 септември" },
  { slug: "libra",       name: "Везни",     symbol: "♎", dates: "23 септември – 22 октомври" },
  { slug: "scorpio",     name: "Скорпион",  symbol: "♏", dates: "23 октомври – 21 ноември" },
  { slug: "sagittarius", name: "Стрелец",   symbol: "♐", dates: "22 ноември – 21 декември" },
  { slug: "capricorn",   name: "Козирог",   symbol: "♑", dates: "22 декември – 19 януари" },
  { slug: "aquarius",    name: "Водолей",   symbol: "♒", dates: "20 януари – 18 февруари" },
  { slug: "pisces",      name: "Риби",      symbol: "♓", dates: "19 февруари – 20 март" },
];

const ITEM_WIDTH = 120; // px per sign card

export default function ZodiacSlider() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  function updateArrows() {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 10);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }

  function scroll(dir: "left" | "right") {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -ITEM_WIDTH * 3 : ITEM_WIDTH * 3, behavior: "smooth" });
    setTimeout(updateArrows, 350);
  }

  return (
    <section className="relative px-6 py-16 sm:py-20">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-gold/60 mb-3">
            Седмичен Хороскоп
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-light">
            <span className="gold-gradient-text">Избери своята зодия</span>
          </h2>
          <p className="mt-2 text-parchment/50 text-sm">
            Виж какво ти готвят звездите тази седмица
          </p>
        </div>

        {/* Slider */}
        <div className="relative flex items-center gap-3">

          {/* Left arrow */}
          <button
            onClick={() => scroll("left")}
            disabled={!canLeft}
            aria-label="Назад"
            className={`shrink-0 w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 ${
              canLeft
                ? "border-gold/40 text-gold hover:bg-gold/10 hover:border-gold/70"
                : "border-gold/10 text-gold/20 cursor-default"
            }`}
          >
            ‹
          </button>

          {/* Track */}
          <div
            ref={trackRef}
            onScroll={updateArrows}
            className="flex gap-4 overflow-hidden flex-1"
          >
            {SIGNS.map((sign, i) => (
              <Link
                key={sign.slug}
                href={`/horoscope/${sign.slug}`}
                style={{ animationDelay: `${i * 0.15}s` }}
                className="group flex flex-col items-center w-24 sm:w-28 shrink-0 animate-fade-in"
              >
                {/* Icon */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                  {/* Glow ring on hover */}
                  <div className="absolute inset-0 rounded-full bg-gold/0 group-hover:bg-gold/10 transition-all duration-500 group-hover:shadow-[0_0_24px_rgba(212,175,55,0.3)]" />
                  <div className="relative w-full h-full rounded-full border border-gold/25 bg-card/50 flex items-center justify-center text-3xl sm:text-4xl text-gold/80 group-hover:border-gold/60 group-hover:text-gold transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-110">
                    {sign.symbol}
                  </div>
                </div>

                {/* Name */}
                <p className="mt-3 text-sm font-medium text-parchment/85 group-hover:text-gold-light transition-colors text-center">
                  {sign.name}
                </p>

                {/* Dates */}
                <p className="mt-0.5 text-[10px] text-parchment/40 text-center leading-tight px-1">
                  {sign.dates}
                </p>
              </Link>
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scroll("right")}
            disabled={!canRight}
            aria-label="Напред"
            className={`shrink-0 w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 ${
              canRight
                ? "border-gold/40 text-gold hover:bg-gold/10 hover:border-gold/70"
                : "border-gold/10 text-gold/20 cursor-default"
            }`}
          >
            ›
          </button>
        </div>
      </div>

    </section>
  );
}
