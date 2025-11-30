# 📋 Supabase Current State Export Guide

## Step-by-Step Instructions

### 1️⃣ **Run SQL Queries** (10 minutes)

Go to your Supabase Dashboard → SQL Editor and run the queries from `current-supabase-state.sql`. Copy all results into a new file called `current-state-results.sql`.

### 2️⃣ **Export RLS Policies** (5 minutes)

**Option A - Via Dashboard:**
1. Go to: Authentication → Policies
2. For each table (users, user_roles, channels, messages):
   - Click on the table
   - Copy each policy definition
   - Include policy name, operation type (SELECT/INSERT/UPDATE/DELETE), and the SQL expression

**Option B - Via SQL:**
```sql
-- This is already in current-supabase-state.sql query #5
SELECT 
    tablename,
    policyname,
    cmd as operation,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 3️⃣ **Export All Functions/RPCs** (5 minutes)

Already in `current-supabase-state.sql` query #6. The critical ones based on your `starting_point.json`:

- `check_database_setup()`
- `test_email_domains()`
- `sync_specific_auth_user(target_user_id)`
- `admin_create_complete_user()` ⭐ **MOST IMPORTANT**
- `update_professional_profile()`
- `search_users_by_expertise()`
- Any auth trigger functions

### 4️⃣ **Export Triggers** (3 minutes)

```sql
-- Already in current-supabase-state.sql query #7 and #8
-- Key trigger: handle_new_user (runs after auth.users insert)
```

### 5️⃣ **Check Edge Functions** (if any)

Go to: Edge Functions section in Supabase Dashboard
- List all function names
- Copy their TypeScript code

### 6️⃣ **Create Summary Document**

Create `current-state-summary.md` with this structure:

```markdown
# Current Supabase State

## Tables
1. **users**
   - id (uuid, pk)
   - email (text)
   - username (text)
   - full_name (text)
   - avatar_url (text)
   - projects (text[])
   - status (text: ONLINE/OFFLINE)
   - is_active (boolean)
   - bio (text)
   - institution (text)
   - department (text)
   - title (text)
   - orcid_id (text)
   - linkedin_url (text)
   - website_url (text)
   - expertise_areas (text[])
   - skills (text[])
   - location (text)
   - available_for_collaboration (boolean)
   - created_at (timestamp)
   - updated_at (timestamp)

2. **user_roles**
   - user_id (uuid, fk -> users.id)
   - role (app_role enum)
   - created_at (timestamp)

3. **channels**
   - id (bigint, pk)
   - slug (text)
   - created_by (uuid, fk -> users.id)
   - created_at (timestamp)

4. **messages**
   - id (bigint, pk)
   - message (text)
   - user_id (uuid, fk -> users.id)
   - channel_id (bigint, fk -> channels.id)
   - inserted_at (timestamp)

## Enums
- **app_role**: admin, moderator, student, researcher, professor, user

## Key Functions (RPC)
1. admin_create_complete_user() - Creates user with role auto-detection
2. sync_specific_auth_user() - Syncs auth.users to public.users
3. update_professional_profile() - Updates professional fields
4. search_users_by_expertise() - Searches by skills/expertise

## Triggers
- handle_new_user: After INSERT on auth.users → creates public.users record

## RLS Policies
(Copy from Supabase Dashboard or SQL query results)

## Realtime
- Channels: Enabled/Disabled?
- Messages: Enabled/Disabled?
```

---

## 🎯 What to Include in Copilot Prompt

After gathering all this info, create a file called `CURRENT-STATE-FOR-COPILOT.md` with:

1. ✅ All table schemas (columns, types, constraints)
2. ✅ All enums and their values
3. ✅ All foreign key relationships
4. ✅ Complete RLS policies for each table
5. ✅ All RPC functions (especially `admin_create_complete_user`)
6. ✅ All triggers and trigger functions
7. ✅ Current auth flow (signup → auto-sync profile → role assignment)
8. ✅ Existing API patterns from `starting_point.json`

---

## ⚡ Quick Export Commands

**If you have `psql` access:**

```bash
# Export full schema
pg_dump -h YOUR_HOST -U postgres -d postgres --schema-only --schema=public > schema.sql

# Export functions
pg_dump -h YOUR_HOST -U postgres -d postgres --schema=public -t 'pg_proc' > functions.sql
```

**Otherwise, use Supabase SQL Editor** and run the queries in `current-supabase-state.sql`.

---

## 📁 Final File Structure

```
backup/
├── current-supabase-state.sql          (SQL queries to run)
├── current-state-results.sql           (Results from running queries)
├── current-state-summary.md            (Human-readable summary)
├── CURRENT-STATE-FOR-COPILOT.md        (Complete context for Copilot)
└── EXPORT-GUIDE.md                     (This file)
```

---

## 🤖 Updated Copilot Prompt Template

Once you have all the exports, use this prompt:

```
[Paste CURRENT-STATE-FOR-COPILOT.md content here]

I'm building a Project Partnership Network platform (Proje Ortaklık Ağı) using Vue 3 + Vuestic UI + Supabase.

[... rest of the original prompt ...]

Please create an implementation plan that:
1. EXTENDS the existing schema (don't recreate users/channels/messages)
2. FOLLOWS the same patterns as existing RPC functions (especially admin_create_complete_user)
3. MAINTAINS compatibility with existing RLS policies
4. ADDS to the existing starting_point.json Postman collection pattern
5. USES the same role-based access patterns (admin, researcher, student, user)

Break this down into epics, features, and tasks.
```

---

## ⏱️ Estimated Time: 25-30 minutes total
