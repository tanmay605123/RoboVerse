import { z } from 'zod';

export enum UserRole {
  FREE_STUDENT = 'FREE_STUDENT',
  PLUS_STUDENT = 'PLUS_STUDENT',
  PRO_STUDENT = 'PRO_STUDENT',
  MENTOR_TEACHER = 'MENTOR_TEACHER',
  INSTITUTION_ADMIN = 'INSTITUTION_ADMIN',
  ADMIN = 'ADMIN',
  STORE_ADMIN = 'STORE_ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  SUSPENDED = 'SUSPENDED',
}

// Student interests options
export const STUDENT_INTEREST_OPTIONS = [
  'arduino',
  'raspberry_pi',
  'drones',
  'machine_learning',
  'iot',
  'mechanical_design',
  'circuit_design',
  'embedded_c',
  'ros_robotics',
] as const;

export type StudentInterest = (typeof STUDENT_INTEREST_OPTIONS)[number];

// Step-by-step registration schema
export const RegisterInputSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  mobileNumber: z
    .string()
    .regex(/^\+?[1-9]\d{9,14}$/, 'Enter a valid mobile number with country code (e.g. +919876543210)'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'DOB must be in YYYY-MM-DD format'),
  // Under-18 parental consent fields
  parentEmail: z.string().email('Valid parent/guardian email required').optional().or(z.literal('')),
  parentalConsentGiven: z.boolean().default(false),
  // Step 2: Academic details
  institutionType: z.enum(['school', 'college', 'university', 'self_learner']).default('school'),
  schoolOrCollegeName: z.string().min(2, 'Institution name is required').max(150),
  classOrYear: z.string().min(1, 'Class or Year is required').max(50),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(100),
  country: z.string().default('India'),
  // Step 3: Interests & Profile
  interests: z.array(z.string()).min(1, 'Select at least one area of interest'),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  // Step 4: Terms & Conditions
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Terms and Conditions and Privacy Policy' }),
  }),
  referralCode: z.string().optional().or(z.literal('')),
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;

// Login Schema (supports email or student ID)
export const LoginInputSchema = z.object({
  identifier: z.string().min(3, 'Email or Student ID is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof LoginInputSchema>;

// Mobile OTP Request & Verify
export const RequestOtpInputSchema = z.object({
  mobileNumber: z
    .string()
    .regex(/^\+?[1-9]\d{9,14}$/, 'Enter a valid mobile number with country code'),
  purpose: z.enum(['login', 'register', 'reset_password']).default('login'),
});

export type RequestOtpInput = z.infer<typeof RequestOtpInputSchema>;

export const VerifyOtpInputSchema = z.object({
  mobileNumber: z.string(),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  purpose: z.enum(['login', 'register', 'reset_password']).default('login'),
});

export type VerifyOtpInput = z.infer<typeof VerifyOtpInputSchema>;

// Google OAuth Input
export const GoogleAuthInputSchema = z.object({
  idToken: z.string().min(10, 'Google ID token required'),
  referralCode: z.string().optional(),
});

export type GoogleAuthInput = z.infer<typeof GoogleAuthInputSchema>;

// Biometric Challenge & Verification (Mobile app integration)
export const BiometricChallengeRequestSchema = z.object({
  studentIdOrEmail: z.string().min(3),
});

export type BiometricChallengeRequest = z.infer<typeof BiometricChallengeRequestSchema>;

export const BiometricVerifyInputSchema = z.object({
  studentIdOrEmail: z.string().min(3),
  challenge: z.string().min(16),
  signature: z.string().min(16),
  publicKey: z.string().min(16),
});

export type BiometricVerifyInput = z.infer<typeof BiometricVerifyInputSchema>;

// Token Refresh Schema
export const RefreshTokenInputSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenInput = z.infer<typeof RefreshTokenInputSchema>;

// Forgot / Reset Password Schemas
export const ForgotPasswordInputSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordInputSchema>;

export const ResetPasswordInputSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain digit'),
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordInputSchema>;

// Decoded JWT Payload
export interface AuthJwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  studentId: string;
  planId: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
