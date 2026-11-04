import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

// 5 MB maximum file size
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Invalid file type '${file.mimetype}'. Allowed formats: JPEG, PNG, WEBP, and GIF.`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});

/**
 * Middleware factory for single-file uploads with error translation
 * @param {string} fieldName
 */
export const uploadSingleImage = (fieldName = 'image') => {
  const single = upload.single(fieldName);

  return (req, res, next) => {
    single(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            new ApiError(400, 'Image file size exceeds the maximum limit of 5MB.')
          );
        }
        return next(new ApiError(400, `Upload error: ${err.message}`));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
};

export default uploadSingleImage;

