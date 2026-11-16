---
title: "AI 雷达日报：2026-11-13"
date: 2026-11-13
category: radar
cadence: daily
radarFormat: 2
lang: zh
coverImage: /images/radar/daily-ai-radar-2026-11-13-infographic.webp
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-11-13.mp3
audioDuration: 1398
audioSize: 11187231
audioNotice: 音频由 AI 生成，欢迎反馈内容问题。
draft: false
tags: []
description: "从模型如何区分指令与数据，到多个 Agent 如何安全合并共享状态。"
plainSummary: "把输入结构、写入冲突和产品指标分别验清，再判断自动化是否真的可靠。"
---

本期覆盖 2026 年 11 月 12 日 12:00 至 11 月 13 日 12:00（日本时间）。产品发布、会议演示和作者观点分开看。

## 本期重点

- [Granite LLMON：指令和数据分块之后，仍要验证工具权限](#radar-granite-llmon)
- [Omnigraph：多个 Agent 可以并行提案，不必直接竞争写入主分支](#radar-omnigraph-shared-state)
- [Amplitude Wave：先从产品数据找问题，再用实验检验改动](#radar-amplitude-wave)

## 能力与证据

### Granite LLMON：把指令和数据分块，不把标签当权限

<a id="radar-granite-llmon"></a>

- 来源：IBM Granite
- 来源渠道：博客、GitHub
- 证据性质：作者研究
- 原始日期：2026-11-12
- 链接：https://huggingface.co/blog/ibm-granite/llmon-an-llm-native-markup-language-now-in-granite
- 摘要：IBM 发布两款基于 Granite 4.1 的 LLMON 实验预览模型，规格为 3B 和 8B。模型用保留的特殊 token 划分指令、数据和输出要求，并通过标识把任务指向具体的数据块。在团队报告的间接提示注入基准中，这种做法提高了抵抗力；常规能力表里，各项指标有升有降。结果来自指定模型和基准，不等同于真实工作流具备安全隔离；工具仍应在模型之外检查调用权限。

<!-- radar-visual:granite-benchmark -->
[![同规格的 Granite Instruct 与 LLMON 预览模型在七类任务上的比较表](<https://cdn-uploads.huggingface.co/production/uploads/6484ca4d5ff9a3d2ee52a83b/VMIEO4qYlmxLhK0DmMO6C.png>)](<https://cdn-uploads.huggingface.co/production/uploads/6484ca4d5ff9a3d2ee52a83b/VMIEO4qYlmxLhK0DmMO6C.png>)

*先在同一模型规格内横向比较：例如 8B 的安全类得分上升，数学类得分下降。最后一行是七类分数的平均值，不是所有指标都改善。 图片来源：[IBM Granite](https://huggingface.co/blog/ibm-granite/llmon-an-llm-native-markup-language-now-in-granite)。点击图片查看原尺寸。*
<!-- /radar-visual:granite-benchmark -->

### Jev：把文档片段排序拆成多轮选择

<a id="radar-jev-tournament-ranking"></a>

- 来源：Latent.Space
- 来源渠道：博客
- 证据性质：作者说明
- 原始日期：2026-11-12
- 链接：https://latent.space/p/jev-revolution
- 摘要：在会议演示中，UiPath 把文档片段分成小组，让 Jev 选出各组更相关的候选，再让胜出的片段进入下一轮。报道转述该次演示在大量调用下仍不到一秒，但没有提供足以外推的负载和复现细节；评估自己的检索系统时，仍须比较召回、排序质量及总耗时。

## 构建与运行

### Omnigraph：分支保留各自修改，合并时拦下旧记录覆盖

<a id="radar-omnigraph-shared-state"></a>

- 来源：Daily Dose of Data Science、Omnigraph
- 来源渠道：Newsletter、GitHub
- 证据性质：作者实测
- 原始日期：2026-11-12
- 链接：https://blog.dailydoseofds.com/p/how-top-ai-teams-scale-to-1000-agents
- 摘要：作者演示了两个 Agent 从同一版本出发，一方变更服务存储，另一方改负责人。前一分支合并后，后者虽然改的是另一字段，仍因同一记录已变更而被拒绝；从新主分支重新提交后才保住两项修改。Omnigraph 的分支和差异记录让修改可以先检查再合并，但冲突按记录而不是字段判断。这是单开发者、双 Agent 的演示，不是对标题所称千级规模的实测。

项目：[Omnigraph](https://github.com/ModernRelay/omnigraph)

<!-- radar-visual:omnigraph-merge-refused -->
[![Omnigraph 演示：负责人字段已在分支里改动，但合并同一服务记录时冲突](<https://substack-post-media.s3.amazonaws.com/public/images/96ca1296-3220-4ef1-b3e2-50626e052d17_3200x938.png>)](<https://substack-post-media.s3.amazonaws.com/public/images/96ca1296-3220-4ef1-b3e2-50626e052d17_3200x938.png>)

*上半部分只显示负责人字段的差异；下半部分却因同一条服务记录发生分歧而拒绝合并，显示未写入并提示刷新。 图片来源：[Daily Dose of Data Science](https://blog.dailydoseofds.com/p/how-top-ai-teams-scale-to-1000-agents)。点击图片查看原尺寸。*
<!-- /radar-visual:omnigraph-merge-refused -->

### 隐性耦合：没有直接调用，也可能共享故障边界

<a id="radar-hidden-coupling"></a>

- 来源：ByteByteGo
- 来源渠道：Newsletter
- 证据性质：观点推演
- 原始日期：2026-11-12
- 链接：https://blog.bytebytego.com/p/top-types-of-hidden-coupling-and
- 摘要：两个服务可以有独立的 API，却共用同一数据库容量、日志系统，或需要一起部署。只画请求如何传递的架构图容易漏掉这些关系。把这一视角用在 Agent 工作流审查时，可另外标记哪些组件共享状态、容量和发布节奏，检查其中一个出问题时，另一个能否独立运行和恢复。这是架构检查方法，不是负载测试结论。

## 产品与真实采用

### Google 搜索引入 Hydrogen：拆分子问题，再并行检索

<a id="radar-hydrogen-search"></a>

- 来源：Google
- 来源渠道：官方
- 证据性质：官方宣称
- 原始日期：2026-11-12
- 链接：https://blog.google/products-and-platforms/products/search/gemini-4-hydrogen-search-upgrade
- 摘要：Google 宣布在搜索中全球提供 Gemini 4 Hydrogen，并称它能把复杂提问拆成相关子主题，同时发起多路查询，再呈现链接、结构化回答或比较表。变化不只是生成文字，也在于模型参与决定搜什么。公告没有给出独立准确率或来源覆盖对照；多搜几路也不能保证每个子问题都拿到了可靠证据。

### Amplitude Wave：从会话回放找问题，再用 A/B 测试检验

<a id="radar-amplitude-wave"></a>

- 来源：OpenAI／Amplitude
- 来源渠道：官方
- 证据性质：官方宣称
- 原始日期：2026-11-12
- 链接：https://openai.com/business/customer-stories/amplitude
- 摘要：Amplitude 用 Wave 汇总行为数据、回放、反馈和代码，提出可交给编码 Agent 的改动方案。案例中，团队把通用首页建议改为与近期活动相关的建议，经人工审阅再实施。按企业披露，A/B 测试运行一天后，通过建议卡发送的消息比对照组增加 160%；这不是总参与度或长期留存增长，也不是所有产品改动的平均效果。

<!-- radar-visual:amplitude-card-proposal -->
[![Amplitude 首页的通用建议与基于近期活动的建议方案对照](<https://images.ctfassets.net/kftzwdyauwt9/3LjZcXouhYtaCOBh1oGfTt/9dc30c9597dbff3dd6174b34b4c907c6/amplitude-wave-personalized-suggestions.png>)](<https://images.ctfassets.net/kftzwdyauwt9/3LjZcXouhYtaCOBh1oGfTt/9dc30c9597dbff3dd6174b34b4c907c6/amplitude-wave-personalized-suggestions.png>)

*上半部的卡片不依赖用户近期操作；下半部的方案把每张卡与相关图表或仪表板连起来。这是界面改动示例，不是实验结果图。 图片来源：[OpenAI／Amplitude](https://openai.com/business/customer-stories/amplitude)。点击图片查看原尺寸。*
<!-- /radar-visual:amplitude-card-proposal -->

## 产业与治理

### 《持械入宋》：制作链缩短，不等于分发和结算可复制

<a id="radar-red-fruit-ai-drama"></a>

- 来源：老范讲故事
- 来源渠道：博客
- 证据性质：观点推演
- 原始日期：2026-11-13
- 链接：https://lukefan.com/2026/11/13/chi-xie-ru-song-red-fruit-ai-drama
- 摘要：文章整理公开采访，将番茄小说选书与改编、即梦生成镜头、红果上线串成一个案例；共享角色、场景和道具也便于异地小组协作。作者把这部热门漫剧视为平台展示的样板。即使制作流程可以借鉴，推荐、有效观看和结算仍是不同环节；文章没有独立核实投流账单或收入，因此不能从全网播放数字直接推算利润。

## 延伸阅读

### Every：并行试策略以后，还要跨轮次检查稳定性

<a id="radar-every-strategy-simulation"></a>

- 主题：构建与运行
- 来源：Every／Mike Taylor
- 来源渠道：Newsletter
- 证据性质：观点推演
- 原始日期：2026-11-12
- 链接：https://every.to/also-true-for-humans/the-next-two-levels-of-ai-adoption
- 摘要：Taylor 把编排之后的工作拆成两步：让多个团队在共同目标与评分规则下尝试不同策略，再用相同起点重复多轮，看哪种策略胜出更稳定。它把问题从“怎样把任务交出去”转向“怎样证明策略值得用”。这是作者提出的实验框架，会增加计算开销；评分或模拟环境偏了，重复运行也不能证明方案在现实中更好。
