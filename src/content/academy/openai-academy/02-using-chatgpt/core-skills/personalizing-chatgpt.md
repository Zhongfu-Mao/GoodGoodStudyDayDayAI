---
title: "OpenAI Academy 笔记：Personalizing ChatGPT"
date: 2026-04-25
category: academy
description: "深度解析 Custom Instructions、Memory 与构建稳定、高效工作风格之间的核心逻辑。"
plainSummary: "本笔记将 OpenAI Academy 关于个性化设置的核心内容提炼为一套实操框架，旨在帮助用户减少重复指令，使 ChatGPT 真正理解其业务角色与交付标准。"
difficulty: beginner
coverImage: "https://images.ctfassets.net/kftzwdyauwt9/2s9rOdoSHProR3I6Ai5P5/8ca619f82211ade2d76316f04aa3fbcc/personalizing-chatgpt.png?w=3840&q=90&fm=webp"
tags:
  - "ChatGPT"
  - "Personalization"
lang: zh
academy:
  series: "OpenAI Academy"
  module: "02.3 Personalizing ChatGPT"
  moduleOrder: 23
  source: "OpenAI Academy"
  sourceUrl: "https://openai.com/academy/personalization/"
  prerequisites:
    - "建议先阅读：OpenAI Academy 笔记：Prompting Fundamentals"
draft: false
---

**说明：** 本文聚焦于如何通过个性化配置优化 ChatGPT 的默认行为，使其从“通用助手”进化为深度理解您工作习惯的“专业合伙人”。

## 解决的核心痛点：告别“重复的解释”

如果您发现每次启动新任务时，都必须重复声明您的身份、受众背景及格式偏好，那么 ChatGPT 对您而言依然只是个“临时工”。Personalizing ChatGPT 的目标是将这些静态、稳定的偏好内化为模型的默认预设，从而显著提升每次会话的起点。

## 自定义指令 (Custom Instructions) 的应用策略

Custom Instructions 应承载那些具有**普适性、长期稳定性**的信息，其设计建议包含两个维度：

| 维度 | 设计要点 | 典型示例 |
| --- | --- | --- |
| **角色背景** | 您的职业身份、关注领域及核心业务目标。 | “我是一名 AI 学习社区的运营者，致力于将复杂技术通俗化。” |
| **输出偏好** | 语气风格、默认格式、深度要求及引用习惯。 | “优先使用结构化清单，严禁营销腔调，事实引用必须注明出处。” |

**专家提示：** 避免在自定义指令中塞入过于具体的一次性任务细节，否则会干扰模型处理新任务的灵活性。

## 记忆功能 (Memory) 的动态治理

Memory 允许 ChatGPT 在不同会话间保留关于您的零散偏好与背景。

- **适用范围**：长期学习目标、特定的写作风格模版、常用项目名称及关联工具。
- **治理规则**：定期进行“记忆审查”。您可以询问：“你目前记得哪些关于我的偏好？”并要求其忘掉过时或敏感的信息。

## 建立您的“个性化工作流”规则

1. **静态约束放指令**：如“简洁、结构化、无幻觉”。
2. **动态演进靠记忆**：如“我正在推进 X 项目，以后提到 X 请参考 Y 文件的逻辑”。
3. **场景隔离用项目 (Projects)**：针对特定、独立的大型任务，使用 Project 的专用上下文，避免污染全局 Memory。
4. **隐私先行**：对敏感、高隐私数据坚持“最小化录入”原则。

## 与 Skills 的功能协同

个性化设置定义的是您的**“工作底色”**，而 Skills 定义的是**“具体的执行模版”**。前者确保 AI “懂您”，后者确保 AI “能干好某件特定的事”。两者的有机结合是实现 AI 高级自动化的基础。

---

## 体系化学习指南

### 核心目标
- 理解个性化配置、动态记忆与项目上下文之间的分层逻辑。
- 学会如何将业务角色的核心价值观转化为 AI 可理解的默认指令。
- 掌握在提升生产力的同时，有效管理个人数字化足迹的技巧。

### 推荐操作流
1. **偏好审计**：梳理您在过去 10 次对话中反复提及的约束条件。
2. **指令重构**：将上述偏好归纳为简练、无歧义的自定义指令。
3. **记忆调优**：通过主动引导（如“请记住我以后更喜欢表格输出”）来塑造模型行为。
4. **效果评估**：观察在没有详细 Prompt 的情况下，模型的初次反馈是否更符合预期。

### 质量控制清单
- [ ] 自定义指令是否做到了逻辑互斥、无语义干扰？
- [ ] 记忆库中是否清除了已结束项目的干扰信息？
- [ ] 输出结果是否在语气与专业度上保持了高度的一致性？

---
来源参考：https://openai.com/academy/personalization/
