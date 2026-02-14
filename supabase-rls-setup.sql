-- ============================================
-- SUPABASE RLS (Row Level Security) SETUP
-- ============================================
-- Run this SQL in Supabase SQL Editor
-- This enables RLS on all tables and creates policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."journeys" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."works" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."contact_messages" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on Prisma migrations table (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = '_prisma_migrations') THEN
        EXECUTE 'ALTER TABLE "public"."_prisma_migrations" ENABLE ROW LEVEL SECURITY';
    END IF;
END $$;

-- =====================================================
-- DROP EXISTING POLICIES (if any) - to avoid conflicts
-- =====================================================

DROP POLICY IF EXISTS "journeys_select_public" ON "public"."journeys";
DROP POLICY IF EXISTS "journeys_all_service" ON "public"."journeys";
DROP POLICY IF EXISTS "works_select_public" ON "public"."works";
DROP POLICY IF EXISTS "works_all_service" ON "public"."works";
DROP POLICY IF EXISTS "contact_messages_insert_public" ON "public"."contact_messages";
DROP POLICY IF EXISTS "contact_messages_all_service" ON "public"."contact_messages";
DROP POLICY IF EXISTS "users_all_service" ON "public"."users";
DROP POLICY IF EXISTS "prisma_migrations_all_service" ON "public"."_prisma_migrations";

-- =====================================================
-- RLS POLICIES FOR JOURNEYS TABLE
-- =====================================================

-- Public can read all journeys
CREATE POLICY "journeys_select_public" ON "public"."journeys"
    FOR SELECT
    TO public
    USING (true);

-- Service role (backend) can do everything
CREATE POLICY "journeys_all_service" ON "public"."journeys"
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- RLS POLICIES FOR WORKS TABLE
-- =====================================================

-- Public can read all works
CREATE POLICY "works_select_public" ON "public"."works"
    FOR SELECT
    TO public
    USING (true);

-- Service role (backend) can do everything
CREATE POLICY "works_all_service" ON "public"."works"
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- RLS POLICIES FOR CONTACT_MESSAGES TABLE
-- =====================================================

-- Public can insert new contact messages
CREATE POLICY "contact_messages_insert_public" ON "public"."contact_messages"
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Service role (backend) can do everything
CREATE POLICY "contact_messages_all_service" ON "public"."contact_messages"
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- RLS POLICIES FOR USERS TABLE
-- =====================================================

-- Only service role (backend) can access users table
CREATE POLICY "users_all_service" ON "public"."users"
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- RLS POLICIES FOR _PRISMA_MIGRATIONS TABLE
-- =====================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = '_prisma_migrations') THEN
        -- Only service role can access migrations table
        DROP POLICY IF EXISTS "prisma_migrations_all_service" ON "public"."_prisma_migrations";
        EXECUTE 'CREATE POLICY "prisma_migrations_all_service" ON "public"."_prisma_migrations" FOR ALL TO service_role USING (true) WITH CHECK (true)';
    END IF;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'journeys', 'works', 'contact_messages', '_prisma_migrations');
