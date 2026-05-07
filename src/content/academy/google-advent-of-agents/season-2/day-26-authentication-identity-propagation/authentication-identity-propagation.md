---
title: "Google Advent of Agents S2 Day 26：Authentication 与身份传播"
date: 2026-05-07
category: academy
description: "明确工具调用到底代表谁：系统、用户、委托角色，还是临时授权。"
plainSummary: "Season 2 Day 26 的原创工程讲义：从当天主题提炼设计边界、实践任务、生产风险和复核清单。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-26-authentication-identity-propagation/cover.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: zh
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 26：Authentication"
  moduleOrder: 226
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/26"
  prerequisites:
    - "建议先阅读：Google Advent of Agents：Agent 工程实践总览"
draft: false
---

![Google Advent of Agents S2 Day 26：Authentication 与身份传播 封面](/images/academy/google-advent-of-agents/season-2/day-26-authentication-identity-propagation/cover.svg)

**说明：** 本文以 Google Advent of Agents Season 2 Day 26 的公开主题为主线，结合 Season 1 的相关主题做补充。它不是官方译文，也不复述原文，而是改写成本站的 Agent 工程学习笔记。

## 这一天要解决什么

明确工具调用到底代表谁：系统、用户、委托角色，还是临时授权。

今天的目标产物是：一张 identity flow：用户登录、OAuth consent、token scope、tool call、audit log。不要只把它当成教程链接，而要把它变成一个能被复查的设计记录或 lab。

## 系统模式图

![Day 26 系统模式图](/images/academy/google-advent-of-agents/season-2/day-26-authentication-identity-propagation/diagram.svg)

这张图把 Day 26 的主题放进“输入、边界、产物、生产风险”的系统流里。重点不是记住功能名，而是能说清：系统多了哪个边界，哪些状态要被记录，哪里可以被测试或停止。

## 三个关键概念

- Agent 工具调用必须能追溯最终用户。
- 服务账号不能默认绕过用户权限。
- 授权范围要最小化、可撤销、可审计。

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

日历 Agent 查询会议时，不能用一个万能服务账号读取所有人的日历。它应该通过当前用户授权，只拿 calendar.readonly scope，并在审计日志里记录 user、tool、scope、reason。

## 实现草图

下面这段不是完整代码，而是发布前应该写进设计文档或 README 的结构化草图。它的作用是让 reviewer 能看见边界、状态和验收点。

```yaml
auth_log:
  user: user_123
  tool: calendar_lookup
  scope: calendar.readonly
  reason: meeting_prep
  consent_id: oauth_abc
```

## 案例拆解

- **业务触发：** Agent 代表用户行动时，最危险的是把所有请求都变成万能服务账号。
- **Agent 边界：** 每次工具调用都带当前用户身份、scope、consent 和业务理由，服务账号只做受限后端能力。
- **验收证据：** 审计日志能回答谁授权、调用了什么、为什么调用、是否超出 scope。

## 最小 Lab

为一个读取用户日历的 Agent 设计授权范围、撤销方式和审计日志字段。

建议按这个顺序做：

1. 先写边界和失败时的停止条件。
2. 把输入、输出、状态、权限整理成一张表。
3. 实现或写出最小 happy path 的伪代码。
4. 立刻补一个失败路径 eval。
5. 看一次执行日志，确认人类能复盘每一步。

## Season 1 补课

Season 1 Day 22：身份、审批和 guardrails 共同构成安全边界。

Season 1 是基础线，Season 2 是加厚和生产化线。读这一天时，不需要回头翻译 Season 1，但要知道它在补哪一层前置能力。

## 生产化风险

身份不清会把所有责任都变成“Agent 做的”。

| 风险 | 复核问题 |
| --- | --- |
| 边界模糊 | 能不能说清哪个组件负责这个能力。 |
| 权限过大 | 是否只使用当前用户和当前任务需要的 scope。 |
| 无法观测 | 失败时能否从 trace 和 artifact 追到原因。 |
| 缺少 eval | 下次质量下降时能否发现。 |
| 人类不可理解 | 审批或异常处理的原因是否留在 UI 或日志里。 |

## Gmail 邮件强调点

这一天的 Gmail newsletter 强调了最终用户身份传播、OAuth consent 和 authenticated tools。

公开文章不引用 Gmail 正文或内部链接，只使用主题优先级和实务角度。

## 复核清单

- 我能用一句话说清 Day 26 的主题。
- 我留下了文件、图、schema 或 checklist 形式的产物。
- 我知道对应的 Season 1 补充主题。
- 我给最小 lab 加了失败路径。
- 我能指出至少一个生产化前的权限、观测或 eval 风险。

## 参考资源

- [Advent of Agents Season 2 Day 26](https://adventofagents.com/2026/03/26)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
