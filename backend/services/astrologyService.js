'use strict';

const {
  julianDay, sunPosition, moonPosition, planetPosition,
  northNode, lilith, chiron, isRetrograde, getZodiacSign, mod360,
} = require('../astrology/ephemeris');
const { ascendant, midheaven, placidusHouses, getHouseForPlanet, HOUSE_MEANINGS_BG } = require('../astrology/houses');
const { findAspects, getDominantPlanets, getDominantElement, getDominantQuality } = require('../astrology/aspects');

function getTimezoneOffsetMinutes(tz, date) {
  // Returns offset in minutes (positive = east of UTC, e.g. UTC+3 → 180)
  const utcStr = date.toLocaleString('en-US', { timeZone: 'UTC' });
  const localStr = date.toLocaleString('en-US', { timeZone: tz });
  return Math.round((new Date(localStr) - new Date(utcStr)) / 60000);
}

function parseDateTime(dateStr, timeStr, lat, lon) {
  // Валидираме формата на датата ПРЕДИ изчисленията. Без това невалидни входове
  // (празна дата, "not-a-date", "1990-6-19" без водещи нули) тихо преминават с
  // NaN стойности и клиентът получава боклук анализ. Better fail loud.
  if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error(`Невалидна дата: "${dateStr}". Очакван формат: YYYY-MM-DD`);
  }
  const [year, month, day] = dateStr.split('-').map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error(`Невалидна дата: "${dateStr}" (месец/ден извън диапазон)`);
  }
  // Проверка за реална календарна валидност (отхвърля 30 фев, 31 апр и т.н.)
  const testDate = new Date(`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`);
  if (isNaN(testDate.getTime()) || testDate.getUTCMonth() + 1 !== month || testDate.getUTCDate() !== day) {
    throw new Error(`Невалидна дата: "${dateStr}" — тази дата не съществува.`);
  }
  let hour = 12, minute = 0;
  if (timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    hour = isNaN(h) ? 12 : h;
    minute = isNaN(m) ? 0 : m;
  }

  // Convert local birth time → UTC using timezone from coordinates
  if (lat != null && lon != null) {
    try {
      const { find } = require('geo-tz');
      const tzList = find(lat, lon);
      const tz = tzList && tzList[0] ? tzList[0] : 'UTC';

      const pad = n => String(n).padStart(2, '0');
      const approxUTC = new Date(`${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00Z`);
      const offsetMin = getTimezoneOffsetMinutes(tz, approxUTC);

      // UTC = local − offset
      const utcMs = approxUTC.getTime() - offsetMin * 60000;
      const utcDate = new Date(utcMs);

      console.log(`[AstrologyService] TZ: ${tz}, offset: ${offsetMin}min → UTC ${utcDate.toISOString()}`);

      return {
        year: utcDate.getUTCFullYear(),
        month: utcDate.getUTCMonth() + 1,
        day: utcDate.getUTCDate(),
        hour: utcDate.getUTCHours(),
        minute: utcDate.getUTCMinutes(),
      };
    } catch (e) {
      console.warn('[AstrologyService] Timezone lookup failed, using local time:', e.message);
    }
  }

  return { year, month, day, hour, minute };
}

function buildPlanetData(name, position, houseCusps) {
  if (!position) return null;
  const sign = getZodiacSign(position.longitude);
  const house = getHouseForPlanet(position.longitude, houseCusps);
  return {
    name,
    longitude: parseFloat(position.longitude.toFixed(4)),
    latitude: parseFloat((position.latitude || 0).toFixed(4)),
    sign,
    house,
    houseMeaning: HOUSE_MEANINGS_BG[house - 1],
    isRetrograde: position.retrograde || false,
  };
}

