---
title: "Google Advent of Agents：工具与协议边界"
date: 2026-05-06
category: academy
description: "把 MCP、API Registry、A2A、A2UI 和 Agent Protocols 重组为一套 Agent 系统互操作边界图。"
plainSummary: "这篇图文笔记解释 Agent 接工具、接企业 API、接其他 Agent、输出交互式 UI 时，为什么应该使用不同的协议边界。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/covers/03-tools-protocols.svg"
tags:
  - Agent
  - AI Engineering
lang: zh
academy:
  series: "Google Advent of Agents"
  module: "03 工具与协议互操作"
  moduleOrder: 123
  source: "Google Cloud Advent of Agents"
  sourceUrl: "https://adventofagents.com/2026/03/21"
  prerequisites:
    - "建议先阅读：Google Advent of Agents：上下文、记忆与 Skills 分层"
draft: false
---

![工具与协议边界封面](/images/academy/google-advent-of-agents/covers/03-tools-protocols.svg)

**说明：** 本文基于 Advent of Agents 中关于 MCP Servers、Google Managed MCP、Cloud API Registry、A2A、A2UI、A2A Extensions 与 Agent Protocols 的公开主题重组。它不逐日复述，而是回答一个工程问题：当 Agent 要连接外部世界时，哪些边界应该分开设计？

## 这篇解决什么问题

很多 Agent 项目一开始只有一个“工具列表”。

天气查询、数据库查询、文件读取、内部审批、UI 表单、另一个 Agent 服务、企业 API，全部被塞进同一个 function calling 层。短期看很方便，长期看会变成一团混合边界：

- 工具调用和跨 Agent 委托混在一起，无法判断谁拥有任务结果。
- 企业 API 的审批、权限和审计规则散落在 prompt 或工具描述里。
- Agent 需要用户填表或选择时，只能输出文字，前端再猜应该如何渲染。
- 不同团队做的 Agent 无法稳定互相发现、协商和调用。
- 安全团队很难问清楚：这个 Agent 到底能碰哪些系统？

Advent of Agents 连续介绍 MCP、A2A、A2UI、API Registry，不是为了制造更多缩写，而是为了把“连接”拆成不同的责任边界。

## 协议边界图

![Agent 协议边界图](/images/academy/google-advent-of-agents/diagrams/tools-protocol-boundaries.svg)

可以先用这张表建立直觉：

| 边界 | 解决的问题 | 不该拿它解决什么 |
| --- | --- | --- |
| MCP | Agent 如何调用外部工具、读取资源、发现 prompts。 | 不负责多个 Agent 之间的任务协议，也不天然解决企业审批。 |
| API Registry | 企业如何提供经过批准、可治理、可审计的 API 工具。 | 不替代 Agent 的推理、状态和编排。 |
| A2A | 一个 Agent 如何把任务交给另一个 Agent 或服务型 Agent。 | 不适合替代本地函数调用或普通工具调用。 |
| A2UI | Agent 如何返回可交互 UI，而不只是文字。 | 不替代工具协议，也不负责后端权限。 |
| Guardrails / Policy | 调用前后如何拦截、审批、脱敏和记录。 | 不应只写在 prompt 里当作道德提醒。 |

一个成熟系统通常会同时使用其中几种边界，而不是押注一个协议吃掉所有问题。

## MCP：工具层，而不是万能集成层

MCP 的核心价值是让 Agent 以统一方式连接工具、资源和 prompts。它非常适合这些场景：

- 本地开发工具：文件、Git、测试、搜索、浏览器。
- 企业系统适配器：文档、日历、工单、知识库。
- 数据访问工具：只读查询、检索、摘要、导出。
- 可复用 prompt 或资源：模板、schema、运行手册。

MCP 的好处不是“多了一层包装”，而是把工具能力从某个单一模型或单一应用里抽出来。这样同一套工具可以被不同 Agent 客户端复用，也更容易做权限、日志和能力发现。

但 MCP 不应该承载所有语义。例如：

