<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { AlertDialogTitle, type AlertDialogTitleProps } from 'reka-ui'
import { reactiveOmit } from '@vueuse/core'

import { cn } from '@/lib/utils'

const props = defineProps<AlertDialogTitleProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')
</script>

<template>
  <AlertDialogTitle
    v-bind="delegatedProps"
    :class="cn('text-lg font-semibold tracking-tight', props.class)"
  >
    <slot />
  </AlertDialogTitle>
</template>
