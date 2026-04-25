---
title: "OpenAI Academy 笔记：Advanced Codex Workflows"
date: 2026-04-25
category: academy
description: "整理高级 Codex 工作流：多步骤任务、自动化、复核点和长期维护。"
coverImage: "https://images.ctfassets.net/kftzwdyauwt9/12SFSIJ9j7jHftRNhRno4E/0095fc04ab06244c0e76079413d191d4/advanced-workflows.png?w=3840&q=90&fm=webp"
tags:
  - "OpenAI/Academy"
  - "课程笔记"
  - "Codex"
  - "Automation"
lang: zh
academy:
  series: "OpenAI Academy"
  module: "05.6 Advanced Codex Workflows"
  moduleOrder: 86
  source: "OpenAI Academy"
  sourceUrl: "https://academy.openai.com/public/clubs/builders-etkn1/resources/codex-103-advanced-workflows-and-automation-2026-03-18"
  prerequisites:
    - "建议先阅读：OpenAI Academy 笔记：Codex for Software Engineers"
draft: false
---

**说明：** 本文整理高级 Codex 工作流，不复制资源页内容。

## 高级在哪里

高级 Codex 工作流不是更长的 prompt，而是让任务具备计划、执行、验证、复核和自动化入口。

## 工作流骨架

```text
Intake -> Scope -> Implement -> Verify -> Review -> Publish
```

每一步都要有产物：

| 阶段 | 产物 |
| --- | --- |
| Intake | 需求、上下文、风险 |
| Scope | 文件范围、验收标准 |
| Implement | 小步改动 |
| Verify | 测试、构建、截图或数据检查 |
| Review | diff 审查、风险说明 |
| Publish | commit、PR、发布说明 |

## 自动化边界

适合自动化的是重复检查、定时整理、固定格式报告和机械迁移。不适合自动化的是高风险决策、产品取舍和缺乏测试的深层架构变更。



## 完整版学习稿

### 学习定位

这一页可以当作 **Advanced Codex Workflows** 的系统学习稿。它面向想把 Codex 用于重复工程流程和自动化的开发者，重点不是背官方术语，而是把页面里的能力、场景和边界转成可以反复使用的工作方法。

### 学习目标

- 从单次修 bug 走向多步骤 workflow。
- 把重复任务设计成可触发、可验证、可回滚的流程。
- 理解自动化越强，检查点越重要。

### 官方内容拆解

| 模块 | 学习重点 | 可产出材料 |
| --- | --- | --- |
| Workflow design | 触发条件、输入、步骤、输出 | 流程说明 |
| Automation | 重复检查、生成、迁移、报告 | 脚本或 agent task |
| Guardrails | 权限、范围、审批、回滚 | 安全边界 |
| Observability | 日志、测试、diff、报告 | 可追踪结果 |

### 实操工作流

1. 选择一个高频但低风险的工程流程。
2. 写清触发条件和文件范围。
3. 加入测试和人工审批点。
4. 先半自动执行几次。
5. 稳定后再扩展范围。

### 可复用 Prompt

```text
请把这个重复工程任务设计成 Codex advanced workflow。请列触发条件、输入、执行步骤、允许修改范围、验证命令、人工审批点和失败回滚方案。
```

### 复核清单

- 输出是否只使用已提供或可追溯的信息，不把推断写成事实。
- 是否标出不确定性、待确认项和需要人工判断的地方。
- 是否给出可执行的下一步，而不是只生成漂亮文字。
- 是否符合团队、学校、公司或行业的隐私与合规要求。

### 学完应该留下什么

学完这一页，最好不要只留下摘要，而是留下 一份可复用的学习笔记、prompt 模板和实践清单。如果以后要补自己的课程心得，可以在这份材料后面继续追加：真实使用场景、失败案例、改进后的 prompt、以及哪些判断必须由人完成。

来源页：https://academy.openai.com/public/clubs/builders-etkn1/resources/codex-103-advanced-workflows-and-automation-2026-03-18


## 原创学习增强包

### 三档练习

| 时间 | 练习任务 | 交付物 |
| --- | --- | --- |
| 30 分钟 | 只读本页和来源核对区，提炼 5 条最有用的行动建议。 | 一张“今天就能试”的清单 |
| 2 小时 | 用下面的虚构案例跑一遍完整流程，记录输入、输出、修改和复核点。 | 一份可发布的练习记录 |
| 半天 | 把练习结果改造成自己的模板或小项目，并写下失败案例。 | 模板、prompt pack、复盘笔记 |

### 虚构案例

你想让 Codex 定期检查内容站链接、格式和构建状态。 你可以把输入材料设定为：重复任务、可运行命令、允许修改范围、失败通知方式。最后产出 自动化流程设计、触发条件、权限边界、人工审批点。

### 原创 Prompt Pack

1. 请把这个重复工程任务设计成 Codex workflow。
2. 请列触发条件、输入、步骤、输出和失败处理。
3. 请定义哪些步骤可以自动执行，哪些必须人工确认。
4. 请为 workflow 增加日志和审计要求。
5. 请设计一次小范围试运行计划。

### 自测问题

- 我能不能用自己的话解释“Advanced Codex Workflows”解决的核心问题？
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
- 官方页面标题：Codex 103: Advanced Workflows and Automation。
- 页面正文规模：约 850 个字符；检测到 4 个标题节点、2 个图片外链。
- 页面结构：`Codex 103: Advanced Workflows and Automation` / `Scale Codex across workflows, teams, and systems` / `Popular` / `Related`。

### 本页实抓内容重写整理

- 这个公开资源页介绍 Codex 103，主题是高级工作流和自动化。
- 页面本身是资源入口，适合作为高级 Codex 笔记的来源锚点，而不是完整教程正文。
- 整理时可围绕自动化、重复任务、审核点和开发流程集成展开。

### 外链视觉素材

![Codex 103: Advanced Workflows and Automation](https://images.ctfassets.net/kftzwdyauwt9/12SFSIJ9j7jHftRNhRno4E/0095fc04ab06244c0e76079413d191d4/advanced-workflows.png?w=3840&q=90&fm=webp)

图片来自官方页面外链，本站只引用 URL，不复制图片文件。

## 参考

- [Codex 103: Advanced Workflows and Automation](https://academy.openai.com/public/clubs/builders-etkn1/resources/codex-103-advanced-workflows-and-automation-2026-03-18)
