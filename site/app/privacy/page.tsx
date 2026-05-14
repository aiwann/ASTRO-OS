import Link from "next/link";

export const metadata = {
  title: "Политика за поверителност — Астро Код",
};

const COMPANY = {
  name: "„Ей Ес Вижън“ ЕООД",
  eik: "208044292",
  email: "Asvision@protonmail.com",
};

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "1. Кой обработва личните ти данни",
    body: (
      <>
        Администратор на личните данни е{" "}
        <span className="text-parchment font-medium">{COMPANY.name}</span> (ЕИК{" "}
        {COMPANY.eik}). За контакт по въпроси за лични данни:{" "}
        <a
          href={`mailto:${COMPANY.email}`}
          className="text-gold-light hover:text-gold transition-colors"
        >
          {COMPANY.email}
        </a>
        .
      </>
    ),
  },
  {
    title: "2. Какви данни събираме",
    body: (
      <>
        За да предоставим услугата, обработваме следните категории лични данни:
        <ul className="mt-3 space-y-2 list-none">
          {[
            "Име и фамилия",
            "Пол",
            "Дата на раждане, час и място на раждане",
            "Имейл адрес",
            "При синастрия — същите данни и за партньора",
            "Платежна информация (обработва се директно от Stripe; ние не я съхраняваме)",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-parchment/85">
              <span className="text-gold mt-0.5">✦</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    title: "3. За какво ги използваме",
    body: (
      <>
        Личните ти данни се обработват за следните цели:
        <ul className="mt-3 space-y-2 list-none">
          {[
            "Генериране на персонализирания астрологичен анализ",
            "Доставка на готовия PDF на имейла ти",
            "Изпълнение на договорни и счетоводни задължения",
            "Комуникация при технически проблем или въпрос",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-parchment/85">
              <span className="text-gold mt-0.5">✦</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    title: "4. Основание за обработването",
    body: (
      <>
        Обработваме данните ти на основание изпълнение на договор (чл. 6, ал. 1,
        б. „б“ от GDPR) — за да ти доставим услугата. За маркетингови
        комуникации (ако приемеш) основанието е твоето съгласие (чл. 6, ал. 1,
        б. „а“).
      </>
    ),
  },
  {
    title: "5. Трети страни (получатели на данни)",
    body: (
      <>
        За да доставим услугата, ползваме следните обработващи лични данни:
        <ul className="mt-3 space-y-2 list-none">
          <li className="flex items-start gap-2 text-parchment/85">
            <span className="text-gold mt-0.5">✦</span>
            <span>
              <span className="text-parchment font-medium">Stripe Inc.</span> —
              обработка на плащания
            </span>
          </li>
          <li className="flex items-start gap-2 text-parchment/85">
            <span className="text-gold mt-0.5">✦</span>
            <span>
              <span className="text-parchment font-medium">Anthropic Inc.</span>{" "}
              — AI генериране на анализите (на база Стандартни договорни клаузи
              по GDPR за трансфер извън ЕС)
            </span>
          </li>
          <li className="flex items-start gap-2 text-parchment/85">
            <span className="text-gold mt-0.5">✦</span>
            <span>
              <span className="text-parchment font-medium">Resend</span> —
              имейл доставка
            </span>
          </li>
          <li className="flex items-start gap-2 text-parchment/85">
            <span className="text-gold mt-0.5">✦</span>
            <span>
              <span className="text-parchment font-medium">Хостинг доставчик</span>{" "}
              — съхранение и доставка на сайта
            </span>
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "6. Срок на съхранение",
    body: (
      <>
        Личните ти данни се съхраняват до изпълнение на услугата и за срока,
        необходим за изпълнение на счетоводни и данъчни задължения (10 години
        съгласно българското законодателство за счетоводните документи). След
        този срок данните се изтриват или анонимизират.
      </>
    ),
  },
  {
    title: "7. Твоите права по GDPR",
    body: (
      <>
        Като субект на данни имаш следните права:
        <ul className="mt-3 space-y-2 list-none">
          {[
            "Достъп до твоите данни",
            "Коригиране на неточни данни",
            "Изтриване („правото да бъдеш забравен“)",
            "Ограничаване на обработването",
            "Преносимост на данните",
            "Възражение срещу обработване",
            "Оттегляне на дадено съгласие по всяко време",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-parchment/85">
              <span className="text-gold mt-0.5">✦</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4">
          За да упражниш тези права, пиши на{" "}
          <a
            href={`mailto:${COMPANY.email}`}
            className="text-gold-light hover:text-gold transition-colors"
          >
            {COMPANY.email}
          </a>
          . Имаш и право да подадеш жалба до Комисията за защита на личните
          данни (КЗЛД).
        </p>
      </>
    ),
  },
  {
    title: "8. Бисквитки (cookies)",
    body: (
      <>
        Сайтът използва бисквитки за функционалност, анализ и (при изрично
        съгласие) маркетинг. При първото ти посещение ще видиш банер, чрез който
        избираш между „Само необходимите“ и „Приемам всички“. Избора ти запазваме
        в localStorage на твоето устройство.
      </>
    ),
  },
  {
    title: "9. Сигурност",
    body: (
      <>
        Предприемаме разумни технически и организационни мерки за защита на
        данните ти срещу неоторизиран достъп, загуба или промяна. Всички
        комуникации със сайта са криптирани с TLS.
      </>
    ),
  },
  {
    title: "10. Промени в политиката",
    body: (
      <>
        Запазваме си правото да актуализираме настоящата политика. Действащата
        версия е винаги тази, публикувана на сайта. Съществени промени ще бъдат
        анонсирани преди да влязат в сила.
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 animate-fade-in">
      <header className="text-center mb-12">
        <p className="text-xs tracking-[0.3em] uppercase text-gold/70 mb-3">
          Правна информация
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light leading-tight">
          <span className="gold-gradient-text">Политика за поверителност</span>
        </h1>
        <p className="mt-4 text-parchment/70 max-w-xl mx-auto">
          В съответствие с Регламент (ЕС) 2016/679 (GDPR) и Закона за защита на
          личните данни.
        </p>
      </header>

      <article className="space-y-8">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="font-serif text-xl sm:text-2xl mb-2 gold-gradient-text">
              {s.title}
            </h2>
            <div className="text-parchment/85 leading-relaxed">{s.body}</div>
          </section>
        ))}
      </article>

      <footer className="mt-14 pt-8 border-t border-gold/15 text-center text-sm text-muted">
        <p>Последна актуализация: 14 май 2026 г.</p>
        <p className="mt-4">
          <Link
            href="/terms"
            className="text-gold-light hover:text-gold transition-colors"
          >
            Общи условия →
          </Link>
        </p>
      </footer>
    </div>
  );
}
