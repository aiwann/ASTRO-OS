'use strict';

const express = require('express');
const router  = express.Router();
const reportService = require('../services/reportService');
const { streamChat, rewriteSection } = require('../services/anthropicService');
const db = require('../database/db');

router.post('/generate', async (req, res) => {
  const { name, gender, birthDate, birthTime, birthPlace, question, category } = req.body;

  if (!name || !birthDate || !birthPlace) {
    return res.status(400).json({ error: 'Задължителни полета: name, birthDate, birthPlace' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  let reportId;

  try {
    res.write(`data: ${JSON.stringify({ type: 'status', message: 'Геокодиране на местоположението...' })}\n\n`);

    const reportData = await reportService.prepareReportData({
      name, gender, birthDate, birthTime, birthPlace, question, category
    });

    reportId = await reportService.createReportRecord(
      { name, gender, birthDate, birthTime, birthPlace, question, category },
      reportData.geo
    );

    await db.prepare('UPDATE reports SET astrology_data = ?, numerology_data = ? WHERE id = ?')
      .run(JSON.stringify(reportData.natal), JSON.stringify(reportData.numerology), reportId);

    res.write(`data: ${JSON.stringify({ type: 'report_created', reportId, astrologyData: reportData.natal, numerologyData: reportData.numerology })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: 'status', message: 'Генериране на доклад секция по секция...' })}\n\n`);

    await reportService.generateFullReport(reportId, reportData, res);

  } catch (err) {
    console.error('Generation error:', err);
    if (reportId) {
      await db.prepare("UPDATE reports SET status = 'error' WHERE id = ?").run(reportId).catch(() => {});
    }
    res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
    res.end();
  }
});

router.post('/chat/:reportId', async (req, res) => {
  let report;
  try {
    report = await reportService.getReport(parseInt(req.params.reportId));
  } catch {}
  if (!report) return res.status(404).json({ error: 'Докладът не е намерен' });

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Невалидни съобщения' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const context = buildReportContext(report);

  try {
    const fullText = await streamChat(messages, context, res);

    const session = await db.prepare('SELECT id, messages FROM report_sessions WHERE report_id = ?').get(report.id);
    if (session) {
      const prev = JSON.parse(session.messages || '[]');
      prev.push(...messages.slice(-2));
      await db.prepare('UPDATE report_sessions SET messages = ? WHERE id = ?')
        .run(JSON.stringify(prev.slice(-50)), session.id);
    } else {
      await db.prepare('INSERT INTO report_sessions (report_id, messages) VALUES (?, ?)')
        .run(report.id, JSON.stringify(messages.slice(-10)));
    }
  } catch (err) {
    res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
    res.end();
  }
});

router.post('/rewrite/:reportId/:sectionKey', async (req, res) => {
  let report;
  try {
    report = await reportService.getReport(parseInt(req.params.reportId));
  } catch {}
  if (!report) return res.status(404).json({ error: 'Докладът не е намерен' });

  const { instruction, currentText } = req.body;
  if (!instruction) return res.status(400).json({ error: 'Липсва инструкция' });

  const context = buildReportContext(report);
  const sectionText = currentText || report.sections?.[req.params.sectionKey]?.content || '';

  try {
    const rewritten = await rewriteSection(instruction, sectionText, context);
    await reportService.updateReportSection(report.id, req.params.sectionKey, rewritten);
    res.json({ success: true, content: rewritten });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function buildReportContext(report) {
  const natal = report.astrology_data || {};
  const num   = report.numerology_data || {};
  return `Доклад за: ${report.user_name}, ${report.birth_date}, ${report.birth_place}
Слънце: ${natal.sun?.sign?.name}, Луна: ${natal.moon?.sign?.name}, Асцендент: ${natal.ascendant?.sign?.name}
Жизнен път: ${num.lifePath}, Съдба: ${num.destiny}, Ангелско число: ${num.angel?.primary}
Категория: ${report.category}, Въпрос: ${report.question || 'не е зададен'}`;
}

module.exports = router;
