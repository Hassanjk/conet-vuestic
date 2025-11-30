-- ============================================================================
-- SUPABASE NEW FEATURES - Project Partnership Network
-- ============================================================================
-- Description: Extends existing Connet database with project management features
-- Date: November 20, 2025
-- Migration: Safe to run on existing database (no conflicts with current tables)
-- 
-- EXISTING TABLES (DO NOT RECREATE):
--   - users, user_roles, channels, messages, role_permissions
--
-- NEW TABLES (6):
--   - projects, project_applications, favorites, project_ratings, 
--     notifications, project_participants
--
-- FEATURES:
--   1. Project Listings (İlan Yönetimi)
--   2. Partnership Applications (Ortaklık Başvuruları)
--   3. Favorites (Favori Projeler)
--   4. Ratings & Reviews (Değerlendirme)
--   5. Notifications (Bildirimler)
--   6. Project Participants (Proje Üyeleri)
--   7. Project-Specific Messaging (reuses existing channels/messages)
-- ============================================================================

-- ============================================================================
-- SECTION 1: ENUMS
-- ============================================================================

-- Project field types (academic disciplines)
DO $$ BEGIN
    CREATE TYPE project_field_type AS ENUM (
        'Mühendislik',      -- Engineering
        'Sağlık',           -- Health
        'Eğitim',           -- Education
        'Teknoloji',        -- Technology
        'Sanat',            -- Arts
        'Bilim',            -- Science
        'Other'             -- Other
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Application status workflow
DO $$ BEGIN
    CREATE TYPE application_status AS ENUM (
        'pending',          -- Initial state
        'accepted',         -- Owner accepted
        'rejected',         -- Owner rejected
        'withdrawn'         -- Applicant withdrew
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Notification types
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'new_application',              -- Someone applied to your project
        'application_accepted',         -- Your application was accepted
        'application_rejected',         -- Your application was rejected
        'new_message',                  -- New message in project channel
        'favorite_project_update',      -- Favorited project status changed
        'deadline_approaching',         -- Project deadline is near
        'matching_project'              -- New project matches your skills
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- SECTION 2: TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: projects
-- Description: Project listings/announcements
-- Soft Delete: is_active field (don't use DELETE, set to false)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text NOT NULL,
    field_type project_field_type NOT NULL,
    required_skills text[] DEFAULT '{}' NOT NULL,
    contact_info text NOT NULL,
    start_date date,
    end_date date,
    created_by uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status text DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'closed', 'completed')),
    is_active boolean DEFAULT true NOT NULL,
    view_count integer DEFAULT 0 NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- ----------------------------------------------------------------------------
-- Table: project_applications
-- Description: User applications to join projects
-- Constraint: User can only apply once per project (UNIQUE)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message text NOT NULL,
    status application_status DEFAULT 'pending' NOT NULL,
    cv_link text,
    relevant_skills text[] DEFAULT '{}' NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT unique_application_per_project UNIQUE(project_id, user_id)
);

-- ----------------------------------------------------------------------------
-- Table: favorites
-- Description: User's favorited projects
-- Constraint: User can only favorite once per project (UNIQUE)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.favorites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT unique_favorite_per_project UNIQUE(project_id, user_id)
);

-- ----------------------------------------------------------------------------
-- Table: project_ratings
-- Description: User ratings/reviews for completed projects
-- Constraint: User can only rate once per project (UNIQUE)
-- Validation: Rating must be 1-5 stars
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_ratings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT unique_rating_per_project UNIQUE(project_id, user_id)
);

-- ----------------------------------------------------------------------------
-- Table: notifications
-- Description: User notifications for project activities
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
    application_id uuid REFERENCES public.project_applications(id) ON DELETE SET NULL,
    read boolean DEFAULT false NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- ----------------------------------------------------------------------------
-- Table: project_participants
-- Description: Track project members (owner + accepted applicants)
-- Constraint: User can only be in project once (UNIQUE)
-- Roles: 'owner' (creator), 'member' (accepted applicant)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('owner', 'member')),
    joined_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT unique_participant_per_project UNIQUE(project_id, user_id)
);

-- ============================================================================
-- SECTION 3: INDEXES
-- ============================================================================

