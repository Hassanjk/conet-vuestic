# Quick Reference: Projects Implementation

## Supabase Backend Structure (from starting_point.json)

### Key Endpoints

#### Create Project
```typescript
POST /rest/v1/rpc/create_project_with_validation
{
  "p_title": "Project Title",
  "p_description": "Description",
  "p_field_type": "Mühendislik",  // Engineering
  "p_required_skills": ["Python", "ML"],
  "p_contact_info": "email@example.com",
  "p_start_date": "2025-01-15",
  "p_end_date": "2025-12-31"
}
```

#### Get Projects
```typescript
GET /rest/v1/projects?is_active=eq.true&select=*&order=created_at.desc
```

#### Update Project
```typescript
PATCH /rest/v1/projects?id=eq.{id}
{
  "title": "Updated Title",
  "description": "Updated Description",
  "status": "closed"
}
```

#### Delete Project (Soft)
```typescript
PATCH /rest/v1/projects?id=eq.{id}
{ "is_active": false }
```

---

## Field Types (Academic Disciplines)
- `Mühendislik` - Engineering
- `Sağlık` - Health
- `Eğitim` - Education
- `Teknoloji` - Technology
- `Sanat` - Arts
- `Bilim` - Science
- `Other` - Other

---

## Project Status Values
- `active` - Accepting applications (UI: "in progress")
- `closed` - No new applications (UI: "archived")
- `completed` - Project finished (UI: "completed")

---

## Data Transformation

### Supabase → UI (ProjectViewModel)
```typescript
{
  ...project,                          // All Supabase fields
  project_name: project.title,         // Legacy UI field
  project_owner: project.created_by,   // Legacy UI field
  team: participantIds,                // From project_participants
  displayStatus: mapStatus(project.status)  // UI-friendly status
}
```

### UI → Supabase (Create/Update)
```typescript
{
  title: form.title || form.project_name,
  description: form.description,
  field_type: form.field_type,
  required_skills: form.required_skills || [],
  contact_info: form.contact_info,
  start_date: form.start_date || null,
  end_date: form.end_date || null,
  status: form.status || 'active'
}
```

---

## Common Workflows

### Creating a Project
1. User fills out `EditProjectForm.vue`
2. Form emits save event with `Partial<ProjectViewModel>`
3. `ProjectsPage.vue` calls `add()` from composable
4. Store calls `addProject()` from data layer
5. Data layer calls `create_project_with_validation()` RPC
6. Backend creates project + participant record
7. Response transformed to ProjectViewModel
8. UI updates with new project

### Viewing Projects
1. `useProjects()` composable calls `getAll()`
2. Store fetches from `/rest/v1/projects`
3. For each project, fetch participants from `project_participants`
4. Transform each to ProjectViewModel with team array
5. Display in table/cards

### Updating a Project
1. User clicks edit, form populated with existing data
2. User modifies fields, clicks save
3. Form emits with updated `ProjectViewModel`
4. Store calls `updateProject()` with PATCH
5. Backend validates user is owner (RLS)
6. Updates fields, returns updated project
7. UI reflects changes

---

## Testing Checklist

### ✅ Before Testing
- [ ] Run database setup SQL
- [ ] Verify user profile exists: `GET /rest/v1/users?id=eq.{user_id}`
- [ ] If missing, sync profile: `POST /rest/v1/rpc/sync_specific_auth_user`

### ✅ Test Cases (Postman)
1. Database Setup Verification
2. Create Project - Student (@ogrenci.karabuk.edu.tr)
3. Create Project - Researcher (@karabuk.edu.tr)
4. Get All Active Projects
5. Search Projects by Field Type
6. Search Projects by Skills
7. Update Project Description
8. Close Project (status → closed)
9. Soft Delete Project (is_active → false)
10. Test RLS (try to edit someone else's project - should fail)

---

## Troubleshooting

### Error: "Foreign key violation on created_by"
**Solution**: User profile doesn't exist in public.users
```bash
POST /rest/v1/rpc/sync_specific_auth_user
{ "target_user_id": "{user_id}" }
```

### Error: "Projects not loading"
**Check**: 
- Network tab for API response
- Console for errors
- Verify token is valid
- Check `is_active=true` filter

### Error: "Can't update project"
**Check**:
- Current user is the project owner
- RLS policies allow access
- Request includes valid fields only

### Error: "Team members not showing"
**Check**:
- `project_participants` table has records
- Participant fetch doesn't fail silently
- User IDs in participants match users table

---

## Next Steps (Future Features)

### 1. Applications System
```sql
-- Apply to project
POST /rest/v1/rpc/apply_to_project
{
  "p_project_id": "{id}",
  "p_message": "I'm interested...",
  "p_relevant_skills": ["Python", "ML"]
}

-- Accept application
POST /rest/v1/rpc/update_application_status
{
  "p_application_id": "{id}",
  "p_new_status": "accepted"
}
```

### 2. Favorites
```sql
-- Toggle favorite
POST /rest/v1/rpc/toggle_favorite
{ "p_project_id": "{id}" }

-- Get my favorites
GET /rest/v1/favorites?user_id=eq.{id}&select=*,project:project_id(*)
```

### 3. Ratings
```sql
-- Submit rating
POST /rest/v1/rpc/submit_rating
{
  "p_project_id": "{id}",
  "p_rating": 5,
  "p_review_text": "Great project!"
}
```

### 4. Notifications
```sql
-- Get unread notifications
GET /rest/v1/notifications?user_id=eq.{id}&read=eq.false

-- Mark as read
PATCH /rest/v1/notifications?id=eq.{id}
{ "read": true }
```

---

## File Map

```
src/
├── types/
│   └── projects.types.ts          ← Supabase Project type
├── pages/projects/
│   ├── types.ts                   ← ProjectViewModel + helpers
│   ├── ProjectsPage.vue           ← Main page
│   └── widgets/
│       ├── ProjectsTable.vue      ← Table view
│       ├── ProjectCards.vue       ← Card view
│       └── EditProjectForm.vue    ← Create/edit form
├── data/pages/
│   └── projects.ts                ← Data layer (CRUD + transform)
├── stores/
│   └── projects.ts                ← Pinia store
└── services/api/
    ├── client.ts                  ← API client
    └── projects.service.ts        ← Projects service

backup/
├── supabase-new-features.sql      ← Database schema
└── starting_point.json            ← Postman tests
```

---

## Important Notes

⚠️ **Always use RPC functions for creation** - They include validation and auto-setup  
⚠️ **Never hard-delete projects** - Use soft delete (`is_active = false`)  
⚠️ **Check profile exists before creating** - Prevents FK errors  
⚠️ **Respect RLS policies** - Users can only edit own projects  
⚠️ **Transform data properly** - Map Supabase ↔ UI formats  

✅ **All components updated** - Fully compatible with Supabase backend  
✅ **No TypeScript errors** - Type-safe implementation  
✅ **Ready for production** - Tested with Postman collection  
