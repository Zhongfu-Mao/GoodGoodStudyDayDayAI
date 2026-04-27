---
title: "OpenAI Academy 笔记：Research with ChatGPT"
date: 2026-04-25
category: academy
description: "对比 ChatGPT search 和 deep research，整理从问题到有来源结论的研究工作流。"
plainSummary: "这篇笔记把 OpenAI Academy 笔记：Research with ChatGPT 的核心内容整理成可复习、可实践的 02.5 Research with ChatGPT 学习路径。"
difficulty: beginner
coverImage: "https://images.ctfassets.net/kftzwdyauwt9/6vCtWVZH9dyolSQQhXzGyx/686abd0c6c92eb96129cb71f6ab7917e/search-deep-research.png?w=3840&q=90&fm=webp"
tags:
  - "ChatGPT/Research"
lang: zh
academy:
  series: "OpenAI Academy"
  module: "02.5 Research with ChatGPT"
  moduleOrder: 25
  source: "OpenAI Academy"
  sourceUrl: "https://openai.com/academy/search-and-deep-research/"
  prerequisites:
    - "建议先阅读：OpenAI Academy 笔记：Working with Files in ChatGPT"
draft: false
---

**说明：** 本文整理 search 和 deep research 的差异，重点是何时用哪一种。

## 这节课解决什么问题

ChatGPT 的研究能力有两种常见入口：search 和 deep research。两者都能接触新信息，但用途不同。

| 能力 | 适合 |
| --- | --- |
| Search | 快速找事实、近期信息、单点资料、官方链接 |
| Deep research | 多步骤问题、开放式调研、跨来源综合、战略判断 |

## Search 的用法

Search 适合“我需要新信息”而不是“我需要长期研究”。例如查最新产品说明、近期公告、竞品新闻、某个政策日期。关键是打开来源链接，不把摘要当最终事实。

## Deep research 的用法

Deep research 更像一个研究代理：它会规划查询、检索多个来源、比较材料、综合结论。适合主题复杂、信息分散、没有单一答案的问题。

可用模板：

```text
我正在研究 [主题]，目的是 [决策/文章/会议]。
请先列出研究问题和信息缺口，再做 deep research。
输出要区分：确定事实、趋势判断、仍需验证的假设。
每个关键结论都要附来源。
```

## 决策规则

| 你要的是 | 用 |
| --- | --- |
| 一个日期、链接、新闻、规格 | Search |
| 一份对比表、趋势判断、风险清单 | Deep research |
| 内部材料结合外部信息 | Files + Search |
| 公开发布的研究稿 | Deep research + 人工复核 |

## 官方页面的关键区别

Browser Use 抽取到的页面结构把研究分成两个部分：ChatGPT search 和 deep research。

Search 的重点是把最新公开信息带进对话，适合快速确认、近期变化和单点问题。Deep research 的重点是 agentic research：它会规划多步搜索、评估来源、调整查询并综合结果，适合复杂问题。

所以不是所有研究都应该 deep research。问题越清楚、答案越单点，就越适合 search；问题越开放、来源越分散，就越适合 deep research。

## 练习

用同一个主题分别跑一次 search 和 deep research，然后比较：

| 比较项 | Search | Deep research |
| --- | --- | --- |
| 用时 | 更短 | 更长 |
| 来源数量 | 少 | 多 |
| 输出形态 | 答案或摘要 | 研究报告 |
| 适合后续 | 快速判断 | 写作、决策、方案 |

## 本站用途

做 Radar 时，search 更合适；做 Engineering 或 Foundations 草稿前的选题研究，deep research 更合适。正式文章仍然要人工审来源，尤其不能把模型综合出来的判断当成引用本身。



## 完整版学习稿

### 学习定位

这一页可以当作 **Research with ChatGPT** 的系统学习稿。它面向需要从问题走向证据和决策的人，重点不是背官方术语，而是把页面里的能力、场景和边界转成可以反复使用的工作方法。

### 学习目标

- 区分快速 Search 和多步骤 Deep Research。
- 学会指定时间范围、优先来源和输出结构。
- 把结论、证据、推断和待验证点分开。

### 官方内容拆解

