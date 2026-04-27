---
title: "OpenAI Academy 笔记：学习路线总览"
date: 2026-04-25
category: academy
description: "整理 OpenAI Academy 的公开学习结构，并把它映射成适合本站长期维护的课程笔记路线。"
coverImage: "https://images.ctfassets.net/kftzwdyauwt9/3pOt7hjYa1nUIIMMXdoEhD/b6493d0ba6756155a3ef880758e0a0b0/Academy-SEO.png?w=1600&h=900&fit=fill"
tags:
  - "AI/Workflow"
lang: zh
academy:
  series: "OpenAI Academy"
  module: "00 学习路线总览"
  moduleOrder: 1
  source: "OpenAI Academy"
  sourceUrl: "https://openai.com/academy/"
  prerequisites: []
draft: false
---

**说明：** 本文是基于 OpenAI Academy 公开页面整理的学习索引，不是官方译文，也不复刻课程原文。当前版本先承担“资料整理”和“学习路线导航”的作用；后续我会在实际学完每个模块后，继续补充自己的实践、踩坑和判断。

## 这条路线解决什么问题

OpenAI Academy 的公开内容覆盖面很宽，从 AI 基础概念、ChatGPT 日常使用、工作场景、教育场景，到 Codex 和 AI 系统构建。它不是单一课程，而更像一组持续更新的学习入口。

本站可以把它整理成一条递进路线：

1. 先建立总览，知道 OpenAI Academy 在教什么。
2. 再学 AI 基础，建立概念地图。
3. 接着学 ChatGPT 工作流，把一次性对话变成可复用方法。
4. 然后进入 Codex，把“聊一聊”推进到“交付任务”。
5. 最后看 Building with AI，把工具使用沉淀成系统构建能力。
6. 工作和教育场景作为横向专题补齐。

## 官方结构怎么读

OpenAI Academy 的主入口当前把内容分成七类：

| 模块 | 我会怎样理解 |
| --- | --- |
| AI fundamentals | 给非技术读者的基础地图，解释 AI、模型、LLM、产品和责任使用 |
| Getting started with ChatGPT / Using ChatGPT | 从第一条 prompt 到 Projects、Custom GPTs、Skills、Workspace agents 等工作流 |
| ChatGPT for work | 按角色、行业和常见任务组织的办公应用场景 |
| ChatGPT for education | 面向 K-12、高等教育、教师、学生和校园运营的应用场景 |
| Codex | 面向开发、代码任务和自动化工作流的 Codex 学习入口 |
| Codex for work | 面向非纯开发场景的 Codex 工作入口，强调任务、文件和工具协作 |
| Building with AI | 从工具使用进入 AI 系统构建、技术路线和可复用模式 |

## 当前公开版包含什么

这次公开的不是 7 篇概要，而是一组更细的学习单元。当前整理为 52 篇：

| 区块 | 篇数 | 学习重点 |
| --- | ---: | --- |
| 00 学习路线总览 | 1 | 总路线、版权边界、和 Anthropic Academy 的互补关系 |
| 01 AI Fundamentals | 3 | AI 基础、OpenAI 产品形态、安全和负责任使用 |
| 02 Using ChatGPT | 11 | 入门、prompt、个性化、文件、搜索、deep research、图像、Projects、Custom GPTs、Skills、Workspace agents |
| 03 ChatGPT for Work | 13 | 写作、头脑风暴、数据分析、研究、营销、销售、客户成功、财务、运营、管理者、金融服务、医疗健康 |
| 04 ChatGPT for Education | 9 | K-12、高等教育、教师、学生、staff、IT、课程设计和管理者视角 |
| 05 Codex | 7 | quickstart、use cases、prompt 写法、Codex app、软件工程师工作流、高级自动化 |
| 06 Codex for Work | 2 | 非纯开发工作的 Codex 使用方式、automations、plugins、settings |
| 07 Building with AI | 6 | Builder Bootcamp、agents、evals、RAG、production and optimization |

这些页面现在可以作为学习地图来读：先顺序读总览和基础，再按自己的需要进入 ChatGPT、Work、Education、Codex 或 Building with AI。

## 阅读建议

如果只是想快速上手，我建议这样读：

1. `AI Fundamentals`
2. `Getting Started with ChatGPT`
3. `Prompting Fundamentals`
4. `Working with Files`
5. `Research with ChatGPT`
6. `Writing with ChatGPT`
7. `Codex`

