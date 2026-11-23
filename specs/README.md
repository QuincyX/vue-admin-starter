# 功能规格索引

本目录用轻量 Spec Kit（见 [constitution.md](./constitution.md)）记录**非平凡功能**：先写清 What/Why，再给技术方案、任务与验收证据。

## 目录

| 编号                                             | 功能                                           | 状态     |
| ------------------------------------------------ | ---------------------------------------------- | -------- |
| [001-admin-console](./001-admin-console/spec.md) | 管理后台骨架：鉴权、RBAC、总览、日志、通用列表 | Verified |

## 何时需要 spec

满足任一条件就写（其余直接实现并补测试）：

- 涉及两个以上独立用户故事；
- 涉及 API、数据模型、权限或多页面状态；
- 需要跨会话完成；
- 存在会影响验收的产品或交互歧义；
- 失败代价高（权限、数据、计费、发布）。

纯文案、样式、单组件、明确 bugfix 与工具链升级**不**创建 spec。

## 目录约定

```text
specs/
├── README.md
├── constitution.md
├── _templates/            # spec / plan / tasks / verification 模板
└── NNN-slug/
    ├── spec.md            # What / Why，不写技术方案
    ├── plan.md            # 技术方案、文件影响、测试与文档义务
    ├── tasks.md           # 跨会话任务源（含依赖顺序）
    └── verification.md    # 验收证据，状态 Verified/Superseded
```

- 已验收目录**冻结**：需求变化新建编号，并在新 spec 顶部写 `Supersedes: NNN-slug`。
- `tasks.md` 是唯一任务源；对话中的临时清单不算。
- `verification.md` 必须记录可复现的证据（命令输出摘要、测试名称、E2E 场景），没有证据的"已完成"不算完成。
