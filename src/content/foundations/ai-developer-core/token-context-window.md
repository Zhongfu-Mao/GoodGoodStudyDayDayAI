---
title: "AI Developer Core：Token 与上下文窗口"
date: 2026-04-26
category: foundations
description: "从开发者视角理解 token、上下文窗口、截断、成本和记忆设计。"
difficulty: beginner
plainSummary: "Token 不是字数单位，而是模型真正处理文本的离散符号。上下文窗口决定模型一次能看到多少信息，也决定成本、延迟和记忆策略。"
tags:
  - "AI Developer Core"
  - "LLM"
  - "Context"
lang: zh
draft: false
---

# 为什么先讲 Token

在开发 LLM 应用时，很多看似是提示词（Prompt）的问题，底层逻辑往往是 Token 问题：输入太长、历史记录过多、检索片段过于细碎、输出中途截断、成本突然飙升，或者是模型遗漏了中间的关键信息。Token 是模型读写世界的最小工程单位。我们写的是文字，模型处理的是一串离散的编号。

如果把模型想象成一个函数，它的输入并不是“文章”或“聊天记录”，而是 Token 序列。分词器（Tokenizer）负责将文本切分成 Token，并映射到词表里的整数。不同语言、标点、空格、代码片段的切分规则各不相同，因此“1000 个汉字”、“1000 个英文单词”、“1000 行 JSON”在模型眼里的长度差异巨大。

## 上下文窗口是什么

上下文窗口（Context Window）是模型在一次前向计算中能接收的最大 Token 数。它既不是长期记忆，也不是数据库。窗口内的内容直接影响当前回答；窗口外的内容则会被模型彻底“遗忘”。

这带来了三个核心的工程挑战：

1. **窗口是稀缺资源**：系统提示词（System Prompt）、用户输入、历史消息、工具调用结果、RAG 片段、格式约束都在争夺有限的窗口空间。一个复杂的 Agent 不仅要看它“会不会推理”，更要看它能否精准地将最有用的信息保留在窗口内。
2. **窗口大不代表效果稳**：超长上下文虽能容纳更多材料，但也更容易导致信息稀释、证据重复、指令冲突以及检索噪声。在很多场景下，**精简上下文比扩大上下文更重要**。
3. **窗口直接关联成本与延迟**：输入 Token 越多，模型的读取和注意力计算负担越重；输出 Token 越多，生成耗时越长。在设计应用时，Token 预算（Token Budget）应像数据库索引或 API 限流一样被严格规划，而不是等上线看到账单后才后悔。

## 开发时的诊断思路

当模型表现不如预期时，先排除以下四个 Token 相关的问题：

1. **关键信息真的在窗口里吗？**（是否被截断或从未被检索到？）
2. **核心信息是否被无关噪音淹没？**（上下文是否过载导致模型分心？）
3. **指令、上下文和格式要求是否互相冲突？**（窗口内是否存在逻辑悖论？）
4. **输出是否被设置的 Token 上限提前截断？**

这四个维度的诊断通常比“直接换一个更强的模型”更有效且更节省成本。

## 实验建议

建立一个简单的测试脚本：输入同一段中文、英文、Markdown、JSON、代码和日志，统计它们各自生成的 Token 数。尝试将同一个任务设计成三个版本的输入：完整原始材料、摘要版本、结构化要点版本。对比三者的回答质量、消耗 Token 数、延迟以及成本。

这个实验的目的不是寻找唯一标准，而是培养一种直觉：**哪些信息值得进入窗口，哪些信息应该被压缩、检索、缓存或丢弃。**

## 工程判断：什么时候该省 Token？

并非所有场景都追求 Token 的极致节约。客服摘要、批量分类、轻量信息抽取等任务，应倾向于使用短 Prompt、短输出和廉价模型。但在法务审阅、复杂代码重构、深度研究等高价值任务中，过度削减上下文反而会因回答错误增加人工复核的成本。

真正的工程判断标准是：**每个 Token 的增加是否有效提升了任务成功率，或显著降低了人工介入成本？**

建议将 Token 预算拆解为四类进行管理：
- **系统提示词**：保持精炼且稳定。
- **用户输入**：尽可能保留原意。
- **检索内容**：通过去重、重排序（Rerank）提升价值密度。
- **预期输出**：通过格式限制和字段约束来控制长度。

## 动手实践：建立 Token 预算表

为你的 AI 功能建立一张 `token_budget.md` 管理表：

| 区块 | 预计 Token | 是否可压缩 | 压缩策略 |
| --- | ---: | --- | --- |
| System Prompt | 300 | 是 | 优化冗余规则 |
| User Input | 800 | 否 | 保留原文 |
| Context (RAG) | 4000 | 是 | Chunk 去重 + Rerank |
| Output | 800 | 是 | 限制输出字段与格式 |

在上线前，通过 20 个以上的真实样例填表，分析平均值、P95 以及失败样例。**只看平均值往往会掩盖问题**，因为成本和体验的崩溃通常发生在长文档或工具返回异常的极端情况下。

## 延伸阅读

- [Token、成本与模型选择](../../../academy/ai-basics-for-everyone/what-is-token-cost-model-choice/)：从非工程视角理解 token 为什么影响预算。
- [Context、Memory 与 Projects](../../../academy/ai-basics-for-everyone/context-window-memory-projects/)：理解上下文窗口和长期资料管理的区别。
- [Context Engineering Playbook](../../../engineering/ai-developer-core/context-engineering-playbook/)：把 token budget 放进完整上下文设计。

## 参考

- [Stanford CS336: Language Modeling from Scratch](https://cs336.stanford.edu/)
- [OpenAI Prompting](https://platform.openai.com/docs/guides/prompting)
- [Anthropic Prompt Engineering Overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
