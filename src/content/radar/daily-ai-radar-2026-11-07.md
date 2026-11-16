---
title: "AI 雷达日报：2026-11-07"
date: 2026-11-07
category: radar
cadence: daily
radarFormat: 2
lang: zh
coverImage: /images/radar/daily-ai-radar-2026-11-07-infographic.webp
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-11-07.mp3
audioDuration: 1374
audioSize: 10994396
audioNotice: 音频由 AI 生成，欢迎反馈内容问题。
draft: false
tags: []
---

本期窗口为 2026 年 11 月 6 日 12:00 至 11 月 7 日 12:00（日本时间）。延伸阅读保留原始发表日期。

## 本期重点

- [ToyBlocks：用可控的积木世界分开测试机器人规划与动作执行](#radar-toyblocks)
- [MoE 路由：别只看每个 token 选了几个专家，还要看通信与负载](#radar-moe-routing)
- [OpenAI 与 Hacktron：把第三方服务交互纳入联合安全测试](#radar-hacktron)

## 能力与证据

### ToyBlocks：把机器人泛化失败拆到规划与执行

<a id="radar-toyblocks"></a>

- 来源：Ai2
- 来源渠道：博客
- 证据性质：作者研究
- 原始日期：2026-11-06
- 链接：https://huggingface.co/blog/allenai/toyblocks
- 摘要：Ai2 把机器人实验限制在桌面机械臂与积木，换来可以控制训练数据和测试条件的环境。强化学习与运动规划生成推、翻等短程技能，任务与运动规划器再把技能串成可执行的计划，在仿真中记录演示及标签。研究者可把某些位置或堆叠高度留到测试，分别观察训练范围内插值和范围外外推；也可替换高层规划或低层动作模块，定位长任务为何失败。评估除了成功率，还可记录速度、施力和任务进度。作者展示了有限场景的实体机器人迁移，不能据此推断开放环境中的通用泛化。

<!-- radar-visual:toyblocks-planning-evaluation -->
[![ToyBlocks 中场景与任务接入技能生成、规划执行、训练和评估的流程图](<https://www.datocms-assets.com/64837/1793917318-toyblocks-framework-current.png>)](<https://www.datocms-assets.com/64837/1793917318-toyblocks-framework-current.png>)

*看中间的 Planning 和 Plan execution：前者组合技能，后者执行计划并记录数据与标签。下方另列 Training 和 Evaluation，说明生成演示与评估模型是不同环节。 图片来源：[Ai2](https://huggingface.co/blog/allenai/toyblocks)。点击图片查看原尺寸。*
<!-- /radar-visual:toyblocks-planning-evaluation -->

### 虚拟细胞：指标会改变模型与均值基线的比较

<a id="radar-virtual-cell-metrics"></a>

- 来源：Latent.Space
- 来源渠道：博客
- 证据性质：观点推演
- 原始日期：2026-11-06
- 链接：https://latent.space/p/controlling-biology-fabian-theis-helmholtz-munich/
- 摘要：Fabian Theis 的访谈伴读把注意力从模型大小转向扰动预测的评测。如果绝大多数基因变化很小，某些聚合指标会奖励接近均值的保守预测；因此，比较模型时要说明指标如何衡量真正发生变化的信号。伴读进一步提出对齐跨尺度的数据，观察细胞在扰动后如何变化，并将模型建议与实验反馈连接起来。这是节目讨论的研究方向，并非已经验证的跨尺度细胞模拟能力。

## 构建与运行

### MoE 路由：固定每个 token 的专家数，不等于固定每个专家的负载

<a id="radar-moe-routing"></a>

- 来源：Daily Dose of Data Science
- 来源渠道：Newsletter
- 证据性质：观点推演
- 原始日期：2026-11-07
- 链接：https://blog.dailydoseofds.com/p/7-moe-routing-strategies-in-production
- 摘要：传统 top-k 让每个 token 选择固定数量的专家，但多个 token 仍可能挤向同一批专家。Expert Choice 反过来让专家在容量内选择 token，负载更可控，却不能保证每个 token 获得相同的计算量。按设备拓扑限制候选专家组可以减少跨节点目的地，但不保证端到端更快。部署时应分别测路由、跨设备分发、专家批次计算和结果合并；文中的七种设计包括来自训练或视觉研究的方案，不是自回归推理引擎里可直接互换的七个选项。

<!-- radar-visual:moe-expert-dispatch -->
[![MoE 从路由到 token 分发和专家批次计算的流程，标出通信与小批次开销](<https://substack-post-media.s3.amazonaws.com/public/images/0fd54815-f5f7-4a71-9a99-83f0b58ff6f7_2752x1536.jpeg>)](<https://substack-post-media.s3.amazonaws.com/public/images/0fd54815-f5f7-4a71-9a99-83f0b58ff6f7_2752x1536.jpeg>)

*沿箭头看：选择专家后还要搬运 token，并由各专家处理自己的批次。分发的通信和小批次计算都可能成为瓶颈；图是诊断示意，并未比较七种方案的实测延迟。 图片来源：[Daily Dose of Data Science](https://blog.dailydoseofds.com/p/7-moe-routing-strategies-in-production)。点击图片查看原尺寸。*
<!-- /radar-visual:moe-expert-dispatch -->

## 产业与治理

### OpenAI 与 Hacktron：联合测试第三方服务交互

<a id="radar-hacktron"></a>

- 来源：OpenAI
- 来源渠道：官方
- 证据性质：官方宣称
- 原始日期：2026-11-06
- 链接：https://openai.com/index/partnering-with-hacktron/
- 摘要：OpenAI 宣布与安全团队 Hacktron 合作，由双方共同选出高优先级测试面，重点检查 OpenAI 系统与第三方服务如何交互，并通过 Daybreak Red 扩大 Hacktron 对前沿模型的访问。此次新增的是特定研究团队和测试重点，不是面向所有客户开放。公告也没有公布本次合作发现或修复了多少漏洞。对安全团队而言，值得区分的是应用、云基础设施与身份系统的交互风险，而不只是模型对单个输入的反应。

## 延伸阅读

### METR：能力指标的增长斜率为此前的 1.9 倍，不是研发提速的因果估计

<a id="radar-metr-aeci"></a>

- 主题：能力与证据
- 来源：METR
- 来源渠道：博客
- 证据性质：作者研究
- 原始日期：2026-11-05
- 链接：https://metr.org/blog/2026-11-05-anthropic-ai-rd-acceleration-assessment/
- 摘要：METR 对 Anthropic 研发加速的评估发现，纳入内部模型和基准时，AECI 能力指标自 2025 年 10 月以来的增长斜率，估计为此前的 1.9 倍，95% 置信区间为 1.5–2.8 倍。结果对基准与趋势拟合假设敏感，部分证据未公开；它不是工程师生产率、AI 因果贡献或自主研发能力的直接测量。读这份报告的价值，是把能力曲线、对研发流程的观察和对加速来源的归因分开。

<!-- radar-visual:metr-aeci-trend -->
[![METR 的 AECI 能力指标趋势图，显示模型估计点、误差范围与趋势线](<https://metr.org/assets/images/ai-rd-acceleration-assessment/aeci-main.png>)](<https://metr.org/assets/images/ai-rd-acceleration-assessment/aeci-main.png>)

*纵轴是 AECI，点是模型的估计位置。1.9 倍比较的是前后趋势线的斜率，不是任一模型的分数倍数，也不能从图上读出 AI 的因果贡献。 图片来源：[METR](https://metr.org/blog/2026-11-05-anthropic-ai-rd-acceleration-assessment/)。点击图片查看原尺寸。*
<!-- /radar-visual:metr-aeci-trend -->

### Every：决定保留、改造、暂缓还是退役一个 AI 工作流

<a id="radar-every-workflow-review"></a>

- 主题：产品与真实采用
- 来源：Every
- 来源渠道：Newsletter
- 证据性质：观点推演
- 原始日期：2026-07-20
- 链接：https://every.to/working-overtime/why-some-ai-workflows-stick-and-others-don-t
- 摘要：Every 在 11 月 6 日重刊 Katie Parrott 的个人复盘。她曾根据一次演示搭建汇总工作消息的工具，却很少再打开；反而把贴合已有习惯的写作和日程辅助保留了下来。她用任务是否真实反复发生、审阅与维护是否值得、是否有明确触发点等问题，把工作流分成保留、改造、等待时机和退役。这是个人筛选方法，不是能预测所有团队采用率的对照研究。
