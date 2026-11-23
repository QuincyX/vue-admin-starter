# Verification: 管理后台骨架

- ID: `001`
- Status: `Verified`
- Verified at: `2026-11-22`
- Evidence owner: `lead agent`

## 验收场景对照

| #   | 验收场景（来自 spec.md）                                  | 结果 | 证据                                                                                                                                                                                                    |
| --- | --------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 匿名深链 `/audit?outcome=failure` → 登录 → 回到原地址     | ✅   | `e2e/auth.spec.ts` › redirects an anonymous deep link to login and returns to it afterwards                                                                                                             |
| 2   | 刷新保持会话                                              | ✅   | `e2e/auth.spec.ts` › keeps the session across a reload                                                                                                                                                  |
| 3   | 账号菜单退出后回到登录页                                  | ✅   | `e2e/auth.spec.ts` › signs out from the account menu                                                                                                                                                    |
| 4   | 错误密码内联报错、不跳转                                  | ✅   | `e2e/auth.spec.ts` › shows an inline error for wrong credentials                                                                                                                                        |
| 5   | 观察员看不到访问控制，直达 `/access` 得到 403             | ✅   | `e2e/rbac.spec.ts` › hides the access-control entry from a viewer and bounces the direct URL                                                                                                            |
| 6   | 观察员成员表只读（无新增、无选择框）                      | ✅   | `e2e/rbac.spec.ts` › gives a viewer a read-only member table                                                                                                                                            |
| 7   | 管理员不能进入访问控制                                    | ✅   | `e2e/rbac.spec.ts` › lets an admin manage members but not open access control                                                                                                                           |
| 8   | 拥有者看到权限矩阵                                        | ✅   | `e2e/rbac.spec.ts` › shows the permission matrix to the owner                                                                                                                                           |
| 9   | 总览 KPI + 三张图表                                       | ✅   | `e2e/dashboard.spec.ts` › renders the KPI cards and all three charts                                                                                                                                    |
| 10  | 区间切换写 URL 并刷新保持                                 | ✅   | `e2e/dashboard.spec.ts` › switches the trend range through the URL                                                                                                                                      |
| 11  | 最近操作跳转审计详情                                      | ✅   | `e2e/dashboard.spec.ts` › links a recent operation to its audit detail                                                                                                                                  |
| 12  | 日志按结果筛选并保持 URL                                  | ✅   | `e2e/audit.spec.ts` › filters by outcome and keeps the filter in the URL                                                                                                                                |
| 13  | 审计详情深链                                              | ✅   | `e2e/audit.spec.ts` › opens a record detail and deep-links it                                                                                                                                           |
| 14  | 日期范围无匹配时显示空状态                                | ✅   | `e2e/audit.spec.ts` › filters by date range                                                                                                                                                             |
| 15  | 导出 CSV                                                  | ✅   | `e2e/audit.spec.ts` › exports the filtered log as CSV                                                                                                                                                   |
| 16  | 创建成员 + 计数更新                                       | ✅   | `e2e/members.spec.ts` › creates a member and shows it in the table                                                                                                                                      |
| 17  | 搜索持久化                                                | ✅   | `e2e/members.spec.ts` › filters by search and keeps the filter in the URL across reload                                                                                                                 |
| 18  | 排序与 `aria-sort` + URL                                  | ✅   | `e2e/members.spec.ts` › sorts by member name and reflects it in aria-sort and the URL                                                                                                                   |
| 19  | 角色筛选与结果计数                                        | ✅   | `e2e/members.spec.ts` › combines a role filter with the result count                                                                                                                                    |
| 20  | 删除成员（行菜单 + 确认）                                 | ✅   | `e2e/members.spec.ts` › removes a member through the row menu and confirmation                                                                                                                          |
| 21  | 分页与 pageSize 深链                                      | ✅   | `e2e/members.spec.ts` › paginates and honours a page size from the URL                                                                                                                                  |
| 22  | 主题切换持久化                                            | ✅   | `e2e/settings.spec.ts` › switches the theme and keeps it after a reload                                                                                                                                 |
| 23  | 显示名称保存                                              | ✅   | `e2e/settings.spec.ts` › updates the display name through the mock API                                                                                                                                  |
| 24  | 后端连通性检测                                            | ✅   | `e2e/settings.spec.ts` › checks the backend connection                                                                                                                                                  |
| 25  | 重置演示数据仅拥有者可见                                  | ✅   | `e2e/settings.spec.ts` › offers the demo reset to the owner only                                                                                                                                        |
| 26  | 密码不一致不调用 API                                      | ✅   | `e2e/settings.spec.ts` › rejects a password mismatch without calling the API                                                                                                                            |
| 27  | 桌面布局无横向溢出、侧边栏折叠持久化                      | ✅   | `e2e/layout.spec.ts`（1440 / 1280）                                                                                                                                                                     |
| 28  | 权限表与导航/路由对齐、守卫逻辑                           | ✅   | `src/__tests__/permissions.spec.ts`（9）、`guards.spec.ts`（8）                                                                                                                                         |
| 29  | 列表管理（搜索/筛选/排序/分页/选择/URL/越界）             | ✅   | `src/__tests__/resource-list.spec.ts`（7）                                                                                                                                                              |
| 30  | 成员规则（唯一邮箱、owner 授予/不可删除、重置权限、审计） | ✅   | `src/__tests__/stores.spec.ts`（成员 7 + 审计 2）                                                                                                                                                       |
| 31  | 表格可访问性（`aria-sort`/选择/空/骨架）                  | ✅   | `src/__tests__/data-table.spec.ts`（8）                                                                                                                                                                 |
| 32  | Repository 三适配器契约、拦截器、信封、缓存、工具         | ✅   | `repository.spec.ts`（22）、`api.spec.ts`（4）、`envelope.spec.ts`（8）、`localCache.spec.ts`（10）、`utils.spec.ts`（10）、`loading.spec.ts`（4）、`health.spec.ts`（4）、`design-tokens.spec.ts`（2） |

