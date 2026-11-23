# ThemeToggle

`src/components/ui/ThemeToggle.vue` + `src/composables/useTheme.ts`。

## 行为

- 单击在浅色 / 深色之间切换（`toggle()`）；设置页的三选一（浅色 / 深色 / 跟随系统）用 `useTheme().setMode()`。
- 状态写入 `aurora.theme.v1`（`useLocalStorage`），刷新与重启浏览器后保持。
- 切换时同步 `<html class="dark">` 与 `<meta name="theme-color">`。
- 首屏由 `index.html` 的内联脚本在样式加载前应用主题，避免浅色闪白；脚本与 `useTheme` 必须使用同一个存储键。

## 契约

1. **`aria-label` 描述"将要发生什么"**：当前是浅色时为「切换到深色模式」，深色时为「切换到浅色模式」；`title` 同步。
2. **状态属性**：`data-testid="theme-toggle"`、`data-state="light|dark"`，E2E 直接断言。
3. **图标**：浅色显示 Moon，深色显示 Sun，`aria-hidden`。
4. **Tooltip**：用 shadcn 的 `Tooltip` 包裹，文案与 `aria-label` 一致；不要用浏览器原生 `title` 代替提示。
5. **跟随系统**：`system` 模式下监听 `prefers-color-scheme`（VueUse `usePreferredDark`），用户系统切换时实时响应。
6. **无闪烁**：不要改成 `main.ts` 里异步读取——那会让首帧闪白。改存储键时同步改 `index.html`。

## 颜色来源

明暗两套 Token 定义在 `src/assets/main.css`（`:root` 与 `.dark`）。图表是例外：canvas 不能读 CSS 变量，用 `src/lib/chartTheme.ts` 的十六进制色板，并在明暗切换时重算 option。

## 验证

- `e2e/settings.spec.ts`：切换到深色 → `html.dark` → 刷新后仍为深色 → `aria-pressed` 正确。
- `src/__tests__/design-tokens.spec.ts`：组件源码不允许出现硬编码色值。
