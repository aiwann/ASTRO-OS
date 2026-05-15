'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');

// Candidate Cyrillic-capable TTF fonts per platform
const FONT_CANDIDATES = {
  regular: [
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
