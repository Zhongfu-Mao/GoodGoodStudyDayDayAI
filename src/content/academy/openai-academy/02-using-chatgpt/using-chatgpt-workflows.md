---
title: "OpenAI Academy 笔记：Using ChatGPT"
date: 2026-04-25
category: academy
description: "从第一条 prompt 到 Projects、Custom GPTs、Skills 和 Workspace agents，整理 ChatGPT 使用能力的递进路线。"
plainSummary: "这篇笔记把 OpenAI Academy 笔记：Using ChatGPT 的核心内容整理成可复习、可实践的 02 Using ChatGPT 学习路径。"
difficulty: beginner
coverImage: "https://images.ctfassets.net/kftzwdyauwt9/3UaiZFr75wVkOCJsHTd21x/54b2631e52804edcce8bc6ffbdd15722/Cover-using-chatgpt.png?w=3840&q=90&fm=webp"
tags:
  - "ChatGPT"
  - "AI/Workflow"
lang: zh
academy:
  series: "OpenAI Academy"
  module: "02 Using ChatGPT"
  moduleOrder: 20
  source: "OpenAI Academy"
  sourceUrl: "https://openai.com/academy/using-chatgpt/"
  prerequisites:
    - "建议先阅读：OpenAI Academy 笔记：AI Fundamentals"
draft: false
---

**说明：** 本文整理 OpenAI Academy 中 ChatGPT 使用路线的公开结构，并补充本站自己的工作流理解。

## 这节课解决什么问题

Using ChatGPT 不是只教“怎么聊天”。它把 ChatGPT 的使用能力分成三层：

| 层级 | 目标 |
| --- | --- |
| Core skills | 会开始对话、写 prompt、个性化 ChatGPT |
| Tools | 会使用文件、搜索、deep research、图像创建等内置能力 |
| Workflows and automations | 会用 Projects、Custom GPTs、Skills、Workspace agents 把重复任务结构化 |

这条路线的关键变化是：从“我问一句，你答一句”转向“我把上下文、工具和步骤组织起来，让 AI 稳定参与一类工作”。

## 第一层：Core skills

### 从第一条 prompt 开始

OpenAI Academy 的 Getting started 内容强调，prompt 可以是问题、指令，也可以伴随图片、音频或文件。prompt 的本质不是魔法咒语，而是给模型提供目标和上下文。

初学者最容易犯的错误是只给任务，不给背景。例如：

```text
帮我写一段介绍。
```

更好的起点是：

```text
我正在写一篇面向非技术读者的 AI 学习笔记。请用 150 字解释为什么 ChatGPT 适合做头脑风暴，但不应该直接当作事实来源。语气要清楚、克制。
```

这里给了受众、场景、长度、主题、判断和语气，模型才更容易稳定输出。

### 从简单任务找到重复模式

OpenAI Academy 给出的实用判断很值得保留：先从低风险、立刻有用的聊天任务开始，比如写草稿、总结长内容、整理想法、把粗糙笔记变清楚。

当你发现某个任务重复出现，就可以进入下一层：把它做成 Project、Custom GPT、Skill 或 Workspace agent。

## 第二层：Tools

ChatGPT 的内置工具让它不再只是文本生成器：

| 工具方向 | 适合任务 |
| --- | --- |
| Using files | 阅读文档、表格、图片，把材料转成摘要、提纲或分析 |
| Search / deep research | 查找、比较、综合外部信息，形成带来源的研究结果 |
| Image creation | 用自然语言生成或编辑图像，用于视觉草稿和素材探索 |

我的理解是：工具不是为了炫技，而是为了减少“人手动搬运上下文”的负担。只要一个任务需要你不断复制粘贴、查网页、整理材料，就应该考虑工具化。

## 第三层：Workflows and automations

这一层是 OpenAI Academy 路线里最值得沉淀的部分。

| 能力 | 适合的抽象 |
| --- | --- |
| Projects | 多轮对话共享上下文，适合长期主题和资料库 |
| Custom GPTs | 把一类固定角色、规则和知识做成可复用助手 |
| Skills | 把重复任务封装成稳定步骤和可执行方法 |
| Workspace agents | 跨工具、跨系统运行重复流程 |

