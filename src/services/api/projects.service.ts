import { apiClient } from './client'
import type {
  Project,
  ProjectWithOwner,
  ProjectWithStats,
  CreateProjectRequest,
  CreateProjectResponse,
  UpdateProjectRequest,
  ProjectFilters,
} from '../../types/projects.types'

class ProjectsService {
  /**
   * Create a new project with validation
   */
  async createProject(data: CreateProjectRequest): Promise<CreateProjectResponse> {
    try {
      const response = await apiClient.rpc('create_project_with_validation', data)
      return response
    } catch (error: any) {
      console.error('Create project error:', error)
      throw new Error(error.message || 'Failed to create project')
    }
  }

  /**
   * Get all active projects
   */
  async getActiveProjects(): Promise<Project[]> {
    try {
      const response = await apiClient.get<Project[]>('/rest/v1/projects', {
        params: {
          is_active: 'eq.true',
          select: '*',
          order: 'created_at.desc',
        },
      })
      console.log('Active projects response:', response)
      return response
    } catch (error: any) {
      console.error('Get active projects error:', error)
      throw new Error(error.message || 'Failed to fetch projects')
    }
  }

  /**
   * Get public projects with owner information for browse page
   */
  async getPublicProjects(): Promise<ProjectWithOwner[]> {
    try {
      const response = await apiClient.get<any[]>('/rest/v1/projects', {
        params: {
          is_active: 'eq.true',
          status: 'eq.active',
          select: '*,owner:users!created_by(id,email,full_name,avatar_url,institution)',
          order: 'created_at.desc',
        },
      })
      console.log('Public projects response:', response)
      return response as ProjectWithOwner[]
    } catch (error: any) {
      console.error('Get public projects error:', error)
      throw new Error(error.message || 'Failed to fetch public projects')
    }
  }

  /**
   * Get project by ID with details and stats
   */
  async getProjectWithDetails(projectId: string): Promise<ProjectWithStats> {
    try {
      const response = await apiClient.rpc('get_project_with_details', {
        p_project_id: projectId,
      })
      return response
    } catch (error: any) {
      console.error('Get project details error:', error)
      throw new Error(error.message || 'Failed to fetch project details')
    }
  }

  /**
   * Search projects with filters
   */
  async searchProjects(filters: ProjectFilters): Promise<Project[]> {
    try {
      const response = await apiClient.rpc('search_projects', {
        p_filters: filters,
      })
      return response
    } catch (error: any) {
      console.error('Search projects error:', error)
      throw new Error(error.message || 'Failed to search projects')
    }
  }

  /**
   * Update project (owner only)
   */
  async updateProject(projectId: string, data: UpdateProjectRequest): Promise<Project> {
    try {
      const response = await apiClient.patch(`/rest/v1/projects?id=eq.${projectId}`, data, {
        headers: {
          Prefer: 'return=representation',
        },
      })
      return response.data[0]
    } catch (error: any) {
      console.error('Update project error:', error)
      throw new Error(error.response?.data?.message || 'Failed to update project')
    }
  }

  /**
   * Close project (no new applications)
   */
  async closeProject(projectId: string): Promise<Project> {
    return this.updateProject(projectId, { status: 'closed' })
  }

  /**
   * Mark project as completed
   */
  async completeProject(projectId: string): Promise<Project> {
    return this.updateProject(projectId, { status: 'completed' })
  }

  /**
   * Soft delete project (mark as inactive)
   */
  async deleteProject(projectId: string): Promise<void> {
    try {
      await this.updateProject(projectId, { is_active: false })
    } catch (error: any) {
      console.error('Delete project error:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete project')
    }
  }

  /**
   * Get projects created by current user
   */
  async getMyProjects(): Promise<Project[]> {
    try {
      const userId = localStorage.getItem('user_id')
      if (!userId) {
        throw new Error('User not authenticated')
      }

      const response = await apiClient.get('/rest/v1/projects', {
        params: {
          created_by: `eq.${userId}`,
          select: '*',
          order: 'created_at.desc',
        },
      })
      return response.data
    } catch (error: any) {
      console.error('Get my projects error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch your projects')
    }
  }

  /**
   * Increment view count for project
   */
  async incrementViewCount(projectId: string): Promise<void> {
    try {
      // Get current view count
      const response = await apiClient.get(`/rest/v1/projects?id=eq.${projectId}&select=view_count`)
      const currentCount = response.data[0]?.view_count || 0

      // Increment it
      await apiClient.patch(`/rest/v1/projects?id=eq.${projectId}`, {
        view_count: currentCount + 1,
      })
    } catch (error: any) {
      // Silent fail - view count is not critical
      console.warn('Failed to increment view count:', error)
    }
  }
}

export const projectsService = new ProjectsService()
