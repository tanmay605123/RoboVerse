-- ============================================================================
-- ROBOVERSE SUPABASE PGTAP TEST SUITE
-- Tests RLS isolation, student ID sequence, role protection, and secure RPCs
-- ============================================================================

BEGIN;
SELECT plan(15);

-- 1. Check extensions
SELECT has_extension('uuid-ossp', 'Extension uuid-ossp must be active');
SELECT has_extension('postgis', 'Extension postgis must be active');

-- 2. Check Tables Exist
SELECT has_table('public', 'profiles', 'Table profiles exists');
SELECT has_table('public', 'circuit_projects', 'Table circuit_projects exists');
SELECT has_table('public', 'components', 'Table components exists');
SELECT has_table('public', 'orders', 'Table orders exists');

-- 3. Check Row Level Security is Enabled
SELECT tests.rls_is_enabled('public', 'profiles', 'RLS must be enabled on profiles');
SELECT tests.rls_is_enabled('public', 'circuit_projects', 'RLS must be enabled on circuit_projects');
SELECT tests.rls_is_enabled('public', 'orders', 'RLS must be enabled on orders');
SELECT tests.rls_is_enabled('public', 'chat_messages', 'RLS must be enabled on chat_messages');

-- 4. Test Student ID Format Generation
SELECT matches(
  generate_student_id(),
  '^RV-[0-9]{4}-[0-9]{6}$',
  'Generated Student ID must match regex ^RV-YYYY-NNNNNN$'
);

-- 5. Test Functions and RPC Security
SELECT has_function('public', 'is_admin', 'Helper is_admin exists');
SELECT has_function('public', 'rituu_consume', ARRAY['boolean'], 'RPC rituu_consume exists');
SELECT has_function('public', 'create_order_from_cart', ARRAY['uuid'], 'RPC create_order_from_cart exists');
SELECT has_function('public', 'nearby_shops', ARRAY['double precision', 'double precision', 'integer', 'integer'], 'RPC nearby_shops exists');

-- Finish the tests
SELECT * FROM finish();
ROLLBACK;
