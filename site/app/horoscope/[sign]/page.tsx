import { notFound } from "next/navigation";
import Link from "next/link";
import Anthropic from "@anthropic-ai/sdk";

export const revalidate = 86400; // regenerate once per day

const SIGNS: Record<string, { name: string; symbol: string; dates: string; element: string; ruler: string }> = {
  aries:       { name: "Овен",      symbol: "♈", dates: "21 март – 19 април",          element: "Огън",  ruler: "Марс" },
  taurus:      { name: "Телец",     symbol: "♉", dates: "20 април – 20 май",            element: "Земя",  ruler: "Венера" },
  gemini:      { name: "Близнаци",  symbol: "♊", dates: "21 май – 20 юни",              element: "Въздух", ruler: "Меркурий" },
  cancer:      { name: "Рак",       symbol: "♋", dates: "21 юни – 22 юли",              element: "Вода",  ruler: "Луната" },
  leo:         { name: "Лъв",       symbol: "♌", dates: "23 юли – 22 август",           element: "Огън",  ruler: "Слънцето" },
  virgo:       { name: "Дева",      symbol: "♍", dates: "23 август – 22 септември",     element: "Земя",  ruler: "Меркурий" },
  libra:       { name: "Везни",     symbol: "♎", dates: "23 септември – 22 октомври",   element: "Въздух", ruler: "Венера" },
  scorpio:     { name: "Скорпион",  symbol: "♏", dates: "23 октомври – 21 ноември",     element: "Вода",  ruler: "Плутон" },
  sagittarius: { name: "Стрелец",   symbol: "♐", dates: "22 ноември – 21 декември",     element: "Огън",  ruler: "Юпитер" },
  capricorn:   { name: "Козирог",   symbol: "♑", dates: "22 декември – 19 януари",      element: "Земя",  ruler: "Сатурн" },
  aquarius:    { name: "Водолей",   symbol: "♒", dates: "20 януари – 18 февруари",       element: "Въздух", ruler: "Уран" },
  pisces:      { name: "Риби",      symbol: "♓", dates: "19 февруари – 20 март",         element: "Вода",  ruler: "Нептун" },
};

const SIGN_SLUGS = Object.keys(SIGNS);

export function generateStaticParams() {
  return SIGN_SLUGS.map((sign) => ({ sign }));
}

function getWeekRange(): { label: string; monday: Date; sunday: Date } {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon...
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) =>
    d.toLocaleDateString("bg-BG", { day: "numeric", month: "long" });

  return { label: `${fmt(monday)} – ${fmt(sunday)}`, monday, sunday };
}

async function generateHoroscope(signName: string, weekLabel: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return "Хороскопът не е наличен в момента. Моля, опитайте по-късно.";
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 800,
    system: `Ти си опитен астролог, пишещ седмични хороскопи на БЪЛГАРСКИ. Стилът е поетичен, дълбок, но практичен. Никога не използвай общи клишета. Пиши конкретно и с усещане за реалност.`,
    messages: [
      {
        role: "user",
        content: `Напиши седмичен хороскоп за ${signName} за седмицата ${weekLabel}.

Структура (използвай точно тези заглавия):
**Общ преглед**
[2-3 изречения за общата енергия на седмицата]

**Любов и Взаимоотношения**
[2-3 изречения]

**Кариера и Финанси**
[2-3 изречения]

**Здраве и Енергия**
[1-2 изречения]

**Съвет на седмицата**
[1 кратко, запомнящо се изречение]

Пиши само на български. Без встъпление или заключение извън структурата.`,
      },
    ],
  });

  return message.content[0].type === "text" ? message.content[0].text : "";
}

function parseHoroscope(raw: string) {
  const sections: { title: string; body: string }[] = [];
  const lines = raw.split("\n");
  let current: { title: string; body: string } | null = null;

  for (const line of lines) {
    const heading = line.match(/^\*\*(.+?)\*\*/);
    if (heading) {
      if (current) sections.push(current);
      current = { title: heading[1], body: "" };
    } else if (current && line.trim()) {
      current.body += (current.body ? " " : "") + line.trim();
    }
  }
  if (current) sections.push(current);
  return sections;
}

const SECTION_ICONS: Record<string, string> = {
  "Общ преглед": "✦",
  "Любов и Взаимоотношения": "♡",
  "Кариера и Финанси": "◈",
  "Здраве и Енергия": "◎",
  "Съвет на седмицата": "★",
};

export default async function HoroscopePage({
  params,
}: {
  params: { sign: string };
}) {
  const signData = SIGNS[params.sign];
  if (!signData) notFound();

  const week = getWeekRange();
  const raw = await generateHoroscope(signData.name, week.label);
  const sections = parseHoroscope(raw);

  return (
    <main className="min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Back */}
        <Link
          href="/#zodiac"
          className="inline-flex items-center gap-2 text-sm text-parchment/50 hover:text-gold transition-colors mb-10"
        >
          ← Всички зодии
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-7xl mb-4 text-gold/80">{signData.symbol}</div>
          <h1 className="font-serif text-4xl sm:text-5xl font-light mb-2">
            <span className="gold-gradient-text">{signData.name}</span>
          </h1>
          <p className="text-parchment/45 text-sm mb-1">{signData.dates}</p>
          <p className="text-parchment/35 text-xs tracking-wider">
            Стихия: {signData.element} · Владетел: {signData.ruler}
          </p>

          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/25 bg-gold/5 text-gold/70 text-xs tracking-widest uppercase">
            ✦ Седмица {week.label}
          </div>
        </div>

        {/* Horoscope sections */}
        {sections.length > 0 ? (
          <div className="space-y-5">
            {sections.map((s, i) => (
              <div
                key={i}
                className={`rounded-2xl border p-6 ${
                  s.title === "Съвет на седмицата"
                    ? "border-gold/40 bg-gold/5"
                    : "border-gold/15 bg-card/60 backdrop-blur-sm"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-gold text-lg">
                    {SECTION_ICONS[s.title] ?? "✦"}
                  </span>
                  <h2 className="font-serif text-base text-gold/90">
                    {s.title}
                  </h2>
                </div>
                <p
                  className={`leading-relaxed ${
                    s.title === "Съвет на седмицата"
                      ? "text-parchment/90 font-medium italic text-base"
                      : "text-parchment/75 text-sm"
                  }`}
                >
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-parchment/50 py-12">{raw}</p>
        )}

        {/* CTA */}
        <div className="mt-14 rounded-2xl border border-gold/25 bg-card/50 p-8 text-center">
          <p className="text-parchment/50 text-sm mb-2">
            Искаш по-задълбочен личен анализ?
          </p>
          <h3 className="font-serif text-xl text-parchment mb-5">
            Персонален AI Анализ на твоята{" "}
            <span className="gold-gradient-text">натална карта</span>
          </h3>
          <Link
            href="/products/personal-profile"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-dark font-semibold rounded-md hover:bg-gold-light transition-colors"
          >
            Разгледай анализите →
          </Link>
        </div>

        {/* Other signs */}
        <div className="mt-12">
          <p className="text-xs tracking-[0.25em] uppercase text-gold/40 text-center mb-5">
            Другите зодии
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {SIGN_SLUGS.filter((s) => s !== params.sign).map((s) => (
              <Link
                key={s}
                href={`/horoscope/${s}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/15 text-parchment/55 text-xs hover:border-gold/40 hover:text-gold-light transition-colors"
              >
                <span>{SIGNS[s].symbol}</span>
                <span>{SIGNS[s].name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
