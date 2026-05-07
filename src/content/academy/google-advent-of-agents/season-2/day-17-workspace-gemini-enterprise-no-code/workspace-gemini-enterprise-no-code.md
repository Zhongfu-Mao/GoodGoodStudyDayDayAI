---
title: "Google Advent of Agents S2 Day 17：Workspace 与无代码 Agent"
date: 2026-05-07
category: academy
description: "理解无代码 Agent 的价值边界：快、贴近业务，但仍需要治理。"
plainSummary: "Season 2 Day 17 的原创工程讲义：从当天主题提炼设计边界、实践任务、生产风险和复核清单。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-17-workspace-gemini-enterprise-no-code/cover.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: zh
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 17：Workspace & Gemini Enterprise: no-code agents"
  moduleOrder: 217
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/17"
  prerequisites:
    - "建议先阅读：Google Advent of Agents：Agent 工程实践总览"
draft: false
---

![Google Advent of Agents S2 Day 17：Workspace 与无代码 Agent 封面](/images/academy/google-advent-of-agents/season-2/day-17-workspace-gemini-enterprise-no-code/cover.svg)

**说明：** 本文以 Google Advent of Agents Season 2 Day 17 的公开主题为主线，结合 Season 1 的相关主题做补充。它不是官方译文，也不复述原文，而是改写成本站的 Agent 工程学习笔记。

## 这一天要解决什么

理解无代码 Agent 的价值边界：快、贴近业务，但仍需要治理。

今天的目标产物是：一份 no-code readiness checklist：数据源、权限、用户、审批、退出机制。不要只把它当成教程链接，而要把它变成一个能被复查的设计记录或 lab。

## 系统模式图

![Day 17 系统模式图](/images/academy/google-advent-of-agents/season-2/day-17-workspace-gemini-enterprise-no-code/diagram.svg)

这张图把 Day 17 的主题放进“输入、边界、产物、生产风险”的系统流里。重点不是记住功能名，而是能说清：系统多了哪个边界，哪些状态要被记录，哪里可以被测试或停止。

## 三个关键概念

- 无代码降低创建门槛，不降低责任门槛。
- 业务 owner 必须能解释数据来源和权限。
- 升级到工程 Agent 的条件要提前写清。

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

HR 想做一个员工手册问答 Agent，无代码入口很合适，但发布前必须明确：数据源只包含已批准手册，不回答个人绩效，不处理劳动争议，敏感问题升级给 HRBP。

## 实现草图

下面这段不是完整代码，而是发布前应该写进设计文档或 README 的结构化草图。它的作用是让 reviewer 能看见边界、状态和验收点。

```yaml
no_code_agent:
  data_sources: approved_handbook_only
  forbidden: [personal_performance, legal_dispute]
  escalation: HRBP
```

## 案例拆解

- **业务触发：** 业务部门想快速做内部 Agent，但没有代码并不等于没有工程治理。
- **Agent 边界：** 数据源、禁答范围、升级路径、owner 和发布说明都要在无代码配置里显式化。
- **验收证据：** 试运行样本能覆盖普通问题、敏感问题、资料缺失和升级路径。

## 最小 Lab

为一个部门 FAQ Agent 设计数据范围、用户范围、回答边界和升级路径。

建议按这个顺序做：

1. 先写边界和失败时的停止条件。
2. 把输入、输出、状态、权限整理成一张表。
3. 实现或写出最小 happy path 的伪代码。
4. 立刻补一个失败路径 eval。
5. 看一次执行日志，确认人类能复盘每一步。

## Season 1 补课

Season 1 Day 19 / Day 25：Gemini Enterprise 注册和 Agent Designer 提供企业入口背景。

Season 1 是基础线，Season 2 是加厚和生产化线。读这一天时，不需要回头翻译 Season 1，但要知道它在补哪一层前置能力。

## 生产化风险

无代码 Agent 如果缺少 owner 和退出机制，会成为隐形生产系统。

| 风险 | 复核问题 |
| --- | --- |
| 边界模糊 | 能不能说清哪个组件负责这个能力。 |
| 权限过大 | 是否只使用当前用户和当前任务需要的 scope。 |
| 无法观测 | 失败时能否从 trace 和 artifact 追到原因。 |
| 缺少 eval | 下次质量下降时能否发现。 |
| 人类不可理解 | 审批或异常处理的原因是否留在 UI 或日志里。 |

## 复核清单

- 我能用一句话说清 Day 17 的主题。
- 我留下了文件、图、schema 或 checklist 形式的产物。
- 我知道对应的 Season 1 补充主题。
- 我给最小 lab 加了失败路径。
- 我能指出至少一个生产化前的权限、观测或 eval 风险。

## 参考资源

- [Advent of Agents Season 2 Day 17](https://adventofagents.com/2026/03/17)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
