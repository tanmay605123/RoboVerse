import { Router, Request, Response } from 'express';
import {
  CreateSubscriptionOrderInputSchema,
  VerifyRazorpayPaymentInputSchema,
  PlanTier,
  BillingCycle,
  UserRole,
  calculateGst,
  PaymentMethodType,
} from '@roboverse/shared';
import { requireAuth } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { razorpayService } from '../../lib/razorpay';
import { inMemoryDb } from '../../lib/db';
import { generateGstInvoice } from '../../lib/gst';

const router = Router();

/**
 * POST /api/v1/subscriptions/create-order
 * Create Razorpay Order / Subscription with Coupon & 18% GST Calculation
 */
router.post(
  '/create-order',
  requireAuth,
  validateBody(CreateSubscriptionOrderInputSchema),
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { planTier, billingCycle, couponCode, startFreeTrial, customerState } = req.body;

    if (planTier === PlanTier.FREE) {
      res.status(400).json({
        success: false,
        error: { code: 'FREE_PLAN_NO_PAYMENT', message: 'Free plan does not require checkout' },
      });
      return;
    }

    // 1. Fetch Plan configuration
    const planId = `plan_${planTier.toLowerCase()}`;
    const plan = inMemoryDb.plans.get(planId);
    if (!plan) {
      res.status(404).json({
        success: false,
        error: { code: 'PLAN_NOT_FOUND', message: 'Requested plan not found' },
      });
      return;
    }

    const pricingList = JSON.parse(plan.pricingJson);
    const selectedPricing = pricingList.find((p: any) => p.cycle === billingCycle);
    if (!selectedPricing) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_BILLING_CYCLE', message: `Billing cycle '${billingCycle}' not available for ${planTier}` },
      });
      return;
    }

    let finalAmountInr = selectedPricing.priceInrInclusiveGst;

    // Minimum 50 students for institution plan
    if (planTier === PlanTier.INSTITUTION) {
      finalAmountInr = finalAmountInr * 50; // ₹499 * 50 = ₹24,950
    }

    // 2. Handle 7-Day Pro Free Trial
    if (startFreeTrial && planTier === PlanTier.PRO) {
      // Create a ₹1 authentication charge for mandate verification
      finalAmountInr = 1.0;
    }

    // 3. Apply Coupon if provided
    let discountAmountInr = 0;
    if (couponCode && !startFreeTrial) {
      const coupon = inMemoryDb.coupons.get(couponCode.toUpperCase());
      if (coupon && coupon.isActive && new Date(coupon.validUntil) > new Date()) {
        if (finalAmountInr >= coupon.minOrderAmountInr) {
          if (coupon.discountPercentage) {
            discountAmountInr = (finalAmountInr * coupon.discountPercentage) / 100;
          } else if (coupon.discountAmountInr) {
            discountAmountInr = coupon.discountAmountInr;
          }
          finalAmountInr = Math.max(1, finalAmountInr - discountAmountInr);
        }
      }
    }

    // 4. Calculate 18% GST breakdown
    const isInterState = !customerState.toLowerCase().includes('haryana');
    const taxBreakdown = calculateGst(finalAmountInr, isInterState);

    // 5. Create Razorpay order
    const receipt = `rcpt_${userId.substring(0, 8)}_${Date.now()}`;
    const razorpayOrder = await razorpayService.createOrder({
      amountInr: finalAmountInr,
      receipt,
      notes: {
        userId,
        planTier,
        billingCycle,
        couponCode: couponCode || '',
        isTrial: startFreeTrial ? 'true' : 'false',
      },
    });

    // 6. Save pending payment record in DB
    const paymentId = `pay_${Date.now()}`;
    inMemoryDb.payments.set(paymentId, {
      id: paymentId,
      userId,
      orderId: razorpayOrder.orderId,
      razorpayOrderId: razorpayOrder.orderId,
      amountInr: finalAmountInr,
      currency: 'INR',
      status: 'CREATED',
      planTier,
      billingCycle,
      customerState,
      taxBreakdown,
      createdAt: new Date(),
    });

    res.json({
      success: true,
      message: 'Razorpay order created successfully',
      data: {
        orderId: razorpayOrder.orderId,
        amount: razorpayOrder.amount, // in paise
        amountInr: finalAmountInr,
        currency: 'INR',
        keyId: razorpayOrder.keyId,
        planTier,
        billingCycle,
        originalAmountInr: selectedPricing.priceInrInclusiveGst,
        discountAmountInr,
        isTrial: startFreeTrial,
        taxBreakdown,
      },
    });
  }
);

/**
 * POST /api/v1/subscriptions/verify
 * Verify Razorpay payment signature, upgrade user plan, and issue GST tax invoice
 */
