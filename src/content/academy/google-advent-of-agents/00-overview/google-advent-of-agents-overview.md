---
title: "Google Advent of Agents：Agent 工程实践总览"
date: 2026-05-06
category: academy
description: "将 Google Cloud Advent of Agents 重组为一条面向工程实践的 AI Academy 学习路线：从 ADK 入门，到 MCP/A2A、部署、观测、评估与安全。"
plainSummary: "本页不是 Advent of Agents 的逐日搬运，而是把两季课程与 Gmail 系列邮件重组为一套图文型 Agent 工程学习地图。"
difficulty: intermediate
coverImage: "/images/academy/google-advent-of-agents/covers/00-overview/google-advent-of-agents-overview.svg"
tags:
  - Agent
  - AI Engineering
lang: zh
academy:
  series: "Google Advent of Agents"
  module: "00 学习路线总览"
  moduleOrder: 120
  source: "Google Cloud Advent of Agents"
  sourceUrl: "https://adventofagents.com/"
  prerequisites:
    - "建议先阅读：AI Basics for Everyone：Agent 是什么"
    - "建议先阅读：MCP 是什么"
draft: false
---

![Google Advent of Agents 学习路线封面](/images/academy/google-advent-of-agents/covers/00-overview/google-advent-of-agents-overview.svg)

**说明：** 本页基于 Google Cloud 的 Advent of Agents 官网、官方文档链接，以及 Gmail 中 `[Advent of Agents]` 系列邮件整理而成。它不是官方译文，也不是逐日摘要。本站会把原始材料改写为原创学习笔记、架构图、操作清单和复盘问题，重点服务于“真的能把 Agent 做成系统”的学习目标。

## 为什么值得单独成为一个 Academy 大类

OpenAI Academy 更偏产品能力、工作流与 OpenAI 工具链落地。Anthropic Academy 更偏 AI Fluency、Claude 协作范式、MCP 与 Agentic Workflow。Google Advent of Agents 的独特价值在于：它把 Agent 当成一个需要工程化交付的系统来讲。

它关心的不是“模型会不会聊天”，而是这些问题：

- 本地写出来的 Agent 如何部署到可访问、可扩缩、可观测的运行时？
- Agent 的上下文、记忆、技能、工具和状态应该如何分层？
- MCP、A2A、A2UI 这些协议到底各自解决哪一层互操作问题？
- 一个 Agent 进入生产前，如何做轨迹测试、Rubric 评分、日志追踪和安全拦截？
- 当任务规模从一次对话变成 10,000 个文档、多个子 Agent、多个服务时，系统边界怎么画？

这正好补上本站 AI Academy 的第三根柱子：

| 学习来源 | 更强的侧重点 | 本站整理方式 |
| --- | --- | --- |
| OpenAI Academy | ChatGPT、Codex、产品化任务交付 | 工具使用、工作流、构建入门 |
| Anthropic Academy | Claude、MCP、协作框架、AI Fluency | 人机协作、协议心智模型、Agentic 工作方式 |
| Google Advent of Agents | ADK、Agent Engine、A2A、生产部署、观测评估 | Agent 工程系统图、实操路线、生产化 checklist |

## 总体工程栈图

![Agent 工程栈图](/images/academy/google-advent-of-agents/diagrams/agent-engineering-stack.svg)

这张图是本站对 Advent of Agents 的重组，不是 Google 原站的目录。原站以 Day 1、Day 2、Day 3 的节奏发布；本站更适合按工程能力分层：

1. **Build core**：ADK、Gemini、工具、Session、Artifact、代码执行，解决“Agent 怎么被写出来”。
2. **Shape context**：Skills、长期记忆、Context caching / compaction、Rewind，解决“Agent 如何保持清醒”。
3. **Connect systems**：MCP、Managed tools、API Registry、A2A、A2UI，解决“Agent 如何接入外部世界与其他 Agent”。
4. **Operate reliably**：Agent Engine、Cloud Run、Batch、Durable execution、Identity propagation，解决“Agent 如何长期运行”。
5. **Govern quality**：Observability、Evalsets、Rubric scoring、Guardrails、Model Armor，解决“Agent 如何被测试、追踪、保护”。

## 两季内容如何取舍

Advent of Agents 目前可以分为两段：

