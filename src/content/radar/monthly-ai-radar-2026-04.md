---
title: "AI 雷达月报：2026 年 4 月（截至 04-22）"
date: 2026-04-22
category: radar
cadence: monthly
tags:
  - Agent
  - Open Models
  - AI Infrastructure
  - Coding Agents
lang: zh
audioUrl: /audio/radar/monthly-ai-radar-2026-04.mp3?v=monthly
deckUrl: /decks/radar/monthly-ai-radar-2026-04.pdf
draft: false
---

# 月度结论

把时间窗口延长到 `04-22` 以后，四月这轮 AI 信号比前半月更完整了。最值得记住的不是某一个“最强模型”，而是下面四条长期趋势已经开始彼此咬合：

1. **Agent 的主战场已经实质性上移到运行时**  
   记忆、技能、协议、审批门控、工作区、恢复能力、可观测性，再加上近期更明确的 zero-secret 与 deterministic review pipeline，一起构成了 2026 年最关键的 Agent 工程层。

2. **Context Engineering 从 prompt 技巧变成系统设计能力**  
   模型能不能高效完成任务，越来越取决于后端如何暴露 schema、状态、错误信息和操作边界，而不仅是前端提示词怎么写。

3. **模型产品线开始真正分层，并向更多出口外溢**  
   旗舰模型、门控前沿版、垂直专用模型、robotics VLA、diffusion LLM、检索基础模型同时推进，说明“模型竞争”已经是整条产品线和执行栈的竞争。

4. **平台入口、合规边界和资本市场开始同步收紧**  
   IDE、搜索、设计工具、会议记录、个人 Agent OS 都在争入口；KYC、区域限制、算力投资、供应链迁移则在重写这场竞争的现实约束。

