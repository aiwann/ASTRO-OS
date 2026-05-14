'use strict';

const express = require('express');
const router = express.Router();
const reportService = require('../services/reportService');
const ExportService = require('../services/exportService');
const tempFileManager = require('../utils/tempFileManager');

const LOG_PREFIX = '[ExportRoutes]';

function safeFilename(name, ext) {
  const ascii = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')  // strip diacritics
    .replace(/[^\x20-\x7E]/g, '')     // strip non-ASCII (Cyrillic etc.)
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9\-_]/g, '')
    .slice(0, 60) || 'report';
  return `astro-${ascii}-${new Date().toISOString().slice(0,10)}.${ext}`;
}

// Cleanup old temp files on startup
tempFileManager.cleanupOldFiles();

router.get('/:id/pdf', async (req, res) => {
  const reportId = parseInt(req.params.id);
  req.setTimeout(120000);
  res.setTimeout(120000);

  try {
    console.log(`${LOG_PREFIX} PDF request: report ${reportId}`);

    const report = await reportService.getReport(reportId);
    if (!report) return res.status(404).json({ error: 'Докладът не е намерен' });

    const exportData = await ExportService.generatePDF(
      report,
      report.sections,
      report.astrology_data,
      report.numerology_data
    );

    console.log(`${LOG_PREFIX} PDF ready: ${exportData.filepath}`);

    const fileBuffer = tempFileManager.readFile(exportData.filepath);
    const filename = safeFilename(report.user_name, 'pdf');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', fileBuffer.length);

    res.send(fileBuffer);
    console.log(`${LOG_PREFIX} PDF sent: ${filename}`);

    tempFileManager.cleanupFile(exportData.filepath);

  } catch (err) {
    console.error(`${LOG_PREFIX} PDF error:`, err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: `PDF грешка: ${err.message}` });
    }
  }
});

router.get('/:id/docx', async (req, res) => {
  const reportId = parseInt(req.params.id);
  req.setTimeout(60000);
  res.setTimeout(60000);

  try {
    console.log(`${LOG_PREFIX} DOCX request: report ${reportId}`);

    const report = await reportService.getReport(reportId);
    if (!report) return res.status(404).json({ error: 'Докладът не е намерен' });

    const exportData = await ExportService.generateDocx(report, report.sections);

    console.log(`${LOG_PREFIX} DOCX ready: ${exportData.filepath}`);

    const fileBuffer = tempFileManager.readFile(exportData.filepath);
    const filename = safeFilename(report.user_name, 'docx');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', fileBuffer.length);

    res.send(fileBuffer);
    console.log(`${LOG_PREFIX} DOCX sent: ${filename}`);

    tempFileManager.cleanupFile(exportData.filepath);

  } catch (err) {
    console.error(`${LOG_PREFIX} DOCX error:`, err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: `DOCX грешка: ${err.message}` });
    }
  }
});

router.get('/:id/markdown', async (req, res) => {
  const reportId = parseInt(req.params.id);

  try {
    console.log(`${LOG_PREFIX} Markdown request: report ${reportId}`);

    const report = await reportService.getReport(reportId);
    if (!report) return res.status(404).json({ error: 'Докладът не е намерен' });

    const exportData = await ExportService.generateMarkdown(report, report.sections);

    console.log(`${LOG_PREFIX} Markdown ready: ${exportData.filepath}`);

    const fileBuffer = tempFileManager.readFile(exportData.filepath);
    const filename = safeFilename(report.user_name, 'md');

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', fileBuffer.length);

    res.send(fileBuffer);
    console.log(`${LOG_PREFIX} Markdown sent: ${filename}`);

    tempFileManager.cleanupFile(exportData.filepath);

  } catch (err) {
    console.error(`${LOG_PREFIX} Markdown error:`, err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: `Markdown грешка: ${err.message}` });
    }
  }
});

router.get('/:id/txt', async (req, res) => {
  const reportId = parseInt(req.params.id);

  try {
    console.log(`${LOG_PREFIX} TXT request: report ${reportId}`);

    const report = await reportService.getReport(reportId);
    if (!report) return res.status(404).json({ error: 'Докладът не е намерен' });

    const exportData = await ExportService.generateTxt(report, report.sections);

    console.log(`${LOG_PREFIX} TXT ready: ${exportData.filepath}`);

    const fileBuffer = tempFileManager.readFile(exportData.filepath);
    const filename = safeFilename(report.user_name, 'txt');

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', fileBuffer.length);

    res.send(fileBuffer);
    console.log(`${LOG_PREFIX} TXT sent: ${filename}`);

    tempFileManager.cleanupFile(exportData.filepath);

  } catch (err) {
    console.error(`${LOG_PREFIX} TXT error:`, err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: `TXT грешка: ${err.message}` });
    }
  }
});

module.exports = router;
