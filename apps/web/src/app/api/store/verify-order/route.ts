import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!orderId && !razorpayOrderId) {
      return NextResponse.json(
        { success: false, error: { message: 'orderId or razorpayOrderId is required' } },
        { status: 400 }
      );
    }

    const paymentId = razorpayPaymentId || `pay_rzp_${Date.now()}`;

    // Update in Supabase via RPC if available
    if (orderId && !orderId.startsWith('ord_')) {
      try {
        await (supabase.rpc as any)('finalize_order_payment', {
          p_order_id: orderId,
          p_razorpay_payment_id: paymentId,
        });

        await (supabase.from('payments') as any)
          .update({
            status: 'completed',
            razorpay_payment_id: paymentId,
            razorpay_signature: razorpaySignature || 'dev_mock_sig',
            updated_at: new Date().toISOString(),
          })
          .eq('order_id', orderId);
      } catch (dbErr) {
        console.warn('Database finalize_order_payment call warning:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: orderId || `ord_${Date.now()}`,
        status: 'PAID',
        paymentId,
        confirmedAt: new Date().toISOString(),
        receiptUrl: `/store/invoice/${orderId}`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || 'Order verification failed' } },
      { status: 500 }
    );
  }
}
