-- =====================================================================
-- RoboVerse Database Schema & RLS Test Suite
-- File: supabase/tests/database/01_schema_and_rls.test.sql
-- =====================================================================

BEGIN;
SELECT plan(18);

-- 1. Extension Verification
SELECT has_extension('uuid-ossp', 'Extension uuid-ossp must be active');
SELECT has_extension('pgcrypto', 'Extension pgcrypto must be active');
SELECT has_extension('postgis', 'Extension postgis must be active');

-- 2. Core Tables Existence
SELECT has_table('public', 'profiles', 'Table profiles exists');
SELECT has_table('public', 'circuit_projects', 'Table circuit_projects exists');
SELECT has_table('public', 'components', 'Table components exists');
SELECT has_table('public', 'orders', 'Table orders exists');
SELECT has_table('public', 'cart_items', 'Table cart_items exists');
SELECT has_table('public', 'chat_messages', 'Table chat_messages exists');
SELECT has_table('public', 'shops', 'Table shops exists');

-- 3. Row Level Security Verification
SELECT row_eq(
  'SELECT relrowsecurity FROM pg_class WHERE relname = ''profiles'' AND relnamespace = ''public''::regnamespace',
  ROW(true),
  'RLS must be enabled on profiles'
);
SELECT row_eq(
  'SELECT relrowsecurity FROM pg_class WHERE relname = ''circuit_projects'' AND relnamespace = ''public''::regnamespace',
  ROW(true),
  'RLS must be enabled on circuit_projects'
);
SELECT row_eq(
  'SELECT relrowsecurity FROM pg_class WHERE relname = ''cart_items'' AND relnamespace = ''public''::regnamespace',
  ROW(true),
  'RLS must be enabled on cart_items'
);
SELECT row_eq(
  'SELECT relrowsecurity FROM pg_class WHERE relname = ''chat_messages'' AND relnamespace = ''public''::regnamespace',
  ROW(true),
  'RLS must be enabled on chat_messages'
);
SELECT row_eq(
  'SELECT relrowsecurity FROM pg_class WHERE relname = ''orders'' AND relnamespace = ''public''::regnamespace',
  ROW(true),
  'RLS must be enabled on orders'
);

-- 4. Student ID Format Generation
SELECT matches(
  public.generate_student_id(),
  '^RV-[0-9]{4}-[0-9]{6}$',
  'Generated Student ID must match regex ^RV-YYYY-NNNNNN$'
);

-- 5. Spatial Index on Shops Table
SELECT has_index('public', 'shops', 'shops_location_gist', 'Shops table must have spatial GiST index');

-- 6. Platform Plans Verification
SELECT ok(
  (SELECT count(*)::integer >= 4 FROM public.plans),
  'Platform plans must be present in plans catalog'
);

SELECT * FROM finish();
ROLLBACK;
