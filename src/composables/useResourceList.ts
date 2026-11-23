import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'

import { useListQuery } from './useListQuery'

export type SortDirection = 'asc' | 'desc'

export interface ResourceListOptions<T> {
  /** Source rows, usually a store getter. Filtering never mutates it. */
  rows: Ref<readonly T[]>
  rowId: (row: T) => string
  /** Text fields matched by `q` (case-insensitive, joined with spaces). */
  search: (row: T) => readonly (string | null | undefined)[]
  /** Named filters keyed by query parameter; `all` means "no filter applied". */
  filters?: Record<string, (row: T, value: string) => boolean>
  /** Comparators keyed by the `sort` key. */
  sorters: Record<string, (a: T, b: T) => number>
  /** Initial `key:direction`, e.g. `at:desc`. Must exist in `sorters`. */
  defaultSort: string
  defaultPageSize?: number
  pageSizeOptions?: readonly number[]
  /** Default value per filter key. Missing keys default to `all`. */
  filterDefaults?: Record<string, string>
  /** Allow-list for filter values; anything else falls back to the default. */
  allowed?: Record<string, readonly string[]>
  /** URL write debounce for text search, in milliseconds. */
  debounceMs?: number
}

export interface ResourceList<T> {
  /** Reactive query state; bind inputs directly to `filters.q` and friends. */
  filters: Record<string, string>
  /** Current page slice: filtered → sorted → paginated. */
  rows: ComputedRef<T[]>
  /** Rows after filtering (before pagination). */
  filteredRows: ComputedRef<T[]>
  total: ComputedRef<number>
  page: ComputedRef<number>
  pageSize: ComputedRef<number>
  pageCount: ComputedRef<number>
  sortKey: ComputedRef<string>
  sortDir: ComputedRef<SortDirection>
  isDirty: ComputedRef<boolean>
  /** Selected ids across pages, in insertion order. */
  selectedIds: Ref<string[]>
  allOnPageSelected: ComputedRef<boolean>
  someOnPageSelected: ComputedRef<boolean>
  setSort: (key: string) => void
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  toggleRow: (id: string) => void
  toggleAllOnPage: () => void
  clearSelection: () => void
  /** Drop ids the caller just deleted, so a stale selection cannot act on them. */
  removeFromSelection: (ids: readonly string[]) => void
  reset: () => void
}

const DEFAULT_PAGE_SIZE = 10

/**
 * The reusable "list management" layer: search, filters, sorting, pagination and
 * selection for any collection of rows.
 *
 * Filter/sort/page state lives in the URL (via `useListQuery`) so a filtered list
 * is shareable and survives a reload; the data stays in the caller's store. Both
 * `/members` and `/audit` are thin wrappers around this composable, which is what
 * makes it a template feature rather than a one-page helper.
 */
