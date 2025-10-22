<template>
  <!-- LinkedIn-style Profile Header -->
  <div class="w-full">
    <!-- Cover Photo Section -->
    <div class="relative header-gradient h-32 md:h-40 rounded-t-lg">
      <VaButton
        preset="plain"
        icon="mso-photo_camera"
        class="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20"
        @click="editCoverPhoto"
      />
    </div>

    <!-- Profile Info Section -->
    <div class="relative bg-white dark:bg-backgroundSecondary px-6 pb-6 rounded-b-lg">
      <!-- Avatar positioned over the cover -->
      <div class="relative -top-12 mb-[-48px] flex items-end justify-between">
        <div class="relative">
          <VaAvatar
            :src="store.currentUser?.avatar_url"
            size="96px"
            color="warning"
            class="border-4 border-white dark:border-backgroundSecondary"
          >
            <span v-if="!store.currentUser?.avatar_url" class="text-4xl">{{ userInitials }}</span>
          </VaAvatar>
          <VaButton
            preset="plain"
            icon="mso-photo_camera"
            size="small"
            class="absolute bottom-0 right-0 bg-white dark:bg-backgroundSecondary text-primary border border-gray-300 rounded-full"
            @click="editAvatar"
          />
        </div>
        <VaButton preset="outline" icon="mso-edit" class="mt-12" @click="$emit('editProfile')"> Edit Profile </VaButton>
      </div>

      <!-- Profile Details -->
      <div class="space-y-2">
        <div class="flex items-center space-x-2">
          <h1 class="text-2xl md:text-3xl font-bold">
            {{ store.currentUser?.full_name || store.userName }}
          </h1>
          <VaBadge v-if="store.currentUser?.status === 'ONLINE'" text="Online" color="success" class="text-xs" />
        </div>

        <p v-if="store.currentUser?.title" class="text-lg text-gray-600 dark:text-gray-300">
          {{ store.currentUser.title }}
          <span v-if="store.currentUser.institution">at {{ store.currentUser.institution }}</span>
        </p>

        <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span v-if="store.currentUser?.location" class="flex items-center">
            <VaIcon name="mso-location_on" size="16px" class="mr-1" />
            {{ store.currentUser.location }}
          </span>
          <span class="flex items-center">
            <VaIcon name="mso-calendar_today" size="16px" class="mr-1" />
            Member since {{ store.memberSince }}
          </span>
          <span v-if="userRole" class="flex items-center">
            <VaIcon name="mso-work" size="16px" class="mr-1" />
            {{ userRole }}
          </span>
        </div>

        <p v-if="store.currentUser?.bio" class="text-gray-700 dark:text-gray-300 mt-3 max-w-2xl">
          {{ store.currentUser.bio }}
        </p>

        <!-- Quick Links -->
        <div class="flex flex-wrap gap-2 mt-4">
          <VaButton
            v-if="store.currentUser?.linkedin_url"
            preset="outline"
            size="small"
            icon="mso-link"
            @click="openExternalLink(store.currentUser.linkedin_url)"
          >
            LinkedIn
          </VaButton>
          <VaButton
            v-if="store.currentUser?.website_url"
            preset="outline"
            size="small"
            icon="mso-language"
            @click="openExternalLink(store.currentUser.website_url)"
          >
            Website
          </VaButton>
          <VaButton
            v-if="store.currentUser?.orcid_id"
            preset="outline"
            size="small"
            icon="mso-badge"
            @click="openExternalLink(`https://orcid.org/${store.currentUser.orcid_id}`)"
          >
            ORCID
          </VaButton>
        </div>

        <!-- Skills & Expertise Preview -->
        <div v-if="store.currentUser?.skills?.length || store.currentUser?.expertise_areas?.length" class="mt-4">
          <div v-if="store.currentUser?.expertise_areas?.length" class="mb-2">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Expertise Areas:</p>
            <div class="flex flex-wrap gap-1">
              <VaChip
                v-for="area in store.currentUser.expertise_areas.slice(0, 3)"
                :key="area"
                size="small"
                color="primary"
                variant="outline"
              >
                {{ area }}
              </VaChip>
              <VaChip
                v-if="store.currentUser.expertise_areas.length > 3"
                size="small"
                color="secondary"
                variant="outline"
              >
                +{{ store.currentUser.expertise_areas.length - 3 }} more
              </VaChip>
            </div>
          </div>

          <div v-if="store.currentUser?.skills?.length" class="mb-2">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Top Skills:</p>
            <div class="flex flex-wrap gap-1">
              <VaChip
                v-for="skill in store.currentUser.skills.slice(0, 4)"
                :key="skill"
                size="small"
                color="info"
                variant="outline"
              >
                {{ skill }}
              </VaChip>
              <VaChip v-if="store.currentUser.skills.length > 4" size="small" color="secondary" variant="outline">
                +{{ store.currentUser.skills.length - 4 }} more
              </VaChip>
            </div>
          </div>
        </div>

        <!-- Collaboration Status -->
        <div v-if="store.currentUser?.available_for_collaboration" class="mt-4">
          <VaBadge text="Available for Collaboration" color="success" variant="outline" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useUserStore } from '../../../stores/user-store'

const store = useUserStore()

defineEmits(['editProfile'])

const userInitials = computed(() => {
  const name = store.currentUser?.full_name || store.userName || store.currentUser?.email || ''
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const userRole = computed(() => {
  if (store.userRoles?.length > 0) {
    return store.userRoles[0].charAt(0).toUpperCase() + store.userRoles[0].slice(1)
  }
  return null
})

const editAvatar = () => {
  // TODO: Implement avatar upload
  console.log('Edit avatar clicked')
}

const editCoverPhoto = () => {
  // TODO: Implement cover photo upload
  console.log('Edit cover photo clicked')
}

const openExternalLink = (url: string) => {
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}
</script>

<style lang="scss" scoped>
.header-gradient {
  background: linear-gradient(135deg, #2c3e50 0%, #4a6741 100%);
}
</style>
