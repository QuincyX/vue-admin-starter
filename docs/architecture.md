# 架构说明

面向"改造这个模板"的工程师。回答四个问题：分几层、权限怎么判、状态归谁、换后端动哪里。

## 1. 分层

```text
视图层      src/views/*/index.vue           页面编排、URL 状态、弹窗开关
展示层      src/components/**               表格、图表、卡片、弹窗、布局
状态层      src/stores/*.ts                Pinia Setup Store：状态 + 派生 + 错误码
数据层      src/api/*.ts                   Repository 绑定 + Zod 校验 + 审计写入
传输层      src/api/http.ts                Axios 实例、拦截器、会话失效判定
领域层      src/types + src/constants       Schema、枚举、中文标签、权限表
基础设施    src/lib + src/utils             cn()、ECharts 注册、日期/CSV、缓存
```

依赖方向自上而下，**禁止反向 import**：`types` 不知道 `stores`，`api` 不知道 `views`。唯一的例外是 Store 之间可以互相引用（例如成员 Store 需要当前登录用户来写审计）。

页面私有组件放在 `src/components/<resource>/`，只被对应页面引用；一旦第二个页面需要，就提升到共享层。

## 2. 目录边界

| 路径                       | 只放什么                                     | 不允许                                   |
| -------------------------- | -------------------------------------------- | ---------------------------------------- |
| `src/views/<page>/`        | 页面入口 `index.vue` 与只属于该页的子模块    | 被其他页面 import                        |
| `src/components/<domain>/` | 某业务域独占的组件                           | 跨域复用（提升到 `components/common/`）  |
| `src/components/ui/`       | shadcn-vue 基础组件（vendored）              | 业务逻辑、HTTP 调用                      |
| `src/components/common/`   | PageHeader、StatCard、ConfirmDialog 等共享块 | 具体业务字段                             |
| `src/composables/`         | 跨页面复用的组合式逻辑                       | 单页面临时状态                           |
| `src/stores/`              | 领域状态与派生                               | DOM 操作、弹窗开关（放页面或专用 store） |
| `src/api/`                 | Repository 绑定、Zod 解析、审计写入          | 直接出现在视图里的请求                   |
| `src/types/`               | Zod Schema 与 `z.infer` 类型                 | 手写的平行接口                           |

## 3. 路由与守卫

路由表在 [`src/router/index.ts`](../src/router/index.ts)，守卫在 [`src/router/guards.ts`](../src/router/guards.ts)。

```text
beforeEach
  ├─ 未初始化 → auth.bootstrap()（有 token 就请求 /auth/me）
  ├─ meta.guestOnly 且已登录 → 跳到 redirect 或 /
  ├─ meta.requiresAuth 且未登录 → /login?redirect=<fullPath>
  ├─ meta.permission 且角色不允许 → /403?from=<fullPath>
  └─ 通过
```

- `meta.title` 必填，页面组件一律 `() => import(...)` 懒加载。
- 带权限的页面必须同时出现在 `src/constants/navigation.ts`，`permissions.spec.ts` 会校验 path 与 permission 一致。
- `/403` 与 404 不要求额外权限，但仍要求登录——否则匿名用户会被弹回登录页，看不到"无权限"的解释。
- 登录后的回跳目标经 `getSafeRedirect()` 过滤：只接受同源绝对路径，拒绝 `//evil.com` 与 `/login` 自身。

## 4. 权限模型（RBAC）

```text
types/auth.ts           ROLES / PERMISSIONS（Zod enum，单一真相）
constants/permissions.ts ROLE_PERMISSIONS / roleCan() / 中文标签
        ├─ router/guards.ts      路由级拦截
        ├─ constants/navigation.ts 侧边栏可见性
        ├─ composables/usePermission.ts 页面内 can()/canAny()
        └─ stores/members.ts     业务规则（授予 owner、重置数据）
```

- 角色只有三种：`owner` / `admin` / `viewer`。新增角色要同时改权限表、演示账号、`/access` 矩阵与测试。
- 页面内不写 `role === 'admin'`；一律 `can('members:write')`。唯一的角色字符串出现在权限表本身与演示数据。
- **业务规则也走权限**：授予拥有者角色、重置演示数据都要求 `system:manage`，并在 Store 内再校验一次（不能只靠按钮隐藏）。
- 前端权限是体验层；生产后端必须对同一操作独立鉴权。`/access` 页面明确写出这一点。

## 5. 状态与数据所有权

| 状态                        | 归属                            | 持久化                                |
| --------------------------- | ------------------------------- | ------------------------------------- |
| 会话（token / user / role） | `stores/auth.ts`                | `aurora.access-token.v1` + `/auth/me` |
| 成员列表与派生统计          | `stores/members.ts`             | `aurora.members.v1`（Repository）     |
| 审计事件（只读投影）        | `stores/audit.ts`               | `aurora.audit.v1`（Repository）       |
| 列表查询（q/筛选/排序/页）  | URL（`useListQuery`）           | 浏览器地址栏                          |
| 行选择                      | 页面内的 `useResourceList()`    | 不持久化                              |
| 主题                        | `useTheme()`（VueUse 全局单例） | `aurora.theme.v1`                     |
| 侧边栏折叠                  | `useSidebar()`                  | `aurora.sidebar.v1`                   |
| 弹窗开关、表单草稿          | 页面组件                        | 不持久化                              |
| 全局阻塞 loading            | `stores/loading.ts`（任务栈）   | 不持久化                              |

