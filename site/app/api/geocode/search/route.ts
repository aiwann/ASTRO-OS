import { NextRequest, NextResponse } from "next/server";

type NominatimResult = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
};

const COUNTRY_BG: Record<string, string> = {
  bg: "България",
  ru: "Русия",
  de: "Германия",
  fr: "Франция",
  gb: "Великобритания",
  us: "САЩ",
  tr: "Турция",
  rs: "Сърбия",
  gr: "Гърция",
  ro: "Румъния",
  mk: "Македония",
  al: "Албания",
  ba: "Босна и Херцеговина",
  hr: "Хърватия",
  at: "Австрия",
  ch: "Швейцария",
  it: "Италия",
  es: "Испания",
  pt: "Португалия",
  nl: "Нидерландия",
  be: "Белгия",
  pl: "Полша",
  cz: "Чехия",
  sk: "Словакия",
  hu: "Унгария",
  ua: "Украйна",
  md: "Молдова",
  by: "Беларус",
  se: "Швеция",
  no: "Норвегия",
  dk: "Дания",
  fi: "Финландия",
  ee: "Естония",
  lv: "Латвия",
  lt: "Литва",
  ca: "Канада",
  au: "Австралия",
  nz: "Нова Зеландия",
  za: "Южна Африка",
  br: "Бразилия",
  ar: "Аржентина",
  mx: "Мексико",
  cn: "Китай",
  jp: "Япония",
  in: "Индия",
  ae: "ОАЕ",
  il: "Израел",
};

function localiseCountry(name: string, code: string): string {
  return COUNTRY_BG[code.toLowerCase()] ?? name;
}

async function getTimezone(lat: number, lon: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://timeapi.io/api/timezone/coordinate?latitude=${lat}&longitude=${lon}`,
      { signal: AbortSignal.timeout(3000) },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.timeZone ?? null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", q);
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("limit", "5");
    url.searchParams.set("featureType", "city");

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "AstroOS/1.0 (astro-os.com)",
        "Accept-Language": "bg,en",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return NextResponse.json([]);

    const raw: NominatimResult[] = await res.json();

    const results = await Promise.all(
      raw.slice(0, 4).map(async (r) => {
        const addr = r.address;
        const city =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.municipality ||
          addr.county ||
          addr.state ||
          q;
        const countryCode = addr.country_code ?? "";
        const country = localiseCountry(addr.country ?? "", countryCode);
        const lat = parseFloat(r.lat);
        const lon = parseFloat(r.lon);
        const timezone = await getTimezone(lat, lon);

        return {
          displayName: r.display_name,
          city,
          country,
          lat,
          lon,
          timezone,
        };
      }),
    );

    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}
