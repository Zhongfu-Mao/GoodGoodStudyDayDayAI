---
title: "AI Developer Core：结构化输出、重试与错误恢复"
date: 2026-04-26
category: engineering
description: "围绕 JSON/Schema 输出设计严谨的解析、校验、重试及降级路径。"
difficulty: intermediate
plainSummary: "结构化输出绝非仅仅让模型“尽量返回 JSON”，而是要为模型输出建立起完整的 Schema、校验器、修复策略和失败处理分支。"
coverImage: "/images/engineering/ai-developer-core/structured-output-cover.svg"
tags:
  - "AI Developer Core"
  - "Structured Output"
  - "Reliability"
lang: zh
draft: false
---

# 结构化输出解决什么问题

当 LLM 的输出需要被集成到下游代码、数据库、自动化工作流或 UI 展现时，自然语言的模糊性就成了障碍。系统需要的是确定的字段、准确的类型、严谨的枚举值、清晰的数组以及可预测的错误状态。结构化输出的目标不仅仅是“看起来像 JSON”，其核心价值在于确保模型产生的输出能够被程序安全、稳定地消费。

最常见的工程失败并非模型完全无法生成 JSON，而是在边界条件下产生的细微偏差：例如多出了一段解释性文字、少了一个核心字段、枚举值拼写错误、数字被误存为字符串，或者在无答案时编造了看似合理的占位符。这些细微之处人眼虽然容易宽容处理，但程序往往会因此崩溃，或者更糟地——悄悄将脏数据写入系统。

## 先定义输出契约（Contract）

**先写 Schema，再写 Prompt**。Schema 应当清晰地表达业务边界：

- 哪些字段是必填的（Required）？
- 哪些字段允许为空（Nullable）？
- 预定义的枚举值（Enums）有哪些？
- 数组的最大长度上限是多少？
- 文本字段的最大字符限制是多少？
- 当任务无法完成或证据不足时，应该如何显式表达？

如果你的 Schema 中缺乏 `status`（状态）或 `confidence`（置信度）之类的失败表达方式，模型在压力下往往会倾向于将任何不确定的输入都强行包装成一个看起来“成功”的结果。

## 重试（Retry）不应是简单的重复

有效的重试机制必须携带具体的错误反馈。例如，如果模型第一次输出的 JSON 缺少了 `source_url` 字段，第二次重试的 Prompt 应当明确指出：“你刚才输出的 JSON 未能通过校验，原因在于缺少必填字段 `source_url`。请仅返回修复后的 JSON 内容，无需提供任何额外解释。” 盲目地重复同一个请求，本质上只是在依赖随机性碰运气。

同时，重试必须设有合理的上限。一旦超过重试次数，系统应立即转入预设的降级路径：例如标记为“待人工审核”、保存失败现场样例、切换到更为保守的默认输出，或者提示用户补充更多信息。

## 修复策略的分层设计

为了提高效率，可以将恢复过程分为三个层级：

1. **解析前预清理（Pre-processing）**：自动移除 Markdown 的代码块标记（Code Fences）、前后的废话说明以及不可见字符。
2. **确定性校验（Deterministic Validation）**：使用标准的 JSON 解析器和 Schema 验证器来判定字段完整性、类型准确性及枚举合法性。
3. **模型辅助修复（Model-aided Repair）**：仅将具体的报错信息和原始错误输出反馈给模型，让其专门针对格式进行修正，而无需重新执行整个复杂的生成任务。

这种分层设计的好处在于：简单的格式错误不会浪费昂贵的完整模型调用，而复杂的逻辑错误则拥有可追溯、可记录的恢复路径。

## 实验目标

本实验的目标并非仅仅是“让模型返回 JSON”，而是建立一条端到端、具备韧性的结构化输出通道。完成后，你应该获得以下核心产物：

- 一份完善的 JSON Schema 定义。
- 一个独立的、确定性的校验器（Validator）。
- 一套专门用于格式修复的 Retry Prompt。
- 一个包含各类典型异常的失败样例集。
- 一份关于结构化输出的一次通过率及修复成功率报告。

推荐任务：**“从 Markdown 文章中抽取发布元数据”**。输入真实文章，输出能够直接驱动站点构建流程的结构化对象。由于 Schema 错误会直接在构建阶段暴露，这能迫使你设计出更严谨的业务边界。

