# Implementation Plan: 管理后台骨架

- ID: `001`
- Status: `Verified`
- Spec: [./spec.md](./spec.md)

## 技术方案摘要

以 `vue-webapp-starter` 的工程基座（Vite/TS/Pinia/Axios/Zod/测试/部署）为底，替换业务域并补三块框架能力：

1. **UI 基座**换成 shadcn-vue：组件源码 vendored 到 `src/components/ui/`，设计 Token 改为 shadcn 词表，`cn()` 统一类名合并。理由是后台的表格/弹窗/下拉/表单量大，手写样式难以保持一致，而 shadcn-vue 提供可读、可改、无运行时主题耦合的源码。
2. **权限**用一个常量表 + 路由 meta + `usePermission()`，避免在每个页面重复判断角色；`/access` 页面把规则显式展示出来，同时作为 403 的验收对象。
3. **列表能力**拆成 `useListQuery`（URL）+ `useResourceList`（过滤/排序/分页/选择）+ `DataTable`（渲染），让两个列表页成为薄组合。

图表选 ECharts 而不是 shadcn-vue 的 chart 包装：后台图表需求（双轴、格式化、工具栏）更接近 ECharts 的能力面，且只需一个依赖；通过模块注册与 `advancedChunks` 控制体积。

**替代方案与取舍**：

