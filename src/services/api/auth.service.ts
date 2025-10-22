import apiClient from './client'
import type {
  SignupRequest,
  LoginRequest,
  AuthResponse,
  User,
  UserWithRoles,
  ProfileUpdateRequest,
  AdminCreateUserRequest,
  AdminCreateUserResponse,
  AssignRoleRequest,
  UpdateRoleRequest,
  UserRole,
} from '../../types/auth.types'

/**
 * Authentication Service - Maps to starting_point.json endpoints
 */
export class AuthService {
  // 🔐 Core Authentication Methods

  /**
   * User Signup with Auto-Profile Sync - Maps to "✅ Signup - Student/Researcher/User (FIXED)"
   * POST {{supabase_url}}/auth/v1/signup + auto-sync profile creation
   */
  async signup(credentials: SignupRequest): Promise<AuthResponse> {
    try {
      console.log('🔄 Starting signup process...')
      
      // Step 1: Sign up the user
      const response = await apiClient.getAuthClient().signup(credentials)

      if (!response.user?.id) {
        throw new Error('No user returned from signup')
      }

      console.log('✅ Auth user created:', response.user.id)

      // Store tokens if signup successful
      if (response.access_token) {
        apiClient.setTokens(response.access_token, response.refresh_token, response.expires_in)
      }

      // Step 2: Wait a moment for potential database trigger
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Step 3: Check if profile exists
      try {
        const existingProfile = await this.getProfile(response.user.id)
        if (existingProfile) {
          console.log('✅ Profile already exists - trigger worked!')
          return { ...response, profileCreated: false, message: 'Signup successful - profile exists' }
        }
      } catch (error) {
        console.log('⚠️ No profile found - running sync...')
      }

      // Step 4: Create profile using sync function
      try {
        const syncResult = await apiClient.getRestClient().rpc.syncSpecificAuthUser({
          target_user_id: response.user.id,
        })

        console.log('✅ Profile sync completed:', syncResult)
        return {
          ...response,
          profileCreated: true,
          syncResult,
          message: 'Signup successful - profile created via sync',
        }
      } catch (syncError: any) {
        console.error('❌ Profile sync failed:', syncError)
        // Return success for auth but note profile creation failure
        return {
          ...response,
          profileCreated: false,
          error: `Signup succeeded but profile creation failed: ${syncError.message}`,
          message: 'Auth created, profile creation failed',
        }
      }
    } catch (error) {
      console.error('❌ Signup failed:', error)
      throw this.handleAuthError(error)
    }
  }

  /**
   * User Login - Maps to "👑 Admin Login" pattern
   * POST {{supabase_url}}/auth/v1/token?grant_type=password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.getAuthClient().login(credentials)

      // Store tokens if login successful
      if (response.access_token) {
        apiClient.setTokens(response.access_token, response.refresh_token, response.expires_in)
      }

      return response
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * User Logout
   * POST {{supabase_url}}/auth/v1/logout
   */
  async logout(): Promise<void> {
    try {
      await apiClient.getAuthClient().logout()
    } catch (error) {
      console.warn('Logout API call failed:', error)
    } finally {
      // Always clear local tokens
      apiClient.clearTokens()
    }
  }

