import { useIntervalFn, useNow } from '@vueuse/core'

/**
 * A reactive clock that ticks once a minute instead of every animation frame.
 * Used by the header's date label and relative timestamps.
 */
export function useCurrentTime(interval = 60_000) {
  return useNow({
    scheduler: (update) => useIntervalFn(update, interval),
  })
}