规则：

1. Store 不操作 `localStorage`；持久化只发生在 `Repository` 适配器、`api/token.ts` 与专用 composable（主题、侧边栏）。
2. 视图不拼装领域计算；统计（`roleCounts`、`failures24h`、`recent`）是 Store 的 `computed`。
3. 列表页的筛选/排序/页码必须进 URL；刷新与分享都要能复原。
4. 一次性 UI 状态（弹窗、表单）留在页面，不污染全局 Store。

## 6. 数据流

### 6.1 读

```text
view → store.hydrate() → repository.list() → (localStorage | HTTP) → Zod 校验 → store.members
     → useResourceList(rows=store.members) → 派生 filteredRows/rows/page → DataTable
```

`hydrate()` 默认只执行一次（`status === 'ready'` 时跳过）；审计页与设置页用 `hydrate(true)` 强制刷新，避免看到过期的追加记录。

### 6.2 写

```text
MemberFormDialog → validateWithSchema(memberDraftSchema)
  → store.createMember(draft)
      ├─ 业务规则（唯一邮箱、owner 授予、owner 不可删除）
      ├─ repository.create() → 持久化
      ├─ 本地列表即时更新（无需二次请求）
      └─ recordAuditEvent()（best-effort，不阻塞主操作）
```

失败语义：

- 规则错误抛 `MemberRuleError`（中文消息），表单内联展示；
- 传输错误是 `ApiError`，页面用 `apiErrorMessage()` 转成中文；
- 审计写入失败被吞掉：审计是演示增强，不能反过来让成员编辑失败。

### 6.3 审计写入

`recordAuditEvent()` 是**前端演示**实现：它读取当前登录用户作为 actor，写入 `aurora.audit.v1`。生产必须改为服务端在同一事务内写入，并记录真实的 actor、IP、UA 与请求 ID；前端只负责展示。审计页的详情弹窗、CSV 导出与仪表盘分布都只读这份数据，因此替换写入端不影响视图。

## 7. 安全边界

1. **Token 存储**：示例放 `localStorage` 便于演示拦截器；生产推荐 HttpOnly + Secure + SameSite Cookie，并同步调整 `api/token.ts` 与 CSRF 策略。
2. **会话失效**：只在 `api/http.ts` 的 `shouldClearSession()` 判定（默认 HTTP 401），避免各处重复 401 判断。
3. **前端权限**：`meta.permission` 与按钮可见性只影响体验；后端必须独立鉴权。
4. **审计可信度**：前端写入的审计可被篡改，生产必须服务端写入。
5. **环境变量**：只有 `VITE_` 前缀进入客户端；密钥、私钥、支付凭据不得出现在前端变量或日志中。
6. **错误信息**：`ApiError` 保留 `requestId` 便于排障，但不把 token、Cookie 或完整请求体写进日志与 toast。
7. **跳转**：离开 SPA 的第三方跳转必须由接口返回 URL 后再 `location.assign`，不要前端拼 URL（会丢失鉴权头）。

## 8. 通用表格与列表管理

三层，成员页与日志页共享：

```text
useListQuery(options)        URL ↔ 响应式 filters，支持 allow-list 与 debounce
useResourceList(options)     过滤 → 排序 → 分页 + 选择；输出只读派生
DataTable / Toolbar / Pagination  纯展示，单元格通过 #cell-<key> 插槽
```

设计约束：

- `useResourceList` 只接受 `rows`、`search`、`filters`、`sorters` 与默认值，不关心数据从哪来（Store、静态数组、测试替身皆可）。
- 排序比较器由页面提供（中文姓名用 `Intl.Collator('zh-CN')`，日期用 `localeCompare`），组件不猜。
- 页码越界会被规范化回 URL（`?page=99` → 实际最后一页），而不是静默显示另一页。
- 选择状态由页面持有，删除后必须 `removeFromSelection()`，避免对已删除 id 执行批量操作。

## 9. PWA / Service Worker 与安装

`vite-plugin-pwa` 在构建时生成 manifest 与 Workbox Service Worker（`autoUpdate`），开发服务器不注册。注册在 `main.ts` 的 `load` + 空闲时触发，预缓存不与首屏抢带宽。应用外壳离线可打开，`/api/*` 不在预缓存内。图标由 `scripts/capture-docs.mjs` 从 `public/favicon.svg` 生成，避免品牌与图标漂移。

## 10. 桌面端与单语言决策

模板**只做桌面端、只做简体中文**，这是明确范围：

- 布局：固定侧边栏（可折叠）+ 顶栏 + 内容区；没有移动端抽屉、没有断点切换的单列布局。内容区在 ≥1280px 可用，表格允许横向滚动，但不做移动端产品化。
- 文案：所有界面文案直接写简体中文，`Accept-Language` 固定为 `zh-CN`。没有 i18n 库、没有双语包、没有语言切换器。
- 为什么：后台用户的工作环境是可预期的桌面浏览器；引入 i18n 会带来双份文案、键一致性与日期/数字本地化的持续成本，而当前产品没有第二语言需求。
- 如果产品需要多语言或移动端：这是范围变更，需要用户确认，并同步更新 [AGENTS.md](../AGENTS.md) 红线、本文、README 与测试（`design-tokens`/`layout` 相关断言）。
