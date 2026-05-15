'use strict';

const fs = require('fs');
const path = require('path');
const { Resend } = require('resend');

const LOG_PREFIX = '[EmailService]';

/**
 * Изпраща готовия PDF анализ до клиента.
 *
 * @param {Object} params
 * @param {string} params.to            — имейл на получателя
 * @param {string} params.customerName  — име за персонализация
 * @param {string} params.productTitle  — заглавие на продукта (напр. „Личен Астро Код")
 * @param {string} params.pdfPath       — абсолютен път към генерирания PDF файл
 * @returns {Promise<{success: true}>}
 */
async function sendAnalysisEmail({ to, customerName, productTitle, pdfPath }) {
  if (!to || !customerName || !productTitle || !pdfPath) {
    throw new Error('Липсват задължителни параметри: to, customerName, productTitle, pdfPath');
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from   = process.env.EMAIL_FROM;

  if (!apiKey) throw new Error('RESEND_API_KEY не е конфигуриран в .env');
  if (!from)   throw new Error('EMAIL_FROM не е конфигуриран в .env');

  if (!fs.existsSync(pdfPath)) {
    throw new Error(`PDF файлът не е намерен: ${pdfPath}`);
  }

  const pdfBuffer = fs.readFileSync(pdfPath);
  const filename  = path.basename(pdfPath);

  const html = `<!DOCTYPE html>
<html lang="bg">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:Georgia,'Times New Roman',serif;color:#e8dcc8;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0f;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="background:#14101e;border:1px solid #9a7d3a;border-radius:4px;padding:48px 40px;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <div style="font-size:22px;color:#d4af37;letter-spacing:4px;">✦  ☽  ✦</div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:8px;">
              <div style="font-size:11px;color:#c9a84c;letter-spacing:6px;">АСТРО КОД</div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <h1 style="margin:0;font-size:26px;color:#d4af37;font-weight:normal;letter-spacing:2px;">Твоят анализ е готов</h1>
            </td>
          </tr>
          <tr>
            <td style="font-size:15px;line-height:1.7;color:#e8dcc8;padding-bottom:20px;">
              <p style="margin:0 0 16px;">Здравей, <strong style="color:#e8cc6a;">${escapeHtml(customerName)}</strong>,</p>
              <p style="margin:0 0 16px;">Твоят <em style="color:#e8cc6a;">${escapeHtml(productTitle)}</em> е готов. Намираш го прикачен към този имейл — отвори го в спокоен момент, с чаша топла напитка, без бързане. Този анализ е написан само за теб.</p>
              <p style="margin:0 0 16px;">Звездите не определят пътя ти. Те го осветяват.</p>
              <p style="margin:0;">С обич,<br/>екипът на Астро Код  ✦</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:32px;border-top:1px solid #5a4a30;">
              <div style="font-size:10px;color:#8a7a60;letter-spacing:3px;">ЛИЧЕН  ·  ПОВЕРИТЕЛЕН  ·  ДУХОВЕН</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const resend = new Resend(apiKey);

  try {
    console.log(`${LOG_PREFIX} Sending "${productTitle}" to ${to} (${pdfBuffer.length} bytes)`);

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: `Твоят ${productTitle} е готов ✦`,
      html,
      attachments: [{ filename, content: pdfBuffer }],
    });

    if (error) {
      throw new Error(error.message || JSON.stringify(error));
    }

    console.log(`${LOG_PREFIX} Sent — id: ${data?.id}`);
    return { success: true };
  } catch (err) {
    console.error(`${LOG_PREFIX} FAILED:`, err.message);
    throw err;
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = { sendAnalysisEmail };
