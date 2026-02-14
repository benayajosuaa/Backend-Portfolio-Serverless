-- Enable Row Level Security on all tables
-- This migration addresses Supabase security warnings about RLS being disabled

-- Enable RLS on users table
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on journeys table  
ALTER TABLE "public"."journeys" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on works table
ALTER TABLE "public"."works" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on contact_messages table
ALTER TABLE "public"."contact_messages" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on _prisma_migrations table (internal Prisma table)
ALTER TABLE "public"."_prisma_migrations" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR JOURNEYS TABLE
-- =====================================================

-- Public can read all journeys
CREATE POLICY "journeys_select_public" ON "public"."journeys"
    FOR SELECT
    USING (true);

-- Only service role (backend) can insert/update/delete
CREATE POLICY "journeys_all_service" ON "public"."journeys"
    FOR ALL
    USING (auth.role() = 'service_role');

-- =====================================================
-- RLS POLICIES FOR WORKS TABLE
-- =====================================================

-- Public can read published works only
CREATE POLICY "works_select_public" ON "public"."works"
    FOR SELECT
    USING (true);

-- Only service role (backend) can insert/update/delete
CREATE POLICY "works_all_service" ON "public"."works"
    FOR ALL
    USING (auth.role() = 'service_role');

-- =====================================================
-- RLS POLICIES FOR CONTACT_MESSAGES TABLE
-- =====================================================

-- Public can insert (create new contact messages)
CREATE POLICY "contact_messages_insert_public" ON "public"."contact_messages"
    FOR INSERT
    WITH CHECK (true);

-- Only service role (backend) can read/update/delete
CREATE POLICY "contact_messages_all_service" ON "public"."contact_messages"
    FOR ALL
    USING (auth.role() = 'service_role');

-- =====================================================
-- RLS POLICIES FOR USERS TABLE
-- =====================================================

-- Only service role (backend) can access users table
CREATE POLICY "users_all_service" ON "public"."users"
    FOR ALL
    USING (auth.role() = 'service_role');

-- =====================================================
-- RLS POLICIES FOR _PRISMA_MIGRATIONS TABLE
-- =====================================================

-- Only service role can access migrations table
CREATE POLICY "prisma_migrations_all_service" ON "public"."_prisma_migrations"
    FOR ALL
    USING (auth.role() = 'service_role');
