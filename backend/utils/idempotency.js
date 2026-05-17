'use strict';

// Tracks IDs of already-processed events (Stripe webhook events, primarily) so
// that retried deliveries don't double-charge AI or double-send email.
//
// Storage: in-memory Set backed by a JSON file on disk. Loaded once at startup,
// rewritten (atomic temp-file rename) on every new mark. Entries older than the
// retention window are pruned on load.
//
// Railway note: the OS temp dir survives within a container's lifetime but not
// across deploys. Stripe retries cluster within minutes/hours of the original
// event, so this catches ~all real-world replays. For full cross-deploy
// durability, swap STORE_PATH onto a persistent volume.

const fs = require('fs');
const path = require('path');
const os = require('os');

const STORE_DIR = path.join(os.tmpdir(), 'astro-os-state');
const STORE_PATH = path.join(STORE_DIR, 'processed-events.json');
const RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });

// Map<eventId, processedAt(ms)>
const processed = new Map();
let loaded = false;

function load() {
  if (loaded) return;
  loaded = true;
  try {
    if (!fs.existsSync(STORE_PATH)) return;
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const data = JSON.parse(raw);
    const cutoff = Date.now() - RETENTION_MS;
    for (const [id, ts] of Object.entries(data)) {
      if (typeof ts === 'number' && ts >= cutoff) processed.set(id, ts);
    }
    console.log(`[Idempotency] Loaded ${processed.size} processed event(s) from disk`);
  } catch (err) {
    console.warn('[Idempotency] Failed to load store:', err.message);
  }
}

function persist() {
  try {
    const obj = Object.fromEntries(processed);
    const tmp = `${STORE_PATH}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(obj));
    fs.renameSync(tmp, STORE_PATH); // atomic on POSIX
  } catch (err) {
    console.warn('[Idempotency] Failed to persist store:', err.message);
  }
}

function isProcessed(eventId) {
  load();
  return processed.has(eventId);
}

function markProcessed(eventId) {
  load();
  processed.set(eventId, Date.now());
  persist();
}

module.exports = { isProcessed, markProcessed };
