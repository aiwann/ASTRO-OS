'use strict';

const PDFDocument = require('pdfkit');
const fs = require('fs');
const { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType } = require('docx');
const tempFileManager = require('../utils/tempFileManager');
const { findFont } = require('../utils/fontResolver');

const LOG_PREFIX = '[ExportService]';

// A4 in points
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN  = 56;
const CONTENT_W = PAGE_W - MARGIN * 2;

// Colour palette
const C = {
  bg:        '#0a0a0f',
  bgPurple:  '#120820',
  gold:      '#d4af37',
  goldLight: '#e8cc6a',
  goldDim:   '#c9a84c',
  goldDark:  '#9a7d3a',
  text:      '#e8dcc8',
  textDim:   '#c4b49a',
  textMuted: '#8a7a60',
  textFaint: '#5a4a30',
  cardBg:    '#14101e',
};

function fillPage(doc, color, resetColor = C.textDim) {
  doc.rect(0, 0, PAGE_W, PAGE_H).fill(color);
  doc.fillColor(resetColor).fillOpacity(1);
}

// Seeded LCG for consistent star positions
function makeRng(seed) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 0xFFFFFFFF; };
}

function starField(doc, count = 60, seed = 12345) {
  const rand = makeRng(seed);
  for (let i = 0; i < count; i++) {
    const x  = rand() * PAGE_W;
    const y  = rand() * PAGE_H;
    const r  = rand() * 1.1 + 0.2;
    const op = rand() * 0.3 + 0.05;
    doc.circle(x, y, r).fillOpacity(op).fill(C.gold);
  }
  doc.fillOpacity(1).fillColor(C.textDim);
}

function mysticCircle(doc, cx, cy, radii, color = C.gold) {
  for (const { r, op, lw } of radii) {
    doc.circle(cx, cy, r).lineWidth(lw || 0.4).strokeOpacity(op).stroke(color);
  }
  doc.strokeOpacity(1);
}

function astrologyWheel(doc, cx, cy, outerR, innerR) {
  mysticCircle(doc, cx, cy, [
    { r: outerR,        op: 0.18, lw: 0.5 },
    { r: outerR * 0.8,  op: 0.10, lw: 0.3 },
    { r: innerR,        op: 0.13, lw: 0.4 },
  ]);
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    doc.moveTo(cx + innerR * Math.cos(angle), cy + innerR * Math.sin(angle))
       .lineTo(cx + outerR * Math.cos(angle), cy + outerR * Math.sin(angle))
       .lineWidth(0.3).strokeOpacity(0.12).stroke(C.gold);
  }
  doc.strokeOpacity(1);
}

function ornamentDivider(doc, y, color = C.goldDark, alpha = 0.45) {
  const mid = PAGE_W / 2;
  const len = 150;
  doc.moveTo(mid - len, y).lineTo(mid - 8, y).lineWidth(0.4).strokeOpacity(alpha).stroke(color);
  doc.moveTo(mid + 8, y).lineTo(mid + len, y).lineWidth(0.4).strokeOpacity(alpha).stroke(color);
  doc.polygon([mid, y - 4], [mid + 5, y], [mid, y + 4], [mid - 5, y])
     .fillOpacity(alpha * 0.7).fill(color);
  doc.fillOpacity(1).fillColor(C.textDim);
}

function cornerOrnaments(doc, y = 34) {
  const d = 16;
  doc.moveTo(MARGIN, y).lineTo(MARGIN + d, y).lineWidth(0.4).strokeOpacity(0.18).stroke(C.gold);
  doc.moveTo(MARGIN, y).lineTo(MARGIN, y + d).lineWidth(0.4).strokeOpacity(0.18).stroke(C.gold);
  doc.moveTo(PAGE_W - MARGIN - d, y).lineTo(PAGE_W - MARGIN, y).lineWidth(0.4).strokeOpacity(0.18).stroke(C.gold);
  doc.moveTo(PAGE_W - MARGIN, y).lineTo(PAGE_W - MARGIN, y + d).lineWidth(0.4).strokeOpacity(0.18).stroke(C.gold);
  doc.strokeOpacity(1);
}

function pageFooter(doc, pageNum, fonts) {
  doc.font(fonts.regular).fontSize(7).fillColor(C.textFaint).fillOpacity(0.45);
  doc.text(`— ${pageNum} —`, 0, PAGE_H - 26, { align: 'center', width: PAGE_W, characterSpacing: 2 });
  doc.fillOpacity(1).fillColor(C.textDim);
}

function dividerLine(doc, y, color = C.goldDark, alpha = 0.4) {
  const mid = PAGE_W / 2;
  const len = 180;
  doc.moveTo(mid - len / 2, y).lineTo(mid + len / 2, y)
     .lineWidth(0.5).strokeOpacity(alpha).stroke(color);
  doc.strokeOpacity(1);
}

function sectionCard(doc, x, y, w, h) {
  doc.rect(x, y, w, h)
     .fillAndStroke(C.cardBg, C.goldDark)
     .fillOpacity(1)
     .strokeOpacity(0.25)
     .lineWidth(0.5);
}

class ExportService {
  static async generatePDF(report, sections, natal, numerology) {
    const stage = 'PDF generation';
    const filename = tempFileManager.generateFileName(`${report.user_name}-astro`, 'pdf');
    const filepath = tempFileManager.getTempPath(filename);

    try {
      console.log(`${LOG_PREFIX} [${stage}] START: ${filename}`);

      await this.buildPdfKit(filepath, report, sections, natal, numerology);
      console.log(`${LOG_PREFIX} [${stage}] PDF written to disk`);

      const fileSize = tempFileManager.validateFile(filepath, 2000);
      console.log(`${LOG_PREFIX} [${stage}] Validated: ${fileSize} bytes — SUCCESS`);

      return { filepath, filename, fileSize };

    } catch (err) {
      console.error(`${LOG_PREFIX} [${stage}] ERROR:`, err.message);
      tempFileManager.cleanupFile(filepath);
      throw err;
    }
  }

