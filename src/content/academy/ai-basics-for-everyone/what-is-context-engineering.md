---
title: "AI Basics for Everyone：Context Engineering 是什么，为什么不只是写好 Prompt"
date: 2026-04-27
category: academy
description: "解释为什么 Prompt Engineering 已经不够，Context Engineering 如何把信息环境设计成 AI 能力的一部分。"
coverImage: "/images/academy/ai-basics-for-everyone/context-engineering.svg"
difficulty: beginner
plainSummary: "Context Engineering 不只是写好提示词，而是设计 AI 在每一步能看到什么信息、用什么工具、遵守什么规则。它是 Prompt Engineering 的自然升级。"
tags:
  - "Context Engineering"
  - "Prompting"
lang: zh
academy:
  series: "AI Basics for Everyone"
  module: "入口概念"
  moduleOrder: 11
  source: "本站 Academy / Engineering 导读"
  prerequisites: []
draft: false
---

## 先用一句话理解

Context Engineering 是设计 AI 在每一步任务中能看到什么信息、能用什么工具、必须遵守什么规则的工程实践。它不只是"写一个好 prompt"，而是搭建一个让 AI 稳定工作的信息环境。

## 从 Prompt Engineering 到 Context Engineering

| Prompt Engineering | Context Engineering |
| --- | --- |
| 优化一条指令的措辞 | 设计 AI 在整个任务中的信息环境 |
| 关注单次交互 | 关注多步骤工作流 |
| 主要靠人手动调整 | 包含自动检索、工具调用、规则注入 |
| "怎么问更好" | "AI 应该看到什么才能做好" |

打一个比方：Prompt Engineering 是写好一道考题，Context Engineering 是准备好整个考场——包括材料、规则、参考资料和评分标准。

## 为什么它变得重要

当 AI 开始参与真实工作流，它需要的不只是一条好指令：

- 它需要看到相关资料（检索）。
- 它需要知道当前任务进展（状态）。
- 它需要遵守边界和规则（系统指令）。
- 它需要使用工具完成子任务（工具调用）。
- 它需要的信息会随任务推进而变化（动态上下文）。

Context Engineering 就是把这些信息在正确的时机、以正确的方式提供给 AI。

## 上下文的四个来源

| 来源 | 例子 |
| --- | --- |
| 系统指令 | 你是一个项目管理助手，不要讨论非工作话题 |
| 用户输入 | 当前对话、上传的文件、提出的问题 |
| 检索结果 | RAG 从知识库中找到的相关段落 |
| 工具返回 | 搜索结果、API 响应、代码执行输出 |

好的 Context Engineering 是让这四个来源协调工作，而不是把所有信息一股脑塞进 prompt。

## 日常使用中的 Context Engineering

你不需要是工程师也能实践：

- **用 Projects**：把固定的背景和指令放进 Project，让每次对话自动带上必要上下文。
- **分步骤提供信息**：先让 AI 理解任务，再提供细节。
- **明确约束**：告诉 AI "只基于以下材料回答"比什么都不说更可靠。
- **管理对话长度**：对话太长时新开一个，把关键信息重新提供。

## 和本站内容怎么接上

先回顾 [Context Window、Memory、Projects 是什么](../context-window-memory-projects/)，理解上下文的基础概念。

再读 [Context Engineering Playbook](../../../engineering/ai-developer-core/context-engineering-playbook/)，看完整的工程实践方法。

## 动手试试

用同一个任务做两次实验：

**实验 1**（裸 prompt）：`帮我写一封邮件给客户。`

**实验 2**（Context Engineering）：
```text
背景：我是 SaaS 公司的客户成功经理。
客户情况：上月反馈的技术问题本周已修复。
目标：通知客户问题已解决，询问是否演示新功能。
语气：专业但不过度正式。格式：150 字以内。
```

比较两次结果。第二次不只是"prompt 更长"，而是提供了完整上下文。

## 一个实用判断

当 AI 输出不符合预期时，先问：

1. AI 是否看到了足够的背景信息？
2. 任务目标是否足够具体？
3. 是否有明确的约束和判断标准？
4. 上下文里是否混入了无关信息？

80% 的"AI 不好用"其实是"上下文没给够"。
