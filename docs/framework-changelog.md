# 框架变更记录

只追加，不重写历史。新记录放在最上面，日期使用 `YYYY-MM-DD`。

每条至少回答：**改了什么 / 为什么 / 影响哪些文档与迁移**。

---

## 2026-11-23 · 移除 GitHub Actions 与 Dependabot 配置

**类型**：框架（CI、依赖自动化、文档）

**改了什么**

- 删除 `.github/workflows/ci.yml`（工作流 `CI`）与 `.github/dependabot.yml`（工作流 `Dependabot Updates`）；`.github/` 只保留 `pull_request_template.md`。
- 通过 GitHub API 关闭仓库的 Actions 开关，并删除仓库已有的全部 Actions 运行记录。
- 质量门禁改由本地 `pnpm verify`（必要时再跑 `pnpm test:e2e`）承担；原先 CI 代跑的两条 `bash -n` 脚本语法检查改为发布前手工执行。
- `docs/engineering.md`：§3 命令表的 `build-only` 说明去掉 CI 前提；§9 的 `### CI` 改写为 `### CI（已移除）`。
- `README.md`：删除 GitHub Actions / "CI 顺序"表述，结构树移除 workflow 行，`CI=true` 明确为 Playwright 的本地环境变量。

**为什么**

用户要求删除 GitHub Actions。Vue 两个 starter 的同源模板此前用过 Actions，本次统一收敛为"门禁只在本地/发布机执行"，不再维护 workflow 与 Dependabot 配置。

**影响与迁移**

- 推送不再触发任何自动化检查：门禁完全依赖提交者本地执行，没有服务端兜底。合并前必须人工确认 `pnpm verify`（涉及交互/路由/权限/主题/持久化时再加 `pnpm test:e2e`）已通过。
- 依赖不再自动升级，改为人工定期检查：`pnpm outdated` 看差异，`pnpm up --latest` 升级。
- 仓库 Actions 开关已关闭，以后即使重新添加 workflow 文件也不会运行，需先在仓库设置中重新启用。
- 历史运行记录已删除且不可恢复；更早条目里的 CI 描述作为历史保留，不再是当前事实。

**文档**：`README.md`、`docs/engineering.md`、本条记录。

**验证**：`pnpm install --frozen-lockfile`、`pnpm verify`、`pnpm test:e2e` 通过；`gh workflow list` 与 `gh run list` 均为空。

---

## 2026-11-23 · 依赖补齐到当前最新可用版本，包管理器升到 pnpm 12

**类型**：框架（依赖、工具链、CI、部署）

**改了什么**

- 运行时依赖：`vue` 3.5.45 → 3.5.46、`@lucide/vue` 1.73.0 → 1.77.0。
- 开发依赖：`vitest` / `@vitest/coverage-v8` 5.1.0 → 5.1.1、`oxlint` 与 `eslint-plugin-oxlint` 1.93.0 → 1.94.0（两包保持 lockstep：`eslint-plugin-oxlint@1.94.0` 的 peer 要求 `oxlint ~1.94.0`）、`npm-run-all2` 9.0.4 → 9.1.0、`@types/node` 24.19.2 → 26.6.6。
- 声明对齐到已安装版本（无实际版本变化）：`echarts` `^6.1.0`、`reka-ui` `^2.11.0`、`tailwind-merge` `^3.7.1`。
- 包管理器：`packageManager` 11.28.5 → 12.21.0；`engines.pnpm` `>= 11` → `>= 12.21.0`；CI 的 `pnpm/action-setup` `version` 同步 12.21.0（该工作流随后按当天"移除 GitHub Actions"条目删除）；`deploy/build.sh` 的 pnpm 下限从 11 改为 12。
- `pnpm-lock.yaml` 由 pnpm 12 重写：新增 `packageManagerDependencies` / `configDependencies` 段，`lockfileVersion` 仍为 9.0。

**为什么**

用户要求把三个子项目的依赖都取当前最新可用版本。除 `@types/node` 外都是同 major 的补丁/次要版本；`@types/node` 26 与 `engines` 已声明的 `>=26.0.0` 一致，所以本次跟进 major，并在 26.6.6 上跑通全部门禁。

**影响与迁移**

