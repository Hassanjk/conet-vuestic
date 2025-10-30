import { User, transformSupabaseUser } from '../../pages/users/types'
import { UserWithRoles, ProfileUpdateRequest } from '../../types/auth.types'
import authService from '../../services/api/auth.service'

export type Pagination = {
  page: number
  perPage: number
  total: number
}

export type Sorting = {
  sortBy: keyof User | undefined
  sortingOrder: 'asc' | 'desc' | null
}

export type Filters = {
  isActive: boolean
  search: string
}

export const getUserStats = async () => {
  try {
    // Fetch all users from Supabase for statistics
    const supabaseUsers: UserWithRoles[] = await authService.adminGetAllUsers()

    // Transform to UI format
    const transformedUsers: User[] = supabaseUsers.map(transformSupabaseUser)

    // Calculate statistics
    const totalUsers = transformedUsers.length
    const activeUsers = transformedUsers.filter((user) => user.active).length
    const inactiveUsers = transformedUsers.filter((user) => !user.active).length

    // Role statistics
    const roleStats = transformedUsers.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Status statistics (for active users only)
    const statusStats = transformedUsers
      .filter((user) => user.active)
      .reduce(
        (acc, user) => {
          const status = user.status || 'OFFLINE'
          acc[status] = (acc[status] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      roleStats,
      statusStats,
      onlineUsers: statusStats.ONLINE || 0,
      offlineUsers: statusStats.OFFLINE || 0,
    }
  } catch (error: any) {
    console.error('Failed to fetch user stats:', error)
    throw new Error(`Failed to fetch user stats: ${error.message}`)
  }
}

export const getUsers = async (filters: Partial<Filters & Pagination & Sorting>) => {
  try {
    // Fetch all users from Supabase
    const supabaseUsers: UserWithRoles[] = await authService.adminGetAllUsers()

    // Transform to UI format
    let transformedUsers: User[] = supabaseUsers.map(transformSupabaseUser)

    // Apply filters
    const { isActive, search } = filters

    if (isActive !== undefined) {
      transformedUsers = transformedUsers.filter((user) => user.active === isActive)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      transformedUsers = transformedUsers.filter(
        (user) =>
          user.fullname.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.username.toLowerCase().includes(searchLower),
      )
    }

    // Apply sorting
    const { sortBy, sortingOrder } = filters
    if (sortBy && sortingOrder) {
      transformedUsers.sort((a, b) => {
        let aValue = a[sortBy as keyof User]
        let bValue = b[sortBy as keyof User]

        // Handle projects special case
        if (sortBy === 'projects') {
          aValue = (a.projects || []).join(', ')
          bValue = (b.projects || []).join(', ')
        }

        // Convert to string for comparison
        const aStr = String(aValue || '').toLowerCase()
        const bStr = String(bValue || '').toLowerCase()

        if (aStr < bStr) return sortingOrder === 'asc' ? -1 : 1
        if (aStr > bStr) return sortingOrder === 'asc' ? 1 : -1
        return 0
      })
    }

    // Apply pagination
    const { page = 1, perPage = 10 } = filters
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    const paginatedUsers = transformedUsers.slice(startIndex, endIndex)

    return {
      data: paginatedUsers,
      pagination: {
        page,
        perPage,
        total: transformedUsers.length,
      },
    }
  } catch (error: any) {
    console.error('Failed to fetch users:', error)
    throw new Error(`Failed to fetch users: ${error.message}`)
  }
}

export const addUser = async (_user: User) => {
  try {
    // For now, we'll use the admin create user endpoint
    // You might want to implement a proper admin user creation endpoint
    throw new Error('User creation not implemented yet - use signup instead')
  } catch (error: any) {
    throw new Error(`Failed to add user: ${error.message}`)
  }
}

export const updateUser = async (user: User) => {
  try {
    const userData: ProfileUpdateRequest = {
      username: user.username,
      full_name: user.fullname,
      avatar_url: user.avatar || undefined,
      projects: user.projects,
      status: user.status,
      bio: user.bio || undefined,
      institution: user.institution || undefined,
      department: user.department || undefined,
      title: user.title || undefined,
      skills: user.skills ? [user.skills] : undefined,
      location: user.location || undefined,
      available_for_collaboration: user.available_for_collaboration,
    }

    // Update the profile first
    await authService.updateProfile(user.id, userData)

    // Handle activation/deactivation separately
    if (user.active) {
      // If user is being activated, use the reactivate method
      await authService.adminReactivateUser(user.id)
    } else {
      // If user is being deactivated, use the deactivate method
      await authService.adminDeactivateUser(user.id)
    }

    // Return the updated user in an array format to match existing API
    return [user]
  } catch (error: any) {
    throw new Error(`Failed to update user: ${error.message}`)
  }
}

export const removeUser = async (user: User) => {
  try {
    // Permanently delete the user using the DELETE endpoint
    // DELETE {{supabase_url}}/rest/v1/users?id=eq.REPLACE_WITH_USER_ID
    const response = await authService.adminDeleteUser(user.id)
    return response
  } catch (error: any) {
    console.error('Failed to delete user:', error)
    throw new Error(`Failed to delete user: ${error.message}`)
  }
}

export const bulkRemoveUsers = async (users: User[]) => {
  try {
    // Extract user IDs
    const userIds = users.map((user) => user.id)

    // Permanently delete multiple users using the bulk DELETE endpoint
    // DELETE {{supabase_url}}/rest/v1/users?id=in.(user_id_1,user_id_2,user_id_3)
    await authService.adminBulkDeleteUsers(userIds)
  } catch (error: any) {
    console.error('Failed to bulk delete users:', error)
    throw new Error(`Failed to bulk delete users: ${error.message}`)
  }
}

export const uploadAvatar = async (_body: FormData) => {
  // This would need to be implemented with Supabase Storage
  // For now, return a placeholder
  return {
    publicUrl: 'https://via.placeholder.com/150',
    error: null,
  }
}
