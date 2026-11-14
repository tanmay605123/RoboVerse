-- =====================================================================
-- RoboVerse Phase 1 Database, Auth Model, Security & Entitlements
-- Migration: 20261101000001_phase1_consolidated_schema.sql
-- =====================================================================

-- 1. Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Enable pg_cron if available (Supabase Cloud)
DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS "pg_cron";
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 2. Custom Enumerations
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'student',
    'teacher',
    'institution_admin',
    'admin',
    'store_admin',
    'support'
  );
EXCEPTION
  WHEN duplicate_object THEN
    -- In case user_role already existed, ensure 'support' value is added
    BEGIN
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'support';
    EXCEPTION
      WHEN OTHERS THEN NULL;
    END;
END $$;

DO $$ BEGIN
  CREATE TYPE plan_tier AS ENUM (
    'free',
    'plus',
    'pro',
    'institution'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE billing_cycle AS ENUM (
    'monthly',
    'quarterly',
    'yearly',
    'one_time'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM (
    'checkout',
    'qr'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
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
  WHEN duplicate_object THEN NULL;
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
  WHEN duplicate_object THEN NULL;
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
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE shipping_class AS ENUM (
    'standard',
    'battery',
    'regulated_drone'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE verified_status AS ENUM (
    'pending',
    'verified',
    'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Student ID Sequence
CREATE SEQUENCE IF NOT EXISTS student_id_seq START WITH 1001 INCREMENT BY 1;

-- =====================================================================
-- 3. Identity, Profiles & Consents
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  dob date,
  is_minor boolean NOT NULL DEFAULT false,
  school text,
  school_or_college text,
  class_level text,
  city text,
  pincode text,
  state text,
  country text DEFAULT 'India',
  interests text[] DEFAULT '{}',
  language text DEFAULT 'en',
  avatar_url text,
  level text DEFAULT 'Rookie',
  xp integer DEFAULT 0 CHECK (xp >= 0),
  streak_days integer DEFAULT 1 CHECK (streak_days >= 0),
  parent_email text,
  parental_consent_at timestamptz,
  location_consent boolean DEFAULT false,
  last_seen_at timestamptz DEFAULT now(),
  current_activity text DEFAULT 'Exploring RoboVerse',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure dob, school columns exist if profiles was previously created
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dob date;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school text;

-- Consents Table (User Consent Ledger)
CREATE TABLE IF NOT EXISTS public.consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  consent_type text NOT NULL, -- 'terms', 'privacy', 'location', 'cookies', 'marketing'
  granted boolean NOT NULL DEFAULT true,
  ip_address text,
  user_agent text,
  granted_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

-- Parental Consents Table (Section 10 Minor Safety)
CREATE TABLE IF NOT EXISTS public.parental_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  minor_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_email text NOT NULL,
  parent_name text,
  token text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  consent_for_purchases boolean NOT NULL DEFAULT false,
  consent_for_ai_photo boolean NOT NULL DEFAULT false,
  consent_for_public_projects boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================================
-- 4. Plans, Subscriptions, Payments & Refunds
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
  status subscription_status NOT NULL DEFAULT 'active',
  billing_cycle billing_cycle NOT NULL DEFAULT 'monthly',
  razorpay_subscription_id text,
  razorpay_customer_id text,
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  order_id uuid,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount_inr numeric(10,2) NOT NULL,
  tax_inr numeric(10,2) DEFAULT 0,
  status payment_status NOT NULL DEFAULT 'pending',
  payment_method payment_method NOT NULL DEFAULT 'checkout',
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  upi_qr_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  order_id uuid,
  amount_inr numeric(10,2) NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  razorpay_refund_id text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.webhook_events (
  id text PRIMARY KEY,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  error_log text,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.coupons (
  id text PRIMARY KEY,
  code text UNIQUE NOT NULL,
  discount_percent numeric(5,2) NOT NULL,
  max_discount_inr numeric(10,2),
  min_order_inr numeric(10,2) DEFAULT 0,
  valid_until timestamptz,
  is_active boolean DEFAULT true,
  usage_limit integer,
  times_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- =====================================================================
-- 5. Courses, Lessons, Quizzes & Certificates
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.courses (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  tagline text NOT NULL,
  description text,
  track text NOT NULL,
  duration_hours integer NOT NULL DEFAULT 10,
  required_plan_tier plan_tier NOT NULL DEFAULT 'free',
  cover_image text,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.modules (
  id text PRIMARY KEY,
  course_id text NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lessons (
  id text PRIMARY KEY,
  module_id text NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  course_id text NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  order_index integer NOT NULL,
  duration_minutes integer DEFAULT 15,
  xp_reward integer DEFAULT 50,
  is_free_preview boolean DEFAULT false,
  starter_code text,
  sample_circuit_id text,
  content_markdown text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id text NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  progress_percent numeric(5,2) DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id text NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  time_spent_seconds integer DEFAULT 0,
  last_code text,
  UNIQUE(user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS public.quizzes (
  id text PRIMARY KEY,
  course_id text REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id text REFERENCES public.lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  passing_score integer NOT NULL DEFAULT 70,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id text NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score numeric(5,2) NOT NULL,
  max_score numeric(5,2) NOT NULL,
  passed boolean NOT NULL,
  answers jsonb DEFAULT '{}'::jsonb,
  attempted_at timestamptz DEFAULT now()
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
  hours integer NOT NULL,
  grade_score numeric(4,1) DEFAULT 95.0,
  is_revoked boolean DEFAULT false,
  revoked_reason text,
  issuing_authority text DEFAULT 'RoboVerse Academy Certification Board',
  issued_at timestamptz DEFAULT now(),
  qr_verification_url text NOT NULL,
  pdf_storage_path text
);

-- =====================================================================
-- 6. Hardware Components Library & Projects
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.components (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  description text,
  pins jsonb NOT NULL DEFAULT '[]'::jsonb,
  electrical_params jsonb NOT NULL DEFAULT '{}'::jsonb,
  physical_params jsonb NOT NULL DEFAULT '{}'::jsonb,
  asset_paths jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.circuit_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  circuit_data jsonb NOT NULL DEFAULT '{"components":[],"wires":[]}'::jsonb,
  arduino_code text DEFAULT '',
  is_public boolean DEFAULT false,
  is_sample boolean DEFAULT false,
  thumbnail_url text,
  remix_count integer DEFAULT 0,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.circuit_project_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.circuit_projects(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  circuit_data jsonb NOT NULL,
  arduino_code text,
  commit_message text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, version_number)
);

CREATE TABLE IF NOT EXISTS public.robot_templates (
  id text PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL, -- 'line_follower', 'quadcopter', 'robotic_arm', 'bionic_hand', 'obstacle_rover', 'self_balancing'
  description text,
  urdf_data text,
  parts_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  default_arena_id text,
  thumbnail_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.robot_designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_id text REFERENCES public.robot_templates(id),
  title text NOT NULL,
  description text,
  robot_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.arenas (
  id text PRIMARY KEY,
  name text NOT NULL,
  environment_type text NOT NULL,
  physics_params jsonb NOT NULL DEFAULT '{}'::jsonb,
  obstacles jsonb NOT NULL DEFAULT '[]'::jsonb,
  thumbnail_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.test_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  robot_design_id uuid REFERENCES public.robot_designs(id) ON DELETE CASCADE,
  arena_id text REFERENCES public.arenas(id),
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  score numeric(6,2),
  completed boolean DEFAULT false,
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
-- 7. Rituu AI Chat & Multi-Turn Sessions
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Robotics Mentorship Session',
  context_project_id uuid REFERENCES public.circuit_projects(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  sender text NOT NULL CHECK (sender IN ('user', 'rituu')),
  content text NOT NULL,
  off_topic boolean DEFAULT false,
  input_tokens integer DEFAULT 0,
  output_tokens integer DEFAULT 0,
  image_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rituu_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_ist date NOT NULL,
  messages_count integer DEFAULT 0,
  photos_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, day_ist)
);

CREATE TABLE IF NOT EXISTS public.ai_cost_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id uuid REFERENCES public.chat_sessions(id) ON DELETE SET NULL,
  model text NOT NULL,
  input_tokens integer NOT NULL DEFAULT 0,
  output_tokens integer NOT NULL DEFAULT 0,
  estimated_cost_usd numeric(10,6) NOT NULL DEFAULT 0,
  is_offtopic boolean NOT NULL DEFAULT false,
  latency_ms integer,
  created_at timestamptz DEFAULT now()
);

-- =====================================================================
-- 8. Maker Radar Nearby Shops
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  google_place_id text UNIQUE,
  phone text,
  address text NOT NULL,
  city text NOT NULL,
  state text,
  pincode text,
  location geography(Point, 4326) NOT NULL,
  opening_hours text,
  categories text[] DEFAULT '{}',
  verified_status verified_status DEFAULT 'pending',
  rating numeric(2,1) DEFAULT 4.5,
  review_count integer DEFAULT 0,
  photos text[] DEFAULT '{}',
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS shops_location_gist ON public.shops USING gist(location);

CREATE TABLE IF NOT EXISTS public.shop_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  component_id text REFERENCES public.components(id) ON DELETE CASCADE,
  in_stock boolean DEFAULT true,
  price_inr numeric(10,2),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(shop_id, component_id)
);

CREATE TABLE IF NOT EXISTS public.shop_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  reported_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  report_type text NOT NULL, -- 'CLOSED', 'WRONG_LOCATION', 'OUT_OF_STOCK', 'INCORRECT_HOURS'
  notes text,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RESOLVED', 'DISMISSED')),
  created_at timestamptz DEFAULT now()
);

-- =====================================================================
-- 9. TechSavyyy Hardware Store, Carts, Orders, Invoices
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.product_categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  sku text UNIQUE NOT NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category_id text NOT NULL REFERENCES public.product_categories(id),
  price_inr numeric(10,2) NOT NULL, -- GST 18% Inclusive
  mrp_inr numeric(10,2) NOT NULL,
  gst_percent numeric(5,2) NOT NULL DEFAULT 18.00,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  age_restricted boolean NOT NULL DEFAULT false,
  shipping_class shipping_class NOT NULL DEFAULT 'standard',
  images text[] DEFAULT '{}',
  specs jsonb DEFAULT '{}'::jsonb,
  description text,
  component_id text REFERENCES public.components(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.kits (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  price_inr numeric(10,2) NOT NULL,
  mrp_inr numeric(10,2) NOT NULL,
  level text NOT NULL DEFAULT 'Beginner',
  shipping_class shipping_class NOT NULL DEFAULT 'standard',
  age_restricted boolean NOT NULL DEFAULT false,
  image text,
  linked_course_slug text,
  linked_circuit_sample_id text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.kit_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id text NOT NULL REFERENCES public.kits(id) ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(kit_id, product_id)
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
  country text NOT NULL DEFAULT 'India',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid REFERENCES public.carts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  address_id uuid REFERENCES public.addresses(id),
  shipping_address jsonb NOT NULL,
  subtotal_inr numeric(10,2) NOT NULL,
  gst_amount_inr numeric(10,2) NOT NULL,
  discount_inr numeric(10,2) NOT NULL DEFAULT 0,
  total_inr numeric(10,2) NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  payment_method payment_method NOT NULL DEFAULT 'checkout',
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name text NOT NULL,
  sku text NOT NULL,
  unit_price_inr numeric(10,2) NOT NULL,
  gst_percent numeric(5,2) NOT NULL DEFAULT 18.00,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  total_price_inr numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  notes text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  courier text NOT NULL,
  tracking_number text NOT NULL,
  tracking_url text,
  shipping_class shipping_class NOT NULL DEFAULT 'standard',
  status text NOT NULL DEFAULT 'manifested',
  dispatched_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id text NOT NULL,
  bill_to jsonb NOT NULL,
  gstin text,
  taxable_amount_inr numeric(10,2) NOT NULL,
  cgst_inr numeric(10,2) NOT NULL DEFAULT 0,
  sgst_inr numeric(10,2) NOT NULL DEFAULT 0,
  igst_inr numeric(10,2) NOT NULL DEFAULT 0,
  total_inr numeric(10,2) NOT NULL,
  pdf_url text,
  created_at timestamptz DEFAULT now()
);

-- =====================================================================
-- 10. Hackathons, Notifications, Audit Log, Daily Stats, Config
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.hackathons (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  tagline text NOT NULL,
  description text,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  prize_pool_inr numeric(10,2) NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  max_team_size integer DEFAULT 4,
  tracks jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hackathon_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id text NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_name text NOT NULL,
  role text DEFAULT 'lead',
  project_title text,
  project_url text,
  submission_data jsonb DEFAULT '{}'::jsonb,
  registered_at timestamptz DEFAULT now(),
  UNIQUE(hackathon_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  is_read boolean DEFAULT false,
  link text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.daily_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date date UNIQUE NOT NULL,
  total_students integer DEFAULT 0,
  active_students integer DEFAULT 0,
  projects_created integer DEFAULT 0,
  certificates_issued integer DEFAULT 0,
  rituu_messages integer DEFAULT 0,
  revenue_inr numeric(10,2) DEFAULT 0,
  orders_count integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  enabled boolean DEFAULT false,
  description text,
  rollout_pct integer DEFAULT 100,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.app_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  is_public boolean DEFAULT true,
  description text,
  updated_at timestamptz DEFAULT now()
);

-- =====================================================================
-- 11. Security Definer Functions, Triggers & Views
-- =====================================================================

-- 1. Sequence-based Student ID Generator (e.g., RV-2026-001001)
CREATE OR REPLACE FUNCTION public.generate_student_id()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_year text;
  v_seq integer;
BEGIN
  v_year := to_char(CURRENT_DATE, 'YYYY');
  v_seq := nextval('student_id_seq');
  RETURN 'RV-' || v_year || '-' || lpad(v_seq::text, 6, '0');
END;
$$;

-- 2. Security Helper: is_admin() (Reads from profiles.role in database, never metadata)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
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

-- 3. Automatic Profile Creation on Signup (Trigger on auth.users)
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
  v_dob date;
  v_school text;
BEGIN
  v_student_id := public.generate_student_id();
  
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  IF NEW.raw_user_meta_data ? 'interests' THEN
    SELECT ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'interests'))
    INTO v_interests;
  ELSE
    v_interests := ARRAY['arduino', 'circuits']::text[];
  END IF;

  v_dob := (NEW.raw_user_meta_data->>'dob')::date;
  
  -- Compute minor status: under 18 if dob provided, or boolean flag
  IF v_dob IS NOT NULL THEN
    v_is_minor := (v_dob > (CURRENT_DATE - INTERVAL '18 years'));
  ELSE
    v_is_minor := COALESCE((NEW.raw_user_meta_data->>'is_minor')::boolean, false);
  END IF;

  v_school := COALESCE(
    NEW.raw_user_meta_data->>'school',
    NEW.raw_user_meta_data->>'school_or_college'
  );

  INSERT INTO public.profiles (
    id,
    student_id,
    full_name,
    role, -- Role is ALWAYS 'student' at signup
    dob,
    is_minor,
    school,
    school_or_college,
    class_level,
    city,
    pincode,
    state,
    country,
    interests,
    language,
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
    v_dob,
    v_is_minor,
    v_school,
    v_school,
    NEW.raw_user_meta_data->>'class_level',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'pincode',
    NEW.raw_user_meta_data->>'state',
    COALESCE(NEW.raw_user_meta_data->>'country', 'India'),
    v_interests,
    COALESCE(NEW.raw_user_meta_data->>'language', 'en'),
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

  -- Automatically initialize a shopping cart for the user
  INSERT INTO public.carts (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Prevent Profile Privilege Escalation (Role & Student ID Immutable for non-admins)
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent altering role unless executed by an admin via admin_set_role
  IF (NEW.role IS DISTINCT FROM OLD.role) AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Privilege escalation prevented: Role cannot be modified directly.';
  END IF;

  -- Student ID is permanent and immutable
  IF (NEW.student_id IS DISTINCT FROM OLD.student_id) THEN
    RAISE EXCEPTION 'Student ID is permanent and immutable.';
  END IF;

  -- Maintain updated_at timestamp
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- Column-Level Grants on Profiles: Students cannot alter role, student_id, or xp directly
REVOKE UPDATE ON public.profiles FROM anon, authenticated;
GRANT UPDATE (
  full_name,
  dob,
  school,
  school_or_college,
  class_level,
  city,
  pincode,
  state,
  country,
  interests,
  language,
  avatar_url,
  location_consent
) ON public.profiles TO authenticated;

-- =====================================================================
-- 12. Single Source of Truth View: current_entitlements
-- =====================================================================

CREATE OR REPLACE VIEW public.current_entitlements AS
SELECT
  p.id AS user_id,
  p.student_id,
  p.full_name,
  p.role,
  p.is_minor,
  p.parental_consent_at IS NOT NULL AS has_parental_consent,
  COALESCE(sub.tier, 'free'::plan_tier) AS plan_tier,
  COALESCE(sub.name, 'Free Explorer') AS plan_name,
  UPPER(COALESCE(sub.tier::text, 'free')) AS badge,
  CASE 
    WHEN sub.tier = 'pro' THEN 10
    WHEN sub.tier = 'plus' THEN 5
    ELSE 0
  END AS store_discount_percent,
  CASE 
    WHEN sub.tier = 'pro' THEN 300
    WHEN sub.tier = 'plus' THEN 100
    ELSE 15
  END AS rituu_daily_messages,
  CASE 
    WHEN sub.tier = 'pro' THEN 50
    WHEN sub.tier = 'plus' THEN 20
    ELSE 3
  END AS rituu_daily_photos,
  CASE 
    WHEN sub.tier IN ('pro', 'plus') THEN -1
    ELSE 5
  END AS max_saved_projects,
  CASE 
    WHEN sub.tier IN ('pro', 'plus') THEN true 
    ELSE false 
  END AS allow_private_projects,
  CASE 
    WHEN sub.tier IN ('pro', 'plus') THEN true 
    ELSE false 
  END AS official_certificates_allowed
FROM public.profiles p
LEFT JOIN LATERAL (
  SELECT pl.tier, pl.name
  FROM public.subscriptions s
  JOIN public.plans pl ON pl.id = s.plan_id
  WHERE s.user_id = p.id AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1
) sub ON true;

-- Helper RPC to retrieve caller's entitlements
CREATE OR REPLACE FUNCTION public.get_current_entitlements()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_res jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object(
      'user_id', null,
      'student_id', null,
      'full_name', null,
      'role', 'student',
      'is_minor', false,
      'has_parental_consent', false,
      'plan_tier', 'free',
      'plan_name', 'Free Explorer',
      'badge', 'FREE',
      'store_discount_percent', 0,
      'rituu_daily_messages', 15,
      'rituu_daily_photos', 3,
      'max_saved_projects', 5,
      'allow_private_projects', false,
      'official_certificates_allowed', false
    );
  END IF;

  SELECT to_jsonb(e) INTO v_res
  FROM public.current_entitlements e
  WHERE e.user_id = auth.uid();

  RETURN v_res;
END;
$$;

-- =====================================================================
-- 13. Project Limits, Rituu AI Quota & Presence RPCs
-- =====================================================================

-- Enforce Free-Plan 5-Project Limit (Trigger on circuit_projects)
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
  -- Sample projects are excluded from limits
  IF NEW.is_sample IS TRUE THEN
    RETURN NEW;
  END IF;

  -- Determine user's active plan
  SELECT plan_tier INTO v_user_plan
  FROM public.current_entitlements
  WHERE user_id = NEW.user_id;

  -- If Free tier, enforce maximum of 5 projects
  IF v_user_plan = 'free'::plan_tier OR v_user_plan IS NULL THEN
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

-- Atomic Rituu Daily Limit Check (Free: 15+3, Plus: 100+20, Pro: 300+50 reset at midnight IST)
CREATE OR REPLACE FUNCTION public.rituu_consume(
  photo boolean DEFAULT false
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

  -- Date in Indian Standard Time (IST)
  v_today_ist := (now() AT TIME ZONE 'Asia/Kolkata')::date;

  -- Determine user plan and limits from current_entitlements
  SELECT 
    plan_tier, 
    rituu_daily_messages, 
    rituu_daily_photos
  INTO 
    v_plan_tier, 
    v_max_messages, 
    v_max_photos
  FROM public.current_entitlements
  WHERE user_id = v_user_id;

  v_max_messages := COALESCE(v_max_messages, 15);
  v_max_photos := COALESCE(v_max_photos, 3);
  v_plan_tier := COALESCE(v_plan_tier, 'free'::plan_tier);

  -- Atomic insert/lock usage row
  INSERT INTO public.rituu_usage (user_id, day_ist, messages_count, photos_count)
  VALUES (v_user_id, v_today_ist, 0, 0)
  ON CONFLICT (user_id, day_ist) DO NOTHING;

  SELECT messages_count, photos_count 
  INTO v_usage_messages, v_usage_photos
  FROM public.rituu_usage
  WHERE user_id = v_user_id AND day_ist = v_today_ist
  FOR UPDATE;

  -- Limit checks
  IF photo THEN
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
  IF photo THEN
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

-- Realtime Presence Touch RPC
CREATE OR REPLACE FUNCTION public.touch_presence(
  activity text DEFAULT 'Exploring Labs',
  project_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET last_seen_at = now(),
      current_activity = activity
  WHERE id = auth.uid();

  IF project_id IS NOT NULL THEN
    UPDATE public.circuit_projects
    SET updated_at = now()
    WHERE id = project_id AND user_id = auth.uid();
  END IF;
END;
$$;

-- PostGIS Nearby Shops RPC
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

-- =====================================================================
-- 14. E-Commerce Order & Invoicing RPCs
-- =====================================================================

-- Create Order From Cart (Totals calculated solely from DB price_inr, stock & age restriction enforced)
CREATE OR REPLACE FUNCTION public.create_order_from_cart(
  address_id uuid,
  coupon_code text DEFAULT NULL
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
  v_plan_discount_pct numeric := 0;
  v_address_json jsonb;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  -- Verify minor status and consent
  SELECT is_minor, parental_consent_at INTO v_is_minor, v_parent_consent
  FROM public.profiles WHERE id = v_user_id;

  -- Validate address
  SELECT to_jsonb(a) INTO v_address_json
  FROM public.addresses a
  WHERE a.id = address_id AND a.user_id = v_user_id;

  IF v_address_json IS NULL THEN
    RAISE EXCEPTION 'Shipping address not found.';
  END IF;

  -- Validate cart non-empty
  IF NOT EXISTS (SELECT 1 FROM public.cart_items WHERE user_id = v_user_id) THEN
    RAISE EXCEPTION 'Shopping cart is empty.';
  END IF;

  -- Validate stock and minor age-restricted equipment consent
  FOR v_item IN 
    SELECT c.product_id, c.quantity, p.name, p.price_inr, p.stock, p.gst_percent, p.age_restricted, p.sku
    FROM public.cart_items c
    JOIN public.products p ON p.id = c.product_id
    WHERE c.user_id = v_user_id
  LOOP
    IF v_item.stock < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for "%" (Available: %, Requested: %)', v_item.name, v_item.stock, v_item.quantity;
    END IF;

    IF v_item.age_restricted AND v_is_minor AND v_parent_consent IS NULL THEN
      RAISE EXCEPTION 'Parental consent is required to order age-restricted equipment ("%")', v_item.name;
    END IF;

    v_subtotal := v_subtotal + (v_item.price_inr * v_item.quantity);
  END LOOP;

  -- Plan discount percentage from current_entitlements
  SELECT store_discount_percent INTO v_plan_discount_pct
  FROM public.current_entitlements
  WHERE user_id = v_user_id;

  IF v_plan_discount_pct > 0 THEN
    v_discount := ROUND(v_subtotal * (v_plan_discount_pct / 100.0), 2);
  END IF;

  -- Coupon validation
  IF coupon_code IS NOT NULL AND coupon_code <> '' THEN
    DECLARE
      v_coupon record;
    BEGIN
      SELECT * INTO v_coupon FROM public.coupons 
      WHERE code = upper(coupon_code) AND is_active IS TRUE
        AND (valid_until IS NULL OR valid_until > now());
      
      IF v_coupon IS NOT NULL AND v_subtotal >= v_coupon.min_order_inr THEN
        DECLARE
          v_c_disc numeric;
        BEGIN
          v_c_disc := ROUND(v_subtotal * (v_coupon.discount_percent / 100.0), 2);
          IF v_coupon.max_discount_inr IS NOT NULL AND v_c_disc > v_coupon.max_discount_inr THEN
            v_c_disc := v_coupon.max_discount_inr;
          END IF;
          v_discount := v_discount + v_c_disc;
        END;
      END IF;
    END;
  END IF;

  v_total := GREATEST(0, v_subtotal - v_discount);
  -- 18% embedded GST: Taxable Base = Total / 1.18, GST Amount = Total - Taxable Base
  v_gst_total := ROUND(v_total - (v_total / 1.18), 2);

  v_order_number := 'ROBO-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(gen_random_uuid()::text, 1, 6));

  -- Insert order
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
    address_id,
    v_address_json,
    v_subtotal,
    v_gst_total,
    v_discount,
    v_total,
    'pending'
  ) RETURNING id INTO v_order_id;

  -- Insert order items
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

  -- Append to order events
  INSERT INTO public.order_events (order_id, status, notes, created_by)
  VALUES (v_order_id, 'created', 'Order placed via cart checkout', v_user_id);

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

-- Finalize Order Payment (Webhook execution: decrements stock, generates official invoice)
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
  v_order record;
  v_student_id text;
  v_invoice_number text;
  v_taxable numeric(10,2);
  v_gst numeric(10,2);
  v_is_interstate boolean;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF v_order IS NULL THEN
    RAISE EXCEPTION 'Order not found.';
  END IF;

  -- A browser callback and a provider webhook may both finalize one payment.
  -- Locking the order and returning here keeps stock and invoice updates once-only.
  IF v_order.status = 'paid' THEN
    RETURN;
  END IF;

  -- Update order status
  UPDATE public.orders
  SET status = 'paid',
      razorpay_payment_id = p_razorpay_payment_id,
      updated_at = now()
  WHERE id = p_order_id;

  -- Decrement inventory stock
  FOR v_item IN SELECT product_id, quantity FROM public.order_items WHERE order_id = p_order_id LOOP
    UPDATE public.products
    SET stock = GREATEST(0, stock - v_item.quantity)
    WHERE id = v_item.product_id;
  END LOOP;

  -- Fetch student_id
  SELECT student_id INTO v_student_id FROM public.profiles WHERE id = v_order.user_id;

  -- Generate invoice
  v_invoice_number := 'INV-' || to_char(now(), 'YYYYMM') || '-' || upper(substring(gen_random_uuid()::text, 1, 6));
  v_taxable := ROUND((v_order.total_inr / 1.18), 2);
  v_gst := v_order.total_inr - v_taxable;
  v_is_interstate := (v_order.shipping_address->>'state' ILIKE '%Delhi%' IS FALSE);

  INSERT INTO public.invoices (
    invoice_number,
    order_id,
    user_id,
    student_id,
    bill_to,
    taxable_amount_inr,
    cgst_inr,
    sgst_inr,
    igst_inr,
    total_inr
  ) VALUES (
    v_invoice_number,
    p_order_id,
    v_order.user_id,
    COALESCE(v_student_id, 'RV-STUDENT'),
    v_order.shipping_address,
    v_taxable,
    CASE WHEN v_is_interstate THEN 0 ELSE ROUND(v_gst / 2, 2) END,
    CASE WHEN v_is_interstate THEN 0 ELSE ROUND(v_gst / 2, 2) END,
    CASE WHEN v_is_interstate THEN v_gst ELSE 0 END,
    v_order.total_inr
  ) ON CONFLICT (invoice_number) DO NOTHING;

  -- Log order event
  INSERT INTO public.order_events (order_id, status, notes)
  VALUES (p_order_id, 'paid', 'Payment verified and invoice generated: ' || v_invoice_number);
END;
$$;

-- =====================================================================
-- 15. Verifiable Certificates RPCs
-- =====================================================================

-- Issue Certificate (Checks completion rules)
CREATE OR REPLACE FUNCTION public.issue_certificate(
  course_id text
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
  FROM public.lessons WHERE public.lessons.course_id = issue_certificate.course_id;

  SELECT COUNT(*) INTO v_completed_lessons
  FROM public.lesson_progress lp
  JOIN public.lessons l ON l.id = lp.lesson_id
  WHERE lp.user_id = v_user_id AND l.course_id = issue_certificate.course_id AND lp.completed IS TRUE;

  IF v_total_lessons = 0 OR v_completed_lessons < v_total_lessons THEN
    RAISE EXCEPTION 'Course incomplete: % of % lessons completed.', v_completed_lessons, v_total_lessons;
  END IF;

  -- Check if already issued
  SELECT id, certificate_code INTO v_cert_id, v_cert_code
  FROM public.certificates
  WHERE user_id = v_user_id AND public.certificates.course_id = issue_certificate.course_id;

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
  FROM public.courses WHERE id = issue_certificate.course_id;

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
    issue_certificate.course_id,
    v_student_name,
    v_student_id,
    v_course_name,
    v_track,
    v_hours,
    98.5,
    'https://roboverse-delta.vercel.app/verify/' || v_cert_code
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

-- Verify Certificate (Publicly accessible with limited fields)
CREATE OR REPLACE FUNCTION public.verify_certificate(
  code text
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
    'revoked_reason', revoked_reason,
    'issuing_authority', issuing_authority
  )
  FROM public.certificates
  WHERE certificate_code = upper(code)
  LIMIT 1;
$$;

-- Grant public execution on verify_certificate and nearby_shops
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.nearby_shops(double precision, double precision, double precision, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_entitlements() TO anon, authenticated;

-- =====================================================================
-- 16. Admin-Only Control Room RPCs
-- =====================================================================

-- Admin Overview Metrics
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
    'open_shop_reports', (SELECT COUNT(*) FROM public.shop_reports WHERE status = 'PENDING'),
    'server_timestamp', now()
  ) INTO v_res;

  -- Append to audit_log
  INSERT INTO public.audit_log (actor_id, action, target_type, target_id, metadata)
  VALUES (auth.uid(), 'VIEW_ADMIN_OVERVIEW', 'system', 'overview', jsonb_build_object('timestamp', now()));

  RETURN v_res;
END;
$$;

-- Admin Students Directory (Student ID, name, school, city, plan, current course, progress %, current project, last active)
CREATE OR REPLACE FUNCTION public.admin_students(
  search text DEFAULT '',
  filters text DEFAULT 'ALL',
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  student_id text,
  name text,
  school text,
  city text,
  plan text,
  current_course text,
  progress_percent numeric,
  current_project text,
  last_active timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required.';
  END IF;

  -- Log audit event
  INSERT INTO public.audit_log (actor_id, action, target_type, target_id, metadata)
  VALUES (auth.uid(), 'QUERY_STUDENTS', 'profiles', 'directory', jsonb_build_object('search', search, 'filter', filters));

  RETURN QUERY
  SELECT 
    p.student_id,
    p.full_name AS name,
    COALESCE(p.school, p.school_or_college, 'RoboVerse Academy') AS school,
    COALESCE(p.city, 'India') AS city,
    COALESCE(sub.tier::text, 'free') AS plan,
    COALESCE(c.title, 'Arduino Foundations') AS current_course,
    COALESCE(e.progress_percent, 0) AS progress_percent,
    p.current_activity AS current_project,
    p.last_seen_at AS last_active
  FROM public.profiles p
  LEFT JOIN LATERAL (
    SELECT pl.tier 
    FROM public.subscriptions s
    JOIN public.plans pl ON pl.id = s.plan_id
    WHERE s.user_id = p.id AND s.status = 'active'
    ORDER BY s.created_at DESC
    LIMIT 1
  ) sub ON true
  LEFT JOIN LATERAL (
    SELECT en.course_id, en.progress_percent
    FROM public.enrollments en
    WHERE en.user_id = p.id
    ORDER BY en.enrolled_at DESC
    LIMIT 1
  ) e ON true
  LEFT JOIN public.courses c ON c.id = e.course_id
  WHERE (
    search = '' OR
    p.full_name ILIKE '%' || search || '%' OR
    p.student_id ILIKE '%' || search || '%' OR
    p.city ILIKE '%' || search || '%'
  )
  AND (
    filters = 'ALL' OR
    (sub.tier::text ILIKE filters)
  )
  ORDER BY p.last_seen_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Admin Set Role RPC
CREATE OR REPLACE FUNCTION public.admin_set_role(
  target_user_id uuid,
  new_role user_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required.';
  END IF;

  UPDATE public.profiles
  SET role = new_role,
      updated_at = now()
  WHERE id = target_user_id;

  INSERT INTO public.audit_log (actor_id, action, target_type, target_id, metadata)
  VALUES (
    auth.uid(),
    'SET_ROLE',
    'profiles',
    target_user_id::text,
    jsonb_build_object('new_role', new_role)
  );
END;
$$;

-- Admin Refund RPC
CREATE OR REPLACE FUNCTION public.admin_refund(
  order_id uuid,
  reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order record;
  v_refund_id uuid;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required.';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = admin_refund.order_id;
  IF v_order IS NULL THEN
    RAISE EXCEPTION 'Order not found.';
  END IF;

  UPDATE public.orders
  SET status = 'refunded',
      updated_at = now()
  WHERE id = admin_refund.order_id;

  UPDATE public.payments
  SET status = 'refunded'
  WHERE order_id = admin_refund.order_id;

  INSERT INTO public.refunds (
    order_id,
    amount_inr,
    reason,
    status,
    created_by
  ) VALUES (
    admin_refund.order_id,
    v_order.total_inr,
    admin_refund.reason,
    'processed',
    auth.uid()
  ) RETURNING id INTO v_refund_id;

  INSERT INTO public.audit_log (actor_id, action, target_type, target_id, metadata)
  VALUES (
    auth.uid(),
    'ORDER_REFUND',
    'orders',
    admin_refund.order_id::text,
    jsonb_build_object('refund_id', v_refund_id, 'amount_inr', v_order.total_inr, 'reason', admin_refund.reason)
  );

  RETURN jsonb_build_object('success', true, 'refund_id', v_refund_id);
END;
$$;

-- Admin Revoke Certificate RPC
CREATE OR REPLACE FUNCTION public.admin_revoke_certificate(
  certificate_code text,
  reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required.';
  END IF;

  UPDATE public.certificates
  SET is_revoked = true,
      revoked_reason = admin_revoke_certificate.reason
  WHERE public.certificates.certificate_code = upper(admin_revoke_certificate.certificate_code);

  INSERT INTO public.audit_log (actor_id, action, target_type, target_id, metadata)
  VALUES (
    auth.uid(),
    'REVOKE_CERTIFICATE',
    'certificates',
    upper(admin_revoke_certificate.certificate_code),
    jsonb_build_object('reason', admin_revoke_certificate.reason)
  );
END;
$$;

-- Refresh Daily Stats Function & pg_cron Setup
CREATE OR REPLACE FUNCTION public.refresh_daily_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today date;
BEGIN
  v_today := (now() AT TIME ZONE 'Asia/Kolkata')::date;

  INSERT INTO public.daily_stats (
    stat_date,
    total_students,
    active_students,
    projects_created,
    certificates_issued,
    rituu_messages,
    revenue_inr,
    orders_count,
    updated_at
  ) VALUES (
    v_today,
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'student'),
    (SELECT COUNT(*) FROM public.profiles WHERE last_seen_at >= now() - interval '24 hours'),
    (SELECT COUNT(*) FROM public.circuit_projects WHERE is_sample IS FALSE),
    (SELECT COUNT(*) FROM public.certificates WHERE is_revoked IS FALSE),
    (SELECT COALESCE(SUM(messages_count), 0) FROM public.rituu_usage WHERE day_ist = v_today),
    (SELECT COALESCE(SUM(amount_inr), 0) FROM public.payments WHERE status = 'completed'),
    (SELECT COUNT(*) FROM public.orders WHERE status IN ('paid', 'delivered')),
    now()
  )
  ON CONFLICT (stat_date) DO UPDATE SET
    total_students = EXCLUDED.total_students,
    active_students = EXCLUDED.active_students,
    projects_created = EXCLUDED.projects_created,
    certificates_issued = EXCLUDED.certificates_issued,
    rituu_messages = EXCLUDED.rituu_messages,
    revenue_inr = EXCLUDED.revenue_inr,
    orders_count = EXCLUDED.orders_count,
    updated_at = now();
END;
$$;

-- =====================================================================
-- 17. Row Level Security (RLS) on EVERY Table
-- =====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parental_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE public.ai_cost_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Granular RLS Policies for New Tables
DROP POLICY IF EXISTS "Users can read own consents" ON public.consents;
CREATE POLICY "Users can read own consents"
  ON public.consents FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own consents" ON public.consents;
CREATE POLICY "Users can insert own consents"
  ON public.consents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own parental consents" ON public.parental_consents;
CREATE POLICY "Users can read own parental consents"
  ON public.parental_consents FOR SELECT TO authenticated USING (auth.uid() = minor_user_id);

DROP POLICY IF EXISTS "Users can read own carts" ON public.carts;
CREATE POLICY "Users can read own carts"
  ON public.carts FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own carts" ON public.carts;
CREATE POLICY "Users can insert own carts"
  ON public.carts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own refunds" ON public.refunds;
CREATE POLICY "Users can read own refunds"
  ON public.refunds FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = refunds.order_id AND o.user_id = auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "Users can read own invoices" ON public.invoices;
CREATE POLICY "Users can read own invoices"
  ON public.invoices FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can read own shipments" ON public.shipments;
CREATE POLICY "Users can read own shipments"
  ON public.shipments FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = shipments.order_id AND o.user_id = auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "Users can read own order events" ON public.order_events;
CREATE POLICY "Users can read own order events"
  ON public.order_events FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_events.order_id AND o.user_id = auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "Users can read own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can read own quiz attempts"
  ON public.quiz_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can insert own quiz attempts"
  ON public.quiz_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Hackathons are publicly viewable" ON public.hackathons;
CREATE POLICY "Hackathons are publicly viewable"
  ON public.hackathons FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Hackathon registrations viewable" ON public.hackathon_registrations;
CREATE POLICY "Hackathon registrations viewable"
  ON public.hackathon_registrations FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Users can register for hackathons" ON public.hackathon_registrations;
CREATE POLICY "Users can register for hackathons"
  ON public.hackathon_registrations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public can read app config" ON public.app_config;
CREATE POLICY "Public can read app config"
  ON public.app_config FOR SELECT TO anon, authenticated USING (is_public IS TRUE);

DROP POLICY IF EXISTS "Admins manage app config" ON public.app_config;
CREATE POLICY "Admins manage app config"
  ON public.app_config FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can read feature flags" ON public.feature_flags;
CREATE POLICY "Public can read feature flags"
  ON public.feature_flags FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admins manage feature flags" ON public.feature_flags;
CREATE POLICY "Admins manage feature flags"
  ON public.feature_flags FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can view audit log" ON public.audit_log;
CREATE POLICY "Admins can view audit log"
  ON public.audit_log FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view daily stats" ON public.daily_stats;
CREATE POLICY "Admins can view daily stats"
  ON public.daily_stats FOR SELECT TO authenticated USING (public.is_admin());
