---
title: "MCP Tool Contract 设计：输入、输出、错误和权限"
date: 2026-05-11
category: engineering
description: "从工具契约而不是协议热词出发，设计一个可被 Agent 稳定调用、可被人类审计、可逐步升级权限的 MCP 工具层。"
difficulty: advanced
plainSummary: "MCP 工具设计的重点不是把所有能力暴露出去，而是把工具命名、输入 schema、结构化输出、错误分类、权限等级和审计字段设计成一个清晰契约。"
tags:
  - "AI Engineering"
  - "MCP"
  - "Agent"
lang: zh
coverImage: "/images/engineering/practice/mcp-tool-contract-cover.png"
draft: false
---

# MCP Tool Contract 设计：输入、输出、错误和权限

> 时效边界：本文核验于 2026-05-11。MCP specification、OpenAI Apps SDK、Codex MCP 支持和各客户端行为仍在演进，落地前请复查官方文档。

MCP 最容易被误解成“给模型接更多工具”。这个理解太粗了。真正有价值的 MCP Server，不是把文件系统、数据库、浏览器和内部 API 一次性暴露给 Agent，而是把外部能力包装成一组可以被发现、可以被验证、可以被审计的工具契约。

一个好的工具契约会让模型少猜，让人类更容易审批，也让系统更容易回放。它回答的不是“模型能不能做到”，而是“模型被允许怎样做”。

![MCP Tool Contract 的边界](/images/engineering/practice/mcp-contract-boundary.svg)

## 从工具名开始收窄能力

工具名越接近底层系统，风险越高。`run_sql`、`read_file`、`execute_shell` 看起来通用，但它们把太多判断留给模型。模型需要自己决定路径、查询、过滤、格式和权限，任何一步都可能越界。

更好的工具名应该面向业务动作。例如：

```json
{
  "name": "search_public_posts",
  "description": "Search published site posts by query and category. Drafts, source notes, local files, and private paths are never returned."
}
```

这个名字本身就说明了三件事：它只搜索公开文章；它不是任意文件搜索；它不会返回草稿和本地资料。工具名不是装饰，它是模型决策的一部分。

## 输入 Schema 是第一道安全边界

输入 schema 要尽量窄。`category` 用枚举，不用任意字符串；`limit` 有上限；`query` 有长度限制；日期用明确格式；布尔开关不要暗含危险行为。

一个只读搜索工具可以这样设计：

```json
{
  "category": "engineering | foundations | academy | radar",
  "query": "string, 2-80 chars",
  "limit": "integer, 1-10",
  "locale": "zh | ja"
}
```

这比 `path` 加 `pattern` 安全得多，因为调用者无法通过参数构造访问 `_sources`、`.env` 或 `.git`。安全边界应写进工具实现，而不是只写进 prompt。Prompt 可以提醒模型，但真正可靠的是工具根本不给它越权能力。

## 输出要让下一步可验证

许多工具失败在输出上：返回一大段纯文本，看似自然，实际难以检查。Agent 需要结构化结果来做下一步判断，人类也需要结构化结果来审计。

搜索工具的输出最好包含：

```json
{
  "items": [
    {
      "title": "string",
      "category": "engineering",
      "locale": "zh",
      "url": "/engineering/example/",
      "date": "2026-05-11",
      "snippet": "string",
      "source": "published_content"
    }
  ],
  "result_count": 3,
  "truncated": false
}
```

不要默认返回全文。摘要、路径和元数据通常足够支持下一步，如果确实需要全文，应设计另一个更高权限工具，并明确长度、可访问目录和日志字段。

## 错误分类比异常堆栈更重要

工具应该把失败分成稳定类型，而不是把内部异常直接丢给模型。常见错误至少包括：

| 错误类型 | 含义 | Agent 应对 |
| --- | --- | --- |
| `invalid_input` | 参数不符合 schema | 修正参数后重试 |
| `forbidden` | 请求触碰禁止范围 | 停止并解释边界 |
| `no_results` | 合法查询但没有结果 | 调整查询或告知用户 |
| `rate_limited` | 暂时不可继续 | 等待、降频或请求确认 |
| `internal_error` | 工具内部失败 | 记录并切换备用路径 |

