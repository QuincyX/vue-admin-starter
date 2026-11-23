import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { defineComponent, h, nextTick, ref } from 'vue'
import { describe, expect, it } from 'vitest'

import { useResourceList, type ResourceList } from '@/composables/useResourceList'

interface Row {
  id: string
  name: string
  status: 'active' | 'blocked'
  score: number
}

const ROWS: Row[] = [
  { id: 'r1', name: 'alpha', status: 'active', score: 30 },
  { id: 'r2', name: 'beta', status: 'blocked', score: 10 },
  { id: 'r3', name: 'gamma', status: 'active', score: 20 },
  { id: 'r4', name: 'delta', status: 'blocked', score: 40 },
]

interface Harness {
  list: ResourceList<Row>
  router: ReturnType<typeof createRouter>
  unmount: () => void
}

async function createHarness(): Promise<Harness> {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/items', name: 'items', component: { render: () => null } }],
  })

  await router.push('/items')
  await router.isReady()

  const source = ref<Row[]>(ROWS)
  let list!: ResourceList<Row>

  const TestComponent = defineComponent({
    setup() {
      list = useResourceList<Row>({
        rows: source,
        rowId: (row) => row.id,
        search: (row) => [row.name],
        filters: { status: (row, value) => row.status === value },
        sorters: {
          name: (a, b) => a.name.localeCompare(b.name),
          score: (a, b) => a.score - b.score,
        },
        defaultSort: 'name:asc',
        defaultPageSize: 2,
        pageSizeOptions: [2, 4],
        filterDefaults: { status: 'all' },
        allowed: { status: ['all', 'active', 'blocked'] },
        debounceMs: 0,
      })

      return () => h('div')
    },
  })

  const wrapper = mount(TestComponent, { global: { plugins: [router] } })

  return { list, router, unmount: () => wrapper.unmount() }
}

async function settle(): Promise<void> {
  await nextTick()
  await flushPromises()
}

describe('useResourceList', () => {
  it('paginates the sorted rows and reports the filtered total', async () => {
    const { list, unmount } = await createHarness()

    expect(list.total.value).toBe(4)
    expect(list.pageSize.value).toBe(2)
    expect(list.pageCount.value).toBe(2)
    expect(list.rows.value.map((row) => row.name)).toEqual(['alpha', 'beta'])

    unmount()
  })

  it('filters by free-text search and keeps it in the URL', async () => {
    const { list, router, unmount } = await createHarness()

    list.filters.q = 'mm'
    await settle()

    expect(list.total.value).toBe(1)
    expect(list.rows.value.map((row) => row.name)).toEqual(['gamma'])
    expect(router.currentRoute.value.query.q).toBe('mm')

    unmount()
  })

  it('applies named filters and falls back for values outside the allow-list', async () => {
    const { list, router, unmount } = await createHarness()

    list.filters.status = 'blocked'
    await settle()

    expect(list.total.value).toBe(2)
    expect(list.rows.value.map((row) => row.name)).toEqual(['beta', 'delta'])

    await router.push({ query: { status: 'root' } })
    await settle()

    expect(list.filters.status).toBe('all')
    expect(list.total.value).toBe(4)

    unmount()
  })

  it('toggles a column from ascending to descending and back to another column', async () => {
    const { list, router, unmount } = await createHarness()

    list.setSort('score')
    await settle()

    expect(list.sortKey.value).toBe('score')
    expect(list.sortDir.value).toBe('asc')
    expect(list.rows.value.map((row) => row.score)).toEqual([10, 20])
    expect(router.currentRoute.value.query.sort).toBe('score:asc')

    list.setSort('score')
    await settle()

    expect(list.sortDir.value).toBe('desc')
    expect(list.rows.value.map((row) => row.score)).toEqual([40, 30])

    list.setSort('name')
    await settle()

    expect(list.sortKey.value).toBe('name')
    expect(list.sortDir.value).toBe('asc')

    unmount()
  })

  it('resets the page when the page size changes and clamps an out-of-range page', async () => {
    const { list, unmount } = await createHarness()

    list.setPage(2)
    await settle()
    expect(list.rows.value.map((row) => row.name)).toEqual(['delta', 'gamma'])

    list.setPageSize(4)
    await settle()
    expect(list.page.value).toBe(1)
    expect(list.pageCount.value).toBe(1)
    expect(list.rows.value.map((row) => row.name)).toEqual(['alpha', 'beta', 'delta', 'gamma'])

    list.filters.page = '99'
    await settle()
    expect(list.page.value).toBe(1)
    expect(list.filters.page).toBe('1')

    unmount()
  })

  it('manages selection across the current page', async () => {
    const { list, unmount } = await createHarness()

    list.toggleRow('r1')
    expect(list.selectedIds.value).toEqual(['r1'])

    list.toggleAllOnPage()
    expect([...list.selectedIds.value].sort()).toEqual(['r1', 'r2'])

    list.toggleAllOnPage()
    expect(list.selectedIds.value).toEqual([])

    list.toggleRow('r3')
    list.removeFromSelection(['r3'])
    expect(list.selectedIds.value).toEqual([])

    unmount()
  })

  it('reset restores defaults, clears the URL and drops the selection', async () => {
    const { list, router, unmount } = await createHarness()

    list.filters.q = 'alpha'
    list.filters.status = 'active'
    list.setSort('score')
    list.toggleRow('r1')
    await settle()

    list.reset()
    await settle()

    expect(list.filters.q).toBe('')
    expect(list.filters.status).toBe('all')
    expect(list.filters.sort).toBe('name:asc')
    expect(list.selectedIds.value).toEqual([])
    expect(router.currentRoute.value.query).toEqual({})

    unmount()
  })
})
