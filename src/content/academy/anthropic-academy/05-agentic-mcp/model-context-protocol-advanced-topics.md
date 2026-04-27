---
title: "Model Context Protocol: Advanced Topics"
date: 2026-03-31
category: academy
description: "MCP进阶主题：动态工具、资源、提示模板和高级集成模式"
plainSummary: "这篇笔记把 Model Context Protocol: Advanced Topics 的核心内容整理成可复习、可实践的 代理与 MCP 学习路径。"
difficulty: advanced
coverImage: "/images/academy/anthropic-academy/covers/05-agentic-mcp/model-context-protocol-advanced-topics.svg"
tags:
  - "代理"
lang: zh
academy:
  series: "Anthropic Academy"
  module: "代理与 MCP"
  moduleOrder: 5
  source: "Anthropic Academy"
  sourceUrl: "https://anthropic.skilljar.com/model-context-protocol-advanced-topics"
  prerequisites: []
draft: false
---
**适用对象：** MCP 开发者（需有基础 MCP 知识）

## 第一章：核心 MCP 特性（Core MCP Features）

### 1. Sampling（采样）

#### 什么是 Sampling？

Sampling 允许 **MCP Server 通过已连接的 MCP Client 访问 Claude 等语言模型**，而不是直接调用模型 API。

- Server 生成 Prompt，请求 Client"帮我调用 Claude"
- Client 已经有 Claude 连接，代为调用并返回结果
- AI 生成的成本由 Client 承担，不在 Server 端

#### Sampling 解决的问题

**无 Sampling：** Server 需要自己的 API Key、自己管理认证、自己承担费用。

**有 Sampling：** Server 只生成 Prompt，Client 负责调用 Claude。

#### Sampling 工作流

```
1. Server 完成工作（如抓取 Wikipedia 文章）
2. Server 创建 Prompt
3. Server 向 Client 发送 Sampling 请求
4. Client 调用 Claude
5. Claude 的生成结果返回 Server
6. Server 在响应中使用该结果
```

#### 实现代码

**Server 端（使用 `ctx.session.create_message`）：**
```python
@mcp.tool()
async def summarize(text_to_summarize: str, ctx: Context):
    result = await ctx.session.create_message(
        messages=[SamplingMessage(
            role="user",
            content=TextContent(type="text", text=f"Please summarize: {text_to_summarize}")
        )],
        max_tokens=4000,
        system_prompt="You are a helpful research assistant",
    )
    return result.content.text
```

**Client 端（设置 sampling_callback）：**
```python
async def sampling_callback(context, params):
    text = await chat(params.messages)  # 调用 Claude
    return CreateMessageResult(role="assistant", model=model,
                               content=TextContent(type="text", text=text))

async with ClientSession(read, write, sampling_callback=sampling_callback) as session:
    await session.initialize()
```

#### 最佳场景

公开可访问的 MCP Server——不希望随机用户无限消耗 AI 费用，由 Client 各自负担使用成本。

### 2. 日志与进度通知（Log and Progress Notifications）

#### 为什么需要通知？

Claude 调用耗时工具时，用户看不到任何进度，无法判断是在工作还是已卡死。通知功能提供实时反馈。

#### Server 端实现

通过工具函数的 `Context` 参数发送通知：

```python
@mcp.tool(name="research", description="Research a given topic")
async def research(topic: str, *, context: Context):
    await context.info("About to do research...")     # 日志消息
    await context.report_progress(20, 100)           # 进度：20/100
    sources = await do_research(topic)
    await context.info("Writing report...")
    await context.report_progress(70, 100)           # 进度：70/100
    return await generate_report(sources)
```

**主要方法：**
- `context.info(message)` — 发送日志消息
- `context.report_progress(current, total)` — 发送进度更新

#### Client 端实现

```python
async def logging_callback(params):
    print(params.data)

async def print_progress_callback(progress, total, message):
    if total:
        print(f"Progress: {progress}/{total} ({progress/total*100:.1f}%)")

async with ClientSession(read, write, logging_callback=logging_callback) as session:
    await session.initialize()
    await session.call_tool(
        name="research",
        arguments={"topic": "AI"},
        progress_callback=print_progress_callback,
    )
```

