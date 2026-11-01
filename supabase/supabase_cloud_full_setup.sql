-- =====================================================================
-- RoboVerse PostgreSQL Initial Schema
-- Migration: 20261030000001_initial_schema.sql
-- =====================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Define Custom Enums
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'student',
    'teacher',
    'institution_admin',
    'admin',
    'store_admin'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE plan_tier AS ENUM (
    'free',
    'plus',
    'pro',
    'institution'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE billing_cycle AS ENUM (
    'monthly',
    'quarterly',
    'yearly',
    'one_time'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM (
    'checkout',
    'qr'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'pending',
    'completed',
    'failed',
    'refunded',
    'expired'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM (
    'active',
    'past_due',
    'canceled',
    'incomplete',
    'trialing'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending',
    'paid',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE shipping_class AS ENUM (
    'standard',
    'battery',
    'regulated_drone'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE verified_status AS ENUM (
    'pending',
    'verified',
    'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Student ID Sequence
CREATE SEQUENCE IF NOT EXISTS student_id_seq START WITH 1001 INCREMENT BY 1;

-- =====================================================================
-- 4. Identity & User Profiles
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  school_or_college text,
  class_level text,
  city text,
  pincode text,
  state text,
  country text DEFAULT 'India',
  interests text[] DEFAULT '{}',
  language text DEFAULT 'en',
  is_minor boolean DEFAULT false,
  parent_email text,
  parental_consent_at timestamptz,
  location_consent boolean DEFAULT false,
  avatar_url text,
  level text DEFAULT 'Rookie',
  xp integer DEFAULT 0 CHECK (xp >= 0),
  streak_days integer DEFAULT 1 CHECK (streak_days >= 0),
  last_seen_at timestamptz DEFAULT now(),
  current_activity text DEFAULT 'Exploring RoboVerse',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================================
-- 5. Plans, Subscriptions & Billing
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.plans (
  id text PRIMARY KEY,
  tier plan_tier UNIQUE NOT NULL,
  name text NOT NULL,
  tagline text NOT NULL,
  badge text,
  is_popular boolean DEFAULT false,
  pricing jsonb NOT NULL DEFAULT '[]'::jsonb,
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES public.plans(id),
  billing_cycle billing_cycle NOT NULL,
  status subscription_status NOT NULL DEFAULT 'active',
  razorpay_subscription_id text,
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  grace_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coupons (
  code text PRIMARY KEY,
  discount_percent integer NOT NULL CHECK (discount_percent BETWEEN 1 AND 100),
  max_discount_inr numeric(10,2),
  min_order_inr numeric(10,2) DEFAULT 0,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  usage_limit integer,
  used_count integer DEFAULT 0 CHECK (used_count >= 0),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.webhook_events (
  id text PRIMARY KEY, -- Razorpay event id for idempotency
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- =====================================================================
-- 6. Learning: Courses, Modules, Lessons, Quizzes, Certificates
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  track text NOT NULL DEFAULT 'HYBRID',
  level text NOT NULL DEFAULT 'BEGINNER',
  thumbnail_url text,
  is_official_certificate boolean DEFAULT true,
  duration_hours integer DEFAULT 10,
  order_index integer DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.modules (
  id text PRIMARY KEY,
  course_id text NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lessons (
  id text PRIMARY KEY,
  course_id text NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id text NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  content text NOT NULL,
  example_code text,
  components_used text[] DEFAULT '{}',
  pinout_specs jsonb DEFAULT '{}'::jsonb,
  video_url text,
  starter_circuit_id text,
  duration_minutes integer DEFAULT 15,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id text NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at timestamptz DEFAULT now(),
  status text DEFAULT 'active',
  completed_at timestamptz,
  UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id text NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  code_submission text,
  score integer,
  UNIQUE(user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS public.quizzes (
  id text PRIMARY KEY,
  lesson_id text REFERENCES public.lessons(id) ON DELETE SET NULL,
  title text NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  passing_score integer DEFAULT 70,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_code text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id text NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  student_id text NOT NULL,
  course_name text NOT NULL,
  track text NOT NULL,
  hours integer NOT NULL DEFAULT 20,
  grade_score numeric(5,2) DEFAULT 95.0,
  skills_assessed text[] DEFAULT '{}',
  qr_verification_url text NOT NULL,
  pdf_url text,
  is_revoked boolean DEFAULT false,
  revoked_reason text,
  issued_at timestamptz DEFAULT now()
);

-- =====================================================================
-- 7. Component Library in 3 Formats (Shared by all labs)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.components (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  subcategory text,
  is_free_tier boolean DEFAULT true,
  price_inr numeric(10,2) DEFAULT 0,
  dimensions_mm jsonb DEFAULT '{"width": 0, "height": 0, "depth": 0}'::jsonb,
  mass_g numeric(8,2) DEFAULT 0,
  pins jsonb NOT NULL DEFAULT '[]'::jsonb,
  electrical_params jsonb NOT NULL DEFAULT '{}'::jsonb,
  physical_params jsonb NOT NULL DEFAULT '{}'::jsonb,
  artwork_2d_svg text,
  model_3d_glb_url text,
  schematic_symbol_svg text,
  datasheet_url text,
  linked_store_sku text,
  license text NOT NULL DEFAULT 'MIT / CC-BY-4.0',
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================================
-- 8. Labs: Circuit Projects, Robots, Arenas, Test Runs
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.circuit_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  graph_jsonb jsonb NOT NULL DEFAULT '{"components":[], "wires":[]}'::jsonb,
  code text DEFAULT '',
  board text DEFAULT 'arduino_uno',
  visibility text DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'unlisted')),
  is_sample boolean DEFAULT false,
  forked_from uuid REFERENCES public.circuit_projects(id) ON DELETE SET NULL,
  thumbnail_url text,
  view_count integer DEFAULT 0,
  fork_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.circuit_project_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.circuit_projects(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  snapshot jsonb NOT NULL,
  commit_message text DEFAULT 'Autosave',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.robot_templates (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  thumbnail_url text,
  cad_mesh_url text,
  default_parts jsonb NOT NULL DEFAULT '[]'::jsonb,
  starter_code text,
  recommended_arena_id text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.robot_designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_id text REFERENCES public.robot_templates(id),
  title text NOT NULL,
  assembly_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,
  circuit_project_id uuid REFERENCES public.circuit_projects(id) ON DELETE SET NULL,
  total_mass_g numeric(8,2),
  center_of_mass jsonb DEFAULT '[0,0,0]'::jsonb,
  power_budget_mw numeric(10,2),
  thrust_to_weight_ratio numeric(5,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.arenas (
  id text PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  description text,
  environment_params jsonb NOT NULL DEFAULT '{}'::jsonb,
  obstacles jsonb NOT NULL DEFAULT '[]'::jsonb,
  scoring_rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.test_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  robot_design_id uuid REFERENCES public.robot_designs(id) ON DELETE CASCADE,
  arena_id text REFERENCES public.arenas(id),
  score numeric(8,2) DEFAULT 0,
  time_seconds numeric(8,2) DEFAULT 0,
  telemetry_summary jsonb DEFAULT '{}'::jsonb,
  replay_data_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- =====================================================================
-- 9. Rituu AI: Chat Sessions, Messages, and Quota Usage
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text DEFAULT 'Robotics Chat',
  mode text DEFAULT 'auto',
  circuit_id uuid REFERENCES public.circuit_projects(id) ON DELETE SET NULL,
  robot_id uuid REFERENCES public.robot_designs(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  mode text DEFAULT 'auto',
  off_topic boolean DEFAULT false,
  had_image boolean DEFAULT false,
  image_url text,
  model text,
  tokens integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rituu_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_ist date NOT NULL,
  messages_count integer NOT NULL DEFAULT 0 CHECK (messages_count >= 0),
  photos_count integer NOT NULL DEFAULT 0 CHECK (photos_count >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, day_ist)
);

-- =====================================================================
-- 10. Geo & Maker Shops Radar (PostGIS)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL DEFAULT 'Delhi',
  pincode text NOT NULL,
  location geography(Point, 4326) NOT NULL,
  google_place_id text UNIQUE,
  opening_hours text DEFAULT '10:00 AM - 8:00 PM (Mon-Sat)',
  categories text[] DEFAULT '{Sensors, Microcontrollers, Motors, Prototyping}',
  verified_status verified_status NOT NULL DEFAULT 'pending',
  last_verified_at timestamptz,
  photos text[] DEFAULT '{}',
  rating numeric(3,2) DEFAULT 4.5,
  review_count integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS shops_location_gist ON public.shops USING GIST(location);
CREATE INDEX IF NOT EXISTS shops_city_verified_idx ON public.shops(city, verified_status);

CREATE TABLE IF NOT EXISTS public.shop_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  component_id text REFERENCES public.components(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  in_stock boolean DEFAULT true,
  price_inr numeric(10,2),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.shop_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason text NOT NULL,
  comments text DEFAULT '',
  status text DEFAULT 'PENDING',
  created_at timestamptz DEFAULT now()
);

-- =====================================================================
-- 11. TechSavyyy Hardware Store, Products, Kits, Orders & Cart
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.product_categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  order_index integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  sku text UNIQUE NOT NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category_id text NOT NULL REFERENCES public.product_categories(id),
  price_inr numeric(10,2) NOT NULL, -- GST-inclusive gross price
  mrp_inr numeric(10,2) NOT NULL,
  gst_percent numeric(5,2) NOT NULL DEFAULT 18.0,
  stock integer NOT NULL DEFAULT 100 CHECK (stock >= 0),
  images text[] DEFAULT '{}',
  specs jsonb DEFAULT '{}'::jsonb,
  component_id text REFERENCES public.components(id) ON DELETE SET NULL,
  age_restricted boolean DEFAULT false,
  shipping_class shipping_class NOT NULL DEFAULT 'standard',
  is_active boolean DEFAULT true,
  rating numeric(3,2) DEFAULT 4.8,
  review_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.kits (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  kit_price_inr numeric(10,2) NOT NULL,
  sum_of_parts_inr numeric(10,2) NOT NULL,
  shipping_class shipping_class NOT NULL DEFAULT 'standard',
  age_restricted boolean DEFAULT false,
  linked_course_id text REFERENCES public.courses(id) ON DELETE SET NULL,
  linked_template_id text REFERENCES public.robot_templates(id) ON DELETE SET NULL,
  images text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.kit_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id text NOT NULL REFERENCES public.kits(id) ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  country text DEFAULT 'India',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  address_id uuid REFERENCES public.addresses(id),
  shipping_address jsonb NOT NULL DEFAULT '{}'::jsonb,
  subtotal_inr numeric(10,2) NOT NULL,
  gst_amount_inr numeric(10,2) NOT NULL,
  discount_inr numeric(10,2) NOT NULL DEFAULT 0,
  total_inr numeric(10,2) NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  payment_method payment_method DEFAULT 'checkout',
  razorpay_order_id text,
  razorpay_payment_id text,
  tracking_number text,
  courier text,
  invoice_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES public.products(id),
  product_name text NOT NULL,
  sku text NOT NULL,
  unit_price_inr numeric(10,2) NOT NULL,
  gst_percent numeric(5,2) NOT NULL DEFAULT 18.0,
  quantity integer NOT NULL CHECK (quantity > 0),
  total_price_inr numeric(10,2) NOT NULL
);

-- =====================================================================
-- 12. Payments Table (Links Orders & Subscriptions)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  plan_id text REFERENCES public.plans(id),
  method payment_method NOT NULL DEFAULT 'checkout',
  amount_inr numeric(10,2) NOT NULL,
  gst_amount_inr numeric(10,2) NOT NULL DEFAULT 0,
  status payment_status NOT NULL DEFAULT 'pending',
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  qr_id text,
  qr_image_url text,
  qr_expires_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================================
-- 13. System Health, Audit Log & Analytics
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.daily_stats (
  day date PRIMARY KEY,
  active_students integer DEFAULT 0,
  new_signups integer DEFAULT 0,
  projects_created integer DEFAULT 0,
  rituu_messages integer DEFAULT 0,
  rituu_photos integer DEFAULT 0,
  rituu_offtopic integer DEFAULT 0,
  revenue_inr numeric(10,2) DEFAULT 0,
  orders_count integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- =====================================================================
-- 14. Performance Indexes on Foreign Keys and Frequent Filters
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON public.profiles(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_circuit_projects_user_updated ON public.circuit_projects(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_circuit_projects_visibility ON public.circuit_projects(visibility, is_sample);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_rituu_usage_user_day ON public.rituu_usage(user_id, day_ist);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_code ON public.certificates(certificate_code);
CREATE INDEX IF NOT EXISTS idx_products_category_active ON public.products(category_id, is_active);
-- =====================================================================
-- RoboVerse Core Functions, Triggers & Security Definer RPCs
-- Migration: 20261030000002_functions_triggers.sql
-- =====================================================================

-- 1. Sequence-based Student ID Generator (e.g., RV-2026-001001)
CREATE OR REPLACE FUNCTION public.generate_student_id()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_year text;
  v_seq integer;
  v_id text;
BEGIN
  v_year := to_char(CURRENT_DATE, 'YYYY');
  v_seq := nextval('student_id_seq');
  v_id := 'RV-' || v_year || '-' || lpad(v_seq::text, 6, '0');
  RETURN v_id;
END;
$$;

-- 2. Security Helper: Check if current user is an Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 3. Security Definer: Promote/Change User Role (Admin Only)
CREATE OR REPLACE FUNCTION public.admin_promote_role(
  p_target_user_id uuid,
  p_new_role user_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required to change user roles.';
  END IF;

  UPDATE public.profiles
  SET role = p_new_role,
      updated_at = now()
  WHERE id = p_target_user_id;

  INSERT INTO public.audit_log(actor_id, action, target_type, target_id, metadata)
  VALUES (
    auth.uid(),
    'PROMOTE_ROLE',
    'profiles',
    p_target_user_id::text,
    jsonb_build_object('new_role', p_new_role)
  );
END;
$$;

-- 4. Automatic Profile Creation on Signup (Trigger on auth.users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id text;
  v_full_name text;
  v_interests text[];
  v_is_minor boolean;
BEGIN
  v_student_id := public.generate_student_id();
  
  v_full_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'name', ''),
    NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
    NULLIF(NEW.phone, ''),
    'RoboVerse Explorer'
  );

  IF NEW.raw_user_meta_data ? 'interests' THEN
    SELECT ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'interests'))
    INTO v_interests;
  ELSE
    v_interests := ARRAY['arduino', 'circuits']::text[];
  END IF;

  v_is_minor := COALESCE((NEW.raw_user_meta_data->>'is_minor')::boolean, false);

  INSERT INTO public.profiles (
    id,
    student_id,
    full_name,
    role, -- Role is ALWAYS 'student' on signup
    school_or_college,
    class_level,
    city,
    pincode,
    state,
    country,
    interests,
    is_minor,
    parent_email,
    parental_consent_at,
    location_consent,
    avatar_url,
    level,
    xp,
    streak_days
  ) VALUES (
    NEW.id,
    v_student_id,
    v_full_name,
    'student'::user_role,
    NEW.raw_user_meta_data->>'school_or_college',
    NEW.raw_user_meta_data->>'class_level',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'pincode',
    NEW.raw_user_meta_data->>'state',
    COALESCE(NEW.raw_user_meta_data->>'country', 'India'),
    v_interests,
    v_is_minor,
    NEW.raw_user_meta_data->>'parent_email',
    CASE 
      WHEN (NEW.raw_user_meta_data->>'parental_consent_given')::boolean IS TRUE THEN now() 
      ELSE NULL 
    END,
    COALESCE((NEW.raw_user_meta_data->>'location_consent')::boolean, false),
    NEW.raw_user_meta_data->>'avatar_url',
    'Rookie',
    50, -- Starter 50 XP
    1
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Realtime Presence Touch RPC ("Students working now")
CREATE OR REPLACE FUNCTION public.touch_presence(
  p_activity text DEFAULT 'Exploring Labs',
  p_project_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET last_seen_at = now(),
      current_activity = p_activity
  WHERE id = auth.uid();

  IF p_project_id IS NOT NULL THEN
    UPDATE public.circuit_projects
    SET updated_at = now()
    WHERE id = p_project_id AND user_id = auth.uid();
  END IF;
END;
$$;

-- 6. Enforce Free Plan 5-Project Limit (Trigger on circuit_projects)
CREATE OR REPLACE FUNCTION public.enforce_circuit_project_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_plan plan_tier;
  v_project_count integer;
BEGIN
  -- Sample projects are not counted towards user limit
  IF NEW.is_sample IS TRUE THEN
    RETURN NEW;
  END IF;

  -- Determine user's active plan
  SELECT COALESCE(
    (
      SELECT p.tier 
      FROM public.subscriptions s
      JOIN public.plans p ON p.id = s.plan_id
      WHERE s.user_id = NEW.user_id 
        AND s.status = 'active'
      ORDER BY s.created_at DESC
      LIMIT 1
    ),
    'free'::plan_tier
  ) INTO v_user_plan;

  -- If user is on Free tier, check count of existing non-sample projects
  IF v_user_plan = 'free'::plan_tier THEN
    SELECT COUNT(*) INTO v_project_count
    FROM public.circuit_projects
    WHERE user_id = NEW.user_id AND is_sample IS FALSE;

    IF v_project_count >= 5 THEN
      RAISE EXCEPTION 'Free plan limit reached: maximum of 5 saved projects allowed. Upgrade to RoboVerse Plus or Pro for unlimited projects.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_circuit_project_limit ON public.circuit_projects;
CREATE TRIGGER trg_check_circuit_project_limit
  BEFORE INSERT ON public.circuit_projects
  FOR EACH ROW EXECUTE FUNCTION public.enforce_circuit_project_limit();

-- 7. Rituu AI Quota Consumption RPC (Atomic limit enforcement)
CREATE OR REPLACE FUNCTION public.rituu_consume(
  p_photo boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_today_ist date;
  v_plan_tier plan_tier;
  v_max_messages integer;
  v_max_photos integer;
  v_usage_messages integer;
  v_usage_photos integer;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  -- Get date in Indian Standard Time (IST)
  v_today_ist := (now() AT TIME ZONE 'Asia/Kolkata')::date;

  -- Get current user plan
  SELECT COALESCE(
    (
      SELECT p.tier 
      FROM public.subscriptions s
      JOIN public.plans p ON p.id = s.plan_id
      WHERE s.user_id = v_user_id AND s.status = 'active'
      LIMIT 1
    ),
    'free'::plan_tier
  ) INTO v_plan_tier;

  -- Determine daily limits by plan
  IF v_plan_tier = 'pro'::plan_tier THEN
    v_max_messages := 300;
    v_max_photos := 50;
  ELSIF v_plan_tier = 'plus'::plan_tier THEN
    v_max_messages := 100;
    v_max_photos := 20;
  ELSE
    v_max_messages := 15;
    v_max_photos := 3;
  END IF;

  -- Lock and fetch today's usage row (or insert if not present)
  INSERT INTO public.rituu_usage (user_id, day_ist, messages_count, photos_count)
  VALUES (v_user_id, v_today_ist, 0, 0)
  ON CONFLICT (user_id, day_ist) DO NOTHING;

  SELECT messages_count, photos_count 
  INTO v_usage_messages, v_usage_photos
  FROM public.rituu_usage
  WHERE user_id = v_user_id AND day_ist = v_today_ist
  FOR UPDATE;

  -- Check limits
  IF p_photo THEN
    IF v_usage_photos >= v_max_photos THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'reason', 'DAILY_PHOTO_LIMIT_REACHED',
        'tier', v_plan_tier,
        'photos_used', v_usage_photos,
        'photos_limit', v_max_photos,
        'messages_used', v_usage_messages,
        'messages_limit', v_max_messages
      );
    END IF;
  ELSE
    IF v_usage_messages >= v_max_messages THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'reason', 'DAILY_MESSAGE_LIMIT_REACHED',
        'tier', v_plan_tier,
        'photos_used', v_usage_photos,
        'photos_limit', v_max_photos,
        'messages_used', v_usage_messages,
        'messages_limit', v_max_messages
      );
    END IF;
  END IF;

  -- Increment atomically
  IF p_photo THEN
    UPDATE public.rituu_usage
    SET photos_count = photos_count + 1,
        messages_count = messages_count + 1,
        updated_at = now()
    WHERE user_id = v_user_id AND day_ist = v_today_ist;
    v_usage_photos := v_usage_photos + 1;
    v_usage_messages := v_usage_messages + 1;
  ELSE
    UPDATE public.rituu_usage
    SET messages_count = messages_count + 1,
        updated_at = now()
    WHERE user_id = v_user_id AND day_ist = v_today_ist;
    v_usage_messages := v_usage_messages + 1;
  END IF;

  RETURN jsonb_build_object(
    'allowed', true,
    'tier', v_plan_tier,
    'photos_used', v_usage_photos,
    'photos_limit', v_max_photos,
    'messages_used', v_usage_messages,
    'messages_limit', v_max_messages
  );
END;
$$;

-- 8. PostGIS Spatial Nearby Shops Query RPC
CREATE OR REPLACE FUNCTION public.nearby_shops(
  lat double precision,
  lng double precision,
  radius_m double precision DEFAULT 5000,
  p_limit integer DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  name text,
  phone text,
  address text,
  city text,
  state text,
  pincode text,
  latitude double precision,
  longitude double precision,
  distance_meters double precision,
  opening_hours text,
  categories text[],
  verified_status verified_status,
  rating numeric,
  photos text[]
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    s.id,
    s.name,
    s.phone,
    s.address,
    s.city,
    s.state,
    s.pincode,
    ST_Y(s.location::geometry) as latitude,
    ST_X(s.location::geometry) as longitude,
    ST_Distance(s.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) as distance_meters,
    s.opening_hours,
    s.categories,
    s.verified_status,
    s.rating,
    s.photos
  FROM public.shops s
  WHERE ST_DWithin(s.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, radius_m)
  ORDER BY distance_meters ASC
  LIMIT p_limit;
$$;

-- 9. Server-Side Cart-To-Order RPC (Database-calculated pricing only)
CREATE OR REPLACE FUNCTION public.create_order_from_cart(
  p_address_id uuid,
  p_coupon_code text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_is_minor boolean;
  v_parent_consent timestamptz;
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric(10,2) := 0;
  v_gst_total numeric(10,2) := 0;
  v_discount numeric(10,2) := 0;
  v_total numeric(10,2) := 0;
  v_item record;
  v_user_plan plan_tier;
  v_plan_discount_pct numeric := 0;
  v_address_json jsonb;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  -- Verify user identity and minor status
  SELECT is_minor, parental_consent_at INTO v_is_minor, v_parent_consent
  FROM public.profiles WHERE id = v_user_id;

  -- Fetch address
  SELECT to_jsonb(a) INTO v_address_json
  FROM public.addresses a
  WHERE a.id = p_address_id AND a.user_id = v_user_id;

  IF v_address_json IS NULL THEN
    RAISE EXCEPTION 'Shipping address not found.';
  END IF;

  -- Ensure cart has items
  IF NOT EXISTS (SELECT 1 FROM public.cart_items WHERE user_id = v_user_id) THEN
    RAISE EXCEPTION 'Cart is empty.';
  END IF;

  -- Validate stock and age restrictions
  FOR v_item IN 
    SELECT c.product_id, c.quantity, p.name, p.price_inr, p.stock, p.gst_percent, p.age_restricted, p.sku
    FROM public.cart_items c
    JOIN public.products p ON p.id = c.product_id
    WHERE c.user_id = v_user_id
  LOOP
    IF v_item.stock < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product "%" (Available: %, Requested: %)', v_item.name, v_item.stock, v_item.quantity;
    END IF;

    IF v_item.age_restricted AND v_is_minor AND v_parent_consent IS NULL THEN
      RAISE EXCEPTION 'Parental consent is required to order age-restricted equipment ("%")', v_item.name;
    END IF;

    v_subtotal := v_subtotal + (v_item.price_inr * v_item.quantity);
  END LOOP;

  -- Member plan discount (Plus 5%, Pro 10%)
  SELECT COALESCE(
    (
      SELECT p.tier 
      FROM public.subscriptions s
      JOIN public.plans p ON p.id = s.plan_id
      WHERE s.user_id = v_user_id AND s.status = 'active'
      LIMIT 1
    ),
    'free'::plan_tier
  ) INTO v_user_plan;

  IF v_user_plan = 'pro'::plan_tier THEN
    v_plan_discount_pct := 10.0;
  ELSIF v_user_plan = 'plus'::plan_tier THEN
    v_plan_discount_pct := 5.0;
  END IF;

  IF v_plan_discount_pct > 0 THEN
    v_discount := ROUND(v_subtotal * (v_plan_discount_pct / 100.0), 2);
  END IF;

  -- Coupon discount application
  IF p_coupon_code IS NOT NULL AND p_coupon_code <> '' THEN
    DECLARE
      v_coupon record;
    BEGIN
      SELECT * INTO v_coupon FROM public.coupons 
      WHERE code = upper(p_coupon_code) AND is_active IS TRUE
        AND (valid_until IS NULL OR valid_until > now());
      
      IF v_coupon IS NOT NULL AND v_subtotal >= v_coupon.min_order_inr THEN
        DECLARE
          v_coupon_disc numeric;
        BEGIN
          v_coupon_disc := ROUND(v_subtotal * (v_coupon.discount_percent / 100.0), 2);
          IF v_coupon.max_discount_inr IS NOT NULL AND v_coupon_disc > v_coupon.max_discount_inr THEN
            v_coupon_disc := v_coupon.max_discount_inr;
          END IF;
          v_discount := v_discount + v_coupon_disc;
        END;
      END IF;
    END;
  END IF;

  v_total := GREATEST(0, v_subtotal - v_discount);
  -- 18% embedded GST component = Total - (Total / 1.18)
  v_gst_total := ROUND(v_total - (v_total / 1.18), 2);

  v_order_number := 'ROBO-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(gen_random_uuid()::text, 1, 6));

  -- Create order
  INSERT INTO public.orders (
    order_number,
    user_id,
    address_id,
    shipping_address,
    subtotal_inr,
    gst_amount_inr,
    discount_inr,
    total_inr,
    status
  ) VALUES (
    v_order_number,
    v_user_id,
    p_address_id,
    v_address_json,
    v_subtotal,
    v_gst_total,
    v_discount,
    v_total,
    'pending'
  ) RETURNING id INTO v_order_id;

  -- Create order items
  INSERT INTO public.order_items (
    order_id,
    product_id,
    product_name,
    sku,
    unit_price_inr,
    gst_percent,
    quantity,
    total_price_inr
  )
  SELECT 
    v_order_id,
    c.product_id,
    p.name,
    p.sku,
    p.price_inr,
    p.gst_percent,
    c.quantity,
    (p.price_inr * c.quantity)
  FROM public.cart_items c
  JOIN public.products p ON p.id = c.product_id
  WHERE c.user_id = v_user_id;

  -- Clear cart
  DELETE FROM public.cart_items WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal_inr', v_subtotal,
    'discount_inr', v_discount,
    'gst_amount_inr', v_gst_total,
    'total_inr', v_total
  );
END;
$$;

-- 10. Webhook Order Finalization RPC
CREATE OR REPLACE FUNCTION public.finalize_order_payment(
  p_order_id uuid,
  p_razorpay_payment_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item record;
BEGIN
  -- Mark order as paid
  UPDATE public.orders
  SET status = 'paid',
      razorpay_payment_id = p_razorpay_payment_id,
      updated_at = now()
  WHERE id = p_order_id;

  -- Decrement stock for ordered items
  FOR v_item IN SELECT product_id, quantity FROM public.order_items WHERE order_id = p_order_id LOOP
    UPDATE public.products
    SET stock = GREATEST(0, stock - v_item.quantity)
    WHERE id = v_item.product_id;
  END LOOP;
END;
$$;

-- 11. Certificate Issuance RPC (Verifies full course completion)
CREATE OR REPLACE FUNCTION public.issue_certificate(
  p_course_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_student_name text;
  v_student_id text;
  v_course_name text;
  v_track text;
  v_hours integer;
  v_total_lessons integer;
  v_completed_lessons integer;
  v_cert_code text;
  v_cert_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  -- Verify total vs completed lessons
  SELECT COUNT(*) INTO v_total_lessons
  FROM public.lessons WHERE course_id = p_course_id;

  SELECT COUNT(*) INTO v_completed_lessons
  FROM public.lesson_progress lp
  JOIN public.lessons l ON l.id = lp.lesson_id
  WHERE lp.user_id = v_user_id AND l.course_id = p_course_id AND lp.completed IS TRUE;

  IF v_total_lessons = 0 OR v_completed_lessons < v_total_lessons THEN
    RAISE EXCEPTION 'Course incomplete: % of % lessons completed.', v_completed_lessons, v_total_lessons;
  END IF;

  -- Check if already issued
  SELECT id, certificate_code INTO v_cert_id, v_cert_code
  FROM public.certificates
  WHERE user_id = v_user_id AND course_id = p_course_id;

  IF v_cert_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'status', 'ALREADY_ISSUED',
      'certificate_id', v_cert_id,
      'certificate_code', v_cert_code
    );
  END IF;

  SELECT full_name, student_id INTO v_student_name, v_student_id
  FROM public.profiles WHERE id = v_user_id;

  SELECT title, track, duration_hours INTO v_course_name, v_track, v_hours
  FROM public.courses WHERE id = p_course_id;

  v_cert_code := 'RV-CERT-' || to_char(now(), 'YYYY') || '-' || upper(substring(gen_random_uuid()::text, 1, 6));

  INSERT INTO public.certificates (
    certificate_code,
    user_id,
    course_id,
    student_name,
    student_id,
    course_name,
    track,
    hours,
    grade_score,
    qr_verification_url
  ) VALUES (
    v_cert_code,
    v_user_id,
    p_course_id,
    v_student_name,
    v_student_id,
    v_course_name,
    v_track,
    v_hours,
    98.5,
    'https://roboverse.dev/verify/' || v_cert_code
  ) RETURNING id INTO v_cert_id;

  RETURN jsonb_build_object(
    'status', 'ISSUED',
    'certificate_id', v_cert_id,
    'certificate_code', v_cert_code,
    'student_name', v_student_name,
    'course_name', v_course_name
  );
END;
$$;

-- 12. Public Certificate Verification RPC
CREATE OR REPLACE FUNCTION public.verify_certificate(
  p_certificate_code text
)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'valid', (is_revoked IS FALSE),
    'certificate_code', certificate_code,
    'student_name', student_name,
    'student_id', student_id,
    'course_name', course_name,
    'track', track,
    'hours', hours,
    'grade_score', grade_score,
    'issued_at', issued_at,
    'is_revoked', is_revoked,
    'revoked_reason', revoked_reason
  )
  FROM public.certificates
  WHERE certificate_code = upper(p_certificate_code)
  LIMIT 1;
$$;

-- 13. Admin Overview Analytics RPC
CREATE OR REPLACE FUNCTION public.admin_overview()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_res jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required.';
  END IF;

  SELECT jsonb_build_object(
    'total_students', (SELECT COUNT(*) FROM public.profiles WHERE role = 'student'),
    'active_24h', (SELECT COUNT(*) FROM public.profiles WHERE last_seen_at >= now() - interval '24 hours'),
    'active_7d', (SELECT COUNT(*) FROM public.profiles WHERE last_seen_at >= now() - interval '7 days'),
    'online_now', (SELECT COUNT(*) FROM public.profiles WHERE last_seen_at >= now() - interval '5 minutes'),
    'working_on_projects', (SELECT COUNT(*) FROM public.profiles WHERE last_seen_at >= now() - interval '15 minutes' AND current_activity ILIKE '%workbench%'),
    'projects_created', (SELECT COUNT(*) FROM public.circuit_projects WHERE is_sample IS FALSE),
    'enrollments_count', (SELECT COUNT(*) FROM public.enrollments),
    'certificates_issued', (SELECT COUNT(*) FROM public.certificates WHERE is_revoked IS FALSE),
    'rituu_messages_today', (SELECT COALESCE(SUM(messages_count), 0) FROM public.rituu_usage WHERE day_ist = (now() AT TIME ZONE 'Asia/Kolkata')::date),
    'rituu_offtopic_today', (SELECT COUNT(*) FROM public.chat_messages WHERE off_topic IS TRUE AND created_at >= (now() AT TIME ZONE 'Asia/Kolkata')::date),
    'total_revenue_inr', (SELECT COALESCE(SUM(amount_inr), 0) FROM public.payments WHERE status = 'completed'),
    'orders_count', (SELECT COUNT(*) FROM public.orders WHERE status IN ('paid', 'delivered')),
    'open_shop_reports', (SELECT COUNT(*) FROM public.shop_reports WHERE status = 'PENDING')
  ) INTO v_res;

  RETURN v_res;
END;
$$;

-- 14. Admin Students Directory RPC (No passwords, ever)
CREATE OR REPLACE FUNCTION public.admin_students(
  search_query text DEFAULT '',
  filter_plan text DEFAULT 'ALL',
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  student_id text,
  full_name text,
  email text,
  school_or_college text,
  city text,
  plan_tier text,
  current_activity text,
  xp integer,
  streak_days integer,
  last_seen_at timestamptz,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required.';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.student_id,
    p.full_name,
    u.email::text,
    p.school_or_college,
    p.city,
    COALESCE(
      (
        SELECT pl.tier::text
        FROM public.subscriptions s
        JOIN public.plans pl ON pl.id = s.plan_id
        WHERE s.user_id = p.id AND s.status = 'active'
        LIMIT 1
      ),
      'free'
    ) AS plan_tier,
    p.current_activity,
    p.xp,
    p.streak_days,
    p.last_seen_at,
    p.created_at
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE (
    search_query = '' OR
    p.full_name ILIKE '%' || search_query || '%' OR
    p.student_id ILIKE '%' || search_query || '%' OR
    u.email ILIKE '%' || search_query || '%' OR
    p.city ILIKE '%' || search_query || '%'
  )
  ORDER BY p.last_seen_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
-- =====================================================================
-- RoboVerse Row Level Security (RLS) Complete Policies
-- Migration: 20261030000003_rls_policies.sql
-- =====================================================================

-- 1. Enable RLS on all 37 tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 2. Profiles Policies
-- =====================================================================
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile details"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Prevent users from mutating student_id or role directly via trigger
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If role or student_id changed and caller is NOT a superuser/admin function
  IF (NEW.role IS DISTINCT FROM OLD.role) AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Privilege escalation prevented: Role cannot be modified directly.';
  END IF;

  IF (NEW.student_id IS DISTINCT FROM OLD.student_id) THEN
    RAISE EXCEPTION 'Student ID is permanent and immutable.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- =====================================================================
-- 3. Plans, Coupons & Webhook Events
-- =====================================================================
CREATE POLICY "Plans are publicly viewable"
  ON public.plans FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage plans"
  ON public.plans FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Active coupons are viewable"
  ON public.coupons FOR SELECT
  TO anon, authenticated
  USING (is_active IS TRUE AND (valid_until IS NULL OR valid_until > now()));

CREATE POLICY "Admins can manage coupons"
  ON public.coupons FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Webhook events: Service role only (no client access)
CREATE POLICY "Service role full access on webhook_events"
  ON public.webhook_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================================
-- 4. Subscriptions & Payments
-- =====================================================================
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Service role manages subscriptions"
  ON public.subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Service role manages payments"
  ON public.payments FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================================
-- 5. Learning: Courses, Modules, Lessons, Quizzes, Certificates
-- =====================================================================
CREATE POLICY "Courses are publicly readable"
  ON public.courses FOR SELECT
  TO anon, authenticated
  USING (is_published IS TRUE OR public.is_admin());

CREATE POLICY "Admins can manage courses"
  ON public.courses FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Modules are publicly readable"
  ON public.modules FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage modules"
  ON public.modules FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Lessons are publicly readable"
  ON public.lessons FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage lessons"
  ON public.lessons FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Quizzes are publicly readable"
  ON public.quizzes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage quizzes"
  ON public.quizzes FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Users can view their own enrollments"
  ON public.enrollments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can enroll themselves"
  ON public.enrollments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own lesson progress"
  ON public.lesson_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can save their own lesson progress"
  ON public.lesson_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson progress"
  ON public.lesson_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Certificates are viewable by owner or admin"
  ON public.certificates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Public can view valid certificates by code"
  ON public.certificates FOR SELECT
  TO anon, authenticated
  USING (is_revoked IS FALSE);

CREATE POLICY "Admins can manage certificates"
  ON public.certificates FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================================================
-- 6. Components Library (100% Free to view & simulate)
-- =====================================================================
CREATE POLICY "Components are publicly viewable"
  ON public.components FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage components"
  ON public.components FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================================================
-- 7. Labs: Circuit Projects & Versions
-- =====================================================================
CREATE POLICY "Circuit projects are viewable by owner, public or if sample"
  ON public.circuit_projects FOR SELECT
  TO anon, authenticated
  USING (
    visibility = 'public' 
    OR is_sample IS TRUE 
    OR auth.uid() = user_id 
    OR public.is_admin()
  );

CREATE POLICY "Authenticated users can create circuit projects"
  ON public.circuit_projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own circuit projects"
  ON public.circuit_projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete their own circuit projects"
  ON public.circuit_projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Circuit project versions viewable by project viewers"
  ON public.circuit_project_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.circuit_projects cp
      WHERE cp.id = project_id 
        AND (cp.user_id = auth.uid() OR cp.visibility = 'public' OR public.is_admin())
    )
  );

CREATE POLICY "Project owners can insert project versions"
  ON public.circuit_project_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.circuit_projects cp
      WHERE cp.id = project_id AND cp.user_id = auth.uid()
    )
  );

-- =====================================================================
-- 8. Robotic Design Lab: Templates, Designs, Arenas, Test Runs
-- =====================================================================
CREATE POLICY "Robot templates are publicly viewable"
  ON public.robot_templates FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage robot templates"
  ON public.robot_templates FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Users can view their own robot designs"
  ON public.robot_designs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can manage their own robot designs"
  ON public.robot_designs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Arenas are publicly viewable"
  ON public.arenas FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage arenas"
  ON public.arenas FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Users can view their test runs"
  ON public.test_runs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert their test runs"
  ON public.test_runs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can log activity events"
  ON public.activity_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and admins can view activity events"
  ON public.activity_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- =====================================================================
-- 9. Rituu AI: Sessions, Messages, and Usage
-- =====================================================================
CREATE POLICY "Users can view their own chat sessions"
  ON public.chat_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can manage their own chat sessions"
  ON public.chat_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own chat messages"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert chat messages"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their chat messages"
  ON public.chat_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own rituu usage"
  ON public.rituu_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- =====================================================================
-- 10. Geo & Maker Shops Radar
-- =====================================================================
CREATE POLICY "Verified shops are publicly viewable"
  ON public.shops FOR SELECT
  TO anon, authenticated
  USING (verified_status = 'verified' OR auth.uid() = owner_id OR public.is_admin());

CREATE POLICY "Shop owners and users can register shops"
  ON public.shops FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id OR owner_id IS NULL);

CREATE POLICY "Shop owners and admins can update shops"
  ON public.shops FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id OR public.is_admin())
  WITH CHECK (auth.uid() = owner_id OR public.is_admin());

CREATE POLICY "Shop inventory is publicly viewable"
  ON public.shop_inventory FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Shop owners and admins can manage inventory"
  ON public.shop_inventory FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.shops s 
      WHERE s.id = shop_id AND (s.owner_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users can submit shop reports"
  ON public.shop_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users and admins can view shop reports"
  ON public.shop_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id OR public.is_admin());

CREATE POLICY "Admins can update shop reports"
  ON public.shop_reports FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- =====================================================================
-- 11. TechSavyyy Store: Products, Categories, Cart, Orders
-- =====================================================================
CREATE POLICY "Product categories are publicly viewable"
  ON public.product_categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage product categories"
  ON public.product_categories FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Products are publicly viewable"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (is_active IS TRUE OR public.is_admin());

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Kits are publicly viewable"
  ON public.kits FOR SELECT
  TO anon, authenticated
  USING (is_active IS TRUE OR public.is_admin());

CREATE POLICY "Admins can manage kits"
  ON public.kits FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Kit items are publicly viewable"
  ON public.kit_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage kit items"
  ON public.kit_items FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Users can manage their addresses"
  ON public.addresses FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their cart items"
  ON public.cart_items FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Users can view their order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

-- =====================================================================
-- 12. Audit Log & Daily Stats
-- =====================================================================
CREATE POLICY "Admins can view audit logs"
  ON public.audit_log FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can view daily stats"
  ON public.daily_stats FOR SELECT
  TO authenticated
  USING (public.is_admin());
-- =====================================================================
-- RoboVerse Storage Buckets & Policies
-- Migration: 20261030000004_storage_buckets.sql
-- =====================================================================

-- 1. Create Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('component-assets', 'component-assets', true, 52428800, ARRAY['model/gltf-binary', 'model/gltf+json', 'image/svg+xml', 'image/png', 'image/jpeg', 'application/pdf']),
  ('project-thumbnails', 'project-thumbnails', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('shop-photos', 'shop-photos', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('certificates', 'certificates', false, 10485760, ARRAY['application/pdf', 'image/png'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage RLS Policies

-- Public Read for Public Buckets
CREATE POLICY "Public Read for component-assets"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'component-assets');

CREATE POLICY "Public Read for project-thumbnails"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'project-thumbnails');

CREATE POLICY "Public Read for avatars"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "Public Read for shop-photos"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'shop-photos');

-- Admin write for component-assets
CREATE POLICY "Admin write for component-assets"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'component-assets' AND public.is_admin())
  WITH CHECK (bucket_id = 'component-assets' AND public.is_admin());

-- User folder-scoped write for project-thumbnails
CREATE POLICY "Users upload project-thumbnails in their own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'project-thumbnails' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users update project-thumbnails in their own folder"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'project-thumbnails' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users delete project-thumbnails in their own folder"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'project-thumbnails' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- User folder-scoped write for avatars
CREATE POLICY "Users upload avatar in their own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users update avatar in their own folder"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Shop photos upload by authenticated users / admins
CREATE POLICY "Authenticated users upload shop-photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'shop-photos');

-- Certificates (Private Bucket: accessible by owner or admin)
CREATE POLICY "Certificates private read by owner or admin"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'certificates' 
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin())
  );

CREATE POLICY "Certificates written by service role or admin"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'certificates' 
    AND public.is_admin()
  );
-- =====================================================================
-- RoboVerse Master Production Seed Data
-- Database: seed.sql
-- =====================================================================

-- 1. Subscription Plans & Pricing (Inclusive of 18% GST)
INSERT INTO public.plans (id, tier, name, tagline, badge, is_popular, pricing, features)
VALUES
(
  'plan_free',
  'free',
  'Free Explorer',
  'Essential robotics education and circuit simulation open to all students globally.',
  'Forever Free',
  false,
  '[
    {"cycle": "monthly", "price_inr_inclusive_gst": 0, "label": "Free Forever"}
  ]'::jsonb,
  '{
    "max_saved_projects": 5,
    "allow_private_projects": false,
    "full_component_library": true,
    "advanced_sim_tools": false,
    "beginner_lessons_free": 16,
    "rituu_daily_messages": 15,
    "rituu_daily_photos": 3,
    "store_discount_percent": 0,
    "official_certificates": false,
    "live_classes_monthly": 0
  }'::jsonb
),
(
  'plan_plus',
  'plus',
  'Plus Builder',
  'Unlimited projects, virtual oscilloscope, recorded masterclasses & certificates.',
  'Most Popular',
  true,
  '[
    {"cycle": "monthly", "price_inr_inclusive_gst": 299, "label": "₹299 / month"},
    {"cycle": "quarterly", "price_inr_inclusive_gst": 749, "discount_pct": 16, "label": "₹749 / quarter"},
    {"cycle": "yearly", "price_inr_inclusive_gst": 2499, "discount_pct": 30, "label": "₹2,499 / year"}
  ]'::jsonb,
  '{
    "max_saved_projects": -1,
    "allow_private_projects": true,
    "full_component_library": true,
    "advanced_sim_tools": true,
    "beginner_lessons_free": 16,
    "rituu_daily_messages": 100,
    "rituu_daily_photos": 20,
    "store_discount_percent": 5,
    "official_certificates": true,
    "live_classes_monthly": 0
  }'::jsonb
),
(
  'plan_pro',
  'pro',
  'Pro Engineer',
  'Live interactive masterclasses, mentor code reviews, machine learning track & 10% store discount.',
  'Career Ready',
  false,
  '[
    {"cycle": "monthly", "price_inr_inclusive_gst": 999, "label": "₹999 / month"},
    {"cycle": "quarterly", "price_inr_inclusive_gst": 2699, "discount_pct": 10, "label": "₹2,699 / quarter"},
    {"cycle": "yearly", "price_inr_inclusive_gst": 8999, "discount_pct": 25, "label": "₹8,999 / year"}
  ]'::jsonb,
  '{
    "max_saved_projects": -1,
    "allow_private_projects": true,
    "full_component_library": true,
    "advanced_sim_tools": true,
    "beginner_lessons_free": 16,
    "rituu_daily_messages": 300,
    "rituu_daily_photos": 50,
    "store_discount_percent": 10,
    "official_certificates": true,
    "live_classes_monthly": 8,
    "machine_learning_track": true,
    "mentor_project_review": true
  }'::jsonb
),
(
  'plan_institution',
  'institution',
  'RoboVerse Campus',
  'Institutional LMS licensing with teacher cockpit, student cohorts, and bulk hardware provisioning.',
  'For Schools & Colleges',
  false,
  '[
    {"cycle": "yearly", "price_inr_inclusive_gst": 499, "label": "₹499 / student / year (Min 50 students)"}
  ]'::jsonb,
  '{
    "max_saved_projects": -1,
    "allow_private_projects": true,
    "full_component_library": true,
    "advanced_sim_tools": true,
    "teacher_dashboard": true,
    "cohort_management": true,
    "bulk_student_ids": true,
    "rituu_daily_messages": 200,
    "rituu_daily_photos": 30,
    "store_discount_percent": 12
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  pricing = EXCLUDED.pricing,
  features = EXCLUDED.features;

-- 2. Product Categories
INSERT INTO public.product_categories (id, name, slug, description, order_index)
VALUES
  ('cat_boards', 'Microcontroller Boards', 'microcontrollers', 'Arduino, ESP32, Raspberry Pi Pico development boards', 1),
  ('cat_proto', 'Prototyping & Wiring', 'prototyping', 'Breadboards, jumper wires, passive assortments, cables', 2),
  ('cat_sensors', 'Sensors & Inputs', 'sensors', 'Ultrasonic, IMU, IR, gas, temperature, soil, light sensors', 3),
  ('cat_motion', 'Motors, Servos & Drivers', 'motion', 'DC gear motors, servos, steppers, BLDC motors, motor shields', 4),
  ('cat_displays', 'Displays & Indicators', 'displays', 'LCD 16x2, OLED, 7-segment, RGB LED arrays', 5),
  ('cat_power', 'Power & Batteries', 'power', 'Li-ion 18650 cells, battery holders, 5V DC adapters, power hubs', 6),
  ('cat_tools', 'Tools & Machinery', 'tools', 'Soldering irons, multimeters, wire strippers, DC bench supplies', 7),
  ('cat_drones', 'Drone & Aerial Robotics', 'drones', 'Quadcopter frames, flight controllers, ESCs, LiPo batteries', 8),
  ('cat_kits', 'Robotics Learning Kits', 'kits', 'All-in-one verified project kits with step-by-step curriculum', 9)
ON CONFLICT (id) DO NOTHING;

-- 3. Hardware Store Products (GST 18% Inclusive)
INSERT INTO public.products (id, sku, name, slug, category_id, price_inr, mrp_inr, gst_percent, stock, age_restricted, shipping_class, specs, description)
VALUES
-- Boards
('prod_uno_compat', 'RV-BRD-001', 'Arduino Uno R3 Compatible (CH340 + Cable)', 'arduino-uno-r3-compatible', 'cat_boards', 399, 599, 18, 250, false, 'standard', '{"mcu": "ATmega328P", "clock": "16MHz", "voltage": "5V", "io_pins": 14}', 'Workhorse beginner microcontroller with pre-loaded Optiboot bootloader and blue USB cable.'),
('prod_uno_orig', 'RV-BRD-002', 'Arduino Uno R3 Original (Made in Italy)', 'arduino-uno-r3-original', 'cat_boards', 2650, 3100, 18, 50, false, 'standard', '{"mcu": "ATmega328P", "clock": "16MHz", "origin": "Italy", "usb_chip": "ATmega16U2"}', 'Official Italian Arduino Uno R3 with genuine holographic anti-counterfeit seal.'),
('prod_nano_compat', 'RV-BRD-003', 'Arduino Nano V3 Compatible (Mini-USB)', 'arduino-nano-compatible', 'cat_boards', 349, 499, 18, 180, false, 'standard', '{"mcu": "ATmega328P", "clock": "16MHz", "form_factor": "Breadboard friendly"}', 'Compact 30-pin DIP breadboard-friendly microcontroller.'),
('prod_esp32_devkit', 'RV-BRD-004', 'ESP32 DevKit V1 (Wi-Fi + Bluetooth BLE)', 'esp32-devkit-v1', 'cat_boards', 499, 799, 18, 120, false, 'standard', '{"cpu": "Dual-Core Xtensa 240MHz", "wireless": "Wi-Fi 802.11 b/g/n + BLE 4.2"}', 'High-performance IoT controller with dual-core processor and integrated antennas.'),
('prod_pico_rp2040', 'RV-BRD-005', 'Raspberry Pi Pico (RP2040 Dual ARM Cortex)', 'raspberry-pi-pico', 'cat_boards', 449, 599, 18, 90, false, 'standard', '{"cpu": "Dual ARM Cortex-M0+ 133MHz", "sram": "264KB"}', 'Flexible microcontroller board from Raspberry Pi with programmable I/O (PIO).'),

-- Prototyping
('prod_breadboard_830', 'RV-PRT-001', 'Solderless Breadboard 830 Tie Points', 'breadboard-830-points', 'cat_proto', 129, 199, 18, 500, false, 'standard', '{"points": 830, "power_rails": 4}', 'High-retention phosphor bronze nickel-plated spring clips with self-adhesive backing.'),
('prod_jumpers_40_mm', 'RV-PRT-002', 'Jumper Wires 40 pcs (Male-to-Male 20cm)', 'jumper-wires-mm-40', 'cat_proto', 69, 120, 18, 400, false, 'standard', '{"count": 40, "length": "20cm", "type": "M-M"}', 'Rainbow ribbon cable peelable jumper wires with molded terminals.'),
('prod_jumpers_40_mf', 'RV-PRT-003', 'Jumper Wires 40 pcs (Male-to-Female 20cm)', 'jumper-wires-mf-40', 'cat_proto', 69, 120, 18, 400, false, 'standard', '{"count": 40, "length": "20cm", "type": "M-F"}', 'Essential for connecting sensor breakout modules to Arduino boards.'),
('prod_jumpers_40_ff', 'RV-PRT-004', 'Jumper Wires 40 pcs (Female-to-Female 20cm)', 'jumper-wires-ff-40', 'cat_proto', 69, 120, 18, 400, false, 'standard', '{"count": 40, "length": "20cm", "type": "F-F"}', 'Ideal for sensor-to-module and display interconnects.'),
('prod_resistor_pack', 'RV-PRT-005', 'Carbon Film Resistor Assortment 600 pcs (30 values)', 'resistor-assortment-600', 'cat_proto', 199, 299, 18, 300, false, 'standard', '{"count": 600, "values_count": 30, "power": "1/4 Watt"}', 'Includes 10Ω to 1MΩ resistors clearly labeled in labeled sleeves.'),
('prod_led_pack_100', 'RV-PRT-006', 'Diffused LED Assortment 100 pcs (5 Colors)', 'led-assortment-100', 'cat_proto', 99, 160, 18, 350, false, 'standard', '{"colors": ["Red", "Green", "Yellow", "Blue", "White"], "size": "5mm"}', 'Bright 5mm diffused LEDs with 20mA max continuous current.'),
('prod_rgb_led_5', 'RV-PRT-007', 'Common Cathode RGB LED 5 pcs', 'rgb-led-common-cathode-5', 'cat_proto', 49, 99, 18, 200, false, 'standard', '{"type": "Common Cathode", "size": "5mm"}', '4-lead RGB LEDs for full-spectrum color mixing labs.'),
('prod_pushbuttons_10', 'RV-PRT-008', 'Mini Momentary Push Buttons 10 pcs', 'tactile-push-buttons-10', 'cat_proto', 49, 80, 18, 300, false, 'standard', '{"size": "6x6x5mm", "type": "SPST Momentary"}', 'Breadboard-snapping tactile switches for user input triggers.'),
('prod_potentiometer_10k', 'RV-PRT-009', 'Linear Rotary Potentiometer 10kΩ with Knob', 'potentiometer-10k-rotary', 'cat_proto', 29, 60, 18, 250, false, 'standard', '{"resistance": "10k Ohm", "taper": "Linear (B)"}', 'Breadboard friendly 3-terminal rotary knob for analog reading lessons.'),
('prod_buzzer_active', 'RV-PRT-010', '5V Active Buzzer Module', 'active-buzzer-5v', 'cat_proto', 25, 50, 18, 250, false, 'standard', '{"voltage": "5V", "sound_output": "85dB at 10cm"}', 'Piezoelectric buzzer with internal oscillation circuit for simple high/low tones.'),
('prod_ldr_sensor', 'RV-PRT-011', 'LDR 5mm Light Dependent Resistor', 'ldr-photoresistor-5mm', 'cat_proto', 12, 25, 18, 400, false, 'standard', '{"dark_resistance": "1M Ohm", "light_resistance": "10k Ohm"}', 'Cadmium-sulfide photoresistor for automatic light detection.'),

-- Sensors
('prod_hc_sr04', 'RV-SNS-001', 'HC-SR04 Ultrasonic Distance Sensor', 'hc-sr04-ultrasonic', 'cat_sensors', 89, 150, 18, 300, false, 'standard', '{"range": "2cm - 400cm", "accuracy": "3mm", "trigger_pulse": "10us"}', 'Dual-transducer ultrasonic sonar module for obstacle avoidance and range finding.'),
('prod_ir_obstacle', 'RV-SNS-002', 'IR Infrared Obstacle Avoidance Sensor', 'ir-obstacle-avoidance-module', 'cat_sensors', 49, 99, 18, 250, false, 'standard', '{"range": "2cm - 30cm", "potentiometer": "Sensitivity adjustment"}', 'Active infrared reflective sensor for close-proximity detection.'),
('prod_ir_line_single', 'RV-SNS-003', 'TCRT5000 Single IR Line Tracker Module', 'tcrt5000-line-sensor', 'cat_sensors', 55, 99, 18, 200, false, 'standard', '{"phototransistor": "TCRT5000", "output": "Digital + Analog"}', 'Contrast reflection sensor optimized for distinguishing black lines on white surfaces.'),
('prod_ir_line_array_5', 'RV-SNS-004', '5-Channel High Precision IR Line Tracking Sensor Array', '5ch-ir-line-tracking-array', 'cat_sensors', 249, 399, 18, 150, false, 'standard', '{"channels": 5, "spacing": "15mm", "pitch": "Ideal for fast line followers"}', '5-sensor integrated array with onboard indicator LEDs for PID line-follower robots.'),
('prod_pir_sensor', 'RV-SNS-005', 'HC-SR501 Pyroelectric PIR Motion Sensor', 'pir-motion-sensor-hc-sr501', 'cat_sensors', 99, 180, 18, 180, false, 'standard', '{"sensing_angle": "120 degrees", "delay_time": "Adjustable 0.3s - 5min"}', 'Human body infrared passive motion sensor with Fresnel dome lens.'),
('prod_dht11', 'RV-SNS-006', 'DHT11 Temperature & Humidity Sensor Breakout', 'dht11-temperature-humidity', 'cat_sensors', 99, 180, 18, 200, false, 'standard', '{"temp_range": "0-50 C", "humidity_range": "20-90% RH"}', 'Calibrated digital output composite temperature and humidity sensor.'),
('prod_mpu6050', 'RV-SNS-007', 'MPU-6050 6-Axis Gyroscope & Accelerometer', 'mpu6050-gyro-accelerometer', 'cat_sensors', 159, 299, 18, 160, false, 'standard', '{"gyro_range": "+-2000 deg/s", "accel_range": "+-16g", "protocol": "I2C"}', '6-DOF motion tracking sensor essential for drone flight controllers and self-balancing robots.'),
('prod_flex_sensor', 'RV-SNS-008', '2.2" Flexible Bend Sensor', 'flex-sensor-2-2-inch', 'cat_sensors', 549, 799, 18, 80, false, 'standard', '{"flat_resistance": "10k Ohm", "bend_resistance": "Up to 30k Ohm"}', 'Resistive bend sensor for bionic robotic hand finger telemetry.'),

-- Motion & Actuators
('prod_sg90_servo', 'RV-ACT-001', 'TowerPro SG90 9g Micro Servo Motor 180°', 'sg90-micro-servo-9g', 'cat_motion', 139, 220, 18, 350, false, 'standard', '{"torque": "1.8 kg-cm", "operating_speed": "0.1 s/60deg", "rotation": "180 degrees"}', 'Lightweight micro servo with horns and screws for steering, pan-tilt and robotic fingers.'),
('prod_mg90s_servo', 'RV-ACT-002', 'MG90S Full Metal Gear Micro Servo 180°', 'mg90s-metal-gear-servo', 'cat_motion', 249, 399, 18, 200, false, 'standard', '{"torque": "2.2 kg-cm", "gears": "Metal alloy", "bearing": "Ball bearing"}', 'Durable metal-gear servo designed for high-stress robotic arm joints.'),
('prod_tt_motor_wheel', 'RV-ACT-003', 'Yellow TT Dual-Shaft DC Gear Motor with 65mm Wheel', 'tt-motor-with-wheel', 'cat_motion', 119, 199, 18, 300, false, 'standard', '{"gear_ratio": "1:48", "voltage": "3-6V", "speed": "200 RPM at 6V"}', 'High-torque DC gearbox motor paired with high-traction rubber tire wheel.'),
('prod_l298n_driver', 'RV-ACT-004', 'L298N Dual H-Bridge Motor Driver Module', 'l298n-dual-hbridge-driver', 'cat_motion', 169, 280, 18, 250, false, 'standard', '{"peak_current": "2A per bridge", "operating_voltage": "5V - 35V", "heatsink": "Aluminum"}', 'High-power dual DC motor and 4-phase stepper motor controller with screw terminals.'),
('prod_stepper_28byj', 'RV-ACT-005', '28BYJ-48 5V Stepper Motor + ULN2003 Driver Board', '28byj-48-stepper-uln2003', 'cat_motion', 179, 299, 18, 150, false, 'standard', '{"stride_angle": "5.625 deg", "voltage": "5V", "phases": 4}', 'Precision positional stepper motor kit for robotic turntable mechanisms.'),
('prod_2wd_chassis', 'RV-ACT-006', '2WD Smart Robot Car Chassis Kit', '2wd-smart-robot-car-chassis', 'cat_motion', 449, 699, 18, 120, false, 'standard', '{"material": "Laser-cut acrylic", "wheels": 2, "castor": 1, "battery_box": "Included"}', 'Complete mechanical platform with speed encoder disks, rocker switch, and mounting holes.'),
('prod_caster_wheel', 'RV-ACT-007', 'Ball Caster Wheel (Omni-Directional)', 'ball-caster-wheel', 'cat_motion', 39, 80, 18, 200, false, 'standard', '{"ball_diameter": "15mm", "bracket": "Steel"}', 'Smooth low-friction 360-degree support wheel for differential drive mobile robots.'),

-- Displays
('prod_lcd_16x2_i2c', 'RV-DSP-001', '16x2 Character LCD with I2C Backpack Module', '16x2-lcd-display-i2c', 'cat_displays', 229, 380, 18, 200, false, 'standard', '{"resolution": "16 cols x 2 rows", "backlight": "Blue/White", "protocol": "I2C (Address 0x27)"}', 'Alphanumeric display requiring only 2 data wires (SDA and SCL) instead of 16 pins.'),
('prod_oled_096_i2c', 'RV-DSP-002', '0.96" Monochrome I2C OLED Display (128x64)', 'oled-display-0-96-inch', 'cat_displays', 299, 450, 18, 150, false, 'standard', '{"resolution": "128x64", "driver": "SSD1306", "color": "Blue/Yellow-Blue"}', 'Crisp high-contrast graphical display for showing live telemetry graphs and face expressions.'),
('prod_relay_1ch', 'RV-DSP-003', '1-Channel 5V Relay Module with Optocoupler', '1-channel-relay-module-5v', 'cat_displays', 69, 120, 18, 220, false, 'standard', '{"trigger": "Low level active", "switching_capacity": "10A 250V AC / 10A 30V DC"}', 'Opto-isolated electro-mechanical switch for controlling real-world lights and appliances.'),

-- Power & Mechanics
('prod_battery_holder_18650', 'RV-PWR-001', '2-Cell 18650 Battery Holder with Leads', '2-cell-18650-battery-holder', 'cat_power', 59, 110, 18, 250, false, 'standard', '{"configuration": "2S (7.4V nominal)", "leads": "Red and Black 15cm"}', 'Rigid plastic case for dual 18650 rechargeable batteries to power robot motors.'),
('prod_18650_cell', 'RV-PWR-002', 'Li-ion 18650 Rechargeable Cell 2600mAh (High Drain)', '18650-rechargeable-cell-2600mah', 'cat_power', 199, 320, 18, 200, false, 'battery', '{"capacity": "2600mAh", "nominal_voltage": "3.7V", "chemistry": "Li-ion"}', 'Grade-A rechargeable lithium-ion cell with built-in safety vent.'),
('prod_power_supply_5v3a', 'RV-PWR-003', '5V 3A DC Regulated Power Adapter', '5v-3a-dc-power-adapter', 'cat_power', 299, 450, 18, 120, false, 'standard', '{"input": "100-240V AC", "output": "5V 3A DC", "connector": "5.5x2.1mm barrel"}', 'High-current bench adapter preventing brownout resets when driving multiple servos.'),
('prod_robotic_hand_frame', 'RV-MCH-001', '5-Finger Acrylic Bionic Robotic Hand Structure Kit', 'robotic-hand-acrylic-structure', 'cat_motion', 599, 899, 18, 60, false, 'standard', '{"fingers": 5, "material": "Black acrylic", "articulation": "Individual finger tendons"}', 'Mechanical skeleton for robotic hand with internal pull-wires.'),
('prod_robotic_arm_frame', 'RV-MCH-002', '4-DOF Robotic Arm Mechanical Structure Kit', '4-dof-robotic-arm-mechanical-kit', 'cat_motion', 599, 899, 18, 60, false, 'standard', '{"axes": "4-Degree of Freedom", "material": "Laser-cut 3mm acrylic"}', 'Precision arm structure with rotating base, shoulder, elbow and gripper clamp.'),
('prod_self_balance_frame', 'RV-MCH-003', 'Self-Balancing 2-Wheel Inverted Pendulum Chassis Kit', 'self-balancing-robot-chassis', 'cat_motion', 349, 550, 18, 70, false, 'standard', '{"decks": 2, "mounting": "Vertical battery and motor alignment"}', 'Chassis designed with high center of mass for optimal PID balancing demonstrations.'),

-- Tools & Machinery (Age Restricted / Heating / Cutting)
('prod_multimeter_digital', 'RV-TOL-001', 'Digital Multimeter with Probes & Continuity Buzzer', 'digital-multimeter-probes', 'cat_tools', 449, 699, 18, 120, false, 'standard', '{"measurement": "DC/AC V, DC A, Resistance, Continuity, Diode"}', 'Indispensable diagnostic instrument for verifying circuit voltages and locating open circuits.'),
('prod_soldering_iron_60w', 'RV-TOL-002', '60W Temperature-Adjustable Soldering Iron', '60w-adjustable-soldering-iron', 'cat_tools', 499, 799, 18, 90, true, 'standard', '{"power": "60W", "temp_range": "200C - 450C", "tip": "Replaceable ceramic heater"}', 'Precision heating tool for assembling permanent electronic circuits. Adult supervision required.'),
('prod_solder_wire_50g', 'RV-TOL-003', 'Lead-Free Rosin Core Solder Wire 50g Reel', 'lead-free-solder-wire-50g', 'cat_tools', 99, 180, 18, 150, false, 'standard', '{"diameter": "0.8mm", "core": "2% Rosin Flux", "alloy": "Lead-Free Sn99.3 Cu0.7"}', 'Environmentally safe lead-free solder with low melting point.'),
('prod_wire_stripper', 'RV-TOL-004', 'Automatic Precision Wire Stripper & Cutter', 'automatic-wire-stripper-cutter', 'cat_tools', 249, 399, 18, 100, true, 'standard', '{"range": "10-24 AWG", "crimp": "Insulated and non-insulated terminals"}', 'Self-adjusting stripper for single-squeeze insulation removal without conductor damage.'),
('prod_safety_goggles', 'RV-TOL-005', 'Anti-Fog Workshop Eye Safety Goggles', 'workshop-safety-goggles', 'cat_tools', 149, 220, 18, 200, false, 'standard', '{"certification": "ANSI Z87.1", "lens": "Polycarbonate anti-scratch"}', 'Protects eyes from flying wire snippets, hot solder spatter and drone propeller fragments.'),
('prod_glue_gun', 'RV-TOL-006', 'Hot Melt Glue Gun 20W with 5 Glue Sticks', 'hot-melt-glue-gun-20w', 'cat_tools', 299, 450, 18, 100, true, 'standard', '{"power": "20W", "stick_diameter": "7mm"}', 'Rapid mechanical bonding tool for securing sensors and chassis parts.'),
('prod_soldering_station', 'RV-TOL-007', 'Digital ESD-Safe Soldering Station (60W LCD)', 'digital-soldering-station-60w', 'cat_tools', 2299, 3200, 18, 30, true, 'standard', '{"heating": "PID Temperature stabilization +-2C", "display": "LED/LCD"}', 'Professional bench soldering station with stand, sponge and sleep mode.'),
('prod_bench_power_supply', 'RV-TOL-008', 'DC Benchtop Variable Power Supply 30V 5A', 'dc-bench-power-supply-30v-5a', 'cat_tools', 3499, 4999, 18, 25, false, 'standard', '{"output": "0-30V, 0-5A Variable", "display": "4-digit LED voltage and current meter"}', 'Laboratory power supply with constant voltage (CV) and constant current (CC) limiters.'),

-- Drone Parts (Regulated Shipping, 18+ / Adult Consent)
('prod_drone_frame_f450', 'RV-DRN-001', 'F450 Quadcopter Drone Frame with Integrated PDB', 'f450-quadcopter-frame-pdb', 'cat_drones', 799, 1200, 18, 50, false, 'standard', '{"wheelbase": "450mm", "arms": "Glass-fiber reinforced polyamide"}', 'Durable 450mm drone frame with built-in copper power distribution board traces.'),
('prod_bldc_2212_motor', 'RV-DRN-002', 'A2212 1000KV Brushless BLDC Motor', 'a2212-1000kv-bldc-motor', 'cat_drones', 449, 699, 18, 120, false, 'standard', '{"kv": 1000, "max_efficiency_current": "4-10A (>75%)", "shaft": "3.17mm"}', 'High-efficiency outrunner brushless motor providing ~800g thrust with 1045 propellers.'),
('prod_esc_30a', 'RV-DRN-003', '30A SimonK Firmware Brushless ESC with 5V 2A BEC', '30a-simonk-brushless-esc', 'cat_drones', 499, 750, 18, 120, false, 'standard', '{"continuous_current": "30A", "peak_current": "40A for 10s", "firmware": "SimonK Fast PWM"}', 'Electronic speed controller with rapid throttle response for multicopters.'),
('prod_propellers_1045', 'RV-DRN-004', '1045 Propeller Set (2x CW + 2x CCW with Bushings)', '1045-propeller-set-4pcs', 'cat_drones', 199, 320, 18, 150, true, 'standard', '{"diameter": "10 inch", "pitch": "4.5 inch"}', 'Aerodynamically balanced nylon propellers for 450-class quadcopters.'),
('prod_flight_controller', 'RV-DRN-005', 'Open-Source Drone Flight Controller with Gyro & Baro', 'open-source-drone-flight-controller', 'cat_drones', 1999, 2800, 18, 40, true, 'regulated_drone', '{"sensors": "InvenSense IMU + High precision Barometer", "firmware": "Betaflight/ArduPilot support"}', 'Autonomous flight stabilization controller with altitude hold. DGCA compliance notice applies.'),
('prod_lipo_3s_2200', 'RV-DRN-006', '3S 11.1V 2200mAh 35C LiPo Battery Pack with XT60', '3s-lipo-battery-2200mah-35c', 'cat_drones', 1599, 2400, 18, 60, true, 'battery', '{"voltage": "11.1V 3-Cell", "capacity": "2200mAh", "discharge_rate": "35C"}', 'High-discharge lithium-polymer flight battery. Strict safety handling required.'),
('prod_transmitter_receiver', 'RV-DRN-007', '6-Channel 2.4GHz AFHDS Radio Transmitter + Receiver', '6ch-2-4ghz-radio-transmitter-receiver', 'cat_drones', 4999, 6999, 18, 30, true, 'regulated_drone', '{"channels": 6, "band": "2.408 - 2.475 GHz", "range": "Up to 1.5 km"}', 'Digital proportional remote control system for aeromodelling and drone piloting.'),
('prod_pdb_board', 'RV-DRN-008', 'Multirotor Power Distribution Board with Dual BEC', 'drone-power-distribution-board-bec', 'cat_drones', 149, 250, 18, 80, false, 'standard', '{"outputs": "5V 2A and 12V 500mA BEC", "max_current": "100A"}', 'Clean power splitter for powering flight controller, FPV camera and 4 ESCs.')
ON CONFLICT (id) DO UPDATE SET
  price_inr = EXCLUDED.price_inr,
  stock = EXCLUDED.stock;

-- 4. 10 Comprehensive Learning Kits (Linked to Curriculum)
INSERT INTO public.kits (id, name, slug, description, kit_price_inr, sum_of_parts_inr, shipping_class, age_restricted)
VALUES
(
  'kit_arduino_starter',
  'RoboVerse Arduino Starter Kit',
  'arduino-starter-kit',
  'The complete beginner bundle: Arduino Uno, breadboard, 3 jumper sets, resistors, LEDs, RGB LED, buttons, 2 pots, buzzer, 2 LDRs, and 16x2 I2C LCD.',
  1199,
  1467,
  'standard',
  false
),
(
  'kit_line_follower',
  'Autonomous Line Following Robot Kit',
  'line-following-robot-kit',
  'Build a championship-ready line tracer: Arduino Uno, L298N driver, 2WD chassis, ball caster, 5-channel high-speed IR array, 18650 holder, and jumpers.',
  1199,
  1433,
  'standard',
  false
),
(
  'kit_obstacle_avoiding',
  'Obstacle Avoiding Autonomous Rover Kit',
  'obstacle-avoiding-rover-kit',
  'Radar-guided rover: Arduino Uno, L298N motor driver, 2WD chassis, caster, HC-SR04 sonar sensor, SG90 servo turret, 18650 battery holder, and jumpers.',
  1299,
  1412,
  'standard',
  false
),
(
  'kit_robotic_hand',
  '5-Finger Bionic Robotic Hand Kit',
  'bionic-robotic-hand-kit',
  'Anatomical robotics: Arduino Uno, 5x SG90 servos, 5x potentiometers, acrylic hand frame, breadboard, jumpers, and 5V 3A power supply.',
  1999,
  2404,
  'standard',
  false
),
(
  'kit_robotic_arm',
  '4-DOF Articulated Robotic Arm Kit',
  '4dof-robotic-arm-kit',
  'Industrial robotics at home: Arduino Uno, 4x metal-gear MG90S servos, laser-cut acrylic arm frame, breadboard, jumpers, and 5V 3A power supply.',
  2199,
  2560,
  'standard',
  false
),
(
  'kit_self_balancing',
  'Two-Wheel Self-Balancing Robot Kit',
  'self-balancing-robot-kit',
  'Master PID control: Arduino Nano, MPU-6050 IMU, L298N driver, 2 gear motors, high-center balance chassis, 18650 holder, and jumpers.',
  1249,
  1392,
  'standard',
  false
),
(
  'kit_sensor_learning',
  'RoboVerse Sensor Mastery Kit',
  'sensor-mastery-kit',
  'Explore every physical input: HC-SR04, PIR motion, DHT11 temp/humidity, IR obstacle, LDR, MPU6050 gyro, buzzer, relay, breadboard, jumpers, and 0.96" OLED.',
  899,
  1098,
  'standard',
  false
),
(
  'kit_iot_starter',
  'IoT & Cloud Robotics Starter Kit (ESP32)',
  'iot-starter-kit-esp32',
  'Connect robots to the web: ESP32 DevKit, DHT11, 0.96" OLED, 1-ch relay, breadboard, jumpers, and buzzer.',
  999,
  1189,
  'standard',
  false
),
(
  'kit_drone_f450',
  'Quadcopter Drone Learning Kit F450',
  'quadcopter-drone-learning-kit-f450',
  'Aerodynamics engineering: F450 frame, 4x 2212 BLDC motors, 4x 30A ESCs, 1045 props, flight controller, 3S LiPo battery, 6CH radio TX/RX, and PDB board.',
  11999,
  13536,
  'regulated_drone',
  true
),
(
  'kit_soldering_tools',
  'Electronics Workshop & Soldering Kit',
  'soldering-tools-workshop-kit',
  'Pro maker toolset: 60W adjustable iron, lead-free solder, digital multimeter with probes, automatic wire stripper, and safety goggles.',
  1199,
  1445,
  'standard',
  true
)
ON CONFLICT (id) DO UPDATE SET
  kit_price_inr = EXCLUDED.kit_price_inr,
  sum_of_parts_inr = EXCLUDED.sum_of_parts_inr;

-- 5. Courses & Learning Curriculum
INSERT INTO public.courses (id, slug, title, description, category, track, level, duration_hours, order_index)
VALUES
(
  'course_arduino_foundations',
  'arduino-electronics-foundations',
  'Arduino & Electronics Foundations',
  'Master electrical circuits, microcontroller firmware in C++, sensors, and breadboard prototyping from first principles.',
  'Hardware Basics',
  'HARDWARE',
  'BEGINNER',
  16,
  1
),
(
  'course_mobile_robotics',
  'autonomous-mobile-robotics',
  'Autonomous Mobile Robotics: Line Tracers & Rovers',
  'Build differential-drive rovers, tune PID algorithms for high-speed line tracking, and implement real-time sonar obstacle avoidance.',
  'Robotics',
  'ROBOTICS',
  'INTERMEDIATE',
  24,
  2
),
(
  'course_kinematics_arms',
  'robotic-arms-kinematics',
  'Robotic Arms & Bionics: Forward & Inverse Kinematics',
  'Design articulated multi-axis robot arms, control tendon-driven bionic hands, and compute geometric joint angles in 3D.',
  'Kinematics',
  'ROBOTICS',
  'INTERMEDIATE',
  20,
  3
),
(
  'course_iot_robotics',
  'esp32-iot-cloud-robotics',
  'Cloud Robotics & IoT with ESP32',
  'Stream real-time robot sensor telemetry over WebSockets, construct mobile web control remotes, and connect robots to cloud dashboards.',
  'IoT & Software',
  'HYBRID',
  'INTERMEDIATE',
  18,
  4
),
(
  'course_drone_engineering',
  'quadcopter-flight-dynamics',
  'Drone Engineering & Quadcopter Flight Dynamics',
  'Explore brushless propulsion, electronic speed control, 6-axis IMU sensor fusion, PID flight stabilization, and Indian DGCA airspace rules.',
  'Aviation',
  'DRONES',
  'ADVANCED',
  30,
  5
)
ON CONFLICT (id) DO NOTHING;

-- Modules for Course 1
INSERT INTO public.modules (id, course_id, title, order_index)
VALUES
  ('mod_basic_circuits', 'course_arduino_foundations', 'Digital Output & LEDs', 1),
  ('mod_analog_sensors', 'course_arduino_foundations', 'Analog Inputs & Sensing', 2),
  ('mod_actuators', 'course_arduino_foundations', 'Actuation & Motion', 3),
  ('mod_displays_systems', 'course_arduino_foundations', 'Displays & Smart Systems', 4)
ON CONFLICT (id) DO NOTHING;

-- 6. The 16 Free Beginner Lessons (with exact Starter Code, Pinouts & Hardware Lists)
INSERT INTO public.lessons (id, course_id, module_id, slug, title, description, content, example_code, components_used, pinout_specs, duration_minutes, order_index)
VALUES
(
  'les_01_blink_led',
  'course_arduino_foundations',
  'mod_basic_circuits',
  'blink-led',
  '1. Blink an LED',
  'The Hello World of physical computing: configure digital pin 13 as an output and pulse it high and low.',
  'Understand Ohm''s law, current-limiting resistors, and the Arduino digitalWrite() and delay() functions.',
  'void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}',
  ARRAY['comp_arduino_uno', 'comp_resistor_220', 'comp_led_red', 'comp_breadboard'],
  '{"connections": [{"from": "arduino:d13", "to": "resistor:t1"}, {"from": "resistor:t2", "to": "led:anode"}, {"from": "led:cathode", "to": "arduino:gnd"}]}'::jsonb,
  10,
  1
),
(
  'les_02_button_input',
  'course_arduino_foundations',
  'mod_basic_circuits',
  'pushbutton-digital-input',
  '2. Pushbutton Digital Input',
  'Read digital state transitions from a tactile pushbutton using an internal or external pull-up resistor.',
  'Learn about digitalRead(), floating inputs, electrical debouncing, and conditional LED toggling.',
  'const int BUTTON_PIN = 2;
const int LED_PIN = 13;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
}

void loop() {
  int buttonState = digitalRead(BUTTON_PIN);
  if (buttonState == LOW) {
    digitalWrite(LED_PIN, HIGH);
  } else {
    digitalWrite(LED_PIN, LOW);
  }
}',
  ARRAY['comp_arduino_uno', 'comp_pushbutton', 'comp_led_red', 'comp_resistor_220', 'comp_breadboard'],
  '{"connections": [{"from": "arduino:d2", "to": "btn:t1"}, {"from": "btn:t2", "to": "arduino:gnd"}]}'::jsonb,
  15,
  2
),
(
  'les_03_potentiometer',
  'course_arduino_foundations',
  'mod_analog_sensors',
  'potentiometer-analog-read',
  '3. Potentiometer Analog Reading',
  'Sample continuous voltage from 0V to 5V using the 10-bit Analog-to-Digital Converter (ADC).',
  'Discover the analogRead() function, voltage divider equation, and serial telemetry transmission.',
  'void setup() {
  Serial.begin(9600);
}

void loop() {
  int rawValue = analogRead(A0);
  float voltage = rawValue * (5.0 / 1023.0);
  Serial.print("Raw: ");
  Serial.print(rawValue);
  Serial.print(" | Voltage: ");
  Serial.println(voltage);
  delay(200);
}',
  ARRAY['comp_arduino_uno', 'comp_potentiometer', 'comp_breadboard'],
  '{"connections": [{"from": "pot:vcc", "to": "arduino:5v"}, {"from": "pot:wiper", "to": "arduino:a0"}, {"from": "pot:gnd", "to": "arduino:gnd"}]}'::jsonb,
  15,
  3
),
(
  'les_04_pwm_fade',
  'course_arduino_foundations',
  'mod_basic_circuits',
  'pwm-led-fade',
  '4. PWM LED Fading',
  'Simulate analog output voltage using high-frequency 490Hz Pulse Width Modulation (PWM).',
  'Master the analogWrite() function, duty cycle computation from 0% to 100%, and breathing light effects.',
  'const int LED_PIN = 9;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  for (int brightness = 0; brightness <= 255; brightness += 5) {
    analogWrite(LED_PIN, brightness);
    delay(20);
  }
  for (int brightness = 255; brightness >= 0; brightness -= 5) {
    analogWrite(LED_PIN, brightness);
    delay(20);
  }
}',
  ARRAY['comp_arduino_uno', 'comp_led_red', 'comp_resistor_220', 'comp_breadboard'],
  '{"connections": [{"from": "arduino:d9", "to": "resistor:t1"}, {"from": "resistor:t2", "to": "led:anode"}, {"from": "led:cathode", "to": "arduino:gnd"}]}'::jsonb,
  15,
  4
),
(
  'les_05_rgb_led',
  'course_arduino_foundations',
  'mod_basic_circuits',
  'rgb-led-color-mixing',
  '5. RGB LED Color Mixing',
  'Combine Red, Green, and Blue channels via triple PWM pins to synthesize 16 million colors.',
  'Understand additive optical color models, common-cathode wiring, and color palette functions.',
  'const int RED_PIN = 9;
const int GREEN_PIN = 10;
const int BLUE_PIN = 11;

void setColor(int r, int g, int b) {
  analogWrite(RED_PIN, r);
  analogWrite(GREEN_PIN, g);
  analogWrite(BLUE_PIN, b);
}

void setup() {
  pinMode(RED_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  pinMode(BLUE_PIN, OUTPUT);
}

void loop() {
  setColor(255, 0, 0);   // Red
  delay(1000);
  setColor(0, 255, 0);   // Green
  delay(1000);
  setColor(0, 0, 255);   // Blue
  delay(1000);
  setColor(57, 255, 106); // RoboVerse Neon Green
  delay(1000);
}',
  ARRAY['comp_arduino_uno', 'comp_rgb_led', 'comp_resistor_220', 'comp_breadboard'],
  '{"connections": [{"from": "arduino:d9", "to": "rgb:r"}, {"from": "arduino:d10", "to": "rgb:g"}, {"from": "arduino:d11", "to": "rgb:b"}, {"from": "rgb:cathode", "to": "arduino:gnd"}]}'::jsonb,
  15,
  5
),
(
  'les_06_buzzer',
  'course_arduino_foundations',
  'mod_actuators',
  'active-buzzer-tone',
  '6. Active Buzzer Tone Synthesis',
  'Synthesize audible alert frequencies and musical notes using a piezo buzzer transducer.',
  'Learn the tone() and noTone() functions, frequency in Hertz, and alert sirens.',
  'const int BUZZER_PIN = 8;

void setup() {
  pinMode(BUZZER_PIN, OUTPUT);
}

void loop() {
  // Play 1000 Hz beep
  tone(BUZZER_PIN, 1000, 200);
  delay(400);
  tone(BUZZER_PIN, 1500, 200);
  delay(1000);
}',
  ARRAY['comp_arduino_uno', 'comp_buzzer_active', 'comp_breadboard'],
  '{"connections": [{"from": "arduino:d8", "to": "buzzer:pos"}, {"from": "buzzer:neg", "to": "arduino:gnd"}]}'::jsonb,
  10,
  6
),
(
  'les_07_ldr_light',
  'course_arduino_foundations',
  'mod_analog_sensors',
  'ldr-light-sensor-night-lamp',
  '7. LDR Light Sensor Night Lamp',
  'Construct an automatic twilight night lamp that lights up when ambient room light diminishes.',
  'Explore photoresistors, threshold detection, and automatic street lighting logic.',
  'const int LDR_PIN = A0;
const int LED_PIN = 13;
const int THRESHOLD = 500;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int lightLevel = analogRead(LDR_PIN);
  Serial.println(lightLevel);
  if (lightLevel < THRESHOLD) {
    digitalWrite(LED_PIN, HIGH); // Turn on lamp in dark
  } else {
    digitalWrite(LED_PIN, LOW);
  }
  delay(100);
}',
  ARRAY['comp_arduino_uno', 'comp_ldr', 'comp_resistor_10k', 'comp_led_red', 'comp_resistor_220', 'comp_breadboard'],
  '{"connections": [{"from": "ldr:t1", "to": "arduino:5v"}, {"from": "ldr:t2", "to": "arduino:a0"}]}'::jsonb,
  20,
  7
),
(
  'les_08_ultrasonic',
  'course_arduino_foundations',
  'mod_analog_sensors',
  'ultrasonic-distance-meter',
  '8. Ultrasonic Distance Meter',
  'Measure target distances with millimeter precision using 40kHz acoustic pulse timing.',
  'Calculate distance using speed of sound in air (343 m/s) and pulseIn() microsecond measurement.',
  'const int TRIG_PIN = 7;
const int ECHO_PIN = 6;

void setup() {
  Serial.begin(9600);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
}

void loop() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH);
  float distanceCm = duration * 0.0343 / 2.0;

  Serial.print("Distance: ");
  Serial.print(distanceCm);
  Serial.println(" cm");
  delay(150);
}',
  ARRAY['comp_arduino_uno', 'comp_hc_sr04', 'comp_breadboard'],
  '{"connections": [{"from": "sonar:vcc", "to": "arduino:5v"}, {"from": "sonar:gnd", "to": "arduino:gnd"}, {"from": "sonar:trig", "to": "arduino:d7"}, {"from": "sonar:echo", "to": "arduino:d6"}]}'::jsonb,
  20,
  8
),
(
  'les_09_servo_sweep',
  'course_arduino_foundations',
  'mod_actuators',
  'sg90-servo-sweep',
  '9. Servo Sweep & Angle Control',
  'Directly position an SG90 micro servo arm from 0° to 180° using PWM pulse widths.',
  'Discover the standard Arduino <Servo.h> library, position control, and mechanical linkages.',
  '#include <Servo.h>

Servo myServo;

void setup() {
  myServo.attach(9);
}

void loop() {
  for (int pos = 0; pos <= 180; pos += 2) {
    myServo.write(pos);
    delay(15);
  }
  for (int pos = 180; pos >= 0; pos -= 2) {
    myServo.write(pos);
    delay(15);
  }
}',
  ARRAY['comp_arduino_uno', 'comp_servo_sg90', 'comp_breadboard'],
  '{"connections": [{"from": "servo:vcc", "to": "arduino:5v"}, {"from": "servo:gnd", "to": "arduino:gnd"}, {"from": "servo:sig", "to": "arduino:d9"}]}'::jsonb,
  15,
  9
),
(
  'les_10_dc_motor',
  'course_arduino_foundations',
  'mod_actuators',
  'dc-motor-l298n-driver',
  '10. DC Motor Control with L298N',
  'Drive high-current DC gear motors with bi-directional forward/reverse and PWM velocity control.',
  'Understand H-bridge flyback diode protection, separate motor power rails, and wheel propulsion.',
  'const int IN1 = 4;
const int IN2 = 5;
const int ENA = 3;

void setup() {
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(ENA, OUTPUT);
}

void loop() {
  // Forward half speed
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, 150);
  delay(2000);

  // Reverse full speed
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  analogWrite(ENA, 255);
  delay(2000);

  // Stop
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  delay(1000);
}',
  ARRAY['comp_arduino_uno', 'comp_l298n', 'comp_dc_motor', 'comp_breadboard'],
  '{"connections": [{"from": "l298n:in1", "to": "arduino:d4"}, {"from": "l298n:in2", "to": "arduino:d5"}, {"from": "l298n:ena", "to": "arduino:d3"}]}'::jsonb,
  25,
  10
),
(
  'les_11_pir_alarm',
  'course_arduino_foundations',
  'mod_analog_sensors',
  'pir-motion-alarm',
  '11. PIR Motion Security Alarm',
  'Protect a perimeter by triggering sound and light alarms upon human thermal infrared detection.',
  'Learn about pyroelectric sensing, warmup stabilization periods, and latching alarm states.',
  'const int PIR_PIN = 2;
const int LED_PIN = 13;
const int BUZZER_PIN = 8;

void setup() {
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int motion = digitalRead(PIR_PIN);
  if (motion == HIGH) {
    digitalWrite(LED_PIN, HIGH);
    tone(BUZZER_PIN, 2000, 100);
    Serial.println("INTRUDER DETECTED!");
  } else {
    digitalWrite(LED_PIN, LOW);
  }
  delay(100);
}',
  ARRAY['comp_arduino_uno', 'comp_pir', 'comp_buzzer_active', 'comp_led_red', 'comp_breadboard'],
  '{"connections": [{"from": "pir:out", "to": "arduino:d2"}, {"from": "arduino:d8", "to": "buzzer:pos"}]}'::jsonb,
  20,
  11
),
(
  'les_12_dht11_temp',
  'course_arduino_foundations',
  'mod_analog_sensors',
  'dht11-temperature-humidity',
  '12. DHT11 Temperature & Humidity',
  'Read calibrated atmospheric data over a single-wire digital protocol.',
  'Discover digital sensor communication, temperature in Celsius, relative humidity %, and heat index.',
  '#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  delay(2000);
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  Serial.print("Humidity: ");
  Serial.print(h);
  Serial.print("% | Temp: ");
  Serial.print(t);
  Serial.println(" C");
}',
  ARRAY['comp_arduino_uno', 'comp_dht11', 'comp_breadboard'],
  '{"connections": [{"from": "dht:data", "to": "arduino:d4"}, {"from": "dht:vcc", "to": "arduino:5v"}]}'::jsonb,
  20,
  12
),
(
  'les_13_lcd_display',
  'course_arduino_foundations',
  'mod_displays_systems',
  'lcd-16x2-i2c-screen',
  '13. LCD 16x2 Character Display',
  'Render text, values, and custom character icons on a 16-column x 2-row backlit LCD via I2C.',
  'Master the LiquidCrystal_I2C library, cursor positioning, and clean dashboard layout formatting.',
  '#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("RoboVerse v2.0");
  lcd.setCursor(0, 1);
  lcd.print("Systems Online!");
}

