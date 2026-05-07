---
title: "Google Advent of Agents：上下文、记忆与 Skills 分层"
date: 2026-05-06
category: academy
description: "把 Advent of Agents 中关于 ADK Layers、Context Caching、Context Compaction、Memory Plugins 与 ADK Skills 的主题重组为一套可实践的 Agent 上下文分层方法。"
plainSummary: "这篇图文笔记说明为什么“大上下文不等于好记忆”，以及如何把 prompt context、session state、long-term memory 与 skills 分开设计。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/covers/02-context-memory-skills.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: zh
academy:
  series: "Google Advent of Agents"
  module: "02 上下文、记忆与 Skills"
  moduleOrder: 122
  source: "Google Cloud Advent of Agents"
  sourceUrl: "https://adventofagents.com/2025/12/08"
  prerequisites:
    - "建议先阅读：Google Advent of Agents：ADK Agent 项目骨架"
draft: false
---

![上下文、记忆与 Skills 封面](/images/academy/google-advent-of-agents/covers/02-context-memory-skills.svg)

**说明：** 本文基于 Advent of Agents 中关于 ADK Context Layers、Big Context、Memory Plugins、ADK Skills 和 Skill Design Patterns 的公开主题重组。它不复述逐日内容，而是把这些主题合并成一个工程问题：Agent 到底应该把什么放进本轮上下文，什么保存在状态里，什么沉淀为长期记忆，什么做成按需加载的 Skill？

## 这篇解决什么问题

Agent 变复杂后，最常见的坏味道是“什么都往 prompt 里塞”。

一开始这似乎很有效：把规则、背景、用户偏好、工具说明、API 文档、历史对话、团队规范全部塞进去，模型确实知道得更多。但很快问题会出现：

- prompt 越来越长，延迟和成本上升。
- 模型在大量内容中抓不住重点，出现 lost in the middle。
- 临时任务上下文和长期记忆混在一起，过期信息无法清理。
- 所有技能说明每轮都加载，哪怕这轮根本用不到。
- 调试失败时，很难判断到底是规则冲突、记忆污染，还是工具描述不清。

Advent of Agents 里关于 Context、Memory、Skills 的多天内容，本质上都在回应同一个判断：**可靠 Agent 不是靠更长上下文，而是靠更清晰的上下文分层。**

## 分层图

![Context Memory Skills 分层图](/images/academy/google-advent-of-agents/diagrams/context-memory-skills-layers.svg)

可以先把 Agent 的上下文系统分成四层：

| 层级 | 应该放什么 | 不应该放什么 |
| --- | --- | --- |
| Prompt context | 本轮回答必须看到的任务、约束、工具结果和少量背景。 | 所有历史、完整文档、长期偏好、通用技能手册。 |
| Session state | 当前任务进度、已选文件、临时 artifact、短期决策。 | 永久事实、跨项目偏好、不可撤回的用户画像。 |
| Long-term memory | 稳定偏好、用户确认过的长期事实、可复用知识。 | 没验证的推断、一次性任务细节、敏感数据原文。 |
| Skills | 按需加载的程序性知识、操作步骤、模板和参考材料。 | 每轮都无条件灌入模型的巨大说明书。 |

这四层的区别，不是学术分类，而是工程控制面。

## Prompt context：本轮必须看到什么

Prompt context 是最贵、最容易膨胀、也最直接影响输出的一层。它应该遵守一个原则：

> 只放本轮回答必须使用的信息。

判断某段内容是否该进 prompt，可以问三个问题：

1. 没有它，模型会不会明显答错？
2. 它是否仍然有效，还是已经被后续用户指令覆盖？
3. 它是否可以通过工具、memory 或 skill 按需获取？

如果答案是“可能有用”，通常不够资格进入 prompt。Agent 工程里，“可能有用”经常会变成噪音。

## Session state：当前任务的工作台

Session state 是 Agent 正在处理的任务现场。它不一定要完整展示给模型，但系统需要能追踪：

- 当前任务走到哪一步。
- 用户已经选择了哪些文件、页面或对象。
- 哪些工具调用已经发生。
- 哪些临时 artifact 已经产生。
- 哪些假设等待确认。

这层适合保存“还在工作中的东西”。它的生命周期应该短于长期记忆，长于单轮 prompt。

一个好的 session state 设计，应该允许你暂停、恢复、回放或撤销部分步骤。Advent of Agents 中关于 resume、rewind、durable execution 的主题，后面都建立在这层意识之上。

## Long-term memory：只保存稳定且可撤回的东西

长期记忆不是“把历史聊天全部存起来”。它更像一个经过筛选的偏好和事实库。

适合长期保存的内容：

- 用户明确确认的偏好，例如输出语言、常用技术栈、交付格式。
- 长期有效的项目背景，例如公开仓库结构、团队流程、稳定的术语表。
- 经过验证的经验，例如某类任务的常见失败模式。

不适合长期保存的内容：

- 模型根据一次对话推断出的用户画像。
- 可能很快过期的产品价格、模型限制、政策状态。
- 邮件正文、凭据、私有数据原文。
- 用户只是临时提到、并未要求长期保留的内容。

记忆设计要有“撤回感”：用户应该能理解保存了什么，也应该能要求删除或不再使用。

## Skills：按需加载的程序性知识

Skills 解决的是另一个问题：很多能力不是事实，而是操作方法。

例如：

- 如何写一篇 Academy 学习笔记。
- 如何处理 Gmail triage。
- 如何生成图文型内容。
- 如何检查 Astro content schema。
- 如何执行某个团队的发布流程。

