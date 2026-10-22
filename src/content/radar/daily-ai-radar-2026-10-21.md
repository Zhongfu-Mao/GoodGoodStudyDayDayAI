---
title: "AI 雷达日报：2026-10-21"
date: 2026-10-21
category: radar
cadence: daily
radarFormat: 2
lang: zh
coverImage: /images/radar/daily-ai-radar-2026-10-21-infographic.webp
draft: true
tags: []
plainSummary: "评估模型先调阈值，概率分数仍要校准与验证。 跨进程恢复与副作用幂等必须分别设计。 共享智能体把多人上下文和权限变成运行时问题。"
---

整理2026-10-20 12:00至2026-10-21 12:00（日本时间）窗口的8条内容。区分原始日期、发布方宣称、作者实测和观点；日期未确认的实现仅作当前观察。

## 三条关键变化

- [评估模型先调阈值，概率分数仍要校准与验证。](#radar-decision-model-evals)
- [跨进程恢复与副作用幂等必须分别设计。](#radar-next-step-after)
- [共享智能体把多人上下文和权限变成运行时问题。](#radar-replaced-personal-agents)

## 能力与证据

### 决策模型做自动评估：阈值、成本与校准须按任务实测

<a id="radar-decision-model-evals"></a>

- 来源：Hamel Husain
- 来源渠道：博客
- 证据性质：作者实测
- 原始日期：2026-10-20
- 链接：https://hamel.dev/blog/posts/decision-model-evals/
- 摘要：作者用公寓租赁智能体的98条生产轨迹评测六种决策模型，任务仅是识别轨迹中的实质失败。默认0.50阈值并非普遍最优；在同一小样本上调优后，OpenAI Decisions的F1最高但成本也较高，Perplexity更便宜。Platt校准只改善部分模型，不能据此推断其他任务、吞吐量或长尾延迟。

### FairStress揭示LLM决策公平性中的隐藏不对称

<a id="radar-allenai-fairstress"></a>

- 来源：Hugging Face / Ai2
- 来源渠道：博客
- 证据性质：作者研究
- 原始日期：2026-10-20
- 链接：https://huggingface.co/blog/allenai/fairstress
- 摘要：Ai2发布FairStress：300个双候选场景覆盖29个领域，经身份表达和对抗性前缀扩展为逾1300万测试例。在15个模型的共同领域中，模型放弃正确选择的平均差距在隐含身份和显式标签下分别为6.9与9.3个百分点。该结果采用“对称平等”定义；内部激活分析仅覆盖两个模型，不能代表全部公平观或模型。

<!-- radar-visual:fairstress -->
[![FairStress比较15个模型在不同身份表达和压力条件下的平均差距](/images/radar/daily-ai-radar-2026-10-21-fairstress.webp)](/images/radar/daily-ai-radar-2026-10-21-fairstress.webp)

*横轴从匿名变为显式身份；粉线是压力下放弃较优候选人的差距，比只看无压力选择的深绿线更大。纵轴用百分点，零线对应作者的对称公平定义，不代表所有公平标准。 图片来源：[Ai2 / FairStress](https://huggingface.co/blog/allenai/fairstress)。点击图片查看原尺寸。*
<!-- /radar-visual:fairstress -->

## 构建与运行

### ALTK-Evolve用轨迹准则改善τ²-bench智能体

<a id="radar-altk-evolve-bc"></a>

- 来源：Hugging Face / IBM Research
- 来源渠道：博客
- 证据性质：作者研究
- 原始日期：2026-10-20
- 链接：https://huggingface.co/blog/ibm-research/altk-evolve-bc
- 摘要：IBM研究团队让ALTK-Evolve从训练任务轨迹提炼行为准则，再追加到智能体系统提示词，无需更新模型权重。在τ²-bench零售完整base split的榜单快照中，GPT-4.1智能体取得67.5% Pass^4榜单首位；这里Pass^4是四次尝试均成功的任务比例，不是留出测试集成绩，也不代表真实客服的普遍效果。航空领域的最佳准则规模不同，额外成本主要来自更长的输入提示。

<!-- radar-visual:altk-cost -->
[![ALTK-Evolve按零售和航空比较不同准则配置的每次对话成本](/images/radar/daily-ai-radar-2026-10-21-altk-cost.webp)](/images/radar/daily-ai-radar-2026-10-21-altk-cost.webp)

*左右面板分别是零售与航空，灰柱为不附加准则的基线；蓝柱的Lossless表示保留全部学习准则，成本随更长输入上升。这里是GPT-4.1、完整base split和四次试验的作者配置，不是生产成本保证，也不是压缩算法的“无损”。 图片来源：[IBM Research / ALTK-Evolve](https://huggingface.co/blog/ibm-research/altk-evolve-bc)。点击图片查看原尺寸。*
<!-- /radar-visual:altk-cost -->

### 长时间审批后恢复同一调用，用幂等记录约束重复副作用

<a id="radar-next-step-after"></a>

- 来源：Daily Dose of Data Science
- 来源渠道：Newsletter
- 证据性质：作者实测
- 原始日期：2026-10-20
- 链接：https://blog.dailydoseofds.com/p/the-next-step-after-karpathys-agentic
- 摘要：Daily Dose与Google Cloud的合作演示，用ADK持久化会话、调用、检索证据和审批请求，让新进程恢复原有调用，而非重新检索和起草。发布工具按答案与引用生成幂等键，重复审批返回已有结果。演示先用SQLite，再改用Agent Runtime会话服务；本地outbox只是模拟，生产仍须把幂等记录接入数据库或实际副作用API，检索分数阈值也不能保证没有幻觉。

## 产品与真实采用

### 持续追踪｜Every将个人智能体改造成全公司共享智能体

<a id="radar-replaced-personal-agents"></a>

- 来源：Every
- 来源渠道：Newsletter
- 证据性质：作者实测
- 原始日期：2026-10-20
- 链接：https://every.to/source-code/why-we-replaced-personal-agents-with-one-for-the-whole-company
- 摘要：Every团队复盘从个人智能体Plus One转向共享Every Agent的工程过程：用Slack翻译层维持多人线程上下文，以可替换的连接插槽避免账号离职后任务中断，并把所有权、权限和同意校验写入服务端代码。文章也承认共享技能曾因默认私有而误锁、主动发言边界仍未解决；这是开发团队的一手经验，不是跨组织效果研究。

<!-- radar-visual:every-slots -->
[![Every连接槽示意图把排期任务、稳定槽位和可更换登录分开](/images/radar/daily-ai-radar-2026-10-21-every-slots.webp)](/images/radar/daily-ai-radar-2026-10-21-every-slots.webp)

*排期任务指向稳定连接槽，替换登录只有匹配同一工作区和访问规则时才能接入；右侧错误工作区被拒绝。图是原文简化的连接槽设计，登录可更换不等于权限可任意继承。 图片来源：[Every / connection-slot design](https://every.to/source-code/why-we-replaced-personal-agents-with-one-for-the-whole-company)。点击图片查看原尺寸。*
<!-- /radar-visual:every-slots -->

### Terminal X称评估智能体与资深投资人判断一致率达88.6%

<a id="radar-terminal-x"></a>

- 来源：OpenAI / Terminal X
- 来源渠道：官方
- 证据性质：官方宣称
- 原始日期：2026-10-20
- 链接：https://openai.com/index/terminal-x
- 摘要：OpenAI案例称，Terminal X把机构投资流程编码为可审计的智能体与版本化Memory，并用54项规则评估输出。在500个已评分判断中，搭载GPT-6.1 Sol的Eval Agent与资深人工评审一致率为88.6%。该数字只衡量这批质量审查判断的一致性，不是投资回报、收益率或客户服务效果；相关节省和使用规模也均为厂商披露。

### 三家餐厅加盟店用ChatGPT Work缩短后台作业

<a id="radar-ted-taylor-restaurant"></a>

- 来源：OpenAI
- 来源渠道：官方
- 证据性质：官方宣称
- 原始日期：2026-10-20
- 链接：https://openai.com/index/ted-taylor-restaurant
- 摘要：OpenAI案例介绍一名经营三家联名餐厅的加盟商：月度现金对账由3小时缩至5至10分钟，约减少94%；每个工资周期另减少4小时人工汇总，这两项不是同一指标。ChatGPT Work还辅助定价、政策草拟和维修申请。排班可能降低销售额1至2个百分点的人工成本及相关现金流提升，均是经营者估算，并非已实现或审计结果。

## 产业与治理

### SF Compute谈GPU算力市场的物理交割与异质性

<a id="radar-sfcompute2"></a>

- 来源：Latent.Space
- 来源渠道：播客、Newsletter
- 证据性质：观点推演
- 原始日期：2026-10-20
- 链接：https://www.latent.space/p/sfcompute2
- 摘要：Latent Space采访中，SF Compute CEO主张GPU合约需以可用算力的物理交割为基础，因为中断容忍度、存储恢复、网络、芯片代际和硬件批次会改变价值，单一现金指数可能产生基差风险。公司称目前仅约5%总产能进入订单簿、成交量为数亿美元，并支持动态切分InfiniBand网络。这些市场规模和中立性说法来自受访者，未独立审计。