| 季度 | 原始形态 | 本站取法 |
| --- | --- | --- |
| Season 2：2026 年 3 月 | 31 天，进一步展开 Skills、Memory、多 Agent 模式、Workspace / Gemini Enterprise、协议、安全、部署、观测。 | 作为本站公开学习主线：Day 1 是路线入口，Day 2-31 做成 30 篇原创工程讲义。 |
| Season 1：2025 年 12 月 | 25 天，从第一个 ADK Agent 到 Agent Engine、MCP、A2A、观测、安全与 Agent Designer。 | 作为补充来源：给每篇 Season 2 文章提供前置知识、背景对照和生产化补课。 |

这意味着本站不会把两季全部逐日翻译，也不会继续把 Season 2 压缩成少数几篇总览。更稳的做法是：**保留 Season 2 的 30 天推进感，同时把每一天改写为原创工程讲义。**

## Season 2 主线

Day 1 是入口，Day 2-31 是主线文章。每一天都尽量留下一个具体产物：目录、schema、图、tool contract、eval、trace、部署清单或安全边界。

完整 31 天主线已落地：

| Day | 文章 | 读完应该能产出什么 |
| ---: | --- | --- |
| 1 | [学习地图与工程主线](/academy/google-advent-of-agents/season-2/day-01-season-2-learning-map/season-2-learning-map/) | 一张个人学习路线图。 |
| 2 | [用 ADK 搭出可维护 Agent](/academy/google-advent-of-agents/season-2/day-02-adk-agents-gemini-pro/adk-agents-gemini-pro/) | 最小 ADK Agent 目录。 |
| 3 | [Flash-Lite、成本与任务分层](/academy/google-advent-of-agents/season-2/day-03-flash-lite-cost-task-layering/flash-lite-cost-task-layering/) | 模型路由表。 |
| 4 | [MCP Server 作为工具边界](/academy/google-advent-of-agents/season-2/day-04-mcp-server-tool-boundary/mcp-server-tool-boundary/) | 最小 MCP tool spec。 |
| 5 | [长期记忆与可撤回事实](/academy/google-advent-of-agents/season-2/day-05-long-term-recall-memory-plugins/long-term-recall-memory-plugins/) | memory policy。 |
| 6 | [ADK Skills 与按需加载](/academy/google-advent-of-agents/season-2/day-06-adk-skills-progressive-disclosure/adk-skills-progressive-disclosure/) | Skill 清单。 |
| 7 | [Skill 设计模式](/academy/google-advent-of-agents/season-2/day-07-skill-design-patterns/skill-design-patterns/) | SKILL.md 模板。 |
| 8 | [Sequential Agents](/academy/google-advent-of-agents/season-2/day-08-sequential-agents/sequential-agents/) | 五步 pipeline。 |
| 9 | [Coordinator / Dispatcher](/academy/google-advent-of-agents/season-2/day-09-coordinator-dispatcher-agents/coordinator-dispatcher-agents/) | 路由表。 |
| 10 | [Parallel Fanout 与状态汇合](/academy/google-advent-of-agents/season-2/day-10-parallel-fanout-state-interpolation/parallel-fanout-state-interpolation/) | fanout schema。 |
| 11 | [Hierarchical Decomposition](/academy/google-advent-of-agents/season-2/day-11-hierarchical-decomposition/hierarchical-decomposition/) | 任务树。 |
| 12 | [Generator-Critic 循环](/academy/google-advent-of-agents/season-2/day-12-generator-critic-loop/generator-critic-loop/) | critic rubric。 |
| 13 | [Iterative Refinement](/academy/google-advent-of-agents/season-2/day-13-iterative-refinement/iterative-refinement/) | refinement loop。 |
| 14 | [Human in the Loop](/academy/google-advent-of-agents/season-2/day-14-human-in-the-loop/human-in-the-loop/) | approval payload。 |
| 15 | [Agentic RAG 与 Grounding](/academy/google-advent-of-agents/season-2/day-15-agentic-rag-vector-search/agentic-rag-vector-search/) | RAG contract。 |
| 16 | [多 Agent Triage 开发技能](/academy/google-advent-of-agents/season-2/day-16-adk-dev-skills-multiagent-triage/adk-dev-skills-multiagent-triage/) | triage board。 |
| 17 | [Workspace 与无代码 Agent](/academy/google-advent-of-agents/season-2/day-17-workspace-gemini-enterprise-no-code/workspace-gemini-enterprise-no-code/) | no-code checklist。 |
| 18 | [企业工作台里的 ADK Agent](/academy/google-advent-of-agents/season-2/day-18-workspace-gemini-enterprise-adk-agents/workspace-gemini-enterprise-adk-agents/) | enterprise integration map。 |
| 19 | [Live Shopping Agent 案例](/academy/google-advent-of-agents/season-2/day-19-live-shopping-agent/live-shopping-agent/) | commerce risk map。 |
| 20 | [ADK Agent Harness](/academy/google-advent-of-agents/season-2/day-20-adk-agent-harness/adk-agent-harness/) | harness runbook。 |
| 21 | [Agent Protocols 全景](/academy/google-advent-of-agents/season-2/day-21-agent-protocols-guide/agent-protocols-guide/) | protocol boundary matrix。 |
| 22 | [ADK Evaluation](/academy/google-advent-of-agents/season-2/day-22-adk-evaluation/adk-evaluation/) | evalset。 |
| 23 | [Model Armor 与安全防火墙](/academy/google-advent-of-agents/season-2/day-23-model-armor/model-armor/) | safety gate map。 |
| 24 | [Batch Processing 与 Agent Orchestrator](/academy/google-advent-of-agents/season-2/day-24-batch-processing-agent-orchestrator/batch-processing-agent-orchestrator/) | batch job schema。 |
| 25 | [Agent Deployment](/academy/google-advent-of-agents/season-2/day-25-agent-deployment-agent-engine-cloud-run/agent-deployment-agent-engine-cloud-run/) | deployment checklist。 |
| 26 | [Authentication 与身份传播](/academy/google-advent-of-agents/season-2/day-26-authentication-identity-propagation/authentication-identity-propagation/) | identity flow。 |
| 27 | [Scion 与隔离式编排](/academy/google-advent-of-agents/season-2/day-27-scion-isolated-agent-orchestration/scion-isolated-agent-orchestration/) | isolation map。 |
| 28 | [A2A Protocol](/academy/google-advent-of-agents/season-2/day-28-a2a-protocol-reasoning-execution/a2a-protocol-reasoning-execution/) | A2A task contract。 |
| 29 | [ApiRegistry 与动态工具治理](/academy/google-advent-of-agents/season-2/day-29-api-registry-dynamic-tools/api-registry-dynamic-tools/) | registry-backed tool flow。 |
| 30 | [Observability 与分层追踪](/academy/google-advent-of-agents/season-2/day-30-observability-hierarchical-tracing/observability-hierarchical-tracing/) | trace schema。 |
| 31 | [A2UI、A2A 与交互式 Agent](/academy/google-advent-of-agents/season-2/day-31-a2ui-a2a-interactive-microapps/a2ui-a2a-interactive-microapps/) | interactive payload spec。 |


