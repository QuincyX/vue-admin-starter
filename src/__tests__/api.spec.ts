import {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { clearAccessToken, getAccessToken, setAccessToken } from '@/api/token'
import { http } from '@/api/http'

function responseAdapter(
  payload: unknown,
  onRequest?: (config: InternalAxiosRequestConfig) => void,
): AxiosAdapter {
  return async (config) => {
    onRequest?.(config)

    return {
      data: payload,
      status: 200,
      statusText: 'OK',
      headers: new AxiosHeaders(),
      config,
    }
  }
}

function errorAdapter(error: AxiosError): AxiosAdapter {
  return async (config) => {
    error.config = config
    throw error
  }
}

describe('HTTP client interceptors', () => {
  afterEach(() => {
    clearAccessToken()
  })

  it('adds auth, locale and request id headers', async () => {
    let captured: InternalAxiosRequestConfig | undefined
    setAccessToken('test-token')

    await http.get('/health', {
      adapter: responseAdapter({ status: 'ok' }, (config) => {
        captured = config
      }),
    })

    expect(captured?.headers.get('Authorization')).toBe('Bearer test-token')
    // The console is Chinese-only, but the header stays for backend logs.
    expect(captured?.headers.get('Accept-Language')).toBe('zh-CN')
    expect(captured?.headers.get('X-Request-Id')).toEqual(expect.any(String))
  })

  it('does not send an Authorization header without a token', async () => {
    let captured: InternalAxiosRequestConfig | undefined

    await http.get('/health', {
      adapter: responseAdapter({ status: 'ok' }, (config) => {
        captured = config
      }),
    })

    expect(captured?.headers.get('Authorization')).toBeUndefined()
  })

  it('normalizes an unauthorized response, clears the token and emits the event', async () => {
    setAccessToken('expired-token')
    const onUnauthorized = vi.fn<() => void>()
    window.addEventListener('aurora:unauthorized', onUnauthorized, { once: true })

    const response = {
      data: { message: 'Session expired' },
      status: 401,
      statusText: 'Unauthorized',
      headers: new AxiosHeaders(),
      config: {} as InternalAxiosRequestConfig,
    } satisfies AxiosResponse

    const error = new AxiosError(
      'Request failed with status code 401',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      response,
    )

    await expect(http.get('/private', { adapter: errorAdapter(error) })).rejects.toMatchObject({
      name: 'ApiError',
      code: 'unauthorized',
      status: 401,
    })

    expect(getAccessToken()).toBeNull()
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
  })

  it('maps transport failures to a network error', async () => {
    const error = new AxiosError('Network Error', 'ERR_NETWORK')

    await expect(http.get('/offline', { adapter: errorAdapter(error) })).rejects.toMatchObject({
      name: 'ApiError',
      code: 'network',
    })
  })
})