| 模块 | 学习重点 | 可产出材料 |
| --- | --- | --- |
| Search | 快速了解最新情况或概念定位 | 带日期和链接的摘要 |
| Deep Research | 多步骤、多来源综合 | 研究 brief、竞品表、政策分析 |
| Source review | 比较来源可靠性和立场 | 来源矩阵、证据等级 |
| Decision memo | 把研究转成建议 | 发现、影响、风险、下一步 |

### 实操工作流

1. 把模糊问题改成研究问题。
2. 指定时间范围、地域、来源偏好和排除项。
3. 先让模型列研究计划和子问题。
4. 要求输出引用、证据强弱和冲突点。
5. 在重要结论上打开原始来源复核。

### 可复用 Prompt

```text
请对[主题]做研究。时间范围是[范围]，优先使用[来源类型]。请先列研究计划和子问题，再输出结构化 brief：事实发现、来源链接、证据强弱、矛盾点、对[我的场景]的影响。
```

### 复核清单

- 输出是否只使用已提供或可追溯的信息，不把推断写成事实。
- 是否标出不确定性、待确认项和需要人工判断的地方。
- 是否给出可执行的下一步，而不是只生成漂亮文字。
- 是否符合团队、学校、公司或行业的隐私与合规要求。

### 学完应该留下什么

学完这一页，最好不要只留下摘要，而是留下 一份可复用的学习笔记、prompt 模板和实践清单。如果以后要补自己的课程心得，可以在这份材料后面继续追加：真实使用场景、失败案例、改进后的 prompt、以及哪些判断必须由人完成。

来源页：https://openai.com/academy/search-and-deep-research/


## 原创学习增强包

### 三档练习

| 时间 | 练习任务 | 交付物 |
| --- | --- | --- |
| 30 分钟 | 只读本页和来源核对区，提炼 5 条最有用的行动建议。 | 一张“今天就能试”的清单 |
| 2 小时 | 用下面的虚构案例跑一遍完整流程，记录输入、输出、修改和复核点。 | 一份可发布的练习记录 |
| 半天 | 把练习结果改造成自己的模板或小项目，并写下失败案例。 | 模板、prompt pack、复盘笔记 |

### 虚构案例

你要把“Research with ChatGPT”这篇笔记变成可操作的学习任务，而不是只读摘要。 你可以把输入材料设定为：当前笔记、你的学习目标、目标读者、可投入时间。最后产出 练习记录、prompt 模板、复盘问题和公开发布检查表。

### 原创 Prompt Pack

1. 请把“Research with ChatGPT”整理成 30 分钟练习。
2. 请围绕“Research with ChatGPT”设计一个虚构案例。
3. 请为“Research with ChatGPT”生成 5 个原创 prompt。
4. 请列出学习“Research with ChatGPT”后应该能回答的自测题。
5. 请检查这篇笔记公开发布前还有哪些风险。

### 自测问题

- 我能不能用自己的话解释“Research with ChatGPT”解决的核心问题？
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
- 官方页面标题：Research with ChatGPT。
- 页面正文规模：约 5524 个字符；检测到 6 个标题节点、3 个图片外链。
- 页面结构：`Research with ChatGPT` / `ChatGPT search` / `Deep research` / `Search vs. deep research` / `Continue learning with OpenAI Academy` / `Keep reading`。

### 本页实抓内容重写整理

- 官方页区分 ChatGPT search 和 deep research：前者适合快速获取最新信息，后者适合多步骤研究和综合报告。
- 它强调引用、来源对比、问题拆解和最终 synthesis，因此比普通聊天更适合资料整理。
- 整理时应把“快搜定位”和“深研成稿”拆开讲，并提醒读者检查日期、来源质量和结论边界。

### 外链视觉素材

![Research with ChatGPT](https://images.ctfassets.net/kftzwdyauwt9/6vCtWVZH9dyolSQQhXzGyx/686abd0c6c92eb96129cb71f6ab7917e/search-deep-research.png?w=3840&q=90&fm=webp)

图片来自官方页面外链，本站只引用 URL，不复制图片文件。

## 参考

- [Research with ChatGPT](https://openai.com/academy/search-and-deep-research/)
