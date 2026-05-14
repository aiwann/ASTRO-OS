import Link from "next/link";

export const metadata = {
  title: "Какво е Астро ОС — Технология и Точност",
  description:
    "Астро ОС е модерна AI система за персонални анализи, базирана на 7 независими научни и психологически източника. Без езотерика — само точност, дълбочина и приложимост.",
};

type Source = {
  emoji: string;
  title: string;
  subtitle: string;
  body: string;
};

const SOURCES: Source[] = [
  {
    emoji: "🪐",
    title: "Swiss Ephemeris",
    subtitle: "Швейцарска ефемерида",
    body:
      "Прецизни планетарни позиции до секунда дъга, базирани на JPL DE431 модела на NASA. Същата база данни, използвана в професионалните астрологични програми по света. Без приближения и без шаблони.",
  },
  {
    emoji: "🏠",
    title: "Placidus Houses",
    subtitle: "Система на домовете",
    body:
      "12-те астрологични дома се пресмятат по системата на Placidus — стандартът в съвременната западна астрология. Изисква точна дата, час и географски координати, за да даде валиден натален отпечатък.",
  },
  {
    emoji: "☌",
    title: "Planetary Aspects",
    subtitle: "Аспекти и Орби",
    body:
      "Анализ на всички мажорни и минорни аспекти — конюнкции, опозиции, тригони, квадрати, секстили, квинтили — с прецизни орби според стандартите на Hellenistic и съвременната астрология.",
  },
  {
    emoji: "♾",
    title: "Nodal Analysis",
    subtitle: "Кармични възли и Хирон",
    body:
      "Северен и Южен лунен възел, заедно с Хирон, определят централната ос на жизнения опит — еволюционните задачи и моделите, които личността носи от опит на опит.",
  },
  {
    emoji: "🔢",
    title: "Numerology",
    subtitle: "Питагорейска нумерология",
    body:
      "Три независими числа: Жизнен Път, Изразително Число и Число на Съдбата. Изчисляват се от дата на раждане и име по проверени математически алгоритми, не по интуиция.",
  },
  {
    emoji: "🧠",
    title: "Claude AI",
    subtitle: "Голям езиков модел",
    body:
      "Anthropic Claude Sonnet 4.6 синтезира данните от шестте по-горе слоя в единен персонален разказ. Не пише шаблони — генерира уникален текст на база твоите конкретни данни.",
  },
  {
    emoji: "🎭",
    title: "Jungian Psychology",
    subtitle: "Архетипи на Юнг",
    body:
      "Картографиране на архетипните сили — Сянка, Анима/Анимус, Аз и Persona — върху наталната карта. Дава психологически (не езотеричен) език за описание на личността.",
  },
];

type Advantage = {
  emoji: string;
  title: string;
  body: string;
};

