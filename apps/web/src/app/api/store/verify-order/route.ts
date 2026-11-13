import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

function validSignature(orderId: string, paymentId: string, signature: string, secret: string) {
  const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest();
  let supplied: Buffer;
  try {
    supplied = Buffer.from(signature, 'hex');
  } catch {
    return false;
  }
  return supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
}

export async function POST(req: Request) {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();
    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { success: false, error: { message: 'Order ID and complete Razorpay payment details are required.' } },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json(
        { success: false, error: { code: 'PAYMENTS_NOT_CONFIGURED', message: 'Payment verification is not configured on this server.' } },
        { status: 503 }
      );
    }
    if (!validSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature, secret)) {
      return NextResponse.json(
        { success: false, error: { message: 'Payment signature is invalid.' } },
        { status: 401 }
      );
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_NOT_CONFIGURED', message: 'Order storage is not configured on this server.' } },
        { status: 503 }
      );
    }

    const admin = createSupabaseAdminClient();
    const { error } = await (admin.rpc as any)('finalize_order_payment', {
      p_order_id: orderId,
      p_razorpay_payment_id: razorpayPaymentId,
    });
    if (error) {
      console.error('Payment finalization failed:', error.message);
      return NextResponse.json(
        { success: false, error: { message: 'Payment was verified, but the order could not be updated. Please contact support.' } },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { orderId, status: 'PAID', paymentId: razorpayPaymentId, confirmedAt: new Date().toISOString(), receiptUrl: `/store/invoice/${orderId}` },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || 'Order verification failed' } },
      { status: 500 }
    );
  }
}
