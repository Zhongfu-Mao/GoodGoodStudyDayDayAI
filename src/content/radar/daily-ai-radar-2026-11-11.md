---
title: "AI 雷达日报：2026-11-11"
date: 2026-11-11
category: radar
cadence: daily
radarFormat: 2
lang: zh
coverImage: /images/radar/daily-ai-radar-2026-11-11-infographic.webp
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-11-11.mp3
audioDuration: 882
audioSize: 7059310
audioNotice: 音频由 AI 生成，欢迎反馈内容问题。
draft: false
tags: []
description: "从 Gemini 4 Carbon 扩大开放，到高速解码、Agent 接口与 Copilot 的增量迁移。"
plainSummary: "模型跑得更快、能做得更多，不等于任务更快完成；接口和验证方式仍决定交付。"
---

本期覆盖 2026 年 11 月 10 日 12:00 至 11 月 11 日 12:00（日本时间）。新公告、旧工程实践的新解读和延伸阅读分别注明原始日期。

## 本期重点

- [Gemini 4 Carbon 扩大开放：长任务的能力与人工判断分开看](#radar-carbon-availability)
- [Naive-N0.5-Flash：难题中更多推理 token 可抵消解码提速](#radar-naive-decode-latency)
- [Copilot 迁往 Rust：新旧实现先共存，再按组件替换](#radar-copilot-rust-migration)

## 能力与证据

### Gemini 4 Carbon 扩大开放，长任务仍需区分能力与判断

<a id="radar-carbon-availability"></a>

- 来源：Google、Every
- 来源渠道：官方、Newsletter
- 证据性质：官方宣称
- 原始日期：2026-11-10
- 链接：https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/
- 摘要：在此前面向部分防御人员的有限开放之后，Google 将 Carbon 提供给符合条件的付费开发者与企业，并向 Google AI Ultra 订阅者逐步开放相应产品入口。官方将它定位于复杂工程与长程验证；Antigravity 的 /swarm 仍是预览，可把架构和审计等难任务交给 Carbon，让较轻模型在隔离工作区并行处理其他部分。Every 获 Google 提供的早期访问，其公开试用结论认为编码和三维制作有进步，但测试者对要投入多少监督仍有分歧。这是试用观察，不能把任务跑得久等同于模型能判断该做什么、何时收手。

补充来源：[Every 的公开试用结论](https://every.to/vibe-check/vibe-check-gemini-4-carbon-doesn-t-know-when-to-stop)

### Naive-N0.5-Flash：解码很快，难题未必更早完成

<a id="radar-naive-decode-latency"></a>

- 来源：Latent.Space、NaiveAI
- 来源渠道：博客、GitHub
- 证据性质：作者实测
- 原始日期：2026-11-10
- 链接：https://latent.space/p/naiveai/
- 摘要：NaiveAI 用专门的推理引擎和推测解码来加快生成；约 2,100 token/s 是团队在单台八卡 Blackwell 节点上的一秒峰值。Latent.Space 另用三组各 10 道文本题比较三种 Flash 模型。在 HLE-Diamond 的 10 道难题上，Naive 开启思考的客户端平均完成时间为 89.8 秒，DeepSeek V4.1 Flash 1017 的 high 档是 79.7 秒；前者生成的 token 更多。两边服务和设置不同，小样本也不能给出通用排名。这个反差说明评估推理服务时，最好同时看任务质量、输出量和端到端耗时。

补充来源：[NaiveAI 项目原文](https://github.com/NaiveAI-Labs/Naive-N0.5-Flash)

<!-- radar-visual:naive-flash-response-time -->
[![三个题集对比响应时间、生成 token 数和有效 token 每秒](<https://media.beehiiv.com/cdn-cgi/image/fit=scale-down,format=auto,onerror=redirect,quality=80/uploads/asset/file/551a71b8-fce5-4259-b40e-fb938cdfc13e/image.png?t=1793716278>)](<https://media.beehiiv.com/cdn-cgi/image/fit=scale-down,format=auto,onerror=redirect,quality=80/uploads/asset/file/551a71b8-fce5-4259-b40e-fb938cdfc13e/image.png?t=1793716278>)

*横读最下面的 HLE-Diamond：Naive 思考档的生成量和有效速率都高，但平均响应时间并不最短。每个题集每种设置 10 道题；图注把右列定义为平均生成量除以平均客户端耗时，不是正文另报的吞吐统计，也不是厂商的一秒峰值。 图片来源：[Gabriele Beltramo / Latent.Space](https://latent.space/p/naiveai/)。点击图片查看原尺寸。*
<!-- /radar-visual:naive-flash-response-time -->

## 构建与运行

### Copilot 运行时迁往 Rust，靠的是可逐步替换的边界

<a id="radar-copilot-rust-migration"></a>

- 来源：ByteByteGo
- 来源渠道：Newsletter、博客
- 证据性质：作者说明
- 原始日期：2026-11-10
- 链接：https://blog.bytebytego.com/p/how-github-used-ai-to-port-copilot
- 摘要：ByteByteGo 重新解读 GitHub 9 月 16 日披露的迁移，而非本期新上线。旧 SDK 需通过无界面 CLI 与独立 Node.js 进程通信；重写后 Rust 运行时可以在宿主进程内调用，也保留进程外部署。迁移过程中用薄适配层桥接尚未迁移的 TypeScript 调用方，由组件级 PR 逐步替换并持续交付；GitHub 报告累计 128 个 PR、超过 80 万行生产 Rust。关键不只是让 Agent 写代码，而是让每次替换有清晰边界、可按旧行为验证，避免等到一次性切换才发现回归。

工程原文（2026-09-16）：[GitHub 的迁移复盘](https://github.blog/ai-and-ml/generative-ai/migrating-the-github-copilot-runtime-to-rust-using-copilot)

<!-- radar-visual:copilot-runtime-architecture -->
[![Copilot 旧 SDK 通过独立 CLI 进程，Rust 运行时可进程内或进程外部署](<https://substack-post-media.s3.amazonaws.com/public/images/2e64b9e1-d8ca-427a-b096-38cffbb4851e_4024x1604.png>)](<https://substack-post-media.s3.amazonaws.com/public/images/2e64b9e1-d8ca-427a-b096-38cffbb4851e_4024x1604.png>)

*左侧旧架构的 SDK 经标准输入输出跨到另一个 CLI 进程；右侧上支可经 FFI 在宿主内调用 Rust，下支仍保留独立进程。重写不是禁止进程外调用，而是让宿主不再只有一种路径。 图片来源：[ByteByteGo](https://blog.bytebytego.com/p/how-github-used-ai-to-port-copilot)。点击图片查看原尺寸。*
<!-- /radar-visual:copilot-runtime-architecture -->

### Resend 访谈：Agent 能找到接口，还要能读完返回结果

<a id="radar-resend-agent-interfaces"></a>

- 来源：Latent.Space / Resend
- 来源渠道：博客、播客
- 证据性质：作者说明
- 原始日期：2026-11-10
- 链接：https://latent.space/p/resend/
- 摘要：Resend 联合创始人 Zeno Rocha 在访谈中谈到，价格页不仅有给人操作的滑块，也能用 Markdown 表格直接读取；MCP 服务器则要兼顾发送邮件和管理等不同操作。他回忆一次工具返回结果大到上下文装不下的情况。工具目录的大小与单次调用结果的大小是两个问题：把入口缩成几个通用工具，不会自动减少返回内容；反过来，列全操作也不保证 Agent 会挑对工具。访谈提供设计经验，不证明这些做法一定带来更高推荐率或更少失败。

## 产品与真实采用

### ChatGPT 试行商家主页与独立的商家 Agent 对话

<a id="radar-chatgpt-business-agents"></a>

- 来源：OpenAI
- 来源渠道：官方
- 证据性质：官方宣称
- 原始日期：2026-11-10
- 链接：https://openai.com/index/introducing-businesses-chatgpt
- 摘要：符合条件的商家可以在 Business Hub 认领并验证身份，维护商家资料和商品信息流，查看达到门槛后才提供的聚合提及与点击数据。另一个功能 Business Agent 初期面向美国符合条件的电商与在线服务商；用户在看到商家资料时可自选开启新对话。OpenAI 表示该对话有明确标识，与 ChatGPT 的独立回答分开，商家也不会收到用户对话原文。主页、商家对话和赞助展示是不同入口，不能把商家提供的回答当成 ChatGPT 的独立建议。

### Android 扩大 Gemini Intelligence，功能和设备分批开放

<a id="radar-android-gemini-rollout"></a>

- 来源：Google
- 来源渠道：官方
- 证据性质：官方宣称
- 原始日期：2026-11-10
- 链接：https://blog.google/products-and-platforms/platforms/android/gemini-intelligence-november-features-devices/
- 摘要：Google 宣布将部分 Gemini Intelligence 能力带到 Pixel 10 系列指定机型，计划支持将于 11 月 19 日在美国开启预购的 motorola signature 27，并将跨应用任务自动化扩展至英国、印度和日本。Create My Widget 可按描述制作桌面组件，部分入口将在未来数周推出；Device Assistance 则面向设备设置和排障。这里要按机型、地区和具体功能分别判断可用性：扩展到日本不等于每台 Android 手机立即能用所有功能，也不是对这些任务都由本地模型完成的说明。

### Adobe 与 Google 公布跨应用编辑计划

<a id="radar-adobe-google-integrations"></a>

- 来源：Google
- 来源渠道：官方
- 证据性质：官方宣称
- 原始日期：2026-11-10
- 链接：https://blog.google/company-news/inside-google/company-announcements/adobe-google-partnership-integration/
- 摘要：Google 计划让 Drive 和 Gmail 的文件预览提供通往 Acrobat 的编辑入口，并扩大 Adobe 工具在 Gemini、Gemini Enterprise 与搜索 AI Mode 中的接入。另一方向是 Adobe 与 DeepMind 探索能在 Photoshop 中近实时编辑的图像模型。前一类改的是文件和工具之间的入口，后一类还在探索模型能力；公告不能当作各功能已开放，也没有提供近实时编辑的实测延迟。

## 产业与治理

### OpenAI 与 Upwork 研究：外包项目的任务组合在变

<a id="radar-upwork-task-mix"></a>

- 来源：OpenAI / Upwork
- 来源渠道：官方
- 证据性质：作者研究
- 原始日期：2026-11-10
- 链接：https://openai.com/index/ai-effect-on-freelance-work
- 摘要：研究把 ChatGPT 使用类别与 Upwork 的职位发布类别对照。在 63 个匹配类别中，有 43 个符合这一方向：ChatGPT 相对常用的任务在 Upwork 中份额趋降，相对少用的任务份额趋升；其余类别并不符合。另一项观察是 AI 相关项目更常把生成、剪辑与动效等技能组合起来，固定预算较高也伴随更多工时。这里比较的是两个平台上的活动构成，而不是追踪同一批雇主的替代决定。不能由此计算被 AI 取代的岗位数，也不能把项目总预算等同于时薪上升。

## 延伸阅读

### 决策模型：直接给候选项评分，不先生成一段 JSON

<a id="radar-hf-decision-models"></a>

- 主题：构建与运行
- 来源：Hugging Face
- 来源渠道：博客
- 证据性质：项目说明
- 原始日期：2026-11-10
- 链接：https://huggingface.co/blog/decision
- 摘要：这篇早于本期窗口起点的技术文章，解释了另一种接口设计：把工单、问题与选项一并给模型，让它直接返回各选项的概率。示例把重复扣费请求分给账务类，比先生成自由文本再解析更贴合已有的业务选项。文章还给出 Transformers 的 decision 接口与一个小型微调示例；示例中的高概率不是上线后的准确率。对于路由或分级，仍需要用实际数据校准置信度，并验证低置信度时如何转人工。

<!-- radar-visual:decision-model-state-and-options -->
[![工单文本与候选部门进入决策模型，输出各部门概率](<https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/decision/decision-models.png>)](<https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/decision/decision-models.png>)

*左边把工单、问题和预设部门一同输入，右边给每个部门一个分数。图中的百分比是说明接口的示例，不是生产准确率或已校准概率。 图片来源：[Hugging Face](https://huggingface.co/blog/decision)。点击图片查看原尺寸。*
<!-- /radar-visual:decision-model-state-and-options -->
