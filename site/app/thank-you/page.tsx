import Link from "next/link";
import { getProduct } from "@/lib/products";

export const metadata = {
  title: "Благодарим ти — Астро ОС",
};

export default function ThankYouPage({
  searchParams,
}: {
  searchParams: { product?: string; session_id?: string };
}) {
  const product = searchParams.product
    ? getProduct(searchParams.product)
    : undefined;

  const productLine = product
    ? `Твоят ${product.title} е на път.`
    : "Твоят анализ е на път.";

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-6 py-16 animate-fade-in">
      <div className="max-w-2xl mx-auto text-center">
        <div
          className="font-serif text-7xl sm:text-8xl gold-gradient-text leading-none"
          aria-hidden
        >
          ✦
        </div>

        <h1 className="mt-8 font-serif text-4xl sm:text-5xl md:text-6xl font-light">
          <span className="gold-gradient-text">Благодарим ти</span>
        </h1>

        <p className="mt-8 font-serif text-2xl sm:text-3xl text-parchment leading-relaxed">
          {productLine}
        </p>
        <p className="mt-3 text-base sm:text-lg text-parchment/75 leading-relaxed">
          Провери имейла си — PDF-ът ще пристигне в рамките на няколко минути.
        </p>

        <div className="mt-12 flex justify-center gap-3" aria-hidden>
          <span className="inline-block w-1 h-1 rounded-full bg-gold animate-twinkle" />
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold-light animate-twinkle-slow" />
          <span className="inline-block w-1 h-1 rounded-full bg-gold animate-twinkle" />
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold-light animate-twinkle-slow" />
          <span className="inline-block w-1 h-1 rounded-full bg-gold animate-twinkle" />
        </div>

        <blockquote className="mt-10 font-serif text-lg sm:text-xl italic text-parchment/85 max-w-lg mx-auto leading-relaxed">
          &bdquo;Звездите не определят пътя ти. Те го осветяват.&ldquo;
        </blockquote>

        <div className="mt-12 mx-auto w-40 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

        <p className="mt-10 text-parchment/80">
          Искаш ли да разгледаш другите анализи?
        </p>
        <Link
          href="/products/personal-profile"
          className="mt-5 inline-flex items-center gap-2 px-8 py-3.5 bg-gold text-dark font-semibold rounded-md hover:bg-gold-light transition-all hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] group"
        >
          Разгледай
          <span className="group-hover:translate-x-1 transition-transform">
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
