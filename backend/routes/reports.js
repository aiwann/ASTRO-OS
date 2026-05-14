'use strict';

const express = require('express');
const router  = express.Router();
const reportService = require('../services/reportService');

router.get('/', async (req, res) => {
  try {
    const reports = await reportService.listReports();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const report = await reportService.getReport(parseInt(req.params.id));
    if (!report) return res.status(404).json({ error: 'Докладът не е намерен' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/section/:sectionKey', async (req, res) => {
  const { content } = req.body;
  if (content === undefined) return res.status(400).json({ error: 'Липсва съдържание' });
  try {
    const updated = await reportService.updateReportSection(
      parseInt(req.params.id),
      req.params.sectionKey,
      content
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await reportService.deleteReport(parseInt(req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
