import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { ApiError } from '@/api/errors'
import { validateWithSchema } from '@/lib/validation'
import { apiErrorCodeMessage, apiErrorMessage } from '@/utils/apiError'
import { toCsv } from '@/utils/csv'
import {
  formatDate,
  formatDateTime,
  formatMonthDay,
  formatRelativeTime,
  parseDateOnly,
  toDateInputValue,
  toDateKey,
} from '@/utils/date'
import {
  formatCompactNumber,
  formatLatency,
  formatNumber,
  formatPercent,
  formatSignedPercent,
} from '@/utils/format'

describe('date helpers', () => {
  it('parses a date-only string as a local date instead of UTC', () => {
    const date = parseDateOnly('2026-08-12')

    expect(date?.getFullYear()).toBe(2026)
    expect(date?.getMonth()).toBe(7)
    expect(date?.getDate()).toBe(12)
  })

  it('rejects malformed and missing values', () => {
    expect(parseDateOnly('12/08/2026')).toBeNull()
    expect(parseDateOnly(null)).toBeNull()
  })

  it('round-trips the date input format', () => {
    const date = new Date(2026, 0, 5, 9, 7)

    expect(toDateInputValue(date)).toBe('2026-01-05')
    expect(toDateKey(date)).toBe('2026-01-05')
    expect(formatDate(date)).toBe('2026-01-05')
    expect(formatDateTime(date)).toBe('2026-01-05 09:07')
    expect(formatMonthDay(date)).toBe('1月5日')
  })

  it('formats relative time with a fixed reference', () => {
    const now = new Date('2026-08-12T12:00:00+08:00')

    expect(formatRelativeTime(new Date('2026-08-12T11:59:30+08:00'), now)).toBe('刚刚')
    expect(formatRelativeTime(new Date('2026-08-12T11:55:00+08:00'), now)).toBe('5 分钟前')
    expect(formatRelativeTime(new Date('2026-08-12T09:00:00+08:00'), now)).toBe('3 小时前')
    expect(formatRelativeTime(new Date('2026-08-09T12:00:00+08:00'), now)).toBe('3 天前')
    expect(formatRelativeTime(new Date('2026-06-01T12:00:00+08:00'), now)).toBe('2026-06-01')
  })
})

describe('number formatting', () => {
  it('groups, compacts and signs numbers', () => {
    expect(formatNumber(12345)).toBe('12,345')
    expect(formatCompactNumber(12345)).toBe('1.2 万')
    expect(formatCompactNumber(9999)).toBe('9,999')
    expect(formatPercent(87.53)).toBe('87.5%')
    expect(formatSignedPercent(12.34)).toBe('+12.3%')
    expect(formatSignedPercent(-3.21)).toBe('-3.2%')
    expect(formatSignedPercent(0)).toBe('0%')
    expect(formatLatency(null)).toBe('—')
    expect(formatLatency(42)).toBe('42 ms')
  })
})

describe('csv export', () => {
  it('escapes separators, quotes and newlines', () => {
    const csv = toCsv(
      [{ name: 'A,B', note: 'say "hi"', text: 'two\nlines' }],
      [
        { header: '名称', value: (row) => row.name },
        { header: '备注', value: (row) => row.note },
        { header: '多行', value: (row) => row.text },
      ],
    )

    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv).toContain('"A,B"')
    expect(csv).toContain('"say ""hi"""')
    expect(csv).toContain('"two\nlines"')
  })

  it('renders empty values for null and undefined', () => {
    const csv = toCsv(
      [{ a: null, b: undefined }],
      [
        { header: 'A', value: (row) => row.a },
        { header: 'B', value: (row) => row.b },
      ],
    )

    expect(csv.trim().endsWith(',')).toBe(true)
  })
})

describe('validateWithSchema', () => {
  const schema = z.object({
    name: z.string().min(2, '名称太短'),
    email: z.string().email('邮箱格式不正确'),
  })

  it('returns parsed data when valid', () => {
    const result = validateWithSchema(schema, { name: 'Aurora', email: 'a@b.dev' })

    expect(result).toEqual({ success: true, data: { name: 'Aurora', email: 'a@b.dev' } })
  })

  it('keeps the first message per field', () => {
    const result = validateWithSchema(schema, { name: 'A', email: 'nope' })

    expect(result.success).toBe(false)
    if (result.success) return

    expect(result.errors).toEqual({ name: '名称太短', email: '邮箱格式不正确' })
  })
})

describe('api error messages', () => {
  it('maps codes to Chinese copy with an unknown fallback', () => {
    expect(apiErrorCodeMessage('network')).toContain('网络')
    expect(apiErrorCodeMessage(null)).toBe(apiErrorCodeMessage('unknown'))
    expect(apiErrorMessage(new ApiError('x', { code: 'forbidden' }))).toContain('权限')
    expect(apiErrorMessage(new Error('plain'))).toBe(apiErrorCodeMessage('unknown'))
  })
})