这些内容如果每轮都塞进 prompt，会浪费上下文，还会干扰当前任务。更好的方式是：模型先看到 skill 的名称和简短描述，只有任务需要时才加载完整说明。

这就是 progressive disclosure 的价值。它不是为了“藏信息”，而是为了让模型在正确时间看见正确材料。

## 一个小型设计示例

假设你要做一个“AI Academy 文章助手”，它帮助把官方资料改写为原创学习文章。不要把所有规则都放进一个系统 prompt。可以这样分层：

| 内容 | 放在哪里 | 理由 |
| --- | --- | --- |
| 本次要写的主题和目标读者 | Prompt context | 本轮必须使用。 |
| 当前文章草稿、待补图表、待核对链接 | Session state | 属于当前任务现场。 |
| 本站长期风格偏好、不要搬运原文的红线 | Long-term memory 或 repo 指南 | 跨任务稳定有效。 |
| Academy 文章固定写法、frontmatter 模板、验证命令 | Skill | 需要写文章时按需加载。 |
| Gmail 邮件原文 | 不进公开内容；只提取元数据和主题信号 | 避免私有信息泄露。 |

这套分层能让 Agent 更稳，也让人类审查更容易。

## 常见错误模式

| 错误模式 | 表面症状 | 更稳的做法 |
| --- | --- | --- |
| 巨型系统 prompt | 每轮都慢，模型还会漏掉关键规则。 | 把通用流程移到 skill，把稳定偏好移到 memory。 |
| 聊天记录当记忆 | Agent 引用过期或误解的历史信息。 | 只保存用户确认过、可解释、可撤回的记忆。 |
| 工具结果全量塞回 | prompt 里充满原始 JSON 或长文档。 | 工具返回结构化摘要，必要时分页或二次查询。 |
| Skill 无条件加载 | 明明不写文章，也加载整套写作规范。 | 先暴露简短 skill 描述，任务匹配时再加载。 |
| 临时任务污染长期状态 | 下次任务沿用上次的假设。 | session state 与 long-term memory 分开存储。 |

## 代码层面的学习骨架

下面是一个概念骨架，不是完整框架实现。它展示四层如何在程序设计里分开。

```python
request_context = {
    "task": "write an ADK learning note",
    "audience": "engineers learning agent systems",
    "constraints": ["do not copy source text", "include a diagram plan"],
}

session_state = {
    "draft_slug": "adk-agent-project-anatomy",
    "checked_sources": ["adventofagents", "adk-docs"],
    "open_questions": ["which diagram should be created first?"],
}

long_term_memory = {
    "site_style": "original study notes with practical checklists",
    "privacy_rule": "never expose Gmail message IDs or private links",
}

available_skills = [
    {
        "name": "academy_article_writer",
        "summary": "Structure an Academy article with source boundary, diagram, workflow, and checklist.",
    }
]
```

真正的系统不一定长这样，但设计问题是一样的：哪些内容立刻给模型，哪些内容由运行时保存，哪些内容需要用户长期授权，哪些内容作为 skill 按需展开。

## 和 ADK 项目骨架的关系

上一篇讲的是最小 Agent 项目骨架。这一篇是在问：项目跑起来之后，如何避免它被上下文拖垮。

| 上一篇关注 | 本篇补充 |
| --- | --- |
| `root_agent` 如何定义 | instruction 里不应该塞入所有知识。 |
| tools 如何接入 | 工具结果应该结构化、可分页、可摘要。 |
| runtime 如何观察 | 观察的不只是回答，还有 context 使用和 state 变化。 |
| checks 如何设计 | eval 不仅测答案，也测记忆、工具和 skill 是否被正确使用。 |

从这里开始，Agent 就不再只是“能调用工具的聊天接口”，而是一个需要上下文治理的系统。

## 最小实践任务

拿上一篇的只读工具型 Agent，做一次上下文分层改造：

1. 把当前 prompt 里的内容分成：本轮任务、长期规则、操作步骤、临时状态。
2. 删除所有“可能有用但本轮不必要”的背景。
3. 把稳定规则写成一小段长期项目规范。
4. 把操作步骤改成一个 skill 描述。
5. 让工具只返回结构化摘要，而不是长文本。
6. 对同一问题运行两次，比较回答是否更短、更稳定、更容易审查。

实践记录表：

| 内容片段 | 原位置 | 新位置 | 调整理由 |
| --- | --- | --- | --- |
| 写作风格要求 | Prompt | Skill / 长期规范 | 稳定、可复用，不必每轮完整展开。 |
| 当前文章目标 | Prompt | Prompt | 本轮必须使用。 |
| 已核对链接 | Prompt | Session state | 任务现场信息，可更新。 |
| 私有邮件正文 | Prompt | 不进入公开流程 | 隐私边界。 |

## 复核清单

- 我能区分 prompt context、session state、long-term memory、skills。
- 我不会把长聊天记录直接当作长期记忆。
- 我知道 Skills 适合保存程序性知识，而不是所有事实。
- 我能解释为什么 progressive disclosure 能降低噪音。
- 我能指出哪些信息必须由用户确认后才可长期保存。
- 我能把一个巨型 prompt 拆成四层，并说明每层的生命周期。
- 我能为 context / memory / skill 使用设计一个最小 eval。

## 参考资源

- [Advent of Agents](https://adventofagents.com/)
- [ADK Context](https://google.github.io/adk-docs/context/)
- [ADK Sessions](https://google.github.io/adk-docs/sessions/)
- [ADK Skills](https://google.github.io/adk-docs/skills/)
- [ADK Runtime](https://google.github.io/adk-docs/runtime/)
- [Agent Starter Pack](https://github.com/GoogleCloudPlatform/agent-starter-pack)

