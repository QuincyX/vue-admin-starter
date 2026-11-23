<script setup lang="ts" generic="T extends { id: string }">
import { computed } from 'vue'
import { ArrowDown, ArrowUp, ArrowUpDown } from '@lucide/vue'

import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { DataTableColumn, DataTableSort } from './types'

/**
 * The generic table used by every list page.
 *
 * It stays presentation-only: rows arrive already filtered, sorted and paged by
 * `useResourceList()`, and selection is controlled from above. That split is what
 * lets `/members` and `/audit` share one table while keeping different columns,
 * cells and actions — cells are rendered through `#cell-<key>` slots.
 */
const props = withDefaults(
  defineProps<{
    columns: DataTableColumn[]
    rows: T[]
    loading?: boolean
    sort?: DataTableSort | null
    selectable?: boolean
    selected?: string[]
    /** Accessible name per row, used by the selection checkboxes. */
    rowLabel?: (row: T) => string
    emptyTitle?: string
    emptyDescription?: string
    skeletonRows?: number
    /** Highlights the click target when a row opens a detail view. */
    clickableRows?: boolean
  }>(),
  {
    loading: false,
    sort: null,
    selectable: false,
    selected: () => [],
    rowLabel: undefined,
    emptyTitle: '暂无数据',
    emptyDescription: '调整筛选条件，或稍后重试。',
    skeletonRows: 5,
    clickableRows: false,
  },
)

const emit = defineEmits<{
  sort: [key: string]
  'update:selected': [ids: string[]]
  rowClick: [row: T]
}>()

const selectedSet = computed(() => new Set(props.selected))
const pageIds = computed(() => props.rows.map((row) => row.id))

const allSelected = computed(
  () => pageIds.value.length > 0 && pageIds.value.every((id) => selectedSet.value.has(id)),
)

const someSelected = computed(
  () => !allSelected.value && pageIds.value.some((id) => selectedSet.value.has(id)),
)

const headerCheckbox = computed(() =>
  allSelected.value ? true : someSelected.value ? 'indeterminate' : false,
)

const columnCount = computed(() => props.columns.length + (props.selectable ? 1 : 0))

function labelFor(row: T): string {
  return props.rowLabel ? props.rowLabel(row) : row.id
}

function toggleRow(id: string): void {
  emit(
    'update:selected',
    selectedSet.value.has(id)
      ? props.selected.filter((candidate) => candidate !== id)
      : [...props.selected, id],
  )
}

function toggleAll(): void {
  const pageSelected = pageIds.value.every((id) => selectedSet.value.has(id))

  emit(
    'update:selected',
    pageSelected
      ? props.selected.filter((id) => !pageIds.value.includes(id))
      : [...new Set([...props.selected, ...pageIds.value])],
  )
}

function ariaSort(column: DataTableColumn): 'ascending' | 'descending' | 'none' {
  if (!column.sortable || props.sort?.key !== column.key) return 'none'
  return props.sort.dir === 'asc' ? 'ascending' : 'descending'
}

function alignmentClass(column: DataTableColumn): string | undefined {
  if (column.align === 'right') return 'text-right'
  if (column.align === 'center') return 'text-center'
  return undefined
}

function cellValue(row: T, key: string): string {
  const value = (row as Record<string, unknown>)[key]
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}
</script>

<template>
  <Table data-testid="data-table">
    <TableHeader>
      <TableRow class="hover:bg-transparent">
        <TableHead v-if="selectable" class="w-10 pr-0">
          <Checkbox
            :model-value="headerCheckbox"
            aria-label="全选当前页"
            @update:model-value="toggleAll"
          />
        </TableHead>

        <TableHead
          v-for="column in columns"
          :key="column.key"
          :aria-sort="ariaSort(column)"
          :style="column.width ? { width: column.width } : undefined"
          :class="alignmentClass(column)"
        >
          <button
            v-if="column.sortable"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-sm font-medium transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
            :aria-label="`按${column.header}排序`"
            @click="emit('sort', column.key)"
          >
            {{ column.header }}
            <ArrowUp
              v-if="sort?.key === column.key && sort.dir === 'asc'"
              class="size-3.5 text-foreground"
              aria-hidden="true"
            />
            <ArrowDown
              v-else-if="sort?.key === column.key && sort.dir === 'desc'"
              class="size-3.5 text-foreground"
              aria-hidden="true"
            />
            <ArrowUpDown v-else class="size-3.5 opacity-40" aria-hidden="true" />
          </button>
          <template v-else>{{ column.header }}</template>
        </TableHead>
      </TableRow>
    </TableHeader>

    <TableBody>
      <template v-if="loading">
        <TableRow v-for="row in skeletonRows" :key="`skeleton-${row}`" class="hover:bg-transparent">
          <TableCell v-if="selectable"><Skeleton class="size-4" /></TableCell>
          <TableCell v-for="column in columns" :key="column.key">
            <Skeleton class="h-4" :class="column.align === 'right' ? 'ml-auto w-16' : 'w-28'" />
          </TableCell>
        </TableRow>
      </template>

      <TableEmpty v-else-if="rows.length === 0" :colspan="columnCount">
        <slot name="empty" :title="emptyTitle" :description="emptyDescription">
          <p class="text-sm font-medium text-foreground">{{ emptyTitle }}</p>
          <p class="mt-1 text-xs text-muted-foreground">{{ emptyDescription }}</p>
        </slot>
      </TableEmpty>

      <template v-else>
        <TableRow
          v-for="row in rows"
          :key="row.id"
          data-testid="data-row"
          :data-row-id="row.id"
          :class="cn(clickableRows && 'cursor-pointer')"
          @click="clickableRows && emit('rowClick', row)"
        >
          <TableCell v-if="selectable" class="pr-0" @click.stop>
            <Checkbox
              :model-value="selectedSet.has(row.id)"
              :aria-label="`选择 ${labelFor(row)}`"
              @update:model-value="toggleRow(row.id)"
            />
          </TableCell>

          <TableCell
            v-for="column in columns"
            :key="column.key"
            :class="cn(alignmentClass(column), column.class)"
          >
            <slot :name="`cell-${column.key}`" :row="row" :value="cellValue(row, column.key)">
              {{ cellValue(row, column.key) }}
            </slot>
          </TableCell>
        </TableRow>
      </template>
    </TableBody>
  </Table>
</template>
