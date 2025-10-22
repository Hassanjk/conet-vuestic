<template>
  <h1 class="page-title">Profile</h1>
  <div class="flex flex-col space-y-6">
    <!-- LinkedIn-style Profile Header -->
    <PreferencesHeader @editProfile="isEditProfileModalOpen = true" />
    
    <!-- Profile Settings -->
    <div class="bg-backgroundSecondary rounded-lg p-6">
      <Settings
        @openNameModal="isEditNameModalOpen = true"
        @openResetPasswordModal="isResetPasswordModalOpen = true"
        @openProfileEdit="isEditProfileModalOpen = true"
      />
    </div>
  </div>

  <!-- Modals -->
  <EditNameModal v-if="isEditNameModalOpen" @cancel="isEditNameModalOpen = false" />
  <ResetPasswordModal v-if="isResetPasswordModalOpen" @cancel="isResetPasswordModalOpen = false" />
  <EditProfileModal v-if="isEditProfileModalOpen" @cancel="isEditProfileModalOpen = false" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import PreferencesHeader from './preferences-header/PreferencesHeader.vue'
import Settings from './settings/Settings.vue'
import EditNameModal from './modals/EditNameModal.vue'
import ResetPasswordModal from './modals/ResetPasswordModal.vue'
import EditProfileModal from './modals/EditProfileModal.vue'

const isEditNameModalOpen = ref(false)
const isResetPasswordModalOpen = ref(false)
const isEditProfileModalOpen = ref(false)
</script>
