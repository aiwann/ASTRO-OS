'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');

// Bundled fonts (preferred — always available)
const BUNDLED = path.join(__dirname, '..', 'assets', 'fonts');

// Candidate Cyrillic + Unicode-symbol-capable TTF fonts per platform
const FONT_CANDIDATES = {
  regular: [
    // Bundled (cross-platform, supports zodiac symbols ♈-♓ and ★◆☽☀)
    path.join(BUNDLED, 'DejaVuSans.ttf'),
    // macOS
    '/Library/Fonts/Arial Unicode.ttf',
    '/System/Library/Fonts/Supplemental/Arial.ttf',
    // Windows
    'C:\\Windows\\Fonts\\arialuni.ttf',
    'C:\\Windows\\Fonts\\arial.ttf',
    // Linux
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
    '/usr/share/fonts/truetype/freefont/FreeSerif.ttf',
  ],
  bold: [
    path.join(BUNDLED, 'DejaVuSans-Bold.ttf'),
    // macOS
    '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
    '/Library/Fonts/Arial Bold.ttf',
    // Windows
    'C:\\Windows\\Fonts\\arialbd.ttf',
    // Linux
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
  ],
  italic: [
    path.join(BUNDLED, 'DejaVuSans-Oblique.ttf'),
    // macOS
    '/System/Library/Fonts/Supplemental/Arial Italic.ttf',
    '/Library/Fonts/Arial Italic.ttf',
    // Windows
    'C:\\Windows\\Fonts\\ariali.ttf',
    // Linux
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Italic.ttf',
  ],
};

const _cache = {};

function findFont(variant = 'regular') {
  if (_cache[variant]) return _cache[variant];

  const candidates = FONT_CANDIDATES[variant] || FONT_CANDIDATES.regular;
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      console.log(`[FontResolver] Using ${variant}: ${p}`);
      _cache[variant] = p;
      return p;
    }
  }

  // Final fallback: if bold/italic not found, use regular
  if (variant !== 'regular' && _cache.regular) {
    console.warn(`[FontResolver] ${variant} font not found, falling back to regular`);
    _cache[variant] = _cache.regular;
    return _cache[variant];
  }

  throw new Error(
    `No Cyrillic-capable TTF font found on this system. ` +
    `Install Arial Unicode or DejaVu Sans for PDF Cyrillic support.`
  );
}

module.exports = { findFont };
