<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Activity, ShieldAlert, UserCheck, Users } from '@lucide/vue'

import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import ActionDistributionChart from '@/components/dashboard/ActionDistributionChart.vue'
import RecentActivityTable from '@/components/dashboard/RecentActivityTable.vue'
import RoleDonutChart from '@/components/dashboard/RoleDonutChart.vue'
import RoleSummaryCard from '@/components/dashboard/RoleSummaryCard.vue'
import ServiceStatusPanel from '@/components/dashboard/ServiceStatusPanel.vue'
import TrendChart from '@/components/dashboard/TrendChart.vue'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useListQuery } from '@/composables/useListQuery'
import { createTrendSeries } from '@/data/dashboard'
import { useAuditStore } from '@/stores/audit'
import { useMemberStore } from '@/stores/members'
import { formatNumber, formatPercent } from '@/utils/format'

const memberStore = useMemberStore()
const auditStore = useAuditStore()

const { filters } = useListQuery({
  defaults: { range: '14' },
  allowed: { range: ['7', '14', '30'] },
})

/** Captured once so range switches do not slide the "last N days" window. */
const today = new Date()

const range = computed(() => Number(filters.range))
const rangeLabel = computed(() =>
  filters.range === '7' ? '7 天' : filters.range === '30' ? '30 天' : '14 天',
)
const trendPoints = computed(() => createTrendSeries(today, range.value))

/** Week-over-week deltas are computed from the same deterministic series. */
const weekly = computed(() => {
  const points = createTrendSeries(today, 30)
  const current = points.slice(-7)
  const previous = points.slice(-14, -7)

  const sum = (list: typeof points, key: 'visits' | 'signups') =>
    list.reduce((total, point) => total + point[key], 0)

  const visits = sum(current, 'visits')
  const previousVisits = sum(previous, 'visits')
  const signups = sum(current, 'signups')
  const previousSignups = sum(previous, 'signups')

  const delta = (value: number, before: number): number =>
    before === 0 ? 0 : ((value - before) / before) * 100

  return {
    visits,
    signups,
    visitsTrend: delta(visits, previousVisits),
    signupsTrend: delta(signups, previousSignups),
    conversion: visits === 0 ? 0 : (signups / visits) * 100,
  }
})

const membersLoading = computed(
  () => memberStore.status === 'idle' || memberStore.status === 'loading',
)
const auditLoading = computed(() => auditStore.status === 'idle' || auditStore.status === 'loading')

const activeRatio = computed(() =>
  memberStore.total === 0 ? 0 : (memberStore.activeCount / memberStore.total) * 100,
)

onMounted(() => {
  void memberStore.hydrate()
  void auditStore.hydrate(true)
})
</script>

<template>
  <div class="space-y-4">
    <PageHeader
      title="数据总览"
      description="访问趋势、成员结构、操作分布与系统状态。所有图表数据来自当前浏览器中的演示数据。"
    >
      <template #actions>
        <Tabs
          :model-value="filters.range"
          @update:model-value="(value) => (filters.range = String(value))"
        >
          <TabsList aria-label="选择趋势区间">
            <TabsTrigger value="7">7 天</TabsTrigger>
            <TabsTrigger value="14">14 天</TabsTrigger>
            <TabsTrigger value="30">30 天</TabsTrigger>
          </TabsList>
        </Tabs>
      </template>
    </PageHeader>

    <section class="grid grid-cols-4 gap-4" aria-label="关键指标">
      <StatCard
        label="近 7 天访问量"
        :value="formatNumber(weekly.visits)"
        :trend="weekly.visitsTrend"
        hint="较前 7 天"
        :icon="Activity"
      />
      <StatCard
        label="近 7 天新增注册"
        :value="formatNumber(weekly.signups)"
        :trend="weekly.signupsTrend"
        :hint="`转化率 ${formatPercent(weekly.conversion)}`"
        :icon="Users"
      />
      <StatCard
        label="活跃成员"
        :value="`${memberStore.activeCount} / ${memberStore.total || '—'}`"
        :hint="`活跃占比 ${formatPercent(activeRatio)}`"
        :icon="UserCheck"
        :loading="membersLoading"
      />
      <StatCard
        label="24 小时失败操作"
        :value="formatNumber(auditStore.failures24h)"
        :hint="`共 ${formatNumber(auditStore.total)} 条审计记录`"
        :icon="ShieldAlert"
        :loading="auditLoading"
      />
    </section>

    <section class="grid grid-cols-3 gap-4">
      <div class="col-span-2">
        <TrendChart :points="trendPoints" :range-label="rangeLabel" />
      </div>
      <RoleSummaryCard />
    </section>

    <section class="grid grid-cols-3 gap-4">
      <ActionDistributionChart :counts="auditStore.actionCounts" />
      <RoleDonutChart :counts="memberStore.roleCounts" :total="memberStore.total" />
      <ServiceStatusPanel />
    </section>

    <RecentActivityTable :events="auditStore.recent" :loading="auditLoading" />
  </div>
</template>
