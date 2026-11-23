<script setup lang="ts">
import { computed } from 'vue'

import BaseChart from '@/components/charts/BaseChart.vue'
import ChartCard from '@/components/charts/ChartCard.vue'
import { useTheme } from '@/composables/useTheme'
import { chartTheme, tooltipStyle } from '@/lib/chartTheme'
import type { ChartOption } from '@/lib/echarts'
import type { TrendPoint } from '@/types/dashboard'
import { formatMonthDay } from '@/utils/date'
import { formatNumber } from '@/utils/format'

const props = defineProps<{
  points: TrendPoint[]
  rangeLabel: string
}>()

const { isDark } = useTheme()

const totalVisits = computed(() => props.points.reduce((sum, point) => sum + point.visits, 0))
const totalSignups = computed(() => props.points.reduce((sum, point) => sum + point.signups, 0))

const option = computed<ChartOption>(() => {
  const theme = chartTheme(isDark.value)

  return {
    color: [theme.series[0], theme.series[1]],
    grid: { left: 4, right: 8, top: 16, bottom: 36, containLabel: true },
    tooltip: { trigger: 'axis', ...tooltipStyle(theme) },
    legend: {
      bottom: 0,
      icon: 'roundRect',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: theme.text, fontSize: 11 },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.points.map((point) => formatMonthDay(point.date)),
      axisLine: { lineStyle: { color: theme.axis } },
      axisTick: { show: false },
      axisLabel: { color: theme.text, fontSize: 11 },
    },
    yAxis: [
      {
        type: 'value',
        splitLine: { lineStyle: { color: theme.split, type: 'dashed' } },
        axisLabel: { color: theme.text, fontSize: 11 },
      },
      {
        type: 'value',
        splitLine: { show: false },
        axisLabel: { color: theme.text, fontSize: 11 },
      },
    ],
    series: [
      {
        name: '访问量',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: props.points.map((point) => point.visits),
        lineStyle: { width: 2 },
        areaStyle: { opacity: 0.16 },
      },
      {
        name: '注册量',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        showSymbol: false,
        data: props.points.map((point) => point.signups),
        lineStyle: { width: 2 },
      },
    ],
  }
})

const summary = computed(
  () =>
    `最近 ${props.rangeLabel}访问量 ${formatNumber(totalVisits.value)}，注册量 ${formatNumber(totalSignups.value)}。`,
)
</script>

<template>
  <ChartCard title="访问与注册趋势" description="按天汇总的访问量与新增注册">
    <template #actions>
      <div class="text-right">
        <p class="text-sm font-semibold tabular-nums">{{ formatNumber(totalVisits) }}</p>
        <p class="text-[11px] text-muted-foreground">访问量</p>
      </div>
    </template>

    <BaseChart :option="option" :label="summary" height="300px" test-id="trend-chart" />
  </ChartCard>
</template>