如果目标是工作提效，可以从 `ChatGPT for Work` 开始，按角色挑选对应页面。比如营销、销售、财务、运营和管理者，不必全部顺序读。

如果目标是开发和系统构建，可以跳到 `Codex` 和 `Building with AI`，再回头补 `Evals`、`RAG`、`Agents` 和 `Production and Optimization`。

如果目标是教学或学习，可以优先读 `ChatGPT for Education`、`Teachers`、`Students` 和 `Curriculum and Instruction`。

## 公开版和后续心得版的区别

当前版本更像“资料整理版”：

- 覆盖 OpenAI Academy 公开页面的主题结构
- 给每个学习单元补充了中文解释、表格、练习和使用边界
- 引用了 OpenAI 官方页面和官方托管图片外链
- 避免逐字翻译或搬运官方原文

后续我自己学完之后，会逐步把它升级成“实践心得版”：

- 补充我实际用 ChatGPT / Codex 跑过的工作流
- 记录哪些 prompt 和流程真的有效
- 对比 Anthropic Academy、Claude Code、MCP 等路线
- 把能复现的部分沉淀到 Engineering 分区
 
因此，这一版先解决“系统知道该学什么”的问题；下一版再解决“我实际学到了什么、跑通了什么”的问题。

## 和 Anthropic Academy 的关系

Anthropic Academy 的强项是 AI Fluency、Claude 产品、MCP、子代理和 agentic workflow。它更像“人与 AI 如何协作”的能力框架。

OpenAI Academy 的强项更偏产品和工作流落地：ChatGPT 怎么进入日常工作，Codex 怎么承接实际任务，Building with AI 怎么把能力嵌进系统。

两者放在同一个 Academy 分区里，价值不在于争高低，而在于形成两条互补路线：

| 维度 | Anthropic Academy | OpenAI Academy |
| --- | --- | --- |
| 核心语感 | AI fluency 与协作框架 | 产品使用、工作流和构建路径 |
| 典型工具 | Claude、Claude Code、MCP | ChatGPT、Codex、OpenAI API |
| 适合沉淀 | 概念框架、代理协作、上下文设计 | 实操路径、办公场景、系统构建 |
| 本站落点 | Academy + Foundations | Academy + Engineering |

## 适合本站的维护方式

我不建议把 OpenAI Academy 做成“逐字课程摘要”。更好的方式是每篇固定产出四个东西：

1. **课程解决的问题**：这节课帮谁解决什么困惑。
2. **核心概念地图**：把官方内容压缩成可复习的框架。
3. **可复用工作流**：给出可以马上试的操作路径。
4. **我的实践笔记**：记录和本站写作、开发、研究流程的关系。

这样做可以避免两类问题：一是版权边界不清，二是笔记没有个人判断，只变成官方材料搬运。

## 视觉素材说明

当前 OpenAI Academy 笔记使用的是 OpenAI 官方页面中实际出现的外链封面图，来源记录在 `src/content/_sources/openai-academy.md`。这些图片没有下载到仓库，也没有重新分发为本地素材。

如果后续发现热链或版权边界不合适，我会把它们替换为自制封面，只保留官方链接作为参考来源。



## 完整版学习稿

### 学习定位

这一页可以当作 **OpenAI Academy 学习路线** 的系统学习稿。它面向准备系统学习 OpenAI 工具、工作流和 AI 应用构建的读者，重点不是背官方术语，而是把页面里的能力、场景和边界转成可以反复使用的工作方法。

### 学习目标

- 把 Academy 看成一张学习地图，而不是孤立文章清单。
- 先建立 AI 基础和 ChatGPT 使用能力，再进入工作、教育、Codex 和 Building with AI。
- 为后续个人学习笔记预留入口：先发布资料整理，之后逐课补上自己的实践心得。

### 官方内容拆解

| 模块 | 学习重点 | 可产出材料 |
| --- | --- | --- |
| AI Fundamentals | 建立概念、边界和责任使用原则 | 概念卡片、安全清单、术语表 |
| Using ChatGPT | 掌握 prompt、文件、研究、图像、Projects、GPTs、Skills 和 Agents | 个人工作流、项目模板、复用 prompt |
| ChatGPT for Work | 把通用能力放进写作、研究、数据分析和岗位工作流 | 角色用例矩阵、团队落地清单 |
| ChatGPT for Education | 按学生、教师、教授、管理者和 IT 角色理解教育场景 | 教学设计、学习支持、学术诚信边界 |
| Codex / Building with AI | 从会用 AI 过渡到会让 AI 参与开发和生产级应用构建 | 工程任务清单、eval/RAG/agent 设计笔记 |