void loop() {
  // Static banner
}',
  ARRAY['comp_arduino_uno', 'comp_lcd_16x2', 'comp_breadboard'],
  '{"connections": [{"from": "lcd:sda", "to": "arduino:a4"}, {"from": "lcd:scl", "to": "arduino:a5"}]}'::jsonb,
  20,
  13
),
(
  'les_14_relay_switch',
  'course_arduino_foundations',
  'mod_displays_systems',
  'relay-module-switch',
  '14. Relay Switch for High Power Loads',
  'Safely switch isolated external loads using a 5V opto-coupled electro-mechanical relay.',
  'Learn about NO (Normally Open) and NC (Normally Closed) terminals, coil energization, and electrical safety.',
  'const int RELAY_PIN = 7;

void setup() {
  pinMode(RELAY_PIN, OUTPUT);
}

void loop() {
  // Turn appliance ON
  digitalWrite(RELAY_PIN, LOW); // Active LOW
  delay(3000);
  // Turn appliance OFF
  digitalWrite(RELAY_PIN, HIGH);
  delay(3000);
}',
  ARRAY['comp_arduino_uno', 'comp_relay_1ch', 'comp_breadboard'],
  '{"connections": [{"from": "relay:in", "to": "arduino:d7"}, {"from": "relay:vcc", "to": "arduino:5v"}]}'::jsonb,
  15,
  14
),
(
  'les_15_traffic_light',
  'course_arduino_foundations',
  'mod_displays_systems',
  'smart-traffic-light-intersection',
  '15. Smart Traffic Light Intersection',
  'Implement finite state machine (FSM) sequencing for a busy road intersection with Red, Yellow, and Green phases.',
  'Master state machines, non-blocking millis() timing, and pedestrian priority interrupt triggers.',
  'const int RED = 10;
const int YELLOW = 9;
const int GREEN = 8;

void setup() {
  pinMode(RED, OUTPUT);
  pinMode(YELLOW, OUTPUT);
  pinMode(GREEN, OUTPUT);
}

void loop() {
  // Green Go
  digitalWrite(GREEN, HIGH);
  digitalWrite(YELLOW, LOW);
  digitalWrite(RED, LOW);
  delay(5000);

  // Yellow Caution
  digitalWrite(GREEN, LOW);
  digitalWrite(YELLOW, HIGH);
  delay(1500);

  // Red Stop
  digitalWrite(YELLOW, LOW);
  digitalWrite(RED, HIGH);
  delay(5000);
}',
  ARRAY['comp_arduino_uno', 'comp_led_red', 'comp_led_green', 'comp_led_yellow', 'comp_resistor_220', 'comp_breadboard'],
  '{"connections": [{"from": "arduino:d10", "to": "red_led"}, {"from": "arduino:d9", "to": "yellow_led"}, {"from": "arduino:d8", "to": "green_led"}]}'::jsonb,
  20,
  15
),
(
  'les_16_parking_sensor',
  'course_arduino_foundations',
  'mod_displays_systems',
  'car-parking-sensor-system',
  '16. Automotive Ultrasonic Reverse Parking Sensor',
  'Synthesize an automotive reverse parking assistant with dynamic buzzer beep rates based on obstacle proximity.',
  'Combine ultrasonic distance sensing, buzzer frequency mapping, and visual warning zones.',
  'const int TRIG = 7;
const int ECHO = 6;
const int BUZZER = 8;
const int LED = 13;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED, OUTPUT);
}

