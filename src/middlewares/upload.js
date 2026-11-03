const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const logger = require('../utils/logger');

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024;

/**
 * Ensure the upload directory exists.
 */
function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    logger.info(`Created upload directory: ${UPLOAD_DIR}`);
  }
}

ensureUploadDir();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitizedOriginalName}`);
  },
});

const ALLOWED_MIMETYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.xls', '.xlsx'];

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const isMimetypeAllowed = ALLOWED_MIMETYPES.includes(file.mimetype);
  const isExtensionAllowed = ALLOWED_EXTENSIONS.includes(ext);

  if (isMimetypeAllowed && isExtensionAllowed) {
    return cb(null, true);
  }

  logger.warn(`Rejected upload: ${file.originalname} (${file.mimetype})`);
  cb(new Error(`File type not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`), false);
}

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});

module.exports = upload;
module.exports.MAX_FILE_SIZE = MAX_FILE_SIZE;
module.exports.ALLOWED_EXTENSIONS = ALLOWED_EXTENSIONS;
