import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { DEFAULT_LOADING_MESSAGE, useLoadingStore } from '@/stores/loading'

describe('loading store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts idle', () => {
    const loading = useLoadingStore()

    expect(loading.isLoading).toBe(false)
    expect(loading.message).toBe(DEFAULT_LOADING_MESSAGE)
  })

  it('keeps the overlay open until the last nested task ends', () => {
    const loading = useLoadingStore()

    const first = loading.begin('正在退出…')
    const second = loading.begin('正在保存…')

    expect(loading.message).toBe('正在保存…')

    loading.end(first)
    expect(loading.isLoading).toBe(true)
    expect(loading.message).toBe('正在保存…')

    loading.end(second)
    expect(loading.isLoading).toBe(false)
  })

  it('releases its own task even when the wrapped operation rejects', async () => {
    const loading = useLoadingStore()

    await expect(loading.run(() => Promise.reject(new Error('boom')), '正在保存…')).rejects.toThrow(
      'boom',
    )

    expect(loading.isLoading).toBe(false)
  })

  it('reset drops every task so a stale blocker cannot survive a session change', () => {
    const loading = useLoadingStore()

    loading.begin()
    loading.begin()
    loading.reset()

    expect(loading.isLoading).toBe(false)
  })
})
