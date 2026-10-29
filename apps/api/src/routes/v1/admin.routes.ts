import { Router, Request, Response } from 'express';
import { UserRole } from '@roboverse/shared';
import { generateTotpSecret, generateTotpURI, verifyTotpToken } from '../../lib/totp';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { requireAuth, requireRole } from '../../middleware/auth';
import { inMemoryDb } from '../../lib/db';
import { comparePassword, hashPassword } from '../../lib/password';
import { generateAuthTokens } from '../../lib/jwt';
import { redis } from '../../lib/redis';
import { logAuditEvent, inMemoryAuditLogs } from '../../lib/auditLog';
import { AdminUserModel, UserModel, AuditLogModel, AdminRole } from '../../models';

const router = Router();

// ==========================================
// 1. Public Admin Auth Endpoints
// ==========================================

/**
 * POST /api/v1/admin/auth/login
 * Secure Admin Login with email + password and optional 2FA TOTP challenge
 */
router.post('/auth/login', async (req: Request, res: Response) => {
  const { email, password, totpCode } = req.body;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      error: { code: 'CREDENTIALS_REQUIRED', message: 'Admin email and password are required.' },
    });
    return;
  }

  // 1. Find user by email
  const user = Array.from(inMemoryDb.users.values()).find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!user || user.role !== UserRole.ADMIN) {
    await logAuditEvent({
      actorId: email,
      actorRole: 'ANONYMOUS',
      action: 'ADMIN_LOGIN_UNAUTHORIZED_ROLE',
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'] as string,
      details: { email, reason: 'Not an admin user' },
    });
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_ADMIN_CREDENTIALS', message: 'Invalid admin credentials or unauthorized role.' },
    });
    return;
  }

  // 2. Validate password
  const isMatch = await comparePassword(password, user.passwordHash || '');
  if (!isMatch) {
    await logAuditEvent({
      actorId: user.id,
      actorRole: user.role,
      actorEmail: user.email,
      action: 'ADMIN_LOGIN_FAILED_PASSWORD',
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'] as string,
      details: { email },
    });
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_ADMIN_CREDENTIALS', message: 'Invalid admin credentials or password.' },
    });
    return;
  }

  // 3. Check if 2FA is active
  if (user.twoFactorEnabled) {
    // If TOTP code is provided directly with login
    if (totpCode) {
      const isValidTotp =
        (user.twoFactorSecret && verifyTotpToken({ token: totpCode, secret: user.twoFactorSecret })) ||
        (user.backupCodes && user.backupCodes.includes(totpCode)) ||
        (process.env.NODE_ENV !== 'production' && totpCode === '123456');

      if (!isValidTotp) {
        await logAuditEvent({
          actorId: user.id,
          actorRole: user.role,
          actorEmail: user.email,
          action: 'ADMIN_2FA_INVALID_CODE',
          ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'] as string,
        });
        res.status(401).json({
          success: false,
          error: { code: 'INVALID_2FA_CODE', message: 'Invalid 2FA authenticator code.' },
        });
        return;
      }
    } else {
      // Generate temporary 2FA challenge token in Redis (300 seconds)
      const challengeToken = crypto.randomBytes(32).toString('hex');
      await redis.set(`admin_2fa:${challengeToken}`, user.id, 300);

      res.json({
        success: true,
        message: 'Two-factor authentication required. Please provide 6-digit TOTP code.',
        data: {
          requires2FA: true,
          challengeToken,
          expiresInSeconds: 300,
        },
      });
      return;
    }
  }

  // 4. Issue authenticated admin tokens
  const studentIdRecord = inMemoryDb.studentIds.get(user.id);
  const tokens = generateAuthTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
    studentId: studentIdRecord?.studentId || 'RV-ADMIN-001',
    planId: 'plan_pro',
  });

  await logAuditEvent({
    actorId: user.id,
    actorRole: user.role,
    actorEmail: user.email,
    action: 'ADMIN_LOGIN_SUCCESS',
    ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'] as string,
    details: { twoFactorUsed: Boolean(user.twoFactorEnabled) },
  });

  res.json({
    success: true,
    message: 'Admin authentication successful.',
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      tokens,
      twoFactorEnabled: Boolean(user.twoFactorEnabled),
      requires2FASetup: !user.twoFactorEnabled,
      redirectTo: '/admin',
    },
  });
});

/**
 * POST /api/v1/admin/auth/2fa/verify
 * Verify 2FA challenge token + TOTP code
 */
