---
title: "AI 雷达日报：2026-11-14"
date: 2026-11-14
category: radar
cadence: daily
radarFormat: 2
lang: zh
coverImage: /images/radar/daily-ai-radar-2026-11-14-infographic.webp
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-11-14.mp3
audioDuration: 1262
audioSize: 10100537
audioNotice: 音频由 AI 生成，欢迎反馈内容问题。
draft: false
tags: []
description: "从模型评价、本地推理，到 Agent 的操作边界和逐笔确认。"
---

本期覆盖 2026 年 11 月 13 日 12:00 至 11 月 14 日 12:00（日本时间）。

## 本期重点

- [XYBench：能选出好答案，不等于会主动写出它](#radar-xybench)
- [llama.cpp 与 ggml：用主版本号标明不兼容改动](#radar-llama-cpp-v1)
- [ChatGPT Wallet：每笔交易先审核，再用网络令牌付款](#radar-wallet-per-purchase)

## 能力与证据

### XYBench：能选出好答案，不等于会主动写出它

<a id="radar-xybench"></a>

- 来源：Ai2／XYBench
- 来源渠道：博客
- 证据性质：作者研究
- 原始日期：2026-11-13
- 链接：https://huggingface.co/blog/allenai/xybench
- 摘要：Ai2 与合作者发布了 8,115 道题，分别评价助手是否提出解决实际目标的办法、是否把它放在回答重点、是否指出错误前提。以 Stack Overflow 子集为例，六个模型在二选一中选中目标导向答案的比例为 71–84%；其中五个模型在自由作答时将实际目标作为重点的比例为 35–41%。这是两种答题设置的比较，不是所有助手的实际成功率；评测主要为单轮，也包含生成式题目。

<!-- radar-visual:xybench-format-comparison -->
[![XYBench 对比在两道候选答案中选择与从头自由作答的结果](<https://www.datocms-assets.com/64837/1794336134-xybench-picking-vs-writing.png>)](<https://www.datocms-assets.com/64837/1794336134-xybench-picking-vs-writing.png>)

*图只比较 Stack Overflow 子集。左侧是从两个答案中选目标导向的一项；右侧是自由回答时主动聚焦实际目标，两边不是同一答题条件。 图片来源：[Ai2／XYBench](https://huggingface.co/blog/allenai/xybench)。点击图片查看原尺寸。*
<!-- /radar-visual:xybench-format-comparison -->

## 构建与运行

### llama.cpp 与 ggml：用主版本号标明不兼容改动

<a id="radar-llama-cpp-v1"></a>

- 来源：ggml-org
- 来源渠道：博客
- 证据性质：项目说明
- 原始日期：2026-11-13
- 链接：https://huggingface.co/blog/ggml-org/llama-cpp-v1
- 摘要：项目方将推理库 libllama 与张量库 libggml 标为 v1.0.0。公开 C 接口的不兼容改动将提升主版本号；兼容的功能、后端、模型支持或新增接口提升次版本号，不改接口的修复提升补丁号。声明还提出显式标示 API 与 ABI 的不兼容。这是给下游集成者的更新契约，不是说以后不会破坏兼容，也不是速度提升的证据。

### SimReady：资产验证通过，不等于抓放任务已经通过

<a id="radar-simready-assembly"></a>

- 来源：NVIDIA
- 来源渠道：博客
- 证据性质：项目说明
- 原始日期：2026-11-13
- 链接：https://huggingface.co/blog/nvidia/simready-assets-robot-pick-and-place
- 摘要：NVIDIA 用机械臂、夹爪和饮料罐演示怎样组装 Isaac Sim 抓放场景。资产包附带碰撞、质量、关节或驱动等适用参数，以及按配置规范的验证证据；工作台、摆放位置和控制逻辑仍要在场景中补上。依次检查关节设置、小幅运动和接触，再跑完整抓放，比仅看模型是否摆放正确更有效。教程验证的是模拟任务，不是实机测试。

<!-- radar-visual:simready-asset-scene-boundary -->
[![左侧列出 SimReady 包带来的模型与物理设置，右侧列出任务场景要补的工作](<https://cdn-uploads.huggingface.co/production/uploads/6abfe9e7d7cf09a9b38ef308/J7YL_C3mUh7MWUNJ_pVtN.png>)](<https://cdn-uploads.huggingface.co/production/uploads/6abfe9e7d7cf09a9b38ef308/J7YL_C3mUh7MWUNJ_pVtN.png>)

*左栏是该例里现成的机械臂、夹爪、饮料罐及其物理配置；右栏是场景还需加入的工作台、放置和控制。资产验证不替代整项任务测试。 图片来源：[NVIDIA](https://huggingface.co/blog/nvidia/simready-assets-robot-pick-and-place)。点击图片查看原尺寸。*
<!-- /radar-visual:simready-asset-scene-boundary -->

### OpenWorker Harness：文件整理也要把工具能力与批准分开

<a id="radar-openworker-harness"></a>

- 来源：The Batch／Andrew Ng
- 来源渠道：Newsletter、GitHub
- 证据性质：作者说明
- 原始日期：2026-11-13
- 链接：https://www.deeplearning.ai/the-batch/issue-379
- 摘要：Andrew Ng 在 The Batch 介绍开源 Harness SDK，并以整理演示目录为例：应用给模型看文件列表和内容，把可操作范围限制到演示目录，目录创建与文件移动各自需要确认。文章把上下文管理、输入输出检查、权限、审批和沙箱列为运行层职责。这里的边界是示例要求，不表示任意使用 SDK 的应用会默认获得同样的隔离。

项目：[OpenWorker Harness SDK](https://github.com/andrewyng/openworker/tree/main/harness)

### Datasette 地图插件：在瓦片请求上单独处理来源标头

<a id="radar-datasette-map-referrer"></a>

- 来源：Simon Willison
- 来源渠道：博客
- 证据性质：作者说明
- 原始日期：2026-11-13
- 链接：https://simonwillison.net/2026/Nov/13/datasette-cluster-map
- 摘要：cluster-map 0.19 适配 Datasette 1.0a42，并依赖新的 datasette-leaflet。维护者解释，Datasette 表页原本使用 no-referrer，而 OpenStreetMap 托管瓦片要求请求带参照来源。新版在瓦片请求上单设 strict-origin-when-cross-origin，跨源时可发送站点来源而非整条页面路径。这个修复作用于瓦片请求，不需要放宽整张数据表页面的默认设置。

补充来源：[datasette-leaflet 0.3](https://simonwillison.net/2026/Nov/13/datasette-leaflet)

<!-- radar-visual:datasette-faceted-map -->
[![Datasette 上方显示国家、业主和燃料筛选，下方在地图上聚合电站点位](<https://static.simonwillison.net/static/2026/power-plants-pge.webp>)](<https://static.simonwillison.net/static/2026/power-plants-pge.webp>)

*上方的分面用于筛选数据，地图上的数字圆点表示聚合后的站点数。这张图展示的是页面效果，不直接显示瓦片请求标头。 图片来源：[Simon Willison](https://simonwillison.net/2026/Nov/13/datasette-cluster-map)。点击图片查看原尺寸。*
<!-- /radar-visual:datasette-faceted-map -->

## 产品与真实采用

### Shield：旧后台没有 API，也能把部分网页步骤交给 Agent

<a id="radar-shield-browser-work"></a>

- 来源：OpenAI／Shield
- 来源渠道：官方
- 证据性质：官方宣称
- 原始日期：2026-11-13
- 链接：https://openai.com/business/customer-stories/shield
- 摘要：OpenAI 发布客户案例，称 Shield 的 Forge 把支持的工单、设备或软件许可后台步骤交给浏览器 Agent，由技术人员决定哪些操作可以自动做、哪些须核准。Shield 报告其 IT 服务商每月合计有数千次这类运行，但电话、上门和远程桌面工作仍要人工介入。这里验证的是一组已上线的浏览器流程，不代表任意后台或高权限操作都可放心委托。

### PhotoCraft：快速做出原型，与替代成熟工作流是两件事

<a id="radar-artcraft-photocraft"></a>

- 来源：Latent.Space／ArtCraft
- 来源渠道：博客
- 证据性质：作者说明
- 原始日期：2026-11-13
- 链接：https://latent.space/p/artcraft
- 摘要：Latent.Space 记录了 ArtCraft 在 AI Engineer Code Summit 的演讲：团队用 AI 辅助以 Rust 编写 PhotoCraft，并为应用准备 CLI 与 MCP 接口。团队很快做出了近似的界面和操作，但演讲与项目自己的评估都没有声称达到完整兼容。开发工具能加快试作，专业用户仍需逐项验证文件导入、图层和所依赖的编辑流程。

## 产业与治理

### ChatGPT Wallet：每笔交易先审核，再用网络令牌付款

<a id="radar-wallet-per-purchase"></a>

- 来源：OpenAI
- 来源渠道：官方
- 证据性质：官方宣称
- 原始日期：2026-11-13
- 链接：https://openai.com/index/introducing-chatgpt-wallet
- 摘要：OpenAI 公布 ChatGPT Wallet，称首批通过 dots 面向美国年满 18 岁、持有符合条件的美国发行卡的 ChatGPT Pro 用户。当前流程要求每笔交易先由用户看商品、总额与所选卡，再做安全验证；批准后支付网络提供替代原卡资料的令牌，Agent 和商家不会拿到原卡明细。按限额或类别预授权属于未来设想，不是本次上线能力；适用性仍取决于实际账户及商家。
