<template>
  <VaLayout v-if="breakpoint.lgUp" class="h-screen">
    <template #left>
      <RouterLink
        class="h-full flex items-center justify-center bg-blend-overlay relative"
        :style="{
          width: '65vw',
          background: 'linear-gradient(rgba(14, 65, 201, 0.8), rgba(14, 65, 201, 0.8)), url(/karabuk.jpg) center/cover',
        }"
        to="/"
        aria-label="Visit homepage"
      >
        <VuesticLogo :height="28" start="#FFF" />
      </RouterLink>
    </template>
    <template #content>
      <main class="h-full flex items-center justify-center mx-auto" style="max-width: 35vw">
        <RouterView />
      </main>
    </template>
  </VaLayout>

  <VaLayout
    v-else
    class="h-screen relative"
    :style="{
      background: 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(/karabuk.jpg) center/cover',
    }"
  >
    <template #content>
      <div class="p-4">
        <main class="h-full flex flex-row items-center justify-start mx-auto max-w-[420px]">
          <div class="flex flex-col items-start">
            <RouterLink class="py-4" to="/" aria-label="Visit homepage">
              <VuesticLogo class="mb-2" start="#0E41C9" />
            </RouterLink>
            <RouterView />
          </div>
        </main>
      </div>
    </template>
  </VaLayout>
</template>

<script lang="ts" setup>
import { useBreakpoint } from 'vuestic-ui'
import VuesticLogo from '../components/VuesticLogo.vue'

const breakpoint = useBreakpoint()
</script>
