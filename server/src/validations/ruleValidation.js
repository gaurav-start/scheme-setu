import { z } from 'zod';
import { isFieldAllowed } from '../services/eligibility/fieldWhitelist.js';
import { SUPPORTED_OPERATORS } from '../services/eligibility/operators.js';

// Base Condition Schema
export const conditionNodeSchema = z.object({
  type: z.literal('condition'),
  field: z
    .string({ required_error: 'Condition field is required' })
    .refine((f) => isFieldAllowed(f), {
      message: 'Field is invalid or not in permitted whitelist',
    }),
  operator: z.enum(SUPPORTED_OPERATORS, {
    errorMap: () => ({ message: 'Unsupported comparison operator' }),
  }),
  value: z.any({ required_error: 'Condition expected value is required' }),
});

// Recursive Group Node Schema using lazy
export const ruleNodeSchema = z.lazy(() =>
  z.union([
    conditionNodeSchema,
    z
      .object({
        type: z.literal('group'),
        operator: z.enum(['AND', 'OR', 'NOT'], {
          errorMap: () => ({ message: 'Group operator must be AND, OR, or NOT' }),
        }),
        conditions: z
          .array(ruleNodeSchema)
          .min(1, 'Group must contain at least one condition child'),
      })
      .superRefine((val, ctx) => {
        if (val.operator === 'NOT' && val.conditions.length !== 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'NOT group must contain exactly one child condition',
          });
        }
      }),
  ])
);
