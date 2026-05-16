'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const fs       = require('fs');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3001',
    'http://localhost:3000',
    /\.netlify\.app$/,
    /\.railway\.app$/,
    /astro-os\.net$/,
  ]
}));
app.use(express.json({
  limit: '10mb',
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  },
}));
app.use(express.urlencoded({ extended: true }));

app.use('/api/settings',  require('./routes/settings'));
app.use('/api/reports',   require('./routes/reports'));
app.use('/api/ai',        require('./routes/ai'));
app.use('/api/export',    require('./routes/export'));
app.use('/api/geocode',   require('./routes/geocode'));
app.use('/api/synastry',  require('./routes/synastry'));
app.use('/api/products',  require('./routes/products'));
app.use('/api/payments',  require('./routes/payments'));

// Validate the astrology engine on boot. /api/health exposes the result so
// the UI can surface failures. reportService also calls assertEngineValid()
// before any AI interpretation, so a broken engine cannot ship a report.
const { getValidationStatus, formatValidationReport } = require('./astrology/validation');
const _validation = getValidationStatus();
console.log(formatValidationReport(_validation));
if (!_validation.pass) {
  console.error('\n⚠️  Astrology engine FAILED validation. Reports will be blocked.');
} else {
  console.log(`\n✓ Astrology engine validated (${_validation.totalChecks} checks).`);
}

app.get('/api/health', (req, res) => {
  const v = getValidationStatus();
  res.status(v.pass ? 200 : 503).json({
    status: v.pass ? 'ok' : 'engine_invalid',
    validation: {
      pass: v.pass,
      totalChecks: v.totalChecks,
      failedCount: v.failedCount,
      failures: v.failures.map(f => ({ name: f.name, detail: f.detail })),
    },
  });
});

const frontendDist = path.join(__dirname, '../frontend/dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Вътрешна грешка на сървъра' });
});

app.listen(PORT, () => {
  console.log(`🌟 Astro OS Backend: http://localhost:${PORT}`);
});

module.exports = app;
