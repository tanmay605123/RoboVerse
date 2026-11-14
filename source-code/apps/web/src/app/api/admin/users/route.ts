import { NextRequest, NextResponse } from 'next/server';
import { adminStudentsStore } from '../adminStorage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase();
    const plan = searchParams.get('plan');

    let list = [...adminStudentsStore];

    if (search) {
      list = list.filter(
        (u) =>
          u.studentId.toLowerCase().includes(search) ||
          u.fullName.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          u.city.toLowerCase().includes(search) ||
          u.schoolOrCollege.toLowerCase().includes(search)
      );
    }

    if (plan && plan !== 'ALL') {
      list = list.filter((u) => u.planTier.toLowerCase() === plan.toLowerCase());
    }

    // STRICT DPDP COMPLIANCE: NEVER expose passwords or authentication hashes!
    const sanitized = list.map((u) => ({
      id: u.id,
      studentId: u.studentId,
      fullName: u.fullName,
      email: u.email,
      schoolOrCollege: u.schoolOrCollege,
      city: u.city,
      planTier: u.planTier,
      role: u.role,
      currentCourse: u.currentCourse,
      progressPct: u.progressPct,
      currentProject: u.currentProject,
      lastActive: u.lastActive,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: sanitized,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_USERS_FAILED',
          message: err.message || 'Failed to retrieve students directory.',
        },
      },
      { status: 500 }
    );
  }
}
