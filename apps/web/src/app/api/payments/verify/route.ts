import { NextRequest, NextResponse } from 'next/server';
import { paymentStorage } from '../paymentStorage';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature, simulated } = body;

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Missing required field: paymentId' },
        { status: 400 }
      );
    }

    const result = paymentStorage.verifyPlanPayment({
      paymentId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      simulated: !!simulated,
    });

    return NextResponse.json({
      success: true,
      data: {
        paymentId: result.payment.id,
        planTier: result.payment.planTier,
        billingCycle: result.payment.billingCycle,
        status: result.payment.status,
        invoiceNumber: result.payment.invoiceNumber,
        currentPeriodEnd: result.subscription.currentPeriodEnd,
        amountInr: result.payment.amountInr,
        message: `Plan ${result.payment.planTier.toUpperCase()} activated successfully!`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Payment verification failed' },
      { status: 400 }
    );
  }
}
