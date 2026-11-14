import { NextRequest, NextResponse } from 'next/server';
import { paymentStorage } from '../../paymentStorage';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentId = params.id;
    const payment = paymentStorage.getPayment(paymentId);

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    let isExpired = false;
    let secondsRemaining = 0;

    if (payment.method === 'qr' && payment.qrExpiresAt) {
      const remainingMs = new Date(payment.qrExpiresAt).getTime() - Date.now();
      secondsRemaining = Math.max(0, Math.floor(remainingMs / 1000));
      isExpired = secondsRemaining <= 0 && payment.status !== 'captured';
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentId: payment.id,
        status: isExpired ? 'expired' : payment.status,
        planTier: payment.planTier,
        amountInr: payment.amountInr,
        invoiceNumber: payment.invoiceNumber,
        secondsRemaining,
        isExpired,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to check payment status' },
      { status: 500 }
    );
  }
}
