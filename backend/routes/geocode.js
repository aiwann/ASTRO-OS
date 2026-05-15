'use strict';

const express = require('express');
const router  = express.Router();
const axios   = require('axios');
const geoTz   = require('geo-tz');

function tzFor(lat, lon) {
  try {
    const zones = geoTz.find(lat, lon);
    return Array.isArray(zones) && zones.length > 0 ? zones[0] : null;
  } catch {
    return null;
  }
}

router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.json([]);

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: q.trim(),
        format: 'json',
        limit: 7,
        addressdetails: 1,
        featuretype: 'settlement',
        'accept-language': 'bg,en',
      },
      headers: {
        'User-Agent': 'AstroOS/1.0 (personal-local-app)',
      },
      timeout: 8000,
    });

    const results = (response.data || []).map(r => {
      const lat = parseFloat(r.lat);
      const lon = parseFloat(r.lon);
      return {
        displayName: r.display_name,
        city: r.address?.city || r.address?.town || r.address?.village || r.address?.county || q,
        country: r.address?.country || '',
        lat,
        lon,
        timezone: tzFor(lat, lon),
      };
    });

    res.json(results);
  } catch (err) {
    res.json([]);
  }
});

module.exports = router;
