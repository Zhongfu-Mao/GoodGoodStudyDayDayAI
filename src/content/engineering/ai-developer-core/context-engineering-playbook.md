---
title: "AI Developer Core：Context Engineering 实战清单"
date: 2026-04-26
category: engineering
description: "将上下文工程拆解为选择、压缩、组织、缓存、隔离和评测六个核心动作。"
difficulty: intermediate
plainSummary: "Context Engineering 的核心不在于编写更长的 Prompt，而在于设计模型在每一步执行中应当“看到”什么、以何种结构呈现，以及何时丢弃或压缩信息。"
tags:
  - AI Developer Core
  - Context Engineering
  - Prompting
  - Agent
lang: zh
draft: false
---

# Context Engineering 是什么

**Prompt Engineering** 关注的是如何精准表达任务；而 **Context Engineering** 关注的是模型在执行任务时应当接触到哪些信息。对于 RAG、Agent、代码助手以及长文档处理任务，决定产出质量的关键往往不是某一句提示词，而是上下文的选择、组织与动态更新策略。

即使是再强大的模型，如果你为其提供过时的状态、重复的材料、无关的日志、冲突的指令或缺乏来源的检索片段，它的表现依然会不稳定。

## 六个核心动作

1. **选择 (Selection)**：并非所有信息都应当进入窗口。仅保留当前决策所需的关键信息，将冗长的历史转化为**状态摘要**。
2. **压缩 (Compression)**：长文档、工具执行结果和对话历史都需要经过压缩。压缩应保留事实、决策、待办项、风险和来源，而非简单的自然语言摘要。
3. **组织 (Organization)**：对上下文进行分区，明确标记：目标、约束、输入、证据、工具结果、输出格式等。避免将不同角色或来源的信息混杂在一起。
4. **缓存 (Caching)**：对稳定的大段上下文、重复任务的 Prompt 版本和检索结果使用缓存。缓存不仅能大幅降低成本，还能减少推理结果的随机波动。
5. **隔离 (Isolation)**：外部文档、网页、邮件及工具结果中可能包含恶意或不可信的指令。必须将其标记为“数据”，严禁与系统指令混淆。
6. **评测 (Evaluation)**：上下文策略必须可量化、可比较。无论是调整 Top-K、改变摘要方式还是优化历史保留策略，都应通过同一组任务进行回归验证。

## Agent 场景下的上下文管理

Agent 的上下文会随任务推进而动态增长。每次工具调用都会产生新文本，每次失败都会增加冗余日志。若缺乏有效的状态管理，Agent 很快会被自身的执行历史所淹没。

更佳的实践是维护一个**结构化状态 (Structured State)**：

```json
{
  "goal": "修复文章 Frontmatter 元数据",
  "done": ["读取 Schema 配置文件", "发现 3 个缺失字段"],
  "next": "修复指定文件的 Frontmatter",
  "risks": ["严禁改动正文内容"],
  "evidence": ["src/content.config.ts"]
}
```

模型并不需要回溯完整的原始执行过程，它只需关注执行下一步决策所需的最新状态。

## 实验目标

本实验旨在对比两种典型的多步任务上下文策略：**全量历史策略**与**结构化状态策略**。目的并非证明某种策略绝对优越，而是培养一种直觉：何时应当保留原文，何时应当压缩为状态，以及何时应当触发重新检索。

实验产出应包括：

- 两个 Prompt/Context 模板。
- 一个结构化 **State Schema**。
- 一组多步任务测试样例。
- Token 消耗、失败率及人工干预次数的对比分析。

## Context Packet (上下文包)

建议将每一步输入模型的内容封装为一个 **Context Packet**：

```yaml
goal: 从 10 篇文章中提取可扩展的选题
constraints:
  - 不得修改原文
  - 仅输出可公开的选题建议
state:
  done:
    - 已读取完整的文章列表
  open_questions:
    - 哪些技术主题适合转化为工程实验
evidence:
  - title: AI Radar Daily 2026-04-20
    path: src/content/radar/daily-ai-radar-2026-04-20.md
    note: 包含 LLM 优化栈相关内容
output_contract:
  format: markdown_table
```

Context Packet 的设计重点在于实现上下文角色的**彻底解耦**。模型看到的是清晰的目标、约束、状态、证据和输出契约，而非一团乱麻的聊天记录。

## 对照组设计

- **对照组 A (全量历史)**：每一步都将之前所有的消息和工具执行结果完整放回窗口。
- **对照组 B (结构化状态)**：每一步仅保留结构化状态、必要证据以及最近一次的工具执行结果。

针对同一任务运行 5 次，记录 Token 消耗、输出是否重复、约束是否被遗忘以及是否需要人工纠偏。即便是小样本测试也能显现趋势：全量历史策略设计成本低，但消耗大且易积累噪声；结构化状态策略虽然前期设计投入多，但具备更佳的可回放性和可评测性。

## 核心失败点诊断

Context Engineering 的失败往往不是因为模型“不够聪明”，而是因为 Context Packet 中缺失了关键角色：

- **缺失目标**：模型仅是在盲目“续写”。
- **缺失约束**：模型会产生过度幻觉或越权行为。
- **缺失证据**：模型被迫凭借训练记忆进行回答。
- **缺失状态**：模型会陷入重复执行已完成任务的死循环。
- **缺失输出契约**：导致产出结果无法顺利进入后续流水线。

每次系统失效时，优先回到这五项进行排查，通常比盲目增加 Prompt 描述更有效。

## 检查清单

- [ ] 当前步骤是否真正需要原文，还是仅需摘要后的状态？
- [ ] 工具执行结果是否已明确标记为“不可信数据”？
- [ ] 是否具备清晰的 `done` / `next` / `risks` 结构？
- [ ] 是否能够凭当前的 State 重新回放并复现当前步骤？
- [ ] 是否记录了上下文压缩前后的 Token 差异？
- [ ] 是否建立了用于比较上下文策略变更的 Eval 机制？

## 实验建议

挑选一个典型的多步任务（如“从 10 篇文章中提取选题并生成摘要”）。分别实现“全量历史”和“结构化状态”两个版本，对比它们的 Token 消耗、任务成功率及结果一致性。

实验结束后，将结构化状态保存为 `context_state.json`，将每轮的上下文包保存为 `context_packet.md`。这两个文件将成为后续构建 Agent Harness 的重要起点。

## 相关基础阅读

- [Context Engineering 是什么](../../../academy/ai-basics-for-everyone/what-is-context-engineering/)：上下文设计的通俗入门。
- [Token 与上下文窗口](../../../foundations/ai-developer-core/token-context-window/)：联系上下文设计与成本、延迟。
- [Transformer 与 Attention 的开发者视角](../../../foundations/ai-developer-core/transformer-attention-developer-view/)：理解为什么结构化上下文更易被模型利用。

## 参考资料

- [Anthropic Engineering](https://www.anthropic.com/engineering)
- [Anthropic Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Hung-yi Lee Machine Learning 2026 Spring](https://speech.ee.ntu.edu.tw/~hylee/ml/2026-spring.php)
- [Google Agent Development Kit](https://adk.dev/)
