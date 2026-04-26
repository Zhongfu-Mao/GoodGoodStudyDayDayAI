---
title: "AI Developer Core：Transformer 与 Attention 的开发者解释"
date: 2026-04-26
category: foundations
description: "把 Transformer 和 attention 翻译成开发者能用来调试上下文、输出和结构化任务的心智模型。"
difficulty: beginner
plainSummary: "Attention 可以理解为每个 token 在生成时向上下文中其他 token 查询线索。理解它有助于解释长上下文、格式约束和示例提示为什么会影响输出。"
tags:
  - AI Developer Core
  - Transformer
  - Attention
  - LLM
lang: zh
draft: false
---

# Attention 解决的是什么问题

语言模型生成下一个 token 时，需要知道当前 token 应该参考上下文中的哪些位置。早期序列模型把信息压进一个连续状态里，长距离依赖容易丢。Transformer 的关键变化是：让每个位置都可以直接和其他位置建立联系。

从开发者视角看，attention 像一个动态查询过程。当前 token 会产生 query，上下文 token 会提供 key 和 value。query 与 key 的相似度决定“看哪里”，value 决定“拿什么信息回来”。这不是数据库检索，但这个类比足够帮助我们理解 prompt 为什么有效。

## 为什么示例能改变输出

Few-shot 示例不是魔法。它们在上下文里放入了输入、输出、格式、风格和边界条件。生成时，模型可以通过 attention 把当前任务与相似示例对齐，从而复制模式。示例越清晰、越接近目标分布，模型越容易复用正确结构。

这也解释了坏示例的破坏力。一个带歧义的 JSON、一个多余的解释段、一个和最终要求冲突的示范，都可能成为模型可见的模式。模型不是只读最后一句，它会利用整个上下文。

## 为什么结构比措辞重要

好的 prompt 往往有稳定结构：任务、输入、约束、输出格式、例子、检查标准。结构稳定以后，模型更容易把不同信息分配到不同角色上。长段自然语言说明如果混在一起，模型也许能读懂，但更难稳定复现。

这不是说 prompt 必须模板化到僵硬，而是要让上下文里的信息关系可见。标题、列表、XML 标签、JSON schema、分隔符，本质上都在帮助模型区分“这是数据”“这是规则”“这是例子”“这是目标输出”。

## 工程含义

Attention 告诉我们：上下文不是越多越好，而是越可寻址越好。RAG 片段需要标题和来源，工具结果需要字段名，历史消息需要压缩成状态，长文档需要目录和局部摘要。模型越容易定位信息，输出越稳定。

当模型漏掉要求时，不要只责怪推理能力。先检查要求在上下文里的位置、格式、冲突程度和重复方式。很多“模型没听话”，其实是上下文设计没有让关键约束足够清楚。

## 可做实验

设计同一个抽取任务，分别给模型三种输入：纯段落说明、分标题说明、带 JSON schema 的说明。记录字段缺失率和格式错误率。再加入一个冲突示例，观察模型是否被带偏。

这个实验能把 attention 从抽象概念变成工程直觉：模型不是只接受命令，它是在上下文中寻找可复用模式。

## 参考

- [Stanford CS224N](https://web.stanford.edu/class/cs224n/)
- [Stanford CS336](https://cs336.stanford.edu/)
- [Karpathy Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html)
- [Anthropic Prompt Engineering Interactive Tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial)

