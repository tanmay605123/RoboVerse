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
