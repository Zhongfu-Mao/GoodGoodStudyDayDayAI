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

"Using ChatGPT" 并非仅仅关于简单的对话技巧。它将 ChatGPT 的应用能力划分为三个由浅入深的层级：

| 层级 | 核心目标 |
| --- | --- |
| **核心技能 (Core skills)** | 掌握高效对话、Prompt 撰写以及 ChatGPT 的个性化配置。 |
| **工具应用 (Tools)** | 熟练运用文件分析、联网搜索、深度研究 (Deep Research) 及图像生成等内置功能。 |
| **工作流与自动化 (Workflows & Automations)** | 利用 Projects、自定义 GPTs、Skills 及 Workspace Agents 将重复性任务结构化。 |

这一进阶路线的核心变化在于：从早期的“一问一答”交互模式，转向“有机整合上下文、工具与执行步骤”，从而使 AI 能够稳定、高质量地参与特定类别的任务。

## 第一层：核心技能 (Core skills)

### 从高质量 Prompt 开启对话

OpenAI Academy 指出，Prompt 可以是纯文本指令，也可以包含图片、音频或文件。Prompt 的本质并非神秘的“咒语”，而是为模型提供清晰的**目标**与充分的**上下文**。

初学者最常见的失误是仅提供任务指令而忽略背景。例如：
*无效示例：*“帮我写一段介绍。”

*推荐起点：*
> “我正在撰写一份面向非技术读者的 AI 学习笔记。请用 150 字左右解释为何 ChatGPT 适合头脑风暴，但不能直接作为事实来源。语气要求专业、客观且通俗易懂。”

通过明确受众、场景、篇幅、主题及语气，模型能更稳定地输出符合预期的内容。

### 识别重复模式

官方建议从低风险、即时生效的任务切入，如草稿撰写、长文摘要、灵感整理或笔记结构化。当你发现某项任务在日常工作中高频出现时，便可考虑进入下一阶段：将其沉淀为 Project、自定义 GPT 或自动化 Agent。

## 第二层：工具应用 (Tools)

内置工具使 ChatGPT 从文本生成器进化为全能助手：

| 工具方向 | 典型应用场景 |
| --- | --- |
| **文件交互 (Using files)** | 深度解析文档、表格或图片，将其转化为摘要、提纲或专业分析。 |
| **搜索与深度研究 (Search / Deep Research)** | 综合外部实时信息，生成带有可靠来源引用的研究报告。 |
| **图像生成 (Image creation)** | 通过自然语言生成或编辑视觉素材，辅助视觉方案探索及初稿设计。 |

工具的核心价值在于减少“人工搬运上下文”的负担。凡涉及高频复制粘贴、网页查询及资料整理的任务，均应考虑工具化处理。

## 第三层：工作流与自动化 (Workflows & Automations)

这是进阶路线中最具实战价值的部分，旨在实现能力的“产品化”。

| 进阶能力 | 适用场景与抽象方式 |
| --- | --- |
| **项目空间 (Projects)** | 跨对话共享上下文，适用于长期主题研究或大规模资料库管理。 |
| **自定义 GPTs (Custom GPTs)** | 封装特定角色、指令规则与知识库，打造专属可复用助手。 |
| **技能封装 (Skills)** | 将复杂任务拆解为稳定的执行步骤与标准化方法。 |
| **工作空间代理 (Workspace Agents)** | 跨工具、跨系统执行复杂且重复的业务流程。 |

此时关注点不再是单个 Prompt 的写法，而是如何将工作逻辑转化为可维护、可复用的系统。

## 推荐进阶路线

我将 ChatGPT 的使用成熟度提炼为以下五个阶段：

1. **单次即时对话**：快速问答、改写、基础解释。
2. **多轮深度打磨**：通过持续追问、补充约束条件及要求多方案对比来优化输出。
3. **上下文容器化**：利用 Projects 维护特定项目或主题的长效资料集。
4. **角色与逻辑封装**：通过 Custom GPTs 或指令模板实现特定任务的标准化复用。
5. **流程自动化执行**：将重复性业务逻辑转化为 Skill 或 Agent 工作流。

**实践法则：** 若某项工作每周重复出现三次以上，即应考虑将其从第 2 步推进至第 3 或第 4 步。

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

> 这是读者可复制使用的实践记录模板。记录时建议保留方法、过程和复盘，隐藏敏感输入、账号信息、客户资料、未验证结论和不可公开的内部材料。

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
