import express from 'express';
import {
  checkSchemeEligibility,
  getEligibilityHistory,
} from '../controllers/eligibilityController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { rateLimit } from '../middlewares/rateLimiter.js';
import { generalApiLimiter } from '../config/upstash.js';
import { checkEligibilitySchema } from '../validations/eligibilityValidation.js';

const router = express.Router();

// Evaluate scheme eligibility (requires authenticated citizen profile)
router.post(
  '/check/:schemeSlug',
  protect,
  rateLimit(generalApiLimiter, 'check_eligibility'),
  validate(checkEligibilitySchema),
  checkSchemeEligibility
);

// View user's historical eligibility check evaluations
router.get(
  '/history',
  protect,
  rateLimit(generalApiLimiter, 'eligibility_history'),
  getEligibilityHistory
);

export default router;
