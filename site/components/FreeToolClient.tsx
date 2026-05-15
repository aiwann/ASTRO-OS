"use client";

import Link from "next/link";
import { useState } from "react";
import { formatBGN, formatEUR, getProduct } from "@/lib/products";
import {
  ARCHETYPES,
  SOCIAL_IMAGE,
  ToolSlug,
  getElement,
  lifePathNumber,
  loveCompatibility,
} from "@/lib/freeTools";

type ToolMeta = {
  title: string;
  subtitle: string;
  ctaProductSlug: string;
  ctaLabel: string;
};

const TOOL_META: Record<ToolSlug, ToolMeta> = {
  "personal-number": {
    title: "Личен Код",
    subtitle: "Главното число от твоята дата на раждане",
    ctaProductSlug: "personal-profile",
    ctaLabel: "Виж пълния Личен AI Анализ →",
  },
  "love-percentage": {
    title: "Любовен Процент",
    subtitle: "Бърза съвместимост по дати на раждане",
    ctaProductSlug: "synastry",
    ctaLabel: "Виж пълната Любовна Съвместимост →",
  },
  archetype: {
    title: "Архетип Профил",
    subtitle: "Твоят вътрешен архетип от жизнения път",
    ctaProductSlug: "archetype-profile",
    ctaLabel: "Виж пълния Архетип Профил →",
  },
  energy: {
    title: "Енергийно Отражение",
    subtitle: "Доминантната ти стихия и как се проявява",
    ctaProductSlug: "energy-profile",
    ctaLabel: "Виж пълния Енергиен Профил →",
  },
  "social-image": {
    title: "Социален Образ",
    subtitle: "Как те виждат хората около теб",
    ctaProductSlug: "personal-profile",
    ctaLabel: "Виж пълния Личен AI Анализ →",
  },
};

const NUMBER_DESCRIPTIONS: Record<number, string> = {
  1: "Числото на лидера. Независим, инициативен, амбициозен. Ти не следваш — създаваш пътеки.",
  2: "Числото на дипломата. Чувствителен, балансиращ, кооперативен. Виждаш и двете страни на всеки въпрос.",
  3: "Числото на твореца. Изразителен, оптимистичен, вдъхновяващ. Носиш светлина чрез думи и идеи.",
  4: "Числото на строителя. Дисциплиниран, постоянен, надежден. Изграждаш основи, които траят.",
  5: "Числото на свободата. Авантюрист, динамичен, гъвкав. Промяната е твоят кислород.",
  6: "Числото на хармонията. Грижовен, отговорен, лечебен. Домът и любовта са в ядрото ти.",
  7: "Числото на мистика. Дълбок, аналитичен, духовен. Търсиш истината под повърхността.",
  8: "Числото на изпълнителя. Амбициозен, организиран, материален. Превръщаш визии в реалност.",
  9: "Числото на хуманиста. Състрадателен, мъдър, универсален. Живееш с поглед към цялото.",
  11: "Майстор число — Интуитивен. Канал между видимото и невидимото. Усещаш отвъд логиката.",
  22: "Майстор число — Майстор Строител. Виждаш в големия мащаб и можеш да го материализираш.",
  33: "Майстор число — Майстор Учител. Носиш светлина за другите. Любовта ти е трансформираща.",
};