  /**
   * Refresh Access Token
   */
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await apiClient.getAuthClient().refreshToken(refreshToken)
      apiClient.setTokens(response.access_token, response.refresh_token, response.expires_in)
      return response
    } catch (error) {
      apiClient.clearTokens()
      throw this.handleAuthError(error)
    }
  }

  // 👤 Profile Management Methods

  /**
   * Get Current User Profile - Maps to "Get My Profile"
   * GET {{supabase_url}}/rest/v1/users?id=eq.{{user_id}}&select=*,user_roles(role)
   */
  async getProfile(userId: string): Promise<UserWithRoles> {
    const params = `id=eq.${userId}&select=*,user_roles(role)`
    const response = await apiClient.getRestClient().users.get(params)
    return response[0] // Supabase returns array
  }

  /**
   * Get User Profile with Auto-Sync Fallback
   * Automatically attempts to sync profile if it doesn't exist
   */
  async getProfileWithAutoSync(
    userId: string,
  ): Promise<{ success: boolean; profile?: UserWithRoles; synced?: boolean; error?: string }> {
    try {
      // First try to get the profile
      const profile = await this.getProfile(userId)
      if (profile) {
        return { success: true, profile, synced: false }
      }
    } catch (error: any) {
      if (error.message?.includes('PGRST116') || error.response?.status === 406) {
        // Profile doesn't exist - try to sync it
        console.log('⚠️ Profile not found, attempting sync...')
        const syncResult = await this.syncUserProfile(userId)
        
        if (syncResult.success) {
          // Try again after sync
          try {
            const newProfile = await this.getProfile(userId)
            return { success: true, profile: newProfile, synced: true }
          } catch (newError: any) {
            return { success: false, error: newError.message }
          }
        } else {
          return { success: false, error: syncResult.error }
        }
      } else {
        return { success: false, error: error.message }
      }
    }
    
    return { success: false, error: 'Profile not found and sync failed' }
  }

  /**
   * Manually sync user profile using the RPC function
   * Maps to "🔄 Auto-Sync Profile After Signup"
   */
  async syncUserProfile(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const data = await apiClient.getRestClient().rpc.syncSpecificAuthUser({
        target_user_id: userId,
      })

      console.log('✅ Profile sync completed:', data)
      return { success: true, data }
    } catch (error: any) {
      console.error('❌ Profile sync failed:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Update Profile - Maps to "Update My Profile"
   * PATCH {{supabase_url}}/rest/v1/users?id=eq.{{user_id}}
   */
  async updateProfile(userId: string, data: ProfileUpdateRequest): Promise<User> {
    const response = await apiClient.getRestClient().users.update(userId, data)
    return response
  }

  /**
   * Set User Status - Maps to "Set Status Online/Offline"
   * PATCH {{supabase_url}}/rest/v1/users?id=eq.{{user_id}}
   */
  async setStatus(userId: string, status: 'ONLINE' | 'OFFLINE'): Promise<void> {
    await apiClient.getRestClient().users.update(userId, { status })
  }

  // 🎭 Role Management Methods

  /**
   * Get User Roles - Maps to "Get My Roles"
   * GET {{supabase_url}}/rest/v1/user_roles?user_id=eq.{{user_id}}&select=*
   */
  async getUserRoles(userId: string): Promise<UserRole[]> {
    const params = `user_id=eq.${userId}&select=role`
    const response = await apiClient.getRestClient().userRoles.get(params)
    return response.map((r: any) => r.role)
  }

  /**
   * Check if user has specific role
   */
  async hasRole(userId: string, role: UserRole): Promise<boolean> {
    const roles = await this.getUserRoles(userId)
    return roles.includes(role)
  }

  // 👑 Admin-Only Methods

  /**
   * Admin Create Complete User - Maps to "✅ Create Complete User - Student/Researcher"
   * POST {{supabase_url}}/rest/v1/rpc/admin_create_complete_user
   */
  async adminCreateUser(userData: AdminCreateUserRequest): Promise<AdminCreateUserResponse> {
    return await apiClient.getRestClient().rpc.adminCreateUser(userData)
  }

  /**
   * Admin Get All Users - Maps to "Get All Users with Complete Details"
   * GET {{supabase_url}}/rest/v1/users?select=*,user_roles(role)&order=created_at.desc
   */
  async adminGetAllUsers(): Promise<UserWithRoles[]> {
    const params = 'select=*,user_roles(role)&order=created_at.desc'
    return await apiClient.getRestClient().users.get(params)
  }

  /**
   * Admin Assign Role - Maps to "Admin Assign Role to User"
   * POST {{supabase_url}}/rest/v1/user_roles
   */
  async adminAssignRole(data: AssignRoleRequest): Promise<void> {
    await apiClient.getRestClient().userRoles.create(data)
  }

  /**
   * Admin Update User Role - Maps to "Admin Update User Role"
   * PATCH {{supabase_url}}/rest/v1/user_roles?user_id=eq.{{user_id}}
   */
  async adminUpdateRole(userId: string, data: UpdateRoleRequest): Promise<void> {
    await apiClient.getRestClient().userRoles.update(userId, data)
  }

  /**
   * Admin Remove User Role - Maps to "Admin Remove User Role"
   * DELETE {{supabase_url}}/rest/v1/user_roles?user_id=eq.{{user_id}}
   */
  async adminRemoveRole(userId: string): Promise<void> {
    await apiClient.getRestClient().userRoles.delete(userId)
  }

  /**
   * Admin Deactivate User - Maps to "Admin Deactivate User"
   * PATCH {{supabase_url}}/rest/v1/users?id=eq.{{user_id}}
   */
  async adminDeactivateUser(userId: string): Promise<void> {
    await apiClient.getRestClient().users.update(userId, { is_active: false, status: 'OFFLINE' })
  }

  /**
   * Admin Reactivate User - Maps to "Admin Reactivate User"
   * PATCH {{supabase_url}}/rest/v1/users?id=eq.{{user_id}}
   */
  async adminReactivateUser(userId: string): Promise<void> {
    await apiClient.getRestClient().users.update(userId, { is_active: true, status: 'ONLINE' })
  }

  // 🛠️ Utility Methods

  /**
   * Check if current token is valid
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token')
    const expiresAt = localStorage.getItem('expires_at')

    if (!token || !expiresAt) return false

    return Date.now() < parseInt(expiresAt)
  }

  /**
   * Get current user ID from token (if available)
   */
  getCurrentUserId(): string | null {
    // In a real implementation, you might decode the JWT token
    // For now, we'll store it separately during login
    return localStorage.getItem('user_id')
  }

  /**
   * Check email availability before signup
   */
  async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const params = `select=id&email=eq.${email}&limit=1`
      const response = await apiClient.getRestClient().users.get(params)
      return response.length === 0 // Email available if no user found
    } catch (error) {
      return false // Assume email is taken if error occurs
    }
  }

  // 🧪 Debug/Testing Methods (from starting_point.json)

  /**
   * Verify Database Setup - Maps to "✅ Verify Database Setup"
   */
  async verifyDatabaseSetup(): Promise<any> {
    return await apiClient.getRestClient().rpc.checkDatabase()
  }

  /**
   * Test Email Domain Detection - Maps to "✅ Test Email Domain Detection"
   */
  async testEmailDomains(): Promise<any> {
    return await apiClient.getRestClient().rpc.testEmailDomains()
  }

  /**
   * Handle authentication errors consistently
   */
  private handleAuthError(error: any): Error {
    if (error.response?.status === 400) {
      return new Error('Invalid credentials')
    }
    if (error.response?.status === 422) {
      return new Error('Email already registered')
    }
    if (error.response?.status === 429) {
      return new Error('Too many attempts. Please try again later.')
    }
    return new Error(error.message || 'Authentication failed')
  }
}

// Export singleton instance
const authService = new AuthService()
export default authService
