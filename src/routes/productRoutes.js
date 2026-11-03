const express = require('express');
const { param } = require('express-validator');
const { authenticate, authorize } = require('../middlewares/auth');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const {
  createProductValidator,
  updateProductValidator,
} = require('../validators/productValidator');
const validate = require('../middlewares/validate');

const router = express.Router();

const productIdParam = [
  param('id').isUUID().withMessage('Invalid product ID'),
];

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product catalog management
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: List all products
 *     tags: [Products]
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
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Products retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, getAllProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Product retrieved
 *       404:
 *         description: Product not found
 */
router.get('/:id', authenticate, validate(productIdParam), getProductById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               category: { type: string }
 *               price: { type: number, minimum: 0.01 }
 *               specifications: { type: object }
 *     responses:
 *       201:
 *         description: Product created
 *       403:
 *         description: Forbidden
 */
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(createProductValidator),
  createProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product (admin only)
 *     tags: [Products]
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
 *               name: { type: string }
 *               description: { type: string }
 *               category: { type: string }
 *               price: { type: number, minimum: 0.01 }
 *               specifications: { type: object }
 *     responses:
 *       200:
 *         description: Product updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product not found
 */
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate([...productIdParam, ...updateProductValidator]),
  updateProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Product deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product not found
 */
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(productIdParam),
  deleteProduct
);

module.exports = router;
