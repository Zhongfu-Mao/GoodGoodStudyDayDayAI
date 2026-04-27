---
title: "AI Basics for Everyone：RAG 是什么，为什么它不是简单搜索"
date: 2026-04-27
category: academy
description: "解释 RAG 如何把检索、上下文和生成连接起来，让 AI 基于外部资料回答。"
coverImage: "/images/academy/ai-basics-for-everyone/rag.svg"
difficulty: beginner
plainSummary: "RAG 是让 AI 先找到相关资料，再把资料放进上下文中生成答案的方法。它不是简单搜索，而是检索、引用、生成和评估的组合。"
tags:
  - "RAG"
lang: zh
academy:
  series: "AI Basics for Everyone"
  module: "入口概念"
  moduleOrder: 5
  source: "本站 Academy / Foundations / Engineering 导读"
  prerequisites: []
draft: false
---

## 先用一句话理解

RAG 是 Retrieval-Augmented Generation，也就是“检索增强生成”。它让 AI 先找到相关资料，再把资料放进上下文中生成答案。

它不是简单搜索，因为搜索只负责找资料；RAG 还要决定怎么切分资料、怎么检索、怎么引用、怎么回答、怎么评估答案是否可靠。

## RAG 解决什么问题

LLM 的内置知识会过时，也不一定包含你的公司文档、项目资料、课程笔记和内部流程。RAG 的价值是把这些外部资料临时带到模型面前，让回答有依据。

适合 RAG 的场景：

- 内部知识库问答。
- 文档助手。
- 课程资料检索。
- 客服知识库。
- 需要引用来源的研究助手。

## 一个 RAG 系统通常包含什么

| 环节 | 关键问题 |
| --- | --- |
| 资料准备 | 哪些资料可信、可用、可更新 |
| 切分 | 一段资料多长才容易被检索 |
| 检索 | 如何找到真正相关的片段 |
| 上下文注入 | 如何把片段交给模型 |
| 生成 | 如何要求模型只基于资料回答 |
| 评估 | 如何发现漏检、误引和胡编 |

RAG 的难点往往不在“接一个向量数据库”，而在资料质量、检索策略和评估。

## RAG 的常见误解

第一，RAG 不能自动让所有回答变正确。如果检索错了，答案也会错。

第二，RAG 不等于把所有文档塞进 prompt。上下文窗口有限，资料需要组织。

第三，RAG 不只是技术问题。哪些资料可以被谁看到，是权限和治理问题。

## 和本站内容怎么接上

先读 [RAG](../../openai-academy/07-building-with-ai/rag/)，了解 OpenAI Academy 对 RAG 的基础拆解。

如果想理解向量、embedding 和知识检索，继续读 [Embeddings、Vector 与 RAG](../../../foundations/ai-developer-core/embeddings-vector-rag/)。

如果想做一个最小可运行系统，读 [RAG Minimum System](../../../engineering/ai-developer-core/rag-minimum-system/)。

## 动手试试

找一段你自己的笔记或文档（200-500 字），贴给 ChatGPT 或 Claude，然后问一个基于这段材料的问题：

```text
以下是我的学习笔记：
[粘贴你的笔记]

请只基于以上内容回答：这段笔记的核心观点是什么？
如果笔记中没有提到的内容，请不要补充。
```

观察 AI 是只基于你的材料回答，还是会额外补充。这就是最简单的"人工 RAG"体验。

## 一个实用判断

看到任何“知识库 AI”产品，可以问：

1. 它检索的是哪些资料？
2. 资料多久更新一次？
3. 回答有没有引用来源？
4. 找不到资料时会不会承认不知道？
5. 如何评估检索和回答质量？

这些问题比“用了什么模型”更能决定产品是否可靠。
