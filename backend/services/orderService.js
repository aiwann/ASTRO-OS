'use strict';

const astrologyService  = require('./astrologyService');
const numerologyService = require('./numerologyService');
const synastryService   = require('./synastryService');
const { generateText }  = require('./anthropicService');
const { mergeSectionsToPdf } = require('./pdfMerger');
const { sendAnalysisEmail } = require('./emailService');
const { geocodeLocation }   = require('../utils/geocoding');
const { cleanupFile }       = require('../utils/tempFileManager');
const { generateWithMinWords } = require('../utils/wordCount');
const { resolveItemPrompt, expandOrderItems } = require('./promptResolver');
const { MASTER_SYSTEM_PROMPT } = require('../prompts/systemPrompt');
const { getById, getBySlug }   = require('../catalog');

const LOG_PREFIX = '[OrderService]';

// Hard cap on per-call max_tokens. Claude's practical extended-output limit.
const PER_CALL_TOKEN_CAP = 16000;

// ─── BACKWARD-COMPAT SHIM ─────────────────────────────────────────────────────
// Legacy callers used { productType, customerData, email, addOns }.
// New callers use   { itemIds, customerData, email }.
// This function normalizes both into a single itemIds[] array.
function normalizeOrder(input) {
  if (Array.isArray(input.itemIds) && input.itemIds.length > 0) {
    return { itemIds: input.itemIds, customerData: input.customerData, email: input.email };
  }
  // Legacy: build itemIds from productType (slug) + addOns (slugs)
  const ids = [];
  if (input.productType) {
    const main = getBySlug(input.productType);
    if (main) ids.push(main.id);
    else ids.push(input.productType); // pass-through, will fail validation downstream with clear msg
  }
  for (const addOn of input.addOns || []) {
    const item = getBySlug(addOn);
    ids.push(item ? item.id : addOn);
  }
  return { itemIds: ids, customerData: input.customerData, email: input.email };
}

function validateOrder({ itemIds, customerData, email }) {
  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    throw new Error('processOrder: itemIds is empty');
  }
  if (!customerData) throw new Error('processOrder: customerData missing');
  if (!email) throw new Error('processOrder: email missing');

  const { name, birthDate, birthPlace } = customerData;
  if (!name || !birthDate || !birthPlace) {
    throw new Error('processOrder: customerData missing name/birthDate/birthPlace');
  }

  // Synastry requires partner data
  if (itemIds.some((id) => getById(id)?.requiresPartner)) {
    const { name2, birthDate2, birthPlace2 } = customerData;
    if (!name2 || !birthDate2 || !birthPlace2) {
      throw new Error('processOrder: synastry item present but partner data (name2/birthDate2/birthPlace2) missing');
    }
  }

  for (const id of itemIds) {
    const item = getById(id);
    if (!item) throw new Error(`processOrder: unknown catalog id "${id}"`);
  }
}

// ─── MAIN ENTRY POINT ─────────────────────────────────────────────────────────
/**
 * Process a successful payment.
 * Generates each item in parallel, merges into one PDF, sends one email.
 *
 * @param {object} input
 *   - itemIds: Array<number|string> (preferred) — catalog ids
 *   - productType + addOns                       (legacy, auto-normalized)
 *   - customerData: { name, birthDate, birthTime, birthPlace, gender, question?, name2?, ... }
 *   - email: string
 */
