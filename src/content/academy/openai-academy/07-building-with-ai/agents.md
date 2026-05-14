---
title: "OpenAI Academy：构建可靠 AI Agents"
date: 2026-04-25
category: academy
description: "把 Agent 从 Demo 做到可运行系统：目标边界、工具权限、状态管理、人工检查点、评估与可观测性。"
plainSummary: "可靠 Agent 不是模型加循环，而是一套带目标、工具、状态、权限、检查点、评估和回滚能力的系统。本文给出可复用的设计框架。"
difficulty: intermediate
coverImage: "/images/academy/openai-academy/07-building-with-ai/agents/agent-system-cover.png"
tags:
  - Agent
  - Building with AI
lang: zh
academy:
  series: "OpenAI Academy"
  module: "07.2 Building Agents"
  moduleOrder: 102
  source: "OpenAI Academy"
  sourceUrl: "https://academy.openai.com/home/clubs/builders-etkn1/resources/builder-bootcamp-2026-04-22"
  prerequisites:
    - "建议先阅读：OpenAI Academy 笔记：Workspace Agents"
draft: false
---

# OpenAI Academy：构建可靠 AI Agents

![生产级 Agent 系统的控制面](/images/academy/openai-academy/07-building-with-ai/agents/agent-system-cover.png)

Agent 很容易被讲成一句话：模型会自己规划、调用工具、完成任务。这个描述没错，但不够工程化。

在真实产品里，Agent 的关键问题不是“模型能不能想出下一步”，而是：

- 它什么时候应该行动，什么时候应该停下来？
- 它可以调用哪些工具，哪些工具必须先经过确认？
- 工具失败后，是重试、降级、换策略，还是交给人？
- 每一次行动有没有日志、证据和可回放路径？
- 任务完成是否有评估标准，而不是模型自称完成？

所以，可靠 Agent 的定义应该更具体：

**Agent 是一个在明确目标、受控工具、可记录状态和评估闭环中行动的 AI 系统。**

## 什么时候需要 Agent

并不是所有 AI 功能都应该做成 Agent。很多任务用一次模型调用、一个固定 workflow、一个传统脚本就更稳定。

适合 Agent 的任务通常有这些特征：

| 特征 | 说明 | 例子 |
| --- | --- | --- |
| 多步骤 | 需要根据中间结果决定下一步 | 代码修复、调查报告、复杂客服工单 |
| 工具依赖 | 需要读取或操作外部系统 | 搜索、数据库、文件、工单、日历 |
| 状态变化 | 任务过程中有进度和分支 | 长文档整理、项目迁移、实验分析 |
| 不确定性 | 不能提前写死所有路径 | 研究、排障、跨系统协调 |
| 需要验收 | 完成质量必须被检查 | 测试通过、引用完整、审批完成 |

不适合 Agent 的任务：

- 单次分类、摘要、改写。
- 规则明确、路径固定的批处理。
- 高风险且不能回滚的操作。
- 没有日志、权限和人工检查点的自动化写入。

Agent 是为复杂性付出的工程成本。只有当任务复杂性超过固定 workflow 的舒适区时，它才值得引入。

## Agent 的系统组成

一个可运行 Agent 至少需要六个层。

| 层 | 作用 | 失败信号 |
| --- | --- | --- |
| Objective | 定义目标、边界和完成条件 | 模型一直忙，但不知道何时结束 |
| State | 保存计划、进度、证据和失败 | 重试时丢上下文，无法回放 |
| Tools | 连接外部系统 | 工具太多、权限太宽、参数不可控 |
| Policy | 决定什么时候行动、询问、停止 | 高风险操作没有确认 |
| Evaluation | 判断结果是否达标 | 模型自评通过，但用户不满意 |
| Observability | 记录 trace、成本、延迟和错误 | 出错后只能读最终回答 |

如果一个 Agent 只有 prompt 和 tools，它可以演示，但很难运维。真正的产品化能力来自后四层：policy、eval、observability 和恢复路径。

## 工具不是越多越好

![Agent 工具边界与权限矩阵](/images/academy/openai-academy/07-building-with-ai/agents/tool-boundary-matrix.png)

工具越多，Agent 的行动空间越大，失败空间也越大。

设计工具时先做权限分层：

| 工具类型 | 风险 | 默认策略 |
| --- | --- | --- |
| Read | 读取文件、搜索、查询知识库 | 可自动执行，但要记录来源 |
| Draft | 生成草稿、创建本地候选变更 | 可自动执行，但不能外部发布 |
| Write | 修改文件、更新工单、写数据库 | 需要限定目录、字段或作用域 |
| External | 发邮件、发消息、发布、付款 | 执行前必须人工确认 |
| Destructive | 删除、覆盖、撤销生产资源 | 默认禁用，除非有强约束审批 |

工具描述也要像 API 合同一样清楚。它应该说明：

- 工具做什么。
- 工具不做什么。
- 输入 schema。
- 输出 schema。
- 错误码。
- 是否有副作用。
- 是否可重试。

模糊工具会诱导模型做模糊决策。

## 状态管理：Agent 的记忆不是聊天记录

很多系统把整段对话历史当成 Agent 状态。这会越来越脆。

