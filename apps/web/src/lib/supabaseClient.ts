import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@roboverse/shared';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in the web deployment environment.'
  );
}

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

export const getSupabaseClient = () => supabase;
