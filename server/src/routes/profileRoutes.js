import express from 'express';
import { aiFillProfile, updateProfile, uploadAvatar, deleteAccount } from '../controllers/profileController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { rateLimit } from '../middlewares/rateLimiter.js';
import { generalApiLimiter } from '../config/upstash.js';
import { aiFillInputSchema, updateProfileSchema, deleteAccountSchema } from '../validations/profileValidation.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// AI Natural Language Profile Extraction (Preview only - does not alter DB)
router.post(
  '/ai-fill',
  protect,
  rateLimit(generalApiLimiter, 'ai_fill_profile'),
  validate(aiFillInputSchema),
  aiFillProfile
);

// User Profile Confirmation & Update
router.patch(
  '/',
  protect,
  rateLimit(generalApiLimiter, 'update_profile'),
  validate(updateProfileSchema),
  updateProfile
);

// Profile Avatar Image Upload to Cloudinary
router.post(
  '/avatar',
  protect,
  rateLimit(generalApiLimiter, 'upload_avatar'),
  upload.single('avatar'),
  uploadAvatar
);

// Permanent Account Deletion
router.delete(
  '/',
  protect,
  rateLimit(generalApiLimiter, 'delete_account'),
  validate(deleteAccountSchema),
  deleteAccount
);

export default router;
