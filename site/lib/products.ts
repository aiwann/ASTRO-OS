export type Product = {
  slug: string;
  title: string;
  subtitle: string;
  hook: string;
  oldPrice: number;
  newPrice: number;
  discount: number;
  duration: string;
  includes: string[];
  apiType: string;
  color: string;
  twoPersons?: boolean;
  featured?: boolean;
};

export const PRODUCTS: Record<string, Product> = {
  "personal-profile": {
    slug: "personal-profile",
    title: "Личен AI Анализ",
    subtitle: "Пълен Профил",
    hook: "Кой си ти на дълбоко ниво — личност, мисия, сили и блокажи.",
    oldPrice: 21,
    newPrice: 11.99,
    discount: 43,
    duration: "900+ думи • PDF • Имейл доставка",
    includes: [
      "Пълен личностен портрет (Слънце, Луна, Асцендент)",
      "Твоите 3 главни сили и 3 блокажа",
      "Мисията на душата (Северен Възел)",
      "Нумерологичен анализ — Жизнен Път + Съдба",
      "Персонално послание от звездите",
    ],
    apiType: "personal-profile",
    color: "from-purple-900/20 to-transparent",
  },
  synastry: {
    slug: "synastry",
    title: "Любовна Съвместимост",
    subtitle: "Анализ на двойката",
    hook: "Какво свързва двама души — и какво ги разделя.",
    oldPrice: 39,
    newPrice: 26.99,
    discount: 31,
    duration: "800+ думи • PDF • Имейл доставка",
    includes: [
      "Compatibility score (0–100%)",
      "Емоционална динамика и привличане",
      "Силните страни на връзката",
      "Предизвикателствата и кармичният урок",
      "Съвет за развитие на връзката",
    ],
    apiType: "synastry",
    color: "from-rose-900/20 to-transparent",
    twoPersons: true,
  },
  "yearly-analysis": {
    slug: "yearly-analysis",
    title: "Годишен Анализ",
    subtitle: "2026 — Твоята Година",
    hook: "Любов, работа, енергийни цикли и ключови периоди за 2026.",
    oldPrice: 29,
    newPrice: 16.99,
    discount: 41,
    duration: "750+ думи • PDF • Имейл доставка",
    includes: [
      "Личната ти година за 2026 и нейната тема",
      "Любов и взаимоотношения през 2026",
      "Кариера и финанси — пикове и рискове",
      "3 ключови периода с конкретни дати",
      "Главен съвет за годината",
    ],
    apiType: "yearly-analysis",
    color: "from-blue-900/20 to-transparent",
  },
  "archetype-profile": {
    slug: "archetype-profile",
    title: "Архетип Профил",
    subtitle: "Дълбок Личностен Анализ",
    hook: "Твоят вътрешен архетип — как мислиш, действаш и реагираш.",
    oldPrice: 27,
    newPrice: 18.99,
    discount: 30,
    duration: "850+ думи • PDF • Имейл доставка",
    includes: [
      "Твоят архетип (Лидер/Стратег/Творец/Визионер...)",
      "Мисловен процес и вземане на решения",
      "Повтарящи се поведенчески модели",
      "Емоционални нужди и несъзнателни модели",
      "Тъмната страна на архетипа и как да я трансформираш",
    ],
    apiType: "archetype-profile",
    color: "from-amber-900/20 to-transparent",
  },
  "life-map": {
    slug: "life-map",
    title: "Карта на Живота",
    subtitle: "Любов • Кариера • Развитие",
    hook: "Пълна картография на твоя живот — накъде води пътят.",
    oldPrice: 28,
    newPrice: 19.99,
    discount: 29,
    duration: "800+ думи • PDF • Имейл доставка",
    includes: [
      "Любовният ти архетип и кармични уроци",
      "Призванието и финансовия потенциал",
      "Трите главни жизнени урока",
      "Ключови периоди и трансформации по възраст",
      "Скритото послание на твоята карта",
    ],
    apiType: "life-map",
    color: "from-teal-900/20 to-transparent",
  },
  "hidden-potential": {
    slug: "hidden-potential",
    title: "Скрит Потенциал",
    subtitle: "Таланти • Блокажи • Възможности",
    hook: "Какво е най-силното ти качество, което не използваш?",
    oldPrice: 25,
    newPrice: 17.99,
    discount: 28,
    duration: "750+ думи • PDF • Имейл доставка",
    includes: [
      "Скритите таланти записани в картата",
      "Несъзнателният самосаботаж и как да го спреш",
      "Ретроградните планети и вътрешните блокажи",
      "Кармичните уроци от предишни животи",
      "План за активиране на потенциала в 12 месеца",
    ],
    apiType: "hidden-potential",
    color: "from-violet-900/20 to-transparent",
  },
  "energy-profile": {
    slug: "energy-profile",
    title: "Енергиен Профил",
    subtitle: "Дълбока Версия",
    hook: "Твоята жизнена енергия — ритмите, блокажите, хората около теб.",
    oldPrice: 26,
    newPrice: 16.99,
    discount: 35,
    duration: "700+ думи • PDF • Имейл доставка",
    includes: [
      "Твоята основна стихия и как се проявява",
      "Енергийни пикове и периоди на изтощение",
      "С кого резонираш и с кого се изтощаваш",
      "Как несъзнателно изтичаш енергията си",
      "3 практики за поддържане на висока енергия",
    ],
    apiType: "energy-profile",
    color: "from-orange-900/20 to-transparent",
  },
  "ideal-partner": {
    slug: "ideal-partner",
    title: "Идеален Партньор",
    subtitle: "Астро + Психологически Портрет",
    hook: "Кой е създаден за теб — и как ще го разпознаеш, когато го срещнеш.",
    oldPrice: 42,
    newPrice: 28.99,
    discount: 31,
    duration: "850+ думи • PDF • Имейл доставка",
    includes: [
      "Астрологичният профил на идеалния ти партньор",
      "Психологическият тип, който ти подхожда",
      "Енергийната динамика, която ще те храни",
      "Знаци, по които ще го/я разпознаеш",
      "Кармичните уроци, които ще научите заедно",
    ],
    apiType: "ideal-partner",
    color: "from-pink-900/20 to-transparent",
  },
  "full-life-code": {
    slug: "full-life-code",
    title: "Пълен Животен Код",
    subtitle: "Мега Анализ — Всичко в Едно",
    hook: "Най-пълният AI анализ — 8 раздела, 3500+ думи, луксозен PDF.",
    oldPrice: 99,
    newPrice: 64.99,
    discount: 34,
    duration: "3500+ думи • Луксозен PDF • Имейл доставка",
    includes: [
      "Пълен Личен Профил",
      "Архетип и Поведенчески Модели",
      "Карта на Живота",
      "Скрит Потенциал",
      "Енергиен Профил",
      "Годишен Анализ 2026",
      "Идеален Партньор",
      "Послание от Звездите",
    ],
    apiType: "full-life-code",
    color: "from-gold/10 to-transparent",
    featured: true,
  },
};

export const PRODUCT_SLUGS = Object.keys(PRODUCTS);

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS[slug];
}

export function formatEUR(amount: number): string {
  return `€${amount.toFixed(2)}`;
}

// Фиксиран курс на БНБ: 1 EUR = 1.95583 BGN
export const EUR_TO_BGN = 1.95583;

export function eurToBgn(amount: number): number {
  return amount * EUR_TO_BGN;
}

export function formatBGN(amount: number): string {
  return `${eurToBgn(amount).toFixed(2)} лв`;
}

/**
 * Връща дуална цена във формат "€11.99 / 23.45 лв" като plain string.
 * За JSX варианти с по-фин стайлинг — рендвай ръчно.
 */
export function formatDualPrice(amount: number): string {
  return `${formatEUR(amount)} / ${formatBGN(amount)}`;
}

export function computeItemValues(product: Product): {
  perItem: number;
  total: number;
} {
  const itemCount = product.includes.length;
  const total = Math.round(product.oldPrice * 1.5);
  const perItem = Math.round(total / itemCount);
  return { perItem, total };
}
