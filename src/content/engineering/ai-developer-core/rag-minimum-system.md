---
title: "AI Developer Core：从零搭一个 RAG 最小系统"
date: 2026-04-26
category: engineering
description: "用最小闭环实现文档问答：切分、索引、检索、组装上下文、引用和评测。"
difficulty: intermediate
plainSummary: "RAG 最小系统不只是向量库，而是数据、检索、上下文组装、引用约束和评测集构成的闭环。"
tags:
  - AI Developer Core
  - RAG
  - Retrieval
  - LLM App
lang: zh
draft: false
---

# 最小 RAG 应该包含什么

一个 RAG demo 可以很快做出来：读文档、切 chunk、做 embedding、向量检索、把结果塞进 prompt。一个可维护的 RAG 最小系统，还需要引用、拒答、评测和可观察性。

目标不是追求复杂，而是让每次回答都能被追问：证据来自哪里？为什么检索到这些片段？如果答案错了，是文档缺失、检索失败、排序失败，还是生成阶段幻觉？

## 数据准备

先从小数据开始。比如选站点中的 20 篇文章，每篇保留标题、路径、日期、标签和正文。切分时不要只按固定字符数，还要保留标题层级和来源路径。一个 chunk 至少要知道：

- `doc_id`
- `title`
- `path`
- `heading`
- `text`
- `date`
- `tags`

这些 metadata 会在检索、过滤、引用和调试时发挥作用。

## 检索与组装

第一版可以用向量 top-k，但不要停在那里。检索结果进入模型前，需要组装成可读上下文：每个片段有编号、标题、来源和正文。Prompt 要要求模型只基于给定片段回答，并在无法回答时说无法从材料确认。

上下文组装比很多人想象得重要。把 8 个 chunk 无序拼接，和按主题、时间、来源组织，效果会不同。模型不是数据库，它需要清楚的证据布局。

## 最小评测集

准备三类问题：

1. **直接命中**：答案在单个片段里。
2. **综合判断**：需要跨两三篇文章。
3. **无答案**：材料中没有答案。

每类至少 10 个问题。评测时记录检索是否命中正确片段、回答是否引用正确来源、无答案时是否拒答。这样才能知道问题出在 retrieval 还是 generation。

## 失败处理

RAG 的失败输出也要标准化。例如返回：

```json
{
  "status": "insufficient_evidence",
  "answer": "",
  "citations": [],
  "missing": "材料中没有覆盖该问题的来源"
}
```

这比“抱歉我不知道”更适合进入产品逻辑。

## 实验目标

这篇实验的目标，是做一个可评测的小型 RAG，而不是一个“看起来能聊文档”的 demo。完成后应该留下这些产物：

- `documents.jsonl`：规范化后的文章数据。
- `chunks.jsonl`：带 metadata 的文本块。
- `retrieval_trace.jsonl`：每次检索和回答的记录。
- `eval_questions.jsonl`：固定评测集。
- 一份失败分析表。

先用小数据，反而更好。20 篇文章足够暴露切分、检索、引用和拒答问题。数据太大时，失败反而难定位。

## 项目骨架

可以把目录设计成这样：

```text
rag-lab/
  data/documents.jsonl
  data/chunks.jsonl
  eval/eval_questions.jsonl
  traces/retrieval_trace.jsonl
  src/prepare.ts
  src/retrieve.ts
  src/answer.ts
  src/evaluate.ts
```

`prepare` 只负责把 Markdown 变成结构化文档。`retrieve` 只负责返回候选 chunk。`answer` 只负责基于候选 chunk 生成回答。`evaluate` 只负责比较结果。不要一开始把所有逻辑塞进一个脚本，否则失败时不知道该改哪里。

## 检索实验

第一版可以只做向量检索，但至少要记录 top-k。第二版加入关键词检索或 metadata filter。第三版再考虑 reranker。每一版都用同一套评测集比较：

- 正确 chunk 是否出现在 top-3。
- 正确 chunk 是否出现在 top-8。
- 回答是否引用了正确来源。
- 无答案问题是否拒答。
- 回答是否引入材料外信息。

这些指标比“回答看起来不错”更有用。RAG 的质量要拆成检索质量和生成质量，不能只看最终回答。

## 失败点

常见失败有五类：

1. Chunk 太短，答案被切散。
2. Chunk 太长，检索命中但上下文噪声大。
3. Query 太短，语义检索抓不到关键限制。
4. top-k 太大，模型被低质量片段带偏。
5. prompt 没有要求引用，模型生成了无法追溯的答案。

每次失败都要归类。归类以后才知道该改 chunk、retrieval、rerank，还是 answer prompt。

## 验收标准

第一版不要追求完美，可以先设一个朴素标准：直接命中问题 top-3 召回率超过 80%；无答案问题拒答率超过 80%；所有非拒答回答至少包含一个引用。达到这个标准后，再扩大文档量和问题集。

## 可做实验

先用站点内容做一个本地 RAG，不接复杂框架也可以。重点是生成 `retrieval_trace.jsonl`：问题、top-k 片段、最终上下文长度、回答、引用、人工标签。之后每次改 chunk 或 prompt，都能比较。

最后把失败样例写回 `eval_questions.jsonl`。RAG 的评测集应该随着真实失败增长，而不是一次性写完就不动。

## 相关基础阅读

- [RAG 是什么](../../../academy/ai-basics-for-everyone/what-is-rag/)：给非工程读者的概念入口。
- [Embedding、向量相似度与 RAG](../../../foundations/ai-developer-core/embeddings-vector-rag/)：理解检索、排序和 grounding 的基础。
- [幻觉与 Grounding](../../../academy/ai-basics-for-everyone/what-is-hallucination-grounding/)：把引用、拒答和证据边界放进产品要求。

## 参考

- [Full Stack LLM Bootcamp](https://fullstackdeeplearning.com/llm-bootcamp/)
- [DeepLearning.AI: Building Agentic RAG with LlamaIndex](https://www.deeplearning.ai/short-courses/building-agentic-rag-with-llamaindex)
- [Eugene Yan: LLM Patterns](https://eugeneyan.com/writing/llm-patterns/)
- [OpenAI Agent Evals](https://platform.openai.com/docs/guides/agent-evals)
