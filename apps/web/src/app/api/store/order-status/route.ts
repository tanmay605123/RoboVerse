import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get('orderId');
    const orderNumber = url.searchParams.get('orderNumber');

    if (!orderId && !orderNumber) {
      return NextResponse.json(
        { success: false, error: { message: 'orderId or orderNumber is required' } },
        { status: 400 }
      );
    }

    let status = 'pending';
    let paymentId = null;

    if (orderId && !orderId.startsWith('ord_')) {
      const { data: order } = await (supabase.from('orders') as any)
        .select('id, status, razorpay_payment_id')
        .eq('id', orderId)
        .maybeSingle();

      if (order) {
        status = order.status;
        paymentId = order.razorpay_payment_id;
      }
    } else if (orderNumber) {
      const { data: order } = await (supabase.from('orders') as any)
        .select('id, status, razorpay_payment_id')
        .eq('order_number', orderNumber)
        .maybeSingle();

      if (order) {
        status = order.status;
        paymentId = order.razorpay_payment_id;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        orderNumber,
        status: status.toLowerCase(),
        isPaid: status.toLowerCase() === 'paid',
        paymentId,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || 'Status check failed' } },
      { status: 500 }
    );
  }
}
