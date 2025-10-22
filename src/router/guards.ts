import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useUserStore } from '../stores/user-store'

/**
 * Route Guards for Authentication
 */

/**
 * Auth Guard - Protects routes that require authentication
 * Redirects to login if user is not authenticated
 */
export const authGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const userStore = useUserStore()

  // Check if we have tokens in localStorage but store is not initialized
  const hasStoredTokens = localStorage.getItem('access_token') && localStorage.getItem('user_id')

  if (hasStoredTokens && !userStore.isLoggedIn) {
    console.log('Auth guard: initializing auth state from stored tokens')
    try {
      await userStore.initializeAuth()
    } catch (error) {
      console.warn('Auth initialization failed:', error)
      // Clear invalid tokens
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_id')
    }
  }

  // Now check authentication status
  if (userStore.isLoggedIn) {
    // User is authenticated, allow access
    console.log('Auth guard: user authenticated, allowing access')
    next()
  } else {
    // User is not authenticated, redirect to login
    console.log('Auth guard: user not authenticated, redirecting to login')
    next({ name: 'login', query: { redirect: to.fullPath } })
  }
}

/**
 * Guest Guard - Protects routes that should only be accessible to non-authenticated users
 * Redirects to dashboard if user is already authenticated
 */
export const guestGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const userStore = useUserStore()

  // Check if we have tokens in localStorage but store is not initialized
  const hasStoredTokens = localStorage.getItem('access_token') && localStorage.getItem('user_id')

  if (hasStoredTokens && !userStore.isLoggedIn) {
    console.log('Guest guard: initializing auth state from stored tokens')
    try {
      await userStore.initializeAuth()
    } catch (error) {
      console.warn('Auth initialization failed:', error)
      // Clear invalid tokens
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_id')
    }
  }

  // Now check authentication status
  if (!userStore.isLoggedIn) {
    // User is not authenticated, allow access to auth pages
    console.log('Guest guard: user not authenticated, allowing access to auth pages')
    next()
  } else {
    // User is already authenticated, redirect to dashboard
    console.log('Guest guard: user already authenticated, redirecting to dashboard')
    next({ name: 'dashboard' })
  }
}

/**
 * Role Guard - Protects routes based on user roles
 * @param requiredRoles - Array of roles that can access this route
 */
export const roleGuard = (requiredRoles: string[]) => {
  return (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const userStore = useUserStore()

    if (!userStore.isLoggedIn) {
      // User is not authenticated
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }

    // Check if user has any of the required roles
    const hasRequiredRole = requiredRoles.some((role) => userStore.hasRole(role as any))

    if (hasRequiredRole) {
      // User has required role, allow access
      next()
    } else {
      // User doesn't have required role, redirect to dashboard or 403 page
      console.log(`Role guard: user lacks required roles [${requiredRoles.join(', ')}]`)
      next({ name: 'dashboard' }) // or create a 403 forbidden page
    }
  }
}

/**
 * Admin Guard - Shortcut for admin-only routes
 */
export const adminGuard = roleGuard(['admin'])

/**
 * Optional: Initialize auth state before routing
 */
export const initializeAuthGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const userStore = useUserStore()

  // Only initialize once per session
  if (!userStore.tokens.access_token && localStorage.getItem('access_token')) {
    try {
      await userStore.initializeAuth()
    } catch (error) {
      console.warn('Auth initialization failed:', error)
    }
  }

  next()
}
