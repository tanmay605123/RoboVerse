import { NextRequest, NextResponse } from 'next/server';
import { verifyCertificateAuthoritative } from '@roboverse/shared';
import { certificateStore } from '../../certificateStorage';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code || '';
    const allCerts = Array.from(certificateStore.values());
    const verification = verifyCertificateAuthoritative(code, allCerts);

    if (!verification.valid) {
      return NextResponse.json(
        {
          success: false,
          data: verification,
          error: {
            code: verification.revoked ? 'CERTIFICATE_REVOKED' : 'CERTIFICATE_NOT_FOUND',
            message: verification.error || 'Certificate not found in RoboVerse ledger.',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: verification,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VERIFICATION_ERROR',
          message: err.message || 'Failed to verify certificate.',
        },
      },
      { status: 500 }
    );
  }
}