- pnpm 12 会按 `packageManager` 接管版本：版本不符时 pnpm 直接报错（实测用 corepack 调起 pnpm 11.28.13 会被拒绝）。升级后需 `corepack prepare pnpm@12.21.0 --activate`。
- `@types/node` 26 会带来 Node 26 才有的 API 类型，而运行时基线仍是 Node 24（`.nvmrc` 24.15.0），因此**类型层可能放行运行时不存在的新 API**，属已知取舍；需要严格对齐时应回落 `@types/node` 24.x 并降 `engines`。
- lockfile 含 pnpm 12 专有段落，用 pnpm 11 安装会改写它们，故 CI 与部署统一 12.21.0。
- 新增一条 `pnpm peers check` 警告：`@typescript-eslint/typescript-estree` 8.72.2 → 8.73.0（随 lockfile 重解析的间接升级）要求 `@typescript/native >=7.1.0-dev`，而项目按 AGENTS §5 固定在 TS 7.0.2 稳定版。该检查不在 `pnpm verify` 门禁内，type-check、lint、构建均通过；TS 7.1 发布稳定版后再跟进。
- 命令、目录、业务代码零改动；`vite.config.ts` 的 `advancedChunks` 弃用警告与本次无关（Vite 版本未变）。

**文档**：README（环境要求、技术栈版本表）、`docs/engineering.md §1`、`.github/workflows/ci.yml`、`deploy/build.sh`、`pnpm-workspace.yaml` 注释、本条记录。

**验证**：`pnpm install --frozen-lockfile` 通过；`pnpm verify` 通过（docs:check 24 文件 / 79 相对链接；prettier 全部符合；oxlint 0 warnings 0 errors；ESLint 无输出；type-check 通过；13 个测试文件 / 105 测试通过；`vite build` 成功）；`pnpm test:e2e` 33 passed。

---

## 2026-11-22 · 从 vue-webapp-starter 派生为管理后台模板

**类型**：框架（定位、依赖、架构、UI 基座、测试）

**改了什么**

- 新项目 `vue-admin-starter`（品牌 Aurora Admin），从 `vue-webapp-starter` 复制后按后台模板重构，保留其工程基座（Vite 8 / TS 7 并存 / Pinia / Axios / Zod / Vitest / Playwright / 部署脚本）。
- 引入 **shadcn-vue** 组件层：`reka-ui` + `class-variance-authority` + `clsx` + `tailwind-merge` + `tw-animate-css`，组件源码 vendored 在 `src/components/ui/`，`src/lib/utils.ts` 提供 `cn()`，`components.json` 记录生成配置。
- 设计 Token 迁移到 shadcn-vue 词表（`--background/--card/--popover/--secondary/--destructive/--chart-*` 等），删除旧的 `.btn/.card/.input` 手写组件类，统一由 `ui/` 组件承载。
- 新增 **RBAC**：`types/auth.ts` 的 `ROLES/PERMISSIONS`、`constants/permissions.ts` 的权限表、`router/guards.ts` 的权限拦截、`usePermission()`、`/access` 权限矩阵页。
- 新增**总览图表**：ECharts 模块化注册（`src/lib/echarts.ts`）、`BaseChart`/`ChartCard` 封装、`chartTheme` 画布色板、固定种子趋势数据。
- 新增**操作日志**：`types/audit.ts`、`data/audit.ts`、`api/audit.ts`（含 `recordAuditEvent()`）、`stores/audit.ts`、日志页与详情弹窗。
- 新增**通用表格与列表管理**：`DataTable` / `DataTableToolbar` / `DataTablePagination`、`useListQuery`（URL 状态）、`useResourceList`（过滤→排序→分页+选择）。
- 新增**成员管理**资源切片（types/constants/data/api/store/components/view），演示七处依赖顺序与深链（`?new=1`、`?edit=`）。
- 认证改为**三角色演示账号**（owner/admin/viewer），mock 服务更名 `server/admin-api-mock.ts` 并在响应中返回 `role`；移除自助注册页面与相关 schema。
- 图标从 `lucide-vue-next` 语义统一到 `@lucide/vue`；新增 `echarts` 依赖并配置 `advancedChunks` 单独分块。
- 测试重建：105 个单元/组件测试（权限、守卫、列表管理、Store、DataTable、Repository 契约等）与 33 个 E2E（auth/rbac/members/audit/dashboard/settings/layout）。
- 新增 `scripts/capture-docs.mjs`（`pnpm docs:screens`）从运行中的 UI 生成 README 截图与 PWA 图标，避免截图与品牌漂移。

**为什么**

用户要求以现有 Vue 模板为底座，产出一个"开箱即用"的 Web 管理后台起始模板：shadcn-vue、鉴权、路由拦截、总览图表、操作日志、通用表格与通用列表管理。

**影响与迁移**

