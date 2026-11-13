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
