---
title: "AI Developer Core：Embedding、向量相似度与 RAG"
date: 2026-04-26
category: foundations
description: "解释 embedding 如何把文本变成可检索空间，以及 RAG 为什么既能增强模型也会制造新风险。"
difficulty: beginner
plainSummary: "Embedding 把文本映射到向量空间，相似度检索让应用能找到相关材料。RAG 的关键不是把文档塞给模型，而是把正确证据带进上下文。"
tags:
  - "AI Developer Core"
  - "RAG"
lang: zh
draft: false
---

# Embedding 是什么

Embedding 是把文本、图片或其他对象映射成向量的函数。向量空间里的距离代表语义相近程度。两个句子表面词不同，但表达同一件事时，它们的向量可能靠得很近。

这件事让 LLM 应用有了“外部记忆”的基本能力。用户提问时，我们可以先把问题变成向量，再从文档库里找相似片段，把这些片段放入上下文，让模型基于材料回答。

## RAG 不是万能补丁

RAG 的全称是 retrieval-augmented generation。它的价值是让模型使用外部知识、私有文档和更新信息。但它不会自动保证正确。失败通常来自四个地方：

1. 文档切分不好，相关信息被切碎。
2. 检索召回不好，正确材料没被拿到。
3. 排序不好，噪声排在关键证据前面。
4. 生成约束不好，模型没有忠实引用证据。

所以 RAG 工程不是“接一个向量库”，而是一个完整链路：数据清理、chunk、embedding、索引、检索、重排、上下文组装、引用、拒答和评测。

## 向量相似度的局限

语义相似不等于任务相关。用户问“退款政策是否适用于企业账号”，检索系统可能找出很多“退款政策”片段，但漏掉“企业账号例外”。短查询、否定句、数字、时间、权限、法律条款都容易让纯向量检索失手。

因此很多生产系统会混合使用关键词检索、向量检索、metadata filter、reranker 和规则。向量是强工具，但不是唯一工具。

## 工程含义

RAG 的第一原则是：让答案可追溯。没有来源的回答很难调试；没有评测集的 RAG 很难优化。每次改 chunk size、embedding 模型、top-k、reranker 或 prompt，都应该能用同一组问题比较结果。

好 RAG 不追求“看起来知道很多”，而追求“在知道时给证据，在不知道时承认不知道”。

## 可做实验

拿站点里的 20 篇 Radar 或 Academy 文章做一个小型 RAG。准备 20 个问题，其中 10 个能在文档中找到答案，5 个需要跨文档综合，5 个故意无答案。分别测试 top-3、top-8、关键词+向量混合检索，并记录 groundedness。

## 工程判断：先评测，再换组件

RAG 最容易陷入“不断换 embedding 模型、向量库和 chunk size”的循环。更稳的顺序是先定义问题集和失败标准，再动组件。否则检索结果看起来变多了，产品质量却不一定变好。

判断一个 RAG 是否健康，至少看四个指标：正确证据是否被召回、证据是否排在前面、回答是否忠实引用证据、无答案时是否拒答。任何一个环节缺失，最终回答都可能看起来流畅但不可追溯。

## 动手试试：做一个错误分类表

为每次失败打标签：

| 失败类型 | 典型现象 | 优先修复点 |
| --- | --- | --- |
| no-recall | 正确文档没被检索到 | chunk、embedding、关键词混合 |
| low-rank | 正确文档排在噪声后面 | rerank、metadata filter |
| synthesis-error | 证据在上下文里但回答错 | prompt、引用约束、输出检查 |
| over-answer | 无答案问题被编造回答 | refusal rule、grounding eval |

这个表比“感觉 RAG 不准”更有用，因为它把问题定位到链路中的具体环节。

## 延伸阅读

- [RAG 是什么](../../../academy/ai-basics-for-everyone/what-is-rag/)：给非工程同事解释 RAG 的最短路径。
- [幻觉与 Grounding](../../../academy/ai-basics-for-everyone/what-is-hallucination-grounding/)：理解为什么引用和拒答是 RAG 的核心能力。
- [RAG Minimum System](../../../engineering/ai-developer-core/rag-minimum-system/)：从最小实现看完整链路。

## 参考

- [Full Stack LLM Bootcamp](https://fullstackdeeplearning.com/llm-bootcamp/)
- [Eugene Yan: LLM Patterns](https://eugeneyan.com/writing/llm-patterns/)
- [DeepLearning.AI: Building Agentic RAG with LlamaIndex](https://www.deeplearning.ai/short-courses/building-agentic-rag-with-llamaindex)
- [OpenAI Agent Evals](https://platform.openai.com/docs/guides/agent-evals)
