<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    page: number
    pageCount: number
    pageSize: number
    pageSizeOptions?: readonly number[]
    /** Total rows after filtering, shown in the range summary. */
    total: number
  }>(),
  { pageSizeOptions: () => [10, 20, 50] },
)

const emit = defineEmits<{
  'update:page': [page: number]
  'update:pageSize': [size: number]
}>()

const from = computed(() => (props.total === 0 ? 0 : (props.page - 1) * props.pageSize + 1))
const to = computed(() => Math.min(props.page * props.pageSize, props.total))

/** `1 … 4 5 6 … 12`: keeps the control narrow without hiding the current page. */
const pages = computed<(number | 'gap')[]>(() => {
  const count = props.pageCount
  const current = props.page

  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1)
  if (current <= 3) return [1, 2, 3, 4, 'gap', count]
  if (current >= count - 2) return [1, 'gap', count - 3, count - 2, count - 1, count]

  return [1, 'gap', current - 1, current, current + 1, 'gap', count]
})
</script>

<template>
  <div
    class="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3"
    data-testid="table-pagination"
  >
    <p class="text-xs text-muted-foreground tabular-nums">
      共 {{ total }} 条 · 第 {{ from }}–{{ to }} 条
    </p>

    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2">
        <span class="text-xs text-muted-foreground">每页</span>
        <Select
          :model-value="String(pageSize)"
          @update:model-value="(value) => emit('update:pageSize', Number(value))"
        >
          <SelectTrigger class="h-8 w-18" aria-label="每页条数">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="size in pageSizeOptions" :key="size" :value="String(size)">
              {{ size }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          :disabled="page <= 1"
          aria-label="上一页"
          data-testid="page-prev"
          @click="emit('update:page', page - 1)"
        >
          <ChevronLeft aria-hidden="true" />
        </Button>

        <template v-for="(entry, index) in pages" :key="`${entry}-${index}`">
          <span v-if="entry === 'gap'" class="px-1 text-xs text-muted-foreground">…</span>
          <Button
            v-else
            :variant="entry === page ? 'default' : 'outline'"
            size="icon-sm"
            :class="cn('tabular-nums', entry === page && 'pointer-events-none')"
            :aria-current="entry === page ? 'page' : undefined"
            :aria-label="`第 ${entry} 页`"
            @click="emit('update:page', entry)"
          >
            {{ entry }}
          </Button>
        </template>

        <Button
          variant="outline"
          size="icon-sm"
          :disabled="page >= pageCount"
          aria-label="下一页"
          data-testid="page-next"
          @click="emit('update:page', page + 1)"
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  </div>
</template>
