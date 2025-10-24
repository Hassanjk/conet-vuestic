import { defineStore } from 'pinia'
import authService from '../services/api/auth.service'
import type {
  User,
  UserWithRoles,
  UserRole,
  SignupRequest,
  LoginRequest,
  ProfileUpdateRequest,
  AuthState,
} from '../types/auth.types'

export const useUserStore = defineStore('user', {
  state: (): AuthState => {
    return {
      // Core Authentication
      user: null,
      tokens: {
        access_token: localStorage.getItem('access_token'),
        refresh_token: localStorage.getItem('refresh_token'),
        expires_at: localStorage.getItem('expires_at') ? parseInt(localStorage.getItem('expires_at')!) : null,
      },

      // Status & Permissions
      isAuthenticated: !!localStorage.getItem('access_token') && !!localStorage.getItem('user_id'),
      userRoles: [],
      isLoading: false,
      error: null,

      // Profile Data (backwards compatibility)
      profile: null,
    }
  },

  getters: {
    // Backwards compatibility getters
    userName: (state) => state.user?.full_name || state.user?.username || 'Guest',
    email: (state) => state.user?.email || '',
    memberSince: (state) => {
      if (state.user?.created_at) {
        return new Date(state.user.created_at).toLocaleDateString()
      }
      return ''
    },
    pfp: (state) => state.user?.avatar_url || 'https://picsum.photos/id/22/200/300',
    is2FAEnabled: () => false, // TODO: Implement 2FA later

    // New auth getters
    isLoggedIn: (state) => state.isAuthenticated && !!state.user,
    currentUser: (state) => state.user,
    userPermissions: (state) => state.userRoles,
    hasRole: (state) => (role: UserRole) => state.userRoles.includes(role),
    isAdmin: (state) => state.userRoles.includes('admin'),
    isStudent: (state) => state.userRoles.includes('student'),
    isResearcher: (state) => state.userRoles.includes('researcher'),
  },

  actions: {
    // 🔐 Authentication Actions

    async signup(credentials: SignupRequest) {
      this.isLoading = true
      this.error = null

      try {
        const response = await authService.signup(credentials)
        await this.handleAuthSuccess(response)
        return response
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async login(credentials: LoginRequest) {
      this.isLoading = true
      this.error = null

      try {
        const response = await authService.login(credentials)
        await this.handleAuthSuccess(response)
        return response
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      this.isLoading = true

      try {
        await authService.logout()
        this.clearAuthState()
      } catch (error) {
        // Always clear state even if logout API fails
        this.clearAuthState()
      } finally {
        this.isLoading = false
      }
    },

    async refreshToken() {
      try {
        const response = await authService.refreshToken()
        this.updateTokens(response)
        return response
      } catch (error) {
        this.clearAuthState()
        throw error
      }
    },

    // 👤 Profile Management Actions

    async fetchProfile() {
      if (!this.user?.id) return

      this.isLoading = true
      try {
        const result = await authService.getProfileWithAutoSync(this.user.id)
        if (result.success && result.profile) {
          this.updateUserProfile(result.profile)
          await this.fetchUserRoles()
          if (result.synced) {
            console.log('✅ Profile was automatically synced during fetch')
          }
        } else {
          // If profile still can't be found/created, use auth user data
          console.warn('Profile fetch/sync failed, using auth data:', result.error)
          this.error = null // Clear error since we can work with auth data
        }
      } catch (error: any) {
        // Fallback: use auth user data we already have
        console.warn('Profile fetch failed:', error.message)
        this.error = null // Clear error since this is expected for new users
      } finally {
        this.isLoading = false
      }
    },

    async updateProfile(data: ProfileUpdateRequest) {
      if (!this.user?.id) throw new Error('No user logged in')

      this.isLoading = true
      try {
        const updatedUser = await authService.updateProfile(this.user.id, data)
        this.updateUserProfile(updatedUser)
        return updatedUser
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async setStatus(status: 'ONLINE' | 'OFFLINE') {
      if (!this.user?.id) return

      try {
        await authService.setStatus(this.user.id, status)
        if (this.user) {
          this.user.status = status
        }
      } catch (error: any) {
        this.error = error.message
        throw error
      }
    },

    // 🎭 Role Management Actions

    async fetchUserRoles() {
      if (!this.user?.id) return

      try {
        const roles = await authService.getUserRoles(this.user.id)
        this.userRoles = roles
      } catch (error: any) {
        this.error = error.message
        throw error
      }
    },

    async checkRole(role: UserRole): Promise<boolean> {
      if (!this.user?.id) return false

      try {
        return await authService.hasRole(this.user.id, role)
      } catch (error) {
        return false
      }
    },

    // 📧 Utility Actions

    async checkEmailAvailability(email: string) {
      return await authService.checkEmailAvailability(email)
    },

    async syncUserProfile(userId: string) {
      return await authService.syncUserProfile(userId)
    },

    // 🔄 State Management Actions

    async handleAuthSuccess(response: any) {
      this.updateTokens(response)
      this.user = response.user
      this.isAuthenticated = true
      this.error = null

      // Store user ID for future requests
      if (response.user?.id) {
        localStorage.setItem('user_id', response.user.id)
      }

      // Try to fetch additional profile data and roles
      // This might fail for new users who don't have a profile in the users table yet
      try {
        await this.fetchProfile()
      } catch (error) {
        // This is expected for new signups - user doesn't exist in custom users table yet
        console.warn('Could not fetch extended profile (normal for new users):', error)
      }
    },

    updateTokens(response: any) {
      this.tokens = {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        expires_at: response.expires_in ? Date.now() + response.expires_in * 1000 : null,
      }
    },

    updateUserProfile(user: User | UserWithRoles) {
      this.user = user
      this.profile = user

      // Update roles if available
      if (user && 'user_roles' in user && user.user_roles) {
        this.userRoles = user.user_roles.map((r) => r.role)
      }
    },

    clearAuthState() {
      this.user = null
      this.profile = null
      this.tokens = {
        access_token: null,
        refresh_token: null,
        expires_at: null,
      }
      this.isAuthenticated = false
      this.userRoles = []
      this.error = null
      localStorage.removeItem('user_id')
    },

    // 🔄 Backwards Compatibility Actions (keep existing methods)

    toggle2FA() {
      // TODO: Implement real 2FA toggle
      console.warn('2FA toggle not implemented yet')
    },

    changeUserName(userName: string) {
      // Use the new updateProfile method
      return this.updateProfile({ full_name: userName })
    },

    // 🚀 Initialize Store

    async initializeAuth() {
      console.log('Initializing auth state...')

      // Load tokens from localStorage if not already in store
      const storedAccessToken = localStorage.getItem('access_token')
      const storedRefreshToken = localStorage.getItem('refresh_token')
      const storedExpiresAt = localStorage.getItem('expires_at')
      const storedUserId = localStorage.getItem('user_id')

      if (!storedAccessToken || !storedUserId) {
        console.log('No stored tokens found')
        this.clearAuthState()
        return
      }

      // Update tokens in store if they're not already there
      if (!this.tokens.access_token) {
        this.tokens = {
          access_token: storedAccessToken,
          refresh_token: storedRefreshToken,
          expires_at: storedExpiresAt ? parseInt(storedExpiresAt) : null,
        }
      }

      // Check if tokens are expired
      const isExpired = storedExpiresAt ? Date.now() > parseInt(storedExpiresAt) : true

      if (isExpired && storedRefreshToken) {
        // Token expired, try to refresh
        console.log('Token expired, attempting refresh...')
        try {
          await this.refreshToken()
        } catch (error) {
          console.log('Token refresh failed:', error)
          this.clearAuthState()
          return
        }
      }

      // Set authentication state
      this.isAuthenticated = true

      // Try to get user profile if we don't have it
      if (!this.user && storedUserId) {
        try {
          console.log('Fetching user profile...')
          const profile = await authService.getProfile(storedUserId)
          this.updateUserProfile(profile)
        } catch (error) {
          console.log('Profile fetch failed (normal for new users):', error)
          // Create minimal user object from stored data
          this.user = {
            id: storedUserId,
            email: '', // Will be populated when we get more info
            is_active: true,
          }
        }
      }

      console.log('Auth initialization complete. Authenticated:', this.isAuthenticated)
    },
  },
})
