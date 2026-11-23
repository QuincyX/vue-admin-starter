# Tasks: 管理后台骨架

- ID: `001`
- Spec: [./spec.md](./spec.md)
- Plan: [./plan.md](./plan.md)
- Status: `Verified`

## Phase 1 · 数据与契约

- [x] T001 `src/types/auth.ts`：`ROLES` / `PERMISSIONS` / 登录与资料 Schema
- [x] T002 `src/types/member.ts`：成员 Schema（Draft/List）、状态与部门枚举
- [x] T003 `src/types/audit.ts`：动作/结果封闭枚举、actor 与 metadata
- [x] T004 `src/data/members.ts`：24 名成员（覆盖三种角色/状态/部门）
- [x] T005 `src/data/audit.ts`：14 天固定种子审计事件
- [x] T006 `src/api/members.ts` + `src/api/audit.ts`：Repository 绑定、存储键、写后审计
- [x] T007 `src/api/auth.ts`：登录/me/资料/密码/登出（移除注册）

## Phase 2 · 状态与权限

- [x] T008 `src/constants/permissions.ts`：权限表、中文标签、`roleCan()`
- [x] T009 `src/constants/navigation.ts`：分组导航 + 权限
- [x] T010 `src/stores/auth.ts`：会话恢复、登录/登出、角色与权限派生、登录审计
- [x] T011 `src/stores/members.ts`：`hydrate`、CRUD、唯一邮箱、owner 规则、重置
- [x] T012 `src/stores/audit.ts`：只读投影、`actionCounts`、`failures24h`、`recent`
- [x] T013 `src/router/index.ts` + `guards.ts`：路由表、`meta.title`/`permission`、三段守卫
- [x] T014 `src/composables/usePermission.ts` + `useSidebar.ts`

## Phase 3 · 页面与组件

- [x] T015 `src/components/ui/**`：shadcn-vue primitives + 全局 loading/toast/主题切换
- [x] T016 `src/components/layout/**`：侧边栏、导航、顶栏、账号菜单
- [x] T017 `src/components/data-table/**`：DataTable / Toolbar / Pagination
- [x] T018 `src/components/charts/**` + `src/lib/echarts.ts` + `chartTheme.ts`
- [x] T019 `src/views/home/index.vue` + dashboard 组件（KPI/趋势/分布/系统状态/最近操作）
- [x] T020 `src/views/members/index.vue` + 表单弹窗 + 徽标 + 批量移除
- [x] T021 `src/views/audit/index.vue` + 详情弹窗 + CSV 导出 + `?detail=` 深链
- [x] T022 `src/views/access/index.vue`：角色 × 权限矩阵
- [x] T023 `src/views/settings/index.vue` + 设置卡片（资料/密码/外观/数据/后端/关于）
- [x] T024 `src/views/login/index.vue` + `LoginDialog`（就地续签）
- [x] T025 `src/views/{forbidden,not-found}/index.vue`
- [x] T026 `src/layouts/{DefaultLayout,AuthLayout}.vue`、`App.vue`、`main.ts`

## Phase 4 · 验证

- [x] T027 单元/组件测试 13 个文件、105 个用例
- [x] T028 E2E 7 个文件、33 个用例
- [x] T029 `pnpm verify` 通过
- [x] T030 `pnpm test:e2e` 通过
- [x] T031 `verification.md` 记录证据并置为 `Verified`
- [x] T032 README 截图与 PWA 图标由 `scripts/capture-docs.mjs` 生成
