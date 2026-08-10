---
title: "AI 雷达日报：2026-08-10"
date: 2026-08-10
category: radar
cadence: daily
plainSummary: "今天的主线：AI 工程进入可测量、可复现的纵深期——从推理服务训练路线、法律 agent 基准到气象模型开放，团队开始把能力、风险与运行成本放进同一条证据链。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agents
  - Evaluation
  - Models
  - GitHub
lang: zh
coverImage: /images/radar/daily-ai-radar-2026-08-10-infographic.webp
representativeImageSource: https://github.com/harveyai/harvey-labs
audioUrl: /audio/radar/daily-ai-radar-2026-08-10.mp3
audioDuration: 874
audioSize: 6992229
draft: false
---

覆盖时间窗口：2026-08-09 至 2026-08-10（JST）。周末后的新增信号不算密集，但方向非常集中：模型与 agent 不再只比单次回答，而是比部署、观测、评测、恢复和领域约束。今天同时关注生产级推理路线、网络安全防护、法律与天气等垂直评测，以及把代理能力封装为可审查资产的开源项目。

---
![Harvey Legal Agent Benchmark 的任务、文档、评分与对比流程](https://github.com/harveyai/harvey-labs/raw/main/docs/assets/lab-hero.png)

*代表图来自 [Harvey LAB](https://github.com/harveyai/harvey-labs)，展示法律 agent 从任务与文档输入到评分、报告和模型对比的评测流程。*

## 1. AI Engineering & 架构

### 10 周生产级 LLM 路线图：先建立 roofline 心智模型，再优化 serving

- 来源：Daily Dose of Data Science
- 日期：2026-08-10
- 链接：https://github.com/patchy631/time-to-first-token
- 摘要：这份 50 个 session 的路线图把 vLLM、SGLang、PagedAttention、连续批处理、量化、推测解码、KV cache、prefill/decode 解耦、Kubernetes 与成本路由串成一项可复现工程。核心顺序是先理解 decode 的内存带宽瓶颈，再建立 TTFT、inter-token latency、吞吐、队列深度和单位请求成本观测，最后才调优化旋钮。它适合作为团队训练骨架，但 1000 并发与 H100 实验仍需按预算和真实流量裁剪。

### Plan-and-Act 需要动态重规划：静态计划可能比没有 planner 更差

- 来源：Daily Dose of Data Science · arXiv
- 日期：2026-08-10
- 链接：https://arxiv.org/abs/2503.09572
- 摘要：Plan-and-Act 将高层计划与页面动作执行分开，并在 WebArena-Lite 上展示了计划质量的决定性影响：朴素微调 planner 的成绩低于无 planner 基线，而每步重规划能在失败后替换不可行步骤。工程含义不是“加一个 planner 就更好”，而是计划粒度、显式参数、上下文修剪和重规划触发条件都必须进入评测；否则 agent 只会更坚定地执行错误路径。

## 2. 模型前沿 & 算法探索

### WeatherNext 2 开放代码与权重：同一仓库覆盖全球中期天气和气旋预报

- 来源：Google DeepMind
- 日期：2026-08-10
- 链接：https://github.com/google-deepmind/weathernext
- 摘要：WeatherNext 仓库公开 WN2、WeatherNext Cyclones 以及 GraphCast、GenCast 的代码与文档，并提供 0.25° 预训练模型、轻量 Mini 版本、Colab 和多平台日常预报数据。完整模型更适合 TPU 或 H100，Mini 可在较低资源环境测试。它显著降低复现实验门槛，但官方明确提醒这仍是研究代码，不能替代气象机构的警报与公告。

### Harvey LAB 用 1,671 个任务评测法律 agent，而不是只测问答准确率

- 来源：Harvey AI
- 日期：2026-08-10
- 链接：https://github.com/harveyai/harvey-labs
- 摘要：Harvey Legal Agent Benchmark 将真实法律工作拆成指令、文档、rubric 和执行 harness，覆盖 24 个以上法律实践领域与合同任务。项目提供从 M&A data room 任务运行、评分到对比 dashboard 的完整教程，并公开 all-pass rubric 与 LLM judge 方法。它把领域评测推进到“能否完成整项工作”，但法律判断、数据授权与最终责任仍须由专业人员承担。

## 3. 实战代码 & 工具库

### code-graph-rag：把代码仓库转成图结构，再让 agent 查询依赖与影响范围

- 来源：GitHub Trending / vitali87
- 日期：2026-08-10
- 链接：https://github.com/vitali87/code-graph-rag
- 摘要：code-graph-rag 将代码解析为实体与关系图，使 agent 可以围绕调用链、模块依赖和变更影响做结构化检索，而不是把整个仓库塞进上下文。图检索适合大型代码库的定位与审查，但解析覆盖、动态图行为、生成代码和索引新鲜度会决定结论是否完整；使用时应把图结果与编译、测试和真实运行证据交叉验证。

### witr：把本地进程、端口和资源状态变成 agent 可读取的运行现场

- 来源：GitHub Trending / pranshuparmar
- 日期：2026-08-10
- 链接：https://github.com/pranshuparmar/witr
- 摘要：witr 聚合本机进程、端口与资源信息，为排查“谁占用了端口、服务是否仍在运行、资源为何异常”提供统一入口。它不是模型项目，却补上 coding agent 最容易缺失的运行时可观测面。接入自动化前应限制命令权限、过滤敏感参数，并让停止进程等副作用继续经过明确确认。

## 4. 行业与商业快讯

### OpenAI 为 Astra 加强安全控制：尚不能排除达到 Critical cyber 能力

- 来源：Latent.Space / AINews · OpenAI
- 日期：2026-08-07
- 链接：https://openai.com/index/responding-next-frontier-critical-cyber-capabilities/
- 摘要：OpenAI 表示内部初步评测显示 Astra 在 agentic coding 与网络安全方面进展显著，暂不能排除其达到 Preparedness Framework 的 Critical 门槛。公司因此暂停未满足强化控制的内部活动，并增加隔离环境、网络与工具限制、权重保护、监控和第三方测试要求。这是风险分级直接改变研发流程的案例；当前结论仍是初步评估，不应被表述为已经确认具备完整零日攻击能力。

### Terafab 设想把逻辑、存储、封装与能源放进同一制造控制面

- 来源：老范讲故事
- 日期：2026-08-10
- 链接：https://lukefan.com/2026/08/10/elon-musk-terafab-space-computing-chip-factory/
- 摘要：文章分析马斯克阵营围绕 Texas “Terafab” 的垂直整合设想：将逻辑芯片、DRAM、先进封装、电力与工厂系统放进更紧密的供应链控制面，以应对 AI 算力扩张。它提醒市场，模型竞争越来越受制于能源、内存、封装和建设周期。文中的投资规模与路线仍属于媒体分析，应等待公司文件、供应商与监管材料进一步确认。

## 5. GitHub 热门 repo & 趋势追踪

### msitarzewski/agency-agents：把岗位说明、交付标准和工作流封装成可安装 agent

- 来源：GitHub Trending / msitarzewski
- 日期：2026-08-10
- 链接：https://github.com/msitarzewski/agency-agents
- 摘要：该仓库将不同专业角色的目标、流程与输出要求整理成可复用 agent 配置，强调专业分工而非一个通用提示词包打天下。它适合做角色契约和任务拆分的参考，但岗位名称不等于真实能力；团队仍需用自己的数据、工具权限与验收标准测试每个角色，并避免把未经审查的外部指令直接授予写入权限。

### ZhuLinsen/daily_stock_analysis：把行情、新闻与模型分析串成每日自动报告

- 来源：GitHub Trending / ZhuLinsen
- 日期：2026-08-10
- 链接：https://github.com/ZhuLinsen/daily_stock_analysis
- 摘要：项目用定时任务整合市场数据、新闻和 LLM 分析，生成面向个人研究的日度股票报告，展示了“抓取—解释—分发”的轻量 agent workflow。它的参考价值在于任务编排和可重复报告，不在预测收益；真实使用必须核查行情许可、时区、缺失数据、提示注入与回测偏差，任何输出都不能替代投资判断。

## 📬 Newsletter 精选

### 从 50 个 session 建成一个可公开复现的推理服务

- 来源：Daily Dose of Data Science
- 日期：2026-08-10
- 链接：https://blog.dailydoseofds.com/p/a-10-week-roadmap-to-run-llms-in
- 摘要：本期 Newsletter 将十周学习压缩为一个连续交付物：部署推理服务，建立 Grafana / Prometheus 指标，做 1000 以上并发负载测试，比较 FP16、FP8、INT4、推测解码和 KV eviction，再发布带固定版本与命令的 benchmark。最值得借鉴的是“每周都给同一资产加证据”，而不是收集互不相干的教程清单。

### AI 时代产品经理不会消失，但信息搬运与流程协调会先被 agent 接管

- 来源：老范讲故事
- 日期：2026-08-09
- 链接：https://lukefan.com/2026/08/09/ai-product-manager-role-transformation/
- 摘要：文章认为，agent 会优先自动化需求汇总、信息同步、文档整理和例行协调，而产品经理的价值将更集中在问题选择、约束设计、利益权衡和结果问责。这个判断适合用来重画岗位任务地图，但不能直接推导岗位数量；组织结构、行业责任、数据权限与客户沟通仍会决定自动化边界。
