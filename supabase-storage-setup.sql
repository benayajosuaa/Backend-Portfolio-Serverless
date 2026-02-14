-- ============================================
-- SUPABASE STORAGE BUCKETS SETUP
-- ============================================
-- Run this SQL in Supabase SQL Editor
-- This creates storage buckets for images
-- ============================================

-- Create buckets for journeys and works images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('journeys', 'journeys', true, 6291456, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('works', 'works', true, 7340032, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =====================================================
-- STORAGE POLICIES FOR JOURNEYS BUCKET
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "journeys_public_read" ON storage.objects;
DROP POLICY IF EXISTS "journeys_service_all" ON storage.objects;

-- Public can read images
CREATE POLICY "journeys_public_read" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'journeys');

-- Service role can do everything
CREATE POLICY "journeys_service_all" ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'journeys')
  WITH CHECK (bucket_id = 'journeys');

-- =====================================================
-- STORAGE POLICIES FOR WORKS BUCKET
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "works_public_read" ON storage.objects;
DROP POLICY IF EXISTS "works_service_all" ON storage.objects;

-- Public can read images
CREATE POLICY "works_public_read" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'works');

-- Service role can do everything
CREATE POLICY "works_service_all" ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'works')
  WITH CHECK (bucket_id = 'works');
