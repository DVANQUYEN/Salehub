const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const { deleteActivity } = require('../controllers/activityController');
const { activityIdParam } = require('../validators/activityValidator');
const validate = require('../middlewares/validate');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Activities
 *   description: Deal activity management
 */

/**
 * @swagger
 * /api/activities/{id}:
 *   delete:
 *     summary: Delete an activity (admin or deal owner)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Activity deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Activity not found
 */
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'SALES'),
  validate(activityIdParam),
  deleteActivity
);

module.exports = router;
