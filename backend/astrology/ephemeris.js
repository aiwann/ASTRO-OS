'use strict';

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

function mod360(x) { return ((x % 360) + 360) % 360; }
function sin(d) { return Math.sin(d * DEG); }
function cos(d) { return Math.cos(d * DEG); }
function tan(d) { return Math.tan(d * DEG); }
function asin(x) { return Math.asin(x) * RAD; }
function atan2(y, x) { return Math.atan2(y, x) * RAD; }

function julianDay(year, month, day, hour = 0, minute = 0) {
  const h = hour + minute / 60;
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716))
    + Math.floor(30.6001 * (month + 1))
    + day + B - 1524.5 + h / 24;
}

function sunPosition(jd) {
  const n = jd - 2451545.0;
  const L = mod360(280.460 + 0.9856474 * n);
  const g = mod360(357.528 + 0.9856003 * n);
  const lambda = L + 1.915 * sin(g) + 0.020 * sin(2 * g);
  const beta = 0;
  const R = 1.00014 - 0.01671 * cos(g) - 0.00014 * cos(2 * g);
  return { longitude: mod360(lambda), latitude: beta, distance: R };
}

function moonPosition(jd) {
  const T = (jd - 2451545.0) / 36525;
  const L0 = mod360(218.3165 + 481267.8813 * T);
  const M  = mod360(357.5291 + 35999.0503  * T);
  const Mp = mod360(134.9634 + 477198.8676 * T);
  const D  = mod360(297.8502 + 445267.1115 * T);
  const F  = mod360(93.2721  + 483202.0175 * T);

  const lambda = L0
    + 6.2886 * sin(Mp)
    + 1.2740 * sin(2*D - Mp)
    + 0.6583 * sin(2*D)
    + 0.2136 * sin(2*Mp)
    - 0.1851 * sin(M)
    - 0.1143 * sin(2*F)
    + 0.0588 * sin(2*D - 2*Mp)
    + 0.0572 * sin(2*D - M - Mp)
    + 0.0533 * sin(2*D + Mp)
    + 0.0458 * sin(2*D - M)
    - 0.0409 * sin(2*Mp - 2*F)
    - 0.0347 * sin(Mp + 2*D)
    - 0.0306 * sin(M + Mp)
    + 0.0243 * sin(2*F)
    + 0.0205 * sin(2*D - M - 2*Mp);

  const beta = 5.1282 * sin(F)
    + 0.2806 * sin(Mp + F)
    + 0.2777 * sin(Mp - F)
    + 0.1732 * sin(2*D - F)
    + 0.0554 * sin(2*D + F - Mp)
    + 0.0463 * sin(2*D - F - Mp)
    - 0.0326 * sin(F - Mp);

  return { longitude: mod360(lambda), latitude: beta, distance: 385001 };
}

const PLANET_ELEMENTS = {
  Mercury: {
    L: [252.2509, 149472.6746358], e: [0.20563175, 0.000020407],
    i: [7.004986, -0.0059516],   w: [77.4561,   0.1588643],
    Om:[48.3306,  -0.1253408],   a: 0.38709927
  },
  Venus: {
    L: [181.9798, 58517.8156760], e: [0.00677188, -0.000047766],
    i: [3.394662,  0.0010037],   w: [131.5637,  0.5688938],
    Om:[76.6799,  -0.2780559],   a: 0.72333566
  },
  Mars: {
    L: [355.4330, 19140.2993313], e: [0.09341233,  0.000090484],
    i: [1.849691, -0.0006010],   w: [336.0602,  0.4439016],
    Om:[49.5574,  -0.2950282],   a: 1.52371034
  },
  Jupiter: {
    L: [34.3515, 3034.9056606],  e: [0.04849485, 0.000163244],
    i: [1.303270, -0.0019933],   w: [14.3312,   0.2155209],
    Om:[100.4644,  0.1767232],   a: 5.20288700
  },
  Saturn: {
    L: [50.0774, 1222.1137943],  e: [0.05550825, -0.000346641],
    i: [2.488878,  0.0025515],   w: [92.8680,   0.5640291],
    Om:[113.6634, -0.2566722],   a: 9.53667594
  },
  Uranus: {
    L: [314.0550,  428.4669983], e: [0.04629590, -0.000027337],
    i: [0.773197, -0.0016869],   w: [170.9642,   0.4931992],
    Om:[74.0060,   0.0741461],   a: 19.18916464
  },
  Neptune: {
    L: [304.3487,  218.4862002], e: [0.00898809,  0.000006408],
    i: [1.769952, -0.0093082],   w: [44.9710,   -0.3249610],
    Om:[131.7841,  -0.0061651],   a: 30.06992276
  },
  // Chiron (2060) Keplerian elements at J2000.0. Orbit is chaotic; this
  // approximation is good within ~0.5° for the 20th–21st centuries.
  Chiron: {
    L: [217.59, 714.79],            e: [0.3825, 0],
    i: [6.9328, 0],                 w: [189.01, 0],   // longitude of perihelion ϖ
    Om: [209.3914, 0],              a: 13.6691
  },
};

