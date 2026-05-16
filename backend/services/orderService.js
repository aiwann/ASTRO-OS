'use strict';

const astrologyService  = require('./astrologyService');
const numerologyService = require('./numerologyService');
const synastryService   = require('./synastryService');
const { generateText }  = require('./anthropicService');
const ExportService     = require('./exportService');
const { sendAnalysisEmail } = require('./emailService');
const { geocodeLocation }   = require('../utils/geocoding');
const { cleanupFile }       = require('../utils/tempFileManager');
const { PRODUCT_PROMPTS }   = require('../prompts/productPrompts');
const { MASTER_SYSTEM_PROMPT } = require('../prompts/systemPrompt');

const LOG_PREFIX = '[OrderService]';

// productType (kebab-case) → PRODUCT_PROMPTS key (camelCase)
const PRODUCT_KEY_MAP = {
  'personal-profile':  'personalProfile',
  'yearly-analysis':   'yearlyAnalysis',
  'archetype-profile': 'archetypeProfile',
  'life-map':          'lifeMap',
  'hidden-potential':  'hiddenPotential',
  'energy-profile':    'energyProfile',
  'ideal-partner':     'idealPartner',
  'full-life-code':    'fullLifeCode',
};

const MAX_TOKENS = {
  'personal-profile':  4000,
  'yearly-analysis':   4000,
  'archetype-profile': 4000,
  'life-map':          4000,
  'hidden-potential':  4000,
  'energy-profile':    4000,
  'ideal-partner':     2000,
  'full-life-code':    16000,
  'synastry':          6000,
};

function validateCommon({ productType, customerData, email }) {
  if (!productType) throw new Error('Липсва productType');
  if (!customerData) throw new Error('Липсва customerData');
  if (!email) throw new Error('Липсва email');

  const { name, birthDate, birthPlace } = customerData;
  if (!name || !birthDate || !birthPlace) {
    throw new Error('Липсват задължителни полета на customerData: name, birthDate, birthPlace');
  }

  if (productType === 'synastry') {
    const { name2, birthDate2, birthPlace2 } = customerData;
    if (!name2 || !birthDate2 || !birthPlace2) {
      throw new Error('За синастрия са задължителни: name2, birthDate2, birthPlace2');
    }
  } else if (!PRODUCT_KEY_MAP[productType]) {
    throw new Error(`Неизвестен productType: ${productType}`);
  }
}

/**
 * Главният flow след успешно плащане:
 * астрология → AI анализ → PDF → email → cleanup.
 */
async function processOrder({ productType, customerData, email, addOns = [] }) {
  validateCommon({ productType, customerData, email });

  console.log(`${LOG_PREFIX} Order: ${productType} for ${email}`);

  let pdfResult = null;
  try {
    pdfResult = productType === 'synastry'
      ? await runSynastryFlow(customerData)
      : await runStandardFlow(productType, customerData);

    const productTitle = ExportService.PRODUCT_TITLES[productType] || 'Астрологичен Анализ';

    await sendAnalysisEmail({
      to: email,
      customerName: customerData.name,
      productTitle,
      pdfPath: pdfResult.filepath,
    });

    console.log(`${LOG_PREFIX} Order completed: ${productType} → ${email}`);
  } finally {
    if (pdfResult?.filepath) {
      cleanupFile(pdfResult.filepath);
    }
  }

  // Process add-on products (e.g. ideal-partner bump)
  for (const addOn of addOns) {
    if (!PRODUCT_KEY_MAP[addOn]) {
      console.warn(`${LOG_PREFIX} Unknown addOn: ${addOn}, skipping`);
      continue;
    }
    let addOnPdf = null;
    try {
      console.log(`${LOG_PREFIX} Processing addOn: ${addOn} for ${email}`);
      addOnPdf = await runStandardFlow(addOn, customerData);
      const addOnTitle = ExportService.PRODUCT_TITLES[addOn] || addOn;
      await sendAnalysisEmail({
        to: email,
        customerName: customerData.name,
        productTitle: addOnTitle,
        pdfPath: addOnPdf.filepath,
      });
      console.log(`${LOG_PREFIX} AddOn completed: ${addOn} → ${email}`);
    } catch (err) {
      console.error(`${LOG_PREFIX} AddOn ${addOn} failed:`, err.message);
    } finally {
      if (addOnPdf?.filepath) cleanupFile(addOnPdf.filepath);
    }
  }

  return { success: true, message: 'Анализът е изпратен на имейла' };
}

// ─── Standard flow (всички продукти без синастрия) ──────────────────────────

async function runStandardFlow(productType, customerData) {
  const { name, gender = '', birthDate, birthTime = '', birthPlace, question = '' } = customerData;

  const geo = await geocodeLocation(birthPlace);
  const natal = astrologyService.calculate(birthDate, birthTime, geo.lat, geo.lon);
  const numerology = numerologyService.analyze(name, birthDate);

  const data = {
    user: { name, gender, birthDate, birthTime, birthPlace, question },
    geo, natal, numerology,
  };

  const promptKey = PRODUCT_KEY_MAP[productType];
  const { system, prompt } = PRODUCT_PROMPTS[promptKey](data);

  // Append personal question section if customer purchased the question bump
  const finalPrompt = question
    ? `${prompt}

ДОПЪЛНИТЕЛНО — ЛИЧЕН ВЪПРОС ОТ КЛИЕНТА:
"${question}"

Преди финалното послание добави отделен раздел "ОТГОВОР НА ТВОЯ ВЪПРОС" (2 параграфа):
— Отговори директно, конкретно, базирайки се изключително на наталната карта и нумерологията по-горе
— Без общи приказки — астрологично обосновано, честно
— Свържи отговора с темите от основния анализ`
    : prompt;

  console.log(`${LOG_PREFIX} Generating AI analysis (${productType}${question ? ' + question' : ''})...`);
  const analysisText = await generateText(system, finalPrompt, { maxTokens: MAX_TOKENS[productType] });

  console.log(`${LOG_PREFIX} Generating PDF (${productType})...`);
  return ExportService.generateProductPDF(productType, customerData, analysisText, natal, numerology);
}

