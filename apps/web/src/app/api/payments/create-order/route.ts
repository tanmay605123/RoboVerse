import { NextRequest, NextResponse } from 'next/server';
import { paymentStorage } from '../paymentStorage';
import { SubscriptionPlanTier, SubscriptionBillingCycle } from '@roboverse/shared';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      planId,
      billingCycle = 'monthly',
      paymentMethod = 'checkout',
      couponCode,
      userId = 'stu_demo_001',
      userEmail = 'student@roboverse.in',
    } = body;

    if (!planId || !['free', 'plus', 'pro', 'institution'].includes(planId)) {
      return NextResponse.json(
        { error: 'Invalid or missing planId. Must be free, plus, pro, or institution.' },
        { status: 400 }
      );
    }

    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return NextResponse.json(
        { error: 'Invalid billingCycle. Must be monthly or yearly.' },
        { status: 400 }
      );
    }

    if (!['checkout', 'qr'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid paymentMethod. Must be checkout or qr.' },
        { status: 400 }
      );
    }

    const payment = paymentStorage.createPlanPayment({
      userId,
      userEmail,
      planTier: planId as SubscriptionPlanTier,
      billingCycle: billingCycle as SubscriptionBillingCycle,
      method: paymentMethod as 'checkout' | 'qr',
      couponCode,
    });

    return NextResponse.json({
      success: true,
      data: {
        paymentId: payment.id,
        orderId: payment.razorpayOrderId,
        amountInr: payment.amountInr,
        basePriceInr: payment.basePriceInr,
        discountInr: payment.discountInr,
        taxablePriceInr: payment.taxablePriceInr,
        gstAmountInr: payment.gstAmountInr,
        couponCode: payment.couponCode,
        currency: 'INR',
        method: payment.method,
        planTier: payment.planTier,
        billingCycle: payment.billingCycle,
        razorpayOrderId: payment.razorpayOrderId,
        razorpayKeyId: payment.isTestMode
          ? 'rzp_test_simulated_mode'
          : process.env.RAZORPAY_KEY_ID || 'rzp_test_simulated_mode',
        qrImageUrl: payment.qrImageUrl,
        upiUri: payment.upiUri,
        qrExpiresAt: payment.qrExpiresAt,
        isTestMode: payment.isTestMode,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to initiate plan payment order' },
      { status: 500 }
    );
  }
}
