import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DataTable from '@/components/data-table/DataTable.vue'
import type { DataTableColumn } from '@/components/data-table/types'

interface Row {
  id: string
  name: string
  status: string
}

const rows: Row[] = [
  { id: 'r1', name: 'Alpha', status: 'active' },
  { id: 'r2', name: 'Beta', status: 'suspended' },
]

const columns: DataTableColumn[] = [
  { key: 'name', header: '名称', sortable: true },
  { key: 'status', header: '状态' },
]

describe('DataTable', () => {
  it('renders every row and header', () => {
    const wrapper = mount(DataTable, { props: { columns, rows } })

    expect(wrapper.findAll('[data-testid="data-row"]')).toHaveLength(2)
    expect(wrapper.text()).toContain('Alpha')
    expect(wrapper.text()).toContain('名称')
  })

  it('reports the sort direction through aria-sort', () => {
    const wrapper = mount(DataTable, {
      props: { columns, rows, sort: { key: 'name', dir: 'asc' } },
    })

    expect(wrapper.find('th[aria-sort="ascending"]').exists()).toBe(true)

    const descending = mount(DataTable, {
      props: { columns, rows, sort: { key: 'name', dir: 'desc' } },
    })

    expect(descending.find('th[aria-sort="descending"]').exists()).toBe(true)
  })

  it('emits the column key when a sortable header is activated', async () => {
    const wrapper = mount(DataTable, { props: { columns, rows } })

    await wrapper.find('th button').trigger('click')

    expect(wrapper.emitted('sort')).toEqual([['name']])
  })

  it('renders the empty state instead of a body row', () => {
    const wrapper = mount(DataTable, {
      props: {
        columns,
        rows: [],
        emptyTitle: '没有匹配的成员',
        emptyDescription: '调整筛选条件',
      },
    })

    expect(wrapper.findAll('[data-testid="data-row"]')).toHaveLength(0)
    expect(wrapper.text()).toContain('没有匹配的成员')
    expect(wrapper.text()).toContain('调整筛选条件')
  })

  it('renders skeleton rows while loading', () => {
    const wrapper = mount(DataTable, {
      props: { columns, rows, loading: true, skeletonRows: 3 },
    })

    expect(wrapper.findAll('[data-testid="data-row"]')).toHaveLength(0)
    expect(wrapper.findAll('.animate-pulse')).toHaveLength(6)
  })

  it('exposes selection checkboxes and toggles a row', async () => {
    const wrapper = mount(DataTable, {
      props: { columns, rows, selectable: true, selected: [] },
    })

    const checkboxes = wrapper.findAll('[role="checkbox"]')
    expect(checkboxes).toHaveLength(3)

    await checkboxes[1]?.trigger('click')

    expect(wrapper.emitted('update:selected')).toEqual([[['r1']]])
  })

  it('selects the whole page from the header checkbox', async () => {
    const wrapper = mount(DataTable, {
      props: { columns, rows, selectable: true, selected: ['r1'] },
    })

    expect(wrapper.find('[role="checkbox"]').attributes('aria-checked')).toBe('mixed')

    await wrapper.find('[role="checkbox"]').trigger('click')

    expect(wrapper.emitted('update:selected')).toEqual([[['r1', 'r2']]])
  })

  it('marks a fully selected page as checked', () => {
    const wrapper = mount(DataTable, {
      props: { columns, rows, selectable: true, selected: ['r1', 'r2'] },
    })

    expect(wrapper.find('[role="checkbox"]').attributes('aria-checked')).toBe('true')
  })
})
