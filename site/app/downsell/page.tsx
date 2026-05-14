import Link from "next/link";
import { formatEUR } from "@/lib/products";

type DownsellOffer = {
  title: string;
  hook: string;
  oldPrice: number;
  newPrice: number;
};

const OFFERS: DownsellOffer[] = [
  {
    title: "Базов Личен Код",
    hook: "Съкратен личен анализ",
    oldPrice: 24.99,
    newPrice: 9.99,
  },
  {
    title: "Мини Любовен Анализ",
    hook: "Основна съвместимост",
    oldPrice: 24.99,
    newPrice: 9.99,
  },
  {
    title: "Енергиен Бърз Профил",
    hook: "Light версия на енергийния анализ",
    oldPrice: 17.49,
    newPrice: 6.99,
  },
];

export const metadata = {
  title: "Последна възможност — Астро Код",
};

export default function DownsellPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 animate-fade-in">
      <header className="text-center mb-10">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light leading-tight">
          <span className="gold-gradient-text">
            Изчакай — имаме нещо специално за теб
          </span>
        </h1>
        <p className="mt-3 text-parchment/70 text-base sm:text-lg italic font-serif">
          По-малка инвестиция, реална стойност
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {OFFERS.map((offer, i) => (
          <DownsellCard key={i} offer={offer} />
        ))}
      </section>

      <div className="mt-12 text-center">
        <Link
          href="/thank-you"
          className="text-sm text-muted hover:text-gold-light transition-colors underline-offset-4 hover:underline"
        >
          Не, напускам без покупка →
        </Link>
      </div>
    </div>
  );
}

function DownsellCard({ offer }: { offer: DownsellOffer }) {
  return (
    <article className="rounded-2xl border border-gold/25 bg-card/70 backdrop-blur-sm p-5 sm:p-6 flex flex-col">
      <h2 className="font-serif text-lg sm:text-xl text-parchment text-center">
        {offer.title}
      </h2>
      <p className="mt-2 text-sm text-parchment/70 text-center min-h-[2.5rem]">
        {offer.hook}
      </p>

      <div className="mt-4 flex items-baseline justify-center gap-2.5">
        <span className="text-red-400/80 line-through text-sm">
          {formatEUR(offer.oldPrice)}
        </span>
        <span className="font-serif text-2xl sm:text-3xl font-semibold text-emerald-400">
          {formatEUR(offer.newPrice)}
        </span>
      </div>

      <Link
        href="/thank-you"
        className="mt-5 block text-center px-4 py-3 rounded-md font-semibold border border-gold text-gold hover:bg-gold hover:text-dark transition-colors"
      >
        Вземи за {formatEUR(offer.newPrice)}
      </Link>
    </article>
  );
}
