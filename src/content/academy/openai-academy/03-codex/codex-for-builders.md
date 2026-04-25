---
title: "OpenAI Academy 笔记：Codex"
date: 2026-04-25
category: academy
description: "整理 Codex 在 OpenAI Academy 中的定位：从代码辅助到可委派任务、文件和工作流的 AI agent。"
coverImage: "https://images.ctfassets.net/kftzwdyauwt9/4a0UlJKsQXDLL6k7khzEmr/ddac544c58137463e3963b22de3317c5/Cover-codex.png?w=3840&q=90&fm=webp"
tags:
  - "OpenAI/Academy"
  - "课程笔记"
  - "Codex"
  - "AI/Agents"
lang: zh
academy:
  series: "OpenAI Academy"
  module: "03 Codex"
  moduleOrder: 80
  source: "OpenAI Academy"
  sourceUrl: "https://openai.com/academy/codex/"
  prerequisites:
    - "建议先阅读：OpenAI Academy 笔记：Using ChatGPT"
draft: false
---

**说明：** 本文是 Codex 学习路线笔记，重点记录它和 ChatGPT 的任务边界，以及怎样把 Codex 用在真实交付里。

## 这节课解决什么问题

OpenAI Academy 把 Codex 放在“写代码、运行任务、构建自动化工作流”的位置。它不只是代码补全，也不是普通聊天助手的换皮。

我会这样区分：

| 工具 | 更适合 |
| --- | --- |
| ChatGPT | 讨论问题、生成想法、解释概念、起草内容 |
| Codex | 读写文件、运行命令、修改项目、完成可验证任务 |

简单说，ChatGPT 帮你想清楚，Codex 帮你把一部分工作往前推。

## Codex 的两条学习线

OpenAI Academy 的 Codex 页面分成两块：

| 学习线 | 内容 |
| --- | --- |
| Start using Codex | 设置 Codex、跑第一批任务、写更好的 Codex prompt、使用 Codex app |
| Build workflows with Codex | 软件工程日常、实践工作坊、OpenAI 内部使用方式、高级工作流和自动化 |

这说明 Codex 的学习重点不是单条 prompt，而是“任务如何被交付”。

## 核心概念

### Codex 是可委派工作的 agent

Codex 可以跨文件、工具和重复流程工作。对本站来说，它特别适合这些任务：

- 批量整理 Markdown frontmatter
- 生成和校验课程笔记结构
- 给 Astro 内容集合补测试或检查
- 修复构建错误
- 把资料转成 slides、表格、文档或代码
- 为固定内容流程写脚本

这类任务的共同点是：不是一句回答能结束，而是要动文件、跑检查、交付结果。

### Codex prompt 要写成任务说明

给 ChatGPT 的 prompt 可以偏讨论；给 Codex 的 prompt 应该更像任务单：

```text
请在 src/content/academy/openai-academy/ 下新增一篇 draft 课程笔记。
要求：
- frontmatter 符合 src/content.config.ts
- category 为 academy
- academy.series 为 OpenAI Academy
- 参考源放在文末
- 完成后运行 npm run check
```

好的 Codex 任务说明通常包含：

| 元素 | 作用 |
| --- | --- |
| 写入范围 | 避免改到无关文件 |
| 验收条件 | 明确什么算完成 |
| 命令或测试 | 让结果可以验证 |
| 风格约束 | 保持和项目一致 |
| 禁止事项 | 避免无关重构或破坏用户改动 |

## 可复用工作流

我会把 Codex 使用分成四步：

1. **Read**：先让 Codex 读项目结构、schema、现有样例。
2. **Plan**：把任务拆成文件、范围、验证方式。
3. **Patch**：让 Codex 小步修改，避免一次改太散。
4. **Verify**：运行检查，把失败信息反馈给下一轮。

这也是本站后续写 Academy 笔记时可以复用的流程：先读官方源和现有文章，再写 draft，再跑 `npm run check`。

## 和 Anthropic Academy 的对照

Anthropic Academy 的 Subagents 和 MCP 更强调 agentic 系统的构件和协议。OpenAI Academy 的 Codex 更像一个产品化的可委派工作环境：用户把任务、文件、工具和验证放进同一个 workspace。

这对学习者的启发是：不要只问“模型会不会写代码”，而要问“它能不能在我的项目上下文里交付一个可验证结果”。



## 完整版学习稿

### 学习定位

