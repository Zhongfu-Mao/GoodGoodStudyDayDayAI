---
title: "AI Developer Core：从零搭建一个 RAG 最小系统"
date: 2026-04-26
category: engineering
description: "通过构建一个完整的闭环，实现高效的文档问答：涵盖切分、索引、检索、上下文组装、引用及评测。"
difficulty: intermediate
plainSummary: "RAG 最小系统远不止是一个向量数据库，它是由数据处理、检索逻辑、上下文组装、引用约束以及评测体系共同构成的工程闭环。"
coverImage: "/images/engineering/ai-developer-core/rag-minimum-system-cover.svg"
tags:
  - AI Developer Core
  - RAG
  - Retrieval
  - LLM App
lang: zh
draft: false
---

# 最小 RAG 系统应该包含什么

构建一个 RAG（检索增强生成）的演示程序很快：读取文档、切分 Chunk、生成 Embedding、进行向量检索，最后将结果塞进 Prompt。然而，一个真正可维护的 RAG 最小系统，还需要具备引用、拒答（无答案处理）、评测和可观察性。

我们的目标不是追求系统的复杂性，而是确保每一次回答都是可溯源、可追问的：证据来自哪里？为什么要检索这些片段？如果答案错误，究竟是由于文档缺失、检索失败、重排序（Rerank）不力，还是生成阶段产生了幻觉（Hallucination）？

## 数据准备

建议从小规模数据开始。例如选取站点中的 20 篇文章，每篇提取标题、路径、日期、标签和正文。在切分 Chunk 时，不要仅仅按照固定字符数暴力切割，而应尽量保留标题层级和来源路径信息。每个 Chunk 至少应包含以下元数据：

- `doc_id`
- `title`
- `path`
- `heading`
- `text`
- `date`
- `tags`

这些元数据将在后续的检索、过滤、引用生成以及系统调试中发挥至关重要的作用。

## 检索与组装

在第一阶段，可以使用基础的向量 Top-k 检索，但设计不应止步于此。在检索结果传递给模型之前，需要将其组装为结构化的“可读上下文”：每个片段应带有明确的编号、标题、来源和正文内容。同时，在 Prompt 中应严格要求模型仅基于给定的片段进行回答，并在无法获取确切证据时明确告知用户“无法根据现有材料确认”。

上下文组装（Context Construction）往往比人们预想的更重要。将 8 个无序的 Chunk 简单拼接，与按照主题、时间、来源有逻辑地组织，最终的生成效果会有显著差异。模型并非传统意义上的数据库，它需要清晰且有结构的证据布局。

## 最小评测集

为了验证系统有效性，需准备三类典型问题：

1. **直接命中**：答案明确存在于单个片段中。
2. **综合判断**：答案需要跨两三篇文章进行整合。
3. **无答案处理**：提出的问题在现有材料中完全没有答案。

每类问题至少准备 10 个用例。评测时需重点记录：检索是否命中了正确的片段、回答是否引用了正确的来源、在无答案时是否成功拒答。通过这些指标，你可以明确问题的根源究竟是在检索（Retrieval）端还是生成（Generation）端。

## 失败处理

RAG 的失败输出也应遵循标准化格式。例如返回如下结构：

```json
{
  "status": "insufficient_evidence",
  "answer": "",
  "citations": [],
  "missing": "现有材料未能覆盖该问题的答案来源"
}
```

这种处理方式比简单的“抱歉，我不知道”更便于集成到复杂的产品业务逻辑中。

## 实验目标

本实验旨在指导你构建一个**可量化评测**的小型 RAG 系统，而非一个仅能“看起来能聊文档”的 Demo。完成后，你应保留以下核心产物：

- `documents.jsonl`：规范化处理后的文章数据。
- `chunks.jsonl`：带有丰富元数据的文本块。
- `retrieval_trace.jsonl`：每次检索与回答的完整链路记录。
- `eval_questions.jsonl`：固定的基准评测集。
- 一份详细的失败案例分析表。

