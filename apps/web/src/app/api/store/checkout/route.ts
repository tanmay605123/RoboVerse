import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  // The former route fabricated payment IDs, QR images, and success responses.
  // Keep checkout unavailable until the provider order API and server-side
  // database writes are configured together.
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'PAYMENTS_NOT_CONFIGURED',
        message: 'Checkout is temporarily unavailable while secure payment setup is completed.',
      },
    },
    { status: 503 }
  );
}
