const fs = require('fs');
const path = require('path');
const { prisma } = require('../config/database');
const { apiResponse } = require('../utils/helpers');
const logger = require('../utils/logger');

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

function checkFileAccess(file, user, allowCustomer = true) {
  if (!file) {
    const error = new Error('File not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'CUSTOMER' && !allowCustomer) {
    const error = new Error('Forbidden: customers cannot download files');
    error.statusCode = 403;
    throw error;
  }

  if (user.role !== 'ADMIN' && file.uploadedBy !== user.userId) {
    const error = new Error('Forbidden: cannot access this file');
    error.statusCode = 403;
    throw error;
  }
}

/**
 * Upload a file and persist its metadata.
 */
async function uploadFile(req, res, next) {
  try {
    if (!req.file) {
      const error = new Error('No file uploaded');
      error.statusCode = 400;
      return next(error);
    }

    const { filename, originalname, mimetype, size, path: filePath } = req.file;

    const fileRecord = await prisma.file.create({
      data: {
        filename,
        originalName: originalname,
        mimetype,
        size,
        path: filePath,
        uploadedBy: req.user.userId,
      },
      select: {
        id: true,
        filename: true,
        originalName: true,
        mimetype: true,
        size: true,
        uploadedBy: true,
        createdAt: true,
      },
    });

    logger.info(`File uploaded: ${filename} by ${req.user.email}`);

    res.status(201).json(
      apiResponse({
        success: true,
        message: 'File uploaded successfully',
        data: {
          ...fileRecord,
          url: `/api/files/${fileRecord.id}/download`,
        },
      })
    );
  } catch (error) {
    next(error);
  }
}

/**
 * List uploaded files with pagination.
 */
async function getAllFiles(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit, 10) || 10), 100);

    const where = {};
    if (req.user.role !== 'ADMIN') {
      where.uploadedBy = req.user.userId;
    }

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          filename: true,
          originalName: true,
          mimetype: true,
          size: true,
          uploadedBy: true,
          createdAt: true,
        },
      }),
      prisma.file.count({ where }),
    ]);

    const data = files.map((file) => ({
      ...file,
      url: `/api/files/${file.id}/download`,
    }));

    const totalPages = Math.ceil(total / limit);

    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Files retrieved',
        data,
        meta: { page, limit, total, totalPages },
      })
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single file's metadata by ID.
 */
async function getFile(req, res, next) {
  try {
    const { id } = req.params;

    const file = await prisma.file.findUnique({
      where: { id },
      select: {
        id: true,
        filename: true,
        originalName: true,
        mimetype: true,
        size: true,
        path: true,
        uploadedBy: true,
        createdAt: true,
      },
    });

    if (!file) {
      const error = new Error('File not found');
      error.statusCode = 404;
      return next(error);
    }

    checkFileAccess(file, req.user);

    res.status(200).json(
      apiResponse({
        success: true,
        message: 'File retrieved',
        data: {
          ...file,
          url: `/api/files/${file.id}/download`,
        },
      })
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Download a file after checking ownership and role permissions.
 */
async function downloadFile(req, res, next) {
  try {
    const { id } = req.params;
    const file = await prisma.file.findUnique({
      where: { id },
      select: {
        id: true,
        filename: true,
        originalName: true,
        mimetype: true,
        path: true,
        uploadedBy: true,
      },
    });

    checkFileAccess(file, req.user, false);

    const uploadRoot = path.resolve(process.cwd(), UPLOAD_DIR);
    const absolutePath = path.isAbsolute(file.path)
      ? path.resolve(file.path)
      : path.resolve(process.cwd(), file.path);
    const relativePath = path.relative(uploadRoot, absolutePath);

    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
      const error = new Error('Forbidden: invalid file path');
      error.statusCode = 403;
      return next(error);
    }

    if (!fs.existsSync(absolutePath)) {
      const error = new Error('File not found on disk');
      error.statusCode = 404;
      return next(error);
    }

    logger.info(`File downloaded: ${file.filename} by ${req.user.email}`);
    res.download(absolutePath, file.originalName, {
      headers: { 'Content-Type': file.mimetype },
    }, (error) => {
      if (error) next(error);
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a file (admin only). Removes DB record and physical file.
 */
async function deleteFile(req, res, next) {
  try {
    const { id } = req.params;

    const file = await prisma.file.findUnique({
      where: { id },
      select: {
        id: true,
        filename: true,
        path: true,
      },
    });

    if (!file) {
      const error = new Error('File not found');
      error.statusCode = 404;
      return next(error);
    }

    await prisma.file.delete({ where: { id } });

    const absolutePath = path.isAbsolute(file.path)
      ? file.path
      : path.resolve(process.cwd(), file.path);

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      logger.info(`Deleted file from disk: ${absolutePath}`);
    }

    logger.info(`File deleted: ${file.filename} by ${req.user.email}`);

    res.status(200).json(
      apiResponse({
        success: true,
        message: 'File deleted successfully',
        data: { id: file.id, filename: file.filename },
      })
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadFile,
  getAllFiles,
  getFile,
  downloadFile,
  deleteFile,
};
