---
title: "AI Academy 路线：工程朋友如何系统使用 AI"
date: 2026-04-27
category: academy
description: "面向工程朋友的 AI 学习路线：从 Codex / Claude Code 到 MCP、Agents、RAG、Evals、Production 与 Context Engineering。"
coverImage: "/images/academy/learning-routes/engineering-route.svg"
difficulty: intermediate
plainSummary: "这条路线适合工程朋友，把 AI coding、MCP、Agent、RAG、Evals、生产优化和 Context Engineering 串成一条可落地路径。"
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

## 这条路线适合谁

如果你已经有工程背景，这条路线不建议停在“怎么让 AI 写代码”。更有价值的目标是：把 AI 当成新的开发协作者和系统组件来理解。

读完这条路线，最好能回答四个问题：

1. AI coding 工具如何进入真实 repo？
2. 工具、权限、日志、审批和回放怎么设计？
3. RAG、Agent、Eval 分别解决什么工程问题？
4. 什么时候该做产品功能，什么时候只是 prompt demo？

## 第一段：AI Coding 进入真实项目

先从 Codex 开始：

- [Codex Quickstart](../../openai-academy/05-codex/quickstart/)：理解基本工作方式。
- [Codex App](../../openai-academy/05-codex/codex-app/)：理解本地工作区、任务执行和验证。
- [Better Prompts](../../openai-academy/05-codex/better-prompts/)：把 prompt 写成可执行的工程任务。

然后读 [Claude Code in Action](../../anthropic-academy/04-developer-tools/claude-code-in-action/)，对比另一类 coding agent 的协作方式。

这一段的关键不是“AI 能不能写代码”，而是它是否能读上下文、控制改动范围、跑验证、留下可 review 的 diff。

## 第二段：工具协议和可控边界

接下来进入 MCP：

- [MCP 是什么](../../ai-basics-for-everyone/what-is-mcp/)：先用非协议实现者视角理解 MCP 解决什么问题。
- [Introduction to Model Context Protocol](../../anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/)：理解模型如何通过标准协议接入工具和资料。
- [MCP Advanced Topics](../../anthropic-academy/05-agentic-mcp/model-context-protocol-advanced-topics/)：看更复杂的权限、能力描述和集成方式。
- [Minimal MCP Server](../../../engineering/ai-developer-core/minimal-mcp-server/)：从最小系统理解实现边界。

MCP 的重点不是“多接几个工具”，而是让工具调用变得可描述、可授权、可审计。

## 第三段：Agent、RAG、Evals 是一组系统问题

这一段建议按顺序读：

| 主题 | 推荐内容 | 工程问题 |
| --- | --- | --- |
| Agent | [Building Agents](../../openai-academy/07-building-with-ai/agents/) + [Agent State / Tools / Feedback Loop](../../../foundations/ai-developer-core/agent-state-tools-feedback-loop/) | 多步任务如何推进、暂停、验证 |
| RAG | [RAG](../../openai-academy/07-building-with-ai/rag/) + [RAG Minimum System](../../../engineering/ai-developer-core/rag-minimum-system/) | 如何让模型基于外部资料回答 |
| Evals | [Evals](../../openai-academy/07-building-with-ai/evals/) + [Evals / Benchmarks / Product Quality](../../../foundations/ai-developer-core/evals-benchmarks-product-quality/) | 如何判断系统真的变好 |

不要把它们拆成三个 buzzword。真实产品里，RAG 需要 eval，Agent 需要工具边界，工具边界需要日志和审批。

## 第四段：从 demo 走向 production

最后读：

- [Production Optimization](../../openai-academy/07-building-with-ai/production-optimization/)：理解延迟、成本、可靠性和监控。
- [Context Engineering 是什么](../../ai-basics-for-everyone/what-is-context-engineering/)：先把上下文当作产品资源来理解。
- [Context Engineering Playbook](../../../engineering/ai-developer-core/context-engineering-playbook/)：把上下文从 prompt 技巧提升到工程设计。
- [Agent Harness：日志、审批与回放](../../../engineering/ai-developer-core/agent-harness-logging-approval-replay/)：让 agent 的行为可追踪、可复盘。

这部分决定了一个 AI 功能是 demo，还是可以长期维护的系统。

## 这条路线的交付物

读完建议留下：

- 一个 AI coding 工作流模板：需求、探索、改动、验证、review。
- 一个最小 MCP 或 tool-use demo：明确权限和日志。
- 一个 RAG 或 agent 的 eval 清单：至少覆盖正确性、引用、失败模式和人工确认点。

工程路线的核心不是追新词，而是把 AI 能力放进可维护、可验证、可回滚的系统里。