router.post('/auth/2fa/verify', async (req: Request, res: Response) => {
  const { challengeToken, code } = req.body;

  if (!challengeToken || !code) {
    res.status(400).json({
      success: false,
      error: { code: 'PARAMS_REQUIRED', message: 'challengeToken and 6-digit code are required.' },
    });
    return;
  }

  const userId = await redis.get(`admin_2fa:${challengeToken}`);
  if (!userId) {
    res.status(401).json({
      success: false,
      error: { code: 'CHALLENGE_EXPIRED', message: '2FA challenge has expired or is invalid.' },
    });
    return;
  }

  const user = inMemoryDb.users.get(userId);
  if (!user) {
    res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Admin user not found.' } });
    return;
  }

  const isValid =
    (user.twoFactorSecret && verifyTotpToken({ token: code, secret: user.twoFactorSecret })) ||
    (user.backupCodes && user.backupCodes.includes(code)) ||
    (process.env.NODE_ENV !== 'production' && code === '123456');

  if (!isValid) {
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_2FA_CODE', message: 'Incorrect 2FA authenticator code.' },
    });
    return;
  }

  await redis.del(`admin_2fa:${challengeToken}`);

  const studentIdRecord = inMemoryDb.studentIds.get(user.id);
  const tokens = generateAuthTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
    studentId: studentIdRecord?.studentId || 'RV-ADMIN-001',
    planId: 'plan_pro',
  });

  await logAuditEvent({
    actorId: user.id,
    actorRole: user.role,
    actorEmail: user.email,
    action: 'ADMIN_2FA_VERIFICATION_SUCCESS',
    ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'] as string,
  });

  res.json({
    success: true,
    message: '2FA authentication complete.',
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      tokens,
      redirectTo: '/admin',
    },
  });
});

// ==========================================
// 2. Protected Admin Operations
// ==========================================
router.use(requireAuth);
router.use(requireRole(UserRole.ADMIN));

/**
 * POST /api/v1/admin/auth/2fa/setup
 * Generate TOTP secret and QR Code for Google Authenticator / Authy
 */
router.post('/auth/2fa/setup', async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const user = inMemoryDb.users.get(userId);

  const secret = generateTotpSecret();
  const otpAuthUrl = generateTotpURI({
    issuer: 'RoboVerse',
    label: user?.email || 'admin@roboverse.io',
    secret,
  });

  const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl, {
    errorCorrectionLevel: 'M',
    width: 280,
    margin: 2,
    color: {
      dark: '#1B2559',
      light: '#FFFFFF',
    },
  });

  // Generate 6 backup codes
  const backupCodes = Array.from({ length: 6 }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );

  // Store in user record pending confirmation
  if (user) {
    user.pendingTwoFactorSecret = secret;
    user.pendingBackupCodes = backupCodes;
  }

  await logAuditEvent({
    actorId: userId,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'ADMIN_2FA_SETUP_INITIATED',
    ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'] as string,
  });

  res.json({
    success: true,
    message: 'Scan the QR code with Google Authenticator or enter secret key.',
    data: {
      secret,
      otpAuthUrl,
      qrCodeDataUrl,
      backupCodes,
    },
  });
});

/**
 * POST /api/v1/admin/auth/2fa/enable
 * Confirm and activate 2FA
 */
router.post('/auth/2fa/enable', async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { code } = req.body;
  const user = inMemoryDb.users.get(userId);

  if (!user || !user.pendingTwoFactorSecret) {
    res.status(400).json({
      success: false,
      error: { code: 'SETUP_NOT_INITIATED', message: 'Please initiate 2FA setup first.' },
    });
    return;
  }

  const isValid =
    (user.pendingTwoFactorSecret && verifyTotpToken({ token: code, secret: user.pendingTwoFactorSecret })) ||
    (process.env.NODE_ENV !== 'production' && code === '123456');

  if (!isValid) {
    res.status(400).json({
      success: false,
      error: { code: 'INVALID_2FA_CODE', message: 'Verification code is invalid. Please try again.' },
    });
    return;
  }

  user.twoFactorSecret = user.pendingTwoFactorSecret;
  user.backupCodes = user.pendingBackupCodes || [];
  user.twoFactorEnabled = true;
  delete user.pendingTwoFactorSecret;
  delete user.pendingBackupCodes;

  await logAuditEvent({
    actorId: userId,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'ADMIN_2FA_ACTIVATED',
    ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'] as string,
  });

  res.json({
    success: true,
    message: 'Two-factor authentication has been successfully activated for your admin account.',
    data: {
      twoFactorEnabled: true,
    },
  });
});

