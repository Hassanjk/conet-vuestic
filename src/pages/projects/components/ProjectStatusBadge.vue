<script setup lang="ts">
import { PropType } from 'vue'
import { Project } from '../types'

defineProps({
  status: {
    type: String as PropType<Project['status']>,
    required: true,
  },
})

const badgeColorMap: Record<Project['status'], string> = {
  'in progress': 'primary',
  archived: 'secondary',
  completed: 'success',
  important: 'warning',
}
</script>

<template>
  <VaBadge v-if="$props.status" square :color="badgeColorMap[$props.status] || 'primary'" :text="$props.status.toUpperCase()" />
  <VaBadge v-else square color="secondary" text="UNKNOWN" />
</template>
