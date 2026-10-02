import { Router, Request, Response } from 'express';
import { UserRole } from '@roboverse/shared';
import { requireAuth, requireRole } from '../../middleware/auth';
import { inMemoryDb } from '../../lib/db';

const router = Router();

// Protect all admin routes
router.use(requireAuth);
router.use(requireRole(UserRole.ADMIN));

/**
 * GET /api/v1/admin/metrics
 * Revenue, cost and subscription analytics
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
      totalGrossRevenueInr: Number(combinedRevenueInr.toFixed(2)),
      subscriptionRevenueInr: Number(totalRevenueInr.toFixed(2)),
      storeRevenueInr: Number(storeRevenueInr.toFixed(2)),
      totalStoreOrdersCount: orders.length,
      confirmedStoreOrdersCount: confirmedOrders.length,
      totalInvoicesIssued: inMemoryDb.invoices.size,
      totalAiInferenceCostInr: Number(totalAiCostInr.toFixed(2)),
      estimatedNetMarginInr: Number((combinedRevenueInr - totalAiCostInr).toFixed(2)),
      razorpayFeeEstimateInr: Number((combinedRevenueInr * 0.0236).toFixed(2)), // ~2% + GST
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
 * GET /api/v1/admin/users
 */
router.get('/users', async (req: Request, res: Response) => {
  const users = Array.from(inMemoryDb.users.values()).map((u) => {
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
      studentId: stid?.studentId,
      fullName: profile?.fullName,
      schoolOrCollege: profile?.schoolOrCollegeName,
      city: profile?.city,
      plan: sub?.planId || 'plan_free',
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

  user.role = role;
  inMemoryDb.users.set(userId, user);

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

  res.status(201).json({
    success: true,
    message: `Coupon '${upperCode}' created successfully.`,
    data: coupon,
  });
});

export default router;
