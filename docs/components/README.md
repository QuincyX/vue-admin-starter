# 共享组件契约

`src/components/` 分三层：

| 层            | 内容                                                         | 约束                                     |
| ------------- | ------------------------------------------------------------ | ---------------------------------------- |
| `ui/`         | shadcn-vue 基础组件（vendored）+ 全局 loading / toast / 主题 | 无业务逻辑、无 HTTP；只接受 props 与插槽 |
| `common/`     | `PageHeader`、`StatCard`、`ConfirmDialog`                    | 跨页面复用，不绑定具体资源字段           |
| `data-table/` | `DataTable`、`DataTableToolbar`、`DataTablePagination`       | 泛型表格，只渲染，不取数                 |
| `layout/`     | `AppSidebar`、`SidebarNav`、`AppHeader`、`UserMenu`          | 只依赖权限表与路由，不直接请求           |
| `<domain>/`   | `members/`、`audit/`、`dashboard/`、`settings/`、`charts/`   | 只被对应页面或其它 domain 组件引用       |

## 通用约定

- **属性透传**：基础组件的 `class` 通过 `cn()` 合并，调用方 class 优先（tailwind-merge 语义）。
- **portal 面板**：Dialog / AlertDialog 的面板在 portal 内，必须 `inheritAttrs: false` 并显式合并 `$attrs`，否则 `data-testid`、`id` 会丢在 portal 外层（同一元素不要写两个 `v-bind`，Vue 插件会报重复属性）。
- **可访问名称**：所有输入都必须有可关联的 `<Label for>` 或 `aria-label`；只有图标按钮必须有 `aria-label`。
- **焦点**：弹窗与下拉由 reka-ui 负责焦点陷阱与 Esc 关闭；不要自己再包一层 `keydown` 处理 Esc。
- **动效**：`prefers-reduced-motion: reduce` 下动画时长被压到 0.01ms（`main.css`），组件不需要单独判断。
- **颜色**：只用设计 Token 类（`bg-card`、`text-muted-foreground`…）。画布色值走 `src/lib/chartTheme.ts`（理由见 [engineering.md §6.2](../engineering.md#62-ui-与样式)）。

## 组件文档

| 组件              | 文档                                 | 关键契约                                              |
| ----------------- | ------------------------------------ | ----------------------------------------------------- |
| `ui/button`       | [button.md](./button.md)             | `variant`/`size`、`buttonVariants()` 复用于链接与动作 |
| `data-table`      | [data-table.md](./data-table.md)     | 列定义、`aria-sort`、选择、空状态、加载骨架           |
| `ui/dialog`       | [dialog.md](./dialog.md)             | portal 面板属性透传、关闭按钮标签、Esc/焦点           |
| toast             | [toast.md](./toast.md)               | `role="status"`、自动消失、关闭按钮                   |
| `ui/theme-toggle` | [theme-toggle.md](./theme-toggle.md) | `aria-label` 随明暗切换、`localStorage` 持久化        |

## 测试映射

| 契约                         | 测试                                                           |
| ---------------------------- | -------------------------------------------------------------- |
| 表格排序/选择/空/骨架        | `src/__tests__/data-table.spec.ts`                             |
| 权限可见性与导航对齐         | `src/__tests__/permissions.spec.ts`                            |
| 设计 Token（无硬编码色值）   | `src/__tests__/design-tokens.spec.ts`                          |
| 弹窗、下拉、标签的端到端路径 | `e2e/auth.spec.ts`、`e2e/members.spec.ts`、`e2e/audit.spec.ts` |
