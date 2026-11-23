<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { KeyRound, LoaderCircle } from '@lucide/vue'
import { useRouter } from 'vue-router'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isApiError } from '@/api/errors'
import { useToast } from '@/composables/useToast'
import { passwordInputSchema } from '@/types/auth'
import { useAuthStore } from '@/stores/auth'
import { useLoadingStore } from '@/stores/loading'
import { apiErrorMessage } from '@/utils/apiError'

const auth = useAuthStore()
const loading = useLoadingStore()
const router = useRouter()
const { toast } = useToast()

const form = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
const errors = ref<Record<string, string>>({})
const submitting = computed(() => loading.isLoading)

function validate(): boolean {
  const next: Record<string, string> = {}

  const parsed = passwordInputSchema.safeParse({
    currentPassword: form.currentPassword,
    newPassword: form.newPassword,
  })

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form')
      if (!next[key]) next[key] = issue.message
    }
  }

  if (form.newPassword !== form.confirmPassword) {
    next.confirmPassword = '两次输入的新密码不一致'
  }

  errors.value = next
  return Object.keys(next).length === 0
}

async function submit(): Promise<void> {
  if (!validate()) return

  try {
    await loading.run(async () => {
      await auth.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      await router.push({ name: 'login' })
    }, '正在保存…')

    toast({ title: '密码已更新', description: '请使用新密码重新登录。', variant: 'success' })
  } catch (error) {
    errors.value = {
      form:
        isApiError(error) && error.status === 400
          ? '当前密码不正确，或新密码不符合要求。'
          : apiErrorMessage(error),
    }
  }
}
</script>

<template>
  <Card class="gap-0 py-0">
    <CardHeader class="p-5 pb-4">
      <CardTitle class="flex items-center gap-2 text-sm font-semibold">
        <KeyRound class="size-4 text-primary" aria-hidden="true" />
        登录密码
      </CardTitle>
      <CardDescription class="mt-1 text-xs">
        修改成功后当前会话会退出，需要使用新密码重新登录。
      </CardDescription>
    </CardHeader>

    <CardContent class="p-5 pt-0">
      <form class="space-y-4" novalidate @submit.prevent="submit">
        <div class="space-y-2">
          <Label for="current-password">当前密码</Label>
          <Input
            id="current-password"
            v-model="form.currentPassword"
            type="password"
            autocomplete="current-password"
            :aria-invalid="Boolean(errors.currentPassword)"
          />
          <p v-if="errors.currentPassword" class="text-xs text-destructive">
            {{ errors.currentPassword }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="new-password">新密码</Label>
            <Input
              id="new-password"
              v-model="form.newPassword"
              type="password"
              autocomplete="new-password"
              :aria-invalid="Boolean(errors.newPassword)"
            />
            <p v-if="errors.newPassword" class="text-xs text-destructive">
              {{ errors.newPassword }}
            </p>
          </div>

          <div class="space-y-2">
            <Label for="confirm-password">确认新密码</Label>
            <Input
              id="confirm-password"
              v-model="form.confirmPassword"
              type="password"
              autocomplete="new-password"
              :aria-invalid="Boolean(errors.confirmPassword)"
            />
            <p v-if="errors.confirmPassword" class="text-xs text-destructive">
              {{ errors.confirmPassword }}
            </p>
          </div>
        </div>

        <p v-if="errors.form" class="text-xs text-destructive" role="alert">{{ errors.form }}</p>

        <Button type="submit" :disabled="submitting" data-testid="password-submit">
          <LoaderCircle v-if="submitting" class="animate-spin" aria-hidden="true" />
          更新密码
        </Button>
      </form>
    </CardContent>
  </Card>
</template>
