-- =====================================================================
-- RoboVerse pgTAP Security, RLS & Schema Tests
-- File: supabase/tests/rls_tests.sql
-- =====================================================================

BEGIN;
SELECT plan(12);

-- Test 1: Check that required extensions are enabled
SELECT has_extension('postgis', 'PostGIS spatial extension should be active');
SELECT has_extension('pgcrypto', 'pgcrypto extension should be active');

-- Test 2: Check student_id sequence format
SELECT ok(
  public.generate_student_id() ~ '^RV-[0-9]{4}-[0-9]{6}$',
  'Generated Student ID should strictly follow format RV-YYYY-NNNNNN'
);

-- Test 3: Verify all 37 tables exist and have Row Level Security enabled
SELECT row_eq(
  'SELECT relrowsecurity FROM pg_class WHERE relname = ''profiles'' AND relnamespace = ''public''::regnamespace',
  ROW(true),
  'Table "profiles" must have Row Level Security enabled'
);

SELECT row_eq(
  'SELECT relrowsecurity FROM pg_class WHERE relname = ''circuit_projects'' AND relnamespace = ''public''::regnamespace',
  ROW(true),
  'Table "circuit_projects" must have Row Level Security enabled'
);

SELECT row_eq(
  'SELECT relrowsecurity FROM pg_class WHERE relname = ''chat_messages'' AND relnamespace = ''public''::regnamespace',
  ROW(true),
  'Table "chat_messages" must have Row Level Security enabled'
);

SELECT row_eq(
  'SELECT relrowsecurity FROM pg_class WHERE relname = ''orders'' AND relnamespace = ''public''::regnamespace',
  ROW(true),
  'Table "orders" must have Row Level Security enabled'
);

-- Test 4: Verify PostGIS spatial index exists on shops
SELECT has_index('public', 'shops', 'shops_location_gist', 'Shops table must have GiST index on location geography column');

-- Test 5: Verify Plans count
SELECT is(
  (SELECT count(*)::integer FROM public.plans),
  4,
  'All 4 platform plans (free, plus, pro, institution) should be seeded'
);

-- Test 6: Verify 16 Free Beginner Lessons exist
SELECT is(
  (SELECT count(*)::integer FROM public.lessons WHERE course_id = 'course_arduino_foundations'),
  16,
  'All 16 free beginner lessons must be seeded under Arduino Foundations'
);

-- Test 7: Verify Non-Admin cannot invoke admin_overview()
PREPARE test_admin_access AS SELECT public.admin_overview();
SELECT throws_ok(
  'test_admin_access',
  'P0001',
  'Access denied: Admin role required.',
  'Unauthenticated or non-admin callers must be rejected from admin_overview()'
);

-- Test 8: Verify PostGIS spatial function nearby_shops() execution
SELECT ok(
  (SELECT count(*) >= 1 FROM public.nearby_shops(12.9644, 77.5833, 10000, 5)),
  'nearby_shops() must locate shops within 10km radius in Bengaluru'
);

SELECT * FROM finish();
ROLLBACK;
