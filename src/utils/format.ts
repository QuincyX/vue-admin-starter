const numberFormatter = new Intl.NumberFormat('zh-CN')

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

/** `87.5%` — `digits` controls the decimal places. */
export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}

/** `+12.5%` / `-3.2%` / `0%` — the sign is part of the string so callers can style one span. */
export function formatSignedPercent(value: number, digits = 1): string {
  if (value === 0) return '0%'
  return `${value > 0 ? '+' : ''}${value.toFixed(digits)}%`
}

/** Compact counts for stat cards: `1.2 万` above 10k, grouped digits below. */
export function formatCompactNumber(value: number): string {
  if (Math.abs(value) < 10_000) return formatNumber(value)
  return `${(value / 10_000).toFixed(1)} 万`
}

export function formatLatency(latencyMs: number | null): string {
  return latencyMs === null ? '—' : `${latencyMs} ms`
}
