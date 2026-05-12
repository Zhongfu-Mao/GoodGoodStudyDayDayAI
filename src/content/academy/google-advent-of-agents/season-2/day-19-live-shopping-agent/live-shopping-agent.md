---
title: "Google Advent of Agents S2 Day 19：Live Shopping Agent 案例"
date: 2026-05-07
category: academy
description: "把多模态、实时交互和商业动作放进一个高约束案例里分析。"
plainSummary: "Season 2 Day 19 的原创工程讲义：从当天主题提炼设计边界、实践任务、生产风险和复核清单。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-19-live-shopping-agent/cover.svg"
tags:
  - Agent
  - AI Engineering
lang: zh
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 19：Live Shopping Agent"
  moduleOrder: 219
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/19"
  prerequisites:
    - "建议先阅读：Google Advent of Agents：Agent 工程实践总览"
draft: false
---

![Google Advent of Agents S2 Day 19：Live Shopping Agent 案例 封面](/images/academy/google-advent-of-agents/season-2/day-19-live-shopping-agent/cover.svg)

**说明：** 本文以 Google Advent of Agents Season 2 Day 19 的公开主题为主线，结合 Season 1 的相关主题做补充。它不是官方译文，也不复述原文，而是改写成本站的 Agent 工程学习笔记。

## 这一天要解决什么

把多模态、实时交互和商业动作放进一个高约束案例里分析。

今天的目标产物是：一张 commerce agent risk map：意图、商品证据、推荐、确认、购买边界。不要只把它当成教程链接，而要把它变成一个能被复查的设计记录或 lab。

## 系统模式图

![Day 19 系统模式图](/images/academy/google-advent-of-agents/season-2/day-19-live-shopping-agent/diagram.svg)

这张图把 Day 19 的主题放进“输入、边界、产物、生产风险”的系统流里。重点不是记住功能名，而是能说清：系统多了哪个边界，哪些状态要被记录，哪里可以被测试或停止。

## 三个关键概念

- 商业 Agent 的核心不是推荐，而是安全动作边界。
- 实时多模态输入要进入可回放状态。
- 购买、支付和个人数据必须有显式确认。

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

购物 Agent 可以自动比较商品和解释差异，但不能自动购买。它必须把价格、库存、退货条款、推荐理由和风险展示给用户，由用户显式确认后才进入支付或下单工具。

## 实现草图

下面这段不是完整代码，而是发布前应该写进设计文档或 README 的结构化草图。它的作用是让 reviewer 能看见边界、状态和验收点。

```yaml
commerce_boundary:
  auto_allowed: [compare_products, explain_tradeoffs]
  approval_required: [add_to_cart, purchase, save_payment]
  show_before_approval: [price, return_policy, risk]
```

## 案例拆解

- **业务触发：** 购物体验很适合 Agent，但金钱、库存、退货和隐私都会让自动化变高风险。
- **Agent 边界：** Agent 可以比较和解释，不自动购买；任何支付、下单、保存地址都进入审批。
- **验收证据：** 购买前页面能展示价格、风险、理由、替代选项和用户确认记录。

## 最小 Lab

为购物 Agent 设计“推荐可以自动做，购买必须确认”的动作边界。

建议按这个顺序做：

1. 先写边界和失败时的停止条件。
2. 把输入、输出、状态、权限整理成一张表。
3. 实现或写出最小 happy path 的伪代码。
4. 立刻补一个失败路径 eval。
5. 看一次执行日志，确认人类能复盘每一步。

## Season 1 补课

Season 1 Day 12 / Day 21：多模态 Agent 和案例学习提供体验背景。

Season 1 是基础线，Season 2 是加厚和生产化线。读这一天时，不需要回头翻译 Season 1，但要知道它在补哪一层前置能力。

## 生产化风险

如果推荐和购买边界混在一起，Agent 会越过用户决策权。

| 风险 | 复核问题 |
| --- | --- |
| 边界模糊 | 能不能说清哪个组件负责这个能力。 |
| 权限过大 | 是否只使用当前用户和当前任务需要的 scope。 |
| 无法观测 | 失败时能否从 trace 和 artifact 追到原因。 |
| 缺少 eval | 下次质量下降时能否发现。 |
| 人类不可理解 | 审批或异常处理的原因是否留在 UI 或日志里。 |

## 复核清单

- 我能用一句话说清 Day 19 的主题。
- 我留下了文件、图、schema 或 checklist 形式的产物。
- 我知道对应的 Season 1 补充主题。
- 我给最小 lab 加了失败路径。
- 我能指出至少一个生产化前的权限、观测或 eval 风险。

## 参考资源

- [Advent of Agents Season 2 Day 19](https://adventofagents.com/2026/03/19)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
