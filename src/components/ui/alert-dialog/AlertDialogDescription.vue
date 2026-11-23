<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { AlertDialogDescription, type AlertDialogDescriptionProps } from 'reka-ui'
import { reactiveOmit } from '@vueuse/core'

import { cn } from '@/lib/utils'

const props = defineProps<AlertDialogDescriptionProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')
</script>

<template>
  <AlertDialogDescription
    v-bind="delegatedProps"
    :class="cn('text-sm leading-relaxed text-muted-foreground', props.class)"
  >
    <slot />
  </AlertDialogDescription>
</template>