## 聚合专题如何使用

昨天先落地的几篇聚合文章不会浪费。它们更适合作为“横向复习”：

| 本站模块 | 对应 Advent 主题 | 读完应该能产出什么 |
| --- | --- | --- |
| 01 ADK 与 Agent 项目骨架 | Hello World with YAML、Gemini + ADK、Agent Starter Pack、ADK 多语言模板 | 一个可运行的最小 ADK Agent，以及项目目录认知。 |
| 02 上下文、记忆与 Skills | ADK Layers、Big Context、Memory Plugins、ADK Skills、Skill Design Patterns | 一份 Context / Memory / Skill 分层设计图。 |
| 03 工具与协议互操作 | MCP Servers、Google Managed MCP、A2A、A2UI、API Registry、Agent Protocols | 一张 MCP / A2A / A2UI 边界对比表。 |
| 04 多 Agent 编排 | Sequential、Coordinator、Parallel Fanout、Hierarchical、Generator-Critic、Human in the Loop | 选择合适多 Agent 模式的决策树。 |
| 05 部署、观测与安全控制面 | Source-based deployment、Agent Engine、Cloud Run、Batch、Durable execution、Authentication、Production Observability、ADK Evaluation、Model Armor | 从本地 Agent 到生产运行时的部署路径，以及 CI 中可执行的评估、安全和追踪清单。 |

## Gmail 邮件为什么有用

Gmail 里的 `[Advent of Agents]` 系列邮件不是用来复制正文的，而是作为“编辑信号”：

- 它能确认每一天官方希望强调的三个重点。
- 它能补充官网卡片里不明显的定位，例如某一天到底是在讲产品功能、架构模式，还是生产治理。
- 它能帮助我们判断哪些主题应该写成长文，哪些只需要在总览中归档。

