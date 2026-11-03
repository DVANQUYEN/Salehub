const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const {
  getOverview,
  getSalesMetrics,
  getPipelineReport,
  getCustomerReport,
  getSalesRepPerformance,
} = require('../controllers/dashboardController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Sales dashboard and analytics
 */

/**
 * @swagger
 * /api/dashboard/overview:
 *   get:
 *     summary: Get dashboard overview
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard overview retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/overview', authenticate, getOverview);

/**
 * @swagger
 * /api/dashboard/sales-metrics:
 *   get:
 *     summary: Get sales metrics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sales metrics retrieved
 *       403:
 *         description: Forbidden
 */
router.get('/sales-metrics', authenticate, authorize('ADMIN', 'SALES'), getSalesMetrics);

/**
 * @swagger
 * /api/dashboard/pipeline:
 *   get:
 *     summary: Get pipeline report
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pipeline report retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/pipeline', authenticate, getPipelineReport);

/**
 * @swagger
 * /api/dashboard/customers:
 *   get:
 *     summary: Get customer report
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer report retrieved
 *       403:
 *         description: Forbidden
 */
router.get('/customers', authenticate, authorize('ADMIN', 'SALES'), getCustomerReport);

/**
 * @swagger
 * /api/dashboard/performance:
 *   get:
 *     summary: Get sales rep performance
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sales rep performance retrieved
 *       403:
 *         description: Forbidden
 */
router.get('/performance', authenticate, authorize('ADMIN'), getSalesRepPerformance);

module.exports = router;
