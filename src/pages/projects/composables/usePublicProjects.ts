import { ref, computed } from 'vue'
import type { PublicProjectDisplay, ProjectFilters } from '../../../types/projects.types'
import { projectsService } from '../../../services/api/projects.service'
import { useToast } from 'vuestic-ui'

export const usePublicProjects = () => {
  const projects = ref<PublicProjectDisplay[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<ProjectFilters>({ status: 'active' })
  const searchQuery = ref('')
  
  const { init: notify } = useToast()

  const totalCount = computed(() => projects.value.length)

  const fetchProjects = async () => {
    isLoading.value = true
    error.value = null

    try {
      const data = await projectsService.getPublicProjects()
      
      // Transform to PublicProjectDisplay format
      // Add stats and user_status (TODO: get from backend)
      projects.value = data.map(project => ({
        ...project,
        stats: {
          applications_count: 0,
          participants_count: 0,
          favorites_count: 0,
          average_rating: null,
        },
        user_status: {
          is_favorited: false,
          has_applied: false,
        },
      })) as PublicProjectDisplay[]

      // Apply local filtering if needed
      if (filters.value.search) {
        const search = filters.value.search.toLowerCase()
        projects.value = projects.value.filter(p =>
          p.title.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.required_skills.some(s => s.toLowerCase().includes(search))
        )
      }

      if (filters.value.field_type) {
        projects.value = projects.value.filter(p => p.field_type === filters.value.field_type)
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch projects'
      notify({
        message: 'Projeler yüklenirken hata oluştu',
        color: 'danger',
      })
    } finally {
      isLoading.value = false
    }
  }

  const refreshProjects = () => {
    return fetchProjects()
  }

  return {
    projects,
    isLoading,
    error,
    filters,
    searchQuery,
    totalCount,
    fetchProjects,
    refreshProjects,
  }
}
