'use strict';

/**
 * Reference charts with verified data from astro.com (Astrodienst Swiss Ephemeris)
 * and JPL Horizons (NASA). Used as ground truth for engine validation.
 *
 * Rodden ratings:
 *   AA = birth time from official record / certificate
 *   A  = autobiography or personal recollection
 *
 * All longitudes are tropical, geocentric, in degrees [0, 360).
 * Sign zero-points: Aries=0, Taurus=30, Gemini=60, Cancer=90, Leo=120,
 *                   Virgo=150, Libra=180, Scorpio=210, Sagittarius=240,
 *                   Capricorn=270, Aquarius=300, Pisces=330.
 */

const REFERENCE_CHARTS = [
  {
    id: 'diana',
    label: 'Princess Diana (1961-07-01 19:45 BST Sandringham UK) — Rodden AA',
    input: {
      birthDate: '1961-07-01',
      birthTime: '19:45',
      lat: 52.83,
      lon: 0.50,
      expectedTimezone: 'Europe/London',
      // 19:45 BST = 18:45 UTC (BST = UTC+1)
      expectedUTC: { year: 1961, month: 7, day: 1, hour: 18, minute: 45 },
    },
    // Reference values from astro.com (tropical, geocentric)
    expected: {
      ascendant:  { longitude: 258.40, sign: 'Стрелец',  tolerance: 0.5 },  // Sag 18°24'
      midheaven:  { longitude: 203.52, sign: 'Везни',    tolerance: 1.0 },  // Lib 23°31'
      sun:        { longitude:  99.67, sign: 'Рак',      tolerance: 0.5 },  // Can 9°40'
      moon:       { longitude: 325.03, sign: 'Водолей',  tolerance: 1.0 },  // Aqu 25°02'
      mercury:    { longitude:  93.20, sign: 'Рак',      tolerance: 2.0, retrograde: true },
      venus:      { longitude:  54.42, sign: 'Телец',    tolerance: 2.0 },
      mars:       { longitude: 151.65, sign: 'Дева',     tolerance: 2.0 },
      jupiter:    { longitude: 305.10, sign: 'Водолей',  tolerance: 2.0, retrograde: true },
      saturn:     { longitude: 297.82, sign: 'Козирог',  tolerance: 2.0, retrograde: true },
      uranus:     { longitude: 143.33, sign: 'Лъв',      tolerance: 2.0 },
      neptune:    { longitude: 218.63, sign: 'Скорпион', tolerance: 2.0, retrograde: true },
      chiron:     { longitude: 336.48, sign: 'Риби',     tolerance: 8.0, retrograde: true },
      // Mean Node (our calc) can differ from True Node (astro.com default) by ~1.7°
      northNode:  { longitude: 148.00, sign: 'Лъв',      tolerance: 2.0 },
    },
  },

  {
    id: 'j2000',
    label: 'J2000.0 epoch (2000-01-01 12:00 UTC) — JPL Horizons',
    input: {
      birthDate: '2000-01-01',
      birthTime: '12:00',
      lat: 0,
      lon: 0,
      // At lat/lon (0,0) the timezone is Etc/GMT, so local == UTC
      expectedTimezone: 'Etc/GMT',
      expectedUTC: { year: 2000, month: 1, day: 1, hour: 12, minute: 0 },
      expectedJulianDay: 2451545.0,
    },
    // Reference values from JPL Horizons (geocentric ecliptic of date)
    expected: {
      sun:        { longitude: 280.06, sign: 'Козирог',  tolerance: 0.5 },
      moon:       { longitude: 217.65, sign: 'Скорпион', tolerance: 8.0 },  // truncated series
      mercury:    { longitude: 271.45, sign: 'Козирог',  tolerance: 2.0 },
      venus:      { longitude: 240.81, sign: 'Стрелец',  tolerance: 2.0 },
      mars:       { longitude: 327.55, sign: 'Водолей',  tolerance: 2.0 },
      jupiter:    { longitude:  25.27, sign: 'Овен',     tolerance: 2.0 },
      saturn:     { longitude:  40.41, sign: 'Телец',    tolerance: 2.0 },
      uranus:     { longitude: 314.83, sign: 'Водолей',  tolerance: 2.5 },
      neptune:    { longitude: 304.79, sign: 'Водолей',  tolerance: 2.5 },
      chiron:     { longitude: 251.32, sign: 'Стрелец',  tolerance: 8.0 },
      northNode:  { longitude: 125.04, sign: 'Лъв',      tolerance: 1.0 },
      lilith:     { longitude:  83.51, sign: 'Близнаци', tolerance: 1.0 },
    },
  },
];

module.exports = { REFERENCE_CHARTS };
