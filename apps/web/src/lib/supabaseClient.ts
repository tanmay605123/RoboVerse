import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@roboverse/shared';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in the web deployment environment.'
  );
}

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

export const getSupabaseClient = () => supabase;
