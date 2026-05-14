import Link from "next/link";

const SYSTEM_CARDS = [
  {
    emoji: "🪐",
    title: "Швейцарска Ефемерида",
    body: "Точни планетарни позиции до секунда дъга чрез Swiss Ephemeris — същата база, използвана от професионални астролози.",
  },
  {
    emoji: "🏠",
    title: "Placidus Домове",
    body: "Пресмятане на 12-те астрологични дома по системата Placidus с точен час и географски координати.",
  },
  {
    emoji: "☌",
    title: "Аспекти и Орби",
    body: "Анализ на всички мажорни и минорни аспекти — конюнкции, опозиции, тригони, квадрати, секстили и повече.",
  },
  {
    emoji: "🔢",
    title: "Нумерология",
    body: "Жизнен път, изразително число и число на съдбата — три нумерологични слоя, вплетени в астрологичния профил.",
  },
  {
    emoji: "♾",
    title: "Кармична Астрология",
    body: "Лунни възли, Хирон и кармични аспекти разкриват уроците и мисията на душата ти в този живот.",
  },
  {
    emoji: "🌊",
    title: "Юнгиански Архетипи",
    body: "Картографиране на архетипните сили от психологията на Юнг — сянка, анима/анимус, Аз и Persona.",
  },
  {
    emoji: "👁",
    title: "Ангелски Числа",
    body: "Синхронизация на нумерологичните модели с езотеричната традиция за по-дълбоко лично послание.",
  },
];

const WHY_CARDS = [
  {
    emoji: "⚡",
    title: "Бързо",
    body: "Пълен персонален анализ, готов за минути след поръчката — доставен директно на имейла ти.",
  },
  {
    emoji: "🎯",
    title: "Точно",
    body: "Реални астрологични изчисления, не шаблонни текстове. Всеки анализ е уникален за твоята натална карта.",
  },
  {
    emoji: "💎",
    title: "Достъпно",
    body: "Дълбочина на часова консултация с астролог — на цена под €20. Без скрити такси, без абонамент.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <p className="text-gold/70 text-xs sm:text-sm tracking-[0.4em] uppercase mb-6">
            ✦ Следващо поколение AI астрология
          </p>

          <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-tight leading-[0.95]">
            <span className="gold-gradient-text">АСТРО ОС</span>
          </h1>

          <div className="mt-8 mx-auto w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

          <p className="mt-10 text-lg sm:text-xl text-parchment/80 max-w-2xl mx-auto leading-relaxed">
            Създаден да бъде сред най-модерните AI системи за персонални анализи.
          </p>
          <p className="mt-3 text-base sm:text-lg text-parchment/65 max-w-2xl mx-auto leading-relaxed">
            Без чакане, без объркване, без излишни разходи — за пръв път бързо
            не е равно на некачествено.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/products/personal-profile"
              className="group px-8 py-4 bg-gold text-dark font-semibold rounded-md hover:bg-gold-light transition-all hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] inline-flex items-center gap-2"
            >
              Разгледай анализите
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
            <Link
              href="/free-tools/personal-number"
              className="px-8 py-4 border border-gold/60 text-gold-light font-medium rounded-md hover:bg-gold/10 transition-colors"
            >
              Безплатен инструмент
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative px-6 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.3em] uppercase text-gold/70 mb-3">
              Технология
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light">
              <span className="gold-gradient-text">Как работи системата</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {SYSTEM_CARDS.map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-gold/20 bg-card/50 backdrop-blur-sm p-5 hover:border-gold/40 hover:bg-card/70 transition-all"
              >
                <div className="text-3xl mb-3">{card.emoji}</div>
                <h3 className="font-serif text-lg font-light text-parchment mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-parchment/65 leading-relaxed">
                  {card.body}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-12 text-center font-serif text-xl sm:text-2xl italic text-parchment/80">
            Резултатът:{" "}
            <span className="gold-gradient-text">
              анализ с дълбочина на часова консултация
            </span>{" "}
            — готов за минути.
          </p>
        </div>
      </section>

      {/* Why Astro OS */}
      <section className="relative px-6 pb-24 sm:pb-32">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.3em] uppercase text-gold/70 mb-3">
              Предимства
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light">
              <span className="gold-gradient-text">Защо Астро ОС</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {WHY_CARDS.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-gold/25 bg-card/60 backdrop-blur-sm p-8 text-center hover:border-gold/50 transition-all"
              >
                <div className="text-4xl mb-4">{card.emoji}</div>
                <h3 className="font-serif text-2xl font-light gold-gradient-text mb-3">
                  {card.title}
                </h3>
                <p className="text-parchment/70 leading-relaxed text-sm">
                  {card.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/products/personal-profile"
              className="group px-10 py-4 bg-gold text-dark font-semibold rounded-md hover:bg-gold-light transition-all hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] inline-flex items-center gap-2 text-lg"
            >
              Започни сега
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
            <p className="mt-4 text-xs text-muted tracking-wider uppercase">
              ✦ Доставка на имейл в рамките на минути ✦
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