- 旧任务域（tasks）整体移除；`aurora.*` 存储前缀取代 `orbit.*`，不复用旧 localStorage 数据（新键 = 新数据，不做迁移）。
- 文档全量重写：`README.md`、`AGENTS.md`、`docs/*`、`specs/001-admin-console`。
- `eslint.config.ts` 新增 `src/components/ui/**` 的 `vue/require-default-prop` 关闭项（理由见 [engineering.md §6.2](./engineering.md#62-ui-与样式)）。

---

## 2026-11-22 · 移除移动端适配与 i18n，范围收敛为桌面端中文后台

**类型**：框架（范围、依赖、UI、测试）

**改了什么**

- 删除 `vue-i18n` 依赖、`src/i18n/` 双语包、`LocaleSwitcher`、`Accept-Language` 动态取值（改为固定 `zh-CN`）、`i18n-keys` 测试与 `__VUE_I18N_*` 构建常量。
- 所有界面文案改为直接写简体中文；枚举的中文标签集中在 `src/constants/*`，API 错误文案集中在 `src/utils/apiError.ts`，表单校验文案写在 Zod Schema 的 `message`。
- 删除移动端适配：移动端抽屉导航（含焦点陷阱与 body 滚动锁定）、`Sheet` 组件、响应式断点切换布局、`InstallApp` 安装卡片、`responsive.spec.ts`。
- 布局改为固定桌面壳：可折叠侧边栏 + 顶栏 + 内容区；`AuthLayout` 使用桌面左右分栏。
- `AGENTS.md` 红线 4 从"文案走 i18n"改为"统一简体中文，不引入第二套文案系统"；`docs/architecture.md §10` 记录该决策与恢复条件。

**为什么**

用户明确要求：去掉移动端适配、去掉多语言，只保留中文。后台用户环境可预期，双语文案与移动端布局带来的是持续成本而非当前价值。

**影响与迁移**

- 依赖减少（`vue-i18n` 移除），`vite.config.ts` 移除 i18n 相关 `define`。
- `e2e/helpers.ts`、所有 spec 的中文选择器与断言同步更新；新增 `layout.spec.ts` 校验 1440/1280 无横向溢出与侧边栏折叠持久化。
- 如果未来需要多语言或移动端：属范围变更，需同步改 `AGENTS.md`、`docs/architecture.md §10`、README 与相关测试。

---

## 2026-11-22 · 组件层修正：可访问名称、下拉定位与 portal 属性透传

**类型**：框架（共享 UI 行为）

**改了什么**

- `ui/label`：reka-ui 的 `Label` 把 `for` 声明为 prop，此前只绑定了 `class`，导致 `<Label for="email">` 与输入框失去关联、`getByLabel()` 与屏幕阅读器都读不到标签。改为 `reactiveOmit` + 显式转发。
- `ui/select`：`SelectViewport` 只保留宽度锚定，去掉把 viewport 高度固定为 `--reka-select-trigger-height` 的类——它会把选项裁成一行，导致下拉在视觉上只露出一条。
- `ui/dialog`、`ui/alert-dialog`：面板在 portal 内，`data-testid`/`id` 无法通过属性透传落到面板上。改为 `inheritAttrs: false` + 合并 `$attrs`（注意不能在同一元素写两个 `v-bind`，`vite-plugin-vue-inspector` 会报 `Duplicate attribute` 并阻塞整页）。
- `ui/dialog/dialog-title`、`-description`、`ui/alert-dialog/*`、`ui/avatar-fallback`、`ui/tabs-list`、`ui/select-value`、`ui/dropdown-menu-label` 等补上 props 转发，避免声明过的 prop 被静默丢弃。
- `charts/TrendChart` 去掉双 Y 轴轴名（会与卡片标题/刻度重叠），系列含义由图例承担。
- `e2e/helpers.ts` 的登录跳转断言放宽到 15s：本地 mock 每次登录都跑 `scrypt`，并行 worker 下会超过默认 5s 期望超时；演示账号快捷登录测试同时断言密码框已填充，避免把"表单未同步"伪装成登录失败。

**为什么**

e2e 暴露了真实回归：标签不可关联导致所有 `getByLabel` 失败；下拉选项被裁剪导致不可点击；portal 面板拿不到测试 id 导致断言失效。这些都属于共享 UI 契约问题，必须在基座层修，而不是在页面里加 hack。

**影响与迁移**

- 行为契约记录在 [components/README.md](./components/README.md)；`pnpm test:e2e` 覆盖了标签、下拉与弹窗路径。
- 后续用 `shadcn-vue add` 覆盖升级时，注意保留上述转发逻辑，否则同类回归会再次出现。