export default function FreeToolClient({ tool }: { tool: ToolSlug }) {
  const meta = TOOL_META[tool];
  const product = getProduct(meta.ctaProductSlug);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 animate-fade-in">
      <header className="text-center mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-gold/70 mb-3">
          Безплатен инструмент
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light leading-tight">
          <span className="gold-gradient-text">{meta.title}</span>
        </h1>
        <p className="mt-3 text-parchment/70 font-serif italic text-lg">
          {meta.subtitle}
        </p>
      </header>

      {tool === "personal-number" && (
        <SingleDateTool
          buttonLabel="Изчисли числото →"
          renderResult={(date) => {
            const lp = lifePathNumber(date);
            return (
              <>
                <ResultCard
                  title={`Твоето главно число е ${lp}`}
                  description={NUMBER_DESCRIPTIONS[lp] ?? ""}
                />
                {product && (
                  <BridgeBlock
                    productTitle={product.title}
                    slug={product.slug}
                    newPrice={product.newPrice}
                  />
                )}
              </>
            );
          }}
        />
      )}

      {tool === "archetype" && (
        <SingleDateTool
          buttonLabel="Открий архетипа си →"
          renderResult={(date) => {
            const lp = lifePathNumber(date);
            const a = ARCHETYPES[lp];
            return (
              <>
                <ResultCard
                  title={`Ти си ${a.name} ${a.emoji}`}
                  description={a.description}
                />
                {product && (
                  <BridgeBlock
                    productTitle={product.title}
                    slug={product.slug}
                    newPrice={product.newPrice}
                  />
                )}
              </>
            );
          }}
        />
      )}

      {tool === "energy" && (
        <SingleDateTool
          buttonLabel="Виж стихията си →"
          renderResult={(date) => {
            const e = getElement(date);
            return (
              <>
                <ResultCard
                  title={`Твоята стихия е ${e.element} ${e.emoji}`}
                  description={e.description}
                />
                {product && (
                  <BridgeBlock
                    productTitle={product.title}
                    slug={product.slug}
                    newPrice={product.newPrice}
                  />
                )}
              </>
            );
          }}
        />
      )}

      {tool === "social-image" && (
        <SingleDateTool
          buttonLabel="Виж образа си →"
          renderResult={(date) => {
            const lp = lifePathNumber(date);
            const s = SOCIAL_IMAGE[lp];
            return (
              <>
                <ResultCard title={s.headline} description={s.description} />
                {product && (
                  <BridgeBlock
                    productTitle={product.title}
                    slug={product.slug}
                    newPrice={product.newPrice}
                  />
                )}
              </>
            );
          }}
        />
      )}

      {tool === "love-percentage" && (
        <LoveTool
          renderBridge={() =>
            product && (
              <BridgeBlock
                productTitle={product.title}
                slug={product.slug}
                newPrice={product.newPrice}
              />
            )
          }
        />
      )}

      {product && (
        <CtaBlock
          label={meta.ctaLabel}
          slug={product.slug}
          oldPrice={product.oldPrice}
          newPrice={product.newPrice}
        />
      )}
    </div>
  );
}

function SingleDateTool({
  buttonLabel,
  renderResult,
}: {
  buttonLabel: string;
  renderResult: (date: string) => React.ReactNode;
}) {
  const [date, setDate] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const valid = lifePathNumber(date) > 0;

  return (
    <>
      <form
        className="rounded-2xl border border-gold/20 bg-card/60 backdrop-blur-sm p-6 sm:p-7"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) setSubmitted(true);
        }}
      >
        <label
          htmlFor="bdate"
          className="block text-sm font-medium text-parchment mb-2"
        >
          Дата на раждане <span className="text-gold ml-1">*</span>
        </label>
        <input
          id="bdate"
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setSubmitted(false);
          }}
          className="field"
          required
        />
        <button
          type="submit"
          disabled={!valid}
          className={`mt-5 w-full py-3.5 rounded-md font-semibold transition-all ${
            valid
              ? "bg-gold text-dark hover:bg-gold-light hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
              : "bg-gold/30 text-dark/50 cursor-not-allowed"
          }`}
        >
          {buttonLabel}
        </button>
      </form>

      {submitted && valid && (
        <div className="mt-8 animate-fade-in">{renderResult(date)}</div>
      )}

      <FieldStyles />
    </>
  );
}

function LoveTool({
  renderBridge,
}: {
  renderBridge: () => React.ReactNode;
}) {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const valid = lifePathNumber(date1) > 0 && lifePathNumber(date2) > 0;

  return (
    <>
      <form
        className="rounded-2xl border border-gold/20 bg-card/60 backdrop-blur-sm p-6 sm:p-7 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) setSubmitted(true);
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="name1"
              className="block text-sm font-medium text-parchment mb-2"
            >
              Твоето име
            </label>
            <input
              id="name1"
              type="text"
              value={name1}
              onChange={(e) => setName1(e.target.value)}
              placeholder="Иван"
              className="field"
            />
            <label
              htmlFor="date1"
              className="block text-sm font-medium text-parchment mt-3 mb-2"
            >
              Твоята дата <span className="text-gold ml-1">*</span>
            </label>
            <input
              id="date1"
              type="date"
              value={date1}
              onChange={(e) => {
                setDate1(e.target.value);
                setSubmitted(false);
              }}
              className="field"
              required
            />
          </div>
          <div>
            <label
              htmlFor="name2"
              className="block text-sm font-medium text-parchment mb-2"
            >
              Името на партньора
            </label>
            <input
              id="name2"
              type="text"
              value={name2}
              onChange={(e) => setName2(e.target.value)}
              placeholder="Мария"
              className="field"
            />
            <label
              htmlFor="date2"
              className="block text-sm font-medium text-parchment mt-3 mb-2"
            >
              Датата на партньора <span className="text-gold ml-1">*</span>
            </label>
            <input
              id="date2"
              type="date"
              value={date2}
              onChange={(e) => {
                setDate2(e.target.value);
                setSubmitted(false);
              }}
              className="field"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!valid}
          className={`w-full py-3.5 rounded-md font-semibold transition-all ${
            valid
              ? "bg-gold text-dark hover:bg-gold-light hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
              : "bg-gold/30 text-dark/50 cursor-not-allowed"
          }`}
        >
          Изчисли съвместимостта →
        </button>
      </form>

      {submitted && valid && (
        <>
          <LoveResultBlock
            name1={name1 || "Ти"}
            name2={name2 || "Той/тя"}
            date1={date1}
            date2={date2}
          />
          {renderBridge()}
        </>
      )}

      <FieldStyles />
    </>
  );
}

