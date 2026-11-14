import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Plan Pricing Configuration (GST inclusive)
const PLAN_PRICING: Record<string, { monthly: number; yearly: number }> = {
  free: { monthly: 0, yearly: 0 },
  plus: { monthly: 299, yearly: 2499 },
  pro: { monthly: 599, yearly: 4999 },
  institution: { monthly: 2499, yearly: 19999 },
};

// Valid Promo Coupons
const COUPONS: Record<string, { percent?: number; amount?: number; minOrder?: number }> = {
  ROBOFIRST: { percent: 15 },
  DIWALI2026: { percent: 20 },
  INNOVATOR: { amount: 500, minOrder: 2000 },
  INSTITUTE50: { percent: 50 },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    let userId = 'anon_student_test';
    let userEmail = 'student@roboverse.in';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      if (user) {
        userId = user.id;
        userEmail = user.email || userEmail;
      }
    }

    const body = await req.json();
    const {
      plan_id,
      planId,
      period = 'monthly',
      billingCycle,
      method = 'checkout',
      paymentMethod,
      coupon,
      couponCode,
      // Store checkout backwards compatibility
      amountInr: customAmount,
      orderId: storeOrderId,
      purpose = 'SUBSCRIPTION_PURCHASE',
    } = body;

    const targetPlan = (plan_id || planId || 'plus').toLowerCase();
    const targetPeriod = (billingCycle || period || 'monthly').toLowerCase();
    const targetMethod = (paymentMethod || method || 'checkout').toLowerCase();
    const targetCoupon = (couponCode || coupon || '').trim().toUpperCase();

    let payableAmountInr = 0;

    if (customAmount && customAmount > 0) {
      payableAmountInr = customAmount;
    } else {
      const planInfo = PLAN_PRICING[targetPlan] || PLAN_PRICING['plus'];
      let basePrice = targetPeriod === 'yearly' ? planInfo.yearly : planInfo.monthly;

      if (targetCoupon && COUPONS[targetCoupon]) {
        const c = COUPONS[targetCoupon];
        if (!c.minOrder || basePrice >= c.minOrder) {
          if (c.percent) {
            basePrice = Math.round(basePrice * (1 - c.percent / 100));
          } else if (c.amount) {
            basePrice = Math.max(0, basePrice - c.amount);
          }
        }
      }
      payableAmountInr = basePrice;
    }

    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID') || 'rzp_test_mock';
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET') || '';
    const isTestMode = !razorpayKeySecret || razorpayKeyId === 'rzp_test_mock';

    const timestamp = Date.now();
    let razorpayOrderId = `order_rp_deno_${timestamp}`;
    const paymentRecordId = `pay_${crypto.randomUUID ? crypto.randomUUID().slice(0, 12) : timestamp}`;

    // Create Razorpay Order if keys are configured
    if (!isTestMode) {
      const basicAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
      const rpRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(payableAmountInr * 100), // in paise
          currency: 'INR',
          receipt: `rcpt_${timestamp}`,
          notes: {
            userId,
            purpose,
            planTier: targetPlan,
            billingCycle: targetPeriod,
            method: targetMethod,
          },
        }),
      });

      if (rpRes.ok) {
        const rpData = await rpRes.json();
        razorpayOrderId = rpData.id;
      }
    }

    // Dynamic UPI QR details
    let qrImageUrl: string | undefined = undefined;
    let upiUri: string | undefined = undefined;
    const qrExpiryAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    if (targetMethod === 'qr') {
      upiUri = `upi://pay?pa=roboverse@icici&pn=RoboVerse%20Technologies&am=${payableAmountInr}&cu=INR&tn=RoboVerse%20${targetPlan.toUpperCase()}%20Plan&tr=${razorpayOrderId}`;
      // High-resolution SVG-compatible QR generator API
      qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUri)}&bgcolor=07110D&color=39FF6A&margin=2`;
    }

    // Store pending payment in Supabase database
    try {
      await supabase.from('payments').insert({
        id: crypto.randomUUID ? crypto.randomUUID() : undefined,
        user_id: userId,
        order_id: storeOrderId || null,
        method: targetMethod === 'qr' ? 'qr' : 'checkout',
        amount_inr: payableAmountInr,
        currency: 'INR',
        status: 'created',
        razorpay_order_id: razorpayOrderId,
        qr_image_url: qrImageUrl,
        qr_expiry_at: targetMethod === 'qr' ? qrExpiryAt : null,
      });
    } catch (_dbErr) {
      // Allow graceful operation in environments where mock storage handles it
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          paymentId: paymentRecordId,
          orderId: razorpayOrderId,
          razorpayOrderId,
          razorpayKeyId: isTestMode ? 'rzp_test_simulated_mode' : razorpayKeyId,
          amountInr: payableAmountInr,
          currency: 'INR',
          method: targetMethod,
          planTier: targetPlan,
          billingCycle: targetPeriod,
          qrImageUrl,
          upiUri,
          qrExpiresAt: qrExpiryAt,
          isTestMode,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Payment initiation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
