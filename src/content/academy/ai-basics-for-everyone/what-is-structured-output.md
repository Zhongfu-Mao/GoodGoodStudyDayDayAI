---
title: "AI Basics for Everyone：Structured Output 是什么，让 AI 输出你能直接用的格式"
date: 2026-04-27
category: academy
description: "解释什么是结构化输出，为什么让 AI 输出表格、JSON、清单比纯文本更实用。"
coverImage: "/images/academy/ai-basics-for-everyone/structured-output.svg"
difficulty: beginner
plainSummary: "Structured Output 是让 AI 按照你指定的格式（表格、JSON、清单等）输出结果，而不是写一大段自由文本。它让 AI 的输出可以直接被复用。"
tags:
  - "Structured Output"
  - "Prompting"
lang: zh
academy:
  series: "AI Basics for Everyone"
  module: "入口概念"
  moduleOrder: 12
  source: "本站 Academy / Engineering 导读"
  prerequisites: []
draft: false
---

## 先用一句话理解

Structured Output 是让 AI 按照你指定的格式（表格、JSON、清单、分类标签等）输出结果。它把 AI 从"写一段话"升级到"给我一个可以直接用的数据"。

## 为什么纯文本不够

AI 默认会生成自然语言段落。对简单问答这没问题，但当你想：

- 把结果粘贴到 Excel 或数据库。
- 让另一个程序自动读取 AI 的输出。
- 比较多次运行的结果是否一致。
- 把一个大任务拆成标准化的小块。

纯文本就不好用了。你需要的是"可被程序或人直接处理的格式"。

## 常见的结构化输出形式

| 格式 | 适合场景 | 例子 |
| --- | --- | --- |
| 表格 | 比较、汇总、分类 | 竞品对比、功能清单 |
| JSON | 程序间传递数据 | API 响应、配置文件 |
| 编号清单 | 步骤、优先级排序 | 任务拆解、检查清单 |
| 分类标签 | 分类判断 | 邮件类型识别、情感分析 |
| Markdown | 文档和报告 | 周报草稿、会议纪要 |

你不需要懂编程也能使用结构化输出——只要在 prompt 里告诉 AI 用什么格式。

## 怎么让 AI 输出结构化内容

最简单的方法是在 prompt 末尾说清楚格式要求：

```text
请用表格输出，包含以下列：名称、优点、缺点、适合场景。
```

或者：

```text
请用 JSON 格式返回，包含 title、summary、tags 三个字段。
```

几个技巧：

- 给一个示例格式，AI 会模仿。
- 明确字段名和数据类型。
- 如果输出不对，指出哪里需要修正再让它重新生成。

## 非工程场景也很有用

结构化输出不只是程序员的事。日常工作中的例子：

- 让 AI 把调研笔记整理成表格，方便在会议中展示。
- 让 AI 按"优先级/负责人/截止日期"格式输出任务清单。
- 让 AI 用统一模板生成多篇邮件回复。
- 让 AI 按"论点-论据-结论"结构输出分析。

关键不是格式本身，而是让 AI 的输出可以被下一步直接使用。

## 和本站内容怎么接上

如果你想了解工程层面如何保证结构化输出的可靠性，读 [Structured Output、Retry 与 Recovery](../../../engineering/ai-developer-core/structured-output-retry-recovery/)。

如果你想让 prompt 的格式要求更稳定，回顾 [Prompt 到底是什么](../what-is-prompt/)。

## 动手试试

打开 ChatGPT 或 Claude，试试这个对比实验：

**实验 1**：`推荐三款适合个人使用的 AI 工具。`

**实验 2**：
```text
推荐三款适合个人使用的 AI 工具。
请用表格输出，列包括：工具名称、核心功能、免费额度、适合什么人。
```

比较两次结果：哪个更容易直接复制到你的文档或分享给同事？

## 一个实用判断

每次让 AI 输出内容时，问自己：

1. 我拿到结果后下一步要做什么？
2. 纯文本够用还是需要结构化格式？
3. 这个结果会被其他人或工具使用吗？
4. 如果要比较多次结果，用什么格式最方便？

养成"先想输出用途再写 prompt"的习惯，能大幅减少返工。
