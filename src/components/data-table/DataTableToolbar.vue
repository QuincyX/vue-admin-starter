<script setup lang="ts">
import { computed } from 'vue'
import { Search, X } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const props = withDefaults(
  defineProps<{
    /** Optional because URL-backed filters are `string | undefined` when absent. */
    search?: string
    searchPlaceholder?: string
    /** e.g. `共 24 位成员`; omit to hide the summary. */
    resultText?: string
    /** Shows the reset button when any filter differs from its default. */
    dirty?: boolean
  }>(),
  { search: undefined, searchPlaceholder: '搜索…', resultText: undefined, dirty: false },
)

const emit = defineEmits<{
  'update:search': [value: string]
  reset: []
}>()

const currentSearch = computed(() => props.search ?? '')
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <div class="relative w-64">
      <Search
        class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        :model-value="currentSearch"
        type="search"
        class="h-9 pl-8"
        :placeholder="searchPlaceholder"
        aria-label="搜索"
        data-testid="table-search"
        @update:model-value="(value) => emit('update:search', String(value ?? ''))"
      />
    </div>

    <slot name="filters" />

    <Button
      v-if="dirty"
      variant="ghost"
      size="sm"
      class="text-muted-foreground"
      data-testid="reset-filters"
      @click="emit('reset')"
    >
      <X aria-hidden="true" />
      重置筛选
    </Button>

    <div class="ml-auto flex items-center gap-2">
      <p v-if="resultText" class="text-xs text-muted-foreground tabular-nums">
        {{ resultText }}
      </p>
      <slot name="actions" />
    </div>
  </div>
</template>
