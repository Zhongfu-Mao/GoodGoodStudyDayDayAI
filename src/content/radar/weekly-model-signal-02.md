---
title: "每周模型动态：RAG 搜索与 Agent 编排"
date: 2026-04-08
category: radar
cadence: weekly
description: "本周重点：RAG 检索质量的新基准、Agent 工具调用链路的可观测性进展。"
difficulty: beginner
plainSummary: "本周两个信号值得追踪：RAG 检索准确率有了新的评估基准，Agent 的工具调用开始有了标准化的追踪和调试工具。"
tags:
  - Agent
  - RAG
lang: zh
coverImage: /images/radar/weekly-model-signal-02-infographic.png
draft: false
---

## 本周重点

### RAG 检索质量：新基准出现

本周多个团队发布了 RAG 检索质量的新评估基准，主要关注三个维度：

| 维度 | 衡量内容 | 常见指标 |
| --- | --- | --- |
| 检索相关性 | 找到的文档是否与问题相关 | Recall@K、MRR |
| 答案忠实度 | 生成的回答是否忠实于检索到的文档 | Faithfulness Score |
| 引用准确性 | 引用是否指向了正确的源文档和段落 | Citation Precision |

关键发现：

- 简单的 embedding 相似度搜索在长文档上的召回率下降明显。Chunk 策略（如何把文档切分成片段）对检索质量的影响比模型选择更大。
- 多跳问题（需要综合多段信息的问题）仍然是 RAG 系统的弱项。
- 把检索阶段从 dense retrieval 升级为 hybrid retrieval（向量 + 关键词）能平均提升 15-20% 的相关性。

### Agent 工具调用链路：可观测性

Agent 在执行复杂任务时会连续调用多个工具。本周的进展集中在"如何追踪和调试这些调用"：

- **调用链路追踪**：类似微服务架构中的 distributed tracing，给每次工具调用分配 trace ID，串联完整的执行过程。
- **成本归因**：每个工具调用的 token 消耗和延迟单独记录，方便发现瓶颈。
- **失败回放**：保存失败场景的完整上下文，可以在本地重放调试。

## 本周判断

RAG 领域正在从"能检索"走向"检索得准"。如果你正在搭建 RAG 系统，优先投入 chunk 策略和 hybrid retrieval，而不是只换更大的 embedding 模型。

Agent 领域的可观测性建设还在早期，但方向清晰。如果你在做 Agent 相关的开发，从第一天起就加上调用日志。

## 延伸阅读

- [RAG Minimum System](../../engineering/ai-developer-core/rag-minimum-system/)
- [Embeddings、向量与 RAG](../../foundations/ai-developer-core/embeddings-vector-rag/)
- [Agent Harness：日志、审批与回放](../../engineering/ai-developer-core/agent-harness-logging-approval-replay/)