## Schema 设计要点

一个健壮的 Schema 至少需要支持“成功”、“需要复核”和“无法处理”三种核心状态：

```json
{
  "status": "ok | needs_review | error",
  "title": "AI Developer Core：结构化输出、重试与错误恢复",
  "category": "engineering",
  "difficulty": "intermediate",
  "tags": ["AI Developer Core", "Structured Output"],
  "summary": "一句简明扼要的文章摘要",
  "risks": []
}
```

切记不要将所有字段都设计为自由文本。`category`、`difficulty`、`status` 应尽可能使用枚举；`tags` 数量应设上限；`summary` 长度应设上限；`risks` 虽允许为空，但在数据结构上不应被省略。Schema 越是严格，后续就越容易区分哪些是模型生成的格式错误，哪些是真实的业务判断错误。

## 修复逻辑（Retry）设计

修复阶段的 Prompt 应当保持极度专注。例如：

```text
上一次输出未能通过 JSON Schema 校验。
错误详情：字段 difficulty 的值 "medium" 不在预定义的枚举 [beginner, intermediate, advanced] 中。
请仅提供修复后的 JSON 对象，禁止返回任何解释性文本。
```

如果修复尝试依然失败，应立即中止并转入人工介入流程。避免无限循环的重试。在结构化输出系统中，最容易失控的环节就是将简单的格式修复演变为一轮新的发散性生成，导致输出内容与原意渐行渐远。

## 关键失败点观察

在实验中请重点记录并观察以下四类失败：

- **语法失败**：输出内容完全不符合 JSON 语法规范。
- **Schema 失败**：JSON 语法正确，但字段、类型或枚举值不合规。
- **业务逻辑失败**：JSON 完全合规，但抽取的内容不真实、摘要不准确或标签不恰当。
- **指令污染失败**：输入文章中的恶意指令（如 Prompt Injection）干扰了正常的输出格式。

前两类可以通过工程手段自动拦截和修复，而后两类则高度依赖于 Eval 或人工复核。将它们混为一谈，会导致系统在“表面通过率”很高的情况下，实际交付质量却参差不齐。

## 检查清单

- Schema 是否包含了显式的失败状态表达？
- 校验器是否完全独立于模型逻辑运行？
- 重试次数是否被严格限制在 1-2 次以内？
- 修复 Prompt 是否仅聚焦于格式修正，而非重新执行业务逻辑？
- 每一个失败样例是否都完整保存了原始输出和当时的报错信息？
- 最终注入业务流程的所有对象是否都通过了 100% 的确定性校验？

## 可做实验

设计一个文章元数据抽取器，输入 Markdown，输出结构化对象。准备 20 篇正式文章和 5 篇刻意破坏了 Frontmatter 结构的异常文章。统计：**一次成功率**、**修复后成功率**以及**触发人工兜底的数量**。

实验报告不应仅停留在数字百分比上，而应深入分析：哪些字段最容易出错？标签生成的幻觉率是多少？是否存在“格式 100% 正确但业务语义完全错误”的案例？结构化输出的终极挑战往往不在于 JSON 格式本身，而在于合法的 JSON 对象是否准确代表了预期的业务含义。

## 相关基础阅读

- [结构化输出是什么](../../../start/ai-basics-for-everyone/what-is-structured-output/)：从非工程视角理解 Schema 和机器可读输出的必要性。
- [Transformer 与 Attention 的开发者视角](../../../foundations/ai-developer-core/transformer-attention-developer-view/)：理解 Few-shot 示例和格式约束如何影响模型的输出稳定性。
- [Eval、Benchmark 与产品质量](../../../foundations/ai-developer-core/evals-benchmarks-product-quality/)：将通过率和失败分类纳入完整的评测体系。

## 参考

- [OpenAI Prompting](https://platform.openai.com/docs/guides/prompting)
- [OpenAI evaluation flywheel cookbook](https://cookbook.openai.com/examples/evaluation/building_resilient_prompts_using_an_evaluation_flywheel)
- [Anthropic Prompt Engineering Overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
- [Eugene Yan: LLM Patterns](https://eugeneyan.com/writing/llm-patterns/)
