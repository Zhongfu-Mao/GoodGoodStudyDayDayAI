---
title: "AI 雷达日报：2026-05-25"
date: 2026-05-25
category: radar
cadence: daily
plainSummary: "今天的信号集中在三个层面：Deep Research 和向量索引把 agent 与检索系统推向更工程化的架构；AlphaProof Nexus 与 Mythos 显示 AI 正进入可验证数学和安全漏洞发现；Bumblebee、ONNX 与公开结果仓库说明开发者工具正在把 AI 风险、评测和研究流程落到可运行系统。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agent
  - Evaluation
  - Infrastructure
lang: zh
coverImage: /images/radar/daily-ai-radar-2026-05-25-infographic.webp
audioUrl: /audio/radar/daily-ai-radar-2026-05-25.mp3
audioDuration: 934
audioSize: 7472464
draft: false
---

## 本期范围

- 覆盖时间：2026-05-24 至 2026-05-25，并补充本周仍有参考价值的公开工程与产业信号。

## 1. AI Engineering & 架构

### Onyx 的 Deep Research 经验显示，强 agent 架构不一定要给协调器更多工具

- 来源：Onyx / Daily Dose of Data Science
- 日期：2026-05-25
- 链接：https://onyx.app/blog/building-the-best-deep-research
- 摘要：Daily Dose of DS 将 Onyx Deep Research 的架构作为当天主线：排名靠前的研究 agent 并不是让 orchestrator 自己搜索网页，而是限制它只做任务拆解，随后把自包含 brief 派给研究 agent。Onyx 官方复盘也强调，agent 的关键不是“多给工具”，而是让 prompt、上下文和任务边界足够清晰。这给 AI engineering 的启发很直接：长链路研究系统的核心设计点，是减少协调器抢答、限制层级传话损耗，并把引用整理、合并和最终汇总交给确定性步骤。

### CockroachDB 的 C-SPANN 把向量索引做成分布式 SQL 里的普通表数据

- 来源：Cockroach Labs / ByteByteGo
- 日期：2026-05-25
- 链接：https://www.cockroachlabs.com/blog/cspann-real-time-indexing-billions-vectors
- 摘要：ByteByteGo 复盘了 CockroachDB 如何在分布式 SQL 中做实时向量索引；核心公开设计来自 Cockroach Labs 的 C-SPANN。它没有把向量索引作为单独内存服务，而是把 partition、centroid 和向量数据存成普通 key-value rows，继承数据库已有的 range split、rebalance、replication、multi-region 和事务一致性能力。对 RAG、agent memory 和多租户语义检索来说，这个案例说明索引算法本身只是开始，真正难点是更新、分片、热区、权限和数据本地性如何进入原有数据库系统。

## 2. 模型前沿 & 算法探索

### AlphaProof Nexus 用 Lean 反馈解开 9 个 Erdős 问题，把数学 agent 推向可验证证明搜索

- 来源：Google / DeepMind / arXiv
- 日期：2026-05-21
- 链接：https://arxiv.org/abs/2605.22763
- 摘要：The Rundown AI 将 Google DeepMind 的 AlphaProof Nexus 放在头条；公开论文显示，这套 agentic formal proof search 框架用 Gemini 生成 Lean 证明，再用编译器反馈迭代，解决了 9 个开放 Erdős 问题和 44 个 OEIS 猜想。值得关注的不是“模型会做数学题”这句泛化判断，而是 Lean 把结果变成可机器检查的证明对象。数学研究 agent 的评估标准因此更接近可验证产物，而不是自然语言推理看起来是否可信。

### Daily Dose of DS 用 ONNX 解释模型可移植性，训练框架和生产运行时正在进一步解耦

- 来源：Daily Dose of Data Science
- 日期：2026-05-25
- 链接：https://www.dailydoseofds.com/mlops-crash-course-part-10/
- 摘要：Daily Dose of DS 在当天邮件中把 ONNX 作为 production ML 的桥接层：训练可能发生在 PyTorch 或 TensorFlow，部署却可能在 C++ 服务、移动端、GPU runtime 或 CPU-only 环境里。ONNX 把模型保存成框架无关的计算图、标准算子、显式 tensor shape、metadata 和权重，再由 ONNX Runtime 做图优化和后端执行。它提醒我们，AI 系统进入生产后，模型文件格式、算子覆盖、数值漂移、custom ops 和硬件执行后端会和模型质量同样重要。

## 3. 实战代码 & 工具库

### Project Glasswing 的初步结果把 AI 安全能力从发现漏洞推向验证、披露和修复流程

- 来源：Anthropic / The Rundown AI
- 日期：2026-05-22
- 链接：https://www.anthropic.com/research/glasswing-initial-update
- 摘要：The Rundown AI 关注 Claude Mythos 在 Project Glasswing 中发现大量高危或严重漏洞；Anthropic 的公开更新把重点放在新的瓶颈上：AI 已经能更快发现问题，但行业需要更快验证、披露和修复。文章还给出开放源码项目扫描、独立 triage 和伙伴防御实践。对工程团队来说，重点不是把安全发现完全交给模型，而是建立可审计的 triage、补丁优先级、误报处理和负责任披露流程。

### Perplexity 开源 Bumblebee，用只读扫描处理开发者机器上的供应链暴露面

