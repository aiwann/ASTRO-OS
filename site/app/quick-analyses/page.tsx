import Link from "next/link";

const tools = [
  {
    slug: "personal-number",
    title: "Личен Код",
    emoji: "✦",
    description:
      "Твоят нумерологичен код, скрит в датата на раждане. Разбери жизнения си път, основното число и какво то разкрива за твоята личност и мисия.",
    tag: "Нумерология",
  },
  {
    slug: "love-percentage",
    title: "Любовен Процент",
    emoji: "♡",
    description:
      "Въведи двете дати на раждане и разбери нумерологичната съвместимост. Получаваш процент и кратък анализ на динамиката между вас.",
    tag: "Съвместимост",
  },
  {
    slug: "archetype",
    title: "Архетип Профил",
    emoji: "◈",
    description:
      "Кой е твоят вътрешен архетип? Лидер, Мистик, Творец, Строител — разбери модела, по който мислиш, действаш и реагираш.",
    tag: "Архетипи",
  },
  {
    slug: "energy",
    title: "Енергийно Отражение",
    emoji: "◎",
    description:
      "Твоята стихия — Огън, Земя, Въздух или Вода. Как тя определя енергийния ти ритъм, силите ти и хората, с които резонираш.",
    tag: "Стихии",
  },
  {
    slug: "social-image",
    title: "Социален Образ",
    emoji: "◇",
    description:
      "Как те виждат другите? Твоят публичен образ според нумерологията — какво излъчваш и какво хората усещат в твоето присъствие.",
    tag: "Образ",
  },
];

export const metadata = {
  title: "Бързи Анализи — Астро ОС",
  description:
    "Безплатни нумерологични инструменти — личен код, любовен процент, архетип и повече.",
};

export default function QuickAnalysesPage() {
  return (
    <main className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase text-gold/70 border border-gold/25 rounded-full mb-4">
            Безплатно
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-light mb-4">
            <span className="gold-gradient-text">Бързи Анализи</span>
          </h1>
          <p className="text-parchment/60 text-lg max-w-xl mx-auto">
            Пет безплатни инструмента за мигновена нумерологична информация —
            без регистрация, без плащане.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/free-tools/${tool.slug}`}
              className="group relative flex flex-col rounded-2xl border border-gold/20 bg-card/60 backdrop-blur-sm p-6 hover:border-gold/50 hover:bg-card/80 transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.08)]"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-gold text-2xl leading-none">
                  {tool.emoji}
                </span>
                <span className="text-xs tracking-widest uppercase text-gold/50 border border-gold/20 rounded-full px-2 py-0.5">
                  {tool.tag}
                </span>
              </div>

              <h2 className="font-serif text-xl text-parchment mb-3 group-hover:text-gold-light transition-colors">
                {tool.title}
              </h2>

              <p className="text-parchment/60 text-sm leading-relaxed flex-1">
                {tool.description}
              </p>

              <div className="mt-6 flex items-center gap-2 text-gold text-sm font-medium">
                <span>Опитай безплатно</span>
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center rounded-2xl border border-gold/20 bg-card/40 backdrop-blur-sm p-10">
          <p className="text-parchment/50 text-sm tracking-widest uppercase mb-3">
            Искаш нещо по-задълбочено?
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl text-parchment mb-6">
            Разгледай{" "}
            <span className="gold-gradient-text">Задълбочените Анализи</span>
          </h2>
          <Link
            href="/deep-analyses"
            className="inline-flex items-center gap-2 px-8 py-3 border border-gold text-gold rounded-md hover:bg-gold hover:text-dark transition-colors font-medium"
          >
            Виж всички анализи →
          </Link>
        </div>
      </div>
    </main>
  );
}
