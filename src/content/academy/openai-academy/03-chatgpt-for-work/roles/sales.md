---
title: "OpenAI Academy 笔记：ChatGPT for Sales Teams"
date: 2026-04-25
category: academy
description: "整理销售团队如何用 ChatGPT 做账户研究、会议准备、跟进、方案和 deal coordination。"
plainSummary: "这篇笔记把 OpenAI Academy 笔记：ChatGPT for Sales Teams 的核心内容整理成可复习、可实践的 03.6 Sales Teams 学习路径。"
difficulty: beginner
coverImage: "https://images.ctfassets.net/kftzwdyauwt9/1R29scy3v5zFLkNH0KaSVt/b8cf3723aecd035b28ce13081f5410cf/sales.png?w=3840&q=90&fm=webp"
lang: zh
academy:
  series: "OpenAI Academy"
  module: "03.6 Sales Teams"
  moduleOrder: 46
  source: "OpenAI Academy"
  sourceUrl: "https://openai.com/academy/sales/"
  prerequisites:
    - "建议先阅读：OpenAI Academy 笔记：ChatGPT for Work"
draft: false
---

**说明：** 本文整理销售团队应用路线。

## 核心问题

销售工作的瓶颈常在研究、准备、跟进和内部协调。ChatGPT 可以把账户资料、通话记录、CRM 信息和产品材料转成可行动输出，让销售把更多时间留给客户对话。

## 典型场景

| 场景 | 输出 |
| --- | --- |
| Account research | 账户 brief、行业背景、利益相关者假设 |
| Discovery | 问题清单、qualification 摘要、风险信号 |
| Meeting prep | 议程、预读材料、会后行动项 |
| Outreach | 邮件、LinkedIn 信息、跟进话术 |
| Proposal | 价值主张、ROI 结构、执行摘要 |
| Deal management | Mutual action plan、close plan、下一步建议 |

## 好的销售 prompt

```text
请基于以下账户资料，生成一份 1 页 sales call prep。
包括：客户背景、可能痛点、需要验证的假设、3 个 discovery questions、会后跟进模板。
不要编造客户事实；不确定的地方标为待确认。
```

## 风险

销售内容最怕“泛泛而谈”和“过度承诺”。所有客户事实、竞品说法、价格和安全答复都需要复核。



## 完整版学习稿

### 学习定位

这一页可以当作 **ChatGPT for Sales Teams** 的系统学习稿。它面向销售、售前、BD 和客户拓展团队，重点不是背官方术语，而是把页面里的能力、场景和边界转成可以反复使用的工作方法。

### 学习目标

- 把账户研究、会议准备、跟进和 deal coordination 标准化。
- 让模型整理 CRM、call notes 和公开资料，但不编造客户事实。
- 把更多时间留给真实客户对话。

### 官方内容拆解

| 模块 | 学习重点 | 可产出材料 |
| --- | --- | --- |
| Account research | 公司、行业、利益相关者、触发事件 | account brief |
| Discovery | 痛点、成功标准、风险 | question guide |
| Meeting follow-up | 通话摘要、行动项、owner | recap email |
| Proposal | 价值、ROI、实施路径 | proposal outline |
| Deal management | 下一步、风险、内部协同 | mutual action plan |

### 实操工作流

1. 整理账户资料和已有互动。
2. 让模型输出 call prep 和待验证假设。
3. 会后把 notes 转成 recap 和 action items。
4. 针对客户语言改写方案和商业价值。
5. 定期更新风险、owner 和下一步。

### 可复用 Prompt

```text
请基于以下账户资料生成 sales call prep：客户背景、可能痛点、待验证假设、discovery questions、风险信号和会后跟进模板。不要编造客户事实，不确定处标为待确认。
```

### 复核清单

- 输出是否只使用已提供或可追溯的信息，不把推断写成事实。
- 是否标出不确定性、待确认项和需要人工判断的地方。
- 是否给出可执行的下一步，而不是只生成漂亮文字。
- 是否符合团队、学校、公司或行业的隐私与合规要求。

### 学完应该留下什么

学完这一页，最好不要只留下摘要，而是留下 一份可复用的学习笔记、prompt 模板和实践清单。如果以后要补自己的课程心得，可以在这份材料后面继续追加：真实使用场景、失败案例、改进后的 prompt、以及哪些判断必须由人完成。

