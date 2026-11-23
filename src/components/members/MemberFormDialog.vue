<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/composables/useToast'
import { usePermission } from '@/composables/usePermission'
import { DEPARTMENT_LABELS, MEMBER_STATUS_LABELS } from '@/constants/member'
import { ROLE_LABELS } from '@/constants/permissions'
import { validateWithSchema } from '@/lib/validation'
import { useMemberStore, MemberRuleError } from '@/stores/members'
import { ROLES } from '@/types/auth'
import {
  DEPARTMENTS,
  MEMBER_STATUSES,
  memberDraftSchema,
  type Member,
  type MemberDraft,
} from '@/types/member'

const props = defineProps<{
  open: boolean
  /** `null` means create mode. */
  member: Member | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: [member: Member]
}>()

const memberStore = useMemberStore()
const { toast } = useToast()
const { can } = usePermission()

const isEdit = computed(() => props.member !== null)
const submitting = computed(() => memberStore.pending)
const canGrantOwner = computed(() => can('system:manage'))

const values = reactive<MemberDraft>({
  name: '',
  email: '',
  role: 'viewer',
  status: 'active',
  department: 'engineering',
  title: '',
})

const errors = ref<Record<string, string>>({})
const formError = ref('')

function reset(): void {
  const member = props.member

  Object.assign(values, {
    name: member?.name ?? '',
    email: member?.email ?? '',
    role: member?.role ?? 'viewer',
    status: member?.status ?? 'active',
    department: member?.department ?? 'engineering',
    title: member?.title ?? '',
  })

  errors.value = {}
  formError.value = ''
}

watch(
  () => [props.open, props.member?.id] as const,
  ([open]) => {
    if (open) reset()
  },
  { immediate: true },
)

async function onSubmit(): Promise<void> {
  formError.value = ''

  const result = validateWithSchema(memberDraftSchema, { ...values })
  if (!result.success) {
    errors.value = result.errors
    return
  }

  errors.value = {}

  try {
    const saved = props.member
      ? await memberStore.updateMember(props.member.id, result.data)
      : await memberStore.createMember(result.data)

    toast({
      title: isEdit.value ? '成员已更新' : '成员已创建',
      description: `${saved.name} · ${ROLE_LABELS[saved.role]}`,
      variant: 'success',
    })

    emit('saved', saved)
    emit('update:open', false)
  } catch (error) {
    formError.value =
      error instanceof MemberRuleError
        ? error.message
        : error instanceof Error
          ? error.message
          : '保存失败，请稍后重试。'
  }
}
</script>

<template>
  <Dialog :open="props.open" @update:open="(value) => emit('update:open', value)">
    <DialogContent class="max-h-[90dvh] overflow-y-auto sm:max-w-lg" data-testid="member-form">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? '编辑成员' : '新增成员' }}</DialogTitle>
        <DialogDescription>
          {{
            isEdit
              ? '修改资料、角色或状态；角色变更会写入操作日志。'
              : '创建一条成员记录，账号由拥有者后续开通。'
          }}
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4" novalidate @submit.prevent="onSubmit">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="member-name">姓名</Label>
            <Input
              id="member-name"
              v-model="values.name"
              placeholder="例如：陈思远"
              :aria-invalid="Boolean(errors.name)"
            />
            <p v-if="errors.name" class="text-xs text-destructive">{{ errors.name }}</p>
          </div>

          <div class="space-y-2">
            <Label for="member-email">邮箱</Label>
            <Input
              id="member-email"
              v-model="values.email"
              type="email"
              placeholder="name@aurora.dev"
              :aria-invalid="Boolean(errors.email)"
            />
            <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</p>
          </div>

          <div class="space-y-2">
            <Label for="member-title">职位</Label>
            <Input id="member-title" v-model="values.title" placeholder="例如：前端工程师" />
            <p v-if="errors.title" class="text-xs text-destructive">{{ errors.title }}</p>
          </div>

          <div class="space-y-2">
            <Label for="member-department">部门</Label>
            <Select v-model="values.department">
              <SelectTrigger id="member-department" aria-label="部门">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="department in DEPARTMENTS" :key="department" :value="department">
                  {{ DEPARTMENT_LABELS[department] }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="member-role">角色</Label>
            <Select v-model="values.role">
              <SelectTrigger id="member-role" aria-label="角色">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="role in ROLES"
                  :key="role"
                  :value="role"
                  :disabled="role === 'owner' && !canGrantOwner && values.role !== 'owner'"
                >
                  {{ ROLE_LABELS[role] }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="!canGrantOwner" class="text-[11px] text-muted-foreground">
              只有拥有者可以授予「拥有者」角色。
            </p>
          </div>

          <div class="space-y-2">
            <Label for="member-status">状态</Label>
            <Select v-model="values.status">
              <SelectTrigger id="member-status" aria-label="状态">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="status in MEMBER_STATUSES" :key="status" :value="status">
                  {{ MEMBER_STATUS_LABELS[status] }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <p
          v-if="formError"
          class="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          role="alert"
        >
          {{ formError }}
        </p>

        <DialogFooter>
          <Button type="button" variant="outline" @click="emit('update:open', false)">取消</Button>
          <Button type="submit" :disabled="submitting" data-testid="member-submit">
            <LoaderCircle v-if="submitting" class="animate-spin" aria-hidden="true" />
            {{ isEdit ? '保存修改' : '创建成员' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
