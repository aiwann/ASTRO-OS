'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const EXPORT_DIR = path.join(os.tmpdir(), 'astro-os-exports');

if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

function generateFileName(reportName, extension) {
  const sanitized = reportName.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
  const timestamp = Date.now();
  return `${sanitized}-${timestamp}.${extension}`;
}

function getTempPath(filename) {
  return path.join(EXPORT_DIR, filename);
}

function writeFile(filename, data) {
  const filepath = getTempPath(filename);
  if (Buffer.isBuffer(data)) {
    fs.writeFileSync(filepath, data);
  } else if (typeof data === 'string') {
    fs.writeFileSync(filepath, data, 'utf-8');
  } else {
    throw new Error('Invalid data type for writeFile');
  }
  return filepath;
}

function validateFile(filepath, minSize = 100) {
  if (!fs.existsSync(filepath)) throw new Error(`File not found: ${filepath}`);
  const stat = fs.statSync(filepath);
  if (stat.size < minSize) throw new Error(`File too small: ${stat.size} bytes`);
  return stat.size;
}

function readFile(filepath) {
  if (!fs.existsSync(filepath)) throw new Error(`File not found: ${filepath}`);
  return fs.readFileSync(filepath);
}

function cleanupFile(filepath) {
  try {
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  } catch (err) {
    console.warn('[TempFileManager] cleanup warning:', err.message);
  }
}

function cleanupOldFiles(ageMs = 24 * 60 * 60 * 1000) {
  try {
    const files = fs.readdirSync(EXPORT_DIR);
    const now = Date.now();
    for (const file of files) {
      const filepath = getTempPath(file);
      const stat = fs.statSync(filepath);
      if (now - stat.mtimeMs > ageMs) {
        fs.unlinkSync(filepath);
      }
    }
  } catch (err) {
    console.warn('[TempFileManager] cleanup old files error:', err.message);
  }
}

module.exports = {
  EXPORT_DIR,
  generateFileName,
  getTempPath,
  writeFile,
  validateFile,
  readFile,
  cleanupFile,
  cleanupOldFiles,
};
