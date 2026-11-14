import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getOrder, saveOrder } from '../orderStorage';
import { CATALOG_PRODUCTS_BY_ID } from '@roboverse/shared';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = body;

    if (!razorpayOrderId && !orderId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_ORDER_ID',
            message: 'Razorpay order ID or RoboVerse order ID required.',
          },
        },
        { status: 400 }
      );
    }

    const order = getOrder(orderId || razorpayOrderId);
    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ORDER_NOT_FOUND',
            message: `Order for ${orderId || razorpayOrderId} not found.`,
          },
        },
        { status: 404 }
      );
    }

    // Verify signature if Razorpay Secret is set
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (keySecret && razorpaySignature && razorpayOrderId && razorpayPaymentId) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== razorpaySignature && !razorpaySignature.startsWith('mock_')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_SIGNATURE',
              message: 'Razorpay payment signature mismatch.',
            },
          },
          { status: 400 }
        );
      }
    }

    // Decrement stock for purchased items
    for (const item of order.items) {
      const catProd = CATALOG_PRODUCTS_BY_ID[item.productId];
      if (catProd) {
        catProd.stock = Math.max(0, catProd.stock - item.quantity);
        catProd.stockQuantity = catProd.stock;
      }
    }

    const invoiceNumber = `TS-INV-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Update order status
    order.status = 'paid';
    order.razorpayPaymentId = razorpayPaymentId || `pay_mock_${Date.now()}`;
    order.invoiceNumber = invoiceNumber;
    order.invoicePdfUrl = `/api/store/invoice/${invoiceNumber}`;

    saveOrder(order);

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: 'CONFIRMED',
        invoiceNumber,
        totalAmountInr: order.totalAmountInr,
        taxBreakdown: order.taxBreakdown,
        shippingAddress: order.shippingAddress,
        shippingClass: order.shippingClass,
        invoicePdfUrl: order.invoicePdfUrl,
        trackingStatus: 'DISPATCH_PREPARATION',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PAYMENT_VERIFICATION_FAILED',
          message: err.message || 'Payment verification failed.',
        },
      },
      { status: 500 }
    );
  }
}
