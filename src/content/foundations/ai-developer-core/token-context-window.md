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

做 LLM 应用时，很多问题看起来像 prompt 问题，其实是 token 问题：输入太长、历史太多、检索片段太碎、输出被截断、成本突然变高、模型漏掉中间信息。Token 是模型读写世界的最小工程单位。我们写的是文字，模型处理的是一串离散编号。

如果把模型想成一个函数，输入并不是“文章”或“聊天记录”，而是 token 序列。Tokenizer 负责把文本切成 token，并映射到词表里的整数。不同语言、标点、空格、代码片段的切法都可能不同，所以“1000 个汉字”“1000 个英文单词”“1000 行 JSON”在模型眼里不是同一种长度。

## 上下文窗口是什么

上下文窗口是模型一次前向计算能接收的 token 数。它不是长期记忆，也不是数据库。窗口里的内容会影响当前回答；窗口外的内容不会被模型直接看到。

这带来三个工程后果。

第一，**窗口是稀缺资源**。系统提示、用户输入、历史消息、工具结果、RAG 片段、格式约束都会争用同一个窗口。一个复杂 Agent 不只是“会不会推理”，还要看它能不能把真正有用的信息留在窗口里。

第二，**窗口越大不等于效果越稳**。长上下文让模型能看更多材料，但也更容易出现信息稀释、重复证据、指令冲突和检索噪声。很多场景里，精简上下文比扩大上下文更重要。

第三，**窗口直接连接成本和延迟**。输入 token 越多，模型读取和注意力计算越重；输出 token 越多，生成时间越长。开发 LLM 应用时，token budget 应该像数据库索引和 API 限流一样被设计，而不是上线后才看账单。

## 开发时怎么判断问题

当模型答错时，先问四个问题：

1. 需要的信息真的在窗口里吗？
2. 信息是否被无关内容淹没？
3. 指令、上下文和格式要求是否互相冲突？
4. 输出长度是否被限制或提前停止？

这四个问题比“换一个更强模型”更便宜，也更可复用。

## 可做实验

建立一个 `token-lab` 小脚本：输入同一段中文、英文、Markdown、JSON、代码和日志，分别统计 token 数。再把同一个任务做三版输入：完整材料、摘要材料、结构化要点。比较回答质量、输入 token、延迟和成本。

这个实验的目标不是找到唯一答案，而是培养直觉：哪些信息值得进窗口，哪些信息应该被压缩、检索、缓存或丢弃。

## 工程判断：什么时候该省 token

并不是所有场景都应该把 token 压到最低。客服摘要、批量分类、轻量抽取这类任务，通常应该用短 prompt、短输出和便宜模型；法务审阅、代码修改、复杂研究这类任务，少给上下文反而会增加返工成本。真正的判断标准不是“越省越好”，而是“每个 token 是否能提高成功率或降低人工复核成本”。

可以把 token 预算拆成四类：固定系统提示、用户输入、外部资料、预期输出。固定系统提示要短而稳定；用户输入要保留原意；外部资料要去重、排序并标来源；输出长度要和用户实际需要匹配。这样一拆，很多成本问题会从“模型太贵”变成“上下文组装太粗”。

## 动手试试：建立预算表

给自己的 AI 功能建一张 `token_budget.md`：

| 区块 | 预计 token | 是否可压缩 | 压缩策略 |
| --- | ---: | --- | --- |
| system prompt | 300 | 是 | 删除重复规则 |
| user input | 800 | 否 | 保留原文 |
| retrieved context | 4000 | 是 | chunk 去重 + rerank |
| output | 800 | 是 | 限制格式和字段 |

上线前先用 20 个真实样例填表，再看平均值、P95 和失败样例。只看平均 token 容易误判，因为成本爆炸通常发生在长文档、长历史或工具返回异常时。

## 延伸阅读

- [Token、成本与模型选择](../../../academy/ai-basics-for-everyone/what-is-token-cost-model-choice/)：从非工程视角理解 token 为什么影响预算。
- [Context、Memory 与 Projects](../../../academy/ai-basics-for-everyone/context-window-memory-projects/)：理解上下文窗口和长期资料管理的区别。
- [Context Engineering Playbook](../../../engineering/ai-developer-core/context-engineering-playbook/)：把 token budget 放进完整上下文设计。

## 参考

- [Stanford CS336: Language Modeling from Scratch](https://cs336.stanford.edu/)
- [OpenAI Prompting](https://platform.openai.com/docs/guides/prompting)
- [Anthropic Prompt Engineering Overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
