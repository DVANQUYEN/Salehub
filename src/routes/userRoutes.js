const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserActive,
  resetUserPassword,
} = require('../controllers/userController');
const {
  createUserValidator,
  updateUserValidator,
  userIdParam,
  resetPasswordValidator,
} = require('../validators/userValidator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management (admin only)
 */
router.use(authenticate, authorize('ADMIN'));

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users
 *     tags: [Users]
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
 *         name: role
 *         schema: { type: string, enum: [ADMIN, SALES, CUSTOMER] }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean, default: true }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Users retrieved
 *       403:
 *         description: Forbidden
 */
router.get('/', getAllUsers);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password]
 *             properties:
 *               fullName: { type: string, minLength: 2 }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               role: { type: string, enum: [ADMIN, SALES, CUSTOMER] }
 *     responses:
 *       201:
 *         description: User created
 *       409:
 *         description: Email already exists
 */
router.post('/', validate(createUserValidator), createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: User retrieved
 *       404:
 *         description: User not found
 */
router.get('/:id', validate(userIdParam), getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
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
 *               fullName: { type: string, minLength: 2 }
 *               email: { type: string, format: email }
 *               role: { type: string, enum: [ADMIN, SALES, CUSTOMER] }
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 *       409:
 *         description: Email already in use
 */
router.put('/:id', validate(userIdParam), validate(updateUserValidator), updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Soft delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: User deleted
 *       403:
 *         description: Cannot delete own account
 *       404:
 *         description: User not found
 */
router.delete('/:id', validate(userIdParam), deleteUser);

/**
 * @swagger
 * /api/users/{id}/toggle-active:
 *   patch:
 *     summary: Toggle user active status
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: User active status toggled
 *       404:
 *         description: User not found
 */
router.patch('/:id/toggle-active', validate(userIdParam), toggleUserActive);

/**
 * @swagger
 * /api/users/{id}/reset-password:
 *   patch:
 *     summary: Reset a user's password
 *     tags: [Users]
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
 *             required: [newPassword]
 *             properties:
 *               newPassword: { type: string, minLength: 6 }
 *     responses:
 *       200:
 *         description: Password reset successful
 *       404:
 *         description: User not found
 */
router.patch('/:id/reset-password', validate(userIdParam), validate(resetPasswordValidator), resetUserPassword);

module.exports = router;
