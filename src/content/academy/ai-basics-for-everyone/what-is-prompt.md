---
title: "AI Basics for Everyone：Prompt 到底是什么"
date: 2026-04-27
category: academy
description: "把 prompt 从神秘技巧还原成任务说明：目标、背景、材料、约束和输出格式。"
coverImage: "/images/academy/ai-basics-for-everyone/prompt.svg"
difficulty: beginner
plainSummary: "Prompt 不是咒语，而是你给 AI 的任务说明。好的 prompt 会讲清目标、上下文、限制和希望得到的输出。"
tags:
  - "Prompting"
  - "ChatGPT"
lang: zh
academy:
  series: "AI Basics for Everyone"
  module: "入口概念"
  moduleOrder: 2
  source: "本站 Academy 导读"
  prerequisites: []
draft: false
---

## 先用一句话理解

Prompt 就是你给 AI 的任务说明。它不只是一个问题，也可以包含角色、目标、背景、材料、限制、判断标准和输出格式。

很多人刚开始会把 prompt 当作“神奇口令”。这会让学习变得很玄。更稳定的理解是：prompt 是一次协作的开场白，你把任务讲清楚，AI 才更容易给出可用结果。

## 一个好 prompt 通常包含什么

| 部分 | 作用 | 示例 |
| --- | --- | --- |
| 角色 | 让 AI 知道该用什么视角 | 你是一位产品经理 |
| 目标 | 说明要完成什么 | 帮我整理分享稿大纲 |
| 背景 | 提供必要上下文 | 听众是身边朋友，AI 基础不同 |
| 材料 | 给出可引用内容 | 下面是网站介绍和内容列表 |
| 约束 | 设定边界 | 不要太营销，不要夸大 |
| 格式 | 降低返工成本 | 用 5 个小标题输出 |

你不需要每次都写满六项，但任务越复杂，prompt 越应该像“需求说明”。

## 低成本模板

```text
我想完成：[目标]
背景是：[场景、对象、已有材料]
请你帮我：[具体动作]
限制条件：[语气、长度、不要做什么]
输出格式：[列表/表格/草稿/步骤]
如果信息不够，请先列出需要我补充的问题。
```

这个模板不炫，但足够稳定。真正的高手不是背很多 prompt，而是会把任务拆清楚。

## Prompt 为什么会失败

常见失败不是模型“笨”，而是任务没说清：

- 目标太空，比如“帮我优化一下”。
- 背景缺失，比如没说读者是谁。
- 输出格式不清，导致 AI 写成你不想要的样子。
- 没有判断标准，AI 不知道什么算好。
- 一次塞太多目标，导致重点分散。

## 和本站内容怎么接上

先读 [Getting Started with ChatGPT](../../openai-academy/02-using-chatgpt/core-skills/getting-started/)，它适合第一次认真使用 ChatGPT 的人。

然后读 [Prompting Fundamentals](../../openai-academy/02-using-chatgpt/core-skills/prompting-fundamentals/)，重点是把 prompt 从“技巧”变成可复用的沟通结构。

如果你后面要写代码或让 AI 修改项目，再接 [Codex Better Prompts](../../openai-academy/05-codex/better-prompts/)。那时 prompt 就会从“提问”升级成“协作任务书”。

## 一个实用判断

每次 prompt 失败后，不要先换模型。先问自己：

1. 我有没有说清目标？
2. 我有没有提供足够上下文？
3. 我有没有告诉它什么输出才算可用？

这三个问题能解决大多数入门阶段的挫败感。
