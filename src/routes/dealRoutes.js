const express = require('express');
const { param } = require('express-validator');
const { authenticate, authorize } = require('../middlewares/auth');
const {
  getAllDeals,
  getDealById,
  createDeal,
  updateDeal,
  updateDealStage,
  deleteDeal,
  getDealsByStage,
} = require('../controllers/dealController');
const {
  getActivitiesByDeal,
  createActivity,
} = require('../controllers/activityController');
const {
  createDealValidator,
  updateDealValidator,
  updateDealStageValidator,
} = require('../validators/dealValidator');
const { createActivityValidator } = require('../validators/activityValidator');
const validate = require('../middlewares/validate');

const router = express.Router();

const dealIdParam = [
  param('id').isUUID().withMessage('Invalid deal ID'),
];

const dealIdNestedParam = [
  param('dealId').isUUID().withMessage('Invalid deal ID'),
];

/**
 * @swagger
 * tags:
 *   name: Deals
 *   description: Sales pipeline deal management
 */

/**
 * @swagger
 * /api/deals:
 *   get:
 *     summary: List all deals
 *     tags: [Deals]
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
 *         name: stage
 *         schema: { type: string, enum: [LEAD, QUALIFICATION, PROPOSAL, NEGOTIATION, CLOSED_WON, CLOSED_LOST] }
 *       - in: query
 *         name: customerId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: salesRepId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Deals retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, getAllDeals);

/**
 * @swagger
 * /api/deals/kanban:
 *   get:
 *     summary: Get deals grouped by stage (kanban view)
 *     tags: [Deals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Deals grouped by stage
 *       401:
 *         description: Unauthorized
 */
router.get('/kanban', authenticate, getDealsByStage);

/**
 * @swagger
 * /api/deals/{id}:
 *   get:
 *     summary: Get a deal by ID
 *     tags: [Deals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Deal retrieved
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Deal not found
 */
router.get('/:id', authenticate, validate(dealIdParam), getDealById);

/**
 * @swagger
 * /api/deals:
 *   post:
 *     summary: Create a new deal (admin or sales)
 *     tags: [Deals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, customerId, value]
 *             properties:
 *               title: { type: string }
 *               customerId: { type: string, format: uuid }
 *               value: { type: number, minimum: 0.01 }
 *               probability: { type: integer, minimum: 0, maximum: 100 }
 *               expectedCloseDate: { type: string, format: date-time }
 *               stage: { type: string, enum: [LEAD, QUALIFICATION, PROPOSAL, NEGOTIATION, CLOSED_WON, CLOSED_LOST] }
 *     responses:
 *       201:
 *         description: Deal created
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Customer not found
 */
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'SALES'),
  validate(createDealValidator),
  createDeal
);

/**
 * @swagger
 * /api/deals/{id}:
 *   put:
 *     summary: Update a deal (admin or owner)
 *     tags: [Deals]
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
 *               title: { type: string }
 *               customerId: { type: string, format: uuid }
 *               value: { type: number, minimum: 0.01 }
 *               probability: { type: integer, minimum: 0, maximum: 100 }
 *               expectedCloseDate: { type: string, format: date-time }
 *               stage: { type: string, enum: [LEAD, QUALIFICATION, PROPOSAL, NEGOTIATION, CLOSED_WON, CLOSED_LOST] }
 *     responses:
 *       200:
 *         description: Deal updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Deal or customer not found
 */
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'SALES'),
  validate([...dealIdParam, ...updateDealValidator]),
  updateDeal
);

/**
 * @swagger
 * /api/deals/{id}/stage:
 *   put:
 *     summary: Update deal stage (admin or sales)
 *     tags: [Deals]
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
 *             required: [stage]
 *             properties:
 *               stage: { type: string, enum: [LEAD, QUALIFICATION, PROPOSAL, NEGOTIATION, CLOSED_WON, CLOSED_LOST] }
 *     responses:
 *       200:
 *         description: Deal stage updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Deal not found
 */
router.put(
  '/:id/stage',
  authenticate,
  authorize('ADMIN', 'SALES'),
  validate([...dealIdParam, ...updateDealStageValidator]),
  updateDealStage
);

/**
 * @swagger
 * /api/deals/{id}:
 *   delete:
 *     summary: Delete a deal (admin or owner)
 *     tags: [Deals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Deal deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Deal not found
 */
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'SALES'),
  validate(dealIdParam),
  deleteDeal
);

/**
 * @swagger
 * /api/deals/{dealId}/activities:
 *   get:
 *     summary: List activities for a deal
 *     tags: [Deals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dealId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Activities retrieved
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Deal not found
 */
router.get(
  '/:dealId/activities',
  authenticate,
  validate(dealIdNestedParam),
  getActivitiesByDeal
);

/**
 * @swagger
 * /api/deals/{dealId}/activities:
 *   post:
 *     summary: Create an activity for a deal (admin or sales)
 *     tags: [Deals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dealId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type]
 *             properties:
 *               type: { type: string, enum: [CALL, EMAIL, MEETING] }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Activity created
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Deal not found
 */
router.post(
  '/:dealId/activities',
  authenticate,
  authorize('ADMIN', 'SALES'),
  validate([...dealIdNestedParam, ...createActivityValidator]),
  createActivity
);

module.exports = router;
