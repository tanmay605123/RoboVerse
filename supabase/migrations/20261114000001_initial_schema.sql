-- ============================================================================
-- ROBOVERSE SUPABASE CORE SCHEMA MIGRATION
-- Migration: 20261114000001_initial_schema.sql
-- ============================================================================

-- 1. Enable Required Postgres Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Student ID Sequence and Generator
CREATE SEQUENCE IF NOT EXISTS student_id_seq START WITH 1000 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION generate_student_id()
RETURNS TEXT AS $$
DECLARE
  v_year TEXT := to_char(CURRENT_DATE, 'YYYY');
  v_seq INT;
BEGIN
  v_seq := nextval('student_id_seq');
  RETURN 'RV-' || v_year || '-' || lpad(v_seq::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. CORE IDENTITY & PROFILES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'institution_admin', 'admin', 'store_admin')),
  student_id TEXT UNIQUE NOT NULL,
  school_or_college TEXT,
  class_level TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  interests TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'en',
  is_minor BOOLEAN DEFAULT false,
  parent_email TEXT,
  parental_consent_at TIMESTAMPTZ,
  location_consent BOOLEAN DEFAULT false,
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  streak_days INT DEFAULT 1,
  avatar_url TEXT,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  current_activity TEXT,
  active_plan_id TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Security Helper
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role::text IN ('admin', 'support')
  );
$$;

-- Trigger to create profile upon Supabase Auth sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name TEXT;
  v_student_id TEXT;
  v_is_minor BOOLEAN;
  v_parent_email TEXT;
  v_consent_at TIMESTAMPTZ;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'RoboVerse Explorer');
  v_student_id := generate_student_id();
  v_is_minor := COALESCE((NEW.raw_user_meta_data->>'is_minor')::BOOLEAN, false);
  v_parent_email := NEW.raw_user_meta_data->>'parent_email';
  
  IF v_is_minor AND NEW.raw_user_meta_data->>'parental_consent' = 'true' THEN
    v_consent_at := NOW();
  END IF;

  INSERT INTO public.profiles (
    id,
    full_name,
    role,
    student_id,
    school_or_college,
    class_level,
    city,
    state,
    pincode,
    interests,
    language,
    is_minor,
    parent_email,
    parental_consent_at,
    location_consent,
    avatar_url
  ) VALUES (
    NEW.id,
    v_full_name,
    'student', -- ALWAYS student on signup; admin promotion requires security definer RPC
    v_student_id,
    NEW.raw_user_meta_data->>'school_or_college',
    NEW.raw_user_meta_data->>'class_level',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'state',
    NEW.raw_user_meta_data->>'pincode',
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'interests')), '{}'::text[]),
    COALESCE(NEW.raw_user_meta_data->>'language', 'en'),
    v_is_minor,
    v_parent_email,
    v_consent_at,
    COALESCE((NEW.raw_user_meta_data->>'location_consent')::BOOLEAN, false),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Security Definer function to promote a user's role (Admin-only)
