---
title: "Google Advent of Agents S2 Day 12：Generator-Critic 循环"
date: 2026-05-07
category: academy
description: "用明确 rubric 驱动生成、批评、修订，而不是让模型泛泛地“再优化”。"
plainSummary: "Season 2 Day 12 的原创工程讲义：从当天主题提炼设计边界、实践任务、生产风险和复核清单。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-12-generator-critic-loop/cover.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: zh
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 12：Multi-Agent Patterns: Generator-Critic Agent Loop"
  moduleOrder: 212
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/12"
  prerequisites:
    - "建议先阅读：Google Advent of Agents：Agent 工程实践总览"
draft: false
---

![Google Advent of Agents S2 Day 12：Generator-Critic 循环 封面](/images/academy/google-advent-of-agents/season-2/day-12-generator-critic-loop/cover.svg)

**说明：** 本文以 Google Advent of Agents Season 2 Day 12 的公开主题为主线，结合 Season 1 的相关主题做补充。它不是官方译文，也不复述原文，而是改写成本站的 Agent 工程学习笔记。

## 这一天要解决什么

用明确 rubric 驱动生成、批评、修订，而不是让模型泛泛地“再优化”。

今天的目标产物是：一份 critic rubric：事实性、可执行性、安全性、引用、格式五类评分。不要只把它当成教程链接，而要把它变成一个能被复查的设计记录或 lab。

## 系统模式图

![Day 12 系统模式图](/images/academy/google-advent-of-agents/season-2/day-12-generator-critic-loop/diagram.svg)

这张图把 Day 12 的主题放进“输入、边界、产物、生产风险”的系统流里。重点不是记住功能名，而是能说清：系统多了哪个边界，哪些状态要被记录，哪里可以被测试或停止。

## 三个关键概念

- critic 必须有 rubric，否则只是另一个聊天者。
- 循环要有停止条件：分数、预算、轮数或人工审查。
- critic 输出应该是具体问题，不是泛泛建议。

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

写部署计划时，writer 负责产出方案，critic 只按 rubric 找问题：缺少回滚、权限过大、健康检查太浅、成本估算缺证据。critic 不负责重写全文，它负责给出可执行缺陷。

## 实现草图

下面这段不是完整代码，而是发布前应该写进设计文档或 README 的结构化草图。它的作用是让 reviewer 能看见边界、状态和验收点。

```yaml
rubric:
  rollback: required
  least_privilege: required
  health_check: task_level
  cost_evidence: required
```

## 案例拆解

- **业务触发：** 写方案、写代码、写文章都需要审稿，但 critic 如果没有 rubric 会变成主观吐槽。
- **Agent 边界：** Generator 负责产出，critic 只按约定维度找可修复问题，最终修改仍回到 owner。
- **验收证据：** 每条 critique 都能映射到 rubric 项，并能判断已修复、拒绝或待人工裁定。

## 最小 Lab

让 writer 写一份部署计划，让 critic 只输出可执行问题，再让 writer 修订一次。

建议按这个顺序做：

1. 先写边界和失败时的停止条件。
2. 把输入、输出、状态、权限整理成一张表。
3. 实现或写出最小 happy path 的伪代码。
4. 立刻补一个失败路径 eval。
5. 看一次执行日志，确认人类能复盘每一步。

## Season 1 补课

Season 1 Day 5 / Day 22：观测和安全护栏为 critic 提供可检查信号。

Season 1 是基础线，Season 2 是加厚和生产化线。读这一天时，不需要回头翻译 Season 1，但要知道它在补哪一层前置能力。

## 生产化风险

没有停止条件的 critic loop 会制造成本和幻觉，而不是质量。

| 风险 | 复核问题 |
| --- | --- |
| 边界模糊 | 能不能说清哪个组件负责这个能力。 |
| 权限过大 | 是否只使用当前用户和当前任务需要的 scope。 |
| 无法观测 | 失败时能否从 trace 和 artifact 追到原因。 |
| 缺少 eval | 下次质量下降时能否发现。 |
| 人类不可理解 | 审批或异常处理的原因是否留在 UI 或日志里。 |

## 复核清单

- 我能用一句话说清 Day 12 的主题。
- 我留下了文件、图、schema 或 checklist 形式的产物。
- 我知道对应的 Season 1 补充主题。
- 我给最小 lab 加了失败路径。
- 我能指出至少一个生产化前的权限、观测或 eval 风险。

## 参考资源

- [Advent of Agents Season 2 Day 12](https://adventofagents.com/2026/03/12)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
