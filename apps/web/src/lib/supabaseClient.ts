import { createClient } from '@supabase/supabase-js';
import type { Database } from '@roboverse/shared';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aqxtykwncclxymzxvgif.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxeHR5a3duY2NseHltenp2Z2lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNzg3NTksImV4cCI6MjEwODk1NDc1OX0.mock_public_key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const getSupabaseClient = () => supabase;
