# Toast

`src/components/ui/ToastContainer.vue` + `src/composables/useToast.ts`。这是模板里唯一没有对应 shadcn-vue 原语的交互组件（演示不引入 sonner 以保持依赖克制）。

## 用法

```ts
const { toast } = useToast()

toast({ title: '成员已创建', description: '陆星河 · 观察员', variant: 'success' })
toast('已复制') // 最简写法，variant 为 info
toast({ title: '保存失败', variant: 'error' }) // error 默认 6 秒，其余 4 秒
```

- `variant`：`success` | `error` | `info`，决定图标与颜色。
- `duration`：毫秒；传 `0` 表示不自动消失。
- 返回 `id`，配合 `dismiss(id)` 手动关闭。

## 契约

1. **渲染位置**：`ToastContainer` 只在 `App.vue` 挂载一次；页面不要重复引入。
2. **可访问性**：容器 `aria-live="polite"`、`aria-atomic="false"`；每个 toast 是 `<li>`，不抢焦点。
3. **关闭按钮**：`aria-label="关闭通知"`，可键盘操作。
4. **数量**：不做自动排队/去重；同一操作不要同时弹多个 toast。连续批量操作（例如批量删除）只弹一条汇总。
5. **测试钩子**：`data-testid="toast"`、`data-variant="success|error|info"`；`e2e` 用 `getByTestId('toast').first()` 断言最新一条。
6. **文案**：中文，直接写在调用点；不要输出 token、Cookie 或完整请求体。

## 状态归属

`useToast` 是模块级单例（`ref` + 自增 id），不放进 Pinia：toast 只是瞬时反馈，不需要 devtools/持久化，也不需要跨 Store 注入。

## 常见模式

| 场景          | 文案示例                               |
| ------------- | -------------------------------------- |
| 创建/更新成功 | `成员已创建` + `name · 角色`           |
| 删除成功      | `成员已移除` + 名称                    |
| 规则失败      | `操作失败` + `MemberRuleError.message` |
| 传输失败      | `操作失败` + `apiErrorMessage(error)`  |
| 阻塞操作完成  | `密码已更新` + `请使用新密码重新登录`  |
