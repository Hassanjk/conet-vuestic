<script setup lang="ts">
import { type PropType, inject } from 'vue'
import { type ProjectViewModel } from '../types'
import ProjectStatusBadge from '../components/ProjectStatusBadge.vue'

defineProps({
  projects: {
    type: Array as PropType<ProjectViewModel[]>,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
})

defineEmits<{
  (event: 'edit', project: ProjectViewModel): void
  (event: 'delete', project: ProjectViewModel): void
}>()

const { getUserById, getTeamOptions } = inject<any>('ProjectsPage')
</script>

<template>
  <VaInnerLoading
    v-if="projects.length > 0 || loading"
    :loading="loading"
    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[4rem]"
  >
    <VaCard
      v-for="project in projects"
      :key="project.id"
      :style="{ '--va-card-outlined-border': '1px solid var(--va-background-element)' }"
      outlined
    >
      <VaCardContent class="flex flex-col h-full">
        <div class="flex justify-between items-start mb-2">
          <VaBadge :text="project.field_type" color="primary" />
          <div class="text-[var(--va-secondary)] text-sm">{{ new Date(project.created_at).toLocaleDateString() }}</div>
        </div>
        <div class="flex flex-col items-center gap-4 grow">
          <h4 class="va-h4 text-center self-stretch overflow-hidden line-clamp-2 text-ellipsis">
            {{ project.title }}
          </h4>
          <p class="text-sm text-[var(--va-secondary)] line-clamp-2 text-center">
            {{ project.description }}
          </p>
          <p>
            <span class="text-[var(--va-secondary)]">Owner: </span>
            <span v-if="getUserById(project.project_owner)">{{ getUserById(project.project_owner)!.fullname }}</span>
          </p>
          <VaAvatarGroup class="my-4" :options="getTeamOptions(project.team)" :max="5" />
          <ProjectStatusBadge :status="project.displayStatus" />
        </div>
        <VaDivider class="my-6" />
        <div class="flex justify-between">
          <VaButton preset="secondary" icon="mso-edit" color="secondary" @click="$emit('edit', project)" />
          <VaButton preset="secondary" icon="mso-delete" color="danger" @click="$emit('delete', project)" />
        </div>
      </VaCardContent>
    </VaCard>
  </VaInnerLoading>
  <div v-else class="p-4 flex justify-center items-center text-[var(--va-secondary)]">No projects</div>
</template>
