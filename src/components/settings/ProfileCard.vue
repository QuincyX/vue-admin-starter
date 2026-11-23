<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { LoaderCircle, LogOut } from '@lucide/vue'
import { useRouter } from 'vue-router'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/composables/useToast'
import { isApiError } from '@/api/errors'
import { profileInputSchema } from '@/types/auth'
import { useAuthStore } from '@/stores/auth'
import { useLoadingStore } from '@/stores/loading'
import { useLoginDialogStore } from '@/stores/login-dialog'

const auth = useAuthStore()
const loading = useLoadingStore()
const loginDialog = useLoginDialogStore()
const router = useRouter()
const { toast } = useToast()

const form = reactive({ name: '' })
const nameError = ref('')
const saving = ref(false)

function syncForm(): void {
  form.name = auth.user?.name ?? ''
}

watch(() => auth.user?.name, syncForm, { immediate: true })

const email = computed(() => auth.user?.email ?? '—')

async function save(): Promise<void> {
  nameError.value = ''

  const parsed = profileInputSchema.safeParse(form)
  if (!parsed.success) {
    nameError.value = parsed.error.issues[0]?.message ?? '请输入有效的名称'
    return
  }

  saving.value = true
  try {
    await auth.updateProfile(parsed.data)
    toast({ title: '资料已保存', variant: 'success' })
  } catch (error) {
    // Session expiry is recoverable in place: remember the intent, then replay it.
    if (isApiError(error) && error.status === 401) {
      loginDialog.open({ reason: 'expired', onSuccess: save })
      return
    }

    toast({ title: '保存失败', description: '请稍后重试。', variant: 'error' })
  } finally {
    saving.value = false
  }
}

async function signOut(): Promise<void> {
  await loading.run(async () => {
    await auth.logout()
    await router.push({ name: 'login' })
  }, '正在退出…')
}
</script>

<template>
  <Card class="gap-0 py-0">
    <CardHeader class="p-5 pb-4">
      <CardTitle class="text-sm font-semibold">账号资料</CardTitle>
      <CardDescription class="mt-1 text-xs">
        显示名称会出现在操作日志与顶栏；邮箱是登录标识，不可修改。
      </CardDescription>
    </CardHeader>

    <CardContent class="p-5 pt-0">
      <form class="space-y-4" novalidate @submit.prevent="save">
        <div class="space-y-2">
          <Label for="profile-name">显示名称</Label>
          <Input
            id="profile-name"
            v-model="form.name"
            autocomplete="name"
            :aria-invalid="Boolean(nameError)"
          />
          <p v-if="nameError" class="text-xs text-destructive">{{ nameError }}</p>
        </div>

        <div class="space-y-2">
          <Label for="profile-email">邮箱</Label>
          <Input id="profile-email" :model-value="email" disabled />
          <p class="text-[11px] text-muted-foreground">邮箱由拥有者在开通账号时设置。</p>
        </div>

        <div class="flex items-center justify-between gap-3 pt-1">
          <Button type="submit" :disabled="saving" data-testid="profile-save">
            <LoaderCircle v-if="saving" class="animate-spin" aria-hidden="true" />
            保存名称
          </Button>

          <Button type="button" variant="ghost" class="text-muted-foreground" @click="signOut">
            <LogOut aria-hidden="true" />
            退出登录
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>