-- Projects table indexes
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON public.projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_field_type ON public.projects(field_type);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_is_active ON public.projects(is_active);
CREATE INDEX IF NOT EXISTS idx_projects_start_date ON public.projects(start_date);
CREATE INDEX IF NOT EXISTS idx_projects_end_date ON public.projects(end_date);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_required_skills ON public.projects USING GIN(required_skills);

-- Project applications indexes
CREATE INDEX IF NOT EXISTS idx_applications_project_id ON public.project_applications(project_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.project_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.project_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON public.project_applications(created_at DESC);

-- Favorites indexes
CREATE INDEX IF NOT EXISTS idx_favorites_project_id ON public.favorites(project_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON public.favorites(created_at DESC);

-- Project ratings indexes
CREATE INDEX IF NOT EXISTS idx_ratings_project_id ON public.project_ratings(project_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON public.project_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rating ON public.project_ratings(rating);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON public.project_ratings(created_at DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_project_id ON public.notifications(project_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Project participants indexes
CREATE INDEX IF NOT EXISTS idx_participants_project_id ON public.project_participants(project_id);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON public.project_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_role ON public.project_participants(role);

-- ============================================================================
-- SECTION 4: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_participants ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- RLS Policies: projects table
-- ----------------------------------------------------------------------------

-- SELECT: Users can view all active projects
CREATE POLICY "Users can view active projects"
ON public.projects FOR SELECT
USING (is_active = true);

-- INSERT: Authenticated users can create projects
CREATE POLICY "Users can create projects"
ON public.projects FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- UPDATE: Users can update their own projects
CREATE POLICY "Users can update own projects"
ON public.projects FOR UPDATE
USING (auth.uid() = created_by);

-- DELETE: Users can delete their own projects (soft delete preferred)
CREATE POLICY "Users can delete own projects"
ON public.projects FOR DELETE
USING (auth.uid() = created_by);

-- Admin override: Admins can manage all projects
CREATE POLICY "Admins can manage all projects"
ON public.projects FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- ----------------------------------------------------------------------------
-- RLS Policies: project_applications table
-- ----------------------------------------------------------------------------

-- SELECT: Users can view their own applications
CREATE POLICY "Users can view own applications"
ON public.project_applications FOR SELECT
USING (auth.uid() = user_id);

-- SELECT: Project owners can view applications to their projects
CREATE POLICY "Project owners can view applications"
ON public.project_applications FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = project_applications.project_id
        AND projects.created_by = auth.uid()
    )
);

-- INSERT: Authenticated users can apply to projects
CREATE POLICY "Users can apply to projects"
ON public.project_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can withdraw their own pending applications
CREATE POLICY "Users can withdraw own applications"
ON public.project_applications FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (status = 'withdrawn');

-- UPDATE: Project owners can update application status
CREATE POLICY "Owners can update application status"
ON public.project_applications FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = project_applications.project_id
        AND projects.created_by = auth.uid()
    )
);

-- Admin override
CREATE POLICY "Admins can manage all applications"
ON public.project_applications FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- ----------------------------------------------------------------------------
-- RLS Policies: favorites table
-- ----------------------------------------------------------------------------

-- SELECT: Users can view their own favorites
CREATE POLICY "Users can view own favorites"
ON public.favorites FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Users can add favorites
CREATE POLICY "Users can add favorites"
ON public.favorites FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can remove their own favorites
CREATE POLICY "Users can remove own favorites"
ON public.favorites FOR DELETE
USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- RLS Policies: project_ratings table
-- ----------------------------------------------------------------------------

-- SELECT: All users can view ratings
CREATE POLICY "Users can view all ratings"
ON public.project_ratings FOR SELECT
USING (true);

-- INSERT: Only project participants can rate
CREATE POLICY "Participants can rate projects"
ON public.project_ratings FOR INSERT
WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
        SELECT 1 FROM public.project_participants
        WHERE project_participants.project_id = project_ratings.project_id
        AND project_participants.user_id = auth.uid()
    )
);

-- UPDATE: Users can update their own ratings
CREATE POLICY "Users can update own ratings"
ON public.project_ratings FOR UPDATE
USING (auth.uid() = user_id);