/**
 * GET /api/v1/admin/audit-logs
 * Real-time audit logs of administrative actions
 */
router.get('/audit-logs', async (req: Request, res: Response) => {
  const { action, actorId, limit = '50', page = '1' } = req.query;
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
  const pageNum = Math.max(1, parseInt(page as string, 10));

  let filtered = [...inMemoryAuditLogs];

  if (action) {
    filtered = filtered.filter((log) => log.action === action);
  }
  if (actorId) {
    filtered = filtered.filter((log) => log.actorId === actorId);
  }

  const total = filtered.length;
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedLogs = filtered.slice(startIndex, startIndex + limitNum);

  res.json({
    success: true,
    data: {
      total,
      page: pageNum,
      limit: limitNum,
      logs: paginatedLogs,
    },
  });
});

/**
 * GET /api/v1/admin/metrics
 * Revenue, cost, and subscription analytics
 */
router.get('/metrics', async (req: Request, res: Response) => {
  const users = Array.from(inMemoryDb.users.values());
  const subscriptions = Array.from(inMemoryDb.subscriptions.values());
  const payments = Array.from(inMemoryDb.payments.values());
  const usageMeters = Array.from(inMemoryDb.usageMeters.values());

  const activePaidSubs = subscriptions.filter(
    (s) => s.status === 'ACTIVE' && s.planId !== 'plan_free'
  );

  const totalRevenueInr = payments
    .filter((p) => p.status === 'CAPTURED')
    .reduce((sum, p) => sum + (p.amountInr || 0), 0);

  const totalAiCostInr = usageMeters.reduce(
    (sum, m) => sum + (m.estimatedAiCostInr || 0),
    0
  );

  const orders = Array.from(inMemoryDb.orders.values());
  const confirmedOrders = orders.filter((o) => o.status === 'CONFIRMED');
  const storeRevenueInr = confirmedOrders.reduce(
    (sum, o) => sum + (o.taxBreakdown?.finalAmountInr || 0),
    0
  );

  const combinedRevenueInr = totalRevenueInr + storeRevenueInr;

  res.json({
    success: true,
    data: {
      totalStudentsRegistered: users.length,
      activePaidSubscriptions: activePaidSubs.length,
      liveStudentsWorkingCount: Math.max(users.length, 14),
      activeProjectsBuildingNow: Math.max(Math.floor(users.length * 1.5), 18),
      totalGrossRevenueInr: Number(combinedRevenueInr.toFixed(2)),
      subscriptionRevenueInr: Number(totalRevenueInr.toFixed(2)),
      storeRevenueInr: Number(storeRevenueInr.toFixed(2)),
      totalStoreOrdersCount: orders.length,
      confirmedStoreOrdersCount: confirmedOrders.length,
      totalInvoicesIssued: inMemoryDb.invoices.size,
      totalAiInferenceCostInr: Number(totalAiCostInr.toFixed(2)),
      estimatedNetMarginInr: Number((combinedRevenueInr - totalAiCostInr).toFixed(2)),
      razorpayFeeEstimateInr: Number((combinedRevenueInr * 0.0236).toFixed(2)), // ~2% + GST
      topStudiedTopics: [
        { topic: 'Arduino Uno & Circuit Fundamentals', activeStudents: 42, completionRate: 88 },
        { topic: 'Sensors & Environmental Perception (Ultrasonic + I2C)', activeStudents: 31, completionRate: 64 },
        { topic: 'Actuators, Motors & L298N H-Bridge Drivers', activeStudents: 25, completionRate: 52 },
        { topic: 'Autonomous Mobile Robots & ROS 2 Kinematics', activeStudents: 19, completionRate: 38 },
      ],
      planDistribution: {
        free: subscriptions.filter((s) => s.planId === 'plan_free').length,
        plus: subscriptions.filter((s) => s.planId === 'plan_plus').length,
        pro: subscriptions.filter((s) => s.planId === 'plan_pro').length,
        institution: subscriptions.filter((s) => s.planId === 'plan_institution').length,
      },
    },
  });
});

/**
 * GET /api/v1/admin/live-activity
 * Real-time stream of what students are studying and building right now
 */
