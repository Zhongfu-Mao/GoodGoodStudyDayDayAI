---
title: "LLM Apps 入门笔记：从 Prompt 到 Tool Calling"
date: 2026-04-02
category: academy
description: "构建 LLM App 的基本骨架：Prompt 设计、结构化输出、Tool Calling 和错误处理的最小可运行路径。"
difficulty: intermediate
plainSummary: "LLM App 不只是一个聊天界面，而是 Prompt → 模型调用 → 结构化输出 → 工具调用 → 错误处理这五步组成的系统。"
tags:
  - "LLM"
  - "Agent"
lang: zh
draft: false
---

## 一个 LLM App 的最小骨架

大部分 LLM App 的核心流程可以分成五步：

1. **Prompt 组装**：把系统指令、用户输入和上下文拼成一个完整的 prompt。
2. **模型调用**：发送请求到 LLM API，拿到原始响应。
3. **结构化输出**：把自然语言响应解析成程序可处理的格式（JSON、对象等）。
4. **Tool Calling**：如果模型决定需要调用工具，执行工具并把结果送回模型。
5. **错误处理**：超时、格式错误、工具失败时的重试和降级策略。

## Prompt 设计：分层而不是堆砌

一个可维护的 prompt 通常分三层：

```text
[系统层] 角色定义、行为规则、输出格式要求
[上下文层] 检索到的资料、用户历史、当前任务状态
[用户层] 当前这次的具体请求
```

把系统层写成模板，上下文层动态拼接，用户层原样传递。不要把三层混在一起——这是调试噩梦的开始。

## 结构化输出：从自由文本到可程序化数据

让 LLM 直接返回 JSON 是最常见的做法：

```json
{
  "intent": "schedule_meeting",
  "participants": ["Alice", "Bob"],
  "time": "2026-04-28T10:00",
  "confidence": 0.92
}
```

实用建议：

- 在 prompt 里给出完整的 JSON schema 示例。
- 使用支持 structured output 的 API 参数（如 OpenAI 的 `response_format`）。
- 解析失败时，先重试一次，再降级为纯文本处理。

## Tool Calling：让模型操作真实世界

Tool Calling 的核心模式：

1. 模型分析任务后，输出一个工具调用请求（函数名 + 参数）。
2. 你的代码执行这个调用，拿到结果。
3. 把结果送回模型，让它基于结果继续推理。

```python
# 伪代码
response = llm.chat(messages, tools=tool_definitions)
if response.tool_calls:
    result = execute_tool(response.tool_calls[0])
    messages.append(tool_result(result))
    response = llm.chat(messages)
```

关键注意点：

- 工具描述要清晰，包括用途、参数说明和返回格式。
- 永远验证模型传来的参数。
- 写操作（发邮件、改数据）必须有审批或确认机制。

## 错误处理

LLM App 的常见失败模式：

| 失败类型 | 处理方式 |
| --- | --- |
| API 超时 | 指数退避重试，最多 3 次 |
| 输出格式错误 | 重新请求，明确要求格式 |
| 工具调用失败 | 返回错误信息给模型，让它决定下一步 |
| 幻觉 / 不相关回答 | 检查 prompt 和上下文，必要时加 guardrail |
| 成本超预算 | 设置 token 上限和调用次数上限 |

## 和本站内容怎么接上

如果你想深入了解可靠的 LLM 调用模式，读 [Reliable LLM Call Skeleton](../../engineering/ai-developer-core/reliable-llm-call-skeleton/)。

如果你想了解结构化输出的工程保障，读 [Structured Output、Retry 与 Recovery](../../engineering/ai-developer-core/structured-output-retry-recovery/)。

如果你想理解 Tool Calling 和 MCP 的关系，读 [Introduction to MCP](../anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/)。
