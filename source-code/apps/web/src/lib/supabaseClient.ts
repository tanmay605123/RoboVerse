import { createRoboVerseSupabaseClient, RoboVerseSupabaseClient } from '@roboverse/shared';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_for_roboverse_2026';

let clientInstance: RoboVerseSupabaseClient | null = null;

export function getSupabaseClient(): RoboVerseSupabaseClient {
  if (!clientInstance) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('roboverse_access_token') : null;
    clientInstance = createRoboVerseSupabaseClient({
      supabaseUrl: SUPABASE_URL,
      supabaseKey: SUPABASE_ANON_KEY,
      authToken: token,
    });
  }
  return clientInstance;
}

export const supabase = getSupabaseClient();
