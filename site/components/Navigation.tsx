"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { LANGUAGES, TranslationKey } from "@/lib/i18n";

type NavItem = { key: TranslationKey; href: string };

const freeTools: NavItem[] = [
  { key: "tool.personal-number", href: "/free-tools/personal-number" },
  { key: "tool.love-percentage", href: "/free-tools/love-percentage" },
  { key: "tool.archetype", href: "/free-tools/archetype" },
  { key: "tool.energy", href: "/free-tools/energy" },
  { key: "tool.social-image", href: "/free-tools/social-image" },
];

const paidProducts: NavItem[] = [
  { key: "product.personal-profile", href: "/products/personal-profile" },
  { key: "product.synastry", href: "/products/synastry" },
  { key: "product.yearly-analysis", href: "/products/yearly-analysis" },
  { key: "product.archetype-profile", href: "/products/archetype-profile" },
  { key: "product.life-map", href: "/products/life-map" },
  { key: "product.hidden-potential", href: "/products/hidden-potential" },
  { key: "product.energy-profile", href: "/products/energy-profile" },
  { key: "product.full-life-code", href: "/products/full-life-code" },
];

type OpenMenu = "free" | "paid" | null;

export default function Navigation() {
  const { t, language, switchLanguage } = useLanguage();
  const [open, setOpen] = useState<OpenMenu>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
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
              label={t("nav.quickAnalyses")}
              isOpen={open === "free"}
              onEnter={() => setOpen("free")}
              onLeave={() => setOpen(null)}
            >
              <ul className="py-2">
                {freeTools.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block px-5 py-2.5 text-sm text-parchment/90 hover:bg-gold/10 hover:text-gold-light transition-colors"
                    >
                      {t(item.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </DropdownTrigger>

            <DropdownTrigger
              label={t("nav.deepAnalyses")}
              isOpen={open === "paid"}
              onEnter={() => setOpen("paid")}
              onLeave={() => setOpen(null)}
            >
              <ul className="py-2">
                {paidProducts.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center justify-between gap-4 px-5 py-2.5 text-sm text-parchment/90 hover:bg-gold/10 hover:text-gold-light transition-colors group"
                    >
                      <span>{t(item.key)}</span>
                      <span className="text-gold/50 group-hover:text-gold group-hover:translate-x-0.5 transition-all">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/about"
                    className="block px-5 py-2.5 text-sm text-gold/80 hover:bg-gold/10 hover:text-gold-light transition-colors border-t border-gold/15 mt-1 pt-3"
                  >
                    {t("nav.about")} →
                  </Link>
                </li>
              </ul>
            </DropdownTrigger>
          </div>

          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <div className="hidden sm:flex items-center gap-1 border border-gold/25 rounded-md p-0.5">
              {LANGUAGES.map((lng) => (
                <button
                  key={lng.code}
                  type="button"
                  onClick={() => switchLanguage(lng.code)}
                  aria-label={`Switch to ${lng.label}`}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    language === lng.code
                      ? "bg-gold text-dark font-semibold"
                      : "text-parchment/70 hover:text-gold-light"
                  }`}
                >
                  <span className="mr-1">{lng.flag}</span>
                  {lng.label}
                </button>
              ))}
            </div>

            <Link
              href="/products/personal-profile"
              className="hidden sm:inline-flex items-center gap-1 px-5 py-2.5 text-sm font-medium border border-gold text-gold rounded-md hover:bg-gold hover:text-dark transition-colors"
            >
              {t("nav.startNow")}
            </Link>

            {/* Hamburger — mobile only */}
            <button
              type="button"
              aria-label={mobileOpen ? t("nav.closeMenu") : t("nav.openMenu")}
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
              aria-label={t("nav.closeMenu")}
              onClick={closeMobile}
              className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gold/10 transition-colors text-gold text-2xl leading-none"
            >
              ✕
            </button>
          </div>

          <div className="px-6 py-8 space-y-10">
            {/* Language switcher (mobile) */}
            <div className="flex items-center gap-2 border border-gold/25 rounded-md p-1 w-fit mx-auto">
              {LANGUAGES.map((lng) => (
                <button
                  key={lng.code}
                  type="button"
                  onClick={() => switchLanguage(lng.code)}
                  className={`px-3 py-1.5 text-sm rounded transition-colors ${
                    language === lng.code
                      ? "bg-gold text-dark font-semibold"
                      : "text-parchment/80 hover:text-gold-light"
                  }`}
                >
                  <span className="mr-1">{lng.flag}</span>
                  {lng.label}
                </button>
              ))}
            </div>

            {/* Free tools section */}
            <section>
              <p className="text-xs tracking-[0.3em] uppercase text-gold/60 mb-4">
                {t("nav.quickAnalyses")}
              </p>
              <ul className="space-y-1">
                {freeTools.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeMobile}
                      className="block py-3 text-lg text-parchment/90 hover:text-gold-light border-b border-gold/10 transition-colors"
                    >
                      {t(item.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* Paid products section */}
            <section>
              <p className="text-xs tracking-[0.3em] uppercase text-gold/60 mb-4">
                {t("nav.deepAnalyses")}
              </p>
              <ul className="space-y-1">
                {paidProducts.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeMobile}
                      className="flex items-center justify-between py-3 border-b border-gold/10 text-base text-parchment/90 hover:text-gold-light transition-colors group"
                    >
                      <span>{t(item.key)}</span>
                      <span className="text-gold/50 group-hover:text-gold">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/about"
                    onClick={closeMobile}
                    className="flex items-center justify-between py-3 text-base text-gold/80 hover:text-gold-light transition-colors group"
                  >
                    <span>{t("nav.about")}</span>
                    <span className="text-gold/50 group-hover:text-gold">→</span>
                  </Link>
                </li>
              </ul>
            </section>

            {/* CTA */}
            <Link
              href="/products/personal-profile"
              onClick={closeMobile}
              className="block w-full text-center py-4 bg-gold text-dark font-semibold rounded-md hover:bg-gold-light transition-colors text-lg"
            >
              {t("nav.startNow")}
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