void loop() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  long d = pulseIn(ECHO, HIGH) * 0.0343 / 2.0;

  if (d < 10) { // Critical zone (< 10cm)
    digitalWrite(LED, HIGH);
    tone(BUZZER, 2500);
  } else if (d < 30) { // Warning zone (10 - 30cm)
    digitalWrite(LED, HIGH);
    tone(BUZZER, 1800, 50);
    delay(d * 10);
    digitalWrite(LED, LOW);
  } else {
    noTone(BUZZER);
    digitalWrite(LED, LOW);
  }
  delay(50);
}',
  ARRAY['comp_arduino_uno', 'comp_hc_sr04', 'comp_buzzer_active', 'comp_led_red', 'comp_breadboard'],
  '{"connections": [{"from": "sonar:trig", "to": "arduino:d7"}, {"from": "sonar:echo", "to": "arduino:d6"}, {"from": "buzzer:pos", "to": "arduino:d8"}]}'::jsonb,
  25,
  16
)
ON CONFLICT (id) DO UPDATE SET
  example_code = EXCLUDED.example_code,
  components_used = EXCLUDED.components_used;

-- 7. 60+ Components in the Shared Component Library (All FREE to simulate)
INSERT INTO public.components (id, name, category, is_free_tier, price_inr, license, dimensions_mm, mass_g, pins, electrical_params, physical_params, model_3d_glb_url)
VALUES
('comp_arduino_uno', 'Arduino Uno R3', 'microcontroller', true, 399, 'CC-BY-SA 4.0', '{"width": 68.6, "height": 53.4, "depth": 15}'::jsonb, 25, '[{"id":"d13","name":"D13","type":"digital","x":36,"y":18},{"id":"gnd","name":"GND","type":"gnd","x":174,"y":142},{"id":"5v","name":"5V","type":"power","x":162,"y":142}]'::jsonb, '{"voltage": 5.0, "clock_mhz": 16, "flash_kb": 32}'::jsonb, '{}'::jsonb, '/models/components/arduino_uno.glb'),
('comp_arduino_nano', 'Arduino Nano V3', 'microcontroller', true, 349, 'CC-BY-SA 4.0', '{"width": 45, "height": 18, "depth": 10}'::jsonb, 7, '[]'::jsonb, '{"voltage": 5.0, "clock_mhz": 16}'::jsonb, '{}'::jsonb, '/models/components/arduino_nano.glb'),
('comp_arduino_mega', 'Arduino Mega 2560', 'microcontroller', true, 1199, 'CC-BY-SA 4.0', '{"width": 101.6, "height": 53.3, "depth": 15}'::jsonb, 37, '[]'::jsonb, '{"voltage": 5.0, "clock_mhz": 16, "io_pins": 54}'::jsonb, '{}'::jsonb, '/models/components/arduino_mega.glb'),
('comp_esp32', 'ESP32 DevKit V1', 'microcontroller', true, 499, 'Apache 2.0', '{"width": 51, "height": 28, "depth": 12}'::jsonb, 10, '[]'::jsonb, '{"voltage": 3.3, "clock_mhz": 240}'::jsonb, '{}'::jsonb, '/models/components/esp32.glb'),
('comp_pico', 'Raspberry Pi Pico', 'microcontroller', true, 449, 'Raspberry Pi Open', '{"width": 51, "height": 21, "depth": 5}'::jsonb, 6, '[]'::jsonb, '{"voltage": 3.3, "clock_mhz": 133}'::jsonb, '{}'::jsonb, '/models/components/pico.glb'),
('comp_breadboard', 'Half-Size Breadboard (400 pts)', 'prototyping', true, 99, 'MIT', '{"width": 82, "height": 55, "depth": 9}'::jsonb, 40, '[]'::jsonb, '{}'::jsonb, '{}'::jsonb, '/models/components/breadboard_half.glb'),
('comp_breadboard_large', 'Full-Size Breadboard (830 pts)', 'prototyping', true, 129, 'MIT', '{"width": 165, "height": 55, "depth": 9}'::jsonb, 80, '[]'::jsonb, '{}'::jsonb, '{}'::jsonb, '/models/components/breadboard_full.glb'),
('comp_resistor_220', '220Ω Resistor', 'passive', true, 2, 'CC0', '{"width": 15, "height": 3, "depth": 3}'::jsonb, 0.2, '[{"id":"t1","name":"T1","type":"passive"},{"id":"t2","name":"T2","type":"passive"}]'::jsonb, '{"resistance_ohms": 220}'::jsonb, '{}'::jsonb, '/models/components/resistor.glb'),
('comp_resistor_1k', '1kΩ Resistor', 'passive', true, 2, 'CC0', '{"width": 15, "height": 3, "depth": 3}'::jsonb, 0.2, '[]'::jsonb, '{"resistance_ohms": 1000}'::jsonb, '{}'::jsonb, '/models/components/resistor.glb'),
('comp_resistor_10k', '10kΩ Resistor', 'passive', true, 2, 'CC0', '{"width": 15, "height": 3, "depth": 3}'::jsonb, 0.2, '[]'::jsonb, '{"resistance_ohms": 10000}'::jsonb, '{}'::jsonb, '/models/components/resistor.glb'),
('comp_led_red', 'Red 5mm LED', 'display', true, 5, 'CC0', '{"width": 5, "height": 5, "depth": 8.6}'::jsonb, 0.3, '[{"id":"anode","name":"+","type":"anode"},{"id":"cathode","name":"-","type":"cathode"}]'::jsonb, '{"forward_voltage": 2.0, "max_current_ma": 20}'::jsonb, '{}'::jsonb, '/models/components/led_red.glb'),
('comp_led_green', 'Green 5mm LED', 'display', true, 5, 'CC0', '{"width": 5, "height": 5, "depth": 8.6}'::jsonb, 0.3, '[]'::jsonb, '{"forward_voltage": 2.2, "max_current_ma": 20}'::jsonb, '{}'::jsonb, '/models/components/led_green.glb'),
('comp_led_yellow', 'Yellow 5mm LED', 'display', true, 5, 'CC0', '{"width": 5, "height": 5, "depth": 8.6}'::jsonb, 0.3, '[]'::jsonb, '{"forward_voltage": 2.1, "max_current_ma": 20}'::jsonb, '{}'::jsonb, '/models/components/led_yellow.glb'),
('comp_led_blue', 'Blue 5mm LED', 'display', true, 6, 'CC0', '{"width": 5, "height": 5, "depth": 8.6}'::jsonb, 0.3, '[]'::jsonb, '{"forward_voltage": 3.2, "max_current_ma": 20}'::jsonb, '{}'::jsonb, '/models/components/led_blue.glb'),
('comp_rgb_led', 'Common-Cathode RGB LED', 'display', true, 15, 'CC0', '{"width": 5, "height": 5, "depth": 8.6}'::jsonb, 0.4, '[]'::jsonb, '{"forward_voltage": 3.0, "max_current_ma": 20}'::jsonb, '{}'::jsonb, '/models/components/led_rgb.glb'),
('comp_pushbutton', 'Tactile Pushbutton', 'passive', true, 5, 'CC0', '{"width": 6, "height": 6, "depth": 5}'::jsonb, 0.5, '[]'::jsonb, '{}'::jsonb, '{}'::jsonb, '/models/components/pushbutton.glb'),
('comp_potentiometer', 'Rotary Potentiometer 10k', 'passive', true, 25, 'CC0', '{"width": 16, "height": 16, "depth": 25}'::jsonb, 8, '[]'::jsonb, '{"max_resistance_ohms": 10000}'::jsonb, '{}'::jsonb, '/models/components/potentiometer.glb'),
('comp_buzzer_active', 'Active Buzzer 5V', 'actuator', true, 25, 'CC0', '{"width": 12, "height": 12, "depth": 9.5}'::jsonb, 2, '[]'::jsonb, '{"voltage": 5.0, "current_ma": 30}'::jsonb, '{}'::jsonb, '/models/components/buzzer.glb'),
('comp_ldr', 'LDR Photoresistor 5mm', 'sensor', true, 12, 'CC0', '{"width": 5, "height": 5, "depth": 4}'::jsonb, 0.2, '[]'::jsonb, '{}'::jsonb, '{}'::jsonb, '/models/components/ldr.glb'),
('comp_hc_sr04', 'HC-SR04 Ultrasonic Sonar', 'sensor', true, 89, 'CC-BY 4.0', '{"width": 45, "height": 20, "depth": 15}'::jsonb, 9, '[{"id":"vcc","name":"VCC"},{"id":"trig","name":"TRIG"},{"id":"echo","name":"ECHO"},{"id":"gnd","name":"GND"}]'::jsonb, '{"voltage": 5.0}'::jsonb, '{"beam_angle_deg": 15}'::jsonb, '/models/components/ultrasonic.glb'),
('comp_servo_sg90', 'SG90 Micro Servo 9g', 'actuator', true, 139, 'CC-BY 4.0', '{"width": 22.2, "height": 11.8, "depth": 31}'::jsonb, 9, '[]'::jsonb, '{"voltage": 5.0}'::jsonb, '{"torque_kg_cm": 1.8, "speed_sec_60deg": 0.1}'::jsonb, '/models/components/servo_sg90.glb'),
('comp_servo_mg90s', 'MG90S Metal Gear Servo', 'actuator', true, 249, 'CC-BY 4.0', '{"width": 22.8, "height": 12.2, "depth": 28.5}'::jsonb, 13.4, '[]'::jsonb, '{"voltage": 5.0}'::jsonb, '{"torque_kg_cm": 2.2, "speed_sec_60deg": 0.08}'::jsonb, '/models/components/servo_mg90s.glb'),
('comp_dc_motor', 'TT DC Gear Motor 1:48', 'actuator', true, 89, 'CC0', '{"width": 70, "height": 22, "depth": 18}'::jsonb, 28, '[]'::jsonb, '{"voltage": 6.0, "no_load_current_ma": 70}'::jsonb, '{"rpm": 200, "torque_kg_cm": 0.8}'::jsonb, '/models/components/dc_motor.glb'),
('comp_l298n', 'L298N Dual Motor Driver', 'actuator', true, 169, 'CC-BY-SA', '{"width": 43, "height": 43, "depth": 27}'::jsonb, 26, '[]'::jsonb, '{"peak_current_a": 2.0}'::jsonb, '{}'::jsonb, '/models/components/l298n.glb'),
('comp_pir', 'HC-SR501 PIR Motion Sensor', 'sensor', true, 99, 'CC-BY 4.0', '{"width": 32, "height": 24, "depth": 25}'::jsonb, 6, '[]'::jsonb, '{"voltage": 5.0}'::jsonb, '{"angle_deg": 120}'::jsonb, '/models/components/pir.glb'),
('comp_dht11', 'DHT11 Temp & Humidity Sensor', 'sensor', true, 99, 'CC0', '{"width": 15.5, "height": 12, "depth": 5.5}'::jsonb, 3, '[]'::jsonb, '{"voltage": 5.0}'::jsonb, '{}'::jsonb, '/models/components/dht11.glb'),
('comp_lcd_16x2', '16x2 LCD Display with I2C', 'display', true, 229, 'CC-BY 4.0', '{"width": 80, "height": 36, "depth": 13}'::jsonb, 35, '[]'::jsonb, '{"voltage": 5.0}'::jsonb, '{}'::jsonb, '/models/components/lcd16x2.glb'),
('comp_oled_096', '0.96" I2C OLED (SSD1306)', 'display', true, 299, 'CC-BY 4.0', '{"width": 27, "height": 27, "depth": 4}'::jsonb, 4, '[]'::jsonb, '{"voltage": 3.3}'::jsonb, '{}'::jsonb, '/models/components/oled096.glb'),
('comp_relay_1ch', '1-Channel 5V Relay Module', 'actuator', true, 69, 'CC0', '{"width": 50, "height": 26, "depth": 18}'::jsonb, 17, '[]'::jsonb, '{"coil_voltage": 5.0, "contact_rating_a": 10}'::jsonb, '{}'::jsonb, '/models/components/relay_1ch.glb'),
('comp_mpu6050', 'MPU-6050 6-Axis Gyro & Accel', 'sensor', true, 159, 'CC-BY 4.0', '{"width": 21, "height": 16, "depth": 3}'::jsonb, 2, '[]'::jsonb, '{"voltage": 3.3}'::jsonb, '{}'::jsonb, '/models/components/mpu6050.glb')
ON CONFLICT (id) DO NOTHING;

