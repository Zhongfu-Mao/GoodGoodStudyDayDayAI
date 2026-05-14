---
title: "Claude Code in Action：把编码 Agent 纳入工程流程"
date: 2026-03-31
category: academy
description: "从终端协作、代码库上下文、工具权限、测试验证、review 循环和安全边界理解 Claude Code 类编码 Agent 的使用方式。"
plainSummary: "Claude Code 的价值不是替你打字，而是把阅读代码、制定计划、编辑文件、运行验证、解释风险这一整条开发循环搬进终端。"
difficulty: advanced
coverImage: "/images/academy/anthropic-academy/04-developer-tools/claude-code-in-action/terminal-agent-cover.png"
tags:
  - Claude Code
  - 开发者
lang: zh
academy:
  series: "Anthropic Academy"
  module: "开发者与技术工具"
  moduleOrder: 4
  source: "Anthropic Academy"
  sourceUrl: "https://anthropic.skilljar.com/claude-code-in-action"
  prerequisites: []
draft: false
---

# Claude Code in Action：把编码 Agent 纳入工程流程

![终端中的编码 Agent 工作流](/images/academy/anthropic-academy/04-developer-tools/claude-code-in-action/terminal-agent-cover.png)

编码 Agent 的真正变化，不是“AI 会写代码”。早期代码补全已经能写不少代码。更大的变化是：Agent 可以在真实项目里阅读文件、理解结构、修改代码、运行命令、观察失败、再继续修。

这让开发协作从一句 prompt 变成一个循环：

1. 理解目标。
2. 探索代码库。
3. 制定局部计划。
4. 修改文件。
5. 运行验证。
6. 根据结果修正。
7. 汇总变更和风险。

Claude Code 这类工具的价值就在这里：它把“代码生成”推进到“开发流程协作”。

## 编码 Agent 不是 IDE 插件的简单升级

传统补全工具通常在当前文件或局部上下文里工作。编码 Agent 的单位更接近任务。

| 能力 | 补全工具 | 编码 Agent |
| --- | --- | --- |
| 上下文 | 当前文件和邻近代码 | 整个仓库、命令、错误、文档 |
| 输出 | 代码片段 | 文件变更、命令结果、解释和风险 |
| 交互 | 用户逐步驱动 | Agent 可以探索、计划、执行 |
| 验证 | 主要靠用户 | 可运行测试和构建 |
| 风险 | 局部错误 | 跨文件误改、命令副作用、权限问题 |

因此使用编码 Agent 的关键，不是让它更快写，而是让它在正确边界内工作。

## 上下文：先给项目地图，再给任务

编码 Agent 最怕两种上下文问题：

- 信息太少：不知道架构、命令、约定。
- 信息太多：旧计划、无关日志、错误方向混在一起。

一个好的项目上下文应该包括：

- 项目目标。
- 主要目录。
- 构建、检查、测试命令。
- 代码风格和架构约定。
- 不能触碰的目录或文件。
- 常见失败和排查方式。
- 发布或提交规则。

这些信息适合沉淀在项目说明文件或技能文件里，而不是每次临时口头补充。

## 工具权限：终端能力必须有边界

![编码 Agent 的 review 与验证循环](/images/academy/anthropic-academy/04-developer-tools/claude-code-in-action/review-loop.png)

编码 Agent 能运行命令，这是它强大的来源，也是风险来源。

建议把命令分层：

| 层级 | 例子 | 策略 |
| --- | --- | --- |
| Read | `rg`、`ls`、`git diff` | 默认允许 |
| Verify | `npm run check`、`pytest`、`cargo test` | 默认允许，但要记录结果 |
| Generate | 构建静态产物、生成图片、生成索引 | 允许，但关注输出目录 |
| Mutate | 改文件、安装依赖、数据库迁移 | 需要明确任务范围 |
| External | push、发布、发消息、调用生产服务 | 执行前确认 |
| Destructive | 删除、重置、覆盖历史 | 默认禁止 |

