---
title: "AI 雷达日报：2026-10-27"
date: 2026-10-27
category: radar
cadence: daily
radarFormat: 2
lang: zh
coverImage: /images/radar/daily-ai-radar-2026-10-27-infographic.webp
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-10-27.mp3
audioDuration: 1110
audioSize: 8883284
draft: false
tags: []
---

整理2026-10-26 12:00至2026-10-27 12:00（日本时间）的7条公开材料，区分原始日期、观察日期及发布方宣称、实测和观点的证据边界。

## 三条关键变化

- [确定性推理要处理批次和浮点计算，Temperature 0本身并不够。](#radar-temperature-zero)
- [企业智能体将规则、上下文和权限拆成可执行的独立层。](#radar-salesforce-harness)
- [代码审查开始结合真实视口和用户操作，但案例仍需保留证据边界。](#radar-greptile-ui-review)

## 构建与运行

### 为什么大模型推理中Temperature 0并非完全确定性

<a id="radar-temperature-zero"></a>

- 来源：Daily Dose of Data Science
- 来源渠道：博客
- 证据性质：观点推演
- 原始日期：2026-10-26
- 链接：https://blog.dailydoseofds.com/p/why-temperature-0-isnt-deterministic
- 摘要：Daily Dose解读Temperature 0仍可能产生不同输出的系统原因：GPU浮点加法不满足结合律，动态批次会改变归约与累加顺序，接近的Token分数因而可能互换。文中援引Thinking Machines在Qwen3-235B上重复同一提示词的实验，并介绍vLLM和SGLang的批次不变内核。确定性模式有性能代价；所列耗时来自指定模型和负载，不能当作所有部署的固定开销。

<!-- radar-visual:temperature-zero -->
[![FP16中改变加法次序导致不同舍入结果的示意](/images/radar/daily-ai-radar-2026-10-27-temperature-zero.webp)](/images/radar/daily-ai-radar-2026-10-27-temperature-zero.webp)

*上行把0.4逐次加到1024，每步舍入；下行先合并小数再加，示例得到不同结果。它解释有限精度下加法不满足结合律，不表示所有输入或硬件都会出现同样的数值差。 图片来源：[Daily Dose of Data Science](https://blog.dailydoseofds.com/p/why-temperature-0-isnt-deterministic)。点击图片查看原尺寸。*
<!-- /radar-visual:temperature-zero -->

### 深入剖析Salesforce智能体技术架构：从单提示词到确定性代码协同

<a id="radar-salesforce-harness"></a>

- 来源：ByteByteGo
- 来源渠道：博客
- 证据性质：观点推演
- 原始日期：2026-10-26
- 链接：https://blog.bytebytego.com/p/a-deep-dive-into-salesforces-agent
- 摘要：ByteByteGo根据Salesforce团队的讲解，梳理Agentforce从单一大提示词转向分层系统的设计：Agent Script以确定性代码约束推理前后的业务规则，上下文引擎按任务取数据，Agent Identity同时检查用户与智能体权限。文中保险查询示例的上下文由12.4万减至9000 Token，并介绍按需发现、描述、分发工具的流程。这是团队披露的架构与特定示例，不是所有智能体的通用性能保证。

<!-- radar-visual:salesforce-harness -->
[![Salesforce智能体技术栈按数据、业务动作、执行及交互分层](/images/radar/daily-ai-radar-2026-10-27-salesforce-harness.webp)](/images/radar/daily-ai-radar-2026-10-27-salesforce-harness.webp)

*从下到上是统一数据、业务动作、智能体执行与用户交互入口；规则执行和身份权限属于执行层，不能只靠聊天提示词约束。图表达团队公布的组织结构，不是对所有连接已经稳定运行的独立认证。 图片来源：[ByteByteGo / Salesforce engineering](https://blog.bytebytego.com/p/a-deep-dive-into-salesforces-agent)。点击图片查看原尺寸。*
<!-- /radar-visual:salesforce-harness -->

### Simon Willison评测webframe：轻量网页抓取与沙箱运行工具

<a id="radar-webframe"></a>

- 来源：Simon Willison
- 来源渠道：博客
- 证据性质：作者实测
- 原始日期：2026-10-26
- 链接：https://simonwillison.net/2026/Oct/26/webframe-evaluation/
- 摘要：Simon Willison使用Claude Opus 5.5对Jeff Lindsay开发的开源项目webframe进行了评测。该工具基于Go语言及glaze库开发，直接调用宿主系统自带浏览器（macOS的WKWebView、Linux的WebKitGTK、Windows的WebView2），无需捆绑独立浏览器引擎即可像程序一样无头执行网页并输出日志。测试表明其轻量快速且性能媲美shot-scraper，但在实际测试中暴露了CSP错误、0×0视口、加载挂起、缺失HTTP元数据及控制权限受限等问题。

### Hallmark把设计检查分成不可放行底线与可说明的例外

<a id="radar-hallmark-observation"></a>

- 来源：GitHub / Nutlope
- 来源渠道：GitHub
- 证据性质：官方宣称
- 原始日期：未确认
- 观察日期：2026-10-27
- 链接：https://github.com/Nutlope/hallmark
- 摘要：本次观察GitHub Trending中的Hallmark：它是面向Claude Code、Codex、Cursor等工具的设计Skill，README把规则分为对比度、焦点、减少动态效果、虚构事实和手机布局等不可放行底线，以及可说明理由的默认设计禁忌、仅作打磨的细节。流程还要求真实浏览器检查和独立上下文审阅。这里记录当前公开实现的设计，不声称它今天首发，也未独立证明所有检查都能可靠执行。

## 产品与真实采用

### Greptile采用GPT-6 Astra与Codex将代码审查拓展至自动化行为测试

<a id="radar-greptile-ui-review"></a>

- 来源：OpenAI
- 来源渠道：博客
- 证据性质：官方宣称
- 原始日期：2026-10-26
- 链接：https://openai.com/index/greptile-code-review-codex-astra
- 摘要：OpenAI发布Greptile案例，介绍将代码审查扩展到实际运行和界面测试的做法。案例称，GPT-6 Astra可为PR启动开发服务器，把浏览器缩到手机视口，再模拟用户操作，发现静态代码阅读不易捕捉的按钮隐藏问题；Greptile还通过MCP向Codex提供代码库上下文。材料来自供应商与客户的案例陈述，展示了工作方式，没有提供可外推到所有项目的统一检出率或回滚降幅。

## 产业与治理

### OpenAI发布Signals数据：揭示近100个国家在165类工作活动中对ChatGPT的使用趋势

<a id="radar-signals-work"></a>

- 来源：OpenAI
- 来源渠道：博客
- 证据性质：官方宣称
- 原始日期：2026-10-26
- 链接：https://openai.com/index/chatgpt-expanding-world-of-work
- 摘要：OpenAI Signals新增按O*NET框架划分的165类工作活动数据，覆盖近100个国家、2025年第一季度至2026年第三季度。在每季度都被观察的74国中，最常见十类活动占已分类工作消息的平均比例由56.0%降至51.1%。这说明样本中的用途分布变化，不等于就业替代比例。数据只含个人ChatGPT计划的工作消息，不含企业消息或Codex，并采用聚合、小样本抑制和统计噪声保护隐私。

### Evan Armstrong分析Anthropic S-1招股书：2万亿美元估值传闻下的商业实质与算力风险

<a id="radar-anthropic-compute-economics"></a>

- 来源：Every
- 来源渠道：博客
- 证据性质：观点推演
- 原始日期：2026-10-26
- 链接：https://every.to/napkin-math/is-anthropic-worth-2-trillion
- 摘要：Evan Armstrong在Every评论Anthropic的招股材料，讨论高速增长背后的算力合同与模型更新压力。他把可随用量变化、客户可取消的收入，与期限更长的基础设施承诺作对照，并区分模型服务毛利与持续研发、训练的成本。文章也写到分阶段承诺算力、需求超过供给等反面证据。这是作者对商业模式和估值假设的分析，不能当作独立审计、已确认的上市估值或投资结论。

<!-- radar-visual:anthropic-compute-economics -->
[![作者汇总的对Anthropic贡献年收入至少十万美元的企业客户数量](/images/radar/daily-ai-radar-2026-10-27-anthropic-compute-economics.webp)](/images/radar/daily-ai-radar-2026-10-27-anthropic-compute-economics.webp)

*柱高是过去十二个月对Anthropic贡献至少10万美元收入的企业客户数，不是这些客户自身的营业收入。原文依据招股材料给出近似值，最后一柱截至2026年9月而非全年，不能按等间隔柱宽直接外推增长或估值。 图片来源：[The Leverage / Every](https://every.to/napkin-math/is-anthropic-worth-2-trillion)。点击图片查看原尺寸。*
<!-- /radar-visual:anthropic-compute-economics -->
