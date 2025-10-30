<script setup lang="ts">
import { ref, watchEffect, watch } from 'vue'
import UsersTable from './widgets/UsersTable.vue'
import UserStats from './widgets/UserStats.vue'
import EditUserForm from './widgets/EditUserForm.vue'
import { User } from './types'
import { useUsers } from './composables/useUsers'
import { useModal, useToast } from 'vuestic-ui'
import { useProjects } from '../projects/composables/useProjects'

const doShowEditUserModal = ref(false)

const { users, isLoading, filters, sorting, pagination, error, stats, ...usersApi } = useUsers()
const { projects } = useProjects()

const userToEdit = ref<User | null>(null)
const selectedUsers = ref<User[]>([])

// Debug watcher
watch(selectedUsers, (newVal) => {
  console.log('Selected users changed:', newVal.length, newVal)
}, { deep: true })

const showEditUserModal = (user: User) => {
  userToEdit.value = user
  doShowEditUserModal.value = true
}

const showAddUserModal = () => {
  userToEdit.value = null
  doShowEditUserModal.value = true
}

const { init: notify } = useToast()

watchEffect(() => {
  if (error.value) {
    notify({
      message: error.value.message,
      color: 'danger',
    })
  }
})

const onUserSaved = async (user: User) => {
  if (user.avatar.startsWith('blob:')) {
    const blob = await fetch(user.avatar).then((r) => r.blob())
    const { publicUrl } = await usersApi.uploadAvatar(blob)
    user.avatar = publicUrl
  }

  if (userToEdit.value) {
    await usersApi.update(user)
    // Refresh stats after update in case active status changed
    await usersApi.fetchStats()
    if (!error.value) {
      notify({
        message: `${user.fullname} has been updated`,
        color: 'success',
      })
    }
  } else {
    await usersApi.add(user)
    // Refresh stats after adding new user
    await usersApi.fetchStats()

    if (!error.value) {
      notify({
        message: `${user.fullname} has been created`,
        color: 'success',
      })
    }
  }
}

const onUserDelete = async (user: User) => {
  await usersApi.remove(user)
  // Refresh stats after deletion since user count has changed
  await usersApi.fetchStats()
  notify({
    message: `${user.fullname} has been permanently deleted`,
    color: 'success',
  })
}

const handleBulkDeleteClick = async () => {
  if (selectedUsers.value.length === 0) return

  const count = selectedUsers.value.length

  const agreed = await confirm({
    title: 'Permanently Delete Multiple Users',
    message: `Are you sure you want to permanently delete ${count} user(s)? This action cannot be undone.`,
    okText: 'Delete All',
    cancelText: 'Cancel',
    size: 'small',
    maxWidth: '380px',
  })

  if (agreed) {
    await usersApi.bulkRemove([...selectedUsers.value])
    // Clear selection after successful deletion
    selectedUsers.value = []
    // Refresh stats after bulk deletion
    await usersApi.fetchStats()
    notify({
      message: `${count} user(s) have been permanently deleted`,
      color: 'success',
    })
  }
}

const editFormRef = ref()

const { confirm } = useModal()

const beforeEditFormModalClose = async (hide: () => unknown) => {
  if (editFormRef.value.isFormHasUnsavedChanges) {
    const agreed = await confirm({
      maxWidth: '380px',
      message: 'Form has unsaved changes. Are you sure you want to close it?',
      size: 'small',
    })
    if (agreed) {
      hide()
    }
  } else {
    hide()
  }
}
</script>

<template>
  <h1 class="page-title">Users</h1>

  <!-- User Statistics -->
  <UserStats :stats="stats" :loading="isLoading" class="mb-6" />

  <VaCard>
    <VaCardContent>
      <div class="flex flex-col md:flex-row gap-2 mb-2 justify-between">
        <div class="flex flex-col md:flex-row gap-2 justify-start">
          <VaButtonToggle
            v-model="filters.isActive"
            color="background-element"
            border-color="background-element"
            :options="[
              { label: 'Active', value: true },
              { label: 'Inactive', value: false },
            ]"
          />
          <VaInput v-model="filters.search" placeholder="Search">
            <template #prependInner>
              <VaIcon name="search" color="secondary" size="small" />
            </template>
          </VaInput>
        </div>
        <div class="flex gap-2">
          <VaButton
            v-if="selectedUsers.length > 0"
            color="danger"
            @click="handleBulkDeleteClick"
          >
            Delete Selected ({{ selectedUsers.length }})
          </VaButton>
          <VaButton @click="showAddUserModal">Add User</VaButton>
        </div>
      </div>

      <div v-if="selectedUsers.length > 0" class="mb-2 text-sm">
        Debug: {{ selectedUsers.length }} user(s) selected
      </div>

      <UsersTable
        v-model:sort-by="sorting.sortBy"
        v-model:sorting-order="sorting.sortingOrder"
        v-model:selected-users="selectedUsers"
        :users="users"
        :projects="projects"
        :loading="isLoading"
        :pagination="pagination"
        @editUser="showEditUserModal"
        @deleteUser="onUserDelete"
      />
    </VaCardContent>
  </VaCard>

  <VaModal
    v-slot="{ cancel, ok }"
    v-model="doShowEditUserModal"
    size="small"
    mobile-fullscreen
    close-button
    hide-default-actions
    :before-cancel="beforeEditFormModalClose"
  >
    <h1 class="va-h5">{{ userToEdit ? 'Edit user' : 'Add user' }}</h1>
    <EditUserForm
      ref="editFormRef"
      :user="userToEdit"
      :save-button-label="userToEdit ? 'Save' : 'Add'"
      @close="cancel"
      @save="
        (user) => {
          onUserSaved(user)
          ok()
        }
      "
    />
  </VaModal>
</template>
