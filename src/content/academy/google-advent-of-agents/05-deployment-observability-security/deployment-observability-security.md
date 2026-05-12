---
title: "Google Advent of Agents：部署、观测与安全控制面"
date: 2026-05-06
category: academy
description: "把 Agent Engine、Cloud Run、Batch、Durable Execution、ADK Evaluation、Observability、Authentication 与 Model Armor 重组为一套生产控制面。"
plainSummary: "这篇图文笔记把 Agent 上线前必须回答的问题整理为部署、追踪、评估、身份、安全和耐久执行六个控制面。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/covers/05-deployment-observability-security.svg"
tags:
  - Agent
  - AI Engineering
lang: zh
academy:
  series: "Google Advent of Agents"
  module: "05 部署、观测与安全"
  moduleOrder: 125
  source: "Google Cloud Advent of Agents"
  sourceUrl: "https://adventofagents.com/2026/03/25"
  prerequisites:
    - "建议先阅读：Google Advent of Agents：多 Agent 编排模式"
draft: false
---

![部署、观测与安全封面](/images/academy/google-advent-of-agents/covers/05-deployment-observability-security.svg)

**说明：** 本文基于 Advent of Agents 中关于 Source-Based Deployment、Agent Engine、Cloud Run、Batch Processing、Durable Execution、ADK Evaluation、Production Observability、Authentication、Guardrails 与 Model Armor 的公开主题重组。它不复述产品发布内容，而是把这些主题合并成一个上线问题：一个 Agent 什么时候才算可以进生产？

## 这篇解决什么问题

Agent demo 成功，不等于 Agent 系统可以上线。

一个本地 demo 只需要证明模型能回答、工具能调用、流程能跑通。生产系统还要回答：

- 它部署在哪里，如何回滚？
- 每次执行能不能追踪到输入、工具、输出和错误？
- 质量下降时，CI 能不能拦住？
- 用户身份是否能传递到工具和后端系统？
- Prompt injection、越权、PII 泄露如何拦截？
- 长任务失败后能不能恢复，而不是从头再来？
- 10,000 个任务能否异步处理，而不是把用户卡在页面上？

Advent of Agents 的后半段价值就在这里：它把 Agent 从“会调用工具”推向“可部署、可观测、可评估、可治理”。

## 生产控制面图

![生产 Agent 控制面图](/images/academy/google-advent-of-agents/diagrams/production-agent-control-plane.svg)

可以把生产 Agent 周围的控制面分成六块：

| 控制面 | 核心问题 | 典型信号 |
| --- | --- | --- |
| Deployment | Agent 在哪里运行，如何发布和回滚？ | 版本、环境、配置、健康检查、回滚策略。 |
| Observability | 每一步发生了什么，失败时如何复盘？ | traces、spans、logs、artifacts、replay。 |
| Evals | 质量是否退化，能否在发布前发现？ | trajectory tests、rubrics、golden tasks、CI gate。 |
| Identity | 工具调用代表谁，权限来自哪里？ | end-user auth、OAuth consent、service account、audit log。 |
| Safety | 输入和输出如何被保护？ | guardrails、Model Armor、PII redaction、approval。 |
| Durability / Batch | 长任务和大批量任务如何可靠执行？ | retries、checkpoint、resume、queues、batch jobs。 |

上线不是完成一个部署命令，而是这六块都至少有最小答案。

## Deployment：从本地 Agent 到运行时

本地 Agent 的价值是迭代快。生产运行时的价值是可访问、可扩缩、可管理。

Google 路线里常见的部署选择包括 Agent Engine、Cloud Run，以及基于 starter pack 的项目模板。你不需要一开始就追求最复杂的部署形态，但至少要明确：

- 运行环境：本地、Cloud Run、Agent Engine、批处理任务，还是企业工作台。
- 配置来源：模型、工具、密钥、区域、日志级别放在哪里。
- 发布方式：源代码部署、容器、CI/CD，还是手动发布。
- 回滚方式：上一个稳定版本在哪里，如何切回。
- 健康检查：系统如何知道 Agent 不是“能启动但不能完成任务”。

对 Agent 来说，健康检查不能只看 HTTP 200。更有意义的是跑一个最小任务：模型可用、工具可调用、日志可写、权限正确。

## Observability：看见轨迹，而不只是最终答案

传统 Web 服务可以看请求、响应、错误和耗时。Agent 还需要看中间轨迹。

