<template>
  <VaModal
    :mobile-fullscreen="false"
    size="large"
    hide-default-actions
    max-width="700px"
    model-value
    close-button
    @update:modelValue="$emit('cancel')"
  >
    <h1 class="va-h5 mb-4">Edit Profile</h1>
    <VaForm ref="form" @submit.prevent="submit">
      <div class="space-y-4">
        <!-- Basic Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <VaInput
            v-model="formData.full_name"
            label="Full Name"
            placeholder="Enter your full name"
            class="md:col-span-2"
          />
          <VaInput v-model="formData.username" label="Username" placeholder="Enter username" />
          <VaInput v-model="formData.title" label="Professional Title" placeholder="e.g., Professor, Researcher" />
        </div>

        <VaTextarea v-model="formData.bio" label="Bio" placeholder="Tell us about yourself..." :max-rows="3" autosize />

        <!-- Professional Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <VaInput v-model="formData.institution" label="Institution" placeholder="Your institution" />
          <VaInput v-model="formData.department" label="Department" placeholder="Your department" />
          <VaInput v-model="formData.location" label="Location" placeholder="City, Country" />
          <VaInput v-model="formData.orcid_id" label="ORCID ID" placeholder="0000-0000-0000-0000" />
        </div>

        <!-- Links -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <VaInput v-model="formData.linkedin_url" label="LinkedIn URL" placeholder="https://linkedin.com/in/..." />
          <VaInput v-model="formData.website_url" label="Website URL" placeholder="https://yoursite.com" />
        </div>

        <!-- Collaboration -->
        <VaCheckbox
          v-model="formData.available_for_collaboration"
          label="Available for collaboration"
          text="Let others know you're open to collaboration"
        />
      </div>

      <div class="flex flex-col-reverse md:flex-row md:items-center md:justify-end md:space-x-4 mt-6">
        <VaButton preset="secondary" color="secondary" @click="$emit('cancel')">Cancel</VaButton>
        <VaButton :loading="isLoading" class="mb-4 md:mb-0" type="submit" @click="submit">Save</VaButton>
      </div>
    </VaForm>
  </VaModal>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '../../../stores/user-store'
import { useAuth } from '../../../composables/useAuth'
import { useToast } from 'vuestic-ui'
import type { ProfileUpdateRequest } from '../../../types/auth.types'

const store = useUserStore()
const { updateProfile } = useAuth()
const { init: notify } = useToast()

defineEmits(['cancel'])

const form = ref()
const isLoading = ref(false)

const formData = reactive<ProfileUpdateRequest>({
  full_name: '',
  username: '',
  title: '',
  bio: '',
  institution: '',
  department: '',
  location: '',
  orcid_id: '',
  linkedin_url: '',
  website_url: '',
  expertise_areas: [],
  skills: [],
  available_for_collaboration: true,
})

onMounted(() => {
  const user = store.currentUser
  if (user) {
    Object.assign(formData, {
      full_name: user.full_name || '',
      username: user.username || '',
      title: user.title || '',
      bio: user.bio || '',
      institution: user.institution || '',
      department: user.department || '',
      location: user.location || '',
      orcid_id: user.orcid_id || '',
      linkedin_url: user.linkedin_url || '',
      website_url: user.website_url || '',
      expertise_areas: [...(user.expertise_areas || [])],
      skills: [...(user.skills || [])],
      available_for_collaboration: user.available_for_collaboration ?? true,
    })
  }
})

const submit = async () => {
  isLoading.value = true

  try {
    await updateProfile(formData)
    notify({
      message: 'Profile updated successfully!',
      color: 'success',
    })
    $emit('cancel')
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to update profile',
      color: 'danger',
    })
  } finally {
    isLoading.value = false
  }
}
</script>
