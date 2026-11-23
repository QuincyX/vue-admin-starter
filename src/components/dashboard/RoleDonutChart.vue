<script setup lang="ts">
import { computed } from 'vue'

import BaseChart from '@/components/charts/BaseChart.vue'
import ChartCard from '@/components/charts/ChartCard.vue'
import { useTheme } from '@/composables/useTheme'
import { ROLE_LABELS } from '@/constants/permissions'
import { chartTheme, tooltipStyle } from '@/lib/chartTheme'
import type { ChartOption } from '@/lib/echarts'
import type { Role } from '@/types/auth'

const props = defineProps<{
  counts: Record<Role, number>
  total: number
}>()

const { isDark } = useTheme()

const rows = computed(() =>
  (Object.entries(props.counts) as [Role, number][]).map(([role, count]) => ({
    role,
    label: ROLE_LABELS[role],
    count,
  })),
)

const option = computed<ChartOption>(() => {
  const theme = chartTheme(isDark.value)

  return {
    color: theme.series,
    title: {
      text: String(props.total),
      subtext: '成员',
      left: 'center',
      top: '34%',
      textAlign: 'center',
      textStyle: { color: theme.text, fontSize: 22, fontWeight: 600 },
      subtextStyle: { color: theme.text, fontSize: 11 },
    },
    tooltip: { trigger: 'item', ...tooltipStyle(theme) },
    legend: {
      bottom: 0,
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: theme.text, fontSize: 11 },
    },
    series: [
      {
        name: '角色分布',
        type: 'pie',
        radius: ['62%', '82%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: theme.tooltipBackground, borderWidth: 2 },
        label: { show: false },
        data: rows.value.map((row) => ({ name: row.label, value: row.count })),
      },
    ],
  }
})

const summary = computed(
  () => `成员角色分布：${rows.value.map((row) => `${row.label} ${row.count} 人`).join('，')}。`,
)
</script>

<template>
  <ChartCard title="角色分布" description="拥有者 / 管理员 / 观察员">
    <BaseChart :option="option" :label="summary" height="240px" test-id="role-chart" />
  </ChartCard>
</template>