function LoveResultBlock({
  name1,
  name2,
  date1,
  date2,
}: {
  name1: string;
  name2: string;
  date1: string;
  date2: string;
}) {
  const { score, label, teaser } = loveCompatibility(date1, date2);
  return (
    <div className="mt-8 rounded-2xl border border-gold/30 bg-card/80 backdrop-blur-sm p-7 sm:p-10 text-center animate-fade-in">
      <p className="text-xs tracking-[0.3em] uppercase text-muted">
        {name1} ✦ {name2}
      </p>
      <p className="mt-5 font-serif text-7xl sm:text-8xl font-light gold-gradient-text leading-none">
        {score}%
      </p>
      <p className="mt-3 font-serif text-xl text-parchment/90 italic">
        {label}
      </p>
      <p className="mt-6 max-w-xl mx-auto text-parchment/80 leading-relaxed italic">
        {teaser}
      </p>
    </div>
  );
}

function ResultCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gold/30 bg-card/80 backdrop-blur-sm p-7 sm:p-10 text-center">
      <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light leading-tight">
        <span className="gold-gradient-text">{title}</span>
      </h2>
      <p className="mt-6 text-parchment/85 leading-relaxed">{description}</p>
      <p className="mt-6 text-parchment/60 italic">
        Пълният анализ разкрива 10× повече.
      </p>
    </div>
  );
}

function BridgeBlock({
  productTitle,
  slug,
  newPrice,
}: {
  productTitle: string;
  slug: string;
  newPrice: number;
}) {
  return (
    <div className="mt-8 rounded-2xl border border-gold/35 bg-gradient-to-b from-gold/[0.07] to-card/40 backdrop-blur-sm p-7 sm:p-9 text-center animate-fade-in">
      <p className="text-xs tracking-[0.3em] uppercase text-gold/80 mb-4">
        ✦ Това е само върхът на айсберга ✦
      </p>
      <h3 className="font-serif text-2xl sm:text-3xl font-light leading-tight mb-4">
        <span className="gold-gradient-text">
          Виж пълния си 15-страничен {productTitle}
        </span>
      </h3>
      <p className="text-parchment/75 leading-relaxed max-w-lg mx-auto mb-7">
        С пълни планетарни позиции, аспекти, кармични точки и персонална мисия.
      </p>
      <Link
        href={`/products/${slug}`}
        className="inline-flex items-center gap-2 px-7 py-3.5 bg-gold text-dark font-semibold rounded-md hover:bg-gold-light transition-all hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] group"
      >
        Вземи пълния анализ — {formatEUR(newPrice)}
        <span className="group-hover:translate-x-1 transition-transform">→</span>
      </Link>
      <p className="mt-2 text-xs text-parchment/55">
        ≈ {formatBGN(newPrice)}
      </p>
      <p className="mt-3 text-xs tracking-wider uppercase text-parchment/45">
        Готов за 5 минути • PDF на имейла
      </p>
    </div>
  );
}

function CtaBlock({
  label,
  slug,
  oldPrice,
  newPrice,
}: {
  label: string;
  slug: string;
  oldPrice: number;
  newPrice: number;
}) {
  return (
    <div className="mt-10 text-center">
      <Link
        href={`/products/${slug}`}
        className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-dark font-semibold rounded-md hover:bg-gold-light transition-all hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] group"
      >
        {label}
        <span className="group-hover:translate-x-1 transition-transform">

        </span>
      </Link>
      <p className="mt-4 text-sm">
        <span className="text-red-400/80 line-through">
          🔴 {formatEUR(oldPrice)}
        </span>
        <span className="mx-2 text-parchment/50">→</span>
        <span className="text-emerald-400 font-semibold">
          🟢 {formatEUR(newPrice)} днес
        </span>
      </p>
    </div>
  );
}

function FieldStyles() {
  return (
    <style jsx>{`
      :global(.field) {
        width: 100%;
        background-color: #14101e;
        border: 1px solid rgba(212, 175, 55, 0.2);
        border-radius: 0.5rem;
        padding: 0.75rem 1rem;
        color: #e8dcc8;
        font-size: 1rem;
        transition: border-color 0.15s, box-shadow 0.15s;
        color-scheme: dark;
      }
      :global(.field::placeholder) {
        color: #8a7a60;
      }
      :global(.field:focus) {
        outline: none;
        border-color: #d4af37;
        box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
      }
    `}</style>
  );
}
