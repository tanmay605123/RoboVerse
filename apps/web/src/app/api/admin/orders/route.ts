import { NextRequest, NextResponse } from 'next/server';
import { orderStore } from '../../store/orderStorage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const orders = Array.from(new Set(orderStore.values())).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const sampleOrders = orders.length > 0 ? orders : [
      {
        id: 'ord_sample_starter_01',
        orderNumber: 'TS-2026-ST8992',
        userId: 'usr_student_tanmay',
        status: 'delivered',
        totalAmountInr: 1199.00,
        taxBreakdown: {
          grossAmountInr: 1199.00,
          baseAmountInr: 1016.10,
          totalTaxAmountInr: 182.90,
          cgstAmountInr: 91.45,
          sgstAmountInr: 91.45,
          gstRatePercentage: 18,
          discountAmountInr: 0,
          planTier: 'PRO',
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
      { success: false, error: { message: 'Failed to retrieve orders.' } },
      { status: 500 }
    );
  }
}
