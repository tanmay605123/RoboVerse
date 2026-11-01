-- =====================================================================
-- RoboVerse Phase 1 pgTAP Comprehensive Security & RLS Tests
-- File: supabase/tests/phase1_pgtap_tests.sql
-- =====================================================================

BEGIN;
SELECT plan(28);

-- 1. Extension Verification
SELECT has_extension('postgis', 'PostGIS spatial extension must be active');
SELECT has_extension('pgcrypto', 'pgcrypto cryptographic extension must be active');

-- 2. Sequence-based Student ID Generator Format
SELECT ok(
  public.generate_student_id() ~ '^RV-[0-9]{4}-[0-9]{6}$',
  'Student ID must strictly follow sequence format RV-YYYY-NNNNNN'
);

-- 3. Row Level Security Enabled on Core Tables
SELECT row_eq(
  'SELECT relrowsecurity FROM pg_class WHERE relname = ''profiles'' AND relnamespace = ''public''::regnamespace',
  ROW(true),
  'Table "profiles" must have RLS enabled'
);

SELECT row_eq(
  'SELECT relrowsecurity FROM pg_class WHERE relname = ''consents'' AND relnamespace = ''public''::regnamespace',
  ROW(true),
  'Table "consents" must have RLS enabled'
);

SELECT row_eq(
  'SELECT relrowsecurity FROM pg_class WHERE relname = ''parental_consents'' AND relnamespace = ''public''::regnamespace',
  ROW(true),
  'Table "parental_consents" must have RLS enabled'
);

SELECT row_eq(
  'SELECT relrowsecurity FROM pg_class WHERE relname = ''cart_items'' AND relnamespace = ''public''::regnamespace',
  ROW(true),
  'Table "cart_items" must have RLS enabled'
);

SELECT row_eq(
  'SELECT relrowsecurity FROM pg_class WHERE relname = ''chat_messages'' AND relnamespace = ''public''::regnamespace',
  ROW(true),
  'Table "chat_messages" must have RLS enabled'
);

SELECT row_eq(
  'SELECT relrowsecurity FROM pg_class WHERE relname = ''circuit_projects'' AND relnamespace = ''public''::regnamespace',
  ROW(true),
  'Table "circuit_projects" must have RLS enabled'
);

SELECT row_eq(
  'SELECT relrowsecurity FROM pg_class WHERE relname = ''orders'' AND relnamespace = ''public''::regnamespace',
  ROW(true),
  'Table "orders" must have RLS enabled'
);

SELECT row_eq(
  'SELECT relrowsecurity FROM pg_class WHERE relname = ''invoices'' AND relnamespace = ''public''::regnamespace',
  ROW(true),
  'Table "invoices" must have RLS enabled'
);

SELECT row_eq(
  'SELECT relrowsecurity FROM pg_class WHERE relname = ''refunds'' AND relnamespace = ''public''::regnamespace',
  ROW(true),
  'Table "refunds" must have RLS enabled'
);

SELECT row_eq(
  'SELECT relrowsecurity FROM pg_class WHERE relname = ''audit_log'' AND relnamespace = ''public''::regnamespace',
  ROW(true),
  'Table "audit_log" must have RLS enabled'
);

SELECT row_eq(
  'SELECT relrowsecurity FROM pg_class WHERE relname = ''daily_stats'' AND relnamespace = ''public''::regnamespace',
  ROW(true),
  'Table "daily_stats" must have RLS enabled'
);

-- 4. Spatial GiST Index on Shops Table
SELECT has_index('public', 'shops', 'shops_location_gist', 'Shops table must have GiST spatial index on geography location');

-- 5. Single Source of Truth View: current_entitlements
SELECT has_view('public', 'current_entitlements', 'View "current_entitlements" must exist as single source of truth');

-- 6. Verify Production-Safe Seeded Plans
SELECT is(
  (SELECT count(*)::integer FROM public.plans),
  4,
  'All 4 platform plans (free, plus, pro, institution) must be present in plans catalog'
);

-- 7. Verify Pricing of Plans
SELECT is(
  (SELECT (pricing->0->>'price_inr_inclusive_gst')::integer FROM public.plans WHERE id = 'plan_plus'),
  299,
  'Plus plan monthly price must be exactly ₹299 GST-inclusive'
);

SELECT is(
  (SELECT (pricing->0->>'price_inr_inclusive_gst')::integer FROM public.plans WHERE id = 'plan_pro'),
  999,
  'Pro plan monthly price must be exactly ₹999 GST-inclusive'
);

-- 8. Verify 16 Free Beginner Lessons
SELECT is(
  (SELECT count(*)::integer FROM public.lessons WHERE course_id = 'course_arduino_foundations'),
  16,
  'Exact 16 free beginner lessons must be present under Arduino Foundations'
);

-- 9. Column-Level Grants Protection: Users cannot mutate role or student_id
SELECT throws_ok(
  'UPDATE public.profiles SET role = ''admin'' WHERE id = auth.uid()',
  'P0001',
  NULL,
  'Student must be prohibited from mutating role to admin'
);

SELECT throws_ok(
  'UPDATE public.profiles SET student_id = ''RV-9999-999999'' WHERE id = auth.uid()',
  'P0001',
  NULL,
  'Student must be prohibited from altering student_id'
);

-- 10. Admin RPCs Reject Unauthenticated / Non-Admin Callers
SELECT throws_ok(
  'SELECT public.admin_overview()',
  'P0001',
  'Access denied: Admin role required.',
  'Unauthenticated or non-admin callers must be rejected from admin_overview()'
);

SELECT throws_ok(
  'SELECT * FROM public.admin_students()',
  'P0001',
  'Access denied: Admin role required.',
  'Unauthenticated or non-admin callers must be rejected from admin_students()'
);

SELECT throws_ok(
  'SELECT public.admin_refund(''00000000-0000-0000-0000-000000000000''::uuid, ''test'')',
  'P0001',
  'Access denied: Admin role required.',
  'Non-admin callers must be rejected from admin_refund()'
);

SELECT throws_ok(
  'SELECT public.admin_revoke_certificate(''RV-CERT-2026-0001'', ''test'')',
  'P0001',
  'Access denied: Admin role required.',
  'Non-admin callers must be rejected from admin_revoke_certificate()'
);

-- 11. Public RPC Execution Privileges for Anonymous Callers
SELECT ok(
  has_function_privilege('anon', 'public.verify_certificate(text)', 'execute'),
  'verify_certificate() RPC must be executable by anonymous callers'
);

SELECT ok(
  has_function_privilege('anon', 'public.nearby_shops(double precision, double precision, double precision, integer)', 'execute'),
  'nearby_shops() spatial RPC must be executable by anonymous callers'
);

SELECT ok(
  has_function_privilege('anon', 'public.get_current_entitlements()', 'execute'),
  'get_current_entitlements() RPC must be executable by anonymous callers'
);

SELECT * FROM finish();
ROLLBACK;