export function useResourceList<T>(options: ResourceListOptions<T>): ResourceList<T> {
  const {
    rows,
    rowId,
    search,
    filters: predicates = {},
    sorters,
    defaultSort,
    defaultPageSize = DEFAULT_PAGE_SIZE,
    pageSizeOptions = [10, 20, 50],
    filterDefaults = {},
    allowed = {},
    debounceMs = 250,
  } = options

  const filterKeys = Object.keys(predicates)
  const sortKeys = Object.keys(sorters)

  if (!sortKeys.includes(defaultSort.split(':')[0] ?? '')) {
    throw new Error(`useResourceList: defaultSort "${defaultSort}" has no comparator`)
  }

  const defaults: Record<string, string> = {
    q: '',
    page: '1',
    pageSize: String(defaultPageSize),
    sort: defaultSort,
  }

  for (const key of filterKeys) {
    defaults[key] = filterDefaults[key] ?? 'all'
  }

  const sortValues = sortKeys.flatMap((key) => [`${key}:asc`, `${key}:desc`])

  const { filters, reset, isDirty } = useListQuery<Record<string, string>>({
    defaults,
    allowed: {
      pageSize: pageSizeOptions.map(String),
      sort: sortValues,
      ...allowed,
    },
    debounceMs,
  })

  const normalizedQuery = computed(() => (filters.q ?? '').trim().toLowerCase())

  const filteredRows = computed<T[]>(() => {
    const query = normalizedQuery.value

    return rows.value.filter((row) => {
      if (query) {
        const haystack = search(row)
          .filter((part): part is string => typeof part === 'string' && part.length > 0)
          .join(' ')
          .toLowerCase()

        if (!haystack.includes(query)) return false
      }

      for (const key of filterKeys) {
        const value = filters[key]
        if (!value || value === 'all') continue

        const predicate = predicates[key]
        if (predicate && !predicate(row, value)) return false
      }

      return true
    })
  })

  const sortKey = computed(() => {
    const raw = (filters.sort ?? defaultSort).split(':')
    const key = raw[0] ?? ''
    return sortKeys.includes(key) ? key : (sortKeys[0] as string)
  })

  const sortDir = computed<SortDirection>(() =>
    (filters.sort ?? defaultSort).endsWith(':asc') ? 'asc' : 'desc',
  )

  const sortedRows = computed<T[]>(() => {
    const comparator = sorters[sortKey.value]
    if (!comparator) return [...filteredRows.value]

    const sorted = [...filteredRows.value].sort(comparator)
    return sortDir.value === 'asc' ? sorted : sorted.reverse()
  })

  const total = computed(() => filteredRows.value.length)

  const pageSize = computed(() => {
    const parsed = Number(filters.pageSize)
    return pageSizeOptions.includes(parsed) ? parsed : defaultPageSize
  })

  const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

  const page = computed(() => {
    const parsed = Number(filters.page)
    if (!Number.isFinite(parsed) || parsed < 1) return 1
    return Math.min(Math.floor(parsed), pageCount.value)
  })

  // Normalize the URL instead of silently rendering a different page than the URL says.
  watch([page, pageCount, () => filters.page], () => {
    if (filters.page !== String(page.value)) filters.page = String(page.value)
  })

  const rowsOnPage = computed<T[]>(() => {
    const start = (page.value - 1) * pageSize.value
    return sortedRows.value.slice(start, start + pageSize.value)
  })

  const selectedIds = ref<string[]>([])
  const selectedSet = computed(() => new Set(selectedIds.value))

  const allOnPageSelected = computed(
    () =>
      rowsOnPage.value.length > 0 &&
      rowsOnPage.value.every((row) => selectedSet.value.has(rowId(row))),
  )

  const someOnPageSelected = computed(
    () =>
      !allOnPageSelected.value && rowsOnPage.value.some((row) => selectedSet.value.has(rowId(row))),
  )

  function setSort(key: string): void {
    if (!sortKeys.includes(key)) return

    const nextDir: SortDirection = key === sortKey.value && sortDir.value === 'asc' ? 'desc' : 'asc'
    filters.sort = `${key}:${nextDir}`
    filters.page = '1'
  }

  function setPage(next: number): void {
    filters.page = String(Math.min(Math.max(1, next), pageCount.value))
  }

  function setPageSize(size: number): void {
    if (!pageSizeOptions.includes(size)) return
    filters.pageSize = String(size)
    filters.page = '1'
  }

  function toggleRow(id: string): void {
    selectedIds.value = selectedSet.value.has(id)
      ? selectedIds.value.filter((candidate) => candidate !== id)
      : [...selectedIds.value, id]
  }

  function toggleAllOnPage(): void {
    const pageIds = rowsOnPage.value.map(rowId)

    if (allOnPageSelected.value) {
      selectedIds.value = selectedIds.value.filter((id) => !pageIds.includes(id))
      return
    }

    selectedIds.value = [...new Set([...selectedIds.value, ...pageIds])]
  }

  function clearSelection(): void {
    selectedIds.value = []
  }

  function removeFromSelection(ids: readonly string[]): void {
    const removed = new Set(ids)
    selectedIds.value = selectedIds.value.filter((id) => !removed.has(id))
  }

  function resetAll(): void {
    reset()
    clearSelection()
  }

  return {
    filters,
    rows: rowsOnPage,
    filteredRows,
    total,
    page,
    pageSize,
    pageCount,
    sortKey,
    sortDir,
    isDirty,
    selectedIds,
    allOnPageSelected,
    someOnPageSelected,
    setSort,
    setPage,
    setPageSize,
    toggleRow,
    toggleAllOnPage,
    clearSelection,
    removeFromSelection,
    reset: resetAll,
  }
}