- 用 `@unovis/vue`（shadcn-vue 官方 chart 依赖）：依赖链更重，双轴/格式化定制成本更高，放弃。
- 用后端分页：演示无后端；`useResourceList` 先做客户端过滤，但 URL 契约与 `ListParams` 对齐，替换为服务端只改一层（见 [data-adapters.md §4](../../docs/data-adapters.md#4-切换到真实后端)）。
- 保留 i18n / 移动端：用户明确排除，且会放大双份文案与断点测试成本。

## 文件影响

| 层 / 路径                                                                            | 变更      | 说明                                                                                                                                                                  |
| ------------------------------------------------------------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/ui/**`                                                               | 新增      | shadcn-vue primitives（button/input/label/card/table/dialog/alert-dialog/select/dropdown-menu/checkbox/switch/avatar/tabs/tooltip/separator/skeleton/badge/textarea） |
| `src/lib/{utils,echarts,chartTheme,random,validation}.ts`                            | 新增      | `cn()`、ECharts 注册、画布色板、种子随机、Schema 校验                                                                                                                 |
| `src/types/{auth,member,audit,dashboard,router}.ts`                                  | 重写      | 角色/权限/成员/审计 Schema、`RouteMeta` 扩展                                                                                                                          |
| `src/constants/{permissions,navigation,member,audit,demoAccounts,chart}.ts`          | 新增      | 权限表、导航、中文标签、演示账号                                                                                                                                      |
| `src/data/{members,audit,dashboard}.ts`                                              | 新增      | 24 名成员、14 天审计、30 天趋势（固定种子）                                                                                                                           |
| `src/api/{auth,members,audit}.ts`                                                    | 重写/新增 | 三角色登录、成员 Repository、审计 Repository + `recordAuditEvent()`                                                                                                   |
| `src/stores/{auth,members,audit}.ts`                                                 | 重写/新增 | 会话与权限、成员 CRUD 与规则、审计投影                                                                                                                                |
| `src/composables/{useListQuery,useResourceList,usePermission,useSidebar}.ts`         | 新增      | URL 状态、列表管理、权限、侧边栏                                                                                                                                      |
| `src/components/{data-table,charts,layout,common,dashboard,members,audit,settings}/` | 新增      | 通用表格、图表、后台壳、页面组件                                                                                                                                      |
| `src/views/{home,members,audit,access,settings,login,forbidden,not-found}/index.vue` | 新增      | 8 个页面                                                                                                                                                              |
| `src/router/{index,guards}.ts`                                                       | 重写      | 路由表 + 三段守卫                                                                                                                                                     |
| `src/layouts/{DefaultLayout,AuthLayout}.vue`                                         | 重写      | 桌面后台壳 / 登录分栏                                                                                                                                                 |
| `server/admin-api-mock.ts`                                                           | 新增      | 三角色本地鉴权服务                                                                                                                                                    |
| `eslint.config.ts`                                                                   | 修改      | shadcn 目录的 `require-default-prop` 例外                                                                                                                             |
| `vite.config.ts`                                                                     | 修改      | 品牌、PWA、ECharts 分块、移除 i18n define                                                                                                                             |

删除：`src/i18n/`、`src/views/{tasks,register}`、任务域类型/常量/数据/Store/组件、`LocaleSwitcher`、`InstallApp`、移动端 `Sheet`、`responsive.spec.ts`。

## 权限与数据

- 权限：`dashboard:read`、`members:read|write`、`audit:read|export`、`settings:read|write`、`system:manage`。
- 角色映射：owner 全量；admin 除 `system:manage`；viewer 只读（dashboard/members/audit/settings:read）。
- 路由 `meta.permission` 与导航条目一一对应，由 `permissions.spec.ts` 强制。
- Repository：成员 `aurora.members.v1`、审计 `aurora.audit.v1`，均为 `localRepository`；审计写入 best-effort。
- 存储键统一 `aurora.*`，与旧模板的 `orbit.*` 不兼容（新键 = 新数据）。

## 交互与路由

| 路径        | 权限             | 说明                                                          |
| ----------- | ---------------- | ------------------------------------------------------------- |
| `/login`    | 游客             | `guestOnly`，已登录跳回 `redirect` 或 `/`                     |
| `/`         | `dashboard:read` | 总览，`?range=7/14/30`                                        |
| `/members`  | `members:read`   | 列表，`?q&role&status&department&sort&page&pageSize&new&edit` |
| `/audit`    | `audit:read`     | 列表，`?q&action&outcome&from&to&sort&page&pageSize&detail`   |
| `/access`   | `system:manage`  | 权限矩阵，非拥有者 → `/403?from=/access`                      |
| `/settings` | `settings:read`  | 资料/密码/主题/数据/后端/关于                                 |
| `/403`      | 登录即可         | 解释当前角色与目标路径                                        |
| `/:path*`   | 登录即可         | 404                                                           |

交互：破坏性操作走 `ConfirmDialog`；成员表单在弹窗内校验（`MemberRuleError` 内联）；审计详情支持 `?detail=` 深链；侧边栏可折叠并持久化。

## 测试计划

- 单元/组件：`permissions`（权限表 + 导航对齐）、`guards`（回跳/403/外部 redirect/bootstrap）、`resource-list`（搜索/筛选/排序/分页/选择/URL/越界）、`stores`（成员规则、审计派生、重置权限）、`data-table`（`aria-sort`/选择/空/骨架）、`repository` 三适配器契约、`api`（拦截器/401）、`envelope`、`localCache`、`utils`（日期/数字/CSV/校验/错误文案）、`design-tokens`。
- E2E：`auth`、`rbac`、`members`、`audit`、`dashboard`、`settings`、`layout`（1440/1280 无横向溢出、折叠持久化）。
- 测试数据：成员/审计/趋势均由固定种子生成；日期断言使用固定 `now` 或相对断言（不写死绝对时间）。

## 文档义务

- [x] `docs/framework-changelog.md`（三条记录）
- [x] `docs/architecture.md`（分层/RBAC/状态/数据流/桌面决策）
- [x] `docs/engineering.md`（命令、门禁、约束、故障）
- [x] `docs/data-adapters.md`（契约与迁移）
- [x] README（能力、账号、权限矩阵、脚本、截图）
- [x] `docs/components/`（button/data-table/dialog/toast/theme-toggle）
- [x] AGENTS.md（定位、红线、业务切片、完成定义）

## 风险与回滚

- **权限只是体验**：生产后端必须独立鉴权；模板在 README/AGENTS/architecture 三处显式声明。
- **审计由前端写入**：可被篡改；生产改服务端事务写入，视图无需改动。
- **客户端分页**：数据量大时需替换为服务端分页（`ListParams` 已对齐）。
- **回滚**：本模板为独立目录，回滚即删除目录；不涉及生产数据迁移（`aurora.*` 键与旧模板不共享）。
