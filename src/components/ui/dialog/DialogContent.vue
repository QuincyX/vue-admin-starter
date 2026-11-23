<script setup lang="ts">
import { computed, useAttrs, type HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { X } from '@lucide/vue'
import {
  DialogClose,
  DialogContent,
  DialogPortal,
  useForwardPropsEmits,
  type DialogContentEmits,
  type DialogContentProps,
} from 'reka-ui'

import { cn } from '@/lib/utils'
import DialogOverlay from './DialogOverlay.vue'

const props = defineProps<DialogContentProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<DialogContentEmits>()

// The panel lives inside `DialogPortal`, so attribute fallthrough cannot carry
// caller attributes (`data-testid`, `id`) onto it; they are merged explicitly.
defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const delegatedProps = reactiveOmit(props, 'class')
const forwarded = useForwardPropsEmits(delegatedProps, emits)
const contentProps = computed(() => ({ ...forwarded.value, ...attrs }))
</script>

<template>
  <DialogPortal>
    <DialogOverlay />
    <DialogContent
      v-bind="contentProps"
      :class="
        cn(
          'fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border bg-background p-6 shadow-lg duration-200 sm:max-w-lg',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          props.class,
        )
      "
    >
      <slot />

      <DialogClose
        class="absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none"
      >
        <X class="size-4" aria-hidden="true" />
        <span class="sr-only">关闭</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
