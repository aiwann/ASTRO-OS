'use strict';

const express = require('express');
const router  = express.Router();
const db = require('../database/db');
const { encrypt, decrypt } = require('../utils/encryption');
const { testConnection } = require('../services/anthropicService');

router.get('/', async (req, res) => {
  try {
    const row = await db.prepare('SELECT id, model, updated_at FROM settings WHERE id = 1').get();
    res.json({ hasKey: !!row?.id, model: row?.model || 'claude-sonnet-4-5', updatedAt: row?.updated_at });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { apiKey, model } = req.body;
  if (apiKey && !apiKey.startsWith('sk-')) {
    return res.status(400).json({ error: 'Невалиден API ключ. Трябва да започва с "sk-"' });
  }

  try {
    const existing = await db.prepare('SELECT id, encrypted_api_key, encryption_iv FROM settings WHERE id = 1').get();

    if (apiKey) {
      const { encrypted, iv } = encrypt(apiKey);
      if (existing) {
        await db.prepare('UPDATE settings SET encrypted_api_key = ?, encryption_iv = ?, model = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1')
          .run(encrypted, iv, model || 'claude-sonnet-4-5');
      } else {
        await db.prepare('INSERT INTO settings (id, encrypted_api_key, encryption_iv, model) VALUES (1, ?, ?, ?)')
          .run(encrypted, iv, model || 'claude-sonnet-4-5');
      }
    } else if (existing && model) {
      await db.prepare('UPDATE settings SET model = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1')
        .run(model);
    }

    res.json({ success: true, message: 'Настройките са запазени' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/test', async (req, res) => {
  try {
    const { apiKey } = req.body;
    let keyToTest = apiKey;
    if (!keyToTest) {
      const row = await db.prepare('SELECT encrypted_api_key, encryption_iv FROM settings WHERE id = 1').get();
      if (!row) throw new Error('Няма запазен API ключ');
      keyToTest = decrypt(row.encrypted_api_key, row.encryption_iv);
    }
    const result = await testConnection(keyToTest);
    res.json({ success: true, message: result });
  } catch (err) {
    res.status(400).json({ error: `Грешка при свързване: ${err.message}` });
  }
});

router.delete('/', async (req, res) => {
  await db.prepare('DELETE FROM settings WHERE id = 1').run();
  res.json({ success: true });
});

module.exports = router;