通知的展示方式完全由客户端决定（终端打印、进度条、Web推送等），**实现是可选的**。

### 3. Roots（根目录权限）

#### 什么是 Roots？

Roots 是一种**文件访问权限系统**，告知 MCP Server 可以访问本地机器上的哪些文件和文件夹。

#### 解决的问题

用户说"帮我转换 biking.mp4"，Claude 不知道文件在哪里。不用 Roots 就需要用户每次提供完整路径（用户体验差）。

**使用 Roots 的工作流：**
```
用户: "转换 biking.mp4"
    ↓
Claude 调用 list_roots → 查看可访问目录
    ↓
Claude 在批准目录中搜索文件
    ↓
找到文件 → 使用完整路径调用转换工具
```

#### 安全特性

Roots 限制了 Server 的访问范围：
- 只批准 Desktop 文件夹 → Server 无法访问 Documents 或 Downloads
- 超出 Roots 范围的访问尝试 → 返回错误

#### 实现说明

MCP SDK **不自动强制** Roots 限制，需要开发者自行实现：

```python
def is_path_allowed(requested_path: str, roots: list) -> bool:
    """检查路径是否在批准的 roots 范围内"""
    for root in roots:
        if requested_path.startswith(root):
            return True
    return False
```

在任何访问文件的工具中，先调用此函数验证权限。

## 第二章：传输与通信（Transports and Communication）

### 4. JSON 消息类型

#### MCP 消息格式

所有 MCP 通信通过 **JSON 消息**进行。消息类型定义在官方 MCP 规范仓库（GitHub），用 TypeScript 描述数据结构（非执行代码）。

#### 两大消息类别

**请求-响应消息（Request-Result）：** 成对出现，发送请求期待回应

| 请求 | 响应 |
|------|------|
| Call Tool Request | Call Tool Result |
| List Prompts Request | List Prompts Result |
| Read Resource Request | Read Resource Result |
| Initialize Request | Initialize Result |

**通知消息（Notification）：** 单向，无需响应

- Progress Notification — 长时间操作的进度更新
- Logging Message Notification — 系统日志
- Tool List Changed Notification — 工具列表变化
- Resource Updated Notification — 资源修改通知

#### 关键认知

MCP 是**双向协议**——Client 和 Server 都可以主动发起通信。这一点在选择传输方式时至关重要。

### 5. STDIO 传输

#### 工作原理

STDIO 传输是最简单、最常用的开发传输方式：
- Client 将 Server 作为**子进程**启动
- 通过**标准输入（stdin）/标准输出（stdout）** 流通信
- 双方都可以随时发起消息
- **仅限客户端和服务器在同一台机器上运行**

#### MCP 连接握手（每次必须完成）

```
1. Initialize Request  → Client 发送
2. Initialize Result   ← Server 响应（附带能力信息）
3. Initialized Notification → Client 确认（无需响应）
```

握手完成后才能发送工具调用等其他请求。

#### 四种通信场景

| 场景 | 方向 |
|------|------|
| Client → Server 请求 | Client 写入 stdin |
| Server → Client 响应 | Server 写入 stdout |
| Server → Client 请求 | Server 写入 stdout |
| Client → Server 响应 | Client 写入 stdin |

#### 适用场景

- ✅ 开发和测试阶段
- ✅ 客户端与服务器在同一机器
- ❌ 生产环境中需要跨机器通信（需用 HTTP 传输）

### 6. StreamableHTTP 传输

#### 什么是 StreamableHTTP？

StreamableHTTP 传输让 MCP Client 能通过 HTTP 连接到**远程托管**的 Server，突破了 STDIO 仅限同机器的限制。

#### HTTP 的固有挑战

标准 HTTP 中：
- ✅ Client 容易向 Server 发起请求（Server 有已知 URL）
- ✅ Server 容易响应请求
- ❌ **Server 无法主动向 Client 发起请求**（Client 没有固定 URL）

