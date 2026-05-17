'use strict';

const ExportService = require('./exportService');
const { getById } = require('../catalog');

/**
 * High-level wrapper around ExportService.generateMergedPDF.
 * Accepts the array of `{ itemId, content }` that orderService produces,
 * resolves the catalog metadata, and forwards to the PDF generator.
 *
 * Example:
 *   await mergeSectionsToPdf({
 *     items: [{ itemId: 1, content: '...AI text...' }, { itemId: 'B2', content: '...' }],
 *     userData, natal, numerology,
 *   });
 */
async function mergeSectionsToPdf({ items, userData, natal, numerology }) {
  const sections = items.map(({ itemId, content }) => {
    const catalogItem = getById(itemId);
    if (!catalogItem) {
      throw new Error(`pdfMerger: unknown catalog id "${itemId}"`);
    }
    return {
      title: catalogItem.pdfTitle || catalogItem.title,
      subtitle: catalogItem.subtitle,
      catalogItem,
      content: content || '',
    };
  });

  return ExportService.generateMergedPDF(sections, userData, natal, numerology);
}

module.exports = { mergeSectionsToPdf };
