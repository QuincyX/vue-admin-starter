# 工程文档索引

本目录是**操作细节**的唯一来源；[AGENTS.md](../AGENTS.md) 只保留路由、红线和完成标准。两者冲突时以 `AGENTS.md` 为准，并在本次变更中修正本目录。

## 文档地图

| 文档                                               | 回答的问题                                                 | 何时读                         |
| -------------------------------------------------- | ---------------------------------------------------------- | ------------------------------ |
| [architecture.md](./architecture.md)               | 分几层？权限、路由、状态、数据流如何工作？扩展点在哪？     | 改架构、权限、路由、Store、API |
| [engineering.md](./engineering.md)                 | 环境怎么装？命令有哪些？质量门禁与编码约束是什么？         | 任何实现任务开工前             |
| [data-adapters.md](./data-adapters.md)             | Repository 契约是什么？怎么从本地数据切到真实后端？        | 新增资源、接后端               |
| [components/README.md](./components/README.md)     | 通用表格、弹窗、按钮、Toast 的行为与键盘/ARIA 契约是什么？ | 改共享 UI                      |
| [framework-changelog.md](./framework-changelog.md) | 哪些非业务层变更发生过？为什么？                           | 升级依赖、调整架构前           |
| [../specs/README.md](../specs/README.md)           | 功能如何规格化、计划与验收？                               | 非平凡功能                     |
| [../README.md](../README.md)                       | 模板提供什么能力、怎么跑起来？                             | 首次接触、对外说明             |

## 事实归属

同一事实只允许一个权威来源，其他地方链接过去：

| 事实                                     | 权威来源                                           |
| ---------------------------------------- | -------------------------------------------------- |
| 架构红线、完成定义、Agent 工作流         | [AGENTS.md](../AGENTS.md)                          |
| 环境要求、命令、质量门禁、编码约束       | [engineering.md](./engineering.md)                 |
| 分层、RBAC、路由守卫、状态所有权、数据流 | [architecture.md](./architecture.md)               |
| Repository 接口与换后端步骤              | [data-adapters.md](./data-adapters.md)             |
| 共享组件键盘/ARIA/`data-slot` 契约       | [components/](./components/README.md)              |
| 框架变更历史                             | [framework-changelog.md](./framework-changelog.md) |
| 模板能力与使用方式                       | [../README.md](../README.md)                       |
| 功能验收证据                             | `specs/NNN-*/verification.md`                      |

## 文档治理规则

1. **代码是事实，文档是承诺**。两者不一致时，要么在本次变更中修正文档，要么在变更记录里登记为已知差异。
2. **框架变更必须写 [framework-changelog.md](./framework-changelog.md)**，只追加、不重写历史。
3. 更新矩阵见 [AGENTS.md §3.1](../AGENTS.md#31-强制文档更新矩阵)。
4. 相对链接必须可解析：`pnpm docs:check` 会校验 `README.md`、`AGENTS.md`、`docs/**`、`specs/**`、`.github/**` 中的相对链接与必需文档清单。
5. 截图由 `node scripts/capture-docs.mjs` 生成（`pnpm docs:screens`），不要手工替换成过期图。
6. 新增文档时同步本页的文档地图；删除或重命名文档时同步所有引用。
