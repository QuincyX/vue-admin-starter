<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Hides the wordmark when the sidebar is collapsed. */
    compact?: boolean
  }>(),
  { compact: false },
)

const appVersion = __APP_VERSION__
</script>

<template>
  <RouterLink
    to="/"
    class="flex items-center gap-2.5 rounded-lg focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    aria-label="Aurora Admin 首页"
  >
    <span
      class="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm"
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" class="size-5">
        <path
          d="M4 18.5 12 4l8 14.5"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path d="M8.2 14.5h7.6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </span>

    <span v-if="!compact" class="min-w-0">
      <span class="block text-sm font-semibold tracking-tight text-sidebar-foreground">
        Aurora <span class="text-muted-foreground">Admin</span>
      </span>
      <span class="block text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
        v{{ appVersion }} · 管理控制台
      </span>
    </span>
  </RouterLink>
</template>
