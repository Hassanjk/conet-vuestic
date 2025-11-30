<template>
  <h1 class="page-title">My Projects</h1>

  <VaCard>
    <VaCardContent>
      <div class="flex flex-col md:flex-row gap-2 mb-4 justify-between">
        <VaInput
          v-model="searchQuery"
          placeholder="Search projects..."
          class="flex-1 md:max-w-md"
        >
          <template #prepend>
            <VaIcon name="search" />
          </template>
        </VaInput>
        
        <VaButton @click="showCreateModal = true" icon="add">
          Create Project
        </VaButton>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8">
        <VaProgressCircle indeterminate />
        <p class="mt-2 text-secondary">Loading projects...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!projects.length" class="text-center py-12">
        <VaIcon name="folder_open" size="4rem" color="secondary" />
        <h3 class="mt-4 text-lg">No projects found</h3>
        <p class="text-secondary mt-2">Create your first project to get started!</p>
        <VaButton class="mt-4" @click="showCreateModal = true" icon="add">
          Create Project
        </VaButton>
      </div>

      <!-- Projects Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <VaCard
          v-for="project in filteredProjects"
          :key="project.id"
          class="project-card"
          :color="getStatusColor(project.status)"
          gradient
        >
          <VaCardTitle class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="text-lg font-semibold line-clamp-2">{{ project.title }}</h3>
              <VaBadge :text="project.field_type" class="mt-2" />
            </div>
            <VaChip size="small" :color="getStatusColor(project.status)">
              {{ project.status }}
            </VaChip>
          </VaCardTitle>

          <VaCardContent>
            <p class="text-sm text-secondary line-clamp-3 mb-4">
              {{ project.description }}
            </p>

            <!-- Skills -->
            <div v-if="project.required_skills.length" class="mb-4">
              <p class="text-xs font-semibold mb-1">Required Skills:</p>
              <div class="flex flex-wrap gap-1">
                <VaChip
                  v-for="skill in project.required_skills.slice(0, 3)"
                  :key="skill"
                  size="small"
                  color="info"
                >
                  {{ skill }}
                </VaChip>
                <VaChip v-if="project.required_skills.length > 3" size="small" color="info">
                  +{{ project.required_skills.length - 3 }}
                </VaChip>
              </div>
            </div>

            <!-- Dates -->
            <div class="text-xs text-secondary mb-2">
              <div v-if="project.start_date">
                <VaIcon name="event" size="small" /> Start: {{ formatDate(project.start_date) }}
              </div>
              <div v-if="project.end_date">
                <VaIcon name="event" size="small" /> End: {{ formatDate(project.end_date) }}
              </div>
            </div>

            <!-- Stats -->
            <div class="flex gap-4 text-xs text-secondary mb-4">
              <div><VaIcon name="visibility" size="small" /> {{ project.view_count }} views</div>
              <div><VaIcon name="schedule" size="small" /> {{ formatDate(project.created_at) }}</div>
            </div>
          </VaCardContent>

          <VaCardActions>
            <VaButton size="small" preset="secondary" @click="viewProject(project)" icon="visibility">
              View
            </VaButton>
            <VaButton size="small" preset="secondary" @click="editProject(project)" icon="edit">
              Edit
            </VaButton>
            <VaButton
              size="small"
              preset="secondary"
              color="danger"
              @click="confirmDelete(project)"
              icon="delete"
            >
              Delete
            </VaButton>
          </VaCardActions>
        </VaCard>
      </div>
    </VaCardContent>
  </VaCard>

  <!-- Create/Edit Modal -->
  <!-- <VaModal v-model="showCreateModal" size="large" mobile-fullscreen hide-default-actions>
    <ProjectForm
      :project="selectedProject"
      @success="handleFormSuccess"
      @cancel="showCreateModal = false"
    />
  </VaModal> -->
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useModal, useToast } from 'vuestic-ui'
import { useProjectsStore } from '../../stores/projects'
// import ProjectForm from './widgets/ProjectForm.vue'
import type { Project } from '../../types/projects.types'

const router = useRouter()
const projectsStore = useProjectsStore()
const { confirm } = useModal()
const { init: notify } = useToast()

const searchQuery = ref('')
const showCreateModal = ref(false)
const selectedProject = ref<Project | null>(null)

// Temporarily use local state to avoid hanging
const isLoading = ref(false)
const projects = ref<Project[]>([])

const filteredProjects = computed(() => {
  if (!searchQuery.value) return projects.value

  const query = searchQuery.value.toLowerCase()
  return projects.value.filter(
    (p) =>
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.required_skills.some((s) => s.toLowerCase().includes(query))
  )
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'closed':
      return 'warning'
    case 'completed':
      return 'info'
    default:
      return 'secondary'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const viewProject = (project: Project) => {
  router.push(`/projects/${project.id}`)
}

const editProject = (project: Project) => {
  selectedProject.value = project
  showCreateModal.value = true
}

const confirmDelete = async (project: Project) => {
  const agreed = await confirm({
    title: 'Delete Project',
    message: `Are you sure you want to delete "${project.title}"? This action cannot be undone.`,
    okText: 'Delete',
    cancelText: 'Cancel',
    size: 'small',
    maxWidth: '380px',
  })

  if (agreed) {
    try {
      await projectsStore.deleteProject(project.id)
      notify({
        message: 'Project deleted successfully',
        color: 'success',
      })
    } catch (error: any) {
      notify({
        message: error.message || 'Failed to delete project',
        color: 'danger',
      })
    }
  }
}

const handleFormSuccess = () => {
  showCreateModal.value = false
  selectedProject.value = null
  loadProjects()
}

const loadProjects = async () => {
  isLoading.value = true
  try {
    console.log('Starting to fetch projects...')
    const result = await projectsStore.fetchMyProjects()
    projects.value = projectsStore.myProjects
    console.log('Projects loaded:', projects.value)
    notify({
      message: 'Projects loaded successfully',
      color: 'success',
    })
  } catch (err: any) {
    console.error('Failed to fetch projects:', err)
    notify({
      message: err.message || 'Failed to load projects',
      color: 'danger',
    })
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  console.log('MyProjectsPage mounted')
  // Temporarily disabled to prevent hanging
  // loadProjects()
})
</script>

<style scoped>
.project-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
