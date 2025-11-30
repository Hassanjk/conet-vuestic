# Project Implementation Guide - Connet Academic Partnership Platform

## Overview
The Projects section has been fully updated to match the Supabase backend structure defined in `starting_point.json`. This document explains the implementation architecture.

---

## Architecture Changes

### 1. **Dual Type System**
We maintain two project type definitions for compatibility:

#### **Supabase Project Type** (`src/types/projects.types.ts`)
The authoritative backend structure:
```typescript
interface Project {
  id: string
  title: string                    // Project name
  description: string              // Full description
  field_type: ProjectFieldType     // Academic discipline
  required_skills: string[]        // Skills array
  contact_info: string             // Contact email/info
  start_date: string | null
  end_date: string | null
  created_by: string               // User ID of creator
  status: ProjectStatus            // active | closed | completed
  is_active: boolean               // Soft delete flag
  view_count: number
  created_at: string
  updated_at: string
}
```

#### **ProjectViewModel** (`src/pages/projects/types.ts`)
UI-compatible wrapper for legacy components:
```typescript
type ProjectViewModel = Project & {
  project_name: string      // Maps to title
  project_owner: string     // Maps to created_by
  team: string[]            // From project_participants table
  displayStatus: string     // Maps Supabase status to UI status
}
```

---

## Database Schema (from starting_point.json)

### **Projects Table**
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  field_type project_field_type NOT NULL,  -- Enum
  required_skills TEXT[] DEFAULT '{}',
  contact_info TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  created_by UUID REFERENCES users(id),
  status project_status DEFAULT 'active',   -- Enum
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### **Enums**
```sql
-- Field Types (Academic Disciplines)
CREATE TYPE project_field_type AS ENUM (
  'Mühendislik',   -- Engineering
  'Sağlık',        -- Health
  'Eğitim',        -- Education
  'Teknoloji',     -- Technology
  'Sanat',         -- Arts
  'Bilim',         -- Science
  'Other'
);

-- Project Status
CREATE TYPE project_status AS ENUM (
  'active',        -- Accepting applications
  'closed',        -- No new applications
  'completed'      -- Project finished
);
```

### **Related Tables**
- `project_participants` - Team members
- `project_applications` - Application tracking
- `favorites` - User favorites
- `project_ratings` - Reviews and ratings

---

## API Integration

### **Supabase RPC Functions**

#### `create_project_with_validation()`
Creates project with validation and auto-assigns owner as participant.
```typescript
await apiClient.rpc('create_project_with_validation', {
  p_title: string,
  p_description: string,
  p_field_type: ProjectFieldType,
  p_required_skills: string[],
  p_contact_info: string,
  p_start_date?: string,
  p_end_date?: string
})
```

#### `get_project_with_details()`
Returns project with owner info, stats, and participant count.
```typescript
await apiClient.rpc('get_project_with_details', {
  p_project_id: string
})
```

#### `search_projects()`
Advanced search with filters.
```typescript
await apiClient.rpc('search_projects', {
  p_filters: {
    field_type?: ProjectFieldType,
    skills?: string[],
    status?: ProjectStatus
  }
})
```

### **REST API Endpoints**

#### Get Active Projects
```http
GET /rest/v1/projects?is_active=eq.true&select=*&order=created_at.desc
```

#### Update Project
```http
PATCH /rest/v1/projects?id=eq.{id}
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated Description",
  "status": "closed"
}
```

#### Soft Delete
```http
PATCH /rest/v1/projects?id=eq.{id}
Content-Type: application/json

{ "is_active": false }
```

---

## Component Structure

### **Data Flow**
```
ProjectsPage.vue
  ↓
useProjects() composable
  ↓
Pinia Store (projects.ts)
  ↓
Data Layer (data/pages/projects.ts)
  ↓
API Client (services/api/client.ts)
  ↓
Supabase REST API / RPC Functions
```

### **View Components**
- `ProjectsTable.vue` - Table view with sorting
- `ProjectCards.vue` - Card grid view
- `EditProjectForm.vue` - Create/Edit form with Supabase fields

### **Data Transformation**
All Supabase data is transformed to `ProjectViewModel` using:
```typescript
function toProjectViewModel(project: Project, participants: string[]): ProjectViewModel {
  return {
    ...project,
    project_name: project.title,
    project_owner: project.created_by,
    team: participants,
    displayStatus: mapStatusToDisplay(project.status)
  }
}
```

---

## Key Features Implemented

### ✅ **CRUD Operations**
- **Create**: Uses `create_project_with_validation()` RPC
- **Read**: Fetches with participants from `project_participants`
- **Update**: PATCH with field validation
- **Delete**: Soft delete (`is_active = false`)

