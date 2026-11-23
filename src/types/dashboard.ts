/** One point in the overview trend chart. `date` is `YYYY-MM-DD`. */
export interface TrendPoint {
  date: string
  visits: number
  signups: number
}

/** A row in the dashboard's "system status" panel. */
export interface ServiceStatus {
  id: string
  name: string
  /** Latency in milliseconds; `null` renders as "不可用". */
  latencyMs: number | null
  status: 'operational' | 'degraded' | 'down'
}
