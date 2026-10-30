---
title: "AI 雷达日报：2026-10-26"
date: 2026-10-26
category: radar
cadence: daily
radarFormat: 2
lang: zh
coverImage: /images/radar/daily-ai-radar-2026-10-26-infographic-imagegen-20261030.webp
audioUrl: /__radar-preview/audio/daily-ai-radar-2026-10-26.mp3
audioDuration: 617
audioSize: 4934406
audioNotice: 待核试听候选，内容验收尚未完成。
draft: true
tags: []
plainSummary: "Terra 将视觉与电脑任务放到较低标准单价；Kimi 发布后争议提醒把跑分、任务成本和额度分开比较。Seam Cutter 改变截图的连续性，SAP 延伸讨论理解与行动权限。"
---

本期覆盖 10 月 25 日 12:00 至 26 日 12:00（日本时间）。Terra 的官方更新与 Kimi 发布后的评论，从不同角度提出同一个问题：怎样把模型分数、资源消耗与实际交付联系起来。Seam Cutter 则把这种边界带到日常截图处理。

## 本期重点

- [Terra 降低标准 API 单价；专业电脑任务的能力、费用与推理档仍须一起比较。](#radar-terra-visual-computer)
- [Kimi 发布后的讨论，把跑分、实际任务费与订阅额度分开问。](#radar-kimi-evaluation-cost)
- [Seam Cutter 可移除长图中段再拼接；分享时要说明删减，避免把拼接内容当作连续记录。](#radar-seam-cutter-tool)


## 能力与证据

### GPT-6.1 Terra：把视觉与电脑任务放到更低的标准单价上

<a id="radar-terra-visual-computer"></a>

- 来源：OpenAI
- 来源渠道：官方
- 证据性质：官方宣称
- 原始日期：2026-10-26
- 时间说明：官方 RSS 的发布时间为 26 日 09:00（日本时间）。
- 链接：https://openai.com/index/introducing-gpt-6-1-terra
- 摘要：GPT-6.1 Terra 将视觉理解、电脑操作和写作放在同一个较低成本档位。标准 API 每百万输入 Token 1 美元、缓存输入 0.05 美元、输出 5 美元；官方称标准单价比 GPT-5.6 Terra 与 GPT-6.1 Sol 低 50%。单价下降不等于所有任务总成本都减半，还要计算实际用量、工具等待、重试与复核。

官方用 Agents’ Last Exam 的专业电脑任务说明能力与费用的组合：medium 档较 GPT-5.6 Terra 高 15 个百分点，任务成本约为三分之一。它包括从建筑图生成三维模型、逐镜头检查影片并制作时间码记录等任务，不是单独的视觉问答成绩。OSWorld 2.1 也按完成多步骤桌面任务评估；模型仍须在正确工具与权限内行动。

另两组结果应分开读：内部易诱发事实错误的提示集，在 low 档的错误率从 53.6%降到 16.7%；Terminal-Bench 4.0 在 max 档完成 50.3%的命令行软件任务，前代公布成绩为 21.5%。前者不是所有回答的错误概率，后者也不代表所有工程；官方仍建议最复杂编码使用 Sol 或 Astra。这些均是厂商报告，实际选型还需用自己的任务检验。

### Kimi 发布后的争议：把跑分、任务费用与订阅额度分开问

<a id="radar-kimi-evaluation-cost"></a>

- 来源：老范讲故事
- 来源渠道：博客
- 证据性质：观点推演
- 原始日期：2026-10-26
- 链接：https://lukefan.com/2026/10/26/kimi-k31-pr-backlash-ipo-gamble/
- 摘要：老范对 Kimi K3.1 Pro 发布后的评测展示、推广争议和用户额度体验提出批评。与 24 日的产品与权重开放进度相比，这篇评论新增的问题是：榜单分数、每 Token 报价和实际完成任务的费用，能否支持同一个“性价比”结论。

文章指出，最高思考档、不同硬件与从其他公开榜单取来的对手成绩，不能省略条件后直接拼成同场对照；每 Token 便宜，也可能被较长推理、工具调用和重试抵消。订阅显示的剩余百分比，则不足以独立解释一次任务消耗了多少资源。对使用者，更有操作性的比较是固定任务、推理档与验收标准，记录完成率、总费用、耗时和限额触发情况。

文中关于推广安排、资本压力与公司动机的说法属于作者评论，不能凭这篇文章认定其已获独立证实；作者的个人订阅体验也不是受控性能试验。它补充的是发布之后应追问的评价方法，不能把争议本身当作模型能力已被推翻。

## 产品与真实采用

### Seam Cutter：长截图的中间裁切，也改变了证据含义

<a id="radar-seam-cutter-tool"></a>

- 来源：Simon Willison
- 来源渠道：博客
- 证据性质：作者说明
- 原始日期：2026-10-25
- 链接：https://simonwillison.net/2026/Oct/25/seam-cutter/
- 摘要：Simon 介绍的小工具可横向或纵向切开图片，再相对滑动两侧，移除中间一段。他的需求来自手机拼接长截图后，还想删掉转写里无关的提示词。

普通裁切保留一个矩形区域，这里则让两块原本分开的内容接在一起，适合清理长图。它是具体工作流的小工具，不是图像生成或通用视觉能力演示。分享处理后的对话截图时应说明删减，不能再把相邻段落当作原始连续记录。

<!-- radar-visual:seam-cutter-tool -->
[![长图去除中间一段后拼接上下两侧的机制示意](/images/radar/daily-ai-radar-2026-10-26-seam-cutter-tool.webp)](/images/radar/daily-ai-radar-2026-10-26-seam-cutter-tool.webp)

*左为完整长图，中间移除灰色段并滑动两侧，右为保留上下内容的较短图。此为机制示意，不是工具真实界面；裁切后的图不再是完整原始记录。 图片来源：[AI Radar illustration / Simon Willison](https://simonwillison.net/2026/Oct/25/seam-cutter/)。点击图片查看原尺寸。*
<!-- /radar-visual:seam-cutter-tool -->

## 延伸阅读

### SAP 访谈：企业知识图谱负责理解，权限系统负责执行

<a id="radar-business-context-interview"></a>

- 主题：产品与真实采用
- 来源：The Rundown AI / SAP
- 来源渠道：Newsletter
- 证据性质：官方宣称
- 原始日期：2026-10-25
- 链接：https://www.therundown.ai/articles/sap-s-philipp-herzig-on-ai-built-for-business-data
- 摘要：这篇 SAP 合作访谈没有提供独立产品评测，但 CTO Philipp Herzig 把企业 AI 的两个问题分得很清楚：知道业务数据是什么意思，与有权据此采取行动，是两回事。

他用费用报销举例：生成一个表单应用，与在 40 个国家处理税务、权限和对账，不是同等难度。Knowledge Graph 给模型一张业务对象、关系与规则的地图，例如采购系统的供应商与财务系统中的同一主体；但规则被理解，不代表已经执行。行动仍应受用户权限和必要人工批准约束。

Company Memory 则保存异常为何批准、谁有权批准及结果。一次有效的例外不能自动成为新规则，业务负责人还要检查条件是否适用。这个设计比无区别堆文档更具体：需要保留决策的理由与作用范围，而不只是最终答案。

成本讨论也不只看 Token。访谈建议按复杂度、风险与上下文路由，简单摘要不必总用最强模型；对资产密集型企业，需求预测、维护与应收账款可能比写稿更有价值。表格模型以历史发票、到期日、实际付款日等字段预测延迟，再展示重要特征和相似案例供财务人员检查。文中的收款周期 50 天降至 45 天是收益情境举例，不是已经实现的业绩；解释特征影响也不等于证明改变付款条件一定导致某种结果。

<a id="radar-personal-shared-agent"></a>

相关阅读：Every 的 25 日[周回顾](https://every.to/context-window/anthropic-s-duet-gets-to-work)重述了[21日共享Agent的连接与权限设计](/radar/daily-ai-radar-2026-10-21/#radar-replaced-personal-agents)和[22日Duet个人体验](/radar/daily-ai-radar-2026-10-22/#radar-vibe-check-duet)。比较细节见这两篇。

[Simon 的 Terra 绘图实测与任务费用，见 27 日跟进。](/radar/daily-ai-radar-2026-10-27/#radar-terra-visual-computer)

*时间说明：窗口为 10 月 25 日 12:00 至 26 日 12:00（日本时间）。SAP 合作访谈只确认 25 日日期，时刻未核，列为延伸阅读。*
