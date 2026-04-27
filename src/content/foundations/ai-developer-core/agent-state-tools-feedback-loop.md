---
title: "AI Developer Core：Agent = 状态、工具与反馈循环"
date: 2026-04-26
category: foundations
description: "把 Agent 拆成状态、工具、环境反馈、控制循环和停止条件，而不是把它当成神秘自治体。"
difficulty: intermediate
plainSummary: "Agent 不是一个更会聊天的模型，而是模型被放进一个能观察、行动、记录、纠错和停止的运行环境。"
tags:
  - "AI Developer Core"
  - "Agent"
lang: zh
draft: false
---

# Agent 不该先被神秘化

Agent 这个词容易被说得很玄。工程上更朴素：Agent 是一个能在环境中循环行动的系统。模型负责判断下一步，工具负责改变世界或获取信息，状态负责记录进度，反馈负责告诉系统刚才做得怎么样，停止条件负责防止无限循环。

如果把 Agent 看成“模型 + prompt”，很快会撞到可靠性问题。如果把它看成“模型 + 状态机 + 工具接口 + 评测 + 权限”，它就回到了软件工程可以处理的范围。

## 五个组成部分

第一是**目标**。Agent 需要知道完成标准，而不只是知道任务描述。目标越模糊，越需要人类检查点。

第二是**状态**。状态包括用户需求、已完成步骤、工具结果、待办、假设、错误和下一步计划。不要把状态全塞在聊天历史里，长任务要有结构化状态。

第三是**工具**。工具不是函数列表这么简单。每个工具都应该有清晰名称、输入 schema、输出 schema、失败行为、权限等级和示例。工具接口越模糊，Agent 越容易误用。

第四是**反馈**。反馈来自工具结果、测试、编译、检索命中、用户确认、日志和评测。没有反馈，Agent 只是在连续猜测。

第五是**停止条件**。完成、失败、等待用户、超预算、超轮次、风险升级，都应该是显式状态。可靠 Agent 一定知道什么时候停。

## Workflows 与 Agents 的区别

Workflow 是预先写好的路径，模型在其中完成某些节点。Agent 是路径不完全预定，由模型根据反馈决定下一步。前者稳定、便宜、容易测试；后者灵活、昂贵、更需要 guardrail。

很多产品其实不需要全自治 Agent。先用 workflow，把可预测流程做好；只有当任务步骤无法预先穷举时，再引入更开放的 Agent loop。

## 工程含义

Agent 的核心能力不是“多想几步”，而是“每一步都能接触真实环境”。代码 Agent 要能读文件、改文件、跑测试；研究 Agent 要能搜索、引用、交叉验证；数据 Agent 要能查询、画图、检查异常。

因此，Agent 设计的重点不只是 prompt，而是环境接口。你给它什么工具、什么权限、什么反馈，它就会成为什么样的系统。

## 可做实验

写一个三步 Agent：读取任务、调用一个只读工具、输出结构化状态。然后加上第二版：失败时重试，超两次转人工确认。比较两版的日志，看状态、反馈和停止条件如何改变系统可调试性。

## 工程判断：Agent 需要产品边界

Agent 的能力越开放，越需要清楚的产品边界。先问它能观察什么、能改变什么、哪些动作需要批准、哪些错误必须停止、哪些日志需要保留。只有这些边界清楚，用户才知道 Agent 什么时候是在帮忙，什么时候需要人接手。

不要把所有复杂任务都交给一个大 Agent。更常见的可维护形态是：稳定 workflow 处理主路径，小 Agent 处理局部不确定步骤，人类在高风险节点确认。这样系统更容易测试，也更容易解释失败原因。

## 动手试试：写一份 Agent Runbook

给一个小 Agent 写 runbook：

- 目标：任务完成的可观察标准是什么。
- 输入：用户必须提供哪些信息。
- 工具：每个工具的权限等级和失败行为。
- 状态：每轮要记录哪些字段。
- 停止：完成、失败、等待用户和风险升级的条件。
- 回放：出现问题时如何从日志复盘。

如果 runbook 写不清，通常说明 Agent 的边界也还没设计清楚。

## 延伸阅读

- [Agent 是什么](../../../academy/ai-basics-for-everyone/what-is-agent/)：先建立共享词汇。
- [Building Agents](../../../academy/openai-academy/07-building-with-ai/agents/)：从产品构建角度看 Agent。
- [Agent Harness：日志、审批与回放](../../../engineering/ai-developer-core/agent-harness-logging-approval-replay/)：把状态、权限和回放做成工程骨架。

## 参考

- [Anthropic: Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Lilian Weng: LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/)
- [Berkeley RDI: LLM Agents](https://rdi.berkeley.edu/llm-agents/f24)
- [DeepLearning.AI: Agentic AI](https://www.deeplearning.ai/courses/agentic-ai/)
- [Google Agent Development Kit](https://adk.dev/)
