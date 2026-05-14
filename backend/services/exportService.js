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

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function fillPage(doc, color, resetColor = C.textDim) {
  doc.rect(0, 0, PAGE_W, PAGE_H).fill(color);
  // Explicitly reset fill color — save/restore only affects the PDF graphics stack,
  // not PDFKit's internal JS color state, so text after fill() would inherit the
  // background color and become invisible.
  doc.fillColor(resetColor).fillOpacity(1);
}

function dividerLine(doc, y, color = C.goldDark, alpha = 0.4) {
  const mid = PAGE_W / 2;
  const len = 180;
  doc.moveTo(mid - len / 2, y)
     .lineTo(mid + len / 2, y)
     .lineWidth(0.5)
     .strokeOpacity(alpha)
     .stroke(color);
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
        this.drawCoverPage(doc, report, natal, fonts);
        doc.addPage();
        this.drawSummaryPage(doc, natal, numerology, fonts);

        const sectionEntries = Object.entries(sections || {});
        for (const [, section] of sectionEntries) {
          doc.addPage();
          this.drawSectionPage(doc, section, fonts);
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

    // Background gradient simulation (two rects)
    fillPage(doc, C.bg);
    doc.circle(PAGE_W / 2, 280, 320)
       .fillOpacity(0.18)
       .fill(C.bgPurple);

    // Top ornament
    doc.font(fonts.regular).fontSize(13).fillColor(C.gold).fillOpacity(0.6);
    doc.text('✦  ☽  ✦', 0, 100, { align: 'center', width: PAGE_W });

    // Main title
    doc.font(fonts.regular).fontSize(44).fillColor(C.gold).fillOpacity(1);
    doc.text('АСТРО ОС', 0, 140, { align: 'center', width: PAGE_W, characterSpacing: 6 });

    // Subtitle
    doc.font(fonts.regular).fontSize(11).fillColor(C.goldDim);
    doc.text('ПЕРСОНАЛЕН  ДУХОВЕН  АНАЛИЗ', 0, 202, { align: 'center', width: PAGE_W, characterSpacing: 4 });

    // Divider
    dividerLine(doc, 235, C.gold, 0.5);

    // Name
    doc.font(fonts.italic).fontSize(34).fillColor(C.text);
    doc.text(report.user_name, 0, 258, { align: 'center', width: PAGE_W });

    // Birth info
    doc.font(fonts.regular).fontSize(11).fillColor(C.goldDim);
    doc.text(`${report.birth_date}  ·  ${report.birth_place}`, 0, 310, { align: 'center', width: PAGE_W, characterSpacing: 1.5 });

    // Zodiac signs
    doc.font(fonts.regular).fontSize(36).fillColor(C.gold).fillOpacity(0.85);
    doc.text(`${sunSym}  ${moonSym}`, 0, 350, { align: 'center', width: PAGE_W });

    // Category
    if (report.category) {
      doc.font(fonts.regular).fontSize(10).fillColor(C.textMuted).fillOpacity(0.7);
      doc.text(report.category.toUpperCase(), 0, 415, { align: 'center', width: PAGE_W, characterSpacing: 2 });
    }

    // Second divider
    dividerLine(doc, 445, C.gold, 0.35);

    // Sun/Moon sign labels
    doc.font(fonts.italic).fontSize(13).fillColor(C.textMuted).fillOpacity(0.8);
    const sunLabel  = sunSign  ? `${sunSign}  ·  Слънчев Знак`  : '';
    const moonLabel = moonSign ? `${moonSign}  ·  Лунен Знак` : '';
    if (sunLabel)  doc.text(sunLabel,  0, 468, { align: 'center', width: PAGE_W });
    if (moonLabel) doc.text(moonLabel, 0, 490, { align: 'center', width: PAGE_W });

    // Footer
    doc.font(fonts.regular).fontSize(8).fillColor(C.textFaint).fillOpacity(0.6);
    doc.text('ЛИЧЕН  ·  ПОВЕРИТЕЛЕН  ·  ДУХОВЕН', 0, PAGE_H - 55, { align: 'center', width: PAGE_W, characterSpacing: 2 });
  }

  static drawSummaryPage(doc, natal, numerology, fonts) {
    fillPage(doc, C.bg);

    // Heading
    doc.font(fonts.regular).fontSize(20).fillColor(C.gold).fillOpacity(1);
    doc.text('Астрологичен Профил', 0, MARGIN + 10, { align: 'center', width: PAGE_W, characterSpacing: 2 });

    dividerLine(doc, MARGIN + 48, C.gold, 0.4);

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

  static drawSectionPage(doc, section, fonts) {
    fillPage(doc, C.bg);

    // Ornament
    doc.font(fonts.regular).fontSize(9).fillColor(C.gold).fillOpacity(0.4);
    doc.text('✦  ✦  ✦', 0, MARGIN + 8, { align: 'center', width: PAGE_W, characterSpacing: 12 });

    // Section title
    doc.font(fonts.regular).fontSize(22).fillColor(C.gold).fillOpacity(1);
    doc.text(section.title, MARGIN, MARGIN + 36, { width: CONTENT_W, align: 'center', characterSpacing: 1.5 });

    // Divider under title
    const titleBottom = doc.y + 12;
    dividerLine(doc, titleBottom, C.gold, 0.35);

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