当前已检索到的邮件覆盖 Season 2 的 Day 1、Day 22-31，主题集中在评估、安全、批处理、部署、身份、A2A、ApiRegistry、观测和 A2UI。这组邮件对后半段“生产化”内容特别有价值。

## 推荐阅读顺序

如果你是第一次系统学习 Agent 工程，不建议从官网 Day 1 一路点到 Day 56。更好的顺序是：

1. 先读本站的 Agent 与 MCP 入门，建立概念边界。
2. 再进入本系列总览，知道 Google 这条路线为什么偏生产工程。
3. 跑通一个最小 ADK Agent，不追求复杂功能。
4. 加入一个工具接口，观察工具调用、错误处理和日志。
5. 加入 Context / Memory / Skill 分层，避免把所有内容塞进一个大 Prompt。
6. 把本地 Agent 部署到可访问运行时，并建立最小观测面。
7. 最后补 Evals、Model Armor、身份传播、Batch 与多 Agent 模式。

这条路线的核心不是“懂很多名词”，而是每一步都能留下一个工程产物：目录、配置、图、日志、评估集、部署说明、安全边界。

## 和现有内容的连接点

本系列不会孤立存在。它会和站内已有内容互相引用：

- 与 [Agent 是什么](/start/ai-basics-for-everyone/what-is-agent/) 连接：从概念入门过渡到工程实现。
- 与 [MCP 是什么](/start/ai-basics-for-everyone/what-is-mcp/) 连接：解释工具协议为什么是 Agent 系统的一部分。
- 与 [Minimal MCP Server](/engineering/ai-developer-core/minimal-mcp-server/) 连接：把协议认知落到最小实现。
- 与 [Agent Harness：日志、审批与回放](/engineering/ai-developer-core/agent-harness-logging-approval-replay/) 连接：把 Google 的观测、评估和审批主题映射到通用工程模式。
- 与 OpenAI Academy 的 [Building Agents](/academy/openai-academy/07-building-with-ai/agents/) 连接：比较不同平台对 Agent 的系统定义。
- 与 Anthropic Academy 的 [Introduction to Subagents](/academy/anthropic-academy/05-agentic-mcp/introduction-to-subagents/) 连接：比较子 Agent 与多 Agent 协议的不同层次。

## 本站文章的固定写法

后续每篇 Google Advent of Agents 文章会尽量采用同一套结构：

1. **真实问题**：这篇解决什么工程痛点。
2. **概念图**：用原创图解释组件关系。
3. **最小可运行思路**：保留必要命令和目录，不堆砌完整教程。
4. **生产化风险**：列出部署、权限、观测、成本、数据安全等风险。
5. **跨平台对照**：说明它与 OpenAI / Anthropic / 通用工程模式的关系。
6. **复核清单**：读者可以照着检查自己的 Agent 是否过关。

## 第一个实践目标

读完总览后，可以先设定一个很小的练习：

> 用 ADK 跑通一个只读工具型 Agent。它能接收一个问题，调用一个受限工具，返回结构化答案，并记录每次工具调用。暂时不追求部署，只要求边界清楚、日志可读、失败可解释。

这个练习比“做一个万能 Agent”更稳。它能逼你回答三个关键问题：模型负责什么，工具负责什么，系统如何知道这次执行是成功还是失败。

## 复核清单

- 我能说清楚 ADK、Agent Engine、Agent Starter Pack 分别处于哪一层。
- 我知道 MCP 是 tool integration，不等同于多 Agent 协作。
- 我知道 A2A 是 agent-to-agent protocol，不应该拿它替代所有内部函数调用。
- 我知道 A2UI 解决的是 Agent 输出交互式 UI 的问题。
- 我不会把“长上下文”误认为“好记忆”。
- 我会在 Agent 进入生产前先设计日志、评估、权限和安全拦截。
- 我能把官网逐日主题重组为自己的工程学习路线。

## 参考来源

- [Advent of Agents](https://adventofagents.com/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
- [Agent Starter Pack](https://github.com/GoogleCloudPlatform/agent-starter-pack)
- [Vertex AI Agent Engine](https://docs.cloud.google.com/agent-builder/agent-engine/overview)
- [Agent Designer](https://docs.cloud.google.com/agent-builder/agent-designer)
- [Kaggle Introduction to Agents Whitepaper](https://www.kaggle.com/whitepaper-introduction-to-agents)