从小规模数据起步反而更有利于发现问题。20 篇文章足以暴露切分策略、检索准确度、引用质量以及拒答逻辑中的典型缺陷。当数据量过大时，定位这些底层失败点往往会变得非常困难。

## 项目结构

推荐采用如下的目录结构以保持逻辑清晰：

```text
rag-lab/
  data/documents.jsonl
  data/chunks.jsonl
  eval/eval_questions.jsonl
  traces/retrieval_trace.jsonl
  src/prepare.ts    # 负责 Markdown 转结构化文档
  src/retrieve.ts   # 负责返回候选 Chunk
  src/answer.ts     # 负责基于候选 Chunk 生成回答
  src/evaluate.ts   # 负责对比与评测结果
```

将逻辑解耦可以避免在一个庞大的脚本中迷失方向，确保在系统出现问题时能够快速定位故障模块。

## 检索实验

第一版建议专注向量检索，并完整记录 Top-k 结果。第二版可尝试引入关键词检索或元数据过滤（Metadata Filtering）。第三版再考虑加入重排序器（Reranker）。每一版更新都应使用同一套评测集进行对比，核心指标包括：

- 正确的 Chunk 是否出现在 Top-3 中？
- 正确的 Chunk 是否出现在 Top-8 中？
- 最终回答是否准确引用了来源？
- 面对无答案问题时是否能正确拒答？
- 回答中是否夹杂了材料之外的“幻觉”信息？

这些硬性指标比感性的“回答还不错”要有意义得多。RAG 的质量必须拆解为检索质量和生成质量分别评估。

## 常见失败点分析

在实验过程中，请重点关注以下五类典型失败：

1. **Chunk 过短**：导致完整答案被切散，信息不完整。
2. **Chunk 过长**：虽然命中检索，但引入了大量无关背景噪声。
3. **Query 过短**：语义表达不充分，检索无法抓取关键限制条件。
4. **Top-k 过大**：模型被过多的低质量片段误导。
5. **Prompt 缺乏约束**：模型生成了无法追溯到证据源的答案。

通过对失败进行归类，你将能准确判断该调整的是切分策略、检索逻辑、重排序算法，还是 Prompt 提示词。

## 验收标准

初版系统不追求完美，建议设定如下基础标准：直接命中问题的 Top-3 召回率超过 80%；无答案问题的正确拒答率超过 80%；所有有效回答至少包含一个准确的引用。在达到这些指标后，再考虑扩大文档规模和问题集。

## 可做实验

利用本站点的 Markdown 内容搭建一个本地 RAG 环境，重点在于生成 `retrieval_trace.jsonl`：记录问题、Top-k 片段、最终上下文长度、模型回答、引用列表及人工标注。此后的每次优化，都能通过这一记录进行回归对比。

最后，将具有代表性的失败样例写回 `eval_questions.jsonl`。一个优秀的 RAG 评测集应该随着对真实失败案例的理解而不断演进，而非一成不变。

## 相关基础阅读

- [RAG 是什么](../../../start/ai-basics-for-everyone/what-is-rag/)：面向非工程读者的概念科普。
- [Embedding、向量相似度与 RAG](../../../foundations/ai-developer-core/embeddings-vector-rag/)：理解检索、排序与 Grounding 的底层基础。
- [幻觉与 Grounding](../../../start/ai-basics-for-everyone/what-is-hallucination-grounding/)：将引用、拒答和证据边界转化为产品级要求。

## 参考

- [Full Stack LLM Bootcamp](https://fullstackdeeplearning.com/llm-bootcamp/)
- [DeepLearning.AI: Building Agentic RAG with LlamaIndex](https://www.deeplearning.ai/short-courses/building-agentic-rag-with-llamaindex)
- [Eugene Yan: LLM Patterns](https://eugeneyan.com/writing/llm-patterns/)
- [OpenAI Agent Evals](https://platform.openai.com/docs/guides/agent-evals)