## 命令证据

```text
$ pnpm verify
docs:check      Documentation check passed: 24 files, 79 relative links.
format:check    All matched files use Prettier code style!
lint            组件检查通过：没有纯转发组件。/ oxlint 0 warnings 0 errors / eslint 通过
type-check      tsc(TS7) + tsc(node) + vue-tsc --build 均通过
test:unit:run   Test Files 13 passed (13) · Tests 105 passed (105)
build           ✓ built（echarts 单独分块 552 kB，PWA 产物生成）

$ pnpm test:e2e
33 passed (48.3s)

$ bash deploy/build.sh --skip-install --build-only
==> Done   artifact: dist/   (exit 0)
```

## 未执行的检查

- [ ] 真实后端联调：模板不提供生产后端，仅本地 mock 与代理模式；接入时按 [data-adapters.md §4](../../docs/data-adapters.md#4-切换到真实后端) 迁移。
- [ ] CI 实跑：工作流与命令在本地等价执行（`verify` + `test:e2e`），未触发 GitHub Actions。
- [ ] 真机/移动端：不在范围内（见 [architecture.md §10](../../docs/architecture.md#10-桌面端与单语言决策)）。

## 剩余风险

- **前端权限不构成安全边界**：`meta.permission` 只影响体验，生产后端必须逐接口鉴权。
- **审计由前端写入**：可被篡改；生产改为服务端事务写入，视图无需改动。
- **客户端分页/过滤**：大数据量需切换为服务端分页（URL 与 `ListParams` 已对齐）。
- **token 在 localStorage**：演示取舍；生产建议 HttpOnly Cookie + CSRF 防护。
- **E2E 依赖本地 mock 服务重启**：`server/admin-api-mock.ts` 的会话在内存中，重启后需重新登录（测试已按登录流程编写，不受影响）。

## 回滚

模板为独立目录 `vue-admin-starter/`，不涉及生产数据迁移；回滚即删除目录或切回 `vue-webapp-starter`。存储键 `aurora.*` 与旧模板 `orbit.*` 不共享，互不影响。
