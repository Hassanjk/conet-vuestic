# Copilot Instructions for Connet Project

## Project Overview
**Connet** is an academic partnership network platform built with Vue 3 + Vuestic UI + Supabase. It enables researchers, students, and professors to collaborate on projects with role-based access control and real-time messaging.

**Tech Stack**: Vue 3 (Composition API), TypeScript, Vuestic UI, Pinia, Supabase (PostgreSQL + REST + Auth), Vite

---

## Architecture & Key Patterns

### 1. Supabase Backend Integration
- **REST API Client**: All API calls go through `src/services/api/client.ts` (singleton `apiClient`)
- **Environment Variables**: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (set in `.env`, not `.env.example`)
- **Auth Flow**: JWT tokens stored in localStorage, auto-refreshed via axios interceptors
- **User Sync**: Auth users (`auth.users`) are mirrored to `public.users` via database triggers
- **RPC Functions**: Database-level business logic exposed via `apiClient.rpc(functionName, params)`

**Key RPC Functions:**
- `admin_create_complete_user()` - Creates user with role detection from email domain
- `sync_specific_auth_user()` - Manual fallback for profile sync if trigger fails
- `authorize(permission)` - Permission checking for RLS policies

### 2. Authentication & Authorization
- **Role System**: 6 roles (admin, moderator, student, researcher, professor, user) stored in `user_roles` table
- **Email Domain Detection**: 
  - `@ogrenci.karabuk.edu.tr` → student
  - `@karabuk.edu.tr` → researcher
  - Others → user
- **Route Guards**: `authGuard`, `guestGuard`, `roleGuard` in `src/router/guards.ts`
- **Store**: `useUserStore()` (Pinia) centralizes auth state; use `useAuth()` composable in components
- **No Email Verification**: Users are auto-confirmed on signup for development ease

**Critical Pattern:**
```typescript
// Always initialize auth state before checking isLoggedIn
const userStore = useUserStore()
await userStore.initializeAuth() // Loads tokens from localStorage
if (userStore.isLoggedIn) { /* ... */ }
```

### 3. Service Layer Structure
```
src/services/
├── api/
│   ├── client.ts           # Singleton axios wrapper with interceptors
│   ├── auth.service.ts     # Auth operations (signup, login, profile CRUD)
│   └── index.ts            # Barrel exports
├── api.ts                  # Legacy API URL builders (minimal use)
└── vuestic-ui/             # Vuestic global config
```

**Service Pattern**: Services use `apiClient` methods (`.get()`, `.post()`, `.rpc()`) and return typed responses
```typescript
// Example from auth.service.ts
async signup(credentials: SignupRequest): Promise<AuthResponse> {
  const response = await apiClient.getAuthClient().signup(credentials)
  // Auto-sync profile if trigger didn't fire
  await apiClient.getRestClient().rpc.syncSpecificAuthUser({ target_user_id: response.user.id })
  return response
}
```

### 4. State Management (Pinia)
- **Stores**: Located in `src/stores/`, all use Composition API style
- **Primary Store**: `user-store.ts` handles authentication + profile
- **Key Actions**:
  - `signup()`, `login()`, `logout()` - Auth lifecycle
  - `fetchProfile()`, `updateProfile()` - Profile management
  - `initializeAuth()` - Restore session from localStorage
- **Getters**: Provide role checks (`isAdmin`, `hasRole('researcher')`)

**Store Usage Pattern:**
```typescript
// In <script setup>
import { useUserStore } from '@/stores/user-store'
const userStore = useUserStore()
const isAdmin = computed(() => userStore.isAdmin)
```

### 5. Component Architecture
- **Layouts**: `AppLayout.vue` (authenticated), `AuthLayout.vue` (login/signup)
- **Pages**: Feature-based in `src/pages/{feature}/` (e.g., `users/`, `projects/`)
- **Widgets**: Page-specific components in `{feature}/widgets/` (e.g., `UsersTable.vue`)
- **Shared Components**: `src/components/` (navbar, sidebar, icons, charts)

**Vuestic UI Conventions:**
- Use `VaCard`, `VaButton`, `VaInput`, `VaDataTable` for UI primitives
- `defineVaDataTableColumns()` helper for table columns
- `useModal()`, `useToast()` for notifications
- Icons: Material Icons (`icon="group"`) or custom `VaIcon*` components