错误分类越清楚，Agent 越不容易陷入重复尝试。尤其是 `forbidden`，它应该是停止信号，不是换个写法继续绕。

## 权限等级决定是否需要审批

MCP Server 可以从只读开始，但迟早会遇到写入需求。关键不是“能不能写”，而是把权限升级路径设计清楚。

一个实用分级可以是：

| 等级 | 示例 | 默认策略 |
| --- | --- | --- |
| L0 | 列出公开索引、读取公开元数据 | 自动允许 |
| L1 | 读取普通公开文件、执行只读搜索 | 自动允许并记录日志 |
| L2 | 生成 patch、写入草稿、调用付费 API | 需要审批 |
| L3 | 删除、发送邮件、推送、修改生产数据 | 强审批并显示影响范围 |

写入工具最好不要直接执行最终动作。比如 `suggest_article_patch` 可以生成 diff，而真正写入文件由 Harness 审批后完成。这样模型负责提出建议，系统负责执行边界。

## 审计字段让工具可回放

每次工具调用至少记录：run id、tool name、参数摘要、结果数量、权限等级、耗时、错误类型和审批结果。不要记录隐私正文，也不要把 secret 写进日志。

审计不是为了证明模型“想了什么”，而是为了复现系统做了什么。出现事故时，人类需要知道工具调用是否越权、参数是否异常、输出是否被截断、审批是否发生。

## 分层模型：MCP Contract 的五个边界

一个 MCP Tool Contract 可以拆成五层，每层都回答不同问题。

第一层是语义边界：这个工具到底代表什么业务动作？`search_public_posts` 是业务动作，`grep_any_file` 是底层权限。前者能被审计，后者很难限制。工具名越接近业务动作，Agent 越容易理解什么时候该用，也越容易在越界时停下来。

第二层是参数边界：调用者可以改变什么？参数应该限制查询范围、数量、语言、时间窗口、输出格式，而不是把路径、SQL、shell command 原样交给模型。MCP specification 要求 `inputSchema` 是有效 JSON Schema；这不是形式主义，而是第一道权限闸门。

第三层是结果边界：工具返回什么，返回多少，是否能被下游验证？MCP 工具可以返回文本、图片、音频、资源链接、嵌入资源和结构化内容。对于 Agent 来说，结构化内容尤其重要，因为它减少了“从自然语言里猜字段”的概率。

第四层是错误边界：失败是否可恢复？MCP specification 区分协议错误和工具执行错误。协议错误通常说明请求结构错了，模型未必能修；工具执行错误可以带有行动建议，让模型调整参数后重试。把所有失败都变成 `internal_error`，就等于放弃了自恢复。

第五层是运营边界：谁能调用、何时审批、如何限流、如何记录、如何废弃旧版本。MCP 只是协议，不会替你完成权限治理。官方规格也提醒，服务器需要验证输入、实现访问控制、限流并清理输出；客户端应在敏感操作前提示用户、验证结果、设置超时并记录工具使用。

## 实战路径：从只读工具开始

落地 MCP 最稳的方式不是先做大而全的 server，而是先做只读、窄范围、可回放的工具。下面是一条适合内容站点和知识库的路径。

第一阶段，只提供索引查询。比如 `list_recent_posts`、`search_public_posts`、`get_post_outline`。这些工具只读公开内容，不碰本地私密文件，不写入，不调用付费 API。目标是验证 schema、分页、错误分类、日志字段和客户端调用体验。

第二阶段，提供建议型工具。比如 `suggest_internal_links`、`suggest_tags`、`suggest_frontmatter_patch`。注意这里的关键词是 suggest。工具可以返回建议、diff 或候选列表，但不直接改文件。真正写入由 Harness 读取建议后，通过补丁和审批完成。

第三阶段，才考虑写入型工具。比如创建草稿、更新索引、触发构建、调用发布 API。进入这一阶段前，必须已经有权限等级、审批策略、幂等设计、回滚路径和审计日志。否则 MCP 只是把危险操作包装得更顺手。

第四阶段，做版本化和兼容。工具一旦被多个客户端依赖，就不能随意改字段。可以通过 `tool_name_v2`、可选字段、能力探测、迁移窗口来减少破坏。不要让 Agent 在运行时猜“这个字段今天还在不在”。

