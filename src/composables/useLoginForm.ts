import { computed, reactive, ref } from 'vue'

import { isApiError } from '@/api/errors'
import { useAuthStore } from '@/stores/auth'
import { loginInputSchema, type LoginInput } from '@/types/auth'

/**
 * Email/password sign-in form: one implementation of validation and error
 * normalization, reused by the login page and the in-place session dialog.
 *
 * The caller owns what happens after success (toast, redirect, closing a dialog).
 */
export function useLoginForm() {
  const auth = useAuthStore()

  const form = reactive<LoginInput>({ email: '', password: '' })
  const errors = reactive<{ email?: string; password?: string }>({})
  const formError = ref('')
  const showPassword = ref(false)
  const submitting = computed(() => auth.pending)

  function resetErrors(): void {
    errors.email = undefined
    errors.password = undefined
    formError.value = ''
  }

  function validate(): boolean {
    resetErrors()

    const result = loginInputSchema.safeParse(form)
    if (result.success) return true

    for (const issue of result.error.issues) {
      const field = issue.path[0]
      if ((field === 'email' || field === 'password') && !errors[field]) {
        errors[field] = issue.message
      }
    }

    return false
  }

  function resolveSubmitError(error: unknown): string {
    if (isApiError(error)) {
      if (error.status === 401 || error.status === 400) return '邮箱或密码不正确，请重试。'
      if (error.status === 429) return '尝试次数过多，请稍后再试。'
      if (error.code === 'network' || error.code === 'timeout') {
        return '无法连接认证服务，请检查开发服务器或后端地址。'
      }
    }

    return '登录失败，请稍后重试。'
  }

  /** Resolves to whether the sign-in succeeded; failures land in `formError`. */
  async function submit(): Promise<boolean> {
    if (!validate()) return false

    try {
      await auth.login(form)
      return true
    } catch (error) {
      formError.value = resolveSubmitError(error)
      return false
    }
  }

  function reset(): void {
    form.email = ''
    form.password = ''
    showPassword.value = false
    resetErrors()
  }

  return { form, errors, formError, showPassword, submitting, validate, submit, reset }
}
