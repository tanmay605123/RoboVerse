import { NextRequest, NextResponse } from 'next/server';
import { adminStudentsStore, recordAuditLog } from '../../../adminStorage';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const body = await req.json();
    const { role } = body;

    const student = adminStudentsStore.find((s) => s.id === userId || s.studentId === userId);
    if (!student) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: `Student with ID ${userId} not found.`,
          },
        },
        { status: 404 }
      );
    }

    const previousRole = student.role;
    student.role = role;
    if (role === 'PRO_STUDENT') student.planTier = 'PRO';
    else if (role === 'PLUS_STUDENT') student.planTier = 'PLUS';
    else if (role === 'FREE_STUDENT') student.planTier = 'FREE';

    // Record in Audit Trail
    recordAuditLog({
      adminId: 'usr_admin_master',
      adminEmail: 'admin@roboverse.tech',
      action: 'ROLE_PROMOTION',
      targetType: 'STUDENT',
      targetId: student.studentId,
      details: { previousRole, newRole: role, studentName: student.fullName },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: student.id,
        studentId: student.studentId,
        newRole: student.role,
        planTier: student.planTier,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ROLE_UPDATE_FAILED',
          message: err.message || 'Failed to update student role.',
        },
      },
      { status: 500 }
    );
  }
}
