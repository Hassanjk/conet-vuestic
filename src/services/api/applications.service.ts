import { apiClient } from './client'
import type {
  ProjectApplication,
  ApplicationWithDetails,
  CreateApplicationRequest,
  ApplicationStatus,
} from '../../types/projects.types'

class ApplicationsService {
  /**
   * Submit a new project application
   */
  async createApplication(data: CreateApplicationRequest): Promise<ProjectApplication> {
    try {
      const response = await apiClient.rpc<ProjectApplication>('apply_to_project', data)
      return response
    } catch (error: any) {
      console.error('Create application error:', error)
      throw new Error(error.message || 'Başvuru gönderilirken hata oluştu')
    }
  }

  /**
   * Get user's applications
   */
  async getMyApplications(): Promise<ApplicationWithDetails[]> {
    try {
      const response = await apiClient.rpc<ApplicationWithDetails[]>('get_my_applications_dashboard')
      return response
    } catch (error: any) {
      console.error('Get my applications error:', error)
      throw new Error(error.message || 'Başvurular yüklenirken hata oluştu')
    }
  }

  /**
   * Get applications for a specific project (for project owners)
   */
  async getProjectApplications(projectId: string): Promise<ApplicationWithDetails[]> {
    try {
      const response = await apiClient.get<ApplicationWithDetails[]>('/rest/v1/project_applications', {
        params: {
          project_id: `eq.${projectId}`,
          select: '*,applicant:users(*),project:projects(id,title,field_type,status)',
          order: 'created_at.desc',
        },
      })
      return response
    } catch (error: any) {
      console.error('Get project applications error:', error)
      throw new Error(error.message || 'Başvurular yüklenirken hata oluştu')
    }
  }

  /**
   * Update application status (for project owners)
   */
  async updateApplicationStatus(applicationId: string, status: ApplicationStatus): Promise<void> {
    try {
      await apiClient.rpc('update_application_status', {
        p_application_id: applicationId,
        p_new_status: status,
      })
    } catch (error: any) {
      console.error('Update application status error:', error)
      throw new Error(error.message || 'Başvuru durumu güncellenirken hata oluştu')
    }
  }

  /**
   * Withdraw application (for applicants)
   */
  async withdrawApplication(applicationId: string): Promise<void> {
    try {
      await this.updateApplicationStatus(applicationId, 'withdrawn')
    } catch (error: any) {
      console.error('Withdraw application error:', error)
      throw new Error(error.message || 'Başvuru geri çekilirken hata oluştu')
    }
  }

  /**
   * Check if user has already applied to a project
   */
  async checkIfApplied(projectId: string): Promise<boolean> {
    try {
      const response = await apiClient.get<ProjectApplication[]>('/rest/v1/project_applications', {
        params: {
          project_id: `eq.${projectId}`,
          select: 'id',
        },
      })
      return response.length > 0
    } catch (error: any) {
      console.error('Check if applied error:', error)
      return false
    }
  }
}

export const applicationsService = new ApplicationsService()
export default applicationsService
