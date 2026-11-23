# Dialog 与 AlertDialog

`src/components/ui/dialog/` 与 `src/components/ui/alert-dialog/` 是 shadcn-vue 的 vendored 实现，底层是 reka-ui 的 `DialogRoot` / `AlertDialogRoot`。

## 何时用哪个

| 场景                                 | 组件                                          |
| ------------------------------------ | --------------------------------------------- |
| 需要输入的表单（成员编辑、详情查看） | `Dialog`                                      |
| 只读确认（删除、重置、中断性操作）   | `AlertDialog`（经 `ConfirmDialog`）           |
| 就地登录（会话过期）                 | `Dialog`（`components/auth/LoginDialog.vue`） |

`ConfirmDialog`（`src/components/common/ConfirmDialog.vue`）封装了 `AlertDialog`：`v-model:open`、`title`、`description`、`confirmLabel`、`destructive`，并 `emit('confirm')`。页面的破坏性操作一律用它，不要自己拼 AlertDialog。

## 结构

```vue
<Dialog v-model:open="open">
  <DialogContent class="sm:max-w-lg" data-testid="member-form">
    <DialogHeader>
      <DialogTitle>编辑成员</DialogTitle>
      <DialogDescription>修改资料、角色或状态。</DialogDescription>
    </DialogHeader>
    <!-- 表单 -->
    <DialogFooter>
      <Button variant="outline" @click="open = false">取消</Button>
      <Button type="submit">保存</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

- `DialogContent` 自带遮罩、居中、关闭按钮（`aria-label` 为「关闭」）。
- 关闭按钮的可访问名称直接写在 `DialogContent` 内，不需要调用方重复提供。
- 长表单给 `DialogContent` 传 `class="max-h-[90dvh] overflow-y-auto"`。

## 契约

1. **portal 属性透传**：面板在 `DialogPortal` 内，属性透传不会自动落到面板上。`DialogContent` / `AlertDialogContent` 使用 `inheritAttrs: false`，在脚本里合并 `$attrs` 后再绑到面板上，因此调用方可以写 `data-testid`、`id`、`aria-*`。
   - 不要在同一元素上写两个 `v-bind`：`vite-plugin-vue-inspector` 会报 `Duplicate attribute` 并让整页编译失败。
2. **必须有标题与描述**：`DialogTitle` 与 `DialogDescription` 是给辅助技术的上下文；只写标题会让 reka 在控制台告警。
3. **焦点**：打开时焦点进入面板，Esc 关闭并把焦点归还触发元素（reka 负责）；不要额外绑定全局 Esc。打开期间页面滚动被锁定。
4. **关闭后清理**：`@update:open` 为 `false` 时清空临时表单状态；`ConfirmDialog` 额外发出 `cancel`。
5. **异步确认**：`AlertDialogAction` 默认会关闭弹窗。需要"失败后保持打开"时，先关闭、用 toast 报错，或在页面侧自行控制 `open`。

## 已知取舍

- 成员表单弹窗是"提交即关闭"，失败时错误内联显示在弹窗内（`MemberRuleError`），不会重新打开。
- 审计详情是只读弹窗，行点击或 `?detail=<id>` 都可打开；关闭时会移除 `detail` 查询参数。
- `ConfirmDialog` 没有内建 loading 态：破坏性操作通常很快（本地演示），生产接后端时建议在页面侧禁用确认按钮。

## 验证

- `e2e/members.spec.ts`：打开表单、提交、删除确认。
- `e2e/audit.spec.ts`：详情弹窗与深链。
- `e2e/settings.spec.ts`：重置数据确认。
- `e2e/auth.spec.ts`：就地登录弹窗（会话续签路径）。