-- DELETE: Users can delete their own ratings
CREATE POLICY "Users can delete own ratings"
ON public.project_ratings FOR DELETE
USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- RLS Policies: notifications table
-- ----------------------------------------------------------------------------

-- SELECT: Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: System can create notifications (handled by triggers/functions)
CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- UPDATE: Users can mark their own notifications as read
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- DELETE: Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- RLS Policies: project_participants table
-- ----------------------------------------------------------------------------

-- SELECT: All users can view participants
CREATE POLICY "Users can view project participants"
ON public.project_participants FOR SELECT
USING (true);

-- INSERT: System manages participants (via RPC functions)
CREATE POLICY "System can add participants"
ON public.project_participants FOR INSERT
WITH CHECK (true);

-- DELETE: Project owners can remove members
CREATE POLICY "Owners can remove participants"
ON public.project_participants FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = project_participants.project_id
        AND projects.created_by = auth.uid()
    )
);

-- Admin override
CREATE POLICY "Admins can manage participants"
ON public.project_participants FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- ============================================================================
-- SECTION 5: TRIGGERS
-- ============================================================================

-- Trigger: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_applications_updated_at ON public.project_applications;
CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON public.project_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ratings_updated_at ON public.project_ratings;
CREATE TRIGGER update_ratings_updated_at
    BEFORE UPDATE ON public.project_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-create project owner as participant
CREATE OR REPLACE FUNCTION auto_create_project_owner()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.project_participants (project_id, user_id, role)
    VALUES (NEW.id, NEW.created_by, 'owner');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_auto_create_project_owner ON public.projects;
CREATE TRIGGER trigger_auto_create_project_owner
    AFTER INSERT ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_project_owner();

-- Trigger: Auto-create notification on new application
CREATE OR REPLACE FUNCTION notify_new_application()
RETURNS TRIGGER AS $$
DECLARE
    v_project_title text;
    v_project_owner uuid;
    v_applicant_name text;
