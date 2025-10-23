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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Full Name -->
          <div>
            <p class="text-sm font-semibold text-secondary mb-1">Full Name</p>
            <p class="text-base">{{ store.currentUser?.full_name || store.userName || 'Not specified' }}</p>
          </div>
          
          <!-- Username -->
          <div>
            <p class="text-sm font-semibold text-secondary mb-1">Username</p>
            <p class="text-base">{{ store.currentUser?.username || 'Not specified' }}</p>
          </div>
          
          <!-- Professional Title -->
          <div class="md:col-span-2">
            <p class="text-sm font-semibold text-secondary mb-1">Professional Title</p>
            <p class="text-base">{{ store.currentUser?.title || 'Not specified' }}</p>
          </div>
          
          <!-- Bio -->
          <div class="md:col-span-2">
            <p class="text-sm font-semibold text-secondary mb-1">Bio</p>
            <p class="text-base italic">{{ store.currentUser?.bio || 'No bio added yet' }}</p>
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p class="text-sm font-semibold text-secondary mb-1">Institution</p>
            <p class="text-base">{{ store.currentUser?.institution || 'Not specified' }}</p>
          </div>
          
          <div>
            <p class="text-sm font-semibold text-secondary mb-1">Department</p>
            <p class="text-base">{{ store.currentUser?.department || 'Not specified' }}</p>
          </div>
          
          <div>
            <p class="text-sm font-semibold text-secondary mb-1">Location</p>
            <p class="text-base">{{ store.currentUser?.location || 'Not specified' }}</p>
          </div>
          
          <div>
            <p class="text-sm font-semibold text-secondary mb-1">Role</p>
            <VaBadge v-if="userRole" :text="userRole" color="primary" />
            <span v-else class="text-base">Not assigned</span>
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
        <div v-if="store.currentUser?.expertise_areas?.length || store.currentUser?.skills?.length">
          <!-- Expertise Areas -->
          <div v-if="store.currentUser?.expertise_areas?.length" class="mb-6">
            <p class="text-sm font-semibold text-secondary mb-3">Expertise Areas</p>
            <div class="flex flex-wrap gap-2">
              <VaChip
                v-for="area in store.currentUser.expertise_areas"
                :key="area"
                color="success"
              >
                {{ area }}
              </VaChip>
            </div>
          </div>
          
          <!-- Skills -->
          <div v-if="store.currentUser?.skills?.length">
            <p class="text-sm font-semibold text-secondary mb-3">Skills</p>
            <div class="flex flex-wrap gap-2">
              <VaChip
                v-for="skill in store.currentUser.skills"
                :key="skill"
                color="info"
              >
                {{ skill }}
              </VaChip>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8">
          <VaIcon name="mso-lightbulb_outline" size="48px" class="text-secondary mb-4" />
          <p class="text-secondary mb-4">No skills or expertise areas added yet</p>
          <VaButton preset="outline" size="small" @click="$emit('openProfileEdit')">Add Skills</VaButton>
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
        <div class="grid grid-cols-1 gap-6">
          <!-- Email -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <VaIcon name="mso-email" />
              <div>
                <p class="text-sm font-semibold text-secondary">Email</p>
                <p class="text-base">{{ store.email }}</p>
              </div>
            </div>
            <VaBadge 
              :text="store.currentUser?.status || 'OFFLINE'" 
              :color="store.currentUser?.status === 'ONLINE' ? 'success' : 'secondary'"
            />
          </div>
          
          <!-- LinkedIn -->
          <div v-if="store.currentUser?.linkedin_url" class="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded" @click="openExternalLink(store.currentUser.linkedin_url)">
            <div class="flex items-center gap-3">
              <VaIcon name="mso-link" color="info" />
              <div>
                <p class="text-sm font-semibold text-secondary">LinkedIn</p>
                <p class="text-base">View LinkedIn Profile</p>
              </div>
            </div>
            <VaIcon name="mso-open_in_new" size="16px" class="text-secondary" />
          </div>
          
          <!-- Website -->
          <div v-if="store.currentUser?.website_url" class="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded" @click="openExternalLink(store.currentUser.website_url)">
            <div class="flex items-center gap-3">
              <VaIcon name="mso-language" color="primary" />
              <div>
                <p class="text-sm font-semibold text-secondary">Website</p>
                <p class="text-base">Visit Website</p>
              </div>
            </div>
            <VaIcon name="mso-open_in_new" size="16px" class="text-secondary" />
          </div>
          
          <!-- ORCID -->
          <div v-if="store.currentUser?.orcid_id" class="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded" @click="openExternalLink(`https://orcid.org/${store.currentUser.orcid_id}`)">
            <div class="flex items-center gap-3">
              <VaIcon name="mso-badge" color="warning" />
              <div>
                <p class="text-sm font-semibold text-secondary">ORCID</p>
                <p class="text-base">{{ store.currentUser.orcid_id }}</p>
              </div>
            </div>
            <VaIcon name="mso-open_in_new" size="16px" class="text-secondary" />
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
        <div class="space-y-6">
          <!-- Password -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <VaIcon name="mso-lock" />
              <div>
                <p class="text-base font-semibold">Password</p>
                <p class="text-sm text-secondary">Last updated recently</p>
              </div>
            </div>
            <VaButton preset="outline" @click="$emit('openResetPasswordModal')">Change Password</VaButton>
          </div>

          <VaDivider />

          <!-- Two-Factor Authentication -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <VaIcon name="mso-security" />
              <div>
                <p class="text-base font-semibold">Two-factor authentication</p>
                <p class="text-sm text-secondary">{{ twoFA.content }}</p>
              </div>
            </div>
            <VaButton preset="outline" :color="twoFA.color" @click="toggle2FA">{{ twoFA.button }}</VaButton>
          </div>

          <VaDivider />

          <!-- Collaboration Status -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <VaIcon name="mso-people" />
              <div>
                <p class="text-base font-semibold">Collaboration Status</p>
                <p class="text-sm text-secondary">
                  {{ store.currentUser?.available_for_collaboration ? 'Available for collaboration' : 'Not available for collaboration' }}
                </p>
              </div>
            </div>
            <VaBadge
              :text="store.currentUser?.available_for_collaboration ? 'Available' : 'Unavailable'"
              :color="store.currentUser?.available_for_collaboration ? 'success' : 'secondary'"
            />
          </div>

          <VaDivider />

          <!-- Email Subscriptions -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <VaIcon name="mso-notifications" />
              <div>
                <p class="text-base font-semibold">Email subscriptions</p>
                <p class="text-sm text-secondary">Manage your notification preferences</p>
              </div>
            </div>
            <VaButton preset="outline" :to="{ name: 'settings' }">Manage</VaButton>
          </div>
        </div>
      </VaCardContent>
    </VaCard>
  </section>
