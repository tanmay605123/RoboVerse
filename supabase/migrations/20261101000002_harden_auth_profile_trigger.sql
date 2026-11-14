-- Harden Auth -> profile creation for email and phone signups.
-- This migration is safe to apply after the original trigger migration and the consolidated schema migration.

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
  v_metadata jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
BEGIN
  v_student_id := public.generate_student_id();

  v_full_name := COALESCE(
    NULLIF(v_metadata->>'full_name', ''),
    NULLIF(v_metadata->>'name', ''),
    NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
    NULLIF(NEW.phone, ''),
    'RoboVerse Explorer'
  );

  IF jsonb_typeof(v_metadata->'interests') = 'array' THEN
    SELECT ARRAY(SELECT jsonb_array_elements_text(v_metadata->'interests'))
    INTO v_interests;
  ELSE
    v_interests := ARRAY['arduino', 'circuits']::text[];
  END IF;

  v_is_minor := COALESCE((v_metadata->>'is_minor')::boolean, false);

  INSERT INTO public.profiles (
    id, student_id, full_name, role, school_or_college, class_level,
    city, pincode, state, country, interests, is_minor, parent_email,
    parental_consent_at, location_consent, avatar_url, level, xp, streak_days
  ) VALUES (
    NEW.id,
    v_student_id,
    v_full_name,
    'student'::user_role,
    v_metadata->>'school_or_college',
    v_metadata->>'class_level',
    v_metadata->>'city',
    v_metadata->>'pincode',
    v_metadata->>'state',
    COALESCE(v_metadata->>'country', 'India'),
    v_interests,
    v_is_minor,
    v_metadata->>'parent_email',
    CASE
      WHEN (v_metadata->>'parental_consent_given')::boolean IS TRUE THEN now()
      ELSE NULL
    END,
    COALESCE((v_metadata->>'location_consent')::boolean, false),
    v_metadata->>'avatar_url',
    'Rookie',
    50,
    1
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
