---
title: "Agent Skills 入门：把重复工作流封装成可复用能力"
date: 2026-03-31
category: academy
description: "理解 Skills 的定位、触发、目录结构、渐进披露、适用场景和质量标准，把团队经验变成 Agent 可加载的工作资产。"
plainSummary: "Skills 不是更长的提示词，而是带触发条件、说明、示例、脚本和验证方式的可复用工作流包。它适合沉淀重复任务和团队规范。"
difficulty: advanced
coverImage: "/images/academy/anthropic-academy/05-agentic-mcp/introduction-to-agent-skills/skill-library-cover.png"
tags:
  - Agent
  - Skills
lang: zh
academy:
  series: "Anthropic Academy"
  module: "代理与 MCP"
  moduleOrder: 5
  source: "Anthropic Academy"
  sourceUrl: "https://anthropic.skilljar.com/introduction-to-agent-skills"
  prerequisites: []
draft: false
---

# Agent Skills 入门：把重复工作流封装成可复用能力

![Agent Skills 作为可复用工作流资产](/images/academy/anthropic-academy/05-agentic-mcp/introduction-to-agent-skills/skill-library-cover.png)

当你频繁使用编码 Agent 或工作流 Agent 时，会发现自己反复解释同一类事情：

- PR 描述怎么写。
- 代码 review 先看哪些风险。
- 某个框架项目应该怎么跑测试。
- 文档要用什么结构。
- 设计稿转代码时有哪些约束。
- 发布前必须跑哪些检查。

这些重复解释不应该永远留在聊天里。它们应该沉淀成可复用资产。Agent Skills 的意义就在这里：把某类任务的说明、示例、模板、脚本和验证方式打包，让 Agent 在合适场景下按需加载。

一句话理解：

**Skill 是 Agent 可发现、可加载、可执行的专项工作流知识包。**

## Skill 不是普通 Prompt

Skill 和普通 Prompt 的区别在于生命周期。

| 方式 | 特点 | 适合 |
| --- | --- | --- |
| 临时 Prompt | 只对当前对话有效 | 一次性任务 |
| 项目说明 | 每次都加载 | 全局规则、项目背景 |
| Slash command | 手动触发 | 明确命令式流程 |
| Skill | 按语义匹配、按需加载 | 重复出现的专项任务 |

Skill 的价值不是把 prompt 写得更长，而是把“什么时候用、怎么用、用什么材料、如何验证”整理成包。

## 渐进披露：只在需要时加载细节

![Skills 的渐进披露机制](/images/academy/anthropic-academy/05-agentic-mcp/introduction-to-agent-skills/progressive-disclosure.png)

好的 Skill 不应该让 Agent 每次都读完整说明。它应该先暴露轻量元信息，只有匹配任务时再加载细节。

常见结构：

```txt
my-skill/
  SKILL.md
  examples/
  scripts/
  templates/
  assets/
```

`SKILL.md` 的 frontmatter 描述何时使用：

```yaml
---
name: pr-description
description: Use when writing a pull request description from git diff and project context.
---
```

description 很重要。它不是给人看的标题，而是 Agent 用来判断是否加载的触发条件。

## 一个好 Skill 应该包含什么

| 组成 | 作用 |
| --- | --- |
| Trigger | 明确什么时候使用，什么时候不使用 |
| Workflow | 任务步骤和顺序 |
| Inputs | 需要读取哪些文件、命令或上下文 |
| Outputs | 交付物格式 |
| Examples | 好结果和坏结果 |
| Scripts | 可复用工具，避免重复手写 |
| Verification | 完成后如何检查 |
| Boundaries | 禁止事项和权限边界 |

Skill 越像“操作手册 + 可执行资产”，越有价值。只写一段泛泛建议，效果通常很弱。

## 适合写成 Skill 的场景

适合：

- PR 描述、release note、变更摘要。
- 代码 review 清单。
- 特定框架的调试流程。
- 文档生成模板。
- 数据清洗或报告生成流程。
- 设计系统组件实现规则。
- 本地项目专属验证流程。

不适合：

- 一次性问题。
- 仍在探索、没有稳定流程的任务。
- 需要大量实时判断且没有可复用结构的任务。
- 会触发高风险外部动作但没有审批设计的任务。

判断标准很简单：如果你连续三次对 Agent 解释同一套流程，它就值得考虑写成 Skill。

## Skill 质量：越具体越可靠

![Skill 质量 review 与验证门禁](/images/academy/anthropic-academy/05-agentic-mcp/introduction-to-agent-skills/skill-quality-review.png)

低质量 Skill 常见问题：

