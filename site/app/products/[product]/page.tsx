import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PRODUCT_SLUGS,
  computeItemValues,
  formatBGN,
  formatEUR,
  getProduct,
} from "@/lib/products";

export function generateStaticParams() {
  return PRODUCT_SLUGS.map((product) => ({ product }));
}

export function generateMetadata({
  params,
}: {
  params: { product: string };
}) {
  const product = getProduct(params.product);
  if (!product) return { title: "Продукт не е намерен" };
  return {
    title: `${product.title} — Астро ОС`,
    description: product.hook,
  };
}

export default function ProductPage({
  params,
}: {
  params: { product: string };
}) {
  const product = getProduct(params.product);
  if (!product) notFound();

  const { perItem, total } = computeItemValues(product);

  return (
    <div className="relative">
      <div
        aria-hidden
        className={`absolute inset-x-0 top-0 h-[600px] bg-gradient-to-b ${product.color} pointer-events-none`}
      />

      <article className="relative max-w-3xl mx-auto px-6 py-12 sm:py-16">
        <section className="text-center">
          {product.featured && (
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full border border-gold/50 bg-gold/10 text-gold font-semibold text-sm tracking-widest uppercase">
              ✦ Best Value — Най-пълният Анализ
            </div>
          )}
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase text-red-300 bg-red-900/30 border border-red-500/40 rounded-full">
            −{product.discount}% ОТСТЪПКА
          </span>

          <h1 className="mt-6 font-serif text-4xl sm:text-5xl md:text-6xl font-light leading-tight">
            <span className="gold-gradient-text">{product.title}</span>
          </h1>
          <p className="mt-2 text-lg sm:text-xl text-parchment/70 font-serif italic">
            {product.subtitle}
          </p>

          <p className="mt-8 text-xl sm:text-2xl italic text-parchment/90 font-serif leading-relaxed max-w-2xl mx-auto">
            &bdquo;{product.hook}&ldquo;
          </p>

          <p className="mt-6 text-xs sm:text-sm tracking-wider uppercase text-muted">
            {product.duration}
          </p>

          <div className="mt-10">
            <div className="flex items-baseline justify-center gap-4">
              <span className="text-2xl sm:text-3xl text-red-400/80 line-through">
                {formatEUR(product.oldPrice)}
              </span>
              <span className="font-serif text-5xl sm:text-6xl font-semibold text-emerald-400">
                {formatEUR(product.newPrice)}
              </span>
            </div>
            <p className="mt-2 text-sm text-parchment/55 tracking-wide">
              ≈ {formatBGN(product.newPrice)}
            </p>
          </div>

          <Link
            href={`/checkout/${product.slug}`}
            className="mt-10 inline-flex items-center gap-2 px-10 py-4 bg-gold text-dark font-semibold text-lg rounded-md hover:bg-gold-light transition-all hover:shadow-[0_0_40px_rgba(212,175,55,0.45)] group"
          >
            Вземи анализа
            <span className="group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>

          <p className="mt-5 text-sm text-parchment/60">
            🔒 Сигурно плащане • PDF на имейла • Готово в минути
          </p>
        </section>

        <section className="mt-20 rounded-2xl border border-gold/25 bg-card/60 backdrop-blur-sm p-6 sm:p-10">
          <h2 className="font-serif text-2xl sm:text-3xl text-center mb-3">
            <span className="text-parchment">Какво </span>
            <span className="gold-gradient-text">представлява</span>
          </h2>
          <div className="mx-auto w-16 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent mb-6" />
          <p className="text-parchment/85 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto text-center font-serif">
            {product.description}
          </p>
        </section>

        <section className="mt-16 rounded-2xl border border-gold/25 bg-card/70 backdrop-blur-sm p-6 sm:p-10">
          <h2 className="font-serif text-2xl sm:text-3xl text-center mb-8">
            <span className="text-parchment">Какво </span>
            <span className="gold-gradient-text">включва</span>
          </h2>
          <ul className="space-y-4">
            {product.includes.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-base sm:text-lg text-parchment/90 leading-relaxed"
              >
                <span className="text-gold text-xl leading-tight shrink-0 mt-0.5">
                  ✦
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 rounded-2xl border border-gold/30 bg-card/80 backdrop-blur-sm p-6 sm:p-10">
          <h2 className="font-serif text-2xl sm:text-3xl text-center mb-8">
            <span className="text-parchment">Какво </span>
            <span className="gold-gradient-text">получаваш</span>
          </h2>

          <ul className="space-y-3 font-sans text-sm sm:text-base">
            {product.includes.map((item, i) => (
              <li
                key={i}
                className="flex items-start justify-between gap-4 py-2 border-b border-gold/10 last:border-b-0"
              >
                <span className="flex items-start gap-3 text-parchment/90 flex-1">
                  <span className="text-gold shrink-0">✦</span>
                  <span>{item}</span>
                </span>
                <span className="text-muted whitespace-nowrap shrink-0">
                  стойност {formatEUR(perItem)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6 pt-6 border-t border-gold/30 space-y-3">
            <div className="flex justify-between items-baseline text-base sm:text-lg">
              <span className="text-parchment/70">Обща стойност:</span>
              <span className="text-red-400/80 line-through">
                {formatEUR(total)}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="font-serif text-xl sm:text-2xl text-parchment">
                Твоята цена:
              </span>
              <div className="text-right">
                <div className="font-serif text-3xl sm:text-4xl font-semibold text-emerald-400">
                  {formatEUR(product.newPrice)}
                </div>
                <div className="text-xs text-parchment/55 mt-1">
                  ≈ {formatBGN(product.newPrice)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              href={`/checkout/${product.slug}`}
              className="inline-flex items-center gap-2 px-10 py-4 bg-gold text-dark font-semibold text-lg rounded-md hover:bg-gold-light transition-all hover:shadow-[0_0_40px_rgba(212,175,55,0.45)] group"
            >
              Вземи анализа сега
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
            <p className="mt-4 text-xs text-muted tracking-wider uppercase">
              ✦ Дигитална услуга • Доставка незабавно ✦
            </p>
          </div>
        </section>

        <footer className="mt-12 flex justify-center gap-6 text-xs text-muted">
          <Link href="/terms" className="hover:text-gold-light transition-colors">
            Общи условия
          </Link>
          <span>•</span>
          <Link
            href="/privacy"
            className="hover:text-gold-light transition-colors"
          >
            Поверителност
          </Link>
        </footer>
      </article>
    </div>
  );
}
