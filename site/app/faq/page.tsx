"use client";

import Link from "next/link";
import { useState } from "react";

type FAQ = { q: string; a: string };

const FAQS: FAQ[] = [
  {
    q: "Истински астролог ли пише анализа?",
    a: "Не. Анализът се генерира от изкуствен интелект, базиран на реални астрономически изчисления (Swiss Ephemeris) и точните данни от твоето раждане. Не е шаблонен текст — всеки анализ е уникален.",
  },
  {
    q: "Какво ще получа точно?",
    a: "PDF файл от 15-20 страници с твоя персонален анализ. Изпраща се на имейла ти до 5 минути след поръчката. Можеш да го свалиш, четеш и препрочиташ когато искаш.",
  },
  {
    q: "Не знам точния час на раждането си. Мога ли да поръчам?",
    a: "Да. Без точен час някои детайли (Асцендент, Куспиди на домовете) няма да са точни, но 80% от анализа остава валиден. Препоръчваме да попиташ майка си или провериш акта за раждане за най-добър резултат.",
  },
  {
    q: "Колко време отнема да получа анализа?",
    a: "Обикновено 3-5 минути. В пиковите часове — до 15 минути. Ако не получиш имейл до 30 мин, провери папка „Спам“ или ни пиши.",
  },
  {
    q: "Сигурно ли е плащането?",
    a: "Да. Плащанията се обработват през Stripe — същата система, която използват Amazon, Google и Spotify. Данните на картата ти не минават през нашия сървър.",
  },
  {
    q: "Какво ще се случи с моите лични данни?",
    a: "Използваме данните ти (име, дата, час, място на раждане) само за генериране на анализа. Не ги продаваме, не ги споделяме. Можеш да поискаш изтриване по всяко време (GDPR).",
  },
  {
    q: "Мога ли да получа възстановяване?",
    a: "Тъй като продуктът е дигитален и се доставя веднага, възстановявания по закон не са задължителни. Но ако нещо наистина не е наред — пиши ни и ще намерим решение.",
  },
  {
    q: "С какво се различавате от безплатните хороскопи?",
    a: "Безплатните хороскопи са общи — едно нещо за 1/12 от населението. Нашите анализи използват точните ти данни и създават съдържание, което се отнася САМО за теб. Сравнението е като лекарска консултация vs медицински форум.",
  },
  {
    q: "Подходящо ли е за подарък?",
    a: "Абсолютно. Много клиенти поръчват за партньор, родител или приятел. Просто въведи техните данни на раждане при поръчка.",
  },
  {
    q: "Каква е разликата между Бързите и Дълбоките анализи?",
    a: "Бързите анализи са безплатни мини-инструменти (1-2 страници), които ти дават вкус. Дълбоките анализи са пълни 15-20 страници PDF с детайлен AI анализ — това е реалният продукт.",
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <main className="min-h-screen pt-16 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase text-gold/70 border border-gold/25 rounded-full mb-4">
            FAQ
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light mb-4">
            <span className="gold-gradient-text">Често задавани въпроси</span>
          </h1>
          <p className="text-parchment/60 text-lg max-w-xl mx-auto">
            Всичко, което трябва да знаеш — преди да направиш първата си поръчка.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`rounded-2xl border bg-card/60 backdrop-blur-sm transition-all ${
                  isOpen
                    ? "border-gold/50 shadow-[0_0_30px_rgba(212,175,55,0.08)]"
                    : "border-gold/15 hover:border-gold/30"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-start gap-4 text-left px-5 sm:px-6 py-5"
                  aria-expanded={isOpen}
                >
                  <span
                    className={`shrink-0 mt-1 font-serif text-sm transition-colors ${
                      isOpen ? "text-gold" : "text-gold/50"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`flex-1 font-serif text-lg sm:text-xl leading-snug transition-colors ${
                      isOpen ? "text-parchment" : "text-parchment/85"
                    }`}
                  >
                    {item.q}
                  </span>
                  <span
                    className={`shrink-0 mt-1 text-gold transition-transform duration-200 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                    aria-hidden
                  >
                    ✦
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pl-[3.25rem] sm:pl-[3.5rem] text-parchment/75 leading-relaxed animate-fade-in">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center rounded-2xl border border-gold/25 bg-card/50 backdrop-blur-sm p-8 sm:p-10">
          <p className="text-gold/70 text-xs tracking-[0.3em] uppercase mb-4">
            ✦ Готов ли си?
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-light mb-3">
            <span className="gold-gradient-text">Виж анализите</span>
          </h2>
          <p className="text-parchment/65 mb-7 max-w-md mx-auto">
            Започни с безплатен мини-инструмент или виж пълните анализи.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/quick-analyses"
              className="px-6 py-3 border border-gold text-gold rounded-md hover:bg-gold hover:text-dark transition-colors text-sm font-medium"
            >
              Безплатни инструменти
            </Link>
            <Link
              href="/deep-analyses"
              className="px-6 py-3 bg-gold text-dark font-semibold rounded-md hover:bg-gold-light transition-colors text-sm"
            >
              Пълните анализи →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
