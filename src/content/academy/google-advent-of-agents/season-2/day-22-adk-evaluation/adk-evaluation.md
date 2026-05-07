---
title: "Google Advent of Agents S2 Day 22：ADK Evaluation"
date: 2026-05-07
category: academy
description: "把 Agent 评估从最终答案扩展到轨迹、工具调用和 rubric。"
plainSummary: "Season 2 Day 22 的原创工程讲义：从当天主题提炼设计边界、实践任务、生产风险和复核清单。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-22-adk-evaluation/cover.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: zh
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 22：ADK Evaluation"
  moduleOrder: 222
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/22"
  prerequisites:
    - "建议先阅读：Google Advent of Agents：Agent 工程实践总览"
draft: false
---

![Google Advent of Agents S2 Day 22：ADK Evaluation 封面](/images/academy/google-advent-of-agents/season-2/day-22-adk-evaluation/cover.svg)

**说明：** 本文以 Google Advent of Agents Season 2 Day 22 的公开主题为主线，结合 Season 1 的相关主题做补充。它不是官方译文，也不复述原文，而是改写成本站的 Agent 工程学习笔记。

## 这一天要解决什么

把 Agent 评估从最终答案扩展到轨迹、工具调用和 rubric。

今天的目标产物是：一个 evalset：golden tasks、negative tasks、trajectory checks、rubric score。不要只把它当成教程链接，而要把它变成一个能被复查的设计记录或 lab。

## 系统模式图

![Day 22 系统模式图](/images/academy/google-advent-of-agents/season-2/day-22-adk-evaluation/diagram.svg)

这张图把 Day 22 的主题放进“输入、边界、产物、生产风险”的系统流里。重点不是记住功能名，而是能说清：系统多了哪个边界，哪些状态要被记录，哪里可以被测试或停止。

## 三个关键概念

- Agent eval 必须看轨迹，不只看最终文本。
- Rubric 要可执行，不能只写“质量好”。
- CI gate 应从少量高风险回归开始。

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

评估客服 Agent 时，不能只看回答像不像。要检查它是否先检索知识库、有没有调用正确工具、是否拒绝越权请求、是否把退款动作留给审批。轨迹比最终语气更重要。

## 实现草图

下面这段不是完整代码，而是发布前应该写进设计文档或 README 的结构化草图。它的作用是让 reviewer 能看见边界、状态和验收点。

```yaml
eval_case:
  input: 用户要求查看他人订单
  expected_trace: [classify_sensitive, deny_access]
  forbidden_trace: [query_order_tool]
  rubric: safety_must_pass
```

## 案例拆解

- **业务触发：** 上线前的评估不只问“回答好不好”，而要检查 Agent 有没有走正确路径。
- **Agent 边界：** Eval case 同时约束最终答案、工具轨迹、拒绝行为和人工审批点。
- **验收证据：** CI 报告能区分文本质量失败、轨迹失败、安全失败和 schema 失败。

## 最小 Lab

为一个工具型 Agent 写 6 个测试：3 个正常、2 个拒绝、1 个工具失败。

建议按这个顺序做：

1. 先写边界和失败时的停止条件。
2. 把输入、输出、状态、权限整理成一张表。
3. 实现或写出最小 happy path 的伪代码。
4. 立刻补一个失败路径 eval。
5. 看一次执行日志，确认人类能复盘每一步。

## Season 1 补课

Season 1 Day 5 / Day 22：观测和 guardrails 是 eval 的证据来源。

Season 1 是基础线，Season 2 是加厚和生产化线。读这一天时，不需要回头翻译 Season 1，但要知道它在补哪一层前置能力。

## 生产化风险

只测最终文本会漏掉错误工具调用和危险中间动作。

| 风险 | 复核问题 |
| --- | --- |
| 边界模糊 | 能不能说清哪个组件负责这个能力。 |
| 权限过大 | 是否只使用当前用户和当前任务需要的 scope。 |
| 无法观测 | 失败时能否从 trace 和 artifact 追到原因。 |
| 缺少 eval | 下次质量下降时能否发现。 |
| 人类不可理解 | 审批或异常处理的原因是否留在 UI 或日志里。 |

## Gmail 邮件强调点

这一天的 Gmail newsletter 强调了轨迹测试、rubric 评分，以及把评估接入 CI 的价值。

公开文章不引用 Gmail 正文或内部链接，只使用主题优先级和实务角度。

## 复核清单

- 我能用一句话说清 Day 22 的主题。
- 我留下了文件、图、schema 或 checklist 形式的产物。
- 我知道对应的 Season 1 补充主题。
- 我给最小 lab 加了失败路径。
- 我能指出至少一个生产化前的权限、观测或 eval 风险。

## 参考资源

- [Advent of Agents Season 2 Day 22](https://adventofagents.com/2026/03/22)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
