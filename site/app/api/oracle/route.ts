import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM = `Ти си мистичен AI оракул, вграден в астрологична система.
Потребителят задава въпрос. Твоята задача:
- Отговори на БЪЛГАРСКИ с точно 2-3 изречения
- Бъди интригуващ, поетичен, загадъчен — като астрологичен пророчески фрагмент
- Не давай конкретни дати или имена
- Намекни, че пълният отговор е в персоналния анализ
- Никога не започвай с "Аз" или "Като AI"
- Използвай метафори от звездите, планетите, стихиите
Отговорът трябва да е кратък hook — 2-3 изречения само.`;

export async function POST(req: NextRequest) {
  const { question } = await req.json().catch(() => ({ question: "" }));

  if (!question || question.trim().length < 3) {
    return NextResponse.json({ error: "Въведи въпрос" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "API ключът не е конфигуриран" },
      { status: 500 },
    );
  }

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      system: SYSTEM,
      messages: [{ role: "user", content: question.trim() }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ answer: text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Грешка";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
