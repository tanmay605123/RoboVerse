import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

let cachedClient: SupabaseClient<Database> | null = null;

export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export function getSupabaseClient(config?: SupabaseConfig): SupabaseClient<Database> {
  if (cachedClient) {
    return cachedClient;
  }

  const url =
    config?.supabaseUrl ||
    (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL : '') ||
    'https://aqxtykwncclxymzxvgif.supabase.co';

  const anonKey =
    config?.supabaseAnonKey ||
    (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY : '') ||
    '';

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL/EXPO_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY/EXPO_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  cachedClient = createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: typeof window !== 'undefined',
    },
  });

  return cachedClient;
}
