---
title: "AI Basics for Everyone：Codex / Claude Code 这类 AI Coding 工具改变了什么"
date: 2026-04-27
category: academy
description: "用非工程朋友也能理解的方式解释 AI coding 工具：从补全代码到协作完成任务。"
coverImage: "/images/academy/ai-basics-for-everyone/ai-coding-tools.svg"
difficulty: beginner
plainSummary: "AI coding 工具的变化不只是写代码更快，而是把需求、探索、修改、验证和提交串成了新的协作方式。"
tags:
  - "Codex"
  - "Claude Code"
lang: zh
academy:
  series: "AI Basics for Everyone"
  module: "入口概念"
  moduleOrder: 7
  source: "本站 Academy / Engineering 导读"
  prerequisites: []
draft: false
---

## 先用一句话理解

Codex、Claude Code 这类工具改变的不只是“AI 会写代码”，而是把软件开发从单点补全，推向“AI 可以理解项目、探索代码、修改文件、运行检查、解释结果”的协作模式。

对非工程朋友来说，可以把它理解成：过去 AI 更像写作助手，现在它开始变成能在项目里做事的工作伙伴。

## 它和普通 ChatGPT 写代码有什么不同

| 普通对话 | AI coding 工具 |
| --- | --- |
| 主要生成代码片段 | 可以直接在项目中读写文件 |
| 依赖用户复制粘贴 | 能运行命令、查看错误、继续修复 |
| 很难理解完整项目结构 | 可以检索仓库、追踪依赖和调用关系 |
| 输出是否可用要靠人手动验证 | 可以跑测试、检查构建、给出变更摘要 |

本质变化是：AI 不再只在聊天框里回答，而是进入了真实工作环境。

## 为什么这件事重要

软件开发里最耗时的部分不只有写代码。理解需求、读旧代码、定位问题、试错、验证、写说明、提交变更，都需要时间。

AI coding 工具的价值是把这些环节串起来：

- 先探索项目。
- 提出改动方案。
- 修改相关文件。
- 运行检查。
- 根据错误继续修。
- 最后解释改了什么、还剩什么风险。

这也是为什么 “vibe coding” 会突然变得现实：人可以更关注意图、产品判断和验收标准，AI 负责更大一部分执行。

## 但它不等于不用 review

AI coding 越强，越需要清楚边界。因为它真的会改文件、跑命令、影响项目状态。

至少要保留三件事：

- 明确需求和验收标准。
- 看关键 diff，不盲信结果。
- 跑测试或构建，不只看文字总结。

没有 review 的 vibe coding 可以快速探索，但进入团队或生产环境时，仍然需要工程纪律。

## 和本站内容怎么接上

先读 [Codex Quickstart](../../openai-academy/05-codex/quickstart/) 和 [Codex App](../../openai-academy/05-codex/codex-app/)，理解 Codex 的基本工作方式。

再读 [Claude Code in Action](../../anthropic-academy/04-developer-tools/claude-code-in-action/)，比较另一类 coding agent 的工作流。

如果你想把它变成可靠工程实践，可以继续看 [Reliable LLM Call Skeleton](../../../engineering/ai-developer-core/reliable-llm-call-skeleton/) 和 [Agent Harness：日志、审批与回放](../../../engineering/ai-developer-core/agent-harness-logging-approval-replay/)。

## 一个实用判断

判断 AI coding 是否真的帮到项目，可以看：

1. 它是否先理解了现有代码，而不是直接乱改？
2. 它是否能解释变更范围？
3. 它是否跑了验证？
4. 它是否留下了可 review 的 diff？
5. 人是否仍然掌握产品判断和发布责任？

AI 可以把执行速度拉高，但责任边界不能一起消失。