一次 Agent 执行可能包含：

- 用户输入。
- system / developer / tool instructions 的有效视图。
- 模型选择和 token 使用。
- 工具调用参数和结果摘要。
- 子 Agent 委托。
- 检索来源。
- 安全拦截。
- 用户审批。
- 最终输出。

如果只记录最终答案，生产事故几乎无法复盘。

一个可用的 tracing 设计至少应该能回答：

| 问题 | 需要的记录 |
| --- | --- |
| Agent 为什么调用这个工具？ | planning span 或 tool selection reason。 |
| 工具返回了什么？ | 参数、状态码、结构化摘要、错误。 |
| 哪一步变慢？ | 每个 span 的耗时。 |
| 哪个子 Agent 出错？ | delegation span 和子任务结果。 |
| 用户批准了什么？ | approval payload 和用户选择。 |

观测不是为了做漂亮 dashboard，而是为了让你能修系统。

## Evals：把质量门槛放进发布流程

Agent 的回归常常不是语法错误，而是行为漂移：

- 工具调用顺序变了。
- 该拒绝的请求没有拒绝。
- 该引用来源的答案没有引用。
- 子 Agent 路由错了。
- 同样任务今天输出更啰嗦、更冒险或更没证据。

因此 eval 不应该只比较最终文本。Advent of Agents 中的 ADK Evaluation、trajectory tests、rubric scoring 指向同一个实践：评估执行轨迹。

最小 eval 集可以包括：

| 测试类型 | 示例 |
| --- | --- |
| Golden task | 给定输入，应该调用哪个工具，输出包含哪些字段。 |
| Negative task | 用户请求越权数据，Agent 应该拒绝并解释边界。 |
| Trajectory test | 应先检索，再分析，再生成，而不是直接编造。 |
| Rubric score | 事实性、可执行性、证据质量、安全性达到阈值。 |
| Regression task | 修过的 bug 变成固定测试。 |

把 eval 放进 CI，意义不是追求 100 分，而是防止低级回归悄悄进生产。

## Identity：工具调用必须代表清楚的身份

Agent 调用工具时，权限问题会变得敏感。

一个工具调用到底代表谁？

- 代表系统服务账号？
- 代表当前登录用户？
- 代表某个被委托的角色？
- 代表审批后的临时权限？

如果这个问题不清楚，就会出现两类风险：

- Agent 用系统账号绕过用户本来没有的权限。
- 日志只能看到“Agent 调用了 API”，看不到最终责任人。

身份传播设计应该至少回答：

1. 用户如何授权？
2. 授权范围是什么？
3. 工具调用时使用哪种凭据？
4. 凭据是否可撤销、会过期？
5. 审计日志如何关联用户、Agent、工具和结果？

对于读取数据、发送邮件、修改资源这类动作，身份边界比 prompt 文案更重要。

## Safety：Guardrails 和 Model Armor 不是装饰

Agent 安全不只是“让模型不要做坏事”。

常见风险包括：

- Prompt injection：外部内容诱导 Agent 忽略规则。
- Jailbreak：用户刻意绕过限制。
- Tool abuse：模型调用了不该调用的高风险工具。
- PII leakage：输出暴露个人信息或敏感字段。
- Data exfiltration：检索或工具结果被带到不该去的地方。
- Over-automation：没有审批就执行不可逆动作。

Guardrails 应该分布在多个位置：

| 位置 | 作用 |
| --- | --- |
| 输入前 | 识别恶意请求、敏感数据、越权意图。 |
| 工具调用前 | 检查权限、参数、风险等级和审批状态。 |
| 工具调用后 | 脱敏、过滤、限制返回字段。 |
| 输出前 | 检查 PII、危险建议、政策违规和引用边界。 |
| 人类审批前 | 展示影响范围、可撤销性和替代方案。 |

Model Armor 这类能力可以理解为其中一个安全防火墙，但系统仍然需要权限、日志和审批共同工作。

## Durability 与 Batch：让长任务可靠完成

生产 Agent 经常不是一次短对话。

它可能要：

- 处理 10,000 个文档。
- 给一批客户生成摘要。
- 运行几个小时的迁移检查。
- 等待人工审批后继续。
- 调用外部系统，遇到限流和重试。

这时需要 durable execution 和 batch thinking。

一个可靠长任务应该有：

