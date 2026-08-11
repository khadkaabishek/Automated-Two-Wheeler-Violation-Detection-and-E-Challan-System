import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env.js';
import ApiError from '../utils/ApiError.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.join(__dirname, '..', 'uploads');

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const VIDEO_TYPES = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];

const destinationMap = {
  avatar: 'avatars',
  vehicleImage: 'vehicles',
  evidenceImage: path.join('evidence', 'images'),
  evidenceVideo: path.join('evidence', 'videos'),
  paymentReceipt: path.join('evidence', 'receipts'),
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subDir = destinationMap[file.fieldname] || 'misc';
    cb(null, path.join(uploadsRoot, subDir));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'evidenceVideo') {
    if (!VIDEO_TYPES.includes(file.mimetype)) {
      return cb(ApiError.badRequest('Only mp4, mpeg, mov, or webm videos are allowed'));
    }
  } else if (file.fieldname === 'media') {
    if (!IMAGE_TYPES.includes(file.mimetype) && !VIDEO_TYPES.includes(file.mimetype)) {
      return cb(ApiError.badRequest('Only images or videos are allowed for this field'));
    }
  } else {
    if (!IMAGE_TYPES.includes(file.mimetype)) {
      return cb(ApiError.badRequest('Only jpeg, jpg, png, or webp images are allowed'));
    }
  }
  cb(null, true);
};

const maxSizeBytes = Math.max(env.upload.maxFileSizeMb, env.upload.maxVideoSizeMb) * 1024 * 1024;

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSizeBytes },
});

export const evidenceUpload = upload.fields([
  { name: 'evidenceImage', maxCount: 10 },
  { name: 'evidenceVideo', maxCount: 5 },
]);

// Single image receipt for payment proof (eSewa / Khalti / Bank / Stripe screenshot)
export const receiptUpload = upload.single('paymentReceipt');

export default upload;
