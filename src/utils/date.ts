const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/

/** Parses `YYYY-MM-DD` as a *local* date, avoiding the UTC shift of `new Date(str)`. */
export function parseDateOnly(value: string | null | undefined): Date | null {
  if (!value) return null

  const match = dateOnlyPattern.exec(value)
  if (!match) return null

  const [, yearValue, monthValue, dayValue] = match
  if (!yearValue || !monthValue || !dayValue) return null

  const date = new Date(Number(yearValue), Number(monthValue) - 1, Number(dayValue))
  return Number.isNaN(date.getTime()) ? null : date
}

export function startOfDay(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function toDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function toDateKey(date: Date | string): string {
  return toDateInputValue(typeof date === 'string' ? new Date(date) : date)
}

function toDate(value: string | Date): Date {
  return typeof value === 'string' ? new Date(value) : value
}

/** `2026-08-12` */
export function formatDate(value: string | Date): string {
  const date = toDate(value)
  if (Number.isNaN(date.getTime())) return '—'
  return toDateInputValue(date)
}

/** `2026-08-12 14:30` */
export function formatDateTime(value: string | Date): string {
  const date = toDate(value)
  if (Number.isNaN(date.getTime())) return '—'

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${toDateInputValue(date)} ${hours}:${minutes}`
}

/** `14:30` */
export function formatTime(value: string | Date): string {
  const date = toDate(value)
  if (Number.isNaN(date.getTime())) return '—'

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/** `8月12日` — chart axis and compact table cells. */
export function formatMonthDay(value: string | Date): string {
  const date = toDate(value)
  if (Number.isNaN(date.getTime())) return '—'
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

/** `3 分钟前` / `2 天前`; older than 30 days falls back to a date. */
export function formatRelativeTime(value: string | Date, now = new Date()): string {
  const date = toDate(value)
  if (Number.isNaN(date.getTime())) return '—'

  const seconds = Math.round((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return '刚刚'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} 分钟前`
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)} 小时前`

  const days = Math.floor(seconds / 86_400)
  if (days < 30) return `${days} 天前`

  return formatDate(date)
}
