"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, Suspense } from "react";
import {
  BUMPS,
  UPSELLS,
  getBundleablePicker,
  computeOrderTotal,
  formatEUR,
  formatBGN,
  type CatalogItem,
} from "@/lib/catalog";

const COUNTDOWN_SECONDS = 5 * 60;
const U3_REQUIRED_BUMPS = 3;

function formatTime(s: number): string {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

function UpsellContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";

  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);
  const [u3Open, setU3Open] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const pickerMains = useMemo(() => getBundleablePicker(), []);
  const pickerBumps = BUMPS;

  const toggle = (id: string, on: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const selectedItems = useMemo<CatalogItem[]>(() => {
    const all = [...pickerMains, ...pickerBumps];
    return all.filter((i) => selected.has(String(i.id)));
  }, [pickerMains, pickerBumps, selected]);

  const totals = useMemo(
    () => computeOrderTotal(Array.from(selected), { applyBundleDiscount: true }),
    [selected],
  );

  const u3Item = UPSELLS.find((u) => u.id === "U3");

  const buyBundle = async () => {
    if (selectedItems.length === 0) return;
    setLoading("bundle");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-upsell-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originalSessionId: sessionId,
            itemIds: Array.from(selected),
            applyBundleDiscount: true,
          }),
        },
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

  const buyU3 = async (chosenBumps: string[]) => {
    if (chosenBumps.length !== U3_REQUIRED_BUMPS) return;
    setLoading("U3");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-upsell-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originalSessionId: sessionId,
            itemIds: ["U3"],
            extraCustomerData: { u3Bumps: chosenBumps },
          }),
        },
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
      {/* Success banner */}
      <div className="max-w-2xl mx-auto mb-10 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 backdrop-blur-sm p-5 text-center">
        <div className="text-2xl mb-2">✓</div>
        <p className="text-emerald-300 font-medium">
          Поръчката ти е приета — PDF-ът е на път към имейла ти
        </p>
      </div>

      {/* Header */}
      <header className="text-center mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-gold/70 mb-3">
          Еднократна оферта
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light leading-tight">
          <span className="gold-gradient-text">
            Преди да си тръгнеш — отвори това
          </span>
        </h1>
        <p className="mt-4 text-parchment/75 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Добави повече анализи с до{" "}
          <span className="text-gold-light font-semibold">-20% отстъпка</span>{" "}
          — валидна само сега.
        </p>
        <div className="mt-6 inline-flex items-baseline gap-3 px-6 py-3 rounded-xl border border-gold/30 bg-card/70">
          <span className="text-xs tracking-widest uppercase text-muted">
            Офертата изтича след
          </span>
          <span
            className={`font-serif text-3xl sm:text-4xl font-semibold tabular-nums ${
              secondsLeft === 0 ? "text-red-400" : "text-gold-light"
            }`}
          >
            {formatTime(secondsLeft)}
          </span>
        </div>
      </header>

      {/* ⭐ U3 — Featured premium offer */}
      {u3Item && (
        <section className="mb-10">
          <article className="relative rounded-2xl border-2 border-gold bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm p-6 sm:p-8 shadow-[0_0_60px_rgba(212,175,55,0.25)]">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold tracking-widest uppercase text-dark bg-gold rounded-full whitespace-nowrap">
              ★ BEST VALUE
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mt-2">
              <div className="md:col-span-2">
                <h2 className="font-serif text-2xl sm:text-3xl text-parchment">
                  {u3Item.title}
                </h2>
                <p className="text-sm text-gold/85 italic mt-1">
                  {u3Item.subtitle}
                </p>
                <p className="mt-3 text-sm text-parchment/85 leading-relaxed">
                  {u3Item.description}
                </p>
                <p className="mt-3 text-xs text-parchment/60">
                  📄 ~{u3Item.pages} страници · един луксозен PDF · имейл доставка
                </p>
              </div>
              <div className="text-center md:text-right">
                <div className="text-red-400/80 line-through text-base mb-1">
                  €74.96
                </div>
                <div className="font-serif text-4xl sm:text-5xl font-semibold text-emerald-400">
                  {formatEUR(u3Item.priceEur)}
                </div>
                <div className="text-xs text-emerald-300/80 mt-1">
                  пести ~€10 vs поотделно
                </div>
                <button
                  onClick={() => setU3Open(true)}
                  disabled={!!loading}
                  className="mt-4 inline-flex items-center justify-center w-full px-5 py-3 rounded-md font-semibold bg-gold text-dark hover:bg-gold-light hover:shadow-[0_0_30px_rgba(212,175,55,0.45)] transition-all disabled:opacity-60"
                >
                  {loading === "U3" ? "Зареждане..." : "Избери 3 bumps →"}
                </button>
              </div>
            </div>
          </article>
        </section>
      )}

      {/* Divider */}
      <div className="my-10 flex items-center gap-4">
        <div className="flex-1 h-px bg-gold/20" />
        <span className="text-xs tracking-[0.3em] uppercase text-gold/60">
          или сглоби свой пакет
        </span>
        <div className="flex-1 h-px bg-gold/20" />
      </div>

      {/* Bundle Picker */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Mains */}
          <div className="rounded-2xl border border-gold/25 bg-card/70 backdrop-blur-sm p-6">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="font-serif text-xl text-parchment">
                Основни анализи
              </h3>
              <span className="text-xs text-gold/70">
                2 → -10% · 3+ → -20%
              </span>
            </div>
            <div className="space-y-3">
              {pickerMains.map((item) => (
                <PickerRow
                  key={item.id}
                  item={item}
                  checked={selected.has(String(item.id))}
                  onChange={(v) => toggle(String(item.id), v)}
                />
              ))}
            </div>
          </div>

          {/* Bumps */}
          <div className="rounded-2xl border border-gold/25 bg-card/70 backdrop-blur-sm p-6">
            <h3 className="font-serif text-xl text-parchment mb-1">
              Допълнения
            </h3>
            <p className="text-xs text-parchment/55 mb-4">
              Кратки 1-2 страници секции · без отстъпка
            </p>
            <div className="space-y-3">
              {pickerBumps.map((item) => (
                <PickerRow
                  key={item.id}
                  item={item}
                  checked={selected.has(String(item.id))}
                  onChange={(v) => toggle(String(item.id), v)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Sticky receipt */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 rounded-2xl border border-gold/30 bg-card/85 backdrop-blur-sm p-6">
            <p className="text-xs tracking-[0.3em] uppercase text-muted mb-3">
              Твоят пакет
            </p>

            {selectedItems.length === 0 ? (
              <p className="text-sm text-parchment/55 italic py-6 text-center">
                Избери поне един продукт от списъка вляво
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {selectedItems.map((i) => (
                  <li
                    key={i.id}
                    className="flex justify-between items-baseline gap-2"
                  >
                    <span className="text-parchment/85 truncate">{i.title}</span>
                    <span className="text-parchment/65 whitespace-nowrap">
                      {formatEUR(i.priceEur)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {totals.discountAmount > 0 && (
              <div className="mt-4 pt-4 border-t border-gold/15 text-sm space-y-1">
                <div className="flex justify-between text-parchment/65">
                  <span>Subtotal</span>
                  <span>{formatEUR(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>
                    Bundle отстъпка ({Math.round(totals.discount * 100)}% на mains)
                  </span>
                  <span>-{formatEUR(totals.discountAmount)}</span>
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gold/30 flex justify-between items-baseline">
              <span className="font-serif text-lg text-parchment">Общо</span>
              <div className="text-right">
                <div className="font-serif text-2xl font-semibold gold-gradient-text">
                  {formatEUR(totals.total)}
                </div>
                {totals.total > 0 && (
                  <div className="text-xs text-parchment/50 mt-0.5">
                    ≈ {formatBGN(totals.total)}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={buyBundle}
              disabled={selectedItems.length === 0 || !!loading}
              className={`mt-5 w-full py-3.5 rounded-md font-semibold transition-all ${
                selectedItems.length > 0 && !loading
                  ? "bg-gold text-dark hover:bg-gold-light hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
                  : "bg-gold/30 text-dark/50 cursor-not-allowed"
              }`}
            >
              {loading === "bundle"
                ? "Зареждане..."
                : selectedItems.length === 0
                  ? "Избери продукт"
                  : `Купи за ${formatEUR(totals.total)} →`}
            </button>
          </div>
        </aside>
      </section>

      {/* Skip to downsell */}
      <div className="mt-12 text-center">
        <a
          href={`/downsell?session_id=${sessionId}`}
          className="text-sm text-muted hover:text-gold-light transition-colors underline-offset-4 hover:underline"
        >
          Не, благодаря — продължи без оферта →
        </a>
      </div>

      {/* U3 Modal */}
      {u3Open && (
        <U3BumpPicker
          onCancel={() => setU3Open(false)}
          onConfirm={(picks) => {
            setU3Open(false);
            buyU3(picks);
          }}
        />
      )}
    </div>
  );
}

function PickerRow({
  item,
  checked,
  onChange,
}: {
  item: CatalogItem;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={`flex items-start gap-3 rounded-md p-3 cursor-pointer transition-colors ${
        checked
          ? "bg-gold/10 border border-gold/40"
          : "bg-card/40 border border-gold/10 hover:border-gold/25"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-4 h-4 accent-gold shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="font-serif text-base text-parchment">
            {item.title}
            {item.featured && (
              <span className="ml-2 text-xs font-sans text-gold-light">★</span>
            )}
          </span>
          <span className="font-semibold text-emerald-400 whitespace-nowrap text-sm">
            {formatEUR(item.priceEur)}
          </span>
        </div>
        <p className="text-xs text-parchment/60 mt-0.5">
          📄 {item.pages} стр · {item.subtitle}
        </p>
      </div>
    </label>
  );
}

function U3BumpPicker({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: (chosenBumpIds: string[]) => void;
}) {
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < U3_REQUIRED_BUMPS) next.add(id);
      return next;
    });
  };

  const canConfirm = picked.size === U3_REQUIRED_BUMPS;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border-2 border-gold bg-card p-6 sm:p-8 shadow-[0_0_60px_rgba(212,175,55,0.3)]">
        <h2 className="font-serif text-2xl text-parchment text-center">
          <span className="gold-gradient-text">Избери 3 bumps за U3</span>
        </h2>
        <p className="mt-2 text-sm text-parchment/70 text-center">
          Избрани: <span className="text-gold-light font-semibold">{picked.size}</span> / {U3_REQUIRED_BUMPS}
        </p>

        <div className="mt-5 space-y-2">
          {BUMPS.map((b) => {
            const id = String(b.id);
            const isPicked = picked.has(id);
            const disabled = !isPicked && picked.size >= U3_REQUIRED_BUMPS;
            return (
              <label
                key={id}
                className={`flex items-start gap-3 rounded-md p-3 transition-colors ${
                  disabled
                    ? "opacity-40 cursor-not-allowed bg-card/40 border border-gold/10"
                    : isPicked
                      ? "bg-gold/15 border border-gold cursor-pointer"
                      : "bg-card/50 border border-gold/15 hover:border-gold/35 cursor-pointer"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isPicked}
                  disabled={disabled}
                  onChange={() => toggle(id)}
                  className="mt-1 w-4 h-4 accent-gold shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-base text-parchment">
                    {b.title}
                  </div>
                  <p className="text-xs text-parchment/65 mt-0.5">
                    📄 {b.pages} стр · {b.subtitle}
                  </p>
                </div>
              </label>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-5 py-3 border border-gold/40 text-parchment/80 rounded-md hover:bg-gold/10 transition-colors"
          >
            Отказ
          </button>
          <button
            type="button"
            onClick={() => onConfirm(Array.from(picked))}
            disabled={!canConfirm}
            className={`flex-1 px-5 py-3 rounded-md font-semibold transition-all ${
              canConfirm
                ? "bg-gold text-dark hover:bg-gold-light hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
                : "bg-gold/30 text-dark/50 cursor-not-allowed"
            }`}
          >
            Купи за €64.99 →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UpsellPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gold">
          Зареждане...
        </div>
      }
    >
      <UpsellContent />
    </Suspense>
  );
}