CREATE OR REPLACE FUNCTION public.admin_set_user_role(p_user_id UUID, p_new_role TEXT)
RETURNS VOID AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access Denied: Only administrators can modify user roles.';
  END IF;

  IF p_new_role NOT IN ('student', 'teacher', 'institution_admin', 'admin', 'store_admin') THEN
    RAISE EXCEPTION 'Invalid role specified: %', p_new_role;
  END IF;

  UPDATE public.profiles
  SET role = p_new_role, updated_at = NOW()
  WHERE id = p_user_id;

  INSERT INTO public.audit_log (admin_id, action, target_type, target_id, details)
  VALUES (auth.uid(), 'CHANGE_ROLE', 'user', p_user_id::text, jsonb_build_object('new_role', p_new_role));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 4. PLANS, SUBSCRIPTIONS & PAYMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'plus', 'pro', 'institution')),
  price_inr_monthly NUMERIC(10,2) NOT NULL,
  price_inr_quarterly NUMERIC(10,2),
  price_inr_yearly NUMERIC(10,2),
  gst_percent NUMERIC(5,2) DEFAULT 18.00,
  max_saved_projects INT DEFAULT 5, -- -1 for unlimited
  rituu_daily_messages INT DEFAULT 15,
  rituu_daily_photos INT DEFAULT 3,
  store_discount_percent NUMERIC(5,2) DEFAULT 0.00,
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES public.plans(id),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly', 'one_time')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'paused', 'halted', 'cancelled', 'grace_period')),
  razorpay_subscription_id TEXT UNIQUE,
  razorpay_customer_id TEXT,
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID,
  subscription_id UUID REFERENCES public.subscriptions(id),
  method TEXT NOT NULL CHECK (method IN ('checkout', 'qr', 'upi', 'card', 'netbanking')),
  amount_inr NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature TEXT,
  qr_image_url TEXT,
  qr_expiry_at TIMESTAMPTZ,
  invoice_number TEXT UNIQUE,
  invoice_tax_breakdown JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.webhook_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_percent NUMERIC(5,2),
  discount_amount_inr NUMERIC(10,2),
  min_order_amount_inr NUMERIC(10,2) DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ NOT NULL,
  max_uses INT DEFAULT 1000,
  used_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. LEARNING CURRICULUM & CERTIFICATES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  level TEXT DEFAULT 'Beginner',
  required_plan TEXT DEFAULT 'free',
  estimated_hours NUMERIC(4,1) DEFAULT 5.0,
  icon TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.modules (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  questions JSONB NOT NULL,
  passing_score INT DEFAULT 70,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lessons (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id TEXT REFERENCES public.modules(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  order_index INT NOT NULL,
  duration_minutes INT DEFAULT 15,
  content_markdown TEXT NOT NULL,
  example_code TEXT,
  components_used JSONB DEFAULT '[]',
  pinout_diagram_url TEXT,
  specs JSONB DEFAULT '{}',
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  score INT,
  UNIQUE(user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL, -- e.g. RV-CERT-2026-991234
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  grade_score NUMERIC(5,2) NOT NULL,
  issue_date TIMESTAMPTZ DEFAULT NOW(),
  verification_url TEXT NOT NULL,
  qr_code_data_url TEXT,
  pdf_url TEXT,
  revoked BOOLEAN DEFAULT false,
  revoked_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS verification_url TEXT;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS qr_code_data_url TEXT;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS revoked BOOLEAN DEFAULT false;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS issue_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS issuing_authority text DEFAULT 'RoboVerse Academy Certification Board';
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS pdf_storage_path text;

-- RPC: issue_certificate
DROP FUNCTION IF EXISTS public.issue_certificate(text);
CREATE OR REPLACE FUNCTION public.issue_certificate(p_course_id TEXT)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_total_lessons INT;
  v_completed_lessons INT;
  v_avg_score NUMERIC;
  v_course_title TEXT;
  v_code TEXT;
  v_cert_id UUID;
  v_verification_url TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  SELECT title INTO v_course_title FROM public.courses WHERE id = p_course_id;
  IF v_course_title IS NULL THEN
    RAISE EXCEPTION 'Course not found.';
  END IF;

  SELECT COUNT(*) INTO v_total_lessons FROM public.lessons WHERE course_id = p_course_id;
  
  SELECT COUNT(*), COALESCE(AVG(score), 85)
  INTO v_completed_lessons, v_avg_score
  FROM public.lesson_progress lp
  JOIN public.lessons l ON l.id = lp.lesson_id
  WHERE lp.user_id = v_user_id AND l.course_id = p_course_id AND lp.is_completed = true;

  IF v_completed_lessons < v_total_lessons THEN
    RAISE EXCEPTION 'Course completion requirements not met: % of % lessons completed.', v_completed_lessons, v_total_lessons;
  END IF;

  -- Check if already issued
  SELECT id, code INTO v_cert_id, v_code FROM public.certificates WHERE user_id = v_user_id AND course_id = p_course_id;
  IF v_cert_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'certificate_id', v_cert_id, 'code', v_code, 'already_issued', true);
  END IF;

  v_code := 'RV-CERT-' || to_char(CURRENT_DATE, 'YYYY') || '-' || upper(substr(md5(random()::text), 1, 8));
  v_verification_url := 'https://roboverse-delta.vercel.app/verify/' || v_code;

  INSERT INTO public.certificates (
    code,
    user_id,
    course_id,
    title,
    grade_score,
    verification_url
  ) VALUES (
    v_code,
    v_user_id,
    p_course_id,
    v_course_title || ' Mastery Certificate',
    v_avg_score,
    v_verification_url
  ) RETURNING id INTO v_cert_id;

  -- Mark enrollment as completed
  UPDATE public.enrollments
  SET completed_at = NOW()
  WHERE user_id = v_user_id AND course_id = p_course_id;

  -- Award 250 XP to student profile
  UPDATE public.profiles
  SET xp = xp + 250, updated_at = NOW()
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'certificate_id', v_cert_id,
    'code', v_code,
    'verification_url', v_verification_url,
    'title', v_course_title
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RPC: verify_certificate (Public)
DROP FUNCTION IF EXISTS public.verify_certificate(text);
CREATE OR REPLACE FUNCTION public.verify_certificate(p_code TEXT)
RETURNS JSONB AS $$
DECLARE
  v_cert RECORD;
  v_student RECORD;
BEGIN
  SELECT * INTO v_cert FROM public.certificates WHERE code = p_code;
  IF v_cert IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Certificate code not found.');
  END IF;

  IF v_cert.revoked THEN
    RETURN jsonb_build_object(
      'valid', false,
      'revoked', true,
      'revoked_reason', v_cert.revoked_reason,
      'code', v_cert.code
    );
  END IF;

  SELECT student_id, full_name, school_or_college INTO v_student
  FROM public.profiles WHERE id = v_cert.user_id;

  RETURN jsonb_build_object(
    'valid', true,
    'code', v_cert.code,
    'title', v_cert.title,
    'student_name', v_student.full_name,
    'student_id', v_student.student_id,
    'school', v_student.school_or_college,
    'grade_score', v_cert.grade_score,
    'issue_date', v_cert.issue_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- ============================================================================
-- 6. LABS, COMPONENTS & 3D HARDWARE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.components (
  id TEXT PRIMARY KEY,
  sku TEXT UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  dimensions_mm JSONB, -- [width, height, depth]
  mass_grams NUMERIC(8,2) DEFAULT 0,
  pins JSONB NOT NULL DEFAULT '[]',
  electrical_params JSONB NOT NULL DEFAULT '{}',
  physical_params JSONB NOT NULL DEFAULT '{}',
  artwork_2d_url TEXT,
  model_3d_url TEXT,
  schematic_symbol_url TEXT,
  datasheet_url TEXT,
  license TEXT DEFAULT 'MIT',
  linked_store_sku TEXT,
  version INT DEFAULT 1,
  is_free_tier BOOLEAN DEFAULT true,
  price_inr NUMERIC(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.circuit_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  graph_jsonb JSONB NOT NULL DEFAULT '{"components":[],"wires":[]}',
  code TEXT DEFAULT '',
  board TEXT DEFAULT 'arduino_uno',
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'unlisted')),
  is_sample BOOLEAN DEFAULT false,
  forked_from UUID REFERENCES public.circuit_projects(id) ON DELETE SET NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.circuit_project_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.circuit_projects(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  graph_jsonb JSONB NOT NULL,
  code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: Enforce 5 Saved Projects on Free Tier
CREATE OR REPLACE FUNCTION public.check_free_project_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_plan_id TEXT;
  v_max_projects INT;
  v_current_count INT;
BEGIN
  -- Sample projects are not counted against the limit
  IF NEW.is_sample = true THEN
    RETURN NEW;
  END IF;

  SELECT active_plan_id INTO v_plan_id FROM public.profiles WHERE id = NEW.user_id;
  SELECT max_saved_projects INTO v_max_projects FROM public.plans WHERE id = COALESCE(v_plan_id, 'free');

  -- If plan allows unlimited (-1), allow insertion
  IF v_max_projects = -1 THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO v_current_count
  FROM public.circuit_projects
  WHERE user_id = NEW.user_id AND is_sample = false;

  IF v_current_count >= v_max_projects THEN
    RAISE EXCEPTION 'Free plan limit reached: Maximum % saved projects allowed. Please upgrade to Plus for unlimited projects.', v_max_projects;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_check_free_project_limit ON public.circuit_projects;
CREATE TRIGGER tr_check_free_project_limit
  BEFORE INSERT ON public.circuit_projects
  FOR EACH ROW EXECUTE FUNCTION public.check_free_project_limit();

CREATE TABLE IF NOT EXISTS public.robot_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  starter_code TEXT,
  parts_list JSONB NOT NULL DEFAULT '[]',
  model_3d_url TEXT,
  arena_id TEXT,
  difficulty TEXT DEFAULT 'Beginner',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.robot_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_id TEXT REFERENCES public.robot_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  design_tree JSONB NOT NULL DEFAULT '{}',
  code TEXT,
  bom JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.arenas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  terrain_type TEXT NOT NULL,
  dimensions JSONB, -- [width, length]
  obstacles JSONB DEFAULT '[]',
  lighting JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.test_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  robot_design_id UUID REFERENCES public.robot_designs(id) ON DELETE CASCADE,
  arena_id TEXT REFERENCES public.arenas(id) ON DELETE CASCADE,
  score NUMERIC(8,2) DEFAULT 0,
  duration_seconds NUMERIC(8,2) DEFAULT 0,
  telemetry_summary JSONB DEFAULT '{}',
  stars INT DEFAULT 0,
  passed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. RITUU AI MENTORSHIP & CONSUMPTION ACCOUNTING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.circuit_projects(id) ON DELETE SET NULL,
  title TEXT DEFAULT 'Rituu Mentorship',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  mode TEXT DEFAULT 'auto',
  off_topic BOOLEAN DEFAULT false,
  had_image BOOLEAN DEFAULT false,
  model TEXT DEFAULT 'gemini-2.5-flash',
  tokens INT DEFAULT 0,
  rating TEXT CHECK (rating IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rituu_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_ist DATE NOT NULL,
  messages_count INT DEFAULT 0,
  photos_count INT DEFAULT 0,
  estimated_cost_inr NUMERIC(10,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, day_ist)
);

-- RPC: rituu_consume (Atomic limit check & consumption in IST timezone)
DROP FUNCTION IF EXISTS public.rituu_consume(boolean);
CREATE OR REPLACE FUNCTION public.rituu_consume(p_is_photo BOOLEAN DEFAULT false)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_today_ist DATE := (timezone('Asia/Kolkata', NOW()))::DATE;
  v_plan_id TEXT;
  v_msg_limit INT;
  v_photo_limit INT;
  v_current_msgs INT := 0;
  v_current_photos INT := 0;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  SELECT active_plan_id INTO v_plan_id FROM public.profiles WHERE id = v_user_id;
  SELECT rituu_daily_messages, rituu_daily_photos
  INTO v_msg_limit, v_photo_limit
  FROM public.plans
  WHERE id = COALESCE(v_plan_id, 'free');

  -- Upsert daily record
  INSERT INTO public.rituu_usage (user_id, day_ist, messages_count, photos_count)
  VALUES (v_user_id, v_today_ist, 0, 0)
  ON CONFLICT (user_id, day_ist) DO NOTHING;

  SELECT messages_count, photos_count
  INTO v_current_msgs, v_current_photos
  FROM public.rituu_usage
  WHERE user_id = v_user_id AND day_ist = v_today_ist
  FOR UPDATE;

  IF p_is_photo THEN
    IF v_current_photos >= v_photo_limit THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'reason', 'Daily photo analysis limit of ' || v_photo_limit || ' reached. Upgrade your plan for higher limits.',
        'photos_used', v_current_photos,
        'photos_limit', v_photo_limit
      );
    END IF;
    UPDATE public.rituu_usage
    SET photos_count = photos_count + 1, updated_at = NOW()
    WHERE user_id = v_user_id AND day_ist = v_today_ist;
  ELSE
    IF v_current_msgs >= v_msg_limit THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'reason', 'Daily message quota of ' || v_msg_limit || ' messages reached. Upgrade your plan for higher limits.',
        'messages_used', v_current_msgs,
        'messages_limit', v_msg_limit
      );
    END IF;
    UPDATE public.rituu_usage
    SET messages_count = messages_count + 1, updated_at = NOW()
    WHERE user_id = v_user_id AND day_ist = v_today_ist;
  END IF;

  RETURN jsonb_build_object(
    'allowed', true,
    'messages_used', v_current_msgs + (CASE WHEN p_is_photo THEN 0 ELSE 1 END),
    'messages_limit', v_msg_limit,
    'photos_used', v_current_photos + (CASE WHEN p_is_photo THEN 1 ELSE 0 END),
    'photos_limit', v_photo_limit
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 8. NEARBY COMPONENT STORES & POSTGIS GEOGRAPHY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT,
  location geography(Point, 4326) NOT NULL,
  google_place_id TEXT UNIQUE,
  hours TEXT,
  categories TEXT[] DEFAULT '{}',
  verified_status TEXT DEFAULT 'pending' CHECK (verified_status IN ('pending', 'verified', 'rejected')),
  last_verified_at TIMESTAMPTZ,
  photos TEXT[] DEFAULT '{}',
  rating NUMERIC(3,2) DEFAULT 4.5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PostGIS GiST Spatial Index
CREATE INDEX IF NOT EXISTS shops_location_gist ON public.shops USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_shops_location_gist ON public.shops USING GIST(location);

CREATE TABLE IF NOT EXISTS public.shop_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  component_id TEXT REFERENCES public.components(id) ON DELETE CASCADE,
  stock_status TEXT DEFAULT 'in_stock',
  price_inr NUMERIC(10,2),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(shop_id, component_id)
);

CREATE TABLE IF NOT EXISTS public.shop_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RPC: nearby_shops using PostGIS ST_DWithin and ST_Distance
DROP FUNCTION IF EXISTS public.nearby_shops(double precision, double precision, double precision, integer);
DROP FUNCTION IF EXISTS public.nearby_shops(double precision, double precision, integer, integer);
CREATE OR REPLACE FUNCTION public.nearby_shops(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_radius_m INT DEFAULT 5000,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  google_place_id TEXT,
  hours TEXT,
  categories TEXT[],
  verified_status TEXT,
  rating NUMERIC(3,2),
  distance_meters DOUBLE PRECISION
) AS $$
DECLARE
  v_user_pt geography := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326);
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.name,
    s.phone,
    s.address,
    s.city,
    s.state,
    s.pincode,
    ST_Y(s.location::geometry) AS latitude,
    ST_X(s.location::geometry) AS longitude,
    s.google_place_id,
    s.hours,
    s.categories,
    s.verified_status,
    s.rating,
    ST_Distance(s.location, v_user_pt) AS distance_meters
  FROM public.shops s
  WHERE ST_DWithin(s.location, v_user_pt, p_radius_m)
  ORDER BY distance_meters ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- ============================================================================
-- 9. TECHSAVYYY STORE, KITS & ORDERS (SERVER-SIDE PRICING ONLY)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.product_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES public.product_categories(id),
  price_inr NUMERIC(10,2) NOT NULL, -- GST-inclusive
  mrp_inr NUMERIC(10,2) NOT NULL,
  gst_percent NUMERIC(5,2) DEFAULT 18.00,
  stock INT NOT NULL DEFAULT 100,
  images TEXT[] DEFAULT '{}',
  specs JSONB DEFAULT '{}',
  component_id TEXT REFERENCES public.components(id) ON DELETE SET NULL,
  age_restricted BOOLEAN DEFAULT false,
  shipping_class TEXT DEFAULT 'standard' CHECK (shipping_class IN ('standard', 'battery', 'regulated_drone')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price_inr NUMERIC(10,2) NOT NULL,
  sum_of_parts_inr NUMERIC(10,2) NOT NULL,
  robot_template_id TEXT REFERENCES public.robot_templates(id) ON DELETE SET NULL,
  course_id TEXT REFERENCES public.courses(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.kit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id UUID NOT NULL REFERENCES public.kits(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  component_id TEXT REFERENCES public.components(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  total_amount_inr NUMERIC(10,2) NOT NULL,
  tax_breakdown JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded')),
  shipping_address JSONB NOT NULL,
  shipping_class TEXT DEFAULT 'standard',
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INT NOT NULL DEFAULT 1,
  unit_price_inr NUMERIC(10,2) NOT NULL,
  total_price_inr NUMERIC(10,2) NOT NULL
);

-- RPC: create_order_from_cart (COMPUTES TOTALS FROM DATABASE ONLY)
DROP FUNCTION IF EXISTS public.create_order_from_cart(uuid, text);
DROP FUNCTION IF EXISTS public.create_order_from_cart(uuid);
CREATE OR REPLACE FUNCTION public.create_order_from_cart(p_address_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_user_rec RECORD;
  v_address_rec RECORD;
  v_cart_item RECORD;
  v_total_amount NUMERIC(10,2) := 0;
  v_discount_percent NUMERIC(5,2) := 0;
  v_order_id UUID;
  v_order_number TEXT;
  v_highest_shipping TEXT := 'standard';
  v_base_amount NUMERIC(10,2);
  v_tax_amount NUMERIC(10,2);
  v_tax_json JSONB;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  -- Load profile & age status
  SELECT is_minor, active_plan_id INTO v_user_rec FROM public.profiles WHERE id = v_user_id;
  
  -- Load member discount from plan
  SELECT store_discount_percent INTO v_discount_percent
  FROM public.plans WHERE id = COALESCE(v_user_rec.active_plan_id, 'free');

  -- Verify shipping address
  SELECT * INTO v_address_rec FROM public.addresses WHERE id = p_address_id AND user_id = v_user_id;
  IF v_address_rec IS NULL THEN
    RAISE EXCEPTION 'Invalid or missing delivery address.';
  END IF;

  -- Verify cart has items
  IF NOT EXISTS (SELECT 1 FROM public.cart_items WHERE user_id = v_user_id) THEN
    RAISE EXCEPTION 'Cart is empty.';
  END IF;

  -- Check age restrictions and stock
  FOR v_cart_item IN
    SELECT c.quantity, p.id, p.name, p.price_inr, p.stock, p.age_restricted, p.shipping_class
    FROM public.cart_items c
    JOIN public.products p ON p.id = c.product_id
    WHERE c.user_id = v_user_id
  LOOP
    IF v_cart_item.stock < v_cart_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for %: % available.', v_cart_item.name, v_cart_item.stock;
    END IF;

    IF v_cart_item.age_restricted AND v_user_rec.is_minor THEN
      RAISE EXCEPTION 'Product % is age-restricted (18+). Parental consent verification required before ordering.', v_cart_item.name;
    END IF;

    -- Elevate shipping class if drone or battery
    IF v_cart_item.shipping_class = 'regulated_drone' THEN
      v_highest_shipping := 'regulated_drone';
    ELSIF v_cart_item.shipping_class = 'battery' AND v_highest_shipping <> 'regulated_drone' THEN
      v_highest_shipping := 'battery';
    END IF;

    v_total_amount := v_total_amount + (v_cart_item.price_inr * v_cart_item.quantity);
  END LOOP;

  -- Apply plan discount if any
  IF v_discount_percent > 0 THEN
    v_total_amount := ROUND(v_total_amount * (1.0 - (v_discount_percent / 100.0)), 2);
  END IF;

  -- Compute 18% GST Breakdown (Database side)
  v_base_amount := ROUND(v_total_amount / 1.18, 2);
  v_tax_amount := v_total_amount - v_base_amount;
  v_tax_json := jsonb_build_object(
    'gross_amount', v_total_amount,
    'base_amount', v_base_amount,
    'total_tax', v_tax_amount,
    'cgst', ROUND(v_tax_amount / 2.0, 2),
    'sgst', ROUND(v_tax_amount / 2.0, 2),
    'gst_percent', 18
  );

  v_order_number := 'RV-ORD-' || to_char(CURRENT_DATE, 'YYYY') || '-' || upper(substr(md5(random()::text), 1, 8));

  -- Insert Order
  INSERT INTO public.orders (
    user_id,
    order_number,
    address_id,
    total_amount_inr,
    tax_breakdown,
    status,
    shipping_address,
    shipping_class
  ) VALUES (
    v_user_id,
    v_order_number,
    p_address_id,
    v_total_amount,
    v_tax_json,
    'processing',
    row_to_json(v_address_rec)::jsonb,
    v_highest_shipping
  ) RETURNING id INTO v_order_id;

  -- Copy cart items to order_items
  INSERT INTO public.order_items (order_id, product_id, quantity, unit_price_inr, total_price_inr)
  SELECT
    v_order_id,
    c.product_id,
    c.quantity,
    p.price_inr,
    (p.price_inr * c.quantity)
  FROM public.cart_items c
  JOIN public.products p ON p.id = c.product_id
  WHERE c.user_id = v_user_id;

  -- Clear cart
  DELETE FROM public.cart_items WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'total_amount_inr', v_total_amount,
    'tax_breakdown', v_tax_json,
    'shipping_class', v_highest_shipping
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RPC: finalize_order_payment (used by Razorpay webhook)
DROP FUNCTION IF EXISTS public.finalize_order_payment(uuid, text);
CREATE OR REPLACE FUNCTION public.finalize_order_payment(p_order_id UUID, p_razorpay_payment_id TEXT)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  IF v_order IS NULL THEN
    RAISE EXCEPTION 'Order % not found.', p_order_id;
  END IF;

  IF v_order.status = 'paid' THEN
    RETURN jsonb_build_object('success', true, 'already_finalized', true);
  END IF;

  -- Decrement product stock
  FOR v_item IN SELECT * FROM public.order_items WHERE order_id = p_order_id LOOP
    UPDATE public.products
    SET stock = stock - v_item.quantity
    WHERE id = v_item.product_id;
  END LOOP;

  -- Mark order as paid
  UPDATE public.orders
  SET status = 'paid'
  WHERE id = p_order_id;

  -- Update payment record if matching order_id
  UPDATE public.payments
  SET status = 'captured', razorpay_payment_id = p_razorpay_payment_id
  WHERE order_id = p_order_id;

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id, 'status', 'paid');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 10. REALTIME PRESENCE & ADMIN OPERATIONS
-- ============================================================================

-- Presence helper
DROP FUNCTION IF EXISTS public.touch_presence(text, uuid);
CREATE OR REPLACE FUNCTION public.touch_presence(p_activity TEXT, p_project_id UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    UPDATE public.profiles
    SET
      last_seen_at = NOW(),
      current_activity = p_activity
    WHERE id = auth.uid();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.daily_stats (
  date DATE PRIMARY KEY,
  total_students INT DEFAULT 0,
  active_students_24h INT DEFAULT 0,
  projects_created INT DEFAULT 0,
  test_runs_count INT DEFAULT 0,
  rituu_messages_count INT DEFAULT 0,
  revenue_inr NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RPC: admin_overview
DROP FUNCTION IF EXISTS public.admin_overview();
CREATE OR REPLACE FUNCTION public.admin_overview()
RETURNS JSONB AS $$
DECLARE
  v_total_students INT;
  v_active_24h INT;
  v_active_7d INT;
  v_online_now INT;
  v_students_working INT;
  v_projects_total INT;
  v_courses_enrollments JSONB;
  v_rituu_stats JSONB;
  v_total_revenue NUMERIC(12,2);
  v_shop_reports_pending INT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required.';
  END IF;

  SELECT COUNT(*) INTO v_total_students FROM public.profiles WHERE role = 'student';
  SELECT COUNT(*) INTO v_active_24h FROM public.profiles WHERE last_seen_at >= NOW() - INTERVAL '24 hours';
  SELECT COUNT(*) INTO v_active_7d FROM public.profiles WHERE last_seen_at >= NOW() - INTERVAL '7 days';
  SELECT COUNT(*) INTO v_online_now FROM public.profiles WHERE last_seen_at >= NOW() - INTERVAL '5 minutes';
  SELECT COUNT(*) INTO v_students_working FROM public.profiles WHERE last_seen_at >= NOW() - INTERVAL '15 minutes' AND current_activity IS NOT NULL;
  SELECT COUNT(*) INTO v_projects_total FROM public.circuit_projects WHERE is_sample = false;

  SELECT jsonb_object_agg(course_id, cnt) INTO v_courses_enrollments
  FROM (
    SELECT course_id, COUNT(*) as cnt FROM public.enrollments GROUP BY course_id
  ) s;

  SELECT jsonb_build_object(
    'total_messages', COALESCE(SUM(messages_count), 0),
    'total_photos', COALESCE(SUM(photos_count), 0),
    'estimated_cost_inr', COALESCE(SUM(estimated_cost_inr), 0)
  ) INTO v_rituu_stats
  FROM public.rituu_usage;

  SELECT COALESCE(SUM(amount_inr), 0) INTO v_total_revenue
  FROM public.payments WHERE status = 'captured';

  SELECT COUNT(*) INTO v_shop_reports_pending
  FROM public.shop_reports WHERE status = 'pending';

  RETURN jsonb_build_object(
    'total_students', v_total_students,
    'active_24h', v_active_24h,
    'active_7d', v_active_7d,
    'online_now', v_online_now,
    'students_working_now', v_students_working,
    'projects_created', v_projects_total,
    'enrollments_by_course', COALESCE(v_courses_enrollments, '{}'::jsonb),
    'rituu_stats', v_rituu_stats,
    'total_revenue_inr', v_total_revenue,
    'pending_shop_reports', v_shop_reports_pending
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RPC: admin_students (Returns directory without passwords)
DROP FUNCTION IF EXISTS public.admin_students(text, text, integer, integer);
CREATE OR REPLACE FUNCTION public.admin_students(
  p_search TEXT DEFAULT '',
  p_filter_plan TEXT DEFAULT NULL,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  student_id TEXT,
  full_name TEXT,
  school_or_college TEXT,
  city TEXT,
  plan_tier TEXT,
  current_course TEXT,
  progress_pct INT,
  current_project TEXT,
  last_active TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required.';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.student_id,
    p.full_name,
    p.school_or_college,
    p.city,
    p.active_plan_id AS plan_tier,
    COALESCE((SELECT c.title FROM public.enrollments e JOIN public.courses c ON c.id = e.course_id WHERE e.user_id = p.id ORDER BY e.enrolled_at DESC LIMIT 1), 'None') AS current_course,
    COALESCE((SELECT ROUND((COUNT(*) FILTER (WHERE lp.is_completed)::numeric / NULLIF(COUNT(*),0)::numeric) * 100)::INT FROM public.lesson_progress lp WHERE lp.user_id = p.id), 0) AS progress_pct,
    COALESCE(p.current_activity, 'Offline') AS current_project,
    p.last_seen_at AS last_active,
    p.created_at
  FROM public.profiles p
  WHERE (p_search = '' OR p.full_name ILIKE '%' || p_search || '%' OR p.student_id ILIKE '%' || p_search || '%' OR p.city ILIKE '%' || p_search || '%')
    AND (p_filter_plan IS NULL OR p.active_plan_id = p_filter_plan)
  ORDER BY p.last_seen_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 11. INDEXES FOR PERFORMANCE & EXPLAIN TUNING
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON public.profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON public.profiles(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_active_plan ON public.profiles(active_plan_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON public.payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

CREATE INDEX IF NOT EXISTS idx_lessons_course_order ON public.lessons(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson ON public.lesson_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_certificates_code ON public.certificates(code);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.certificates(user_id);

CREATE INDEX IF NOT EXISTS idx_circuit_projects_user ON public.circuit_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_circuit_projects_visibility ON public.circuit_projects(visibility);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_rituu_usage_user_day ON public.rituu_usage(user_id, day_ist);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON public.cart_items(user_id);

-- ============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS across every table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circuit_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circuit_project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.robot_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.robot_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rituu_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;

-- Column Grants: Users can NEVER edit role, active_plan_id, or student_id directly
REVOKE UPDATE (role, active_plan_id, student_id) ON public.profiles FROM authenticated;

-- PROFILES
DROP POLICY IF EXISTS "Public read minimal profiles" ON public.profiles;
CREATE POLICY "Public read minimal profiles" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own editable profile" ON public.profiles;
CREATE POLICY "Users can update their own editable profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- PLANS & PUBLIC CATALOGS (Read-only for public, admin write)
DROP POLICY IF EXISTS "Plans are publicly viewable" ON public.plans;
CREATE POLICY "Plans are publicly viewable" ON public.plans
  FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin manages plans" ON public.plans;
CREATE POLICY "Admin manages plans" ON public.plans
  FOR ALL USING (public.is_admin());

-- SUBSCRIPTIONS & PAYMENTS
DROP POLICY IF EXISTS "Users view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users view own payments" ON public.payments;
CREATE POLICY "Users view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- COURSES & LESSONS (Public read, admin write)
DROP POLICY IF EXISTS "Courses are publicly viewable" ON public.courses;
CREATE POLICY "Courses are publicly viewable" ON public.courses
  FOR SELECT USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin manages courses" ON public.courses;
CREATE POLICY "Admin manages courses" ON public.courses
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Modules viewable" ON public.modules;
CREATE POLICY "Modules viewable" ON public.modules
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lessons viewable" ON public.lessons;
CREATE POLICY "Lessons viewable" ON public.lessons
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enrollments owner or admin" ON public.enrollments;
CREATE POLICY "Enrollments owner or admin" ON public.enrollments
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Lesson progress owner or admin" ON public.lesson_progress;
CREATE POLICY "Lesson progress owner or admin" ON public.lesson_progress
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Quizzes viewable" ON public.quizzes;
CREATE POLICY "Quizzes viewable" ON public.quizzes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Certificates public read" ON public.certificates;
CREATE POLICY "Certificates public read" ON public.certificates
  FOR SELECT USING (revoked = false OR auth.uid() = user_id OR public.is_admin());

-- COMPONENTS & ROBOT TEMPLATES
DROP POLICY IF EXISTS "Components are publicly viewable" ON public.components;
CREATE POLICY "Components are publicly viewable" ON public.components
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manages components" ON public.components;
CREATE POLICY "Admin manages components" ON public.components
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Robot templates are publicly viewable" ON public.robot_templates;
CREATE POLICY "Robot templates are publicly viewable" ON public.robot_templates
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Arenas are publicly viewable" ON public.arenas;
CREATE POLICY "Arenas are publicly viewable" ON public.arenas
  FOR SELECT USING (true);

-- CIRCUIT PROJECTS
DROP POLICY IF EXISTS "Projects select policy" ON public.circuit_projects;
CREATE POLICY "Projects select policy" ON public.circuit_projects
  FOR SELECT USING (
    visibility = 'public'
    OR is_sample = true
    OR auth.uid() = user_id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Projects insert owner" ON public.circuit_projects;
CREATE POLICY "Projects insert owner" ON public.circuit_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Projects update owner" ON public.circuit_projects;
CREATE POLICY "Projects update owner" ON public.circuit_projects
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Projects delete owner" ON public.circuit_projects;
CREATE POLICY "Projects delete owner" ON public.circuit_projects
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- ROBOT DESIGNS & TEST RUNS
DROP POLICY IF EXISTS "Robot designs owner access" ON public.robot_designs;
CREATE POLICY "Robot designs owner access" ON public.robot_designs
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Test runs owner access" ON public.test_runs;
CREATE POLICY "Test runs owner access" ON public.test_runs
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- CHAT SESSIONS & MESSAGES (Rituu)
DROP POLICY IF EXISTS "Chat sessions owner access" ON public.chat_sessions;
CREATE POLICY "Chat sessions owner access" ON public.chat_sessions
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Chat messages session owner access" ON public.chat_messages;
CREATE POLICY "Chat messages session owner access" ON public.chat_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions s
      WHERE s.id = session_id AND (s.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Rituu usage owner access" ON public.rituu_usage;
CREATE POLICY "Rituu usage owner access" ON public.rituu_usage
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- SHOPS (Verified shops are publicly viewable)
DROP POLICY IF EXISTS "Shops public select" ON public.shops;
CREATE POLICY "Shops public select" ON public.shops
  FOR SELECT USING (verified_status = 'verified' OR auth.uid() = owner_id OR public.is_admin());

DROP POLICY IF EXISTS "Shop owners can register/update" ON public.shops;
CREATE POLICY "Shop owners can register/update" ON public.shops
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Shop owners update own shop" ON public.shops;
CREATE POLICY "Shop owners update own shop" ON public.shops
  FOR UPDATE USING (auth.uid() = owner_id OR public.is_admin());

DROP POLICY IF EXISTS "Shop inventory public read" ON public.shop_inventory;
CREATE POLICY "Shop inventory public read" ON public.shop_inventory
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Shop reports insert" ON public.shop_reports;
CREATE POLICY "Shop reports insert" ON public.shop_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Shop reports admin view" ON public.shop_reports;
CREATE POLICY "Shop reports admin view" ON public.shop_reports
  FOR SELECT USING (public.is_admin() OR auth.uid() = user_id);

-- PRODUCTS & COMMERCE
DROP POLICY IF EXISTS "Product categories viewable" ON public.product_categories;
CREATE POLICY "Product categories viewable" ON public.product_categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Products viewable" ON public.products;
CREATE POLICY "Products viewable" ON public.products
  FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin manages products" ON public.products;
CREATE POLICY "Admin manages products" ON public.products
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Kits viewable" ON public.kits;
CREATE POLICY "Kits viewable" ON public.kits
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Kit items viewable" ON public.kit_items;
CREATE POLICY "Kit items viewable" ON public.kit_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Addresses owner access" ON public.addresses;
CREATE POLICY "Addresses owner access" ON public.addresses
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Cart owner access" ON public.cart_items;
CREATE POLICY "Cart owner access" ON public.cart_items
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Orders owner access" ON public.orders;
CREATE POLICY "Orders owner access" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Order items owner access" ON public.order_items;
CREATE POLICY "Order items owner access" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

-- AUDIT LOG (Admin only)
DROP POLICY IF EXISTS "Admin views audit log" ON public.audit_log;
CREATE POLICY "Admin views audit log" ON public.audit_log
  FOR SELECT USING (public.is_admin());

-- ============================================================================
-- 13. STORAGE BUCKETS CONFIGURATION & POLICIES
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('component-assets', 'component-assets', true),
  ('project-thumbnails', 'project-thumbnails', true),
  ('avatars', 'avatars', true),
  ('shop-photos', 'shop-photos', true),
  ('certificates', 'certificates', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Component assets public read" ON storage.objects;
CREATE POLICY "Component assets public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'component-assets');

DROP POLICY IF EXISTS "Component assets admin write" ON storage.objects;
CREATE POLICY "Component assets admin write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'component-assets' AND public.is_admin());

DROP POLICY IF EXISTS "Avatars public read" ON storage.objects;
CREATE POLICY "Avatars public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatars owner upload" ON storage.objects;
CREATE POLICY "Avatars owner upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Project thumbnails public read" ON storage.objects;
CREATE POLICY "Project thumbnails public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-thumbnails');

DROP POLICY IF EXISTS "Project thumbnails owner write" ON storage.objects;
CREATE POLICY "Project thumbnails owner write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'project-thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Certificates private owner or admin read" ON storage.objects;
CREATE POLICY "Certificates private owner or admin read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'certificates'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
  );
