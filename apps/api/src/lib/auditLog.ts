import { Request } from 'express';
import { prisma } from './db';

export interface AuditLogParams {
  actorId: string;
  actorRole: string;
  actorEmail?: string;
  action: string;
  targetEntity?: string;
  targetId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  req?: Request;
}

// In-memory cache of recent audit logs for fast local access
export const inMemoryAuditLogs: Array<{
  id: string;
  actorId: string;
  actorRole: string;
  actorEmail?: string;
  action: string;
  targetEntity?: string;
  targetId?: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  timestamp: string;
}> = [];

/**
 * Record an audit log entry for admin authentication and sensitive operations
 */
export async function logAuditEvent(params: AuditLogParams): Promise<void> {
  const ipAddress =
    params.ipAddress ||
    (params.req?.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    params.req?.socket?.remoteAddress ||
    '127.0.0.1';

  const userAgent =
    params.userAgent ||
    (params.req?.headers['user-agent'] as string) ||
    'RoboVerse API Client';

  const timestamp = new Date().toISOString();
  const logId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const logEntry = {
    id: logId,
    actorId: params.actorId,
    actorRole: params.actorRole,
    actorEmail: params.actorEmail,
    action: params.action,
    targetEntity: params.targetEntity,
    targetId: params.targetId,
    ipAddress,
    userAgent,
    details: params.details || {},
    timestamp,
  };

  // Add to in-memory list (limit to latest 1000)
  inMemoryAuditLogs.unshift(logEntry);
  if (inMemoryAuditLogs.length > 1000) {
    inMemoryAuditLogs.pop();
  }

  // Persist to Supabase PostgreSQL when configured
  if (process.env.DATABASE_URL) {
    try {
      await prisma.$executeRaw`
        INSERT INTO public.audit_log (actor_id, action, target_type, target_id, metadata)
        VALUES (NULL, ${`${params.action} [${params.actorRole}]`}, ${params.targetEntity || 'system'}, ${params.targetId || null}, ${JSON.stringify({
          actorId: params.actorId,
          actorEmail: params.actorEmail,
          ipAddress,
          userAgent,
          details: params.details || {},
        })}::jsonb)
      `;
    } catch (err: any) {
      // If PostgreSQL fails, in-memory log remains available
      if (process.env.NODE_ENV !== 'test') {
        console.warn(`AuditLog PostgreSQL persist note: ${err.message}`);
      }
    }
  }
}
