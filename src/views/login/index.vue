<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Eye, EyeOff, LoaderCircle, LogIn } from '@lucide/vue'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/composables/useToast'
import { useLoginForm } from '@/composables/useLoginForm'
import { DEMO_ACCOUNTS } from '@/constants/demoAccounts'
import { ROLE_LABELS } from '@/constants/permissions'
import { useAuthStore } from '@/stores/auth'
import { getSafeRedirect } from '@/utils/redirect'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const { toast } = useToast()

const { form, errors, formError, showPassword, submitting, submit } = useLoginForm()
const passwordType = computed(() => (showPassword.value ? 'text' : 'password'))
const activeEmail = ref('')

function fillDemo(email: string, password: string): void {
  form.email = email
  form.password = password
  activeEmail.value = email
}

async function onSubmit(): Promise<void> {
  const ok = await submit()
  if (!ok) return

  toast({ title: '登录成功', description: `欢迎回来，${auth.displayName}。`, variant: 'success' })
  await router.replace(getSafeRedirect(route.query.redirect, '/'))
}
</script>

<template>
  <div>
    <div class="mb-6">
      <p class="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
        Aurora Admin
      </p>
      <h1 class="mt-2 text-2xl font-semibold tracking-tight text-foreground">登录管理后台</h1>
      <p class="mt-1.5 text-sm text-muted-foreground">
        使用分配给您的后台账号登录，账号由拥有者或身份提供方开通。
      </p>
    </div>

    <Card class="gap-0 py-0">
      <CardHeader class="p-5 pb-0">
        <CardTitle class="text-sm">账号密码登录</CardTitle>
        <CardDescription class="text-xs">不接入第三方登录与自助注册。</CardDescription>
      </CardHeader>

      <CardContent class="p-5">
        <form class="space-y-4" novalidate @submit.prevent="onSubmit">
          <div class="space-y-2">
            <Label for="email">邮箱</Label>
            <Input
              id="email"
              v-model="form.email"
              type="email"
              autocomplete="username"
              placeholder="owner@aurora.dev"
              :aria-invalid="Boolean(errors.email)"
              :aria-describedby="errors.email ? 'email-error' : undefined"
            />
            <p v-if="errors.email" id="email-error" class="text-xs text-destructive">
              {{ errors.email }}
            </p>
          </div>

          <div class="space-y-2">
            <Label for="password">密码</Label>
            <div class="relative">
              <Input
                id="password"
                v-model="form.password"
                :type="passwordType"
                autocomplete="current-password"
                placeholder="至少 8 位字符"
                class="pr-10"
                :aria-invalid="Boolean(errors.password)"
                :aria-describedby="errors.password ? 'password-error' : undefined"
              />
              <button
                type="button"
                class="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="size-4" aria-hidden="true" />
                <Eye v-else class="size-4" aria-hidden="true" />
              </button>
            </div>
            <p v-if="errors.password" id="password-error" class="text-xs text-destructive">
              {{ errors.password }}
            </p>
          </div>

          <p
            v-if="formError"
            class="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
            role="alert"
            data-testid="login-error"
          >
            {{ formError }}
          </p>

          <Button type="submit" class="w-full" :disabled="submitting" data-testid="login-submit">
            <LoaderCircle v-if="submitting" class="animate-spin" aria-hidden="true" />
            <LogIn v-else aria-hidden="true" />
            {{ submitting ? '正在登录…' : '登录' }}
          </Button>
        </form>
      </CardContent>
    </Card>

    <div class="mt-6">
      <p class="text-xs font-medium text-muted-foreground">演示账号（点击填充）</p>
      <ul class="mt-2 space-y-2">
        <li v-for="account in DEMO_ACCOUNTS" :key="account.email">
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-lg border bg-card px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-accent/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
            :class="activeEmail === account.email && 'border-primary/60 bg-accent/60'"
            :data-testid="`demo-account-${account.role}`"
            @click="fillDemo(account.email, account.password)"
          >
            <Badge variant="secondary" class="shrink-0">{{ ROLE_LABELS[account.role] }}</Badge>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-xs font-medium text-foreground">
                {{ account.email }}
              </span>
              <span class="block truncate text-[11px] text-muted-foreground">
                {{ account.note }}
              </span>
            </span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
