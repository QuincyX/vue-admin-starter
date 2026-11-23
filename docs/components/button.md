# Button

`src/components/ui/button/`：`Button.vue` + `index.ts`（含 `buttonVariants`）。基于 reka-ui 的 `Primitive`，默认渲染 `<button>`；`as-child` 时把样式交给子元素（例如 `<RouterLink>`）。

## 样式变体

| `variant`     | 语义                         | 用在哪                     |
| ------------- | ---------------------------- | -------------------------- |
| `default`     | 主操作（`bg-primary`）       | 提交、创建、确认           |
| `destructive` | 危险操作（`bg-destructive`） | 批量移除、确认删除         |
| `outline`     | 次要操作（带边框）           | 导出、取消、切换           |
| `secondary`   | 低强调                       | 工具栏中的中性动作         |
| `ghost`       | 无背景，hover 才出现         | 图标按钮、行内操作、菜单项 |
| `link`        | 文字链接                     | 内联跳转                   |

| `size`    | 尺寸                    |
| --------- | ----------------------- |
| `default` | `h-9 px-4`              |
| `sm`      | `h-8 px-3`              |
| `lg`      | `h-10 px-6`             |
| `icon`    | `size-9`（仅图标）      |
| `icon-sm` | `size-8`（表格/卡片里） |

## 契约

1. **图标按钮必须有 `aria-label`**；纯文字按钮用可见文本即可，不需要额外标签。
2. 按钮内图标自动 `size-4`（通过 `[&_svg:not([class*='size-'])]:size-4`），不要手写尺寸。
3. 禁用用 `disabled`；不要用 `pointer-events-none` 假装禁用（会丢失可访问语义）。
4. 需要"看起来像按钮的链接"时用 `as-child`，不要给 `<a>` 手写样式：

```vue
<Button variant="ghost" size="sm" as-child>
  <RouterLink to="/audit">查看全部</RouterLink>
</Button>
```

5. 变体组合只在 `ui/button/index.ts` 增加；页面不要用 `!important` 或任意值覆盖颜色。

## 复用点

- `buttonVariants()` 也被 `alert-dialog/AlertDialogAction|Cancel` 使用，保证确认弹窗与普通按钮一致。
- 行内操作菜单（`dropdown-menu` 的 item）是菜单项而不是按钮，但仍受权限控制。

## 验证

- `e2e/members.spec.ts` 通过 `getByTestId('member-create')` 点击主按钮并断言结果。
- 视觉回归不单独做快照；按钮样式由 Design Token 测试间接保护（禁止硬编码颜色）。
