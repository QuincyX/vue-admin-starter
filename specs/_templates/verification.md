# Verification: [FEATURE NAME]

- ID: `[NNN]`
- Status: `Verified`
- Verified at: `[YYYY-MM-DD]`
- Evidence owner: `[name/agent]`

## 验收场景对照

| #   | 验收场景（来自 spec.md） | 结果 | 证据                         |
| --- | ------------------------ | ---- | ---------------------------- |
| 1   | [Given/When/Then]        | ✅   | `[测试名 / 命令 / 截图路径]` |
| 2   | [Given/When/Then]        | ✅   | `[测试名 / 命令]`            |

## 命令证据

```bash
pnpm verify        # docs:check → format:check → lint → type-check → test:unit:run → build
pnpm test:e2e      # Playwright
```

粘贴关键输出摘要（通过数量、耗时、构建产物），不要粘贴完整日志。

## 未执行的检查

- [ ] [检查项]：原因，风险，补做条件。

## 剩余风险

- [风险 1]：[影响与缓解方式]。
- [演示数据/前端审计/前端权限等已知边界]：说明生产替换方式。

## 回滚

[回滚步骤与影响范围。]
