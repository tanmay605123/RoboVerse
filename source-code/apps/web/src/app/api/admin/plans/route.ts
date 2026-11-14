import { NextRequest, NextResponse } from 'next/server';
import { recordAuditLog } from '../adminStorage';

export const dynamic = 'force-dynamic';

const LIVE_PLANS = [
  {
    id: 'plan_free',
    name: 'Free Rookie',
    tier: 'FREE',
    pricing: [{ cycle: 'MONTHLY', priceInrInclusiveGst: 0, label: 'Free Forever' }],
    features: {
      rituuDailyTextMessageLimit: 20,
      rituuDailyPhotoAnalysisLimit: 2,
      storeDiscountPercent: 0,
      savedProjectsLimit: 5,
    },
  },
  {
    id: 'plan_plus',
    name: 'Plus Builder',
    tier: 'PLUS',
    pricing: [{ cycle: 'MONTHLY', priceInrInclusiveGst: 299, label: '₹299 / month' }],
    features: {
      rituuDailyTextMessageLimit: 100,
      rituuDailyPhotoAnalysisLimit: 20,
      storeDiscountPercent: 5,
      savedProjectsLimit: 50,
    },
  },
  {
    id: 'plan_pro',
    name: 'Pro Robotics Engineer',
    tier: 'PRO',
    pricing: [{ cycle: 'MONTHLY', priceInrInclusiveGst: 999, label: '₹999 / month' }],
    features: {
      rituuDailyTextMessageLimit: 500,
      rituuDailyPhotoAnalysisLimit: 100,
      storeDiscountPercent: 10,
      savedProjectsLimit: 9999,
    },
  },
  {
    id: 'plan_institution',
    name: 'Institution & School Lab',
    tier: 'INSTITUTION',
    pricing: [{ cycle: 'YEARLY', priceInrInclusiveGst: 49999, label: '₹49,999 / year' }],
    features: {
      rituuDailyTextMessageLimit: 10000,
      rituuDailyPhotoAnalysisLimit: 2000,
      storeDiscountPercent: 15,
      savedProjectsLimit: 99999,
    },
  },
];

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    data: LIVE_PLANS,
  });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId, pricing, features } = body;

    const plan = LIVE_PLANS.find((p) => p.id === planId);
    if (!plan) {
      return NextResponse.json(
        { success: false, error: { code: 'PLAN_NOT_FOUND', message: 'Plan not found.' } },
        { status: 404 }
      );
    }

    if (pricing) plan.pricing = pricing;
    if (features) plan.features = { ...plan.features, ...features };

    recordAuditLog({
      adminId: 'usr_admin_master',
      adminEmail: 'admin@roboverse.tech',
      action: 'PLAN_PRICING_UPDATED',
      targetType: 'PLAN',
      targetId: planId,
      details: { pricing, features },
    });

    return NextResponse.json({
      success: true,
      data: plan,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_FAILED', message: err.message || 'Plan update failed.' } },
      { status: 500 }
    );
  }
}
