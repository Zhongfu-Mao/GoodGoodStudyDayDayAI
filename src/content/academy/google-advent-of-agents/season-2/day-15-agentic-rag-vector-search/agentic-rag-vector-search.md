---
title: "Google Advent of Agents S2 Day 15：Agentic RAG 与 Grounding"
date: 2026-05-07
category: academy
description: "把检索从“附加资料”升级成 Agent 可计划、可验证、可引用的能力。"
plainSummary: "Season 2 Day 15 的原创工程讲义：从当天主题提炼设计边界、实践任务、生产风险和复核清单。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-15-agentic-rag-vector-search/cover.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: zh
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 15：Grounding with ADK: Agentic RAG with Vector Search 2.0"
  moduleOrder: 215
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/15"
  prerequisites:
    - "建议先阅读：Google Advent of Agents：Agent 工程实践总览"
draft: false
---

![Google Advent of Agents S2 Day 15：Agentic RAG 与 Grounding 封面](/images/academy/google-advent-of-agents/season-2/day-15-agentic-rag-vector-search/cover.svg)

**说明：** 本文以 Google Advent of Agents Season 2 Day 15 的公开主题为主线，结合 Season 1 的相关主题做补充。它不是官方译文，也不复述原文，而是改写成本站的 Agent 工程学习笔记。

## 这一天要解决什么

把检索从“附加资料”升级成 Agent 可计划、可验证、可引用的能力。

今天的目标产物是：一张 RAG contract：检索意图、过滤条件、引用格式、无结果处理。不要只把它当成教程链接，而要把它变成一个能被复查的设计记录或 lab。

## 系统模式图

![Day 15 系统模式图](/images/academy/google-advent-of-agents/season-2/day-15-agentic-rag-vector-search/diagram.svg)

这张图把 Day 15 的主题放进“输入、边界、产物、生产风险”的系统流里。重点不是记住功能名，而是能说清：系统多了哪个边界，哪些状态要被记录，哪里可以被测试或停止。

## 三个关键概念

- Agentic RAG 关注何时检索、检索什么、如何使用证据。
- 无结果也是一种结果，不能自动编造。
- 引用和反证比相似度分数更接近产品质量。

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

政策问答 Agent 不应该只做相似度检索。它要先判断用户问题属于定义、流程还是例外，再检索正向证据和反证；如果找不到依据，就明确说“资料不足”，而不是生成看似可靠的答案。

## 实现草图

下面这段不是完整代码，而是发布前应该写进设计文档或 README 的结构化草图。它的作用是让 reviewer 能看见边界、状态和验收点。

```yaml
retrieval_plan:
  intent: exception_policy
  positive_evidence: required
  counter_evidence: required
  no_evidence_behavior: refuse_to_infer
```

## 案例拆解

- **业务触发：** 政策、法务、技术支持类问答不能只靠向量相似度，否则很容易把相关段落误当答案。
- **Agent 边界：** Agent 先判断问题类型，再检索支持证据和反证，必要时要求澄清或拒绝推断。
- **验收证据：** 答案必须附带证据、适用条件和无法回答时的停止说明。

## 最小 Lab

为一个问答 Agent 设计三类检索：事实查询、反证查询、补充背景查询。

建议按这个顺序做：

1. 先写边界和失败时的停止条件。
2. 把输入、输出、状态、权限整理成一张表。
3. 实现或写出最小 happy path 的伪代码。
4. 立刻补一个失败路径 eval。
5. 看一次执行日志，确认人类能复盘每一步。

## Season 1 补课

Season 1 Day 8 / Day 10：上下文管理和压缩决定检索结果如何进入推理。

Season 1 是基础线，Season 2 是加厚和生产化线。读这一天时，不需要回头翻译 Season 1，但要知道它在补哪一层前置能力。

## 生产化风险

检索结果如果不带来源和置信度，会把幻觉包装成 grounded answer。

| 风险 | 复核问题 |
| --- | --- |
| 边界模糊 | 能不能说清哪个组件负责这个能力。 |
| 权限过大 | 是否只使用当前用户和当前任务需要的 scope。 |
| 无法观测 | 失败时能否从 trace 和 artifact 追到原因。 |
| 缺少 eval | 下次质量下降时能否发现。 |
| 人类不可理解 | 审批或异常处理的原因是否留在 UI 或日志里。 |

## 复核清单

- 我能用一句话说清 Day 15 的主题。
- 我留下了文件、图、schema 或 checklist 形式的产物。
- 我知道对应的 Season 1 补充主题。
- 我给最小 lab 加了失败路径。
- 我能指出至少一个生产化前的权限、观测或 eval 风险。

## 参考资源

- [Advent of Agents Season 2 Day 15](https://adventofagents.com/2026/03/15)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
