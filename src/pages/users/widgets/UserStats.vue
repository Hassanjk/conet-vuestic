<script setup lang="ts">
import { computed } from 'vue'
import { useColors } from 'vuestic-ui'
import DataSectionItem from '../../admin/dashboard/DataSectionItem.vue'
import type { UserStats } from '../../../stores/users'

interface Props {
  stats: UserStats | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const { getColor } = useColors()

const statsCards = computed(() => {
  if (!props.stats) {
    return [
      {
        title: 'Total Users',
        value: '0',
        icon: 'people',
        changeText: '0',
        changeDirection: 'up' as const,
        iconBackground: getColor('primary'),
        iconColor: getColor('on-primary'),
      },
      {
        title: 'Active Users',
        value: '0',
        icon: 'person_check',
        changeText: '0',
        changeDirection: 'up' as const,
        iconBackground: getColor('success'),
        iconColor: getColor('on-success'),
      },
      {
        title: 'Inactive Users',
        value: '0',
        icon: 'person_off',
        changeText: '0',
        changeDirection: 'down' as const,
        iconBackground: getColor('warning'),
        iconColor: getColor('on-warning'),
      },
      {
        title: 'Online Now',
        value: '0',
        icon: 'online_prediction',
        changeText: '0',
        changeDirection: 'up' as const,
        iconBackground: getColor('info'),
        iconColor: getColor('on-info'),
      },
    ]
  }

  // Calculate percentages for change indicators
  const totalUsers = props.stats.totalUsers
  const activePercentage =
    totalUsers > 0 ? ((props.stats.activeUsers / totalUsers) * 100).toFixed(1) : '0'
  const inactivePercentage =
    totalUsers > 0 ? ((props.stats.inactiveUsers / totalUsers) * 100).toFixed(1) : '0'
  const onlinePercentage =
    props.stats.activeUsers > 0 ? ((props.stats.onlineUsers / props.stats.activeUsers) * 100).toFixed(1) : '0'

  return [
    {
      title: 'Total Users',
      value: props.stats.totalUsers.toLocaleString(),
      icon: 'people',
      changeText: `${props.stats.activeUsers} active`,
      changeDirection: 'up' as const,
      iconBackground: getColor('primary'),
      iconColor: getColor('on-primary'),
    },
    {
      title: 'Active Users',
      value: props.stats.activeUsers.toLocaleString(),
      icon: 'person_check',
      changeText: `${activePercentage}% of total`,
      changeDirection: 'up' as const,
      iconBackground: getColor('success'),
      iconColor: getColor('on-success'),
    },
    {
      title: 'Inactive Users',
      value: props.stats.inactiveUsers.toLocaleString(),
      icon: 'person_off',
      changeText: `${inactivePercentage}% of total`,
      changeDirection: 'down' as const,
      iconBackground: getColor('warning'),
      iconColor: getColor('on-warning'),
    },
    {
      title: 'Online Now',
      value: props.stats.onlineUsers.toLocaleString(),
      icon: 'online_prediction',
      changeText: `${onlinePercentage}% of active`,
      changeDirection: 'up' as const,
      iconBackground: getColor('info'),
      iconColor: getColor('on-info'),
    },
  ]
})

const roleStatsCards = computed(() => {
  if (!props.stats?.roleStats) return []

  const roleColors: Record<string, { bg: string; on: string }> = {
    admin: { bg: getColor('danger'), on: getColor('on-danger') },
    user: { bg: getColor('secondary'), on: getColor('on-secondary') },
    owner: { bg: getColor('warning'), on: getColor('on-warning') },
    student: { bg: getColor('info'), on: getColor('on-info') },
    researcher: { bg: getColor('success'), on: getColor('on-success') },
  }

  const roleIcons: Record<string, string> = {
    admin: 'admin_panel_settings',
    user: 'person',
    owner: 'star',
    student: 'school',
    researcher: 'science',
  }

  const totalUsers = props.stats.totalUsers

  return Object.entries(props.stats.roleStats).map(([role, count]) => {
    const percentage = totalUsers > 0 ? ((count / totalUsers) * 100).toFixed(1) : '0'
    const colors = roleColors[role] || { bg: getColor('secondary'), on: getColor('on-secondary') }

    return {
      title: role.charAt(0).toUpperCase() + role.slice(1),
      value: count.toString(),
      icon: roleIcons[role] || 'person',
      changeText: `${percentage}% of users`,
      changeDirection: 'up' as const,
      iconBackground: colors.bg,
      iconColor: colors.on,
    }
  })
})
</script>

<template>
  <div class="user-stats">
    <!-- Main Statistics -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <DataSectionItem
        v-for="stat in statsCards"
        :key="stat.title"
        :title="stat.title"
        :value="loading ? '-' : stat.value"
        :change-text="loading ? '-' : stat.changeText"
        :up="stat.changeDirection === 'up'"
        :icon-background="stat.iconBackground"
        :icon-color="stat.iconColor"
      >
        <template #icon>
          <VaIcon :name="stat.icon" size="large" />
        </template>
      </DataSectionItem>
    </div>

    <!-- Role Statistics -->
    <div v-if="roleStatsCards.length > 0" class="role-stats">
      <h3 class="text-lg font-semibold mb-4 text-secondary">User Roles Distribution</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <DataSectionItem
          v-for="roleStat in roleStatsCards"
          :key="roleStat.title"
          :title="roleStat.title"
          :value="loading ? '-' : roleStat.value"
          :change-text="loading ? '-' : roleStat.changeText"
          :up="roleStat.changeDirection === 'up'"
          :icon-background="roleStat.iconBackground"
          :icon-color="roleStat.iconColor"
        >
          <template #icon>
            <VaIcon :name="roleStat.icon" size="large" />
          </template>
        </DataSectionItem>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.user-stats {
  .grid {
    gap: 1rem;
  }
}
</style>