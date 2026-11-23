# 数据适配器

Store 不直接访问 `localStorage`、`fetch` 或 Axios，只依赖 [`src/api/repository.ts`](../src/api/repository.ts) 的 `Repository<T, TInput>`。**换后端 = 换适配器的一行初始化**，Store、视图和测试不动。

## 1. 接口

```ts
interface Repository<T, TInput> {
  list(params?: ListParams, signal?: AbortSignal): Promise<{ rows: T[]; total: number }>
  get(id: string): Promise<T | null>
  create(input: TInput): Promise<T>
  update(id: string, input: TInput): Promise<T>
  remove(id: string): Promise<void>
}
```

`ListParams` 包含 `page/pageSize/search/sortBy/sortDir/filters`。接口刻意保持最小；只有本地适配器额外提供：

```ts
type LocalRepository<T, TInput> = Repository<T, TInput> & {
  read(): T[] // 同步读，用于首屏立即渲染
  replaceAll(rows: T[]): Promise<void> // 演示数据重置
}
```

这样设计的原因：REST 后端无法"整体替换集合"，也无法同步读；把这两件事留在本地适配器上，切换到 REST 时**编译期**就会报出所有依赖它们的调用点，而不是等到线上出错。

## 2. 三个适配器

| 适配器             | 用途                        | 持久化         | 分页/排序/筛选           |
| ------------------ | --------------------------- | -------------- | ------------------------ |
| `localRepository`  | 本地演示（成员、审计）      | `localStorage` | 忽略参数，全量返回       |
| `restRepository`   | 真实后端                    | 服务端         | 转发为 query，响应过 Zod |
| `memoryRepository` | 组件/Store 测试、无后端演示 | 内存           | 忽略参数，全量返回       |

三者共用同一套契约测试（`src/__tests__/repository.spec.ts`）：

- `list` 返回匹配 `total` 的行；
- `create` 不丢已有行；
- `get` 对不存在的 id 返回 `null`；
- `update` 就地修改并移动 `updatedAt`，未知 id 抛错；
- `remove` 只删目标行；
- `restRepository` 额外验证：Schema 漂移抛 `ZodError`、404 映射为 `null`、分页参数被转发、id 被 URL 编码。

`localRepository` 在读取时用 Schema 校验存量数据；结构不匹配（版本升级、手工篡改）会自动回退到 `seed()`，而不是白屏。

## 3. 当前绑定

| 切片     | 文件                 | 适配器            | 存储键              | 种子数据                  |
| -------- | -------------------- | ----------------- | ------------------- | ------------------------- |
| 成员     | `src/api/members.ts` | `localRepository` | `aurora.members.v1` | `createSeedMembers()`     |
| 操作日志 | `src/api/audit.ts`   | `localRepository` | `aurora.audit.v1`   | `createSeedAuditEvents()` |

审计的写入入口是 `recordAuditEvent(input)`：它补齐 `at`、`ip`、`metadata` 后调用 `auditRepository.create()`，并**吞掉写入失败**——审计是演示增强，不能反过来让成员编辑失败。

## 4. 切换到真实后端

以成员为例，只改 `src/api/members.ts` 的初始化：

```ts
export const memberRepository = restRepository<Member, MemberDraft>({
  basePath: '/members',
  listSchema: memberListSchema,
  itemSchema: memberSchema,
})
```

随之而来的三处调整（`pnpm type-check` 会指出）：

1. **`read()` 不再存在**：`stores/members.ts` 不能同步拿到初始行，`status` 在 `hydrate()` 之前是 `idle/loading`，表格显示骨架而不是空表。当前 Store 已经按这个前提写（只通过 `hydrate()` 取数）。
2. **`replaceAll()` 不再存在**：`resetToSeed()` 与设置页的「恢复示例数据」必须移除，或改为后端提供的管理端点。
3. **分页/排序/筛选语义变化**：`useResourceList` 目前是**客户端**过滤与分页（适合演示与中小数据量）。接后端时应把它替换为服务端查询：
   - `repository.list(params)` 传入 `page/pageSize/search/sortBy/sortDir/filters`；
   - Store 保存 `rows` 与 `total`，由后端返回总数；
   - 页面仍用 `useListQuery` 维护 URL，只需把 `useResourceList` 换成"读取 URL → 调用 store.fetch(params)"的薄封装。

`ListParams` 的字段与常见后端约定一致（`page/pageSize/search/sortBy/sortDir` + 业务筛选键），因此这一步不需要改 URL 契约。

如果后端用 `{ code, data, message }` 信封包裹，用 [`src/api/envelope.ts`](../src/api/envelope.ts) 的 `unwrapEnvelope()` / `envelopeRequest()` 在 API 模块内统一解包，失败归一化为 `ApiError`（`code: 'business'` 保留后端 message）。

## 5. 审计的生产形态

演示实现是前端写入，仅用于展示链路。生产建议：

```text
POST /members        → 服务端事务：校验权限 + 写成员 + 写审计
PATCH /members/:id   → 同上，审计中记录 from → to 的差异
GET  /audit          → 服务端分页查询（支持 action/outcome/from/to/q 参数）
```

前端只需把 `recordAuditEvent()` 从 Store 里删掉，审计页改为 `restRepository` 绑定；`AUDIT_ACTIONS`、`AuditEvent`、筛选与详情组件全部复用。
