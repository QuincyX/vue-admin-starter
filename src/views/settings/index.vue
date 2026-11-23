<script setup lang="ts">
import PageHeader from '@/components/common/PageHeader.vue'
import AboutCard from '@/components/settings/AboutCard.vue'
import AppearanceCard from '@/components/settings/AppearanceCard.vue'
import BackendCard from '@/components/settings/BackendCard.vue'
import DataCard from '@/components/settings/DataCard.vue'
import PasswordCard from '@/components/settings/PasswordCard.vue'
import ProfileCard from '@/components/settings/ProfileCard.vue'
import RoleSummaryCard from '@/components/dashboard/RoleSummaryCard.vue'
</script>

<template>
  <div class="space-y-4">
    <PageHeader
      title="系统设置"
      description="管理账号资料、登录密码、外观偏好与演示数据。账号由拥有者开通，角色决定可用的功能。"
    />

    <div class="grid grid-cols-3 gap-4">
      <div class="col-span-2 space-y-4">
        <ProfileCard />
        <PasswordCard />
        <DataCard />
      </div>

      <div class="space-y-4">
        <RoleSummaryCard />
        <AppearanceCard />
        <BackendCard />
        <AboutCard />
      </div>
    </div>
  </div>
</template>