**Typical Page Structure:**
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useFeatureStore } from './composables/useFeature'
import { useModal, useToast } from 'vuestic-ui'
import FeatureTable from './widgets/FeatureTable.vue'

const { items, isLoading, ...api } = useFeatureStore()
const { init: notify } = useToast()
</script>

<template>
  <VaCard>
    <VaCardContent>
      <FeatureTable :items="items" :loading="isLoading" @action="handleAction" />
    </VaCardContent>
  </VaCard>
</template>
```

### 6. Routing & Navigation
- **Router**: Nested routes in `src/router/index.ts` with lazy-loaded components
- **Navigation Config**: `src/components/sidebar/NavigationRoutes.ts` (sidebar menu structure)
- **Guard Execution Order**: Global `initializeAuthGuard` → route-specific guards
- **Redirect After Login**: Login page stores `?redirect` query param

**Adding New Routes:**
1. Define route in `router/index.ts` with `beforeEnter: authGuard`
2. Add to `NavigationRoutes.ts` with icon and i18n key
3. Create i18n entries in `src/i18n/locales/`

### 7. TypeScript Typing
- **Auth Types**: `src/types/auth.types.ts` (User, UserRole, SignupRequest, etc.)
- **API Responses**: Services return typed responses matching Supabase REST API
- **Composables**: Return typed reactive refs (`Ref<User[]>`, `ComputedRef<boolean>`)
- **Import Style**: Use relative paths (`../types/auth.types`) or configured aliases

**Common Type Imports:**
```typescript
import type { User, UserWithRoles, UserRole } from '@/types/auth.types'
import type { Ref } from 'vue'
```

---

## Database & API Patterns

### Supabase RLS (Row Level Security)
- **Enabled on All Tables**: Policies enforce access control at database level
- **Common Patterns**:
  - Users can view all profiles: `SELECT: true`
  - Users can update own data: `UPDATE: auth.uid() = user_id`
  - Admins bypass restrictions: `authorize('users.manage')`

### Querying with Supabase REST API
**Filter Syntax**: `?field=eq.value`, `?field=in.(val1,val2)`, `?field=ilike.*search*`
**Relations**: `?select=*,user_roles(role)` (embed related data)
**Ordering**: `?order=created_at.desc`
**Pagination**: `?limit=10&offset=0`

**Example from auth.service.ts:**
```typescript
const users = await apiClient.get('/rest/v1/users', {
  params: { 'select': '*,user_roles(role)', 'order': 'created_at.desc' }
})
```

### Error Handling
- **Service Layer**: Catches and transforms to `ApiError` type
- **Store Layer**: Sets `error` state, throws for caller to handle
- **Component Layer**: Display errors via `useToast().init({ message, color: 'danger' })`

**Handling Duplicate Key Errors:**
```typescript
// RPC functions check for existing records before insert
// Frontend validates uniqueness before submission (email, username)
const isAvailable = await authService.checkEmailAvailability(email)
```

---

## Development Workflow

### Setup & Environment
1. Install dependencies: `npm install` (or `yarn install` - project uses Yarn 4.9.2)
2. Create `.env`: Copy `.env.example`, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Run Supabase setup: Execute SQL from `backup/current-supabase-state.sql` in Supabase dashboard
4. Dev server: `npm run dev` (Vite dev server on http://localhost:5173)

### Testing
- **Postman Collection**: `starting_point.json` contains complete API test suite
- **Test Flow**: Database verification → Auth tests → User management → Profile updates
- **E2E Tests**: Playwright setup in `e2e/` directory (run with `npm run e2e`)

### Code Quality
- **Linting**: `npm run lint` (ESLint + Prettier, auto-fixes on commit via Husky)
- **Type Checking**: `npm run build` includes `vue-tsc --noEmit`
- **Pre-commit**: Husky runs lint-staged on modified files

### Database Changes
1. **Test Locally**: Run SQL in Supabase SQL Editor
2. **Update Docs**: Modify `backup/COMPLETE-DATABASE-STATE.md` with schema changes
3. **Update Types**: Reflect DB schema in `src/types/*.types.ts`
4. **Update Services**: Add/modify API calls in `src/services/api/`
5. **Update Postman**: Add test cases to `starting_point.json`

---

## Critical Implementation Notes

### User Creation Flow
1. **Signup**: `POST /auth/v1/signup` creates `auth.users` record
2. **Trigger**: `handle_new_user` trigger fires, creates `public.users` + assigns role
3. **Fallback**: If trigger fails, frontend calls `sync_specific_auth_user()` RPC
4. **Role Assignment**: Based on email domain, inserted into `user_roles` table

**Why Fallback Exists:** Database triggers can fail on high load; RPC provides manual sync

### Token Management
- **Storage**: Access/refresh tokens in localStorage
- **Expiry**: `expires_at` timestamp calculated as `Date.now() + expires_in * 1000`
- **Refresh**: Axios interceptor auto-refreshes on 401, retries original request
- **Cleanup**: `logout()` clears localStorage and redirects to `/auth/login`

### Professional Profile Fields
Users table includes academic fields (ORCID, institution, expertise_areas[], skills[])
- **Update Pattern**: PATCH to `/rest/v1/users?id=eq.{userId}` OR call `update_professional_profile()` RPC
- **Arrays**: PostgreSQL arrays map to TypeScript `string[]`

### Messaging System
- **Channels**: Communication spaces (identified by `slug`)
- **Messages**: Belong to channel, linked to user
- **Realtime**: Supabase Realtime can be enabled on these tables (check docs)

---

## Common Pitfalls & Solutions

1. **"Missing Supabase configuration"**: Ensure `.env` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. **"User not found after signup"**: Profile sync failed - call `syncProfile(userId)` manually
3. **"Duplicate key violation"**: Check `admin_create_complete_user()` prevents duplicates; validate in UI first
4. **"401 Unauthorized"**: Token expired - should auto-refresh, check interceptor in `client.ts`
5. **Route guard infinite loop**: Ensure `initializeAuth()` runs once per session, not on every navigation
6. **RLS policy denies access**: Verify user roles in `user_roles` table, check `authorize()` function

---

## Feature Implementation Checklist

When adding new features (e.g., project listings, applications):

- [ ] **Database**: Create tables in Supabase, define RLS policies, add RPC functions
- [ ] **Types**: Define interfaces in `src/types/{feature}.types.ts`
- [ ] **Service**: Create `src/services/api/{feature}.service.ts` with CRUD operations
- [ ] **Store**: Create `src/stores/{feature}.ts` (Pinia) for state management
- [ ] **Routes**: Add to `src/router/index.ts` with appropriate guards
- [ ] **Navigation**: Update `NavigationRoutes.ts` to show in sidebar
- [ ] **Pages**: Create `src/pages/{feature}/` with main page + widgets
- [ ] **i18n**: Add translation keys to `src/i18n/locales/`
- [ ] **Tests**: Extend `starting_point.json` with Postman test scenarios
- [ ] **Documentation**: Update `backup/` files with schema changes

---

## 🚀 Development Workflow for New Features

**IMPORTANT**: When implementing new features from `backup/COPILOT-PROMPT-FINAL.md`, follow this order:

### Phase 1: Database First (Test Before Frontend)
1. **Read Feature Requirements**: Study `backup/COPILOT-PROMPT-FINAL.md` thoroughly
2. **Generate SQL Files**: Create `backup/supabase-new-features.sql` with:
   - CREATE TYPE statements (enums)
   - CREATE TABLE statements with all constraints
   - CREATE INDEX statements
   - RLS policies for each table
   - RPC functions with validation logic
   - Triggers (if needed)
3. **Run in Supabase**: Execute SQL in Supabase SQL Editor to create tables
4. **Verify Schema**: Check tables exist, policies work, RPC functions callable

### Phase 2: API Testing (Postman First)
5. **Extend `starting_point.json`**: Add new test collection following existing pattern:
   ```json
   {
     "name": "📝 Projects Management",
     "item": [/* test cases */]
   }
   ```
6. **Test All RPC Functions**: Create, read, update, delete operations
7. **Test RLS Policies**: Verify users can't access others' data
8. **Test Edge Cases**: Duplicates, invalid data, permissions
9. **Document Variables**: Add new Postman variables (project_id, application_id, etc.)

### Phase 3: Frontend Implementation (After DB + API Work)
10. **Create TypeScript Types**: `src/types/projects.types.ts`
11. **Build Service Layer**: `src/services/api/projects.service.ts`
12. **Create Pinia Store**: `src/stores/projects.ts`
13. **Add Routes**: Update `router/index.ts` and `NavigationRoutes.ts`
14. **Build Components**: Pages → Widgets → Integration
15. **Add i18n**: Translation keys in `src/i18n/locales/`

**Why This Order?**
- ✅ Database issues discovered early (not during frontend work)
- ✅ API tested independently via Postman
- ✅ Frontend builds on verified backend
- ✅ Can iterate on SQL without breaking Vue code
- ✅ Postman collection documents API for team

---

## Planned Features: Project Partnership Network

**🎯 CRITICAL**: Read `backup/COPILOT-PROMPT-FINAL.md` for complete feature specifications. This section summarizes the 7 major features to implement:

### 1. Project Listings (İlan Yönetimi)
**Database**: `projects` table with fields: `id`, `title`, `description`, `field_type` (enum), `required_skills[]`, `contact_info`, `start_date`, `end_date`, `created_by`, `status` (active/closed/completed), `is_active`, `view_count`

**Key Patterns**:
- Soft deletes: Mark `is_active=false` instead of DELETE
- RLS: Users can INSERT, but only UPDATE/DELETE own projects (check `created_by = auth.uid()`)
- Admins bypass with `authorize('projects.manage')`

**RPC Functions**:
- `create_project_with_validation()` - Validates required fields, prevents bad data
- `get_project_with_details()` - Returns project + owner info + stats (applications count, avg rating)
- `search_projects(filters jsonb)` - Advanced search with field_type, skills, date range

### 2. Partnership Applications (Ortaklık Başvuruları)
**Database**: `project_applications` table with `id`, `project_id`, `user_id`, `message`, `status` (enum: pending/accepted/rejected/withdrawn), `cv_link`, `relevant_skills[]`

**Key Patterns**:
- Prevent duplicates: User can't apply twice to same project (UNIQUE constraint on `project_id`, `user_id`)
- RLS: Applicants see own applications, project owners see applications TO their projects
- Status transitions: pending → accepted/rejected (owner only), pending → withdrawn (applicant only)

**RPC Functions**:
- `apply_to_project(project_id, application_data)` - Checks for duplicates, validates project is active
- `update_application_status(application_id, new_status)` - Verifies caller is project owner
- `get_my_applications_dashboard()` - Returns user's applications with project details

### 3. Favorites (Favori Projeler)
**Database**: `favorites` table (simple: `project_id`, `user_id`, `created_at`)

**Key Patterns**:
- Toggle behavior: If favorite exists, DELETE; if not, INSERT
- Show favorite count on project cards
- RLS: Users can only manage own favorites

**RPC Function**:
- `toggle_favorite(project_id)` - Idempotent toggle, returns new state

### 4. Ratings & Reviews (Değerlendirme)
**Database**: `project_ratings` table with `project_id`, `user_id`, `rating` (1-5), `review_text`, UNIQUE(`project_id`, `user_id`)

**Key Patterns**:
- Only project participants can rate (check `project_participants` table)
- One rating per user per project
- Calculate average rating in `get_project_with_details()`

**RPC Function**:
- `submit_rating(project_id, rating, review_text)` - Verifies participation before allowing

### 5. Notifications (Bildirimler)
**Database**: `notifications` table with `user_id`, `type` (enum), `title`, `message`, `project_id`, `application_id`, `read` (boolean)

**Types**: new_application, application_accepted, application_rejected, new_message, favorite_project_update, deadline_approaching, matching_project

**Key Patterns**:
- Create notification on status change (use triggers or application code)
- Realtime subscriptions for instant delivery
- Mark as read action updates `read=true`

### 6. Project Participants (Tracking Members)
**Database**: `project_participants` table with `project_id`, `user_id`, `role` (owner/member), `joined_at`

**Key Patterns**:
- Auto-create owner record when project is created
- Add member record when application is accepted
- Used for rating eligibility check

### 7. Project-Specific Messaging
**Reuse existing `channels` and `messages` tables**:
- Create channel per project: slug = `project_{project_id}`
- Add channel members when user joins project
- Display unread count in UI

---

## Implementation Requirements for New Features

### Database Conventions (CRITICAL)
- **Enums**: Create `project_field_type`, `application_status`, `notification_type` enums
- **Indexes**: Add indexes on FKs, status fields, and search columns (skills, field_type)
- **Timestamps**: Every table needs `created_at`, `updated_at` (use `update_updated_at_column` trigger)
- **Arrays**: Use PostgreSQL arrays for `required_skills[]`, `relevant_skills[]`, `expertise_areas[]`

### RLS Policy Template for New Tables
```sql
-- View all active records
CREATE POLICY "Users can view active {table}"
ON {table} FOR SELECT
USING (is_active = true);

