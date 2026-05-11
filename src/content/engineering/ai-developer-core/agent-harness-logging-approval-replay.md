---
title: "AI Developer Core：Agent Harness 的日志、审批与回放"
date: 2026-04-26
category: engineering
description: "将 Agent 运行环境设计为可观察、可审批、可停止、可回放的 Harness。"
difficulty: advanced
plainSummary: "Agent Harness 是模型外层的执行环境。它决定了工具如何暴露、权限如何控制、日志如何记录、失败如何恢复以及结果如何回放和评测。"
coverImage: "/images/engineering/ai-developer-core/agent-harness-cover.svg"
tags:
  - "AI Developer Core"
  - "Observability"
lang: zh
draft: false
---

# Harness 是模型外层的工程化层

Agent 的可靠性不仅源于模型，也取决于其运行环境。这个环境可以被称为 Harness：它负责为模型提供工具、状态、上下文、权限、日志、评测和停止条件。没有 Harness 的 Agent 就像一个极其聪明但缺乏仪表盘的驾驶员；拥有 Harness 的 Agent 才是一个能够被工程团队接管和维护的系统。

Harness 的目标不是为了限制 Agent 的自由，而是让这种自由变得可观察、可控且可恢复。

## 日志应记录决策链路

普通应用的日志通常记录请求和响应，而 Agent 日志则需要记录每一个决策步骤：

- **当前目标**。
- **当前状态摘要**。
- **模型选择的动作 (Action)**。
- **工具输入 (Tool Input)**。
- **工具输出摘要**。
- **验证结果**。
- **人工审批记录**。
- **下一步状态预测**。

记录这些信息并非为了展示“思考过程”，而是为了调试系统行为。通过 Trace，我们可以精准定位 Agent 为什么删除了某个步骤、为什么陷入了重复搜索，或者为什么没有调用预期的测试工具。

## 审批不只是弹窗确认

审批机制应基于风险等级设计。只读搜索可以自动允许；读取敏感文件可能需要确认；而写文件、发送邮件、下单或删除数据等高风险操作则必须经过审批。高风险动作还应清晰显示 Diff、执行目标、原因以及回滚方式。

一个优秀的审批节点应当为人类提供明确的判断依据，而不是让人类猜测 Agent 的意图。审批界面至少要回答：它准备做什么？为什么要这么做？影响范围有多大？如果不执行会怎样？

## 回放使问题可复现

Agent Bug 最棘手的地方在于不可复现性。回放能力允许我们将一次运行的输入、工具结果、模型配置、Prompt 版本和状态转移完整保存下来。这样，我们就可以在不调用真实外部系统的情况下进行重放，从而定位问题发生的具体环节。

回放同样可用于评测。将历史上的成功和失败 Trace 转化为回归测试集 (Regression Set)，在每次修改 Prompt、工具或模型后重新跑一遍，即可快速验证系统是否发生退化。

## 停止条件是核心安全机制

长任务 Agent 必须设置明确的停止条件：最大步数、最大成本上限、连续失败次数、无新信息产生的次数、等待用户输入、风险等级升级或目标已完成。缺乏停止条件的 Agent 不是自动化，而是失控的无限循环。

## 实验目标

本实验的核心不在于构建一个聪明的 Agent，而在于设计 Agent 外侧的运行壳。最终产物应包含：

- 一个 **Trace Schema**。
- 一个 **工具权限表**。
- 一个 **审批矩阵**。
- 一个 **Replay Fixture** (回放固件)。
- 一组 **故障注入 (Failure Injection)** 样例。

如果没有这些基础设施，Agent 的成功与失败都将带有“魔法”色彩。Harness 的价值，就在于将魔法还原为可检查、可预测的工程过程。

## Trace Schema

建议采用 JSONL 格式，每一步记录一行：

