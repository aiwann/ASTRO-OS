'use strict';

/**
 * Standalone email test — генерира малък dummy PDF и изпраща
 * имейла през sendAnalysisEmail без да минава през AI pipeline-а.
 *
 * Употреба:  node test-email.js [recipient@example.com]
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const fs = require('fs');
const path = require('path');
const os = require('os');
const PDFDocument = require('pdfkit');
const { sendAnalysisEmail } = require('./services/emailService');

const recipient = process.argv[2] || 'asvision.bussiness@gmail.com';
const pdfPath = path.join(os.tmpdir(), `astro-os-email-test-${Date.now()}.pdf`);

function makeDummyPDF() {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 60 });
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    doc.fontSize(28).fillColor('#d4af37').text('ТЕСТОВ PDF', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).fillColor('#333').text(
      'Това е dummy PDF файл за тест на имейл шаблона. Реалният анализ не е генериран.',
      { align: 'center' }
    );
    doc.moveDown(2);
    doc.fontSize(11).fillColor('#666').text(`Generated: ${new Date().toISOString()}`, { align: 'center' });

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

(async () => {
  try {
    console.log(`📄 Генериране на dummy PDF: ${pdfPath}`);
    await makeDummyPDF();
    console.log(`📧 Изпращане на имейл към: ${recipient}`);

    const result = await sendAnalysisEmail({
      to: recipient,
      customerName: 'Иван Тестов',
      productTitle: 'Личен Астро Код',
      pdfPath,
    });

    console.log('✅ Успех:', result);
  } catch (err) {
    console.error('❌ Грешка:', err.message);
    process.exit(1);
  } finally {
    try { fs.unlinkSync(pdfPath); } catch {}
  }
})();
