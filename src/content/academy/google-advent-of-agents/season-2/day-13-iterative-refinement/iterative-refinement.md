---
title: "Google Advent of Agents S2 Day 13：Iterative Refinement"
date: 2026-05-07
category: academy
description: "把 Skills、MCP、代码执行和审查循环组合成可收敛的改进过程。"
plainSummary: "Season 2 Day 13 的原创工程讲义：从当天主题提炼设计边界、实践任务、生产风险和复核清单。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-13-iterative-refinement/cover.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: zh
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 13：Multi-Agent Patterns: Iterative Refinement"
  moduleOrder: 213
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/13"
  prerequisites:
    - "建议先阅读：Google Advent of Agents：Agent 工程实践总览"
draft: false
---

![Google Advent of Agents S2 Day 13：Iterative Refinement 封面](/images/academy/google-advent-of-agents/season-2/day-13-iterative-refinement/cover.svg)

**说明：** 本文以 Google Advent of Agents Season 2 Day 13 的公开主题为主线，结合 Season 1 的相关主题做补充。它不是官方译文，也不复述原文，而是改写成本站的 Agent 工程学习笔记。

## 这一天要解决什么

把 Skills、MCP、代码执行和审查循环组合成可收敛的改进过程。

今天的目标产物是：一张 refinement loop：计划、执行、验证、修订、停止条件。不要只把它当成教程链接，而要把它变成一个能被复查的设计记录或 lab。

## 系统模式图

![Day 13 系统模式图](/images/academy/google-advent-of-agents/season-2/day-13-iterative-refinement/diagram.svg)

这张图把 Day 13 的主题放进“输入、边界、产物、生产风险”的系统流里。重点不是记住功能名，而是能说清：系统多了哪个边界，哪些状态要被记录，哪里可以被测试或停止。

## 三个关键概念

- 迭代不是无限重试，而是带验证的收敛过程。
- 每一轮都要说明改变了什么和为什么。
- 工具结果应该进入状态，而不是塞满下一轮 prompt。

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

修复一个 failing test 时，Agent 每轮只能做三件事：解释失败证据、做最小修改、重新运行对应测试。通过后才允许整理代码。这样 iterative refinement 才会收敛，而不是到处乱改。

## 实现草图

下面这段不是完整代码，而是发布前应该写进设计文档或 README 的结构化草图。它的作用是让 reviewer 能看见边界、状态和验收点。

```yaml
iteration:
  observe: failing_test_output
  change: minimal_patch
  verify: targeted_test
  stop_when: test_passes
```

## 案例拆解

- **业务触发：** Agent 修 bug 时最容易越改越大，最后很难知道哪一步真正修好了问题。
- **Agent 边界：** 每轮只允许观察证据、做最小修改、运行目标验证；通过前不做整理性重构。
- **验收证据：** commit 或 run log 能展示每一轮失败原因、修改范围和验证结果。

## 最小 Lab

让 Agent 修复一个小脚本：先读失败日志，再改代码，再跑测试，再写复盘。

建议按这个顺序做：

1. 先写边界和失败时的停止条件。
2. 把输入、输出、状态、权限整理成一张表。
3. 实现或写出最小 happy path 的伪代码。
4. 立刻补一个失败路径 eval。
5. 看一次执行日志，确认人类能复盘每一步。

## Season 1 补课

Season 1 Day 7 / Day 8：代码执行和上下文层是迭代改进的基础。

Season 1 是基础线，Season 2 是加厚和生产化线。读这一天时，不需要回头翻译 Season 1，但要知道它在补哪一层前置能力。

## 生产化风险

如果没有测试和停止条件，迭代会退化成随机试错。

| 风险 | 复核问题 |
| --- | --- |
| 边界模糊 | 能不能说清哪个组件负责这个能力。 |
| 权限过大 | 是否只使用当前用户和当前任务需要的 scope。 |
| 无法观测 | 失败时能否从 trace 和 artifact 追到原因。 |
| 缺少 eval | 下次质量下降时能否发现。 |
| 人类不可理解 | 审批或异常处理的原因是否留在 UI 或日志里。 |

## 复核清单

- 我能用一句话说清 Day 13 的主题。
- 我留下了文件、图、schema 或 checklist 形式的产物。
- 我知道对应的 Season 1 补充主题。
- 我给最小 lab 加了失败路径。
- 我能指出至少一个生产化前的权限、观测或 eval 风险。

## 参考资源

- [Advent of Agents Season 2 Day 13](https://adventofagents.com/2026/03/13)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
