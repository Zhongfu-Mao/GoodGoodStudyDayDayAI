---
title: "Model Context Protocol 入门：把工具接入变成协议问题"
date: 2026-03-31
category: academy
description: "从 client、server、tools、resources、prompts、transport、权限与治理理解 MCP，避免把每个工具集成做成一次性代码。"
plainSummary: "MCP 的价值在于把 Agent 与外部工具、资源和提示词之间的连接标准化。它不是魔法层，而是一套需要权限、版本、审计和治理的工程接口。"
difficulty: advanced
coverImage: "/images/academy/anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/mcp-protocol-hub-cover.png"
tags:
  - Agent
  - MCP
lang: zh
academy:
  series: "Anthropic Academy"
  module: "代理与 MCP"
  moduleOrder: 5
  source: "Anthropic Academy"
  sourceUrl: "https://anthropic.skilljar.com/introduction-to-model-context-protocol"
  prerequisites:
    - "Python 编程基础"
    - "JSON 与 HTTP 请求响应基础"
draft: false
---

# Model Context Protocol 入门：把工具接入变成协议问题

![MCP 协议中心连接模型、工具与数据源](/images/academy/anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/mcp-protocol-hub-cover.png)

当你开始构建 Agent，很快会遇到同一个问题：模型需要访问外部世界。

它可能需要：

- 读取 GitHub issue。
- 查询数据库。
- 搜索文档。
- 调用内部 API。
- 获取设计稿。
- 读取日志。
- 使用已有业务系统。

如果每个应用都为每个工具手写一套 schema、认证、调用和错误处理，集成成本会迅速失控。Model Context Protocol（MCP）的价值就在这里：把模型应用与外部工具之间的连接标准化。

一句话理解：

**MCP 让工具、资源和提示词以统一协议暴露给 AI 客户端。**

## MCP 解决的不是“能不能调用工具”，而是“N 对 M 集成”

没有协议时，N 个 AI 客户端连接 M 个工具，常常会产生 N × M 的适配。

有协议后，客户端只需要理解 MCP，工具侧只需要实现 MCP Server。这样连接复杂度会下降。

| 角色 | 责任 |
| --- | --- |
| MCP Client | 运行在 AI 应用或 Agent 环境里，发现并调用 server 能力 |
| MCP Server | 暴露工具、资源、提示词，连接真实外部系统 |
| Tool | 可执行动作，比如查询 issue、写文件、跑搜索 |
| Resource | 可读取内容，比如文档、文件、数据库记录 |
| Prompt | 可复用提示模板或任务入口 |
| Transport | client 与 server 通信方式，如 stdio 或 HTTP |

MCP 的重点不是某个具体工具，而是“工具如何被发现、描述、调用、返回结果”这一层。

## 工具、资源、提示词要分清

![MCP server 边界、工具、资源与权限层](/images/academy/anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/mcp-server-boundaries.png)

很多集成混乱，是因为把所有能力都叫 tool。

在 MCP 思维里，可以这样区分：

| 类型 | 适合做什么 | 风险 |
| --- | --- | --- |
| Tool | 执行动作或计算 | 可能有副作用，需要权限 |
| Resource | 读取已有内容 | 需要访问控制和脱敏 |
| Prompt | 提供可复用任务模板 | 需要版本管理和适用范围 |

例如：

- `list_pull_requests` 是 tool。
- `repo://owner/name/README.md` 是 resource。
- `review_pr_prompt` 是 prompt。

分清类型后，权限和审计也会更清楚。

## Transport 选择影响部署方式

MCP 可以通过不同 transport 工作。当前标准 transport 主要是：

| Transport | 适合场景 |
| --- | --- |
| stdio | 本地工具、CLI 集成、开发环境 |
| Streamable HTTP | 远程 server、团队共享、云端部署 |

本地 stdio 上手最快，但 Streamable HTTP 更接近团队共享服务。历史上的 HTTP with SSE 属于旧方案；WebSocket 可以作为自定义 transport 设计，但不应该被当成默认标准。选择 transport 时要考虑：

- server 在哪里运行。
- 谁负责认证。
- 日志在哪里记录。
- 如何升级版本。
- 如何限制访问来源。

协议统一不代表部署复杂度消失。它只是把复杂度放到了更清晰的位置。

## 权限和治理不能后补

MCP server 一旦连接真实系统，就不只是开发工具，而是 Agent 的能力边界。

必须设计：

- 哪些 client 可以连接。
- 哪些用户可以调用哪些 tool。
- tool 参数是否需要校验。
- 写入类 tool 是否需要确认。
- 输出是否包含敏感信息。
- 每次调用是否有审计日志。
- server 版本升级是否兼容。

不要把 MCP server 当成“给模型开的后门”。它应该像任何内部 API 一样被治理。

## 案例：GitHub MCP Server

目标：让 Agent 能辅助处理 GitHub 项目。

能力拆分：

- Resource：仓库 README、issue 正文、PR diff。
- Tool：列 issue、创建评论、读取 CI 状态。
- Prompt：PR review 模板、release note 模板。

权限策略：

- 默认只读。
- 评论、改 label、关闭 issue 需要确认。
- merge、删除 branch 默认禁用。
- 所有 tool 调用记录 repo、目标对象、用户、时间、结果。

这样 Agent 可以高效协作，但不会无边界地操作仓库。

![MCP 治理风险地图：权限、版本、审计与数据边界](/images/academy/anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/mcp-governance-risks.png)

## 常见反模式

**反模式一：把 MCP 当成万能插件系统。**

MCP 解决连接标准，不自动解决权限、安全、数据质量和产品流程。

**反模式二：所有能力都做成写入 tool。**

先区分 resource 和 read-only tool。写入能力越晚开放越安全。

**反模式三：server 没有版本和 owner。**

一旦多个 Agent 依赖 server，版本变化就会变成生产风险。

**反模式四：没有审计日志。**

Agent 调用外部系统后，必须能追溯谁、何时、为什么调用了什么。

## MCP Server 设计模板

```md
## Server

名称：
owner：
运行位置：
transport：
认证方式：

## Capabilities

Tools：
Resources：
Prompts：

## Permissions

默认权限：
需要确认的 tool：
禁止的 action：
敏感字段处理：

## Operations

日志字段：
版本策略：
错误码：
限流：
回滚方式：
```

## 检查清单

- 是否明确区分 tool、resource、prompt？
- server 是否有 owner 和版本策略？
- 写入工具是否默认需要确认？
- tool 输入输出是否结构化？
- 是否记录每次调用的审计信息？
- 远程 server 是否有认证和访问控制？
- 是否有失败和超时处理？

## 继续阅读

- [Agent Skills 入门](./introduction-to-agent-skills/)：把可复用工作流包装成 Agent 可发现的能力。
- [MCP Advanced Topics](./model-context-protocol-advanced-topics/)：继续理解更复杂的部署、认证和治理问题。
- [OpenAI Academy：构建可靠 AI Agents](../../openai-academy/07-building-with-ai/agents/)：把 MCP 放回 Agent 系统架构中。

## 参考

- [Model Context Protocol Introduction](https://modelcontextprotocol.io/introduction)
- [Anthropic MCP documentation](https://docs.anthropic.com/en/docs/mcp)
- [MCP specification](https://spec.modelcontextprotocol.io/)
