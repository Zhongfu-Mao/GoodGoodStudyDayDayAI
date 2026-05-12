---
title: "Google Advent of Agents S2 Day 11：Hierarchical Decomposition"
date: 2026-05-07
category: academy
description: "把大型任务拆成可分派、可验收、可汇总的任务树。"
plainSummary: "Season 2 Day 11 的原创工程讲义：从当天主题提炼设计边界、实践任务、生产风险和复核清单。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-11-hierarchical-decomposition/cover.svg"
tags:
  - Agent
  - AI Engineering
lang: zh
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 11：Multi-Agent Patterns: Hierarchical Decomposition"
  moduleOrder: 211
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/11"
  prerequisites:
    - "建议先阅读：Google Advent of Agents：Agent 工程实践总览"
draft: false
---

![Google Advent of Agents S2 Day 11：Hierarchical Decomposition 封面](/images/academy/google-advent-of-agents/season-2/day-11-hierarchical-decomposition/cover.svg)

**说明：** 本文以 Google Advent of Agents Season 2 Day 11 的公开主题为主线，结合 Season 1 的相关主题做补充。它不是官方译文，也不复述原文，而是改写成本站的 Agent 工程学习笔记。

## 这一天要解决什么

把大型任务拆成可分派、可验收、可汇总的任务树。

今天的目标产物是：一张任务树：顶层目标、子任务、依赖、完成定义和审查点。不要只把它当成教程链接，而要把它变成一个能被复查的设计记录或 lab。

## 系统模式图

![Day 11 系统模式图](/images/academy/google-advent-of-agents/season-2/day-11-hierarchical-decomposition/diagram.svg)

这张图把 Day 11 的主题放进“输入、边界、产物、生产风险”的系统流里。重点不是记住功能名，而是能说清：系统多了哪个边界，哪些状态要被记录，哪里可以被测试或停止。

## 三个关键概念

- 层级分解的核心是任务边界，不是让 manager Agent 随意开会。
- 每个子任务都要有输入、输出和完成定义。
- 汇总层必须检查依赖、冲突和遗漏。

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

把旧客服系统迁到新平台时，manager Agent 不该自己写所有计划，而是拆成数据迁移、权限模型、集成测试、用户培训、回滚方案五条子线。每条子线都有 owner、交付物和验收标准。

## 实现草图

下面这段不是完整代码，而是发布前应该写进设计文档或 README 的结构化草图。它的作用是让 reviewer 能看见边界、状态和验收点。

```yaml
migration_tree:
  data: {owner: data_agent, done: sample_verified}
  auth: {owner: security_agent, done: least_privilege_reviewed}
  rollout: {owner: platform_agent, done: rollback_tested}
```

## 案例拆解

- **业务触发：** 大型迁移或新产品上线不是一个 Agent 能一次性规划完的单点任务。
- **Agent 边界：** 父 Agent 负责拆树、设定验收、控制依赖；子 Agent 只在自己的范围内产出 artifact。
- **验收证据：** 任务树能显示 owner、依赖、阻塞点和每个叶子任务的完成证据。

## 最小 Lab

选一个迁移或调研任务，拆成三层以内的任务树，并为每个叶子节点写完成条件。

建议按这个顺序做：

1. 先写边界和失败时的停止条件。
2. 把输入、输出、状态、权限整理成一张表。
3. 实现或写出最小 happy path 的伪代码。
4. 立刻补一个失败路径 eval。
5. 看一次执行日志，确认人类能复盘每一步。

## Season 1 补课

Season 1 Day 14 / Day 23：A2A 协作和耐久执行为层级任务提供运行基础。

Season 1 是基础线，Season 2 是加厚和生产化线。读这一天时，不需要回头翻译 Season 1，但要知道它在补哪一层前置能力。

## 生产化风险

任务树过深会让状态、预算和责任归属失控。

| 风险 | 复核问题 |
| --- | --- |
| 边界模糊 | 能不能说清哪个组件负责这个能力。 |
| 权限过大 | 是否只使用当前用户和当前任务需要的 scope。 |
| 无法观测 | 失败时能否从 trace 和 artifact 追到原因。 |
| 缺少 eval | 下次质量下降时能否发现。 |
| 人类不可理解 | 审批或异常处理的原因是否留在 UI 或日志里。 |

## 复核清单

- 我能用一句话说清 Day 11 的主题。
- 我留下了文件、图、schema 或 checklist 形式的产物。
- 我知道对应的 Season 1 补充主题。
- 我给最小 lab 加了失败路径。
- 我能指出至少一个生产化前的权限、观测或 eval 风险。

## 参考资源

- [Advent of Agents Season 2 Day 11](https://adventofagents.com/2026/03/11)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
