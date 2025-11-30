# Partnership (Ortaklık) System Implementation Plan

## Current Situation Analysis

### ✅ What You Already Have:
1. **`project_applications`** table - Handles users applying to projects
2. **`project_participants`** table - Tracks project members
3. **`notifications`** table - Sends alerts to users
4. **`messages`** & **`channels`** tables - For communication
5. **`projects`** table - Core project listings
6. **`users`** table - User profiles with institution info

### 🎯 What "Ortaklık Gönder" (Send Partnership) Needs:

Based on the Turkish UI, "Ortaklık Gönder" = **Send Partnership Request**, which is **ALREADY IMPLEMENTED** as `project_applications`!

---

## Understanding the Flow

### Current Implementation (What Exists):
```
User sees project → Clicks "Ortaklık Gönder" → 
Fills application form → 
Submits to `project_applications` table → 
Project owner gets notification → 
Owner accepts/rejects → 
If accepted: User added to `project_participants`
```

### What the Buttons Should Do:

| Button | Action | Current Status |
|--------|--------|----------------|
| **İlanı İncele** | View project details | ✅ Implemented (view page) |
| **Mesajlaş** | Send direct message | ✅ Tables exist, needs UI |
| **★ Favoride** | Add to favorites | ✅ Table exists, needs UI |
| **Ortaklık Gönder** | Apply to project | ✅ Backend exists, needs UI |

---

## Implementation Plan

### Phase 1: Complete "Ortaklık Gönder" (Partnership Application) ✅ BACKEND READY

**What exists in `starting_point.json`:**
```sql
-- Apply to project
POST /rest/v1/rpc/apply_to_project
{
  "p_project_id": "{id}",
  "p_message": "I'm interested in this project...",
  "p_cv_link": "https://...",
  "p_relevant_skills": ["Python", "ML"]
}

-- Owner accepts application
POST /rest/v1/rpc/update_application_status
{
  "p_application_id": "{id}",
  "p_new_status": "accepted"
}
```

**What needs to be built:**

#### 1.1 Application Form Component
**File:** `src/pages/projects/widgets/ApplicationForm.vue`
```typescript
// User fills out partnership application
- Message field (why interested)
- CV link (optional)
- Skills they bring
- Submit button
```

#### 1.2 Application Modal
**Integration:** Add to `ProjectCards.vue` and `ProjectDetailPage.vue`
```vue
<VaButton @click="openApplicationModal">
  Ortaklık Gönder
</VaButton>
```

#### 1.3 Applications Service
**File:** `src/services/api/applications.service.ts`
```typescript
class ApplicationsService {
  async applyToProject(data: ApplicationRequest)
  async getMyApplications()
  async updateApplicationStatus(id, status)
  async withdrawApplication(id)
}
```

#### 1.4 Applications Store
**File:** `src/stores/applications.ts`
```typescript
state: {
  myApplications: [],
  projectApplications: [], // For project owners
  isLoading: false
}
```

#### 1.5 My Applications Dashboard
**File:** `src/pages/projects/MyApplicationsPage.vue`
```vue
<!-- User sees all their applications with status -->
- Pending applications (can withdraw)
- Accepted applications
- Rejected applications
```

#### 1.6 Project Owner - Review Applications
**File:** `src/pages/projects/widgets/ApplicationsList.vue`
```vue
<!-- Owner sees applications to their projects -->
- Applicant info
- Message and skills
- Accept/Reject buttons
```

---

### Phase 2: Institution Partnerships (NEW FEATURE)

**Problem:** You want users to send partnerships to **institutions**, not just projects.

**Solution:** Create a new `institution_partnerships` table:

```sql
CREATE TABLE public.institution_partnerships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES users(id),
  sender_institution text NOT NULL,  -- From users.institution
  receiver_institution text NOT NULL,
  project_id uuid REFERENCES projects(id), -- Optional: related to project
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS Policies
CREATE POLICY "Users can send institution partnerships"
  ON institution_partnerships FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users from institution can view partnerships"
  ON institution_partnerships FOR SELECT
  USING (
    -- User's institution matches sender OR receiver
    (SELECT institution FROM users WHERE id = auth.uid()) 
    IN (sender_institution, receiver_institution)
  );
```