这里的关键问题不再是“这个 prompt 怎么写”，而是“这个工作是否值得产品化成一个小流程”。

## 可复用工作流

我会把 ChatGPT 使用成熟度分成五步：

1. **单次对话**：快速问答、草稿、改写、解释。
2. **多轮打磨**：通过追问、补充约束、要求比较来提升输出。
3. **上下文容器**：使用 Projects 管理一个长期主题或资料集合。
4. **角色封装**：用 Custom GPTs 或指令模板复用固定任务。
5. **流程自动化**：把重复任务变成 Skill 或 Workspace agent。

如果一项工作每周重复三次以上，就应该考虑从第 2 步推进到第 3 或第 4 步。

## 和 Anthropic Academy 的对照

Anthropic Academy 的 Description 强调如何清楚描述任务、过程和期望表现。OpenAI Academy 的 Using ChatGPT 则把这种描述能力落到产品功能上：Projects 管上下文，Custom GPTs 管角色，Skills 管流程。

也就是说，Anthropic 给的是协作语言，OpenAI 给的是产品容器。



## 完整版学习稿

### 学习定位

这一页可以当作 **Using ChatGPT 总路线** 的系统学习稿。它面向已经会基础对话、想把 ChatGPT 变成稳定工作流的人，重点不是背官方术语，而是把页面里的能力、场景和边界转成可以反复使用的工作方法。

### 学习目标

- 把核心技能、工具和工作流连接起来。
- 理解 Project、Custom GPT、Skill、Workspace Agent 各自负责什么。
- 从单次聊天过渡到可复用、可维护的工作系统。

### 官方内容拆解

| 模块 | 学习重点 | 可产出材料 |
| --- | --- | --- |
| Core skills | prompting、上下文、迭代 | 稳定的单轮和多轮对话 |
| Tools | 文件、研究、图像、数据 | 材料驱动的输出 |
| Projects | 长期目标和文件集合 | 课程、博客、研究项目 |
| Custom GPTs | 固定角色和知识入口 | 专用助手 |
| Skills / Agents | 流程和执行能力 | 可重复工作流和跨步骤任务 |

### 实操工作流

1. 先用普通对话完成一次任务。
2. 如果任务会重复，抽出输入、步骤、输出和复核点。
3. 如果需要长期材料，放进 Project。
4. 如果需要固定角色，做成 Custom GPT。
5. 如果需要流程标准，沉淀成 Skill 或 agent 工作流。

### 可复用 Prompt

```text
请分析我这个重复任务适合用普通聊天、Project、Custom GPT、Skill 还是 Workspace Agent。请说明原因、需要准备的材料、流程步骤、输出格式和风险检查点。
```

### 复核清单

- 输出是否只使用已提供或可追溯的信息，不把推断写成事实。
- 是否标出不确定性、待确认项和需要人工判断的地方。
- 是否给出可执行的下一步，而不是只生成漂亮文字。
- 是否符合团队、学校、公司或行业的隐私与合规要求。

### 学完应该留下什么

学完这一页，最好不要只留下摘要，而是留下 一份可复用的学习笔记、prompt 模板和实践清单。如果以后要补自己的课程心得，可以在这份材料后面继续追加：真实使用场景、失败案例、改进后的 prompt、以及哪些判断必须由人完成。

来源页：https://openai.com/academy/using-chatgpt/


## 原创学习增强包

### 三档练习

| 时间 | 练习任务 | 交付物 |
| --- | --- | --- |
| 30 分钟 | 只读本页和来源核对区，提炼 5 条最有用的行动建议。 | 一张“今天就能试”的清单 |
| 2 小时 | 用下面的虚构案例跑一遍完整流程，记录输入、输出、修改和复核点。 | 一份可发布的练习记录 |
| 半天 | 把练习结果改造成自己的模板或小项目，并写下失败案例。 | 模板、prompt pack、复盘笔记 |

### 虚构案例

你要把“Using ChatGPT”这篇笔记变成可操作的学习任务，而不是只读摘要。 你可以把输入材料设定为：当前笔记、你的学习目标、目标读者、可投入时间。最后产出 练习记录、prompt 模板、复盘问题和公开发布检查表。

### 原创 Prompt Pack

