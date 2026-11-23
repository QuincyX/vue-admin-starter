# Tasks: [FEATURE NAME]

- ID: `[NNN]`
- Spec: `[./spec.md](./spec.md)`
- Plan: `[./plan.md](./plan.md)`

任务按依赖排序，完成后勾选并注明对应验证。跨会话继续时以本文件为唯一任务源。

## Phase 1 · 数据与契约

- [ ] T001 `src/types/<resource>.ts`：Zod Schema、Draft、List 与推导类型
- [ ] T002 `src/constants/<resource>.ts`：中文标签、徽标样式、排序权重
- [ ] T003 `src/data/<resource>.ts`：固定种子的演示数据（如需要）
- [ ] T004 `src/api/<resource>.ts`：Repository 绑定、存储键、写后审计

## Phase 2 · 状态与权限

- [ ] T005 `src/stores/<resource>.ts`：`hydrate`、CRUD、派生统计、错误码
- [ ] T006 权限表与业务规则（`constants/permissions.ts`、Store 内二次校验）
- [ ] T007 `src/router/index.ts` + `src/constants/navigation.ts`：路由与导航对齐

## Phase 3 · 页面与组件

- [ ] T008 `src/components/<resource>/`：表单弹窗、徽标、详情
- [ ] T009 `src/views/<resource>/index.vue`：`useResourceList` + `DataTable`
- [ ] T010 深链（`?new=` / `?edit=` / `?detail=`）与 URL 状态
- [ ] T011 空状态、加载骨架、错误与 toast 文案

## Phase 4 · 验证

- [ ] T012 组件测试（表格交互、表单校验、空状态）
- [ ] T013 组合式测试（URL 往返、越界回退、选择清理）
- [ ] T014 E2E（主路径 + 一条权限拒绝路径）
- [ ] T015 `pnpm verify` 通过
- [ ] T016 `pnpm test:e2e` 通过
- [ ] T017 `verification.md` 记录证据并置为 `Verified`
