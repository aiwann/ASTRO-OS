"use client";

import Link from "next/link";

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

export default function ZodiacSlider() {
  return (
    <section className="relative px-6 py-16 sm:py-20">
      <div className="max-w-7xl mx-auto">
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

        {/* Scrollable row */}
        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-3 w-max mx-auto px-2">
            {SIGNS.map((sign) => (
              <Link
                key={sign.slug}
                href={`/horoscope/${sign.slug}`}
                className="group flex flex-col items-center w-24 sm:w-28 shrink-0"
              >
                {/* Symbol circle */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-gold/25 bg-card/50 flex items-center justify-center text-3xl sm:text-4xl text-gold/80 group-hover:border-gold/70 group-hover:text-gold group-hover:bg-gold/10 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                  {sign.symbol}
                </div>

                {/* Name */}
                <p className="mt-3 text-sm font-medium text-parchment/85 group-hover:text-gold-light transition-colors text-center">
                  {sign.name}
                </p>

                {/* Dates */}
                <p className="mt-0.5 text-[10px] text-parchment/40 text-center leading-tight">
                  {sign.dates}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
