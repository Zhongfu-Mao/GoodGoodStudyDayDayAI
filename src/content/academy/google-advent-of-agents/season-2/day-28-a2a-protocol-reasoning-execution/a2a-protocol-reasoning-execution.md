---
title: "Google Advent of Agents S2 Day 28：A2A Protocol"
date: 2026-05-07
category: academy
description: "把推理方和执行方解耦，让不同服务型 Agent 通过协议协作。"
plainSummary: "Season 2 Day 28 的原创工程讲义：从当天主题提炼设计边界、实践任务、生产风险和复核清单。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-28-a2a-protocol-reasoning-execution/cover.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: zh
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 28：A2A Protocol"
  moduleOrder: 228
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/28"
  prerequisites:
    - "建议先阅读：Google Advent of Agents：Agent 工程实践总览"
draft: false
---

![Google Advent of Agents S2 Day 28：A2A Protocol 封面](/images/academy/google-advent-of-agents/season-2/day-28-a2a-protocol-reasoning-execution/cover.svg)

**说明：** 本文以 Google Advent of Agents Season 2 Day 28 的公开主题为主线，结合 Season 1 的相关主题做补充。它不是官方译文，也不复述原文，而是改写成本站的 Agent 工程学习笔记。

## 这一天要解决什么

把推理方和执行方解耦，让不同服务型 Agent 通过协议协作。

今天的目标产物是：一个 A2A task contract：能力发现、任务 payload、状态、结果、错误。不要只把它当成教程链接，而要把它变成一个能被复查的设计记录或 lab。

## 系统模式图

![Day 28 系统模式图](/images/academy/google-advent-of-agents/season-2/day-28-a2a-protocol-reasoning-execution/diagram.svg)

这张图把 Day 28 的主题放进“输入、边界、产物、生产风险”的系统流里。重点不是记住功能名，而是能说清：系统多了哪个边界，哪些状态要被记录，哪里可以被测试或停止。

## 三个关键概念

- A2A 适合另一个 Agent 拥有执行责任的场景。
- 普通工具调用不需要包装成 A2A。
- 任务状态和错误语义是协议核心。

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

总部 planner Agent 不应该知道每个地区系统的内部 API。它通过 A2A 把“检查东京区域部署状态”的任务交给 Tokyo deployer Agent，由后者执行并返回状态、证据和错误。

## 实现草图

下面这段不是完整代码，而是发布前应该写进设计文档或 README 的结构化草图。它的作用是让 reviewer 能看见边界、状态和验收点。

```yaml
a2a_task:
  target_agent: tokyo_deployer
  task: check_deployment_status
  required_result: [status, evidence, errors]
  caller: global_planner
```

## 案例拆解

- **业务触发：** 跨团队 Agent 协作时，调用方不应该知道被调用方内部工具和数据库。
- **Agent 边界：** A2A 传递任务、上下文、所需结果和错误语义，执行细节留在目标 Agent 内部。
- **验收证据：** 调用日志能显示任务委派、目标 Agent、返回证据和失败原因。

## 最小 Lab

设计一个 planner Agent 把部署检查任务委托给 deployer Agent 的 payload。

建议按这个顺序做：

1. 先写边界和失败时的停止条件。
2. 把输入、输出、状态、权限整理成一张表。
3. 实现或写出最小 happy path 的伪代码。
4. 立刻补一个失败路径 eval。
5. 看一次执行日志，确认人类能复盘每一步。

## Season 1 补课

Season 1 Day 14 / Day 20 / Day 24：A2A、扩展和 A2A-ify Anything。

Season 1 是基础线，Season 2 是加厚和生产化线。读这一天时，不需要回头翻译 Season 1，但要知道它在补哪一层前置能力。

## 生产化风险

滥用 A2A 会把简单函数调用变成分布式系统问题。

| 风险 | 复核问题 |
| --- | --- |
| 边界模糊 | 能不能说清哪个组件负责这个能力。 |
| 权限过大 | 是否只使用当前用户和当前任务需要的 scope。 |
| 无法观测 | 失败时能否从 trace 和 artifact 追到原因。 |
| 缺少 eval | 下次质量下降时能否发现。 |
| 人类不可理解 | 审批或异常处理的原因是否留在 UI 或日志里。 |

## Gmail 邮件强调点

这一天的 Gmail newsletter 强调了跨 Python 与 Go 服务解耦 reasoning 和 execution。

公开文章不引用 Gmail 正文或内部链接，只使用主题优先级和实务角度。

## 复核清单

- 我能用一句话说清 Day 28 的主题。
- 我留下了文件、图、schema 或 checklist 形式的产物。
- 我知道对应的 Season 1 补充主题。
- 我给最小 lab 加了失败路径。
- 我能指出至少一个生产化前的权限、观测或 eval 风险。

## 参考资源

- [Advent of Agents Season 2 Day 28](https://adventofagents.com/2026/03/28)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
