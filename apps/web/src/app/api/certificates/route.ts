import { NextRequest, NextResponse } from 'next/server';
import { getCertificatesForUser } from './certificateStorage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    let userId = 'all';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          userId = payload.sub || payload.id || userId;
        }
      } catch (e) {
        // fallback
      }
    }

    const certificates = getCertificatesForUser(userId);

    return NextResponse.json({
      success: true,
      data: {
        certificates,
        total: certificates.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_CERTIFICATES_FAILED',
          message: err.message || 'Failed to retrieve certificates.',
        },
      },
      { status: 500 }
    );
  }
}
