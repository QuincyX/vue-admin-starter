# 工程说明

环境、命令、质量门禁与编码约束的权威来源。架构问题看 [architecture.md](./architecture.md)，换后端看 [data-adapters.md](./data-adapters.md)。

## 1. 环境要求

| 依赖    | 版本                                   | 说明                                                              |
| ------- | -------------------------------------- | ----------------------------------------------------------------- |
| Node.js | `^22.22.2 \|\| ^24.15.0 \|\| >=26.0.0` | 推荐 Node 24 LTS（`.nvmrc`: 24.15.0）                             |
| pnpm    | `>= 12.21.0`（项目锁定 `12.21.0`）     | 只用 pnpm，不提交 `package-lock.json`                             |
| 浏览器  | 现代常青浏览器，桌面视口 ≥1280px       | 见 [architecture.md §10](./architecture.md#10-桌面端与单语言决策) |

`pnpm-workspace.yaml` 设置 `nodeLinker: hoisted`，用扁平 `node_modules` 兼容 Windows 上对符号链接敏感的工具链。

## 2. 安装

```bash
corepack enable
corepack prepare pnpm@12.21.0 --activate
pnpm install
```

## 3. 命令

| 命令                    | 作用                                                        |
| ----------------------- | ----------------------------------------------------------- |
| `pnpm dev`              | 开发服务器（含 `/api` 本地鉴权 mock）                       |
| `pnpm dev:proxy`        | 同源代理到真实后端，读取 `.env.proxy` 的 `API_PROXY_TARGET` |
| `pnpm build`            | `type-check` + `vite build` 并行                            |
| `pnpm build-only`       | 仅 Vite 构建（`pnpm verify` 已单独跑类型检查时用）          |
| `pnpm preview`          | 预览生产产物（端口 4173）                                   |
| `pnpm type-check`       | `tsc`(TS7) 检查 .ts/配置 + `vue-tsc`(TS6 API) 检查 SFC      |
| `pnpm test`             | 单测（run 模式）                                            |
| `pnpm test:unit`        | 单测 watch 模式                                             |
| `pnpm test:coverage`    | 覆盖率（v8，`src/**`）                                      |
| `pnpm test:e2e`         | Playwright（自管 dev server；`CI=true` 时用 preview）       |
| `pnpm test:e2e:ui`      | Playwright UI 模式                                          |
| `pnpm docs:check`       | 必需文档存在性 + 相对链接检查                               |
| `pnpm docs:screens`     | 重新生成 README 截图与 PWA 图标（需先启动 dev/preview）     |
| `pnpm check:components` | 纯转发组件检查（已并入 `pnpm lint`）                        |
| `pnpm lint`             | 组件结构检查 → oxlint → eslint                              |
| `pnpm lint:fix`         | oxlint --fix → eslint --fix                                 |
| `pnpm format`           | Prettier 写入（含 Tailwind 类名排序）                       |
| `pnpm format:check`     | Prettier 校验                                               |
| `pnpm verify`           | 收尾门禁：docs → format → lint → type-check → unit → build  |

`deploy/build.sh` 与 `deploy/publish.sh` 是发布用的可复现脚本，用法见 [§9](#9-ci-与部署)。

## 4. 完整质量门禁

`pnpm verify` 依次执行：

1. `docs:check` — 必需文档齐全、相对链接可解析。
2. `format:check` — Prettier 无差异。
3. `lint` — `check:components`（禁止纯转发组件）+ `oxlint` + `eslint`（含边界守卫与 `no-v-html`）。
4. `type-check` — TS7 应用侧 + Node 侧 + `vue-tsc` SFC。
5. `test:unit:run` — Vitest 全量。
6. `build` — 生产构建（含 PWA manifest 与 SW）。

交互、路由、权限、主题或持久化变更还必须跑 `pnpm test:e2e`；涉及 `vite.config.ts`、`deploy/` 时跑 `bash deploy/build.sh --skip-install`。

### 常见故障

| 症状                                                | 处理                                                                      |
| --------------------------------------------------- | ------------------------------------------------------------------------- |
| `vue-tsc` 报告 `RouteMeta` 字段类型为 `{}`          | 确认 `src/router/guards.ts` 保留了 `import '@/types/router'` 副作用导入   |
| E2E 全量失败且页面出现 `Duplicate attribute` 覆盖层 | 某个 SFC 有重复属性（例如两个 `v-bind`），修复后重启 dev server           |
| `pnpm test:e2e` 无法启动浏览器                      | `pnpm exec playwright install chromium`，或设 `PLAYWRIGHT_CHANNEL=msedge` |
| 表单/筛选读不到 `getByLabel`                        | 确认 `ui/label` 转发了 `for`（reka 的 `Label` 把 `for` 声明为 prop）      |
| 构建提示 chunk 过大                                 | ECharts 已通过 `advancedChunks` 单独分块；不要把它并回主 chunk            |

## 5. 变更分类与文档义务

- **业务变更**：示例成员/审计字段、示例数据、页面内交互与中文文案。至少通过格式、Lint、类型检查与对应测试；影响用户操作时补 E2E。
- **框架变更**：依赖、构建、路由/权限/状态/API 架构、主题、共享 UI、环境变量、脚本、CI、部署、Agent 规则、目录边界。必须在同一次变更中更新 [framework-changelog.md](./framework-changelog.md) 与 [AGENTS.md §3.1](../AGENTS.md#31-强制文档更新矩阵) 要求的文档。
- **混合变更**按框架变更处理。

非平凡业务功能走 [specs/README.md](../specs/README.md) 的轻量流程（`spec.md` → `plan.md` → `tasks.md` → `verification.md`）。

## 6. 编码约束

### 6.1 TypeScript

- 严格模式 + `noUncheckedIndexedAccess`。索引访问返回 `T | undefined`：优先在边界收窄（`const [first] = list; if (!first) return`），不要用 `!` 掩盖。
- 领域类型一律 `z.infer` 推导；不要为同一结构写两份类型。
- 公共函数写显式返回类型；组件 props 用 `defineProps<Props>()` 并给可选 prop 默认值（`withDefaults` 或 `defineModel`）。
- 不引入 `any`；确实无法建模的外部数据先落到 `unknown`，交给 Zod。

### 6.2 UI 与样式

- 颜色、圆角、字号只允许来自 `src/assets/main.css` 的语义 Token（`bg-card`、`text-muted-foreground`、`border-border`…）或 `chartTheme` 的画布色板。
- 新增基础组件优先用 shadcn-vue 源码放进 `src/components/ui/<name>/`，保持 `index.ts` + 组件的目录形状，方便以后 `shadcn-vue add` 覆盖升级。
- `src/components/ui/**` 关闭了 `vue/require-default-prop`：这些 props 的默认值在 `cva(...)` 里，且要保留上游形状以便覆盖升级。其他目录仍然强制默认值。
- 弹窗/下拉的 portal 内容收不到属性透传时，用 `inheritAttrs: false` + 显式合并 `$attrs`（见 `ui/dialog/DialogContent.vue`），不要依赖"属性会自己落到面板上"。
- 不使用 `v-html` 渲染不可信内容（lint 已禁止）。

### 6.3 状态与持久化

- Store 用 Setup Store（`defineStore('x', () => {...})`），只暴露 `ref`/`computed`/函数，不返回可变内部对象。
- 持久化只发生在 `Repository` 适配器、`src/api/token.ts` 与专用 composable（`useTheme`、`useSidebar`）。视图与 Store 不得直接读写 `localStorage`（ESLint 拦截）。
- 存储键带版本号：`aurora.members.v1`、`aurora.audit.v1`、`aurora.access-token.v1`、`aurora.theme.v1`、`aurora.sidebar.v1`、`aurora.cache.v1.*`。结构变化 = 新键，不做就地迁移。
- 远端资源的错误只向视图暴露 `errorCode: ApiErrorCode`，文案统一由 `utils/apiError.ts` 映射。
- 列表查询状态必须走 `useListQuery` / `useResourceList`，不得用本地 `ref`。

### 6.4 错误处理与文案

- 传输/HTTP/业务错误统一归一化为 `ApiError`（`src/api/errors.ts`），UI 只读 `code`/`status`/`requestId`。
- 面向用户的中文文案集中定义：API 错误在 `utils/apiError.ts`，领域规则在 Store 的 `MemberRuleError`，表单校验在 Zod Schema 的 `message`。
- 不把 token、Cookie、完整请求体写进 `console`、toast 或错误上报。
- 会话失效只有一个判定点：`src/api/http.ts` 的 `shouldClearSession()`。

### 6.5 测试

- 新增权限规则 → 补 `permissions.spec.ts` 与（如涉及路由）`guards.spec.ts`。
- 新增列表页 → 补 `resource-list.spec.ts` 风格的组合式测试；URL 往返必须有断言。
- 新增共享组件 → 补组件测试，至少覆盖键盘/ARIA 契约（`aria-sort`、`aria-checked`、空状态、加载态）。
- 新增用户可见流程 → 补一个 e2e，优先断言可观察结果（URL、行数、toast、`aria-*`），而不是实现细节。
- 测试不得依赖执行顺序与真实时间：用固定 `now`、固定种子数据与显式等待条件。

## 7. 依赖策略

- 运行时依赖保持克制：`vue`、`vue-router`、`pinia`、`axios`、`zod`、`@vueuse/core`、`reka-ui`、`class-variance-authority`、`clsx`、`tailwind-merge`、`echarts`、`@lucide/vue`。
- 不引入第二个同类库（第二个组件库、HTTP 客户端、状态库、图表库、日期库）。需要时先证明现有库无法满足，并把理由写入 [framework-changelog.md](./framework-changelog.md)。
- 表单校验复用 Zod + `validateWithSchema()`，不引入表单库。
- 升级依赖后必须跑 `pnpm verify` 与（涉及交互时）`pnpm test:e2e`；TypeScript / Vite / vue-tsc 大版本升级还要复跑 Agent 规则审计。

## 8. Agent 规则生命周期与审计

触发：模型 / DSH / TypeScript / Vite / 测试工具升级后、至少每季度、或出现规则冲突与上下文异常增长。

步骤：

1. 对照 `AGENTS.md` §3.2 准入标准逐条检查：是否有项目事实、风险边界或失败证据支撑。
2. 删除无证据、重复、过宽或已被工具覆盖的规则（例如已经由 ESLint/测试拦截的内容只保留一行指向）。
3. 修正因目录/命令变化而失效的引用。
4. 结果写入 [framework-changelog.md](./framework-changelog.md)。

## 9. CI 与部署

### CI（已移除）

本仓库不配置 GitHub Actions：2026-11-23 移除了 `.github/workflows/ci.yml` 与 `.github/dependabot.yml`，并关闭了仓库的 Actions 开关。质量门禁统一由本地执行的 `pnpm verify`（涉及交互/路由/权限/主题/持久化时再加 `pnpm test:e2e`）承担，顺序见 [§4](#4-完整质量门禁)。

原先由 CI 代跑的两条脚本语法检查改为发布前手工执行：

```bash
bash -n deploy/build.sh && bash -n deploy/publish.sh
```

### 构建与发布

```bash
bash deploy/build.sh                 # 冻结锁文件安装 + 类型检查 + 构建 + 产物断言
bash deploy/build.sh --build-only    # 跳过类型检查
STRICT_ENV=1 bash deploy/build.sh    # 拒绝 .env.local 与相对/本地 API 地址
bash deploy/publish.sh --build       # 构建后按缓存策略上传 S3
```

静态托管必须把未知路径回退到 `index.html`（history 路由），并让 `index.html`、`sw.js`、`manifest.webmanifest` 走 `no-cache`；`deploy/nginx.conf` 是可用的参考配置。子路径部署需要同步 `vite.config.ts` 的 `base` 与 PWA 的 `start_url`/`scope`。
