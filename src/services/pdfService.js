const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const logger = require('../utils/logger');

const QUOTES_DIR = path.join(process.env.UPLOAD_DIR || './uploads', 'quotes');

/**
 * Ensure the quotes output directory exists.
 */
function ensureQuotesDir() {
  if (!fs.existsSync(QUOTES_DIR)) {
    fs.mkdirSync(QUOTES_DIR, { recursive: true });
    logger.info(`Created quotes directory: ${QUOTES_DIR}`);
  }
}

ensureQuotesDir();

/**
 * Format currency value.
 * @param {number|string} value
 * @returns {string}
 */
function formatCurrency(value) {
  const num = Number(value);
  return Number.isNaN(num)
    ? String(value)
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(num);
}

/**
 * Draw a simple table row.
 * @param {PDFDocument} doc
 * @param {number} y
 * @param {Array<string>} columns
 * @param {Array<number>} widths
 * @param {Array<string>} aligns
 */
function drawTableRow(doc, y, columns, widths, aligns = []) {
  let x = 50;
  columns.forEach((text, index) => {
    const width = widths[index];
    const align = aligns[index] || 'left';
    doc.text(text, x, y, { width, align });
    x += width;
  });
}

/**
 * Generate a PDF for a quote.
 * @param {Object} quote
 * @returns {Promise<Buffer>} PDF buffer
 */
async function generateQuotePDF(quote) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      const quoteNumber = quote.quoteNumber || `QUOTE-${quote.id.slice(0, 8).toUpperCase()}`;
      const quoteDate = quote.createdAt
        ? new Date(quote.createdAt).toLocaleDateString('en-US')
        : new Date().toLocaleDateString('en-US');
      const validUntil = quote.validUntil
        ? new Date(quote.validUntil).toLocaleDateString('en-US')
        : 'N/A';

      // Header
      doc.fontSize(24).text('SalesHub', 50, 50);
      doc.fontSize(12).fillColor('#666666').text('B2B IT Sales Management');
      doc.moveDown(2);

      // Quote title
      doc.fillColor('#000000').fontSize(20).text('QUOTE', { align: 'right' });
      doc.fontSize(10).fillColor('#666666').text(`Quote #: ${quoteNumber}`, { align: 'right' });
      doc.fontSize(10).text(`Date: ${quoteDate}`, { align: 'right' });
      doc.fontSize(10).text(`Valid Until: ${validUntil}`, { align: 'right' });
      doc.moveDown(2);

      // Customer info
      const customer = quote.deal?.customer || quote.customer || {};
      doc.fontSize(14).fillColor('#000000').text('Bill To:');
      doc.fontSize(11).fillColor('#333333');
      doc.text(customer.companyName || 'Customer');
      if (customer.contactName) doc.text(`Attn: ${customer.contactName}`);
      if (customer.email) doc.text(customer.email);
      if (customer.phone) doc.text(customer.phone);
      if (customer.address) doc.text(customer.address);
      doc.moveDown(2);

      // Items table header
      const tableTop = doc.y;
      const widths = [260, 70, 100, 100];
      const aligns = ['left', 'center', 'right', 'right'];

      doc.fontSize(11).fillColor('#FFFFFF');
      doc.rect(50, tableTop - 5, 530, 20).fill('#333333');
      drawTableRow(
        doc,
        tableTop,
        ['Description', 'Qty', 'Unit Price', 'Total'],
        widths,
        aligns
      );

      // Items
      let y = tableTop + 25;
      doc.fillColor('#333333').fontSize(10);

      const items = Array.isArray(quote.items) ? quote.items : [];
      items.forEach((item, index) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        const total = quantity * unitPrice;

        drawTableRow(
          doc,
          y,
          [
            item.name || item.description || `Item ${index + 1}`,
            String(quantity),
            formatCurrency(unitPrice),
            formatCurrency(total),
          ],
          widths,
          aligns
        );

        y += 20;
      });

      // Grand total
      doc.moveDown(1);
      doc.fontSize(12).fillColor('#000000');
      doc.text(`Grand Total: ${formatCurrency(quote.totalAmount || 0)}`, 50, doc.y, {
        align: 'right',
      });
      doc.moveDown(2);

      // Terms & conditions
      doc.fontSize(11).text('Terms & Conditions');
      doc.fontSize(10).fillColor('#555555');
      doc.text(
        'This quote is valid until the date stated above. Prices are subject to change unless accepted within the validity period. Payment terms are net 30 days from invoice date.',
        { width: 530 }
      );
      doc.moveDown(2);

      // Footer
      doc.fontSize(9).fillColor('#888888');
      doc.text(
        'SalesHub | support@saleshub.com | www.saleshub.com',
        50,
        doc.page.height - 70,
        { align: 'center', width: doc.page.width - 100 }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate a quote PDF and save it to disk.
 * @param {Object} quote
 * @returns {Promise<{buffer: Buffer, filePath: string}>}
 */
async function generateAndSaveQuotePDF(quote) {
  const buffer = await generateQuotePDF(quote);
  const filename = `quote-${quote.id}.pdf`;
  const filePath = path.join(QUOTES_DIR, filename);

  fs.writeFileSync(filePath, buffer);
  logger.info(`Saved quote PDF: ${filePath}`);

  return { buffer, filePath };
}

module.exports = {
  generateQuotePDF,
  generateAndSaveQuotePDF,
};
