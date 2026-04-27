---
title: "AI 雷达：Azure Agent Runtime 的新信号"
date: 2026-04-01
category: radar
cadence: daily
description: "Azure 推出 Agent Runtime 服务，将 Agent 的状态管理和部署从本地推向云端托管。"
difficulty: beginner
plainSummary: "Azure Agent Runtime 把 Agent 的运行环境从本地脚本搬到了云端，提供状态持久化、工具注册和执行监控。"
tags:
  - Agent
  - Azure
lang: zh
draft: false
---

## 今天的信号

Azure 正式推出 Agent Runtime 预览版，把 Agent 的执行环境从"开发者本地跑脚本"升级为"云端托管服务"。核心变化有三个：

1. **状态持久化**：Agent 的对话历史、任务进度和工具调用记录自动保存在云端，不再依赖本地内存。
2. **工具注册中心**：通过统一的工具描述格式注册工具，Agent 可以发现和调用已注册的能力。
3. **执行监控**：每次 Agent 运行都生成可追踪的执行日志，包括工具调用链、token 消耗和错误信息。

## 为什么值得关注

之前搭建 Agent 系统，开发者需要自己处理状态管理、工具编排和日志记录。这些基础设施工作占了大量时间，而且每个团队的做法都不一样。

Azure Agent Runtime 的做法是把这些通用能力下沉到平台层：

| 之前（自建） | 之后（平台托管） |
| --- | --- |
| 自己管理对话状态 | 平台自动持久化 |
| 自己写工具调用逻辑 | 标准化工具注册 + 自动发现 |
| 日志分散在各处 | 统一的执行追踪 |
| 每次部署手动配置 | 声明式部署 |

## 值得观察的问题

- 工具注册格式是否和 MCP 兼容？如果不兼容，又是一个私有生态。
- 状态管理的粒度能否满足复杂 Agent 的需求？简单的 key-value 可能不够。
- 云端运行的延迟和成本，对实时性要求高的场景是否可接受。
- 与 Azure OpenAI Service 的绑定程度——是否支持其他模型？

## 延伸阅读

- [Agent = 状态、工具与反馈循环](../../foundations/ai-developer-core/agent-state-tools-feedback-loop/)
- [Agent Harness：日志、审批与回放](../../engineering/ai-developer-core/agent-harness-logging-approval-replay/)
