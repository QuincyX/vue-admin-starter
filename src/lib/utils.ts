import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Conditional class names with Tailwind conflict resolution.
 *
 * This is the shadcn-vue convention: every `components/ui/*` primitive accepts a
 * `class` prop and merges it here, so a caller's `class="mt-6"` wins over the
 * component's own `mt-0` instead of depending on source order.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