**RPC Function:**
```sql
CREATE OR REPLACE FUNCTION send_institution_partnership(
  p_receiver_institution text,
  p_message text,
  p_project_id uuid DEFAULT NULL
) RETURNS json AS $$
DECLARE
  v_sender_id uuid;
  v_sender_institution text;
  v_partnership institution_partnerships;
BEGIN
  v_sender_id := auth.uid();
  
  -- Get sender's institution
  SELECT institution INTO v_sender_institution
  FROM users WHERE id = v_sender_id;
  
  IF v_sender_institution IS NULL THEN
    RAISE EXCEPTION 'User must have institution set';
  END IF;
  
  -- Create partnership request
  INSERT INTO institution_partnerships (
    sender_id, sender_institution, receiver_institution, 
    message, project_id
  ) VALUES (
    v_sender_id, v_sender_institution, p_receiver_institution,
    p_message, p_project_id
  ) RETURNING * INTO v_partnership;
  
  -- Notify users from receiver institution
  INSERT INTO notifications (user_id, type, title, message)
  SELECT id, 'institution_partnership_request',
    'New Institution Partnership Request',
    v_sender_institution || ' wants to partner with your institution'
  FROM users 
  WHERE institution = p_receiver_institution;
  
  RETURN row_to_json(v_partnership);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### Phase 3: Direct User-to-User Partnerships (Optional)

**If you want users to partner directly (not through projects):**

```sql
CREATE TABLE public.user_partnerships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES users(id),
  partner_id uuid NOT NULL REFERENCES users(id),
  message text NOT NULL,
  purpose text, -- research, collaboration, etc.
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(requester_id, partner_id)
);
```

---

## Main Page Project Listings

### Phase 4: Public Projects Feed

**File:** `src/pages/projects/PublicProjectsPage.vue`

```vue
<template>
  <div class="projects-feed">
    <h1>Yayınlanan İlanlar (Published Projects)</h1>
    
    <!-- Filters -->
    <VaCard>
      <VaSelect v-model="filters.field_type" label="Tüm Alanlar" />
      <VaDatePicker v-model="filters.date_range" range />
      <VaInput v-model="filters.search" placeholder="Ara..." />
    </VaCard>
    
    <!-- Project Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <VaCard v-for="project in projects" :key="project.id">
        <h3>{{ project.title }}</h3>
        <p>{{ project.description }}</p>
        
        <VaChip>{{ project.field_type }}</VaChip>
        <VaChip v-for="skill in project.required_skills">
          {{ skill }}
        </VaChip>
        
        <div class="flex gap-2 mt-4">
          <VaButton @click="viewProject(project)">
            İlanı İncele
          </VaButton>
          
          <VaButton @click="sendMessage(project)">
            <VaIcon name="message" /> Mesajlaş
          </VaButton>
          
          <VaButton @click="toggleFavorite(project)">
            <VaIcon :name="isFavorite(project) ? 'star' : 'star_outline'" />
            Favoride
          </VaButton>
          
          <VaButton color="primary" @click="applyToProject(project)">
            Ortaklık Gönder
          </VaButton>
        </div>
      </VaCard>
    </div>
  </div>
