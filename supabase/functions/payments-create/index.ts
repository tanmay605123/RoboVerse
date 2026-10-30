import { corsHeaders } from '../_shared/cors.ts';

interface ShippingAddressInput {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

interface CreatePaymentRequest {
  type: 'order' | 'subscription';
  method?: 'checkout' | 'qr';
  addressId?: string;
  shippingAddress?: ShippingAddressInput;
  couponCode?: string;
  planId?: string;
}

// Generate dynamic UPI QR string (NPCI specification)
function generateUpiString(params: {
  pa: string; // Payee address (VPA)
  pn: string; // Payee name
  am: number; // Amount in INR
  tr: string; // Transaction reference ID (Order Number)
  tn: string; // Transaction note
}): string {
  const vpa = encodeURIComponent(params.pa);
  const name = encodeURIComponent(params.pn);
  const note = encodeURIComponent(params.tn);
  return `upi://pay?pa=${vpa}&pn=${name}&am=${params.am.toFixed(2)}&tr=${params.tr}&cu=INR&tn=${note}`;
}

// Simple base64 SVG QR placeholder generator for mock/sandbox environments
function generateMockQrDataUrl(upiString: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <rect width="200" height="200" fill="#0A1813" rx="12"/>
    <rect x="20" y="20" width="50" height="50" fill="#39FF6A" rx="4"/>
    <rect x="30" y="30" width="30" height="30" fill="#0A1813" rx="2"/>
    <rect x="36" y="36" width="18" height="18" fill="#39FF6A" rx="1"/>
    <rect x="130" y="20" width="50" height="50" fill="#39FF6A" rx="4"/>
    <rect x="140" y="30" width="30" height="30" fill="#0A1813" rx="2"/>
    <rect x="146" y="36" width="18" height="18" fill="#39FF6A" rx="1"/>
    <rect x="20" y="130" width="50" height="50" fill="#39FF6A" rx="4"/>
    <rect x="30" y="140" width="30" height="30" fill="#0A1813" rx="2"/>
    <rect x="36" y="146" width="18" height="18" fill="#39FF6A" rx="1"/>
    <g fill="#7FE7D6">
      <rect x="80" y="25" width="12" height="12" rx="2"/>
      <rect x="100" y="35" width="14" height="8" rx="2"/>
      <rect x="85" y="55" width="25" height="10" rx="2"/>
      <rect x="25" y="85" width="10" height="25" rx="2"/>
      <rect x="45" y="95" width="20" height="10" rx="2"/>
      <rect x="80" y="80" width="40" height="40" rx="4"/>
      <rect x="90" y="90" width="20" height="20" fill="#0A1813" rx="2"/>
      <rect x="95" y="95" width="10" height="10" fill="#39FF6A" rx="1"/>
      <rect x="135" y="85" width="12" height="20" rx="2"/>
      <rect x="155" y="95" width="20" height="12" rx="2"/>
      <rect x="85" y="135" width="18" height="14" rx="2"/>
      <rect x="110" y="140" width="16" height="25" rx="2"/>
      <rect x="135" y="135" width="35" height="12" rx="2"/>
      <rect x="140" y="155" width="20" height="20" rx="2"/>
      <rect x="165" y="145" width="12" height="25" rx="2"/>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID') || 'rzp_test_mock_roboverse';
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Server misconfiguration: missing Supabase environment variables' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { createClient } = await import('npm:@supabase/supabase-js@2');
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user JWT token
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid or expired student credentials' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Authenticated client running with user identity for RPC execution
    const userClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const body: CreatePaymentRequest = await req.json();
    const { type = 'order', method = 'checkout', couponCode } = body;

    if (type === 'order') {
      let addressId = body.addressId;

      // If user passed address details directly without addressId, save to addresses table
      if (!addressId && body.shippingAddress) {
        const addr = body.shippingAddress;
        const { data: newAddr, error: addrErr } = await supabaseAdmin
          .from('addresses')
          .insert({
            user_id: user.id,
            full_name: addr.fullName,
            phone: addr.phone,
            address_line1: addr.addressLine1,
            address_line2: addr.addressLine2 || null,
            city: addr.city,
            state: addr.state,
            pincode: addr.pincode,
            country: addr.country || 'India',
            is_default: true,
          })
          .select('id')
          .single();

        if (addrErr || !newAddr) {
          return new Response(
            JSON.stringify({ error: `Failed to save shipping address: ${addrErr?.message || 'Unknown'}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        addressId = newAddr.id;
      }

      if (!addressId) {
        // Try to fetch user's default address
        const { data: defaultAddr } = await supabaseAdmin
          .from('addresses')
          .select('id')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (defaultAddr) {
          addressId = defaultAddr.id;
        } else {
          return new Response(
            JSON.stringify({ error: 'Shipping address is required to create an order.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Execute canonical Server-Priced Order Creation RPC
      // Prices are computed strictly from database rows, stock checked, age restrictions enforced
      const { data: orderResult, error: orderErr } = await userClient.rpc('create_order_from_cart', {
        p_address_id: addressId,
        p_coupon_code: couponCode || null,
      });

      if (orderErr) {
        return new Response(
          JSON.stringify({ error: orderErr.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const {
        order_id: orderId,
        order_number: orderNumber,
        subtotal_inr: subtotalInr,
        discount_inr: discountInr,
        gst_amount_inr: gstAmountInr,
        total_inr: totalInr,
      } = orderResult;

      const amountInPaise = Math.round(totalInr * 100);
      let razorpayOrderId: string | null = null;
      let qrImageUrl: string | null = null;
      let qrString: string | null = null;
      let qrId: string | null = null;
      const qrExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins expiry

      // Razorpay API interaction
      if (razorpayKeySecret && !razorpayKeyId.includes('mock')) {
        const basicAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);

        if (method === 'checkout') {
          // Standard Razorpay Order Creation
          const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Basic ${basicAuth}`,
            },
            body: JSON.stringify({
              amount: amountInPaise,
              currency: 'INR',
              receipt: orderNumber,
              notes: {
                order_id: orderId,
                user_id: user.id,
                type: 'order',
              },
            }),
          });

          if (rzpRes.ok) {
            const rzpData = await rzpRes.json();
            razorpayOrderId = rzpData.id;
          } else {
            console.warn('Razorpay API error, falling back to mock sandbox order id');
            razorpayOrderId = `order_${orderNumber.replace(/[^a-zA-Z0-9]/g, '')}`;
          }
        } else if (method === 'qr') {
          // Dynamic Single-Use UPI QR Code API
          const rzpQrRes = await fetch('https://api.razorpay.com/v1/payments/qr_codes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Basic ${basicAuth}`,
            },
            body: JSON.stringify({
              type: 'upi_qr',
              name: `RoboVerse ${orderNumber}`,
              usage: 'single_use',
              fixed_amount: true,
              payment_amount: amountInPaise,
              description: `TechSavyyy Order ${orderNumber}`,
              close_by: Math.floor(Date.now() / 1000) + 900,
              notes: {
                order_id: orderId,
                user_id: user.id,
              },
            }),
          });

          if (rzpQrRes.ok) {
            const qrData = await rzpQrRes.json();
            qrId = qrData.id;
            qrImageUrl = qrData.image_url;
            qrString = qrData.qr_code_url || generateUpiString({
              pa: 'techsavyyy@razorpay',
              pn: 'RoboVerse TechSavyyy',
              am: totalInr,
              tr: orderNumber,
              tn: `RoboVerse Order ${orderNumber}`,
            });
          }
        }
      }

