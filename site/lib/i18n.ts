export type Language = "bg" | "en";

export const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "bg", label: "БГ", flag: "🇧🇬" },
  { code: "en", label: "EN", flag: "🇬🇧" },
];

const dictionaries = {
  bg: {
    // Navigation
    "nav.quickAnalyses": "Бързи Анализи",
    "nav.deepAnalyses": "Задълбочени Анализи",
    "nav.startNow": "Започни сега →",
    "nav.openMenu": "Отвори меню",
    "nav.closeMenu": "Затвори меню",
    "nav.about": "Какво е Астро ОС",
    "nav.faq": "Въпроси",

    // Free tool names (used in nav)
    "tool.personal-number": "Личен Код",
    "tool.love-percentage": "Любовен Процент",
    "tool.archetype": "Архетип Профил",
    "tool.energy": "Енергийно Отражение",
    "tool.social-image": "Социален Образ",

    // Product names (used in nav)
    "product.personal-profile": "Личен AI Анализ",
    "product.synastry": "Любовна Съвместимост",
    "product.yearly-analysis": "Годишен Анализ",
    "product.archetype-profile": "Архетип Профил",
    "product.life-map": "Карта на Живота",
    "product.hidden-potential": "Скрит Потенциал",
    "product.energy-profile": "Енергиен Профил",
    "product.full-life-code": "Пълен Животен Код",

    // Home — hero
    "home.badge": "✦ СЛЕДВАЩО ПОКОЛЕНИЕ AI АСТРОЛОГИЯ",
    "home.title": "Анализ, който знае повече за теб от теб",
    "home.subtitle1":
      "AI генерира 15+ страници персонален астрологичен анализ на база точните ти данни.",
    "home.subtitle2": "Готов на имейла ти за 5 минути.",
    "home.cta.viewAnalyses": "Виж безплатния си архетип",
    "home.cta.viewDeep": "Виж пълните анализи",
    "home.cta.freeTool": "Безплатен инструмент",

    // Home — how it works
    "home.tech.kicker": "Технология",
    "home.tech.title": "Как работи системата",
    "home.tech.card1.title": "Швейцарска Ефемерида",
    "home.tech.card1.body":
      "Точни планетарни позиции до секунда дъга чрез Swiss Ephemeris — същата база, използвана от професионални астролози.",
    "home.tech.card2.title": "Placidus Домове",
    "home.tech.card2.body":
      "Пресмятане на 12-те астрологични дома по системата Placidus с точен час и географски координати.",
    "home.tech.card3.title": "Аспекти и Орби",
    "home.tech.card3.body":
      "Анализ на всички мажорни и минорни аспекти — конюнкции, опозиции, тригони, квадрати, секстили и повече.",
    "home.tech.card4.title": "Нумерология",
    "home.tech.card4.body":
      "Жизнен път, изразително число и число на съдбата — три нумерологични слоя, вплетени в астрологичния профил.",
    "home.tech.card5.title": "Кармична Астрология",
    "home.tech.card5.body":
      "Лунни възли, Хирон и кармични аспекти разкриват уроците и мисията на душата ти в този живот.",
    "home.tech.card6.title": "Юнгиански Архетипи",
    "home.tech.card6.body":
      "Картографиране на архетипните сили от психологията на Юнг — сянка, анима/анимус, Аз и Persona.",
    "home.tech.card7.title": "Ангелски Числа",
    "home.tech.card7.body":
      "Синхронизация на нумерологичните модели с езотеричната традиция за по-дълбоко лично послание.",
    "home.tech.result.prefix": "Резултатът:",
    "home.tech.result.highlight": "анализ с дълбочина на часова консултация",
    "home.tech.result.suffix": "— готов за минути.",

    // Home — advantages
    "home.why.kicker": "Предимства",
    "home.why.title": "Защо Астро ОС",
    "home.why.fast.title": "Бързо",
    "home.why.fast.body":
      "Пълен персонален анализ, готов за минути след поръчката — доставен директно на имейла ти.",
    "home.why.accurate.title": "Точно",
    "home.why.accurate.body":
      "Реални астрологични изчисления, не шаблонни текстове. Всеки анализ е уникален за твоята натална карта.",
    "home.why.affordable.title": "Достъпно",
    "home.why.affordable.body":
      "Дълбочина на часова консултация с астролог — на цена под €20. Без скрити такси, без абонамент.",
    "home.cta.startNow": "Започни сега",
    "home.cta.deliveryNote": "✦ Доставка на имейл в рамките на минути ✦",

    // Checkout
    "checkout.kicker": "Checkout",
    "checkout.yourData": "ТВОИТЕ ДАННИ",
    "checkout.partnerData": "ДАННИ НА ПАРТНЬОРА",
    "checkout.fullName": "Пълно Име",
    "checkout.fullName.placeholder": "Иван Петров",
    "checkout.gender": "Пол",
    "checkout.gender.male": "Мъж",
    "checkout.gender.female": "Жена",
    "checkout.birthDate": "Дата на раждане",
    "checkout.birthDate.placeholder": "DD/MM/YYYY",
    "checkout.birthDate.error": "❌ Невалидна дата — провери ден, месец и година",
    "checkout.birthTime": "Час на раждане",
    "checkout.birthTime.placeholder": "HH:MM",
    "checkout.birthTime.error": "❌ Невалиден час — 00:00 до 23:59",
    "checkout.birthPlace": "Място на раждане",
    "checkout.birthPlace.placeholder": "София, България",
    "checkout.timezone.label": "🕐 Часова зона:",
    "checkout.email": "Email адрес",
    "checkout.email.placeholder": "ime@example.com",
    "checkout.email.error": "❌ Моля въведи валиден имейл адрес",
    "checkout.addons": "Препоръчани допълнения",
    "checkout.bump.question.title": "Персонален Въпрос",
    "checkout.bump.question.desc":
      "Задай конкретен въпрос — AI отговаря директно в доклада.",
    "checkout.bump.partner.title": "Идеален Партньор",
    "checkout.bump.partner.desc": "Кратък профил на идеалния за теб партньор.",
    "checkout.question.label": "Твоят въпрос",
    "checkout.question.helperWarn":
      "⚠️ Въпросът трябва да е свързан с теб лично.",
    "checkout.question.helperValid": "✅ Валиден пример:",
    "checkout.question.helperValidEx": "„Зададено ли ми е да бъда богат?“",
    "checkout.question.helperInvalid": "❌ Невалиден:",
    "checkout.question.helperInvalidEx":
      "„Кога ще стана богат?“ (предсказания не са възможни)",
    "checkout.question.placeholder": "Напр. „Зададено ли ми е да бъда богат?“",
    "checkout.question.minChars": "⚠️ Минимум {min} символа ({current}/{min})",
    "checkout.terms.accept": "Приемам всички",
    "checkout.terms.linkTerms": "условия",
    "checkout.terms.and": "и",
    "checkout.terms.linkPrivacy": "политика за поверителност",
    "checkout.submit": "Плати сигурно",
    "checkout.submitting": "Обработваме...",
    "checkout.order": "Поръчка",
    "checkout.total": "ОБЩО",
    "checkout.trust.secure": "🔒 Сигурно плащане",
    "checkout.trust.email": "📧 PDF на имейла",
    "checkout.trust.fast": "⚡ Готово в минути",

    // BumpPopup
    "bump.title": "✦ Преди да продължиш...",
    "bump.body.prefix": "Искаш ли да добавиш",
    "bump.body.product": "Персонален Въпрос",
    "bump.body.suffix":
      "към анализа? AI ще отговори директно на твоя въпрос в доклада.",
    "bump.accept": "Да, добави за €4.99",
    "bump.decline": "Не, продължи без",
  },

  en: {
    // Navigation
    "nav.quickAnalyses": "Quick Analyses",
    "nav.deepAnalyses": "Deep Analyses",
    "nav.startNow": "Start Now →",
    "nav.openMenu": "Open menu",
    "nav.closeMenu": "Close menu",
    "nav.about": "What is Astro OS",
    "nav.faq": "FAQ",

    // Free tool names
    "tool.personal-number": "Personal Number",
    "tool.love-percentage": "Love Percentage",
    "tool.archetype": "Archetype Profile",
    "tool.energy": "Energy Reflection",
    "tool.social-image": "Social Image",

    // Product names
    "product.personal-profile": "Personal AI Analysis",
    "product.synastry": "Love Compatibility",
    "product.yearly-analysis": "Yearly Analysis",
    "product.archetype-profile": "Archetype Profile",
    "product.life-map": "Life Map",
    "product.hidden-potential": "Hidden Potential",
    "product.energy-profile": "Energy Profile",
    "product.full-life-code": "Full Life Code",

    // Home — hero
    "home.badge": "✦ Next-generation AI astrology",
    "home.title": "ASTRO OS",
    "home.subtitle1":
      "Built to be among the most advanced AI systems for personal analysis.",
    "home.subtitle2":
      "No waiting, no confusion, no unnecessary costs — for the first time, fast doesn't mean low quality.",
    "home.cta.viewAnalyses": "Explore analyses",
    "home.cta.viewDeep": "See full analyses",
    "home.cta.freeTool": "Free tool",

    // Home — how it works
    "home.tech.kicker": "Technology",
    "home.tech.title": "How the system works",
    "home.tech.card1.title": "Swiss Ephemeris",
    "home.tech.card1.body":
      "Precise planetary positions to the arc second via Swiss Ephemeris — the same database used by professional astrologers.",
    "home.tech.card2.title": "Placidus Houses",
    "home.tech.card2.body":
      "Calculation of the 12 astrological houses using the Placidus system with exact time and geographic coordinates.",
    "home.tech.card3.title": "Aspects & Orbs",
    "home.tech.card3.body":
      "Analysis of all major and minor aspects — conjunctions, oppositions, trines, squares, sextiles and more.",
    "home.tech.card4.title": "Numerology",
    "home.tech.card4.body":
      "Life path, expression and destiny numbers — three numerological layers woven into the astrological profile.",
    "home.tech.card5.title": "Karmic Astrology",
    "home.tech.card5.body":
      "Lunar nodes, Chiron and karmic aspects reveal your soul's lessons and mission in this lifetime.",
    "home.tech.card6.title": "Jungian Archetypes",
    "home.tech.card6.body":
      "Mapping of archetypal forces from Jungian psychology — Shadow, Anima/Animus, Self and Persona.",
    "home.tech.card7.title": "Angel Numbers",
    "home.tech.card7.body":
      "Synchronization of numerological patterns with the esoteric tradition for a deeper personal message.",
    "home.tech.result.prefix": "The result:",
    "home.tech.result.highlight": "analysis with the depth of an hour-long consultation",
    "home.tech.result.suffix": "— ready in minutes.",

    // Home — advantages
    "home.why.kicker": "Advantages",
    "home.why.title": "Why Astro OS",
    "home.why.fast.title": "Fast",
    "home.why.fast.body":
      "A complete personal analysis ready in minutes after ordering — delivered directly to your email.",
    "home.why.accurate.title": "Accurate",
    "home.why.accurate.body":
      "Real astrological calculations, not template text. Each analysis is unique to your natal chart.",
    "home.why.affordable.title": "Affordable",
    "home.why.affordable.body":
      "The depth of an hour-long astrologer consultation — for under €20. No hidden fees, no subscription.",
    "home.cta.startNow": "Start now",
    "home.cta.deliveryNote": "✦ Email delivery within minutes ✦",

    // Checkout
    "checkout.kicker": "Checkout",
    "checkout.yourData": "YOUR DATA",
    "checkout.partnerData": "PARTNER'S DATA",
    "checkout.fullName": "Full Name",
    "checkout.fullName.placeholder": "Ivan Petrov",
    "checkout.gender": "Gender",
    "checkout.gender.male": "Male",
    "checkout.gender.female": "Female",
    "checkout.birthDate": "Date of birth",
    "checkout.birthDate.placeholder": "DD/MM/YYYY",
    "checkout.birthDate.error": "❌ Invalid date — check day, month and year",
    "checkout.birthTime": "Time of birth",
    "checkout.birthTime.placeholder": "HH:MM",
    "checkout.birthTime.error": "❌ Invalid time — 00:00 to 23:59",
    "checkout.birthPlace": "Place of birth",
    "checkout.birthPlace.placeholder": "Sofia, Bulgaria",
    "checkout.timezone.label": "🕐 Timezone:",
    "checkout.email": "Email address",
    "checkout.email.placeholder": "name@example.com",
    "checkout.email.error": "❌ Please enter a valid email address",
    "checkout.addons": "Recommended add-ons",
    "checkout.bump.question.title": "Personal Question",
    "checkout.bump.question.desc":
      "Ask a specific question — AI will answer directly in the report.",
    "checkout.bump.partner.title": "Ideal Partner",
    "checkout.bump.partner.desc": "A short profile of your ideal partner.",
    "checkout.question.label": "Your question",
    "checkout.question.helperWarn":
      "⚠️ The question must be related to you personally.",
    "checkout.question.helperValid": "✅ Valid example:",
    "checkout.question.helperValidEx": "“Am I destined to be wealthy?”",
    "checkout.question.helperInvalid": "❌ Invalid:",
    "checkout.question.helperInvalidEx":
      "“When will I become wealthy?” (predictions are not possible)",
    "checkout.question.placeholder": "E.g. “Am I destined to be wealthy?”",
    "checkout.question.minChars": "⚠️ Minimum {min} characters ({current}/{min})",
    "checkout.terms.accept": "I accept all",
    "checkout.terms.linkTerms": "terms",
    "checkout.terms.and": "and",
    "checkout.terms.linkPrivacy": "privacy policy",
    "checkout.submit": "Pay securely",
    "checkout.submitting": "Processing...",
    "checkout.order": "Order",
    "checkout.total": "TOTAL",
    "checkout.trust.secure": "🔒 Secure payment",
    "checkout.trust.email": "📧 PDF to your email",
    "checkout.trust.fast": "⚡ Ready in minutes",

    // BumpPopup
    "bump.title": "✦ Before you continue...",
    "bump.body.prefix": "Would you like to add a",
    "bump.body.product": "Personal Question",
    "bump.body.suffix":
      "to the analysis? AI will answer your question directly in the report.",
    "bump.accept": "Yes, add for €4.99",
    "bump.decline": "No, continue without",
  },
} as const;

export type TranslationKey = keyof (typeof dictionaries)["bg"];

export function translate(
  language: Language,
  key: TranslationKey,
  vars?: Record<string, string | number>,
): string {
  const text: string = dictionaries[language]?.[key] ?? dictionaries.bg[key] ?? key;
  if (!vars) return text;
  return Object.entries(vars).reduce<string>(
    (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, "g"), String(v)),
    text,
  );
}

export const I18N_STORAGE_KEY = "astro-language";
export const I18N_EVENT = "astro-language-change";
