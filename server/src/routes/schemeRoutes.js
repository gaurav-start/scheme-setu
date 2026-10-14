import express from 'express';
import {
  createScheme,
  getAllSchemes,
  getSchemeBySlug,
  createRuleSetVersion,
  activateRuleSet,
} from '../controllers/schemeController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { rateLimit } from '../middlewares/rateLimiter.js';
import { generalApiLimiter } from '../config/upstash.js';
import { createSchemeSchema, createRuleSetSchema } from '../validations/schemeValidation.js';

const router = express.Router();

// Public routes
router.get('/', rateLimit(generalApiLimiter, 'get_schemes'), getAllSchemes);
router.get('/:slug', rateLimit(generalApiLimiter, 'get_scheme_slug'), getSchemeBySlug);

// Admin-only scheme management
router.post(
  '/',
  protect,
  authorize('admin'),
  rateLimit(generalApiLimiter, 'create_scheme'),
  validate(createSchemeSchema),
  createScheme
);

router.post(
  '/:slug/rulesets',
  protect,
  authorize('admin'),
  rateLimit(generalApiLimiter, 'create_ruleset'),
  validate(createRuleSetSchema),
  createRuleSetVersion
);

router.patch(
  '/:slug/rulesets/:version/activate',
  protect,
  authorize('admin'),
  rateLimit(generalApiLimiter, 'activate_ruleset'),
  activateRuleSet
);

export default router;
