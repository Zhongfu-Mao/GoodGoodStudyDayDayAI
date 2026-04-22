---
title: "Introduction to Model Context Protocol"
date: 2026-03-31
category: academy
description: "模型上下文协议（MCP）入门，MCP服务器、客户端和工具的基本概念"
coverImage: "/images/academy/anthropic-academy/covers/05-agentic-mcp/introduction-to-model-context-protocol.svg"
tags:
  - "Anthropic/Academy"
  - "课程笔记"
  - "MCP/入门"
  - "代理"
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
**来源：** [Anthropic Academy](https://anthropic.skilljar.com/introduction-to-model-context-protocol)
**语言：** 英文课程，中文笔记
**课节：** 14 节（4 个章节）
**先决条件：** Python 编程基础、JSON 与 HTTP 请求响应基础

### 第一章：简介

#### 1. 课程欢迎（Welcome to the course）

本课程聚焦于使用 Python SDK 从零构建 MCP 服务器和客户端。

**参考链接：**
- UV 安装指南：https://docs.astral.sh/uv/
- MCP 官方介绍：https://modelcontextprotocol.io/introduction

#### 2. 什么是 MCP（Introducing MCP）

##### MCP 解决了什么问题

假设你在构建一个让用户向 Claude 询问 GitHub 数据的聊天应用。Claude 需要访问 GitHub API 的工具才能回答问题。

**没有 MCP 的情况：**
- 你需要为每个 GitHub 功能（仓库、PR、Issue 等）手写工具定义
- 需要维护复杂的 JSON schema
- 集成代码全部由你负责

**有了 MCP：**
- MCP 将工具定义和执行的负担从你的服务器转移给专门的 MCP 服务器
- 你的服务器只需连接到现有的 GitHub MCP 服务器即可

##### MCP 基础架构

```
你的应用（MCP Client）
    ↕
MCP Server A（GitHub 工具）
MCP Server B（数据库工具）
MCP Server C（自定义工具）
```

每个 MCP Server 作为某个外部服务的接口，包含工具（Tools）、提示词（Prompts）和资源（Resources）。

#### 3. MCP 客户端（MCP clients）

##### 传输无关性（Transport Agnostic）

MCP 的关键优势之一是**传输无关性**——客户端和服务器可以通过不同协议通信，取决于你的部署方式：

| 场景 | 传输方式 |
|------|----------|
| 客户端和服务器在同一台机器 | 标准输入/输出（stdio）— 最常见 |
| 远程部署 | HTTP、WebSocket 等网络协议 |

##### MCP 消息类型

连接后，客户端和服务器交换 MCP 规范定义的消息类型：

| 消息类型 | 用途 |
|----------|------|
| `ListToolsRequest` | 列出服务器提供的所有工具 |
| `CallToolRequest` | 调用某个具体工具 |
| `ListResourcesRequest` | 列出可用资源 |
| `ReadResourceRequest` | 读取某个资源 |
| `ListPromptsRequest` | 列出可用提示词 |
| `GetPromptRequest` | 获取某个提示词（含变量填充） |

### 第二章：动手构建 MCP 服务器

#### 4. 项目设置（Project setup）

课程提供了两个 Python 项目包：
- `cli_project.zip`：起始代码
- `cli_project_COMPLETE.zip`：完整参考实现

**环境建议：** 使用 UV 管理 Python 环境（https://docs.astral.sh/uv/）

#### 5. 用 MCP 定义工具（Defining tools with MCP）

##### 使用 Python SDK 创建服务器

Python MCP SDK 使服务器创建变得简单，只需一行代码初始化：

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("DocumentMCP", log_level="ERROR")
```

##### 使用装饰器定义工具

用 `@mcp.tool()` 装饰器定义工具，无需手写 JSON schema：

```python
## 文档存储在内存字典中
docs = {
    "deposition.md": "文档内容...",
    "report.pdf": "另一份文档内容..."
}

@mcp.tool()
def read_document(doc_id: str) -> str:
    """读取指定 ID 的文档内容"""
    return docs.get(doc_id, "文档未找到")

@mcp.tool()
def update_document(doc_id: str, content: str) -> str:
    """更新指定 ID 的文档内容"""
    docs[doc_id] = content
    return f"文档 {doc_id} 已更新"
```

SDK 会自动从函数签名和 docstring 生成工具定义，省去了手动维护 JSON schema 的麻烦。

#### 6. 服务器调试工具（The server inspector）

##### 启动 MCP Inspector

在构建服务器时，可以使用 Python SDK 内置的浏览器调试工具，无需连接完整应用即可测试：

```bash
## 先激活 Python 环境，再运行
mcp dev mcp_server.py
```

这会启动一个开发服务器，本地地址通常为 `http://127.0.0.1:6274`。在浏览器中打开即可使用 MCP Inspector。

##### Inspector 的功能

- **Connect 按钮**：连接到你的 MCP 服务器
- **工具列表**：查看所有已定义的工具
- **工具调用面板**：填入参数直接测试工具
- **实时响应**：查看工具返回结果

> **注意：** Inspector 界面持续迭代更新，实际界面可能与课程截图有所不同，但核心功能保持一致。

### 第三章：连接 MCP 客户端

#### 7. 实现客户端（Implementing a client）

##### 客户端架构

MCP 客户端由两个核心组件构成：

| 组件 | 说明 |
|------|------|
| **MCP Client 类** | 自定义封装类，简化 session 的使用 |
| **Client Session** | 与服务器的实际连接（MCP Python SDK 提供） |

> **实际开发中**，你通常只实现其中一方（客户端 **或** 服务器），不会同时实现两者。本课程同时构建两者是为了演示完整的工作流程。

##### 客户端连接（stdio 方式）

```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

class MCPClient:
    async def connect(self, server_script: str):
        server_params = StdioServerParameters(
            command="python",
            args=[server_script]
        )
        # 使用 async context manager 确保正确清理连接
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                self._session = session
                # ... 使用 session
```

Client Session 需要谨慎的资源管理，连接完成后必须正确清理，因此用自定义类封装自动处理清理逻辑。

#### 8. 定义资源（Defining resources）

##### 什么是资源

资源（Resources）类似于 HTTP GET 请求处理器，适用于**获取信息**而非**执行操作**的场景。

**典型用例：** 文档提及功能（`@document_name`）

当用户在对话中提及 `@report.pdf`，系统自动将该文档内容注入到发送给 Claude 的提示词中，无需 Claude 再调用工具去获取内容。

##### 两种资源类型

| 类型 | 说明 | 示例 URI |
|------|------|----------|
| **直接资源（Direct）** | 静态 URI，固定内容 | `docs://documents/list` |
| **模板资源（Templated）** | URI 含参数，动态内容 | `docs://documents/{doc_id}` |

##### 在服务器端定义资源

```python
@mcp.resource("docs://documents/list")
def list_documents() -> str:
    """列出所有可用文档（用于自动补全）"""
    return json.dumps(list(docs.keys()))

@mcp.resource("docs://documents/{doc_id}")
def get_document(doc_id: str) -> str:
    """获取指定文档的内容"""
    return docs.get(doc_id, "")
```

#### 9. 读取资源（Accessing resources）

##### 在客户端读取资源

```python
import json
from pydantic import AnyUrl

async def read_resource(self, uri: str) -> Any:
    result = await self.session().read_resource(AnyUrl(uri))
    resource = result.contents[0]

    # 根据 MIME 类型处理不同格式
    if resource.mimeType == "application/json":
        return json.loads(resource.text)
    else:
        return resource.text  # 纯文本
```

资源响应包含 MIME 类型信息，客户端需要根据类型（JSON 或纯文本）分别处理。

#### 10. 定义提示词（Defining prompts）

##### 为什么使用 Prompts

用户可以直接让 Claude 完成大多数任务，但由 MCP 服务器作者**精心设计、反复测试**的提示词能带来更一致、更高质量的结果。

Prompts 让用户无需成为提示词工程专家，就能获得专家级的效果。

##### 在服务器端定义提示词

```python
@mcp.prompt()
def format_document(doc_id: str) -> list[types.Message]:
    """将文档格式化为 Markdown"""
    doc_content = docs.get(doc_id, "")
    return [
        types.UserMessage(
            content=f"""请将以下文档重新格式化为结构清晰的 Markdown 格式：

文档 ID: {doc_id}
内容:
{doc_content}

要求：
- 使用适当的标题层级
- 保留所有原始信息
- 确保格式清晰易读"""
        )
    ]
```

提示词函数接受参数，返回消息列表，参数会在调用时以关键字参数形式传入。

#### 11. 在客户端使用提示词（Prompts in the client）

##### 列出可用提示词

```python
async def list_prompts(self) -> list[types.Prompt]:
    result = await self.session().list_prompts()
    return result.prompts
```

##### 获取并使用提示词

```python
async def get_prompt(self, prompt_name: str, args: dict[str, str]):
    result = await self.session().get_prompt(prompt_name, args)
    return result.messages
```

**调用示例：**

```python
## 获取 format_document 提示词，传入文档 ID
messages = await client.get_prompt(
    "format_document",
    {"doc_id": "report.pdf"}
)
## 将返回的 messages 发送给 Claude
response = await anthropic_client.messages.create(
    model="claude-opus-4-5",
    messages=messages
)
```

### 第四章：总结与评估

#### 12. MCP 三大原语总结（MCP review）

这是 MCP 最核心的概念：**三种原语由不同部分控制**。

| 原语 | 控制方 | 典型用途 |
|------|--------|----------|
| **Tools（工具）** | 模型控制（Claude 决定） | 给 Claude 赋予新能力，让它自主决定何时调用 |
| **Resources（资源）** | 应用程序控制 | UI 元素展示、主动注入上下文到对话中 |
| **Prompts（提示词）** | 用户控制 | 用户主动触发的高质量预置工作流 |

**选择指南：**
- 需要 Claude 自主决策？→ **Tools**
- 需要展示数据或在后台注入上下文？→ **Resources**
- 需要用户点击触发的工作流？→ **Prompts**

### 📎 相关笔记

> **延伸阅读**
> - [Model Context Protocol: Advanced Topics](/academy/anthropic-academy/05-agentic-mcp/model-context-protocol-advanced-topics/) — MCP 进阶
> - [Introduction to Agent Skills](/academy/anthropic-academy/05-agentic-mcp/introduction-to-agent-skills/) — Skills 生态
> - [Introduction to subagents](/academy/anthropic-academy/05-agentic-mcp/introduction-to-subagents/) — 子代理与 MCP 的关系
