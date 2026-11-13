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
