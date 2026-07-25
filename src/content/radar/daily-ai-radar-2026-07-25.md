---
title: "AI 雷达日报：2026-07-25"
date: 2026-07-25
category: radar
cadence: daily
plainSummary: "今天的主线：AI 系统竞争点继续从单一模型扩展到路由、评测、多模态控制、语音工具、主动 agent 与推理硬件的组合能力。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agents
  - Models
  - Evaluation
  - GitHub
lang: zh
coverImage: /images/radar/daily-ai-radar-2026-07-25-infographic.webp
audioUrl: /audio/radar/daily-ai-radar-2026-07-25.mp3
audioDuration: 1419
audioSize: 11351543
draft: false
---

覆盖时间窗口：2026-07-24 至 2026-07-25（JST）。今天的重点是系统层能力继续前移：模型选择正在被路由器接管，媒体生成开始需要成本、质量和延迟策略，开放模型把上下文、视觉和长程 agent 能力推到新规模，机器人控制与视频世界模型开始合流。

## 1. AI Engineering & 架构

### Cursor Router：代码 agent 的模型选择开始进入在线路由时代

- 来源：Cursor
- 日期：2026-07-22
- 链接：https://cursor.com/blog/router
- 摘要：Cursor 发布面向 Teams 和 Enterprise 的 Cursor Router，用分类器在每次请求前判断上下文、任务复杂度、领域和模型行为，再把简单工作交给更便宜的模型，把 UI 调整、长程重构和复杂推理交给更合适的模型。Cursor 称早期企业流量在不降低质量的前提下降低 30% 至 50% 成本，线上 A/B 测试达到 60% savings，并把用户满意度和生成代码留存率作为评估信号。对工程团队来说，关键变化不是多一个模型菜单，而是把“谁来处理这个请求”变成可治理、可 rollout、可按团队配置的生产策略。

### Runway Media Router：媒体生成也需要模型路由、硬约束和 dry-run

- 来源：Runway
- 日期：2026-07-23
- 链接：https://runway.com/news/company-news/introducing-runway-media-router
- 摘要：Runway 在 Runway Dev 中推出 Media Router，用一个 endpoint 自动选择视频、图像或音频模型。开发者可以设定成本、延迟、质量偏好，以及价格上限、allow list、deny list 等硬约束；路由器会过滤不满足能力或约束的模型，并返回最终使用模型及选择原因。Runway 还提供 dry-run，便于上线前确认路由结果而不实际生成内容。媒体模型的质量维度比文本模型更难统一，因此这类路由层会成为多模态应用控制成本和稳定性的关键基础设施。

### Daily Dose：LLM 评测要从单分数扩展到路径、裁判和安全面

- 来源：Daily Dose of Data Science
- 日期：2026-07-24
- 链接：https://blog.dailydoseofds.com/p/11-llm-evaluation-methods
- 摘要：Daily Dose 总结 11 类 LLM 评测方法，从 BLEU、ROUGE、BERTScore 等文本相似度指标，到 G-Eval、LLM-as-judge、人类评测、jury-based evaluation、DAG evaluation、trajectory evaluation、多轮对话评测和安全评测。它的价值在于把“模型好不好”拆成多个生产问题：输出是否符合任务目标，推理路径是否可接受，长流程 agent 是否真的完成了任务，多轮交互是否保持一致，安全边界是否单独测量。对 agent 系统来说，单一 benchmark 已经不够，评测需要覆盖轨迹、工具调用、回滚点和人类裁决。

## 2. 模型前沿 & 算法探索

### Black Forest Labs FLUX 3：统一图像、视频、音频与 action prediction

- 来源：Black Forest Labs
- 日期：2026-07-23
- 链接：https://bfl.ai/blog/flux-3
- 摘要：Black Forest Labs 发布 FLUX 3 早期访问版本，称其在统一架构中联合学习图像、视频、音频和 action prediction。FLUX 3 Video 支持 text-to-video、image-to-video、video-to-video、视频与音频续写、keyframe-to-video、多语言对白、强排版和多风格输出，最长 20 秒并带原生音频。BFL 将该路线称为 Self-Flow 的扩展，并计划推出 FLUX 3 Image、面向机器人 action 的版本，以及 open-weight FLUX 3 Dev。需要注意，官方偏好评测仍是 preliminary claim，但方向很明确：多模态生成正在从内容合成走向世界模型与控制接口。

