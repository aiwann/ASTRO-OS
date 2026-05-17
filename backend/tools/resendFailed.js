'use strict';

// Resend emails for all unresolved DLQ entries.
// Run from the backend directory:
//   ANTHROPIC_API_KEY=... node tools/resendFailed.js
//   node tools/resendFailed.js --dry-run    ← list only, no sends

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { listPending, markResolved, QUEUE_FILE } = require('../utils/failedOrderQueue');
const { sendAnalysisEmail } = require('../services/emailService');
const fs = require('fs');

const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  const pending = listPending();

  if (pending.length === 0) {
    console.log('✅ No pending failed orders — all good.');
    return;
  }

  console.log(`📬 Found ${pending.length} unresolved order(s) in ${QUEUE_FILE}\n`);

  for (const entry of pending) {
    const d = new Date(entry.timestamp).toLocaleString('bg-BG');
    console.log(`── ${entry.id}`);
    console.log(`   📧 ${entry.email}  (${entry.customerName})`);
    console.log(`   📄 ${entry.productTitle}`);
    console.log(`   ❌ Failed at: ${d}`);
    console.log(`   Error: ${entry.error}`);

    if (!fs.existsSync(entry.pdfPath)) {
      console.log(`   ⚠️  PDF not found at ${entry.pdfPath} — cannot resend\n`);
      continue;
    }

    if (DRY_RUN) {
      console.log(`   ↳ [dry-run] would resend PDF: ${entry.pdfPath}\n`);
      continue;
    }

    try {
      await sendAnalysisEmail({
        to: entry.email,
        customerName: entry.customerName,
        productTitle: entry.productTitle,
        pdfPath: entry.pdfPath,
      });
      markResolved(entry.id);
      console.log(`   ✅ Sent & marked resolved\n`);
    } catch (err) {
      console.error(`   ❌ Still failing: ${err.message}\n`);
    }
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
