---
title: "AI Developer Core：结构化输出、重试与错误恢复"
date: 2026-04-26
category: engineering
description: "围绕 JSON/schema 输出设计解析、校验、重试和降级路径。"
difficulty: intermediate
plainSummary: "结构化输出不是让模型“尽量返回 JSON”，而是为模型输出建立 schema、验证器、修复策略和失败分支。"
tags:
  - AI Developer Core
  - Structured Output
  - Reliability
  - JSON
lang: zh
draft: false
---

# 结构化输出解决什么问题

当 LLM 输出要进入代码、数据库、工作流或 UI 时，自然语言就不够了。系统需要字段、类型、枚举、数组、可空值和错误状态。结构化输出的目标不是“看起来像 JSON”，而是让模型输出能被程序安全消费。

最常见的失败不是模型完全不会写 JSON，而是边界条件下出现小偏差：多一段解释、少一个字段、枚举值拼错、数字变字符串、把无答案编成答案。这些问题人眼容易忽略，程序却会直接失败或悄悄写入脏数据。

## 先定义输出契约

先写 schema，再写 prompt。Schema 应该表达业务边界：

- 哪些字段必填。
- 哪些字段可以为空。
- 枚举值有哪些。
- 数组长度上限是多少。
- 文本字段最大长度是多少。
- 无法完成时如何表达。

如果 schema 里没有 `status` 或 `confidence` 之类的失败表达，模型就会倾向于把所有输入都包装成成功结果。

## 重试不是重复请求

重试应该带着错误信息。比如第一次输出缺少 `source_url`，第二次 prompt 应该明确说明“你刚才输出的 JSON 未通过校验，缺少字段 `source_url`，请只返回修复后的 JSON”。盲目重复同一个请求，只是在制造更多随机性。

重试也要有上限。超过上限后，系统应该进入降级路径：返回人工审核、保存失败样例、改用保守输出、或提示用户提供更多信息。

## 修复策略要分层

可以把恢复分成三层。

第一层是**解析前清理**：去掉 markdown fence、前后说明、不可见字符。

第二层是**确定性校验**：用 JSON parser 和 schema validator 判定字段、类型和枚举。

第三层是**模型修复**：只把错误信息和原输出交给模型，让它修正格式，不重新执行完整任务。

这样做的好处是，简单错误不浪费模型调用，复杂错误也有可记录的恢复路径。

## 实验目标

这篇实验要做的不是“让模型返回 JSON”，而是建立一条完整的结构化输出通道。最终产物应该包括：

- 一个 JSON schema。
- 一个确定性 validator。
- 一个 retry prompt。
- 一个失败样例集。
- 一份结构化输出通过率报告。

建议任务是“从 Markdown 文章中抽取发布元数据”。输入是真实文章，输出是可进入站点构建流程的对象。这个任务很好，因为 schema 错误会被构建暴露，业务边界也清楚。

## Schema 设计

一个可用 schema 至少要支持成功、需要复核、无法处理三种状态：

```json
{
  "status": "ok",
  "title": "AI Developer Core：结构化输出、重试与错误恢复",
  "category": "engineering",
  "difficulty": "intermediate",
  "tags": ["AI Developer Core", "Structured Output"],
  "summary": "一句可公开摘要",
  "risks": []
}
```

不要把所有字段都设计成自由文本。`category`、`difficulty`、`status` 应该是枚举。`tags` 要有数量上限。`summary` 要有长度上限。`risks` 允许为空数组，但不能省略。Schema 越明确，后续越容易区分模型错误和业务错误。

## Retry 设计

Retry prompt 不应该重新描述完整任务，而应该聚焦修复。例如：

```text
上一次输出未通过 JSON schema 校验。
错误：字段 difficulty 的值 "medium" 不在枚举 beginner/intermediate/advanced 中。
请只返回修复后的 JSON，不要解释。
```

如果修复仍失败，就停止进入人工复核。不要无限 retry。结构化输出系统最容易失控的地方，就是把格式修复变成新的生成任务，导致输出越来越偏。

## 失败点

要重点观察四类失败：

- **语法失败**：不是合法 JSON。
- **schema 失败**：字段、类型、枚举不合格。
- **业务失败**：JSON 合法，但摘要不忠实或标签不合适。
- **安全失败**：文章中的不可信指令影响了输出。

前两类可以自动处理，后两类需要 eval 或人工复核。把它们混在一起，会让系统看似通过率很高，实际质量不稳。

## 检查清单

- Schema 是否包含失败状态。
- Validator 是否独立于模型运行。
- Retry 是否最多 1-2 次。
- 修复 prompt 是否只修格式，不重新做任务。
- 每个失败样例是否保存原输出和错误信息。
- 最终进入业务流程的对象是否全部通过确定性校验。

## 可做实验

做一个文章元数据抽取器：输入 Markdown，输出 `{title, category, tags, difficulty, summary, risks}`。准备 20 篇真实文章和 5 篇故意破坏 frontmatter 的样例。统计一次成功率、修复后成功率和人工兜底数量。

报告不要只写成功率。还要列出最常见的失败字段、最容易误判的标签、是否存在“格式正确但内容不对”的样例。结构化输出的真正难点往往不在 JSON，而在合法对象是否代表了正确业务含义。

## 参考

- [OpenAI Prompting](https://platform.openai.com/docs/guides/prompting)
- [OpenAI evaluation flywheel cookbook](https://cookbook.openai.com/examples/evaluation/building_resilient_prompts_using_an_evaluation_flywheel)
- [Anthropic Prompt Engineering Overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
- [Eugene Yan: LLM Patterns](https://eugeneyan.com/writing/llm-patterns/)
