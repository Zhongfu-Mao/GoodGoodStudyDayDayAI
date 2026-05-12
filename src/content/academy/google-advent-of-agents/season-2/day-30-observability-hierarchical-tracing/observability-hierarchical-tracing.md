---
title: "Google Advent of Agents S2 Day 30：Observability 与分层追踪"
date: 2026-05-07
category: academy
description: "用 trace、span、artifact 和 replay 看见 Agent 的中间轨迹。"
plainSummary: "Season 2 Day 30 的原创工程讲义：从当天主题提炼设计边界、实践任务、生产风险和复核清单。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-30-observability-hierarchical-tracing/cover.svg"
tags:
  - Agent
  - AI Engineering
lang: zh
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 30：Observability"
  moduleOrder: 230
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/30"
  prerequisites:
    - "建议先阅读：Google Advent of Agents：Agent 工程实践总览"
draft: false
---

![Google Advent of Agents S2 Day 30：Observability 与分层追踪 封面](/images/academy/google-advent-of-agents/season-2/day-30-observability-hierarchical-tracing/cover.svg)

**说明：** 本文以 Google Advent of Agents Season 2 Day 30 的公开主题为主线，结合 Season 1 的相关主题做补充。它不是官方译文，也不复述原文，而是改写成本站的 Agent 工程学习笔记。

## 这一天要解决什么

用 trace、span、artifact 和 replay 看见 Agent 的中间轨迹。

今天的目标产物是：一张 trace schema：request、planning、tool call、sub-agent、approval、output。不要只把它当成教程链接，而要把它变成一个能被复查的设计记录或 lab。

## 系统模式图

![Day 30 系统模式图](/images/academy/google-advent-of-agents/season-2/day-30-observability-hierarchical-tracing/diagram.svg)

这张图把 Day 30 的主题放进“输入、边界、产物、生产风险”的系统流里。重点不是记住功能名，而是能说清：系统多了哪个边界，哪些状态要被记录，哪里可以被测试或停止。

## 三个关键概念

- 最终答案不是足够的日志。
- trace 要覆盖工具选择、参数、结果和审批。
- Replay 能把事故复盘变成工程动作。

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

当 Agent 给出错误部署建议时，trace 要能回答：它读了哪个 runbook，调用了哪个工具，哪个子 Agent 给了错误信号，用户是否批准过。没有这些 span，事故复盘只能靠猜。

## 实现草图

下面这段不是完整代码，而是发布前应该写进设计文档或 README 的结构化草图。它的作用是让 reviewer 能看见边界、状态和验收点。

```yaml
trace:
  request_span: user_goal
  retrieval_span: runbook_sources
  tool_span: deployment_status
  subagent_span: risk_review
  approval_span: user_decision
```

## 案例拆解

- **业务触发：** 多 Agent 系统出错时，只看最终回答无法定位是检索、工具、子 Agent 还是审批出了问题。
- **Agent 边界：** Trace 按请求、检索、工具、子 Agent、审批和输出分层记录。
- **验收证据：** 事故复盘能从一个 request id 找到完整路径、耗时、错误和用户动作。

## 最小 Lab

为一次多工具 Agent run 画出 span 层级，并标注每个 span 的输入输出。

建议按这个顺序做：

1. 先写边界和失败时的停止条件。
2. 把输入、输出、状态、权限整理成一张表。
3. 实现或写出最小 happy path 的伪代码。
4. 立刻补一个失败路径 eval。
5. 看一次执行日志，确认人类能复盘每一步。

## Season 1 补课

Season 1 Day 5：Production Observability 是直接基础。

Season 1 是基础线，Season 2 是加厚和生产化线。读这一天时，不需要回头翻译 Season 1，但要知道它在补哪一层前置能力。

## 生产化风险

没有 trace 的 Agent 事故只能靠猜。

| 风险 | 复核问题 |
| --- | --- |
| 边界模糊 | 能不能说清哪个组件负责这个能力。 |
| 权限过大 | 是否只使用当前用户和当前任务需要的 scope。 |
| 无法观测 | 失败时能否从 trace 和 artifact 追到原因。 |
| 缺少 eval | 下次质量下降时能否发现。 |
| 人类不可理解 | 审批或异常处理的原因是否留在 UI 或日志里。 |

## Gmail 邮件强调点

这一天的 Gmail newsletter 强调了 OpenTelemetry、Arize Phoenix、分层 tracing 和 span replay。

公开文章不引用 Gmail 正文或内部链接，只使用主题优先级和实务角度。

## 复核清单

- 我能用一句话说清 Day 30 的主题。
- 我留下了文件、图、schema 或 checklist 形式的产物。
- 我知道对应的 Season 1 补充主题。
- 我给最小 lab 加了失败路径。
- 我能指出至少一个生产化前的权限、观测或 eval 风险。

## 参考资源

- [Advent of Agents Season 2 Day 30](https://adventofagents.com/2026/03/30)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
