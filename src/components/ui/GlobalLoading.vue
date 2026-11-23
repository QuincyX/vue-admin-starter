<script setup lang="ts">
import { LoaderCircle } from '@lucide/vue'

import { useLoadingStore } from '@/stores/loading'

/**
 * Global blocking overlay for operations that must not be interrupted twice
 * (sign-out, password change). Rendered from `App.vue` so every view gets the same
 * behaviour and the same accessible announcement.
 */
const loading = useLoadingStore()
</script>

<template>
  <Teleport to="body">
    <Transition name="global-loading">
      <div
        v-if="loading.isLoading"
        data-testid="global-loading"
        class="fixed inset-0 z-[95] grid place-items-center bg-slate-950/55 p-6 backdrop-blur-sm"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div
          class="flex flex-col items-center gap-3 rounded-xl border bg-card px-6 py-5 text-center shadow-xl"
        >
          <LoaderCircle class="size-7 animate-spin text-primary" aria-hidden="true" />
          <p class="text-sm font-medium text-foreground">{{ loading.message }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.global-loading-enter-active,
.global-loading-leave-active {
  transition: opacity 0.18s ease;
}

.global-loading-enter-from,
.global-loading-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .global-loading-enter-active,
  .global-loading-leave-active {
    transition: none;
  }
}
</style>
