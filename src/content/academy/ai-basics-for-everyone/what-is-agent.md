---
title: "AI Basics for Everyone：Agent 是什么，为什么大家都在说 Agent"
date: 2026-04-27
category: academy
description: "把 Agent 从营销词拆开：目标、状态、工具、步骤、权限和验证。"
coverImage: "/images/academy/ai-basics-for-everyone/agent.svg"
difficulty: beginner
plainSummary: "Agent 不是一个会聊天的机器人，而是围绕目标使用工具、执行步骤、观察结果并接受验证的 AI 工作流。"
tags:
  - "AI/Agents"
lang: zh
academy:
  series: "AI Basics for Everyone"
  module: "入口概念"
  moduleOrder: 4
  source: "本站 Academy / Engineering 导读"
  prerequisites: []
draft: false
---

## 先用一句话理解

Agent 是围绕一个目标，能调用工具、分步骤执行、观察结果并继续调整的 AI 工作流。它不只是“聊天更聪明”，而是“能行动、能检查、能推进任务”。

一个普通聊天助手通常回答问题；一个 agent 更像在跑流程。

## Agent 至少包含什么

| 组件 | 作用 |
| --- | --- |
| Goal | 要完成什么结果 |
| State | 当前进展、已知信息和中间产物 |
| Tools | 能调用浏览器、文件、API、数据库或代码执行 |
| Policy | 什么时候自己做，什么时候必须问人 |
| Feedback | 如何判断当前结果是否需要修正 |

少了工具，它更像聊天。少了状态，它容易重复或失控。少了权限边界，它就有风险。少了验证，它就只是“看起来在忙”。

## 为什么大家都在说 Agent

因为 AI 的价值正在从“生成一段内容”走向“完成一段任务”。写摘要、改邮件、生成代码只是单点能力；而真实工作通常需要搜索、判断、执行、修改、验证、交付。

Agent 的想法就是把这些步骤串起来，让 AI 不只给建议，而是参与流程。

## 什么时候不需要 Agent

不是所有任务都需要 agent。如果任务只需要一次回答、一次总结、一次改写，普通对话就够了。

适合 agent 的任务通常有这些特征：

- 多步骤。
- 需要工具。
- 中间结果会影响下一步。
- 需要记录进度。
- 可以定义成功标准。

如果不能说清成功标准，先不要急着做 agent。

## 和本站内容怎么接上

先读 [Building Agents](../../openai-academy/07-building-with-ai/agents/)，理解工具、交接、护栏和 eval 如何组成系统。

再读 [Introduction to Subagents](../../anthropic-academy/05-agentic-mcp/introduction-to-subagents/)，理解为什么复杂任务需要拆给不同角色的小 agent。

如果你想从工程角度理解 agent，可以继续读 [Agent 的状态、工具与反馈循环](../../../foundations/ai-developer-core/agent-state-tools-feedback-loop/) 和 [Agent Harness：日志、审批与回放](../../../engineering/ai-developer-core/agent-harness-logging-approval-replay/)。

## 一个实用判断

判断一个产品是不是“真 agent”，可以问：

1. 它能使用哪些工具？
2. 它如何知道当前做到哪一步？
3. 它什么时候会停下来问人？
4. 它如何证明结果是对的？

如果这些问题都答不上来，那可能只是把普通聊天包装成了 agent。
