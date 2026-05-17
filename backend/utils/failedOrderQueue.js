'use strict';

// Dead-letter queue for failed email deliveries.
// When sendAnalysisEmail() throws, orderService copies the PDF to a safe
// directory and writes one JSONL record here. Run:
//   node backend/tools/resendFailed.js
// to retry all unresolved entries.

const fs   = require('fs');
const path = require('path');
const os   = require('os');
const crypto = require('crypto');

const QUEUE_DIR  = path.join(os.tmpdir(), 'astro-os-failed');
const QUEUE_FILE = path.join(QUEUE_DIR, 'failed-orders.jsonl');
const PDF_DIR    = path.join(QUEUE_DIR, 'pdfs');

for (const d of [QUEUE_DIR, PDF_DIR]) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

/**
 * Save a failed order's PDF and write a DLQ record.
 * Returns the path where the PDF was copied (safe location).
 */
function enqueue({ email, customerName, productTitle, pdfPath, error }) {
  const id      = crypto.randomUUID();
  const safePdf = path.join(PDF_DIR, `${id}.pdf`);

  try {
    fs.copyFileSync(pdfPath, safePdf);
  } catch (copyErr) {
    console.error('[DLQ] Could not copy PDF:', copyErr.message);
  }

  const record = {
    id,
    timestamp: Date.now(),
    email,
    customerName,
    productTitle,
    pdfPath: safePdf,
    error: String(error),
    resolved: false,
  };

  try {
    fs.appendFileSync(QUEUE_FILE, JSON.stringify(record) + '\n', 'utf8');
    console.error(`[DLQ] Saved failed order → ${QUEUE_FILE} (id=${id})`);
    console.error(`[DLQ] PDF preserved at: ${safePdf}`);
    console.error(`[DLQ] Run: node backend/tools/resendFailed.js  to retry`);
  } catch (writeErr) {
    console.error('[DLQ] Could not write queue file:', writeErr.message);
  }

  return safePdf;
}

/** Read all unresolved entries. */
function listPending() {
  if (!fs.existsSync(QUEUE_FILE)) return [];
  return fs.readFileSync(QUEUE_FILE, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => { try { return JSON.parse(line); } catch { return null; } })
    .filter((r) => r && !r.resolved);
}

/** Mark an entry resolved by id (rewrites the whole file). */
function markResolved(id) {
  if (!fs.existsSync(QUEUE_FILE)) return;
  const lines = fs.readFileSync(QUEUE_FILE, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try {
        const r = JSON.parse(line);
        return JSON.stringify(r.id === id ? { ...r, resolved: true, resolvedAt: Date.now() } : r);
      } catch { return line; }
    });
  fs.writeFileSync(QUEUE_FILE, lines.join('\n') + '\n', 'utf8');
}

module.exports = { enqueue, listPending, markResolved, QUEUE_FILE };
