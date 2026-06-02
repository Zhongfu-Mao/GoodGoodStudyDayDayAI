---
title: "AI 雷达日报：2026-05-24"
date: 2026-05-24
category: radar
cadence: daily
plainSummary: "今天关注模型实验室转向 agent 实验室、Google I/O 后的消费级 agent 与商业协议、RL 和 harness engineering 回到 AI 工程基本功、开放 reranker 与 agent leaderboard 的评测基础设施，以及 Opik / Exgentic 等 GitHub 项目的 agent 优化和复现价值。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agent
  - Infrastructure
  - Multimodal
lang: zh
coverImage: /images/radar/daily-ai-radar-2026-05-24-infographic.webp
audioUrl: /audio/radar/daily-ai-radar-2026-05-24.mp3
audioDuration: 959
audioSize: 7676637
draft: false
---

## 本期范围

- 覆盖时间：2026-05-23 至 2026-05-24，并补充 2026-05-19 至 2026-05-22 未入选的高信号公开发布。

## 1. AI Engineering & 架构

### Latent.Space 认为模型实验室正在变成 Agent 实验室，竞争焦点从模型转向 model + harness + workflow

- 来源：Latent.Space
- 日期：2026-05-23
- 链接：https://www.latent.space/p/ainews-all-model-labs-are-now-agent
- 摘要：Latent.Space 在 AINews 中把近期信号概括为“模型实验室正在变成 Agent 实验室”。文章从 AI21 转向 agents、DeepSeek 组建 harness 团队、模型供应商越来越强调 workflow / UI / memory / economics 等线索出发，指出竞争面已经从单一模型能力扩展到模型与 harness 的组合。这里真正值得跟踪的是封闭风险：如果模型与专有 harness 共同后训练，模型供应商可能把更多价值导向自家 agent 产品，而不是开放 API 或可替换模型接口。

### ByteByteGo 把 RAG 与 agents 的边界重新拉回工程基本问题

- 来源：ByteByteGo
- 日期：2026-05-23
- 链接：https://blog.bytebytego.com/p/ep216-rags-vs-agents
- 摘要：ByteByteGo 的 EP216 用四步流程区分 RAG 和 agents：RAG 是一次检索加一次生成，适合答案已经在文档里的问题；agent 则是在运行时反复选择工具、执行动作、读取结果并继续推理，适合需要改文件、查系统或操作外部服务的任务。这个条目值得保留，因为它把“什么时候用 RAG、什么时候用 agent”从口号拉回成本、可调试性、错误传播和工具边界。对企业内部知识系统来说，很多失败不是模型不够强，而是把检索问题误包装成 agent 问题，或把行动问题误压成一次检索生成。

## 2. 模型前沿 & 算法探索

### Daily Dose of DS 用 Function Approximation in RL 解释为什么 RL 重新成为 AI 工程基本功

- 来源：Daily Dose of Data Science
- 日期：2026-05-24
- 链接：https://www.dailydoseofds.com/rl-course-part-5
- 摘要：Daily Dose of DS 发布 RL 系列第五部分，讨论 function approximation 如何替代表格型 value function，并覆盖 gradient Monte Carlo、semi-gradient TD、bootstrapping、off-policy learning 和 Mountain Car 实作。邮件把它放到当前 LLM post-training 背景下解释：RLHF、constitutional AI、GRPO 和 agent optimization 都让 RL 不再只是机器人或游戏领域的专门知识，而是理解奖励信号、策略优化、探索和 credit assignment 的工程基本功。

### Hugging Face 发布 Ettin Reranker 系列，把检索重排的速度、质量和训练 recipe 一起开源

- 来源：Hugging Face
- 日期：2026-05-19
- 链接：https://huggingface.co/blog/ettin-reranker
- 摘要：Hugging Face 发布六个 Sentence Transformers CrossEncoder rerankers，参数规模从 17M 到 1B，基于 Johns Hopkins Ettin ModernBERT encoders，支持 8K context，并公开模型、约 143M 条训练数据和训练脚本。小模型在 MTEB 与 NanoBEIR 上超过更大的旧 reranker，1B 模型则接近 teacher。对 RAG 和 agent memory 系统来说，reranker 不是边缘组件，而是决定上下文质量、延迟和成本的控制点。

## 3. 实战代码 & 工具库

### Running Guide agent 展示端侧多模态 Agent 在无障碍场景里需要低延迟安全链路

- 来源：Google / Google DeepMind
- 日期：2026-05-20
- 链接：https://blog.google/innovation-and-ai/models-and-research/google-deepmind/running-guide-agent/
- 摘要：Google 展示 Running Guide agent，用胸前佩戴的 Pixel 10 Pro 和音频反馈帮助盲人及低视力跑者更独立地跑步。系统采用双路径架构：端侧 segmentation 提供低延迟 STOP 警告和方向提示，Gemma 4 E4B 负责更复杂的多模态场景理解，并通过 Smarter Frame Selection 只分析高信息量帧。它说明无障碍 agent 的关键不是更长回答，而是低延迟、端侧可靠性、严格风险等级和硬件形态。