BEGIN
    -- Get project details
    SELECT title, created_by INTO v_project_title, v_project_owner
    FROM public.projects WHERE id = NEW.project_id;
    
    -- Get applicant name
    SELECT COALESCE(full_name, email) INTO v_applicant_name
    FROM public.users WHERE id = NEW.user_id;
    
    -- Create notification for project owner
    INSERT INTO public.notifications (user_id, type, title, message, project_id, application_id)
    VALUES (
        v_project_owner,
        'new_application',
        'Yeni Başvuru',
        v_applicant_name || ' projenize başvurdu: ' || v_project_title,
        NEW.project_id,
        NEW.id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_new_application ON public.project_applications;
CREATE TRIGGER trigger_notify_new_application
    AFTER INSERT ON public.project_applications
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_application();

-- Trigger: Auto-create notification on application status change
CREATE OR REPLACE FUNCTION notify_application_status_change()
RETURNS TRIGGER AS $$
DECLARE
    v_project_title text;
BEGIN
    -- Only notify on status change
    IF OLD.status != NEW.status AND NEW.status IN ('accepted', 'rejected') THEN
        -- Get project title
        SELECT title INTO v_project_title
        FROM public.projects WHERE id = NEW.project_id;
        
        -- Create notification for applicant
        INSERT INTO public.notifications (user_id, type, title, message, project_id, application_id)
        VALUES (
            NEW.user_id,
            CASE 
                WHEN NEW.status = 'accepted' THEN 'application_accepted'::notification_type
                WHEN NEW.status = 'rejected' THEN 'application_rejected'::notification_type
            END,
            CASE 
                WHEN NEW.status = 'accepted' THEN 'Başvurunuz Kabul Edildi'
                WHEN NEW.status = 'rejected' THEN 'Başvurunuz Reddedildi'
            END,
            'Projeniz: ' || v_project_title,
            NEW.project_id,
            NEW.id
        );
        
        -- If accepted, add user as participant
        IF NEW.status = 'accepted' THEN
            INSERT INTO public.project_participants (project_id, user_id, role)
            VALUES (NEW.project_id, NEW.user_id, 'member')
            ON CONFLICT (project_id, user_id) DO NOTHING;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_application_status_change ON public.project_applications;
CREATE TRIGGER trigger_notify_application_status_change
    AFTER UPDATE ON public.project_applications
    FOR EACH ROW
    EXECUTE FUNCTION notify_application_status_change();

-- ============================================================================
-- SECTION 6: RPC FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Function: create_project_with_validation
-- Description: Validates and creates a new project
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_project_with_validation(
    p_title text,
    p_description text,
    p_field_type project_field_type,
    p_required_skills text[],
    p_contact_info text,
    p_start_date date DEFAULT NULL,
    p_end_date date DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_project_id uuid;
    v_result jsonb;
    v_user_exists boolean;
BEGIN
    -- Get authenticated user
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;
    
    -- Check if user profile exists in public.users
    SELECT EXISTS (SELECT 1 FROM public.users WHERE id = v_user_id) INTO v_user_exists;
    
    IF NOT v_user_exists THEN
        -- Auto-sync user profile if missing
        PERFORM sync_specific_auth_user(v_user_id);
        
        -- Verify sync worked
        SELECT EXISTS (SELECT 1 FROM public.users WHERE id = v_user_id) INTO v_user_exists;
        
        IF NOT v_user_exists THEN
            RETURN jsonb_build_object('success', false, 'error', 'User profile sync failed. Please contact support.');
        END IF;
    END IF;
    
    -- Validate required fields
    IF p_title IS NULL OR trim(p_title) = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Title is required');
    END IF;
    
    IF p_description IS NULL OR trim(p_description) = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Description is required');
    END IF;
    
    IF p_contact_info IS NULL OR trim(p_contact_info) = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Contact info is required');
    END IF;
    
    -- Validate date logic
    IF p_start_date IS NOT NULL AND p_end_date IS NOT NULL AND p_end_date < p_start_date THEN
        RETURN jsonb_build_object('success', false, 'error', 'End date must be after start date');
    END IF;
    
    -- Create project
    INSERT INTO public.projects (
        title, description, field_type, required_skills, contact_info,
        start_date, end_date, created_by
    )
    VALUES (
        p_title, p_description, p_field_type, COALESCE(p_required_skills, '{}'),
        p_contact_info, p_start_date, p_end_date, v_user_id
    )
    RETURNING id INTO v_project_id;
    
    -- Get created project with owner info
    SELECT jsonb_build_object(
        'success', true,
        'project', row_to_json(p.*),
        'owner', jsonb_build_object(
            'id', u.id,
            'email', u.email,
            'full_name', u.full_name,
            'avatar_url', u.avatar_url
        )
    ) INTO v_result
    FROM public.projects p
    JOIN public.users u ON u.id = p.created_by
    WHERE p.id = v_project_id;
    
    RETURN v_result;
END;
$$;

-- ----------------------------------------------------------------------------
-- Function: apply_to_project
-- Description: Submit application to join a project
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION apply_to_project(
    p_project_id uuid,
    p_message text,
    p_cv_link text DEFAULT NULL,
    p_relevant_skills text[] DEFAULT '{}'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_project_active boolean;
    v_application_id uuid;
    v_result jsonb;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;
    
    -- Check if project exists and is active
    SELECT is_active INTO v_project_active
    FROM public.projects WHERE id = p_project_id;
    
    IF v_project_active IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Project not found');
    END IF;
    
    IF v_project_active = false THEN
        RETURN jsonb_build_object('success', false, 'error', 'Project is not active');
    END IF;
    
    -- Check if user is the project owner
    IF EXISTS (SELECT 1 FROM public.projects WHERE id = p_project_id AND created_by = v_user_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cannot apply to your own project');
    END IF;
    
    -- Check for duplicate application
    IF EXISTS (
        SELECT 1 FROM public.project_applications 
        WHERE project_id = p_project_id AND user_id = v_user_id
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'You already applied to this project');
    END IF;
    
    -- Validate message
    IF p_message IS NULL OR trim(p_message) = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Application message is required');
    END IF;
    
    -- Create application
    INSERT INTO public.project_applications (
        project_id, user_id, message, cv_link, relevant_skills
    )
    VALUES (
        p_project_id, v_user_id, p_message, p_cv_link, COALESCE(p_relevant_skills, '{}')
    )
    RETURNING id INTO v_application_id;
    
    -- Get application with details
    SELECT jsonb_build_object(
        'success', true,
        'application', row_to_json(a.*),
        'applicant', jsonb_build_object(
            'id', u.id,
            'email', u.email,
            'full_name', u.full_name,
            'avatar_url', u.avatar_url
        )
    ) INTO v_result
    FROM public.project_applications a
    JOIN public.users u ON u.id = a.user_id
    WHERE a.id = v_application_id;
    
    RETURN v_result;
END;
$$;

-- ----------------------------------------------------------------------------
-- Function: update_application_status
-- Description: Project owner updates application status (accept/reject)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_application_status(
    p_application_id uuid,
    p_new_status application_status
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_project_owner uuid;
    v_current_status application_status;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;
    
    -- Get application details and verify ownership
    SELECT a.status, p.created_by INTO v_current_status, v_project_owner
    FROM public.project_applications a
    JOIN public.projects p ON p.id = a.project_id
    WHERE a.id = p_application_id;
    
    IF v_project_owner IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Application not found');
    END IF;
    
    IF v_project_owner != v_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Only project owner can update status');
    END IF;
    
    IF v_current_status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Can only update pending applications');
    END IF;
    
    IF p_new_status NOT IN ('accepted', 'rejected') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid status');
    END IF;
    
    -- Update status
    UPDATE public.project_applications
    SET status = p_new_status
    WHERE id = p_application_id;
    
    RETURN jsonb_build_object('success', true, 'status', p_new_status);
END;
$$;

-- ----------------------------------------------------------------------------
-- Function: toggle_favorite
-- Description: Add or remove project from favorites
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION toggle_favorite(p_project_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_is_favorited boolean;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;
    
    -- Check if project exists
    IF NOT EXISTS (SELECT 1 FROM public.projects WHERE id = p_project_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Project not found');
    END IF;
    
    -- Check if already favorited
    SELECT EXISTS (
        SELECT 1 FROM public.favorites 
        WHERE project_id = p_project_id AND user_id = v_user_id
    ) INTO v_is_favorited;
    
    IF v_is_favorited THEN
        -- Remove favorite
        DELETE FROM public.favorites
        WHERE project_id = p_project_id AND user_id = v_user_id;
        
        RETURN jsonb_build_object('success', true, 'favorited', false);
    ELSE
        -- Add favorite
        INSERT INTO public.favorites (project_id, user_id)
        VALUES (p_project_id, v_user_id);
        
        RETURN jsonb_build_object('success', true, 'favorited', true);
    END IF;
END;
$$;

-- ----------------------------------------------------------------------------
-- Function: submit_rating
-- Description: Submit rating/review for a project (participants only)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION submit_rating(
    p_project_id uuid,
    p_rating integer,
    p_review_text text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_is_participant boolean;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;
    
    -- Validate rating
    IF p_rating < 1 OR p_rating > 5 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Rating must be between 1 and 5');
    END IF;
    
    -- Check if user is a participant
    SELECT EXISTS (
        SELECT 1 FROM public.project_participants
        WHERE project_id = p_project_id AND user_id = v_user_id
    ) INTO v_is_participant;
    
    IF NOT v_is_participant THEN
        RETURN jsonb_build_object('success', false, 'error', 'Only project participants can rate');
    END IF;
    
    -- Insert or update rating
    INSERT INTO public.project_ratings (project_id, user_id, rating, review_text)
    VALUES (p_project_id, v_user_id, p_rating, p_review_text)
    ON CONFLICT (project_id, user_id)
    DO UPDATE SET 
        rating = EXCLUDED.rating,
        review_text = EXCLUDED.review_text,
        updated_at = now();
    
    RETURN jsonb_build_object('success', true, 'rating', p_rating);
END;
$$;

-- ----------------------------------------------------------------------------
-- Function: get_project_with_details
-- Description: Get project with owner info, stats, and user's relationship
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_project_with_details(p_project_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_result jsonb;
BEGIN
    v_user_id := auth.uid();
    
    SELECT jsonb_build_object(
        'project', row_to_json(p.*),
        'owner', jsonb_build_object(
            'id', u.id,
            'email', u.email,
            'full_name', u.full_name,
            'avatar_url', u.avatar_url,
            'institution', u.institution
        ),
        'stats', jsonb_build_object(
            'applications_count', (
                SELECT COUNT(*) FROM public.project_applications 
                WHERE project_id = p.id
            ),
            'favorites_count', (
                SELECT COUNT(*) FROM public.favorites 
                WHERE project_id = p.id
            ),
            'participants_count', (
                SELECT COUNT(*) FROM public.project_participants 
                WHERE project_id = p.id
            ),
            'average_rating', (
                SELECT ROUND(AVG(rating)::numeric, 2) 
                FROM public.project_ratings 
                WHERE project_id = p.id
            ),
            'ratings_count', (
                SELECT COUNT(*) FROM public.project_ratings 
                WHERE project_id = p.id
            )
        ),
        'user_relationship', CASE 
            WHEN v_user_id IS NULL THEN NULL
            ELSE jsonb_build_object(
                'is_owner', p.created_by = v_user_id,
                'has_applied', EXISTS (
                    SELECT 1 FROM public.project_applications 
                    WHERE project_id = p.id AND user_id = v_user_id
                ),
                'application_status', (
                    SELECT status FROM public.project_applications 
                    WHERE project_id = p.id AND user_id = v_user_id
                ),
                'is_favorited', EXISTS (
                    SELECT 1 FROM public.favorites 
                    WHERE project_id = p.id AND user_id = v_user_id
                ),
                'is_participant', EXISTS (
                    SELECT 1 FROM public.project_participants 
                    WHERE project_id = p.id AND user_id = v_user_id
                ),
                'user_rating', (
                    SELECT rating FROM public.project_ratings 
                    WHERE project_id = p.id AND user_id = v_user_id
                )
            )
        END
    ) INTO v_result
    FROM public.projects p
    JOIN public.users u ON u.id = p.created_by
    WHERE p.id = p_project_id;
    
    RETURN v_result;
END;
$$;

-- ----------------------------------------------------------------------------
-- Function: search_projects
-- Description: Advanced project search with filters
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION search_projects(
    p_search_text text DEFAULT NULL,
    p_field_type project_field_type DEFAULT NULL,
    p_required_skills text[] DEFAULT NULL,
    p_status text DEFAULT 'active',
    p_start_date_from date DEFAULT NULL,
    p_start_date_to date DEFAULT NULL,
    p_limit integer DEFAULT 20,
    p_offset integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result jsonb;
BEGIN
    SELECT jsonb_build_object(
        'projects', COALESCE(jsonb_agg(row_to_json(t.*)), '[]'::jsonb),
        'total', COUNT(*) OVER()
    ) INTO v_result
    FROM (
        SELECT 
            p.*,
            jsonb_build_object(
                'id', u.id,
                'email', u.email,
                'full_name', u.full_name,
                'avatar_url', u.avatar_url
            ) as owner,
            (SELECT COUNT(*) FROM public.project_applications WHERE project_id = p.id) as applications_count,
            (SELECT COUNT(*) FROM public.favorites WHERE project_id = p.id) as favorites_count,
            (SELECT ROUND(AVG(rating)::numeric, 2) FROM public.project_ratings WHERE project_id = p.id) as average_rating
        FROM public.projects p
        JOIN public.users u ON u.id = p.created_by
        WHERE p.is_active = true
            AND (p_search_text IS NULL OR (
                p.title ILIKE '%' || p_search_text || '%' OR
                p.description ILIKE '%' || p_search_text || '%'
            ))
            AND (p_field_type IS NULL OR p.field_type = p_field_type)
            AND (p_status IS NULL OR p.status = p_status)
            AND (p_start_date_from IS NULL OR p.start_date >= p_start_date_from)
            AND (p_start_date_to IS NULL OR p.start_date <= p_start_date_to)
            AND (p_required_skills IS NULL OR p.required_skills && p_required_skills)
        ORDER BY p.created_at DESC
        LIMIT p_limit
        OFFSET p_offset
    ) t;
    
    RETURN v_result;
END;
$$;

-- ----------------------------------------------------------------------------
-- Function: get_my_projects_dashboard
-- Description: Get user's projects, applications, and favorites
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_my_projects_dashboard()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_result jsonb;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('error', 'Not authenticated');
    END IF;
    
    SELECT jsonb_build_object(
        'my_projects', (
            SELECT COALESCE(jsonb_agg(row_to_json(p.*)), '[]'::jsonb)
            FROM public.projects p
            WHERE p.created_by = v_user_id
            ORDER BY p.created_at DESC
        ),
        'my_applications', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'application', row_to_json(a.*),
                    'project', row_to_json(p.*)
                )
            ), '[]'::jsonb)
            FROM public.project_applications a
            JOIN public.projects p ON p.id = a.project_id
            WHERE a.user_id = v_user_id
            ORDER BY a.created_at DESC
        ),
        'my_favorites', (
            SELECT COALESCE(jsonb_agg(row_to_json(p.*)), '[]'::jsonb)
            FROM public.favorites f
            JOIN public.projects p ON p.id = f.project_id
            WHERE f.user_id = v_user_id
            ORDER BY f.created_at DESC
        ),
        'pending_applications_to_review', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'application', row_to_json(a.*),
                    'applicant', jsonb_build_object(
                        'id', u.id,
                        'email', u.email,
                        'full_name', u.full_name,
                        'avatar_url', u.avatar_url
                    ),
                    'project', jsonb_build_object('id', p.id, 'title', p.title)
                )
            ), '[]'::jsonb)
            FROM public.project_applications a
            JOIN public.projects p ON p.id = a.project_id
            JOIN public.users u ON u.id = a.user_id
            WHERE p.created_by = v_user_id AND a.status = 'pending'
            ORDER BY a.created_at DESC
        )
    ) INTO v_result;
    
    RETURN v_result;
END;
$$;

-- ----------------------------------------------------------------------------
-- Function: mark_notification_as_read
-- Description: Mark single or multiple notifications as read
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION mark_notification_as_read(p_notification_ids uuid[])
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_updated_count integer;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;
    
    UPDATE public.notifications
    SET read = true
    WHERE id = ANY(p_notification_ids) AND user_id = v_user_id;
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    
    RETURN jsonb_build_object('success', true, 'updated_count', v_updated_count);
END;
$$;

-- ----------------------------------------------------------------------------
-- Function: get_unread_notifications_count
-- Description: Get count of unread notifications for current user
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_unread_notifications_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_count integer;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN 0;
    END IF;
    
    SELECT COUNT(*) INTO v_count
    FROM public.notifications
    WHERE user_id = v_user_id AND read = false;
    
    RETURN v_count;
END;
$$;

-- ============================================================================
-- SECTION 7: GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions on RPC functions to authenticated users
GRANT EXECUTE ON FUNCTION create_project_with_validation TO authenticated;
GRANT EXECUTE ON FUNCTION apply_to_project TO authenticated;
GRANT EXECUTE ON FUNCTION update_application_status TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_favorite TO authenticated;
GRANT EXECUTE ON FUNCTION submit_rating TO authenticated;
GRANT EXECUTE ON FUNCTION get_project_with_details TO authenticated;
GRANT EXECUTE ON FUNCTION search_projects TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_projects_dashboard TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_as_read TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notifications_count TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify installation
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Project Partnership Network - Migration Complete';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created: 6 (projects, project_applications, favorites, project_ratings, notifications, project_participants)';
    RAISE NOTICE 'Enums created: 3 (project_field_type, application_status, notification_type)';
    RAISE NOTICE 'RPC functions created: 10';
    RAISE NOTICE 'Triggers created: 5';
    RAISE NOTICE 'RLS policies: Enabled on all tables';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Test RPC functions in Postman (update starting_point.json)';
    RAISE NOTICE '2. Create TypeScript types (src/types/projects.types.ts)';
    RAISE NOTICE '3. Build service layer (src/services/api/projects.service.ts)';
    RAISE NOTICE '4. Create Pinia stores (src/stores/projects.ts, etc.)';
    RAISE NOTICE '5. Build Vue components (src/pages/projects/)';
    RAISE NOTICE '========================================';
END $$;