</template>
<script lang="ts" setup>
import { computed } from 'vue'
import { useToast } from 'vuestic-ui'
import { useUserStore } from '../../../stores/user-store'

const store = useUserStore()
const { init } = useToast()

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
    }
</script>
  
  // Edit button styling for card headers
  .edit-btn {
    --va-button-border-radius: 20px;
    --va-button-background-color: rgba(255, 255, 255, 0.15);
    --va-button-border-color: rgba(255, 255, 255, 0.3);
    --va-button-color: white;
    backdrop-filter: blur(10px);
    font-size: 12px;
    padding: 6px 12px;
    
    &:hover {
      --va-button-background-color: rgba(255, 255, 255, 0.25);
      transform: translateY(-1px);
      transition: all 0.2s ease;
    }
  }
  
  // Simple profile grid
  .simple-profile-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    padding: 8px;
  }
  
  .simple-field {
    &.simple-field-full {
      grid-column: 1 / -1;
    }
  }
  
  .simple-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .simple-value {
    font-size: 16px;
    font-weight: 500;
    color: #1e293b;
    line-height: 1.4;
    padding-bottom: 16px;
    border-bottom: 1px solid #e2e8f0;
    
    &.simple-bio {
      font-style: italic;
      color: #475569;
      line-height: 1.6;
    }
    
    &:empty::after {
      content: 'Not specified';
      color: #94a3b8;
      font-style: italic;
    }
  }
  
  // Professional grid
  .professional-grid {
    display: grid;
    gap: 16px;
  }
  
  .info-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 12px;
    border-left: 4px solid #4a6741;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(74, 103, 65, 0.2);
    }
  }
  
  .info-icon {
    --va-icon-size: 24px;
    color: #4a6741;
    background: rgba(74, 103, 65, 0.1);
    padding: 8px;
    border-radius: 50%;
  }
  
  .info-content {
    flex: 1;
  }
  
  .info-label {
    font-size: 12px;
    font-weight: 600;
    color: #4a6741;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  
  .info-value {
    font-size: 16px;
    font-weight: 500;
    color: #333;
  }
  
  .role-badge {
    --va-badge-border-radius: 20px;
    --va-badge-font-weight: 600;
  }
  
  // Skills styling
  .skills-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .skill-section {
    padding: 16px;
    background: #f8fafc;
    border-radius: 12px;
    border-left: 4px solid #4a6741;
  }
  
  .skill-section-title {
    font-size: 14px;
    font-weight: 600;
    color: #4a6741;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
  }
  
  .chip-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .expertise-chip, .skill-chip {
    --va-chip-border-radius: 20px;
    --va-chip-font-weight: 500;
    transform: perspective(1px) translateZ(0);
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
  
  // Empty skills state
  .empty-skills {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 40px 20px;
    text-align: center;
  }
  
  .empty-icon {
    color: #4a6741;
    opacity: 0.6;
  }
  
  .empty-text {
    color: #666;
    font-style: italic;
    font-size: 16px;
  }
  
  // Contact grid
  .contact-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .contact-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 12px;
    border-left: 4px solid #4a6741;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(74, 103, 65, 0.2);
    }
    
    &.clickable {
      cursor: pointer;
      
      &:hover {
        background: rgba(74, 103, 65, 0.15);
      }
    }
  }
  
  .contact-icon {
    --va-icon-size: 24px;
    background: rgba(74, 103, 65, 0.1);
    padding: 8px;
    border-radius: 50%;
    color: #4a6741;
    
    &.linkedin-icon { color: #0077b5; background: rgba(0, 119, 181, 0.1); }
    &.website-icon { color: #4a6741; background: rgba(74, 103, 65, 0.1); }
    &.orcid-icon { color: #a6ce39; background: rgba(166, 206, 57, 0.1); }
  }
  
  .contact-info {
    flex: 1;
  }
  
  .contact-label {
    font-size: 12px;
    font-weight: 600;
    color: #4a6741;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  
  .contact-value {
    font-size: 16px;
    font-weight: 500;
    color: #333;
  }
  
  .status-badge {
    --va-badge-border-radius: 20px;
    --va-badge-font-weight: 600;
  }
  
  .external-icon {
    color: #4a6741;
    opacity: 0.7;
  }
  
  // Account settings
  .settings-list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  
  .setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 0;
    gap: 16px;
  }
  
  .setting-info {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
  }
  
  .setting-icon {
    --va-icon-size: 24px;
    color: #4a6741;
    background: rgba(74, 103, 65, 0.1);
    padding: 8px;
    border-radius: 50%;
  }
  
  .setting-details {
    flex: 1;
  }
  
  .setting-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
  }
  
  .setting-description {
    font-size: 14px;
    color: #666;
    line-height: 1.4;
  }
  
  .setting-action {
    --va-button-border-radius: 20px;
    flex-shrink: 0;
  }
  
  .setting-divider {
    --va-divider-color: rgba(74, 103, 65, 0.2);
    margin: 0;
  }
  
  .collab-badge {
    --va-badge-border-radius: 20px;
    --va-badge-font-weight: 600;
    flex-shrink: 0;
  }
}

// Dark mode adjustments
.dark {
  .profile-settings {
    .profile-content,
    .professional-content,
    .skills-content,
    .contact-content,
    .account-content {
      background: rgba(31, 41, 55, 0.95);
      color: #f3f4f6;
    }
    
    .field-value,
    .info-value,
    .contact-value,
    .setting-title {
      color: #f3f4f6;
    }
    
    .setting-description {
      color: #d1d5db;
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .profile-settings {
    --va-card-padding: 16px;
    
    .profile-grid {
      grid-template-columns: 1fr;
    }
    
    .setting-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    
    .setting-action {
      align-self: stretch;
    }
  }
}
</style>
