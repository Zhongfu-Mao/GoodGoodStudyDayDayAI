---
title: "AI Basics for Everyone：MCP 是什么，AI 怎么连接外部工具"
date: 2026-04-27
category: academy
description: "用 USB-C 类比解释 MCP：一个让 AI 标准化连接工具、数据和服务的开放协议。"
coverImage: "/images/academy/ai-basics-for-everyone/mcp.svg"
difficulty: beginner
plainSummary: "MCP 是 Model Context Protocol，一个让 AI 标准化连接外部工具和数据的协议。它像 USB-C 一样，让不同的 AI 和工具只需要一个接口就能协作。"
tags:
  - "MCP"
  - "Agent"
lang: zh
academy:
  series: "AI Basics for Everyone"
  module: "入口概念"
  moduleOrder: 10
  source: "本站 Academy / Engineering 导读"
  prerequisites: []
draft: false
---

## 先用一句话理解

MCP 是 Model Context Protocol，一个开放标准，让 AI 能用统一的方式连接外部工具、数据源和服务。就像 USB-C 让不同设备共享一个接口一样，MCP 让不同的 AI 模型和工具只需要适配一次就能互相配合。

## 为什么需要 MCP

在 MCP 出现之前，每个 AI 应用想连接一个外部工具（比如日历、数据库、文件系统、API），都需要单独写一套集成代码。

这造成了一个组合爆炸问题：

| 没有 MCP | 有 MCP |
| --- | --- |
| 3 个 AI × 5 个工具 = 15 套集成 | 3 个 AI + 5 个工具 = 8 个适配器 |
| 每加一个工具，所有 AI 都要改 | 新工具只需实现一次 MCP 协议 |
| 每个集成的权限、日志、错误处理都不一样 | 权限、日志、安全可以在协议层统一 |

MCP 把这个 M × N 问题变成了 M + N 问题。

## MCP 的 USB-C 类比

把 MCP 想象成 USB-C 接口：

- **AI 模型** 是你的笔记本电脑。
- **外部工具** 是显示器、硬盘、键盘等外设。
- **MCP** 是 USB-C 接口标准。

没有 USB-C 时，每个外设都需要不同的线；有了 USB-C，一根线就能连接大多数设备。MCP 做的是同样的事情，只不过连接的是 AI 和工具。

## MCP 跟普通用户有什么关系

即使你不写代码，MCP 也在影响你的体验：

- 当你在 Claude 里连接 Google Drive、Notion、GitHub，背后就是 MCP 在工作。
- 当一个 Agent 能同时搜索网页、读取文件和操作日历，这些工具是通过 MCP 接入的。
- 当新工具出现时，它只需要支持 MCP，就能被现有的 AI 助手使用。

你不需要自己配置 MCP，但理解它存在，能帮你判断一个 AI 产品的工具能力是"真实的"还是"演示用的"。

## MCP 服务器和客户端

MCP 里有两个角色：

| 角色 | 是什么 | 例子 |
| --- | --- | --- |
| MCP 客户端 | 发起请求的一方 | Claude Desktop、VS Code、Cursor |
| MCP 服务器 | 提供工具的一方 | 文件系统服务器、数据库服务器、API 网关 |

客户端告诉服务器"我需要什么工具"，服务器告诉客户端"我能提供什么能力"。这个协商过程是自动的。

## 和本站内容怎么接上

先读 [Introduction to Model Context Protocol](../../anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/)，理解 MCP 的完整设计。

再读 [Minimal MCP Server](../../../engineering/ai-developer-core/minimal-mcp-server/)，看一个最小的 MCP 服务器是什么样的。

如果你想理解 Agent 如何使用工具，先回顾 [Agent 是什么](../what-is-agent/)。

## 动手试试

如果你使用 Claude Desktop，可以试试：

1. 打开设置，看看是否有 MCP 服务器的配置选项。
2. 如果已经连接了文件系统或其他工具，试着让 Claude 读取一个本地文件。
3. 观察 Claude 在调用工具时是否会显示"正在使用工具"的提示。

即使不配置，知道"AI 通过 MCP 连接工具"这件事，就够了。

## 一个实用判断

看到一个 AI 产品说"支持 100+ 工具集成"时，可以问：

1. 这些集成是通过标准协议（MCP）还是各自独立实现的？
2. 新工具接入需要多长时间？
3. 工具调用有没有权限控制和日志？
4. 断开一个工具会不会影响其他功能？

标准化集成比数量更重要。
