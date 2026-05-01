---
title: "AI Developer Core：Agent = 状态、工具与反馈循环"
date: 2026-04-26
category: foundations
description: "应将 Agent 拆解为状态、工具、环境反馈、控制循环及停止条件，而非视其为某种神秘的“自治实体”。"
difficulty: intermediate
plainSummary: "Agent 并非只是一个更擅长对话的模型，而是被置于一个具备观察、行动、记录、纠错及停止能力的运行环境中的系统。"
tags:
  - "AI Developer Core"
  - "Agent"
lang: zh
draft: false
---

# 告别 Agent 神秘化

“Agent”一词常被赋予过多的神秘色彩。但在工程实践中，其定义更为朴素：Agent 是一个能在特定环境中循环行动的系统。其中，模型负责判断决策，工具负责执行行动或获取信息，状态负责记录进度，反馈负责评价行动效果，而停止条件则负责防止系统陷入无限循环。

如果仅将 Agent 视为“模型 + Prompt”，开发过程很快就会遭遇可靠性瓶颈。但若将其视为“模型 + 状态机 + 工具接口 + 评测 + 权限控制”的组合，它便回归到了软件工程可以有效处理的范畴。

## 核心组成部分

1.  **目标 (Goal)**：Agent 需要清晰的“完成标准”，而不仅是任务描述。目标越模糊，对人类介入检查（Human-in-the-loop）的需求就越高。
2.  **状态 (State)**：状态应涵盖用户需求、已完成步骤、工具返回结果、待办事项、假设、错误信息及后续计划。切忌将所有状态信息塞入聊天历史，对于长时任务，结构化状态至关重要。
3.  **工具 (Tool)**：工具不只是简单的函数列表。每个工具都应具备清晰的命名、输入输出 Schema、失败处理机制、权限等级及调用示例。工具接口越模糊，Agent 误用的风险就越大。
4.  **反馈 (Feedback)**：反馈来自工具执行结果、测试/编译反馈、检索命中情况、用户确认、系统日志及评测指标。缺乏有效反馈，Agent 的每一步行动都只是盲目猜测。
5.  **停止条件 (Stop Condition)**：任务完成、执行失败、等待用户、预算耗尽、轮次超限或风险升级，都应作为显式的停止状态。一个可靠的 Agent 必须明确知道何时应当终止运行。

## 工作流 (Workflows) 与智能体 (Agents) 的区别

**工作流**是预先定义的路径，模型在其中负责处理特定节点。**智能体**的路径则非完全预定，由模型根据环境反馈动态决定下一步。前者稳定、高效且易于测试；后者灵活，但成本较高且亟需安全护栏（Guardrails）。

大多数产品场景并不需要完全自治的 Agent。建议优先构建可预测的工作流；仅当任务步骤无法预先穷举时，再引入更开放的 Agent 循环。

## 工程视角的本质

Agent 的核心竞争力并非“逻辑推导能力”，而是“与真实环境的交互能力”。代码 Agent 需要具备读写文件并运行测试的能力；研究 Agent 需要具备搜索、引用并交叉验证的能力；数据 Agent 则需要具备查询、可视化并检测异常的能力。

因此，Agent 设计的重心不应仅仅是 Prompt 工程，更应是环境接口的设计：你赋予它什么样的工具、权限与反馈，就决定了它能成为什么样的系统。

## 实验建议

尝试构建一个简单的三步 Agent：读取任务、调用一个只读工具、输出结构化状态。随后开发第二个版本：加入失败重试机制，并在重试两次失败后转人工确认。对比两版的日志，观察状态、反馈与停止条件如何提升系统的可调试性。

## 工程判断：为 Agent 划定产品边界

Agent 的能力越开放，就越需要清晰的产品边界。开发者应明确：它能观察什么、能改变什么、哪些操作需要审批、哪些错误必须触发停止、哪些日志需要持久化。只有边界清晰，用户才能预判 Agent 何时在提供帮助，何时需要人工接管。

避免将所有复杂逻辑塞进一个“全能 Agent”。更具可维护性的架构是：用稳定的工作流处理主路径，用小型 Agent 处理局部的确定性步骤，并在高风险节点引入人类确认。

## 动手实践：编写一份 Agent 运行手册 (Runbook)

为一个小型的 Agent 编写运行手册：

- **目标**：任务完成的可观测标准是什么？
- **输入**：用户必须提供哪些前置信息？
- **工具**：列出每个工具的权限等级与故障处理方式。
- **状态**：每一轮循环需要记录哪些核心字段？
- **停止**：明确完成、失败、等待用户与风险升级的触发条件。
- **回放**：当出现非预期行为时，如何利用日志进行复盘？

如果这份手册无法清晰表述，通常意味着该 Agent 的边界设计尚不成熟。

## 延伸阅读

- [Agent 是什么](../../../academy/ai-basics-for-everyone/what-is-agent/)：建立基础共识。
- [Building Agents](../../../academy/openai-academy/07-building-with-ai/agents/)：从产品构建视角审视 Agent。
- [Agent Harness：日志、审批与回放](../../../engineering/ai-developer-core/agent-harness-logging-approval-replay/)：将状态、权限与回放转化为工程骨架。

## 参考

- [Anthropic: Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Lilian Weng: LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/)
- [Berkeley RDI: LLM Agents](https://rdi.berkeley.edu/llm-agents/f24)
- [DeepLearning.AI: Agentic AI](https://www.deeplearning.ai/courses/agentic-ai/)
- [Google Agent Development Kit](https://adk.dev/)
