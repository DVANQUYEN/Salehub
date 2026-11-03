const express = require('express');
const { param } = require('express-validator');
const { authenticate, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const validate = require('../middlewares/validate');
const {
  uploadFile,
  getAllFiles,
  getFile,
  downloadFile,
  deleteFile,
} = require('../controllers/fileController');

const router = express.Router();

const fileIdParam = [
  param('id').isUUID().withMessage('Invalid file ID'),
];

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: File upload and management
 */

/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (PDF, DOC, DOCX, JPG, JPEG, PNG, XLS, XLSX). Max 10MB.
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: Invalid file or no file provided
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/upload',
  authenticate,
  upload.single('file'),
  uploadFile
);

/**
 * @swagger
 * /api/files:
 *   get:
 *     summary: List uploaded files
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Files retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, getAllFiles);

/**
 * @swagger
 * /api/files/{id}/download:
 *   get:
 *     summary: Download a file (admin or owner; customers forbidden)
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: File downloaded
 *       403:
 *         description: Forbidden
 *       404:
 *         description: File not found
 */
router.get('/:id/download', authenticate, validate(fileIdParam), downloadFile);

/**
 * @swagger
 * /api/files/{id}:
 *   get:
 *     summary: Get file metadata by ID
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: File retrieved
 *       403:
 *         description: Forbidden
 *       404:
 *         description: File not found
 */
router.get('/:id', authenticate, validate(fileIdParam), getFile);

/**
 * @swagger
 * /api/files/{id}:
 *   delete:
 *     summary: Delete a file (admin only)
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: File deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: File not found
 */
router.delete('/:id', authenticate, authorize('ADMIN'), validate(fileIdParam), deleteFile);

module.exports = router;