### Open Agent Leaderboard 评测完整 agent system，而不是只评测内部模型

- 来源：Hugging Face / IBM Research
- 日期：2026-05-18
- 链接：https://huggingface.co/blog/ibm-research/open-agent-leaderboard
- 摘要：IBM Research 在 Hugging Face 发布 Open Agent Leaderboard，用于比较完整 agent systems。Leaderboard 通过 Exgentic framework 把 SWE-Bench Verified、BrowseComp+、AppWorld、tau2-Bench Airline / Retail / Telecom 等任务统一到 task、context、actions 的协议里，并同时报告 success rate 和 average cost per task。初步结果强调，同一个模型配不同 agent wrapper 会产生不同质量和成本；agent 评测正在从模型榜单推进到 planning、memory、tool use、context management 和 failure recovery 的系统比较。

## 4. 行业与商业快讯

### Universal Cart、AP2 与 UCP 把 agentic commerce 从推荐推进到支付和商户系统

- 来源：Google
- 日期：2026-05-20
- 链接：https://blog.google/products-and-platforms/products/shopping/shopping-updates-google-marketing-live/
- 摘要：Google 介绍 Universal Cart、Agent Payments Protocol 和 Universal Commerce Protocol 的最新进展。Universal Cart 会跨 Search、Gemini 等入口工作，UCP 支持通过 Google Pay 在 Google 内完成结账，或把商品转回商户网站购买，并计划扩展到 YouTube Shopping ads、Direct Offers、酒店预订和本地外卖。agentic commerce 的难点不只是“帮我找商品”，而是支付、责任归属、商户记录、促销、品牌可见性和跨平台结账协议。

### 老范讲故事认为 Google I/O 的问题不是技术少，而是入口太散

- 来源：老范讲故事
- 日期：2026-05-24
- 链接：https://lukefan.com/2026/05/24/google-io-gemini-antigravity-agent-reliability/
- 摘要：老范复盘 Google I/O 2026 后给出的判断是：Google 并非输在技术，而是输在主线分散。文章把 Gemini 3.5 Flash 的可靠性、Gemini Spark 的云端工作流潜力、Antigravity 2.0 的入口困境、Workspace 与 AI Studio 等多产品争夺入口放在一起看。这个中文产业视角补充了官方发布稿没有说清的部分：agent 时代的竞争不只是“功能够多”，而是能否形成一个用户信任、可持续使用、不会让组织入口互相打架的默认工作面。

## 5. GitHub 热门 repo & 趋势追踪

### Opik：agent optimization workflow 把 prompt 搜索、eval dataset 和自动迭代接到一起

- 来源：GitHub / Daily Dose of Data Science
- 日期：2026-05-24
- 链接：https://github.com/comet-ml/opik
- 摘要：Daily Dose of DS 推荐 Comet Opik 的 agent optimization workflow；公开仓库显示 Opik 是用于 LLM app observability、evaluation 和 prompt / agent optimization 的开源工具。它的价值在于把初始 prompt、eval dataset、自动迭代和结果比较放进同一条闭环，让 agent prompt 不再只靠人工直觉微调。随着 agent 任务变长，优化对象会从单条 prompt 扩展到 harness、工具选择、上下文裁剪和失败恢复策略。

### Exgentic：开放 agent evaluation framework 让 agent wrapper、模型和成本可以一起复现比较

- 来源：GitHub / Hugging Face
- 日期：2026-05-18
- 链接：https://github.com/Exgentic/exgentic
- 摘要：Open Agent Leaderboard 背后的 Exgentic framework 已公开，用来在 tau2、AppWorld、BrowseComp+、SWE-Bench 等任务上复现 agent evaluation。它把不同 benchmark 统一成 task、context、actions 的协议，并允许比较 agent wrapper、模型选择、成功率和成本。第五象限把它作为趋势项目，是因为 agent 评测正在从“看一次榜单”变成可运行、可提交、可复现的工程基础设施。

## 📬 Newsletter 精选

### Daily Dose of DS：From prompt to context to harness engineering

- 来源：Daily Dose of Data Science
- 日期：2026-05-24
- 链接：https://www.dailydoseofds.com/p/the-anatomy-of-an-agent-harness/
- 摘要：这封邮件把 prompt engineering、context engineering 和 harness engineering 做了清晰拆分：prompt 是单次输入，context 是多步任务中留下什么，harness 才是能行动、验证和失败恢复的机器。它把 Gather、Act、Verify 作为 agent loop 的基本结构，解释为什么 agent 不是一次 API 调用，而是可重复运行的系统。

### Every：Cheap Competence, New Frontier

- 来源：Every
- 日期：2026-05-24
- 链接：https://every.to/context-window/cheap-competence-new-frontier
- 摘要：Every 这一期把“cheap competence”作为本周线索，讨论自动化越多，人类越需要给模型提供新的 frame。它还回顾 After Automation、Google I/O、Stainless、100-agent software factory 和 AI 对入门岗位的影响，补充了 agent 进入组织之后，人类判断、组织接口和职业路径如何变化的视角。