function planetPosition(jd, planetName) {
  const el = PLANET_ELEMENTS[planetName];
  if (!el) return null;

  const T = (jd - 2451545.0) / 36525;

  // L = mean longitude, wbar (ϖ) = longitude of perihelion (from equinox),
  // Om (Ω) = longitude of ascending node, w (ω) = argument of perihelion = ϖ - Ω.
  const L    = mod360(el.L[0]  + el.L[1]  * T);
  const ecc  = el.e[0]  + el.e[1]  * T;
  const inc  = el.i[0]  + el.i[1]  * T;
  const wbar = el.w[0]  + el.w[1]  * T;
  const Om   = el.Om[0] + el.Om[1] * T;
  const w    = wbar - Om;
  const a    = el.a;

  const M = mod360(L - wbar);
  let E = M * DEG;
  for (let i = 0; i < 12; i++) {
    E = E - (E - ecc * Math.sin(E) - M * DEG) / (1 - ecc * Math.cos(E));
  }

  const x_orb = a * (Math.cos(E) - ecc);
  const y_orb = a * Math.sqrt(1 - ecc * ecc) * Math.sin(E);

  const wRad = w * DEG, OmRad = Om * DEG, incRad = inc * DEG;
  const cw = Math.cos(wRad), sw = Math.sin(wRad);
  const cO = Math.cos(OmRad), sO = Math.sin(OmRad);
  const ci = Math.cos(incRad), si = Math.sin(incRad);

  // Heliocentric ecliptic coordinates of the planet
  const xh = x_orb * (cO*cw - sO*sw*ci) - y_orb * (cO*sw + sO*cw*ci);
  const yh = x_orb * (sO*cw + cO*sw*ci) - y_orb * (sO*sw - cO*cw*ci);
  const zh = x_orb * (sw*si)            + y_orb * (cw*si);

  // Heliocentric ecliptic coordinates of the Earth (= -Sun vector)
  const sun = sunPosition(jd);
  const R_sun = sun.distance;
  const xe_earth = -R_sun * cos(sun.longitude);
  const ye_earth = -R_sun * sin(sun.longitude);

  // Geocentric ecliptic = heliocentric planet - heliocentric earth
  const xg = xh - xe_earth;
  const yg = yh - ye_earth;
  const zg = zh;

  const lambda = mod360(atan2(yg, xg));
  const beta = asin(zg / Math.sqrt(xg*xg + yg*yg + zg*zg));
  const dist = Math.sqrt(xg*xg + yg*yg + zg*zg);

  return { longitude: lambda, latitude: beta, distance: dist };
}

function northNode(jd) {
  const T = (jd - 2451545.0) / 36525;
  const Om = mod360(125.0445479 - 1934.1362608 * T + 0.0020754 * T * T);
  return { longitude: Om, latitude: 0, distance: 0 };
}

function lilith(jd) {
  const T = (jd - 2451545.0) / 36525;
  const l = mod360(83.3532465 + 4069.0137287 * T - 0.0103200 * T * T);
  return { longitude: l, latitude: 0, distance: 0 };
}

function chiron(jd) {
  const pos = planetPosition(jd, 'Chiron');
  return pos || { longitude: 0, latitude: 0, distance: 0 };
}

function isRetrograde(jd, planetName) {
  if (!PLANET_ELEMENTS[planetName]) return false;
  const pos1 = planetPosition(jd - 1, planetName);
  const pos2 = planetPosition(jd + 1, planetName);
  if (!pos1 || !pos2) return false;
  let diff = pos2.longitude - pos1.longitude;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

const ZODIAC_SIGNS_BG = [
  { name: 'Овен',      symbol: '♈', element: 'Огън',  quality: 'Кардинален', ruler: 'Марс'  },
  { name: 'Телец',     symbol: '♉', element: 'Земя',  quality: 'Фиксиран',   ruler: 'Венера'},
  { name: 'Близнаци',  symbol: '♊', element: 'Въздух',quality: 'Мутабилен', ruler: 'Меркурий'},
  { name: 'Рак',       symbol: '♋', element: 'Вода',  quality: 'Кардинален', ruler: 'Луна'  },
  { name: 'Лъв',       symbol: '♌', element: 'Огън',  quality: 'Фиксиран',   ruler: 'Слънце'},
  { name: 'Дева',      symbol: '♍', element: 'Земя',  quality: 'Мутабилен', ruler: 'Меркурий'},
  { name: 'Везни',     symbol: '♎', element: 'Въздух',quality: 'Кардинален', ruler: 'Венера'},
  { name: 'Скорпион',  symbol: '♏', element: 'Вода',  quality: 'Фиксиран',   ruler: 'Плутон'},
  { name: 'Стрелец',   symbol: '♐', element: 'Огън',  quality: 'Мутабилен', ruler: 'Юпитер'},
  { name: 'Козирог',   symbol: '♑', element: 'Земя',  quality: 'Кардинален', ruler: 'Сатурн'},
  { name: 'Водолей',   symbol: '♒', element: 'Въздух',quality: 'Фиксиран',   ruler: 'Уран'  },
  { name: 'Риби',      symbol: '♓', element: 'Вода',  quality: 'Мутабилен', ruler: 'Нептун'},
];

function getZodiacSign(longitude) {
  const idx = Math.floor(((longitude % 360) + 360) % 360 / 30);
  const degree = longitude % 30;
  return { ...ZODIAC_SIGNS_BG[idx], degree: degree.toFixed(2), index: idx };
}

function getDegreeInSign(longitude) {
  return ((longitude % 30) + 30) % 30;
}

module.exports = {
  julianDay,
  sunPosition,
  moonPosition,
  planetPosition,
  northNode,
  lilith,
  chiron,
  isRetrograde,
  getZodiacSign,
  getDegreeInSign,
  mod360,
  ZODIAC_SIGNS_BG,
};
