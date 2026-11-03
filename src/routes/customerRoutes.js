const express = require('express');
const { param } = require('express-validator');
const { authenticate, authorize } = require('../middlewares/auth');
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  updateCustomerStatus,
  deleteCustomer,
} = require('../controllers/customerController');
const {
  createCustomerValidator,
  updateCustomerValidator,
  updateCustomerStatusValidator,
} = require('../validators/customerValidator');
const validate = require('../middlewares/validate');

const router = express.Router();

const customerIdParam = [
  param('id').isUUID().withMessage('Invalid customer ID'),
];

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: CRM customer management
 */

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: List all customers
 *     tags: [Customers]
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
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [NEW, CONTACTED, QUALIFIED, PROPOSAL, CLOSED] }
 *     responses:
 *       200:
 *         description: Customers retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, getAllCustomers);

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Get a customer by ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Customer retrieved
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Customer not found
 */
router.get('/:id', authenticate, validate(customerIdParam), getCustomerById);

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create a new customer (admin or sales)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [companyName]
 *             properties:
 *               companyName: { type: string }
 *               contactName: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               address: { type: string }
 *               status: { type: string, enum: [NEW, CONTACTED, QUALIFIED, PROPOSAL, CLOSED] }
 *     responses:
 *       201:
 *         description: Customer created
 *       403:
 *         description: Forbidden
 */
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'SALES'),
  validate(createCustomerValidator),
  createCustomer
);

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Update a customer (admin or sales)
 *     tags: [Customers]
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
 *               companyName: { type: string }
 *               contactName: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               address: { type: string }
 *               status: { type: string, enum: [NEW, CONTACTED, QUALIFIED, PROPOSAL, CLOSED] }
 *     responses:
 *       200:
 *         description: Customer updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Customer not found
 */
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'SALES'),
  validate([...customerIdParam, ...updateCustomerValidator]),
  updateCustomer
);

/**
 * @swagger
 * /api/customers/{id}/status:
 *   put:
 *     summary: Update customer status (admin or sales)
 *     tags: [Customers]
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
 *               status: { type: string, enum: [NEW, CONTACTED, QUALIFIED, PROPOSAL, CLOSED] }
 *     responses:
 *       200:
 *         description: Customer status updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Customer not found
 */
router.put(
  '/:id/status',
  authenticate,
  authorize('ADMIN', 'SALES'),
  validate([...customerIdParam, ...updateCustomerStatusValidator]),
  updateCustomerStatus
);

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Delete a customer (admin only)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Customer deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Customer not found
 */
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(customerIdParam),
  deleteCustomer
);

module.exports = router;
