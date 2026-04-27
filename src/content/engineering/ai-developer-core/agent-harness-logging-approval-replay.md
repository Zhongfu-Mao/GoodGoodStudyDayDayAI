---
title: "AI Developer Core：Agent Harness 的日志、审批与回放"
date: 2026-04-26
category: engineering
description: "把 Agent 运行环境设计成可观察、可审批、可停止、可回放的 harness。"
difficulty: advanced
plainSummary: "Agent Harness 是模型外侧的执行环境。它决定工具如何暴露、权限如何控制、日志如何记录、失败如何恢复、结果如何回放和评测。"
tags:
  - "AI Developer Core"
  - "Observability"
lang: zh
draft: false
---

# Harness 是模型外侧的工程层

Agent 的可靠性不只来自模型，也来自模型被放进什么运行环境。这个环境可以叫 harness：它负责给模型工具、状态、上下文、权限、日志、评测和停止条件。没有 harness 的 Agent 像一个很聪明但没有仪表盘的人；有 harness 的 Agent 才像一个能被工程团队接管的系统。

Harness 的目标不是让 Agent 更自由，而是让它的自由可观察、可限制、可恢复。

## 日志要记录决策链路

普通应用日志记录请求和响应。Agent 日志还要记录每一步：

- 当前目标。
- 当前状态摘要。
- 模型选择的动作。
- 工具输入。
- 工具输出摘要。
- 验证结果。
- 人类审批。
- 下一步状态。

这不是为了展示“思考过程”，而是为了调试系统行为。Agent 为什么删掉某个步骤、为什么重复搜索、为什么没有调用测试，都应该能从 trace 中定位。

## 审批不是弹窗而已

审批要基于风险等级。只读搜索可以自动允许；读取敏感文件可能需要确认；写文件、发邮件、下单、删除数据必须审批；高风险动作还要显示 diff、目标、原因和回滚方式。

好的审批节点应该让人类做判断，而不是让人类猜 Agent 要干什么。审批界面至少要回答：它准备做什么、为什么、影响范围是什么、不做会怎样。

## 回放让问题可复现

Agent bug 最难的是不可复现。回放能力可以把一次运行的输入、工具结果、模型配置、prompt 版本和状态转移保存下来。之后可以在不再次调用真实外部系统的情况下重放，定位哪一步变坏。

回放也能用于评测。把历史成功和失败 trace 变成 regression set，每次改 prompt、工具或模型后重跑，就能知道系统是否退化。

## 停止条件是安全机制

长任务 Agent 必须有停止条件：最大步数、最大成本、连续失败次数、无新信息次数、等待用户、风险升级、目标已完成。没有停止条件的 Agent 不是自动化，而是失控的循环。

## 实验目标

这篇实验不急着做一个聪明 Agent，而是先设计 Agent 外侧的运行壳。最终产物应该包括：

- 一个 trace schema。
- 一个工具权限表。
- 一个审批矩阵。
- 一个 replay fixture。
- 一组失败注入样例。

如果没有这些东西，Agent 成功时像魔法，失败时也像魔法。Harness 的价值，就是把魔法还原成可检查的工程过程。

## Trace Schema

可以先用 JSONL，每一步一行：

```json
{
  "run_id": "run_001",
  "step": 3,
  "goal": "修复文章 frontmatter",
  "state_summary": "已发现 2 个缺失字段",
  "action": "read_file",
  "tool_input": {"path": "src/content.config.ts"},
  "tool_output_summary": "读取 schema 成功",
  "approval": "auto_readonly",
  "status": "ok",
  "next": "生成 patch"
}
```

不要只记录最终回答。Agent 的质量在中间步骤里。尤其是工具选择、工具输入和状态更新，决定了它能不能被调试。

## 审批矩阵

审批可以分四级：

| 等级 | 动作 | 策略 |
| --- | --- | --- |
| L0 | 读取公开索引、列目录 | 自动允许 |
| L1 | 读取普通文件、运行只读检查 | 自动或轻提示 |
| L2 | 写文件、生成 patch、运行成本较高命令 | 人工确认 |
| L3 | 删除、提交、推送、发邮件、调用外部付费 API | 强审批并显示影响 |

矩阵要跟工具绑定，而不是跟模型口头约定。模型只能请求动作，harness 决定是否允许。

## Replay Fixture

Replay 文件要保存足够信息，让你不调用真实工具也能复现一次运行。至少包含：用户任务、prompt 版本、模型配置、每一步工具输出、审批决定和最终结果。这样你可以在修改 prompt 后重放旧案例，看行为是否变化。

Replay 也是 eval 的材料。真实失败比手写 benchmark 更有价值。每次线上或本地遇到失败，都应该能变成一个可回放样例。

## 失败注入

至少模拟五类失败：

1. 工具返回空结果。
2. 工具超时。
3. 模型请求越权工具。
4. 连续两步没有新信息。
5. 写入前 diff 与目标不匹配。

每类失败都应该触发明确状态：retry、ask_user、stop、escalate 或 rollback。不要让 Agent 在失败后继续自由发挥。

## 检查清单

- 每一步是否有 run_id 和 step。
- 工具调用前是否经过权限判断。
- 审批界面是否显示动作、原因和影响范围。
- 是否能从 trace 重建状态。
- 是否能在无外部副作用下 replay。
- 是否有最大步数、最大成本和连续失败限制。

## 可做实验

做一个文件编辑 Agent harness 的纸面设计，不急着实现模型。定义工具、权限、日志 schema、审批策略和 replay 文件格式。再拿一个真实任务跑手工模拟：每一步填一行 trace。这个练习能迅速暴露哪些状态缺失。

完成后，把 trace schema 和审批矩阵放进项目文档。后续无论用 OpenAI Agents SDK、Claude Code、ADK 还是自写 loop，这套 harness 设计都能复用。

## 参考

- [Anthropic Engineering](https://www.anthropic.com/engineering)
- [Anthropic Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
- [OpenAI Agent Evals](https://platform.openai.com/docs/guides/agent-evals)
- [Google Agent Development Kit](https://adk.dev/)
- [Berkeley RDI: Advanced LLM Agents](https://rdi.berkeley.edu/adv-llm-agents/sp25)
