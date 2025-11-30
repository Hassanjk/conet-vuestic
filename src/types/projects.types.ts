// Project field types (academic disciplines)
export type ProjectFieldType =
  | 'Mühendislik' // Engineering
  | 'Sağlık' // Health
  | 'Eğitim' // Education
  | 'Teknoloji' // Technology
  | 'Sanat' // Arts
  | 'Bilim' // Science
  | 'Other'

// Project status
export type ProjectStatus = 'active' | 'closed' | 'completed'

// Base project interface
export interface Project {
  id: string
  title: string
  description: string
  field_type: ProjectFieldType
  required_skills: string[]
  contact_info: string
  start_date: string | null
  end_date: string | null
  created_by: string
  status: ProjectStatus
  is_active: boolean
  view_count: number
  created_at: string
  updated_at: string
}

// Project with owner information
export interface ProjectWithOwner extends Project {
  owner: {
    id: string
    email: string
    full_name: string
    avatar_url: string | null
  }
}

// Project creation request
export interface CreateProjectRequest {
  p_title: string
  p_description: string
  p_field_type: ProjectFieldType
  p_required_skills: string[]
  p_contact_info: string
  p_start_date?: string | null
  p_end_date?: string | null
}

// Project update request
export interface UpdateProjectRequest {
  title?: string
  description?: string
  field_type?: ProjectFieldType
  required_skills?: string[]
  contact_info?: string
  start_date?: string | null
  end_date?: string | null
  status?: ProjectStatus
  is_active?: boolean
}

// Project creation response
export interface CreateProjectResponse {
  success: boolean
  project: Project
  owner: {
    id: string
    email: string
    full_name: string
    avatar_url: string | null
  }
}

// Project search filters
export interface ProjectFilters {
  field_type?: ProjectFieldType
  skills?: string[]
  status?: ProjectStatus
  search?: string
  start_date?: string
  end_date?: string
}

// Project with stats
export interface ProjectWithStats {
  project: Project
  owner: {
    id: string
    email: string
    full_name: string
    avatar_url: string | null
    institution: string | null
  }
  stats: {
    applications_count: number
    participants_count: number
    average_rating: number | null
  }
  user_relationship?: {
    is_owner: boolean
    is_participant: boolean
    is_favorited: boolean
    has_applied: boolean
  }
}

// Field type options for dropdowns
export const PROJECT_FIELD_TYPES: Array<{ value: ProjectFieldType; label: string; labelEn: string }> = [
  { value: 'Mühendislik', label: 'Mühendislik', labelEn: 'Engineering' },
  { value: 'Sağlık', label: 'Sağlık', labelEn: 'Health' },
  { value: 'Eğitim', label: 'Eğitim', labelEn: 'Education' },
  { value: 'Teknoloji', label: 'Teknoloji', labelEn: 'Technology' },
  { value: 'Sanat', label: 'Sanat', labelEn: 'Arts' },
  { value: 'Bilim', label: 'Bilim', labelEn: 'Science' },
  { value: 'Other', label: 'Diğer', labelEn: 'Other' },
]

// Status options for dropdowns
export const PROJECT_STATUS_OPTIONS: Array<{ value: ProjectStatus; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'closed', label: 'Closed' },
  { value: 'completed', label: 'Completed' },
]

// Public project display (for browse/listing pages)
export interface PublicProjectDisplay extends ProjectWithOwner {
  stats: {
    applications_count: number
    participants_count: number
    favorites_count: number
    average_rating: number | null
  }
  user_status: {
    is_favorited: boolean
    has_applied: boolean
    application_status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  }
}

// Application status type
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn'

// Project application interface
export interface ProjectApplication {
  id: string
  project_id: string
  user_id: string
  message: string
  status: ApplicationStatus
  cv_link: string | null
  relevant_skills: string[]
  created_at: string
  updated_at: string
}

// Create application request
export interface CreateApplicationRequest {
  p_project_id: string
  p_message: string
  p_cv_link?: string | null
  p_relevant_skills?: string[]
}

// Application with project and user details
export interface ApplicationWithDetails extends ProjectApplication {
  project: {
    id: string
    title: string
    field_type: ProjectFieldType
    status: ProjectStatus
  }
  applicant: {
    id: string
    full_name: string
    email: string
    avatar_url: string | null
    institution: string | null
  }
}
