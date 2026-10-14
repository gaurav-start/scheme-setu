import { z } from 'zod';
import { ruleNodeSchema } from './ruleValidation.js';

export const createSchemeSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Scheme name is required' }).min(2, 'Name must be at least 2 characters'),
    slug: z.string().optional(),
    description: z.string({ required_error: 'Description is required' }).min(5, 'Description must be at least 5 characters'),
    ministry: z.string().optional(),
    state: z.string().optional(),
    category: z.string().optional(),
    sourceUrl: z.string().optional(),
    sourceDocument: z.string().optional(),
    status: z.enum(['active', 'inactive', 'draft']).optional(),
    initialRuleSet: z.object({
      rootRule: ruleNodeSchema,
      source: z.object({
        type: z.string().optional(),
        documentUrl: z.string().optional(),
        pageReference: z.string().optional(),
      }).optional(),
    }).optional(),
  }),
});

export const updateSchemeSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().min(5).optional(),
    ministry: z.string().optional(),
    state: z.string().optional(),
    category: z.string().optional(),
    sourceUrl: z.string().optional(),
    sourceDocument: z.string().optional(),
    status: z.enum(['active', 'inactive', 'draft']).optional(),
  }),
});

export const createRuleSetSchema = z.object({
  body: z.object({
    rootRule: ruleNodeSchema,
    source: z.object({
      type: z.string().optional(),
      documentUrl: z.string().optional(),
      pageReference: z.string().optional(),
    }).optional(),
    effectiveFrom: z.string().or(z.date()).optional(),
    effectiveTo: z.string().or(z.date()).optional(),
    status: z.enum(['draft', 'active', 'archived']).optional(),
  }),
});
