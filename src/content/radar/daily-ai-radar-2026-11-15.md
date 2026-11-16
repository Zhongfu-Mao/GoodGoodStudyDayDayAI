---
title: "AI 雷达日报：2026-11-15"
date: 2026-11-15
category: radar
cadence: daily
radarFormat: 2
lang: zh
coverImage: /images/radar/daily-ai-radar-2026-11-15-infographic.webp
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-11-15.mp3
audioDuration: 996
audioSize: 7968527
audioNotice: 音频由 AI 生成，欢迎反馈内容问题。
draft: false
tags: []
description: "本地推理的兼容接口、数据表的图表路径，以及 Agent 消息送达前的撤回边界。"
---

本期覆盖 2026 年 11 月 14 日 12:00 至 11 月 15 日 12:00（日本时间）。

## 本期重点

- [TensorFold：两套客户端接口，共用一套推理引擎](#radar-tensorfold-ollama)
- [Datasette：数据工具可以接本地模型，也可以不走模型直接出图](#radar-datasette-local-llm)
- [Plannotator：撤回的边界是消息是否送达](#radar-plannotator-undelivered)

## 构建与运行

### TensorFold：同一推理引擎增加 Ollama 兼容入口

<a id="radar-tensorfold-ollama"></a>

- 来源：TensorFold
- 来源渠道：GitHub
- 证据性质：项目说明
- 原始日期：2026-11-15
- 链接：https://github.com/ashhart/TensorFold/releases/tag/v1.2.9
- 摘要：TensorFold v1.2.9 新增 Ollama 兼容接口，覆盖聊天、生成、嵌入和部分模型查询，与已有的 OpenAI 风格接口走同一推理引擎。入口兼容不等于后端行为相同，迁移时仍宜检查流式响应、工具调用和错误返回。新版也支持把服务启动参数放进 TOML 文件，便于记录和复用部署配置。

### Datasette：用兼容端点把本地模型接入数据代理

<a id="radar-datasette-local-llm"></a>

- 来源：Simon Willison
- 来源渠道：博客
- 证据性质：作者说明
- 原始日期：2026-11-14
- 链接：https://simonwillison.net/2026/Nov/14/datasette-llm/
- 摘要：datasette-llm 为其他 Datasette 插件提供模型配置，新版支持 OpenAI 兼容端点。作者用 LM Studio 托管 Qwen，让本机 Datasette Agent 使用该模型处理数据请求。这是本地服务器演示，不代表 Datasette Lite 能在浏览器里直接运行同一个模型，也没有评估查询正确率。

<!-- radar-visual:datasette-lm-studio -->
[![Datasette Agent 界面显示 lmstudio-qwen、用户查询及 SQL 工具](<https://static.simonwillison.net/static/2026/lmstudio-datasette-agent.webp>)](<https://static.simonwillison.net/static/2026/lmstudio-datasette-agent.webp>)

*顶部标出所选模型，下方显示用户请求和 SQL 工具的运行过程。截图说明本地模型能接入此演示，不是查询正确率测试。 图片来源：[Simon Willison](https://simonwillison.net/2026/Nov/14/datasette-llm/)。点击图片查看原尺寸。*
<!-- /radar-visual:datasette-lm-studio -->

### datasette-vega：在浏览器里给表格和查询结果画图

<a id="radar-datasette-vega"></a>

- 来源：Simon Willison
- 来源渠道：博客
- 证据性质：作者说明
- 原始日期：2026-11-14
- 链接：https://simonwillison.net/2026/Nov/14/datasette-vega/
- 摘要：插件更新以兼容较新的 Datasette alpha；由于 Datasette Lite 已能运行这类 JavaScript 插件，作者把示例搬到了 Lite。用户可从表或自定义查询结果选择列，交给 Vega-Lite 渲染。这是独立于语言模型的数据可视化路径，不需要先让 Agent 生成图表。

<!-- radar-visual:datasette-vega-browser -->
[![Datasette Lite 中选择字段生成柱状图的界面](<https://static.simonwillison.net/static/2026/datasette-vega.webp>)](<https://static.simonwillison.net/static/2026/datasette-vega.webp>)

*图中在界面选择柱状图、航空公司列和一项死亡人数列。它演示如何映射字段，不应用来给航空公司作安全排名。 图片来源：[Simon Willison](https://simonwillison.net/2026/Nov/14/datasette-vega/)。点击图片查看原尺寸。*
<!-- /radar-visual:datasette-vega-browser -->

### ByteByteGo：需要并行或独立复核时，再拆成多个 Agent

<a id="radar-agent-control-loops"></a>

- 来源：ByteByteGo
- 来源渠道：Newsletter
- 证据性质：观点推演
- 原始日期：2026-11-14
- 链接：https://blog.bytebytego.com/p/ep233-kubernetes-explained-for-busy
- 摘要：这一期用两种结构解释任务怎么拆：线性任务可让一个 Agent 在同一循环中规划、选工具、读结果；能并行的子任务或需要与作者分开的复核，可以交由协调者分配。拆分会引入协调成本。这是架构取舍，不是多 Agent 更准确或更便宜的普遍实测。

<!-- radar-visual:agent-control-loops -->
[![上方是单 Agent 的循环，下方是协调者分配多个角色的结构](<https://substack-post-media.s3.amazonaws.com/public/images/5233378c-3c59-40b1-9de2-6515b9d3e928_2484x3002.png>)](<https://substack-post-media.s3.amazonaws.com/public/images/5233378c-3c59-40b1-9de2-6515b9d3e928_2484x3002.png>)

*上半图由同一个 Agent 往返调用工具；下半图把研究、写作等工作分给不同角色，再由协调者衔接。结构图不比较实际费用或准确率。 图片来源：[ByteByteGo](https://blog.bytebytego.com/p/ep233-kubernetes-explained-for-busy)。点击图片查看原尺寸。*
<!-- /radar-visual:agent-control-loops -->

## 产品与真实采用

### Plannotator：Agent 尚未收到时，撤回回复并继续编辑

<a id="radar-plannotator-undelivered"></a>

- 来源：Plannotator
- 来源渠道：GitHub
- 证据性质：项目说明
- 原始日期：2026-11-15
- 链接：https://github.com/backnotprop/plannotator/releases/tag/v0.28.65
- 摘要：v0.28.65 允许撤回尚未送达 Agent 的回复，并将文字和附件恢复到输入框。改完再发是新消息。这解决的是等待队列里的纠错，不等于取消已运行的任务，也不能收回 Agent 已经收到的指令。

## 产业与治理

### Grok Imagine：团队调整报道引出算力分配问题

<a id="radar-grok-imagine-compute"></a>

- 来源：老范讲故事
- 来源渠道：博客
- 证据性质：观点推演
- 原始日期：2026-11-15
- 链接：https://lukefan.com/2026/11/15/elon-musk-cuts-grok-imagine-team-compute/
- 摘要：作者援引媒体对 Grok Imagine 团队缩减的报道，推测图像、视频生成可能在与其他业务竞争算力。团队调整报道和算力去向推测是两回事；文中没有可核验的内部资源分配，也不能据此推断产品已经停止运营。
