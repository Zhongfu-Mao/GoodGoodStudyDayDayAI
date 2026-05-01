---
title: "AI Developer Core：一个可靠 LLM 调用的最小骨架"
date: 2026-04-26
category: engineering
description: "将单次 LLM 调用从基础的 Prompt 字符串，升级为具备可观测性、可重试性和可评测性的工程单元。"
difficulty: beginner
plainSummary: "一个可靠的 LLM 调用方案应至少涵盖：输入输出契约、超时与重试机制、日志追踪、成本记录以及基础评测指标。"
tags:
  - "AI Developer Core"
  - "LLM App"
  - "Observability"
lang: zh
draft: false
---

# 不要仅从一段 Prompt 开始

许多 LLM 应用的第一版往往只是“一段 Prompt + 一次 API 调用”。这种做法虽然能快速演示，但极难长期维护。一个真正具备可迭代能力的“最小骨架”，应当将 LLM 调用视为一个标准的工程单元：具备明确的输入/输出契约、运行参数配置、错误处理机制、日志追踪、成本记录以及评测用例。

我们的目标并非起步就搭建庞大的平台，而是为了避免将所有的系统行为隐匿于一串黑盒文本中。只要调用是可观测的，系统就具备了优化的基础；只要输出是可校验的，系统就具备了稳定性的保障；只要评测是可重复的，系统就具备了持续进步的动力。

## 可靠调用的最小结构

一个健壮的 LLM 调用单元应包含以下七个核心部分：

1. **任务名称（Task Name）**：明确本次调用解决的具体任务，如 `summarize_radar_item`。
2. **输入 Schema（Input Schema）**：定义输入字段、类型、必要性以及字符串长度限制。
3. **Prompt 模板（Prompt Template）**：使用稳定的模板，严禁将业务数据与核心指令混为一谈。
4. **模型配置（Model Config）**：指定模型版本、Temperature、Max Tokens 以及 Tool 设置。
5. **输出 Schema（Output Schema）**：期望的格式（如 JSON、Markdown、特定标签或自然语言）。
6. **校验机制（Validation）**：规定在解析失败、字段缺失、长度超限或引用缺失时的处理策略。
7. **追踪日志（Trace Log）**：记录输入/输出摘要、Token 消耗、延迟、错误详情及版本号。

这七项内容并不复杂，但它们能帮助你将“模型偶尔不稳定”这种模糊的体感，转化为“究竟是哪一层逻辑不稳定”的精准工程判断。

## 错误处理的分类设计

LLM 调用的失败绝非只有一种形式。网络异常、API 限流、请求超时、输出格式错误、内容质量不合格、无答案返回、工具调用失败、权限不足等，每一类的处理方式都截然不同。

网络错误可以通过重试（Retry）解决；格式错误可以引导模型修复或使用解析器（Parser）进行局部修正；无答案应显式返回特定状态，而非由模型编造；权限失败则应立即停止运行并提示人工介入。只有明确了错误类型，才能构建起可靠的自动化重试和告警体系。

## 日志追踪：不可或缺的工程基石

如果没有 Trace 日志，AI 应用在出错时将变得无法解释。最小化的 Trace 并不需要保存完整的隐私正文，但应包含：请求 Hash、数据长度、任务名、Prompt 版本、模型版本、Token 数、耗时、验证结果以及错误类型。针对敏感业务，还需额外设计脱敏策略。

最关键的一点是：确保每次输出都能精准回溯到当时的输入数据、Prompt 模板和模型配置。否则，你今天遇到的坏例（Bad Case），明天可能就再也无法复现。

## 实验目标

本实验旨在指导你将“调用一次模型”包装成一个高可靠的稳定函数。它不依赖复杂的框架，仅要求每次调用均可复现、可验证、可统计。完成后，你将获得三个核心产物：

- 一个通用的 `run_llm_task()` 包装函数。
- 一个典型的 `tasks/summarize_article.yml` 任务配置文件。
- 一个持续累积的 `traces/llm-calls.jsonl` 运行记录文件。

实验任务建议选择“站点文章摘要”：输入 Markdown 原文，输出标题、三句话核心摘要、推荐标签以及需要人工复核的风险点。该任务逻辑简单，但足以覆盖输入输出、校验、异常处理和日志记录的全流程。

## 核心骨架设计

避免将 Prompt 硬编码在业务逻辑中。建议将任务配置进行解耦：

```yaml
name: summarize_article
version: 1
model: gpt-5.4-mini
temperature: 0.2
max_output_tokens: 600
input_schema:
  path: string
  title: string
  body: string
output_schema:
  summary: string
  tags: string[]
  risks: string[]
  status: ok | needs_review | insufficient_input
```

包装函数仅负责四项核心职责：读取配置、组装消息、调用模型、校验输出。它不应感知“摘要文章”这一具体的业务细节。业务逻辑应保留在 Task Config 和 Schema 中，从而使该函数能轻松复用到翻译、抽取、分类、回溯等其他任务。

## 失败注入测试

可靠性来源于对失败的掌控。请主动准备以下五类测试样例：

1. **正常文章**：验证 Happy Path。
2. **空正文**：验证输入校验。
3. **超长正文**：验证截断或预压缩逻辑。
4. **Frontmatter 缺失标题**：验证元数据健壮性。
5. **Prompt 注入攻击**：在正文中包含“忽略以上规则”等指令，验证安全防御。

每种失败都应映射到明确的状态（如 `insufficient_input`）。实验的价值不在于“跑通”，而在于构建起对异常情况的确定性处理能力。

## 检查清单

- 是否为每次调用记录了任务名、版本号及模型信息？
- 输出是否必须通过 Schema 校验才能进入后续业务流程？
- 重试逻辑是否携带了具体的错误反馈，而非盲目重发原请求？
- Trace 日志能否精准定位到输入输出摘要、错误类型和耗时？
- 是否对“无答案”或“输入不足”设计了显式的状态返回？
- 是否在日志记录中采取了敏感数据的脱敏或长度限制？

## 可做实验

使用 `run_llm_task()` 包装函数处理站点文章摘要任务。首先编写 10 条典型的输入样例及期望输出，确保每次运行均生成一行 JSONL Trace。刻意制造字段缺失、输出过长、无答案三种失败场景，观察系统能否准确进行失败分类，而非抛出通用的程序异常。

实验完成后，请关注三组硬性指标：**首次通过率**、**重试后通过率**、**人工复核率**。即使起步数据规模很小，它们也将成为后续优化 Prompt、模型选型和 Schema 调整的重要回归依据。

## 相关基础阅读

- [结构化输出是什么](../../../academy/ai-basics-for-everyone/what-is-structured-output/)：明确输出契约的重要性。
- [Token、成本与模型选择](../../../academy/ai-basics-for-everyone/what-is-token-cost-model-choice/)：为每次调用建立成本意识。
- [Eval、Benchmark 与产品质量](../../../foundations/ai-developer-core/evals-benchmarks-product-quality/)：让 Wrapper 的成功率具备可回归性。

## 参考

- [OpenAI Prompting](https://platform.openai.com/docs/guides/prompting)
- [OpenAI Agent Evals](https://platform.openai.com/docs/guides/agent-evals)
- [Chip Huyen: AI Engineering](https://www.oreilly.com/library/view/ai-engineering/9781098166298/)
- [Full Stack LLM Bootcamp](https://fullstackdeeplearning.com/llm-bootcamp/)
