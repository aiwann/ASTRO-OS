'use strict';

const ASPECTS = [
  { name: 'Конюнкция',  nameBg: 'Конюнкция',  symbol: '☌', angle: 0,   orb: 8, nature: 'neutral', strength: 5 },
  { name: 'Секстил',    nameBg: 'Секстил',    symbol: '⚹', angle: 60,  orb: 5, nature: 'harmonious', strength: 3 },
  { name: 'Квадрат',    nameBg: 'Квадрат',    symbol: '□', angle: 90,  orb: 7, nature: 'tense', strength: 4 },
  { name: 'Тригон',     nameBg: 'Тригон',     symbol: '△', angle: 120, orb: 7, nature: 'harmonious', strength: 4 },
  { name: 'Опозиция',   nameBg: 'Опозиция',   symbol: '☍', angle: 180, orb: 8, nature: 'tense', strength: 5 },
  { name: 'Полуквадрат',nameBg: 'Полуквадрат',symbol: '∠', angle: 45,  orb: 3, nature: 'mildly tense', strength: 2 },
  { name: 'Полутригон', nameBg: 'Полутригон', symbol: '⊿', angle: 30,  orb: 2, nature: 'mildly harmonious', strength: 1 },
  { name: 'Квинкункс',  nameBg: 'Квинкункс',  symbol: '⚻', angle: 150, orb: 3, nature: 'tense', strength: 2 },
];

function angularDifference(lon1, lon2) {
  let diff = Math.abs(lon1 - lon2) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

function findAspects(planets) {
  const aspects = [];
  const planetNames = Object.keys(planets);

  for (let i = 0; i < planetNames.length; i++) {
    for (let j = i + 1; j < planetNames.length; j++) {
      const p1 = planetNames[i];
      const p2 = planetNames[j];
      const lon1 = planets[p1].longitude;
      const lon2 = planets[p2].longitude;

      if (lon1 === undefined || lon2 === undefined) continue;

      const diff = angularDifference(lon1, lon2);

      for (const aspect of ASPECTS) {
        const orb = Math.abs(diff - aspect.angle);
        if (orb <= aspect.orb) {
          const applying = isApplying(lon1, lon2, aspect.angle);
          aspects.push({
            planet1: p1,
            planet2: p2,
            aspect: aspect.nameBg,
            symbol: aspect.symbol,
            angle: aspect.angle,
            orb: parseFloat(orb.toFixed(2)),
            nature: aspect.nature,
            strength: aspect.strength,
            applying,
          });
        }
      }
    }
  }

  return aspects.sort((a, b) => a.orb - b.orb);
}

function isApplying(lon1, lon2, aspectAngle) {
  const currentDiff = angularDifference(lon1, lon2);
  return currentDiff <= aspectAngle;
}

function getDominantPlanets(planets, aspects) {
  const scores = {};
  for (const name of Object.keys(planets)) {
    scores[name] = 0;
  }
  for (const asp of aspects) {
    const weight = asp.strength * (1 - asp.orb / 10);
    scores[asp.planet1] = (scores[asp.planet1] || 0) + weight;
    scores[asp.planet2] = (scores[asp.planet2] || 0) + weight;
  }
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);
}

/**
 * Тегла според астрологичната традиция:
 *   Слънце/Луна/ASC/MC: 3× (личностни оси)
 *   Меркурий/Венера/Марс: 2× (лични планети)
 *   Юпитер/Сатурн: 1.5× (социални планети)
 *   Уран/Нептун/Плутон/Хирон/Възли/Лилит: 1× (поколенчески/спомагателни)
 *
 * Ключовете отговарят както на английските, така и на българските имена,
 * за да работят с двата начина на викане в astrologyService.
 */
const ELEMENT_WEIGHTS = {
  // Светила — максимален принос
  sun: 3, moon: 3,
  'Слънце': 3, 'Луна': 3,
  // Асцендент — личен знак, включен с по-малко тегло от светилата.
  // MC НЕ се включва — той е house cusp, не небесно тяло; включването му
  // изкуствено скосява резултата.
  asc: 2, 'Асцендент': 2,
  // Лични планети
  mercury: 2, venus: 2, mars: 2,
  Mercury: 2, Venus: 2, Mars: 2,
  'Меркурий': 2, 'Венера': 2, 'Марс': 2,
  // Социални планети
  jupiter: 1.5, saturn: 1.5,
  Jupiter: 1.5, Saturn: 1.5,
  'Юпитер': 1.5, 'Сатурн': 1.5,
  // Поколенчески/спомагателни — default 1 (не са изброени тук)
};
function weightFor(key) {
  return ELEMENT_WEIGHTS[key] != null ? ELEMENT_WEIGHTS[key] : 1;
}

/**
 * Определя доминантния елемент по претеглена точкова система.
 * При равенство се прилага тайбрейкър по приоритет на светилата:
 *   1. Слънце → 2. Луна → 3. Асцендент → 4. по-ранен в итерация
 * Винаги връща ЕДИН елемент.
 */
function getDominantElement(planets) {
  const elementCounts = { 'Огън': 0, 'Земя': 0, 'Въздух': 0, 'Вода': 0 };
  for (const [key, p] of Object.entries(planets)) {
    if (p && p.sign && p.sign.element) {
      elementCounts[p.sign.element] += weightFor(key);
    }
  }

  const sorted = Object.entries(elementCounts).sort((a, b) => b[1] - a[1]);
  const top = sorted[0][1];
  const tied = sorted.filter(([, v]) => v === top).map(([k]) => k);

  if (tied.length === 1) return tied[0];

  // Тайбрейкър: Слънце → Луна → Асцендент
  for (const key of ['sun', 'moon', 'asc']) {
    const el = planets[key]?.sign?.element;
    if (el && tied.includes(el)) return el;
  }

  // Последен резерв: елементът с повече индивидуални тела (без тегла)
  const rawCounts = {};
  for (const el of tied) rawCounts[el] = 0;
  for (const [key, p] of Object.entries(planets)) {
    if (p?.sign?.element && tied.includes(p.sign.element)) {
      rawCounts[p.sign.element]++;
    }
  }
  return Object.entries(rawCounts).sort((a, b) => b[1] - a[1])[0][0];
}

/**
 * Определя доминантното качество. Същата логика: тайбрейкър Слънце → Луна → АСЦ.
 */
function getDominantQuality(planets) {
  const qualityCounts = { 'Кардинален': 0, 'Фиксиран': 0, 'Мутабилен': 0 };
  for (const [key, p] of Object.entries(planets)) {
    if (p && p.sign && p.sign.quality) {
      qualityCounts[p.sign.quality] += weightFor(key);
    }
  }

  const sorted = Object.entries(qualityCounts).sort((a, b) => b[1] - a[1]);
  const top = sorted[0][1];
  const tied = sorted.filter(([, v]) => v === top).map(([k]) => k);

  if (tied.length === 1) return tied[0];

  for (const key of ['sun', 'moon', 'asc']) {
    const q = planets[key]?.sign?.quality;
    if (q && tied.includes(q)) return q;
  }

  return tied[0];
}

module.exports = { findAspects, getDominantPlanets, getDominantElement, getDominantQuality, ASPECTS };
