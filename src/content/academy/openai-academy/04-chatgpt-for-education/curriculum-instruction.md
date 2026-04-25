---
title: "OpenAI Academy 笔记：Curriculum and Instruction"
date: 2026-04-25
category: academy
description: "整理课程与教学设计团队如何用 ChatGPT 辅助标准对齐、rubric、材料改写和评价设计。"
coverImage: "https://images.ctfassets.net/kftzwdyauwt9/2yQ8xu6mS72v7qWA3ToiSU/cd1c9e16fd454fff099297f3087b2a65/curriculum-instruction.png?w=3840&q=90&fm=webp"
tags:
  - "OpenAI/Academy"
  - "课程笔记"
  - "ChatGPT/Education"
  - "Curriculum"
lang: zh
academy:
  series: "OpenAI Academy"
  module: "04.4 Curriculum and Instruction"
  moduleOrder: 64
  source: "OpenAI Academy"
  sourceUrl: "https://openai.com/academy/chatgpt-for-education/"
  prerequisites:
    - "建议先阅读：OpenAI Academy 笔记：Teachers"
draft: false
---

**说明：** 本文整理课程设计视角。

## 核心问题

课程与教学团队需要保证材料、活动、评价和标准一致。ChatGPT 可以帮助形成初稿和检查表，但标准解释与最终采纳必须由教育专业人员决定。

## 可用场景

| 场景 | AI 辅助 |
| --- | --- |
| Standards alignment | 把学习活动映射到标准 |
| Rubric design | 生成评价维度、等级描述和示例 |
| Material adaptation | 按年级、语言能力、阅读水平改写 |
| Assessment design | 设计形成性评价和复习题 |
| Teacher support | 给教师生成实施建议和常见误解提示 |

## 使用原则

课程内容要避免“看起来合理但没有对齐目标”。每个 AI 生成材料都要回到学习目标、标准和学生实际情况中复核。



## 完整版学习稿

### 学习定位

这一页可以当作 **Curriculum and Instruction** 的系统学习稿。它面向课程设计、教研、教学支持团队，重点不是背官方术语，而是把页面里的能力、场景和边界转成可以反复使用的工作方法。

### 学习目标

- 用 ChatGPT 辅助课程地图、学习目标、评估和教学材料设计。
- 保持标准对齐、年龄适配和公平可及。
- 让课程设计从草稿生成走向可审查的教学系统。

### 官方内容拆解

| 模块 | 学习重点 | 可产出材料 |
| --- | --- | --- |
| Standards alignment | 标准、目标、能力 | alignment table |
| Unit design | 主题、活动、评估 | unit plan |
| Materials | 讲义、练习、rubric | 资源包 |
| Differentiation | 不同学生支持 | 分层材料 |
| Review | 偏见、难度、可访问性 | 审查清单 |

### 实操工作流

1. 输入课程标准和学生画像。
2. 生成学习目标和评估证据。
3. 设计活动和材料。
4. 检查难度、包容性和可访问性。
5. 用教师反馈迭代。

### 可复用 Prompt

```text
请基于这些课程标准设计一个 unit plan。请给学习目标、核心问题、活动、形成性/总结性评估、分层支持、rubric 和审查清单。
```

### 复核清单

- 输出是否只使用已提供或可追溯的信息，不把推断写成事实。
- 是否标出不确定性、待确认项和需要人工判断的地方。
- 是否给出可执行的下一步，而不是只生成漂亮文字。
- 是否符合团队、学校、公司或行业的隐私与合规要求。

### 学完应该留下什么

学完这一页，最好不要只留下摘要，而是留下 一份可复用的学习笔记、prompt 模板和实践清单。如果以后要补自己的课程心得，可以在这份材料后面继续追加：真实使用场景、失败案例、改进后的 prompt、以及哪些判断必须由人完成。

来源页：https://openai.com/academy/chatgpt-for-education/


## 原创学习增强包

### 三档练习

| 时间 | 练习任务 | 交付物 |
| --- | --- | --- |
| 30 分钟 | 只读本页和来源核对区，提炼 5 条最有用的行动建议。 | 一张“今天就能试”的清单 |
| 2 小时 | 用下面的虚构案例跑一遍完整流程，记录输入、输出、修改和复核点。 | 一份可发布的练习记录 |
| 半天 | 把练习结果改造成自己的模板或小项目，并写下失败案例。 | 模板、prompt pack、复盘笔记 |

### 虚构案例

课程设计团队要把一个主题做成完整 unit，并对齐标准和评估。 你可以把输入材料设定为：课程标准、学生画像、课时、评估要求、资源限制。最后产出 unit plan、alignment table、rubric、分层支持。

### 原创 Prompt Pack

1. 请把这些标准转成学习目标。
2. 请设计一个完整 unit plan。
3. 请生成形成性和总结性评估。
4. 请为不同学生需求提供分层支持。
5. 请检查课程材料的公平性、可访问性和年龄适配。

### 自测问题

- 我能不能用自己的话解释“Curriculum and Instruction”解决的核心问题？
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

- 场景类型：教育/学习场景
- 建议任务：选择一个不会违反课程或学校规则的教学、学习支持或行政任务
- 输入材料：课程目标、学生水平、规则边界、评价标准、时间预算
- 目标产物：学习活动设计、反馈清单、复习计划或行政草稿
- 关键边界：学术诚信、学生隐私、教师最终判断

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
- 官方页面标题：ChatGPT for education。
- 页面正文规模：约 1328 个字符；检测到 6 个标题节点、11 个图片外链。
- 页面结构：`ChatGPT for education` / `Learn through events and workshops` / `Getting started with ChatGPT` / `ChatGPT for work` / `AI fundamentals` / `Join OpenAI Academy today`。

### 本页实抓内容重写整理

- Education 总览页把 ChatGPT for Education 的学习对象拆成 students、teachers、faculty、admins、IT leadership 和 staff。
- 页面更像角色导航，帮助教育场景按职责寻找对应资源。
- 整理时可以为不同角色补充应用边界：教学设计、学习支持、行政效率、隐私和学术诚信。

### 外链视觉素材

![ChatGPT for education](https://images.ctfassets.net/kftzwdyauwt9/2yQ8xu6mS72v7qWA3ToiSU/cd1c9e16fd454fff099297f3087b2a65/curriculum-instruction.png?w=3840&q=90&fm=webp)

图片来自官方页面外链，本站只引用 URL，不复制图片文件。

## 参考

- [ChatGPT for education](https://openai.com/academy/chatgpt-for-education/)
