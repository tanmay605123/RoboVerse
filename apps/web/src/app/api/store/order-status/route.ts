import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return NextResponse.json({ success: false, error: { message: 'Sign in to check an order.' } }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get('orderId');
    const orderNumber = url.searchParams.get('orderNumber');
    if (!orderId && !orderNumber) {
      return NextResponse.json({ success: false, error: { message: 'Order ID is required.' } }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { data: { user }, error: authError } = await admin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ success: false, error: { message: 'Your session expired. Sign in again.' } }, { status: 401 });
    }

    let query = (admin.from('orders') as any).select('id, order_number, status, razorpay_payment_id').eq('user_id', user.id);
    query = orderId ? query.eq('id', orderId) : query.eq('order_number', orderNumber);
    const { data: order, error } = await query.maybeSingle();
    if (error) throw error;
    if (!order) return NextResponse.json({ success: false, error: { message: 'Order not found.' } }, { status: 404 });

    const status = String(order.status).toLowerCase();
    return NextResponse.json({
      success: true,
      data: { orderId: order.id, orderNumber: order.order_number, status, isPaid: status === 'paid', paymentId: order.razorpay_payment_id },
    });
  } catch (err: any) {
    console.error('Order status check failed:', err?.message || err);
    return NextResponse.json({ success: false, error: { message: 'Order status is temporarily unavailable.' } }, { status: 503 });
  }
}
