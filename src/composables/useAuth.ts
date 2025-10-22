import { computed } from 'vue'
import { useUserStore } from '../stores/user-store'
import type { SignupRequest, LoginRequest, ProfileUpdateRequest } from '../types/auth.types'

/**
 * Auth composable for easy authentication management
 * Provides reactive access to auth state and actions
 */
export const useAuth = () => {
  const userStore = useUserStore()

  // Reactive getters
  const user = computed(() => userStore.currentUser)
  const isAuthenticated = computed(() => userStore.isLoggedIn)
  const isLoading = computed(() => userStore.isLoading)
  const error = computed(() => userStore.error)
  const userRoles = computed(() => userStore.userPermissions)

  // Role checks
  const isAdmin = computed(() => userStore.isAdmin)
  const isStudent = computed(() => userStore.isStudent)
  const isResearcher = computed(() => userStore.isResearcher)
  const hasRole = (role: string) => userStore.hasRole(role as any)

  // Backwards compatibility
  const userName = computed(() => userStore.userName)
  const email = computed(() => userStore.email)
  const pfp = computed(() => userStore.pfp)
  const memberSince = computed(() => userStore.memberSince)

  // Auth actions
  const signup = async (credentials: SignupRequest) => {
    return await userStore.signup(credentials)
  }

  const login = async (credentials: LoginRequest) => {
    return await userStore.login(credentials)
  }

  const logout = async () => {
    await userStore.logout()
  }

  const updateProfile = async (data: ProfileUpdateRequest) => {
    return await userStore.updateProfile(data)
  }

  const setStatus = async (status: 'ONLINE' | 'OFFLINE') => {
    await userStore.setStatus(status)
  }

  const checkEmailAvailability = async (email: string) => {
    return await userStore.checkEmailAvailability(email)
  }

  const initializeAuth = async () => {
    await userStore.initializeAuth()
  }

  const syncProfile = async (userId?: string) => {
    const targetUserId = userId || user.value?.id
    if (!targetUserId) throw new Error('No user ID available for sync')
    return await userStore.syncUserProfile(targetUserId)
  }

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    userRoles,

    // Role checks
    isAdmin,
    isStudent,
    isResearcher,
    hasRole,

    // Backwards compatibility
    userName,
    email,
    pfp,
    memberSince,

    // Actions
    signup,
    login,
    logout,
    updateProfile,
    setStatus,
    checkEmailAvailability,
    initializeAuth,
    syncProfile,
  }
}