更好的状态应该结构化：

```ts
type AgentState = {
  goal: string;
  constraints: string[];
  plan: Array<{ id: string; status: 'pending' | 'running' | 'done' | 'blocked' }>;
  evidence: Array<{ stepId: string; artifact: string; source: string }>;
  failures: Array<{ stepId: string; reason: string; retryCount: number }>;
  approvals: Array<{ action: string; status: 'approved' | 'rejected' }>;
};
```

这样做的价值：

- 可以局部重试，而不是整轮重跑。
- 可以把完成状态和证据分开。
- 可以在用户中断后恢复。
- 可以对每一步做审计。
- 可以把失败样本沉淀进 eval。

聊天记录适合对话体验，不适合做执行系统的唯一状态。

## 人工检查点要放在行动前

可靠 Agent 不是完全不问人，而是只在真正重要的地方问人。

应该触发确认的场景：

- 外部可见动作：发送邮件、发布内容、提交评论。
- 真实写入动作：修改数据库、创建订单、合并代码。
- 成本动作：批量 API 调用、长时间推理、大量媒体生成。
- 低置信度动作：证据冲突、工具多次失败、模型无法解释依据。
- 不可逆动作：删除、覆盖、取消、支付。

检查点要包含足够信息：

```md
## Action Requiring Approval

准备执行：
影响范围：
为什么需要：
可替代方案：
失败后如何回滚：
```

用户确认的应该是业务动作，不是模型的内心过程。

## 评估 Agent：看结果，也看路径

![Agent trace 与评估信号](/images/academy/openai-academy/07-building-with-ai/agents/agent-trace-evaluation.png)

普通 LLM 应用常常只评估最终输出。Agent 还必须评估执行路径。

| 维度 | 问题 |
| --- | --- |
| Task success | 最终任务是否完成？ |
| Tool correctness | 是否选择了正确工具和参数？ |
| Grounding | 关键结论是否有证据？ |
| Safety | 是否越权、泄露或执行了高风险动作？ |
| Efficiency | 是否走了明显冗余路径？ |
| Recovery | 工具失败后是否合理恢复？ |
| Human handoff | 是否在该问人的地方问了人？ |

不要只记录成功率。也要记录失败类别：

- 计划错误。
- 工具选择错误。
- 参数错误。
- 上下文不足。
- 权限不足。
- 评估误判。
- 用户目标变化。

这些类别会决定下一轮改进应该改 prompt、工具、状态、权限，还是 eval。

## 案例：把“研究助理”做成 Agent

目标：用户给一个主题，Agent 输出带来源的研究简报。

可控设计：

1. `clarify`
   - 判断主题是否足够明确。
   - 如果范围太大，先询问。
2. `plan`
   - 生成研究问题、候选来源、输出结构。
3. `retrieve`
   - 调用搜索、文档读取、知识库工具。
   - 保存来源和时间。
4. `synthesize`
   - 只基于证据生成初稿。
5. `review`
   - 检查是否有无来源断言。
   - 检查是否遗漏反例。
6. `deliver`
   - 输出简报、来源、置信度、未覆盖问题。

不要让它自动发布到外部系统。发布是另一个 action，应该需要人工确认。

## 常见反模式

**反模式一：把 Agent 当成更长的 Prompt。**

Agent 是系统，不是文案。没有状态、工具边界和评估，长 Prompt 只会让失败更难定位。

**反模式二：工具权限一开始就全开。**

先从 read-only 和 draft-only 开始，等 trace 和 eval 稳定后再开放写入。

**反模式三：没有最大重试次数。**

Agent 必须有预算、时间和重试上限。无限循环不是智能，是事故。

**反模式四：只看最终回答。**

最终回答正确，但路径越权或成本过高，依然不合格。

## 设计模板

```md
## Agent Card

目标：
不负责：
用户：
输入：
输出：

## Tools

| Tool | Permission | Side Effect | Approval |
| --- | --- | --- | --- |

## State

需要保存：
可以丢弃：
恢复方式：

## Policy

自动执行条件：
必须询问条件：
停止条件：

## Evaluation

成功标准：
路径检查：
失败分类：
回归样本来源：
```

## 检查清单

- 是否先证明任务真的需要 Agent？
- 工具是否按 read、draft、write、external 分层？
- 状态是否结构化，而不是只依赖聊天历史？
- 是否有最大重试、预算和时间上限？
- 高风险动作是否在执行前确认？
- eval 是否同时看最终结果和执行路径？
- trace 是否足以复现一次失败？

## 继续阅读

- [OpenAI Academy：评估 (Evals)](./evals/)：把 Agent 行为转成可比较的质量信号。
- [OpenAI Academy：RAG 核心技术路径](./rag/)：让 Agent 的回答建立在可追溯证据上。
- [Agentic Workflows：用状态机拆解 AI 任务](../../agentic-workflows-02/)：从状态机角度设计可恢复工作流。

## 参考

- [OpenAI Academy: Builder Bootcamp](https://academy.openai.com/home/clubs/builders-etkn1/resources/builder-bootcamp-2026-04-22)
- [OpenAI Agents Guide](https://platform.openai.com/docs/guides/agents)
- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