function calculate(birthDate, birthTime, lat, lon) {
  const { year, month, day, hour, minute } = parseDateTime(birthDate, birthTime, lat, lon);
  const jd = julianDay(year, month, day, hour, minute);

  const houseCusps = placidusHouses(jd, lat, lon);

  const sunPos  = sunPosition(jd);
  const moonPos = moonPosition(jd);

  const planetNames = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
  const planetsBG   = {
    Mercury: 'Меркурий', Venus: 'Венера', Mars: 'Марс',
    Jupiter: 'Юпитер', Saturn: 'Сатурн', Uranus: 'Уран', Neptune: 'Нептун',
  };

  const ascLon = ascendant(jd, lat, lon);
  const mcLon  = midheaven(jd, lon);
  const nnPos  = northNode(jd);
  const snPos  = { longitude: mod360(nnPos.longitude + 180), latitude: 0, distance: 0 };
  const lilPos = lilith(jd);
  const chiPos = chiron(jd);

  const planets = {};
  for (const pName of planetNames) {
    const pos = planetPosition(jd, pName);
    if (pos) {
      pos.retrograde = isRetrograde(jd, pName);
      planets[planetsBG[pName]] = buildPlanetData(planetsBG[pName], pos, houseCusps);
      planets[pName] = planets[planetsBG[pName]];
    }
  }

  const allPlanetLons = {
    'Слънце': sunPos.longitude,
    'Луна': moonPos.longitude,
    ...Object.fromEntries(planetNames.map(n => [planetsBG[n], planets[planetsBG[n]]?.longitude]).filter(([,v]) => v != null)),
    'Северен Възел': nnPos.longitude,
    'Лилит': lilPos.longitude,
    'Хирон': chiPos.longitude,
  };

  const allForAspects = Object.fromEntries(
    Object.entries(allPlanetLons).map(([k, v]) => [k, { longitude: v }])
  );

  const aspects = findAspects(allForAspects);
  const dominantPlanets = getDominantPlanets(allForAspects, aspects);
  // Доминантният елемент/качество се изчисляват с тегла.
  // МС НЕ се включва — той е ос на домовете (cusp), не небесно тяло.
  // Включването му изкуствено скосява елемента (напр. MC в Везни x3 прави
  // Въздух да "победи" при Диана, въпреки Слънце+Меркурий+Нептун в Вода).
  const elementBag = {
    sun:  { sign: getZodiacSign(sunPos.longitude) },
    moon: { sign: getZodiacSign(moonPos.longitude) },
    asc:  { sign: getZodiacSign(ascLon) },   // ASC = личен знак → включен
    // mc: НЕ включваме — house cusp, не планета
    ...Object.fromEntries(planetNames.map(n => {
      const p = planetPosition(jd, n);
      return p ? [n, { sign: getZodiacSign(p.longitude) }] : [n, null];
    }).filter(([,v]) => v != null)),
  };
  const dominantElement = getDominantElement(elementBag);
  const dominantQuality = getDominantQuality(elementBag);

  const retrogrades = planetNames
    .filter(n => planets[planetsBG[n]]?.isRetrograde)
    .map(n => planetsBG[n]);

  const saturnReturnAge = calculateSaturnReturn(year, month, day, lat, lon);

  return {
    julianDay: jd,
    ascendant: {
      longitude: parseFloat(ascLon.toFixed(4)),
      sign: getZodiacSign(ascLon),
      degree: getDegreeStr(ascLon),
      house: 1,
    },
    midheaven: {
      longitude: parseFloat(mcLon.toFixed(4)),
      sign: getZodiacSign(mcLon),
      degree: getDegreeStr(mcLon),
      house: 10,
    },
    sun: {
      ...buildPlanetData('Слънце', sunPos, houseCusps),
      degree: getDegreeStr(sunPos.longitude),
    },
    moon: {
      ...buildPlanetData('Луна', moonPos, houseCusps),
      degree: getDegreeStr(moonPos.longitude),
    },
    planets: {
      Mercury: planets['Mercury'] || planets['Меркурий'],
      Venus:   planets['Venus']   || planets['Венера'],
      Mars:    planets['Mars']    || planets['Марс'],
      Jupiter: planets['Jupiter'] || planets['Юпитер'],
      Saturn:  planets['Saturn']  || planets['Сатурн'],
      Uranus:  planets['Uranus']  || planets['Уран'],
      Neptune: planets['Neptune'] || planets['Нептун'],
    },
    northNode: buildPlanetData('Северен Възел', nnPos, houseCusps),
    southNode: buildPlanetData('Южен Възел', snPos, houseCusps),
    lilith:    buildPlanetData('Лилит', lilPos, houseCusps),
    chiron:    buildPlanetData('Хирон', chiPos, houseCusps),
    houseCusps,
    aspects: aspects.slice(0, 20),
    dominantPlanets,
    dominantElement,
    dominantQuality,
    retrogrades,
    saturnReturn: saturnReturnAge,
  };
}

function getDegreeStr(longitude) {
  const deg = ((longitude % 30) + 30) % 30;
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  return `${d}°${m}'`;
}

function calculateSaturnReturn(year, month, day, lat, lon) {
  const birthJD = julianDay(year, month, day, 12, 0);
  const saturnPeriod = 29.5;
  for (let age = 27; age <= 32; age++) {
    const checkYear = year + age;
    const checkJD = julianDay(checkYear, month, day, 12, 0);
    const birthSaturn = planetPosition(birthJD, 'Saturn');
    const checkSaturn = planetPosition(checkJD, 'Saturn');
    if (birthSaturn && checkSaturn) {
      const diff = Math.abs(birthSaturn.longitude - checkSaturn.longitude);
      if (diff < 5 || diff > 355) {
        return { age, year: checkYear };
      }
    }
  }
  return null;
}

module.exports = { calculate };
