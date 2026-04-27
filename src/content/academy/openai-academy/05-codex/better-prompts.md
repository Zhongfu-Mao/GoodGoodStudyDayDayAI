---
title: "OpenAI Academy 笔记：Write Better Prompts for Codex"
date: 2026-04-25
category: academy
description: "把 Codex prompt 写成可执行任务单，而不是普通聊天问题。"
plainSummary: "这篇笔记把 OpenAI Academy 笔记：Write Better Prompts for Codex 的核心内容整理成可复习、可实践的 05.3 Better Codex Prompts 学习路径。"
difficulty: intermediate
coverImage: "https://images.ctfassets.net/kftzwdyauwt9/1YcLAu9OdRty21jeeKHSmK/2ed897dec9d31f58f63b7c8f3d82cb94/prompts-codex.png?w=3840&q=90&fm=webp"
tags:
  - "Codex"
  - "Prompting"
lang: zh
academy:
  series: "OpenAI Academy"
  module: "05.3 Better Codex Prompts"
  moduleOrder: 83
  source: "OpenAI Developers"
  sourceUrl: "https://developers.openai.com/codex/learn/best-practices"
  prerequisites:
    - "建议先阅读：OpenAI Academy 笔记：Codex Use Cases"
draft: false
---

**说明：** 本文整理 Codex prompt 写法。

## Codex prompt 和 ChatGPT prompt 的差别

ChatGPT prompt 可以偏讨论，Codex prompt 应该偏任务单。因为 Codex 会读写文件、运行命令，指令越像验收标准，结果越稳。

## 模板

```text
请完成 [任务]。
范围：[允许修改的目录/文件]
要求：
- [行为要求]
- [风格要求]
- [不要做什么]
验证：
- 运行 [命令]
完成后说明：
- 改了哪些文件
- 如何验证
- 是否还有风险
```

## 常见错误

| 错误 | 后果 |
| --- | --- |
| 没写范围 | 容易改太多 |
| 没写验证 | 不知道完成没有 |
| 没写禁止事项 | 容易顺手重构 |
| 需求太抽象 | 结果偏离预期 |



## 完整版学习稿

### 学习定位

这一页可以当作 **Write Better Prompts for Codex** 的系统学习稿。它面向想让 Codex 更稳定完成工程任务的人，重点不是背官方术语，而是把页面里的能力、场景和边界转成可以反复使用的工作方法。

### 学习目标

- 把开发 prompt 写成任务说明书，而不是一句“帮我改”。
- 提供目标、范围、约束、测试和交付格式。
- 学会将大任务拆成可审查的小步。

### 官方内容拆解

| 模块 | 学习重点 | 可产出材料 |
| --- | --- | --- |
| Goal | 想改变什么行为 | 验收条件 |
| Scope | 哪些文件/模块可改，哪些不要碰 | 边界 |
| Context | 背景、现有问题、设计意图 | 减少误判 |
| Verification | 测试、build、手动检查 | 质量信号 |
| Output | 改动摘要、风险、后续 | 交付说明 |

### 实操工作流

1. 用用户行为描述目标。
2. 限定文件或模块范围。
3. 提供错误信息、截图、测试或复现步骤。
4. 要求 Codex 运行验证。
5. 让它最后总结 diff 和风险。

### 可复用 Prompt

```text
请把我的开发需求改写成一个 Codex prompt。请包含背景、目标行为、修改范围、约束、测试命令、完成标准和最终汇报格式。
```

### 复核清单

- 输出是否只使用已提供或可追溯的信息，不把推断写成事实。
- 是否标出不确定性、待确认项和需要人工判断的地方。
- 是否给出可执行的下一步，而不是只生成漂亮文字。
- 是否符合团队、学校、公司或行业的隐私与合规要求。

### 学完应该留下什么

学完这一页，最好不要只留下摘要，而是留下 一份可复用的学习笔记、prompt 模板和实践清单。如果以后要补自己的课程心得，可以在这份材料后面继续追加：真实使用场景、失败案例、改进后的 prompt、以及哪些判断必须由人完成。

来源页：https://developers.openai.com/codex/learn/best-practices


## 原创学习增强包

### 三档练习

| 时间 | 练习任务 | 交付物 |
| --- | --- | --- |
| 30 分钟 | 只读本页和来源核对区，提炼 5 条最有用的行动建议。 | 一张“今天就能试”的清单 |
| 2 小时 | 用下面的虚构案例跑一遍完整流程，记录输入、输出、修改和复核点。 | 一份可发布的练习记录 |
| 半天 | 把练习结果改造成自己的模板或小项目，并写下失败案例。 | 模板、prompt pack、复盘笔记 |

### 虚构案例

你发现 Codex 总是改太多文件，需要重新设计任务边界。 你可以把输入材料设定为：原始需求、可改范围、不可改范围、测试、交付格式。最后产出 高质量 Codex prompt、范围限制、验收标准、失败处理。

### 原创 Prompt Pack

1. 请把这个开发需求改写成边界清晰的 Codex prompt。
2. 请指出原 prompt 哪些地方会导致过度改动。
3. 请为任务增加验收标准和测试命令。
4. 请把大任务拆成 3 个可 review 的小任务。
5. 请给 Codex 最终汇报格式模板。

### 自测问题

- 我能不能用自己的话解释“Write Better Prompts for Codex”解决的核心问题？
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

- 场景类型：Codex 任务委派
- 建议任务：选择一个可回滚、范围清楚的小任务，让 Codex 完成并记录 diff 与验证
- 输入材料：任务说明、相关文件、约束、测试命令、验收标准
- 目标产物：任务 prompt、计划、改动摘要、验证结果、风险说明
- 关键边界：代码审查、测试结果、权限范围、不要接受未理解的改动

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
- 官方页面标题：Best practices。
- 页面正文规模：约 13894 个字符；检测到 11 个标题节点、0 个图片外链。
- 页面结构：`Best practices` / `Strong first use: Context and prompts` / `Plan first for difficult tasks` / `Make guidance reusable with AGENTS.md` / `Configure Codex for consistency` / `Improve reliability with testing and review` / `Use MCPs for external context` / `Turn repeatable work into skills` / `Use automations for repeated work` / `Organize long-running work with session controls`（另有 1 个小节）。

### 本页实抓内容重写整理

- 开发者文档页给出 Codex 使用最佳实践，内容比 Academy hub 更技术化。
- 核心包括给足上下文、清楚描述任务、把大任务拆小、让 Codex 运行检查、审查 diff 和迭代。
- 整理时应保留工程实践味道：不是魔法 prompt，而是像带一个开发代理一样安排工作。

### 外链视觉素材

![ Best practices ](https://images.ctfassets.net/kftzwdyauwt9/1YcLAu9OdRty21jeeKHSmK/2ed897dec9d31f58f63b7c8f3d82cb94/prompts-codex.png?w=3840&q=90&fm=webp)

图片来自官方页面外链，本站只引用 URL，不复制图片文件。

## 参考

- [Codex best practices](https://developers.openai.com/codex/learn/best-practices)
