import { isApiError, type ApiErrorCode } from '@/api/errors'

/**
 * The single code → copy map for API failures.
 *
 * Views and stores must not rebuild these strings per call site, and the switch
 * from i18n to a Chinese-only template kept the mapping in one place on purpose.
 */
const MESSAGES: Record<ApiErrorCode, string> = {
  network: '网络连接失败，请检查网络或后端地址后重试。',
  timeout: '请求超时，请稍后重试。',
  unauthorized: '登录状态已失效，请重新登录。',
  forbidden: '没有权限执行此操作。',
  notFound: '请求的资源不存在。',
  server: '服务器开小差了，请稍后重试。',
  business: '请求被服务端拒绝，请检查输入后重试。',
  unknown: '请求失败，请稍后重试。',
}

export function apiErrorCodeMessage(code: ApiErrorCode | null | undefined): string {
  return MESSAGES[code ?? 'unknown']
}

export function apiErrorMessage(error: unknown): string {
  return apiErrorCodeMessage(isApiError(error) ? error.code : 'unknown')
}
