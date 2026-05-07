---
title: "Google Advent of Agents S2 Day 18：企业工作台里的 ADK Agent"
date: 2026-05-07
category: academy
description: "把代码型 ADK Agent 接入企业工作台，同时保留工程治理能力。"
plainSummary: "Season 2 Day 18 的原创工程讲义：从当天主题提炼设计边界、实践任务、生产风险和复核清单。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-18-workspace-gemini-enterprise-adk-agents/cover.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: zh
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 18：Workspace & Gemini Enterprise: ADK agents"
  moduleOrder: 218
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/18"
  prerequisites:
    - "建议先阅读：Google Advent of Agents：Agent 工程实践总览"
draft: false
---

![Google Advent of Agents S2 Day 18：企业工作台里的 ADK Agent 封面](/images/academy/google-advent-of-agents/season-2/day-18-workspace-gemini-enterprise-adk-agents/cover.svg)

**说明：** 本文以 Google Advent of Agents Season 2 Day 18 的公开主题为主线，结合 Season 1 的相关主题做补充。它不是官方译文，也不复述原文，而是改写成本站的 Agent 工程学习笔记。

## 这一天要解决什么

把代码型 ADK Agent 接入企业工作台，同时保留工程治理能力。

今天的目标产物是：一张 enterprise integration map：入口、身份、工具、日志、owner、支持流程。不要只把它当成教程链接，而要把它变成一个能被复查的设计记录或 lab。

## 系统模式图

![Day 18 系统模式图](/images/academy/google-advent-of-agents/season-2/day-18-workspace-gemini-enterprise-adk-agents/diagram.svg)

这张图把 Day 18 的主题放进“输入、边界、产物、生产风险”的系统流里。重点不是记住功能名，而是能说清：系统多了哪个边界，哪些状态要被记录，哪里可以被测试或停止。

## 三个关键概念

- 企业入口不是部署终点，而是用户接触面。
- ADK Agent 仍需要版本、日志和支持责任。
- Workspace 上下文必须经过权限和数据边界控制。

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

把 ADK Agent 放进企业工作台后，它就不再只是开发者工具，而是员工入口。必须补 owner、支持渠道、版本号、用户身份传播和故障公告机制。

## 实现草图

下面这段不是完整代码，而是发布前应该写进设计文档或 README 的结构化草图。它的作用是让 reviewer 能看见边界、状态和验收点。

```yaml
enterprise_agent:
  owner: platform_team
  support: #agent-support
  version: 1.0.0
  identity: end_user_oauth
  incident_notice: status_page
```

## 案例拆解

- **业务触发：** 开发者写好的 ADK Agent 一旦进入企业工作台，就会面对真实员工和真实权限。
- **Agent 边界：** 包装层要处理身份传播、版本说明、支持渠道、事故通知和下线策略。
- **验收证据：** 用户能看到 owner、用途、数据边界，并且管理员能按版本回滚。

## 最小 Lab

设计一个 ADK Agent 从本地开发到企业入口的发布清单。

建议按这个顺序做：

1. 先写边界和失败时的停止条件。
2. 把输入、输出、状态、权限整理成一张表。
3. 实现或写出最小 happy path 的伪代码。
4. 立刻补一个失败路径 eval。
5. 看一次执行日志，确认人类能复盘每一步。

## Season 1 补课

Season 1 Day 19 / Day 4 / Day 5：注册、部署和观测是企业接入基础。

Season 1 是基础线，Season 2 是加厚和生产化线。读这一天时，不需要回头翻译 Season 1，但要知道它在补哪一层前置能力。

## 生产化风险

接入企业入口后，如果没有支持流程，问题会直接落到最终用户身上。

| 风险 | 复核问题 |
| --- | --- |
| 边界模糊 | 能不能说清哪个组件负责这个能力。 |
| 权限过大 | 是否只使用当前用户和当前任务需要的 scope。 |
| 无法观测 | 失败时能否从 trace 和 artifact 追到原因。 |
| 缺少 eval | 下次质量下降时能否发现。 |
| 人类不可理解 | 审批或异常处理的原因是否留在 UI 或日志里。 |

## 复核清单

- 我能用一句话说清 Day 18 的主题。
- 我留下了文件、图、schema 或 checklist 形式的产物。
- 我知道对应的 Season 1 补充主题。
- 我给最小 lab 加了失败路径。
- 我能指出至少一个生产化前的权限、观测或 eval 风险。

## 参考资源

- [Advent of Agents Season 2 Day 18](https://adventofagents.com/2026/03/18)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
