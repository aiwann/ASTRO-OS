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
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark light">
  <meta name="supported-color-schemes" content="dark light">
  <title>Твоят анализ е готов</title>
  <style>
    /* Force dark background even in clients that strip inline backgrounds */
    body, .body-bg { background-color: #0d0b14 !important; }
    .card-bg { background-color: #15111f !important; }
    .text-cream { color: #e8dcc8 !important; }
    .text-cream-dim { color: #a89c87 !important; }
    .text-gold { color: #e8cc6a !important; }
    .text-gold-soft { color: #b89a4e !important; }

    /* Gmail dark mode hooks (Android & iOS Gmail apps) */
    u + .body-bg { background-color: #0d0b14 !important; }
    u + .body-bg .card-bg { background-color: #15111f !important; }

    /* Outlook.com / Office 365 dark mode hooks */
    [data-ogsb] .body-bg { background-color: #0d0b14 !important; }
    [data-ogsb] .card-bg { background-color: #15111f !important; }
    [data-ogsc] .text-cream { color: #e8dcc8 !important; }
    [data-ogsc] .text-cream-dim { color: #a89c87 !important; }
    [data-ogsc] .text-gold { color: #e8cc6a !important; }

    /* Standard dark-mode media query (Apple Mail, modern clients) */
    @media (prefers-color-scheme: dark) {
      body, .body-bg { background-color: #0d0b14 !important; }
      .card-bg { background-color: #15111f !important; }
      .text-cream { color: #e8dcc8 !important; }
      .text-cream-dim { color: #a89c87 !important; }
      .text-gold { color: #e8cc6a !important; }
    }

    /* Mobile tweaks */
    @media only screen and (max-width: 620px) {
      .card-bg { width: 100% !important; }
      .pad-x { padding-left: 28px !important; padding-right: 28px !important; }
      .h1-brand { font-size: 30px !important; letter-spacing: 4px !important; }
      .h2-title { font-size: 24px !important; }
    }
  </style>
</head>
<body class="body-bg" bgcolor="#0d0b14" style="margin:0;padding:0;background-color:#0d0b14;font-family:Georgia,'Times New Roman',serif;color:#e8dcc8;-webkit-font-smoothing:antialiased;">

  <!-- Preheader (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#0d0b14;">
    Звездите се подредиха — твоят анализ те очаква.
  </div>

  <table role="presentation" class="body-bg" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0d0b14" style="background-color:#0d0b14;padding:48px 16px;">
    <tr>
      <td align="center" bgcolor="#0d0b14" style="background-color:#0d0b14;">

        <!-- Top star divider -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#0d0b14" style="max-width:600px;background-color:#0d0b14;">
          <tr>
            <td align="center" bgcolor="#0d0b14" style="background-color:#0d0b14;padding-bottom:28px;">
              <font color="#b89a4e" face="Georgia,serif">
                <span class="text-gold-soft" style="font-size:14px;color:#b89a4e;letter-spacing:14px;">✦ · ✧ · ✦ · ✧ · ✦</span>
              </font>
            </td>
          </tr>
        </table>

        <!-- Main card -->
        <table role="presentation" class="card-bg" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#15111f" style="max-width:600px;background-color:#15111f;border:1px solid #3a2f4a;border-radius:6px;">

          <!-- Header brand -->
          <tr>
            <td align="center" class="pad-x" bgcolor="#15111f" style="background-color:#15111f;padding:56px 48px 8px;">
              <font color="#e8cc6a" face="Georgia,'Times New Roman',serif">
                <h1 class="h1-brand text-gold" style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:38px;font-weight:normal;color:#e8cc6a;letter-spacing:6px;line-height:1.2;">
                  ✦&nbsp;&nbsp;АСТРО&nbsp;ОС&nbsp;&nbsp;✦
                </h1>
              </font>
            </td>
          </tr>

          <!-- Subtle gold divider -->
          <tr>
            <td align="center" bgcolor="#15111f" style="background-color:#15111f;padding:24px 48px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" bgcolor="#15111f"><tr>
                <td height="1" width="80" bgcolor="#b89a4e" style="background-color:#b89a4e;font-size:0;line-height:0;">&nbsp;</td>
              </tr></table>
            </td>
          </tr>

          <!-- Kicker -->
          <tr>
            <td align="center" class="pad-x" bgcolor="#15111f" style="background-color:#15111f;padding:32px 48px 8px;">
              <font color="#a89c87" face="Georgia,serif">
                <span class="text-cream-dim" style="font-size:12px;color:#a89c87;letter-spacing:5px;text-transform:uppercase;">
                  Послание от звездите
                </span>
              </font>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td align="center" class="pad-x" bgcolor="#15111f" style="background-color:#15111f;padding:14px 48px 0;">
              <font color="#e8cc6a" face="Georgia,serif">
                <h2 class="h2-title text-gold" style="margin:0;font-family:Georgia,serif;font-size:28px;font-weight:normal;color:#e8cc6a;font-style:italic;letter-spacing:1px;line-height:1.4;">
                  Твоят анализ е готов
                </h2>
              </font>
            </td>
          </tr>

          <!-- Body text -->
          <tr>
            <td class="pad-x" bgcolor="#15111f" style="background-color:#15111f;padding:36px 56px 8px;">
              <font color="#e8dcc8" face="Georgia,serif">
                <p class="text-cream" style="margin:0 0 22px;font-family:Georgia,serif;font-size:16px;line-height:1.85;color:#e8dcc8;">
                  Здравей, <span class="text-gold" style="color:#e8cc6a;font-style:italic;">${escapeHtml(customerName)}</span>,
                </p>

                <p class="text-cream" style="margin:0 0 22px;font-family:Georgia,serif;font-size:16px;line-height:1.85;color:#e8dcc8;">
                  В нощта, в която поиска отговор, звездите се подредиха —
                  и ето го, написан само за теб.
                </p>

                <p class="text-cream" style="margin:0 0 22px;font-family:Georgia,serif;font-size:16px;line-height:1.85;color:#e8dcc8;">
                  Твоят <span class="text-gold" style="color:#e8cc6a;font-style:italic;">${escapeHtml(productTitle)}</span>
                  чака прикачен към това писмо. Отвори го в тих час, с чаша топла напитка,
                  без бързане — думите имат смисъл, когато ги срещнеш бавно.
                </p>
              </font>
            </td>
          </tr>

          <!-- Inner star divider -->
          <tr>
            <td align="center" bgcolor="#15111f" style="background-color:#15111f;padding:8px 48px;">
              <font color="#b89a4e" face="Georgia,serif">
                <span class="text-gold-soft" style="font-size:12px;color:#b89a4e;letter-spacing:10px;">✦ · ✧ · ✦</span>
              </font>
            </td>
          </tr>

          <!-- Mystic quote -->
          <tr>
            <td align="center" class="pad-x" bgcolor="#15111f" style="background-color:#15111f;padding:18px 56px 24px;">
              <font color="#e8cc6a" face="Georgia,serif">
                <p class="text-gold" style="margin:0;font-family:Georgia,serif;font-size:17px;font-style:italic;color:#e8cc6a;line-height:1.6;letter-spacing:0.5px;">
                  „Звездите не определят пътя ти.<br/>Те го осветяват.&rdquo;
                </p>
              </font>
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td class="pad-x" bgcolor="#15111f" style="background-color:#15111f;padding:8px 56px 56px;">
              <font color="#e8dcc8" face="Georgia,serif">
                <p class="text-cream" style="margin:0;font-family:Georgia,serif;font-size:16px;line-height:1.8;color:#e8dcc8;">
                  С почит към твоя път,<br/>
                  <span class="text-gold" style="color:#e8cc6a;font-style:italic;">екипът на Астро ОС</span>&nbsp; ✦
                </p>
              </font>
            </td>
          </tr>

        </table>

        <!-- Bottom star divider -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#0d0b14" style="max-width:600px;background-color:#0d0b14;">
          <tr>
            <td align="center" bgcolor="#0d0b14" style="background-color:#0d0b14;padding:32px 0 12px;">
              <font color="#b89a4e" face="Georgia,serif">
                <span class="text-gold-soft" style="font-size:14px;color:#b89a4e;letter-spacing:14px;">✦ · ✧ · ✦</span>
              </font>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#0d0b14" style="max-width:600px;background-color:#0d0b14;">
          <tr>
            <td align="center" bgcolor="#0d0b14" style="background-color:#0d0b14;padding:16px 24px 0;">
              <font color="#a89c87" face="Georgia,serif">
                <p class="text-cream-dim" style="margin:0;font-family:Georgia,serif;font-size:11px;color:#a89c87;letter-spacing:3px;text-transform:uppercase;line-height:1.8;">
                  Личен&nbsp; ·&nbsp; Поверителен&nbsp; ·&nbsp; Духовен
                </p>
                <p class="text-cream-dim" style="margin:14px 0 0;font-family:Georgia,serif;font-size:11px;color:#7a7060;line-height:1.6;">
                  Изпратено с обич от Астро ОС
                </p>
              </font>
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