</template>
```

---

## Database Additions Needed

### 1. Add Notification Types
```sql
-- Update notification_type enum
ALTER TYPE notification_type ADD VALUE 'new_application';
ALTER TYPE notification_type ADD VALUE 'application_accepted';
ALTER TYPE notification_type ADD VALUE 'application_rejected';
ALTER TYPE notification_type ADD VALUE 'institution_partnership_request';
ALTER TYPE notification_type ADD VALUE 'user_partnership_request';
```

### 2. Create Institution Partnerships Table
```sql
-- See Phase 2 above
CREATE TABLE institution_partnerships (...);
```

### 3. Create User Partnerships Table (Optional)
```sql
-- See Phase 3 above
CREATE TABLE user_partnerships (...);
```

---

## Frontend File Structure

```
src/
├── pages/projects/
│   ├── PublicProjectsPage.vue          ← Main listing (NEW)
│   ├── ProjectDetailPage.vue           ← Single project view (NEW)
│   ├── MyApplicationsPage.vue          ← User's applications (NEW)
│   ├── MyProjectsPage.vue              ← User's projects (exists)
│   └── widgets/
│       ├── ApplicationForm.vue         ← Apply modal (NEW)
│       ├── ApplicationsList.vue        ← Owner reviews (NEW)
│       ├── ProjectCard.vue             ← Single card (enhance)
│       └── InstitutionPartnershipForm.vue ← Institution requests (NEW)
│
├── pages/partnerships/                 ← NEW SECTION
│   ├── InstitutionPartnershipsPage.vue
│   ├── UserPartnershipsPage.vue
│   └── widgets/
│       ├── PartnershipRequestCard.vue
│       └── PartnershipList.vue
│
├── services/api/
│   ├── applications.service.ts         ← NEW
│   ├── partnerships.service.ts         ← NEW
│   ├── favorites.service.ts            ← NEW
│   └── messaging.service.ts            ← Enhance existing
│
├── stores/
│   ├── applications.ts                 ← NEW
│   ├── partnerships.ts                 ← NEW
│   └── favorites.ts                    ← NEW
│
└── types/
    ├── applications.types.ts           ← NEW
    └── partnerships.types.ts           ← NEW
```

---

## Implementation Priority

### 🔥 High Priority (Core Functionality)
1. ✅ **Public Projects Listing** - Main page showing all projects
2. ✅ **Project Detail Page** - Full project info
3. ✅ **Application System** - "Ortaklık Gönder" functionality
4. ✅ **Favorites System** - "Favoride" toggle
5. ✅ **Notifications** - Alert system for applications

### 🟡 Medium Priority (User Experience)
6. **My Applications Dashboard** - Track application status
7. **Owner Review Applications** - Accept/reject interface
8. **Direct Messaging** - "Mesajlaş" button functionality
9. **Search & Filters** - Find projects by field/skills

### 🔵 Low Priority (Advanced Features)
10. **Institution Partnerships** - Inter-institution collaboration
11. **User-to-User Partnerships** - Direct user connections
12. **Project Analytics** - View counts, popular projects
13. **Recommendations** - Suggest matching projects

---

## Summary: What You Need to Do

### ✅ Backend is 95% Ready!
Your database tables support:
- ✅ Project applications (`project_applications`)
- ✅ Favorites (`favorites`)
- ✅ Notifications (`notifications`)
- ✅ Messaging (`messages`, `channels`)
- ✅ Participants tracking (`project_participants`)

### 🚀 What Needs Building (Frontend UI):

1. **Main Projects Listing Page**
   - Card grid showing all active projects
   - 4 action buttons per card

2. **Application Modal**
   - Form to apply to project
   - Message, CV, skills input

3. **Applications Management**
   - User view: My applications
   - Owner view: Review applications

4. **Favorites Toggle**
   - Star/unstar projects
   - View favorited projects

5. **Messaging Integration**
   - Open chat with project owner
   - Reuse existing channels system

6. **(Optional) Institution Partnerships**
   - New table and UI
   - Separate from project applications

---

## Next Steps

**Let me know which you want to implement first:**
1. 🎯 **Public projects listing** (main page with cards)
2. 📝 **Application system** (Ortaklık Gönder functionality)
3. ⭐ **Favorites** (star projects)
4. 💬 **Messaging** (direct chat)
5. 🏢 **Institution partnerships** (new feature)

I'll create the complete implementation with all components, services, and database updates!
