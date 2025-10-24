<template>
  <section class="flex flex-col gap-4">
    <!-- Profile Information Card -->
    <VaCard>
      <VaCardTitle class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <VaIcon name="mso-person" />
          <h1 class="card-title text-secondary font-bold uppercase">Profile Information</h1>
        </div>
        <VaButton preset="outline" icon="mso-edit" size="small" @click="$emit('openProfileEdit')">
          Edit Profile
        </VaButton>
      </VaCardTitle>
      <VaCardContent>
        <div class="grid md:grid-cols-2 grid-cols-1 gap-4">
          <!-- Full Name -->
          <div
            class="min-h-[114px] p-4 rounded-lg border border-dashed border-backgroundBorder flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <div class="flex flex-col gap-2 flex-grow">
              <div class="text-lg font-bold">Full Name</div>
              <div class="text-secondary">{{ store.currentUser?.full_name || store.userName || 'Not specified' }}</div>
            </div>
          </div>

          <!-- Username -->
          <div
            class="min-h-[114px] p-4 rounded-lg border border-dashed border-backgroundBorder flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <div class="flex flex-col gap-2 flex-grow">
              <div class="text-lg font-bold">Username</div>
              <div class="text-secondary">{{ store.currentUser?.username || 'Not specified' }}</div>
            </div>
          </div>

          <!-- Professional Title -->
          <div
            class="min-h-[114px] p-4 rounded-lg border border-dashed border-backgroundBorder flex flex-col sm:flex-row items-start sm:items-center gap-6 md:col-span-2"
          >
            <div class="flex flex-col gap-2 flex-grow">
              <div class="text-lg font-bold">Professional Title</div>
              <div class="text-secondary">{{ store.currentUser?.title || 'Not specified' }}</div>
            </div>
          </div>

          <!-- Bio -->
          <div
            class="min-h-[114px] p-4 rounded-lg border border-dashed border-backgroundBorder flex flex-col sm:flex-row items-start sm:items-center gap-6 md:col-span-2"
          >
            <div class="flex flex-col gap-2 flex-grow">
              <div class="text-lg font-bold">Bio</div>
              <div class="text-secondary italic">{{ store.currentUser?.bio || 'No bio added yet' }}</div>
            </div>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Professional Information Card -->
    <VaCard>
      <VaCardTitle>
        <div class="flex items-center gap-3">
          <VaIcon name="mso-work" />
          <h1 class="card-title text-secondary font-bold uppercase">Professional Information</h1>
        </div>
      </VaCardTitle>
      <VaCardContent>
        <div class="grid md:grid-cols-2 grid-cols-1 gap-4">
          <!-- Institution -->
          <div
            class="min-h-[114px] p-4 rounded-lg border border-dashed border-backgroundBorder flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <div class="flex flex-col gap-2 flex-grow">
              <div class="text-lg font-bold">Institution</div>
              <div class="text-secondary">{{ store.currentUser?.institution || 'Not specified' }}</div>
            </div>
          </div>

          <!-- Department -->
          <div
            class="min-h-[114px] p-4 rounded-lg border border-dashed border-backgroundBorder flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <div class="flex flex-col gap-2 flex-grow">
              <div class="text-lg font-bold">Department</div>
              <div class="text-secondary">{{ store.currentUser?.department || 'Not specified' }}</div>
            </div>
          </div>

          <!-- Location -->
          <div
            class="min-h-[114px] p-4 rounded-lg border border-dashed border-backgroundBorder flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <div class="flex flex-col gap-2 flex-grow">
              <div class="text-lg font-bold">Location</div>
              <div class="text-secondary">{{ store.currentUser?.location || 'Not specified' }}</div>
            </div>
          </div>

          <!-- Role -->
          <div
            class="min-h-[114px] p-4 rounded-lg border border-dashed border-backgroundBorder flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <div class="flex flex-col gap-2 flex-grow">
              <div class="text-lg font-bold">Role</div>
              <div class="text-secondary">
                <VaBadge v-if="userRole" :text="userRole" color="primary" />
                <span v-else>Not assigned</span>
              </div>
            </div>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Skills & Expertise Card -->
    <VaCard>
      <VaCardTitle>
        <div class="flex items-center gap-3">
          <VaIcon name="mso-psychology" />
          <h1 class="card-title text-secondary font-bold uppercase">Skills & Expertise</h1>
        </div>
      </VaCardTitle>
      <VaCardContent>
        <div class="grid md:grid-cols-2 grid-cols-1 gap-4">
          <template v-if="store.currentUser?.expertise_areas?.length || store.currentUser?.skills?.length">
            <!-- Expertise Areas -->
            <div
              v-if="store.currentUser?.expertise_areas?.length"
              class="min-h-[114px] p-4 rounded-lg border border-dashed border-backgroundBorder flex flex-col sm:flex-row items-start sm:items-center gap-6 md:col-span-2"
            >
              <div class="flex flex-col gap-2 flex-grow">
                <div class="text-lg font-bold">Expertise Areas</div>
                <div class="flex flex-wrap gap-2">
                  <VaChip v-for="area in store.currentUser.expertise_areas" :key="area" color="success" size="small">
                    {{ area }}
                  </VaChip>
                </div>
              </div>
            </div>

            <!-- Skills -->
            <div
              v-if="store.currentUser?.skills?.length"
              class="min-h-[114px] p-4 rounded-lg border border-dashed border-backgroundBorder flex flex-col sm:flex-row items-start sm:items-center gap-6 md:col-span-2"
            >
              <div class="flex flex-col gap-2 flex-grow">
                <div class="text-lg font-bold">Skills</div>
                <div class="flex flex-wrap gap-2">
                  <VaChip v-for="skill in store.currentUser.skills" :key="skill" color="info" size="small">
                    {{ skill }}
                  </VaChip>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <div
              class="sm:min-h-[114px] p-4 rounded-lg border border-dashed border-primary flex flex-col sm:flex-row items-start sm:items-center gap-4 md:col-span-2"
              :style="{ backgroundColor: colorToRgba(getColor('primary'), 0.07) }"
            >
              <div class="flex flex-col gap-2 flex-grow">
                <div class="text-lg font-bold leading-relaxed">No skills added yet</div>
                <div class="text-secondary text-sm leading-tight">
                  Add your expertise areas and skills to showcase your professional background
                </div>
              </div>
              <VaButton class="flex-none w-full sm:w-auto" @click="$emit('openProfileEdit')">Add Skills</VaButton>
            </div>
          </template>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Links & Contact Card -->
    <VaCard>
      <VaCardTitle>
        <div class="flex items-center gap-3">
          <VaIcon name="mso-link" />
          <h1 class="card-title text-secondary font-bold uppercase">Links & Contact</h1>
        </div>
      </VaCardTitle>
      <VaCardContent>
        <div class="grid md:grid-cols-2 grid-cols-1 gap-4">
          <!-- Email -->
          <div
            class="min-h-[114px] p-4 rounded-lg border border-dashed border-backgroundBorder flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <div class="flex flex-col gap-2 flex-grow">
              <div class="flex items-center">
                <div class="text-lg font-bold">Email</div>
                <VaBadge
                  v-if="store.currentUser?.status"
                  :text="store.currentUser.status"
                  :color="store.currentUser.status === 'ONLINE' ? 'success' : 'secondary'"
                  class="ml-2"
                />
              </div>
              <div class="text-secondary">{{ store.email }}</div>
            </div>
          </div>

          <!-- LinkedIn -->
          <div
            v-if="store.currentUser?.linkedin_url"
            class="min-h-[114px] p-4 rounded-lg border border-dashed border-backgroundBorder flex flex-col sm:flex-row items-start sm:items-center gap-6 cursor-pointer hover:bg-gray-50"
            @click="openExternalLink(store.currentUser.linkedin_url)"
          >
            <div class="flex flex-col gap-2 flex-grow">
              <div class="text-lg font-bold">LinkedIn Profile</div>
              <div class="text-secondary">View LinkedIn Profile</div>
            </div>
            <div class="w-full sm:w-auto flex-none flex sm:block">
              <VaButton preset="primary" icon="mso-open_in_new">Visit</VaButton>
            </div>
          </div>

          <!-- Website -->
          <div
            v-if="store.currentUser?.website_url"
            class="min-h-[114px] p-4 rounded-lg border border-dashed border-backgroundBorder flex flex-col sm:flex-row items-start sm:items-center gap-6 cursor-pointer hover:bg-gray-50"
            @click="openExternalLink(store.currentUser.website_url)"
          >
            <div class="flex flex-col gap-2 flex-grow">
              <div class="text-lg font-bold">Website</div>
              <div class="text-secondary">Visit personal website</div>
            </div>
            <div class="w-full sm:w-auto flex-none flex sm:block">
              <VaButton preset="primary" icon="mso-open_in_new">Visit</VaButton>
            </div>
          </div>

          <!-- ORCID -->
          <div
            v-if="store.currentUser?.orcid_id"
            class="min-h-[114px] p-4 rounded-lg border border-dashed border-backgroundBorder flex flex-col sm:flex-row items-start sm:items-center gap-6 cursor-pointer hover:bg-gray-50"
            @click="openExternalLink(`https://orcid.org/${store.currentUser.orcid_id}`)"
          >
            <div class="flex flex-col gap-2 flex-grow">
              <div class="text-lg font-bold">ORCID ID</div>
              <div class="text-secondary">{{ store.currentUser.orcid_id }}</div>
            </div>
            <div class="w-full sm:w-auto flex-none flex sm:block">
              <VaButton preset="primary" icon="mso-open_in_new">Visit</VaButton>
            </div>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Account Settings Card -->
    <VaCard>
      <VaCardTitle>
        <div class="flex items-center gap-3">
          <VaIcon name="mso-settings" />
          <h1 class="card-title text-secondary font-bold uppercase">Account Settings</h1>
        </div>
      </VaCardTitle>
      <VaCardContent>
        <div class="grid md:grid-cols-2 grid-cols-1 gap-4">
          <!-- Password -->
          <div
            class="min-h-[114px] p-4 rounded-lg border border-dashed border-backgroundBorder flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <div class="flex flex-col gap-2 flex-grow">
              <div class="text-lg font-bold">Password</div>
              <div class="text-secondary">Last updated recently</div>
            </div>
            <div class="w-full sm:w-auto flex-none flex sm:block">
              <VaButton preset="primary" @click="$emit('openResetPasswordModal')">Change</VaButton>
            </div>
          </div>

          <!-- Two-Factor Authentication -->
          <div
            class="min-h-[114px] p-4 rounded-lg border border-dashed border-backgroundBorder flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <div class="flex flex-col gap-2 flex-grow">
              <div class="text-lg font-bold">Two-Factor Authentication</div>
              <div class="text-secondary">{{ twoFA.content }}</div>
            </div>
            <div class="w-full sm:w-auto flex-none flex sm:block">
              <VaButton preset="primary" :color="twoFA.color" @click="toggle2FA">{{ twoFA.button }}</VaButton>
            </div>
          </div>

          <!-- Collaboration Status -->
          <div
            class="min-h-[114px] p-4 rounded-lg border border-dashed border-backgroundBorder flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <div class="flex flex-col gap-2 flex-grow">
              <div class="flex items-center">
                <div class="text-lg font-bold">Collaboration Status</div>
                <VaBadge
                  :text="store.currentUser?.available_for_collaboration ? 'Available' : 'Unavailable'"
                  :color="store.currentUser?.available_for_collaboration ? 'success' : 'secondary'"
                  class="ml-2"
                />
              </div>
              <div class="text-secondary">
                {{
                  store.currentUser?.available_for_collaboration
                    ? 'Available for collaboration'
                    : 'Not available for collaboration'
                }}
              </div>
            </div>
          </div>

          <!-- Email Subscriptions -->
          <div
            class="min-h-[114px] p-4 rounded-lg border border-dashed border-backgroundBorder flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <div class="flex flex-col gap-2 flex-grow">
              <div class="text-lg font-bold">Email Subscriptions</div>
              <div class="text-secondary">Manage your notification preferences</div>
            </div>
            <div class="w-full sm:w-auto flex-none flex sm:block">
              <VaButton preset="primary" :to="{ name: 'settings' }">Manage</VaButton>
            </div>
          </div>
        </div>
      </VaCardContent>
    </VaCard>
  </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useToast, useColors } from 'vuestic-ui'
import { useUserStore } from '../../../stores/user-store'

const store = useUserStore()
const { init } = useToast()
const { getColor, colorToRgba } = useColors()

defineEmits(['openNameModal', 'openResetPasswordModal', 'openProfileEdit'])

const toastMessage = computed(() => (store.is2FAEnabled ? '2FA successfully enabled' : '2FA successfully disabled'))

const userRole = computed(() => {
  if (store.userRoles?.length > 0) {
    return store.userRoles[0].charAt(0).toUpperCase() + store.userRoles[0].slice(1)
  }
  return null
})

const twoFA = computed(() => {
  if (store.is2FAEnabled) {
    return {
      color: 'danger',
      button: 'Disable 2FA',
      content: 'Two-Factor Authentication (2FA) is now enabled for your account, adding an extra layer of security.',
    }
  } else {
    return {
      color: 'primary',
      button: 'Set up 2FA',
      content: 'Add an extra layer of security to your account with two-factor authentication.',
    }
  }
})

const toggle2FA = () => {
  store.toggle2FA()
  init({ message: toastMessage.value, color: 'success' })
}

const openExternalLink = (url: string) => {
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}
</script>
