import { NextRequest, NextResponse } from 'next/server';
import { touchStudentPresence } from '../../admin/adminStorage';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    let userId = 'usr_student_tanmay';

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

    const body = await req.json();
    const { activity = 'Simulating 3D Electronics Circuit' } = body;

    touchStudentPresence(userId, activity);

    return NextResponse.json({
      success: true,
      data: {
        userId,
        currentActivity: activity,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PRESENCE_TOUCH_FAILED',
          message: err.message || 'Failed to update user presence.',
        },
      },
      { status: 500 }
    );
  }
}