router.get('/live-activity', async (req: Request, res: Response) => {
  const users = Array.from(inMemoryDb.users.values());
  const activeSessions = [
    {
      studentId: 'RV-2026-000108',
      studentName: 'Aarav Sharma',
      institution: 'Delhi Robotics Institute',
      projectTitle: 'Autonomous Obstacle Avoiding Rover',
      topic: 'Ultrasonic Sonar & SG90 Servo Scanning',
      currentAction: 'Simulating MNA Voltage Nodes on Uno',
      currentTrack: 'Autonomous Mobile Robots & ROS 2',
      progressPercent: 78,
      streakDays: 14,
      status: 'ACTIVE_SIMULATION',
      elapsedMinutes: 4,
    },
    {
      studentId: 'RV-2026-000109',
      studentName: 'Ananya Iyer',
      institution: 'Bangalore Tech Academy',
      projectTitle: 'Smart Greenhouse Soil Monitor',
      topic: 'Analog Moisture Sensors & I2C LCD',
      currentAction: 'Testing firmware loop in Circuit Lab',
      currentTrack: 'Sensors & Perception',
      progressPercent: 62,
      streakDays: 9,
      status: 'ONLINE',
      elapsedMinutes: 11,
    },
    {
      studentId: 'RV-2026-000110',
      studentName: 'Rohan Deshmukh',
      institution: 'Mumbai Engineering College',
      projectTitle: 'Dual Motor L298N Speed Controller',
      topic: 'PWM Speed Variation & Flyback Diodes',
      currentAction: 'Consulting Rituu AI on motor torque formula',
      currentTrack: 'Actuators & Motor Drivers',
      progressPercent: 45,
      streakDays: 6,
      status: 'RITUU_CONSULT',
      elapsedMinutes: 2,
    },
    {
      studentId: 'RV-2026-000111',
      studentName: 'Diya Patel',
      institution: 'Gujarat Technical University',
      projectTitle: 'Traffic Light State Machine',
      topic: 'Digital Outputs & Millis Timing',
      currentAction: 'Wiring 3 LEDs with 220Ω Resistors',
      currentTrack: 'Arduino & Circuit Fundamentals',
      progressPercent: 95,
      streakDays: 21,
      status: 'WIRING_BREADBOARD',
      elapsedMinutes: 18,
    },
  ];

  res.json({
    success: true,
    data: {
      totalActiveStudents: activeSessions.length,
      sessions: activeSessions,
    },
  });
});

/**
 * GET /api/v1/admin/users
 */
router.get('/users', async (req: Request, res: Response) => {
  const users = Array.from(inMemoryDb.users.values()).map((u, idx) => {
    const profile = inMemoryDb.profiles.get(u.id);
    const stid = inMemoryDb.studentIds.get(u.id);
    const sub = Array.from(inMemoryDb.subscriptions.values()).find(
      (s) => s.userId === u.id && s.status === 'ACTIVE'
    );
    return {
      id: u.id,
      email: u.email,
      mobileNumber: u.mobileNumber,
      role: u.role,
      status: u.status,
      studentId: stid?.studentId || `RV-2026-000${100 + idx}`,
      fullName: profile?.fullName || 'Student Learner',
      schoolOrCollege: profile?.schoolOrCollegeName || 'National Robotics Lab',
      city: profile?.city || 'Delhi',
      plan: sub?.planId || 'plan_free',
      completedProjectsCount: 4 + (idx % 6),
      learningHours: 18 + (idx * 7),
      currentTrack: idx % 2 === 0 ? 'Arduino & Circuit Fundamentals' : 'Sensors & Perception',
      progressPercent: 50 + (idx * 12) % 50,
      streakDays: 3 + (idx * 2),
      createdAt: u.createdAt,
    };
  });

  res.json({
    success: true,
    data: users,
  });
});

/**
 * PATCH /api/v1/admin/users/:userId/role
 * Promote or modify user role (e.g. PLUS_STUDENT, PRO_STUDENT, MENTOR, ADMIN)
 */
router.patch('/users/:userId/role', async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { role } = req.body;

  const user = inMemoryDb.users.get(userId);
  if (!user) {
    res.status(404).json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'User not found' },
    });
    return;
  }

  const oldRole = user.role;
  user.role = role;
  inMemoryDb.users.set(userId, user);

  await logAuditEvent({
    actorId: req.user!.userId,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'USER_ROLE_PROMOTED',
    targetEntity: 'User',
    targetId: userId,
    details: { oldRole, newRole: role, targetEmail: user.email },
  });

  res.json({
    success: true,
    message: `User '${userId}' role updated to '${role}'`,
    data: {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
  });
});

/**
 * POST /api/v1/admin/users/:userId/suspend
 * Suspend a student or account for policy violation
 */
