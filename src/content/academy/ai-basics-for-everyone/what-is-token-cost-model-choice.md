---
title: "AI Basics for Everyone：Token、费用和模型选择"
date: 2026-04-27
category: academy
description: "解释 Token 是什么、AI 怎么计费、上下文窗口有什么限制、以及不同任务该怎么选模型。"
coverImage: "/images/academy/ai-basics-for-everyone/token-cost-model.svg"
difficulty: beginner
plainSummary: "Token 是 AI 处理文本的基本单位，也是计费的基础。理解 token 和上下文窗口，能帮你控制成本、选对模型。"
tags:
  - "Token"
  - "LLM"
lang: zh
academy:
  series: "AI Basics for Everyone"
  module: "入口概念"
  moduleOrder: 9
  source: "本站 Academy / Foundations 导读"
  prerequisites: []
draft: false
---

## 先用一句话理解

Token 是 AI 处理文本的最小单位。一个中文字大约是 1-2 个 token，一个英文单词大约是 1-4 个 token。AI 的计费、上下文限制和响应速度都和 token 数量直接相关。

## Token 到底是什么

AI 不是按字符或单词理解文本的，而是把文本切成 token。可以把 token 想象成"AI 的音节"：

| 文本 | 大致 Token 数 |
| --- | --- |
| "你好" | 1-2 token |
| "Hello world" | 2 token |
| 一封 500 字的邮件 | 约 300-600 token |
| 一篇 5000 字的文章 | 约 3000-6000 token |

具体数字因模型和语言不同，但数量级不会差太多。

## 费用怎么算

大多数 AI API 按输入 token + 输出 token 计费。一般来说：

- 输入比输出便宜。
- 强模型比轻量模型贵。
- 图片和音频也会折算成 token。

对个人用户来说，ChatGPT Plus、Claude Pro 这类订阅制更简单——月费固定，使用量有上限但不需要逐条计算。

对开发者来说，了解 token 计费能帮你优化成本：减少不必要的上下文、选对模型、控制输出长度。

## 上下文窗口是什么

上下文窗口是模型一次能"看到"的最大 token 数量。可以把它理解成模型的"工作桌面"：

- 桌面越大，能摊开的材料越多。
- 但桌面有限，超出部分会被截断或忽略。
- 窗口越大的模型通常越贵。

| 模型类型 | 典型上下文窗口 |
| --- | --- |
| 轻量对话模型 | 8K-32K token |
| 主流模型 | 128K-200K token |
| 长文档模型 | 1M+ token |

128K token 大约等于一本小书。但"能放进去"不等于"能完美处理"——模型对窗口中间部分的关注度通常不如开头和结尾。

## 怎么选模型

不同任务适合不同模型。一个简单的判断框架：

| 任务特点 | 适合什么 |
| --- | --- |
| 简单问答、日常对话 | 轻量快速的模型 |
| 长文档分析、复杂推理 | 强模型 + 大上下文窗口 |
| 代码生成和调试 | 擅长代码的专用模型 |
| 需要最新信息 | 带搜索能力的模型 |
| 成本敏感的批量任务 | 轻量模型 + 结构化 prompt |

不存在"万能最佳模型"。关键是匹配任务需求和预算。

## 和本站内容怎么接上

如果你想深入理解 token 和上下文窗口的技术细节，读 [Token 与 Context Window](../../../foundations/ai-developer-core/token-context-window/)。

如果想了解如何管理上下文来提升 AI 效果，读 [Context Window、Memory、Projects 是什么](../context-window-memory-projects/)。

## 动手试试

打开 ChatGPT，发送一条消息后，观察回复下方的 token 使用信息（如果可见）。然后试试：

1. 先发一段 100 字的简单问题，记下大概的响应速度。
2. 再发一段 2000 字的长材料 + 问题，比较速度差异。
3. 在 prompt 里加上"请用 100 字以内回答"，看看是否能有效控制输出长度。

这能帮你建立对 token、速度和成本之间关系的直觉。

## 一个实用判断

在选择 AI 工具或模型时，可以问：

1. 这个任务需要多大的上下文？
2. 我需要最强的模型还是够用就行？
3. 这是一次性任务还是要反复跑？
4. 成本敏感吗？

先回答这四个问题，再选工具，比直接挑"最贵最强"的更合理。
