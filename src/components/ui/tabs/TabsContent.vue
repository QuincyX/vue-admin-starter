<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { TabsContent, type TabsContentProps } from 'reka-ui'
import { reactiveOmit } from '@vueuse/core'

import { cn } from '@/lib/utils'

const props = defineProps<TabsContentProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')
</script>

<template>
  <TabsContent v-bind="delegatedProps" :class="cn('flex-1 outline-none', props.class)">
    <slot />
  </TabsContent>
</template>
