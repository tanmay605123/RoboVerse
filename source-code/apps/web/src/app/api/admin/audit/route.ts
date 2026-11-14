import { NextRequest, NextResponse } from 'next/server';
import { auditLogStore, recordAuditLog } from '../adminStorage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: {
        logs: auditLogStore,
        total: auditLogStore.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_AUDIT_LOGS_FAILED',
          message: err.message || 'Failed to retrieve audit logs.',
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, targetType, targetId, details } = body;

    const entry = recordAuditLog({
      adminId: 'usr_admin_master',
      adminEmail: 'admin@roboverse.tech',
      action,
      targetType,
      targetId,
      details: details || {},
    });

    return NextResponse.json({
      success: true,
      data: entry,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RECORD_AUDIT_LOG_FAILED',
          message: err.message || 'Failed to record audit entry.',
        },
      },
      { status: 500 }
    );
  }
}
