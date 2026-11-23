<script setup lang="ts">
import { computed } from 'vue'
import { LoaderCircle } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/composables/useToast'
import { useLoginForm } from '@/composables/useLoginForm'
import { useLoginDialogStore } from '@/stores/login-dialog'

/**
 * In-place sign-in used when the session expires mid-task. The page behind it stays
 * mounted, and `complete()` replays the interrupted action exactly once.
 */
const loginDialog = useLoginDialogStore()
const { toast } = useToast()
const { form, errors, formError, submitting, submit } = useLoginForm()

const isExpired = computed(() => loginDialog.reason === 'expired')

async function onSubmit(): Promise<void> {
  const ok = await submit()
  if (!ok) return

  toast({ title: '已重新登录，继续刚才的操作', variant: 'success' })
  loginDialog.complete()
}
</script>

<template>
  <Dialog :open="true" :modal="true" @update:open="(open) => !open && loginDialog.close()">
    <DialogContent class="sm:max-w-md" data-testid="login-dialog">
      <DialogHeader>
        <DialogTitle>{{ isExpired ? '登录状态已失效' : '需要登录' }}</DialogTitle>
        <DialogDescription>
          {{
            isExpired
              ? '重新登录即可继续，当前页面和已填写的内容会保留。'
              : '登录后即可继续刚才的操作，页面上的内容不会丢失。'
          }}
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4" novalidate @submit.prevent="onSubmit">
        <div class="space-y-2">
          <Label for="dialog-email">邮箱</Label>
          <Input
            id="dialog-email"
            v-model="form.email"
            type="email"
            autocomplete="username"
            placeholder="owner@aurora.dev"
            :aria-invalid="Boolean(errors.email)"
          />
          <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</p>
        </div>

        <div class="space-y-2">
          <Label for="dialog-password">密码</Label>
          <Input
            id="dialog-password"
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            placeholder="至少 8 位字符"
            :aria-invalid="Boolean(errors.password)"
          />
          <p v-if="errors.password" class="text-xs text-destructive">{{ errors.password }}</p>
        </div>

        <p
          v-if="formError"
          class="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          role="alert"
        >
          {{ formError }}
        </p>

        <DialogFooter>
          <Button type="button" variant="outline" @click="loginDialog.close()">稍后再说</Button>
          <Button type="submit" :disabled="submitting">
            <LoaderCircle v-if="submitting" class="animate-spin" aria-hidden="true" />
            登录并继续
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