async function processOrder(input) {
  const { itemIds: rawIds, customerData, email } = normalizeOrder(input);
  validateOrder({ itemIds: rawIds, customerData, email });

  // Expand upsell bundles (U3 → main + chosen bumps)
  const itemIds = expandOrderItems(rawIds, customerData);

  console.log(`${LOG_PREFIX} Order for ${email} — ${itemIds.length} item(s): ${itemIds.join(', ')}`);

  // Build shared astrology context (geo + natal + numerology) ONCE
  const shared = await buildSharedContext(customerData);

  // Generate each item in parallel
  const generated = await Promise.allSettled(
    itemIds.map((id) => generateItemContent(id, customerData, shared))
  );

  // Collect successes — preserve order
  const sections = [];
  const failures = [];
  generated.forEach((result, idx) => {
    const id = itemIds[idx];
    if (result.status === 'fulfilled' && result.value?.content) {
      sections.push({ itemId: id, content: result.value.content });
    } else {
      const err = result.reason || new Error('unknown error');
      console.error(`${LOG_PREFIX} Item ${id} FAILED:`, err.message);
      failures.push({ itemId: id, error: err.message });
    }
  });

  if (sections.length === 0) {
    throw new Error(`processOrder: all ${itemIds.length} items failed to generate`);
  }

  // Pick the right "report owner" data — for synastry-only orders use combined name
  const isSynastryOnly = itemIds.length === 1 && getById(itemIds[0])?.slug === 'synastry';
  const userDataForPdf = isSynastryOnly ? buildSynastryUserData(customerData) : customerData;
  const natalForPdf    = shared.natal;
  const numerologyForPdf = shared.numerology;

  // Merge into ONE PDF
  let pdfResult = null;
  try {
    pdfResult = await mergeSectionsToPdf({
      items: sections,
      userData: userDataForPdf,
      natal: natalForPdf,
      numerology: numerologyForPdf,
    });

    const titles = sections
      .map(({ itemId }) => getById(itemId)?.pdfTitle || getById(itemId)?.title)
      .filter(Boolean);
    const emailTitle = sections.length === 1
      ? titles[0]
      : `Твоят анализ (${sections.length} раздела)`;

    await sendAnalysisEmail({
      to: email,
      customerName: customerData.name,
      productTitle: emailTitle,
      pdfPath: pdfResult.filepath,
    });

    console.log(`${LOG_PREFIX} Order completed → ${email} (${sections.length} sections, ${failures.length} failed)`);
    if (failures.length) {
      console.warn(`${LOG_PREFIX} Failures will need manual retry: ${failures.map((f) => f.itemId).join(', ')}`);
    }

    return { success: true, sections: sections.length, failures };
  } finally {
    if (pdfResult?.filepath) cleanupFile(pdfResult.filepath);
  }
}

// ─── SHARED CONTEXT (computed once per order) ─────────────────────────────────
async function buildSharedContext(customerData) {
  const { name, birthDate, birthTime = '', birthPlace } = customerData;
  const geo = await geocodeLocation(birthPlace);
  const natal = astrologyService.calculate(birthDate, birthTime, geo.lat, geo.lon);
  const numerology = numerologyService.analyze(name, birthDate);
  return { geo, natal, numerology };
}

function buildDataForPrompts(customerData, shared) {
  return {
    user: {
      name: customerData.name,
      gender: customerData.gender || '',
      birthDate: customerData.birthDate,
      birthTime: customerData.birthTime || '',
      birthPlace: customerData.birthPlace,
      question: customerData.question || '',
    },
    geo: shared.geo,
    natal: shared.natal,
    numerology: shared.numerology,
  };
}

// ─── PER-ITEM GENERATION ──────────────────────────────────────────────────────
async function generateItemContent(itemId, customerData, shared) {
  const item = getById(itemId);
  if (!item) throw new Error(`generateItemContent: unknown id ${itemId}`);

  // Synastry has a dedicated flow (uses synastryService + cross-aspects)
  if (item.slug === 'synastry') {
    return generateSynastryContent(customerData);
  }

  // All other items → unified resolver
  const data = buildDataForPrompts(customerData, shared);
  const { system, prompt, maxTokens, minWords } = resolveItemPrompt(itemId, data);

  const cappedMax = Math.min(maxTokens, PER_CALL_TOKEN_CAP);

  const result = await generateWithMinWords({
    system,
    prompt,
    maxTokens: cappedMax,
    minWords,
    label: `${itemId}/${item.slug}`,
  });

  return { content: result.text, wordCount: result.wordCount, retried: result.retried };
}

