-- =====================================================================
-- RoboVerse Security, Grants & RPC Protection Test Suite
-- File: supabase/tests/database/02_security_and_grants.test.sql
-- =====================================================================

BEGIN;
SELECT plan(12);

-- 1. Helper and RPC Functions Existence
SELECT has_function('public', 'is_admin', 'Helper is_admin exists');
SELECT has_function('public', 'rituu_consume', ARRAY['boolean'], 'RPC rituu_consume exists');
SELECT has_function('public', 'create_order_from_cart', ARRAY['uuid'], 'RPC create_order_from_cart exists');
SELECT has_function('public', 'verify_certificate', ARRAY['text'], 'RPC verify_certificate exists');

-- 2. Anonymous Execution Privileges on Public RPCs
SELECT ok(
  has_function_privilege('anon', 'public.verify_certificate(text)', 'execute'),
  'verify_certificate() RPC must be executable by anonymous callers'
);

-- 3. Non-Admin / Anonymous Callers Blocked from Admin Functions
SELECT throws_ok(
  'SELECT public.admin_overview()',
  'P0001',
  'Access denied: Admin role required.',
  'Unauthenticated callers must be rejected from admin_overview()'
);

SELECT throws_ok(
  'SELECT * FROM public.admin_students()',
  'P0001',
  'Access denied: Admin role required.',
  'Unauthenticated callers must be rejected from admin_students()'
);

-- 4. Protected Column Mutation Checks (Role & Student ID)
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

-- 5. Lessons Count Check
SELECT ok(
  (SELECT count(*)::integer >= 16 FROM public.lessons WHERE course_id = 'course_arduino_foundations'),
  'Free beginner lessons must exist under Arduino Foundations'
);

-- 6. Spatial Function nearby_shops() execution
SELECT ok(
  (SELECT count(*) >= 0 FROM public.nearby_shops(12.9644, 77.5833, 10000, 5)),
  'nearby_shops() must execute cleanly with coordinates'
);

-- 7. Audit Log Protection
SELECT row_eq(
  'SELECT relrowsecurity FROM pg_class WHERE relname = ''audit_log'' AND relnamespace = ''public''::regnamespace',
  ROW(true),
  'audit_log table must have RLS enabled'
);

SELECT * FROM finish();
ROLLBACK;
