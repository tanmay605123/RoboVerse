import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

function isValidSignature(rawBody: string, signature: string, secret: string) {
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest();
  let supplied: Buffer;
  try {
    supplied = Buffer.from(signature, 'hex');
  } catch {
    return false;
  }
  return supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
}

export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { success: false, error: { code: 'WEBHOOK_NOT_CONFIGURED', message: 'Payment webhook is not configured.' } },
      { status: 503 }
    );
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';
    if (!isValidSignature(rawBody, signature, secret)) {
      return NextResponse.json({ success: false, error: { message: 'Invalid webhook signature.' } }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    if (typeof payload.id !== 'string' || typeof payload.event !== 'string') {
      return NextResponse.json({ success: false, error: { message: 'Webhook event ID and type are required.' } }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { data: existing, error: lookupError } = await (admin.from('webhook_events') as any)
      .select('id, processed').eq('id', payload.id).maybeSingle();
    if (lookupError) throw lookupError;
    if (existing?.processed) return NextResponse.json({ success: true, message: 'Already processed' });
    if (!existing) {
      const { error } = await (admin.from('webhook_events') as any).insert({
        id: payload.id, event_type: payload.event, payload, processed: false,
      });
      if (error) throw error;
    }

    if (payload.event === 'payment.captured' || payload.event === 'order.paid') {
      const payment = payload.payload?.payment?.entity;
      const razorpayPaymentId = payment?.id;
      const orderId = payment?.notes?.order_id || payload.payload?.order?.entity?.notes?.order_id;
      if (!razorpayPaymentId || !orderId) {
        return NextResponse.json({ success: false, error: { message: 'Payment event is missing its order reference.' } }, { status: 400 });
      }
      const { error } = await (admin.rpc as any)('finalize_order_payment', {
        p_order_id: orderId,
        p_razorpay_payment_id: razorpayPaymentId,
      });
      if (error) throw error;
      const { error: paymentError } = await (admin.from('payments') as any)
        .update({ status: 'completed', razorpay_payment_id: razorpayPaymentId, updated_at: new Date().toISOString() })
        .eq('order_id', orderId);
      if (paymentError) throw paymentError;
    }

    const { error: eventError } = await (admin.from('webhook_events') as any)
      .update({ processed: true, processed_at: new Date().toISOString() }).eq('id', payload.id);
    if (eventError) throw eventError;
    return NextResponse.json({ success: true, processed: true, eventId: payload.id, eventType: payload.event });
  } catch (err: any) {
    console.error('Webhook processing failed:', err?.message || err);
    return NextResponse.json(
      { success: false, error: { message: 'Webhook processing failed. The provider can retry this event.' } },
      { status: 503 }
    );
  }
}
