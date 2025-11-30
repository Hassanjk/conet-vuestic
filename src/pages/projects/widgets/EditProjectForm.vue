<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { EmptyProject, ProjectViewModel } from '../types'
import { SelectOption, useBreakpoint } from 'vuestic-ui'
import ProjectStatusBadge from '../components/ProjectStatusBadge.vue'
import UserAvatar from '../../users/widgets/UserAvatar.vue'
import { useUsersStore } from '../../../stores/users'
import type { ProjectFieldType, ProjectStatus } from '../../../types/projects.types'

const props = defineProps<{
  project: ProjectViewModel | null
  saveButtonLabel: string
}>()

defineEmits<{
  (event: 'save', project: Partial<ProjectViewModel>): void
  (event: 'close'): void
}>()

const bp = useBreakpoint()

const defaultNewProject: Partial<ProjectViewModel> = {
  title: '',
  description: '',
  field_type: 'Other' as ProjectFieldType,
  required_skills: [],
  contact_info: '',
  created_by: undefined,
  team: [],
  status: 'active' as ProjectStatus,
  displayStatus: 'in progress',
}

const newProject = ref<Partial<ProjectViewModel>>({ ...defaultNewProject })
const newSkill = ref('')
const currentStep = ref(1)

const isFormHasUnsavedChanges = computed(() => {
  return Object.keys(newProject.value).some((key) => {
    if (key === 'team' || key === 'displayStatus') {
      return false
    }

    return (
      newProject.value[key as keyof ProjectViewModel] !== (props.project ?? defaultNewProject)?.[key as keyof ProjectViewModel]
    )
  })
})

defineExpose({
  isFormHasUnsavedChanges,
})

const usersStore = useUsersStore()

watch(
  () => props.project,
  () => {
    if (!props.project) {
      newProject.value = { ...defaultNewProject }
      return
    }

    newProject.value = {
      ...props.project,
      created_by: props.project.created_by || undefined,
      team: props.project.team || [],
    }
  },
  { immediate: true },
)

const required = (v: string | SelectOption) => !!v || 'This field is required'
const emailRule = (v: string) => !v || /.+@.+\..+/.test(v) || 'Email must be valid'

const ownerFiltersSearch = ref('')
const teamFiltersSearch = ref('')

const addSkill = () => {
  if (newSkill.value.trim() && !newProject.value.required_skills?.includes(newSkill.value.trim())) {
    if (!newProject.value.required_skills) {
      newProject.value.required_skills = []
    }
    newProject.value.required_skills.push(newSkill.value.trim())
    newSkill.value = ''
  }
}

const removeSkill = (skill: string) => {
  if (newProject.value.required_skills) {
    newProject.value.required_skills = newProject.value.required_skills.filter(s => s !== skill)
  }
}

const fieldTypeIcons: Record<string, string> = {
  'Mühendislik': 'engineering',
  'Sağlık': 'medical_services',
  'Eğitim': 'school',
  'Teknoloji': 'computer',
  'Sanat': 'palette',
  'Bilim': 'science',
  'Other': 'category',
}
</script>

