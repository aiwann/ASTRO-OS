// ============================================================================
//  FRONTEND CATALOG — mirrors backend/catalog.js
//  Used by CheckoutClient, /upsell, /downsell to know prices, ids and metadata.
//  Keep in sync with backend/catalog.js when editing.
// ============================================================================

export type CatalogKind = "main" | "bump" | "downsell" | "upsell";

export type CatalogItem = {
  id: number | string;
  slug: string;
  kind: CatalogKind;
  title: string;
  subtitle: string;
  description?: string;
  pages: number;
  priceEur: number;
  requiresPartner?: boolean;
  excludeFromBundles?: boolean;
  requiresInput?: "question";
  featured?: boolean;
};

// ─── MAINS (#1-#9) ───────────────────────────────────────────────────────────
export const MAINS: CatalogItem[] = [
  { id: 1, slug: "personal-profile",  kind: "main", title: "Личен AI Анализ",      subtitle: "Пълен Профил",              pages: 10, priceEur: 11.99 },
  { id: 2, slug: "archetype-profile", kind: "main", title: "Архетип Профил",       subtitle: "Дълбок Личностен Анализ",   pages: 10, priceEur: 17.99 },
  { id: 3, slug: "yearly-analysis",   kind: "main", title: "Годишен Анализ 2026",  subtitle: "2026 — Твоята Година",      pages: 10, priceEur: 16.99 },
  { id: 4, slug: "life-map",          kind: "main", title: "Карта на Живота",      subtitle: "Любов · Кариера · Развитие", pages: 10, priceEur: 18.99 },
  { id: 5, slug: "hidden-potential",  kind: "main", title: "Скрит Потенциал",      subtitle: "Таланти · Блокажи · Възможности", pages: 10, priceEur: 16.99 },
  { id: 6, slug: "energy-profile",    kind: "main", title: "Енергиен Профил",      subtitle: "Дълбока Версия",            pages: 10, priceEur: 15.99 },
  { id: 7, slug: "synastry",          kind: "main", title: "Любовна Съвместимост", subtitle: "Анализ на двойката",        pages: 14, priceEur: 24.99, requiresPartner: true, excludeFromBundles: true },
  { id: 8, slug: "ideal-partner",     kind: "main", title: "Идеален Партньор",     subtitle: "Астро + Психологически Портрет", pages: 12, priceEur: 22.99 },
  { id: 9, slug: "full-life-code",    kind: "main", title: "Пълен Животен Код",    subtitle: "Мега Анализ — Всичко в Едно", pages: 30, priceEur: 59.99, featured: true },
];

// ─── BUMPS (B1-B5) ───────────────────────────────────────────────────────────
export const BUMPS: CatalogItem[] = [
  {
    id: "B1", slug: "bump-question", kind: "bump",
    title: "Персонален Въпрос",
    subtitle: "AI отговор на твой въпрос",
    description: "Задай един конкретен въпрос за теб — AI ще ти отговори директно от наталната карта.",
    pages: 1, priceEur: 4.99, requiresInput: "question",
  },
  {
    id: "B2", slug: "bump-strong-days", kind: "bump",
    title: "Силни Дни 2026",
    subtitle: "Календар на ключовите дни",
    description: "2 страници с конкретните дати през годината, в които си най-силен/а — за важни решения, разговори, начала.",
    pages: 2, priceEur: 4.99,
  },
  {
    id: "B3", slug: "bump-colors-crystals", kind: "bump",
    title: "Цветове, Кристали и Числа",
    subtitle: "Твоят персонален код",
    description: "3-те ти цвята, 3-те ти кристала и 3-те ти числа според картата — практично и приложимо.",
    pages: 1, priceEur: 3.99,
  },
  {
    id: "B4", slug: "bump-karmic-signals", kind: "bump",
    title: "Кармични Сигнали",
    subtitle: "Следи от минал живот",
    description: "Какво носиш от минал живот, какви модели се повтарят и какво трябва да освободиш.",
    pages: 2, priceEur: 5.99,
  },
  {
    id: "B5", slug: "bump-moon", kind: "bump",
    title: "Луна над теб",
    subtitle: "Лунен цикъл за следващите 30 дни",
    description: "Как лунните фази ще те засягат през следващите 30 дни — кога да започваш, кога да си почиваш.",
    pages: 2, priceEur: 4.99,
  },
];

