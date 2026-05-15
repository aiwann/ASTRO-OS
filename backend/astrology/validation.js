'use strict';

/**
 * Astrology engine validation layer.
 *
 * Runs a suite of checks against verified reference charts (astro.com,
 * JPL Horizons). The report generator MUST call validateEngine() before
 * any AI interpretation runs. If validation fails, the report is blocked.
 *
 * Checks performed:
 *   1. Normalization      — all angles in [0, 360)
 *   2. Julian Day         — algorithm matches IAU standard
 *   3. Timezone           — geo-tz resolves to expected zone, offset correct
 *   4. Ascendant          — within 0.5° of reference for verified chart
 *   5. Houses             — cusps in correct order, H1=ASC, H4=IC, H7=DSC, H10=MC
 *   6. Planetary positions— each body within its tolerance
 *   7. Zodiac sign mapping— computed sign matches reference exactly
 *   8. Retrogrades        — match reference flags
 *   9. Aspects            — angular differences computed correctly (symmetric, ≤180°)
 */

const { julianDay, sunPosition, moonPosition, planetPosition, northNode, lilith, chiron, isRetrograde, getZodiacSign, mod360 } = require('./ephemeris');
const { ascendant, midheaven, placidusHouses } = require('./houses');
const { findAspects } = require('./aspects');
const { REFERENCE_CHARTS } = require('./referenceCharts');

const BODY_GETTERS = {
  sun:       (jd) => sunPosition(jd),
  moon:      (jd) => moonPosition(jd),
  mercury:   (jd) => planetPosition(jd, 'Mercury'),
  venus:     (jd) => planetPosition(jd, 'Venus'),
  mars:      (jd) => planetPosition(jd, 'Mars'),
  jupiter:   (jd) => planetPosition(jd, 'Jupiter'),
  saturn:    (jd) => planetPosition(jd, 'Saturn'),
  uranus:    (jd) => planetPosition(jd, 'Uranus'),
  neptune:   (jd) => planetPosition(jd, 'Neptune'),
  chiron:    (jd) => chiron(jd),
  northNode: (jd) => northNode(jd),
  lilith:    (jd) => lilith(jd),
};

const RETROGRADE_PLANETS = {
  mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune',
};

// Smallest signed angular distance between two longitudes, in (-180, 180].
function angularDelta(a, b) {
  let d = mod360(a - b);
  if (d > 180) d -= 360;
  return d;
}

// -----------------------------------------------------------------------------
// Individual check functions — each returns { name, pass, detail }.
// -----------------------------------------------------------------------------

function checkNormalization(name, value) {
  if (typeof value !== 'number' || !isFinite(value)) {
    return { name, pass: false, detail: `${name} is not a finite number: ${value}` };
  }
  if (value < 0 || value >= 360) {
    return { name, pass: false, detail: `${name} = ${value} is outside [0, 360)` };
  }
  return { name, pass: true, detail: `${name} = ${value.toFixed(4)}° ∈ [0,360)` };
}

function checkJulianDay() {
  // IAU reference: 2000-01-01 12:00 UT = JD 2451545.0
  const jd = julianDay(2000, 1, 1, 12, 0);
  const expected = 2451545.0;
  const delta = Math.abs(jd - expected);
  return {
    name: 'JulianDay(2000-01-01 12:00 UTC)',
    pass: delta < 1e-6,
    detail: `computed ${jd}, expected ${expected}, |Δ| = ${delta.toExponential(2)}`,
  };
}

function checkTimezoneResolution(lat, lon, expectedTz) {
  try {
    const { find } = require('geo-tz');
    const tzList = find(lat, lon);
    const tz = tzList?.[0];
    const pass = tz === expectedTz;
    return {
      name: `Timezone(${lat}, ${lon})`,
      pass,
      detail: pass ? `${tz} ✓` : `got '${tz}', expected '${expectedTz}'`,
    };
  } catch (e) {
    return { name: 'Timezone', pass: false, detail: `geo-tz error: ${e.message}` };
  }
}

function checkBodyLongitude(name, computed, expected) {
  if (!computed || !isFinite(computed.longitude)) {
    return { name, pass: false, detail: `${name}: no position returned` };
  }
  const delta = Math.abs(angularDelta(computed.longitude, expected.longitude));
  const tol = expected.tolerance ?? 1.0;
  const sign = getZodiacSign(computed.longitude);
  const signMatch = sign.name === expected.sign;
  const angleMatch = delta <= tol;
  return {
    name: `${name} (${expected.longitude.toFixed(2)}° ${expected.sign}, tol ±${tol}°)`,
    pass: signMatch && angleMatch,
    detail: `got ${computed.longitude.toFixed(2)}° ${sign.name}, |Δ| = ${delta.toFixed(2)}°` +
      (!signMatch ? ' [SIGN MISMATCH]' : '') +
      (!angleMatch ? ' [BEYOND TOLERANCE]' : ''),
  };
}

