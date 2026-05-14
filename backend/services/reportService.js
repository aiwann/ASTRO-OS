'use strict';

const db = require('../database/db');
const astrologyService = require('./astrologyService');
const numerologyService = require('./numerologyService');
const { geocodeLocation } = require('../utils/geocoding');
const { SECTION_PROMPTS } = require('../prompts/sectionPrompts');
const { generateSection } = require('./anthropicService');

const SECTION_ORDER = ['personality', 'emotional', 'love', 'career', 'spiritual', 'angel', 'question', 'forecast'];

const SECTION_TITLES = {
  personality: 'Основна Личност',
  emotional:   'Емоционален Профил',
  love:        'Любов и Взаимоотношения',
  career:      'Кариера и Пари',
  spiritual:   'Духовно Предназначение',
  angel:       'Ангелско Число и Нумерология',
  question:    'Отговор на Личния Въпрос',
  forecast:    'Следващите 12 Месеца',
};

async function prepareReportData(input) {
  const { name, gender, birthDate, birthTime, birthPlace, question, category } = input;
  const geo = await geocodeLocation(birthPlace);
  const natal = astrologyService.calculate(birthDate, birthTime, geo.lat, geo.lon);
  const numerology = numerologyService.analyze(name, birthDate);
  return { user: { name, gender, birthDate, birthTime, birthPlace, question, category }, geo, natal, numerology };
}

async function generateFullReport(reportId, reportData, res) {
  const sections = {};

  for (const sectionKey of SECTION_ORDER) {
    if (sectionKey === 'question' && !reportData.user.question) continue;
    const promptConfig = SECTION_PROMPTS[sectionKey](reportData);
    const text = await generateSection(sectionKey, promptConfig, res);
    sections[sectionKey] = { title: SECTION_TITLES[sectionKey], content: text };
  }

  const fullReport = SECTION_ORDER
    .filter(k => sections[k])
    .map(k => `## ${sections[k].title}\n\n${sections[k].content}`)
    .join('\n\n---\n\n');

  await db.prepare(`
    UPDATE reports SET
      astrology_data = ?,
      numerology_data = ?,
      sections = ?,
      full_report = ?,
      status = 'complete'
    WHERE id = ?
  `).run(
    JSON.stringify(reportData.natal),
    JSON.stringify(reportData.numerology),
    JSON.stringify(sections),
    fullReport,
    reportId
  );

  res.write(`data: ${JSON.stringify({ type: 'generation_complete', reportId })}\n\n`);
  res.end();
}

async function createReportRecord(input, geoData) {
  const result = await db.prepare(`
    INSERT INTO reports (title, user_name, user_gender, birth_date, birth_time, birth_place, birth_lat, birth_lon, question, category, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'generating')
  `).run(
    `${input.name} — ${input.category}`,
    input.name,
    input.gender || '',
    input.birthDate,
    input.birthTime || '',
    input.birthPlace,
    geoData?.lat || 0,
    geoData?.lon || 0,
    input.question || '',
    input.category || ''
  );
  return result.lastInsertRowid;
}

async function getReport(id) {
  const report = await db.prepare('SELECT * FROM reports WHERE id = ?').get(id);
  if (!report) return null;
  if (report.astrology_data)  report.astrology_data  = JSON.parse(report.astrology_data);
  if (report.numerology_data) report.numerology_data = JSON.parse(report.numerology_data);
  if (report.sections)        report.sections        = JSON.parse(report.sections);
  if (report.version_history) report.version_history = JSON.parse(report.version_history);
  return report;
}

async function listReports() {
  return db.prepare('SELECT id, title, user_name, birth_date, category, status, created_at FROM reports ORDER BY created_at DESC').all();
}

async function updateReportSection(reportId, sectionKey, content) {
  const report = await getReport(reportId);
  if (!report) throw new Error('Докладът не е намерен');

  const sections = report.sections || {};
  const history  = report.version_history || [];

  history.push({
    timestamp: new Date().toISOString(),
    section: sectionKey,
    previousContent: sections[sectionKey]?.content || '',
  });

  sections[sectionKey] = { ...sections[sectionKey], content };

  const fullReport = SECTION_ORDER
    .filter(k => sections[k])
    .map(k => `## ${sections[k].title}\n\n${sections[k].content}`)
    .join('\n\n---\n\n');

  await db.prepare(`
    UPDATE reports SET sections = ?, full_report = ?, version_history = ?
    WHERE id = ?
  `).run(JSON.stringify(sections), fullReport, JSON.stringify(history.slice(-20)), reportId);

  return sections[sectionKey];
}

async function deleteReport(id) {
  await db.prepare('DELETE FROM reports WHERE id = ?').run(id);
}

module.exports = {
  prepareReportData,
  generateFullReport,
  createReportRecord,
  getReport,
  listReports,
  updateReportSection,
  deleteReport,
  SECTION_TITLES,
  SECTION_ORDER,
};
