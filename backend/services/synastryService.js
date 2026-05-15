'use strict';

const { geocodeLocation } = require('../utils/geocoding');
const astrologyService = require('./astrologyService');
const { ASPECTS } = require('../astrology/aspects');

// Body importance weights for synastry scoring
const BODY_WEIGHTS = {
  'sun': 3, 'moon': 3, 'asc': 2.5,
  'Mercury': 1.5, 'Venus': 2, 'Mars': 2,
  'Jupiter': 1, 'Saturn': 1,
  'Uranus': 0.5, 'Neptune': 0.5,
  'northNode': 1, 'chiron': 1, 'lilith': 0.5,
};

const NATURE_SCORES = {
  'harmonious':      1,
  'mildly harmonious': 0.4,
  'neutral':         0.2,
  'mildly tense':   -0.3,
  'tense':          -0.7,
};

function angularDiff(lon1, lon2) {
  let diff = Math.abs(lon1 - lon2) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

function extractBodies(chart) {
  const bodies = {};
  if (chart.sun)        bodies['sun']       = chart.sun.longitude;
  if (chart.moon)       bodies['moon']      = chart.moon.longitude;
  if (chart.ascendant)  bodies['asc']       = chart.ascendant.longitude;
  for (const [name, planet] of Object.entries(chart.planets || {})) {
    if (planet && planet.longitude != null) bodies[name] = planet.longitude;
  }
  if (chart.northNode)  bodies['northNode'] = chart.northNode.longitude;
  if (chart.chiron)     bodies['chiron']    = chart.chiron.longitude;
  if (chart.lilith)     bodies['lilith']    = chart.lilith.longitude;
  return bodies;
}

function findCrossAspects(bodies1, bodies2) {
  const crossAspects = [];

  for (const [b1, lon1] of Object.entries(bodies1)) {
    for (const [b2, lon2] of Object.entries(bodies2)) {
      const diff = angularDiff(lon1, lon2);

      for (const aspect of ASPECTS) {
        const orb = Math.abs(diff - aspect.angle);
        if (orb <= aspect.orb) {
          crossAspects.push({
            body1: b1,
            body2: b2,
            aspect: aspect.nameBg,
            symbol: aspect.symbol,
            angle: aspect.angle,
            orb: parseFloat(orb.toFixed(2)),
            nature: aspect.nature,
            strength: aspect.strength,
          });
        }
      }
    }
  }

  return crossAspects.sort((a, b) => {
    // Sort by combined body weight (most important pairs first), then by orb
    const wA = (BODY_WEIGHTS[a.body1] || 1) * (BODY_WEIGHTS[a.body2] || 1);
    const wB = (BODY_WEIGHTS[b.body1] || 1) * (BODY_WEIGHTS[b.body2] || 1);
    if (Math.abs(wA - wB) > 0.01) return wB - wA;
    return a.orb - b.orb;
  });
}

// Ключови конюнкции, които в синастричен контекст са силно хармонични,
// въпреки че aspects.js маркира конюнкцията като 'neutral' за натална карта.
// Правилата:
//   1. Same-body конюнкция (Sun-Sun, Moon-Moon, Mars-Mars, ...) = резониране
//      на същата енергия → harmonious.
//   2. Venus-Mars cross-конюнкция = класическо любовно привличане.
const HARMONIC_CROSS_CONJUNCTIONS = new Set([
  'Venus|Mars', 'Mars|Venus',
]);

function isHarmonicConjunction(asp) {
  if (asp.angle !== 0) return false;
  if (asp.body1 === asp.body2) return true; // Sun-Sun, Moon-Moon, Mars-Mars, ...
  return HARMONIC_CROSS_CONJUNCTIONS.has(`${asp.body1}|${asp.body2}`);
}

function computeCompatibilityScore(crossAspects) {
  if (!crossAspects.length) return 50;

  let weightedSum = 0;
  let totalWeight = 0;

  for (const asp of crossAspects) {
    const bodyWeight = (BODY_WEIGHTS[asp.body1] || 1) * (BODY_WEIGHTS[asp.body2] || 1);
    const orbFactor  = 1 - asp.orb / (asp.orb + 3); // tighter orb = more impact
    const weight     = bodyWeight * asp.strength * orbFactor;
    const natureScore = isHarmonicConjunction(asp)
      ? NATURE_SCORES.harmonious
      : (NATURE_SCORES[asp.nature] ?? 0);

    weightedSum  += natureScore * weight;
    totalWeight  += weight;
  }

  if (totalWeight === 0) return 50;

  // Raw ratio: -1 (all tense) … +1 (all harmonious) → map to 0–100
  const ratio = weightedSum / totalWeight;
  const score = 50 + ratio * 50;

  return Math.round(Math.min(100, Math.max(0, score)));
}

function summarizeCompatibility(score) {
  if (score >= 85) return { label: 'Изключителна', description: 'Дълбока хармония и взаимно разбирателство' };
  if (score >= 70) return { label: 'Силна',        description: 'Добра основа с малко предизвикателства' };
  if (score >= 55) return { label: 'Балансирана',  description: 'Смесица от хармония и напрежение — работи се върху него' };
  if (score >= 40) return { label: 'Предизвикателна', description: 'Значителни различия, но и потенциал за растеж' };
  return               { label: 'Напрегната',     description: 'Сериозни конфликти — изисква съзнателна работа' };
}

/**
 * Analyzes synastry between two people.
 *
 * Input:
 *   { name1, birthDate1, birthTime1, birthPlace1,
 *     name2, birthDate2, birthTime2, birthPlace2 }
 *   birthPlace can be replaced with lat1/lon1 and lat2/lon2 if already geocoded.
 *
 * Returns:
 *   { person1, person2, chart1, chart2, crossAspects, compatibilityScore, compatibility }
 */
async function analyze(input) {
  const {
    name1, birthDate1, birthTime1 = '', birthPlace1, lat1, lon1,
    name2, birthDate2, birthTime2 = '', birthPlace2, lat2, lon2,
  } = input;

  // Geocode if coordinates not provided
  const geo1 = (lat1 != null && lon1 != null)
    ? { lat: lat1, lon: lon1, city: birthPlace1 || '' }
    : await geocodeLocation(birthPlace1);

  const geo2 = (lat2 != null && lon2 != null)
    ? { lat: lat2, lon: lon2, city: birthPlace2 || '' }
    : await geocodeLocation(birthPlace2);

  const chart1 = astrologyService.calculate(birthDate1, birthTime1, geo1.lat, geo1.lon);
  const chart2 = astrologyService.calculate(birthDate2, birthTime2, geo2.lat, geo2.lon);

  const bodies1 = extractBodies(chart1);
  const bodies2 = extractBodies(chart2);

  const crossAspects = findCrossAspects(bodies1, bodies2);
  const compatibilityScore = computeCompatibilityScore(crossAspects);
  const compatibility = summarizeCompatibility(compatibilityScore);

  return {
    person1: { name: name1, birthDate: birthDate1, birthTime: birthTime1, birthPlace: geo1.city },
    person2: { name: name2, birthDate: birthDate2, birthTime: birthTime2, birthPlace: geo2.city },
    chart1,
    chart2,
    crossAspects,
    compatibilityScore,
    compatibility,
  };
}

module.exports = { analyze };
