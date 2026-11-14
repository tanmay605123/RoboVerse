import { NextRequest, NextResponse } from 'next/server';
import { getOrdersForUser } from '../orderStorage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    let userId = 'user_guest_student';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          userId = payload.sub || payload.id || userId;
        }
      } catch (e) {
        // fallback
      }
    }

    const orders = getOrdersForUser(userId);

    // If no past orders found, return an initial sample order for student preview
    const sampleOrders = orders.length > 0 ? orders : [
      {
        id: 'ord_sample_starter_01',
        orderNumber: 'TS-2026-ST8992',
        userId,
        status: 'delivered',
        totalAmountInr: 1199.00,
        taxBreakdown: {
          grossAmountInr: 1199.00,
          baseAmountInr: 1016.10,
          totalTaxAmountInr: 182.90,
          cgstAmountInr: 91.45,
          sgstAmountInr: 91.45,
          igstAmountInr: 0,
          gstRatePercentage: 18,
          discountAmountInr: 0,
          discountPercentage: 0,
          planTier: 'FREE',
        },
        shippingAddress: {
          addressLine1: 'Hostel 4, Room 302, IIT Delhi Campus',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110016',
        },
        shippingClass: 'standard',
        invoiceNumber: 'TS-INV-2026-00481',
        invoicePdfUrl: '/api/store/invoice/TS-INV-2026-00481',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        items: [
          {
            productId: 'prod_kit_01_arduino_starter',
            title: 'RoboVerse Arduino Starter Kit',
            quantity: 1,
            unitPriceInr: 1199.00,
            totalPriceInr: 1199.00,
          },
        ],
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        orders: sampleOrders,
        total: sampleOrders.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ORDERS_FAILED',
          message: err.message || 'Failed to retrieve past store orders.',
        },
      },
      { status: 500 }
    );
  }
}
