'use strict';

const { MASTER_SYSTEM_PROMPT } = require('./systemPrompt');

// ─── helpers ────────────────────────────────────────────────────────────────

function reduceNum(n, keepMaster = true) {
  while (n > 9) {
    if (keepMaster && (n === 11 || n === 22 || n === 33)) return n;
    n = String(n).split('').map(Number).reduce((a, b) => a + b, 0);
  }
  return n;
}

function personalYearNumber(birthDate, year) {
  const parts = birthDate.split(/[-\/\.]/).map(Number);
  const [, month, day] = parts;
  const yearSum = String(year).split('').map(Number).reduce((a, b) => a + b, 0);
  return reduceNum(day + month + yearSum);
}

function buildBase(data) {
  const { user } = data;
  const today = new Date();
  const birthYear = parseInt((user.birthDate || '').split('-')[0]);
  const age = birthYear ? today.getFullYear() - birthYear : null;
  const todayStr = today.toISOString().slice(0, 10);
  const questionLine = user.question ? `\nЛичен въпрос от клиента: "${user.question}"` : '';
  return `Днешна дата: ${todayStr}
Доклад за: ${user.name} (${user.gender === 'male' ? 'Мъж' : user.gender === 'female' ? 'Жена' : 'Небинарен'}${age ? `, ${age} години` : ''})
Роден/а: ${user.birthDate}${user.birthTime ? ', ' + user.birthTime : ''}, ${user.birthPlace}${questionLine}`;
}

function buildFullNatalContext(data) {
  const { natal, numerology: n } = data;
  const topAspects = (natal.aspects || []).slice(0, 8)
    .map(a => `${a.planet1} ${a.symbol} ${a.planet2} (${a.aspect}, ${parseFloat(a.orb || 0).toFixed(1)}°)`)
    .join('\n');

  return `${buildBase(data)}

НАТАЛНА КАРТА:
Слънце: ${natal.sun?.sign?.name} (${natal.sun?.degree}), Дом ${natal.sun?.house}
Луна: ${natal.moon?.sign?.name} (${natal.moon?.degree}), Дом ${natal.moon?.house}
Асцендент: ${natal.ascendant?.sign?.name} (${natal.ascendant?.degree})
Медиум Чели: ${natal.midheaven?.sign?.name}
Меркурий: ${natal.planets?.Mercury?.sign?.name}, Дом ${natal.planets?.Mercury?.house}
Венера: ${natal.planets?.Venus?.sign?.name}, Дом ${natal.planets?.Venus?.house}
Марс: ${natal.planets?.Mars?.sign?.name}, Дом ${natal.planets?.Mars?.house}
Юпитер: ${natal.planets?.Jupiter?.sign?.name}, Дом ${natal.planets?.Jupiter?.house}
Сатурн: ${natal.planets?.Saturn?.sign?.name}, Дом ${natal.planets?.Saturn?.house}
Уран: ${natal.planets?.Uranus?.sign?.name}, Дом ${natal.planets?.Uranus?.house}
Нептун: ${natal.planets?.Neptune?.sign?.name}, Дом ${natal.planets?.Neptune?.house}
Северен Възел: ${natal.northNode?.sign?.name}, Дом ${natal.northNode?.house}
Лилит: ${natal.lilith?.sign?.name}, Дом ${natal.lilith?.house}
Хирон: ${natal.chiron?.sign?.name}, Дом ${natal.chiron?.house}
Доминантен елемент: ${natal.dominantElement} · ${natal.dominantQuality}
Доминантни планети: ${(natal.dominantPlanets || []).join(', ')}
Ретроградни: ${(natal.retrogrades || []).join(', ') || 'няма'}

КЛЮЧОВИ АСПЕКТИ:
${topAspects || 'няма'}

НУМЕРОЛОГИЯ:
Жизнен път: ${n.lifePath} (${n.meanings?.lifePath?.name || ''})
Съдба: ${n.destiny} (${n.meanings?.destiny?.name || ''})
Душа: ${n.soulUrge} (${n.meanings?.soulUrge?.name || ''})
Личност: ${n.personality}
Ден на раждане: ${n.birthday}
Хармонично: ${n.harmonic?.primary || n.angel?.primary}
Кармични уроци: ${(n.karmic || []).length ? n.karmic.join(', ') : 'няма'}${n.angelSequence ? `
Ангелска последователност: ${n.angelSequence.sequence} — ${n.angelSequence.meaning}` : ''}`;
}

