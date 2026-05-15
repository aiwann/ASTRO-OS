const axios = require('axios');

async function geocodeLocation(placeName) {
  const url = 'https://nominatim.openstreetmap.org/search';
  const response = await axios.get(url, {
    params: {
      q: placeName,
      format: 'json',
      limit: 1,
      addressdetails: 1,
    },
    headers: {
      'User-Agent': 'AstroOS/1.0 (personal-local-app)',
      'Accept-Language': 'bg,en',
    },
    timeout: 10000,
  });

  if (!response.data || response.data.length === 0) {
    throw new Error(`Не е намерено местоположение за: "${placeName}"`);
  }

  const result = response.data[0];
  return {
    lat: parseFloat(result.lat),
    lon: parseFloat(result.lon),
    displayName: result.display_name,
    country: result.address?.country || '',
    city: result.address?.city || result.address?.town || result.address?.village || placeName,
  };
}

module.exports = { geocodeLocation };
