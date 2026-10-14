import { z } from 'zod';

export const checkEligibilitySchema = z.object({
  body: z.object({
    facts: z.record(z.any()).optional(),
    // Allow payload either directly in body or under body.facts
    Personal: z.record(z.any()).optional(),
    Economic: z.record(z.any()).optional(),
    Location: z.record(z.any()).optional(),
    Household: z.record(z.any()).optional(),
    SpecialConditions: z.record(z.any()).optional(),
  }).passthrough(),
});
