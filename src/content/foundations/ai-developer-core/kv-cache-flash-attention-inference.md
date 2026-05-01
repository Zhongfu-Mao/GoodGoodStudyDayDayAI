---
title: "AI Developer Core：KV Cache、FlashAttention 与推理速度"
date: 2026-04-26
category: foundations
description: "理解 LLM 推理中的 prefill、decode、KV cache 和 attention 优化。"
difficulty: intermediate
plainSummary: "LLM 推理速度不只取决于模型大小，还取决于 prefill、逐 token decode、KV cache、显存带宽和 attention kernel。"
tags:
  - "AI Developer Core"
lang: zh
draft: false
---

# 为什么推理看起来很慢

LLM 推理通常分为两个阶段：**Prefill（预填充）**和 **Decode（解码）**。Prefill 阶段读取并处理完整的输入，将上下文转换为内部状态；Decode 阶段则一次生成一个新 Token。用户体感上的“首 Token 延迟（TTFT）”和“输出速度（TPS）”，分别主要受这两个阶段的影响。

如果输入很长，Prefill 会变重；如果输出很长，Decode 会变重。在生产环境中，不应只关注总 Token 数，而应分别审视输入长度、输出长度、并发量、Batch 策略以及缓存命中率。

## KV Cache 是什么

Transformer 每一层 Attention 都会为 Token 产生 Key 和 Value。生成第 1000 个 Token 时，模型需要参考前面 999 个 Token。如果每次都重新计算前面所有 Token 的 Key/Value，计算成本将呈平方级增长。KV Cache 的作用是将历史 Token 的 Key/Value 保存下来，新 Token 生成时只需计算并追加自己的部分。

它的收益显而易见：避免了重复计算。但代价也很直接：占用显存。上下文越长、Batch 越大、层数越多，KV Cache 占用的显存就越多。长上下文推理的瓶颈往往不在算力，而在显存容量和显存带宽。

## FlashAttention 改善了什么

Attention 计算涉及 Query、Key、Value 之间的大量矩阵运算。朴素实现会产生巨大的中间 Attention 矩阵，导致显存读写开销极高。FlashAttention 类优化的核心思想是通过算子融合等手段减少不必要的显存读写，使计算过程更贴近硬件架构（如利用 SRAM）。

对于应用开发者来说，不需要手写 Kernel，但必须意识到：底层的优化直接影响模型服务的策略。相同的模型在不同的推理引擎、GPU、Batch 大小和上下文长度下，吞吐量和延迟可能会有显著差异。

## 工程含义

推理优化不应只是最后的性能调参，而应成为产品设计的一部分。

- **短问短答产品**：重点在于降低首 Token 延迟、利用缓存和优化模型路由。
- **长文档分析产品**：重点在于上下文压缩、RAG 粒度控制、降低 Prefill 成本以及长上下文的稳定性。
- **Agent 类产品**：必须压缩工具调用结果和历史状态，否则 KV Cache 会被大量低价值的冗余文本占满，导致响应变慢且成本激增。

## 实验建议

创建一个简单的压测对照表：
使用同一模型，分别设置 1k、8k、32k 的输入长度，并对应 128、512、2048 的输出上限。记录并对比：首 Token 延迟、总耗时、Tokens/s (TPS) 以及单次成本。尝试对比“原始输入”与“摘要后输入”的版本，权衡质量与速度。

这类实验能让推理速度从抽象指标转化为具体的设计约束：上下文并非免费的资源，它是会实时占用显存和时间的运行时状态。

## 工程判断：性能优化始于产品定义

在考虑推理优化时，不要直接问“哪个引擎最快”，而要先明确产品需求：
用户是否在等待首 Token？是否接受流式输出？是否必须一次性读取超长文档？是否有高并发需求？是否可以预计算或利用缓存？

这些问题的答案将导向完全不同的优化策略：
- **对话产品**：优先优化首 Token 延迟（TTFT）。
- **长文产品**：优先减轻 Prefill 阶段压力。
- **Agent 产品**：优先控制工具输出和历史上下文。
- **离线任务**：优先提高吞吐量（Throughput）并降低成本。

## 动手实践：拆解延迟

为每次 LLM 调用记录并分析以下四个阶段的耗时：

1. **输入准备**：RAG 检索、工具调用、上下文格式化。
2. **Prefill**：模型读取输入到输出首 Token 前。
3. **Decode**：首 Token 输出到生成结束。
4. **后处理**：JSON 修复、内容校验、数据库写入。

拆解后，你会发现优化方向变得清晰：有些是检索质量问题，有些是输出长度控制问题，只有一部分是需要通过更换模型或推理引擎来解决的。

## 延伸阅读

- [Token 与上下文窗口](../token-context-window/)：理解为什么长输入会影响 prefill 和成本。
- [Token、成本与模型选择](../../../academy/ai-basics-for-everyone/what-is-token-cost-model-choice/)：把性能和预算放在同一张图里。
- [Reliable LLM Call Skeleton](../../../engineering/ai-developer-core/reliable-llm-call-skeleton/)：把延迟、超时和错误恢复一起设计。

## 参考

- [Stanford CS336](https://cs336.stanford.edu/)
- [Hung-yi Lee Machine Learning 2026 Spring](https://speech.ee.ntu.edu.tw/~hylee/ml/2026-spring.php)
- [Karpathy build nanoGPT](https://github.com/karpathy/build-nanogpt)
- [Chip Huyen: AI Engineering](https://www.oreilly.com/library/view/ai-engineering/9781098166298/)