<template>
  <VaForm v-slot="{ validate }" class="flex flex-col gap-4">
    <!-- Basic Information Section -->
    <div class="space-y-4">
      <div class="flex items-center gap-2 pb-2 border-b-2 border-primary">
        <VaIcon name="info" color="primary" />
        <h3 class="text-lg font-semibold">Basic Information</h3>
      </div>
      
      <VaInput 
        v-model="newProject.title" 
        label="Project Title" 
        :rules="[required]"
        placeholder="Enter a descriptive project title"
      >
        <template #prependInner>
          <VaIcon name="title" size="small" color="secondary" />
        </template>
      </VaInput>
      
      <VaTextarea 
        v-model="newProject.description" 
        label="Description" 
        :rules="[required]"
        placeholder="Describe your project goals, objectives, and expected outcomes..."
        :min-rows="3"
        :max-rows="6"
        autosize
      />
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VaSelect
          v-model="newProject.field_type"
          label="Academic Field"
          :rules="[required]"
          :options="[
            { text: '🔧 Engineering', value: 'Mühendislik', icon: 'engineering' },
            { text: '⚕️ Health', value: 'Sağlık', icon: 'medical_services' },
            { text: '📚 Education', value: 'Eğitim', icon: 'school' },
            { text: '💻 Technology', value: 'Teknoloji', icon: 'computer' },
            { text: '🎨 Arts', value: 'Sanat', icon: 'palette' },
            { text: '🔬 Science', value: 'Bilim', icon: 'science' },
            { text: '📁 Other', value: 'Other', icon: 'category' },
          ]"
          value-by="value"
        >
          <template #prependInner>
            <VaIcon :name="fieldTypeIcons[newProject.field_type || 'Other']" size="small" />
          </template>
        </VaSelect>
        
        <VaSelect
          v-model="newProject.status"
          label="Project Status"
          :rules="[required]"
          :options="[
            { text: 'Active - Accepting Applications', value: 'active' },
            { text: 'Closed - Not Accepting', value: 'closed' },
            { text: 'Completed - Finished', value: 'completed' },
          ]"
          value-by="value"
        >
          <template #prependInner>
            <VaIcon name="schedule" size="small" color="secondary" />
          </template>
        </VaSelect>
      </div>
    </div>

    <VaDivider />

    <!-- Skills & Requirements Section -->
    <div class="space-y-4">
      <div class="flex items-center gap-2 pb-2 border-b-2 border-primary">
        <VaIcon name="psychology" color="primary" />
        <h3 class="text-lg font-semibold">Required Skills</h3>
      </div>
      
      <div class="flex gap-2">
        <VaInput 
          v-model="newSkill"
          placeholder="Add a skill (e.g., Python, Research, Analysis)"
          class="flex-1"
          @keyup.enter="addSkill"
        >
          <template #prependInner>
            <VaIcon name="add_circle" size="small" color="secondary" />
          </template>
        </VaInput>
        <VaButton @click="addSkill" icon="add" :disabled="!newSkill.trim()">
          Add Skill
        </VaButton>
      </div>
      
      <div v-if="newProject.required_skills && newProject.required_skills.length > 0" class="flex flex-wrap gap-2">
        <VaChip
          v-for="skill in newProject.required_skills"
          :key="skill"
          closeable
          color="primary"
          @update:model-value="removeSkill(skill)"
        >
          {{ skill }}
        </VaChip>
      </div>
      <div v-else class="text-sm text-secondary italic">
        No skills added yet. Add skills that are required for this project.
      </div>
    </div>

    <VaDivider />

    <!-- Timeline Section -->
    <div class="space-y-4">
      <div class="flex items-center gap-2 pb-2 border-b-2 border-primary">
        <VaIcon name="event" color="primary" />
        <h3 class="text-lg font-semibold">Timeline</h3>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VaInput
          v-model="newProject.start_date"
          type="date"
          label="Start Date"
        >
          <template #prependInner>
            <VaIcon name="event_available" size="small" color="success" />
          </template>
        </VaInput>
        
        <VaInput
          v-model="newProject.end_date"
          type="date"
          label="End Date"
        >
          <template #prependInner>
            <VaIcon name="event_busy" size="small" color="danger" />
          </template>
        </VaInput>
      </div>
    </div>

    <VaDivider />

    <!-- Contact & Team Section -->
    <div class="space-y-4">
      <div class="flex items-center gap-2 pb-2 border-b-2 border-primary">
        <VaIcon name="people" color="primary" />
        <h3 class="text-lg font-semibold">Contact & Team</h3>
      </div>
      
      <VaInput 
        v-model="newProject.contact_info" 
        label="Contact Information" 
        :rules="[required, emailRule]"
        placeholder="project-contact@example.com"
        type="email"
      >
        <template #prependInner>
          <VaIcon name="email" size="small" color="secondary" />
        </template>
      </VaInput>
      
      <VaSelect
        v-model="newProject.created_by"
        v-model:search="ownerFiltersSearch"
        searchable
        label="Project Owner"
        text-by="fullname"
        track-by="id"
        value-by="id"
        :rules="[required]"
        :options="usersStore.items"
        placeholder="Select project owner"
      >
        <template #prependInner>
          <VaIcon name="person" size="small" color="secondary" />
        </template>
        <template #content="{ value: user }">
          <div v-if="user" :key="user.id" class="flex items-center gap-2">
            <UserAvatar :user="user" size="24px" />
            <span>{{ user.fullname }}</span>
          </div>
        </template>
      </VaSelect>
      
      <VaSelect
        v-model="newProject.team"
        v-model:search="teamFiltersSearch"
        label="Team Members (Optional)"
        text-by="fullname"
        track-by="id"
        value-by="id"
        multiple
        :options="usersStore.items"
        :max-visible-options="bp.mdUp ? 3 : 1"
        placeholder="Select team members"
      >
        <template #prependInner>
          <VaIcon name="group" size="small" color="secondary" />
        </template>
        <template #content="{ valueArray }">
          <div v-if="valueArray?.length" class="flex flex-wrap gap-2">
            <div v-for="user in valueArray" :key="user.id" class="flex items-center gap-1 bg-backgroundElement rounded px-2 py-1">
              <UserAvatar :user="user" size="20px" />
              <span class="text-sm">{{ user.fullname }}</span>
            </div>
          </div>
        </template>
      </VaSelect>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end flex-col-reverse sm:flex-row mt-6 gap-3">
      <VaButton preset="secondary" size="large" @click="$emit('close')">
        <VaIcon name="close" class="mr-1" />
        Cancel
      </VaButton>
      <VaButton size="large" @click="validate() && $emit('save', newProject)">
        <VaIcon :name="props.project ? 'save' : 'add'" class="mr-1" />
        {{ saveButtonLabel }}
      </VaButton>
    </div>
  </VaForm>
</template>

<style lang="scss" scoped>
.va-select-content__autocomplete {
  flex: 1;
}

.va-input-wrapper__text {
  gap: 0.2rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.border-b-2 {
  border-bottom-width: 2px;
}

.border-primary {
  border-color: var(--va-primary);
}
</style>
