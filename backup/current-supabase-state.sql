-- ============================================
-- CURRENT SUPABASE STATE EXPORT
-- Generated: 2025-11-20
-- Purpose: Complete database state for Copilot context
-- ============================================

-- ============================================
-- 1. ALL TABLES WITH FULL SCHEMA
-- ============================================

-- Run this query to get all table structures:
SELECT 
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ============================================
-- 2. ALL ENUMS
-- ============================================

SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
ORDER BY t.typname, e.enumsortorder;

-- ============================================
-- 3. ALL FOREIGN KEYS
-- ============================================

SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- ============================================
-- 4. ALL INDEXES
-- ============================================

SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================
-- 5. ALL RLS POLICIES
-- ============================================

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- 6. ALL FUNCTIONS (INCLUDING RPC)
-- ============================================

SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.prokind = 'f'  -- Only functions (not aggregates or window functions)
ORDER BY p.proname;

-- ============================================
-- 7. ALL TRIGGERS
-- ============================================

SELECT 
    trigger_schema,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ============================================
-- 8. TRIGGER FUNCTIONS
-- ============================================

SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.prokind = 'f'
AND p.prorettype = 'trigger'::regtype::oid
ORDER BY p.proname;

-- ============================================
-- 9. TABLE OWNERSHIP & RLS STATUS
-- ============================================

SELECT 
    schemaname,
    tablename,
    tableowner,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- 10. STORAGE BUCKETS (if using Supabase Storage)
-- ============================================

SELECT * FROM storage.buckets;

-- ============================================
-- 11. AUTH SCHEMA INFO (if accessible)
-- ============================================

-- List auth users count and structure
SELECT 
    COUNT(*) as total_auth_users,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users,
    COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as deleted_users
FROM auth.users;

-- ============================================
-- MANUAL EXPORT NEEDED:
-- ============================================

/*
Please manually copy and paste these into separate sections:

1. COMPLETE TABLE SCHEMAS:
   For each table, run:
   
   \d+ users
   \d+ user_roles
   \d+ channels
   \d+ messages
   
   Or use Supabase Table Editor to export

2. COMPLETE RLS POLICIES:
   Go to: Authentication > Policies in Supabase Dashboard
   Copy all policies for each table

3. EDGE FUNCTIONS:
   List all Edge Functions from Supabase Dashboard
   Copy their TypeScript code

4. REALTIME SUBSCRIPTIONS:
   List which tables have Realtime enabled
   
5. STORAGE POLICIES:
   If using Storage, copy storage policies
*/

-- ============================================
-- QUICK EXPORT SCRIPT (Run in Supabase SQL Editor)
-- ============================================

-- Copy results from these queries and paste into a text file:

-- 1. Full Users Table Schema
SELECT 
    'users' as table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- 2. Full User_Roles Table Schema
SELECT 
    'user_roles' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_roles'
ORDER BY ordinal_position;

-- 3. Full Channels Table Schema
SELECT 
    'channels' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'channels'
ORDER BY ordinal_position;

-- 4. Full Messages Table Schema
SELECT 
    'messages' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'messages'
ORDER BY ordinal_position;

-- 5. App Role Enum Values
SELECT 
    'app_role' as enum_name,
    enumlabel as value,
    enumsortorder as order
FROM pg_enum
WHERE enumtypid = 'app_role'::regtype
ORDER BY enumsortorder;
