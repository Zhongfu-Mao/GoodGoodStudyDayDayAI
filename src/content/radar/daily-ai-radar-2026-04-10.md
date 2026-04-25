---
title: "AI 雷达日报：2026-04-10"
date: 2026-04-10
category: radar
cadence: daily
tags:
  - Agent
  - Harness Engineering
  - Context Engineering
  - OpenClaw
lang: zh
coverImage: /images/radar/daily-ai-radar-2026-04-10-infographic.png
draft: false
---
## 本期范围

- 数据窗口：2026-04-07 至 2026-04-10（过去 72 小时）


---
![Extreme Harness Engineering 主题视觉图](https://substackcdn.com/image/fetch/$s_!5TXE!,w_1200,h_600,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-video.s3.amazonaws.com%2Fvideo_upload%2Fpost%2F193478192%2Fbac92fb4-46a2-4c8a-b189-083c263423fd%2Ftranscoded-1775581604.png)

*代表图来自 [Extreme Harness Engineering](https://www.latent.space/p/harness-eng)。这张图适合放在这期前面，因为 4 月 10 日的主线就是运行环境、工作区和审批流正在成为新能力层。*

## 1. 🛠️ AI Engineering & 架构

### Extreme Harness Engineering：1M LOC、0% 人类代码、0% 人工审查
**来源：** Latent Space  
**链接：** [https://www.latent.space/p/harness-eng](https://www.latent.space/p/harness-eng)

OpenAI Frontier 团队成员 Ryan Lopopolo 在其影响力极大的工程文章中披露：一个小型工程师团队用 5 个月内构建了一个超过 100 万行代码的 beta 产品，全程 **0 行人工编写代码、0 次人工合并前审查**。工程师只负责通过 PR 和 CI 工作流引导 Codex Agent 迭代，涵盖应用逻辑、文档、CI 配置、可观测性和工具链。这一案例被称为"Harness Engineering"，是迄今最极端的 AI 原生软件工程实践案例之一，已引发广泛讨论。

📌 **关键词：** Codex Agents、OpenAI Symphony、Agent-driven engineering、Ghost Library

### Latent Space AINews：Anthropic 商业加速 & Claude Mythos 登场
**来源：** Latent Space  
**链接：** [https://www.latent.space/s/ainews](https://www.latent.space/s/ainews)

4月6-7日的 AINews 报道聚焦两大叙事：① Anthropic 商业轨迹超预期——有报道称一年内 ARR 15x 增长，预计年底或超 $90B ARR；② Anthropic 正式发布 **Claude Mythos Preview** 并启动 **Project Glasswing**（详见下文行业快讯）。AINews 每日聚合 544 个 Twitter 账号与 12 个子版块，是 AI 工程师追踪前沿动态的重要一站式信源。

### ByteByteGo EP201：AI 在软件开发中的三次演化浪潮
**来源：** ByteByteGo  
**链接：** [https://blog.bytebytego.com/p/ep201-the-evolution-of-ai-in-software](https://blog.bytebytego.com/p/ep201-the-evolution-of-ai-in-software)

文章梳理了工程师使用 AI 的三个阶段：通用 LLM → 编程专项 LLM（Copilot/Cursor 等自动补全）→ Agentic 编程工具（Agent 负责端到端任务）。这一框架对于理解当前 AI coding 工具的市场定位与产品演进路径极有参考价值，也与 Harness Engineering 的实践高度呼应。

## 2. 🧠 模型前沿 & 算法探索

### Gemma 4：Google 发布真正多模态 + On-Device 开源模型
**来源：** Hugging Face Blog  
**链接：** [https://huggingface.co/blog/gemma4](https://huggingface.co/blog/gemma4)

2026-04-02 发布，Apache 2.0 授权。Gemma 4 系列覆盖 E4B（MoE，4B 激活参数）和 31B Dense 两款旗舰模型，支持**图像、文本、音频**输入。核心架构亮点：交替使用**局部滑动窗口注意力**与**全局全上下文注意力**层，兼顾效率与长程依赖。在 LMArena 评分上，31B Dense 达 1452，26B MoE 以仅 4B 激活参数达到 1441，性价比突出。已适配 transformers、llama.cpp、MLX、WebGPU、Rust 等主流推理栈，是当前最适合端侧部署的多模态开源模型之一。

📌 **OCR、语音转文字、目标检测、函数调用均原生支持。**

### Ahead of AI：Jan-Feb 2026 十款开源 LLM 架构盘点
**来源：** Ahead of AI (Sebastian Raschka)  
**链接：** [https://magazine.sebastianraschka.com/p/a-dream-of-spring-for-open-weight](https://magazine.sebastianraschka.com/p/a-dream-of-spring-for-open-weight)

Raschka 于 2026-02-25 发布，综合分析 Jan-Feb 2026 十款重要开源 LLM 发布的架构趋势：主流方向仍是自回归 Transformer，但注意力机制正从经典 GQA（Grouped Query Attention）向 **MLA（Multi-Head Latent Attention）** 与 **线性注意力混合架构** 迁移，核心驱动力是长上下文效率和推理成本优化。亮点模型包括：Qwen3-Coder-Next（80B MoE/3B 激活）在编码任务上超过 DeepSeek V3.2、Kimi K2.5；Arcee Trinity（400B MoE + GQA + SWA）；以及 MiniMax M2.5（230B）。Raschka 同步发布了配套的 **LLM Architecture Gallery**，可视化浏览各模型架构图。

### Meta Superintelligence Labs 发布首款专有模型 Muse Spark
**来源：** The Rundown AI  
**链接：** [https://www.therundown.ai/p/meta-superintelligence-labs-ships-its-first-model](https://www.therundown.ai/p/meta-superintelligence-labs-ships-its-first-model)

2026-04-08，由 Alexandr Wang 领导的 Meta 超级智能实验室发布了其首款模型 **Muse Spark**，支持语音、文字、图像多模态输入，配备"contemplating mode"——多个 Agent 对难题展开对抗推理。基准测试与 Opus 4.6、GPT 5.4 在推理维度相当，但编程和 ARC-AGI 2 上仍有差距。该模型为**闭源**，Meta 表示未来可能开源但未承诺时间表。团队自 $143 亿收购 Scale AI 后从零重建 AI 技术栈。

### AlphaGenome：Google 开始把“暗物质 DNA”变成可计算对象
**来源：** The Batch @ DeepLearning.AI  
**链接：** <https://www.deeplearning.ai/the-batch/googles-alphagenome-interprets-dna-that-regulates-genetic-expression/>

The Batch 这一期里最值得补进正文的，不是又一条模型快讯，而是 AlphaGenome 对非编码 DNA 的建模突破。它瞄准的是基因组里那 98% 不直接编码蛋白、却深刻影响基因表达的“暗区”，说明大模型式表征学习已经更深地进入生命科学核心问题，而不只是做科研辅助。

### Walrus：世界模型的思路，正在反过来改写科学计算
**来源：** The Batch @ DeepLearning.AI  
**链接：** <https://www.deeplearning.ai/the-batch/a-dynamic-fluids-model-appears-to-solve-transformers-pixellation-problem/>

Walrus 这条新闻很容易被忽略，但它很能代表 2026 年的一个重要方向：世界模型的方法论正在从视频和交互式代理，渗透到液体、气体和等离子体等科学模拟场景。对 AI 行业来说，这意味着“会理解世界”的模型价值开始向更高壁垒、更高商业价值的科学计算任务外溢。

## 3. 💻 实战代码 & 工具库

### OpenClaw：2026 年 GitHub 增长最快开源 AI 项目
**来源：** ByteByteGo  
**链接：** [https://blog.bytebytego.com/p/top-ai-github-repositories-in-2026](https://blog.bytebytego.com/p/top-ai-github-repositories-in-2026)

**GitHub:** [https://github.com/openclaw/openclaw](https://github.com/openclaw/openclaw)

OpenClaw 是一个运行在本地的个人 AI 助手，定位为本地 AI 网关，连接 AI 模型与 50+ 集成平台（WhatsApp、Telegram、Slack、Discord、Signal、iMessage 等），**数据不离机**。功能覆盖网页浏览、表单填写、Shell 命令执行、代码生成执行、智能家居控制。从 9,000 颗星火速突破 210,000 颗星，2月创始人已加入 OpenAI，项目转交开源基金会运营。⚠️ 安全研究人员指出其权限范围较宽，技能仓库缺乏严格审查，使用需注意权限风险。

### Daily Dose of Data Science：LLMOps 系列 — 多轮评估与上下文工程
**来源：** Daily Dose of Data Science (Avi Chawla)  
**链接：** [https://blog.dailydoseofds.com/p/multi-turn-evals-for-llm-apps](https://blog.dailydoseofds.com/p/multi-turn-evals-for-llm-apps)

该系列近期覆盖两个高密度工程主题：① **Multi-turn Evals**——对话系统跨轮一致性、工具使用评估、追踪与红队测试的系统化方法；② **Context Engineering**——设计 LLM 应用信息环境的实践，核心是在严格的容量约束下最大化有效信号密度。另配套 KV Caching、PagedAttention、FlashAttention、Speculative Decoding 等推理优化专题。是 LLM 应用工程师提升 prod 系统质量的高密度参考资源。

### Anthropic 推出 Claude Managed Agents 公测
**来源：** The Rundown AI  
**链接：** [https://www.therundown.ai/](https://www.therundown.ai/)

Anthropic 开放 Claude Managed Agents 公测，让开发者可在数天内将 Agent 想法快速上线为产品。Notion、Rakuten、Asana、Sentry 已为早期采用者。该平台定位于降低 Agent 工程化门槛，与 OpenAI 的 Codex 平台形成直接竞争。

## 4. 📰 行业与商业快讯

### Anthropic 发布 Claude Mythos Preview + Project Glasswing 网络安全专项
**来源：** The Rundown AI / Latent Space  
**链接：** [https://www.anthropic.com/glasswing](https://www.anthropic.com/glasswing)

2026-04-07，Anthropic 发布 **Claude Mythos Preview**——一款在网络安全任务上能力极为突出的新一代模型。Anthropic 内部测试中，该模型在数周内发现了每大操作系统、每大主流浏览器及多款关键软件中**数千个此前未知的零日漏洞**，能力之强以至于 Anthropic 认为需给软件行业争取准备时间，**暂不对外公开发布**。随之启动的 **Project Glasswing** 授权 AWS、Apple、Cisco、CrowdStrike、Google、JPMorganChase、Microsoft、Nvidia 等 50+ 机构以防御性安全用途使用该模型，并注入超 $1 亿使用积分。

### ByteByteGo：2026 年 AI 五大趋势展望
**来源：** ByteByteGo  
**链接：** [https://blog.bytebytego.com/p/whats-next-in-ai-five-trends-to-watch](https://blog.bytebytego.com/p/whats-next-in-ai-five-trends-to-watch)

文章梳理 2026 年 AI 落地五大核心趋势：① **持久化 Agent**（长时工作流，更多本地运行）；② **可靠性与安全**（抗提示注入、错误恢复）；③ **物理 AI**（CES 2026 Boston Dynamics Atlas + Google DeepMind）；④ **LLM 推理时扩展**；⑤ **小型开源模型实用化**。框架清晰，适合战略层参考。
