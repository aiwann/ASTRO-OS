'use strict';

const {
  julianDay, sunPosition, moonPosition, planetPosition,
  northNode, lilith, chiron, isRetrograde, getZodiacSign, mod360,
} = require('../astrology/ephemeris');
const { ascendant, midheaven, placidusHouses, getHouseForPlanet, HOUSE_MEANINGS_BG } = require('../astrology/houses');
const { findAspects, getDominantPlanets, getDominantElement, getDominantQuality } = require('../astrology/aspects');

function parseDateTime(dateStr, timeStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  let hour = 12, minute = 0;
  if (timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    hour = h || 12;
    minute = m || 0;
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
  const { year, month, day, hour, minute } = parseDateTime(birthDate, birthTime);
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
  const dominantElement = getDominantElement({
    sun: buildPlanetData('Слънце', sunPos, houseCusps),
    moon: buildPlanetData('Луна', moonPos, houseCusps),
    ...Object.fromEntries(planetNames.map(n => [n, buildPlanetData(n, planetPosition(jd, n), houseCusps)]).filter(([,v]) => v != null)),
  });
  const dominantQuality = getDominantQuality({
    sun: { sign: getZodiacSign(sunPos.longitude) },
    moon: { sign: getZodiacSign(moonPos.longitude) },
    ...Object.fromEntries(planetNames.map(n => {
      const p = planetPosition(jd, n);
      return p ? [n, { sign: getZodiacSign(p.longitude) }] : [n, null];
    }).filter(([,v]) => v != null)),
  });

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