```json
{
  "run_id": "run_001",
  "step": 3,
  "goal": "修复文章 Frontmatter",
  "state_summary": "已发现 2 个缺失字段",
  "action": "read_file",
  "tool_input": {"path": "src/content.config.ts"},
  "tool_output_summary": "读取 Schema 成功",
  "approval": "auto_readonly",
  "status": "ok",
  "next": "生成 Patch"
}
```

不要仅记录最终回答。Agent 的质量体现在中间步骤中，尤其是工具的选择、输入参数以及状态的更新，这些决定了系统是否具备可调试性。

## 审批矩阵

审批策略可分为四个等级：

| 等级 | 动作示例 | 策略 |
| --- | --- | --- |
| **L0** | 读取公开索引、列出目录内容 | 自动允许 |
| **L1** | 读取普通文件、执行只读检查 | 自动允许或轻提示 |
| **L2** | 写入文件、生成 Patch、执行高成本命令 | 人工确认 |
| **L3** | 删除操作、提交并推送、发送邮件、调用外部付费 API | 强审批并详细显示影响范围 |

矩阵应与具体工具绑定，而非依赖于模型的口头约束。模型仅发起动作请求，由 Harness 决定是否执行。

## Replay Fixture

回放文件应保存充足的信息，确保在不调用真实工具的情况下也能完全复现一次运行。它至少应包含：用户任务描述、Prompt 版本、模型配置、每一步的工具输出、审批决定及最终结果。这使你能在修改 Prompt 后通过重放旧案例来观察行为变化。

回放文件也是评估 (Eval) 的重要材料。真实的失败案例比手写的测试用例更具参考价值。每次遇到失败，都应将其转化为一个可回放的样本。

## 故障注入

至少应模拟以下五类故障：

1. **工具返回空结果**。
2. **工具调用超时**。
3. **模型请求越权工具**。
4. **连续步骤未产生新信息**。
5. **写入前的 Diff 与目标不符**。

每类故障都应触发明确的状态处理：重试 (Retry)、询问用户 (Ask User)、停止 (Stop)、上报 (Escalate) 或回滚 (Rollback)。严禁让 Agent 在发生故障后继续盲目尝试。

## 检查清单

- [ ] 每一步是否都有唯一的 `run_id` 和递增的 `step`。
- [ ] 工具调用前是否经过了权限校验。
- [ ] 审批界面是否清晰显示了动作、原因及影响范围。
- [ ] 是否能仅凭 Trace 重建系统状态。
- [ ] 是否能在无外部副作用的情况下执行 Replay。
- [ ] 是否设置了最大步数、成本上限及连续失败限制。

## 实验建议

尝试为文件编辑 Agent 设计一套 Harness 的纸面方案，暂不涉及模型实现。定义好工具集、权限规则、日志 Schema、审批策略和回放文件格式。然后通过手动模拟一个真实任务，在 Trace 中记录每一步。这种练习能让你迅速发现哪些状态信息是缺失的。

完成后，将 Trace Schema 和审批矩阵记录在项目文档中。无论后续采用 OpenAI Agents SDK、Claude Code、ADK 还是自研循环，这套 Harness 设计思路都具有通用价值。

## 相关基础阅读

- [Agent 是什么](../../../start/ai-basics-for-everyone/what-is-agent/)：统一 Agent 的基本概念。
- [Agent = 状态、工具与反馈循环](../../../foundations/ai-developer-core/agent-state-tools-feedback-loop/)：将 Harness 的日志、审批和停止条件融入系统架构。
- [MCP 是什么](../../../start/ai-basics-for-everyone/what-is-mcp/)：理解工具协议为何需要权限控制与审计。

## 参考资料

- [Anthropic Engineering](https://www.anthropic.com/engineering)
- [Anthropic Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
- [OpenAI Agent Evals](https://platform.openai.com/docs/guides/agent-evals)
- [Google Agent Development Kit](https://adk.dev/)
- [Berkeley RDI: Advanced LLM Agents](https://rdi.berkeley.edu/adv-llm-agents/sp25)
