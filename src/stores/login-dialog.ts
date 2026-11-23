import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type LoginDialogReason = 'required' | 'expired'

export interface LoginDialogContext {
  /** `expired` renders the session-expired copy instead of the generic wall copy. */
  reason: LoginDialogReason
  /**
   * The action that was interrupted by the login requirement. It runs once,
   * after the dialog has closed, so the caller can resume without redirecting.
   */
  onSuccess?: () => void | Promise<void>
}

/**
 * Global in-place sign-in dialog.
 *
 * The session can expire while an admin is editing a form; a full-page redirect
 * would throw that away. The page stays mounted and the user finishes signing in
 * through a dialog that can replay the interrupted action once.
 */
export const useLoginDialogStore = defineStore('login-dialog', () => {
  const isOpen = ref(false)
  const context = ref<LoginDialogContext>({ reason: 'required' })

  const reason = computed(() => context.value.reason)

  /**
   * Open the dialog, or replace the context when it is already open. Later
   * callers win: the global 401 handler opens without a retry, then the page
   * that knows how to resume re-opens with `onSuccess`.
   */
  function open(next: Partial<LoginDialogContext> = {}): void {
    context.value = {
      reason: next.reason ?? context.value.reason,
      onSuccess: next.onSuccess ?? context.value.onSuccess,
    }
    isOpen.value = true
  }

  function close(): void {
    isOpen.value = false
    context.value = { reason: 'required' }
  }

  /** Close first, then resume the interrupted action exactly once. */
  function complete(): void {
    const pending = context.value.onSuccess
    close()
    if (pending) void pending()
  }

  return { isOpen, context, reason, open, close, complete }
})
