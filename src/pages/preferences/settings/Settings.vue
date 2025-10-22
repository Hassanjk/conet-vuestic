<template>
  <div class="profile-settings">
    <!-- Profile Information Card -->
    <VaCard class="profile-card mb-6">
      <VaCardTitle class="card-header">
        <div class="flex items-center gap-3">
          <VaIcon name="mso-person" class="header-icon" />
          <span class="header-title">PROFILE INFORMATION</span>
        </div>
        <VaButton
          class="edit-btn"
          preset="outline"
          icon="mso-edit"
          size="small"
          @click="$emit('openProfileEdit')"
        >
          Edit Profile
        </VaButton>
      </VaCardTitle>
      <VaCardContent class="profile-content">
        <div class="simple-profile-grid">
          <!-- Full Name -->
          <div class="simple-field">
            <label class="simple-label">Full Name</label>
            <div class="simple-value">{{ store.currentUser?.full_name || store.userName || 'Not specified' }}</div>
          </div>
          
          <!-- Username -->
          <div class="simple-field">
            <label class="simple-label">Username</label>
            <div class="simple-value">{{ store.currentUser?.username || 'Not specified' }}</div>
          </div>
          
          <!-- Professional Title -->
          <div class="simple-field simple-field-full">
            <label class="simple-label">Professional Title</label>
            <div class="simple-value">{{ store.currentUser?.title || 'Not specified' }}</div>
          </div>
          
          <!-- Bio -->
          <div class="simple-field simple-field-full">
            <label class="simple-label">Bio</label>
            <div class="simple-value simple-bio">
              {{ store.currentUser?.bio || 'No bio added yet' }}
            </div>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Professional Information Card -->
    <VaCard class="professional-card mb-6">
      <VaCardTitle class="card-header">
        <div class="flex items-center gap-3">
          <VaIcon name="mso-work" class="header-icon" />
          <span class="header-title">PROFESSIONAL INFORMATION</span>
        </div>
      </VaCardTitle>
      <VaCardContent class="professional-content">
        <div class="professional-grid">
          <div class="info-item">
            <VaIcon name="mso-business" class="info-icon" />
            <div class="info-content">
              <div class="info-label">Institution</div>
              <div class="info-value">{{ store.currentUser?.institution || 'Not specified' }}</div>
            </div>
          </div>
          
          <div class="info-item">
            <VaIcon name="mso-domain" class="info-icon" />
            <div class="info-content">
              <div class="info-label">Department</div>
              <div class="info-value">{{ store.currentUser?.department || 'Not specified' }}</div>
            </div>
          </div>
          
          <div class="info-item">
            <VaIcon name="mso-location_on" class="info-icon" />
            <div class="info-content">
              <div class="info-label">Location</div>
              <div class="info-value">{{ store.currentUser?.location || 'Not specified' }}</div>
            </div>
          </div>
          
          <div class="info-item">
            <VaIcon name="mso-badge" class="info-icon" />
            <div class="info-content">
              <div class="info-label">Role</div>
              <div class="info-value">
                <VaBadge v-if="userRole" :text="userRole" color="primary" class="role-badge" />
                <span v-else>Not assigned</span>
              </div>
            </div>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Skills & Expertise Card -->
    <VaCard class="skills-card mb-6">
      <VaCardTitle class="card-header">
        <div class="flex items-center gap-3">
          <VaIcon name="mso-psychology" class="header-icon" />
          <span class="header-title">SKILLS & EXPERTISE</span>
        </div>
      </VaCardTitle>
      <VaCardContent class="skills-content">
        <div v-if="store.currentUser?.expertise_areas?.length || store.currentUser?.skills?.length" class="skills-container">
          <!-- Expertise Areas -->
          <div v-if="store.currentUser?.expertise_areas?.length" class="skill-section">
            <div class="skill-section-title">
              <VaIcon name="mso-school" class="mr-2" />
              Expertise Areas
            </div>
            <div class="chip-container">
              <VaChip
                v-for="area in store.currentUser.expertise_areas"
                :key="area"
                class="expertise-chip"
                color="success"
                variant="gradient"
              >
                {{ area }}
              </VaChip>
            </div>
          </div>
          
          <!-- Skills -->
          <div v-if="store.currentUser?.skills?.length" class="skill-section">
            <div class="skill-section-title">
              <VaIcon name="mso-build" class="mr-2" />
              Skills
            </div>
            <div class="chip-container">
              <VaChip
                v-for="skill in store.currentUser.skills"
                :key="skill"
                class="skill-chip"
                color="info"
                variant="gradient"
              >
                {{ skill }}
              </VaChip>
            </div>
          </div>
        </div>
        
        <div v-else class="empty-skills">
          <VaIcon name="mso-lightbulb_outline" size="48px" class="empty-icon" />
          <p class="empty-text">No skills or expertise areas added yet</p>
          <VaButton preset="outline" size="small" @click="$emit('openProfileEdit')">
            Add Skills
          </VaButton>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Links & Contact Card -->
    <VaCard class="contact-card mb-6">
      <VaCardTitle class="card-header">
        <div class="flex items-center gap-3">
          <VaIcon name="mso-link" class="header-icon" />
          <span class="header-title">LINKS & CONTACT</span>
        </div>
      </VaCardTitle>
      <VaCardContent class="contact-content">
        <div class="contact-grid">
          <!-- Email -->
          <div class="contact-item">
            <VaIcon name="mso-email" class="contact-icon" />
            <div class="contact-info">
              <div class="contact-label">Email</div>
              <div class="contact-value">{{ store.email }}</div>
            </div>
            <VaBadge 
              :text="store.currentUser?.status || 'OFFLINE'" 
              :color="store.currentUser?.status === 'ONLINE' ? 'success' : 'secondary'"
              class="status-badge"
            />
          </div>
          
          <!-- LinkedIn -->
          <div v-if="store.currentUser?.linkedin_url" class="contact-item clickable" @click="openExternalLink(store.currentUser.linkedin_url)">
            <VaIcon name="mso-link" class="contact-icon linkedin-icon" />
            <div class="contact-info">
              <div class="contact-label">LinkedIn</div>
              <div class="contact-value">View LinkedIn Profile</div>
            </div>
            <VaIcon name="mso-open_in_new" size="16px" class="external-icon" />
          </div>
          
          <!-- Website -->
          <div v-if="store.currentUser?.website_url" class="contact-item clickable" @click="openExternalLink(store.currentUser.website_url)">
            <VaIcon name="mso-language" class="contact-icon website-icon" />
            <div class="contact-info">
              <div class="contact-label">Website</div>
              <div class="contact-value">Visit Website</div>
            </div>
            <VaIcon name="mso-open_in_new" size="16px" class="external-icon" />
          </div>
          
          <!-- ORCID -->
          <div v-if="store.currentUser?.orcid_id" class="contact-item clickable" @click="openExternalLink(`https://orcid.org/${store.currentUser.orcid_id}`)">
            <VaIcon name="mso-badge" class="contact-icon orcid-icon" />
            <div class="contact-info">
              <div class="contact-label">ORCID</div>
              <div class="contact-value">{{ store.currentUser.orcid_id }}</div>
            </div>
            <VaIcon name="mso-open_in_new" size="16px" class="external-icon" />
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Account Settings Card -->
    <VaCard class="account-card">
      <VaCardTitle class="card-header">
        <div class="flex items-center gap-3">
          <VaIcon name="mso-settings" class="header-icon" />
          <span class="header-title">ACCOUNT SETTINGS</span>
        </div>
      </VaCardTitle>
      <VaCardContent class="account-content">
        <div class="settings-list">
          <!-- Password -->
          <div class="setting-item">
            <div class="setting-info">
              <VaIcon name="mso-lock" class="setting-icon" />
              <div class="setting-details">
                <div class="setting-title">Password</div>
                <div class="setting-description">Last updated recently</div>
              </div>
            </div>
            <VaButton class="setting-action" preset="outline" @click="$emit('openResetPasswordModal')">
              Change Password
            </VaButton>
          </div>

          <VaDivider class="setting-divider" />

          <!-- Two-Factor Authentication -->
          <div class="setting-item">
            <div class="setting-info">
              <VaIcon name="mso-security" class="setting-icon" />
              <div class="setting-details">
                <div class="setting-title">Two-factor authentication</div>
                <div class="setting-description">{{ twoFA.content }}</div>
              </div>
            </div>
            <VaButton class="setting-action" preset="outline" :color="twoFA.color" @click="toggle2FA">
              {{ twoFA.button }}
            </VaButton>
          </div>

          <VaDivider class="setting-divider" />

          <!-- Collaboration Status -->
          <div class="setting-item">
            <div class="setting-info">
              <VaIcon name="mso-people" class="setting-icon" />
              <div class="setting-details">
                <div class="setting-title">Collaboration Status</div>
                <div class="setting-description">
                  {{ store.currentUser?.available_for_collaboration ? 'Available for collaboration' : 'Not available for collaboration' }}
                </div>
              </div>
            </div>
            <VaBadge
              :text="store.currentUser?.available_for_collaboration ? 'Available' : 'Unavailable'"
              :color="store.currentUser?.available_for_collaboration ? 'success' : 'secondary'"
              class="collab-badge"
            />
          </div>

          <VaDivider class="setting-divider" />

          <!-- Email Subscriptions -->
          <div class="setting-item">
            <div class="setting-info">
              <VaIcon name="mso-notifications" class="setting-icon" />
              <div class="setting-details">
                <div class="setting-title">Email subscriptions</div>
                <div class="setting-description">Manage your notification preferences</div>
              </div>
            </div>
            <VaButton class="setting-action" preset="outline" :to="{ name: 'settings' }">Manage</VaButton>
          </div>
        </div>
      </VaCardContent>
    </VaCard>
  </div>
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

<style lang="scss" scoped>
.profile-settings {
  --va-card-border-radius: 16px;
  --va-card-box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  --va-card-padding: 24px;
  
  // Professional card styling with consistent headers
  .profile-card,
  .professional-card,
  .skills-card,
  .contact-card,
  .account-card {
    --va-card-background: #ffffff;
    border: 1px solid #e2e8f0;
    
    .profile-content,
    .professional-content,
    .skills-content,
    .contact-content,
    .account-content {
      background: transparent;
      padding: 0;
    }
  }
  
  // Card header styling for professional consistency
  .card-header {
    background: linear-gradient(135deg, #2c3e50 0%, #4a6741 100%);
    color: white;
    padding: 16px 24px;
    margin: -24px -24px 24px -24px;
    border-radius: 16px 16px 0 0;
    
    .header-title {
      font-weight: 700;
      font-size: 14px;
      letter-spacing: 1px;
      color: white;
    }
    
    .header-icon {
      color: rgba(255, 255, 255, 0.9);
      font-size: 20px;
    }
  }
  
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
