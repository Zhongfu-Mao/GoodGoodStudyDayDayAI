---
title: "AI 雷达日报：2026-11-12"
date: 2026-11-12
category: radar
cadence: daily
radarFormat: 2
lang: zh
coverImage: /images/radar/daily-ai-radar-2026-11-12-infographic.webp
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-11-12.mp3
audioDuration: 882
audioSize: 7058474
audioNotice: 音频由 AI 生成，欢迎反馈内容问题。
draft: false
tags: []
description: "从多模态评分、AWS 行为对照，到 Agent 运行环境和验收。"
plainSummary: "选项评分、服务行为、任务合否，必须分别核对它们测到了什么。"
---

本期覆盖 2026 年 11 月 11 日 12:00 至 11 月 12 日 12:00（日本时间）。新发布与对既有做法的报道分开。

## 本期重点

- [Gemini Decisions：同一份多模态输入可以回答多道有边界的问题](#radar-gemini-decisions-api)
- [AWS Emulator：先在真实服务上定预期，再用同一测试对照本地](#radar-aws-emulator-fidelity)
- [Harness Arena：先验收任务，再比较成功组合的开销](#radar-harness-arena-comparison)

## 能力与证据

### Gemini Decisions API：共享多模态输入，分别给预设选项评分

<a id="radar-gemini-decisions-api"></a>

- 来源：Google、Simon Willison
- 来源渠道：官方、博客
- 证据性质：官方宣称
- 原始日期：2026-11-11
- 链接：https://blog.google/innovation-and-ai/technology/developers-tools/gemini-decisions-api/
- 摘要：11 月 11 日，Google 发布 Gemini Decisions API。一次请求可将同一组文本、图像、音频、视频或 PDF 输入用于多个是非题、选择题和分级评分，由 Gemini Decision 1 直接评分并返回概率或置信度，不必先生成长文本再解析。每次请求最多 1,000 个独立问题；官方所报端到端中位延迟 150–250 毫秒对应最多 16K token 的输入和 1 至 100 题的测试范围，不能套到上限请求。Willison 用一段视频试了几个是非题，得到非 0/1 的概率；这说明输出可表达不确定性，不证明生产场景已经校准。

补充来源：[Willison 的视频试验](https://simonwillison.net/2026/Nov/11/gemini-decisions-api/)

<!-- radar-visual:decision-api-architecture -->
[![多模态材料和三类问题进入 Gemini Decision 1，返回各自的评分](<https://storage.googleapis.com/gweb-uniblog-publish-prod/images/decisions-architecture_f0NFXU9.width-1200.format-webp.webp>)](<https://storage.googleapis.com/gweb-uniblog-publish-prod/images/decisions-architecture_f0NFXU9.width-1200.format-webp.webp>)

*从左到右读：共享输入和三类问题一起送入模型，右侧分开返回是非概率、选项和等级评分。图中的置信度只是演示结果。 图片来源：[Google](https://blog.google/innovation-and-ai/technology/developers-tools/gemini-decisions-api/)。点击图片查看原尺寸。*
<!-- /radar-visual:decision-api-architecture -->

## 构建与运行

### AWS Emulator：把同一行为测试跑在真服务和本地模拟器上

<a id="radar-aws-emulator-fidelity"></a>

- 来源：AWS / All Things Distributed
- 来源渠道：博客、GitHub
- 证据性质：作者说明
- 原始日期：2026-11-11
- 链接：https://www.allthingsdistributed.com/2026/11/aws-emulator-and-the-engineers-job-when-agents-write-the-code.html
- 摘要：AWS 发布了可在本机运行的 API 模拟器。团队先从公开 Smithy API 模型设计端到端行为测试，在真实 AWS 上确认预期，再用同一测试发现模拟器的差距。例如收到 SQS 消息后，在可见性超时前其他消费者不应再次看到它。开发方称实现由 Agent 编写和测试，改动仍须通过自动化合并门槛。本地测试让反馈更快，但通过一组已覆盖行为不等于所有 API、权限配置和生产故障都与云端相同。

项目：[aws/aws-emulator](https://github.com/aws/aws-emulator)

### Harness Arena：保持任务不变，再比较运行组合

<a id="radar-harness-arena-comparison"></a>

- 来源：Daily Dose of Data Science
- 来源渠道：Newsletter、GitHub
- 证据性质：作者说明
- 原始日期：2026-11-11
- 链接：https://blog.dailydoseofds.com/p/find-production-agent-failures-before
- 摘要：Daily Dose 介绍 HarnessRouter 项目里的 Arena：给不同模型和运行框架组合相同的提示、文件、工具及验收条件，保留通过与否、用时、成本和产物。先检查是否达成任务，再比较通过者的开销；若要估计框架的影响，需要固定模型。文章里的少数任务对照是演示，不是跨任务排名，也不能把两边同时更换的模型和框架归因给其中一项。

项目：[HarnessRouter](https://github.com/HarnessRouter/harnessrouter)

<!-- radar-visual:harness-arena-shared-inputs -->
[![共享输入分发到多个运行框架与模型组合，分别记录成本、时间和合否](<https://substack-post-media.s3.amazonaws.com/public/images/de6d1873-7e1e-463b-871b-682ac6cf069e_2752x1536.jpeg>)](<https://substack-post-media.s3.amazonaws.com/public/images/de6d1873-7e1e-463b-871b-682ac6cf069e_2752x1536.jpeg>)

*左侧把任务材料固定，右侧比较每种组合的输出。图中模型与运行框架同时变化，因此适合比较组合，不能单独归因给框架。 图片来源：[Daily Dose of Data Science](https://blog.dailydoseofds.com/p/find-production-agent-failures-before)。点击图片查看原尺寸。*
<!-- /radar-visual:harness-arena-shared-inputs -->

### Codex 研讨会：共享环境配置，不共享任务运行实例

<a id="radar-codex-workshop-environment"></a>

- 来源：Latent.Space
- 来源渠道：博客
- 证据性质：作者说明
- 原始日期：2026-11-11
- 链接：https://latent.space/p/codex-work/
- 摘要：Latent.Space 报道了 AI Engineer Code Summit 的 Codex 研讨会。现场讲的是已在此前 DevDay 更新的云端工作方式：先发布环境配置，再让多项任务各自在该配置的独立实例中运行。报道还记录了一次本地任务交接到云端后，浏览器仍能看到此前的窗口截图附件。那是一次演示，不是任何任务都能无损迁移的承诺；交接仍要确认必要的上下文、仓库权限和可复现环境。

补充来源：[现场研讨会材料](https://aie-codex-workshop.openai.chatgpt.site/)

### LLM 0.37.2 修正跨服务商凭据误用

<a id="radar-llm-provider-credential-fix"></a>

- 来源：Simon Willison
- 来源渠道：博客
- 证据性质：作者说明
- 原始日期：2026-11-11
- 链接：https://simonwillison.net/2026/Nov/11/llm/
- 摘要：维护者发布 LLM 0.37.2，修复配置 OpenAI 兼容第三方服务时，某些情况下可能把原本配置给 OpenAI 的 API 密钥发往该服务的问题。兼容请求格式并不代表可以共用认证对象。如果正在用这类第三方端点，应优先更新受影响工具；是否实际发生外发，要结合过去使用的配置及服务方记录确认，不能由漏洞公告直接推断。

### Every：把反复出现的人工改稿意见变成可检查条件

<a id="radar-every-corrections-to-tests"></a>

- 来源：Every
- 来源渠道：Newsletter
- 证据性质：观点推演
- 原始日期：2026-11-11
- 链接：https://every.to/context-window/what-s-left-for-humans-after-automation
- 摘要：Every 转述评测负责人 Mike Taylor 的做法：把对具体产物的修改意见改写为可以判定的检查，再让不同模型或提示版本做同一任务。比如检查新演示文稿是否真的绘制了专用示意图，而非复用品牌图。反例更值得保留：把“画得像猫”固化成“必须正脸”，会错判原本要求蜷睡的画面。检查既要能发现重现的错误，也要在合理变化的任务上确认不会错杀；这是团队经验，不是某个模型普遍更好的证据。

## 产品与真实采用

### Tabletop：把群体筹划做成可共同操作的空间

<a id="radar-tabletop-shared-space"></a>

- 来源：Google Labs
- 来源渠道：官方
- 证据性质：官方宣称
- 原始日期：2026-11-11
- 链接：https://blog.google/innovation-and-ai/models-and-research/google-labs/tabletop/
- 摘要：Google Labs 公布实时协作实验 Tabletop。用户放入链接、文件与想法，再用自然语言或模板生成旅行行程、投票等交互小工具，邀请组员在同一空间操作。这里的变化是生成对象可以被多人共同使用，而非只产生一段聊天答案。按公告，产品通过候补名单在美国面向 18 岁以上用户逐步开放，不等于已向所有地区上线。

## 产业与治理

### Gilbert + Tobin：试用可以放开，正式交付仍由人负责

<a id="radar-gilbert-tobin-human-approval"></a>

- 来源：OpenAI / Gilbert + Tobin
- 来源渠道：官方
- 证据性质：作者说明
- 原始日期：2026-11-12
- 链接：https://openai.com/index/gilbert-tobin-sam-nickless
- 摘要：OpenAI 刊出对澳大利亚律所 Gilbert + Tobin 负责人的采访。机构先在不输入客户或保密数据的前提下试用，之后在有角色访问和管理控制的企业环境中把个人辅助扩大为多步流程，并保留人的审核与批准。负责人举例称，工具可以根据表格更新文件并打包 PDF；需要人来定义任务、检查输出和承担交付责任。这里是客户自述，不是独立合规认定、普遍节省率或法律建议。
