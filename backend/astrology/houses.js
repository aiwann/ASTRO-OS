'use strict';

const { mod360 } = require('./ephemeris');
const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

function obliquity(T) {
  return 23.439291111 - 0.013004167 * T - 0.000000164 * T * T + 0.000000504 * T * T * T;
}

function gmst(jd) {
  const T = (jd - 2451545.0) / 36525;
  let g = 280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T - T * T * T / 38710000;
  return mod360(g);
}

function localSiderealTime(jd, lonDeg) {
  return mod360(gmst(jd) + lonDeg);
}

function ascendant(jd, latDeg, lonDeg) {
  // Meeus, Astronomical Algorithms, ch. 13 (eq. 13.5)
  // atan2 form handles the correct quadrant automatically.
  const T = (jd - 2451545.0) / 36525;
  const eps = obliquity(T) * DEG;
  const lst = localSiderealTime(jd, lonDeg) * DEG;
  const lat = latDeg * DEG;

  const asc = Math.atan2(
    Math.cos(lst),
    -(Math.sin(lst) * Math.cos(eps) + Math.tan(lat) * Math.sin(eps))
  ) * RAD;

  return mod360(asc);
}

function midheaven(jd, lonDeg) {
  const T = (jd - 2451545.0) / 36525;
  const eps = obliquity(T) * DEG;
  const lst = localSiderealTime(jd, lonDeg) * DEG;
  let mc = Math.atan2(Math.tan(lst), Math.cos(eps)) * RAD;
  if (mc < 0) mc += 360;
  if (Math.cos(lst) < 0) mc += 180;
  return mod360(mc);
}

// Porphyry house system: trisect each of the four quadrants (ASC→IC→DSC→MC→ASC)
// evenly along the ecliptic. Simpler than true Placidus but produces correct
// angular relationships (H1=ASC, H4=IC, H7=DSC, H10=MC).
function placidusHouses(jd, latDeg, lonDeg) {
  const asc = ascendant(jd, latDeg, lonDeg);
  const mc  = midheaven(jd, lonDeg);
  const ic  = mod360(mc + 180);
  const dsc = mod360(asc + 180);

  const arc1 = mod360(ic  - asc);  // ASC → IC
  const arc2 = mod360(dsc - ic);   // IC → DSC
  const arc3 = mod360(mc  - dsc);  // DSC → MC
  const arc4 = mod360(asc - mc);   // MC → ASC

  return [
    asc,                                // H1
    mod360(asc + arc1 / 3),             // H2
    mod360(asc + 2 * arc1 / 3),         // H3
    ic,                                 // H4
    mod360(ic  + arc2 / 3),             // H5
    mod360(ic  + 2 * arc2 / 3),         // H6
    dsc,                                // H7
    mod360(dsc + arc3 / 3),             // H8
    mod360(dsc + 2 * arc3 / 3),         // H9
    mc,                                 // H10
    mod360(mc  + arc4 / 3),             // H11
    mod360(mc  + 2 * arc4 / 3),         // H12
  ];
}

function getHouseForPlanet(longitude, houseCusps) {
  const lon = mod360(longitude);
  for (let i = 0; i < 12; i++) {
    const start = houseCusps[i];
    const end   = houseCusps[(i + 1) % 12];
    if (start <= end) {
      if (lon >= start && lon < end) return i + 1;
    } else {
      if (lon >= start || lon < end) return i + 1;
    }
  }
  return 1;
}

const HOUSE_MEANINGS_BG = [
  'Личност и тяло',
  'Пари и имущество',
  'Комуникация и братя',
  'Дом и семейство',
  'Творчество и деца',
  'Здраве и работа',
  'Партньорства',
  'Трансформация и наследство',
  'Философия и пътувания',
  'Кариера и статус',
  'Приятели и надежди',
  'Тайни и духовност',
];

module.exports = {
  ascendant,
  midheaven,
  placidusHouses,
  getHouseForPlanet,
  localSiderealTime,
  HOUSE_MEANINGS_BG,
};