### 实操工作流

1. 先通读总览，确认自己当前是在“使用者”“团队推动者”还是“开发者”阶段。
2. 按模块阅读，每读一篇都记录一个可实践任务，而不是只摘概念。
3. 把重复任务沉淀成 Project、Custom GPT 或 Skill。
4. 遇到行业/教育/工程高风险内容时，先写边界和复核机制。
5. 完成一轮后回到总览页，更新自己的学习路线和待补心得。

### 可复用 Prompt

```text
我正在系统学习 OpenAI Academy。请根据我的目标、时间和当前水平，把这些模块排成 4 周学习计划；每周给阅读重点、实践任务、产出物和复盘问题。
```

### 复核清单

- 输出是否只使用已提供或可追溯的信息，不把推断写成事实。
- 是否标出不确定性、待确认项和需要人工判断的地方。
- 是否给出可执行的下一步，而不是只生成漂亮文字。
- 是否符合团队、学校、公司或行业的隐私与合规要求。

### 学完应该留下什么

学完这一页，最好不要只留下摘要，而是留下 一份可复用的学习笔记、prompt 模板和实践清单。如果以后要补自己的课程心得，可以在这份材料后面继续追加：真实使用场景、失败案例、改进后的 prompt、以及哪些判断必须由人完成。

来源页：https://openai.com/academy/


## 原创学习增强包

### 三档练习

| 时间 | 练习任务 | 交付物 |
| --- | --- | --- |
| 30 分钟 | 只读本页和来源核对区，提炼 5 条最有用的行动建议。 | 一张“今天就能试”的清单 |
| 2 小时 | 用下面的虚构案例跑一遍完整流程，记录输入、输出、修改和复核点。 | 一份可发布的练习记录 |
| 半天 | 把练习结果改造成自己的模板或小项目，并写下失败案例。 | 模板、prompt pack、复盘笔记 |

### 虚构案例

你准备把 OpenAI Academy 作为 6 周公开学习计划，目标是先发布资料整理，再逐步补自己的实操心得。 你可以把输入材料设定为：你的时间预算、当前水平、最想服务的读者、已有文章结构。最后产出 一张 6 周学习路线表、每周产出物、每周复盘问题和后续补课清单。

### 原创 Prompt Pack

1. 请把 OpenAI Academy 拆成 6 周学习路线，每周给主题、必读页、实践产出和复盘问题。
2. 请根据“初学者 / 职场 / 教育 / 工程 / Builder”五类读者，设计不同阅读顺序。
3. 请把这些课程页整理成一个公开博客系列目录，并标出哪些页适合先发布、哪些页适合学完再补心得。
4. 请为每个模块设计一个最终作品，例如 prompt 库、RAG 原型、Codex 工作流或课堂活动包。
5. 请帮我设计一个学习仪表盘，用来追踪阅读、实践、复盘和待补案例。

### 自测问题

- 我能不能用自己的话解释“学习路线总览”解决的核心问题？
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
- 官方页面标题：OpenAI Academy。
- 页面正文规模：约 1288 个字符；检测到 9 个标题节点、17 个图片外链。
- 页面结构：`OpenAI Academy` / `AI fundamentals` / `Getting started with ChatGPT` / `ChatGPT for work` / `ChatGPT for education` / `Codex` / `Codex for work` / `Building with AI` / `Join OpenAI Academy today`。

### 本页实抓内容重写整理

- 官方 hub 页把 Academy 分成 AI 基础、Using ChatGPT、ChatGPT for Work、ChatGPT for Education、Codex、Building with AI 等学习入口。
- 这类页面本身不是一节深课，更像学习地图；整理时重点保留路线、模块关系和后续阅读顺序。
- 页面图片主要是课程卡片视觉素材，适合作为系列导航页的外链封面和模块视觉线索。

### 外链视觉素材

![OpenAI Academy](https://images.ctfassets.net/kftzwdyauwt9/3pOt7hjYa1nUIIMMXdoEhD/b6493d0ba6756155a3ef880758e0a0b0/Academy-SEO.png?w=1600&h=900&fit=fill)

图片来自官方页面外链，本站只引用 URL，不复制图片文件。

## 参考

- [OpenAI Academy](https://openai.com/academy/)
- [OpenAI Academy community](https://academy.openai.com/)
