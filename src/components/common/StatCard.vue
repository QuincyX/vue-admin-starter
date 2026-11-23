<script setup lang="ts">
import { computed, type Component } from 'vue'
import { TrendingDown, TrendingUp } from '@lucide/vue'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatSignedPercent } from '@/utils/format'

const props = withDefaults(
  defineProps<{
    label: string
    value: string
    hint?: string
    /** Percentage change; positive renders green, negative red, omitted renders nothing. */
    trend?: number | null
    icon?: Component
    loading?: boolean
  }>(),
  { hint: undefined, trend: null, icon: undefined, loading: false },
)

const trendTone = computed(() => {
  if (props.trend === null || props.trend === 0) return 'text-muted-foreground'
  return props.trend > 0
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-rose-600 dark:text-rose-400'
})
</script>

<template>
  <Card class="gap-0 py-0">
    <CardContent class="flex flex-col gap-3 p-5">
      <div class="flex items-start justify-between gap-3">
        <p class="text-xs font-medium tracking-wide text-muted-foreground">{{ label }}</p>
        <span
          v-if="icon"
          class="grid size-8 place-items-center rounded-lg bg-accent text-accent-foreground"
          aria-hidden="true"
        >
          <component :is="icon" class="size-4" />
        </span>
      </div>

      <Skeleton v-if="loading" class="h-7 w-24" />
      <p v-else class="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
        {{ value }}
      </p>

      <div class="flex items-center gap-2 text-xs">
        <span
          v-if="trend !== null && trend !== undefined"
          :class="cn('inline-flex items-center gap-1 font-medium tabular-nums', trendTone)"
        >
          <TrendingUp v-if="trend > 0" class="size-3.5" aria-hidden="true" />
          <TrendingDown v-else-if="trend < 0" class="size-3.5" aria-hidden="true" />
          {{ formatSignedPercent(trend) }}
        </span>
        <span v-if="hint" class="text-muted-foreground">{{ hint }}</span>
      </div>
    </CardContent>
  </Card>
</template>
