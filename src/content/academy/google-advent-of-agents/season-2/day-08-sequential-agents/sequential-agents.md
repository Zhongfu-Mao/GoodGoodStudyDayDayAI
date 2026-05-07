---
title: "Google Advent of Agents S2 Day 8：Sequential Agents"
date: 2026-05-07
category: academy
description: "当步骤顺序稳定时，用顺序流水线代替复杂总控 Agent。"
plainSummary: "Season 2 Day 8 的原创工程讲义：从当天主题提炼设计边界、实践任务、生产风险和复核清单。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-08-sequential-agents/cover.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: zh
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 08：Multi-Agent Patterns: Sequential Agents"
  moduleOrder: 208
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/08"
  prerequisites:
    - "建议先阅读：Google Advent of Agents：Agent 工程实践总览"
draft: false
---

![Google Advent of Agents S2 Day 8：Sequential Agents 封面](/images/academy/google-advent-of-agents/season-2/day-08-sequential-agents/cover.svg)

**说明：** 本文以 Google Advent of Agents Season 2 Day 8 的公开主题为主线，结合 Season 1 的相关主题做补充。它不是官方译文，也不复述原文，而是改写成本站的 Agent 工程学习笔记。

## 这一天要解决什么

当步骤顺序稳定时，用顺序流水线代替复杂总控 Agent。

如果把这一天只当成教程链接，很容易读完就过去了。更好的读法是把它变成一个工程问题：**我的 Agent 系统今天要多一个什么可审查能力？**

今天的目标产物是：一个五步 pipeline：parse、retrieve、draft、verify、format。

## 学习流程图

![Day 08 学习流程图](/images/academy/google-advent-of-agents/season-2/day-08-sequential-agents/diagram.svg)

这张图把当天主题拆成五步：先确认系统问题，再画设计边界，接着留下 artifact，然后设计 eval，最后回到生产风险。Agent 工程最怕的是“概念懂了，但系统没有多任何可验证能力”。

## 三个关键概念

- 顺序稳定时，workflow 比 planner 更可靠。
- 每一步都应该能单独记录和重跑。
- Sequential 是多 Agent 学习的最低风险入口。

这三个概念可以作为读文章、写代码和做复盘时的抓手。只要其中一个说不清，系统通常还停留在 demo 阶段。

## 工程设计方式

把 Day 8 放进真实项目时，建议用下面这张小表约束设计：

| 设计项 | 应该写清楚 |
| --- | --- |
| 输入 | 用户、系统或上游 Agent 会提供什么。 |
| 输出 | 下游系统可以依赖什么结构化结果。 |
| 状态 | 哪些信息只属于本次任务，哪些可以长期保留。 |
| 权限 | 哪些工具需要只读、审批或最终用户身份。 |
| 失败 | 调用失败、模型不确定、权限不足时如何停止。 |
| 观测 | 哪些 span、artifact、日志必须留下来。 |

这张表不花哨，但非常实用。它会逼你把“Agent 很聪明”改写成“系统边界可审查”。

## 发布级案例

月报生成适合 Sequential：先收集来源，再去重，再生成草稿，再事实检查，最后格式化发布。每一步都有明确输入输出，不需要 planner 每次重新决定流程。失败时也能只重跑某一步。

## 实现草图

下面这段不是完整代码，而是发布前应该写进设计文档或 README 的结构化草图。它的作用是让 reviewer 能看见边界、状态和验收点。

```yaml
pipeline:
  - collect_sources
  - dedupe_topics
  - draft_report
  - fact_check
  - publish_format
```

## 案例拆解

- **业务触发：** 月报、迁移、发布说明这类任务有固定顺序，频繁重新规划反而增加不确定性。
- **Agent 边界：** 每个步骤有明确输入输出，后一步只依赖前一步的 artifact，不直接依赖聊天上下文。
- **验收证据：** 任一步失败时，可以只重跑该步骤，并保留前后版本差异。

## 最小 Lab

把一个研究任务拆成固定五步，并为每一步写输入输出 schema。

建议按这个顺序做：

1. 先写出任务边界，不碰代码。
2. 再画一个 5 个节点以内的流程图。
3. 写出最小输入和输出 schema。
4. 只实现 happy path，不急着做复杂 UI。
5. 立刻补一个失败路径测试。
6. 记录一次运行日志，检查能不能复盘每一步。

完成后留下一个 `README.md`，说明这个 lab 学到了什么、哪里不稳定、下一步要补什么。

## Season 1 补课

Season 1 Day 13 / Day 23：状态式交互和耐久执行。

Season 1 更像“从零到生产”的基础路线，Season 2 更像“把系统加厚”。读 Day 8 时，不需要回头逐日翻 Season 1，但应该知道它在补哪一层背景。

## 生产化风险

| 风险 | 复核问题 |
| --- | --- |
| 边界模糊 | 这个能力到底是 prompt、tool、skill、memory、Agent，还是 UI？ |
| 权限过大 | 它是否能碰到超出当前任务需要的数据或动作？ |
| 无法回放 | 失败时能不能看到输入、工具调用、输出和中间 artifact？ |
| 缺少 eval | 同一任务下次变差时，CI 或人工复核能不能发现？ |
| 成本膨胀 | 是否把低风险、可验证任务也交给了高成本路径？ |

这些风险不是上线前才补的文档，而应该从第一个 lab 开始就写进设计。

## 和本站其他路线的关系

- OpenAI Academy 更适合对照产品化 Agent、工具调用和 eval 设计。
- Anthropic Academy 更适合对照 MCP、Skills、Subagents 和人机协作模式。
- Google Advent of Agents 的优势在于把 ADK、Agent Engine、A2A、A2UI、评估、身份和观测放进同一条工程主线。

## 复核清单

- 我能用一句话说清 Day 8 解决的工程问题。
- 我留下了一个可检查 artifact，而不是只读完一篇文章。
- 我知道对应的 Season 1 补课主题在哪里。
- 我写出了最小 lab 的输入、输出和失败路径。
- 我能指出这个能力进入生产前至少一个权限、观测或 eval 风险。

## 参考资源

- [Advent of Agents Season 2 Day 8](https://adventofagents.com/2026/03/08)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
