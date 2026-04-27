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

LLM 推理通常分成两个阶段：prefill 和 decode。Prefill 读取完整输入，把上下文处理成内部状态；decode 则一次生成一个新 token。用户体感中的“首 token 延迟”和“输出速度”，分别受这两个阶段影响。

如果输入很长，prefill 会变重。如果输出很长，decode 会变重。很多应用只盯总 token 数，但生产上更应该分别看输入长度、输出长度、并发量、batch 策略和缓存命中。

## KV Cache 是什么

Transformer 每一层 attention 都会为 token 产生 key 和 value。生成第 1000 个 token 时，模型需要参考前面 999 个 token。如果每次都重新计算前面所有 token 的 key/value，成本会非常高。KV cache 的作用是把历史 token 的 key/value 保存下来，新 token 只需要追加自己的部分。

它的收益很明显：避免重复计算。代价也很明显：占显存。上下文越长、batch 越大、层数越多，KV cache 越大。长上下文推理的瓶颈很多时候不是算力，而是显存容量和显存带宽。

## FlashAttention 改善了什么

Attention 需要处理 query、key、value 之间的大量矩阵运算。朴素实现会产生很大的中间 attention 矩阵，读写显存的成本很高。FlashAttention 这类优化的核心思想，是减少不必要的显存读写，把计算组织得更贴近硬件。

对应用开发者来说，不需要每次都手写 kernel，但要知道底层优化会影响模型服务策略。相同模型在不同推理引擎、不同 GPU、不同 batch 和不同上下文长度下，吞吐和延迟可能差很多。

## 工程含义

推理优化不是最后一步性能调参，而是产品设计的一部分。

如果产品是短问短答，重点是首 token 延迟、缓存和模型路由。如果产品是长文档分析，重点是上下文压缩、RAG 粒度、prefill 成本和长上下文稳定性。如果产品是 Agent，工具调用结果和历史状态必须被压缩，否则 KV cache 会被大量低价值文本占满。

## 可做实验

做一个简单压测表：同一模型分别跑 1k、8k、32k 输入，并设置 128、512、2048 输出上限。记录首 token 延迟、总耗时、tokens/s 和成本。再加入“摘要后输入”版本，比较质量与速度。

这个实验会让推理速度从抽象指标变成设计约束：上下文不是免费水箱，而是会占用显存和时间的运行时状态。

## 参考

- [Stanford CS336](https://cs336.stanford.edu/)
- [Hung-yi Lee Machine Learning 2026 Spring](https://speech.ee.ntu.edu.tw/~hylee/ml/2026-spring.php)
- [Karpathy build nanoGPT](https://github.com/karpathy/build-nanogpt)
- [Chip Huyen: AI Engineering](https://www.oreilly.com/library/view/ai-engineering/9781098166298/)

