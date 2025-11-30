<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { PROJECT_FIELD_TYPES, type ProjectFieldType } from '../../types/projects.types'
import PublicProjectCard from './widgets/PublicProjectCard.vue'
import { usePublicProjects } from './composables/usePublicProjects'

const route = useRoute()

const { 
  projects, 
  isLoading, 
  filters, 
  searchQuery, 
  fetchProjects,
  totalCount 
} = usePublicProjects()

const viewMode = ref<'grid' | 'list'>('grid')
const selectedFieldTypes = ref<ProjectFieldType[]>([])
const sortBy = ref<'newest' | 'popular' | 'ending_soon'>('newest')

const applyFilters = () => {
  filters.value = {
    field_type: selectedFieldTypes.value.length === 1 ? selectedFieldTypes.value[0] : undefined,
    search: searchQuery.value,
    status: 'active',
  }
  fetchProjects()
}

const clearFilters = () => {
  selectedFieldTypes.value = []
  searchQuery.value = ''
  filters.value = { status: 'active' }
  fetchProjects()
}

const hasActiveFilters = computed(() => {
  return selectedFieldTypes.value.length > 0 || searchQuery.value !== ''
})

const handleApplicationSubmitted = () => {
  fetchProjects()
}

// Initial load
fetchProjects()
</script>

<template>
  <div class="public-projects-page">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h1 class="va-h1 mb-2">Yayınlanan İlanlar</h1>
        <p class="text-secondary">Akademik ortaklık projelerini keşfedin ve başvurun</p>
      </div>
      <div class="flex gap-2 mt-4 md:mt-0">
        <VaButtonToggle
          v-model="viewMode"
          :options="[
            { label: 'Grid', value: 'grid', icon: 'grid_view' },
            { label: 'List', value: 'list', icon: 'view_list' },
          ]"
          color="primary"
          border-color="primary"
        />
      </div>
    </div>

    <!-- Filters Section -->
    <VaCard class="mb-6">
      <VaCardContent>
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
          <!-- Search -->
          <div class="md:col-span-5">
            <VaInput
              v-model="searchQuery"
              placeholder="Proje ara... (başlık, açıklama, yetenekler)"
              class="w-full"
              @keyup.enter="applyFilters"
            >
              <template #prependInner>
                <VaIcon name="search" />
              </template>
            </VaInput>
          </div>

          <!-- Field Type Filter -->
          <div class="md:col-span-4">
            <VaSelect
              v-model="selectedFieldTypes"
              :options="PROJECT_FIELD_TYPES"
              text-by="label"
              value-by="value"
              placeholder="Tüm Alanlar"
              multiple
              searchable
            >
              <template #prependInner>
                <VaIcon name="category" size="small" />
              </template>
            </VaSelect>
          </div>

          <!-- Sort By -->
          <div class="md:col-span-3 flex gap-2">
            <VaSelect
              v-model="sortBy"
              :options="[
                { text: 'En Yeni', value: 'newest' },
                { text: 'Popüler', value: 'popular' },
                { text: 'Bitiş Yakın', value: 'ending_soon' },
              ]"
              text-by="text"
              value-by="value"
              class="flex-1"
            >
              <template #prependInner>
                <VaIcon name="sort" size="small" />
              </template>
            </VaSelect>
          </div>
        </div>

        <!-- Filter Actions -->
        <div class="flex gap-2 mt-4">
          <VaButton @click="applyFilters" :loading="isLoading">
            <VaIcon name="filter_list" class="mr-1" />
            Filtrele
          </VaButton>
          <VaButton
            v-if="hasActiveFilters"
            preset="secondary"
            @click="clearFilters"
          >
            <VaIcon name="clear" class="mr-1" />
            Temizle
          </VaButton>
        </div>

        <!-- Active Filters Display -->
        <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 mt-4">
          <VaChip
            v-for="fieldType in selectedFieldTypes"
            :key="fieldType"
            closeable
            @update:model-value="() => { selectedFieldTypes = selectedFieldTypes.filter(f => f !== fieldType) }"
          >
            {{ PROJECT_FIELD_TYPES.find(f => f.value === fieldType)?.label }}
          </VaChip>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Results Count -->
    <div class="flex justify-between items-center mb-4">
      <p class="text-secondary">
        <VaIcon name="folder_open" size="small" />
        {{ totalCount }} proje bulundu
      </p>
    </div>

    <!-- Projects Grid/List -->
    <VaInnerLoading :loading="isLoading" class="min-h-[400px]">
      <div v-if="projects.length > 0">
        <!-- Grid View -->
        <div
          v-if="viewMode === 'grid'"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <PublicProjectCard
            v-for="project in projects"
            :key="project.id"
            :project="project"
            @refresh-needed="handleApplicationSubmitted"
          />
        </div>

        <!-- List View -->
        <div v-else class="flex flex-col gap-4">
          <PublicProjectCard
            v-for="project in projects"
            :key="project.id"
            :project="project"
            list-mode
            @refresh-needed="handleApplicationSubmitted"
          />
        </div>
      </div>

      <!-- Empty State -->
      <VaCard v-else class="text-center py-12">
        <VaIcon name="search_off" size="64px" color="secondary" class="mb-4" />
        <h3 class="va-h3 mb-2">Proje Bulunamadı</h3>
        <p class="text-secondary mb-4">
          Arama kriterlerinize uygun proje bulunmadı. Filtreleri değiştirmeyi deneyin.
        </p>
        <VaButton v-if="hasActiveFilters" @click="clearFilters">
          Filtreleri Temizle
        </VaButton>
      </VaCard>
    </VaInnerLoading>
  </div>
</template>

<style scoped>
.public-projects-page {
  padding: 1rem;
}
</style>
