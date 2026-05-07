---
title: "Google Advent of Agents S2 Day 20：ADK Agent Harness"
date: 2026-05-07
category: academy
description: "用 harness 把生成、验证、修订和记录变成可重复的开发循环。"
plainSummary: "Season 2 Day 20 的原创工程讲义：从当天主题提炼设计边界、实践任务、生产风险和复核清单。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-20-adk-agent-harness/cover.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: zh
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 20：ADK Agent Harness"
  moduleOrder: 220
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/20"
  prerequisites:
    - "建议先阅读：Google Advent of Agents：Agent 工程实践总览"
draft: false
---

![Google Advent of Agents S2 Day 20：ADK Agent Harness 封面](/images/academy/google-advent-of-agents/season-2/day-20-adk-agent-harness/cover.svg)

**说明：** 本文以 Google Advent of Agents Season 2 Day 20 的公开主题为主线，结合 Season 1 的相关主题做补充。它不是官方译文，也不复述原文，而是改写成本站的 Agent 工程学习笔记。

## 这一天要解决什么

用 harness 把生成、验证、修订和记录变成可重复的开发循环。

今天的目标产物是：一个 harness runbook：输入集、执行命令、验证器、输出 artifact、失败处理。不要只把它当成教程链接，而要把它变成一个能被复查的设计记录或 lab。

## 系统模式图

![Day 20 系统模式图](/images/academy/google-advent-of-agents/season-2/day-20-adk-agent-harness/diagram.svg)

这张图把 Day 20 的主题放进“输入、边界、产物、生产风险”的系统流里。重点不是记住功能名，而是能说清：系统多了哪个边界，哪些状态要被记录，哪里可以被测试或停止。

## 三个关键概念

- Harness 是把手工试用变成可重复执行。
- 验证器应该检查结构、轨迹和风险，不只看文本。
- 失败摘要比单次成功 demo 更有价值。

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

发布前不要只手动问 Agent 三个问题。Harness 应该固定 20 个代表任务，每次改 prompt、tool 或模型后都跑一遍，输出通过率、失败分类和需要人工看的样本。

## 实现草图

下面这段不是完整代码，而是发布前应该写进设计文档或 README 的结构化草图。它的作用是让 reviewer 能看见边界、状态和验收点。

```yaml
harness_run:
  tasks: 20
  checks: [schema, trajectory, safety, citation]
  report: pass_rate_and_failures.md
```

## 案例拆解

- **业务触发：** 手动试几个问题无法代表生产流量，prompt 改动也很难发现回归。
- **Agent 边界：** Harness 固定代表任务、失败任务和安全任务，作为每次改动后的最小回归套件。
- **验收证据：** 报告能按失败类型聚合，并给出需要人工复核的具体样本。

## 最小 Lab

为一个 Agent 写 5 个固定任务，跑完后生成结果表和失败摘要。

建议按这个顺序做：

1. 先写边界和失败时的停止条件。
2. 把输入、输出、状态、权限整理成一张表。
3. 实现或写出最小 happy path 的伪代码。
4. 立刻补一个失败路径 eval。
5. 看一次执行日志，确认人类能复盘每一步。

## Season 1 补课

Season 1 Day 5 / Day 22：观测和安全为 harness 的验证器提供来源。

Season 1 是基础线，Season 2 是加厚和生产化线。读这一天时，不需要回头翻译 Season 1，但要知道它在补哪一层前置能力。

## 生产化风险

没有 harness 的 Agent 质量只能靠印象判断。

| 风险 | 复核问题 |
| --- | --- |
| 边界模糊 | 能不能说清哪个组件负责这个能力。 |
| 权限过大 | 是否只使用当前用户和当前任务需要的 scope。 |
| 无法观测 | 失败时能否从 trace 和 artifact 追到原因。 |
| 缺少 eval | 下次质量下降时能否发现。 |
| 人类不可理解 | 审批或异常处理的原因是否留在 UI 或日志里。 |

## 复核清单

- 我能用一句话说清 Day 20 的主题。
- 我留下了文件、图、schema 或 checklist 形式的产物。
- 我知道对应的 Season 1 补充主题。
- 我给最小 lab 加了失败路径。
- 我能指出至少一个生产化前的权限、观测或 eval 风险。

## 参考资源

- [Advent of Agents Season 2 Day 20](https://adventofagents.com/2026/03/20)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
