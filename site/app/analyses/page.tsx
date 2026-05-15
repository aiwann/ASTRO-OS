import Link from "next/link";
import { PRODUCTS, formatBGN, formatEUR } from "@/lib/products";

export const metadata = {
  title: "Всички Анализи — Астро ОС",
  description:
    "Безплатни инструменти и задълбочени AI анализи — всичко на едно място.",
};

const freeTools = [
  {
    slug: "personal-number",
    title: "Личен Код",
    emoji: "✦",
    tag: "Нумерология",
    description:
      "Твоят нумерологичен код, скрит в датата на раждане. Открий жизнения си път в секунди.",
  },
  {
    slug: "love-percentage",
    title: "Любовен Процент",
    emoji: "♡",
    tag: "Съвместимост",
    description:
      "Въведи двете дати на раждане и разбери нумерологичната съвместимост между вас.",
  },
  {
    slug: "archetype",
    title: "Архетип Профил",
    emoji: "◈",
    tag: "Архетипи",
    description:
      "Кой е твоят вътрешен архетип? Лидер, Мистик, Творец — разбери модела си.",
  },
  {
    slug: "energy",
    title: "Енергийно Отражение",
    emoji: "◎",
    tag: "Стихии",
    description:
      "Твоята стихия — Огън, Земя, Въздух или Вода. Как тя определя ритъма и силите ти.",
  },
  {
    slug: "social-image",
    title: "Социален Образ",
    emoji: "◇",
    tag: "Образ",
    description:
      "Как те виждат другите? Твоят публичен образ според нумерологията.",
  },
];

const productOrder = [
  "personal-profile",
  "synastry",
  "yearly-analysis",
  "archetype-profile",
  "life-map",
  "hidden-potential",
  "energy-profile",
  "full-life-code",
];

const productColors: Record<string, string> = {
  "personal-profile": "from-purple-900/30 to-transparent",
  synastry: "from-rose-900/30 to-transparent",
  "yearly-analysis": "from-blue-900/30 to-transparent",
  "archetype-profile": "from-amber-900/30 to-transparent",
  "life-map": "from-teal-900/30 to-transparent",
  "hidden-potential": "from-violet-900/30 to-transparent",
  "energy-profile": "from-orange-900/30 to-transparent",
  "full-life-code": "from-gold/15 to-transparent",
};

export default function AnalysesPage() {
  const paidProducts = productOrder.map((s) => PRODUCTS[s]).filter(Boolean);

  return (
    <main className="min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Page header */}
        <div className="text-center mb-20">
          <h1 className="font-serif text-4xl sm:text-5xl font-light mb-4">
            <span className="gold-gradient-text">Всички Анализи</span>
          </h1>
          <p className="text-parchment/55 text-lg max-w-lg mx-auto">
            Започни безплатно — или избери пълен персонален анализ.
          </p>
        </div>

        {/* ── FREE TOOLS ── */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-xs tracking-[0.3em] uppercase text-gold/60 font-medium">
              Безплатно
            </span>
            <div className="flex-1 h-px bg-gold/15" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {freeTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/free-tools/${tool.slug}`}
                className="group flex flex-col rounded-2xl border border-gold/20 bg-card/60 backdrop-blur-sm p-6 hover:border-gold/45 hover:bg-card/80 transition-all duration-300 hover:shadow-[0_0_25px_rgba(212,175,55,0.07)]"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-gold text-xl">{tool.emoji}</span>
                  <span className="text-xs tracking-widest uppercase text-gold/50 border border-gold/20 rounded-full px-2 py-0.5">
                    {tool.tag}
                  </span>
                </div>
                <h2 className="font-serif text-lg text-parchment mb-2 group-hover:text-gold-light transition-colors">
                  {tool.title}
                </h2>
                <p className="text-parchment/55 text-sm leading-relaxed flex-1">
                  {tool.description}
                </p>
                <div className="mt-5 flex items-center gap-2 text-gold text-sm font-medium">
                  <span>Опитай безплатно</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── PAID PRODUCTS ── */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <span className="text-xs tracking-[0.3em] uppercase text-gold/60 font-medium">
              Задълбочени Анализи
            </span>
            <div className="flex-1 h-px bg-gold/15" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paidProducts.map((product) => (
              <Link
                key={product.slug}
                href={`/products/${product.slug}`}
                className={`group relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-[0_0_35px_rgba(212,175,55,0.1)] ${
                  product.featured
                    ? "border-gold/50 bg-card/80 hover:border-gold"
                    : "border-gold/20 bg-card/60 hover:border-gold/45 hover:bg-card/75"
                }`}
              >
                <div
                  className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${productColors[product.slug]} pointer-events-none`}
                />
                <div className="relative flex flex-col flex-1 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    {product.featured && (
                      <span className="text-xs font-semibold tracking-widest uppercase text-gold border border-gold/50 bg-gold/10 rounded-full px-2 py-0.5">
                        ✦ Best Value
                      </span>
                    )}
                    <span className="text-xs tracking-widest uppercase text-red-400 border border-red-500/30 bg-red-900/20 rounded-full px-2 py-0.5">
                      −{product.discount}%
                    </span>
                  </div>

                  <h2 className="font-serif text-lg text-parchment mb-1 group-hover:text-gold-light transition-colors">
                    {product.title}
                  </h2>
                  <p className="text-xs text-parchment/45 italic mb-3">
                    {product.subtitle}
                  </p>
                  <p className="text-parchment/65 text-sm leading-relaxed flex-1 mb-5">
                    &bdquo;{product.hook}&ldquo;
                  </p>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-3">
                      <span className="text-parchment/35 line-through text-sm">
                        {formatEUR(product.oldPrice)}
                      </span>
                      <span className="font-serif text-2xl font-semibold text-emerald-400">
                        {formatEUR(product.newPrice)}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-parchment/45">
                      ≈ {formatBGN(product.newPrice)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gold text-sm font-medium">
                    <span>Вземи анализа</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Trust */}
        <div className="mt-16 flex flex-wrap justify-center gap-6 text-sm text-parchment/35">
          <span>🔒 Сигурно плащане</span>
          <span>📧 PDF на имейла</span>
          <span>⚡ Готово в минути</span>
          <span>✦ Уникален за теб анализ</span>
        </div>
      </div>
    </main>
  );
}
