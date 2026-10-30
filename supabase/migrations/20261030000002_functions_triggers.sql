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
