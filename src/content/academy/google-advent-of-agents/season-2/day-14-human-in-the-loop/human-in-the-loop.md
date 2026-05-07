---
title: "Google Advent of Agents S2 Day 14：Human in the Loop"
date: 2026-05-07
category: academy
description: "把人类审批做成可审查的系统节点，而不是一句模糊的“可以吗”。"
plainSummary: "Season 2 Day 14 的原创工程讲义：从当天主题提炼设计边界、实践任务、生产风险和复核清单。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-14-human-in-the-loop/cover.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: zh
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 14：Multi-Agent Patterns: Human in the Loop"
  moduleOrder: 214
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/14"
  prerequisites:
    - "建议先阅读：Google Advent of Agents：Agent 工程实践总览"
draft: false
---

![Google Advent of Agents S2 Day 14：Human in the Loop 封面](/images/academy/google-advent-of-agents/season-2/day-14-human-in-the-loop/cover.svg)

**说明：** 本文以 Google Advent of Agents Season 2 Day 14 的公开主题为主线，结合 Season 1 的相关主题做补充。它不是官方译文，也不复述原文，而是改写成本站的 Agent 工程学习笔记。

## 这一天要解决什么

把人类审批做成可审查的系统节点，而不是一句模糊的“可以吗”。

今天的目标产物是：一个 approval payload：动作、影响范围、可撤销性、替代方案、执行命令。不要只把它当成教程链接，而要把它变成一个能被复查的设计记录或 lab。

## 系统模式图

![Day 14 系统模式图](/images/academy/google-advent-of-agents/season-2/day-14-human-in-the-loop/diagram.svg)

这张图把 Day 14 的主题放进“输入、边界、产物、生产风险”的系统流里。重点不是记住功能名，而是能说清：系统多了哪个边界，哪些状态要被记录，哪里可以被测试或停止。

## 三个关键概念

- HITL 是高风险系统能力，不是模型失败的补丁。
- 审批前必须展示影响范围和具体动作。
- 审批结果应进入状态和审计日志。

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

当 Agent 要发送客户邮件时，审批卡片必须展示收件人、主题、正文摘要、附件、不可撤销影响和替代动作。用户批准的不是一句“发送吧”，而是一个具体 payload。

## 实现草图

下面这段不是完整代码，而是发布前应该写进设计文档或 README 的结构化草图。它的作用是让 reviewer 能看见边界、状态和验收点。

```yaml
approval:
  action: send_email
  recipient: customer@example.com
  irreversible: true
  alternatives: [save_draft, request_edit]
  execute_only_after: explicit_approval
```

## 案例拆解

- **业务触发：** 发送邮件、下单、部署、删除数据这些动作需要人类批准，但批准不能停留在一句自然语言。
- **Agent 边界：** 审批界面展示具体 payload、影响范围、替代动作和回滚可能性；Agent 只在明确批准后执行。
- **验收证据：** 审计日志能证明用户批准的是哪个版本的 payload，而不是模糊意图。

## 最小 Lab

为一个发送邮件或部署动作设计审批卡片，用户批准后才允许工具调用。

建议按这个顺序做：

1. 先写边界和失败时的停止条件。
2. 把输入、输出、状态、权限整理成一张表。
3. 实现或写出最小 happy path 的伪代码。
4. 立刻补一个失败路径 eval。
5. 看一次执行日志，确认人类能复盘每一步。

## Season 1 补课

Season 1 Day 9 / Day 22：undo、guardrails 和审批是 HITL 的前置心智。

Season 1 是基础线，Season 2 是加厚和生产化线。读这一天时，不需要回头翻译 Season 1，但要知道它在补哪一层前置能力。

## 生产化风险

如果审批信息不完整，人类只是在为黑箱背书。

| 风险 | 复核问题 |
| --- | --- |
| 边界模糊 | 能不能说清哪个组件负责这个能力。 |
| 权限过大 | 是否只使用当前用户和当前任务需要的 scope。 |
| 无法观测 | 失败时能否从 trace 和 artifact 追到原因。 |
| 缺少 eval | 下次质量下降时能否发现。 |
| 人类不可理解 | 审批或异常处理的原因是否留在 UI 或日志里。 |

## 复核清单

- 我能用一句话说清 Day 14 的主题。
- 我留下了文件、图、schema 或 checklist 形式的产物。
- 我知道对应的 Season 1 补充主题。
- 我给最小 lab 加了失败路径。
- 我能指出至少一个生产化前的权限、观测或 eval 风险。

## 参考资源

- [Advent of Agents Season 2 Day 14](https://adventofagents.com/2026/03/14)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
