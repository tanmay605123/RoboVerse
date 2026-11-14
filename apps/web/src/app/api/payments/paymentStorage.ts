import {
  SubscriptionPlanTier,
  SubscriptionBillingCycle,
  calculateSubscriptionPrice,
  validateCoupon,
  ROBOVERSE_PLANS,
} from '@roboverse/shared';

export interface StoredPayment {
  id: string;
  userId: string;
  userEmail: string;
  planTier: SubscriptionPlanTier;
  billingCycle: SubscriptionBillingCycle;
  method: 'checkout' | 'qr';
  amountInr: number;
  basePriceInr: number;
  discountInr: number;
  taxablePriceInr: number;
  gstAmountInr: number;
  couponCode?: string;
  status: 'created' | 'captured' | 'failed';
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  qrImageUrl?: string;
  upiUri?: string;
  qrExpiresAt?: string;
  invoiceNumber?: string;
  createdAt: string;
  capturedAt?: string;
  isTestMode: boolean;
}

export interface StoredSubscription {
  id: string;
  userId: string;
  planTier: SubscriptionPlanTier;
  billingCycle: SubscriptionBillingCycle;
  status: 'active' | 'cancelled' | 'expired';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  paymentId: string;
  updatedAt: string;
}

// In-Memory store for subscriptions and payments (authoritative backup & local dev)
const paymentsStore = new Map<string, StoredPayment>();
const subscriptionsStore = new Map<string, StoredSubscription>();

// Seed an initial demo subscription for the test student
subscriptionsStore.set('stu_demo_001', {
  id: 'sub_demo_free',
  userId: 'stu_demo_001',
  planTier: 'free',
  billingCycle: 'monthly',
  status: 'active',
  currentPeriodStart: new Date().toISOString(),
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  paymentId: 'pay_initial_free',
  updatedAt: new Date().toISOString(),
});

export const paymentStorage = {
  createPlanPayment(params: {
    userId: string;
    userEmail: string;
    planTier: SubscriptionPlanTier;
    billingCycle: SubscriptionBillingCycle;
    method: 'checkout' | 'qr';
    couponCode?: string;
  }): StoredPayment {
    const { userId, userEmail, planTier, billingCycle, method, couponCode } = params;

    const priceBreakdown = calculateSubscriptionPrice(planTier, billingCycle, couponCode);
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const razorpayOrderId = `order_rp_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const isTestMode =
      !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('mock') || !process.env.RAZORPAY_KEY_SECRET;

    // UPI Dynamic QR setup
    let qrImageUrl: string | undefined = undefined;
    let upiUri: string | undefined = undefined;
    let qrExpiresAt: string | undefined = undefined;

    if (method === 'qr') {
      const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      qrExpiresAt = expiry.toISOString();
      upiUri = `upi://pay?pa=roboverse@icici&pn=RoboVerse%20Technologies&am=${priceBreakdown.totalPayableInr}&cu=INR&tn=RoboVerse%20${planTier.toUpperCase()}%20Plan&tr=${razorpayOrderId}`;
      qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        upiUri
      )}&bgcolor=07110D&color=39FF6A&margin=2`;
    }

    const payment: StoredPayment = {
      id: paymentId,
      userId,
      userEmail,
      planTier,
      billingCycle,
      method,
      amountInr: priceBreakdown.totalPayableInr,
      basePriceInr: priceBreakdown.basePriceInr,
      discountInr: priceBreakdown.discountInr,
      taxablePriceInr: priceBreakdown.taxablePriceInr,
      gstAmountInr: priceBreakdown.gstAmountInr,
      couponCode: priceBreakdown.couponApplied?.code,
      status: 'created',
      razorpayOrderId,
      qrImageUrl,
      upiUri,
      qrExpiresAt,
      createdAt: timestamp,
      isTestMode,
    };

    paymentsStore.set(paymentId, payment);
    return payment;
  },

  verifyPlanPayment(params: {
    paymentId: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    simulated?: boolean;
  }): { success: boolean; payment: StoredPayment; subscription: StoredSubscription; error?: string } {
    const { paymentId, razorpayPaymentId, simulated } = params;
    const payment = paymentsStore.get(paymentId);

    if (!payment) {
      throw new Error(`Payment record not found: ${paymentId}`);
    }

    if (payment.status === 'captured') {
      const existingSub = subscriptionsStore.get(payment.userId);
      return {
        success: true,
        payment,
        subscription: existingSub!,
      };
    }

    // Check QR expiry
    if (payment.method === 'qr' && payment.qrExpiresAt) {
      if (new Date() > new Date(payment.qrExpiresAt)) {
        payment.status = 'failed';
        throw new Error('UPI QR code has expired. Please initiate a new payment.');
      }
    }

    // Generate GST invoice sequence
    const invoiceNumber = `INV-RV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const capturedAt = new Date().toISOString();

    payment.status = 'captured';
    payment.razorpayPaymentId = razorpayPaymentId || `pay_sim_${Date.now()}`;
    payment.invoiceNumber = invoiceNumber;
    payment.capturedAt = capturedAt;

    // Calculate subscription period
    const months = payment.billingCycle === 'yearly' ? 12 : 1;
    const periodStart = capturedAt;
    const periodEndDate = new Date();
    periodEndDate.setMonth(periodEndDate.getMonth() + months);
    const periodEnd = periodEndDate.toISOString();

    const subscription: StoredSubscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: payment.userId,
      planTier: payment.planTier,
      billingCycle: payment.billingCycle,
      status: 'active',
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      paymentId: payment.id,
      updatedAt: capturedAt,
    };

    subscriptionsStore.set(payment.userId, subscription);
    paymentsStore.set(paymentId, payment);

    return {
      success: true,
      payment,
      subscription,
    };
  },

  getPayment(paymentId: string): StoredPayment | undefined {
    return paymentsStore.get(paymentId);
  },

  getUserSubscription(userId: string): StoredSubscription | undefined {
    return subscriptionsStore.get(userId);
  },

  validateCouponCode(code: string, planTier: SubscriptionPlanTier, cycle: SubscriptionBillingCycle) {
    return validateCoupon(code, planTier, cycle);
  },
};
