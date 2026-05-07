---
title: "Google Advent of Agents：ADK Agent 项目骨架"
date: 2026-05-06
category: academy
description: "从最小 ADK Agent 出发，拆解 root_agent、model、tools、state、runtime、checks 与部署路径，建立 Agent 工程项目的第一张地图。"
plainSummary: "这篇图文笔记把 Advent of Agents 中 Hello World、Gemini + ADK 与 Agent Starter Pack 相关主题重组为 ADK 项目解剖，而不是逐日摘要。"
difficulty: intermediate
coverImage: "/images/academy/google-advent-of-agents/covers/01-adk-agent-project-anatomy.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: zh
academy:
  series: "Google Advent of Agents"
  module: "01 ADK 与 Agent 项目骨架"
  moduleOrder: 121
  source: "Google Cloud Advent of Agents"
  sourceUrl: "https://adventofagents.com/2025/12/02"
  prerequisites:
    - "建议先阅读：Google Advent of Agents：Agent 工程实践总览"
draft: false
---

![ADK Agent 项目骨架封面](/images/academy/google-advent-of-agents/covers/01-adk-agent-project-anatomy.svg)

**说明：** 本文基于 Google Advent of Agents 中关于 Hello World、Gemini + ADK、Agent Starter Pack 的公开材料，以及 ADK 官方文档入口整理。它不是官方 Quickstart 的替代品。本站更关心的是：当你跑通第一个 Agent 之后，如何立刻看懂这个项目里哪些部分会在生产化时变成真实工程边界。

## 这篇解决什么问题

很多 Agent 教程会让你快速得到一个“能回答问题的 Demo”。Demo 很鼓舞人，但它也容易制造错觉：好像 Agent 就是一段 prompt 加一个模型。

ADK 的价值在于，它逼你把 Agent 看成一个可运行项目：

- 有一个 `root_agent` 承担入口职责。
- 有模型选择和指令边界。
- 有 tools，且每个工具都应该知道自己能读什么、能写什么。
- 有 session、artifact、memory 等状态面。
- 有本地 runtime，可以用来调试交互。
- 有后续部署路径，可以进入 Agent Engine 或 Cloud Run。
- 有评估、日志、人工复核，决定这个 Agent 是否真的可靠。

如果第一天只学会命令，却没有学会这些边界，后面加 MCP、A2A、观测、安全都会变成一团雾。

## 项目骨架图

![ADK Agent 项目解剖图](/images/academy/google-advent-of-agents/diagrams/adk-agent-project-anatomy.svg)

把一个最小 Agent 拆开看，大致有六块：

| 区块 | 作用 | 初学时最容易忽略的风险 |
| --- | --- | --- |
| `root_agent` | Agent 的入口定义，聚合模型、指令、工具和行为边界。 | 把所有规则写成一大段，后续无法测试、复用或分层。 |
| `model` | 决定推理、成本、速度、上下文能力和工具调用表现。 | 默认模型能跑，不代表适合生产任务。 |
| `tools` | 让 Agent 读取或操作外部系统。 | 工具权限过大，或者错误返回不可解释。 |
| `state` | session、artifact、memory 等运行过程中的上下文资产。 | 把“长聊天记录”误认为“可靠记忆”。 |
| `runtime` | 本地运行、调试、API 服务或 UI playground。 | 只看聊天结果，不看事件、日志和工具调用。 |
| `checks` | eval、日志、人工审查和回归用例。 | Demo 能成功一次，就误以为系统稳定。 |

这就是本文的核心观点：**最小 Agent 也已经是系统。**

## 从 Hello World 到工程项目

Advent of Agents 的早期主题通常会引导你从最小配置或最小代码开始。这个顺序是对的，但理解重点不应该停在“跑起来了”。

你可以把第一个项目理解成三层：

| 层级 | 学习重点 | 产出 |
| --- | --- | --- |
| 配置层 | 项目如何声明 Agent、模型和依赖。 | 能指出入口文件和依赖文件。 |
| 行为层 | Agent 被要求做什么，哪些事不允许做。 | 一段清晰、可审查的 instruction。 |
| 运行层 | 如何启动、观察、复现、停止。 | 一套本地运行命令与日志观察方法。 |

最小项目并不要求复杂，但必须能回答：

