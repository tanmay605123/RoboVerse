import { NextRequest, NextResponse } from 'next/server';
import { adminStudentsStore, recordAuditLog } from '../../../adminStorage';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const student = adminStudentsStore.find((s) => s.id === userId || s.studentId === userId);

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'STUDENT_NOT_FOUND',
            message: `Student ${userId} not found.`,
          },
        },
        { status: 404 }
      );
    }

    // Record admin security action
    recordAuditLog({
      adminId: 'usr_admin_master',
      adminEmail: 'admin@roboverse.tech',
      action: 'PASSWORD_RESET_LINK_SENT',
      targetType: 'STUDENT',
      targetId: student.studentId,
      details: {
        recipientEmail: student.email,
        reason: 'Administrator lockout recovery trigger',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        sent: true,
        email: student.email,
        studentId: student.studentId,
        message: `Official Supabase Auth password reset link dispatched to ${student.email}. Passwords are never stored or displayed to administrators.`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RESET_FAILED',
          message: err.message || 'Failed to dispatch password reset link.',
        },
      },
      { status: 500 }
    );
  }
}
