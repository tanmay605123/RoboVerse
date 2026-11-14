import { NextRequest, NextResponse } from 'next/server';
import { paymentStorage } from '../paymentStorage';
import { SubscriptionPlanTier, SubscriptionBillingCycle } from '@roboverse/shared';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, planTier = 'plus', billingCycle = 'monthly' } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    const validation = paymentStorage.validateCouponCode(
      code,
      planTier as SubscriptionPlanTier,
      billingCycle as SubscriptionBillingCycle
    );

    return NextResponse.json({
      success: true,
      data: validation,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Coupon validation failed' },
      { status: 500 }
    );
  }
}
