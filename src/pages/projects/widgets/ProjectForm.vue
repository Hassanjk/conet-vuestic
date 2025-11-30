<template>
  <VaForm ref="form" @submit.prevent="handleSubmit">
    <VaCard>
      <VaCardTitle>{{ isEditMode ? 'Edit Project' : 'Create New Project' }}</VaCardTitle>
      <VaCardContent>
        <div class="grid grid-cols-1 gap-4">
          <!-- Title -->
          <VaInput
            v-model="formData.title"
            label="Project Title"
            placeholder="Enter project title"
            :rules="[(v) => !!v || 'Title is required']"
            required
          />

          <!-- Description -->
          <VaTextarea
            v-model="formData.description"
            label="Description"
            placeholder="Describe your project, objectives, and what you're looking for..."
            :min-rows="4"
            :rules="[(v) => !!v || 'Description is required']"
            required
          />

          <!-- Field Type -->
          <VaSelect
            v-model="formData.field_type"
            label="Academic Field"
            placeholder="Select field"
            :options="fieldTypeOptions"
            text-by="label"
            value-by="value"
            :rules="[(v) => !!v || 'Field is required']"
            required
          />

          <!-- Required Skills -->
          <div>
            <label class="va-input-label">Required Skills</label>
            <VaChipInput
              v-model="formData.required_skills"
              placeholder="Add skills (press Enter after each)"
              color="primary"
            />
            <p class="text-sm text-gray-500 mt-1">Add skills one by one, pressing Enter after each skill</p>
          </div>

          <!-- Contact Info -->
          <VaInput
            v-model="formData.contact_info"
            label="Contact Information"
            placeholder="Email, phone, or other contact method"
            :rules="[(v) => !!v || 'Contact info is required']"
            required
          />

          <!-- Date Range -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VaDateInput v-model="formData.start_date" label="Start Date" placeholder="Select start date" clearable />

            <VaDateInput v-model="formData.end_date" label="End Date" placeholder="Select end date" clearable />
          </div>

          <!-- Error Message -->
          <VaAlert v-if="error" color="danger" class="mt-4">
            {{ error }}
          </VaAlert>
        </div>
      </VaCardContent>

      <VaCardActions>
        <VaButton color="secondary" :disabled="isLoading" @click="handleCancel"> Cancel </VaButton>
        <VaButton type="submit" :loading="isLoading">
          {{ isEditMode ? 'Update Project' : 'Create Project' }}
        </VaButton>
      </VaCardActions>
    </VaCard>
  </VaForm>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vuestic-ui'
import { useProjectsStore } from '../../../stores/projects'
import { PROJECT_FIELD_TYPES } from '../../../types/projects.types'
import type { Project, ProjectFieldType } from '../../../types/projects.types'

interface Props {
  project?: Project | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'success'): void
  (e: 'cancel'): void
}>()

const router = useRouter()
const projectsStore = useProjectsStore()
const { init: notify } = useToast()

const isEditMode = computed(() => !!props.project)
const isLoading = ref(false)
const error = ref<string | null>(null)

// Form data
const formData = ref({
  title: '',
  description: '',
  field_type: '' as ProjectFieldType | '',
  required_skills: [] as string[],
  contact_info: '',
  start_date: null as Date | null,
  end_date: null as Date | null,
})

// Field type options with translations
const fieldTypeOptions = PROJECT_FIELD_TYPES.map((type) => ({
  value: type.value,
  label: `${type.label} (${type.labelEn})`,
}))

// Watch for project prop changes (edit mode)
watch(
  () => props.project,
  (project) => {
    if (project) {
      formData.value = {
        title: project.title,
        description: project.description,
        field_type: project.field_type,
        required_skills: [...project.required_skills],
        contact_info: project.contact_info,
        start_date: project.start_date ? new Date(project.start_date) : null,
        end_date: project.end_date ? new Date(project.end_date) : null,
      }
    }
  },
  { immediate: true },
)

const handleSubmit = async () => {
  error.value = null
  isLoading.value = true

  try {
    if (isEditMode.value && props.project) {
      // Update existing project
      await projectsStore.updateProject(props.project.id, {
        title: formData.value.title,
        description: formData.value.description,
        field_type: formData.value.field_type as ProjectFieldType,
        required_skills: formData.value.required_skills,
        contact_info: formData.value.contact_info,
        start_date: formData.value.start_date ? formData.value.start_date.toISOString().split('T')[0] : null,
        end_date: formData.value.end_date ? formData.value.end_date.toISOString().split('T')[0] : null,
      })

      notify({
        message: 'Project updated successfully!',
        color: 'success',
      })
    } else {
      // Create new project
      await projectsStore.createProject({
        p_title: formData.value.title,
        p_description: formData.value.description,
        p_field_type: formData.value.field_type as ProjectFieldType,
        p_required_skills: formData.value.required_skills,
        p_contact_info: formData.value.contact_info,
        p_start_date: formData.value.start_date ? formData.value.start_date.toISOString().split('T')[0] : null,
        p_end_date: formData.value.end_date ? formData.value.end_date.toISOString().split('T')[0] : null,
      })

      notify({
        message: 'Project created successfully!',
        color: 'success',
      })
    }

    emit('success')
  } catch (err: any) {
    error.value = err.message || 'An error occurred'
    notify({
      message: error.value,
      color: 'danger',
    })
  } finally {
    isLoading.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>
