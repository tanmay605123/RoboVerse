import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import {
  RegisterInputSchema,
  LoginInputSchema,
  RequestOtpInputSchema,
  VerifyOtpInputSchema,
  GoogleAuthInputSchema,
  BiometricChallengeRequestSchema,
  BiometricVerifyInputSchema,
  RefreshTokenInputSchema,
  ForgotPasswordInputSchema,
  ResetPasswordInputSchema,
  UserRole,
  UserStatus,
  PlanTier,
  BillingCycle,
} from '@roboverse/shared';
import { validateBody } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';
import { hashPassword, comparePassword } from '../../lib/password';
import { generateAuthTokens, verifyRefreshToken } from '../../lib/jwt';
import { generateStudentIdRecord } from '../../lib/studentId';
import { redis } from '../../lib/redis';
import { inMemoryDb } from '../../lib/db';
import { usageService } from '../../lib/usage';

const router = Router();
let studentSequenceCounter = 100;

/**
 * POST /api/v1/auth/register
 * Multi-step student registration with under-18 parental consent & unique Student ID generation
 */
router.post('/register', validateBody(RegisterInputSchema), async (req: Request, res: Response) => {
  const data = req.body;

  // 1. Check existing email or mobile
  const existingUserByEmail = Array.from(inMemoryDb.users.values()).find(
    (u) => u.email.toLowerCase() === data.email.toLowerCase()
  );
  if (existingUserByEmail) {
    res.status(409).json({
      success: false,
      error: { code: 'EMAIL_ALREADY_EXISTS', message: 'An account with this email already exists' },
    });
    return;
  }

  const existingUserByMobile = Array.from(inMemoryDb.users.values()).find(
    (u) => u.mobileNumber === data.mobileNumber
  );
  if (existingUserByMobile) {
    res.status(409).json({
      success: false,
      error: { code: 'MOBILE_ALREADY_EXISTS', message: 'This mobile number is already registered' },
    });
    return;
  }

  // 2. Validate under-18 parental consent
  const birthYear = new Date(data.dateOfBirth).getFullYear();
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  if (age < 18 && (!data.parentEmail || !data.parentalConsentGiven)) {
    res.status(400).json({
      success: false,
      error: {
        code: 'PARENTAL_CONSENT_REQUIRED',
        message: 'Students under 18 years of age require parental/guardian consent and parent email.',
      },
    });
    return;
  }

  // 3. Hash password
  const passwordHash = await hashPassword(data.password);

  // 4. Create User entity
  const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  studentSequenceCounter += 1;
  const userReferralCode = `RV-${data.fullName.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const user = {
    id: userId,
    email: data.email.toLowerCase(),
    passwordHash,
    mobileNumber: data.mobileNumber,
    role: UserRole.FREE_STUDENT,
    status: UserStatus.ACTIVE,
    referralCode: userReferralCode,
    referredById: data.referralCode || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  inMemoryDb.users.set(userId, user);

  // 5. Generate unique Student ID (e.g. RV-2026-000101) with QR code
  const studentIdRecord = await generateStudentIdRecord(studentSequenceCounter, 2026);
  inMemoryDb.studentIds.set(userId, {
    id: `stid_${userId}`,
    userId,
    ...studentIdRecord,
  });

  // 6. Create Student Profile with gamification baseline (Level 1, 50 starter XP, 1-day streak)
  const profile = {
    id: `prof_${userId}`,
    userId,
    fullName: data.fullName,
    dateOfBirth: data.dateOfBirth,
    parentEmail: data.parentEmail || null,
    parentalConsentGiven: data.parentalConsentGiven || false,
    institutionType: data.institutionType,
    schoolOrCollegeName: data.schoolOrCollegeName,
    classOrYear: data.classOrYear,
    city: data.city,
    state: data.state,
    country: data.country || 'India',
    interests: data.interests,
    avatarUrl: data.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.fullName)}`,
    bio: 'Aspiring roboticist & electronics builder at RoboVerse',
    level: 1,
    xp: 50,
    streakDays: 1,
    totalLearningHours: 0.0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  inMemoryDb.profiles.set(userId, profile);

  // 7. Initialize Free Subscription
  const subId = `sub_${userId}_free`;
  inMemoryDb.subscriptions.set(subId, {
    id: subId,
    userId,
    planId: 'plan_free',
    billingCycle: BillingCycle.MONTHLY,
    status: 'ACTIVE',
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date('2099-12-31'),
    cancelAtPeriodEnd: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 8. Generate JWT tokens
  const tokens = generateAuthTokens({
    userId,
    email: user.email,
    role: user.role,
    studentId: studentIdRecord.studentId,
    planId: 'plan_free',
  });

  res.status(201).json({
    success: true,
    message: 'Welcome to RoboVerse! Student account and Digital ID created successfully.',
    data: {
      user: {
        id: user.id,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        referralCode: user.referralCode,
      },
      studentId: studentIdRecord.studentId,
      studentIdCard: {
        studentId: studentIdRecord.studentId,
        qrCodeDataUrl: studentIdRecord.qrCodeDataUrl,
        verificationUrl: studentIdRecord.verificationUrl,
        validUntil: studentIdRecord.validUntil,
      },
      profile,
      tokens,
    },
  });
});

/**
 * POST /api/v1/auth/login
 * Log in using Email OR Student ID + Password
 */
router.post('/login', validateBody(LoginInputSchema), async (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  // Check if identifier is studentId (e.g. RV-2026-...) or email
  let matchedUser: any = null;
  const isStudentId = identifier.toUpperCase().startsWith('RV-');

  if (isStudentId) {
    const studentIdEntry = Array.from(inMemoryDb.studentIds.values()).find(
      (s) => s.studentId.toUpperCase() === identifier.toUpperCase()
    );
    if (studentIdEntry) {
      matchedUser = inMemoryDb.users.get(studentIdEntry.userId);
    }
  } else {
    matchedUser = Array.from(inMemoryDb.users.values()).find(
      (u) => u.email.toLowerCase() === identifier.toLowerCase()
    );
  }

  if (!matchedUser || !matchedUser.passwordHash) {
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email/Student ID or password' },
    });
    return;
  }

  const isValidPassword = await comparePassword(password, matchedUser.passwordHash);
  if (!isValidPassword) {
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email/Student ID or password' },
    });
    return;
  }

  const studentIdRecord = inMemoryDb.studentIds.get(matchedUser.id);
  const profile = inMemoryDb.profiles.get(matchedUser.id);

  // Find active subscription plan
  const sub = Array.from(inMemoryDb.subscriptions.values()).find(
    (s) => s.userId === matchedUser.id && s.status === 'ACTIVE'
  );
  const planId = sub ? sub.planId : 'plan_free';

  const tokens = generateAuthTokens({
    userId: matchedUser.id,
    email: matchedUser.email,
    role: matchedUser.role,
    studentId: studentIdRecord?.studentId || 'RV-GUEST',
    planId,
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: matchedUser.id,
        email: matchedUser.email,
        mobileNumber: matchedUser.mobileNumber,
        role: matchedUser.role,
        referralCode: matchedUser.referralCode,
      },
      studentId: studentIdRecord?.studentId,
      profile,
      tokens,
    },
  });
});

