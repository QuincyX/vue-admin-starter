import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const DEFAULT_LOADING_MESSAGE = '处理中…'

interface LoadingTask {
  id: number
  message: string
}

/**
 * Blocking, full-page loading state.
 *
 * A stack of named tasks instead of a boolean: concurrent or nested operations
 * each hold their own id, so the first one to finish cannot dismiss the overlay
 * that a later one opened. The visible message is the top of the stack.
 *
 * Use `run()` when possible — it always releases its own task in `finally`, so a
 * rejected request cannot leave the page blocked.
 */
export const useLoadingStore = defineStore('loading', () => {
  const tasks = ref<LoadingTask[]>([])
  let nextId = 1

  const isLoading = computed(() => tasks.value.length > 0)
  const message = computed(
    () => tasks.value[tasks.value.length - 1]?.message ?? DEFAULT_LOADING_MESSAGE,
  )

  function begin(nextMessage: string = DEFAULT_LOADING_MESSAGE): number {
    const id = nextId++
    tasks.value.push({ id, message: nextMessage })
    return id
  }

  /** End the task identified by `id`; without an id, drop the most recent one. */
  function end(id?: number): void {
    if (id === undefined) {
      tasks.value.pop()
      return
    }

    tasks.value = tasks.value.filter((task) => task.id !== id)
  }

  async function run<T>(task: () => Promise<T>, nextMessage?: string): Promise<T> {
    const id = begin(nextMessage)

    try {
      return await task()
    } finally {
      end(id)
    }
  }

  /** Safety valve for session changes (sign-out, 401) so no stale task survives. */
  function reset(): void {
    tasks.value = []
  }

  return { tasks, isLoading, message, begin, end, run, reset }
})