// ─── SYNASTRY (special flow — 2-person cross-aspects) ────────────────────────
async function generateSynastryContent(customerData) {
  const { name, birthDate, birthTime = '', birthPlace,
          name2, birthDate2, birthTime2 = '', birthPlace2 } = customerData;

  console.log(`${LOG_PREFIX} Synastry: ${name} × ${name2}`);

  const synResult = await synastryService.analyze({
    name1: name, birthDate1: birthDate, birthTime1: birthTime, birthPlace1: birthPlace,
    name2,        birthDate2,           birthTime2,           birthPlace2,
  });

  const prompt = buildSynastryPrompt(synResult, customerData.question);
  const synastryItem = getBySlug('synastry');

  const result = await generateWithMinWords({
    system: MASTER_SYSTEM_PROMPT,
    prompt,
    maxTokens: Math.min(synastryItem.maxTokens, PER_CALL_TOKEN_CAP),
    minWords: synastryItem.minWords,
    label: 'synastry',
  });

  return { content: result.text, wordCount: result.wordCount, retried: result.retried };
}

function buildSynastryUserData(customerData) {
  return {
    name: `${customerData.name}  ✦  ${customerData.name2}`,
    gender: customerData.gender,
    birthDate: customerData.birthDate,
    birthPlace: `${customerData.birthPlace}  ·  ${customerData.birthPlace2}`,
  };
}

function buildSynastryPrompt(synastryResult, question) {
  const { person1, person2, crossAspects, compatibilityScore, compatibility } = synastryResult;

  const topAspects = (crossAspects || []).slice(0, 15)
    .map((a) => `${a.body1} (${person1.name}) ${a.symbol} ${a.body2} (${person2.name}) — ${a.aspect}, ${a.orb}° (${a.nature})`)
    .join('\n');

  let prompt = `СИНАСТРИЯ — Любовна Съвместимост

ПЪРВИ ЧОВЕК:
${person1.name} · ${person1.birthDate}${person1.birthTime ? ' · ' + person1.birthTime : ''} · ${person1.birthPlace}

ВТОРИ ЧОВЕК:
${person2.name} · ${person2.birthDate}${person2.birthTime ? ' · ' + person2.birthTime : ''} · ${person2.birthPlace}

ОЦЕНКА НА СЪВМЕСТИМОСТТА: ${compatibilityScore}/100 — ${compatibility?.label || ''}
${compatibility?.description || ''}

ОСНОВНИ КРЪСТОСАНИ АСПЕКТИ:
${topAspects || 'няма значими аспекти'}

Напиши задълбочен синастричен анализ за връзката между ${person1.name} и ${person2.name}.
Целева дължина: 14 страници (минимум 4900 думи).

Структура (всеки раздел — поне 2-3 параграфа):

1. ОБЩА КАРТИНА НА ВРЪЗКАТА (3 параграфа)
2. ЕМОЦИОНАЛНА СЪВМЕСТИМОСТ (3 параграфа)
3. ФИЗИЧЕСКО И СТРАСТНО ПРИТЕГЛЯНЕ (3 параграфа)
4. УМСТВЕНА И КОМУНИКАЦИОННА СЪВМЕСТИМОСТ (3 параграфа)
5. КАРМИЧНАТА ВРЪЗКА (2 параграфа) — каква роля играят един за друг отвъд този живот
6. ПРЕДИЗВИКАТЕЛСТВАТА (3 параграфа)
7. КАК ВРЪЗКАТА СЕ РАЗВИВА ВЪВ ВРЕМЕТО (2 параграфа) — какво променя времето между тях
8. ДЪЛГОСРОЧЕН ПОТЕНЦИАЛ (2 параграфа)
9. ПОСЛАНИЕ ЗА ДВАМАТА (1 параграф — максимум 100 думи)

Психологически точен, честен, без захаросване. Минимум 4900 думи. Течен текст, без bullet points.`;

  if (question) {
    prompt += `

ДОПЪЛНИТЕЛНО — ЛИЧЕН ВЪПРОС: "${question}"
Преди финалното послание добави раздел "ОТГОВОР НА ТВОЯ ВЪПРОС" (2 параграфа).`;
  }

  return prompt;
}

module.exports = { processOrder };
