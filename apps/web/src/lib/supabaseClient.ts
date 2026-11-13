import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@roboverse/shared';

// Keep builds and the seeded demo usable without a configured Supabase project.
// Set these environment variables to connect the app to a real backend.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'roboverse-local-anon-key-not-configured';

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

export const getSupabaseClient = () => supabase;
