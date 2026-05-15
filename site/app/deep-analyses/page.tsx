import Link from "next/link";
import { PRODUCTS, formatEUR } from "@/lib/products";

const productOrder = [
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

const colorMap: Record<string, string> = {
  "personal-profile": "from-purple-900/30 to-transparent",
  synastry: "from-rose-900/30 to-transparent",
  "yearly-analysis": "from-blue-900/30 to-transparent",
  "archetype-profile": "from-amber-900/30 to-transparent",
  "life-map": "from-teal-900/30 to-transparent",
  "hidden-potential": "from-violet-900/30 to-transparent",
  "energy-profile": "from-orange-900/30 to-transparent",
  "ideal-partner": "from-pink-900/30 to-transparent",
  "full-life-code": "from-gold/15 to-transparent",
};

export const metadata = {
  title: "Задълбочени Анализи — Астро ОС",
  description:
    "Пълни AI астрологични анализи — личен профил, съвместимост, годишен анализ и повече.",
};

export default function DeepAnalysesPage() {
  const products = productOrder
    .map((slug) => PRODUCTS[slug])
    .filter(Boolean);

  return (
    <main className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase text-gold/70 border border-gold/25 rounded-full mb-4">
            AI Анализи
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-light mb-4">
            <span className="gold-gradient-text">Задълбочени Анализи</span>
          </h1>
          <p className="text-parchment/60 text-lg max-w-xl mx-auto">
            Пълни персонални анализи с дълбочина на часова консултация —
            доставени на имейла ти в минути.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link
              key={product.slug}
              href={`/products/${product.slug}`}
              className={`group relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.1)] ${
                product.featured
                  ? "border-gold/50 bg-card/80 hover:border-gold"
                  : "border-gold/20 bg-card/60 hover:border-gold/45 hover:bg-card/75"
              }`}
            >
              {/* Gradient top accent */}
              <div
                className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${colorMap[product.slug]} pointer-events-none`}
              />

              <div className="relative flex flex-col flex-1 p-6">
                {/* Badges */}
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

                {/* Title */}
                <h2 className="font-serif text-xl text-parchment mb-1 group-hover:text-gold-light transition-colors">
                  {product.title}
                </h2>
                <p className="text-sm text-parchment/50 italic mb-4">
                  {product.subtitle}
                </p>

                {/* Hook */}
                <p className="text-parchment/70 text-sm leading-relaxed flex-1 mb-5">
                  &bdquo;{product.hook}&ldquo;
                </p>

                {/* Includes preview */}
                <ul className="space-y-1.5 mb-6">
                  {product.includes.slice(0, 3).map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-parchment/60"
                    >
                      <span className="text-gold/60 shrink-0 mt-0.5">✦</span>
                      <span>{item}</span>
                    </li>
                  ))}
                  {product.includes.length > 3 && (
                    <li className="text-xs text-gold/50 pl-4">
                      + още {product.includes.length - 3}
                    </li>
                  )}
                </ul>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-5">
                  <span className="text-parchment/40 line-through text-sm">
                    {formatEUR(product.oldPrice)}
                  </span>
                  <span className="font-serif text-2xl font-semibold text-emerald-400">
                    {formatEUR(product.newPrice)}
                  </span>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2 text-gold text-sm font-medium">
                  <span>Вземи анализа</span>
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Trust row */}
        <div className="mt-14 flex flex-wrap justify-center gap-6 text-sm text-parchment/40">
          <span>🔒 Сигурно плащане</span>
          <span>📧 PDF на имейла</span>
          <span>⚡ Готово в минути</span>
          <span>✦ Уникален за теб анализ</span>
        </div>
      </div>
    </main>
  );
}
