---
title: "AI Developer Core：构建一个最小 MCP Server"
date: 2026-04-26
category: engineering
description: "从工具边界和协议心智模型出发，设计并实现一个只读的最小 MCP Server。"
difficulty: intermediate
plainSummary: "MCP 的核心价值并不在于为模型增加更多按钮，而在于通过统一协议将外部工具和数据规范化地暴露给 Agent，并明确界定权限范围、输入输出格式以及错误处理机制。"
tags:
  - "AI Developer Core"
  - "MCP"
  - "Agent"
lang: zh
draft: false
---

# 为什么要从只读 MCP 开始

MCP（Model Context Protocol）让 Agent 能够安全、规范地连接外部工具和数据源。对于开发者而言，它的价值并非只是“又一个新框架”，而在于它提供了一套标准化的工具接口：包括工具的命名规范、输入参数定义、返回数据格式、是否具有写入权限以及失败时的错误表达。

在构建第一版时，建议从**只读（Read-only）**的 Server 开始。只读工具的风险较低，非常适合用来练习协议边界的设计，同时也方便后续接入人工审批（Approval）机制。

## 选一个真实的小场景

我们可以从当前站点出发，构建一个 `site_content_search` Server，提供以下两个核心工具：

- `list_recent_posts(category, limit)`：按分类列出最近的文章。
- `search_posts(query, category)`：在指定分类中搜索标题、标签和正文摘要。

这两个工具虽然体量小，但足以覆盖实际的业务需求：Agent 可以快速了解站点内容，而无需直接读取整个文件系统。

## 工具设计原则

**工具命名要具象化**。工具名应像“动作”一样直观，便于模型理解。例如，`search_posts` 比 `run_rg`（运行 ripgrep）更易于模型推理。

**输入 Schema 要严谨**。尽量缩小参数范围，例如 `category` 应使用枚举类型，`limit` 应设置合理上限，`query` 应有长度限制。

**输出要结构化**。返回数组时，每项应包含 `title`、`path`、`date`、`tags`、`snippet` 等关键信息。避免只返回一段拼接后的纯文本，否则模型将难以实现稳定的引用。

**错误处理要可读**。应区分“无结果”、“参数错误”和“内部失败”等不同的状态码或消息，而不是统一抛出宽泛的异常。

## 权限边界

即使是只读 Server，也必须明确其权限范围：它能读取哪些目录、禁止访问哪些文件、是否返回正文全文、是否暴露草稿（Draft）或本地私密文件。工具的边界越清晰，Agent 就越容易被安全地授权。

如果未来需要增加写入工具，应采用独立的审批流程。写文件、删文件、提交代码、发送邮件、调用付费 API 等操作，都不应与基础的只读搜索处于同一权限层级。

## 实验目标

本实验旨在指导你编写一个短小精悍且边界清晰的只读工具服务，使 Agent 能够查询站点内容，但无法直接访问任意系统文件。完成后，你应该获得以下产物：

- 一个 MCP Server 入口程序。
- 两个只读工具的定义。
- 一组完整的工具输入/输出样例。
- 一份详细的权限边界说明。
- 一组针对越权的测试用例。

真正核心的是**边界设计**，而非代码行数。一个优秀的工具应当让模型知道如何高效使用，同时也让人类明确知道它不能逾越的红线。

## 工具契约（Contract）

`list_recent_posts` 的输入输出可以如下设计：

```json
{
  "name": "list_recent_posts",
  "input": {
    "category": "academy | engineering | foundations | radar",
    "limit": 5
  },
  "output": {
    "items": [
      {
        "title": "string",
        "path": "string",
        "date": "YYYY-MM-DD",
        "tags": ["string"]
      }
    ]
  }
}
```

`search_posts` 则应侧重于返回摘要（Snippet）而非全文。第一版不开放全文读取，既能防止模型将大量正文塞进上下文导致窗口溢出，也能降低泄露草稿或隐私内容的风险。

## 目录边界

工具应仅允许读取 `src/content` 中的公开集合：`academy`、`engineering`、`foundations`、`radar`。严禁读取 `_sources`（原始素材）、`.local.md`（本地记录）、`.env`（环境变量）、`.git`（版本控制信息）、`scripts/local` 或构建缓存。即使这些路径在运行环境中是可读的，也不意味着工具应该将其暴露给模型。

**安全边界应通过代码逻辑实现，而非仅仅依靠 Prompt**。Prompt 可以提醒模型不要越权，但最可靠的屏障是 Server 根本不提供任何越权的能力。

## 越权测试

准备以下测试请求来验证安全性：

- 搜索公开文章标题：**应当成功**。
- 请求访问 `_sources` 目录：**应当拒绝**。
- 请求读取 `.env` 文件：**应当拒绝**。
- `limit` 参数传入 999：**应当被上限截断或报错**。
- `category` 传入任意系统路径：**应当被 Schema 校验拒绝**。

这些测试能够证明你的工具不是一个简单的 `grep` 包装器，而是一个具有安全边界的产品级接口。在验收时，不仅要看它能否返回正确结果，更要看它对非法请求的拒绝是否足够稳定。

## 检查清单

- 工具是否严格执行只读权限？
- 输入参数是否有枚举约束和长度限制？
- 输出是否结构化，且不泄露文档全文？
- 错误类型是否覆盖了 `no_results`、`invalid_input`、`forbidden` 和 `internal_error`？
- 是否通过了越权测试？
- 是否记录了每次工具调用的参数及结果数量？

## 可做实验

实现一个本地只读 MCP Server，用于查询 `src/content` 下的文章。尝试让 Agent 完成任务：“找出 foundations 分类中所有关于 AI Developer Core 的文章，并生成推荐阅读顺序”。检查 Agent 是否仅依赖工具返回的数据，而没有尝试违规读取隐藏文件。

如果后续需要增加写入能力，请务必新增一个独立的 Server 或权限层。例如，`suggest_article_patch` 仅负责生成 Diff 建议，而不直接写入文件；任何实际的写入操作都必须经过人工审批确认。

## 相关基础阅读

- [MCP 是什么](../../../academy/ai-basics-for-everyone/what-is-mcp/)：建立关于协议设计的非实现层心智模型。
- [Introduction to Model Context Protocol](../../../academy/anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/)：补充 Anthropic Academy 关于 MCP 的基础理论。
- [Agent = 状态、工具与反馈循环](../../../foundations/ai-developer-core/agent-state-tools-feedback-loop/)：理解为何 MCP 需要工具边界和停止条件。

## 参考

- [Anthropic Engineering](https://www.anthropic.com/engineering)
- [OpenAI Agents SDK](https://platform.openai.com/docs/guides/agents-sdk/)
- [Google Agent Development Kit](https://adk.dev/)
- [Microsoft AI Agents for Beginners](https://github.com/microsoft/ai-agents-for-beginners)
