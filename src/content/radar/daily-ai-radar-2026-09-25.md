---
title: "AI 雷达日报：2026-09-25"
date: 2026-09-25
category: radar
cadence: daily
audioUrl: /audio/radar/daily-ai-radar-2026-09-25.mp3
audioDuration: 1333
audioSize: 10660864
draft: false
plainSummary: "AI 科学研究、实时世界模型与语音生成出现新进展；Agent 评估与编码工作流继续细化；开放教育、AI 购物入口和项目记忆成为应用焦点。"
difficulty: intermediate
tags: [AI Engineering, Agents]
lang: zh
coverImage: /images/radar/daily-ai-radar-2026-09-25-infographic.webp
representativeImageSource: https://www.anthropic.com/news/claude-discovers-novel-enzyme-system
---

> 本期覆盖 2026-09-24 至 2026-09-25（JST）；条目保留原始发布日期。GitHub 条目日期为趋势观察日，不代表项目首次发布。

---
![A scientist pipetting](https://www-cdn.anthropic.com/images/4zrzovbb/website/394de337d8a5d8db93a1c048fa1cb53e16a09625-2048x1240.jpg)

*代表图来自 [Anthropic 的生命科学实验室发布页](https://www.anthropic.com/news/claude-discovers-novel-enzyme-system)，呼应本期 AI 辅助科学研究的主题。*

## 1. AI Engineering & 架构

### 数据从创建到删除：缓存、索引和备份各有生命周期

- 来源：ByteByteGo
- 日期：2026-09-24（美国时间；2026-09-25 JST）
- 链接：https://blog.bytebytego.com/p/the-life-of-data-from-creation-to
- 摘要：ByteByteGo 梳理一条数据在数据库、缓存、搜索索引、分析流水线和备份中的不同副本。它们的更新频率与保留时间各不相同，因此删除原始记录不等于所有副本已经消失。设计数据系统时，应把同步、恢复、存储成本与隐私删除要求放在同一生命周期中考虑。

### AI 科学研究的两条路径：加快实验与改善实验决策

- 来源：Latent.Space / Endura Therapeutics
- 日期：2026-09-24（美国时间；2026-09-25 JST）
- 链接：https://www.latent.space/p/foundries-vs-navigators-lowering
- 摘要：Endura Therapeutics 的 Adrian Sanborn 在客座文章中区分“Foundries”和“Navigators”：前者投资高通量测量、自动化与数据生产，后者让 AI 进入研究决策和日常工作流程。核心约束是实体实验仍需时间和资源，推理变快并不会自动增加实验吞吐量。这是作者提出的产业分析框架，不代表所有实验室都适合采用同一路径。

## 2. 模型前沿 & 算法探索

### Runway 的 WorldPrompt 为实时世界模型加入时间轴控制

- 来源：Latent.Space / Runway
- 日期：2026-09-25
- 链接：https://www.latent.space/p/runway
- 摘要：Latent.Space 采访 Runway 团队，介绍 GWM Worlds 2 研究预览中的 WorldPrompt：用户可指定生成环境、首帧以及带时间戳的动作，并在运行时继续输入动作。它为实时视频与音频模拟提供更明确的控制层；目前仍是研究预览，连续交互时长、延迟和一致性需要在具体场景验证。

### Gemini 3.8 Flash TTS 扩展语音设计与逐行表演控制

- 来源：Google
- 日期：2026-09-23（美国时间；2026-09-24 JST）
- 链接：https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-text-to-speech/
- 摘要：Google 发布 Gemini 3.8 Flash TTS 与面向高吞吐场景的 Flash-Lite TTS，支持用自然语言设计声音，并按台词控制节奏、语气和角色表演。Google 称这些能力覆盖 100 多种语言和方言，接入 AI Studio、API 等产品；音色一致性、成本与语言质量仍需按实际应用测试。

## 3. 实战代码 & 工具库

### Jev 与 Opik 组合：把 Agent 评估拆成判定和实验记录

- 来源：Daily Dose of Data Science
- 日期：2026-09-24（美国时间；2026-09-25 JST）
- 链接：https://blog.dailydoseofds.com/p/build-a-jev-judge
- 摘要：文章用客服退款 Agent 的示例，让 Jev 针对给定状态回答有界问题，再通过自定义评估器把结果写入 Opik，分别承担语义判定与实验记录。示例中的阈值需要用人工标注的真实案例校准；Jev 返回的置信度也不是判断正确率的独立证明。这是自定义集成，并非 Opik 已原生支持 Jev。

### Superpowers 用组合式技能组织编码 Agent 的设计与测试流程

- 来源：GitHub Trending / obra
- 日期：2026-09-25（趋势观察）
- 链接：https://github.com/obra/superpowers
- 摘要：Superpowers 用一组可组合的技能为编码 Agent 规定工作顺序：先澄清需求和设计，再经人工认可形成实施计划，随后按测试驱动的节奏执行与审查。仓库列出多个 Agent 环境的安装路径。它是一套工作方法而非质量保证；自动触发的技能、权限和额外 Agent 开销仍须在具体项目中评估。

## 4. 行业与商业快讯

### AI 购物入口遇到平台边界：Muse 的交易链路仍待验证

- 来源：老范讲故事
- 日期：2026-09-24
- 链接：https://lukefan.com/2026/09/24/meta-muse-ai-agent-ecommerce-barriers/
- 摘要：老范从 Meta Muse 的购物场景讨论 Agent 交易的两类阻力：外部商家未必允许第三方代理访问，平台自身的广告业务也可能与代理替用户筛选商品的目标冲突。这是对商业激励的评论，而非对 Muse 最终成败的已验证结论；实际交易覆盖范围和商家合作仍需观察。

### OpenAI Academy 两周年：扩大社区培训者试点

- 来源：OpenAI
- 日期：2026-09-23（美国时间；2026-09-24 JST）
- 链接：https://openai.com/index/two-years-of-openai-academy
- 摘要：OpenAI 称 Academy 开办两年来举办超过 250 场活动，相关内容触达超过 400 万人，并推出面向社区组织的培训者试点，让伙伴机构人员学习课程与工作坊引导方法。活动数和触达量是机构自报指标，不能直接等同于学习成效；试点能否在更多社区持续运作仍待检验。

## 5. GitHub 热门 repo & 趋势追踪

### Hindsight 登上趋势榜：Agent 记忆加入保留、召回与反思

- 来源：GitHub Trending / vectorize-io
- 日期：2026-09-25（趋势观察）
- 链接：https://github.com/vectorize-io/hindsight
- 摘要：Hindsight 把 Agent 记忆组织为 retain、recall、reflect 等操作，目标是从交互中形成可再用的知识，而非只保存聊天历史。仓库提供服务端、客户端与集成入口，适合研究长期任务记忆；其基准领先和生产效果主要是项目方陈述，需要在自己的任务和遗忘边界上检验。

### CLI-Anything 登上趋势榜：把现有软件暴露给 Agent 命令行

- 来源：GitHub Trending / HKUDS
- 日期：2026-09-25（趋势观察）
- 链接：https://github.com/HKUDS/CLI-Anything
- 摘要：CLI-Anything 希望为现有软件建立可由 Agent 调用的命令行接口，仓库展示 CLI-Hub、安装方式和多个实际软件的演示。项目的价值在于把操作边界变成可组合、可测试的命令；不同应用的权限、数据安全和功能覆盖仍需分别检查，不能把“可调用”视为自动可靠。

## 📬 Newsletter 精选

### The Rundown：Claude 在病毒 DNA 中识别出未知酶系统

- 来源：The Rundown AI
- 日期：2026-09-24
- 链接：https://www.therundown.ai/articles/anthropic-ai-biology-lab-makes-its-first-find
- 摘要：The Rundown 介绍 Anthropic 新建生命科学实验室的首项结果：Claude Agent 在噬菌体 DNA 中发现与重复序列相关的酶系统，其结构特征让研究者联想到 CRISPR。Anthropic 的原始报告也明确表示，该系统的功能尚不清楚；发现候选机制不等于已经得到可用的基因编辑工具。

### Every：评估集正成为选模型和防止 Agent 回归的日常工具

- 来源：Every / Context Window
- 日期：2026-09-24（美国时间；2026-09-25 JST）
- 链接：https://every.to/context-window/why-evals-are-so-hot-right-now
- 摘要：Every 以 Sentry 的代码变更评估运行量和员工的个人基准为例，说明团队开始用任务级测试检查 Agent 更新是否退步，并比较不同模型的质量、速度与价格。文中的数量和体验属于特定团队案例，不能推断为全行业采用率；评估集仍需要清晰的成功标准和代表性样本。
