import { User } from '../users/types'
import type { Project as SupabaseProject, ProjectFieldType, ProjectStatus } from '@/types/projects.types'

export type UUID = `${string}-${string}-${string}-${string}-${string}`

// Use Supabase Project type
export type Project = SupabaseProject

// Legacy compatibility - map Supabase fields to old UI expectations
export type ProjectViewModel = Project & {
  project_name: string      // Maps to title
  project_owner: string     // Maps to created_by
  team: User['id'][]        // Will be populated from project_participants
  displayStatus: 'important' | 'completed' | 'archived' | 'in progress'
}

export type EmptyProject = Partial<Pick<Project, 'title' | 'description' | 'field_type' | 'required_skills' | 'contact_info' | 'start_date' | 'end_date'>> & {
  created_by?: string
  status?: ProjectStatus
}

// Helper to convert Supabase Project to ViewModel
export function toProjectViewModel(project: Project, participants: User['id'][] = []): ProjectViewModel {
  if (!project) {
    throw new Error('Project data is null or undefined')
  }
  return {
    ...project,
    project_name: project.title || 'Untitled',
    project_owner: project.created_by || '',
    team: participants || [],
    displayStatus: mapStatusToDisplay(project.status || 'active'),
  }
}

// Map Supabase status to legacy display status
function mapStatusToDisplay(status: ProjectStatus): 'important' | 'completed' | 'archived' | 'in progress' {
  if (!status) return 'in progress'
  switch (status) {
    case 'active': return 'in progress'
    case 'completed': return 'completed'
    case 'closed': return 'archived'
    default: return 'in progress'
  }
}