### FLUX-mimic：视频世界模型开始直接进入工厂机器人控制

- 来源：mimic robotics
- 日期：2026-07-23
- 链接：https://www.mimicrobotics.com/blog/introducing-flux-mimic
- 摘要：mimic robotics 与 Black Forest Labs 合作发布 FLUX-mimic 预览版，把 FLUX 3 backbone 与机器人学习系统结合成 Video-Action Model。mimic 称该模型在软体物料 kitting 任务中无需任务微调即可达到 95% 成功率，高于 adapted pi0.5 的 55% 和 flow-matching baseline 的 70%，并正在与 Audi 测试真实工厂任务。技术重点是让视频模型不只预测下一帧，还能接 action decoder，利用人类视频、穿戴式示范和遥操作数据提高机器人样本效率。

### Kimi K3：开放 3T 级模型把长上下文、MoE 与 agentic coding 推到新规模

- 来源：Kimi
- 日期：2026-07-25
- 链接：https://www.kimi.com/blog/kimi-k3
- 摘要：Kimi 发布 Kimi K3，称其为 2.8T 参数的开放 3T 级模型，具备原生视觉、1M token context、Kimi Delta Attention、Attention Residuals 和 Stable LatentMoE。模型在 MoE 中激活 16/896 experts，并使用 Quantile Balancing、Per-Head Muon、Gated MLA、MXFP4/MXFP8 量化感知训练等工程组合提升训练和推理效率。官方案例覆盖长程 coding、GPU kernel 优化、MiniTriton 编译器、芯片设计、科学计算复现和交互式研究报告。它的主要信号不是单个榜单，而是开放模型正在进入长程软件工程与知识工作系统层竞争。

## 3. 实战代码 & 工具库

### QwenCloud：Qwen3.7 Flash 升级视觉理解与多模态 agent 执行

- 来源：QwenCloud
- 日期：2026-07-25
- 链接：https://docs.qwencloud.com/changelog/models
- 摘要：QwenCloud 模型更新日志新增 `qwen3.7-flash` 和 `qwen3.7-flash-2026-07-15`，定位为原生视觉语言 Flash 系列，对 3.6-Flash 在多模态理解和 agent execution 上做全面升级。日志强调更强通用物体识别、真实世界感知、空间智能，以及面向 Search Agent 和 CI Agent 场景的端到端任务执行稳定性。对应用开发者来说，Flash 线的意义是把视觉理解、屏幕操作、代码生成和较低延迟结合起来，适合高频交互与自动化工具链。

### Qwen-Audio 3.0 TTS：语音工具开始强调方言、风格标签与低延迟版本

- 来源：QwenCloud
- 日期：2026-07-14
- 链接：https://docs.qwencloud.com/developer-guides/speech/realtime-streaming
- 摘要：QwenCloud 近期上线 `qwen-audio-3.0-tts-plus` 和 `qwen-audio-3.0-tts-flash`。更新日志强调更多少数语言和中文方言支持、更强 instruction following、细粒度 tag control、音质和表现力提升；Plus 版本面向专业质量场景，Flash 版本面向低延迟实时交互。对内容工具、客服、语音 agent 和多语言产品来说，TTS 的竞争正在从“能读出来”转向可控风格、实时性、方言覆盖和可组合 API。

## 4. 行业与商业快讯

### Cognition 收购 Poke：主动个人 agent 并入 Devin 背后的云端 agent 路线

- 来源：Cognition
- 日期：2026-07-23
- 链接：https://cognition.com/blog/interaction
- 摘要：Cognition 宣布收购 The Interaction Company of California，即 Poke 的开发团队。Poke 是生活在短信里的个人 agent，会主动发消息和 follow-up；Cognition 称过去三个月用户与 Poke 交换超过 1 亿条消息，并称其是唯一获准在 Apple Messages 原生发短信的 AI agent。Poke 用户可继续使用现有产品，后续将接入 Cognition 的模型与基础设施。这个交易把 Devin 的软件工程 agent 路线和主动个人助理路线连接起来，说明 agent 产品竞争正在向“持续在线、主动触达、跨生活与工作场景”扩展。

### Etched：推理硬件从芯片竞赛升级为 rack、软件与制造协同

