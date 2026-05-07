---
title: "入口路线：工程师如何进入 Agent 工程主线"
date: 2026-04-27
updatedDate: 2026-05-07
category: academy
description: "面向工程师：先用 OpenAI Academy 建立构建 AI 产品的基础，再用 Anthropic Academy 补 MCP、Skills、Subagents，最后以 Google Advent Season 2 进入完整 Agent 工程主线。"
coverImage: "/images/academy/learning-routes/engineering-route.svg"
difficulty: intermediate
plainSummary: "本路线是工程师进入 AI Academy 的入口卡：把 Codex、Claude Code、MCP、Agents、RAG、Evals、部署、身份和观测串成一条可落地的工程路径。"
tags:
  - "AI Engineering"
lang: zh
academy:
  series: "AI Academy Learning Routes"
  module: "角色路线"
  moduleOrder: 2
  source: "本站 AI Academy / Engineering 路线整理"
  prerequisites:
    - "建议先读：AI Basics for Everyone"
draft: false
---

## 目标受众

如果您已具备工程背景，建议不要仅停留于“如何让 AI 编写代码”的层面。更高阶的目标是：将 AI 视为一种新型的**开发协作者**以及**系统核心组件**。

完成本路线的学习后，您应能清晰回答以下四个核心问题：

1. AI Coding 工具如何深度集成到真实的工程仓库（Repo）中？
2. 如何设计与之配套的工具集、权限控制、日志审计、审批流及回放机制？
3. RAG、Agent、Evals 分别旨在解决哪些具体的工程难题？
4. 明确产品功能（Product Feature）与单纯的提示词演示（Prompt Demo）之间的界限。

## 三大分区读法

工程师路线建议把三个课程分区当作递进关系，而不是平铺目录：

| 分区 | 在本路线中的用途 |
| --- | --- |
| **OpenAI Academy** | 建立 AI 产品基础：Codex、Agents、RAG、Evals、生产优化。 |
| **Anthropic Academy** | 补协作与协议：Claude Code、MCP、Skills、Subagents，以及可复用的 Agent 工作方式。 |
| **Google Advent of Agents** | 主线深读：按 Season 2 的 31 天，从 ADK、工具边界、多 Agent、评估、安全、部署、身份、观测一路读到 A2A / A2UI。 |

## 第一阶段：AI Coding 深入真实项目

首先从 Codex 入门，理解其底层逻辑：

- [Codex Quickstart](../../openai-academy/05-codex/quickstart/)：掌握基本的工作模式。
- [Codex App](../../openai-academy/05-codex/codex-app/)：理解本地工作区管理、任务执行与验证闭环。
- [Better Prompts](../../openai-academy/05-codex/better-prompts/)：学习如何将 Prompt 转化为可执行的工程任务。

随后阅读 [Claude Code in Action](../../anthropic-academy/04-developer-tools/claude-code-in-action/)，对比不同类型的 Coding Agent 在协作模式上的差异。

**核心关注点**：重点不在于“AI 能否写代码”，而在于其是否具备**感知上下文**、**控制改动范围**、**自动化验证**以及**生成高质量 Diff** 的能力。

## 第二阶段：工具协议与可控边界

接下来进入 Model Context Protocol (MCP) 领域：

- [MCP 是什么](/start/ai-basics-for-everyone/what-is-mcp/)：从非实现者的视角理解 MCP 解决的核心痛点。
- [Introduction to Model Context Protocol](../../anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/)：理解模型如何通过标准协议接入工具与数据源。
- [MCP Advanced Topics](../../anthropic-academy/05-agentic-mcp/model-context-protocol-advanced-topics/)：探讨复杂的权限管理、能力描述及集成策略。
- [Minimal MCP Server](../../../engineering/ai-developer-core/minimal-mcp-server/)：通过最小化实现厘清系统的技术边界。

**核心关注点**：MCP 的价值不在于“接入工具的数量”，而在于让工具调用变得**可描述、可授权、可审计**。

## 第三阶段：Agent、RAG 与 Evals 的系统化整合

建议按序阅读以下主题，构建完整的系统观：

| 主题 | 推荐内容 | 核心工程问题 |
| --- | --- | --- |
| **Agent** | [Building Agents](../../openai-academy/07-building-with-ai/agents/) + [Agent State / Tools / Feedback Loop](../../../foundations/ai-developer-core/agent-state-tools-feedback-loop/) | 多步复杂任务的推进、状态暂停与验证机制 |
| **RAG** | [RAG](../../openai-academy/07-building-with-ai/rag/) + [RAG Minimum System](../../../engineering/ai-developer-core/rag-minimum-system/) | 如何构建基于外部动态资料的可靠知识增强系统 |
| **Evals** | [Evals](../../openai-academy/07-building-with-ai/evals/) + [Evals / Benchmarks / Product Quality](../../../foundations/ai-developer-core/evals-benchmarks-product-quality/) | 建立科学的评估体系，量化系统优化的实际效果 |

**核心提示**：避免将这些概念孤立看待。在真实的 AI 产品中，RAG 需要评估系统（Eval）来保障质量，Agent 需要明确的工具边界，而工具边界则依赖完善的日志与审批流。

## 第四阶段：从 Demo 迈向生产环境（Production）

最后是关于工程化落地的核心课题：

- [Production Optimization](../../openai-academy/07-building-with-ai/production-optimization/)：深入理解延迟、成本、可靠性及全链路监控。
- [Context Engineering 是什么](/start/ai-basics-for-everyone/what-is-context-engineering/)：将上下文（Context）作为一种核心的产品资源进行管理。
- [Context Engineering Playbook](../../../engineering/ai-developer-core/context-engineering-playbook/)：将上下文处理从“提示词技巧”升华为“系统工程设计”。
- [Agent Harness：日志、审批与回放](../../../engineering/ai-developer-core/agent-harness-logging-approval-replay/)：确保 Agent 行为的可追踪性与可复盘性。

这部分内容决定了一个 AI 功能仅仅是昙花一现的 Demo，还是一个**可长期维护的工业级系统**。

## 学习产出建议

完成本路线学习后，建议您沉淀以下资产：

- **一套 AI Coding 工作流模板**：涵盖需求分析、方案探索、代码实施、自动化验证及 Code Review。
- **一个最小化的 MCP 或工具调用 Demo**：明确定义权限边界与日志格式。
- **一套 RAG 或 Agent 评估清单**：至少覆盖回答准确性、引用来源、失败模式及人工介入点。

工程师路线的核心价值在于：**不盲目追求新术语，而是将 AI 能力稳健地集成到可维护、可验证、可回滚的工程体系中。**