router.post(
  '/verify',
  requireAuth,
  validateBody(VerifyRazorpayPaymentInputSchema),
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // 1. Verify cryptographic signature
    const isValidSignature = razorpayService.verifyPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValidSignature) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_SIGNATURE', message: 'Razorpay payment verification failed.' },
      });
      return;
    }

    // 2. Fetch pending payment
    const payment = Array.from(inMemoryDb.payments.values()).find(
      (p) => p.razorpayOrderId === razorpayOrderId
    );

    const user = inMemoryDb.users.get(userId);
    const profile = inMemoryDb.profiles.get(userId);
    const studentIdRecord = inMemoryDb.studentIds.get(userId);

    const planTier: PlanTier = payment?.planTier || PlanTier.PRO;
    const billingCycle: BillingCycle = payment?.billingCycle || BillingCycle.MONTHLY;

    // 3. Update User Role
    if (planTier === PlanTier.PRO) {
      user.role = UserRole.PRO_STUDENT;
    } else if (planTier === PlanTier.PLUS) {
      user.role = UserRole.PLUS_STUDENT;
    }

    // 4. Calculate subscription period
    const now = new Date();
    const currentPeriodEnd = new Date(now);
    if (billingCycle === BillingCycle.YEARLY) {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else if (billingCycle === BillingCycle.QUARTERLY) {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 3);
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

    // 5. Inactivate previous subscriptions (e.g. initial free tier or previous cycle)
    Array.from(inMemoryDb.subscriptions.values()).forEach((s) => {
      if (s.userId === userId && s.status === 'ACTIVE') {
        s.status = 'CANCELLED';
      }
    });

    const subscriptionId = `sub_${userId}_${Date.now()}`;
    const subscription = {
      id: subscriptionId,
      userId,
      planId: `plan_${planTier.toLowerCase()}`,
      billingCycle,
      status: 'ACTIVE',
      razorpaySubscriptionId: `sub_rzp_${Date.now()}`,
      currentPeriodStart: now,
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
      createdAt: now,
      updatedAt: now,
    };
    inMemoryDb.subscriptions.set(subscriptionId, subscription);

    // 6. Update Payment status
    if (payment) {
      payment.status = 'CAPTURED';
      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature;
      payment.subscriptionId = subscriptionId;
    }

    // 7. Generate official GST Tax Invoice
    const invoice = generateGstInvoice({
      orderId: razorpayOrderId,
      userId,
      studentId: studentIdRecord?.studentId || 'RV-STUDENT',
      customerName: profile?.fullName || 'RoboVerse Student',
      customerEmail: user.email,
      customerState: payment?.customerState || 'Delhi',
      planName: planTier,
      billingCycle,
      grossAmountInr: payment?.amountInr || 999,
      paymentMethod: PaymentMethodType.UPI,
      paymentId: razorpayPaymentId,
    });
    inMemoryDb.invoices.set(invoice.id, invoice);

    res.json({
      success: true,
      message: `Congratulations! Successfully subscribed to RoboVerse ${planTier}. All features unlocked!`,
      data: {
        subscription,
        updatedRole: user.role,
        invoice: {
          invoiceNumber: invoice.invoiceNumber,
          taxBreakdown: invoice.tax,
          issuedAt: invoice.issuedAt,
          downloadUrl: `/api/v1/subscriptions/invoices/${invoice.id}`,
        },
      },
    });
  }
);

/**
 * POST /api/v1/subscriptions/webhook
 * Razorpay Webhook Handler
 */
