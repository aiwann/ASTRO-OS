'use strict';

// ============================================================================
//  ASTRO OS — UNIFIED PRODUCT CATALOG
// ----------------------------------------------------------------------------
//  Single source of truth for every paid item in the system.
//  Frontend, Stripe, orderService, prompts and PDF generator derive from here.
//
//  WORD ↔ PAGE ↔ TOKEN math (Bulgarian text @ A4 with our PDF styling):
//    1 page  ≈ 350 words
//    1 word  ≈ 1.8 output tokens
//  → max_tokens = pages × 350 × 2.0 (safety buffer)
//
//  KINDS:
//    main      — primary product (sold on /checkout/[slug])
//    bump      — checkout add-on (small, impulse price)
//    upsell    — premium post-payment offer (/upsell)
//    downsell  — essence post-payment offer (/downsell)
// ============================================================================

const WORDS_PER_PAGE = 350;
const TOKENS_PER_WORD = 2.0;
const MIN_WORD_RATIO = 0.9; // retry if generated < 90% of target

function tokens(pages) {
  return Math.ceil(pages * WORDS_PER_PAGE * TOKENS_PER_WORD);
}
function words(pages) {
  return pages * WORDS_PER_PAGE;
}

const CATALOG = [
  // ─── MAINS (#1-#9) ────────────────────────────────────────────────────────
  {
    id: 1,
    slug: 'personal-profile',
    kind: 'main',
    title: 'Личен AI Анализ',
    subtitle: 'Пълен Профил',
    pages: 10,
    priceEur: 11.99,
    minWords: words(10),
    maxTokens: tokens(10),
    requiresPartner: false,
    promptKey: 'personalProfile',
    pdfTitle: 'ЛИЧЕН АНАЛИЗ',
  },
  {
    id: 2,
    slug: 'archetype-profile',
    kind: 'main',
    title: 'Архетип Профил',
    subtitle: 'Дълбок Личностен Анализ',
    pages: 10,
    priceEur: 17.99,
    minWords: words(10),
    maxTokens: tokens(10),
    requiresPartner: false,
    promptKey: 'archetypeProfile',
    pdfTitle: 'АРХЕТИП ПРОФИЛ',
  },
  {
    id: 3,
    slug: 'yearly-analysis',
    kind: 'main',
    title: 'Годишен Анализ 2026',
    subtitle: '2026 — Твоята Година',
    pages: 10,
    priceEur: 16.99,
    minWords: words(10),
    maxTokens: tokens(10),
    requiresPartner: false,
    promptKey: 'yearlyAnalysis',
    pdfTitle: 'ГОДИШЕН АНАЛИЗ 2026',
  },
  {
    id: 4,
    slug: 'life-map',
    kind: 'main',
    title: 'Карта на Живота',
    subtitle: 'Любов · Кариера · Развитие',
    pages: 10,
    priceEur: 18.99,
    minWords: words(10),
    maxTokens: tokens(10),
    requiresPartner: false,
    promptKey: 'lifeMap',
    pdfTitle: 'КАРТА НА ЖИВОТА',
  },
  {
    id: 5,
    slug: 'hidden-potential',
    kind: 'main',
    title: 'Скрит Потенциал',
    subtitle: 'Таланти · Блокажи · Възможности',
    pages: 10,
    priceEur: 16.99,
    minWords: words(10),
    maxTokens: tokens(10),
    requiresPartner: false,
    promptKey: 'hiddenPotential',
    pdfTitle: 'СКРИТ ПОТЕНЦИАЛ',
  },
  {
    id: 6,
    slug: 'energy-profile',
    kind: 'main',
    title: 'Енергиен Профил',
    subtitle: 'Дълбока Версия',
    pages: 10,
    priceEur: 15.99,
    minWords: words(10),
    maxTokens: tokens(10),
    requiresPartner: false,
    promptKey: 'energyProfile',
    pdfTitle: 'ЕНЕРГИЕН ПРОФИЛ',
  },
  {
    id: 7,
    slug: 'synastry',
    kind: 'main',
    title: 'Любовна Съвместимост',
    subtitle: 'Анализ на двойката',
    pages: 14,
    priceEur: 24.99,
    minWords: words(14),
    maxTokens: tokens(14),
    requiresPartner: true,
    promptKey: 'synastry',
    pdfTitle: 'ЛЮБОВНА СЪВМЕСТИМОСТ',
    excludeFromBundles: true, // can't be added via picker (needs 2-person data)
  },
  {
    id: 8,
    slug: 'ideal-partner',
    kind: 'main',
    title: 'Идеален Партньор',
    subtitle: 'Астро + Психологически Портрет',
    pages: 12,
    priceEur: 22.99,
    minWords: words(12),
    maxTokens: tokens(12),
    requiresPartner: false,
    promptKey: 'idealPartner',
    pdfTitle: 'ИДЕАЛЕН ПАРТНЬОР',
  },
  {
    id: 9,
    slug: 'full-life-code',
    kind: 'main',
    title: 'Пълен Животен Код',
    subtitle: 'Мега Анализ — Всичко в Едно',
    pages: 30,
    priceEur: 59.99,
    minWords: words(30),
    maxTokens: tokens(30), // chunked generation handled in orderService
    requiresPartner: false,
    promptKey: 'fullLifeCode',
    pdfTitle: 'ПЪЛЕН ЖИВОТЕН КОД',
    chunked: true, // generate in sections to stay under per-call token limits
    featured: true,
  },

  // ─── BUMPS (B1-B5) ────────────────────────────────────────────────────────
  {
    id: 'B1',
    slug: 'bump-question',
    kind: 'bump',
    title: 'Персонален Въпрос',
    subtitle: 'AI отговор на твой въпрос',
    pages: 1,
    priceEur: 4.99,
    minWords: words(1),
    maxTokens: tokens(1),
    requiresPartner: false,
    promptKey: 'bumpQuestion',
    pdfTitle: 'ПЕРСОНАЛЕН ВЪПРОС',
    requiresInput: 'question', // customer types question on checkout
  },
  {
    id: 'B2',
    slug: 'bump-strong-days',
    kind: 'bump',
    title: 'Силни Дни 2026',
    subtitle: 'Календар на ключовите дни',
    pages: 2,
    priceEur: 4.99,
    minWords: words(2),
    maxTokens: tokens(2),
    requiresPartner: false,
    promptKey: 'bumpStrongDays',
    pdfTitle: 'СИЛНИ ДНИ 2026',
  },
  {
    id: 'B3',
    slug: 'bump-colors-crystals',
    kind: 'bump',
    title: 'Цветове, Кристали и Числа',
    subtitle: 'Твоят персонален код',
    pages: 1,
    priceEur: 3.99,
    minWords: words(1),
    maxTokens: tokens(1),
    requiresPartner: false,
    promptKey: 'bumpColorsCrystals',
    pdfTitle: 'ЦВЕТОВЕ · КРИСТАЛИ · ЧИСЛА',
  },
  {
    id: 'B4',
    slug: 'bump-karmic-signals',
    kind: 'bump',
    title: 'Кармични Сигнали',
    subtitle: 'Следи от минал живот',
    pages: 2,
    priceEur: 5.99,
    minWords: words(2),
    maxTokens: tokens(2),
    requiresPartner: false,
    promptKey: 'bumpKarmicSignals',
    pdfTitle: 'КАРМИЧНИ СИГНАЛИ',
  },
  {
    id: 'B5',
    slug: 'bump-moon',
    kind: 'bump',
    title: 'Луна над теб',
    subtitle: 'Лунен цикъл за следващите 30 дни',
    pages: 2,
    priceEur: 4.99,
    minWords: words(2),
    maxTokens: tokens(2),
    requiresPartner: false,
    promptKey: 'bumpMoon',
    pdfTitle: 'ЛУНА НАД ТЕБ',
  },

  // ─── DOWNSELLS (D1-D3) ────────────────────────────────────────────────────
  {
    id: 'D1',
    slug: 'downsell-mini-profile',
    kind: 'downsell',
    title: 'Мини Личен Профил',
    subtitle: 'Слънце · Луна · Асцендент',
    pages: 3,
    priceEur: 7.99,
    minWords: words(3),
    maxTokens: tokens(3),
    requiresPartner: false,
    promptKey: 'downsellMiniProfile',
    pdfTitle: 'МИНИ ЛИЧЕН ПРОФИЛ',
  },
  {
    id: 'D2',
    slug: 'downsell-love-snapshot',
    kind: 'downsell',
    title: 'Любовен Snapshot',
    subtitle: 'Твоят любовен архетип',
    pages: 3,
    priceEur: 7.99,
    minWords: words(3),
    maxTokens: tokens(3),
    requiresPartner: false,
    promptKey: 'downsellLoveSnapshot',
    pdfTitle: 'ЛЮБОВЕН SNAPSHOT',
  },
  {
    id: 'D3',
    slug: 'downsell-week-energy',
    kind: 'downsell',
    title: 'Енергия за седмицата',
    subtitle: 'Следващите 7 дни',
    pages: 2,
    priceEur: 5.99,
    minWords: words(2),
    maxTokens: tokens(2),
    requiresPartner: false,
    promptKey: 'downsellWeekEnergy',
    pdfTitle: 'ЕНЕРГИЯ ЗА СЕДМИЦАТА',
  },

  // ─── UPSELLS (U3 only — U1/U2 replaced by picker auto-discount) ───────────
  {
    id: 'U3',
    slug: 'upsell-vip-code-plus',
    kind: 'upsell',
    title: 'VIP Животен Код+',
    subtitle: 'Full Code + 3 избрани bumps',
    pages: 36, // 30 (full code) + ~6 (3 bumps)
    priceEur: 64.99,
    requiresPartner: false,
    composedOf: {
      main: 'full-life-code',
      pickBumps: 3, // customer picks 3 of B1-B5
    },
    pdfTitle: 'VIP ЖИВОТЕН КОД+',
    featured: true,
  },
];