#### 受影响的 MCP 消息类型

以下功能在纯 HTTP 约束下难以实现：
- Server 发起的请求：Create Message（Sampling）、List Roots
- 通知：Progress、Logging、Initialized、Cancelled

#### StreamableHTTP 的解决方案：SSE

使用 **Server-Sent Events（SSE）** 建立持久连接：

**连接建立流程：**
```
1. Client → Initialize Request（含 session ID）
2. Server ← Initialize Result（含 mcp-session-id header）
3. Client → Initialized Notification（带 session ID）

4. Client 发起 GET 请求 → 建立 SSE 长连接
   （Server 可通过此通道主动向 Client 推送消息）
```

**工具调用时的双 SSE 连接：**

| 连接 | 用途 | 生命周期 |
|------|------|----------|
| 主 SSE 连接（GET） | Server 主动发起的请求 | 持续打开 |
| 工具专属 SSE 连接 | 每次工具调用的进度和结果 | 工具完成后关闭 |

### 7. StreamableHTTP 的状态配置

#### 两个关键配置项

| 配置 | 默认值 | 作用 |
|------|--------|------|
| `stateless_http` | False | 控制是否维护会话状态 |
| `json_response` | False | 控制响应是否使用流式传输 |

#### stateless_http = True

**使用场景：** 需要水平扩展（多个 Server 实例 + 负载均衡）时

**问题背景：** 负载均衡器可能将同一 Client 的 GET 请求和 POST 请求路由到不同 Server 实例，导致 SSE 协调失败。

**启用后的代价：**
- ❌ 无 Session ID（无法追踪客户端）
- ❌ 无服务器到客户端请求（无 SSE 通道）
- ❌ 无 Sampling（无法使用 AI 模型）
- ❌ 无进度报告
- ❌ 无资源订阅
- ✅ 无需初始化握手

#### json_response = True

**使用场景：** 不需要流式响应，与只接受 JSON 的系统集成

**效果：** POST 请求只返回最终结果（纯 JSON），无中间进度消息

#### 决策指南

| 需求 | 建议配置 |
|------|----------|
| 本地开发/测试 | STDIO 传输 |
| 远程部署，需要 Sampling 和通知 | StreamableHTTP（默认配置） |
| 大规模水平扩展 | StreamableHTTP + `stateless_http=True` |
| 简单 JSON 集成 | StreamableHTTP + `json_response=True` |

**重要提示：** 如果计划生产环境用 HTTP 部署，开发时就用 HTTP 传输测试，避免行为差异在上线后暴露。

## 核心概念速查

| 概念 | 作用 |
|------|------|
| **Sampling** | Server 通过 Client 使用 Claude，转移 AI 成本 |
| **Log notifications** | `context.info()` 发送实时日志给客户端 |
| **Progress notifications** | `context.report_progress()` 发送进度更新 |
| **Roots** | 文件系统访问权限边界，提升安全性和用户体验 |
| **JSON messages** | MCP 所有通信的载体，分请求-响应和通知两类 |
| **STDIO transport** | 最简单传输，仅限同机器，适合开发测试 |
| **StreamableHTTP** | 远程 HTTP 传输，用 SSE 解决服务器主动推送问题 |
| **stateless_http** | 支持水平扩展，但放弃 Sampling/通知/SSE |
| **json_response** | 禁用流式响应，只返回最终 JSON 结果 |

## 相关笔记

> **延伸阅读**
> - [MCP 是什么](/academy/ai-basics-for-everyone/what-is-mcp/) — 先回到协议解决的问题
> - [Minimal MCP Server](/engineering/ai-developer-core/minimal-mcp-server/) — 将权限、输入和输出落到最小实现
> - [Introduction to Model Context Protocol](/academy/anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/) — MCP 基础
> - [Introduction to subagents](/academy/anthropic-academy/05-agentic-mcp/introduction-to-subagents/) — 子代理架构
> - [Building with the Claude API](/academy/anthropic-academy/04-developer-tools/building-with-the-claude-api/) — API 开发生态
