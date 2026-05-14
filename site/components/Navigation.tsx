"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type FreeTool = { label: string; href: string };
type PaidProduct = {
  label: string;
  href: string;
  oldPrice: string;
  newPrice: string;
};

const freeTools: FreeTool[] = [
  { label: "Личен Код", href: "/free-tools/personal-number" },
  { label: "Любовен Процент", href: "/free-tools/love-percentage" },
  { label: "Архетип Профил", href: "/free-tools/archetype" },
  { label: "Енергийно Отражение", href: "/free-tools/energy" },
  { label: "Социален Образ", href: "/free-tools/social-image" },
];

const paidProducts: PaidProduct[] = [
  {
    label: "Личен AI Анализ",
    href: "/products/personal-profile",
    oldPrice: "€49.99",
    newPrice: "€19.99",
  },
  {
    label: "Любовна Съвместимост",
    href: "/products/synastry",
    oldPrice: "€37.49",
    newPrice: "€14.99",
  },
  {
    label: "Годишен Анализ",
    href: "/products/yearly-analysis",
    oldPrice: "€37.49",
    newPrice: "€14.99",
  },
  {
    label: "Архетип Профил",
    href: "/products/archetype-profile",
    oldPrice: "€37.49",
    newPrice: "€14.99",
  },
  {
    label: "Карта на Живота",
    href: "/products/life-map",
    oldPrice: "€37.49",
    newPrice: "€14.99",
  },
  {
    label: "Скрит Потенциал",
    href: "/products/hidden-potential",
    oldPrice: "€37.49",
    newPrice: "€14.99",
  },
  {
    label: "Енергиен Профил",
    href: "/products/energy-profile",
    oldPrice: "€37.49",
    newPrice: "€14.99",
  },
  {
    label: "Пълен Животен Код",
    href: "/products/full-life-code",
    oldPrice: "€199.99",
    newPrice: "€79.99",
  },
];

type OpenMenu = "free" | "paid" | null;

export default function Navigation() {
  const [open, setOpen] = useState<OpenMenu>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-dark/70 border-b border-gold/15">
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            href="/"
            onClick={closeMobile}
            className="font-serif text-2xl sm:text-3xl tracking-[0.25em] text-gold hover:text-gold-light transition-colors"
          >
            АСТРО ОС
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            <DropdownTrigger
              label="Бързи Анализи"
              isOpen={open === "free"}
              onEnter={() => setOpen("free")}
              onLeave={() => setOpen(null)}
            >
              <ul className="py-2">
                {freeTools.map((t) => (
                  <li key={t.href}>
                    <Link
                      href={t.href}
                      className="block px-5 py-2.5 text-sm text-parchment/90 hover:bg-gold/10 hover:text-gold-light transition-colors"
                    >
                      {t.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </DropdownTrigger>

            <DropdownTrigger
              label="Задълбочени Анализи"
              wide
              isOpen={open === "paid"}
              onEnter={() => setOpen("paid")}
              onLeave={() => setOpen(null)}
            >
              <ul className="py-2">
                {paidProducts.map((p) => (
                  <li key={p.href}>
                    <Link
                      href={p.href}
                      className="flex items-center justify-between gap-4 px-5 py-2.5 text-sm hover:bg-gold/10 transition-colors group"
                    >
                      <span className="text-parchment/90 group-hover:text-gold-light">
                        {p.label}
                      </span>
                      <span className="flex items-center gap-2 whitespace-nowrap">
                        <span className="text-red-400/80 line-through text-xs">
                          {p.oldPrice}
                        </span>
                        <span className="text-emerald-400 font-semibold">
                          {p.newPrice}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </DropdownTrigger>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/products/personal-profile"
              className="hidden sm:inline-flex items-center gap-1 px-5 py-2.5 text-sm font-medium border border-gold text-gold rounded-md hover:bg-gold hover:text-dark transition-colors"
            >
              Започни сега →
            </Link>

            {/* Hamburger — mobile only */}
            <button
              type="button"
              aria-label={mobileOpen ? "Затвори меню" : "Отвори меню"}
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-[6px] rounded-md hover:bg-gold/10 transition-colors"
            >
              <span
                className={`block w-6 h-px bg-gold transition-all origin-center ${
                  mobileOpen ? "rotate-45 translate-y-[7px]" : ""
                }`}
              />
              <span
                className={`block w-6 h-px bg-gold transition-all ${
                  mobileOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block w-6 h-px bg-gold transition-all origin-center ${
                  mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""
                }`}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-dark animate-fade-in overflow-y-auto md:hidden">
          <div className="flex items-center justify-between px-6 h-20 border-b border-gold/15">
            <Link
              href="/"
              onClick={closeMobile}
              className="font-serif text-2xl tracking-[0.25em] text-gold"
            >
              АСТРО ОС
            </Link>
            <button
              type="button"
              aria-label="Затвори меню"
              onClick={closeMobile}
              className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gold/10 transition-colors text-gold text-2xl leading-none"
            >
              ✕
            </button>
          </div>

          <div className="px-6 py-8 space-y-10">
            {/* Free tools section */}
            <section>
              <p className="text-xs tracking-[0.3em] uppercase text-gold/60 mb-4">
                Бързи Анализи
              </p>
              <ul className="space-y-1">
                {freeTools.map((t) => (
                  <li key={t.href}>
                    <Link
                      href={t.href}
                      onClick={closeMobile}
                      className="block py-3 text-lg text-parchment/90 hover:text-gold-light border-b border-gold/10 transition-colors"
                    >
                      {t.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* Paid products section */}
            <section>
              <p className="text-xs tracking-[0.3em] uppercase text-gold/60 mb-4">
                Задълбочени Анализи
              </p>
              <ul className="space-y-1">
                {paidProducts.map((p) => (
                  <li key={p.href}>
                    <Link
                      href={p.href}
                      onClick={closeMobile}
                      className="flex items-center justify-between py-3 border-b border-gold/10 hover:text-gold-light transition-colors group"
                    >
                      <span className="text-base text-parchment/90 group-hover:text-gold-light">
                        {p.label}
                      </span>
                      <span className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-red-400/70 line-through">
                          {p.oldPrice}
                        </span>
                        <span className="text-sm text-emerald-400 font-semibold">
                          {p.newPrice}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* CTA */}
            <Link
              href="/products/personal-profile"
              onClick={closeMobile}
              className="block w-full text-center py-4 bg-gold text-dark font-semibold rounded-md hover:bg-gold-light transition-colors text-lg"
            >
              Започни сега →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

function DropdownTrigger({
  label,
  isOpen,
  onEnter,
  onLeave,
  children,
  wide,
}: {
  label: string;
  isOpen: boolean;
  onEnter: () => void;
  onLeave: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="relative" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <button
        type="button"
        className="px-4 py-2 text-sm text-parchment/90 hover:text-gold-light transition-colors inline-flex items-center gap-1"
      >
        {label}
        <span
          className={`transition-transform text-xs ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>
      {isOpen && (
        <div
          className={`absolute top-full left-0 pt-2 ${wide ? "w-96" : "w-64"}`}
        >
          <div className="rounded-lg border border-gold/25 bg-card/95 backdrop-blur-md shadow-2xl shadow-black/50 animate-fade-in">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