不要因为 Agent 看起来聪明，就给它无限终端权限。越接近真实工程，越需要清晰边界。

## 工作方式：让 Agent 做闭环，而不是只交草稿

一个高质量编码 Agent 任务应该包含完整闭环。

```md
请完成这个改动：

目标：
范围：
不要改：
验证命令：
完成后请说明：
- 改了哪些文件
- 验证结果
- 没验证什么
- 剩余风险
```

如果任务没有验证命令，Agent 很容易停在“我已经修改完成”的状态。真正的完成应该有证据。

## Review 循环：人类仍然负责判断

编码 Agent 可以自查，但不能替代 review。

人类 review 应重点看：

- 是否改到了范围外文件。
- 是否引入了新的抽象但没有必要。
- 是否通过验证，但行为语义变了。
- 是否只修了表面错误，根因仍在。
- 是否遗漏测试。
- 是否把本地假设写进了公开代码或文档。

Agent 的优势是执行循环快；人的优势是判断什么值得做、什么不该做。

## 安全边界：把“可执行”变成“可审计”

![安全终端操作与审批边界](/images/academy/anthropic-academy/04-developer-tools/claude-code-in-action/safe-terminal-operations.png)

安全使用编码 Agent，要让每个关键动作可审计。

最低要求：

- 修改前知道任务范围。
- 修改后能看 diff。
- 验证命令有输出。
- 外部动作有确认。
- 失败和未验证项被明确说明。
- 不使用 destructive git 命令清理问题。

对于团队项目，还可以增加：

- 只在 feature branch 上工作。
- 每个批次小提交。
- CI 失败由 Agent 辅助定位，但修复后仍需 review。
- 高风险目录需要人工确认。

## 案例：修复一个构建失败

不好的请求：

> 帮我修一下这个项目。

好的请求：

```md
当前 `npm run build` 失败。
请先运行或阅读失败信息，定位最小原因。
只修改和构建失败直接相关的文件。
修复后运行 `npm run build` 和 `npm run check`。
最后说明根因、改动、验证和剩余风险。
```

这个请求把目标、范围、验证和交付都说清楚了。Agent 不需要猜“修好”是什么意思。

## 常见反模式

**反模式一：让 Agent 一次性改太大范围。**

范围越大，review 成本越高。把大任务拆成可验证的小批次。

**反模式二：只看 Agent 的总结，不看 diff。**

总结可能遗漏细节。真实变更以 diff 为准。

**反模式三：验证失败也继续提交。**

Agent 可以解释失败，但不能把失败解释成成功。

**反模式四：让 Agent 处理生产凭证或敏感数据。**

编码任务应尽量使用本地、测试、脱敏数据。

## 任务模板

```md
## Coding Agent Task

目标：
业务背景：
允许修改：
禁止修改：
验证命令：

## Guardrails

是否允许安装依赖：
是否允许运行外部命令：
是否允许提交：
是否允许推送或发布：

## Done Means

- diff 可 review
- 验证命令通过
- 失败项已说明
- 剩余风险已列出
```

## 检查清单

- 是否先让 Agent 读取真实错误和相关文件？
- 是否限定了可修改范围？
- 是否提供了验证命令？
- 是否看过 diff，而不是只看总结？
- 是否禁止了外部可见或不可逆动作自动执行？
- 是否记录了未验证内容？

## 继续阅读

- [Agentic Workflows：用状态机拆解 AI 任务](../../agentic-workflows-02/)：把编码任务纳入可恢复工作流。
- [OpenAI Academy：构建可靠 AI Agents](../../openai-academy/07-building-with-ai/agents/)：从通用 Agent 视角理解工具、状态和评估。
- [Agent Skills 入门](../05-agentic-mcp/introduction-to-agent-skills/)：把重复工作流沉淀为可复用技能。

## 参考

- [Claude Code overview](https://code.claude.com/docs/en/overview)
- [Claude Code common workflows](https://docs.anthropic.com/en/docs/claude-code/tutorials)
- [Claude Code best practices](https://www.anthropic.com/engineering/claude-code-best-practices)
