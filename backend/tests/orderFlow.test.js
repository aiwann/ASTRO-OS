'use strict';

// Smoke test: end-to-end order pipeline WITHOUT Stripe.
// Run:  ANTHROPIC_API_KEY=sk-ant-... node tests/orderFlow.test.js
//
// Generates a merged PDF for a fake customer using catalog items.
// Edit `TEST_ITEM_IDS` below to test different combinations.

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const orderService = require('../services/orderService');

const TEST_ITEM_IDS = [1, 'B2', 'B4']; // mix: 1 main + 2 bumps

const fakeCustomer = {
  name: 'Иван Тестов',
  gender: 'male',
  birthDate: '1990-01-15',
  birthTime: '14:30',
  birthPlace: 'София, България',
};

async function main() {
  console.log('━'.repeat(60));
  console.log('  ORDER FLOW SMOKE TEST');
  console.log('━'.repeat(60));
  console.log(`  Items:    ${TEST_ITEM_IDS.join(', ')}`);
  console.log(`  Customer: ${fakeCustomer.name}`);
  console.log(`  Email:    (will skip actual send)`);
  console.log('━'.repeat(60));

  // Monkey-patch email send so we don't need Resend configured
  const emailMod = require('../services/emailService');
  const origSend = emailMod.sendAnalysisEmail;
  emailMod.sendAnalysisEmail = async ({ pdfPath, productTitle }) => {
    console.log(`\n📩 [stub] would email "${productTitle}" with attachment: ${pdfPath}`);
    // Copy PDF somewhere persistent for inspection
    const fs = require('fs');
    const path = require('path');
    const out = path.join(__dirname, `test-output-${Date.now()}.pdf`);
    fs.copyFileSync(pdfPath, out);
    console.log(`   💾 PDF copied to: ${out}`);
  };

  try {
    const t0 = Date.now();
    const result = await orderService.processOrder({
      itemIds: TEST_ITEM_IDS,
      customerData: fakeCustomer,
      email: 'test@example.com',
    });
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`\n✅ SUCCESS in ${elapsed}s`);
    console.log(`   Sections generated: ${result.sections}`);
    console.log(`   Failures:           ${result.failures.length}`);
    if (result.failures.length) console.log('  ', result.failures);
  } catch (err) {
    console.error('\n❌ FAILED:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    emailMod.sendAnalysisEmail = origSend;
  }
}

main();
