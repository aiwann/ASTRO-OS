'use strict';

const sqlite3 = require('sqlite3').verbose();
const path    = require('path');
const fs      = require('fs');
const os      = require('os');

const DB_DIR  = path.join(os.homedir(), '.astro-os');
const DB_PATH = path.join(DB_DIR, 'astro.db');
const SCHEMA  = path.join(__dirname, 'schema.sql');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const _db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error('DB open error:', err);
});

_db.serialize(() => {
  _db.run('PRAGMA journal_mode = WAL');
  _db.run('PRAGMA foreign_keys = ON');
  const schema = fs.readFileSync(SCHEMA, 'utf-8');
  _db.exec(schema);
});

function prepare(sql) {
  return {
    run: (...args) => new Promise((resolve, reject) => {
      const params = args.flat();
      _db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastInsertRowid: this.lastID, changes: this.changes });
      });
    }),
    get: (...args) => new Promise((resolve, reject) => {
      const params = args.flat();
      _db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    }),
    all: (...args) => new Promise((resolve, reject) => {
      const params = args.flat();
      _db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    }),
  };
}

function exec(sql) {
  return new Promise((resolve, reject) => {
    _db.exec(sql, err => { if (err) reject(err); else resolve(); });
  });
}

module.exports = { prepare, exec };