- 来源：The Rundown AI / Etched
- 日期：2026-07-24
- 链接：https://www.etched.com/progress
- 摘要：Etched 更新其 frontier inference systems 进展，称 A0 silicon 已从 TSMC N4P 回片，正在与客户验证首个 rack-scale product，并计划满足超过 10 亿美元需求。公司强调 low voltage inference 和 cluster scale memory 两个方向：前者试图在高吞吐推理中降低热限制，后者用跨芯片共享内存池改善 decode 延迟。Etched 称团队超过 400 人，累计融资 8 亿美元，并已开设台湾工厂以及 San Jose 的数据中心、test house 和 NPI prototyping lab。推理竞争正在从单卡性能进入芯片、机架、冷却、互连、调度和供应链的联合设计。

## 5. GitHub 热门 repo & 趋势追踪

### Chat2DB：AI 数据库客户端把 SQL workspace、桌面应用和 MCP 支持合到本地

- 来源：GitHub Trending / OtterMind
- 日期：2026-07-25
- 链接：https://github.com/OtterMind/Chat2DB
- 摘要：Chat2DB 是一个 AI-powered database client and SQL workspace，面向开发者、DBA、分析师和数据团队。Community 版是本地运行的跨平台客户端，支持 MySQL、PostgreSQL、Oracle、SQL Server、ClickHouse、MongoDB、Redis、SQLite、Snowflake、BigQuery 等 30+ 数据源；内置 SQL 编辑、补全、格式化、执行历史、metadata 浏览、数据导入导出、dashboard 和 chart，并允许用户连接自己的 AI 模型生成、解释和优化 SQL。项目还强调开源 CLI 与 MCP support，安全说明也明确本地单用户边界和密钥加密。数据库 IDE 正在从 SQL 客户端扩展为可由 AI 与 agent 参与的数据工作台。

### Instatic：自托管 visual CMS 把 AI agent、发布器和插件沙箱放到一个 Bun server

- 来源：GitHub Trending / CoreBunch
- 日期：2026-07-25
- 链接：https://github.com/CoreBunch/Instatic
- 摘要：Instatic 是一个开源自托管 visual CMS，目标是替代 Webflow、Framer 和 WordPress 的部分工作流。它把 canvas editor、内容模型、媒体、auth、forms、plugins 和 publisher 放进一个 Bun server，发布结果是语义 HTML 与紧凑 CSS，常见页面按静态文件服务。项目内置 AI agent，可在 canvas 上生成真实可编辑节点，并支持 Claude、OpenAI、OpenRouter 或本地 Ollama；插件后端运行在 QuickJS-WASM sandbox 中，需要站点 owner 授权网络等能力。这个项目显示 AI site builder 的下一个竞争点可能不是“生成截图”，而是可编辑结构、可审计权限和可自托管输出。

## 📬 Newsletter 精选

### Every：Claude Opus 5 很强，但需要重新审视既有技能和流程

- 来源：Every
- 日期：2026-07-24
- 链接：https://every.to/vibe-check/opus-5
- 摘要：Every 的 Vibe Check 认为 Claude Opus 5 有闪光能力，但在最初一周里会和指令争执、提前停止，并且不太适配团队已有的 skills、plugins 和 compound engineering 流程。文章公开部分已经说明核心矛盾：更强模型并不必然能直接嵌入旧流程，团队可能需要删减过度复杂的指令、重新校准自动化边界，并把模型行为作为系统设计变量，而不是只替换模型名。对工程组织来说，新模型评估应包含“与既有流程兼容性”，而不只是 benchmark。

### Latent.Space / AINews：The Stack v3 把开放代码模型竞争推进到数据基础设施层

- 来源：Latent.Space / AINews
- 日期：2026-07-24
- 链接：https://www.latent.space/p/ainews-black-forest-labs-flux-3-multimodal
- 摘要：Latent.Space / AINews 将 The Stack v3 视为当天最重要的开放数据发布之一：114 TB raw data、224M repositories、44B files、770 languages，以及约 5T deduplicated and filtered tokens。相对 The Stack v2，新版本直接提供内容而不是 Software Heritage IDs，包含截至 2025 年 8 月的新 GitHub recrawl，排除限制性许可证代码，并提供 ready-to-train split 与完整 bucket。这个变化把开放代码模型竞争从“谁有模型权重”推进到“谁有可复现、可过滤、可治理的数据底座”。
