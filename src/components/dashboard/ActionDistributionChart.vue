<script setup lang="ts">
import { computed } from 'vue'

import BaseChart from '@/components/charts/BaseChart.vue'
import ChartCard from '@/components/charts/ChartCard.vue'
import { useTheme } from '@/composables/useTheme'
import { chartTheme, tooltipStyle } from '@/lib/chartTheme'
import type { ChartOption } from '@/lib/echarts'
import type { AuditAction } from '@/types/audit'
import { AUDIT_ACTION_LABELS } from '@/constants/audit'
import { formatNumber } from '@/utils/format'

const props = defineProps<{
  counts: Record<AuditAction, number>
}>()

const { isDark } = useTheme()

/** Top six actions keep the bars readable; the rest are summarized in the footer. */
const rows = computed(() =>
  (Object.entries(props.counts) as [AuditAction, number][])
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([action, count]) => ({ label: AUDIT_ACTION_LABELS[action], count })),
)

const total = computed(() => rows.value.reduce((sum, row) => sum + row.count, 0))

const option = computed<ChartOption>(() => {
  const theme = chartTheme(isDark.value)

  return {
    color: [theme.series[0]],
    grid: { left: 4, right: 36, top: 4, bottom: 4, containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, ...tooltipStyle(theme) },
    xAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: theme.split, type: 'dashed' } },
      axisLabel: { color: theme.text, fontSize: 11 },
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: rows.value.map((row) => row.label),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: theme.text, fontSize: 11 },
    },
    series: [
      {
        name: '操作次数',
        type: 'bar',
        barWidth: 14,
        itemStyle: { borderRadius: [0, 4, 4, 0] },
        label: { show: true, position: 'right', color: theme.text, fontSize: 11 },
        data: rows.value.map((row) => row.count),
      },
    ],
  }
})

const summary = computed(
  () =>
    `操作类型分布，共 ${formatNumber(total.value)} 次：${rows.value
      .map((row) => `${row.label} ${row.count} 次`)
      .join('，')}。`,
)
</script>

<template>
  <ChartCard title="操作类型分布" description="来自操作日志的全部记录">
    <BaseChart :option="option" :label="summary" height="240px" test-id="action-chart" />
  </ChartCard>
</template>
