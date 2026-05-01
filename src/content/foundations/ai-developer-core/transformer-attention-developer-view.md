---
title: "AI Developer Core：Transformer 与 Attention 的开发者解释"
date: 2026-04-26
category: foundations
description: "把 Transformer 和 attention 翻译成开发者能用来调试上下文、输出和结构化任务的心智模型。"
difficulty: beginner
plainSummary: "Attention 可以理解为每个 token 在生成时向上下文中其他 token 查询线索。理解它有助于解释长上下文、格式约束和示例提示为什么会影响输出。"
tags:
  - "AI Developer Core"
  - "LLM"
lang: zh
draft: false
---

# Attention 解决的是什么问题

当语言模型生成下一个 Token 时，它需要明确当前位置应该参考上下文中的哪些信息。早期的序列模型（如 RNN/LSTM）试图将所有信息压缩进一个连续的状态向量中，这导致长距离依赖极易丢失。Transformer 的关键突破在于引入了 **Attention（注意力机制）**：它允许序列中的每一个位置都能直接与其他所有位置建立联系。

从开发者视角来看，Attention 就像是一个动态的查询过程。当前的 Token 发出 **Query（查询）**，上下文中的 Token 提供 **Key（键）** 和 **Value（值）**。Query 与 Key 的相似度决定了模型应该“看哪里”，而 Value 则决定了模型“拿回什么信息”。虽然这不完全等同于数据库检索，但这个类比足以帮助我们理解提示词（Prompt）为何有效。

## 为什么示例能改变输出

**少样本（Few-shot）**示例并非某种魔法。它们本质上是在上下文中植入了特定的输入、输出、格式、风格和边界条件。在生成过程中，模型通过 Attention 机制将当前任务与相似的示例进行对齐，从而复用其中的模式（Pattern）。示例越清晰、越接近目标分布，模型就越容易稳定地复现正确的结构。

这也解释了坏示例的破坏力。一个带歧义的 JSON、一个多余的解释段落，或者一个与最终要求冲突的示范，都会被 Attention 捕捉并成为模型可见的模式。模型并不只是在读最后一句指令，它会利用并权衡整个上下文。

## 为什么结构比措辞更重要

优秀的提示词通常具有稳定的结构：任务定义、输入数据、约束条件、输出格式、示例、检查标准。结构稳定后，模型更容易通过 Attention 将不同维度的信息分配到对应的角色上。如果只是堆砌长段的自然语言说明，模型虽然可能读懂，但很难实现稳定的复现。

这并不意味着提示词必须僵硬地模板化，而是要让上下文中的信息关系变得“显而易见”。标题、列表、XML 标签、JSON Schema 以及分隔符，本质上都是在帮助模型区分：哪些是数据，哪些是规则，哪些是参考范例，而哪些是目标输出。

## 工程含义

Attention 机制告诉我们：**上下文不是堆砌得越多越好，而是越“易于检索”越好。** 
- RAG 片段需要清晰的标题和来源标注。
- 工具调用结果需要明确的字段名。
- 历史消息需要压缩成结构化的状态。
- 长文档需要目录和局部摘要。

模型定位信息越容易，其输出就越稳定。当模型漏掉你的要求时，不要急着责怪模型的推理能力，先检查要求在上下文中的位置、格式是否清晰，是否存在逻辑冲突或过度重复。很多时候“模型不听话”，其实是上下文设计未能让关键约束具备足够的“注意力权重”。

## 实验建议

设计一个相同的信息抽取任务，分别尝试三种输入结构：
1. 纯自然语言段落说明。
2. 带有清晰标题和列表的说明。
3. 带有 JSON Schema 的结构化说明。

记录字段缺失率和格式错误率。随后，尝试加入一个冲突的错误示例，观察模型是否会被带偏。这个实验能将 Attention 从抽象概念转化为工程直觉：**模型并非简单地执行命令，它是在上下文中寻找可复用的最佳模式。**

## 工程判断：提升信息的“可寻址性”

开发者不需要背诵 Attention 公式，但需要将“可寻址性（Addressability）”作为上下文设计的核心原则。模型更擅长处理有标题、有字段、有来源、有逻辑顺序的信息；而难以处理散落在段落中的约束、混在正向示例中的反例，以及互相矛盾的自然语言指令。

在处理复杂任务时，建议将上下文拆分为清晰的区块：任务目标、输入资料、不可逾越的规则、参考示例、输出 Schema、自查清单。保持区块名称的一致性，减少内容的交叉干扰。这不是为了视觉美观，而是为了降低模型在生成时“看错位置”的概率。

## 动手实践：对比三种上下文结构

针对同一个信息抽取任务，准备三版提示词：
1. 一整段冗长的自然语言说明。
2. 使用 Markdown 标题和列表进行划分。
3. 使用 XML 或 JSON 风格定义明确的区块。

使用 20 个以上的真实样例进行测试，对比字段缺失率、格式错误率以及人工修复所需的时间。你会发现：结构清晰的提示词不一定更短，但通常更稳定，也更容易进行量化评估。

## 延伸阅读

- [Prompt 是什么](../../../academy/ai-basics-for-everyone/what-is-prompt/)：把 prompt 当作上下文组织方式来理解。
- [结构化输出是什么](../../../academy/ai-basics-for-everyone/what-is-structured-output/)：让输出 schema 也成为模型可见的模式。
- [Reliable LLM Call Skeleton](../../../engineering/ai-developer-core/reliable-llm-call-skeleton/)：把上下文结构和工程兜底连起来。

## 参考

- [Stanford CS224N](https://web.stanford.edu/class/cs224n/)
- [Stanford CS336](https://cs336.stanford.edu/)
- [Karpathy Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html)
- [Anthropic Prompt Engineering Interactive Tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial)