      // Fallback sandbox / dev values
      if (!razorpayOrderId && method === 'checkout') {
        razorpayOrderId = `order_rv_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      }

      if (method === 'qr' && !qrString) {
        qrString = generateUpiString({
          pa: 'techsavyyy@razorpay',
          pn: 'RoboVerse TechSavyyy',
          am: totalInr,
          tr: orderNumber,
          tn: `RoboVerse Order ${orderNumber}`,
        });
        qrImageUrl = generateMockQrDataUrl(qrString);
        qrId = `qr_rv_${Date.now()}`;
      }

      // Record payment attempt in payments table
      const { data: paymentRecord, error: payErr } = await supabaseAdmin
        .from('payments')
        .insert({
          user_id: user.id,
          order_id: orderId,
          method,
          amount_inr: totalInr,
          gst_amount_inr: gstAmountInr,
          status: 'pending',
          razorpay_order_id: razorpayOrderId,
          qr_id: qrId,
          qr_image_url: qrImageUrl,
          qr_expires_at: method === 'qr' ? qrExpiresAt : null,
          metadata: {
            order_number: orderNumber,
            subtotal_inr: subtotalInr,
            discount_inr: discountInr,
            upi_string: qrString,
          },
        })
        .select()
        .single();

      if (payErr) {
        console.error('Failed to log payment row:', payErr);
      }

      return new Response(
        JSON.stringify({
          success: true,
          order_id: orderId,
          order_number: orderNumber,
          payment_id: paymentRecord?.id,
          amount_inr: totalInr,
          subtotal_inr: subtotalInr,
          discount_inr: discountInr,
          gst_amount_inr: gstAmountInr,
          method,
          razorpay_order_id: razorpayOrderId,
          razorpay_key_id: razorpayKeyId,
          qr_id: qrId,
          qr_string: qrString,
          qr_image_url: qrImageUrl,
          qr_expires_at: qrExpiresAt,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (type === 'subscription') {
      const planId = body.planId;
      if (!planId) {
        return new Response(
          JSON.stringify({ error: 'planId is required for subscription creation.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: plan, error: planErr } = await supabaseAdmin
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planErr || !plan) {
        return new Response(
          JSON.stringify({ error: 'Plan not found.' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const amountInPaise = Math.round(plan.price_inr * 100);
      const subNumber = `SUB-${Date.now()}`;
      let razorpayOrderId = `order_sub_${Date.now()}`;

      // Insert subscription record in 'pending' status
      const { data: subRow } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_id: plan.id,
          status: 'pending',
        })
        .select('id')
        .single();

      // Record payment row
      await supabaseAdmin.from('payments').insert({
        user_id: user.id,
        subscription_id: subRow?.id,
        plan_id: plan.id,
        method,
        amount_inr: plan.price_inr,
        status: 'pending',
        razorpay_order_id: razorpayOrderId,
      });

      return new Response(
        JSON.stringify({
          success: true,
          type: 'subscription',
          plan_id: plan.id,
          plan_name: plan.name,
          amount_inr: plan.price_inr,
          razorpay_order_id: razorpayOrderId,
          razorpay_key_id: razorpayKeyId,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unsupported payment type' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('payments-create error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal payment error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