const ADVANTAGES: Advantage[] = [
  {
    emoji: "🎯",
    title: "Точност",
    body:
      "Реални изчисления, не шаблонни параграфи. Всеки анализ е изграден от точните позиции на планетите ти, а не от общи описания на зодии.",
  },
  {
    emoji: "🌊",
    title: "Дълбочина",
    body:
      "7 независими източника, които се пресичат и валидират един друг. Когато астрологията, нумерологията и юнгианската психология показват едно и също — посланието е реално.",
  },
  {
    emoji: "🧭",
    title: "Приложимост",
    body:
      "Не „вселената те зове за велики неща“. Конкретни модели на поведение, силни страни, блокажи, и точни препоръки — за работа, връзки, решения.",
  },
  {
    emoji: "⚡",
    title: "Скорост",
    body:
      "Това, което класически астролог пише в 3 дни, AI системата генерира за минути. Без редици от чакащи клиенти, без компромиси върху качеството.",
  },
  {
    emoji: "💎",
    title: "Модернизъм",
    body:
      "Психологически тон, не езотеричен. Без „звездите искат от теб“. Без „духовни цели“. Само структурирана интерпретация, която стои редом с книгите на Юнг и Кембъл.",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 animate-fade-in">
      <header className="text-center mb-14">
        <p className="text-xs tracking-[0.3em] uppercase text-gold/70 mb-3">
          Технология
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light leading-tight">
          <span className="gold-gradient-text">Какво е Астро ОС</span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-parchment/75 max-w-2xl mx-auto leading-relaxed">
          Астро ОС не е приложение &bdquo;за зодии&ldquo;. Това е операционна система за
          персонален анализ — комбинация от 7 независими научни и психологически
          модела, синтезирани от AI в един кохерентен профил.
        </p>
      </header>

      {/* 7 sources */}
      <section className="mb-20">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-gold/60 mb-3">
            Архитектура
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light">
            <span className="gold-gradient-text">7 независими източника</span>
          </h2>
          <p className="mt-3 text-sm text-parchment/60 max-w-xl mx-auto">
            Всеки слой работи самостоятелно. Анализът е силен там, където
            източниците се пресичат.
          </p>
        </div>

        <div className="space-y-4">
          {SOURCES.map((s, i) => (
            <article
              key={s.title}
              className="rounded-2xl border border-gold/20 bg-card/50 backdrop-blur-sm p-6 hover:border-gold/40 transition-all"
            >
              <div className="flex items-start gap-5">
                <div className="text-3xl shrink-0">{s.emoji}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <h3 className="font-serif text-xl font-medium text-parchment">
                      {s.title}
                    </h3>
                    <span className="text-xs tracking-wider uppercase text-gold/60">
                      {s.subtitle}
                    </span>
                    <span className="ml-auto text-xs text-muted">
                      0{i + 1}/07
                    </span>
                  </div>
                  <p className="mt-3 text-sm sm:text-base text-parchment/75 leading-relaxed">
                    {s.body}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Why best */}
      <section className="mb-20">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-gold/60 mb-3">
            Защо най-добрият
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light">
            <span className="gold-gradient-text">5 практически предимства</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {ADVANTAGES.map((a) => (
            <div
              key={a.title}
              className="rounded-2xl border border-gold/25 bg-card/60 backdrop-blur-sm p-6"
            >
              <div className="text-3xl mb-3">{a.emoji}</div>
              <h3 className="font-serif text-xl font-medium text-parchment mb-2">
                {a.title}
              </h3>
              <p className="text-sm text-parchment/75 leading-relaxed">
                {a.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Tone clarification */}
      <section className="mb-20 rounded-2xl border border-gold/30 bg-card/70 backdrop-blur-sm p-7 sm:p-10">
        <p className="text-xs tracking-[0.3em] uppercase text-gold/60 mb-3 text-center">
          Подходът
        </p>
        <h2 className="font-serif text-2xl sm:text-3xl text-center font-light mb-6">
          <span className="gold-gradient-text">Психологически, не езотеричен</span>
        </h2>
        <div className="space-y-4 text-parchment/80 leading-relaxed">
          <p>
            Анализите не казват какво &bdquo;вселената иска от теб&ldquo;. Не предсказват
            бъдеще. Не говорят за &bdquo;кармично наказание&ldquo; или &bdquo;духовни уроци&ldquo; в
            мистичен смисъл.
          </p>
          <p>
            Това, което правят: вземат твоите конкретни данни (време, място,
            име), пресмятат прецизно астрологичните и нумерологичните параметри,
            и ги превеждат на езика на съвременната психология — архетипи на
            Юнг, поведенчески модели, силни страни и слепи петна.
          </p>
          <p>
            Резултатът е инструмент за самопознание със същата структура като
            професионален психологически профил, но изграден на основа, която
            традиционната психология игнорира.
          </p>
        </div>
      </section>

      {/* CTA */}
      <div className="text-center">
        <h2 className="font-serif text-2xl sm:text-3xl font-light mb-4">
          <span className="gold-gradient-text">
            Готов ли си да видиш своя профил?
          </span>
        </h2>
        <p className="text-parchment/70 mb-8 max-w-lg mx-auto">
          Започни с Личния AI Анализ — 900+ думи, готов на имейла ти в минути.
        </p>
        <Link
          href="/products/personal-profile"
          className="inline-flex items-center gap-2 px-10 py-4 bg-gold text-dark font-semibold text-lg rounded-md hover:bg-gold-light transition-all hover:shadow-[0_0_40px_rgba(212,175,55,0.45)] group"
        >
          Получи анализа си
          <span className="group-hover:translate-x-1 transition-transform">
            →
          </span>
        </Link>
        <p className="mt-4 text-xs text-muted tracking-wider uppercase">
          ✦ Дигитална услуга • Доставка незабавно ✦
        </p>
      </div>
    </div>
  );
}
