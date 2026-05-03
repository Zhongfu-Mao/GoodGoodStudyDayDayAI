---
title: "AI Developer Core：Embedding、向量相似度与 RAG"
date: 2026-04-26
category: foundations
description: "深度解析 Embedding 如何构建可检索的语义空间，以及 RAG 架构在增强模型能力的同时所伴随的工程挑战。"
difficulty: beginner
plainSummary: "Embedding 将文本映射到向量空间，使语义相似度检索成为可能。RAG 的核心不在于向模型堆砌文档，而在于将最精准的证据引入上下文。"
tags:
  - "AI Developer Core"
  - "RAG"
lang: zh
draft: false
---

# 什么是 Embedding

Embedding（嵌入）是将文本、图片或其他对象映射到高维向量空间的函数。在该空间中，向量间的几何距离代表了对象间的语义相似度。即便两个句子字面词汇不尽相同，只要表达的是同一含义，它们的向量位置也会非常接近。

这一特性为 LLM 应用提供了实现“外部记忆”的基础。当用户提问时，我们可以先将问题转化为向量，从海量文档库中检索出最相似的知识片段，再将其作为辅助信息填入 Prompt 模板中，引导模型基于事实进行回答。

## RAG 并非“万能灵药”

RAG（检索增强生成）的核心价值在于赋予模型使用外部实时知识、企业私有文档及更新信息的能力。然而，它并不能自动确保答案的准确性。常见的 RAG 失败案例通常源于以下环节：

1.  **文档切分（Chunking）不当**：导致关键上下文信息被机械式切断，逻辑不完整。
2.  **检索召回率（Recall）不足**：核心证据未能从数据库中被成功提取。
3.  **重排序（Reranking）失效**：大量噪声信息排在了关键证据之前，干扰模型判断。
4.  **生成约束缺失**：模型未能严格遵循上下文，产生了脱离证据的“幻觉”。

因此，RAG 工程绝非简单的“连接一个向量数据库”，而是一套完整的系统工程：涵盖数据清洗、切分策略、Embedding 模型选型、索引构建、检索召回、重排序、上下文组装、引用标注、拒答逻辑及闭环评测。

## 向量相似度的局限性

**语义相似不等于任务相关**。例如，用户询问“退款政策是否适用于企业账号”时，纯向量检索可能会召回大量关于“退款政策”的通用片段，却恰恰漏掉了有关“企业账号例外”的关键条款。对于短查询、否定句、数字精确匹配、时间敏感信息、权限控制及法律条款，纯向量检索往往表现不佳。

为了应对这些局限，生产级别的 RAG 系统通常采用“混合检索”架构：结合关键词检索（如 BM25）、向量检索、元数据过滤（Metadata Filtering）、重排序模型（Reranker）以及确定性的业务规则。

## 工程视角的原则

RAG 的首要原则是：**答案必须可追溯（Traceability）**。缺乏来源标注的回答难以调试；没有评测基准的 RAG 难以优化。无论是调整切分块大小（Chunk Size）、切换 Embedding 模型、优化 Top-K 参数还是更新 Prompt，都应基于同一套问题集进行量化评估。

优秀的 RAG 系统不应追求“看起来博学多才”，而应追求“知之为知之，有据可查；不知为不知，严谨拒答”。

## 实验建议

利用本站现有的 20 篇 Radar 或 Academy 文章构建一个微型 RAG。设计 20 个测试问题，包含：10 个直接答案题、5 个跨文档综合题、5 个超出知识库范围的“陷阱题”。对比测试 Top-3、Top-8 及“关键词+向量”混合检索的效果，并量化记录“根基性”（Groundedness）指标。

## 工程判断：评测先行，组件后动

RAG 开发最容易陷入“反复折腾 Embedding、向量库和切分策略”的盲目循环。更稳健的做法是：先定义核心问题集与失败衡量标准，再针对性优化组件。否则，检索出的碎片看起来变多了，但产品最终的解决能力未必提升。

衡量 RAG 系统健康度的四个核心指标：正确证据是否被召回、关键证据是否排名靠前、回答是否忠实引用证据、面对无答案问题是否果断拒答。

## 动手实践：构建失败分类表

养成对每次 RAG 失败进行打标记录的习惯：

| 失败类型 | 典型现象 | 优先级修复点 |
| --- | --- | --- |
| **No-Recall** | 正确文档根本未被检索到 | 切分策略、Embedding 模型、混合检索 |
| **Low-Rank** | 证据确实被召回，但被掩埋在噪声中 | 引入 Rerank、优化元数据过滤 |
| **Synthesis-Error** | 证据已在上下文，但模型理解或回答有误 | Prompt 优化、强引用约束、输出校验 |
| **Over-Answer** | 面对知识盲区，模型依然在编造回答 | 强化拒答规则（Refusal Rule）、完善 Grounding 评测 |

这张分类表比模糊的“感觉回答不准”更有价值，因为它能将模糊的体验问题转化为具体的链路工程问题。

## 延伸阅读

- [RAG 是什么](../../../start/ai-basics-for-everyone/what-is-rag/)：面向非技术背景的通俗解释。
- [幻觉与 Grounding](../../../start/ai-basics-for-everyone/what-is-hallucination-grounding/)：深入理解引用与拒答为何是 RAG 的核心竞争力。
- [RAG Minimum System](../../../engineering/ai-developer-core/rag-minimum-system/)：从最小化实现理解完整链路。

## 参考

- [Full Stack LLM Bootcamp](https://fullstackdeeplearning.com/llm-bootcamp/)
- [Eugene Yan: LLM Patterns](https://eugeneyan.com/writing/llm-patterns/)
- [DeepLearning.AI: Building Agentic RAG with LlamaIndex](https://www.deeplearning.ai/short-courses/building-agentic-rag-with-llamaindex)
- [OpenAI Agent Evals](https://platform.openai.com/docs/guides/agent-evals)
