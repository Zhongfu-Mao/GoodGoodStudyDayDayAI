---
title: "AI Basics for Everyone：Token、计费与模型选择"
date: 2026-04-27
category: academy
description: "深入浅出地解释 Token 的概念、AI 的计费模式、上下文窗口的限制，以及如何为特定任务选择合适的模型。"
coverImage: "/images/academy/ai-basics-for-everyone/token-cost-model.svg"
difficulty: beginner
plainSummary: "Token 是 AI 处理文本的基本单位，也是衡量成本的核心标准。理解 Token 和上下文窗口，能助你精准控制成本并选对模型。"
tags:
  - "Token"
  - "LLM"
lang: zh
academy:
  series: "AI Basics for Everyone"
  module: "基本概念"
  moduleOrder: 9
  source: "本站 Academy / Foundations 导读"
  prerequisites: []
draft: false
---

## 先用一句话理解

**Token（标记）**是 AI 处理文本的最小单位。大致换算：一个中文字约占 1-2 个 token，一个英文单词约占 1-4 个 token。AI 服务的计费标准、上下文限制以及响应速度，都与 token 数量息息相关。

## Token 到底是什么

AI 并不是直接按字符或单词来理解文本的，而是将其切分为 token。你可以将 token 想象成“AI 的基本音节”：

| 文本示例 | 大致 Token 数 |
| --- | --- |
| "你好" | 1-2 个 token |
| "Hello world" | 2 个 token |
| 一封 500 字的邮件 | 约 300-600 个 token |
| 一篇 5000 字的文章 | 约 3000-6000 个 token |

注：具体的 token 换算比例会因模型架构和所用语言而异。

## 计费模式解析

大多数 AI API 采用**“输入 token + 输出 token”**的计费方式。通常遵循以下规律：

- **输入（Input）**价格通常低于**输出（Output）**。
- **高性能模型**（如 GPT-4o, Claude 3.5 Sonnet）的单价高于**轻量级模型**（如 GPT-4o-mini, Claude 3.5 Haiku）。
- 图像、音频等多模态输入也会被折算为等效的 token 数量进行计费。

对于普通用户，ChatGPT Plus 或 Claude Pro 的**订阅制**（固定月费，设有使用上限）更为直观省心。对于开发者而言，深入理解 token 计费有助于优化架构成本。

## 什么是上下文窗口（Context Window）

上下文窗口是指模型在单次推理中能“同时处理”的最大 token 数量。你可以将其类比为模型的“工作桌面”：

- **桌面越大**，能够同时摊开并关联参考的资料就越多。
- **桌面有限**，一旦信息超出限制，较早的内容会被截断或忽略。
- 窗口越大的模型，通常处理成本也越高。

| 模型类型 | 典型上下文窗口 |
| --- | --- |
| 轻量/快速模型 | 8K - 32K token |
| 主流旗舰模型 | 128K - 200K token |
| 长文本专用模型 | 1M（100万）token 以上 |

*提示：128K token 约等于一本中型书籍的容量。但需注意，模型对窗口中间信息的关注度往往略低于开头和结尾。*

## 如何选择合适的模型

针对不同的任务特点，应选择性价比最高的模型：

| 任务特点 | 推荐模型类型 |
| --- | --- |
| 简单问答、日常对话、翻译 | 轻量、响应极速的模型 |
| 深度文档分析、复杂逻辑推理 | 旗舰强模型 + 大上下文窗口 |
| 辅助编程、代码调试 | 在代码基座上深度微调的专用模型 |
| 需要获取实时新闻或最新资讯 | 具备联网搜索能力的模型 |
| 高频、成本敏感的批量任务 | 轻量模型 + 结构化 Prompt 优化 |

## 与本站进阶内容的关联

若想深入探讨 token 化的技术细节及窗口限制，请阅读 [Token 与 Context Window](../../../foundations/ai-developer-core/token-context-window/)。

若想学习如何通过管理上下文来大幅提升 AI 的任务表现，请阅读 [Context Window、Memory、Projects 是什么](../context-window-memory-projects/)。

## 动手实践

建议在 ChatGPT 或 Claude 中尝试以下对比：

1. 发送一个短问题，记录其响应速度。
2. 上传一份数千字的长文档并提问，观察响应延迟的变化。
3. 在 Prompt 中明确要求“请在 100 字内回答”，以此体会如何控制输出 token。

通过这些简单的实验，你能直观建立起对 token、响应速度和预期成本之间的关联感。

## 实用决策建议

在评估 AI 工具或选择模型时，可以参考以下四个维度进行决策：

1. **信息量**：任务执行中需要多少参考资料（上下文）？
2. **能力值**：是需要行业顶尖的推理能力，还是“够用就好”的通用能力？
3. **频率**：是一次性使用的任务，还是需要规模化反复运行的自动化流程？
4. **成本**：该任务对费用消耗是否敏感？

**原则：** 不选“最贵的”，只选“最合适的”。