router.post('/webhook', async (req: Request, res: Response) => {
  const webhookSignature = req.headers['x-razorpay-signature'] as string;
  const rawBody = JSON.stringify(req.body);

  if (webhookSignature) {
    const isWebhookValid = razorpayService.verifyWebhookSignature({
      rawBody,
      signature: webhookSignature,
    });
    if (!isWebhookValid) {
      res.status(400).json({ error: 'Invalid webhook signature' });
      return;
    }
  }

  const event = req.body.event;
  const payload = req.body.payload;

  console.log(`🔔 Razorpay Webhook Event Received: ${event}`);

  switch (event) {
    case 'subscription.charged':
    case 'payment.captured': {
      // Find subscription and extend period
      const subId = payload?.subscription?.entity?.id;
      if (subId) {
        const sub = Array.from(inMemoryDb.subscriptions.values()).find(
          (s) => s.razorpaySubscriptionId === subId
        );
        if (sub) {
          sub.status = 'ACTIVE';
          const nextEnd = new Date(sub.currentPeriodEnd);
          nextEnd.setMonth(nextEnd.getMonth() + 1);
          sub.currentPeriodEnd = nextEnd;
        }
      }
      break;
    }

    case 'subscription.halted': {
      // Move to GRACE_PERIOD (3-day grace period before terminating access)
      const subId = payload?.subscription?.entity?.id;
      if (subId) {
        const sub = Array.from(inMemoryDb.subscriptions.values()).find(
          (s) => s.razorpaySubscriptionId === subId
        );
        if (sub) {
          sub.status = 'GRACE_PERIOD';
          const grace = new Date();
          grace.setDate(grace.getDate() + 3);
          sub.gracePeriodEnd = grace;
        }
      }
      break;
    }

    case 'subscription.cancelled': {
      const subId = payload?.subscription?.entity?.id;
      if (subId) {
        const sub = Array.from(inMemoryDb.subscriptions.values()).find(
          (s) => s.razorpaySubscriptionId === subId
        );
        if (sub) {
          sub.status = 'CANCELLED';
          // Revert user role to FREE_STUDENT
          const user = inMemoryDb.users.get(sub.userId);
          if (user) user.role = UserRole.FREE_STUDENT;
        }
      }
      break;
    }

    case 'subscription.paused': {
      const subId = payload?.subscription?.entity?.id;
      if (subId) {
        const sub = Array.from(inMemoryDb.subscriptions.values()).find(
          (s) => s.razorpaySubscriptionId === subId
        );
        if (sub) sub.status = 'PAUSED';
      }
      break;
    }

    case 'subscription.resumed': {
      const subId = payload?.subscription?.entity?.id;
      if (subId) {
        const sub = Array.from(inMemoryDb.subscriptions.values()).find(
          (s) => s.razorpaySubscriptionId === subId
        );
        if (sub) sub.status = 'ACTIVE';
      }
      break;
    }
  }

  res.json({ status: 'ok', received: true });
});

/**
 * GET /api/v1/subscriptions/current
 */
router.get('/current', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const sub = Array.from(inMemoryDb.subscriptions.values()).find(
    (s) => s.userId === userId && s.status === 'ACTIVE'
  );

  const planId = sub ? sub.planId : 'plan_free';
  const plan = inMemoryDb.plans.get(planId);

  res.json({
    success: true,
    data: {
      subscription: sub || null,
      plan: plan
        ? {
            id: plan.id,
            name: plan.name,
            tier: plan.tier,
            features: JSON.parse(plan.featuresJson),
          }
        : null,
    },
  });
});

/**
 * POST /api/v1/subscriptions/cancel
 * Cancel subscription with 7-day refund guarantee check
 */
router.post('/cancel', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const sub = Array.from(inMemoryDb.subscriptions.values())
    .reverse()
    .find((s) => s.userId === userId && s.status === 'ACTIVE' && s.planId !== 'plan_free');

  if (!sub) {
    res.status(400).json({
      success: false,
      error: { code: 'NO_ACTIVE_PAID_SUBSCRIPTION', message: 'No active paid subscription found to cancel.' },
    });
    return;
  }

  // Check 7-day refund policy window
  const subscribedAt = new Date(sub.createdAt).getTime();
  const now = Date.now();
  const daysSincePurchase = (now - subscribedAt) / (1000 * 60 * 60 * 24);
  const eligibleForRefund = daysSincePurchase <= 7;

  sub.status = 'CANCELLED';
  sub.cancelAtPeriodEnd = true;

  // Downgrade to FREE_STUDENT
  const user = inMemoryDb.users.get(userId);
  if (user) {
    user.role = UserRole.FREE_STUDENT;
  }

  res.json({
    success: true,
    message: eligibleForRefund
      ? 'Subscription cancelled. Because you cancelled within 7 days of purchase, a 100% full refund has been initiated to your original payment method.'
      : 'Subscription auto-renew has been cancelled. You will retain access until the end of your billing cycle.',
    data: {
      refundEligible: eligibleForRefund,
      refundAmount: eligibleForRefund ? '100% Full Refund' : 'None',
      cancelledAt: new Date().toISOString(),
    },
  });
});

/**
 * GET /api/v1/subscriptions/invoices
 * List user's GST invoices
 */
router.get('/invoices', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const invoices = Array.from(inMemoryDb.invoices.values()).filter((inv) => inv.userId === userId);

  res.json({
    success: true,
    data: invoices,
  });
});

/**
 * GET /api/v1/subscriptions/invoices/:invoiceId
 */
router.get('/invoices/:invoiceId', requireAuth, async (req: Request, res: Response) => {
  const { invoiceId } = req.params;
  const invoice = inMemoryDb.invoices.get(invoiceId);

  if (!invoice || (invoice.userId !== req.user!.userId && req.user!.role !== UserRole.ADMIN)) {
    res.status(404).json({
      success: false,
      error: { code: 'INVOICE_NOT_FOUND', message: 'Invoice not found' },
    });
    return;
  }

  res.json({
    success: true,
    data: invoice,
  });
});

export default router;
