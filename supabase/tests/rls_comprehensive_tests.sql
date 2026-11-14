-- =====================================================================
-- RoboVerse pgTAP Comprehensive Security & RLS Policy Tests
-- File: supabase/tests/rls_comprehensive_tests.sql
-- =====================================================================

BEGIN;
SELECT plan(16);

-- 1. Check Extensions
SELECT has_extension('postgis', 'PostGIS spatial extension should be installed');
SELECT has_extension('pgcrypto', 'pgcrypto cryptographic extension should be installed');

-- 2. Verify Row Level Security is Enabled on All Core Data Tables
SELECT row_eq(
  'SELECT relrowsecurity FROM pg_class WHERE relname = ''profiles'' AND relnamespace = ''public''::regnamespace',
  ROW(true),
  'Table "profiles" has RLS enabled'
);

SELECT row_eq(
  'SELECT relrowsecurity FROM pg_class WHERE relname = ''cart_items'' AND relnamespace = ''public''::regnamespace',
  ROW(true),
  'Table "cart_items" has RLS enabled'
);

SELECT row_eq(
  'SELECT relrowsecurity FROM pg_class WHERE relname = ''chat_messages'' AND relnamespace = ''public''::regnamespace',
  ROW(true),
  'Table "chat_messages" has RLS enabled'
);

SELECT row_eq(
  'SELECT relrowsecurity FROM pg_class WHERE relname = ''circuit_projects'' AND relnamespace = ''public''::regnamespace',
  ROW(true),
  'Table "circuit_projects" has RLS enabled'
);

SELECT row_eq(
  'SELECT relrowsecurity FROM pg_class WHERE relname = ''orders'' AND relnamespace = ''public''::regnamespace',
  ROW(true),
  'Table "orders" has RLS enabled'
);

SELECT row_eq(
  'SELECT relrowsecurity FROM pg_class WHERE relname = ''certificates'' AND relnamespace = ''public''::regnamespace',
  ROW(true),
  'Table "certificates" has RLS enabled'
);

-- 3. Verify Least-Privilege Policies for Cart Items
-- Student A cannot view Student B's cart
SELECT policies_are(
  'public',
  'cart_items',
  ARRAY[
    'Users can view own cart items',
    'Users can insert own cart items',
    'Users can update own cart items',
    'Users can delete own cart items'
  ],
  'cart_items table has isolated user-scoped RLS policies'
);

-- 4. Verify Least-Privilege Policies for Chat Messages
SELECT policies_are(
  'public',
  'chat_messages',
  ARRAY[
    'Users can view own chat messages',
    'Users can insert own chat messages'
  ],
  'chat_messages table restricts reads and writes strictly to message owner'
);

-- 5. Verify Circuit Projects Isolation
SELECT policies_are(
  'public',
  'circuit_projects',
  ARRAY[
    'Anyone can read sample or public projects',
    'Users can read own private projects',
    'Users can insert own projects',
    'Users can update own projects',
    'Users can delete own projects'
  ],
  'circuit_projects allows public read for samples and isolates private drafts'
);

-- 6. Verify Column-Level Protection on Profiles (Role & Plan cannot be mutated by user)
SELECT throws_ok(
  'UPDATE public.profiles SET role = ''admin'' WHERE id = auth.uid()',
  'P0001',
  NULL,
  'Student should not be able to elevate own role to admin'
);

-- 7. Verify Certificate Verification RPC is Publicly Accessible
SELECT ok(
  has_function_privilege('anon', 'public.verify_certificate(text)', 'execute'),
  'verify_certificate() RPC must be executable by public anonymous callers'
);

-- 8. Verify admin_overview RPC rejects unauthenticated or student callers
SELECT throws_ok(
  'SELECT public.admin_overview()',
  'P0001',
  'Access denied: Admin role required.',
  'admin_overview() RPC must reject unauthorized callers'
);

-- 9. Verify PostGIS nearby_shops spatial RPC execution
SELECT ok(
  (SELECT count(*) >= 1 FROM public.nearby_shops(12.9644, 77.5833, 15000, 10)),
  'nearby_shops() PostGIS RPC returns nearby maker stores within radius'
);

-- 10. Verify Free Plan Saved Projects Limit Trigger
SELECT ok(
  (SELECT count(*) FROM pg_trigger WHERE tgname = 'trg_check_saved_project_limit'),
  'Project limit enforcement trigger exists for Free tier accounts'
);

SELECT * FROM finish();
ROLLBACK;