- “请市场分析 Agent 完成竞争分析”更像 A2A 任务，不是一个普通数据库工具。
- “请用户选择一个审批方案”更像 A2UI 交互，不应该靠纯文本猜测。
- “只有管理员批准的 BigQuery 表可以查询”更像 Registry + Policy，不应该只靠工具描述自律。

## API Registry：企业工具入口要可治理

个人项目可以把工具函数写在代码里。企业项目不行。

当 Agent 能访问 BigQuery、CRM、财务系统、客户数据时，关键问题不再是“怎么调用 API”，而是：

- 谁批准这个 API 可以被 Agent 使用？
- 哪些用户、角色、环境可以调用？
- 调用参数是否需要限制？
- 输出是否需要脱敏？
- 日志是否可以追溯到最终用户？
- API schema 变化后，Agent 如何知道？

API Registry 的价值在于把这些问题前置到“工具目录”层。Agent 不需要在 prompt 中记住所有企业系统细节，而是在运行时获取经过批准的工具定义。

一个稳妥的企业工具入口通常会有三层：

| 层 | 责任 |
| --- | --- |
| Registry | 暴露可用 API、schema、描述、所有者和版本。 |
| Policy | 判断当前用户和当前任务是否允许调用。 |
| Adapter | 把 Agent 调用转换成真实后端 API，并处理错误、重试和审计。 |

这比把所有工具硬编码到 Agent 里更适合长期维护。

## A2A：当另一个 Agent 拥有执行权

A2A 的关键词是 agent-to-agent，不是 tool-to-agent。

什么时候需要 A2A？判断标准是：对方是否拥有自己的任务状态、推理过程、工具边界和完成标准。

适合 A2A 的例子：

- 一个研究 Agent 把“查找可靠来源”委托给专门的检索 Agent。
- 一个总控 Agent 把“生成部署计划”交给平台工程 Agent。
- 一个 Python 服务 Agent 和一个 Go 服务 Agent 通过协议协作。
- 企业内部不同团队维护的 Agent 需要互相发现和调用。

不适合 A2A 的例子：

- 调用一个天气 API。
- 读取一个文件。
- 查询一张表。
- 执行一个本地 shell 命令。

这些仍然是工具调用。把工具调用包装成 Agent，会增加调试和权限复杂度。

## A2UI：让 Agent 输出可交互界面

很多 Agent 体验卡在“文字太多”。当 Agent 需要用户选择、填写、排序、审批、比较时，纯文本输出会变得低效。

A2UI 关心的是：Agent 能不能返回一个可渲染、可交互、可回传状态的 UI payload。

适合 A2UI 的场景：

- 让用户从多个部署方案中选择一个。
- 展示一组候选工具调用并请求批准。
- 把 Agent 分析结果渲染成可筛选表格。
- 在 Gemini Enterprise 或工作台环境中嵌入一个 micro-app。

它的关键不是“界面更漂亮”，而是把交互状态变成系统可理解的对象。用户点了哪个按钮、改了哪个字段、拒绝了哪个建议，都能进入后续任务状态。

## 一个边界选择示例

假设你要做一个“销售数据分析 Agent”。用户问：

> 找出上周日本区销售异常，并生成给区域经理的行动建议。

一种稳妥拆法：

| 步骤 | 边界 | 原因 |
| --- | --- | --- |
| 获取可查询数据集列表 | API Registry | 只允许使用管理员批准的数据源。 |
| 查询聚合销售数据 | MCP 或 Registry-backed tool | 这是工具调用，不是 Agent 委托。 |
| 让异常检测 Agent 解释异常 | A2A | 对方有自己的分析逻辑和完成标准。 |
| 展示候选行动建议 | A2UI | 用户需要比较、编辑和审批。 |
| 发送最终建议邮件 | Tool + Policy | 高风险动作，需要身份、审批和日志。 |

这套设计的好处是：每个边界都有可审查的责任。出了问题时，你能知道是工具 schema 错、权限判断错、子 Agent 推理错，还是 UI 回传状态错。

## 反模式