- 来源：GitHub / Perplexity
- 日期：2026-05-23
- 链接：https://github.com/perplexityai/bumblebee
- 摘要：Perplexity 开源 Bumblebee，一个面向 macOS 和 Linux 开发者端点的只读扫描器。它检查语言包管理器、AI agent 配置、编辑器扩展和浏览器扩展中的已知风险，但不运行安装脚本、package manager、源码或网络监控。这个设计非常贴近 AI 开发现实：供应链响应不只需要 SBOM，也需要知道开发者本机上的 lockfile、manifest、扩展和 agent 配置是否暴露在已知事件中。

### ONNX Runtime 把模型部署变成图优化、后端切分与执行提供器选择问题

- 来源：Daily Dose of Data Science
- 日期：2026-05-25
- 链接：https://onnxruntime.ai/
- 摘要：ONNX 本身是中间表示，真正落地时还需要运行时把图执行起来。ONNX Runtime 会加载 ONNX graph，做图级优化，并按硬件后端切分执行。邮件中特别提醒，ONNX 并不是魔法：部分框架算子无法完美映射，execution provider 覆盖随硬件变化，混合精度可能带来数值漂移，custom ops 需要额外工程。对 AI 产品来说，“可导出”不等于“可上线”，上线前仍要做性能、精度和兼容性验证。

## 4. 行业与商业快讯

### Starbucks 终止 AI 库存计数工具，说明视觉自动化必须先过门店执行可靠性这一关

- 来源：Restaurant News / Reuters
- 日期：2026-05-21
- 链接：https://www.nrn.com/quick-service/starbucks-is-ending-its-use-of-ai-to-count-inventory
- 摘要：Starbucks 停止使用一套用于北美门店库存计数的 AI 工具，公开报道指出问题集中在误计数、误标识和前线员工仍需手动复核。这个案例对 AI 落地很有警示意义：企业系统不能只看 demo accuracy，也要看真实 SKU 相似度、货架遮挡、流程异常、员工信任和错误修正成本。AI 自动化如果让一线流程更复杂，节省的时间很快会被复核和返工吃掉。

### McKinsey 的收费结构调整显示，AI 正在压缩按小时计费的咨询逻辑

- 来源：Times of India / Financial Times
- 日期：2026-05-16
- 链接：https://timesofindia.indiatimes.com/technology/tech-news/mckinsey-is-rethinking-its-pay-structure-because-clients-are-no-longer-paying-for-hours-but/articleshow/131131220.cms
- 摘要：围绕 McKinsey 调整合伙人薪酬和客户收费结构的报道指出，咨询行业正在从按小时投入转向更强调结果和产出的定价。AI 提高分析、文档和运营交付效率后，客户更难接受单纯按人天计费。这个信号不只属于咨询业：所有知识服务都要回答同一个问题，即当模型降低执行成本后，组织如何定义成果、归因价值，并设计新的激励和商业模式。

## 5. GitHub 热门 repo & 趋势追踪

### onnx/onnx：模型交换格式继续承担训练框架与运行时之间的契约层

- 来源：GitHub / ONNX
- 日期：2026-05-25
- 链接：https://github.com/onnx/onnx
- 摘要：Daily Dose of DS 当天把 ONNX 放回生产模型部署的中心。ONNX 仓库本身值得进入第五象限，是因为它定义的中间表示仍然是训练框架、模型交换、优化器和推理运行时之间的关键契约。随着模型部署端点变多，团队要追踪的不只是模型权重，还包括算子集、shape、metadata、版本兼容和执行后端能否稳定解释同一个 graph。

### google-deepmind/alphaproof-nexus-results：形式证明 agent 需要公开、可检查的结果仓库

- 来源：GitHub / arXiv
- 日期：2026-05-21
- 链接：https://github.com/google-deepmind/alphaproof-nexus-results
- 摘要：AlphaProof Nexus 的结果仓库让论文里的 formal proof search 更容易被复查和复现。对 AI research 来说，这是一个重要工程信号：如果 agent 产出的是证明、代码、实验或安全报告，那么结果不应只存在于论文描述或新闻稿里，而应该有可以检查的 artifact、脚本、数据和版本记录。第五象限记录它，是为了追踪“AI 做研究”如何从演示走向可验证交付。

## 📬 Newsletter 精选

### ByteByteGo：How CockroachDB Built Vector Indexing at Scale

- 来源：ByteByteGo
- 日期：2026-05-25
- 链接：https://blog.bytebytego.com/p/how-cockroachdb-built-vector-indexing
- 摘要：这封邮件以 CockroachDB 的向量索引为例，解释为什么向量搜索进入分布式事务数据库时，问题会从 ANN 算法扩展到 sharding、hot spots、incremental updates、quantization、multi-tenancy 和区域数据本地性。它补充了今天工程栏目的系统设计背景。

### The Rundown AI：Google cracks decades-old math problems

- 来源：The Rundown AI
- 日期：2026-05-25
- 链接：https://www.therundown.ai/
- 摘要：The Rundown AI 将 Google DeepMind 的 AlphaProof Nexus 放在当天头条，并把它和 OpenAI 近期数学突破放在一起比较。邮件里值得保留的信号是：数学 agent 的评价正在从“模型回答像不像证明”转向“能否生成可由 Lean 这类系统检查的证明”。
