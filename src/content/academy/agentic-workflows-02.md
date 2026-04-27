---
title: "Agentic Workflows 课堂：状态机与任务拆分"
date: 2026-04-09
category: academy
description: "通过简单状态机把复杂任务拆成可执行步骤：plan-act-review 循环、分支处理与人类检查点。"
difficulty: intermediate
plainSummary: "Agentic workflow 不是让模型自由发挥，而是把任务拆成明确的状态、转换规则和停止条件，让每一步都可观测、可回退。"
tags:
  - Agent
  - LLM
lang: zh
draft: false
---

## 为什么需要状态机

当你让 AI Agent 处理一个多步骤任务时，如果没有明确的流程框架，它容易在中途偏离方向、重复操作或忘记已完成的步骤。状态机把任务拆成离散的阶段，每个阶段有明确的输入、输出和转换条件。

最小的状态机只需要三个状态：

```ts
const steps = ['plan', 'act', 'review'];
```

- **Plan**：模型读取任务目标和当前信息，输出执行计划。
- **Act**：模型按计划调用工具或生成内容。
- **Review**：检查输出是否符合目标，决定完成、继续还是回退。

## 从三步到真实系统

真实的 agentic workflow 通常需要更多状态：

| 状态 | 作用 | 触发转换的条件 |
| --- | --- | --- |
| `init` | 解析用户请求，确认任务范围 | 任务范围确认 → `plan` |
| `plan` | 生成执行步骤清单 | 计划就绪 → `act` |
| `act` | 执行当前步骤 | 步骤完成 → `review` |
| `review` | 检查执行结果 | 通过 → 下一步 `act`；失败 → `retry`；全部完成 → `done` |
| `retry` | 调整方案并重试 | 重试成功 → `review`；超限 → `escalate` |
| `escalate` | 转交人类审核 | 人类确认 → `act` 或 `done` |
| `done` | 输出最终结果 | 终态 |

每个转换都应该记录日志。没有日志的状态转换，等于黑箱。

## 任务拆分的原则

把一个大任务拆成子任务时，有几个实用原则：

1. **每个子任务有独立的验证标准。** "写好代码"不够，"代码能通过这三个测试"才有判断力。
2. **子任务之间有明确的依赖关系。** 哪些可以并行？哪些必须串行？
3. **每个子任务的输出是下一个子任务的输入。** 用结构化格式传递，避免自然语言复述带来的信息丢失。
4. **失败的子任务可以独立重试。** 不需要从头开始。

## 人类检查点

不要让 Agent 完全自治。在关键节点设置人类检查点：

- 涉及外部操作（发邮件、提交代码、修改数据）前。
- 任务成本超过预设阈值时。
- Agent 连续重试超过两次时。
- 任务涉及不可逆操作时。

检查点不是"不信任 AI"，而是工程上的合理风控。即使人类开发者也需要 code review。

## 和本站内容怎么接上

如果你还不理解 Agent 的基本组成，先读 [Agent = 状态、工具与反馈循环](../../foundations/ai-developer-core/agent-state-tools-feedback-loop/)。

如果你想把状态机的行为记录下来用于调试和复盘，读 [Agent Harness：日志、审批与回放](../../engineering/ai-developer-core/agent-harness-logging-approval-replay/)。

如果你想在真实 coding 场景中看 Agent 如何工作，读 [Claude Code in Action](../anthropic-academy/04-developer-tools/claude-code-in-action/)。

## 可做实验

1. 用 ChatGPT 或 Claude 模拟一个三步 workflow：给它一个任务，要求它先输出计划、再执行、再自查。
2. 故意在计划里加一个模糊步骤，看 Agent 在 review 阶段是否能识别出来。
3. 在 review 阶段加入"如果结果不满意，请修改计划并重新执行"，观察它的重试行为。
