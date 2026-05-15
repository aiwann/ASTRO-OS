'use strict';

const express = require('express');
const router  = express.Router();
const db = require('../database/db');
const reportService = require('../services/reportService');
const ExportService = require('../services/exportService');
const { generateText } = require('../services/anthropicService');
const { SECTION_PROMPTS } = require('../prompts/sectionPrompts');

const SECTION_ORDER = [
  'personality',
  'emotional',
  'love',
  'career',
  'spiritual',
  'angel',
  'question',
  'forecast',
];

/**
 * POST /api/products/order
 *
 * Приема поръчка и отговаря ВЕДНАГА с 200 OK.
 * Анализът се генерира асинхронно на заден план (2-5 мин) и след това
 * се изпраща на имейла на клиента като PDF.
 */
router.post('/order', async (req, res) => {
  // Валидирай входните данни
  const { productType, customerData, email } = req.body;
  if (!productType || !email || !customerData) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Отговори ВЕДНАГА
  res.json({
    success: true,
    message: 'Поръчката е приета. Анализът ще бъде изпратен на имейл.',
  });

  // Генерирай АСИНХРОННО на заден план — НЕ await-вай тук
  processOrder(req.body).catch((err) => {
    console.error('[OrderService] Background processing error:', err);
  });
});

/**
 * Background processing pipeline:
 * 1) Подготвя данните (geocoding + натална карта + нумерология)
 * 2) Създава DB запис със статус 'generating'
 * 3) Генерира всички секции през Anthropic (non-streaming)
 * 4) Запазва финалния доклад в DB
 * 5) Генерира PDF
 * 6) Изпраща на имейла на клиента
 */
async function processOrder({ productType, customerData, email }) {
  console.log(`[OrderService] Започва обработка за ${email} (${productType})`);

  const input = {
    name:       customerData.name,
    gender:     customerData.gender,
    birthDate:  customerData.birthDate,
    birthTime:  customerData.birthTime || '',
    birthPlace: customerData.birthPlace,
    question:   customerData.question || '',
    category:   productType,
  };

  // 1) Подготовка
  const reportData = await reportService.prepareReportData(input);

  // 2) DB запис
  const reportId = await reportService.createReportRecord(input, reportData.geo);

  await db.prepare(
    'UPDATE reports SET astrology_data = ?, numerology_data = ? WHERE id = ?'
  ).run(
    JSON.stringify(reportData.natal),
    JSON.stringify(reportData.numerology),
    reportId
  );

  // 3) Генерирай секции (non-streaming, една по една)
  const sections = {};
  for (const sectionKey of SECTION_ORDER) {
    if (sectionKey === 'question' && !reportData.user.question) continue;
    const promptConfig = SECTION_PROMPTS[sectionKey](reportData);
    const text = await generateText(promptConfig.system, promptConfig.prompt, {
      maxTokens: 2500,
    });
    sections[sectionKey] = {
      title: reportService.SECTION_TITLES[sectionKey],
      content: text,
    };
  }

  const fullReport = SECTION_ORDER
    .filter((k) => sections[k])
    .map((k) => `## ${sections[k].title}\n\n${sections[k].content}`)
    .join('\n\n---\n\n');

  // 4) Запази в DB
  await db.prepare(`
    UPDATE reports SET
      sections = ?,
      full_report = ?,
      status = 'complete'
    WHERE id = ?
  `).run(JSON.stringify(sections), fullReport, reportId);

  // 5) Генерирай PDF
  const report = await reportService.getReport(reportId);
  const pdfBuffer = await ExportService.generatePDF(
    report,
    sections,
    reportData.natal,
    reportData.numerology
  );

  // 6) Изпрати на имейла
  // TODO: интегрирай реален email service (Resend / SendGrid / SMTP)
  await sendReportEmail(email, pdfBuffer, customerData.name, productType);

  console.log(`[OrderService] Готово — report #${reportId} изпратен на ${email}`);
}

/**
 * Stub — заменѝ с реален email provider (Resend / SendGrid / Nodemailer).
 * Засега само логва, че имейлът би бил изпратен.
 */
async function sendReportEmail(email, pdfBuffer, name, productType) {
  console.log(
    `[Email STUB] Към: ${email} | Продукт: ${productType} | PDF: ${pdfBuffer?.length || 0} bytes`
  );
  // Пример с Resend:
  // const { Resend } = require('resend');
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'Астро ОС <noreply@astro-os.com>',
  //   to: email,
  //   subject: 'Твоят анализ е готов ✦',
  //   html: `<p>Здравей ${name},</p><p>Прикачен е твоят персонален анализ.</p>`,
  //   attachments: [{ filename: 'astro-os-analysis.pdf', content: pdfBuffer }],
  // });
}

module.exports = router;
