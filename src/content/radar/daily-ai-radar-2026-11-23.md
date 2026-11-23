---
title: "AI 雷达日报：2026-11-23"
date: 2026-11-23
category: radar
cadence: daily
radarFormat: 2
lang: zh
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-11-23.mp3
audioDuration: 844
audioSize: 6756028
audioNotice: 音频由AI生成，欢迎反馈内容问题。
coverImage: /images/radar/daily-ai-radar-2026-11-23-infographic.webp
draft: false
tags: []
---

覆盖窗口：2026-11-22 12:00 至 2026-11-23 12:00（日本时间，起点不含、终点含）。

## 本期重点

- [RAG 的两道质量关：分别管理资料鲜度与答案支持度](#radar-rag-operations)
- [用作品校准写作技能：比较评审后仍需留出测试](#radar-writing-examples)
- [别把检测指标当裁决：AI 疑似率不等于违规证据](#radar-ai-metrics)

## 构建与运行

### RAG 课程更新：分别治理检索输入与答案输出

<a id="radar-rag-operations"></a>

- 来源：Daily Dose of Data Science · Avi Chawla
- 来源渠道：Newsletter、博客
- 证据性质：作者说明
- 原始日期：2026-11-23
- 链接：https://blog.dailydoseofds.com/p/moving-from-rag-apps-to-rag-systems-465
- 摘要：这期课程公告将生产 RAG 的责任拆成两层：输入侧管理文档修订、过期切块、嵌入空间与索引迁移；输出侧判断回答中的断言是否得到引用材料支持，再以校准阈值决定回答或弃答。索引升级还需要迁移门槛、别名与回滚路径，不能混用不兼容的向量。重要边界是：验证器即使确认回答忠于材料，也不能据此认定材料仍然最新。这是课程内容与工程方法的介绍，不是新的模型发布或独立性能评测；第20、21讲正文均发布于11月21日，本条11月23日指汇总公告日期。

<!-- radar-visual:rag-build-operate-risk -->
[![RAG 从检索生成，到评估迁移回滚，再到验证校准和弃答的三步职责图](<https://substack-post-media.s3.amazonaws.com/public/images/db726b6d-5b6b-4c93-85af-39a20ecddaeb_5504x2558.jpeg>)](<https://substack-post-media.s3.amazonaws.com/public/images/db726b6d-5b6b-4c93-85af-39a20ecddaeb_5504x2558.jpeg>)

*从左向右看，构建检索与生成只是起点；中间的运维层负责评估、迁移和回滚，右侧才是用验证、校准与弃答控制回答风险。箭头表示职责衔接，不表示前一层自动保证后一层正确，也不是性能测试结果。 图片来源：[Daily Dose of Data Science / Avi Chawla](https://blog.dailydoseofds.com/p/moving-from-rag-apps-to-rag-systems-465)。点击图片查看原尺寸。*
<!-- /radar-visual:rag-build-operate-risk -->

### Every：用作品样本与留出测试改进写作技能

<a id="radar-writing-examples"></a>

- 来源：Every / Grant Harvey / Mike Taylor
- 来源渠道：Newsletter、博客
- 证据性质：作者说明
- 原始日期：2026-11-22
- 链接：https://every.to/context-window/stop-telling-ai-how-you-write-show-it
- 摘要：Every 的周日汇编提炼了一套基于作品的写作评估流程：收集12至25篇近期、同一体裁的文章，先留出一部分作最终测试，再将其余作品还原为只含论点、事实和引文的简报。让写作模型据此生成候选稿，由评审模型对照原作做两稿比较，交换展示顺序后再评一次，以减轻顺序偏差；只保留能提高评分的技能修改，并在实际采用的写作模型上调优。留出测试用于检查是否只是迎合了训练样本或评审偏好，并不能消除这些风险。这里是作者经验与周报总结，不是独立盲测，也不意味着不同模型、体裁或作者都能获得同样收益。

### Select Styling Specimens：让 AI 生成可比较的界面样本

<a id="radar-select-specimens"></a>

- 来源：Simon Willison
- 来源渠道：博客
- 证据性质：作者实测
- 原始日期：2026-11-22
- 链接：https://simonwillison.net/2026/Nov/22/select-styling/
- 摘要：Simon 不满原生 HTML 下拉框在各浏览器的默认外观差异，于是让 Claude Fable 5.2 制作一个样式样本页，供逐项观察。他选出的 CSS 使用 `appearance: none` 去掉默认外观，再明确边框、间距、颜色，并以内嵌 SVG 绘制箭头；文章展示了 Chrome、Safari 和 Firefox 的改造前后截图。这个小例子的价值是把“帮我做得好看”变成可以并排比较的候选界面，最终选择仍由人作出。截图只说明所示环境下的外观，不证明移动端交互、键盘操作、无障碍或所有浏览器版本都已验证，也不是新的浏览器标准。

<!-- radar-visual:select-styled-after -->
[![指定 CSS 后三个浏览器的选择框均呈圆角浅灰边框和向下箭头](<https://static.simonwillison.net/static/2026/select-styled-firefox-safari-chrome.webp>)](<https://static.simonwillison.net/static/2026/select-styled-firefox-safari-chrome.webp>)

*再看改造后：统一指定外观和 SVG 箭头后，所示三个浏览器的选择框更为接近。这个前后对照只验证截图中的视觉关系，不能替代键盘、移动端及无障碍测试。 图片来源：[Simon Willison](https://simonwillison.net/2026/Nov/22/select-styling/)。点击图片查看原尺寸。*
<!-- /radar-visual:select-styled-after -->

## 产业与治理

### AI 疑似率与课堂抬头率：指标不应直接替代判断

<a id="radar-ai-metrics"></a>

- 来源：老范讲故事
- 来源渠道：博客
- 证据性质：观点推演
- 原始日期：2026-11-23
- 链接：https://lukefan.com/2026/11/23/ai-detection-classroom-monitoring-managerial-power/
- 摘要：这篇评论将论文 AI 疑似率检测与课堂抬头率监测放在同一个治理问题下讨论：当管理者把容易计量的代理指标当作目标，被评价者就可能优先优化分数，而不是研究、表达或学习本身。作者引用媒体报道和个案，质疑检测分数直接成为学术评价依据、以及把低头行为直接解释成注意力不足的做法。它提供的是对指标用途与激励机制的批评，不是检测器误报率的受控实验，也不能据此推定某个人是否使用 AI 或违规。对实际部署的启示是分清辅助线索与最终裁决，给人工复核、解释和申诉留下位置；这是治理建议，并非本文已经验证的解决效果。
