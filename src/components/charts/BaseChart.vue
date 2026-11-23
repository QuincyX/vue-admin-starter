<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import type { ECharts } from 'echarts/core'

import { echarts, type ChartOption } from '@/lib/echarts'

const props = withDefaults(
  defineProps<{
    option: ChartOption
    /** CSS height of the canvas host. */
    height?: string
    /** Text alternative: a canvas chart is invisible to assistive technology. */
    label: string
    testId?: string
  }>(),
  { height: '280px', testId: 'chart' },
)

const host = ref<HTMLDivElement | null>(null)
const chart = shallowRef<ECharts | null>(null)

function render(): void {
  // `notMerge` keeps removed series from lingering when the date range shrinks.
  chart.value?.setOption(props.option, true)
}

onMounted(() => {
  if (!host.value) return
  chart.value = echarts.init(host.value, undefined, { renderer: 'canvas' })
  render()
})

watch(() => props.option, render, { deep: true })

useResizeObserver(host, () => chart.value?.resize())

onBeforeUnmount(() => {
  chart.value?.dispose()
  chart.value = null
})
</script>

<template>
  <div
    ref="host"
    class="w-full"
    :style="{ height }"
    role="img"
    :aria-label="label"
    :data-testid="testId"
  />
</template>
