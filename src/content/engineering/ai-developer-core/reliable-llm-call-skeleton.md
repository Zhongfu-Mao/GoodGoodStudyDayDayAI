---
title: "AI Developer Core：一个可靠 LLM 调用的最小骨架"
date: 2026-04-26
category: engineering
description: "把一次 LLM 调用从 prompt 字符串升级成可观测、可重试、可评测的工程单元。"
difficulty: beginner
plainSummary: "可靠的 LLM 调用至少要包含输入契约、输出契约、超时、重试、日志、成本记录和最小评测。"
tags:
  - "AI Developer Core"
  - "LLM App"
  - "Observability"
lang: zh
draft: false
---

# 不要从一段 Prompt 开始

很多 LLM 应用的第一版是一段 prompt 加一次 API 调用。这样能演示，但很难维护。真正可迭代的最小骨架，应该把 LLM 调用视为一个工程单元：有输入契约、输出契约、运行参数、错误处理、日志、成本记录和评测样例。

目标不是一开始就搭平台，而是避免把所有行为藏在一串文本里。只要调用可观察，系统就能改；只要输出可校验，系统就能稳定；只要评测可重复，系统就能进步。

## 最小结构

一个可靠调用至少包含七个部分。

1. **Task name**：这次调用解决什么任务，例如 `summarize_radar_item`。
2. **Input schema**：输入字段、类型、必要性和长度限制。
3. **Prompt template**：稳定模板，不把业务数据和指令混在一起。
4. **Model config**：模型、temperature、max output、tool 设置。
5. **Output schema**：期望 JSON、Markdown、标签或自然语言。
6. **Validation**：解析失败、字段缺失、长度超限、引用缺失时怎么办。
7. **Trace log**：输入摘要、输出摘要、token、延迟、错误、版本号。

这七项不复杂，但能把“模型偶尔不稳定”转成“哪一层在不稳定”。

## 错误处理要分类

LLM 调用失败不只有一种。网络错误、限流、超时、输出格式错误、内容不合格、无答案、工具失败、权限失败，处理方式都不同。

网络错误可以重试。格式错误可以要求模型修复或用 parser 做局部修正。无答案应该显式返回，不应该编答案。权限失败应该停止并提示人工处理。把错误类型写清楚，后续才能做可靠的重试和告警。

## 日志不是事后补丁

AI 应用如果没有 trace，就很难解释为什么错。最小 trace 不需要保存完整隐私内容，可以保存 hash、长度、任务名、prompt 版本、模型版本、token、耗时、验证结果和错误类型。对敏感业务，再额外设计脱敏策略。

最重要的是让每次输出能回到当时的输入、模板和模型配置。否则你今天看到的坏例子，明天就无法复现。

## 实验目标

这篇实验的目标，是把“调用一次模型”包装成一个稳定函数。它不追求复杂框架，只要求每次调用都能被复现、被验证、被统计。完成后，你应该得到三个产物：

- 一个 `run_llm_task()` 包装函数。
- 一个 `tasks/summarize_article.yml` 任务配置。
- 一个 `traces/llm-calls.jsonl` 运行记录。

实验任务可以选站点文章摘要：输入一篇 Markdown，输出标题、三句话摘要、适合的标签、需要人工复核的风险点。这个任务足够简单，但能覆盖输入、输出、校验、失败和日志。

## 代码骨架

先不要把 prompt 写死在业务代码里。可以把任务配置拆成这样：

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

包装函数只做四件事：读配置、组装消息、调用模型、校验输出。不要让它知道“摘要文章”这个业务细节。业务细节留在 task config 和 schema 里，这样以后可以复用到翻译、抽取、分类、复盘等任务。

## 失败注入

要主动制造失败，而不是等线上遇到失败。至少准备五类样例：

1. 正常文章。
2. 空正文。
3. 超长正文。
4. frontmatter 缺标题。
5. 正文含有“忽略以上规则”的不可信文本。

每个失败都应该进入不同状态。空正文是 `insufficient_input`，超长正文可以先压缩或截断，不可信文本应被当作文章数据而不是系统指令。这样实验才不是“跑通 happy path”，而是开始建立可靠性。

## 检查清单

- 每次调用是否记录 task name、task version 和 model。
- 输出是否必须通过 schema 才能进入下一步。
- retry 是否带着具体错误，而不是重复原请求。
- trace 是否能定位到输入摘要、输出摘要、错误类型和耗时。
- 是否有无答案或输入不足的显式状态。
- 是否避免把完整敏感正文写进日志。

## 可做实验

用一个 `run_llm_task()` 包装函数处理站点内容摘要任务。先写 10 条输入样例和期望输出字段。每次运行都生成一行 JSONL trace。故意制造三种失败：字段缺失、输出过长、无答案。看系统能否把失败分类，而不是只抛一个通用异常。

实验完成后，不要只看“能不能出结果”。要看三组指标：一次通过率、retry 后通过率、人工复核率。第一批数据很小也没关系，关键是它们会成为后面 prompt、模型和 schema 调整的回归集。

## 参考

- [OpenAI Prompting](https://platform.openai.com/docs/guides/prompting)
- [OpenAI Agent Evals](https://platform.openai.com/docs/guides/agent-evals)
- [Chip Huyen: AI Engineering](https://www.oreilly.com/library/view/ai-engineering/9781098166298/)
- [Full Stack LLM Bootcamp](https://fullstackdeeplearning.com/llm-bootcamp/)
