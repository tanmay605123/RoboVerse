import { prisma, ensurePostgresDefaults } from './db';
import { ENV } from '../config/env';

let isConnected = false;

/** Keep database diagnostics useful without ever echoing connection credentials. */
export function sanitizePostgresError(error: unknown): { code?: string; message: string } {
  const value = error as { code?: unknown; message?: unknown } | null;
  const code = typeof value?.code === 'string' ? value.code : undefined;
  const rawMessage = typeof value?.message === 'string' ? value.message : String(error);
  const message = rawMessage
    .replace(/postgres(?:ql)?:\/\/[^\s'"\)]+/gi, 'postgresql://[redacted]')
    .replace(/(password|passwd|pwd)\s*[:=]\s*[^\s,;]+/gi, '$1=[redacted]')
    .replace(/DATABASE_URL\s*[:=]\s*[^\s,;]+/gi, 'DATABASE_URL=[redacted]');

  return { ...(code ? { code } : {}), message };
}

export async function connectPostgres(): Promise<void> {
  if (!ENV.DATABASE_URL) {
    console.warn('⚠️ DATABASE_URL is not configured. Set it to the Supabase PostgreSQL connection string.');
    return;
  }

  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    await ensurePostgresDefaults();
    isConnected = true;
    console.log('🐘 Connected to Supabase PostgreSQL');
  } catch (error: any) {
    isConnected = false;
    const diagnostic = sanitizePostgresError(error);
    console.warn(
      `⚠️ PostgreSQL connection unavailable${diagnostic.code ? ` [${diagnostic.code}]` : ''}: ${diagnostic.message}`
    );
  }
}

export async function disconnectPostgres(): Promise<void> {
  if (isConnected) {
    await prisma.$disconnect();
    isConnected = false;
    console.log('🐘 Disconnected from Supabase PostgreSQL');
  }
}

export async function getPostgresHealthStatus() {
  if (!ENV.DATABASE_URL) {
    return { status: 'not_configured', provider: 'Supabase', message: 'DATABASE_URL is not set' };
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    isConnected = true;
    return { status: 'connected', provider: 'Supabase PostgreSQL' };
  } catch (error: any) {
    isConnected = false;
    return {
      status: 'disconnected',
      provider: 'Supabase PostgreSQL',
      ...sanitizePostgresError(error),
    };
  }
}
