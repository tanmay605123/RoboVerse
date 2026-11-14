import { NextRequest, NextResponse } from 'next/server';
import { couponStore, recordAuditLog } from '../adminStorage';
import { AdminCoupon } from '@roboverse/shared';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      coupons: couponStore,
      total: couponStore.length,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, discountPercentage = 20, maxUses = 100 } = body;

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_COUPON', message: 'Coupon code is required.' },
        },
        { status: 400 }
      );
    }

    const newCoupon: AdminCoupon = {
      id: `cpn_${Date.now()}`,
      code: code.trim().toUpperCase(),
      discountPercentage: Number(discountPercentage),
      maxUses: Number(maxUses),
      usedCount: 0,
      active: true,
      createdAt: new Date().toISOString(),
    };

    couponStore.unshift(newCoupon);

    recordAuditLog({
      adminId: 'usr_admin_master',
      adminEmail: 'admin@roboverse.tech',
      action: 'COUPON_CREATED',
      targetType: 'COUPON',
      targetId: newCoupon.code,
      details: { discountPercentage, maxUses },
    });

    return NextResponse.json({
      success: true,
      data: newCoupon,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'COUPON_CREATION_FAILED', message: err.message || 'Failed to create coupon.' },
      },
      { status: 500 }
    );
  }
}
