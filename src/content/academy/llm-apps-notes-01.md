---
title: "LLM 应用入门笔记：从 Prompt 到 Tool Calling"
date: 2026-04-02
category: academy
description: "构建 LLM 应用的核心架构：Prompt 设计、结构化输出、工具调用（Tool Calling）及错误处理的最佳实践路径。"
difficulty: intermediate
plainSummary: "LLM 应用不仅是一个聊天界面，更是一个由 Prompt 编排、模型调用、结构化解析、工具调用以及异常处理五个关键环节组成的系统。"
tags:
  - "LLM"
  - "Agent"
lang: zh
draft: false
---

## LLM 应用的最小骨架

大多数 LLM 应用的核心流程可划分为以下五个阶段：

1. **Prompt 编排**：将系统指令、用户输入及上下文（Context）整合为完整的提示词。
2. **模型调用**：向 LLM API 发起请求，获取原始响应数据。
3. **结构化解析**：将自然语言响应解析为程序可处理的格式（如 JSON、对象等）。
4. **工具调用（Tool Calling）**：若模型判定需要使用外部工具，则执行相应工具并将结果反馈至模型。
5. **异常处理**：针对超时、格式解析失败、工具执行错误等情况，设计重试及降级策略。

## Prompt 设计：分层架构而非简单堆砌

一个具备可维护性的 Prompt 通常采用三层结构：

```text
[系统层] 角色定义、行为准则、输出格式规范
[上下文层] 检索到的相关资料、历史对话、当前任务状态
[用户层] 当前具体的请求内容
```

**设计建议**：将系统层模版化，上下文层动态拼接，用户层保持原样传递。避免将这三层逻辑混淆，以降低调试难度。

## 结构化输出：从自由文本转向可程序化数据

引导 LLM 直接返回 JSON 是目前最通用的工程实践：

```json
{
  "intent": "schedule_meeting",
  "participants": ["Alice", "Bob"],
  "time": "2026-04-28T10:00",
  "confidence": 0.92
}
```

**实用技巧**：

- 在 Prompt 中提供完整的 JSON Schema 示例。
- 利用支持结构化输出（Structured Outputs）的 API 参数（如 OpenAI 的 `response_format`）。
- 若解析失败，建议先尝试一次自动重试，若仍失败则降级为纯文本处理逻辑。

## 工具调用：赋能模型操作真实世界

工具调用（Tool Calling）的核心协作模式：

1. 模型分析任务后，生成工具调用请求（包含函数名与参数）。
2. 宿主程序执行该调用并获取结果。
3. 将结果反馈给模型，由模型基于新信息继续推理。

```python
# 协作逻辑示例
response = llm.chat(messages, tools=tool_definitions)
if response.tool_calls:
    result = execute_tool(response.tool_calls[0])
    messages.append(tool_result(result))
    response = llm.chat(messages)
```

**关键要素**：

- **描述清晰**：工具的用途、参数含义及返回格式需准确描述。
- **参数验证**：务必对模型传入的参数进行严格校验。
- **安全管控**：对于写操作（如发送邮件、修改数据库），必须引入人工审批或二次确认机制。

## 异常处理

LLM 应用中常见的失效模式及应对方案：

| 失效类型 | 处理策略 |
| --- | --- |
| API 超时 | 采用指数退避重试机制（通常最多 3 次） |
| 输出格式错误 | 重新发起请求，并进一步明确格式要求 |
| 工具调用失败 | 将错误信息反馈给模型，引导其决定下一步行动 |
| 幻觉 / 无关回答 | 优化 Prompt 及上下文质量，必要时增加护栏（Guardrail） |
| 成本超出预算 | 严格设置 Token 使用限额及调用频次上限 |

## 延伸阅读

若想深入探讨可靠的 LLM 调用模式，请阅读 [Reliable LLM Call Skeleton](../../engineering/ai-developer-core/reliable-llm-call-skeleton/)。

了解结构化输出的工程化保障，请参考 [Structured Output、Retry 与 Recovery](../../engineering/ai-developer-core/structured-output-retry-recovery/)。

理解工具调用与 MCP 之间的关系，请参考 [Introduction to MCP](../anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/)。
