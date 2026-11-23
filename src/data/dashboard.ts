import { createRandom } from '@/lib/random'
import type { ServiceStatus, TrendPoint } from '@/types/dashboard'

const DAY_MS = 86_400_000

/**
 * 30 days of overview trend data.
 *
 * Deterministic on purpose (seeded PRNG + weekday shape): the dashboard should look
 * like real traffic while screenshots, E2E assertions and the chart's aria summary
 * stay stable. Replace this module with a `dashboardApi.summary()` call when a real
 * analytics endpoint exists — the view only consumes `TrendPoint[]`.
 */
export function createTrendSeries(now = new Date(), days = 30): TrendPoint[] {
  const random = createRandom(424242)
  const points: TrendPoint[] = []

  for (let offset = days - 1; offset >= 0; offset--) {
    const date = new Date(now.getTime() - offset * DAY_MS)
    const weekday = date.getDay()
    const weekendFactor = weekday === 0 || weekday === 6 ? 0.62 : 1
    const growth = 1 + (days - offset) * 0.004
    const visits = Math.round((940 + random() * 260) * weekendFactor * growth)
    const signups = Math.round(visits * (0.045 + random() * 0.02))

    points.push({
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
        date.getDate(),
      ).padStart(2, '0')}`,
      visits,
      signups,
    })
  }

  return points
}

/**
 * Service health rows. `api` is measured live by the settings card; the rest are
 * illustrative rows that show how to render a mixed-status panel.
 */
export const SERVICE_STATUSES: ServiceStatus[] = [
  { id: 'api', name: '认证与 API 网关', latencyMs: null, status: 'operational' },
  { id: 'members', name: '成员服务', latencyMs: 42, status: 'operational' },
  { id: 'audit', name: '日志写入管道', latencyMs: 118, status: 'degraded' },
  { id: 'notify', name: '通知队列', latencyMs: 27, status: 'operational' },
]