### ✅ **Field Mapping**
| Legacy UI Field | Supabase Field | Notes |
|----------------|----------------|-------|
| `project_name` | `title` | Display name |
| `project_owner` | `created_by` | User UUID |
| `team` | (from `project_participants`) | Fetched separately |
| `status` | `displayStatus` | Mapped from `status` enum |

### ✅ **Status Mapping**
```typescript
'active' → 'in progress'
'completed' → 'completed'
'closed' → 'archived'
```

### ✅ **Academic Field Types**
Form includes dropdown with all 7 field types from enum.

### ✅ **Error Handling**
- RLS policy enforcement (users can only edit own projects)
- Foreign key validation (created_by must exist in users table)
- Duplicate prevention via RPC functions
- Graceful fallback for participant fetch failures

---

## Row Level Security (RLS)

Projects table has these policies:

```sql
-- View all active projects
CREATE POLICY "Users can view active projects"
ON projects FOR SELECT
USING (is_active = true);

-- Create own projects
CREATE POLICY "Users can create projects"
ON projects FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Update own projects only
CREATE POLICY "Users can update own projects"
ON projects FOR UPDATE
USING (auth.uid() = created_by);

-- Admins bypass all restrictions
CREATE POLICY "Admins manage all projects"
ON projects FOR ALL
USING (authorize('projects.manage'));
```

---

## Testing with Postman

The `starting_point.json` includes complete test scenarios:

### **Test Sequence**
1. **Verify User Profile Exists** - Pre-check before creating projects
2. **Auto-Sync Profile** - If profile missing (prevents FK errors)
3. **Create Project - Student** - Test with @ogrenci.karabuk.edu.tr email
4. **Create Project - Researcher** - Test with @karabuk.edu.tr email
5. **Get All Active Projects** - List view
6. **Search Projects** - By field type, skills
7. **Update My Project** - Edit description, skills
8. **Close Project** - Change status to 'closed'
9. **Soft Delete** - Mark as inactive

### **Critical Pre-Checks**
Always run these before testing:
```json
GET /rest/v1/users?id=eq.{{user_id}}&select=*
```
If empty, run:
```json
POST /rest/v1/rpc/sync_specific_auth_user
{ "target_user_id": "{{user_id}}" }
```

---

## Common Issues & Solutions

### **Issue**: Foreign key error on project creation
**Cause**: `created_by` user doesn't exist in `public.users`  
**Solution**: Run `sync_specific_auth_user()` RPC function

### **Issue**: Projects not showing team members
**Cause**: `project_participants` table not populated  
**Solution**: Participants are auto-created when application is accepted

### **Issue**: Can't update project fields
**Cause**: RLS policy blocks non-owners  
**Solution**: Ensure `created_by` matches current user ID

### **Issue**: Wrong field type in form
**Cause**: Using legacy field names  
**Solution**: Use Supabase fields (`title`, `description`, `field_type`)

---

## Future Enhancements

### **Planned Features** (from COPILOT-PROMPT-FINAL.md)
1. **Applications Management** (`project_applications` table)
   - Apply to projects
   - Accept/reject applications
   - Track application status

2. **Favorites** (`favorites` table)
   - Toggle favorite projects
   - View favorited projects
   - Show favorite count

3. **Ratings & Reviews** (`project_ratings` table)
   - Rate completed projects
   - Submit reviews
   - Calculate average ratings

4. **Notifications** (`notifications` table)
   - New application alerts
   - Status change notifications
   - Deadline reminders

5. **Project Messaging**
   - Reuse existing `channels` and `messages` tables
   - Create channel per project
   - Real-time communication

---

## File Reference

### **Modified Files**
- `src/pages/projects/types.ts` - Type definitions with ProjectViewModel
- `src/types/projects.types.ts` - Supabase Project type (unchanged)
- `src/data/pages/projects.ts` - Data layer with transformation logic
- `src/stores/projects.ts` - Pinia store using ProjectViewModel
- `src/pages/projects/ProjectsPage.vue` - Main page component
- `src/pages/projects/widgets/ProjectsTable.vue` - Table view
- `src/pages/projects/widgets/ProjectCards.vue` - Card view
- `src/pages/projects/widgets/EditProjectForm.vue` - Form with Supabase fields
- `src/services/api/projects.service.ts` - Service layer (already correct)

### **Database Files**
- `backup/supabase-new-features.sql` - Database schema
- `starting_point.json` - Postman collection with tests

---

## Summary

The project section now:
✅ Matches Supabase backend structure from `starting_point.json`  
✅ Uses correct field names (`title`, `created_by`, `field_type`)  
✅ Transforms data between Supabase and legacy UI formats  
✅ Fetches team members from `project_participants` table  
✅ Supports all 7 academic field types  
✅ Implements soft delete pattern  
✅ Enforces RLS policies  
✅ Provides comprehensive error handling  
✅ Ready for future feature implementation (applications, favorites, ratings)

All components are fully compatible with the existing Supabase backend and ready for production use.