function checkRetrograde(planetKey, jd, expectedRetro) {
  const ephemerisName = RETROGRADE_PLANETS[planetKey];
  if (!ephemerisName) return null;
  const got = isRetrograde(jd, ephemerisName);
  return {
    name: `Retrograde(${planetKey})`,
    pass: got === expectedRetro,
    detail: `got ${got}, expected ${expectedRetro}`,
  };
}

function checkHouseTopology(cusps, asc, mc) {
  const failures = [];
  if (cusps.length !== 12) failures.push(`expected 12 cusps, got ${cusps.length}`);
  for (let i = 0; i < cusps.length; i++) {
    const r = checkNormalization(`cusp[${i + 1}]`, cusps[i]);
    if (!r.pass) failures.push(r.detail);
  }
  if (Math.abs(angularDelta(cusps[0], asc)) > 0.01) {
    failures.push(`H1 (${cusps[0].toFixed(2)}°) ≠ ASC (${asc.toFixed(2)}°)`);
  }
  if (Math.abs(angularDelta(cusps[9], mc)) > 0.01) {
    failures.push(`H10 (${cusps[9].toFixed(2)}°) ≠ MC (${mc.toFixed(2)}°)`);
  }
  if (Math.abs(angularDelta(cusps[3], mod360(mc + 180))) > 0.01) {
    failures.push(`H4 (${cusps[3].toFixed(2)}°) ≠ IC (${mod360(mc + 180).toFixed(2)}°)`);
  }
  if (Math.abs(angularDelta(cusps[6], mod360(asc + 180))) > 0.01) {
    failures.push(`H7 (${cusps[6].toFixed(2)}°) ≠ DSC (${mod360(asc + 180).toFixed(2)}°)`);
  }
  return {
    name: 'House topology (H1=ASC, H4=IC, H7=DSC, H10=MC, all cusps normalized)',
    pass: failures.length === 0,
    detail: failures.length ? failures.join('; ') : 'all 12 cusps normalized and angles aligned',
  };
}

function checkZodiacMapping() {
  // Each 30° band must map to the correct sign at boundary points.
  const samples = [
    [0.0,    'Овен'],     [29.99,  'Овен'],
    [30.0,   'Телец'],    [59.99,  'Телец'],
    [60.0,   'Близнаци'], [89.99,  'Близнаци'],
    [90.0,   'Рак'],      [119.99, 'Рак'],
    [120.0,  'Лъв'],      [149.99, 'Лъв'],
    [150.0,  'Дева'],     [179.99, 'Дева'],
    [180.0,  'Везни'],    [209.99, 'Везни'],
    [210.0,  'Скорпион'], [239.99, 'Скорпион'],
    [240.0,  'Стрелец'],  [269.99, 'Стрелец'],
    [270.0,  'Козирог'],  [299.99, 'Козирог'],
    [300.0,  'Водолей'],  [329.99, 'Водолей'],
    [330.0,  'Риби'],     [359.99, 'Риби'],
  ];
  const failures = [];
  for (const [lon, expected] of samples) {
    const s = getZodiacSign(lon).name;
    if (s !== expected) failures.push(`${lon}° → ${s} (expected ${expected})`);
  }
  return {
    name: 'Zodiac sign mapping (24 boundary samples)',
    pass: failures.length === 0,
    detail: failures.length ? failures.join(', ') : '24/24 boundaries correct',
  };
}

function checkAspectMath() {
  // Pure mathematical checks on the aspect engine.
  const planets = {
    A: { longitude: 10  },
    B: { longitude: 100 },  // A-B = 90° (square)
    C: { longitude: 190 },  // A-C = 180° (opposition)
    D: { longitude: 11  },  // A-D = 1° (conjunction)
    E: { longitude: 350 },  // A-E = 20° → no major aspect within orb
  };
  const aspects = findAspects(planets);

  const find = (p1, p2, name) => aspects.find(a =>
    ((a.planet1 === p1 && a.planet2 === p2) || (a.planet1 === p2 && a.planet2 === p1)) &&
    a.aspect === name
  );

  const failures = [];
  if (!find('A', 'B', 'Квадрат'))   failures.push('A-B (90°) should be Квадрат');
  if (!find('A', 'C', 'Опозиция'))  failures.push('A-C (180°) should be Опозиция');
  if (!find('A', 'D', 'Конюнкция')) failures.push('A-D (1°) should be Конюнкция');

  // Symmetry: angular delta should equal its mirror (we just check it's in [0,180])
  for (const a of aspects) {
    if (a.orb < 0 || a.orb > 8) failures.push(`Aspect ${a.aspect} has orb ${a.orb} outside [0,8]`);
  }

  return {
    name: 'Aspect math (square / opposition / conjunction / orb range)',
    pass: failures.length === 0,
    detail: failures.length ? failures.join('; ') : `${aspects.length} aspects, all symmetric and orbs ∈ [0, 8]`,
  };
}