1. 谁是入口 Agent？
2. 这个 Agent 用什么模型？
3. 它能调用哪些工具？
4. 它在哪里保存状态？
5. 它失败时，开发者看哪里？

如果这五个问题答不上来，项目还只是“代码能跑”，不是“工程可控”。

## 最小代码骨架

下面是一个学习用骨架，用来说明 ADK 项目的形状。具体 API 和安装命令请始终以 [ADK 官方 Quickstart](https://google.github.io/adk-docs/get-started/) 为准。

```python
from google.adk.agents import Agent


def lookup_public_note(topic: str) -> dict:
    """Return a small, read-only note for a known learning topic."""
    notes = {
        "adk": "ADK organizes agents, tools, runtime, and evaluation surfaces.",
        "mcp": "MCP standardizes how agents connect to external tools.",
        "a2a": "A2A focuses on agent-to-agent interoperability.",
    }
    return {
        "topic": topic,
        "note": notes.get(topic.lower(), "No local note found."),
        "source": "local_read_only_demo",
    }


root_agent = Agent(
    name="academy_guide",
    model="gemini-3.1-pro",
    description="Guide readers through agent engineering concepts.",
    instruction=(
        "Answer as a careful learning guide. Use the lookup_public_note tool "
        "only for the supported public topics. If the topic is unsupported, "
        "say what is missing instead of inventing a source."
    ),
    tools=[lookup_public_note],
)
```

这个例子很小，但已经包含三个重要设计：

- 工具是**只读**的，返回结构化字典。
- instruction 明确说“找不到就承认缺失”，降低幻觉诱因。
- `root_agent` 把 name、model、description、instruction、tools 放在一个可审查位置。

这比“你是一个万能助手，请帮我回答任何问题”稳得多。

## 目录应该怎么读

不同语言、模板和 Agent Starter Pack 生成的目录会有差异。初学时不必记住每个文件名，但要会识别这些角色：

```text
my-agent/
  agent.py or agent.yaml      # root_agent 或 Agent 配置入口
  tools/                      # 工具函数、MCP 连接或外部 API 适配
  prompts/ or skills/         # 可复用指令、技能或任务知识
  evals/                      # 回归任务、轨迹测试或评分规则
  tests/                      # 常规单元测试和工具测试
  pyproject.toml/package.json # 依赖、脚本和运行入口
  README.md                   # 给人看的边界说明
```

真正值得养成的习惯是：每加入一个文件，都问它属于哪一层。

| 文件变化 | 应该追问 |
| --- | --- |
| 新增工具 | 它是只读还是可写？失败返回是什么格式？ |
| 修改 instruction | 是长期规则、任务规则，还是临时上下文？ |
| 加入 memory | 哪些内容能长期保存？用户能否撤回？ |
| 加入 deployment | 谁拥有运行权限、日志权限和成本责任？ |
| 加入 eval | 它验证的是回答质量、工具轨迹，还是安全边界？ |

这套追问比模板本身更重要，因为模板会变，边界不会。

## Agent Starter Pack 的角色

Agent Starter Pack 可以理解为“把工程脚手架提前搭好”。它的价值不是让你少敲几行命令，而是让你更早面对生产化问题：

- 项目如何被创建和增强。
- 依赖如何被声明。
- 本地运行和部署脚本如何组织。
- 观测、测试、CI/CD、Terraform 等能力如何逐步接入。

学习时建议用两个视角看 Starter Pack：

| 视角 | 看什么 | 不要误解成什么 |
| --- | --- | --- |
| 初学者 | 它如何帮我快速得到可运行项目。 | 不要把模板当作黑盒魔法。 |
| 工程师 | 它把哪些生产化决策提前固化。 | 不要以为模板生成后就不需要审查。 |

当你看到类似 `uvx agent-starter-pack create ...` 的命令时，重点不是背命令，而是观察它生成了哪些目录、脚本、配置和默认权限。

## 本地运行时要观察什么

很多人跑 `adk web` 或类似 playground 后，只盯着最终回答。Agent 工程里更应该观察这些信号：

| 信号 | 为什么重要 |
| --- | --- |
| 模型是否真的调用了工具 | 判断 instruction 与工具描述是否足够清晰。 |
| 工具输入是否符合预期 | 发现参数解析、边界条件和注入风险。 |
| 工具失败时模型如何回应 | 判断 Agent 是否会编造结果。 |
| 同一问题重复运行是否稳定 | 初步判断是否需要 eval 或更严格约束。 |
| 日志里是否能还原关键步骤 | 为后续观测和事故排查打基础。 |

第一个 Agent 的目标不是“惊艳”，而是“可解释”。你要能复盘它为什么给出这个答案。

## 从最小项目到部署路径

Advent of Agents 很快会进入 Source-Based Deployment、Agent Engine、Cloud Run 等主题。先不要急着部署。部署之前，至少完成这张表：

| 问题 | 最小答案 |
| --- | --- |
| 这个 Agent 的用户是谁？ | 内部学习者、开发者、客户支持，还是自动化任务？ |
| 它能读取什么？ | 本地公开资料、Google Workspace、数据库、外部 API？ |
| 它能写入什么？ | 没有写入、草稿、工单、邮件、生产系统？ |
| 它失败会造成什么影响？ | 回答错误、成本增加、数据泄露、错误操作？ |
| 谁能看日志？ | 开发者、管理员、审计人员？ |
| 如何回滚？ | 关闭工具、回退版本、暂停部署、人工接管？ |

如果这些问题没有答案，Agent Engine 只是把不清楚的边界部署到了云上。

## 与 OpenAI / Anthropic 路线的对照

| 主题 | OpenAI / Codex 视角 | Anthropic / Claude 视角 | Google ADK 视角 |
| --- | --- | --- | --- |
| 第一个项目 | 从任务委派和代码验证开始。 | 从协作方式、MCP、Skills、Subagents 理解边界。 | 从 Agent 定义、工具、运行时和部署路径开始。 |
| 工具调用 | 更强调产品化环境中的任务完成。 | 更强调协议、上下文、协作和能力描述。 | 更强调可运行项目、工具集成、状态、评估和运行时。 |
| 生产化 | Codex 侧重工程任务交付闭环。 | Claude Code 侧重开发者协作与工作流定制。 | ADK 侧重 Agent 作为服务进入云端运行和治理。 |

这三条路线并不是互斥的。真正成熟的 Agent 项目，往往需要同时具备：清晰任务定义、良好协作协议、可部署运行时和可验证质量。

## 最小实践任务

建议你用这篇文章设计一个 60 分钟练习：

1. 按官方 ADK Quickstart 创建一个最小 Agent。
2. 给它加一个只读工具，返回结构化数据。
3. 写下 instruction 中的三条硬边界。
4. 连续问三个问题：一个支持、一个不支持、一个带模糊意图。
5. 记录工具是否被调用、参数是否正确、失败是否诚实。
6. 把结果整理成一张小表，作为后续 eval 的雏形。

实践记录表：

| 测试问题 | 预期工具调用 | 实际工具调用 | 回答是否诚实 | 需要改进 |
| --- | --- | --- | --- | --- |
| 支持主题 | 应调用 | 待填写 | 待填写 | 待填写 |
| 不支持主题 | 可不调用或返回缺失 | 待填写 | 待填写 | 待填写 |
| 模糊主题 | 应先澄清或说明范围 | 待填写 | 待填写 | 待填写 |

## 复核清单

- 我能指出项目里的 Agent 入口在哪里。
- 我能说明 `root_agent` 的 instruction、model、tools 分别负责什么。
- 我知道第一个工具应该尽量只读、结构化、失败可解释。
- 我不会把“本地能聊”误认为“可以部署”。
- 我能观察一次运行中的工具调用、参数和失败处理。
- 我能写出部署前必须回答的权限、日志、回滚问题。
- 我能把 Starter Pack 看作工程脚手架，而不是免审查模板。

## 参考资源

- [Advent of Agents](https://adventofagents.com/)
- [ADK Get started](https://google.github.io/adk-docs/get-started/)
- [ADK Python Quickstart](https://google.github.io/adk-docs/get-started/python/)
- [Agent Starter Pack](https://github.com/GoogleCloudPlatform/agent-starter-pack)
- [Agent Starter Pack Getting Started](https://googlecloudplatform.github.io/agent-starter-pack/guide/getting-started.html)
- [Vertex AI Agent Engine](https://docs.cloud.google.com/agent-builder/agent-engine/overview)

