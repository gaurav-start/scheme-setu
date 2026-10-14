import { z } from 'zod';

const roleEnum = z.preprocess(
  (val) => (val === 'user' ? 'citizen' : val),
  z.enum(['citizen', 'csc_operator', 'ngo_worker', 'admin', 'user'])
);

// Login Schema (accepts email in req.body)
export const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address format'),
  }),
});

// Send OTP Schema
export const sendOtpSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address format'),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    role: roleEnum.optional(),
    phone: z.string().optional(),
    cscCenterId: z.string().optional(),
    ngoOrg: z.string().optional(),
    assignedDistricts: z.union([z.array(z.string()), z.string()]).optional(),
    policyInsightOptIn: z.union([z.boolean(), z.string()]).optional(),
  }),
});

// Verify OTP Schema
export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address format'),
    otp: z.string({ required_error: '6-digit OTP is required' }).length(6, 'OTP must be exactly 6 digits'),
  }),
});

// Google Login Schema
export const googleLoginSchema = z.object({
  body: z.object({
    credential: z.string({ required_error: 'Google credential ID token is required' }).min(1, 'Credential cannot be empty'),
  }),
});

// Refresh Token Schema
export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
  }).optional(),
});

// Update Profile (updateMe) Schema
export const updateMeSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    phone: z.string().optional(),
    policyInsightOptIn: z.union([z.boolean(), z.string()]).optional(),
    cscCenterId: z.string().optional(),
    ngoOrg: z.string().optional(),
    assignedDistricts: z.union([z.array(z.string()), z.string()]).optional(),
  }),
});

// Admin Update User Role Schema
export const updateUserRoleSchema = z.object({
  body: z.object({
    role: roleEnum.optional(),
    cscCenterId: z.string().optional(),
    ngoOrg: z.string().optional(),
    assignedDistricts: z.union([z.array(z.string()), z.string()]).optional(),
  }),
});
