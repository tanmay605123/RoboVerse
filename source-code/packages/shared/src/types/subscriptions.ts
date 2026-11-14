/**
 * RoboVerse Subscriptions, Plans & Payments Type Definitions
 */

export type SubscriptionPlanTier = 'free' | 'plus' | 'pro' | 'institution';

export type SubscriptionBillingCycle = 'monthly' | 'yearly';

export interface PlanFeature {
  name: string;
  free: string | boolean;
  plus: string | boolean;
  pro: string | boolean;
  institution: string | boolean;
  category: 'core' | 'rituu' | 'labs' | 'hardware' | 'support';
}

export interface PlanDetails {
  id: SubscriptionPlanTier;
  name: string;
  tagline: string;
  badge?: string;
  priceInrMonthly: number;
  priceInrYearly: number;
  savingsYearlyPercent: number;
  popular?: boolean;
  maxSavedProjects: number; // -1 for unlimited
  rituuDailyQuestions: number; // -1 for unlimited
  rituuPhotoDebugging: boolean;
  guidedLessonsCount: number;
  robotTemplatesUnlocked: number;
  arenasUnlocked: number;
  storeDiscountPercent: number;
  certificateIssuance: boolean;
  rosMatlabExport: boolean;
  customComponents: boolean;
  highlights: string[];
}

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  discountPercent?: number;
  discountAmountInr?: number;
  discountAppliedInr: number;
  finalPriceInr: number;
  message: string;
}

export interface PaymentInitiationRequest {
  planId: SubscriptionPlanTier;
  billingCycle: SubscriptionBillingCycle;
  paymentMethod: 'checkout' | 'qr';
  couponCode?: string;
}

export interface PaymentInitiationResponse {
  success: boolean;
  paymentId: string;
  orderId: string;
  amountInr: number;
  currency: 'INR';
  method: 'checkout' | 'qr';
  planTier: SubscriptionPlanTier;
  billingCycle: SubscriptionBillingCycle;
  razorpayOrderId?: string;
  razorpayKeyId?: string;
  qrImageUrl?: string;
  upiUri?: string;
  qrExpiresAt?: string;
  isTestMode: boolean;
}

export interface PaymentVerificationRequest {
  paymentId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  simulated?: boolean;
}

export interface PaymentVerificationResponse {
  success: boolean;
  planTier: SubscriptionPlanTier;
  status: 'captured' | 'failed';
  invoiceNumber: string;
  currentPeriodEnd: string;
  message: string;
}

export interface SubscriptionRecord {
  id: string;
  userId: string;
  planId: SubscriptionPlanTier;
  billingCycle: SubscriptionBillingCycle;
  status: 'active' | 'cancelled' | 'expired';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
}