- checkpoint：完成到哪一步。
- idempotency：重复执行不会造成重复副作用。
- retry policy：哪些错误可以重试，重试几次。
- timeout：卡住时如何停止。
- resume：中断后从哪里继续。
- batch status：每个 item 的成功、失败、跳过和待审批状态。

否则，Agent 很容易在第 9,999 个任务失败时让你从头再来。

## 上线前最小门槛

如果要给一个 Agent 做 production readiness review，可以从这张表开始：

| 维度 | 最小门槛 |
| --- | --- |
| 任务边界 | 清楚写出能做、不能做、需要审批的事。 |
| 部署 | 有版本、环境、配置、回滚和健康检查。 |
| 工具 | 每个工具有权限、参数 schema、错误处理和日志。 |
| 观测 | 每次执行有 trace，关键 artifact 可复盘。 |
| 评估 | 有 golden、negative、trajectory 和 regression tests。 |
| 身份 | 能说明工具调用代表谁，日志能追溯用户。 |
| 安全 | 输入、工具、输出、审批都有 guardrail。 |
| 耐久 | 长任务有 checkpoint、retry、resume 和 batch status。 |

这些不是大公司专属要求。哪怕是个人项目，也可以做一个轻量版本。

## 跨平台对照

| 主题 | Google 路线 | 通用工程映射 |
| --- | --- | --- |
| 部署 | Agent Engine、Cloud Run、Starter Pack | runtime、CI/CD、环境配置。 |
| 观测 | hierarchical tracing、OpenTelemetry、Phoenix | traces、spans、logs、replay。 |
| 评估 | ADK Evaluation、trajectory tests、rubrics | test suite、quality gate、regression control。 |
| 安全 | Guardrails、Model Armor、callbacks | policy engine、DLP、approval workflow。 |
| 身份 | end-user identity propagation、OAuth | authz、audit、least privilege。 |
| 批处理 | Batch API、Agent as Orchestrator | queues、workers、idempotent jobs。 |

这也是本系列适合放进 AI Academy 的原因：它把 Agent 讲成工程系统，而不是单一产品功能。

## 最小实践任务

选择一个已有 Agent demo，做上线前控制面盘点：

1. 写出部署目标：本地、Cloud Run、Agent Engine 或其他运行时。
2. 设计一个健康检查任务，而不是只看服务是否启动。
3. 为一次完整执行画出 trace span。
4. 写 5 个 eval：2 个正常任务、1 个越权任务、1 个工具失败任务、1 个历史 bug。
5. 标注每个工具调用代表哪个身份。
6. 给最高风险工具加一个人类审批点。
7. 如果任务超过 5 分钟，设计 checkpoint 和 resume。

实践记录表：

| 控制面 | 当前状态 | 最小补强 |
| --- | --- | --- |
| Deployment | 本地可跑 | 增加版本、配置和回滚说明。 |
| Observability | 只有最终答案 | 增加工具 span 和 artifact 摘要。 |
| Evals | 手工试用 | 增加 golden / negative / regression tests。 |
| Identity | 使用系统凭据 | 记录最终用户和授权范围。 |
| Safety | prompt 提醒 | 工具前 policy gate + 输出前脱敏。 |
| Durability | 无 | checkpoint + retry + batch status。 |

## 复核清单

- 我知道 demo 成功不等于生产可用。
- 我能说出 Agent 的部署位置、配置来源、回滚方式和健康检查。
- 我能为一次执行画出 trace：输入、工具、子任务、审批、输出。
- 我能设计 trajectory test，而不只是比较最终文本。
- 我能解释工具调用代表哪个用户或服务身份。
- 我知道 guardrails 应该覆盖输入、工具、输出和审批。
- 我能为长任务设计 checkpoint、retry、resume 和 batch status。
- 我能用一张 readiness review 表判断 Agent 是否能上线。

## 参考资源

- [Advent of Agents](https://adventofagents.com/)
- [Season 2: ADK Evaluation](https://adventofagents.com/2026/03/22)
- [Season 2: Model Armor](https://adventofagents.com/2026/03/23)
- [Season 2: Batch Processing](https://adventofagents.com/2026/03/24)
- [Season 2: Agent Deployment](https://adventofagents.com/2026/03/25)
- [Season 2: Authentication](https://adventofagents.com/2026/03/26)
- [Season 2: Observability](https://adventofagents.com/2026/03/30)
- [Vertex AI Agent Engine](https://docs.cloud.google.com/agent-builder/agent-engine/overview)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
