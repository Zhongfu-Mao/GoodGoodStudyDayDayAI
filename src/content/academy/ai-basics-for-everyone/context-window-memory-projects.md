---
title: "AI Basics for Everyone：Context Window、Memory、Projects 是什么"
date: 2026-04-27
category: academy
description: "解释 AI 当前能看到什么、能记住什么，以及为什么 Projects/文件/上下文会影响输出质量。"
coverImage: "/images/academy/ai-basics-for-everyone/context-memory-projects.svg"
difficulty: beginner
plainSummary: "上下文窗口是 AI 当前能看到的信息范围，Memory 是更长期的偏好或事实，Projects 则把一组文件、指令和对话组织到同一个工作空间里。"
tags:
  - "Context"
lang: zh
academy:
  series: "AI Basics for Everyone"
  module: "入口概念"
  moduleOrder: 3
  source: "本站 Academy / Foundations 导读"
  prerequisites: []
draft: false
---

## 先用一句话理解

AI 的回答质量很大程度取决于它“此刻能看到什么”。Context Window 是当前可见信息范围，Memory 是更长期保存的偏好或事实，Projects 是把文件、指令和对话组织到一个工作空间里。

这三个概念能解释很多体验差异：同一个模型，有时像懂你，有时像失忆，往往不是能力突然变化，而是上下文不同。

## 三个词的区别

| 概念 | 解决什么问题 | 常见误解 |
| --- | --- | --- |
| Context Window | 当前对话里能放多少信息 | 以为它能永久记住所有对话 |
| Memory | 长期偏好、背景和事实 | 以为它等于完整数据库 |
| Projects | 把任务材料放进同一空间 | 以为只是文件夹 |

上下文窗口更像“桌面上摊开的材料”；Memory 更像“长期知道你的偏好”；Projects 更像“围绕某个任务搭好的工作台”。

## 为什么上下文很重要

LLM 不会凭空知道你公司的内部规则、项目目标、个人偏好或刚刚修改过的文件。你要么在 prompt 里提供这些信息，要么通过文件、Project、RAG、工具调用把信息放进它可见的范围。

上下文越清楚，AI 越可能给出贴近真实情况的回答。上下文越乱，AI 越容易写出漂亮但没法用的内容。

## 使用 Projects 的直觉

当一个任务会持续超过一次对话，就值得考虑 Project：

- 一个长期学习主题。
- 一个网站或代码项目。
- 一组固定参考资料。
- 一个需要保持口径一致的写作任务。
- 一个团队希望共享的知识空间。

Project 的价值不是“把文件上传进去”本身，而是让 AI 每次协作时都有稳定背景。

## 和本站内容怎么接上

先读 [Working with Files](../../openai-academy/02-using-chatgpt/tools/working-with-files/)，理解文件如何进入 AI 工作流。

再读 [Projects](../../openai-academy/02-using-chatgpt/workflows/projects/)，把单次对话升级成可持续的工作空间。

如果你想理解上下文窗口为什么会成为工程问题，可以读 [Token 与 Context Window](../../../foundations/ai-developer-core/token-context-window/) 和 [Context Engineering Playbook](../../../engineering/ai-developer-core/context-engineering-playbook/)。

## 一个实用判断

当 AI 输出不符合预期时，先不要说“它不懂”。可以先检查：

1. 它是否看到了完整材料？
2. 它是否知道任务背景和判断标准？
3. 它是否把旧信息误当成了当前事实？
4. 这个任务是否应该放进 Project，而不是散落在多个对话里？

很多所谓“模型问题”，其实是上下文管理问题。
