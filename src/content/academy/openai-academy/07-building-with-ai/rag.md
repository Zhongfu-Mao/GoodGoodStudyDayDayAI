---
title: "OpenAI Academy 笔记：RAG"
date: 2026-04-25
category: academy
description: "整理 RAG 的学习重点：检索、上下文、来源、grounding 和评估。"
plainSummary: "这篇笔记把 OpenAI Academy 笔记：RAG 的核心内容整理成可复习、可实践的 07.4 RAG 学习路径。"
difficulty: intermediate
coverImage: "https://images.ctfassets.net/kftzwdyauwt9/5xMpq7Q0JXMzdCm5GmMQc8/c32a4332c00d64537cc569e015587356/packs-patterns.png?w=3840&q=90&fm=webp"
tags:
  - "RAG"
  - "AI Engineering"
lang: zh
academy:
  series: "OpenAI Academy"
  module: "07.4 RAG"
  moduleOrder: 104
  source: "OpenAI Academy"
  sourceUrl: "https://academy.openai.com/home/clubs/builders-etkn1/resources/builder-bootcamp-2026-04-22"
  prerequisites:
    - "建议先阅读：OpenAI Academy 笔记：Research with ChatGPT"
draft: false
---

**说明：** 本文整理 Builder Bootcamp 中 RAG 主题。

## RAG 解决什么问题

RAG 让模型回答时基于外部资料，而不是只依赖训练中学到的知识。它适合文档问答、内部知识库、课程资料检索和需要来源支撑的应用。

## 学习重点

| 组件 | 关注点 |
| --- | --- |
| 数据准备 | 文档切分、元数据、更新频率 |
| 检索 | 搜到相关材料，而不是只搜到相似词 |
| 上下文注入 | 把材料放进模型可用的提示中 |
| 答案生成 | 明确引用来源，不超出材料 |
| 评估 | 检查是否漏检、误引、编造 |

## 本站实践方向

可以为 Academy 课程源做一个小型 RAG：用 source inventory 和本地笔记检索相关来源，再生成草稿大纲。正式内容仍需人工重写。



## 完整版学习稿

### 学习定位

这一页可以当作 **RAG** 的系统学习稿。它面向需要让 AI 基于私有资料、文档库或知识库回答的人，重点不是背官方术语，而是把页面里的能力、场景和边界转成可以反复使用的工作方法。

### 学习目标

- 理解 RAG 解决的是“让模型引用外部知识”的问题。
- 知道检索质量、分块、元数据和引用比模型本身同样重要。
- 建立回答可追溯和知识库可维护的设计习惯。

### 官方内容拆解

| 模块 | 学习重点 | 可产出材料 |
| --- | --- | --- |
| Corpus | 资料来源、权限、更新频率 | 知识库范围 |
| Chunking | 分块大小、结构、上下文 | 可检索单位 |
| Retrieval | 向量、关键词、混合检索、rerank | 相关片段 |
| Generation | 基于片段回答并引用 | source-grounded answer |
| Evaluation | 命中率、答案正确性、幻觉率 | RAG eval |

### 实操工作流

1. 定义知识库范围和使用场景。
2. 清理资料并保留元数据。
3. 设计分块和检索策略。
4. 要求回答带来源和不确定性。
5. 用真实问题评估命中率和答案质量。

### 可复用 Prompt

```text
请帮我设计一个 RAG 系统。资料是[资料类型]，用户问题是[场景]。请给出数据准备、chunking、检索策略、回答格式、引用方式和 eval 方案。
```

### 复核清单

- 输出是否只使用已提供或可追溯的信息，不把推断写成事实。
- 是否标出不确定性、待确认项和需要人工判断的地方。
- 是否给出可执行的下一步，而不是只生成漂亮文字。
- 是否符合团队、学校、公司或行业的隐私与合规要求。

### 学完应该留下什么

学完这一页，最好不要只留下摘要，而是留下 一份可复用的学习笔记、prompt 模板和实践清单。如果以后要补自己的课程心得，可以在这份材料后面继续追加：真实使用场景、失败案例、改进后的 prompt、以及哪些判断必须由人完成。

来源页：https://academy.openai.com/home/clubs/builders-etkn1/resources/builder-bootcamp-2026-04-22


## 原创学习增强包

### 三档练习

| 时间 | 练习任务 | 交付物 |
| --- | --- | --- |
| 30 分钟 | 只读本页和来源核对区，提炼 5 条最有用的行动建议。 | 一张“今天就能试”的清单 |
| 2 小时 | 用下面的虚构案例跑一遍完整流程，记录输入、输出、修改和复核点。 | 一份可发布的练习记录 |
| 半天 | 把练习结果改造成自己的模板或小项目，并写下失败案例。 | 模板、prompt pack、复盘笔记 |

### 虚构案例

你要为自己的课程笔记做一个小型 RAG，让它只能基于本地笔记和来源记录回答。 你可以把输入材料设定为：文档集合、用户问题、权限、更新频率、引用要求。最后产出 RAG 架构、chunking 规则、引用格式、eval 问题集。

### 原创 Prompt Pack

1. 请为这个文档集合设计 RAG 架构。
2. 请给出 chunking 和 metadata 策略。
3. 请设计回答格式，要求引用来源和说明不确定性。
4. 请生成 20 个 RAG eval 问题，覆盖事实、综合和边界。
5. 请诊断这个 RAG 可能出现的漏检、误引和幻觉风险。

### 自测问题

- 我能不能用自己的话解释“RAG”解决的核心问题？
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

- 场景类型：AI 应用构建
- 建议任务：选择一个小型产品环节，例如检索、eval、agent 流程或上线监控，做成最小可验证设计
- 输入材料：用户场景、数据来源、失败模式、评估标准、部署约束
- 目标产物：架构草图、eval 集、prompt/工具设计、监控清单
- 关键边界：可追溯来源、评估覆盖、权限和生产环境安全

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
- 官方页面标题：Builder Bootcamp。
- 页面正文规模：约 2137 个字符；检测到 8 个标题节点、2 个图片外链。
- 页面结构：`Builder Bootcamp` / `A virtual event series for builders learning to design, build, and optimize production-grade AI applications with OpenAI.` / `Series overview` / `What to expect` / `Who should attend` / `Upcoming sessions` / `Popular` / `Related`。

### 本页实抓内容重写整理

- Builder Bootcamp 是 builders 的系列活动页，主题是设计、构建和优化生产级 AI 应用。
- 页面介绍 series overview、参与对象、期待内容和 upcoming sessions。
- 本站多篇 Building with AI 笔记可以先以它作为课程入口，后续再把每场 session 学完后补成独立详解。

### 外链视觉素材

![Builder Bootcamp](https://images.ctfassets.net/kftzwdyauwt9/5xMpq7Q0JXMzdCm5GmMQc8/c32a4332c00d64537cc569e015587356/packs-patterns.png?w=3840&q=90&fm=webp)

图片来自官方页面外链，本站只引用 URL，不复制图片文件。

## 参考

- [Builder Bootcamp](https://academy.openai.com/home/clubs/builders-etkn1/resources/builder-bootcamp-2026-04-22)
