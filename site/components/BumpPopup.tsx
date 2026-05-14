"use client";

import { useEffect } from "react";

type Props = {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
};

export default function BumpPopup({ open, onAccept, onDecline }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
        onClick={onDecline}
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-gold/40 bg-card p-7 sm:p-8 shadow-[0_0_60px_rgba(212,175,55,0.25)]">
        <h2 className="font-serif text-2xl sm:text-3xl text-center">
          <span className="gold-gradient-text">✦ Преди да продължиш...</span>
        </h2>

        <p className="mt-5 text-base sm:text-lg text-parchment/90 leading-relaxed text-center">
          Искаш ли да добавиш{" "}
          <span className="text-gold-light font-semibold">
            Персонален Въпрос
          </span>{" "}
          към анализа? AI ще отговори директно на твоя въпрос в доклада.
        </p>

        <div className="mt-7 flex items-baseline justify-center gap-3">
          <span className="text-lg text-red-400/80 line-through">€12.49</span>
          <span className="font-serif text-4xl font-semibold text-emerald-400">
            €4.99
          </span>
        </div>

        <div className="mt-7 flex flex-col gap-3">
          <button
            type="button"
            onClick={onAccept}
            className="w-full px-5 py-3.5 bg-gold text-dark font-semibold rounded-md hover:bg-gold-light transition-all hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
          >
            Да, добави за €4.99
          </button>
          <button
            type="button"
            onClick={onDecline}
            className="w-full px-5 py-3 border border-gold/40 text-parchment/80 rounded-md hover:bg-gold/10 transition-colors"
          >
            Не, продължи без
          </button>
        </div>
      </div>
    </div>
  );
}
