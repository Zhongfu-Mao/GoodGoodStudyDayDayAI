---
title: "AI 雷达日报：2026-05-04"
date: 2026-05-04
category: radar
cadence: daily
plainSummary: "今天的 AI 雷达聚焦 RL 与 agent 行为建模、AI 评测成本、Codex 型知识工作入口、agent-native 产品管理、以及 AI compute 从订阅补贴转向用量计费的趋势。"
difficulty: intermediate
tags:
  - Agent
  - Evaluation
  - AI Engineering
  - AI Economics
lang: zh
coverImage: "/images/radar/daily-ai-radar-2026-05-04-infographic.webp"
audioUrl: "/audio/radar/daily-ai-radar-2026-05-04.mp3"
audioDuration: 1339
audioSize: 10716663
draft: false
---

## 本期范围

- 覆盖时间：2026-05-01 至 2026-05-04。

---
![AI evals are becoming the new compute bottleneck](https://cdn-uploads.huggingface.co/production/uploads/6413251362e6057cbb6259bd/ukJJW86oJu36zOJwqZJBG.png)

*代表图来自 [AI evals are becoming the new compute bottleneck](https://huggingface.co/blog/evaleval/eval-costs-bottleneck)。它对应这期日报里最能概括当天主线的一条原始信号。*

## 封面图说明

今天的封面图适合画成一张“Agent 经济账本”：左侧是 RL/MDP、value function 与 reward design，代表模型行为如何被塑造；中间是 eval pipeline、agent rollout、技能、脚本和知识工作桌面，代表工程化落地；右侧是用量计费、compute fraud、低价开放模型和实时医疗数据，代表 AI 正在进入更真实的成本与监管环境。

## 1. AI Engineering & 架构

### AI 评测正在从便宜附属项变成新的 compute 瓶颈

- 来源：Hugging Face / EvalEval Coalition
- 日期：2026-04-29（略超时窗）
- 链接：https://huggingface.co/blog/evaleval/eval-costs-bottleneck
- 摘要：文章把静态 benchmark、agent benchmark 与 training-in-the-loop benchmark 的成本摊开比较，指出 HAL 一轮 agent 评测约 4 万美元，单次 GAIA frontier run 可到 2829 美元，PaperBench 完整协议约 9500 美元。更关键的是，可靠性评估需要多次重复运行，k=8 的 HAL 式评测会把成本推到约 32 万美元，评测本身开始成为外部审计、学术复现和排行榜可信度的瓶颈。

### Codex 类桌面 Agent 正在从 IDE 延伸为知识工作操作系统

- 来源：Every
- 日期：2026-05-03
- 链接：https://every.to/context-window/one-app-to-rule-all-knowledge-work
- 摘要：Every 记录了 Austin Tedesco 将约 80% 日常工作迁移到 Codex 桌面应用中的实践，覆盖邮件梳理、GTM 计划、KPI 跟踪和招聘。文章的关键信号不是“写代码更快”，而是桌面 Agent 正在形成统一模式：项目侧栏、文件上下文、插件连接、企业知识和最终在目标应用中复核的工作流。

### 增量确定性把 Agent 成本控制拆成 skills、evals 与 scripts 三层

- 来源：Every
- 日期：2026-05-03
- 链接：https://every.to/also-true-for-humans/you-are-the-most-expensive-model
- 摘要：Mike Taylor 提出的 incremental determinism 把重复工作从对话 session 固化为 skill，再用 eval 验证质量，最后把确定性部分下沉为 script、CLI 或 MCP。这个框架的价值在于把“是否用最强模型”改写为工程决策：哪些步骤需要 frontier model，哪些可以交给便宜模型、subagent、DSPy 优化或纯代码。

## 2. 模型前沿 & 算法探索

### MDP 与 value function 仍是理解 RLHF、GRPO 与 Agent 行为的底层语言

- 来源：Daily Dose of Data Science
- 日期：2026-05-03
- 链接：https://blog.dailydoseofds.com/p/markov-decision-processes-and-value
- 摘要：Daily Dose 的 RL 系列第二部分从 Markov property、MDP 五元组、discounted return、reward hypothesis、policy 与 state-value function 讲起，并配套 4×4 gridworld 的 Monte Carlo policy evaluation 实现。它的现实意义在于把 RLHF、GRPO、constitutional AI 与工具型 Agent 放回同一个“状态、动作、奖励、策略”的框架中理解。

### DeepSeek V4 用极低输入价把 Agent 运行成本压到新的量级

- 来源：老范讲故事
- 日期：2026-05-01
- 链接：https://lukefan.com/2026/05/01/deepseek-v4-price-cuts-disrupt-ai-agent-economics/
- 摘要：文章梳理了 DeepSeek V4 Flash 与 Pro 的价格变化：Flash 输入约 1 元 / 百万 tokens，cache hit 可低至 0.02 元 / 百万；Pro 输入约 3 元 / 百万，cache hit 约 0.025 元 / 百万，促销期还给出 2.5 折。作者用 Claude Code 类 harness 实测建站任务，总成本约 0.8 元，并强调缓存命中率会直接改变长程 coding agent 的商业模型。

## 3. 实战代码 & 工具库

### Agent-native 产品管理把 strategy、issue 与 product pulse 变成可运行流程

- 来源：Every
- 日期：2026-05-03
- 链接：https://every.to/guides/ai-product-management-guide
- 摘要：Every 的 agent-native PM 指南把产品经理的工作拆成 plan、ship、review 循环，并给出 `/ce-strategy` 与 `/ce:product-pulse` 两个可执行命令。前者通过访谈生成 `docs/strategy.md`，后者读取指标、日志、反馈与支持信息，定期生成 `~/pulse-reports/`，把产品判断沉淀为 Agent 可持续引用的产品记忆。

### Codex Knowledge Work Camp 把并行研究、摘要和小工具自动化打包成可复用范式

- 来源：Every
- 日期：2026-05-03
- 链接：https://every.to/context-window/codex-goes-to-work
- 摘要：Every 的周末合集总结了 Codex Knowledge Work Camp 中的工作流：用 Codex 起草、研究、总结、并行跑任务，并让 Agent 为重复知识工作生成小工具。值得注意的是，它把“最后复核在目标应用完成”作为稳定原则，避免 Agent 产物只停留在聊天窗口里。

## 4. 行业与商业快讯

### AI compute 的订阅补贴正在转向更直接的用量计费

- 来源：Every
- 日期：2026-05-03
- 链接：https://every.to/context-window/compute-is-the-new-cash
- 摘要：Every 从 Stripe 的 agent-native commerce 讨论切入，指出 AI 公司面对的欺诈已经从支付卡扩展到 token、试用额度和 unpaid compute。文章同时提到 GitHub Copilot 将引入与 token 消耗挂钩的账单预览，Anthropic Enterprise 也从按席位转向按用量计费，说明 autonomous agent 的成本结构正在压迫旧的订阅定价。

### FDA 实时接入肿瘤药试验数据，医疗审批开始具备软件式反馈回路

- 来源：Every
- 日期：2026-05-03
- 链接：https://every.to/context-window/codex-goes-to-work
- 摘要：Every 汇总称，FDA 正在让 AstraZeneca 与 Amgen 的两项肿瘤药试验实时向监管方流式传输数据，机构 AI 负责人预计可能将从实验室到药房的周期缩短 20% 到 40%。这不是单纯的医疗新闻，而是一个重要行业信号：AI 与实时数据管道正在把原本阶段化、批处理式的监管流程改造成更接近软件反馈循环的系统。

## 📬 Newsletter 精选

### Every 周末合集把知识工作、产品管理和 AI 成本控制串成同一条主线

- 来源：Every Newsletter
- 日期：2026-05-03
- 链接：https://every.to/context-window/codex-goes-to-work
- 摘要：这期合集同时收录 agent-native 产品管理、incremental determinism、Codex 知识工作营、agent commerce 与 FDA 实时数据等主题。它的价值在于呈现同一个趋势：Agent 不再只是模型能力展示，而是在产品流程、成本控制、桌面工作入口和监管流程里形成新的操作系统层。

### Daily Dose 的 RL 系列把后训练与工具型 Agent 拉回可实现的数学框架

- 来源：Daily Dose of Data Science Newsletter
- 日期：2026-05-03
- 链接：https://blog.dailydoseofds.com/p/markov-decision-processes-and-value
- 摘要：这封 newsletter 推出了 RL nanodegree 第二部分，并明确把 RLHF、DeepSeek-R1 的 GRPO、Claude 的 constitutional AI 与 agentic systems 放在同一条演化线上。对于工程读者，重点不是补概念名词，而是理解 reward、policy、value function 如何影响可行动系统的行为边界。