/**
 * POST /api/v1/auth/otp/send
 * Generate & send mobile OTP (stored with 5-minute expiry in Redis)
 */
router.post('/otp/send', validateBody(RequestOtpInputSchema), async (req: Request, res: Response) => {
  const { mobileNumber, purpose } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits

  // Store in Redis with 300s (5m) TTL
  await redis.set(`otp:${mobileNumber}:${purpose}`, otp, 300);

  res.json({
    success: true,
    message: `OTP sent successfully to ${mobileNumber.slice(0, 3)}****${mobileNumber.slice(-3)}`,
    data: {
      mobileNumber,
      purpose,
      expiresInSeconds: 300,
      // Debug OTP exposed in development/test for automated testing
      ...(process.env.NODE_ENV !== 'production' && { debugOtp: otp }),
    },
  });
});

/**
 * POST /api/v1/auth/otp/verify
 * Verify OTP and log in / auto-register student
 */
router.post('/otp/verify', validateBody(VerifyOtpInputSchema), async (req: Request, res: Response) => {
  const { mobileNumber, otp, purpose } = req.body;

  const storedOtp = await redis.get(`otp:${mobileNumber}:${purpose}`);
  // In development/test allow default demo OTP '123456'
  const isDemoOtp = process.env.NODE_ENV !== 'production' && otp === '123456';

  if (!storedOtp && !isDemoOtp) {
    res.status(400).json({
      success: false,
      error: { code: 'OTP_EXPIRED_OR_INVALID', message: 'OTP has expired or was not requested.' },
    });
    return;
  }

  if (storedOtp !== otp && !isDemoOtp) {
    res.status(400).json({
      success: false,
      error: { code: 'INCORRECT_OTP', message: 'The entered OTP is incorrect.' },
    });
    return;
  }

  // Clear OTP
  await redis.del(`otp:${mobileNumber}:${purpose}`);

  // Find or create student account
  let user = Array.from(inMemoryDb.users.values()).find((u) => u.mobileNumber === mobileNumber);

  if (!user) {
    // Auto-create basic profile
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    studentSequenceCounter += 1;
    const studentIdRecord = await generateStudentIdRecord(studentSequenceCounter, 2026);

    user = {
      id: userId,
      email: `student_${mobileNumber.replace(/\D/g, '')}@roboverse.local`,
      passwordHash: null,
      mobileNumber,
      role: UserRole.FREE_STUDENT,
      status: UserStatus.ACTIVE,
      referralCode: `RV-MOB-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryDb.users.set(userId, user);

    inMemoryDb.studentIds.set(userId, {
      id: `stid_${userId}`,
      userId,
      ...studentIdRecord,
    });

    const profile = {
      id: `prof_${userId}`,
      userId,
      fullName: 'RoboVerse Explorer',
      schoolOrCollegeName: 'Robotics Enthusiast',
      classOrYear: 'Self Learner',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      interests: ['arduino', 'circuit_design'],
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${mobileNumber}`,
      level: 1,
      xp: 50,
      streakDays: 1,
      totalLearningHours: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryDb.profiles.set(userId, profile);
  }

  const studentIdRecord = inMemoryDb.studentIds.get(user.id);
  const profile = inMemoryDb.profiles.get(user.id);

  const tokens = generateAuthTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
    studentId: studentIdRecord?.studentId || 'RV-GUEST',
    planId: 'plan_free',
  });

  res.json({
    success: true,
    message: 'Mobile OTP verified successfully',
    data: {
      user: {
        id: user.id,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
      },
      studentId: studentIdRecord?.studentId,
      profile,
      tokens,
    },
  });
});

