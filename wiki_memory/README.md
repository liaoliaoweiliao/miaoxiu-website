---
type: moc
status: active
updated: 2026-10-21
topic: memory-entry
sources: []
---

# 工程记忆导航

模式：`standard`，由用户于 2026-10-20 明确指定；配置见 `.memory.json`。五页状态保存不同的当前事实，六类日志仅保存实际发生的工作。

开始会话先读本导航和维护协议，再读项目概览、当前约束、当前待办；架构或回归任务补读系统架构和已知问题。按主题定位有效知识/决策，需要背景时才读日志。

在工程根运行 `python wiki_memory/工具/memory.py index --project . --apply` 刷新索引，`python wiki_memory/工具/memory.py check --project . --require-ready` 验收结构与接入。工程运行及协作见根 README/AGENTS，事实与验证见下方状态页。

- [记忆维护协议](AGENTS.md)
- [工作日志 MOC](日志/MOC_工作日志.md)

<!-- wiki-memory:auto:start -->

## 当前状态

- [[当前状态/已知问题.md|已知问题]] — active
- [[当前状态/当前待办.md|当前待办]] — active
- [[当前状态/当前约束.md|当前约束]] — active
- [[当前状态/系统架构.md|系统架构]] — active
- [[当前状态/项目概览.md|项目概览]] — active

<!-- wiki-memory:auto:end -->
