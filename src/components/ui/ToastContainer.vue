<script setup lang="ts">
import type { Component } from 'vue'
import { CircleAlert, CircleCheck, Info, X } from '@lucide/vue'

import { useToast, type ToastVariant } from '@/composables/useToast'
import { cn } from '@/lib/utils'

const { toasts, dismiss } = useToast()

const variantStyles: Record<ToastVariant, string> = {
  success: 'text-emerald-600 dark:text-emerald-400',
  error: 'text-rose-600 dark:text-rose-400',
  info: 'text-sky-600 dark:text-sky-400',
}

const variantIcons: Record<ToastVariant, Component> = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
}
</script>

<template>
  <Teleport to="body">
    <TransitionGroup
      tag="ol"
      name="toast"
      data-testid="toast-region"
      class="pointer-events-none fixed right-6 bottom-6 z-[90] flex w-full max-w-sm flex-col items-end gap-2"
      aria-live="polite"
      aria-atomic="false"
    >
      <li
        v-for="item in toasts"
        :key="item.id"
        data-testid="toast"
        :data-variant="item.variant"
        :class="
          cn(
            'pointer-events-auto flex w-full items-start gap-3 rounded-xl border bg-card p-3.5 text-card-foreground shadow-lg',
          )
        "
      >
        <component
          :is="variantIcons[item.variant]"
          :class="cn('mt-0.5 size-5 shrink-0', variantStyles[item.variant])"
          aria-hidden="true"
        />
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold">{{ item.title }}</p>
          <p v-if="item.description" class="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {{ item.description }}
          </p>
        </div>
        <button
          type="button"
          class="-mt-1 -mr-1 grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          aria-label="关闭通知"
          @click="dismiss(item.id)"
        >
          <X class="size-4" aria-hidden="true" />
        </button>
      </li>
    </TransitionGroup>
  </Teleport>
</template>