// ─── DOWNSELLS (D1-D3) ───────────────────────────────────────────────────────
export const DOWNSELLS: CatalogItem[] = [
  { id: "D1", slug: "downsell-mini-profile", kind: "downsell", title: "Мини Личен Профил",     subtitle: "Слънце · Луна · Асцендент",       pages: 3, priceEur: 7.99,
    description: "Кратка essence версия — основните 3 стълба на личността ти." },
  { id: "D2", slug: "downsell-love-snapshot", kind: "downsell", title: "Любовен Snapshot",       subtitle: "Твоят любовен архетип",          pages: 3, priceEur: 7.99,
    description: "Кратък поглед в любовния ти архетип — как обичаш, какво привлича." },
  { id: "D3", slug: "downsell-week-energy",   kind: "downsell", title: "Енергия за седмицата",   subtitle: "Следващите 7 дни",                pages: 2, priceEur: 5.99,
    description: "Ден по ден какво те очаква през следващите 7 дни." },
];

// ─── UPSELLS (U3 — fixed bundle) ──────────────────────────────────────────────
export const UPSELLS: CatalogItem[] = [
  { id: "U3", slug: "upsell-vip-code-plus", kind: "upsell", title: "VIP Животен Код+", subtitle: "Full Code + 3 избрани bumps", pages: 36, priceEur: 64.99, featured: true,
    description: "Пълният Животен Код (30 стр) + 3 bump-а по твой избор. Всичко в един луксозен PDF." },
];

export const CATALOG: CatalogItem[] = [...MAINS, ...BUMPS, ...DOWNSELLS, ...UPSELLS];

// ─── LOOKUP HELPERS ──────────────────────────────────────────────────────────
export function getById(id: number | string): CatalogItem | undefined {
  return CATALOG.find((i) => String(i.id) === String(id));
}
export function getBySlug(slug: string): CatalogItem | undefined {
  return CATALOG.find((i) => i.slug === slug);
}
export function getBundleablePicker(): CatalogItem[] {
  // Mains for the /upsell picker: excludes synastry (requires partner data).
  return MAINS.filter((m) => !m.excludeFromBundles);
}

// ─── BUNDLE DISCOUNT (mirrors backend) ───────────────────────────────────────
export function bundleDiscountFor(mainsCount: number): number {
  if (mainsCount >= 3) return 0.2;
  if (mainsCount === 2) return 0.1;
  return 0;
}

export function computeOrderTotal(
  itemIds: Array<number | string>,
  { applyBundleDiscount = false }: { applyBundleDiscount?: boolean } = {},
) {
  const items = itemIds.map(getById).filter(Boolean) as CatalogItem[];
  const mains = items.filter((i) => i.kind === "main");
  const others = items.filter((i) => i.kind !== "main");
  const mainsSum = mains.reduce((s, m) => s + m.priceEur, 0);
  const othersSum = others.reduce((s, o) => s + o.priceEur, 0);
  const discount = applyBundleDiscount ? bundleDiscountFor(mains.length) : 0;
  const mainsAfter = mainsSum * (1 - discount);
  return {
    subtotal: round2(mainsSum + othersSum),
    discount,
    discountAmount: round2(mainsSum * discount),
    total: round2(mainsAfter + othersSum),
    mainsCount: mains.length,
    itemsCount: items.length,
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export const EUR_TO_BGN = 1.95583;
export function formatEUR(n: number) { return `€${n.toFixed(2)}`; }
export function formatBGN(n: number) { return `${(n * EUR_TO_BGN).toFixed(2)} лв`; }
