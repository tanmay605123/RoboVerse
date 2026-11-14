import { NextRequest, NextResponse } from 'next/server';
import {
  calculateAuthoritativeOrder,
  CATALOG_PRODUCTS_BY_ID,
  PlanTier,
  StoreOrder,
} from '@roboverse/shared';
import { saveOrder } from '../orderStorage';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    let userId = 'user_guest_student';
    let userPlanTier = PlanTier.FREE;
    let isMinor = false;
    let hasParentalConsent = true;

    // Decode basic JWT or check user
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          userId = payload.sub || payload.id || userId;
          if (payload.planTier) {
            userPlanTier = payload.planTier as PlanTier;
          }
          if (payload.isMinor !== undefined) {
            isMinor = !!payload.isMinor;
            hasParentalConsent = !!payload.parentalConsentAt;
          }
        }
      } catch (e) {
        // Continue with default
      }
    }

    const body = await req.json();
    const { items, shippingAddress, planTierOverride, isMinorOverride, parentalConsentOverride } = body;

    if (planTierOverride && Object.values(PlanTier).includes(planTierOverride)) {
      userPlanTier = planTierOverride;
    }
    if (isMinorOverride !== undefined) {
      isMinor = !!isMinorOverride;
    }
    if (parentalConsentOverride !== undefined) {
      hasParentalConsent = !!parentalConsentOverride;
    }

    if (!shippingAddress || !shippingAddress.addressLine1 || !shippingAddress.pincode) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_SHIPPING_ADDRESS',
            message: 'Valid delivery addressLine1 and pincode are required.',
          },
        },
        { status: 400 }
      );
    }

    // Authoritative Server-Side Calculation (Pricing ONLY from catalog)
    const calculation = calculateAuthoritativeOrder({
      userId,
      userPlanTier,
      isMinor,
      hasParentalConsent,
      items: items.map((i: any) => ({
        productId: i.productId || i.id,
        quantity: Number(i.quantity) || 1,
      })),
      shippingAddress,
      catalogProducts: CATALOG_PRODUCTS_BY_ID,
    });

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const razorpayOrderId = `order_rp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const newOrder: StoreOrder = {
      id: orderId,
      orderNumber: calculation.orderNumber,
      userId,
      status: 'processing',
      totalAmountInr: calculation.finalAmountInr,
      taxBreakdown: calculation.taxBreakdown,
      shippingAddress,
      shippingClass: calculation.shippingClass,
      razorpayOrderId,
      createdAt: new Date().toISOString(),
      items: calculation.items.map((it) => ({
        productId: it.productId,
        title: it.title,
        quantity: it.quantity,
        unitPriceInr: it.unitPriceInr,
        totalPriceInr: it.totalPriceInr,
      })),
    };

    saveOrder(newOrder);

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        orderNumber: calculation.orderNumber,
        razorpayOrderId,
        amountInr: calculation.finalAmountInr,
        currency: 'INR',
        taxBreakdown: calculation.taxBreakdown,
        shippingClass: calculation.shippingClass,
        shippingFeeInr: calculation.shippingFeeInr,
        estimatedDeliveryDays: calculation.estimatedDeliveryDays,
        ageRestrictionNotice: calculation.ageRestrictionNotice,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_roboverse_sandbox',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CHECKOUT_CALCULATION_FAILED',
          message: err.message || 'Failed to process checkout order.',
        },
      },
      { status: 400 }
    );
  }
}