  static buildPdfKit(filepath, report, sections, natal, numerology) {
    return new Promise((resolve, reject) => {
      // Resolve Cyrillic-capable fonts before starting the PDF
      let fonts;
      try {
        fonts = {
          regular: findFont('regular'),
          bold:    findFont('bold'),
          italic:  findFont('italic'),
        };
      } catch (err) {
        return reject(err);
      }

      const doc = new PDFDocument({
        size: 'A4',
        margin: 0,
        info: {
          Title: `Астрологичен Доклад — ${report.user_name}`,
          Author: 'Astro OS',
          Subject: 'Персонален духовен анализ',
        },
      });

      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);
      stream.on('finish', resolve);
      stream.on('error', reject);
      doc.on('error', reject);

      // Every page (including auto-overflow pages) gets the dark background.
      // IMPORTANT: do NOT use save/restore here — doc.restore() only resets the PDF
      // graphics stack (Q operator), it does NOT reset PDFKit's internal JS _fillColor.
      // Text drawn after restore() would inherit C.bg (near-black) and be invisible.
      doc.on('pageAdded', () => {
        doc.rect(0, 0, PAGE_W, PAGE_H).fill(C.bg);
        doc.fillColor(C.textDim).fillOpacity(1);
      });

      try {
        let pageNum = 1;
        this.drawCoverPage(doc, report, natal, fonts);

        doc.addPage(); pageNum++;
        this.drawSummaryPage(doc, natal, numerology, fonts, pageNum);

        const sectionEntries = Object.entries(sections || {});
        // Separate closing from the rest
        const mainSections  = sectionEntries.filter(([k]) => k !== 'closing');
        const closingEntry  = sectionEntries.find(([k]) => k === 'closing');

        for (const [, section] of mainSections) {
          doc.addPage(); pageNum++;
          this.drawSectionPage(doc, section, fonts, pageNum);
        }

        if (closingEntry) {
          doc.addPage();
          this.drawClosingPage(doc, report, closingEntry[1], natal, numerology, fonts);
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  static drawCoverPage(doc, report, natal, fonts) {
    const signSymbols = {
      'Овен': '♈', 'Телец': '♉', 'Близнаци': '♊', 'Рак': '♋', 'Лъв': '♌', 'Дева': '♍',
      'Везни': '♎', 'Скорпион': '♏', 'Стрелец': '♐', 'Козирог': '♑', 'Водолей': '♒', 'Риби': '♓'
    };
    const sunSign  = natal?.sun?.sign?.name;
    const moonSign = natal?.moon?.sign?.name;
    const sunSym   = signSymbols[sunSign]  || '☀';
    const moonSym  = signSymbols[moonSign] || '☽';

    fillPage(doc, C.bg);
    starField(doc, 80, 9999);

    // Purple nebula glow
    doc.circle(PAGE_W / 2, PAGE_H * 0.38, 300).fillOpacity(0.12).fill(C.bgPurple);
    doc.circle(PAGE_W * 0.2, PAGE_H * 0.7, 180).fillOpacity(0.07).fill(C.bgPurple);
    doc.fillOpacity(1).fillColor(C.textDim);

    // Astrology wheel behind title
    astrologyWheel(doc, PAGE_W / 2, PAGE_H * 0.38, 210, 140);

    // Corner ornaments
    cornerOrnaments(doc, 36);
    cornerOrnaments(doc, PAGE_H - 36 - 16);

    // Outer border rectangle
    doc.rect(24, 24, PAGE_W - 48, PAGE_H - 48)
       .lineWidth(0.4).strokeOpacity(0.12).stroke(C.gold);

    // Top ornament
    doc.font(fonts.regular).fontSize(12).fillColor(C.gold).fillOpacity(0.5);
    doc.text('★  ☽  ★', 0, 90, { align: 'center', width: PAGE_W });

    // Main title
    doc.font(fonts.regular).fontSize(46).fillColor(C.gold).fillOpacity(1);
    doc.text('АСТРО ОС', 0, 128, { align: 'center', width: PAGE_W, characterSpacing: 8 });

    // Subtitle
    doc.font(fonts.regular).fontSize(10).fillColor(C.goldDim).fillOpacity(0.8);
    doc.text('ПЕРСОНАЛЕН  ДУХОВЕН  АНАЛИЗ', 0, 190, { align: 'center', width: PAGE_W, characterSpacing: 5 });

    ornamentDivider(doc, 220, C.gold, 0.45);

    // Name
    doc.font(fonts.italic).fontSize(36).fillColor(C.text).fillOpacity(1);
    doc.text(report.user_name, 0, 242, { align: 'center', width: PAGE_W });

    // Birth info
    doc.font(fonts.regular).fontSize(10).fillColor(C.goldDim).fillOpacity(0.85);
    doc.text(`${report.birth_date}  ·  ${report.birth_place}`, 0, 296, { align: 'center', width: PAGE_W, characterSpacing: 1.5 });

    // Zodiac signs
    doc.font(fonts.regular).fontSize(40).fillColor(C.gold).fillOpacity(0.8);
    doc.text(`${sunSym}  ${moonSym}`, 0, 340, { align: 'center', width: PAGE_W });

    // Category badge
    if (report.category) {
      const cx = PAGE_W / 2;
      const badgeW = 130, badgeH = 24, badgeY = 408;
      doc.rect(cx - badgeW / 2, badgeY, badgeW, badgeH)
         .fillOpacity(0.08).fill(C.gold);
      doc.rect(cx - badgeW / 2, badgeY, badgeW, badgeH)
         .lineWidth(0.4).strokeOpacity(0.25).stroke(C.gold);
      doc.font(fonts.regular).fontSize(9).fillColor(C.goldDim).fillOpacity(0.9);
      doc.text(report.category.toUpperCase(), cx - badgeW / 2, badgeY + 7,
        { width: badgeW, align: 'center', characterSpacing: 3 });
      doc.fillOpacity(1).fillColor(C.textDim);
    }

    ornamentDivider(doc, 458, C.gold, 0.3);

    // Sun/Moon labels
    doc.font(fonts.italic).fontSize(12).fillColor(C.textMuted).fillOpacity(0.75);
    const sunLabel  = sunSign  ? `${sunSym}  ${sunSign}  ·  Слънчев Знак`  : '';
    const moonLabel = moonSign ? `${moonSym}  ${moonSign}  ·  Лунен Знак` : '';
    if (sunLabel)  doc.text(sunLabel,  0, 476, { align: 'center', width: PAGE_W });
    if (moonLabel) doc.text(moonLabel, 0, 498, { align: 'center', width: PAGE_W });

    // Ascendant
    const ascSign = natal?.ascendant?.sign?.name;
    if (ascSign) {
      doc.font(fonts.regular).fontSize(9).fillColor(C.textFaint).fillOpacity(0.6);
      doc.text(`↑  ${ascSign}  ·  Асцендент`, 0, 522, { align: 'center', width: PAGE_W });
    }

    // Footer
    doc.font(fonts.regular).fontSize(7.5).fillColor(C.textFaint).fillOpacity(0.45);
    doc.text('ЛИЧЕН  ·  ПОВЕРИТЕЛЕН  ·  ДУХОВЕН', 0, PAGE_H - 48, { align: 'center', width: PAGE_W, characterSpacing: 3 });
  }

  static drawSummaryPage(doc, natal, numerology, fonts, pageNum = 2) {
    fillPage(doc, C.bg);
    starField(doc, 40, 54321);
    cornerOrnaments(doc);

    // Heading
    doc.font(fonts.regular).fontSize(20).fillColor(C.gold).fillOpacity(1);
    doc.text('Астрологичен Профил', 0, MARGIN + 10, { align: 'center', width: PAGE_W, characterSpacing: 2 });

    ornamentDivider(doc, MARGIN + 48, C.gold, 0.35);
    pageFooter(doc, pageNum, fonts);

    // Astrology grid — 4 cards in 2×2
    const cardW = (CONTENT_W - 16) / 2;
    const cardH = 90;
    const row1Y = MARGIN + 70;
    const row2Y = row1Y + cardH + 12;

    const cards = [
      { icon: '☀', label: 'Слънчев Знак',    value: natal?.sun?.sign?.name  || '—', sub: natal?.sun?.sign?.element  ? `${natal.sun.sign.element} · ${natal.sun.sign.quality}` : '' },
      { icon: '☽', label: 'Лунен Знак',      value: natal?.moon?.sign?.name || '—', sub: natal?.moon?.sign?.element ? `${natal.moon.sign.element} · Дом ${natal.moon.house}` : '' },
      { icon: '↑', label: 'Асцендент',        value: natal?.ascendant?.sign?.name || '—', sub: natal?.ascendant?.sign?.element || '' },
      { icon: '⊕', label: 'Доминантен Елемент', value: natal?.dominantElement || '—', sub: natal?.dominantQuality || '' },
    ];

    const positions = [
      { x: MARGIN, y: row1Y },
      { x: MARGIN + cardW + 16, y: row1Y },
      { x: MARGIN, y: row2Y },
      { x: MARGIN + cardW + 16, y: row2Y },
    ];

    cards.forEach((card, i) => {
      const { x, y } = positions[i];
      sectionCard(doc, x, y, cardW, cardH);

      doc.font(fonts.regular).fontSize(8).fillColor(C.goldDim).fillOpacity(0.85);
      doc.text(`${card.icon}  ${card.label.toUpperCase()}`, x + 12, y + 12, { width: cardW - 24, characterSpacing: 1.5 });

      doc.font(fonts.italic).fontSize(20).fillColor(C.text).fillOpacity(1);
      doc.text(card.value, x + 12, y + 30, { width: cardW - 24 });

      if (card.sub) {
        doc.font(fonts.regular).fontSize(9).fillColor(C.textMuted).fillOpacity(0.75);
        doc.text(card.sub, x + 12, y + 60, { width: cardW - 24 });
      }
    });

    // Numerology row
    const numY = row2Y + cardH + 36;

    dividerLine(doc, numY - 12, C.gold, 0.25);

    doc.font(fonts.regular).fontSize(10).fillColor(C.textMuted);
    doc.text('НУМЕРОЛОГИЯ', 0, numY, { align: 'center', width: PAGE_W, characterSpacing: 3 });

    const nums = [
      { value: numerology?.lifePath || '—', label: 'Жизнен Път' },
      { value: numerology?.destiny  || '—', label: 'Съдба' },
      { value: numerology?.soulUrge || '—', label: 'Душа' },
      { value: numerology?.angel?.primary || '—', label: 'Ангел' },
    ];

    const colW = CONTENT_W / 4;
    const numBlockY = numY + 26;

    nums.forEach((n, i) => {
      const cx = MARGIN + i * colW + colW / 2;

      doc.font(fonts.regular).fontSize(38).fillColor(C.gold).fillOpacity(1);
      doc.text(String(n.value), cx - colW / 2, numBlockY, { width: colW, align: 'center' });

      doc.font(fonts.regular).fontSize(8).fillColor(C.textMuted).fillOpacity(0.7);
      doc.text(n.label.toUpperCase(), cx - colW / 2, numBlockY + 48, { width: colW, align: 'center', characterSpacing: 1.5 });
    });

    // Aspects summary
    const aspects = natal?.aspects;
    if (Array.isArray(aspects) && aspects.length > 0) {
      const aspY = numBlockY + 90;
      dividerLine(doc, aspY, C.gold, 0.2);

      doc.font(fonts.regular).fontSize(10).fillColor(C.textMuted);
      doc.text('ОСНОВНИ АСПЕКТИ', 0, aspY + 14, { align: 'center', width: PAGE_W, characterSpacing: 2 });

      const topAspects = aspects.slice(0, 6);
      const aspTextY = aspY + 34;
      topAspects.forEach((asp, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const ax  = MARGIN + col * (CONTENT_W / 2);
        const ay  = aspTextY + row * 18;
        const aspStr = `${asp.planet1} ${asp.aspect} ${asp.planet2}  (${asp.orb?.toFixed(1)}°)`;
        doc.font(fonts.regular).fontSize(9).fillColor(C.textDim).fillOpacity(0.8);
        doc.text(aspStr, ax, ay, { width: CONTENT_W / 2 - 8 });
      });
    }
  }

  static drawSectionPage(doc, section, fonts, pageNum = '') {
    fillPage(doc, C.bg);
    starField(doc, 30, pageNum * 7 + 111);
    cornerOrnaments(doc);

    // Subtle side accent lines
    doc.moveTo(MARGIN - 12, 80).lineTo(MARGIN - 12, PAGE_H - 80)
       .lineWidth(0.3).strokeOpacity(0.07).stroke(C.gold);
    doc.moveTo(PAGE_W - MARGIN + 12, 80).lineTo(PAGE_W - MARGIN + 12, PAGE_H - 80)
       .lineWidth(0.3).strokeOpacity(0.07).stroke(C.gold);
    doc.strokeOpacity(1);

    // Top ornament
    doc.font(fonts.regular).fontSize(9).fillColor(C.gold).fillOpacity(0.35);
    doc.text('★  ★  ★', 0, MARGIN + 6, { align: 'center', width: PAGE_W, characterSpacing: 14 });

    // Section title
    doc.font(fonts.regular).fontSize(22).fillColor(C.gold).fillOpacity(1);
    doc.text(section.title, MARGIN, MARGIN + 32, { width: CONTENT_W, align: 'center', characterSpacing: 1.5 });

    // Divider under title
    const titleBottom = doc.y + 10;
    ornamentDivider(doc, titleBottom, C.gold, 0.35);
    pageFooter(doc, pageNum, fonts);

    // Strip all markdown syntax from AI-generated content
    const rawContent = (section.content || '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');

    // Remove leading repetition of the section title (AI often echoes it)
    const titlePattern = new RegExp(`^#{0,4}\\s*${section.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\n?`, 'i');

    const lines = rawContent.replace(titlePattern, '').split('\n');
    const cleanLines = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // Drop lines that are purely decorative symbols / separators
      if (/^[-=*_#~]{2,}$/.test(trimmed)) continue;
      // Drop lines with only bullet/dash prefix and no real content
      if (/^[-*•]\s*$/.test(trimmed)) continue;

      // Strip heading markers, keep the text
      if (/^#{1,6}/.test(trimmed)) {
        const text = trimmed.replace(/^#{1,6}\s*/, '').trim();
        if (text) cleanLines.push(text);
        continue;
      }

      // Clean inline formatting
      let clean = line
        .replace(/\*\*\*(.+?)\*\*\*/g, '$1')   // bold+italic
        .replace(/\*\*(.+?)\*\*/g, '$1')         // bold
        .replace(/\*(.+?)\*/g, '$1')             // italic
        .replace(/___(.+?)___/g, '$1')
        .replace(/__(.+?)__/g, '$1')
        .replace(/_(.+?)_/g, '$1')
        .replace(/`(.+?)`/g, '$1')               // inline code
        .replace(/~~(.+?)~~/g, '$1')             // strikethrough
        .replace(/^\s*[-*+]\s+/, '')             // unordered list bullets
        .replace(/^\s*\d+\.\s+/, '')             // ordered list numbers
        .replace(/\[(.+?)\]\(.+?\)/g, '$1')      // links → just label
        .replace(/^>\s+/, '')                    // blockquotes
        .replace(/#{1,6}/g, '')                  // stray # chars anywhere on line
        .replace(/\s{2,}/g, ' ')                 // collapse multiple spaces
        .trimEnd();

      cleanLines.push(clean);
    }

    // Collapse 3+ consecutive blank lines into one blank line
    const cleanContent = cleanLines
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Let PDFKit handle text flow and auto-pagination (pageAdded event fills background)
    doc.font(fonts.regular).fontSize(11).fillColor(C.textDim).fillOpacity(1);
    doc.text(cleanContent, MARGIN, titleBottom + 22, {
      width: CONTENT_W,
      align: 'justify',
      lineGap: 5,
      paragraphGap: 10,
    });
  }

  static drawClosingPage(doc, report, closingSection, natal, numerology, fonts) {
    fillPage(doc, C.bg);
    starField(doc, 90, 77777);

    // Deep purple nebula glow
    doc.circle(PAGE_W / 2, PAGE_H * 0.45, 280).fillOpacity(0.14).fill(C.bgPurple);
    doc.circle(PAGE_W * 0.8, PAGE_H * 0.2, 150).fillOpacity(0.07).fill(C.bgPurple);
    doc.fillOpacity(1).fillColor(C.textDim);

    // Astrology wheel in background
    astrologyWheel(doc, PAGE_W / 2, PAGE_H * 0.45, 230, 155);

    // Outer border
    doc.rect(24, 24, PAGE_W - 48, PAGE_H - 48)
       .lineWidth(0.4).strokeOpacity(0.12).stroke(C.gold);
    cornerOrnaments(doc, 36);
    cornerOrnaments(doc, PAGE_H - 36 - 16);

    // Top ornament
    doc.font(fonts.regular).fontSize(20).fillColor(C.gold).fillOpacity(0.6);
    doc.text('★', 0, 72, { align: 'center', width: PAGE_W });

    // Title
    doc.font(fonts.regular).fontSize(26).fillColor(C.gold).fillOpacity(1);
    doc.text('ПОСЛАНИЕ ОТ ЗВЕЗДИТЕ', 0, 108, { align: 'center', width: PAGE_W, characterSpacing: 3 });

    ornamentDivider(doc, 152, C.gold, 0.45);

    // For name label
    doc.font(fonts.italic).fontSize(13).fillColor(C.goldDim).fillOpacity(0.75);
    doc.text(`за  ${report.user_name}`, 0, 168, { align: 'center', width: PAGE_W });

    // Clean and render closing text
    const rawText = (closingSection?.content || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const cleanText = rawText
      .split('\n')
      .filter(l => !/^[-=*_#~]{2,}$/.test(l.trim()))
      .map(l => l.replace(/^#{1,6}\s*/, '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1'))
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Centered italic text in a slightly narrower column
    const textW = CONTENT_W - 40;
    const textX = MARGIN + 20;
    const textY = 206;

    doc.font(fonts.italic).fontSize(12).fillColor(C.text).fillOpacity(0.9);
    doc.text(cleanText, textX, textY, {
      width: textW,
      align: 'center',
      lineGap: 7,
      paragraphGap: 12,
    });

    // Bottom numerology summary
    const nums = [
      { value: numerology?.lifePath || '—', label: 'Жизнен Път' },
      { value: numerology?.angel?.primary || '—', label: 'Ангелско' },
      { value: natal?.sun?.sign?.name?.slice(0, 3) || '—', label: 'Слънце' },
      { value: natal?.moon?.sign?.name?.slice(0, 3) || '—', label: 'Луна' },
    ];

    const numY = PAGE_H - 120;
    ornamentDivider(doc, numY - 14, C.gold, 0.25);

    const colW = CONTENT_W / 4;
    nums.forEach((n, i) => {
      const cx = MARGIN + i * colW + colW / 2;
      doc.font(fonts.regular).fontSize(22).fillColor(C.gold).fillOpacity(0.8);
      doc.text(String(n.value), cx - colW / 2, numY, { width: colW, align: 'center' });
      doc.font(fonts.regular).fontSize(7).fillColor(C.textFaint).fillOpacity(0.55);
      doc.text(n.label.toUpperCase(), cx - colW / 2, numY + 28, { width: colW, align: 'center', characterSpacing: 1.5 });
    });

    // Footer
    doc.font(fonts.regular).fontSize(7.5).fillColor(C.textFaint).fillOpacity(0.4);
    doc.text('ASTRO OS  ·  ЛИЧЕН  ·  ПОВЕРИТЕЛЕН', 0, PAGE_H - 46, { align: 'center', width: PAGE_W, characterSpacing: 3 });
    doc.fillOpacity(1);
  }

  // ===== PRODUCT PDF =====

  static PRODUCT_TITLES = {
    'personal-profile':  'ЛИЧЕН АНАЛИЗ',
    'synastry':          'ЛЮБОВНА СЪВМЕСТИМОСТ',
    'yearly-analysis':   `ГОДИШЕН АНАЛИЗ ${new Date().getFullYear()}`,
    'archetype-profile': 'АРХЕТИП ПРОФИЛ',
    'life-map':          'КАРТА НА ЖИВОТА',
    'hidden-potential':  'СКРИТ ПОТЕНЦИАЛ',
    'energy-profile':    'ЕНЕРГИЕН ПРОФИЛ',
    'ideal-partner':     'ИДЕАЛЕН ПАРТНЬОР',
    'full-life-code':    'ПЪЛЕН ЖИВОТЕН КОД',
  };

  static PRODUCT_SUBTITLES = {
    'personal-profile':  'ДЪЛБОК ПЕРСОНАЛЕН АНАЛИЗ',
    'synastry':          'СИНАСТРИЯ И ВЗАИМНОСТ',
    'yearly-analysis':   'ПРОГНОЗА ЗА ГОДИНАТА',
    'archetype-profile': 'ПСИХОЛОГИЧЕН АРХЕТИП',
    'life-map':          'ЖИЗНЕНА КАРТОГРАФИЯ',
    'hidden-potential':  'НЕОТКЛЮЧЕНИ ДАРБИ',
    'energy-profile':    'ЕНЕРГИЯ И РИТМИ',
    'ideal-partner':     'ОБРАЗЪТ НА ЛЮБОВТА',
    'full-life-code':    'ПЪЛЕН ДУХОВЕН АНАЛИЗ',
  };

  static async generateProductPDF(productType, userData, analysisText, natal, numerology) {
    const stage = `Product PDF (${productType})`;
    const safeName = (userData?.name || 'astro').replace(/\s+/g, '-');
    const filename = tempFileManager.generateFileName(`${safeName}-${productType}`, 'pdf');
    const filepath = tempFileManager.getTempPath(filename);

    try {
      console.log(`${LOG_PREFIX} [${stage}] START: ${filename}`);

      await this.buildProductPdfKit(filepath, productType, userData, analysisText, natal, numerology);
      console.log(`${LOG_PREFIX} [${stage}] PDF written to disk`);

      const fileSize = tempFileManager.validateFile(filepath, 2000);
      console.log(`${LOG_PREFIX} [${stage}] Validated: ${fileSize} bytes — SUCCESS`);

      return { filepath, filename, fileSize };
    } catch (err) {
      console.error(`${LOG_PREFIX} [${stage}] ERROR:`, err.message);
      tempFileManager.cleanupFile(filepath);
      throw err;
    }
  }

  static buildProductPdfKit(filepath, productType, userData, analysisText, natal, numerology) {
    return new Promise((resolve, reject) => {
      let fonts;
      try {
        fonts = {
          regular: findFont('regular'),
          bold:    findFont('bold'),
          italic:  findFont('italic'),
        };
      } catch (err) {
        return reject(err);
      }

      const title    = ExportService.PRODUCT_TITLES[productType]    || 'АСТРО АНАЛИЗ';
      const subtitle = ExportService.PRODUCT_SUBTITLES[productType] || 'ПЕРСОНАЛЕН АНАЛИЗ';

      const doc = new PDFDocument({
        size: 'A4',
        margin: 0,
        info: {
          Title: `${title} — ${userData?.name || ''}`,
          Author: 'Astro OS',
          Subject: subtitle,
        },
      });

      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);
      stream.on('finish', resolve);
      stream.on('error', reject);
      doc.on('error', reject);

      doc.on('pageAdded', () => {
        doc.rect(0, 0, PAGE_W, PAGE_H).fill(C.bg);
        doc.fillColor(C.textDim).fillOpacity(1);
      });

      try {
        // Cover
        this.drawProductCoverPage(doc, title, subtitle, userData, natal, fonts);

        // Content — wrap analysisText as a single section, drawSectionPage will
        // handle title + auto-pagination through the pageAdded handler.
        doc.addPage();
        this.drawSectionPage(doc, { title, content: analysisText || '' }, fonts, 2);

        // Closing
        doc.addPage();
        this.drawProductClosingPage(doc, title, userData, natal, numerology, fonts);

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  static drawProductCoverPage(doc, title, subtitle, userData, natal, fonts) {
    const signSymbols = {
      'Овен': '♈', 'Телец': '♉', 'Близнаци': '♊', 'Рак': '♋', 'Лъв': '♌', 'Дева': '♍',
      'Везни': '♎', 'Скорпион': '♏', 'Стрелец': '♐', 'Козирог': '♑', 'Водолей': '♒', 'Риби': '♓'
    };
    const sunSign  = natal?.sun?.sign?.name;
    const moonSign = natal?.moon?.sign?.name;
    const sunSym   = signSymbols[sunSign]  || '☀';
    const moonSym  = signSymbols[moonSign] || '☽';

    fillPage(doc, C.bg);
    starField(doc, 100, 24680);

    // Layered nebula glow — малко по-богато от стандартния
    doc.circle(PAGE_W / 2, PAGE_H * 0.38, 320).fillOpacity(0.13).fill(C.bgPurple);
    doc.circle(PAGE_W * 0.18, PAGE_H * 0.72, 200).fillOpacity(0.08).fill(C.bgPurple);
    doc.circle(PAGE_W * 0.82, PAGE_H * 0.18, 140).fillOpacity(0.06).fill(C.bgPurple);
    doc.fillOpacity(1).fillColor(C.textDim);

    // Astrology wheel зад заглавието + допълнителна окръжност за богат фон
    astrologyWheel(doc, PAGE_W / 2, PAGE_H * 0.38, 220, 145);
    mysticCircle(doc, PAGE_W / 2, PAGE_H * 0.38, [
      { r: 252, op: 0.07, lw: 0.3 },
      { r: 178, op: 0.09, lw: 0.3 },
      { r: 96,  op: 0.14, lw: 0.4 },
    ]);

    // Ъглови орнаменти — двойни, за по-силен декоративен ефект
    cornerOrnaments(doc, 36);
    cornerOrnaments(doc, 52);
    cornerOrnaments(doc, PAGE_H - 36 - 16);
    cornerOrnaments(doc, PAGE_H - 52 - 16);

    // Външна рамка
    doc.rect(24, 24, PAGE_W - 48, PAGE_H - 48)
       .lineWidth(0.4).strokeOpacity(0.14).stroke(C.gold);

    // Вътрешна фина линия — допълнителен лукс
    doc.rect(34, 34, PAGE_W - 68, PAGE_H - 68)
       .lineWidth(0.3).strokeOpacity(0.07).stroke(C.gold);

    // Горен орнамент — разширен с допълнителни символи
    doc.font(fonts.regular).fontSize(13).fillColor(C.gold).fillOpacity(0.55);
    doc.text('★  ◆  ☽  ◆  ★', 0, 84, { align: 'center', width: PAGE_W, characterSpacing: 4 });

    // Бранд линия отгоре
    doc.font(fonts.regular).fontSize(9).fillColor(C.goldDim).fillOpacity(0.7);
    doc.text('АСТРО ОС', 0, 116, { align: 'center', width: PAGE_W, characterSpacing: 6 });

    // Главно заглавие — продуктово (по-голямо и централно)
    doc.font(fonts.regular).fontSize(38).fillColor(C.gold).fillOpacity(1);
    doc.text(title, 0, 150, { align: 'center', width: PAGE_W, characterSpacing: 4 });

    // Подзаглавие
    doc.font(fonts.regular).fontSize(10).fillColor(C.goldDim).fillOpacity(0.8);
    doc.text(subtitle, 0, 210, { align: 'center', width: PAGE_W, characterSpacing: 4 });

    ornamentDivider(doc, 240, C.gold, 0.45);

    // Име — централен фокус
    doc.font(fonts.italic).fontSize(34).fillColor(C.text).fillOpacity(1);
    doc.text(userData?.name || '', 0, 262, { align: 'center', width: PAGE_W });

    // Дата + място
    const birthLine = [userData?.birthDate, userData?.birthPlace].filter(Boolean).join('  ·  ');
    if (birthLine) {
      doc.font(fonts.regular).fontSize(10).fillColor(C.goldDim).fillOpacity(0.85);
      doc.text(birthLine, 0, 316, { align: 'center', width: PAGE_W, characterSpacing: 1.5 });
    }

    // Зодиакални символи — Слънце/Луна (ако са налични)
    if (sunSign || moonSign) {
      doc.font(fonts.regular).fontSize(40).fillColor(C.gold).fillOpacity(0.82);
      doc.text(`${sunSym}  ${moonSym}`, 0, 358, { align: 'center', width: PAGE_W });
    }

    // Декоративен трисимволен ред под зодиаците
    doc.font(fonts.regular).fontSize(10).fillColor(C.goldDark).fillOpacity(0.45);
    doc.text('◆  ★  ◆', 0, 416, { align: 'center', width: PAGE_W, characterSpacing: 12 });

    ornamentDivider(doc, 458, C.gold, 0.3);

    // Лейбъли за Слънце/Луна/Асцендент
    doc.font(fonts.italic).fontSize(12).fillColor(C.textMuted).fillOpacity(0.75);
    if (sunSign)  doc.text(`${sunSym}  ${sunSign}  ·  Слънчев Знак`,  0, 476, { align: 'center', width: PAGE_W });
    if (moonSign) doc.text(`${moonSym}  ${moonSign}  ·  Лунен Знак`, 0, 498, { align: 'center', width: PAGE_W });

    const ascSign = natal?.ascendant?.sign?.name;
    if (ascSign) {
      doc.font(fonts.regular).fontSize(9).fillColor(C.textFaint).fillOpacity(0.6);
      doc.text(`↑  ${ascSign}  ·  Асцендент`, 0, 522, { align: 'center', width: PAGE_W });
    }

    // Долен орнамент
    doc.font(fonts.regular).fontSize(11).fillColor(C.gold).fillOpacity(0.4);
    doc.text('★  ☽  ★', 0, PAGE_H - 78, { align: 'center', width: PAGE_W, characterSpacing: 6 });

    // Долен подпис
    doc.font(fonts.regular).fontSize(7.5).fillColor(C.textFaint).fillOpacity(0.45);
    doc.text('ЛИЧЕН  ·  ПОВЕРИТЕЛЕН  ·  ДУХОВЕН', 0, PAGE_H - 48, { align: 'center', width: PAGE_W, characterSpacing: 3 });
  }

  static drawProductClosingPage(doc, title, userData, natal, numerology, fonts) {
    fillPage(doc, C.bg);
    starField(doc, 100, 88888);

    // Дълбок виолетов глоу
    doc.circle(PAGE_W / 2, PAGE_H * 0.42, 300).fillOpacity(0.15).fill(C.bgPurple);
    doc.circle(PAGE_W * 0.78, PAGE_H * 0.18, 160).fillOpacity(0.08).fill(C.bgPurple);
    doc.circle(PAGE_W * 0.22, PAGE_H * 0.78, 140).fillOpacity(0.06).fill(C.bgPurple);
    doc.fillOpacity(1).fillColor(C.textDim);

    // Зодиакално колело + допълнителна концентрична окръжност
    astrologyWheel(doc, PAGE_W / 2, PAGE_H * 0.42, 240, 160);
    mysticCircle(doc, PAGE_W / 2, PAGE_H * 0.42, [
      { r: 268, op: 0.06, lw: 0.3 },
      { r: 108, op: 0.13, lw: 0.4 },
    ]);

    // Външна рамка + вътрешна фина линия
    doc.rect(24, 24, PAGE_W - 48, PAGE_H - 48)
       .lineWidth(0.4).strokeOpacity(0.12).stroke(C.gold);
    doc.rect(34, 34, PAGE_W - 68, PAGE_H - 68)
       .lineWidth(0.3).strokeOpacity(0.07).stroke(C.gold);

    cornerOrnaments(doc, 36);
    cornerOrnaments(doc, PAGE_H - 36 - 16);

    // Топ орнамент
    doc.font(fonts.regular).fontSize(22).fillColor(C.gold).fillOpacity(0.6);
    doc.text('★', 0, 72, { align: 'center', width: PAGE_W });

    // Подзаглавие
    doc.font(fonts.regular).fontSize(10).fillColor(C.goldDim).fillOpacity(0.7);
    doc.text(title, 0, 102, { align: 'center', width: PAGE_W, characterSpacing: 3 });

    // Главно заглавие на затварящата страница
    doc.font(fonts.regular).fontSize(26).fillColor(C.gold).fillOpacity(1);
    doc.text('ПОСЛАНИЕ ЗА ТЕБ', 0, 130, { align: 'center', width: PAGE_W, characterSpacing: 3 });

    ornamentDivider(doc, 174, C.gold, 0.45);

    // За името
    doc.font(fonts.italic).fontSize(13).fillColor(C.goldDim).fillOpacity(0.75);
    doc.text(`за  ${userData?.name || ''}`, 0, 190, { align: 'center', width: PAGE_W });

    // Поетичен текст
    const closingText = `Това, което прочете, не е предсказание — то е огледало.\nЗвездите не определят пътя ти, а го осветяват.\nТова, което избереш да направиш с тази карта, е твое.\n\nНека мъдростта, която носиш в себе си, бъде по-силна от всяка прогноза.`;

    const textW = CONTENT_W - 40;
    const textX = MARGIN + 20;
    const textY = 230;

    doc.font(fonts.italic).fontSize(12).fillColor(C.text).fillOpacity(0.9);
    doc.text(closingText, textX, textY, {
      width: textW,
      align: 'center',
      lineGap: 7,
      paragraphGap: 12,
    });

    // Декоративни символи
    doc.font(fonts.regular).fontSize(12).fillColor(C.gold).fillOpacity(0.4);
    doc.text('★  ☽  ◆  ☽  ★', 0, PAGE_H * 0.62, { align: 'center', width: PAGE_W, characterSpacing: 6 });

    // Нумерология (ако е налична)
    const nums = [];
    if (numerology?.lifePath != null) nums.push({ value: numerology.lifePath, label: 'Жизнен Път' });
    if (numerology?.destiny  != null) nums.push({ value: numerology.destiny,  label: 'Съдба' });
    if (natal?.sun?.sign?.name)       nums.push({ value: natal.sun.sign.name.slice(0, 3), label: 'Слънце' });
    if (natal?.moon?.sign?.name)      nums.push({ value: natal.moon.sign.name.slice(0, 3), label: 'Луна' });

    if (nums.length) {
      const numY = PAGE_H - 130;
      ornamentDivider(doc, numY - 14, C.gold, 0.25);

      const colW = CONTENT_W / nums.length;
      nums.forEach((n, i) => {
        const cx = MARGIN + i * colW + colW / 2;
        doc.font(fonts.regular).fontSize(22).fillColor(C.gold).fillOpacity(0.8);
        doc.text(String(n.value), cx - colW / 2, numY, { width: colW, align: 'center' });
        doc.font(fonts.regular).fontSize(7).fillColor(C.textFaint).fillOpacity(0.55);
        doc.text(n.label.toUpperCase(), cx - colW / 2, numY + 28, { width: colW, align: 'center', characterSpacing: 1.5 });
      });
    }

    // Долен подпис
    doc.font(fonts.regular).fontSize(7.5).fillColor(C.textFaint).fillOpacity(0.4);
    doc.text('ASTRO OS  ·  ЛИЧЕН  ·  ПОВЕРИТЕЛЕН', 0, PAGE_H - 46, { align: 'center', width: PAGE_W, characterSpacing: 3 });
    doc.fillOpacity(1);
  }

  // ===== DOCX =====

  static async generateDocx(report, sections) {
    const stage = 'DOCX generation';
    const filename = tempFileManager.generateFileName(`${report.user_name}-astro`, 'docx');
    const filepath = tempFileManager.getTempPath(filename);

    try {
      console.log(`${LOG_PREFIX} [${stage}] START: ${filename}`);

      const buffer = await this.buildDocxBuffer(report, sections);
      console.log(`${LOG_PREFIX} [${stage}] Buffer created: ${buffer.length} bytes`);

      tempFileManager.writeFile(filename, buffer);
      console.log(`${LOG_PREFIX} [${stage}] Written to disk`);

      const fileSize = tempFileManager.validateFile(filepath, 5000);
      console.log(`${LOG_PREFIX} [${stage}] Validated: ${fileSize} bytes — SUCCESS`);

      return { filepath, filename, fileSize };

    } catch (err) {
      console.error(`${LOG_PREFIX} [${stage}] ERROR:`, err.message);
      tempFileManager.cleanupFile(filepath);
      throw err;
    }
  }

  static buildDocxBuffer(report, sections) {
    const children = [];

    children.push(new Paragraph({
      text: 'АСТРО ОС — Персонален Духовен Анализ',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }));

    children.push(new Paragraph({
      children: [new TextRun({ text: report.user_name, bold: true, size: 52 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }));

    children.push(new Paragraph({
      text: `${report.birth_date} · ${report.birth_place}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    }));

    for (const [, section] of Object.entries(sections || {})) {
      children.push(new Paragraph({
        text: section.title,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 600, after: 300 },
      }));

      const paragraphs = (section.content || '').split('\n\n').filter(p => p.trim());
      for (const para of paragraphs) {
        children.push(new Paragraph({
          children: [new TextRun({ text: para.trim(), size: 24 })],
          spacing: { after: 240 },
          alignment: AlignmentType.BOTH,
        }));
      }
    }

    return Packer.toBuffer(new Document({ sections: [{ children }] }));
  }

  // ===== Markdown =====

  static async generateMarkdown(report, sections) {
    const stage = 'Markdown generation';
    const filename = tempFileManager.generateFileName(`${report.user_name}-astro`, 'md');
    const filepath = tempFileManager.getTempPath(filename);

    try {
      console.log(`${LOG_PREFIX} [${stage}] START`);

      const content = this.buildMarkdownContent(report, sections);
      tempFileManager.writeFile(filename, content);

      const fileSize = tempFileManager.validateFile(filepath, 1000);
      console.log(`${LOG_PREFIX} [${stage}] Validated: ${fileSize} bytes — SUCCESS`);

      return { filepath, filename, fileSize };

    } catch (err) {
      console.error(`${LOG_PREFIX} [${stage}] ERROR:`, err.message);
      tempFileManager.cleanupFile(filepath);
      throw err;
    }
  }

  static buildMarkdownContent(report, sections) {
    const lines = [
      `# АСТРО ОС — Персонален Духовен Анализ`,
      '',
      `**${report.user_name}**`,
      `${report.birth_date} · ${report.birth_place}`,
      '',
      '---',
      '',
    ];
    for (const [, section] of Object.entries(sections || {})) {
      lines.push(`## ${section.title}`, '', section.content || '', '', '---', '');
    }
    return lines.join('\n');
  }

  // ===== TXT =====

  static async generateTxt(report, sections) {
    const stage = 'TXT generation';
    const filename = tempFileManager.generateFileName(`${report.user_name}-astro`, 'txt');
    const filepath = tempFileManager.getTempPath(filename);

    try {
      console.log(`${LOG_PREFIX} [${stage}] START`);

      const content = this.buildTxtContent(report, sections);
      tempFileManager.writeFile(filename, content);

      const fileSize = tempFileManager.validateFile(filepath, 1000);
      console.log(`${LOG_PREFIX} [${stage}] Validated: ${fileSize} bytes — SUCCESS`);

      return { filepath, filename, fileSize };

    } catch (err) {
      console.error(`${LOG_PREFIX} [${stage}] ERROR:`, err.message);
      tempFileManager.cleanupFile(filepath);
      throw err;
    }
  }

  static buildTxtContent(report, sections) {
    const lines = [
      'АСТРО ОС — ПЕРСОНАЛЕН ДУХОВЕН АНАЛИЗ',
      '='.repeat(50),
      '',
      report.user_name,
      `${report.birth_date} · ${report.birth_place}`,
      '',
      '='.repeat(50),
      '',
    ];
    for (const [, section] of Object.entries(sections || {})) {
      lines.push(section.title.toUpperCase(), '-'.repeat(40), '', section.content || '', '', '');
    }
    return lines.join('\n');
  }
}

module.exports = ExportService;