![Agent Landscape 演进图](https://substack-post-media.s3.amazonaws.com/public/images/acc877e8-071d-4d5c-bcc5-c8dbe50e37c1_2114x1154.png)

*代表图来自 [Evolution of Agent Landscape From 2022-26](https://blog.dailydoseofds.com/p/evolution-of-agent-landscape-from)。用它来做月报代表图最合适，因为 4 月上半月最重要的长期变化，就是 Agent 能力正在整体外移到运行时层。*

## 本月四条主线

## 1. Harness Engineering 正在进化成更硬的 runtime 设计语言

- 从 Agent Harness、Advisor Strategy、Build Agents That Don’t Fail in Production，到最近的 GitHub Agentic Workflow、Hermes Agent、多 Agent orchestration，主线已经很清楚：决定 Agent 上限的，不只是模型，而是执行环境。
- 这一层现在至少包含工作区隔离、状态持久化、审批节点、上下文装配、失败重规划，以及更关键的 **zero-secret runtime** 和 **deterministic output review**。
- 如果说三月大家还在讨论“Agent 能不能做事”，那四月后半月的重点已经变成“Agent 怎样才能安全、稳定、长期地做事”。

## 2. Context Engineering 变成了成本、可靠性和产品体验的交叉点

- `04-21` 的几篇内容把这件事讲得非常透：Agent 的 token 开销、错误回合和成功率，往往首先取决于后端暴露给模型的信息密度，而不是模型榜单排名。
- Skills、CLI、MCP 的三层组合很有代表性：静态知识按需加载、执行结果结构化回传、实时状态通过轻量接口查询。它把“上下文”从 prompt 文本延伸到了 schema、状态和工具协议。
- 这类信号意味着，未来真正优秀的 agent 产品，很可能赢在 **信息结构设计** 而不是单点模型性能。

## 3. 模型竞争已经从“谁更强”演化为“谁能撑起完整产品线”

- 旗舰线有 Claude Opus 4.7 这类快速迭代的通用主力。
- 开源和区域阵营里，Kimi K2.6、Qwen 3.6、Gemma 4、GLM 5.1 这类模型开始把 coding、多模态、长上下文、长时运行和 infra claim 一起摆上台面。
- 垂直方向则出现 GPT-Rosalind、TARIO-2、GR00T N1.7 这样的生命科学和机器人能力样板。
- Diffusion LLM、DenseOn / LateOn、线性 attention、prefill-as-a-service 这些底层变化又说明，推理和检索基础设施本身也在快速换代。

## 4. AI 入口争夺战已经全面扩散到设计、搜索、会议和个人系统

- OpenAI Codex、Windsurf、Perplexity、OpenClaw 在争 coding 与 search 入口。
- Claude Design、Canva AI 2.0、Monologue Notes、ambient memory 类产品，则把竞争延展到设计、文档、会议记录和长期上下文管理。
- 合规和资本也同时进场：Anthropic KYC、区域支付限制、DeepSeek 融资治理、Anthropic/Amazon 算力绑定、北京机器人半马、SpaceX IPO 争议，都在提醒我们这不再只是技术演进，而是平台和产业结构的重写。

## 接下来一个月值得重点看什么

- zero-secret runtime 会不会从少数头部团队的架构选择，变成各类 IDE / agent 平台的通用基线。
- Context Engineering 能不能真正沉淀为后端、工具链和产品团队共享的设计语言。
- 多 Agent IDE、design agent、memory agent 会不会逐步收敛成几种稳定的入口形态，而不是继续分散成独立工具。
- 垂直专用模型会不会在生命科学、机器人、网络安全等高价值场景继续跑出可复制的商业模板。

## 本月来源

### Runtime & Harness Engineering
- [The Anatomy of an Agent Harness](https://blog.dailydoseofds.com/p/the-anatomy-of-an-agent-harness)
- [Evolution of Agent Landscape From 2022-26](https://blog.dailydoseofds.com/p/evolution-of-agent-landscape-from)
- [Build Agents That Don't Fail in Production](https://blog.dailydoseofds.com/p/build-agents-that-dont-fail-in-production)
- [The Security Architecture of GitHub Agentic Workflow](https://blog.bytebytego.com/p/the-security-architecture-of-github)
- [How We Cut Our Claude Code Token Usage 2.8x!](https://blog.dailydoseofds.com/p/how-we-cut-our-claude-code-token)
- [AINews RIP Pull Requests (2005-2026)](https://www.latent.space/p/ainews-rip-pull-requests-2005-2026)
- [AINews: Moonshot Kimi K2.6](https://www.latent.space/p/ainews-moonshot-kimi-k26-the-worlds)

### Models & Product Lines
- [AINews Gemma 4: The Best Small Multimodal Open Models](https://www.latent.space/p/ainews-gemma-4-the-best-small-multimodal)
- [AINews Anthropic Claude Opus 4.7](https://www.latent.space/p/ainews-anthropic-claude-opus-47-literally)
- [OpenAI GPT-Rosalind — 首个生命科学专用模型](https://www.therundown.ai/p/openai-superapp-hiding-inside-codex)
- [NVIDIA Isaac GR00T N1.7](https://huggingface.co/blog/nvidia/gr00t-n1-7)
- [DenseOn & LateOn](https://huggingface.co/blog/lightonai/denseon-lateon)
- [The Anatomy of Diffusion LLMs](https://blog.dailydoseofds.com/p/the-anatomy-of-diffusion-llms-a1c)
- [Noetik TARIO-2](https://www.latent.space/p/noetik)

### Workflow, OCR & RAG
- [Using OCR models with llama.cpp](https://huggingface.co/blog/ggml-org/using-ocr-models-with-llama-cpp)
- [How we OCR'ed 30,000 papers using Codex, open OCR models and Jobs](https://huggingface.co/blog/nielsr/ocr-papers-jobs)
- [Building Harvey-style tabular review from scratch, but better](https://huggingface.co/blog/isaacus/tabular-review)
- [10 Must-use Slash Commands in Claude Code](https://blog.dailydoseofds.com/p/10-must-use-slash-commands-in-claude)
- [How to Fine-Tune LLMs in 2026](https://blog.dailydoseofds.com/p/how-to-fine-tune-llms-in-2026)

### Platform Boundaries & Market Signals
- [OpenAI Codex 超级 App 化](https://www.therundown.ai/p/openai-superapp-hiding-inside-codex)
- [Claude Comes for the Design Stack](https://www.therundown.ai/p/claude-comes-for-the-design-stack)
- [Perplexity's agent pivot is on the money](https://www.therundown.ai/p/perplexity-agent-pivot-is-on-the-money)
- [Claude KYC 上线：中国开发者影响解析](https://lukefan.com/2026/04/17/anthropic-claude-selective-kyc-china-user-crackdown/)
- [微软龙虾要来了？CEO 亲自下场，为什么我却不看好？](https://lukefan.com/2026/04/16/microsoft-openclaw-ai-agent-cloud-client-tradeoffs/)
- [DeepSeek 100 亿估值：VIE 结构与退出难题](https://lukefan.com/2026/04/20/deepseek-300m-funding-10b-valuation-vie-governance-shift/)
- [北京人形机器人半马](https://lukefan.com/2026/04/21/beijing-humanoid-robot-half-marathon-china-supply-chain/)
- [Sergey Brin commits DeepMind to a Claude catch-up](https://www.therundown.ai/p/sergey-brin-commits-deepmind-to-a-claude-catch-up)
