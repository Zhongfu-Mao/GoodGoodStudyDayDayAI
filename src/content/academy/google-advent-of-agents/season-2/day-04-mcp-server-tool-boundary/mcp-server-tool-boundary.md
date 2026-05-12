---
title: "Google Advent of Agents S2 Day 4：MCP Server 作为工具边界"
date: 2026-05-07
category: academy
description: "用 MCP 把外部能力变成可发现、可描述、可复用的工具边界。"
plainSummary: "Season 2 Day 4 的原创工程讲义：从当天主题提炼设计边界、实践任务、生产风险和复核清单。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-04-mcp-server-tool-boundary/cover.svg"
tags:
  - Agent
  - AI Engineering
lang: zh
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 04：MCP Servers"
  moduleOrder: 204
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/04"
  prerequisites:
    - "建议先阅读：Google Advent of Agents：Agent 工程实践总览"
draft: false
---

![Google Advent of Agents S2 Day 4：MCP Server 作为工具边界 封面](/images/academy/google-advent-of-agents/season-2/day-04-mcp-server-tool-boundary/cover.svg)

**说明：** 本文以 Google Advent of Agents Season 2 Day 4 的公开主题为主线，结合 Season 1 的相关主题做补充。它不是官方译文，也不复述原文，而是改写成本站的 Agent 工程学习笔记。

## 这一天要解决什么

用 MCP 把外部能力变成可发现、可描述、可复用的工具边界。

如果把这一天只当成教程链接，很容易读完就过去了。更好的读法是把它变成一个工程问题：**我的 Agent 系统今天要多一个什么可审查能力？**

今天的目标产物是：一个最小 MCP tool spec：输入 schema、输出 schema、权限和错误码齐全。

## 学习流程图

![Day 04 学习流程图](/images/academy/google-advent-of-agents/season-2/day-04-mcp-server-tool-boundary/diagram.svg)

这张图把当天主题拆成五步：先确认系统问题，再画设计边界，接着留下 artifact，然后设计 eval，最后回到生产风险。Agent 工程最怕的是“概念懂了，但系统没有多任何可验证能力”。

## 三个关键概念

- MCP 解决工具集成，不等于多 Agent 协作。
- 工具描述要服务模型选择，也要服务人类审查。
- 权限和错误处理是 tool contract 的一部分。

这三个概念可以作为读文章、写代码和做复盘时的抓手。只要其中一个说不清，系统通常还停留在 demo 阶段。

## 工程设计方式

把 Day 4 放进真实项目时，建议用下面这张小表约束设计：

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

如果团队要让 Agent 查内部库存，不要直接给它数据库凭据。更稳的是做一个只读 MCP tool，只允许按 SKU 或日期范围查聚合结果，并把空结果、权限不足、参数非法都变成稳定错误码。

## 实现草图

下面这段不是完整代码，而是发布前应该写进设计文档或 README 的结构化草图。它的作用是让 reviewer 能看见边界、状态和验收点。

```yaml
tool: query_inventory_summary
input:
  sku: string
  date_range: string
output:
  status: ok | empty | denied | invalid_args
  rows: summary[]
```

## 案例拆解

- **业务触发：** Agent 需要接触内部系统，但团队不想把数据库、 SaaS token 或业务规则直接暴露给 prompt。
- **Agent 边界：** MCP server 把能力封成窄工具：参数有限、输出稳定、错误码明确、权限可审计。
- **验收证据：** 测试能覆盖正常、空结果、越权、非法参数和上游系统失败。

## 最小 Lab

把一个本地只读查询函数包装为 MCP tool，并为失败路径写一个测试用例。

建议按这个顺序做：

1. 先写出任务边界，不碰代码。
2. 再画一个 5 个节点以内的流程图。
3. 写出最小输入和输出 schema。
4. 只实现 happy path，不急着做复杂 UI。
5. 立刻补一个失败路径测试。
6. 记录一次运行日志，检查能不能复盘每一步。

完成后留下一个 `README.md`，说明这个 lab 学到了什么、哪里不稳定、下一步要补什么。

## Season 1 补课

Season 1 Day 11 / Day 18：Google Managed MCP 与 Cloud API Registry。

Season 1 更像“从零到生产”的基础路线，Season 2 更像“把系统加厚”。读 Day 4 时，不需要回头逐日翻 Season 1，但应该知道它在补哪一层背景。

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

- 我能用一句话说清 Day 4 解决的工程问题。
- 我留下了一个可检查 artifact，而不是只读完一篇文章。
- 我知道对应的 Season 1 补课主题在哪里。
- 我写出了最小 lab 的输入、输出和失败路径。
- 我能指出这个能力进入生产前至少一个权限、观测或 eval 风险。

## 参考资源

- [Advent of Agents Season 2 Day 4](https://adventofagents.com/2026/03/04)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