// ─── Synastry flow ──────────────────────────────────────────────────────────

async function runSynastryFlow(customerData) {
  const { name, gender = '', birthDate, birthTime = '', birthPlace,
          name2, birthDate2, birthTime2 = '', birthPlace2 } = customerData;

  console.log(`${LOG_PREFIX} Synastry: ${name} × ${name2}`);

  const result = await synastryService.analyze({
    name1: name, birthDate1: birthDate, birthTime1: birthTime, birthPlace1: birthPlace,
    name2,        birthDate2,           birthTime2,           birthPlace2,
  });

  let synastryPrompt = buildSynastryPrompt(result);
  if (customerData.question) {
    synastryPrompt += `

ДОПЪЛНИТЕЛНО — ЛИЧЕН ВЪПРОС ОТ КЛИЕНТА:
"${customerData.question}"

Преди финалното послание добави раздел "ОТГОВОР НА ТВОЯ ВЪПРОС" (2 параграфа) — конкретно, базирайки се на синастричния анализ по-горе.`;
  }

  console.log(`${LOG_PREFIX} Generating synastry AI analysis${customerData.question ? ' + question' : ''}...`);
  const analysisText = await generateText(MASTER_SYSTEM_PROMPT, synastryPrompt, {
    maxTokens: MAX_TOKENS.synastry,
  });

  // За PDF: използваме chart1 като натална карта (на поръчителя) и комбинирано име.
  const combinedUserData = {
    name: `${name}  ✦  ${name2}`,
    gender,
    birthDate,
    birthPlace: `${birthPlace}  ·  ${birthPlace2}`,
  };

  console.log(`${LOG_PREFIX} Generating synastry PDF...`);
  return ExportService.generateProductPDF('synastry', combinedUserData, analysisText, result.chart1, null);
}

function buildSynastryPrompt(synastryResult) {
  const { person1, person2, crossAspects, compatibilityScore, compatibility } = synastryResult;

  const topAspects = (crossAspects || []).slice(0, 15)
    .map(a => `${a.body1} (${person1.name}) ${a.symbol} ${a.body2} (${person2.name}) — ${a.aspect}, ${a.orb}° (${a.nature})`)
    .join('\n');

  return `СИНАСТРИЯ — Любовна Съвместимост

ПЪРВИ ЧОВЕК:
${person1.name} · ${person1.birthDate}${person1.birthTime ? ' · ' + person1.birthTime : ''} · ${person1.birthPlace}

ВТОРИ ЧОВЕК:
${person2.name} · ${person2.birthDate}${person2.birthTime ? ' · ' + person2.birthTime : ''} · ${person2.birthPlace}

ОЦЕНКА НА СЪВМЕСТИМОСТТА: ${compatibilityScore}/100 — ${compatibility?.label || ''}
${compatibility?.description || ''}

ОСНОВНИ КРЪСТОСАНИ АСПЕКТИ:
${topAspects || 'няма значими аспекти'}

Напиши задълбочен синастричен анализ за връзката между ${person1.name} и ${person2.name}.

Структура (всеки раздел — поне 2 параграфа):

1. ОБЩА КАРТИНА НА ВРЪЗКАТА (2 параграфа)
— Каква е енергията между тях на пръв поглед
— Какво ги привлича един към друг на дълбоко ниво

2. ЕМОЦИОНАЛНА СЪВМЕСТИМОСТ (2 параграфа)
— Как Луните им се срещат: разбират ли се емоционално, чувстват ли се в безопасност
— Какви емоционални модели ще се повтарят между тях

3. ФИЗИЧЕСКО И СТРАСТНО ПРИТЕГЛЯНЕ (2 параграфа)
— Венера и Марс във взаимодействие — каква химия имат
— Колко лесно или трудно се поддържа страстта дългосрочно

4. УМСТВЕНА И КОМУНИКАЦИОННА СЪВМЕСТИМОСТ (2 параграфа)
— Как разговарят, мислят заедно, решават проблеми
— Кое е лесно и кое предизвиква фрикции в общуването

5. ПРЕДИЗВИКАТЕЛСТВАТА (2 параграфа)
— Кои аспекти създават напрежение и защо
— Как могат да превърнат тези точки в растеж, а не в конфликт

6. ДЪЛГОСРОЧЕН ПОТЕНЦИАЛ (1 параграф)
— Какво трябва да се случи, за да издържи връзката години напред

7. ПОСЛАНИЕ ЗА ДВАМАТА (1 параграф — максимум 80 думи)
— Топло, директно послание към ${person1.name} и ${person2.name}

Психологически точен, честен, без захаросване. Минимум 1200 думи. Течен текст, без bullet points.`;
}

module.exports = { processOrder };