// ─── product prompts ─────────────────────────────────────────────────────────

// Шаблонни блокове за инструкциите по продукт. Изнесени отделно, за да може
// fullLifeCode да ги композира без дублиране на текст.

function personalProfileBody(data) {
  return `Ти си дълбок астрологичен анализатор. Създай пълен персонален профил за ${data.user.name}.

1. КОЙ СИ ТИ (4 параграфа)
— Слънчевия знак: централна идентичност, начин на изразяване, как се проявява в ежедневието
— Лунния знак: вътрешен емоционален свят, инстинкти, какво кара ${data.user.name} да се чувства в безопасност
— Асцендента: маската пред света, първо впечатление, как другите го/я възприемат
— Хирон: дълбоката рана от детството и скритият дар който произтича от нея

2. ТВОЯТА СИЛА И ТВОЯТ БЛОКАЖ (3 параграфа)
— Трите най-силни природни качества на тази карта
— Трите основни блокажа и несъзнателни саботажни модели
— Как конкретно да превърне блокажите в сила

3. ТВОЯТА МИСИЯ (2 параграфа)
— Северен Възел: накъде е насочена душата в този живот
— Жизнен път + Съдба: каква е комбинацията и какво казва за призванието

4. ПОСЛАНИЕ (1 параграф — максимум 80 думи)
— Директно, топло, поетично послание към ${data.user.name}

Психологически дълбок, личен, без езотерични клишета. Течен текст, без bullet points. Минимум 900 думи.`;
}

function yearlyAnalysisBody(data, currentYear, pyNum) {
  return `Ти си астрологичен анализатор на жизнени цикли. Създай пълна прогноза за ${currentYear} за ${data.user.name}.
Personal Year Number: ${pyNum}.

1. ОБЩАТА ЕНЕРГИЯ НА ${currentYear} (2 параграфа)
— Какво е Personal Year Number ${pyNum} и какво означава на мета ниво
— Доминиращата тема на годината

2. ЛЮБОВ И ВЗАИМООТНОШЕНИЯ (2 параграфа)
— Любовният живот през ${currentYear}
— Кога да действа активно и кога да изчаква

3. КАРИЕРА И ФИНАНСИ (2 параграфа)
— Кариерните възможности и рискове
— Финансовите цикли: пикове и рискови периоди

4. ЛИЧНО РАЗВИТИЕ И ЕНЕРГИЙНИ ЦИКЛИ (2 параграфа)
— Кои месеци са с висока енергия и кои изискват почивка
— Главният духовен урок на ${currentYear}

5. КЛЮЧОВИ ПЕРИОДИ (1 параграф)
— Три конкретни периода с кратко описание

6. ГЛАВЕН СЪВЕТ (1 параграф — максимум 60 думи)

Конкретен, практичен, насърчаващ. Без вагуни предсказания. Минимум 750 думи.`;
}

function archetypeProfileBody(data) {
  return `Ти си психологически астрологичен профилър. Определи архетипа на ${data.user.name} и го анализирай задълбочено.

1. ТВОЯТ АРХЕТИП (1 параграф)
— Назови архетипа директно: „Ти си [АРХЕТИП]"
— Обясни защо точно тази карта води до този архетип

2. КАК МИСЛИШ И ВЗИМАШ РЕШЕНИЯ (2 параграфа)
— Мисловният процес: логика vs интуиция, бързо vs бавно мислене
— Как взима решения под натиск и типичните грешки в преценката

3. ПОВЕДЕНЧЕСКИ МОДЕЛИ (2 параграфа)
— Повтарящите се поведенчески модели — особено тези които може да не осъзнава
— Реакция при конфликт, стрес и несигурност

4. ЕМОЦИОНАЛНИТЕ МОДЕЛИ (2 параграфа)
— Как обработва емоциите: изразява, потиска или рационализира
— Несъзнателните емоционални нужди

5. АРХЕТИПЪТ В ДЕЙСТВИЕ (2 параграфа)
— Как се проявява в работата, взаимоотношенията и ежедневието
— Тъмната страна на архетипа: кога силата се превръща в слабост

6. ЕВОЛЮЦИЯ НА АРХЕТИПА (1 параграф)
— Как да развие архетипа до най-висшата му проява

Психологически точен, директен, без комплименти. Минимум 850 думи.`;
}

