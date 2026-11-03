---
title: "AI 雷达日报：2026-10-25"
date: 2026-10-25
category: radar
cadence: daily
radarFormat: 2
lang: zh
coverImage: /images/radar/daily-ai-radar-2026-10-25-infographic-imagegen-20261030.webp
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-10-25-e80c4032a02b16a53cdc43caf669f4939580ba093a194ea441759a5074824230.mp3
audioDuration: 953
audioSize: 7622719
audioNotice: 音频由AI生成，欢迎反馈内容问题。
draft: false
tags: []
plainSummary: "从评估到强化学习与蒸馏，推理课程提供可运行的学习路线。CUDA Graph、RAG 控制环与公司级 Harness 则分别处理计算效率、证据和权限。"
---

*图注：身份与权限按具体工具和场景决定，个人邮件限私聊。验证结果可作 RL 奖励；蒸馏使用教师答案做监督训练。*

今天把“让模型多想”“让 GPU 少等”和“让系统知道该做什么”分开看。推理课程提供可运行的学习路线；CUDA Graph 优化的是计算启动，RAG 控制环和公司级 Harness 则决定系统怎样取证、以谁的身份行动。

## 三条关键变化

- [先用同一验证器建立基线，再区分推理时计算、RL 与蒸馏，才知道提升来自哪里。](#radar-reasoning-course)
- [CUDA Graph 复用启动计划，新输入仍重新计算；收益取决于形状、地址与控制流兼容。](#radar-cuda-graph-replay)
- [延伸：公司 Agent 按工具选择身份，个人邮件只限私聊，接通工具不等于获准使用。](#radar-company-harness-reading)


## 能力与证据

### 一门推理课程，怎样把评估、RL 与蒸馏连起来

<a id="radar-reasoning-course"></a>

- 来源：Ahead of AI
- 来源渠道：Newsletter
- 证据性质：作者说明
- 原始日期：2026-10-24
- 链接：https://magazine.sebastianraschka.com/p/building-reasoning-models
- 摘要：Sebastian Raschka 介绍的这门课程有八节、合计约十一小时的讲座，从 **Qwen3 0.6B 的预训练权重**出发，实现评估和后训练方法。“From Scratch”指手写关键机制，不是重做大规模预训练。前段生成和评估可用 CPU，后段训练更适合 GPU；需要 Python、PyTorch 基础，前一门 LLM 课程不是硬前置。

课程最有用的连接点是**同一个答案验证器既做测量，也做训练奖励**：先提取数学最终答案、规范化表示、检查等价性，在 MATH-500 上建立基线，再把验证结果用于 RLVR。这样才能辨别模型进步、判分规则变化与格式投机。

| 阶段 | 实际实现 | 值得自己检查的变量 |
| --- | --- | --- |
| 基线与评估 | 流式生成、KV cache、数学验证器 | 相同模型与判分规则下的速度和正确率 |
| 推理时扩展 | 温度、top-p、多次采样与多数投票；答案评分和自我修订 | 多生成几个候选增加多少计算，是否真的提高正确率 |
| 强化学习 | 分组生成、相对奖励、简化 GRPO，再检查裁剪、KL 项、格式奖励 | 熵、优势、训练稳定性，以及奖励是否被钻空子 |
| 蒸馏 | 整理较强教师的答案，做监督训练与数据划分 | 训练损失下降能否转化为独立测试表现 |

这些方法不是“把推理长度调大就行”。多数投票需要多样且能正确抽取的答案；自我修订也可能改坏原答案。课程用评估把这些选择变成可比较的实验。它教的是可复现的小模型机制，不提供前沿商业模型的等效能力承诺。

<!-- radar-visual:reasoning-course -->
[![推理模型课程的已有模型、评估、推理和训练模块](/images/radar/daily-ai-radar-2026-10-25-reasoning-course.webp)](/images/radar/daily-ai-radar-2026-10-25-reasoning-course.webp)

*从已预训练的模型出发，依次讨论评估、推理技术和强化学习或蒸馏。图中四个模块是内容结构，不代表只发布四节课，也不表示课程重新完成了模型预训练。 图片来源：[Sebastian Raschka / Ahead of AI](https://magazine.sebastianraschka.com/p/building-reasoning-models)。点击图片查看原尺寸。*
<!-- /radar-visual:reasoning-course -->

## 构建与运行

### CUDA Graph 重放的是工作流，不是旧答案

<a id="radar-cuda-graph-replay"></a>

- 来源：Daily Dose of Data Science
- 来源渠道：Newsletter
- 证据性质：观点推演
- 原始日期：2026-10-24
- 链接：https://blog.dailydoseofds.com/p/how-cuda-graph-replay-cuts-inference
- 摘要：LLM 解码的一步会展开成注意力、矩阵乘法、归一化和采样等许多 GPU 内核。内核很短时，CPU 经框架、CUDA runtime 和驱动逐个提交的间隔，可能让 GPU 算完后等下一条指令。这里要消除的是**启动间隙**，不是模型的算术工作。

CUDA Graph 分三步：预热完成初始化、选择内核并准备稳定缓冲区；捕获一次执行的操作、参数和依赖；之后将新输入写入相同缓冲区，用一次图启动重放整段计算。**保存的是计划，不是输出**，每次仍重新计算新答案。

对服务端来说，关键约束是形状、地址和控制流兼容。不同批次可以匹配不同预捕获图，也可以填充到已捕获形状或回退普通执行。图越多，覆盖越广，但也多占显存、增加启动准备。先看 profiler 是否有明显启动空隙，再决定是否值得捕获；不能把这种优化直接外推为所有请求的固定加速倍数。

<!-- radar-visual:cuda-graph-replay -->
[![CUDA Graph的预热、捕获、重放和GPU执行时间线](/images/radar/daily-ai-radar-2026-10-25-cuda-graph-replay.webp)](/images/radar/daily-ai-radar-2026-10-25-cuda-graph-replay.webp)

*从左到右先准备形状和缓冲区，再捕获内核启动序列，最后用一次CPU图启动提交重复计算。右侧减少的是启动间隙，新输入仍要重新计算；收益依赖稳定形状、地址和重复执行路径。 图片来源：[Daily Dose of Data Science](https://blog.dailydoseofds.com/p/how-cuda-graph-replay-cuts-inference)。点击图片查看原尺寸。*
<!-- /radar-visual:cuda-graph-replay -->

### RAG 的下一步不一定是加一个无限检索循环

<a id="radar-rag-agentic-loop"></a>

- 来源：ByteByteGo / Daily Dose of Data Science
- 来源渠道：Newsletter
- 证据性质：观点推演
- 原始日期：2026-10-24
- 链接：https://blog.bytebytego.com/p/ep230-rag-vs-agentic-rag
- 摘要：固定 RAG 通常先检索再回答；Agentic RAG 把“查哪里、是否够用、要不要再查”交给运行中的控制环。工具可以是文档、数据库、API 或网页。差别在于**检索决策可以随证据改变**，不在于多加一个 Agent 名字就自动更准确。

[Daily Dose 同封通讯的 Graph RAG 附文](https://blog.dailydoseofds.com/p/how-cuda-graph-replay-cuts-inference)给了另一个维度：若问题是“周五维护是否影响结账服务”，资料分别写着“结账依赖支付 API”“支付 API 在 cluster-3”“cluster-3 周五维护”，关键是中间那条关系。Graph RAG 在索引阶段抽取实体关系，检索时沿关系走；Agentic RAG 则在查询时选择和组合工具。两者解决的瓶颈不同，可以组合，也都可能因抽取或检索错误而失败。

实施时先分清单跳事实、多跳关系还是动态多源任务，再设置可检查的停止条件和预算。找到一段相似文本不等于证据齐了；循环到上限也不等于已有答案。该文没有提供证明 Agentic RAG 普遍胜出的性能对照。

<!-- radar-visual:rag-agentic-loop -->
[![固定RAG流程与带工具选择和证据评估循环的Agentic RAG](/images/radar/daily-ai-radar-2026-10-25-rag-agentic-loop.webp)](/images/radar/daily-ai-radar-2026-10-25-rag-agentic-loop.webp)

*左侧按既定检索后回答，右侧在证据不够时改写查询或换来源再检索。图里的最多五次是这个示意流程的停止设计，并非所有Agentic RAG的统一标准；增加循环也不自动保证答案更准。 图片来源：[ByteByteGo](https://blog.bytebytego.com/p/ep230-rag-vs-agentic-rag)。点击图片查看原尺寸。*
<!-- /radar-visual:rag-agentic-loop -->

### Battle Drones v14：四人模式改的不只是地图

<a id="radar-battledrones-four-player"></a>

- 来源：Simon Willison
- 来源渠道：博客
- 证据性质：作者实测
- 原始日期：2026-10-24
- 链接：https://simonwillison.net/2026/Oct/24/battledrones/
- 摘要：此前双人地图之外，作者用 Claude Opus 5.5 增加四向对称的 Compass Rose，并修改 WebSocket 联机代码，支持最多四名玩家；空位由 AI 补齐。这个版本走非音频联网路径，不能和早先的声学多人实验混成同一机制。本刊未独立试玩，它是一次有具体改动的项目记录，不是通用编码能力评测。

## 延伸阅读

### 公司级 Harness：工具之外，还有身份与记忆边界

<a id="radar-company-harness-reading"></a>

- 主题：构建与运行
- 来源：LangChain engineering
- 来源渠道：博客
- 证据性质：官方宣称
- 原始日期：2026-10-24
- 链接：https://www.langchain.com/blog/components-building-company-harness
- 摘要：LangChain 把内部工程、营销和销售 Agent 的共同难点归纳为五件事：工作入口、身份、记忆、代码执行、后台触发。Slack 是日常入口，但大量待审邮件另做专门界面；“一切都塞进聊天”不是它的结论。

最具体的经验在身份。OpenSWE 接到用户请求时代表该用户行动，后台审查用自己的 GitHub App 身份；GTM Agent 的部分业务工具用固定服务身份，个人邮件工具却**只在私聊开放，共享频道不可用**。Content Studio 即使能连接公司的社交账号，也只有白名单用户可触发发布。能调用工具与谁有权调用，是两层不同问题。

记忆分全局和用户层，原文承认这仍是探索较少的部分。代码在沙箱执行，经 secret proxy 连接授权服务；定时与事件触发让 Agent 不必每次等人发问。它们说明长期运行还需要工作状态、身份和触发机制，而非只给模型更长上下文。

**与本期几条放在一起看：** 课程里的“模型引擎”、RAG 的“取证控制环”和公司 Harness 的“组织权限”处在不同层。模型变强不能替代取证，取证变多不能替代授权，基础设施省下启动开销也不能证明答案更对。

*本期时间窗为 10 月 24 日 12:00 至 25 日 12:00（日本时间）。LangChain 文章未确认首发时刻，作为延伸阅读。*
