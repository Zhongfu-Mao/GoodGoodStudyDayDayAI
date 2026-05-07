---
title: "Google Advent of Agents S2 Day 31：A2UI、A2A 与交互式 Agent"
date: 2026-05-07
category: academy
description: "让 Agent 不只输出文字，还能交付可交互、可回传状态的微应用体验。"
plainSummary: "Season 2 Day 31 的原创工程讲义：从当天主题提炼设计边界、实践任务、生产风险和复核清单。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-31-a2ui-a2a-interactive-microapps/cover.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: zh
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 31：A2UI & A2A"
  moduleOrder: 231
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/31"
  prerequisites:
    - "建议先阅读：Google Advent of Agents：Agent 工程实践总览"
draft: false
---

![Google Advent of Agents S2 Day 31：A2UI、A2A 与交互式 Agent 封面](/images/academy/google-advent-of-agents/season-2/day-31-a2ui-a2a-interactive-microapps/cover.svg)

**说明：** 本文以 Google Advent of Agents Season 2 Day 31 的公开主题为主线，结合 Season 1 的相关主题做补充。它不是官方译文，也不复述原文，而是改写成本站的 Agent 工程学习笔记。

## 这一天要解决什么

让 Agent 不只输出文字，还能交付可交互、可回传状态的微应用体验。

今天的目标产物是：一个 interactive payload spec：组件、状态、事件、回传、后续任务。不要只把它当成教程链接，而要把它变成一个能被复查的设计记录或 lab。

## 系统模式图

![Day 31 系统模式图](/images/academy/google-advent-of-agents/season-2/day-31-a2ui-a2a-interactive-microapps/diagram.svg)

这张图把 Day 31 的主题放进“输入、边界、产物、生产风险”的系统流里。重点不是记住功能名，而是能说清：系统多了哪个边界，哪些状态要被记录，哪里可以被测试或停止。

## 三个关键概念

- A2UI 解决交互状态，不只是让界面好看。
- A2A 负责 Agent 协作，A2UI 负责用户交互。
- UI payload 要能被记录、回放和继续执行。

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

部署审批不适合用一大段文字让用户回复“同意”。A2UI 可以展示风险表、回滚按钮、审批按钮和“先保存草稿”选项；用户选择会作为结构化状态回传给 Agent。

## 实现草图

下面这段不是完整代码，而是发布前应该写进设计文档或 README 的结构化草图。它的作用是让 reviewer 能看见边界、状态和验收点。

```yaml
ui_payload:
  component: deployment_approval_panel
  state: {plan_id: deploy_42, risk: medium}
  actions: [approve, reject, save_draft]
  callback: continue_task
```

## 案例拆解

- **业务触发：** 当 Agent 要让用户选择、审批、修正或继续任务时，纯文本对话很难稳定表达状态。
- **Agent 边界：** A2UI payload 把组件、状态、事件和回传写清楚；A2A 继续负责 Agent 间任务流转。
- **验收证据：** 用户每次点击都能回放为结构化事件，并驱动下一步 Agent 任务。

## 最小 Lab

为一个部署审批 Agent 设计 A2UI 面板：展示方案、风险、按钮和回传状态。

建议按这个顺序做：

1. 先写边界和失败时的停止条件。
2. 把输入、输出、状态、权限整理成一张表。
3. 实现或写出最小 happy path 的伪代码。
4. 立刻补一个失败路径 eval。
5. 看一次执行日志，确认人类能复盘每一步。

## Season 1 补课

Season 1 Day 15 / Day 20：A2UI 和 A2A Extensions 是直接背景。

Season 1 是基础线，Season 2 是加厚和生产化线。读这一天时，不需要回头翻译 Season 1，但要知道它在补哪一层前置能力。

## 生产化风险

如果前端只能猜文本，用户选择就无法可靠进入 Agent 状态。

| 风险 | 复核问题 |
| --- | --- |
| 边界模糊 | 能不能说清哪个组件负责这个能力。 |
| 权限过大 | 是否只使用当前用户和当前任务需要的 scope。 |
| 无法观测 | 失败时能否从 trace 和 artifact 追到原因。 |
| 缺少 eval | 下次质量下降时能否发现。 |
| 人类不可理解 | 审批或异常处理的原因是否留在 UI 或日志里。 |

## Gmail 邮件强调点

这一天的 Gmail newsletter 强调了在 Gemini Enterprise 内嵌交互式 micro-app 的体验。

公开文章不引用 Gmail 正文或内部链接，只使用主题优先级和实务角度。

## 复核清单

- 我能用一句话说清 Day 31 的主题。
- 我留下了文件、图、schema 或 checklist 形式的产物。
- 我知道对应的 Season 1 补充主题。
- 我给最小 lab 加了失败路径。
- 我能指出至少一个生产化前的权限、观测或 eval 风险。

## 参考资源

- [Advent of Agents Season 2 Day 31](https://adventofagents.com/2026/03/31)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