// ─── BUNDLE DISCOUNT ──────────────────────────────────────────────────────────
// Applies to MAINS only on the /upsell picker (not bumps).
const BUNDLE_DISCOUNT = {
  2: 0.10, // 2 mains → -10%
  3: 0.20, // 3+ mains → -20% (also for 4, 5, …)
};

function bundleDiscountFor(mainsCount) {
  if (mainsCount >= 3) return BUNDLE_DISCOUNT[3];
  if (mainsCount === 2) return BUNDLE_DISCOUNT[2];
  return 0;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getById(id) {
  return CATALOG.find((item) => String(item.id) === String(id));
}
function getBySlug(slug) {
  return CATALOG.find((item) => item.slug === slug);
}
function getByKind(kind) {
  return CATALOG.filter((item) => item.kind === kind);
}
function getMains() {
  return getByKind('main');
}
function getBumps() {
  return getByKind('bump');
}
function getDownsells() {
  return getByKind('downsell');
}
function getUpsells() {
  return getByKind('upsell');
}
function getBundleablePicker() {
  // Mains that can appear in upsell picker (excludes synastry)
  return getMains().filter((m) => !m.excludeFromBundles);
}

// ─── PRICE COMPUTATION FOR ARBITRARY ORDER ────────────────────────────────────
/**
 * Compute total for an order: array of item ids.
 * Applies bundle discount on MAINS when applyBundleDiscount=true (upsell picker only).
 */
function computeOrderTotal(itemIds, { applyBundleDiscount = false } = {}) {
  const items = itemIds.map(getById).filter(Boolean);
  const mains = items.filter((i) => i.kind === 'main');
  const others = items.filter((i) => i.kind !== 'main');

  const mainsSum = mains.reduce((s, m) => s + m.priceEur, 0);
  const othersSum = others.reduce((s, o) => s + o.priceEur, 0);

  const discount = applyBundleDiscount ? bundleDiscountFor(mains.length) : 0;
  const mainsAfterDiscount = mainsSum * (1 - discount);

  return {
    subtotal: +(mainsSum + othersSum).toFixed(2),
    discount: +discount.toFixed(2),
    discountAmount: +(mainsSum * discount).toFixed(2),
    total: +(mainsAfterDiscount + othersSum).toFixed(2),
    mainsCount: mains.length,
    itemsCount: items.length,
  };
}

module.exports = {
  CATALOG,
  WORDS_PER_PAGE,
  TOKENS_PER_WORD,
  MIN_WORD_RATIO,
  BUNDLE_DISCOUNT,
  bundleDiscountFor,
  getById,
  getBySlug,
  getByKind,
  getMains,
  getBumps,
  getDownsells,
  getUpsells,
  getBundleablePicker,
  computeOrderTotal,
};
