---
title: "AI Developer Core：Context Engineering 实战清单"
date: 2026-04-26
category: engineering
description: "把上下文工程拆成选择、压缩、组织、缓存、隔离和评测六个动作。"
difficulty: intermediate
plainSummary: "Context Engineering 不是写更长 prompt，而是设计模型在每一步应该看到什么、以什么结构看到、什么时候丢弃或压缩。"
tags:
  - AI Developer Core
  - Context Engineering
  - Prompting
  - Agent
lang: zh
draft: false
---

# Context Engineering 是什么

Prompt engineering 关注怎样表达任务。Context engineering 关注模型在执行任务时应该看到什么。对于 RAG、Agent、代码助手和长文档任务，真正决定质量的往往不是一句提示词，而是上下文选择、组织和更新策略。

一个模型可以很强，但如果你给它过期状态、重复材料、无关日志、冲突指令和没有来源的检索片段，它仍然会不稳定。

## 六个动作

第一，**选择**。不是所有信息都该进窗口。只放当前决策需要的信息，旧历史要变成状态摘要。

第二，**压缩**。长文档、工具结果、历史对话都需要压缩。压缩时保留事实、决策、待办、风险和来源，不要只写自然语言摘要。

第三，**组织**。把上下文分区：目标、约束、输入、证据、工具结果、输出格式。不同角色的信息不要混在同一段里。

第四，**缓存**。稳定的大段上下文可以缓存，重复任务可以复用 prompt 版本和检索结果。缓存不仅省钱，也减少随机变化。

第五，**隔离**。外部文档、网页、邮件和工具结果都可能含有不可信指令。把它们标记为数据，而不是系统指令。

第六，**评测**。上下文策略必须可比较。改 top-k、改摘要方式、改历史保留策略，都要有同一组任务来回归。

## Agent 场景里的上下文

Agent 的上下文会动态增长。每次工具调用都会产生新文本，每次失败都会增加日志。如果不做状态管理，Agent 很快会被自己的历史淹没。

更好的做法是维护一个结构化 state：

```json
{
  "goal": "完成文章元数据修复",
  "done": ["读取 schema", "发现 3 个缺失字段"],
  "next": "修复 frontmatter",
  "risks": ["不要改动正文"],
  "evidence": ["src/content.config.ts"]
}
```

模型不需要看到所有原始过程，只需要看到下一步决策所需的状态。

## 实验目标

这篇实验要比较两种多步任务上下文策略：全量历史策略和结构化状态策略。目标不是证明某一种永远更好，而是训练一个判断：什么时候应该保留原文，什么时候应该压缩成状态，什么时候应该重新检索。

实验产物包括：

- 两个 prompt/context 模板。
- 一个结构化 state schema。
- 一组多步任务样例。
- token、失败率和人工修正次数对比。

## Context Packet

可以把每一步喂给模型的内容整理成一个 context packet：

```yaml
goal: 从 10 篇文章中提取可扩展选题
constraints:
  - 不修改原文
  - 只输出可公开选题
state:
  done:
    - 已读取文章列表
  open_questions:
    - 哪些主题可以转成工程实验
evidence:
  - title: AI Radar Daily 2026-04-20
    path: src/content/radar/daily-ai-radar-2026-04-20.md
    note: 包含 LLM 优化栈
output_contract:
  format: markdown_table
```

这个 packet 的重点是把上下文角色分开。模型看到的是目标、约束、状态、证据和输出契约，而不是一长串聊天历史。

## 对照组设计

对照组 A：每一步把之前所有消息和所有工具结果都放回窗口。  
对照组 B：每一步只保留结构化 state、必要证据和最近一次工具结果。

同一个任务跑 5 次，记录输入 token、输出是否重复、是否漏掉约束、是否需要人工纠偏。小样本也能看出趋势：全量历史通常更省设计，但更贵、更容易积累噪声；结构化 state 需要设计成本，但更容易回放和评测。

## 失败点

Context engineering 的失败通常不是模型“不聪明”，而是上下文包里缺了角色：

- 没有目标，模型只是在续写。
- 没有约束，模型会过度发挥。
- 没有证据，模型会凭记忆回答。
- 没有状态，模型会重复做已完成的事。
- 没有输出契约，结果难以进入下一步。

每次失败都回到这五项检查，比盲目加 prompt 更有效。

## 检查清单

- 当前步骤需要原文，还是只需要摘要状态？
- 工具结果是否被标记为不可信数据？
- 是否有明确的 done / next / risks？
- 是否能用同一份 state 回放当前步骤？
- 是否记录了压缩前后的 token 差异？
- 是否有 eval 来比较上下文策略变化？

## 可做实验

挑一个多步任务，例如“从 10 篇文章中提取选题并生成摘要”。做两版：一版把所有历史都放进对话，另一版每步更新结构化 state。比较 token、失败率和结果一致性。

实验结束后，把结构化 state 保存成 `context_state.json`，把每轮上下文保存成 `context_packet.md`。这两个文件会成为后续 Agent harness 的起点。

## 相关基础阅读

- [Context Engineering 是什么](../../../academy/ai-basics-for-everyone/what-is-context-engineering/)：用更轻的入口理解上下文设计。
- [Token 与上下文窗口](../../../foundations/ai-developer-core/token-context-window/)：把上下文设计和成本、延迟连起来。
- [Transformer 与 Attention 的开发者解释](../../../foundations/ai-developer-core/transformer-attention-developer-view/)：理解为什么结构化上下文更容易被模型使用。

## 参考

- [Anthropic Engineering](https://www.anthropic.com/engineering)
- [Anthropic Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Hung-yi Lee Machine Learning 2026 Spring](https://speech.ee.ntu.edu.tw/~hylee/ml/2026-spring.php)
- [Google Agent Development Kit](https://adk.dev/)
