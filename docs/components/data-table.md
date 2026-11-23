# DataTable

通用表格三件套：

| 文件                      | 职责                                                |
| ------------------------- | --------------------------------------------------- |
| `DataTable.vue`           | 表头排序、行选择、列渲染、空状态、加载骨架          |
| `DataTableToolbar.vue`    | 搜索框、筛选插槽、重置按钮、结果计数、右侧动作插槽  |
| `DataTablePagination.vue` | 范围摘要、每页条数、上一页/下一页、页码（含省略号） |
| `types.ts`                | `DataTableColumn` 与 `DataTableSort` 类型           |

表格本身**不取数**：行由 `useResourceList()` 过滤、排序、分页后传入；排序、分页、选择通过事件或 `v-model` 交回页面。

## 列定义

```ts
const columns: DataTableColumn[] = [
  { key: 'member', header: '成员', sortable: true },
  { key: 'role', header: '角色', sortable: true },
  { key: 'createdAt', header: '创建时间', sortable: true, align: 'right' },
  { key: 'actions', header: '操作', align: 'right' },
]
```

- `key` 同时是默认取值字段与插槽后缀：`#cell-member="{ row }"`。
- `align` 只影响表头与单元格对齐；不传则左对齐。
- `width` 可传 CSS 宽度（`8rem`、`20%`）。
- 非 `sortable` 列渲染纯文本表头。

## Props / Events

| Prop                              | 类型                                | 默认                         | 说明                               |
| --------------------------------- | ----------------------------------- | ---------------------------- | ---------------------------------- |
| `columns`                         | `DataTableColumn[]`                 | —                            | 列定义                             |
| `rows`                            | `T[]`（`T extends { id: string }`） | —                            | 当前页数据                         |
| `loading`                         | `boolean`                           | `false`                      | 渲染骨架行而不是数据               |
| `skeletonRows`                    | `number`                            | `5`                          | 骨架行数                           |
| `sort`                            | `{ key, dir } \| null`              | `null`                       | 受控排序状态                       |
| `selectable`                      | `boolean`                           | `false`                      | 显示选择列（无写权限时应为 false） |
| `selected`                        | `string[]`                          | `[]`                         | 已选 id，配合 `v-model:selected`   |
| `rowLabel`                        | `(row: T) => string`                | `row.id`                     | 选择框的可访问名称                 |
| `clickableRows`                   | `boolean`                           | `false`                      | 行可点击（打开详情）               |
| `emptyTitle` / `emptyDescription` | `string`                            | `暂无数据` / `调整筛选条件…` | 空状态文案                         |

事件：`sort(key)`、`update:selected(ids)`、`rowClick(row)`。

## 行为契约

1. **排序**：可排序列的表头是 `<button>`，`aria-label="按{header}排序"`；`<th>` 上的 `aria-sort` 只会是 `ascending | descending | none`。点击行为由页面决定（`setSort` 内部负责升/降切换）。
2. **选择**：表头复选框的 `aria-checked` 为 `true | false | mixed`（部分选中为 `mixed`）。点击行内复选框只发出新的 `selected` 数组，不直接修改 props。
3. **空状态**：`rows.length === 0` 且非加载时渲染单行空状态，`colspan` 自动包含选择列。
4. **加载**：`loading` 时只渲染骨架行（每列一个 `.animate-pulse` 占位），不渲染真实行，避免"半截数据"闪烁。
5. **行点击**：只有 `clickableRows` 为真时才触发 `rowClick`；选择列单元格的点击已 `@click.stop`，不会误触发行点击。
6. **测试钩子**：容器 `data-testid="data-table"`，数据行 `data-testid="data-row"` 且带 `data-row-id`；分页容器 `data-testid="table-pagination"`。

## 与 `useResourceList` 的配合

```ts
const { rows, page, pageSize, pageCount, total, sortKey, sortDir, selectedIds, setSort, setPage, setPageSize } =
  useResourceList<Member>({...})
```

```vue
<DataTable
  v-model:selected="selectedIds"
  :columns="columns"
  :rows="rows"
  :sort="{ key: sortKey, dir: sortDir }"
  :selectable="canWrite"
  @sort="setSort"
/>
<DataTablePagination
  :page="page"
  :page-count="pageCount"
  :page-size="pageSize"
  :total="total"
  @update:page="setPage"
  @update:page-size="setPageSize"
/>
```

注意：若某列的表头 key 与数据字段不同（例如成员把姓名放在 `member` 列但按 `name` 排序），页面需要映射一次（成员页的 `onSort` / `sortForTable` 即为此）。

## 键盘与可访问性

- 表头排序按钮可通过 Tab 聚焦、Enter/Space 触发；焦点环由 `focus-visible:ring-[3px]` 提供。
- 选择框是 reka-ui 的 `CheckboxRoot`（`role="checkbox"`），Space 切换。
- 行内操作菜单用 `DropdownMenu`，Esc 关闭并归还焦点。
- 表格不加 `role="grid"`：这是纯展示型数据表，语义 `table/thead/tbody/th[aria-sort]` 已足够，避免与虚拟化/键盘网格语义冲突。

## 验证

- `src/__tests__/data-table.spec.ts`：渲染、`aria-sort`、排序事件、空状态、骨架、单选/全选、`mixed` 状态。
- `e2e/members.spec.ts`：搜索、排序（`aria-sort` + URL）、分页、删除。
- `e2e/audit.spec.ts`：结果筛选、行点击打开详情。
