"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { formatEUR } from "@/lib/products";

type DownsellOffer = {
  productType: string;
  title: string;
  badge?: string;
  hook: string;
  description: string;
  oldPrice: number;
  newPrice: number;
  pages: string;
  whatYouGet: string[];
  whoFor: string;
  buttonLabel: string;
  featured?: boolean;
};

const OFFERS: DownsellOffer[] = [
  {
    productType: "personal-profile",
    title: "Базов Личен Код",
    badge: "★ ПРЕПОРЪЧАН",
    hook: "Съкратена версия на личния анализ — основното за теб",
    description:
      "Кратък но точен профил на твоята личност, базиран на наталната карта. Идеален ако искаш да опиташ нашите анализи без да правиш голяма инвестиция.",
    oldPrice: 24.99,
    newPrice: 9.99,
    pages: "12+ страници PDF",
    whatYouGet: [
      "Кратък личностен профил",
      "Основни силни и слаби страни",
      "Слънчев и Лунен знак — обяснени",
      "Възходящ знак и неговото значение",
      "Препоръка за следваща стъпка",
    ],
    whoFor: "За тези, които искат да опитат концепцията преди да поръчат пълен анализ.",
    buttonLabel: "Вземи за €9.99",
    featured: true,
  },
  {
    productType: "synastry",
    title: "Мини Любовен Анализ",
    hook: "Основна съвместимост между двама — компактен формат",
    description:
      "Бърз поглед към динамиката между теб и партньора ти. Достатъчно за да видиш дали си струва да отидете по-надълбоко.",
    oldPrice: 24.99,
    newPrice: 9.99,
    pages: "10+ страници PDF",
    whatYouGet: [
      "Compatibility score",
      "Топ 3 силни страни на връзката",
      "Топ 3 потенциални предизвикателства",
      "Емоционална и комуникационна динамика",
    ],
    whoFor: "За двойки в начален етап или такива, които се чудят дали си подхождат.",
    buttonLabel: "Вземи за €9.99",
  },
  {
    productType: "energy-profile",
    title: "Енергиен Бърз Профил",
    hook: "Light версия на енергийния анализ — твоят ритъм за месеца",
    description:
      "Бърз поглед в твоя енергиен профил и какво те очаква през следващите 30 дни. Идеален да тестваш енергийната ни система преди пълния пакет.",
    oldPrice: 17.49,
    newPrice: 6.99,
    pages: "8+ страници PDF",
    whatYouGet: [
      "Твой енергиен ритъм за следващите 30 дни",
      "Силни и слаби периоди",
      "Препоръка за ключови решения",
      "Дни за начало / завършване / почивка",
    ],
    whoFor: "За тези, които живеят интуитивно и искат малко повече насока в ритъма си.",
    buttonLabel: "Вземи за €6.99",
  },
];

function DownsellContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";
  const [loading, setLoading] = useState<string | null>(null);

  const handleAccept = async (offer: DownsellOffer) => {
    setLoading(offer.productType);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-upsell-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originalSessionId: sessionId,
            productType: offer.productType,
            productLabel: offer.title,
            priceEur: offer.newPrice,
          }),
        }
      );
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Грешка: " + (data.error || "Моля опитайте отново."));
        setLoading(null);
      }
    } catch {
      alert("Грешка при свързване. Моля опитайте отново.");
      setLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 animate-fade-in">
      <header className="text-center mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-gold/70 mb-3">Последна възможност</p>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light leading-tight">
          <span className="gold-gradient-text">Изчакай — имаме нещо специално за теб</span>
        </h1>
        <p className="mt-4 text-parchment/75 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          По-кратки версии на нашите анализи —{" "}
          <span className="text-gold-light font-semibold">от €6.99</span>. Идеално като стартова точка.
        </p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {OFFERS.map((offer) => (
          <DownsellCard
            key={offer.productType}
            offer={offer}
            loading={loading === offer.productType}
            onAccept={() => handleAccept(offer)}
          />
        ))}
      </section>

      <div className="mt-12 text-center">
        <a
          href="/thank-you"
          className="text-sm text-muted hover:text-gold-light transition-colors underline-offset-4 hover:underline"
        >
          Не, благодаря — продължи към завършване →
        </a>
      </div>
    </div>
  );
}

function DownsellCard({ offer, loading, onAccept }: { offer: DownsellOffer; loading: boolean; onAccept: () => void }) {
  const discount = Math.round(((offer.oldPrice - offer.newPrice) / offer.oldPrice) * 100);

  return (
    <article
      className={`relative rounded-2xl bg-card/80 backdrop-blur-sm p-6 sm:p-7 flex flex-col ${
        offer.featured ? "border-2 border-gold shadow-[0_0_40px_rgba(212,175,55,0.25)]" : "border border-gold/25"
      }`}
    >
      {offer.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold tracking-widest uppercase text-dark bg-gold rounded-full whitespace-nowrap">
          {offer.badge}
        </span>
      )}
      <h2 className="font-serif text-xl sm:text-2xl text-parchment text-center mt-2">{offer.title}</h2>
      <p className="mt-2 text-sm text-gold/80 text-center italic">{offer.hook}</p>
      <div className="mt-5 flex items-baseline justify-center gap-3">
        <span className="text-red-400/80 line-through text-base">{formatEUR(offer.oldPrice)}</span>
        <span className="font-serif text-3xl sm:text-4xl font-semibold text-emerald-400">{formatEUR(offer.newPrice)}</span>
        <span className="text-xs font-semibold tracking-widest text-red-300 bg-red-900/30 border border-red-500/40 rounded-full px-2 py-0.5">-{discount}%</span>
      </div>
      <div className="mt-4 flex justify-center text-xs text-parchment/60">
        <span>📄 {offer.pages} · 📩 Имейл доставка</span>
      </div>
      <p className="mt-5 text-sm text-parchment/80 leading-relaxed">{offer.description}</p>
      <div className="mt-5">
        <p className="text-xs tracking-[0.2em] uppercase text-gold/60 mb-2">Какво ще получиш</p>
        <ul className="space-y-2 text-sm text-parchment/85">
          {offer.whatYouGet.map((inc, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-gold shrink-0 mt-0.5">★</span>
              <span>{inc}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-5 p-3 rounded-md border border-gold/15 bg-gold/5 flex-1">
        <p className="text-xs tracking-[0.2em] uppercase text-gold/60 mb-1">За кого</p>
        <p className="text-xs text-parchment/70 italic leading-relaxed">{offer.whoFor}</p>
      </div>
      <button
        onClick={onAccept}
        disabled={loading}
        className={`mt-6 block w-full text-center px-5 py-3.5 rounded-md font-semibold transition-all disabled:opacity-60 ${
          offer.featured
            ? "bg-gold text-dark hover:bg-gold-light hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
            : "border border-gold text-gold hover:bg-gold hover:text-dark"
        }`}
      >
        {loading ? "Зареждане..." : offer.buttonLabel}
      </button>
    </article>
  );
}

export default function DownsellPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gold">Зареждане...</div>}>
      <DownsellContent />
    </Suspense>
  );
}
