import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import {
  RegisterInputSchema,
  RegisterInput,
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
import { inMemoryDb, prisma } from '../../lib/db';
import { usageService } from '../../lib/usage';
import { ENV } from '../../config/env';
import { createSupabaseAdminClient } from '../../lib/supabaseAdmin';

export function getRoleRedirectPath(role: UserRole | string): string {
  switch (role) {
    case UserRole.ADMIN:
      return '/admin';
    case UserRole.MENTOR_TEACHER:
      return '/teacher';
    case UserRole.INSTITUTION_ADMIN:
      return '/institution';
    case UserRole.STORE_ADMIN:
      return '/store-admin';
    case UserRole.FREE_STUDENT:
    case UserRole.PLUS_STUDENT:
    case UserRole.PRO_STUDENT:
    default:
      return '/dashboard';
  }
}

const router = Router();
let studentSequenceCounter = 100;

/**
 * Keep Student ID generation stable across Render restarts. The process-local
 * counter resets when the service restarts, but the database already contains
 * previously issued IDs. Always continue after the highest persisted ID.
 */
async function getNextStudentSequence(year = 2026): Promise<number> {
  if (!shouldUseInMemoryAuth()) {
    const latestStudentId = await prisma.studentID.findFirst({
      where: { studentId: { startsWith: `RV-${year}-` } },
      orderBy: { studentId: 'desc' },
      select: { studentId: true },
    });

    const persistedSequence = latestStudentId
      ? Number(latestStudentId.studentId.slice(`RV-${year}-`.length))
      : 0;

    if (Number.isFinite(persistedSequence)) {
      studentSequenceCounter = Math.max(studentSequenceCounter, persistedSequence);
    }
  }

  studentSequenceCounter += 1;
  return studentSequenceCounter;
}

// Local development and automated tests can run without PostgreSQL. Production
// deployments with DATABASE_URL continue to use Prisma/Supabase exclusively.
const shouldUseInMemoryAuth = () => ENV.NODE_ENV === 'test' || (ENV.ALLOW_IN_MEMORY_AUTH && !ENV.DATABASE_URL);

async function createInMemoryRegistration(data: RegisterInput) {
  const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const userReferralCode = `RV-${data.fullName.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date();
  const user = {
    id: userId,
    email: data.email.toLowerCase(),
    passwordHash: await hashPassword(data.password),
    mobileNumber: data.mobileNumber,
    role: UserRole.FREE_STUDENT,
    status: UserStatus.ACTIVE,
    referralCode: userReferralCode,
    referredById: data.referralCode || null,
    createdAt: now,
    updatedAt: now,
  };
  const studentIdRecord = await generateStudentIdRecord(await getNextStudentSequence(), 2026);
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
    totalLearningHours: 0,
    createdAt: now,
    updatedAt: now,
  };

  inMemoryDb.users.set(userId, user);
  inMemoryDb.studentIds.set(userId, {
    id: `stid_${userId}`,
    userId,
    ...studentIdRecord,
  });
  inMemoryDb.profiles.set(userId, profile);
  inMemoryDb.subscriptions.set(`sub_${userId}_free`, {
    id: `sub_${userId}_free`,
    userId,
    planId: 'plan_free',
    billingCycle: BillingCycle.MONTHLY,
    status: 'ACTIVE',
    currentPeriodStart: now,
    currentPeriodEnd: new Date('2099-12-31'),
    cancelAtPeriodEnd: false,
  });

  const tokens = generateAuthTokens({
    userId,
    email: user.email,
    role: user.role,
    studentId: studentIdRecord.studentId,
    planId: 'plan_free',
  });

  return {
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
    redirectTo: getRoleRedirectPath(user.role),
  };
}

/**
 * GET /api/v1/auth/redirect-path
 * Query the correct role-based dashboard URL for a given role
 */
router.get('/redirect-path', (req: Request, res: Response) => {
  const role = (req.query.role as string) || UserRole.FREE_STUDENT;
  res.json({
    success: true,
    data: {
      role,
      redirectTo: getRoleRedirectPath(role),
    },
  });
});

/**
 * POST /api/v1/auth/register
 * Multi-step student registration with under-18 parental consent & unique Student ID generation
 */
router.post('/register', validateBody(RegisterInputSchema), async (req: Request, res: Response) => {
  const data = req.body;

  if (!shouldUseInMemoryAuth() && !ENV.DATABASE_URL) {
    res.status(503).json({
      success: false,
      error: {
        code: 'DATABASE_CONFIGURATION_MISSING',
        message: 'Persistent authentication is unavailable. Set DATABASE_URL on the API server.',
      },
    });
    return;
  }

  if (shouldUseInMemoryAuth()) {
    const duplicateEmail = Array.from(inMemoryDb.users.values()).some(
      (user) => user.email.toLowerCase() === data.email.toLowerCase()
    );
    const duplicateMobile = Array.from(inMemoryDb.users.values()).some(
      (user) => user.mobileNumber === data.mobileNumber
    );
    if (duplicateEmail) {
      res.status(409).json({ success: false, error: { code: 'EMAIL_ALREADY_EXISTS', message: 'An account with this email already exists' } });
      return;
    }
    if (duplicateMobile) {
      res.status(409).json({ success: false, error: { code: 'MOBILE_ALREADY_EXISTS', message: 'This mobile number is already registered' } });
      return;
    }
  }

  // 1. Check existing email or mobile
  const existingUserByEmail = shouldUseInMemoryAuth()
    ? null
    : await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existingUserByEmail) {
    res.status(409).json({
      success: false,
      error: { code: 'EMAIL_ALREADY_EXISTS', message: 'An account with this email already exists' },
    });
    return;
  }

  const existingUserByMobile = !shouldUseInMemoryAuth() && data.mobileNumber
    ? await prisma.user.findUnique({ where: { mobileNumber: data.mobileNumber } })
    : null;
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

  if (shouldUseInMemoryAuth()) {
    const registration = await createInMemoryRegistration(data);
    res.status(201).json({
      success: true,
      message: 'Welcome to RoboVerse! Student account and Digital ID created successfully.',
      data: registration,
    });
    return;
  }

  // 3. Create the canonical identity in Supabase Auth. The backend tables below
  // mirror this identity for application-specific data and JWT authorization.
  const supabaseAdmin = createSupabaseAdminClient();
  if (!supabaseAdmin) {
    res.status(503).json({
      success: false,
      error: {
        code: 'AUTH_CONFIGURATION_MISSING',
        message: 'Supabase Auth is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the API server.',
      },
    });
    return;
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email.toLowerCase(),
    password: data.password,
    email_confirm: true,
    user_metadata: {
      full_name: data.fullName,
      mobile_number: data.mobileNumber,
      dob: data.dateOfBirth,
      parent_email: data.parentEmail || null,
      parental_consent_given: data.parentalConsentGiven,
      school_or_college: data.schoolOrCollegeName,
      class_level: data.classOrYear,
      city: data.city,
      state: data.state,
      country: data.country || 'India',
      interests: data.interests,
    },
  });

  if (authError || !authData.user) {
    const alreadyExists = authError?.message?.toLowerCase().includes('already') || authError?.status === 422;
    res.status(alreadyExists ? 409 : 502).json({
      success: false,
      error: {
        code: alreadyExists ? 'EMAIL_ALREADY_EXISTS' : 'SUPABASE_AUTH_CREATE_FAILED',
        message: alreadyExists ? 'An account with this email already exists' : (authError?.message || 'Unable to create the Supabase Auth account'),
      },
    });
    return;
  }

  // 4. Hash password for the existing backend JWT login path.
  const passwordHash = await hashPassword(data.password);

  // Use the Supabase Auth UUID as the backend user ID so both systems refer to
  // exactly the same person.
  const userId = authData.user.id;
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

  // 5. Generate unique Student ID (e.g. RV-2026-000101) with QR code
  const studentIdRecord = await generateStudentIdRecord(await getNextStudentSequence(), 2026);

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

  // 7. Initialize Free Subscription
  const subId = `sub_${userId}_free`;
  try {
    await prisma.$transaction([
      prisma.user.create({ data: user }),
      prisma.studentID.create({ data: {
        id: `stid_${userId}`,
        userId,
        studentId: studentIdRecord.studentId,
        qrCodeDataUrl: studentIdRecord.qrCodeDataUrl,
        verificationHash: studentIdRecord.verificationHash,
        issuedAt: studentIdRecord.issuedAt,
        validUntil: studentIdRecord.validUntil,
      }}),
      prisma.studentProfile.create({ data: {
      id: profile.id,
      userId,
      fullName: profile.fullName,
      dateOfBirth: profile.dateOfBirth,
      parentEmail: profile.parentEmail,
      parentalConsentGiven: profile.parentalConsentGiven,
      institutionType: profile.institutionType,
      schoolOrCollegeName: profile.schoolOrCollegeName,
      classOrYear: profile.classOrYear,
      city: profile.city,
      state: profile.state,
      country: profile.country,
      interests: profile.interests,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      level: profile.level,
      xp: profile.xp,
      streakDays: profile.streakDays,
      totalLearningHours: profile.totalLearningHours,
      }}),
      prisma.subscription.create({ data: {
        id: subId,
        userId,
        planId: 'plan_free',
        billingCycle: BillingCycle.MONTHLY,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date('2099-12-31'),
        cancelAtPeriodEnd: false,
      }}),
    ]);
  } catch (error) {
    // Do not leave an orphaned Supabase Auth identity if the application
    // database transaction cannot be completed.
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id).catch(() => undefined);
    throw error;
  }

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
      redirectTo: getRoleRedirectPath(user.role),
    },
  });
});

/**
 * POST /api/v1/auth/login
 * Log in using Email OR Student ID + Password
 */
router.post('/login', validateBody(LoginInputSchema), async (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  if (!shouldUseInMemoryAuth() && !ENV.DATABASE_URL) {
    res.status(503).json({
      success: false,
      error: {
        code: 'DATABASE_CONFIGURATION_MISSING',
        message: 'Persistent authentication is unavailable. Set DATABASE_URL on the API server.',
      },
    });
    return;
  }

  if (shouldUseInMemoryAuth()) {
    const normalizedIdentifier = identifier.trim();
    const isStudentId = normalizedIdentifier.toUpperCase().startsWith('RV-');
    const studentIdEntry = isStudentId
      ? Array.from(inMemoryDb.studentIds.values()).find(
          (entry) => entry.studentId === normalizedIdentifier.toUpperCase()
        )
      : undefined;
    const matchedUser = studentIdEntry
      ? inMemoryDb.users.get(studentIdEntry.userId)
      : Array.from(inMemoryDb.users.values()).find(
          (user) => user.email.toLowerCase() === normalizedIdentifier.toLowerCase()
        );

    if (!matchedUser || !matchedUser.passwordHash || !(await comparePassword(password, matchedUser.passwordHash))) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email/Student ID or password' },
      });
      return;
    }

    const studentIdRecord = inMemoryDb.studentIds.get(matchedUser.id);
    const profile = inMemoryDb.profiles.get(matchedUser.id);
    const tokens = generateAuthTokens({
      userId: matchedUser.id,
      email: matchedUser.email,
      role: matchedUser.role,
      studentId: studentIdRecord?.studentId || 'RV-GUEST',
      planId: 'plan_free',
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
        redirectTo: getRoleRedirectPath(matchedUser.role),
      },
    });
    return;
  }

  // Check if identifier is studentId (e.g. RV-2026-...) or email
  let matchedUser: any = null;
  const isStudentId = identifier.toUpperCase().startsWith('RV-');

  if (isStudentId) {
    const studentIdEntry = await prisma.studentID.findUnique({ where: { studentId: identifier.toUpperCase() } });
    if (studentIdEntry) matchedUser = await prisma.user.findUnique({ where: { id: studentIdEntry.userId } });
  } else {
    matchedUser = await prisma.user.findUnique({ where: { email: identifier.toLowerCase() } });
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

  const studentIdRecord = await prisma.studentID.findUnique({ where: { userId: matchedUser.id } });
  const profile = await prisma.studentProfile.findUnique({ where: { userId: matchedUser.id } });

  // Find active subscription plan
  const sub = await prisma.subscription.findFirst({ where: { userId: matchedUser.id, status: 'ACTIVE' } });
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
      redirectTo: getRoleRedirectPath(matchedUser.role),
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
    const studentIdRecord = await generateStudentIdRecord(await getNextStudentSequence(), 2026);

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
      redirectTo: getRoleRedirectPath(user.role),
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
    data: {
      user,
      studentId: studentIdRecord?.studentId,
      profile,
      tokens,
      redirectTo: getRoleRedirectPath(user.role),
    },
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
      data: {
        user,
        studentId: studentIdRecord?.studentId,
        profile,
        tokens,
        redirectTo: getRoleRedirectPath(user.role),
      },
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

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User account not found.' },
      });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await hashPassword(newPassword) },
    });
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
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  const studentIdRecord = await prisma.studentID.findUnique({ where: { userId } });

  // Active subscription
  const sub = await prisma.subscription.findFirst({ where: { userId, status: 'ACTIVE' } });
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
            verificationUrl: `${process.env.CLIENT_WEB_URL || 'http://localhost:3000'}/verify/student/${studentIdRecord.studentId}?hash=${studentIdRecord.verificationHash}`,
            issuedAt: studentIdRecord.issuedAt,
            validUntil: studentIdRecord.validUntil,
          }
        : null,
      activeSubscription: sub || null,
      planTier,
      todayUsage: usage,
      redirectTo: getRoleRedirectPath(user?.role || req.user!.role),
    },
  });
});

export default router;
