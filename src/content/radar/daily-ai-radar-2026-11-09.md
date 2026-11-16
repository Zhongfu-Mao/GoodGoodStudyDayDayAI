---
title: "AI 雷达日报：2026-11-09"
date: 2026-11-09
category: radar
cadence: daily
radarFormat: 2
lang: zh
coverImage: /images/radar/daily-ai-radar-2026-11-09-infographic.webp
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-11-09.mp3
audioDuration: 1143
audioSize: 9147016
audioNotice: 音频由 AI 生成，欢迎反馈内容问题。
draft: false
tags: []
description: "从AI协助生成的SQLite实验，到Agent课程的验证责任和团队共享看板。"
plainSummary: "实现的快路径、仓库的可验证性和人的共同理解，都需要落到具体工作对象上。"
---

本期窗口为2026年11月8日12:00至11月9日12:00（日本时间）。新访谈和会议回顾保留历史背景；作者实验不等于独立复现。

## 本期重点

- [SQLite小实验：改变解析路径，比比较语言名字更有解释力](#radar-sqlite-parse-number)
- [CS146S新访谈：从编写Harness，推进到可验证仓库与代码审查](#radar-cs146s-engineering)
- [Notion共享看板：让人保留对多Agent工作的理解](#radar-thesis-shared-understanding)

## 能力与证据

### SQLite解析实验：四种具体实现，不是C与Rust的通用排名

<a id="radar-sqlite-parse-number"></a>

- 来源：Simon Willison
- 来源渠道：博客、GitHub
- 证据性质：作者实测
- 原始日期：2026-11-08
- 链接：https://simonwillison.net/2026/Nov/8/sqlite-parse-number-c-vs-rust/
- 摘要：Willison让Claude Opus 5.5生成同一`parse_number()` SQLite扩展的四种实现及实验报告。函数按约定清除逗号、美元符号、英镑符号和百分号，例如`12.5%`得到12.5而非0.125；这不是通用金融数据规范化器。普通C版把小数交给`strtod()`，混合数据净耗时约67纳秒/行，两个Rust封装约41—46纳秒；C版加入有条件的十进制快路径后，同组数据降至约19纳秒。报告在双vCPU Linux虚拟机上处理200万行，取15次中最快值并减去基线扫描；还报告累计800万次模糊对照检查无不匹配。生成的代码、实验和结论都来自作者组织的AI辅助过程，没有独立复现。这里比较的是特定解析器、封装与分配开销；C仍承担手工缓冲区、溢出和`strtod()`区域设置等处理，不能把结果泛化为语言优劣。

<!-- radar-visual:sqlite-parser-paths -->
[![原创解释图：相同解析规则分别交给四种实现，再经test.py和fuzz.py检查](/images/radar/2026-11-09-sqlite-parser-paths.webp)](/images/radar/2026-11-09-sqlite-parser-paths.webp)

*原创解释示意：顶部两例先确定parse_number的约定，四个目录代表可替换的实现，底部表示测试与模糊对照。百分号只被移除，12.5%仍是12.5；图中没有性能排名，也不是独立复现实验。 图片来源：[GoodGoodStudyDayDayAI（基于Simon Willison公开实验 / 公開実験に基づく）](https://simonwillison.net/2026/Nov/8/sqlite-parse-number-c-vs-rust/)。点击图片查看原尺寸。*
<!-- /radar-visual:sqlite-parser-paths -->

## 构建与运行

### CS146S访谈：先理解Agent内部，再让代码库可验证

<a id="radar-cs146s-engineering"></a>

- 来源：Latent.Space
- 来源渠道：博客、播客
- 证据性质：观点推演
- 原始日期：2026-11-08
- 链接：https://latent.space/p/cs146s/
- 摘要：Mihail Eric在新访谈中介绍CS146S的第二轮教学，课程首次开设于2025年秋季，不是本期才出现的课程。15分15秒至18分31秒的讨论，从自建编码Agent的Harness内部，依次谈到上下文工程、工具设计、技能与配置，再进入Agent可用的代码库、代码审查和安全。所谓Agent-ready不只是放一份指令文件，还包括清楚的服务边界、文档和可验证的结果；代码生成变快后，审查可能成为新的瓶颈，因此可验证性也要进入审查流程。随后课程扩展到由CI/CD或事件触发的后台Agent与团队基础设施。讲者明确说部分方法仍在探索，不能把课程大纲当作已经验证的行业标准，也没有学生学习成效或通用生产率的对照结论。

## 产品与真实采用

### Thesis会议回顾：共享Agent任务，保留人的共同理解

<a id="radar-thesis-shared-understanding"></a>

- 来源：Every
- 来源渠道：Newsletter
- 证据性质：观点推演
- 原始日期：2026-11-08
- 链接：https://every.to/context-window/what-you-may-have-missed-at-thesis-2027
- 摘要：Every对11月5日Thesis: 2027会议的回顾，记录了Notion负责人Ivan Zhao关于不要放弃理解的提醒：工程师各自通过编码Agent改动项目，可能让负责代码的人逐渐失去整体认识；Notion团队把Agent工作放入共享看板，让人能看到彼此在做什么。这里关注团队的共同可见性，与单个Bot独占更新任务板的状态管理是不同层面。回顾还提到Mike Taylor把每次人工纠偏改写为可在新模型上重跑的是非检查。前者让任务与责任可见，后者让判断积累为回归依据；二者都不能替代审查代码和实际结果。文章由活动主办方撰写，包含讲者经验与演示，不是看板或评测方法提升团队效率的独立实验。
