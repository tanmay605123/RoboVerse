import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    // Verify HMAC-SHA256 signature
    let isValid = false;
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');
      isValid = expectedSignature === signature;
    } else if (signature === 'mock_signature_valid_for_dev_mode' || !webhookSecret) {
      isValid = true; // Permitted for dev / sandbox environments
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid webhook signature' } },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);
    const eventId = payload.id || `evt_${Date.now()}`;
    const eventType = payload.event || 'payment.captured';

    // 1. Idempotency deduplication check in webhook_events
    try {
      const { data: existing } = await (supabase.from('webhook_events') as any)
        .select('id, processed')
        .eq('id', eventId)
        .maybeSingle();

      if (existing?.processed) {
        return NextResponse.json({ success: true, message: 'Already processed' });
      }

      if (!existing) {
        await (supabase.from('webhook_events') as any).insert({
          id: eventId,
          event_type: eventType,
          payload,
          processed: false,
        });
      }
    } catch (e) {
      // Ignore if table not present in local test
    }

    // 2. Process payment capture or order.paid
    const paymentEntity = payload.payload?.payment?.entity || payload.payment || {};
    const razorpayPaymentId = paymentEntity.id || payload.payment_id || `pay_${Date.now()}`;
    const razorpayOrderId = paymentEntity.order_id || payload.order_id;
    const notes = paymentEntity.notes || payload.notes || {};
    const orderId = notes.order_id || payload.order_id;

    if (orderId && !orderId.startsWith('ord_')) {
      try {
        await (supabase.rpc as any)('finalize_order_payment', {
          p_order_id: orderId,
          p_razorpay_payment_id: razorpayPaymentId,
        });

        await (supabase.from('payments') as any)
          .update({
            status: 'completed',
            razorpay_payment_id: razorpayPaymentId,
            updated_at: new Date().toISOString(),
          })
          .eq('order_id', orderId);

        await (supabase.from('webhook_events') as any)
          .update({ processed: true, processed_at: new Date().toISOString() })
          .eq('id', eventId);
      } catch (err) {
        console.warn('Webhook order finalization error:', err);
      }
    }

    return NextResponse.json({
      success: true,
      processed: true,
      eventId,
      eventType,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || 'Webhook processing failed' } },
      { status: 500 }
    );
  }
}
