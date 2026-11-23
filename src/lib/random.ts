/**
 * Deterministic pseudo-random generator (mulberry32).
 *
 * Demo charts and seeded audit rows must look organic but stay stable: a seed
 * keeps snapshots and E2E assertions from changing on every reload, unlike
 * `Math.random()`.
 */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0

  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296
  }
}

/** Integer in `[min, max]`. */
export function randomInt(random: () => number, min: number, max: number): number {
  return min + Math.floor(random() * (max - min + 1))
}

export function pick<T>(random: () => number, items: readonly T[]): T {
  const index = Math.floor(random() * items.length)
  return items[Math.min(index, items.length - 1)] as T
}
