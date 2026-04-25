---
title: "OpenAI Academy 笔记：Building with AI"
date: 2026-04-25
category: academy
description: "把 OpenAI Academy 的 Building with AI 路线整理成从工具使用到系统构建的学习框架。"
coverImage: "https://images.ctfassets.net/kftzwdyauwt9/16ClwJMGpPN3flMrO4DXyL/2a38515d0d3a674161bfa796e87e3889/Cover-building.png?w=3840&q=90&fm=webp"
tags:
  - "OpenAI/Academy"
  - "课程笔记"
  - "Building with AI"
  - "AI Engineering"
lang: zh
academy:
  series: "OpenAI Academy"
  module: "04 Building with AI"
  moduleOrder: 100
  source: "OpenAI Academy"
  sourceUrl: "https://openai.com/academy/building-with-ai/"
  prerequisites:
    - "建议先阅读：OpenAI Academy 笔记：AI Fundamentals"
    - "建议先阅读：OpenAI Academy 笔记：Codex"
draft: false
---

**说明：** 本文是 Building with AI 的学习路线笔记。它不展开具体 API 细节，而是先整理“从会用 AI 到会构建 AI 系统”的能力地图。

## 这节课解决什么问题

Building with AI 的定位是构建 AI 系统，而不只是使用 AI 工具。OpenAI Academy 当前把它拆成四个方向：

| 方向 | 学习目标 |
| --- | --- |
| Codex for builders | 用 Codex 做真实编码任务和开发工作流 |
| Technical learning tracks | 按步骤学习如何构建和使用 AI 系统 |
| AI techniques | 学习 prompting、方法和 AI 协作技术 |
| Solution packs and patterns | 用可复用方案解决真实业务问题 |

这条路线适合从 Academy 过渡到 Engineering 分区。Academy 负责理解学习路径，Engineering 负责把模式做成可复现实现。

## 从工具使用到系统构建

可以把 AI 使用成熟度分成四层：

| 层级 | 典型行为 | 主要风险 |
| --- | --- | --- |
| 使用工具 | 用 ChatGPT 或 Codex 完成单次任务 | 输出不稳定、依赖人工搬运上下文 |
| 组织工作流 | 用 Projects、Skills、Codex 线程管理重复任务 | 流程边界不清、复核不足 |
| 构建应用 | 调用 API，把模型嵌进产品或内部系统 | 评估、权限、成本、延迟、数据治理 |
| 形成模式 | 把一类问题沉淀成模板、脚本、组件或 solution pack | 过度抽象、场景迁移失败 |

Building with AI 的核心在第三层和第四层：让 AI 成为系统的一部分，而不是临时打开一个聊天窗口。

## 系统构建要补的能力

从本站角度，Building with AI 至少要补五类能力：

1. **任务设计**：识别哪些环节适合模型，哪些环节必须由人或传统程序处理。
2. **上下文设计**：决定输入材料、检索、文件、会话状态和用户意图怎样进入模型。
3. **工具设计**：让模型能调用搜索、数据库、代码、邮件、日历等外部能力。
4. **评估设计**：用测试集、人工标注、日志和回归检查衡量质量。
5. **运营设计**：处理成本、权限、审计、安全和持续更新。

只会 prompt 还不够。系统构建需要把 prompt 放进更大的工程闭环里。

## 可复用工作流

每次想做一个 AI 功能，可以先填这张表：

| 问题 | 示例答案 |
| --- | --- |
| 用户要完成什么任务 | 把一组资料整理成课程笔记 |
| 模型负责哪一步 | 提炼结构、生成草稿、发现缺口 |
| 程序负责哪一步 | 读取文件、校验 frontmatter、跑构建检查 |
| 人负责哪一步 | 选题、事实复核、语气调整、发布判断 |
| 如何验证 | `npm run check`、链接检查、人工审读 |
| 失败时怎么办 | 保留 draft，标注 `[NEEDS-CHECK]`，回到材料源 |

这个表可以直接转成 Engineering 文章模板。

## 和本站内容区的关系

OpenAI Academy 的 Building with AI 应该先放在 Academy 里作为学习路线笔记。等某个模式被实际跑通，再沉淀到 Engineering：

| Academy 笔记 | Engineering 文章 |
| --- | --- |
| Building with AI：学习路线 | 用 Codex 批量生成课程笔记的可复现流程 |
| AI techniques：方法概览 | RAG 评估脚本最小实现 |
| Solution packs：模式清单 | 面向个人知识库的搜索和总结管线 |

