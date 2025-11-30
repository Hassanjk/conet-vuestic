<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { PublicProjectDisplay } from '../../../types/projects.types'
import ApplicationModal from './ApplicationModal.vue'

const props = defineProps<{
  project: PublicProjectDisplay
  listMode?: boolean
}>()

const emit = defineEmits<{
  'application-submitted': []
  'refresh-needed': []
}>()

const router = useRouter()
const showApplicationModal = ref(false)

const viewProject = () => {
  router.push(`/projects/${props.project.id}`)
}

const sendMessage = () => {
  // TODO: Open messaging modal
  console.log('Send message to project owner:', props.project.owner.id)
}

const toggleFavorite = () => {
  // TODO: Implement favorite toggle
  console.log('Toggle favorite for project:', props.project.id)
}

const applyToProject = () => {
  showApplicationModal.value = true
}

const handleApplicationSubmitted = () => {
  emit('application-submitted')
  emit('refresh-needed')
}

const fieldTypeColor = computed(() => {
  const colors: Record<string, string> = {
    'Mühendislik': 'primary',
    'Sağlık': 'danger',
    'Eğitim': 'info',
    'Teknoloji': 'success',
    'Sanat': 'warning',
    'Bilim': 'primary',
    'Other': 'secondary',
  }
  return colors[props.project.field_type] || 'secondary'
})

const ownerInitials = computed(() => {
  const fullName = props.project.owner?.full_name
  if (!fullName) return '?'
  
  return fullName
    .split(' ')
    .filter(n => n.length > 0)
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?'
})

const applicationStatusText = computed(() => {
  const status = props.project.user_status.application_status
  const texts: Record<string, string> = {
    pending: 'Başvuru Beklemede',
    accepted: 'Başvuru Kabul Edildi',
    rejected: 'Başvuru Reddedildi',
    withdrawn: 'Başvuru Geri Çekildi',
  }
  return status ? texts[status] : null
})

const applicationStatusColor = computed(() => {
  const status = props.project.user_status.application_status
  const colors: Record<string, string> = {
    pending: 'warning',
    accepted: 'success',
    rejected: 'danger',
    withdrawn: 'secondary',
  }
  return status ? colors[status] : 'primary'
})
</script>

<template>
  <VaCard
    :class="{ 'list-card': listMode }"
    class="project-card"
    hover
  >
    <VaCardContent>
      <div :class="listMode ? 'flex gap-4' : 'flex flex-col'">
        <!-- Main Content -->
        <div class="flex-1">
          <!-- Header -->
          <div class="flex justify-between items-start mb-3">
            <div class="flex-1">
              <h3 class="va-h5 mb-1 line-clamp-2 cursor-pointer hover:text-primary" @click="viewProject">
                {{ project.title }}
              </h3>
              <div class="flex items-center gap-2 text-sm text-secondary">
                <VaAvatar
                  v-if="project.owner.avatar_url"
                  :src="project.owner.avatar_url"
                  size="small"
                />
                <VaAvatar v-else size="small" color="secondary">
                  {{ ownerInitials }}
                </VaAvatar>
                <span>{{ project.owner.full_name }}</span>
                <span v-if="project.owner.institution" class="flex items-center gap-1">
                  <VaIcon name="business" size="small" />
                  {{ project.owner.institution }}
                </span>
              </div>
            </div>
            
            <!-- Favorite Star -->
            <VaButton
              preset="plain"
              :icon="project.user_status.is_favorited ? 'star' : 'star_outline'"
              :color="project.user_status.is_favorited ? 'warning' : 'secondary'"
              size="small"
              @click.stop="toggleFavorite"
            />
          </div>

          <!-- Description -->
          <p class="text-sm mb-3 line-clamp-3">
            {{ project.description }}
          </p>

          <!-- Field Type & Skills -->
          <div class="flex flex-wrap gap-2 mb-3">
            <VaBadge :text="project.field_type" :color="fieldTypeColor" />
            <VaBadge
              v-for="skill in project.required_skills.slice(0, 3)"
              :key="skill"
              :text="skill"
              color="secondary"
            />
            <VaBadge
              v-if="project.required_skills.length > 3"
              :text="`+${project.required_skills.length - 3}`"
              color="secondary"
            />
          </div>

          <!-- Stats -->
          <div class="flex flex-wrap gap-4 text-sm text-secondary mb-3">
            <div class="flex items-center gap-1">
              <VaIcon name="people" size="small" />
              <span>{{ project.stats.participants_count }} katılımcı</span>
            </div>
            <div class="flex items-center gap-1">
              <VaIcon name="description" size="small" />
              <span>{{ project.stats.applications_count }} başvuru</span>
            </div>
            <div class="flex items-center gap-1">
              <VaIcon name="star" size="small" />
              <span>{{ project.stats.favorites_count }} favori</span>
            </div>
            <div v-if="project.stats.average_rating" class="flex items-center gap-1">
              <VaIcon name="grade" size="small" color="warning" />
              <span>{{ project.stats.average_rating.toFixed(1) }}</span>
            </div>
          </div>

          <!-- Application Status Badge -->
          <div v-if="applicationStatusText" class="mb-3">
            <VaChip :color="applicationStatusColor" size="small">
              <VaIcon name="info" size="small" class="mr-1" />
              {{ applicationStatusText }}
            </VaChip>
          </div>
        </div>

        <!-- Action Buttons -->
        <div :class="listMode ? 'flex flex-col gap-2 min-w-[200px]' : 'grid grid-cols-2 gap-2'">
          <VaButton
            preset="secondary"
            size="small"
            @click="viewProject"
          >
            <VaIcon name="visibility" size="small" class="mr-1" />
            İlanı İncele
          </VaButton>

          <VaButton
            preset="secondary"
            size="small"
            @click="sendMessage"
          >
            <VaIcon name="message" size="small" class="mr-1" />
            Mesajlaş
          </VaButton>

          <VaButton
            :color="project.user_status.is_favorited ? 'warning' : 'secondary'"
            :preset="project.user_status.is_favorited ? 'default' : 'secondary'"
            size="small"
            @click="toggleFavorite"
          >
            <VaIcon :name="project.user_status.is_favorited ? 'star' : 'star_outline'" size="small" class="mr-1" />
            {{ project.user_status.is_favorited ? 'Favoride' : 'Favorile' }}
          </VaButton>

          <VaButton
            color="primary"
            size="small"
            :disabled="project.user_status.has_applied || project.status !== 'active'"
            @click="applyToProject"
          >
            <VaIcon name="send" size="small" class="mr-1" />
            {{ project.user_status.has_applied ? 'Başvuruldu' : 'Ortaklık Gönder' }}
          </VaButton>
        </div>
      </div>
    </VaCardContent>

    <!-- Application Modal -->
    <ApplicationModal
      v-model="showApplicationModal"
      :project="project"
      @application-submitted="handleApplicationSubmitted"
    />
  </VaCard>
</template>

<style scoped>
.project-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.list-card {
  margin-bottom: 1rem;
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