1. 请把“Using ChatGPT”整理成 30 分钟练习。
2. 请围绕“Using ChatGPT”设计一个虚构案例。
3. 请为“Using ChatGPT”生成 5 个原创 prompt。
4. 请列出学习“Using ChatGPT”后应该能回答的自测题。
5. 请检查这篇笔记公开发布前还有哪些风险。

### 自测问题

- 我能不能用自己的话解释“Using ChatGPT”解决的核心问题？
- 我能不能说清它适合哪些场景、不适合哪些场景？
- 我能不能用一个真实或虚构任务跑完整个流程？
- 我能不能指出输出中哪些内容必须人工复核？
- 我能不能把这页内容沉淀成一个模板、清单或小项目？

### 公开发布边界

- 这部分是原创练习设计和使用建议，不替代官方课程原文。
- 示例案例均为虚构，不能暗示来自 OpenAI 官方页面。
- 如果练习涉及医疗、金融、法律、教育管理或 HR 场景，只能作为辅助草稿，必须由专业人员复核。
- 对外发布时保留官方来源链接，不复制官方长段正文或 prompt 表格。

## 亲测记录模板

> 这一段用于后续真正学完官方材料、跑过练习后继续追加。公开发布时，建议保留方法、过程和复盘，隐藏敏感输入、账号信息、客户资料、未验证结论和不可公开的内部材料。

### 最小实测任务

- 场景类型：个人/通用工作流
- 建议任务：选择一个自己会反复遇到的小任务，用本页方法跑完整个输入、输出、复核流程
- 输入材料：目标、背景、材料、受众、输出格式、限制
- 目标产物：可复用 prompt、检查清单、示例输出、改进记录
- 关键边界：事实来源、隐私信息、人工判断和公开发布边界

### 记录表

| 记录项 | 建议填写方式 |
| --- | --- |
| 我为什么学这一页 | 写清它和当前工作、学习或项目的关系 |
| 我实际用了什么输入 | 列出材料类型，避免公开敏感原文 |
| 第一版 prompt | 保留自己的写法，方便以后比较 |
| 第一版输出问题 | 记录含糊、遗漏、编造、格式不对或不适用之处 |
| 第二轮反馈 | 写出你如何纠偏：补上下文、加限制、改格式、要求来源 |
| 最终可复用产物 | 沉淀成模板、清单、流程图、评估集或小项目 |
| 人工复核结论 | 标明哪些可以直接用，哪些必须找专业人员或同事确认 |
| 可公开内容 | 只发布脱敏后的流程、经验、失败案例和自己的理解 |

### 复盘问题

1. 这页内容在真实任务中最有用的一点是什么？
2. 第一次输出为什么不够好，是输入问题、模型问题，还是任务本身不清楚？
3. 哪个约束最能提升质量：角色、上下文、来源、格式、示例，还是评价标准？
4. 如果让朋友照着做，哪些步骤需要写得更明确？
5. 这次实测后，我会如何改写本文的个人心得部分？

## 官方页面抓取核对

- 抓取日期：2026-04-25，工具：browser-use / in-app browser。
- 官方页面标题：Using ChatGPT。
- 页面正文规模：约 1511 个字符；检测到 6 个标题节点、13 个图片外链。
- 页面结构：`Using ChatGPT` / `Learn through events and workshops` / `AI fundamentals` / `ChatGPT for work` / `Codex` / `Join OpenAI Academy today`。

### 本页实抓内容重写整理

- 这是 Using ChatGPT 的总览页，串联入门、prompting、个性化、文件、研究、图像、Projects、GPTs、Skills 和 Agents。
- 页面价值在于给出学习路径，而不是展开某一个功能。
- 整理时适合把它放在基础模块入口，帮助读者决定先学哪一块。

### 外链视觉素材

![Using ChatGPT](https://images.ctfassets.net/kftzwdyauwt9/3UaiZFr75wVkOCJsHTd21x/54b2631e52804edcce8bc6ffbdd15722/Cover-using-chatgpt.png?w=3840&q=90&fm=webp)

图片来自官方页面外链，本站只引用 URL，不复制图片文件。

## 参考

- [Using ChatGPT](https://openai.com/academy/using-chatgpt/)
- [Getting started with ChatGPT](https://openai.com/academy/getting-started/)
