import { z } from 'zod';

export const extractedProfileSchema = z.object({
  name: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  age: z.number().int().min(0).max(120).optional(),
  gender: z.string().trim().optional(),
  category: z.string().trim().optional(),
  maritalStatus: z.string().trim().optional(),
  disabilityStatus: z.string().trim().optional(),

  annualIncome: z.number().min(0).optional(),
  occupation: z.string().trim().optional(),
  employmentStatus: z.string().trim().optional(),
  landHolding: z.number().min(0).optional(),
  economicCategory: z.string().trim().optional(),

  state: z.string().trim().optional(),
  district: z.string().trim().optional(),
  block: z.string().trim().optional(),
  ruralUrban: z.string().trim().optional(),
  residenceYears: z.number().min(0).optional(),

  familySize: z.number().int().min(0).optional(),
  familyIncome: z.number().min(0).optional(),
  hasBPLCard: z.boolean().optional(),
  rationCardType: z.string().trim().optional(),
  ownsHouse: z.boolean().optional(),
  householdType: z.string().trim().optional(),

  isStudent: z.boolean().optional(),
  isFarmer: z.boolean().optional(),
  isWidow: z.boolean().optional(),
  isSeniorCitizen: z.boolean().optional(),
  isOrphan: z.boolean().optional(),
  isExServiceman: z.boolean().optional(),
  otherSchemeSpecificFacts: z.array(z.string()).optional(),

  educationLevel: z.string().trim().optional(),
  bankAccount: z.boolean().optional(),
}).passthrough(); // Reject system/forbidden fields

export const aiFillInputSchema = z.object({
  body: z.object({
    text: z
      .string({ required_error: 'Natural language text is required' })
      .trim()
      .min(3, 'Text must be at least 3 characters long')
      .max(2000, 'Text cannot exceed 2000 characters'),
  }),
});

export const updateProfileSchema = z.object({
  body: extractedProfileSchema.partial(),
});

export const deleteAccountSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email confirmation is required' })
      .email('Invalid email address')
      .trim(),
  }),
});