也就是说，Academy 负责“我学到了什么”，Engineering 负责“我跑通了什么”。



## 完整版学习稿

### 学习定位

这一页可以当作 **Building with AI 总览** 的系统学习稿。它面向想从使用 AI 走向构建 AI 应用的 builders，重点不是背官方术语，而是把页面里的能力、场景和边界转成可以反复使用的工作方法。

### 学习目标

- 理解 building 不只是调 API，而是需求、数据、评估、上线和优化的系统。
- 建立 agents、RAG、evals、production optimization 的学习路线。
- 把每个技术主题都连接到可验证的产品目标。

### 官方内容拆解

| 模块 | 学习重点 | 可产出材料 |
| --- | --- | --- |
| Problem framing | 用户、场景、成功指标 | product brief |
| Architecture | model、tools、RAG、agents | 系统设计 |
| Evaluation | 测试集、rubric、指标 | eval suite |
| Production | 安全、延迟、成本、监控 | 上线清单 |
| Iteration | 反馈、日志、优化 | 改进路线 |

### 实操工作流

1. 先写清应用要帮谁完成什么任务。
2. 选择最简单可行架构。
3. 尽早设计 eval，而不是上线后再想。
4. 把隐私、安全、成本和延迟列入验收。
5. 用真实用户反馈迭代。

### 可复用 Prompt

```text
请帮我把这个 AI 应用想法整理成 build plan：用户场景、核心任务、架构选择、是否需要 RAG/agent、eval 设计、上线风险和 2 周原型计划。
```

### 复核清单

- 输出是否只使用已提供或可追溯的信息，不把推断写成事实。
- 是否标出不确定性、待确认项和需要人工判断的地方。
- 是否给出可执行的下一步，而不是只生成漂亮文字。
- 是否符合团队、学校、公司或行业的隐私与合规要求。

### 学完应该留下什么

学完这一页，最好不要只留下摘要，而是留下 一份可复用的学习笔记、prompt 模板和实践清单。如果以后要补自己的课程心得，可以在这份材料后面继续追加：真实使用场景、失败案例、改进后的 prompt、以及哪些判断必须由人完成。

来源页：https://openai.com/academy/building-with-ai/


## 原创学习增强包

### 三档练习

| 时间 | 练习任务 | 交付物 |
| --- | --- | --- |
| 30 分钟 | 只读本页和来源核对区，提炼 5 条最有用的行动建议。 | 一张“今天就能试”的清单 |
| 2 小时 | 用下面的虚构案例跑一遍完整流程，记录输入、输出、修改和复核点。 | 一份可发布的练习记录 |
| 半天 | 把练习结果改造成自己的模板或小项目，并写下失败案例。 | 模板、prompt pack、复盘笔记 |

### 虚构案例

你有一个 AI 应用想法，需要从问题定义走到可验证原型。 你可以把输入材料设定为：用户、任务、数据、约束、成功指标、上线风险。最后产出 产品 brief、系统草图、eval 计划、两周原型路线。

### 原创 Prompt Pack

1. 请把这个 AI 应用想法整理成产品 brief。
2. 请判断是否需要 RAG、agent、工具调用或普通聊天就够。
3. 请设计两周原型计划和验收标准。
4. 请为这个应用写 eval 方案。
5. 请列出上线前必须解决的安全、成本和延迟风险。

### 自测问题

- 我能不能用自己的话解释“Building with AI”解决的核心问题？
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
- 官方页面标题：Building with AI。
- 页面正文规模：约 826 个字符；检测到 5 个标题节点、7 个图片外链。
- 页面结构：`Building with AI` / `Codex` / `Getting started with ChatGPT` / `ChatGPT for work` / `Join OpenAI Academy today`。

### 本页实抓内容重写整理

- Building with AI 总览页是 builders 课程入口，面向想设计、构建和优化 AI 应用的人。
- 页面内容较短，但指向 agents、RAG、evals、production optimization 等后续主题。
- 整理时适合做路线图：先会用，再会搭，再会评估和上线。

### 外链视觉素材

![Building with AI](https://images.ctfassets.net/kftzwdyauwt9/16ClwJMGpPN3flMrO4DXyL/2a38515d0d3a674161bfa796e87e3889/Cover-building.png?w=3840&q=90&fm=webp)

图片来自官方页面外链，本站只引用 URL，不复制图片文件。

## 参考

- [Building with AI](https://openai.com/academy/building-with-ai/)
- [Codex](https://openai.com/academy/codex/)