| 反模式 | 风险 | 更稳的做法 |
| --- | --- | --- |
| 所有能力都叫 tool | 无法区分 API、Agent、UI、审批。 | 按 MCP / Registry / A2A / A2UI 分层。 |
| 把权限写进 prompt | 模型可能忽略，审计也困难。 | 用 policy gate 和后端权限检查。 |
| 子 Agent 只是函数别名 | 增加协议成本，没有独立价值。 | 普通函数继续做 tool。 |
| UI 由前端猜文本 | 状态不稳定，难以回放。 | 让 Agent 输出结构化 UI payload。 |
| 企业 API 硬编码 | 版本、审批、所有者不可治理。 | 使用 registry-backed tool。 |

## 代码层面的概念骨架

下面不是完整实现，只展示边界分离的思路：

```python
agent_request = {
    "task": "analyze weekly sales anomaly",
    "user": {"id": "u_123", "region": "jp"},
}

approved_tools = api_registry.discover(
    user=agent_request["user"],
    purpose="sales_analysis",
)

sales_summary = mcp_client.call_tool(
    name="query_sales_summary",
    arguments={"week": "last_week", "region": "jp"},
)

root_cause = a2a_client.delegate(
    agent="anomaly_explainer",
    task={"summary": sales_summary, "required_output": "ranked_causes"},
)

ui_payload = a2ui.render_choice_panel(
    title="Choose actions for the regional manager",
    options=root_cause["recommended_actions"],
)
```

真正的实现会依赖具体框架，但设计检查点是一致的：工具发现、工具调用、Agent 委托和 UI 回传不能混成一团。

## 和 OpenAI / Anthropic 路线的对照

| 路线 | 常见入口 | 这篇的互补点 |
| --- | --- | --- |
| OpenAI | Function calling、Responses API tools、Agents SDK、Codex 工具环境 | Google 这条路线更强调企业工具目录、A2A / A2UI 边界和云上运行时。 |
| Anthropic | MCP、Claude Skills、subagents、desktop / coding workflow | Google 这条路线把 MCP 放进更大的生产互操作版图里。 |
| 通用工程 | API gateway、service mesh、workflow engine、approval system | Agent 协议不是替代后端工程，而是给模型驱动系统补一层语义边界。 |

读者不需要选边站。更好的学习方式是把协议视为设计词汇：MCP 讲工具，A2A 讲代理协作，A2UI 讲交互，Registry 讲企业治理。

## 最小实践任务

给你正在做的 Agent 画一张“连接边界表”：

1. 列出它可能调用的所有外部能力。
2. 标注每个能力是 tool、enterprise API、另一个 Agent、还是 UI interaction。
3. 标注每个能力需要的权限、日志和失败处理。
4. 找出哪些能力目前被混在一个函数层里。
5. 把最高风险的一个能力改成 policy-gated tool。
6. 为一次用户审批设计结构化 UI payload，而不是只返回文字。

实践记录表：

| 能力 | 当前实现 | 更合适边界 | 风险 |
| --- | --- | --- | --- |
| 查询销售数据 | 直接 SQL tool | Registry-backed tool | 数据权限、审计。 |
| 让研究 Agent 查资料 | function call | A2A | 对方拥有独立任务状态。 |
| 用户审批发送邮件 | 文本确认 | A2UI + policy | 状态回传、误操作。 |

## 复核清单

- 我能解释 MCP、A2A、A2UI、API Registry 各自解决什么问题。
- 我不会把所有外部能力都叫作 tool。
- 我知道企业 API 接入需要 schema、所有者、权限和审计。
- 我能判断什么时候另一个 Agent 值得用 A2A，而不是普通函数调用。
- 我能设计一个需要用户交互的 A2UI payload。
- 我能指出每个工具调用前后的 policy gate。
- 我能把协议边界画成一张可审查的系统图。

## 参考资源

- [Advent of Agents](https://adventofagents.com/)
- [Season 2: Developer's Guide to AI Agent Protocols](https://adventofagents.com/2026/03/21)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [A2A Protocol](https://github.com/a2aproject/A2A)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
- [Agent Starter Pack](https://github.com/GoogleCloudPlatform/agent-starter-pack)
