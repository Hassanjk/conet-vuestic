import { UserWithRoles } from '../../types/auth.types'

export type UserRole = 'admin' | 'user' | 'owner' | 'student' | 'researcher'

export type UUID = `${string}-${string}-${string}-${string}-${string}`

// Transformed format for the UI (compatible with existing components)
export type User = {
  id: string
  fullname: string
  email: string
  username: string
  role: UserRole
  avatar: string
  projects: string[]
  notes: string
  active: boolean
  // Additional fields from Supabase
  status?: 'ONLINE' | 'OFFLINE'
  bio?: string | null
  institution?: string | null
  department?: string | null
  title?: string | null
  skills?: string | null
  location?: string | null
  available_for_collaboration?: boolean
  created_at?: string
  updated_at?: string
}

// Helper function to transform Supabase user to UI user format
export const transformSupabaseUser = (supabaseUser: UserWithRoles): User => {
  const primaryRole = supabaseUser.user_roles?.[0]?.role || 'user'
  
  return {
    id: supabaseUser.id,
    fullname: supabaseUser.full_name || supabaseUser.username || 'Unknown User',
    email: supabaseUser.email,
    username: supabaseUser.username || supabaseUser.email.split('@')[0],
    role: primaryRole as UserRole,
    avatar: supabaseUser.avatar_url || '',
    projects: supabaseUser.projects || [],
    notes: supabaseUser.bio || '',
    active: supabaseUser.is_active,
    // Additional fields
    status: supabaseUser.status,
    bio: supabaseUser.bio,
    institution: supabaseUser.institution,
    department: supabaseUser.department,
    title: supabaseUser.title,
    skills: Array.isArray(supabaseUser.skills) ? supabaseUser.skills.join(', ') : supabaseUser.skills,
    location: supabaseUser.location,
    available_for_collaboration: supabaseUser.available_for_collaboration,
    created_at: supabaseUser.created_at,
    updated_at: supabaseUser.updated_at,
  }
}
