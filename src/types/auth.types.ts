// Authentication Types based on starting_point.json API responses

export type UserRole = 'admin' | 'moderator' | 'student' | 'researcher' | 'professor' | 'user'

export type UserStatus = 'ONLINE' | 'OFFLINE'

// Core User Interface
export interface User {
  id: string
  email: string
  username?: string
  full_name?: string
  avatar_url?: string
  projects?: string[]
  status?: UserStatus
  is_active: boolean
  created_at?: string
  updated_at?: string
  // Extended profile fields
  bio?: string
  institution?: string
  department?: string
  title?: string
  orcid_id?: string
  linkedin_url?: string
  website_url?: string
  expertise_areas?: string[]
  skills?: string[]
  location?: string
  available_for_collaboration?: boolean
}

// User Role Interface
export interface UserRoleRecord {
  user_id: string
  role: UserRole
  created_at?: string
}

// Complete User with Roles (from API responses)
export interface UserWithRoles extends User {
  user_roles: UserRoleRecord[]
}

// Authentication Request/Response Types
export interface SignupRequest {
  email: string
  password: string
  data?: {
    full_name?: string
    username?: string
    avatar_url?: string
  }
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user: User
  // Auto-sync profile fields (added for signup flow)
  profileCreated?: boolean
  syncResult?: any
  message?: string
  error?: string
}

// Profile Update Types
export interface ProfileUpdateRequest {
  username?: string
  full_name?: string
  avatar_url?: string
  projects?: string[]
  status?: UserStatus
  // Extended profile fields
  bio?: string
  institution?: string
  department?: string
  title?: string
  orcid_id?: string
  linkedin_url?: string
  website_url?: string
  expertise_areas?: string[]
  skills?: string[]
  location?: string
  available_for_collaboration?: boolean
}

// Admin User Creation (admin_create_complete_user RPC)
export interface AdminCreateUserRequest {
  p_email: string
  p_username?: string
  p_full_name?: string
  p_avatar_url?: string
  p_projects?: string[]
  p_role?: UserRole | null
  p_is_active: boolean
}

export interface AdminCreateUserResponse {
  success: boolean
  user: UserWithRoles
  error?: string
}

// Role Management Types
export interface AssignRoleRequest {
  user_id: string
  role: UserRole
}

export interface UpdateRoleRequest {
  role: UserRole
}

// Auth Store State
export interface AuthState {
  // Core Authentication
  user: User | null
  tokens: {
    access_token: string | null
    refresh_token: string | null
    expires_at: number | null
  }

  // Status & Permissions
  isAuthenticated: boolean
  userRoles: UserRole[]
  isLoading: boolean
  error: string | null

  // Profile Data
  profile: User | null
}

// API Error Response
export interface ApiError {
  message: string
  code?: string
  details?: any
}

// Supabase Auth User (from auth.user)
export interface SupabaseUser {
  id: string
  email: string
  email_confirmed_at?: string
  created_at: string
  updated_at: string
  user_metadata?: Record<string, any>
}
