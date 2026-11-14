import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';
import { hmac } from 'https://deno.land/x/hmac@v2.0.1/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'x-razorpay-signature, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') || '';

    // Verify HMAC-SHA256 Signature if webhook secret is configured
    if (webhookSecret && signature) {
      const expectedSignature = hmac('sha256', webhookSecret, rawBody, 'utf8', 'hex');
      if (expectedSignature !== signature) {
        return new Response(
          JSON.stringify({ error: 'Invalid Razorpay Webhook Signature' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const event = JSON.parse(rawBody);
    const eventId = event.event_id || event.id || `evt_${Date.now()}`;
    const eventType = event.event;

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Idempotency check via webhook_events
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('event_id', eventId)
      .maybeSingle();

    if (existingEvent) {
      return new Response(
        JSON.stringify({ received: true, already_processed: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record webhook event in audit ledger
    await supabase.from('webhook_events').insert({
      event_id: eventId,
      event_type: eventType,
      payload: event,
      processed: false,
    });

    // Handle payment capture / order paid
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = event.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id || event.payload?.order?.entity?.id;
      const razorpayPaymentId = paymentEntity?.id || `pay_${Date.now()}`;
      const notes = paymentEntity?.notes || event.payload?.order?.entity?.notes || {};

      const userId = notes.userId || notes.user_id;
      const planTier = notes.planTier || notes.plan_id;
      const billingCycle = notes.billingCycle || 'monthly';
      const storeOrderId = notes.orderId;

      // 1. Subscription Plan Upgrade
      if (planTier && userId) {
        const periodMonths = billingCycle === 'yearly' ? 12 : 1;
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + periodMonths);

        // Update payment record to captured
        if (razorpayOrderId) {
          await supabase
            .from('payments')
            .update({
              status: 'captured',
              razorpay_payment_id: razorpayPaymentId,
              invoice_number: `INV-${Date.now().toString().slice(-6)}`,
            })
            .eq('razorpay_order_id', razorpayOrderId);
        }

        // Upsert subscription
        await supabase.from('subscriptions').upsert(
          {
            user_id: userId,
            plan_id: planTier,
            billing_cycle: billingCycle,
            status: 'active',
            razorpay_subscription_id: razorpayOrderId,
            current_period_start: startDate.toISOString(),
            current_period_end: endDate.toISOString(),
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

        // Upgrade profile plan
        await supabase
          .from('profiles')
          .update({
            active_plan_id: planTier,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        // Send confirmation email (Stubbed / Logged)
        console.log(`[STUBBED_MAILER] Subscription confirmation email sent to user ${userId} for plan ${planTier} (${billingCycle})`);
      }

      // 2. TechSavyyy Hardware Store Order Payment
      if (storeOrderId || (!planTier && razorpayOrderId)) {
        const { data: order } = await supabase
          .from('orders')
          .select('id')
          .eq('razorpay_order_id', razorpayOrderId)
          .maybeSingle();

        if (order) {
          await supabase.rpc('finalize_order_payment', {
            p_order_id: order.id,
            p_razorpay_payment_id: razorpayPaymentId,
          });
        }
      }
    }

    // Mark event processed
    await supabase
      .from('webhook_events')
      .update({ processed: true })
      .eq('event_id', eventId);

    return new Response(
      JSON.stringify({ received: true, status: 'processed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Webhook processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
