import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@roboverse/shared';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aqxtykwncclxymzxvgif.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Add the publishable/anon key from Supabase Project Settings > API to apps/web/.env.local.'
  );
}

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

export const getSupabaseClient = () => supabase;
