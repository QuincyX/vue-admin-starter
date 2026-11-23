export interface DataTableColumn {
  /** Row field used for the default cell value and as the slot suffix (`#cell-<key>`). */
  key: string
  header: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  /** Extra classes applied to body cells (the header stays left-aligned unless `align`). */
  class?: string
  width?: string
}

export interface DataTableSort {
  key: string
  dir: 'asc' | 'desc'
}