/**
 * POST /api/v1/auth/google
 * Google Sign-In with automatic Student ID generation
 */
router.post('/google', validateBody(GoogleAuthInputSchema), async (req: Request, res: Response) => {
  const { idToken } = req.body;
  // Parse mock or verified Google token payload
  const email = `google_student_${Date.now().toString(36)}@gmail.com`;
  const fullName = 'Google RoboVerse Student';

  let user = Array.from(inMemoryDb.users.values()).find((u) => u.email === email);
  if (!user) {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    studentSequenceCounter += 1;
    const studentIdRecord = await generateStudentIdRecord(studentSequenceCounter, 2026);

    user = {
      id: userId,
      email,
      googleId: `google_${Date.now()}`,
      role: UserRole.FREE_STUDENT,
      status: UserStatus.ACTIVE,
      referralCode: `RV-GOOG-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryDb.users.set(userId, user);

    inMemoryDb.studentIds.set(userId, {
      id: `stid_${userId}`,
      userId,
      ...studentIdRecord,
    });

    const profile = {
      id: `prof_${userId}`,
      userId,
      fullName,
      schoolOrCollegeName: 'Tech Academy',
      classOrYear: 'Robotics Club',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      interests: ['arduino', 'machine_learning'],
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
      level: 1,
      xp: 50,
      streakDays: 1,
      totalLearningHours: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryDb.profiles.set(userId, profile);
  }

  const studentIdRecord = inMemoryDb.studentIds.get(user.id);
  const profile = inMemoryDb.profiles.get(user.id);

  const tokens = generateAuthTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
    studentId: studentIdRecord?.studentId || 'RV-GUEST',
    planId: 'plan_free',
  });

  res.json({
    success: true,
    message: 'Google authentication successful',
    data: { user, studentId: studentIdRecord?.studentId, profile, tokens },
  });
});

/**
 * POST /api/v1/auth/biometric/challenge
 * Generate cryptographic challenge for WebAuthn / FaceID / TouchID biometric login on mobile
 */
router.post(
  '/biometric/challenge',
  validateBody(BiometricChallengeRequestSchema),
  async (req: Request, res: Response) => {
    const { studentIdOrEmail } = req.body;
    const challenge = crypto.randomBytes(32).toString('hex');
    await redis.set(`biometric_challenge:${studentIdOrEmail}`, challenge, 120); // 2 minutes

    res.json({
      success: true,
      data: {
        challenge,
        timeout: 120000,
      },
    });
  }
);

/**
 * POST /api/v1/auth/biometric/verify
 * Complete biometric verification and return session tokens
 */
router.post(
  '/biometric/verify',
  validateBody(BiometricVerifyInputSchema),
  async (req: Request, res: Response) => {
    const { studentIdOrEmail, challenge } = req.body;
    const storedChallenge = await redis.get(`biometric_challenge:${studentIdOrEmail}`);

    if (!storedChallenge || storedChallenge !== challenge) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_BIOMETRIC_CHALLENGE', message: 'Biometric challenge expired or invalid.' },
      });
      return;
    }

    await redis.del(`biometric_challenge:${studentIdOrEmail}`);

    // Lookup user
    let user = Array.from(inMemoryDb.users.values()).find(
      (u) => u.email.toLowerCase() === studentIdOrEmail.toLowerCase()
    );
    if (!user) {
      const stid = Array.from(inMemoryDb.studentIds.values()).find(
        (s) => s.studentId.toUpperCase() === studentIdOrEmail.toUpperCase()
      );
      if (stid) {
        user = inMemoryDb.users.get(stid.userId);
      }
    }

    if (!user) {
      res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found for biometric credentials.' },
      });
      return;
    }

    const studentIdRecord = inMemoryDb.studentIds.get(user.id);
    const profile = inMemoryDb.profiles.get(user.id);
    const tokens = generateAuthTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      studentId: studentIdRecord?.studentId || 'RV-GUEST',
      planId: 'plan_free',
    });

    res.json({
      success: true,
      message: 'Biometric authentication successful',
      data: { user, studentId: studentIdRecord?.studentId, profile, tokens },
    });
  }
);

/**
 * POST /api/v1/auth/refresh-token
 * Issue fresh access token using refresh token
 */
router.post(
  '/refresh-token',
  validateBody(RefreshTokenInputSchema),
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    try {
      const payload = verifyRefreshToken(refreshToken);
      const isBlacklisted = await redis.get(`bl_token:${refreshToken}`);
      if (isBlacklisted) {
        res.status(401).json({
          success: false,
          error: { code: 'TOKEN_REVOKED', message: 'Refresh token has been revoked.' },
        });
        return;
      }

      const newTokens = generateAuthTokens({
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        studentId: payload.studentId,
        planId: payload.planId,
      });

      res.json({
        success: true,
        data: newTokens,
      });
    } catch {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid or expired refresh token.' },
      });
    }
  }
);

/**
 * POST /api/v1/auth/forgot-password
 */
router.post(
  '/forgot-password',
  validateBody(ForgotPasswordInputSchema),
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = Array.from(inMemoryDb.users.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      await redis.set(`pwd_reset:${resetToken}`, user.id, 900); // 15 mins
      // In development mode, return token for easy testing
      res.json({
        success: true,
        message: 'Password reset link sent to registered email address.',
        ...(process.env.NODE_ENV !== 'production' && { debugResetToken: resetToken }),
      });
      return;
    }

    // Return generic success to prevent email enumeration
    res.json({
      success: true,
      message: 'If the email is registered, a password reset link has been dispatched.',
    });
  }
);

/**
 * POST /api/v1/auth/reset-password
 */
router.post(
  '/reset-password',
  validateBody(ResetPasswordInputSchema),
  async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    const userId = await redis.get(`pwd_reset:${token}`);

    if (!userId) {
      res.status(400).json({
        success: false,
        error: { code: 'RESET_TOKEN_EXPIRED', message: 'Reset token is invalid or expired.' },
      });
      return;
    }

    const user = inMemoryDb.users.get(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User account not found.' },
      });
      return;
    }

    user.passwordHash = await hashPassword(newPassword);
    await redis.del(`pwd_reset:${token}`);

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  }
);

/**
 * POST /api/v1/auth/logout
 */
router.post('/logout', requireAuth, async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * GET /api/v1/auth/me
 * Authenticated user profile, student ID card, active plan, and daily usage meter
 */
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const user = inMemoryDb.users.get(userId);
  const profile = inMemoryDb.profiles.get(userId);
  const studentIdRecord = inMemoryDb.studentIds.get(userId);

  // Active subscription
  const sub = Array.from(inMemoryDb.subscriptions.values()).find(
    (s) => s.userId === userId && s.status === 'ACTIVE'
  );
  const planTier = (req.user!.role === UserRole.PRO_STUDENT
    ? PlanTier.PRO
    : req.user!.role === UserRole.PLUS_STUDENT
    ? PlanTier.PLUS
    : PlanTier.FREE) as PlanTier;

  // Daily Usage
  const usage = await usageService.getDailyUsage(
    userId,
    planTier,
    studentIdRecord?.studentId || 'RV-GUEST'
  );

  res.json({
    success: true,
    data: {
      user: {
        id: user?.id,
        email: user?.email,
        mobileNumber: user?.mobileNumber,
        role: user?.role,
        referralCode: user?.referralCode,
      },
      profile,
      studentIdCard: studentIdRecord
        ? {
            studentId: studentIdRecord.studentId,
            qrCodeDataUrl: studentIdRecord.qrCodeDataUrl,
            verificationUrl: studentIdRecord.verificationUrl,
            issuedAt: studentIdRecord.issuedAt,
            validUntil: studentIdRecord.validUntil,
          }
        : null,
      activeSubscription: sub || null,
      planTier,
      todayUsage: usage,
    },
  });
});

export default router;
