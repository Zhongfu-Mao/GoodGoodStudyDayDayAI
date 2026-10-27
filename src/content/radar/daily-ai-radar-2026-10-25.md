---
title: "AI 雷达日报：2026-10-25"
date: 2026-10-25
category: radar
cadence: daily
radarFormat: 2
lang: zh
coverImage: /images/radar/daily-ai-radar-2026-10-25-infographic.webp
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-10-25.mp3
audioDuration: 1303
audioSize: 10424718
draft: false
tags: []
---

整理2026-10-24 12:00至2026-10-25 12:00（日本时间）的4条近期材料，并补充1条公司级Harness深读（原文仅标日期，未确认时刻），区分原始日期、观察日期及发布方宣称、实测和观点的证据边界。

## 三条关键变化

- [Raschka开放从预训练模型开始的推理模型课程](#radar-reasoning-course)
- [CUDA Graph重放减少启动开销，不是重用旧答案](#radar-cuda-graph-replay)
- [RAG与Agentic RAG的差异在检索控制环](#radar-rag-agentic-loop)

## 能力与证据

### Raschka开放从预训练模型开始的推理模型课程

<a id="radar-reasoning-course"></a>

- 来源：Ahead of AI
- 来源渠道：博客
- 证据性质：官方宣称
- 原始日期：2026-10-24
- 链接：https://magazine.sebastianraschka.com/p/building-reasoning-models
- 摘要：Sebastian Raschka分享八节、合计约十一小时的代码讲座，从已有预训练模型出发，用Python与PyTorch实现评估、推理时扩展、强化学习和蒸馏等方法。文章把推理模型视为智能体Harness中的引擎，区分模型后训练与围绕它组织工具和工作流的软件。课程适合理解机制与复现实现，不意味着从零完成大规模预训练，也没有证明课程代码已达到商业前沿系统的完整能力。

<!-- radar-visual:reasoning-course -->
[![推理模型课程的已有模型、评估、推理和训练模块](/images/radar/daily-ai-radar-2026-10-25-reasoning-course.webp)](/images/radar/daily-ai-radar-2026-10-25-reasoning-course.webp)

*从已预训练的模型出发，依次讨论评估、推理技术和强化学习或蒸馏。图中四个模块是内容结构，不代表只发布四节课，也不表示课程重新完成了模型预训练。 图片来源：[Sebastian Raschka / Ahead of AI](https://magazine.sebastianraschka.com/p/building-reasoning-models)。点击图片查看原尺寸。*
<!-- /radar-visual:reasoning-course -->

## 构建与运行

### CUDA Graph重放减少启动开销，不是重用旧答案

<a id="radar-cuda-graph-replay"></a>

- 来源：Daily Dose of Data Science
- 来源渠道：博客
- 证据性质：观点推演
- 原始日期：2026-10-24
- 链接：https://blog.dailydoseofds.com/p/how-cuda-graph-replay-cuts-inference
- 摘要：Daily Dose解释LLM解码中CPU逐个提交短GPU内核造成的空隙。CUDA Graph先预热建立稳定缓冲区，再捕获执行顺序与依赖；重放时把新输入写入同一缓冲区，以一次图启动重新运行计算。模型仍执行运算，不是返回以前的输出。收益依赖重复路径、兼容形状和稳定地址；多批次图会增加显存及启动成本，动态请求也可能需要填充或回退普通执行。

<!-- radar-visual:cuda-graph-replay -->
[![CUDA Graph的预热、捕获、重放和GPU执行时间线](/images/radar/daily-ai-radar-2026-10-25-cuda-graph-replay.webp)](/images/radar/daily-ai-radar-2026-10-25-cuda-graph-replay.webp)

*从左到右先准备形状和缓冲区，再捕获内核启动序列，最后用一次CPU图启动提交重复计算。右侧减少的是启动间隙，新输入仍要重新计算；收益依赖稳定形状、地址和重复执行路径。 图片来源：[Daily Dose of Data Science](https://blog.dailydoseofds.com/p/how-cuda-graph-replay-cuts-inference)。点击图片查看原尺寸。*
<!-- /radar-visual:cuda-graph-replay -->

### RAG与Agentic RAG的差异在检索控制环

<a id="radar-rag-agentic-loop"></a>

- 来源：ByteByteGo
- 来源渠道：博客
- 证据性质：观点推演
- 原始日期：2026-10-24
- 链接：https://blog.bytebytego.com/p/ep230-rag-vs-agentic-rag
- 摘要：ByteByteGo对比固定检索后回答的RAG流程，与可选择工具、反复检索并检查证据是否充分的Agentic RAG。后者在证据不足时调整搜索或切换文档、API、数据库等工具，再把足够的上下文交给模型。它增加了控制环和工具选择，不等于自动提高事实准确率；停止条件、检索质量与每轮开销仍需应用自行设计。本文是架构讲解，没有给出两类系统的统一对照评测。

<!-- radar-visual:rag-agentic-loop -->
[![固定RAG流程与带工具选择和证据评估循环的Agentic RAG](/images/radar/daily-ai-radar-2026-10-25-rag-agentic-loop.webp)](/images/radar/daily-ai-radar-2026-10-25-rag-agentic-loop.webp)

*左侧按既定检索后回答，右侧在证据不够时改写查询或换来源再检索。图里的最多五次是这个示意流程的停止设计，并非所有Agentic RAG的统一标准；增加循环也不自动保证答案更准。 图片来源：[ByteByteGo](https://blog.bytebytego.com/p/ep230-rag-vs-agentic-rag)。点击图片查看原尺寸。*
<!-- /radar-visual:rag-agentic-loop -->

## 产业与治理

### Kimi后续讨论提醒分开开源承诺、跑分和推广关系

<a id="radar-kimi-evidence-followup"></a>

- 来源：Latent.Space / AINews
- 来源渠道：博客
- 证据性质：观点推演
- 原始日期：2026-10-24
- 链接：https://latent.space/p/ainews-kimi-31/
- 摘要：继前一期API上线消息，AINews进一步整理Kimi K3.1 Pro的社区讨论，涵盖后训练投入、Hosted Agents环境与发布推广争议。文中仍把11月4日的完整权重发布列为未来承诺，并区分厂商结果、第三方综合指数和用户体验。新增价值在于检查评测条件和商业关系披露，而不是重复宣布模型开放。社交帖中的推广指控和个别使用感受不能自动当成已独立证实的事实或总体表现。

## 延伸阅读

### 深读：公司级Harness需要身份、记忆和后台运行机制

<a id="radar-company-harness-reading"></a>

- 主题：构建与运行
- 来源：LangChain engineering
- 来源渠道：博客
- 证据性质：官方宣称
- 原始日期：2026-10-24
- 链接：https://www.langchain.com/blog/components-building-company-harness
- 摘要：重读LangChain在24日发布的工程文章：团队把内部智能体组织在工作聊天入口，以身份区分代表用户与服务账号的动作，用全局及用户两层记忆、沙箱执行与后台触发支撑长期运行。原文特别区分私聊中可用的个人邮件权限与共享频道的能力，也承认记忆设计仍待探索。该文未提供精确首发时刻，因此作为旧文深读，而非宣称在本期窗口内刚发布；这些是团队方案，不是本项目新增权限。
