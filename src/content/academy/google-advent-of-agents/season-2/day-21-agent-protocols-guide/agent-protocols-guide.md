---
title: "Google Advent of Agents S2 Day 21：Agent Protocols 全景"
date: 2026-05-07
category: academy
description: "把 MCP、A2A、A2UI、AG-UI、AP2 等协议放回各自边界，而不是混成缩写表。"
plainSummary: "Season 2 Day 21 的原创工程讲义：从当天主题提炼设计边界、实践任务、生产风险和复核清单。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-21-agent-protocols-guide/cover.svg"
tags:
  - Agent
  - AI Engineering
lang: zh
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 21：Developer's Guide to AI Agent Protocols"
  moduleOrder: 221
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/21"
  prerequisites:
    - "建议先阅读：Google Advent of Agents：Agent 工程实践总览"
draft: false
---

![Google Advent of Agents S2 Day 21：Agent Protocols 全景 封面](/images/academy/google-advent-of-agents/season-2/day-21-agent-protocols-guide/cover.svg)

**说明：** 本文以 Google Advent of Agents Season 2 Day 21 的公开主题为主线，结合 Season 1 的相关主题做补充。它不是官方译文，也不复述原文，而是改写成本站的 Agent 工程学习笔记。

## 这一天要解决什么

把 MCP、A2A、A2UI、AG-UI、AP2 等协议放回各自边界，而不是混成缩写表。

今天的目标产物是：一张 protocol boundary matrix：工具、Agent 协作、UI、支付、治理分别用什么。不要只把它当成教程链接，而要把它变成一个能被复查的设计记录或 lab。

## 系统模式图

![Day 21 系统模式图](/images/academy/google-advent-of-agents/season-2/day-21-agent-protocols-guide/diagram.svg)

这张图把 Day 21 的主题放进“输入、边界、产物、生产风险”的系统流里。重点不是记住功能名，而是能说清：系统多了哪个边界，哪些状态要被记录，哪里可以被测试或停止。

## 三个关键概念

- 协议是边界语言，不是架构银弹。
- MCP 讲工具，A2A 讲 Agent 协作，A2UI 讲交互。
- 支付和高风险动作需要额外 policy 与审批。

## 工程设计方式

| 设计项 | 需要确认 |
| --- | --- |
| 边界 | 这个能力属于 prompt、tool、skill、memory、Agent、UI 还是 policy。 |
| 输入输出 | 下游能依赖的 schema 是什么，人类能审查的 artifact 是什么。 |
| 状态 | 临时状态、长期记忆和审计日志如何分开。 |
| 权限 | 以谁的身份、什么 scope 调用工具。 |
| 评估 | happy path、失败路径和拒绝场景如何测试。 |
| 观测 | 哪些 trace、span、artifact 必须留下。 |

## 发布级案例

一个报销 Agent 可能同时用到 MCP、A2A、A2UI 和 payment policy：MCP 查票据，A2A 委托财务规则 Agent，A2UI 让用户确认报销项，支付相关动作必须过额外 policy gate。

## 实现草图

下面这段不是完整代码，而是发布前应该写进设计文档或 README 的结构化草图。它的作用是让 reviewer 能看见边界、状态和验收点。

```yaml
protocol_map:
  receipt_lookup: MCP
  finance_review: A2A
  user_confirmation: A2UI
  payment_action: policy_gate
```

## 案例拆解

- **业务触发：** 现代 Agent 系统会同时使用 MCP、A2A、A2UI、身份和安全策略，混用时最容易边界不清。
- **Agent 边界：** 先画 protocol map：哪个协议负责工具、哪个负责协作、哪个负责 UI、哪个负责 policy gate。
- **验收证据：** 设计文档能解释每条跨系统调用的协议、身份、状态和失败处理。

## 最小 Lab

拿一个端到端任务，标出每个连接点应该是 tool、A2A、UI payload 还是 policy gate。

建议按这个顺序做：

1. 先写边界和失败时的停止条件。
2. 把输入、输出、状态、权限整理成一张表。
3. 实现或写出最小 happy path 的伪代码。
4. 立刻补一个失败路径 eval。
5. 看一次执行日志，确认人类能复盘每一步。

## Season 1 补课

Season 1 Day 11 / Day 14 / Day 15 / Day 18：MCP、A2A、A2UI、API Registry 的基础版本。

Season 1 是基础线，Season 2 是加厚和生产化线。读这一天时，不需要回头翻译 Season 1，但要知道它在补哪一层前置能力。

## 生产化风险

协议选错会让权限、状态和用户体验一起混乱。

| 风险 | 复核问题 |
| --- | --- |
| 边界模糊 | 能不能说清哪个组件负责这个能力。 |
| 权限过大 | 是否只使用当前用户和当前任务需要的 scope。 |
| 无法观测 | 失败时能否从 trace 和 artifact 追到原因。 |
| 缺少 eval | 下次质量下降时能否发现。 |
| 人类不可理解 | 审批或异常处理的原因是否留在 UI 或日志里。 |

## 复核清单

- 我能用一句话说清 Day 21 的主题。
- 我留下了文件、图、schema 或 checklist 形式的产物。
- 我知道对应的 Season 1 补充主题。
- 我给最小 lab 加了失败路径。
- 我能指出至少一个生产化前的权限、观测或 eval 风险。

## 参考资源

- [Advent of Agents Season 2 Day 21](https://adventofagents.com/2026/03/21)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
