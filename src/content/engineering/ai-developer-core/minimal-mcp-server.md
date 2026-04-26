---
title: "AI Developer Core：写一个最小 MCP Server"
date: 2026-04-26
category: engineering
description: "从工具边界和协议心智模型出发，设计一个只读的最小 MCP server。"
difficulty: intermediate
plainSummary: "MCP 的价值不是让模型拥有更多按钮，而是用统一协议把外部工具和数据暴露给 Agent，并明确权限、输入、输出和失败方式。"
tags:
  - AI Developer Core
  - MCP
  - Tools
  - Agent
lang: zh
draft: false
---

# 为什么要从只读 MCP 开始

MCP 让 Agent 可以连接外部工具和数据源。对开发者来说，它的价值不是“又多一个框架”，而是把工具接口标准化：工具叫什么、需要什么输入、返回什么输出、是否会写入、失败时怎么表达。

第一版最好做只读 server。只读工具风险低，适合练习协议边界，也方便后续接入审批机制。

## 选一个真实小场景

可以从当前站点出发：做一个 `site_content_search` server，提供两个工具。

- `list_recent_posts(category, limit)`：列出最近文章。
- `search_posts(query, category)`：搜索标题、标签和正文摘要。

这两个工具足够小，但能覆盖实际需要：Agent 可以了解站点内容，而不需要直接读整个文件系统。

## 工具设计原则

工具名要像动作，不要像内部函数名。`search_posts` 比 `run_rg` 更适合模型理解。

输入 schema 要窄。`category` 应该是枚举，`limit` 应该有上限，`query` 应该有长度限制。

输出要结构化。返回数组时，每项包含 `title`、`path`、`date`、`tags`、`snippet`。不要只返回一段拼接文本，否则模型很难稳定引用。

错误要可读。无结果、参数错误、内部失败应该是不同状态，而不是都抛异常。

## 权限边界

只读 server 也要写清权限：它能读哪些目录，不能读哪些文件，是否会返回正文全文，是否会暴露草稿或本地私有文件。工具边界越清楚，Agent 越容易被安全地授权。

如果以后加写入工具，要单独设计审批。写文件、删文件、提交代码、发邮件、调用付费 API 都不应该和只读搜索放在同一权限层。

## 实验目标

这篇实验的目标，是写出一个小而清楚的只读工具服务，让 Agent 能查询站点内容，但不能直接访问任意文件。完成后应该有：

- 一个 MCP server 入口。
- 两个只读工具定义。
- 一组工具输入/输出样例。
- 一份权限边界说明。
- 一组越权测试。

真正重要的是边界，不是代码量。一个好工具应该让模型知道怎么用，也让人类知道它不能做什么。

## 工具契约

`list_recent_posts` 可以这样设计：

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

`search_posts` 则应该返回 snippet，而不是全文。第一版不要开放全文读取，可以避免模型把大量正文塞进上下文，也降低泄漏草稿或私有内容的风险。

## 目录边界

只允许读取 `src/content` 中的公开集合：`academy`、`engineering`、`foundations`、`radar`。不要读取 `_sources`，不要读取 `.local.md`，不要读取 `.env`、`.git`、`scripts/local` 或构建缓存。即使这些路径在本机可读，也不代表工具应该暴露。

工具层的安全边界要写进代码，而不是只写进 prompt。Prompt 可以提醒模型不要越权，但真正可靠的是 server 根本不提供越权能力。

## 越权测试

准备几条测试请求：

- 搜索公开文章标题，应该成功。
- 请求 `_sources`，应该拒绝。
- 请求 `.env`，应该拒绝。
- `limit` 传 999，应该被上限截断或拒绝。
- `category` 传任意路径，应该被 schema 拒绝。

这些测试能证明工具不是一个包装过的 `grep`，而是一个有边界的产品接口。

验收时不要只看能否返回结果，还要看拒绝是否稳定。

## 检查清单

- 工具是否只读。
- 输入是否有 enum 和长度限制。
- 输出是否结构化且不泄露全文。
- 错误是否分为 no_results、invalid_input、forbidden、internal_error。
- 是否有越权测试。
- 是否记录每次工具调用的参数和结果数量。

## 可做实验

实现一个本地只读 MCP server，用它查询 `src/content` 中的文章。然后让 Agent 完成任务：“找出 foundations 中所有 AI Developer Core 文章，并生成阅读顺序”。检查它是否只用工具返回的数据，不越权读取隐藏文件。

如果后续要加写入能力，先新增一个单独 server 或单独权限层。例如 `suggest_article_patch` 只生成 diff，不直接写文件；真正写入必须经过人工审批。

## 参考

- [Anthropic Engineering](https://www.anthropic.com/engineering)
- [OpenAI Agents SDK](https://platform.openai.com/docs/guides/agents-sdk/)
- [Google Agent Development Kit](https://adk.dev/)
- [Microsoft AI Agents for Beginners](https://github.com/microsoft/ai-agents-for-beginners)