来源页：https://openai.com/academy/sales/

## 官方 use cases 细化

Sales 页覆盖的是从 prospecting 到 deal execution 的整条链路。

| Area | 常见场景 | ChatGPT 适合产出 | 销售人员要补上的判断 |
| --- | --- | --- | --- |
| Prospecting and account research | 研究账户、行业、利益相关者 | account brief、stakeholder hypothesis、discovery angle | 账户真实优先级和内部关系 |
| Discovery and qualification | 准备 discovery、明确 use case 和 success criteria | discovery guide、qualification summary、risk flags | 客户是否真的有痛点和预算 |
| Meeting prep and debrief | 会前预读、会后整理 | agenda、call summary、action items、follow-up email | 下一步是否具体、owner 是否明确 |
| Outreach sequences | 邮件、LinkedIn、多触点节奏 | subject line、sequence draft、objection snippet | 是否过度模板化，是否足够相关 |
| Proposal and business case | 价值表达、ROI、方案包装 | proposal outline、ROI model structure、exec summary | ROI 假设、价格、合同和承诺边界 |
| Deal management | 跟踪进展、协调内部团队 | decision log、stakeholder update、next-step plan | 交易状态是否真实，风险是否被低估 |

这里最需要避免的是“看似个性化”的泛化话术。好的销售使用方式应该始终回到账户上下文、客户语言和下一步行动。


## 原创学习增强包

### 三档练习

| 时间 | 练习任务 | 交付物 |
| --- | --- | --- |
| 30 分钟 | 只读本页和来源核对区，提炼 5 条最有用的行动建议。 | 一张“今天就能试”的清单 |
| 2 小时 | 用下面的虚构案例跑一遍完整流程，记录输入、输出、修改和复核点。 | 一份可发布的练习记录 |
| 半天 | 把练习结果改造成自己的模板或小项目，并写下失败案例。 | 模板、prompt pack、复盘笔记 |

### 虚构案例

一个销售要见虚构客户 BlueRiver Ops，需要准备 discovery、跟进和内部同步。 你可以把输入材料设定为：账户资料、行业背景、过往互动、产品价值、下一步目标。最后产出 account brief、discovery guide、follow-up email、deal risk list。

### 原创 Prompt Pack

1. 请为这个账户生成 sales call prep。
2. 请列出 8 个 discovery questions，并说明每个问题验证什么假设。
3. 请把会后 notes 整理成客户 follow-up email。
4. 请为内部团队写 deal summary，包含风险和下一步。
5. 请检查这份方案是否存在过度承诺或泛化话术。

### 自测问题

- 我能不能用自己的话解释“ChatGPT for Sales Teams”解决的核心问题？
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

- 场景类型：团队业务流程
- 建议任务：选择一个真实但可以脱敏的团队任务，从输入整理到交付复盘跑一遍
- 输入材料：业务目标、受众、现有资料、品牌/流程约束、指标
- 目标产物：brief、memo、表格、复盘或下一步行动清单
- 关键边界：事实准确性、团队口径、客户/公司敏感信息

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
- 官方页面标题：ChatGPT for sales teams。
- 页面正文规模：约 16559 个字符；检测到 8 个标题节点、3 个图片外链。
- 页面结构：`ChatGPT for sales teams` / `Why sales teams use ChatGPT?` / `Key use cases for sales teams` / `How teams use ChatGPT effectively` / `Key features for sales teams` / `Measuring impact` / `Continue learning with OpenAI Academy` / `Keep reading`。

### 本页实抓内容重写整理

- Sales 页聚焦 account research、discovery、meeting prep、outreach、proposal、business case 和 deal management。
- 它强调 ChatGPT 能把 CRM、call notes 和 account context 变成 briefs、emails、plans 和 stakeholder summaries。
- 整理时应避免泛化销售话术，强调客户具体情境、下一步动作和内部协同。

### 外链视觉素材

![ChatGPT for sales teams](https://images.ctfassets.net/kftzwdyauwt9/1R29scy3v5zFLkNH0KaSVt/b8cf3723aecd035b28ce13081f5410cf/sales.png?w=3840&q=90&fm=webp)

图片来自官方页面外链，本站只引用 URL，不复制图片文件。

## 参考

- [ChatGPT for sales teams](https://openai.com/academy/sales/)
