import { z } from 'zod'

export interface ValidationFailure {
  success: false
  errors: Record<string, string>
}

export type ValidationResult<T> = { success: true; data: T } | ValidationFailure

/**
 * Maps a Zod schema to per-field error messages for a form.
 *
 * The first issue per field wins: a form shows one message under each input, and
 * the first is the one the user should fix. Errors land under the *top-level*
 * path key so a nested schema still highlights the right control.
 */
export function validateWithSchema<S extends z.ZodType>(
  schema: S,
  value: unknown,
): ValidationResult<z.output<S>> {
  const parsed = schema.safeParse(value)

  if (parsed.success) return { success: true, data: parsed.data }

  const errors: Record<string, string> = {}

  for (const issue of parsed.error.issues) {
    const key = String(issue.path[0] ?? 'form')
    if (!errors[key]) errors[key] = issue.message
  }

  return { success: false, errors }
}