-- Create own records
CREATE POLICY "Users can create {table}"
ON {table} FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Update own records only
CREATE POLICY "Users can update own {table}"
ON {table} FOR UPDATE
USING (auth.uid() = user_id);

-- Admins bypass all
CREATE POLICY "Admins manage all {table}"
ON {table} FOR ALL
USING (authorize('projects.manage'));
```

### Service Layer Pattern for New Features
Follow `auth.service.ts` pattern:
```typescript
// services/api/projects.service.ts
class ProjectsService {
  async createProject(data: CreateProjectRequest): Promise<Project> {
    return apiClient.getRestClient().rpc.createProjectWithValidation(data)
  }
  
  async searchProjects(filters: ProjectFilters): Promise<Project[]> {
    return apiClient.get('/rest/v1/projects', { 
      params: this.buildQueryParams(filters) 
    })
  }
}
```

### Pinia Store Pattern for New Features
```typescript
// stores/projects.ts
export const useProjectsStore = defineStore('projects', {
  state: () => ({
    projects: [] as Project[],
    currentProject: null as Project | null,
    isLoading: false,
    error: null as string | null,
  }),
  
  actions: {
    async fetchProjects(filters?: ProjectFilters) {
      this.isLoading = true
      try {
        this.projects = await projectsService.searchProjects(filters)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },
  },
})
```

### Vue Component Pattern for New Features
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import { useToast } from 'vuestic-ui'
import ProjectCard from './widgets/ProjectCard.vue'

const projectsStore = useProjectsStore()
const { init: notify } = useToast()

const onCreateProject = async (data: CreateProjectRequest) => {
  try {
    await projectsStore.createProject(data)
    notify({ message: 'Project created!', color: 'success' })
  } catch (error) {
    notify({ message: error.message, color: 'danger' })
  }
}
</script>

<template>
  <VaCard>
    <VaCardContent>
      <ProjectCard 
        v-for="project in projectsStore.projects" 
        :key="project.id"
        :project="project"
        @favorite="handleFavorite"
      />
    </VaCardContent>
  </VaCard>
</template>
```

### Postman Testing Pattern for New Features
Add to `starting_point.json` following existing structure:
```json
{
  "name": "📝 Projects Management",
  "item": [
    {
      "name": "✅ Create Project - Student",
      "request": {
        "method": "POST",
        "header": [
          {"key": "Authorization", "value": "Bearer {{access_token}}"}
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"title\": \"Test Project\", \"field_type\": \"Mühendislik\"}"
        },
        "url": "{{supabase_url}}/rest/v1/rpc/create_project_with_validation"
      },
      "event": [{
        "listen": "test",
        "script": {
          "exec": [
            "pm.test('Project created', function() {",
            "  pm.response.to.have.status(200);",
            "  pm.expect(pm.response.json().id).to.exist;",
            "});"
          ]
        }
      }]
    }
  ]
}
```

---

---

## 📂 File Organization for New Features

When implementing features from `COPILOT-PROMPT-FINAL.md`, create/update these files:

### Database Files (Create First)
```
backup/
├── supabase-new-features.sql      # All new tables, RLS, RPC functions
├── migration-notes.md              # Migration steps and rollback plan
└── COPILOT-PROMPT-FINAL.md        # Source of truth for requirements
```

### Testing Files (Test Before Frontend)
```
starting_point.json                 # Add new Postman collection section
└── New sections to add:
    ├── 📝 Projects Management
    ├── 🤝 Applications Management
    ├── ⭐ Favorites Management
    ├── ⭐ Ratings Management
    └── 🔔 Notifications Management
```

### Backend Integration (After DB Works)
```
src/
├── types/
│   └── projects.types.ts          # All project-related interfaces
├── services/api/
│   ├── projects.service.ts        # Project CRUD + RPC calls
│   ├── applications.service.ts    # Applications management
│   ├── favorites.service.ts       # Favorites toggle
│   ├── ratings.service.ts         # Rating submission
│   └── notifications.service.ts   # Notification fetching
└── stores/
    ├── projects.ts                # Project state management
    ├── applications.ts            # Application tracking
    ├── favorites.ts               # User favorites
    ├── ratings.ts                 # Rating display/submit
    └── notifications.ts           # Notification center
```

### Frontend Components (After Backend Works)
```
src/pages/projects/
├── ProjectListingsPage.vue        # Browse all projects
├── ProjectDetailPage.vue          # Single project view
├── CreateProjectPage.vue          # New project form
├── MyProjectsPage.vue             # User's projects dashboard
├── MyApplicationsPage.vue         # Application tracking
├── FavoritesPage.vue              # Favorited projects
└── widgets/
    ├── ProjectCard.vue            # Project preview card
    ├── ProjectForm.vue            # Create/edit form
    ├── ApplicationForm.vue        # Apply to project
    ├── ApplicationsList.vue       # Owner sees applications
    ├── RatingDisplay.vue          # Show ratings/reviews
    └── RatingForm.vue             # Submit rating
```

---

## 🎯 Implementation Checklist for Each Feature

Use this checklist when implementing each feature from COPILOT-PROMPT-FINAL.md:

### ✅ Database Layer
- [ ] Read feature requirements from `backup/COPILOT-PROMPT-FINAL.md`
- [ ] Create enums in `supabase-new-features.sql`
- [ ] Create table with proper constraints
- [ ] Add indexes for foreign keys and search fields
- [ ] Write RLS policies (SELECT, INSERT, UPDATE, DELETE)
- [ ] Create RPC functions with validation
- [ ] Add triggers if needed (e.g., auto-create notifications)
- [ ] Run SQL in Supabase dashboard
- [ ] Verify tables exist: `SELECT * FROM information_schema.tables WHERE table_schema='public'`
- [ ] Verify policies work: Try accessing data as different users

### ✅ API Testing Layer
- [ ] Add new section to `starting_point.json`
- [ ] Test RPC function calls (create, update, delete)
- [ ] Test direct table access (GET, POST, PATCH)
- [ ] Test RLS policies (user can't access others' data)
- [ ] Test duplicate prevention (unique constraints)
- [ ] Test error cases (invalid data, missing fields)
- [ ] Add pm.test() assertions for all scenarios
- [ ] Document expected responses in descriptions

### ✅ TypeScript Layer
- [ ] Create interface for table schema in `types/`
- [ ] Create request/response types for API
- [ ] Create form validation types
- [ ] Export all types for reuse

### ✅ Service Layer
- [ ] Create service class following `auth.service.ts` pattern
- [ ] Implement CRUD methods using `apiClient`
- [ ] Add error handling and type safety
- [ ] Document each method with JSDoc comments

### ✅ Store Layer
- [ ] Create Pinia store with state/actions/getters
- [ ] Implement data fetching actions
- [ ] Add loading/error state management
- [ ] Add optimistic updates where appropriate

### ✅ Frontend Layer
- [ ] Add routes to `router/index.ts` with guards
- [ ] Add menu items to `NavigationRoutes.ts`
- [ ] Create page components
- [ ] Create widget components
- [ ] Add i18n translation keys
- [ ] Implement loading states
- [ ] Implement error handling with toasts
- [ ] Test user flows end-to-end

---

## Reference Documents

- **Feature Requirements**: `backup/COPILOT-PROMPT-FINAL.md` - **READ THIS FIRST** for all new features
- **Current Database**: `backup/COMPLETE-DATABASE-STATE.md` - existing Supabase setup
- **API Testing**: `starting_point.json` - Postman collection (extend this for new features)
- **Current SQL**: `backup/current-supabase-state.sql` - existing database setup

**Implementation Order**: Always start with COPILOT-PROMPT-FINAL.md → Generate SQL → Test in Postman → Build frontend
