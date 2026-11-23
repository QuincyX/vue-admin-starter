<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

withDefaults(
  defineProps<{
    title: string
    description?: string
    loading?: boolean
  }>(),
  { description: undefined, loading: false },
)
</script>

<template>
  <Card class="gap-0 py-0">
    <CardHeader class="flex flex-row items-start justify-between gap-3 space-y-0 p-5 pb-4">
      <div class="min-w-0">
        <CardTitle class="text-sm font-semibold">{{ title }}</CardTitle>
        <CardDescription v-if="description" class="mt-1 text-xs">
          {{ description }}
        </CardDescription>
      </div>

      <div v-if="$slots.actions" class="flex shrink-0 items-center gap-2">
        <slot name="actions" />
      </div>
    </CardHeader>

    <CardContent class="p-5 pt-0">
      <Skeleton v-if="loading" class="h-64 w-full" />
      <slot v-else />
    </CardContent>
  </Card>
</template>
