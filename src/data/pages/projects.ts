import { apiClient } from '../../services/api/client'
import { ProjectViewModel, toProjectViewModel } from '../../pages/projects/types'
import type { Project as SupabaseProject } from '../../types/projects.types'

export type Pagination = {
  page: number
  perPage: number
  total: number
}

export type Sorting = {
  sortBy: 'created_by' | 'title' | 'created_at'
  sortingOrder: 'asc' | 'desc' | null
}

export const getProjects = async (options: Partial<Sorting> & Pagination) => {
  try {
    // Fetch active projects from Supabase with participants
    const projectsResponse = await apiClient.get('/rest/v1/projects', {
      params: {
        is_active: 'eq.true',
        select: '*',
        order: options.sortBy ? `${options.sortBy}.${options.sortingOrder || 'desc'}` : 'created_at.desc',
      },
    })

    // Safely extract projects array
    let projects: SupabaseProject[] = []
    if (Array.isArray(projectsResponse)) {
      projects = projectsResponse
    } else if (projectsResponse && Array.isArray(projectsResponse.data)) {
      projects = projectsResponse.data
    } else if (projectsResponse && projectsResponse.data) {
      projects = [projectsResponse.data]
    }

    // Return empty if no projects
    if (!projects || projects.length === 0) {
      return {
        data: [],
        pagination: {
          page: options.page,
          perPage: options.perPage,
          total: 0,
        },
      }
    }

    // Fetch participants for each project
    const projectViewModels: ProjectViewModel[] = await Promise.all(
      projects.map(async (project) => {
        if (!project || !project.id) {
          return null
        }
        try {
          const participantsResponse = await apiClient.get('/rest/v1/project_participants', {
            params: {
              project_id: `eq.${project.id}`,
              select: 'user_id',
            },
          })
          const participantData = Array.isArray(participantsResponse) ? participantsResponse : (participantsResponse.data || [])
          const participantIds = (participantData || []).map((p: any) => p?.user_id).filter(Boolean)
          return toProjectViewModel(project, participantIds)
        } catch (err) {
          // If participants fetch fails, return project without team
          console.warn('Failed to fetch participants for project:', project.id, err)
          return toProjectViewModel(project, [])
        }
      })
    )

    // Filter out any null values
    const validProjects = projectViewModels.filter(Boolean) as ProjectViewModel[]

    return {
      data: validProjects,
      pagination: {
        page: options.page,
        perPage: options.perPage,
        total: validProjects.length,
      },
    }
  } catch (error) {
    console.error('Get projects error:', error)
    return {
      data: [],
      pagination: {
        page: options.page,
        perPage: options.perPage,
        total: 0,
      },
    }
  }
}

export const addProject = async (project: any) => {
  try {
    // Use Supabase RPC function for project creation with validation
    const response = await apiClient.rpc('create_project_with_validation', {
      p_title: project.title || project.project_name || 'Untitled Project',
      p_description: project.description || 'Project created from admin panel',
      p_field_type: project.field_type || 'Other',
      p_required_skills: project.required_skills || [],
      p_contact_info: project.contact_info || '',
      p_start_date: project.start_date || null,
      p_end_date: project.end_date || null,
    })

    // Safely extract project from response
    const projectData = response?.project || response
    if (!projectData) {
      throw new Error('Invalid response from server')
    }

    // Transform response to ViewModel
    const newProject = toProjectViewModel(projectData, [])
    return [newProject]
  } catch (error) {
    console.error('Add project error:', error)
    throw error
  }
}

export const updateProject = async (project: any) => {
  try {
    // Update project using Supabase REST API
    const updateData: any = {}
    
    if (project.title || project.project_name) {
      updateData.title = project.title || project.project_name
    }
    if (project.description) updateData.description = project.description
    if (project.field_type) updateData.field_type = project.field_type
    if (project.required_skills) updateData.required_skills = project.required_skills
    if (project.contact_info) updateData.contact_info = project.contact_info
    if (project.start_date !== undefined) updateData.start_date = project.start_date
    if (project.end_date !== undefined) updateData.end_date = project.end_date
    if (project.status) updateData.status = project.status

    const response = await apiClient.patch(`/rest/v1/projects?id=eq.${project.id}`, updateData, {
      headers: {
        Prefer: 'return=representation',
      },
    })

    const updatedData = Array.isArray(response) ? response : (response.data || [])
    const updatedProject = updatedData[0]
    return [toProjectViewModel(updatedProject, project.team || [])]
  } catch (error) {
    console.error('Update project error:', error)
    throw error
  }
}

export const removeProject = async (project: any) => {
  try {
    // Soft delete: mark as inactive
    await apiClient.patch(`/rest/v1/projects?id=eq.${project.id}`, {
      is_active: false,
    })
    return true
  } catch (error) {
    console.error('Remove project error:', error)
    return false
  }
}
