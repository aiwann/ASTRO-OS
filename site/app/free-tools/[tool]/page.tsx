import { notFound } from "next/navigation";
import FreeToolClient from "@/components/FreeToolClient";
import { TOOL_SLUGS, ToolSlug } from "@/lib/freeTools";

export function generateStaticParams() {
  return TOOL_SLUGS.map((tool) => ({ tool }));
}

const TITLES: Record<ToolSlug, string> = {
  "personal-number": "Личен Код",
  "love-percentage": "Любовен Процент",
  archetype: "Архетип Профил",
  energy: "Енергийно Отражение",
  "social-image": "Социален Образ",
};

export function generateMetadata({ params }: { params: { tool: string } }) {
  const slug = params.tool as ToolSlug;
  if (!TOOL_SLUGS.includes(slug))
    return { title: "Безплатен инструмент — Астро ОС" };
  return { title: `${TITLES[slug]} — Безплатен инструмент | Астро ОС` };
}

export default function FreeToolPage({
  params,
}: {
  params: { tool: string };
}) {
  const slug = params.tool as ToolSlug;
  if (!TOOL_SLUGS.includes(slug)) notFound();
  return <FreeToolClient tool={slug} />;
}