- description 太泛，导致误触发。
- 只写原则，没有步骤。
- 没有输入输出格式。
- 没有例子。
- 没有验证方式。
- 把项目秘密或个人偏好混进共享 Skill。
- 试图让一个 Skill 覆盖太多场景。

高质量 Skill 更像这样：

```md
### When to Use

Use this when the user asks for a PR description after code changes exist.
Do not use this for release notes or changelog generation.

### Steps

1. Inspect branch diff.
2. Identify user-visible changes.
3. Identify tests run.
4. Write PR description in the required format.
5. Include risks and rollout notes.

### Verification

- Description mentions tests.
- No unrelated files are summarized as intentional changes.
- Risk section is present when behavior changes.
```

边界比内容更重要。Skill 必须说明不负责什么。

## 项目 Skill 和个人 Skill

个人 Skill 适合个人偏好和跨项目工作方式。项目 Skill 适合团队共享流程。

| 类型 | 适合内容 | 风险 |
| --- | --- | --- |
| Personal | 自己的写作偏好、常用 review 习惯 | 不应该假设团队都接受 |
| Project | 项目命令、架构规则、交付模板 | 需要维护，不能过期 |
| Organization | 品牌、安全、合规、通用流程 | 需要版本治理和审批 |

共享 Skill 一旦进入仓库，就会影响所有使用者。要像代码一样 review。

## 案例：Incident Review Skill

目标：把一次生产事故整理成可复盘、可改进、可追踪的 incident review。

Skill 可以包含：

- 读取告警、日志、trace、工单和时间线。
- 区分事实、推测、决策和待确认问题。
- 生成影响范围、根因假设、恢复动作和后续行动。
- 要求每个行动项包含 owner、due date、验证方式。
- 禁止把未确认推测写成结论。
- 输出统一的 incident review 模板。

这类任务会反复出现，输入来源稳定，且对格式和边界要求高，非常适合 Skill。

## 常见反模式

**反模式一：Skill 写成价值观宣言。**

“请保持高质量、结构清晰”不够。要写步骤、输入、输出和检查。

**反模式二：一个 Skill 覆盖整个宇宙。**

Skill 应该小而专。大而全会让触发和执行都变差。

**反模式三：没有示例。**

Agent 需要看到你认为什么是好结果。示例能显著降低解释成本。

**反模式四：没有更新机制。**

项目命令、框架版本、团队格式会变。Skill 也需要维护。

## Skill 设计模板

```md
---
name: skill-name
description: Use when...
---

### When to Use

Use this when:

Do not use this when:

### Inputs

- Required files:
- Required commands:
- Required context:

### Workflow

1.
2.
3.

### Output

Format:
Must include:
Must not include:

### Verification

- [ ]
- [ ]

### Examples

Good:

Bad:
```

> **示例填法（Incident review skill）**
>
> name：incident-review
> description：Use when a production incident needs a structured timeline, root cause, action items, and verification evidence.
> When to Use：Use this when incident notes, logs, alerts, or chat transcripts need to become a review doc；Do not use this when the issue is still actively burning.
> Inputs：Required files=incident log, alert screenshot, deploy diff；Required commands=git show, log query；Required context=service owner and severity
> Workflow：1. Build timeline；2. Separate facts from hypotheses；3. Extract root cause and contributing factors；4. Draft action items with owners；5. Verify evidence links.
> Output：Format=Markdown incident review；Must include=timeline, impact, root cause, follow-ups；Must not include=personal blame or unverifiable claims
> Verification：check all timestamps have source；check each action item has owner and due date
> Examples：Good=links every conclusion to log/deploy evidence；Bad=only says "human error" without system fix

## 检查清单

- description 是否足够具体，能避免误触发？
- 是否写清楚不适用场景？
- 是否有明确输入和输出？
- 是否包含可执行步骤？
- 是否有示例或模板？
- 是否有验证方式？
- 是否避免放入敏感信息？
- 是否有人负责维护？

## 继续阅读

- [Model Context Protocol 入门](./introduction-to-model-context-protocol/)：理解工具连接如何标准化。
- [Claude Code in Action](../04-developer-tools/claude-code-in-action/)：把 Skill 用在真实开发工作流中。
- [Agentic Workflows：用状态机拆解 AI 任务](../../agentic-workflows-02/)：把 Skill 纳入更大的执行流程。

## 参考

- [Claude Code Skills documentation](https://docs.anthropic.com/en/docs/claude-code/skills)
- [Anthropic Academy: Introduction to Agent Skills](https://anthropic.skilljar.com/introduction-to-agent-skills)