这一页可以当作 **Codex 总览** 的系统学习稿。它面向想让 AI 进入真实代码库和开发流程的 builders，重点不是背官方术语，而是把页面里的能力、场景和边界转成可以反复使用的工作方法。

### 学习目标

- 理解 Codex 从对话助手变成开发代理的区别。
- 知道它适合理解代码、改 bug、写测试、重构、文档和工程任务分解。
- 建立审查 diff、运行测试和保留人类所有权的习惯。

### 官方内容拆解

| 模块 | 学习重点 | 可产出材料 |
| --- | --- | --- |
| Explore | 理解代码库、查找实现、解释架构 | 代码导览和风险点 |
| Implement | 功能、小修、重构 | patch 和说明 |
| Verify | 运行测试、lint、build | 验证结果 |
| Review | 审查 diff、边界和回归风险 | review checklist |
| Automate | 重复工程任务 | 脚本、workflow、Skill |

### 实操工作流

1. 把任务写成明确工程目标。
2. 提供文件范围、约束和验收标准。
3. 让 Codex 先读代码再改。
4. 要求它运行或说明测试。
5. 审查 diff 后再提交。

### 可复用 Prompt

```text
请在这个代码库中完成[任务]。先说明你会查看哪些文件和为什么；实现后列出改动文件、行为变化、测试结果和仍需人工复核的风险。
```

### 复核清单

- 输出是否只使用已提供或可追溯的信息，不把推断写成事实。
- 是否标出不确定性、待确认项和需要人工判断的地方。
- 是否给出可执行的下一步，而不是只生成漂亮文字。
- 是否符合团队、学校、公司或行业的隐私与合规要求。

### 学完应该留下什么

学完这一页，最好不要只留下摘要，而是留下 一份可复用的学习笔记、prompt 模板和实践清单。如果以后要补自己的课程心得，可以在这份材料后面继续追加：真实使用场景、失败案例、改进后的 prompt、以及哪些判断必须由人完成。

来源页：https://openai.com/academy/codex/


## 原创学习增强包

### 三档练习

| 时间 | 练习任务 | 交付物 |
| --- | --- | --- |
| 30 分钟 | 只读本页和来源核对区，提炼 5 条最有用的行动建议。 | 一张“今天就能试”的清单 |
| 2 小时 | 用下面的虚构案例跑一遍完整流程，记录输入、输出、修改和复核点。 | 一份可发布的练习记录 |
| 半天 | 把练习结果改造成自己的模板或小项目，并写下失败案例。 | 模板、prompt pack、复盘笔记 |

### 虚构案例

你要让 Codex 在内容站里新增一篇文章并跑检查。 你可以把输入材料设定为：仓库结构、目标文件、frontmatter schema、测试命令、不要触碰的范围。最后产出 任务单、改动 diff、测试结果、review checklist。

### 原创 Prompt Pack

1. 请先阅读相关代码和内容结构，再给实现计划。
2. 请新增这篇内容并保持现有 frontmatter 风格。
3. 请运行检查命令并总结结果。
4. 请指出这次 diff 中我应该重点 review 的地方。
5. 请把这个任务沉淀成 Codex 工作流模板。

### 自测问题

- 我能不能用自己的话解释“Codex”解决的核心问题？
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
- 官方页面标题：Codex。
- 页面正文规模：约 1484 个字符；检测到 6 个标题节点、11 个图片外链。
- 页面结构：`Codex` / `Learn through events and workshops` / `Building with AI` / `Getting started with ChatGPT` / `ChatGPT for work` / `Join OpenAI Academy today`。

### 本页实抓内容重写整理

- Codex 总览页是面向 builders 的入口，指向软件工程师、快速开始、用例、最佳实践和高级工作流。
- 页面本身较短，价值在于学习路线和资源导航。
- 整理时适合把 Codex 放在“从聊天到执行”的位置：让 AI 进入真实代码库和开发流程。

### 外链视觉素材

![Codex](https://images.ctfassets.net/kftzwdyauwt9/4a0UlJKsQXDLL6k7khzEmr/ddac544c58137463e3963b22de3317c5/Cover-codex.png?w=3840&q=90&fm=webp)

图片来自官方页面外链，本站只引用 URL，不复制图片文件。

## 参考

- [Codex](https://openai.com/academy/codex/)
- [Codex for work](https://openai.com/academy/codex-for-work/)
- [What is Codex?](https://openai.com/academy/what-is-codex)
