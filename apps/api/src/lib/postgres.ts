import { prisma, ensurePostgresDefaults } from './db';
import { ENV } from '../config/env';

let isConnected = false;

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
    console.warn(`⚠️ PostgreSQL connection unavailable: ${error.message}`);
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
    return { status: 'disconnected', provider: 'Supabase PostgreSQL', message: error.message };
  }
}
