import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV } from '../config/env';

let adminClient: SupabaseClient | null = null;

/** Server-only Supabase client. Never expose the service-role key to the browser. */
export function createSupabaseAdminClient(): SupabaseClient | null {
  if (!ENV.SUPABASE_URL || !ENV.SUPABASE_SERVICE_ROLE_KEY) return null;
  if (!adminClient) {
    adminClient = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return adminClient;
}
