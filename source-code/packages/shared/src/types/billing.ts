import { z } from 'zod';
import { BillingCycle, PlanTier } from './plans';

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  TRIALING = 'TRIALING',
  PAUSED = 'PAUSED',
  HALTED = 'HALTED',
  CANCELLED = 'CANCELLED',
  GRACE_PERIOD = 'GRACE_PERIOD',
}

export enum PaymentMethodType {
  UPI = 'UPI',
  UPI_AUTOPAY = 'UPI_AUTOPAY',
  CARD = 'CARD',
  NETBANKING = 'NETBANKING',
  WALLET = 'WALLET',
}

// 18% GST Breakdown
export interface GstTaxBreakdown {
  grossAmountInr: number;    // Total paid by student (GST inclusive)
  baseAmountInr: number;     // Amount excluding GST (gross / 1.18)
  totalTaxAmountInr: number; // Gross - Base
  cgstAmountInr: number;     // 9% if intra-state
  sgstAmountInr: number;     // 9% if intra-state
  igstAmountInr: number;     // 18% if inter-state
  gstRatePercentage: number; // 18%
  isInterState: boolean;
}

export function calculateGst(grossAmountInr: number, isInterState: boolean = false): GstTaxBreakdown {
  if (grossAmountInr <= 0) {
    return {
      grossAmountInr: 0,
      baseAmountInr: 0,
      totalTaxAmountInr: 0,
      cgstAmountInr: 0,
      sgstAmountInr: 0,
      igstAmountInr: 0,
      gstRatePercentage: 18,
      isInterState,
    };
  }

  // Base price = gross / 1.18 rounded to 2 decimal places
  const baseAmountInr = Number((grossAmountInr / 1.18).toFixed(2));
  const totalTaxAmountInr = Number((grossAmountInr - baseAmountInr).toFixed(2));

  let cgstAmountInr = 0;
  let sgstAmountInr = 0;
  let igstAmountInr = 0;

  if (isInterState) {
    igstAmountInr = totalTaxAmountInr;
  } else {
    cgstAmountInr = Number((totalTaxAmountInr / 2).toFixed(2));
    sgstAmountInr = Number((totalTaxAmountInr - cgstAmountInr).toFixed(2));
  }

  return {
    grossAmountInr,
    baseAmountInr,
    totalTaxAmountInr,
    cgstAmountInr,
    sgstAmountInr,
    igstAmountInr,
    gstRatePercentage: 18,
    isInterState,
  };
}

export interface GstInvoice {
  id: string;
  invoiceNumber: string; // e.g. RV-INV-2026-00429
  orderId: string;
  userId: string;
  studentId: string;
  customerName: string;
  customerEmail: string;
  customerState: string;
  customerGstin?: string;
  companyName: string; // "RoboVerse Technologies Pvt Ltd"
  companyGstin: string; // "07AAAAA0000A1Z5"
  companyAddress: string;
  companyHsnCode: string; // "999293" (Commercial training and education services)
  items: Array<{
    description: string;
    billingCycle: BillingCycle;
    quantity: number;
    unitPrice: number;
    grossPrice: number;
  }>;
  tax: GstTaxBreakdown;
  paymentMethod: PaymentMethodType;
  paymentId: string;
  issuedAt: string;
  status: 'PAID' | 'REFUNDED' | 'VOID';
}

// Razorpay Checkout Request
export const CreateSubscriptionOrderInputSchema = z.object({
  planTier: z.nativeEnum(PlanTier),
  billingCycle: z.nativeEnum(BillingCycle),
  couponCode: z.string().optional(),
  startFreeTrial: z.boolean().default(false), // 7-day Pro trial with mandate
  customerState: z.string().default('Delhi'),
  customerGstin: z.string().optional(),
});

export type CreateSubscriptionOrderInput = z.infer<typeof CreateSubscriptionOrderInputSchema>;

// Razorpay Verification Input
export const VerifyRazorpayPaymentInputSchema = z.object({
  razorpayOrderId: z.string().min(5),
  razorpayPaymentId: z.string().min(5),
  razorpaySignature: z.string().min(10),
  subscriptionId: z.string().optional(),
});

export type VerifyRazorpayPaymentInput = z.infer<typeof VerifyRazorpayPaymentInputSchema>;

// Razorpay Webhook Event Types
export type RazorpayWebhookEvent =
  | 'subscription.authenticated'
  | 'subscription.activated'
  | 'subscription.charged'
  | 'subscription.completed'
  | 'subscription.updated'
  | 'subscription.pending'
  | 'subscription.halted'
  | 'subscription.cancelled'
  | 'subscription.paused'
  | 'subscription.resumed'
  | 'payment.captured'
  | 'payment.failed';