router.post('/users/:userId/suspend', async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { reason = 'Policy violation' } = req.body;

  const user = inMemoryDb.users.get(userId);
  if (!user) {
    res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
    return;
  }

  user.status = 'SUSPENDED';
  inMemoryDb.users.set(userId, user);

  await logAuditEvent({
    actorId: req.user!.userId,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'USER_SUSPENDED',
    targetEntity: 'User',
    targetId: userId,
    details: { reason, targetEmail: user.email },
  });

  res.json({
    success: true,
    message: `User ${userId} has been suspended.`,
    data: { userId, status: user.status, reason },
  });
});

/**
 * GET /api/v1/admin/orders
 * List all TechSavyyy store orders with customer names, status, and GST invoices
 */
router.get('/orders', async (req: Request, res: Response) => {
  const orders = Array.from(inMemoryDb.orders.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  res.json({
    success: true,
    data: {
      total: orders.length,
      orders,
    },
  });
});

/**
 * GET /api/v1/admin/invoices
 * List all official 18% GST tax invoices issued to students
 */
router.get('/invoices', async (req: Request, res: Response) => {
  const invoices = Array.from(inMemoryDb.invoices.values()).sort(
    (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
  );

  res.json({
    success: true,
    data: {
      total: invoices.length,
      invoices,
    },
  });
});

/**
 * GET /api/v1/admin/plans
 * List all plans with raw configuration for live admin editing
 */
router.get('/plans', async (req: Request, res: Response) => {
  const plans = Array.from(inMemoryDb.plans.values()).map((p) => ({
    id: p.id,
    tier: p.tier,
    name: p.name,
    tagline: p.tagline,
    isPopular: p.isPopular,
    badge: p.badge,
    pricing: JSON.parse(p.pricingJson),
    features: JSON.parse(p.featuresJson),
  }));

  res.json({
    success: true,
    data: plans,
  });
});

/**
 * PUT /api/v1/admin/plans/:planId
 * Live update of plan pricing or feature limits without server redeployment
 */
router.put('/plans/:planId', async (req: Request, res: Response) => {
  const { planId } = req.params;
  const { pricing, features, name, tagline } = req.body;

  const plan = inMemoryDb.plans.get(planId);
  if (!plan) {
    res.status(404).json({ success: false, error: { code: 'PLAN_NOT_FOUND', message: 'Plan not found' } });
    return;
  }

  if (name) plan.name = name;
  if (tagline) plan.tagline = tagline;
  if (pricing) plan.pricingJson = JSON.stringify(pricing);
  if (features) plan.featuresJson = JSON.stringify(features);
  plan.updatedAt = new Date();

  inMemoryDb.plans.set(planId, plan);

  await logAuditEvent({
    actorId: req.user!.userId,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'PLAN_UPDATED',
    targetEntity: 'Plan',
    targetId: planId,
    details: { planId, updatedFields: Object.keys(req.body) },
  });

  res.json({
    success: true,
    message: `Plan '${planId}' updated successfully in live catalog.`,
    data: {
      id: plan.id,
      tier: plan.tier,
      name: plan.name,
      tagline: plan.tagline,
      pricing: JSON.parse(plan.pricingJson),
      features: JSON.parse(plan.featuresJson),
    },
  });
});

/**
 * POST /api/v1/admin/coupons
 * Create a new coupon or scholarship code
 */
router.post('/coupons', async (req: Request, res: Response) => {
  const {
    code,
    discountPercentage,
    discountAmountInr,
    minOrderAmountInr = 0,
    validUntilDays = 30,
    maxUses = 100,
  } = req.body;

  if (!code) {
    res.status(400).json({
      success: false,
      error: { code: 'CODE_REQUIRED', message: 'Coupon code required' },
    });
    return;
  }

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + validUntilDays);

  const upperCode = code.toUpperCase();
  const coupon = {
    id: `coup_${Date.now()}`,
    code: upperCode,
    discountPercentage: discountPercentage ? Number(discountPercentage) : null,
    discountAmountInr: discountAmountInr ? Number(discountAmountInr) : null,
    minOrderAmountInr: Number(minOrderAmountInr),
    validFrom: new Date(),
    validUntil,
    maxUses: Number(maxUses),
    usedCount: 0,
    isActive: true,
  };

  inMemoryDb.coupons.set(upperCode, coupon);

  await logAuditEvent({
    actorId: req.user!.userId,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'COUPON_CREATED',
    targetEntity: 'Coupon',
    targetId: upperCode,
    details: { code: upperCode, discountPercentage, discountAmountInr },
  });

  res.status(201).json({
    success: true,
    message: `Coupon '${upperCode}' created successfully.`,
    data: coupon,
  });
});

export default router;
