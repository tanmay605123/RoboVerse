import { NextRequest, NextResponse } from 'next/server';
import { adminStudentsStore } from '../adminStorage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const now = Date.now();
    // Active in last 15 minutes
    const workingStudents = adminStudentsStore.filter(
      (s) => now - new Date(s.lastActive).getTime() <= 1000 * 60 * 15
    ).map((s) => ({
      id: s.id,
      studentId: s.studentId,
      fullName: s.fullName,
      schoolOrCollege: s.schoolOrCollege,
      city: s.city,
      planTier: s.planTier,
      currentProject: s.currentProject,
      lastActive: s.lastActive,
      isOnline: now - new Date(s.lastActive).getTime() <= 1000 * 60 * 5,
    }));

    return NextResponse.json({
      success: true,
      data: {
        studentsOnlineCount: workingStudents.filter((s) => s.isOnline).length,
        studentsWorkingNowCount: workingStudents.length,
        activeStudents: workingStudents,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_PRESENCE_FAILED',
          message: err.message || 'Failed to retrieve presence data.',
        },
      },
      { status: 500 }
    );
  }
}
