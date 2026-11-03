const express = require('express');
const { param } = require('express-validator');
const { authenticate, authorize } = require('../middlewares/auth');
const {
  getAllQuotes,
  getQuoteById,
  createQuote,
  updateQuote,
  updateQuoteStatus,
  deleteQuote,
  downloadQuotePDF,
} = require('../controllers/quoteController');
const {
  createQuoteValidator,
  updateQuoteValidator,
  updateQuoteStatusValidator,
} = require('../validators/quoteValidator');
const validate = require('../middlewares/validate');

const router = express.Router();

const quoteIdParam = [
  param('id').isUUID().withMessage('Invalid quote ID'),
];

/**
 * @swagger
 * tags:
 *   name: Quotes
 *   description: Quote and proposal management
 */

/**
 * @swagger
 * /api/quotes:
 *   get:
 *     summary: List all quotes
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED] }
 *       - in: query
 *         name: dealId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Quotes retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, getAllQuotes);

/**
 * @swagger
 * /api/quotes/{id}:
 *   get:
 *     summary: Get a quote by ID
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Quote retrieved
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Quote not found
 */
router.get('/:id', authenticate, validate(quoteIdParam), getQuoteById);

/**
 * @swagger
 * /api/quotes/{id}/pdf:
 *   get:
 *     summary: Download a quote as PDF
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: PDF file download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Quote not found
 */
router.get('/:id/pdf', authenticate, validate(quoteIdParam), downloadQuotePDF);

/**
 * @swagger
 * /api/quotes:
 *   post:
 *     summary: Create a new quote (admin or sales)
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [dealId, items]
 *             properties:
 *               dealId: { type: string, format: uuid }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId: { type: string, format: uuid }
 *                     name: { type: string }
 *                     quantity: { type: number, minimum: 0.01 }
 *                     unitPrice: { type: number, minimum: 0 }
 *               validUntil: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Quote created
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Deal not found
 */
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'SALES'),
  validate(createQuoteValidator),
  createQuote
);

/**
 * @swagger
 * /api/quotes/{id}:
 *   put:
 *     summary: Update a quote (admin or deal owner)
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId: { type: string, format: uuid }
 *                     name: { type: string }
 *                     quantity: { type: number, minimum: 0.01 }
 *                     unitPrice: { type: number, minimum: 0 }
 *               validUntil: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Quote updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Quote not found
 */
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'SALES'),
  validate([...quoteIdParam, ...updateQuoteValidator]),
  updateQuote
);

/**
 * @swagger
 * /api/quotes/{id}/status:
 *   put:
 *     summary: Update quote status (admin or sales)
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED] }
 *     responses:
 *       200:
 *         description: Quote status updated
 *       400:
 *         description: Invalid status transition
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Quote not found
 */
router.put(
  '/:id/status',
  authenticate,
  authorize('ADMIN', 'SALES'),
  validate([...quoteIdParam, ...updateQuoteStatusValidator]),
  updateQuoteStatus
);

/**
 * @swagger
 * /api/quotes/{id}:
 *   delete:
 *     summary: Delete a quote (admin only)
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Quote deleted
 *       400:
 *         description: Only draft quotes can be deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Quote not found
 */
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(quoteIdParam),
  deleteQuote
);

module.exports = router;
