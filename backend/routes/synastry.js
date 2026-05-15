'use strict';

const express = require('express');
const router  = express.Router();
const synastryService = require('../services/synastryService');

router.post('/', async (req, res) => {
  const { name1, birthDate1, birthTime1, birthPlace1, lat1, lon1,
          name2, birthDate2, birthTime2, birthPlace2, lat2, lon2 } = req.body;

  if (!name1 || !birthDate1 || !name2 || !birthDate2) {
    return res.status(400).json({ error: 'Липсват задължителни полета: name1, birthDate1, name2, birthDate2' });
  }
  if (!birthPlace1 && (lat1 == null || lon1 == null)) {
    return res.status(400).json({ error: 'Необходими са birthPlace1 или lat1/lon1' });
  }
  if (!birthPlace2 && (lat2 == null || lon2 == null)) {
    return res.status(400).json({ error: 'Необходими са birthPlace2 или lat2/lon2' });
  }

  try {
    const result = await synastryService.analyze(req.body);
    res.json(result);
  } catch (err) {
    console.error('[Synastry]', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