function lifeMapBody(data) {
  return `Ти си астрологичен картограф на живота. Създай пълна Карта на Живота за ${data.user.name}.

1. ЛЮБОВТА В КАРТАТА НА ЖИВОТА (2 параграфа)
— Любовният архетип: как обича, как се защитава, какво търси
— Кармичните любовни уроци преди да намери истинска дълбока връзка

2. РАБОТАТА И ПРИЗВАНИЕТО (2 параграфа)
— Каква кариера е записана в тази карта — конкретни области
— Финансовият потенциал и природните таланти за генериране на приходи

3. ЛИЧНОТО РАЗВИТИЕ И УРОЦИТЕ (2 параграфа)
— Трите главни жизнени урока на тази карта
— Saturn Return: кога е и какво означава

4. КЛЮЧОВИТЕ ПЕРИОДИ В ЖИВОТА (2 параграфа)
— Кои възрасти са ключови за трансформация
— Какво да очаква след 35-40 годишна възраст

5. СКРИТОТО ПОСЛАНИЕ НА КАРТАТА (1 параграф)
— Нещо уникално което дефинира целия живот на ${data.user.name}

Дълбок, честен, с дългосрочна перспектива. Конкретен — без „може би". Минимум 800 думи.`;
}

function hiddenPotentialBody(data) {
  return `Ти си анализатор на скрит потенциал. Открий какво ${data.user.name} не използва от себе си.

1. СКРИТИТЕ ТАЛАНТИ (2 параграфа)
— Кои таланти са записани в картата но не се използват пълноценно и защо
— Как конкретно може да ги активира — практични стъпки

2. БЛОКАЖИТЕ (2 параграфа)
— Кои позиции създават несъзнателен самосаботаж
— Ретроградните планети: какви вътрешни блокажи носят

3. КАРМИЧНИТЕ УРОЦИ (1 параграф)
— Липсващите числа от 1 до 9: какво трябва да се развие в този живот

4. НЕИЗПОЛЗВАНИЯТ ПОТЕНЦИАЛ (2 параграфа)
— Северен Възел + Soul Urge: разликата между това което прави сега и това което душата иска
— Хирон: как раната е най-голямата сила ако се обработи правилно

5. ПЛАНЪТ ЗА АКТИВИРАНЕ (2 параграфа)
— Три конкретни области за отключване на потенциал в следващите 12 месеца
— Едно главно действие което би променило всичко

Директен, провокиращ мислене, без захаросване. Минимум 750 думи.`;
}

function energyProfileBody(data) {
  return `Ти си анализатор на жизнена енергия. Създай пълен Енергиен Профил за ${data.user.name}.
Доминантният елемент е ${data.natal.dominantElement} (${data.natal.dominantQuality}).

1. ТВОЯТА ОСНОВНА ЕНЕРГИЯ (2 параграфа)
— Какво означава ${data.natal.dominantElement} в ежедневието, взаимоотношенията и мисленето
— Как се проявява ${data.natal.dominantQuality} в начина на действие и реакция

2. ЕНЕРГИЙНИТЕ РИТМИ (2 параграфа)
— Кога е в пик: най-продуктивен, фокусиран, пълен с енергия
— Кога енергията пада и как да се регенерира правилно за този тип

3. ЕНЕРГИЯТА В ВЗАИМООТНОШЕНИЯТА (2 параграфа)
— Как енергийният тип се среща с другите елементи: с кого резонира и с кого се изтощава
— Какво дава и взима от близките хора енергийно

4. БЛОКАЖИ НА ЕНЕРГИЯТА (2 параграфа)
— Марс и Сатурн: главните енергийни блокажи
— Как несъзнателно изтича енергията си

5. СЪВЕТ ЗА ЕНЕРГИЙНО УПРАВЛЕНИЕ (1 параграф)
— Три конкретни практики за поддържане на висока енергия

Практичен, конкретен, приложим. Минимум 700 думи.`;
}

