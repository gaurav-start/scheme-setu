import express from 'express';
import {
  login,
  sendOtp,
  verifyOtp,
  googleLogin,
  refresh,
  logout,
  getMe,
  updateMe,
  getAllUsers,
  updateUserRole,
} from '../controllers/authController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { rateLimit } from '../middlewares/rateLimiter.js';
import {
  authStrictLimiter,
  verifyLimiter,
  oauthLimiter,
  sessionLimiter,
  generalApiLimiter,
} from '../config/upstash.js';
import {
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
  googleLoginSchema,
  refreshSchema,
  updateMeSchema,
  updateUserRoleSchema,
} from '../validations/authValidation.js';

const router = express.Router();

// Passwordless Email + OTP authentication routes
router.post('/login', rateLimit(authStrictLimiter, 'login'), validate(loginSchema), login);
router.post('/send-otp', rateLimit(authStrictLimiter, 'send_otp'), upload.single('avatar'), validate(sendOtpSchema), sendOtp);
router.post('/verify-otp', rateLimit(verifyLimiter, 'verify_otp'), validate(verifyOtpSchema), verifyOtp);

// Direct Google OAuth login
router.post('/google', (req, res, next) => { console.log('[ROUTE HIT] POST /api/auth/google - body keys:', Object.keys(req.body)); next(); }, rateLimit(oauthLimiter, 'google'), validate(googleLoginSchema), googleLogin);

// Token session management
router.post('/refresh', rateLimit(sessionLimiter, 'refresh'), validate(refreshSchema), refresh);
router.post('/logout', rateLimit(sessionLimiter, 'logout'), logout);

// Protected user profile routes
router.get('/me', protect, rateLimit(generalApiLimiter, 'me'), getMe);
router.put('/update-me', protect, upload.single('avatar'), validate(updateMeSchema), rateLimit(generalApiLimiter, 'update_me'), updateMe);

// Admin-only user management routes
router.get('/users', protect, authorize('admin'), rateLimit(generalApiLimiter, 'users'), getAllUsers);
router.patch('/users/:id/role', protect, authorize('admin'), validate(updateUserRoleSchema), rateLimit(generalApiLimiter, 'user_role'), updateUserRole);

export default router;
