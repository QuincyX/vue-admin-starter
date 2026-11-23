# Implementation Plan: [FEATURE NAME]

- ID: `[NNN]`
- Status: `Draft`
- Spec: `[./spec.md](./spec.md)`

## 技术方案摘要

[用 3-6 句说明实现思路、关键取舍和替代方案。不要重复 spec 的业务描述。]

## 文件影响

| 层 / 路径                        | 变更 | 说明                                    |
| -------------------------------- | ---- | --------------------------------------- |
| `src/types/<resource>.ts`        | 新增 | Zod Schema + 推导类型                   |
| `src/constants/<resource>.ts`    | 新增 | 中文标签、徽标样式、排序权重            |
| `src/data/<resource>.ts`         | 新增 | 零配置演示数据（如需要）                |
| `src/api/<resource>.ts`          | 新增 | Repository 绑定                         |
| `src/stores/<resource>.ts`       | 新增 | 状态、派生、错误码、审计                |
| `src/components/<resource>/`     | 新增 | 资源专属组件                            |
| `src/views/<resource>/index.vue` | 新增 | 页面入口                                |
| `src/router/index.ts`            | 修改 | 路由 + `meta.title` / `meta.permission` |
| `src/constants/navigation.ts`    | 修改 | 侧边栏条目（与路由权限一致）            |

## 权限与数据

- 需要的新权限 / 角色规则：
- Repository 适配器与存储键：
- 审计动作与 target 文案：
- 切换到真实后端时的差异（`read()` / `replaceAll()` / 服务端分页）：

## 交互与路由

- 路由路径、`meta`、懒加载组件：
- URL 状态键（`useListQuery` 的 `defaults` 与 `allowed`）：
- 深链参数（`?new=`、`?edit=`、`?detail=`）：
- 空状态 / 加载 / 错误文案：

## 测试计划

- 单元/组件：`src/__tests__/*.spec.ts` 需要覆盖的契约。
- E2E：`e2e/*.spec.ts` 的用户路径与断言。
- 需要的测试数据（固定种子、固定 `now`）：

## 文档义务

- [ ] `docs/framework-changelog.md`
- [ ] `docs/architecture.md`（分层/权限/数据流变化时）
- [ ] `docs/engineering.md`（脚本/依赖/门禁变化时）
- [ ] README（用户可见行为变化时）
- [ ] `docs/components/`（共享组件行为变化时）

## 风险与回滚

[兼容性、数据迁移、发布顺序、回滚方式。]