function idealPartnerBody(data) {
  return `Ти си астрологичен анализатор на взаимоотношения. Опиши идеалния партньор за ${data.user.name}.

1. КАКВОТО ${data.user.name.toUpperCase()} ТЪРСИ (но може да не осъзнава) (2 параграфа)
— Венера: какъв тип любов и партньор привлича съзнателно
— Луна: какво търси несъзнателно за да се чувства в безопасност

2. КАКВОТО РЕАЛНО ПРИВЛИЧА (1 параграф)
— Марс + Лилит: истинската физическа и страстна привлекателност

3. ИДЕАЛНИЯТ ПАРТНЬОР (2 параграфа)
— Конкретен профил: характер, начин на мислене, емоционален тип, ценности
— Кои знаци или елементи са най-съвместими и защо

4. ЧЕРВЕНИТЕ ФЛАГОВЕ (1 параграф)
— Какъв тип партньор е привлекателен но вреден: кармичният „капан"

Директен, интересен, малко провокативен. Максимум 400 думи.`;
}

const PRODUCT_PROMPTS = {

  personalProfile: (data) => ({
    system: MASTER_SYSTEM_PROMPT,
    prompt: `${buildFullNatalContext(data)}

${personalProfileBody(data)}`,
  }),

  yearlyAnalysis: (data) => {
    const currentYear = new Date().getFullYear();
    const pyNum = personalYearNumber(data.user.birthDate, currentYear);
    return {
      system: MASTER_SYSTEM_PROMPT,
      prompt: `${buildFullNatalContext(data)}

${yearlyAnalysisBody(data, currentYear, pyNum)}`,
    };
  },

  archetypeProfile: (data) => ({
    system: MASTER_SYSTEM_PROMPT,
    prompt: `${buildFullNatalContext(data)}

${archetypeProfileBody(data)}`,
  }),

  lifeMap: (data) => ({
    system: MASTER_SYSTEM_PROMPT,
    prompt: `${buildFullNatalContext(data)}

${lifeMapBody(data)}`,
  }),

  hiddenPotential: (data) => ({
    system: MASTER_SYSTEM_PROMPT,
    prompt: `${buildFullNatalContext(data)}

${hiddenPotentialBody(data)}`,
  }),

  energyProfile: (data) => ({
    system: MASTER_SYSTEM_PROMPT,
    prompt: `${buildFullNatalContext(data)}

${energyProfileBody(data)}`,
  }),

  idealPartner: (data) => ({
    system: MASTER_SYSTEM_PROMPT,
    prompt: `${buildFullNatalContext(data)}

${idealPartnerBody(data)}`,
  }),

  fullLifeCode: (data) => {
    const currentYear = new Date().getFullYear();
    const pyNum = personalYearNumber(data.user.birthDate, currentYear);
    return {
      system: MASTER_SYSTEM_PROMPT,
      prompt: `${buildFullNatalContext(data)}

Това е пълният мега анализ за ${data.user.name}. Генерирай 8 раздела в ред:

═══════════════════════════════════════
РАЗДЕЛ 1 — ПЪЛЕН ЛИЧЕН ПРОФИЛ
═══════════════════════════════════════
${personalProfileBody(data)}

═══════════════════════════════════════
РАЗДЕЛ 2 — АРХЕТИП И ПОВЕДЕНЧЕСКИ МОДЕЛИ
═══════════════════════════════════════
${archetypeProfileBody(data)}

═══════════════════════════════════════
РАЗДЕЛ 3 — КАРТА НА ЖИВОТА
═══════════════════════════════════════
${lifeMapBody(data)}

═══════════════════════════════════════
РАЗДЕЛ 4 — СКРИТ ПОТЕНЦИАЛ
═══════════════════════════════════════
${hiddenPotentialBody(data)}

═══════════════════════════════════════
РАЗДЕЛ 5 — ЕНЕРГИЕН ПРОФИЛ
═══════════════════════════════════════
${energyProfileBody(data)}

═══════════════════════════════════════
РАЗДЕЛ 6 — ГОДИШЕН АНАЛИЗ
═══════════════════════════════════════
${yearlyAnalysisBody(data, currentYear, pyNum)}

═══════════════════════════════════════
РАЗДЕЛ 7 — ИДЕАЛЕН ПАРТНЬОР
═══════════════════════════════════════
${idealPartnerBody(data)}

═══════════════════════════════════════
РАЗДЕЛ 8 — ПОСЛАНИЕ ОТ ЗВЕЗДИТЕ
═══════════════════════════════════════
Финално послание — 100 думи максимум, поетично, директно към сърцето на ${data.user.name}.

Всяка секция е пълна и завършена. Общо минимум 3500 думи.`,
    };
  },
};

module.exports = { PRODUCT_PROMPTS };
