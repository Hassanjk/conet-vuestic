import { defineStore } from 'pinia'
import {
  addUser,
  type Filters,
  getUsers,
  getUserStats,
  Pagination,
  removeUser,
  bulkRemoveUsers,
  Sorting,
  updateUser,
  uploadAvatar,
} from '../data/pages/users'
import { User } from '../pages/users/types'

export interface UserStats {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  roleStats: Record<string, number>
  statusStats: Record<string, number>
  onlineUsers: number
  offlineUsers: number
}

export const useUsersStore = defineStore('users', {
  state: () => {
    return {
      items: [] as User[],
      pagination: { page: 1, perPage: 10, total: 0 },
      stats: null as UserStats | null,
    }
  },

  actions: {
    async getAll(options: { pagination?: Pagination; sorting?: Sorting; filters?: Partial<Filters> }) {
      const { data, pagination } = await getUsers({
        ...options.filters,
        ...options.sorting,
        ...options.pagination,
      })
      this.items = data
      this.pagination = pagination
    },

    async getStats() {
      this.stats = await getUserStats()
      return this.stats
    },

    async add(user: User) {
      const newUser = await addUser(user)
      this.items.unshift(newUser)
      return newUser
    },

    async update(user: User) {
      const [updatedUser] = await updateUser(user)
      const index = this.items.findIndex(({ id }) => id === user.id)
      this.items.splice(index, 1, updatedUser)
      return updatedUser
    },

    async remove(user: User) {
      const isRemoved = await removeUser(user)

      if (isRemoved) {
        const index = this.items.findIndex(({ id }) => id === user.id)
        this.items.splice(index, 1)
      }
    },

    async bulkRemove(users: User[]) {
      await bulkRemoveUsers(users)

      // Remove all deleted users from the store
      const deletedIds = new Set(users.map((u) => u.id))
      this.items = this.items.filter((item) => !deletedIds.has(item.id))
    },

    async uploadAvatar(formData: FormData) {
      return uploadAvatar(formData)
    },
  },
})