## 反例陷阱：把协议当安全边界

第一个反例是万能文件工具：

```json
{
  "name": "read_file",
  "inputSchema": {
    "type": "object",
    "properties": {
      "path": { "type": "string" }
    },
    "required": ["path"]
  }
}
```

这个工具看似简单，实际上把路径选择权交给了模型。即使客户端有 sandbox，它也会让每次调用都变成权限判断。更好的做法是把工具限制到公开内容索引，或者让 path 只能来自前一步返回的资源链接。

第二个反例是任意 SQL 工具。`execute_sql(query)` 对模型很友好，对系统很危险。即使只读，也可能泄露过多数据、造成慢查询、绕过业务过滤。更稳的设计是提供业务查询工具，例如 `list_orders_by_status(status, limit)`，并在服务器端固定字段、分页和权限。

第三个反例是把错误藏起来。工具失败后只返回“Something went wrong”，模型会反复重试。返回 `invalid_input`、`forbidden`、`rate_limited`、`no_results`、`upstream_unavailable`，并附带下一步建议，才有机会让 Agent 做出正确动作。

第四个反例是不给用户看敏感调用。MCP 的工具是 model-controlled，但规范并不要求某一种固定 UI。对于删除、发送、付费、发布、修改生产数据这类动作，客户端必须让用户看到将要调用的工具、参数和影响范围。否则“自动化”会变成不可解释的外部副作用。

## 当前可观察状态与复核路径

截至 2026-05-11，MCP 最新规格页显示的工具层要点包括：工具通过 `tools/list` 被发现，通过 `tools/call` 被调用；工具定义包含 `name`、`description`、`inputSchema`，可包含 `outputSchema`；工具名应保持可识别、避免特殊字符；结构化输出可放在 `structuredContent`；工具执行错误可以通过 `isError: true` 给模型可恢复反馈；安全建议强调输入校验、访问控制、限流、输出清理、用户确认、超时和审计日志。

复核路径很直接：

1. 打开 MCP specification 的 Server Features / Tools 页，确认当前工具字段、错误语义和安全建议。
2. 打开目标客户端文档，例如 Codex、Claude Code 或 ChatGPT Apps SDK，确认它们如何配置 MCP、如何审批工具、如何展示调用。
3. 做一个只读最小 server，手动调用 `tools/list` 和 `tools/call`。
4. 用恶意参数测试：超大 limit、非法 locale、越权 path、空查询、特殊字符。
5. 检查日志里是否能回放工具名、参数摘要、结果数量、错误类型和审批状态。

只有这些都能解释清楚，MCP Contract 才从“能调用”进入“可维护”。

## 本站可以怎么做

如果为本站做一个安全只读 MCP Server，第一版只需要三个工具：

- `list_recent_posts(category, locale, limit)`
- `search_public_posts(query, category, locale, limit)`
- `get_post_outline(url)`

第一版不提供全文读取，不访问 `_sources`，不读取 `.local.md`，不暴露构建缓存，不写文件。这样已经足够支持 Agent 回答“某个专题有哪些文章”“某篇文章应该补哪些内部链接”“工程实践和 start 基础页如何互相引用”等任务。

等只读层稳定后，再考虑 `suggest_internal_links` 或 `suggest_frontmatter_patch` 这类建议型工具。真正写入仍由人类或受控 Harness 完成。

## 查缺补漏清单

- 工具名是否表达业务动作，而不是底层系统权限？
- 输入 schema 是否阻止路径注入和无限范围查询？
- 输出是否结构化、可引用、可截断？
- 错误是否区分 `forbidden` 和 `no_results`？
- 是否明确权限等级和审批策略？
- 是否记录足够审计信息，又不泄露私密内容？
- 是否从只读工具开始，而不是第一版就开放写入？

## 延伸阅读

- [MCP 是什么](../../../start/ai-basics-for-everyone/what-is-mcp/)
- [AI Developer Core：构建一个最小 MCP Server](../ai-developer-core/minimal-mcp-server/)
- [AI 工程实践地图](./ai-engineering-practice-map/)