-- 8. Robot Templates (Line Follower, Quadcopter Drone, Robotic Arm, Robotic Hand, Obstacle Rover, Self-Balancing)
INSERT INTO public.robot_templates (id, name, slug, category, description, recommended_arena_id, default_parts)
VALUES
(
  'tmpl_line_follower',
  'Autonomous Line Following Car',
  'line-following-car',
  'ROVER',
  'High-speed 2WD differential robot equipped with a 5-channel infrared sensor array and tuned PID controller.',
  'arena_line_track',
  '["comp_arduino_uno", "comp_l298n", "comp_dc_motor", "comp_dc_motor"]'::jsonb
),
(
  'tmpl_drone_f450',
  'F450 Aerodynamic Quadcopter Drone',
  'quadcopter-drone-f450',
  'DRONE',
  'X-configuration 450mm drone featuring 1000KV brushless motors, 30A ESCs, and a 6-axis IMU flight stabilization algorithm.',
  'arena_drone_gates',
  '["comp_flight_controller", "comp_bldc_2212", "comp_esc_30a", "comp_lipo_3s"]'::jsonb
),
(
  'tmpl_robotic_arm_4dof',
  '4-DOF Articulated Robotic Arm',
  'robotic-arm-4dof',
  'ARM',
  'Multi-axis robotic manipulator with 360-degree rotating base, shoulder, elbow, and servo-actuated precision gripper clamp.',
  'arena_pick_place',
  '["comp_arduino_uno", "comp_servo_mg90s", "comp_servo_mg90s", "comp_servo_mg90s", "comp_servo_sg90"]'::jsonb
),
(
  'tmpl_robotic_hand',
  '5-Finger Bionic Robotic Hand',
  'bionic-robotic-hand',
  'HAND',
  'Anatomical prosthetic hand with independent tendon pull-wires driven by micro-servos for intricate finger grasping gestures.',
  'arena_pick_place',
  '["comp_arduino_uno", "comp_servo_sg90", "comp_servo_sg90", "comp_servo_sg90", "comp_servo_sg90", "comp_servo_sg90"]'::jsonb
),
(
  'tmpl_obstacle_car',
  'Radar Guided Obstacle Avoiding Rover',
  'obstacle-avoiding-rover',
  'ROVER',
  'Autonomous roving vehicle featuring an active ultrasonic turret that scans left and right to navigate complex mazes.',
  'arena_obstacle_maze',
  '["comp_arduino_uno", "comp_l298n", "comp_hc_sr04", "comp_servo_sg90", "comp_dc_motor", "comp_dc_motor"]'::jsonb
),
(
  'tmpl_self_balancing',
  'Two-Wheel Self-Balancing Robot',
  'self-balancing-robot',
  'BALANCE',
  'Inverted pendulum mobile robot that actively corrects tilt angles via high-speed accelerometer and gyroscope feedback loops.',
  'arena_balance_beam',
  '["comp_arduino_nano", "comp_mpu6050", "comp_l298n", "comp_dc_motor", "comp_dc_motor"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 9. Virtual Arenas & Testing Tracks
INSERT INTO public.arenas (id, name, type, description, environment_params, obstacles, scoring_rules)
VALUES
(
  'arena_line_track',
  'Grand Prix Line Following Speedway',
  'line_track',
  'Standard contest track featuring sharp 90-degree corners, crossover loops, gradual S-curves, and finish line sensors.',
  '{"gravity": -9.81, "ground_friction": 0.85, "track_width_cm": 2.5}'::jsonb,
  '[{"type": "loop", "radius": 4.0}, {"type": "hairpin", "radius": 1.5}]'::jsonb,
  '{"target_time_seconds": 15.0, "penalty_per_deviation_seconds": 2.0}'::jsonb
),
(
  'arena_obstacle_maze',
  'Dynamic Hazard Maze & Obstacle Course',
  'obstacle_course',
  'Urban maze featuring static concrete pillars, dead ends, and moving dynamic barriers.',
  '{"gravity": -9.81, "ground_friction": 0.75}'::jsonb,
  '[{"x": 2, "z": 3, "radius": 0.8}, {"x": -3, "z": 4, "radius": 1.2}, {"x": 0, "z": 6, "radius": 0.9}]'::jsonb,
  '{"points_per_gate": 100, "collision_penalty": -50}'::jsonb
),
(
  'arena_drone_gates',
  'AeroZone 3D FPV Drone Airfield',
  'drone_gates',
  'Aerial racing course with elevated neon gate rings, variable crosswinds, and target precision landing pad.',
  '{"gravity": -9.81, "air_density": 1.225, "wind_speed_mps": 1.5}'::jsonb,
  '[{"type": "gate", "altitude": 2.0, "x": 0, "z": 5}, {"type": "gate", "altitude": 3.5, "x": 4, "z": 10}]'::jsonb,
  '{"gate_clearance_bonus": 200, "smooth_landing_score": 500}'::jsonb
),
(
  'arena_balance_beam',
  'Dynamic Tilt & Inverted Pendulum Test Bench',
  'balance_beam',
  'Precision testing platform with simulated perturbation impulses and oscillating surface tilts.',
  '{"gravity": -9.81, "perturbation_force_n": 5.0}'::jsonb,
  '[]'::jsonb,
  '{"max_upright_seconds": 60, "tilt_tolerance_deg": 12.0}'::jsonb
),
(
  'arena_pick_place',
  'Precision Pick & Place Assembly Table',
  'pick_place',
  'Industrial sorting workbench equipped with colored blocks, bins, and target drop-off coordinate zones.',
  '{"gravity": -9.81, "surface_friction": 0.9}'::jsonb,
  '[{"type": "cube", "color": "red", "weight_g": 20}, {"type": "bin", "color": "red"}]'::jsonb,
  '{"target_reach_accuracy_mm": 2.0, "cycle_time_bonus": 150}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 10. Sample Verified Maker Shops (PostGIS Coordinates Across Major Indian Tech Hubs)
INSERT INTO public.shops (name, phone, address, city, state, pincode, location, opening_hours, verified_status, rating, categories)
VALUES
(
  'SP Road Robotics & Electronics Hub',
  '+91 80 2223 8899',
  '#42, Sadar Patrappa Road, Near City Market',
  'Bengaluru',
  'Karnataka',
  '560002',
  ST_SetSRID(ST_MakePoint(77.5833, 12.9644), 4326)::geography,
  '10:00 AM - 8:30 PM (Mon-Sat)',
  'verified',
  4.9,
  ARRAY['Arduino', 'Sensors', 'BLDC Motors', 'Chassis', 'LiPo Batteries']
),
(
  'Lajpat Rai Market Electronics Emporium',
  '+91 11 2386 1122',
  'Shop 118, Old Lajpat Rai Market, Chandni Chowk',
  'Delhi',
  'Delhi',
  '110006',
  ST_SetSRID(ST_MakePoint(77.2355, 28.6562), 4326)::geography,
  '10:30 AM - 8:00 PM (Mon-Sat)',
  'verified',
  4.8,
  ARRAY['Microcontrollers', 'Soldering Kits', 'Sensors', 'Relays', 'Displays']
),
(
  'Lamington Road Tech Components Center',
  '+91 22 2387 4455',
  'Dr. Dadasaheb Bhadkamkar Marg, Grant Road East',
  'Mumbai',
  'Maharashtra',
  '400007',
  ST_SetSRID(ST_MakePoint(72.8164, 18.9616), 4326)::geography,
  '10:00 AM - 8:00 PM (Mon-Sat)',
  'verified',
  4.7,
  ARRAY['Robotics Kits', 'Raspberry Pi', 'Motors', 'Tools', 'ESP32']
),
(
  'Gujarati Galli Maker Spares Hub',
  '+91 40 2475 9933',
  'Gujarati Galli, Bank Street, Koti',
  'Hyderabad',
  'Telangana',
  '500095',
  ST_SetSRID(ST_MakePoint(78.4867, 17.3850), 4326)::geography,
  '10:00 AM - 8:00 PM (Mon-Sat)',
  'verified',
  4.6,
  ARRAY['Sensors', 'Breadboards', 'Batteries', 'Arduino', 'Wires']
),
(
  'Budhwar Peth Robotics & Electronic Store',
  '+91 20 2445 6677',
  'Appa Balwant Chowk, Budhwar Peth',
  'Pune',
  'Maharashtra',
  '411002',
  ST_SetSRID(ST_MakePoint(73.8562, 18.5167), 4326)::geography,
  '10:00 AM - 8:00 PM (Mon-Sat)',
  'verified',
  4.7,
  ARRAY['Servos', 'Microcontrollers', 'Sensors', 'Drone Parts', 'Tools']
)
ON CONFLICT DO NOTHING;
