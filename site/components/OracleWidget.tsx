"use client";

import Link from "next/link";
import { useRef, useState } from "react";

export default function OracleWidget() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const q = question.trim();
    if (!q || loading) return;

    setLoading(true);
    setAnswer("");
    setError("");

    try {
      const res = await fetch("/api/oracle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (data.error) {
        setError("Оракулът не може да отговори в момента.");
      } else {
        setAnswer(data.answer);
      }
    } catch {
      setError("Оракулът не може да отговори в момента.");
    } finally {
      setLoading(false);
    }
  }

  const checkoutHref = `/products/personal-profile?question=${encodeURIComponent(question)}`;

  return (
    <div className="rounded-2xl border border-gold/25 bg-card/70 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gold/10">
        <p className="text-xs tracking-[0.3em] uppercase text-gold/60 mb-1">
          ✦ Задай Въпрос на Оракула
        </p>
        <p className="text-parchment/50 text-sm">
          Получи мигновен отговор от AI — и пълния анализ след това
        </p>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-6 py-4">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Задай своя въпрос..."
            className="flex-1 bg-dark/60 border border-gold/20 rounded-lg px-4 py-3 text-parchment placeholder-parchment/30 text-sm focus:outline-none focus:border-gold/50 transition-colors"
            maxLength={200}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="px-4 py-3 bg-gold text-dark rounded-lg font-semibold text-sm hover:bg-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-dark/40 border-t-dark rounded-full animate-spin" />
            ) : (
              "→"
            )}
          </button>
        </div>
      </form>

      {/* Answer */}
      {(answer || error) && (
        <div className="px-6 pb-6 space-y-4 animate-fade-in">
          <div className="rounded-xl border border-gold/15 bg-dark/40 p-4">
            {error ? (
              <p className="text-parchment/50 text-sm italic">{error}</p>
            ) : (
              <p className="text-parchment/85 text-sm leading-relaxed">
                {answer}
              </p>
            )}
          </div>

          {answer && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gold/10" />
                <span className="text-gold/40 text-xs">🔒 пълен отговор</span>
                <div className="flex-1 h-px bg-gold/10" />
              </div>
              <Link
                href={checkoutHref}
                className="group flex items-center justify-center gap-2 w-full py-3.5 bg-gold text-dark font-semibold rounded-lg hover:bg-gold-light transition-all hover:shadow-[0_0_25px_rgba(212,175,55,0.35)] text-sm"
              >
                Получи Пълния Отговор
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
