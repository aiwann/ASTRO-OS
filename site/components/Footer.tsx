import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-24 border-t border-gold/15 bg-dark/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between sm:items-start">
          {/* Brand block */}
          <div className="text-center sm:text-left">
            <Link
              href="/"
              className="font-serif text-2xl tracking-[0.25em] text-gold hover:text-gold-light transition-colors"
            >
              АСТРО ОС
            </Link>
            <p className="mt-2 text-xs text-parchment/50 tracking-wide">
              AI астрологичен анализ — точен, личен, готов за минути.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
            <Link
              href="/terms"
              className="text-parchment/80 hover:text-gold-light transition-colors"
            >
              Общи условия
            </Link>
            <Link
              href="/privacy"
              className="text-parchment/80 hover:text-gold-light transition-colors"
            >
              Поверителност
            </Link>
            <Link
              href="/faq"
              className="text-parchment/80 hover:text-gold-light transition-colors"
            >
              Въпроси
            </Link>
            <Link
              href="/about"
              className="text-parchment/80 hover:text-gold-light transition-colors"
            >
              За нас
            </Link>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-gold/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-parchment/45">
          <p>© {year} Астро ОС. Всички права запазени.</p>
          <p className="tracking-wide">
            Made with <span className="text-gold">✦</span> in Bulgaria
          </p>
        </div>
      </div>
    </footer>
  );
}
