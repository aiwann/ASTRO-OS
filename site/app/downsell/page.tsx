"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState, Suspense } from "react";
import {
  DOWNSELLS,
  computeOrderTotal,
  formatEUR,
  formatBGN,
  type CatalogItem,
} from "@/lib/catalog";

function DownsellContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const toggle = (id: string, on: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const selectedItems = useMemo<CatalogItem[]>(
    () => DOWNSELLS.filter((d) => selected.has(String(d.id))),
    [selected],
  );

  const totals = useMemo(
    () => computeOrderTotal(Array.from(selected)),
    [selected],
  );

  const buyDownsell = async () => {
    if (selectedItems.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-upsell-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originalSessionId: sessionId,
            itemIds: Array.from(selected),
          }),
        },
      );
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Грешка: " + (data.error || "Моля опитайте отново."));
        setLoading(false);
      }
    } catch {
      alert("Грешка при свързване. Моля опитайте отново.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 animate-fade-in">
      <header className="text-center mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-gold/70 mb-3">
          Последна възможност
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light leading-tight">
          <span className="gold-gradient-text">
            Изчакай — имаме нещо специално за теб
          </span>
        </h1>
        <p className="mt-4 text-parchment/75 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Кратки essence версии на нашите анализи —{" "}
          <span className="text-gold-light font-semibold">от €5.99</span>.
          Идеално като стартова точка.
        </p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {DOWNSELLS.map((d, idx) => (
          <DownsellCard
            key={d.id}
            item={d}
            featured={idx === 0}
            checked={selected.has(String(d.id))}
            onChange={(v) => toggle(String(d.id), v)}
          />
        ))}
      </section>

      {/* Receipt + Buy */}
      {selectedItems.length > 0 && (
        <section className="mt-10 max-w-2xl mx-auto rounded-2xl border border-gold/30 bg-card/85 backdrop-blur-sm p-6 sm:p-8">
          <p className="text-xs tracking-[0.3em] uppercase text-muted mb-4">
            Твоят избор
          </p>
          <ul className="space-y-2 text-sm">
            {selectedItems.map((i) => (
              <li
                key={i.id}
                className="flex justify-between items-baseline gap-2"
              >
                <span className="text-parchment/85">
                  {i.title}
                  <span className="text-parchment/45 ml-2 text-xs">
                    · {i.pages} стр
                  </span>
                </span>
                <span className="text-emerald-400 font-semibold whitespace-nowrap">
                  {formatEUR(i.priceEur)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 pt-5 border-t border-gold/30 flex justify-between items-baseline">
            <span className="font-serif text-lg text-parchment">Общо</span>
            <div className="text-right">
              <div className="font-serif text-2xl font-semibold gold-gradient-text">
                {formatEUR(totals.total)}
              </div>
              <div className="text-xs text-parchment/50 mt-0.5">
                ≈ {formatBGN(totals.total)}
              </div>
            </div>
          </div>

          <button
            onClick={buyDownsell}
            disabled={loading}
            className="mt-6 w-full py-3.5 rounded-md font-semibold bg-gold text-dark hover:bg-gold-light hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all disabled:opacity-60"
          >
            {loading
              ? "Зареждане..."
              : `Купи за ${formatEUR(totals.total)} →`}
          </button>
        </section>
      )}

      <div className="mt-12 text-center">
        <a
          href={sessionId ? `/thank-you?session_id=${sessionId}` : "/thank-you"}
          className="text-sm text-muted hover:text-gold-light transition-colors underline-offset-4 hover:underline"
        >
          Не, благодаря — продължи към завършване →
        </a>
      </div>
    </div>
  );
}

function DownsellCard({
  item,
  checked,
  onChange,
  featured,
}: {
  item: CatalogItem;
  checked: boolean;
  onChange: (v: boolean) => void;
  featured?: boolean;
}) {
  return (
    <label
      className={`relative block rounded-2xl bg-card/80 backdrop-blur-sm p-6 sm:p-7 cursor-pointer transition-all ${
        checked
          ? "border-2 border-gold shadow-[0_0_30px_rgba(212,175,55,0.3)]"
          : featured
            ? "border-2 border-gold/60 hover:border-gold"
            : "border border-gold/25 hover:border-gold/50"
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold tracking-widest uppercase text-dark bg-gold rounded-full whitespace-nowrap">
          ★ ПРЕПОРЪЧАН
        </span>
      )}

      <div className="flex items-start gap-3 mt-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1.5 w-5 h-5 accent-gold shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h2 className="font-serif text-xl sm:text-2xl text-parchment">
            {item.title}
          </h2>
          <p className="mt-1 text-sm text-gold/80 italic">{item.subtitle}</p>
        </div>
      </div>

      <div className="mt-5 flex items-baseline justify-center gap-3">
        <span className="font-serif text-3xl sm:text-4xl font-semibold text-emerald-400">
          {formatEUR(item.priceEur)}
        </span>
      </div>

      <div className="mt-4 flex justify-center text-xs text-parchment/60">
        <span>
          📄 {item.pages} страници · 📩 Имейл доставка
        </span>
      </div>

      <p className="mt-5 text-sm text-parchment/80 leading-relaxed text-center">
        {item.description}
      </p>
    </label>
  );
}

export default function DownsellPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gold">
          Зареждане...
        </div>
      }
    >
      <DownsellContent />
    </Suspense>
  );
}