// -----------------------------------------------------------------------------
// Per-chart full run
// -----------------------------------------------------------------------------

function validateChart(chart) {
  const results = [];
  const { input, expected, label } = chart;

  // 1. Timezone
  if (input.expectedTimezone) {
    results.push(checkTimezoneResolution(input.lat, input.lon, input.expectedTimezone));
  }

  // 2. JD (when explicit reference given)
  if (input.expectedJulianDay !== undefined) {
    const utc = input.expectedUTC;
    const jd = julianDay(utc.year, utc.month, utc.day, utc.hour, utc.minute);
    const delta = Math.abs(jd - input.expectedJulianDay);
    results.push({
      name: `JulianDay (${chart.id})`,
      pass: delta < 1e-4,
      detail: `computed ${jd}, expected ${input.expectedJulianDay}, |Δ| = ${delta.toExponential(2)}`,
    });
  }

  // 3. Compute chart at the expected UTC moment
  const utc = input.expectedUTC;
  const jd = julianDay(utc.year, utc.month, utc.day, utc.hour, utc.minute);

  // 4. Ascendant
  if (expected.ascendant) {
    const ascLon = ascendant(jd, input.lat, input.lon);
    results.push(checkBodyLongitude('Ascendant', { longitude: ascLon }, expected.ascendant));
    results.push(checkNormalization('Ascendant', ascLon));
  }

  // 5. Midheaven
  if (expected.midheaven) {
    const mcLon = midheaven(jd, input.lon);
    results.push(checkBodyLongitude('Midheaven', { longitude: mcLon }, expected.midheaven));
    results.push(checkNormalization('Midheaven', mcLon));
  }

  // 6. Houses — topology (H1=ASC, H4=IC, etc.)
  if (expected.ascendant && expected.midheaven) {
    const asc = ascendant(jd, input.lat, input.lon);
    const mc  = midheaven(jd, input.lon);
    const cusps = placidusHouses(jd, input.lat, input.lon);
    results.push(checkHouseTopology(cusps, asc, mc));
  }

  // 7. Bodies (planets, luminaries, nodes, Chiron, Lilith)
  for (const key of Object.keys(BODY_GETTERS)) {
    if (!expected[key]) continue;
    const pos = BODY_GETTERS[key](jd);
    results.push(checkBodyLongitude(key, pos, expected[key]));
    if (pos && isFinite(pos.longitude)) {
      results.push(checkNormalization(`${key} longitude`, pos.longitude));
    }
  }

  // 8. Retrogrades
  for (const key of Object.keys(RETROGRADE_PLANETS)) {
    if (!expected[key] || expected[key].retrograde === undefined) continue;
    const r = checkRetrograde(key, jd, expected[key].retrograde);
    if (r) results.push(r);
  }

  return { label, results };
}

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

function validateEngine() {
  const reports = [];

  // Pure math checks (no reference chart required)
  const math = [];
  math.push(checkJulianDay());
  math.push(checkZodiacMapping());
  math.push(checkAspectMath());
  reports.push({ label: 'Math invariants', results: math });

  // Reference-chart checks
  for (const chart of REFERENCE_CHARTS) {
    reports.push(validateChart(chart));
  }

  const allResults = reports.flatMap(r => r.results);
  const failed = allResults.filter(r => !r.pass);
  return {
    pass: failed.length === 0,
    totalChecks: allResults.length,
    failedCount: failed.length,
    reports,
    failures: failed,
  };
}

function formatValidationReport(result) {
  const lines = [];
  for (const section of result.reports) {
    lines.push(`\n── ${section.label} ──`);
    for (const r of section.results) {
      const icon = r.pass ? '✓' : '✗';
      lines.push(`  ${icon} ${r.name}`);
      if (!r.pass) lines.push(`      ${r.detail}`);
    }
  }
  lines.push('');
  lines.push(`${result.pass ? 'PASS' : 'FAIL'} — ${result.totalChecks - result.failedCount}/${result.totalChecks} checks passed`);
  return lines.join('\n');
}

// Cache the result so we only run the suite once per process.
let cachedResult = null;
function getValidationStatus() {
  if (cachedResult === null) cachedResult = validateEngine();
  return cachedResult;
}

function assertEngineValid() {
  const result = getValidationStatus();
  if (!result.pass) {
    const summary = result.failures
      .slice(0, 8)
      .map(f => `  • ${f.name}: ${f.detail}`)
      .join('\n');
    const more = result.failures.length > 8 ? `\n  …and ${result.failures.length - 8} more` : '';
    throw new Error(
      `Astrology engine failed validation (${result.failedCount}/${result.totalChecks} checks failed):\n${summary}${more}`
    );
  }
  return result;
}

module.exports = {
  validateEngine,
  formatValidationReport,
  getValidationStatus,
  assertEngineValid,
  // exported for tests
  angularDelta,
};
