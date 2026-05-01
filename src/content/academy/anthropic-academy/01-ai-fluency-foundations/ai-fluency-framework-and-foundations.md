---
title: "AI Fluency: Framework & Foundations"
date: 2026-03-31
category: academy
description: "AI Fluency 4Ds 框架的核心理论课程，涵盖「委派-勤勉」循环与「描述-辨别」循环。"
plainSummary: "本笔记将 AI Fluency: Framework & Foundations 的核心内容提炼为系统化的学习路径，助力掌握 AI Fluency 的核心框架与基础实践。"
difficulty: beginner
coverImage: "/images/academy/anthropic-academy/covers/01-ai-fluency-foundations/ai-fluency-framework-and-foundations.svg"
lang: zh
academy:
  series: "Anthropic Academy"
  module: "AI Fluency 框架与基础"
  moduleOrder: 1
  source: "Anthropic Academy"
  sourceUrl: "https://anthropic.skilljar.com/ai-fluency-framework-foundations"
  prerequisites:
    - "获取 Claude 访问权限：[claude.ai](https://claude.ai)"
    - "阅读 AI Fluency 词汇表"
draft: false
---
**版权说明：** Copyright 2025 Rick Dakan, Joseph Feller, and Anthropic（遵循 CC BY-NC-SA 4.0 协议）

> **课程核心**
> **AI Fluency（AI 流利度）** = 以有效（Effective）、高效（Efficient）、合乎伦理（Ethical）、安全（Safe）的方式与 AI 协作的综合能力。
> 核心框架：**4Ds** —— Delegation（委派）→ Description（描述）→ Discernment（辨别）→ Diligence（勤勉）

## 第一章：简介

### 1. 课程导引（Introduction to AI Fluency）

**什么是 AI Fluency？**

AI Fluency 指以**有效（Effective）、高效（Efficient）、合乎伦理（Ethical）且安全（Safe）**的方式与 AI 系统交互的能力。

本课程的核心围绕 **4D 框架**展开：Delegation（委派）、Description（描述）、Discernment（辨别）和 Diligence（勤勉）。

**课程目标：** 在 AI 持续演进的浪潮中，培养能够持续产生价值的人机协作技能。

**必备资源：**
- 获取 Claude 访问权限：[claude.ai](https://claude.ai)
- AI Fluency 词汇表（建议下载 PDF 备查）

## 第二章：AI Fluency 框架

### 2. 为什么我们需要 AI Fluency？（Why do we need AI Fluency?）

**人与 AI 协作的三种典型模式：**

| 模式 | 说明 |
|------|------|
| **Automation（自动化）** | AI 根据指令完成特定任务，人类负责下达指令并监督结果。 |
| **Augmentation（增强）** | 人类与 AI 作为合作伙伴，共同进行创意思考与任务执行。 |
| **Agency（代理）** | 配置 AI 使其能够自主代表人类工作，基于既定的知识库和行为准则运行。 |

掌握 AI Fluency 能够帮助你在以上三种模式中切换自如，提升协作效能。

### 3. 4D 框架概览（The 4D Framework）

4D 框架定义了 AI Fluency 的四大核心能力：

| 维度 | 能力定义 | 核心思考点 |
|---|------|----------|
| **Delegation（委派）** | 决策哪些任务交给 AI、哪些由人类独立完成。 | 该任务的性质是否契合当前的 AI 能力？ |
| **Description（描述）** | 与 AI 系统进行清晰、精准且有效的沟通。 | 我该如何表达需求，才能让 AI 准确理解意图？ |
| **Discernment（辨别）** | 批判性地评估 AI 的输出内容及其行为逻辑。 | AI 的回答质量如何？是否真正解决了我的问题？ |
| **Diligence（勤勉）** | 确保以负责任且合乎伦理的方式使用 AI。 | 我的 AI 协作过程是否透明、合规且负责？ |

这四种能力相辅相成，贯穿于所有 AI 协作场景的始终。

## 第三章：深入理解生成式 AI

### 4. 生成式 AI 基础（Generative AI fundamentals）

**什么是生成式 AI？**

生成式 AI（Generative AI）的核心价值在于**创造新内容**，而非仅仅分析或检索已有数据。

**大语言模型（LLM）的三大支柱：**
- **Transformer 架构**：算法层面的核心突破。
- **海量训练数据**：模型能力的知识来源。
- **强大算力支持**：模型运行的物理基础。

**关键概念点：**
- **上下文窗口（Context Window）**：模型在单次对话中能够处理的信息量上限。
- **涌现能力（Emergent Capabilities）**：当模型规模达到一定程度时，意外展现出的复杂处理能力。

### 5. 生成式 AI 的能力与局限（Capabilities & limitations）

**核心优势：**
- 强大的跨领域多功能性（写作、翻译、代码编写、深度分析等）。
- 能够维持连贯的对话语境。
- 具备零样本（Zero-shot）或少样本（Few-shot）的学习与任务切换能力。

**现实局限：**
- **知识截止日期（Knowledge Cutoff）**：训练数据的时间限制，导致其对最新资讯了解不足。
- **幻觉（Hallucinations）**：可能生成表面逻辑通顺但事实错误的内容。
- **上下文窗口限制**：在处理超长文档时，可能存在信息遗漏或关注点偏移。
- **复杂推理挑战**：面对严密的多步骤逻辑推导时，仍可能出现偏差。

> **提示：** AI 领域发展极快，当前的局限性正随着技术迭代被不断攻克。

## 第四章：委派（Delegation）

### 6. 深入解析委派（A closer look at Delegation）

**委派的本质：**

委派（Delegation）是 AI Fluency 的首要能力，即**审慎地决定哪些工作亲力亲为、哪些与 AI 协作完成、哪些交由 AI 独立处理。**

**委派的三个子能力：**

| 子能力 | 说明 |
|--------|------|
| **Problem Awareness（问题意识）** | 在引入 AI 之前，对目标、约束和任务本质有深刻理解。 |
| **Platform Awareness（平台意识）** | 识别并理解不同 AI 系统各自的擅长领域与短板。 |
| **Task Delegation（任务分配）** | 策略性地编排工作流，使人类智慧与 AI 算力各展所长。 |

**核心原则：**
- 有效的委派源于**领域专业知识**与**对 AI 能力边界理解**的结合。
- 目标并非全盘自动化，而是构建最优质的**人机协作模式**。

### 7. 项目规划与委派实践（Project planning and Delegation）

实践练习：将委派概念应用于你真实关心的项目中。

**项目选择建议：**
- 包含多种类型的任务（具有一定复杂度）。
- 预估可在 1 小时左右完成（可控性强）。
- 具有真实的个人或职业兴趣驱动。

**项目场景参考：**
- **沟通类**：撰写新闻稿、演讲大纲或项目周报。
- **研究类**：行业趋势调研、产品竞品对比。
- **创意类**：故事梗概创作、网站架构草案设计。
- **学习类**：定制化的技能进修计划。

**实践路径：**
1. 与 Claude 对话，阐明项目愿景并细化任务清单。
2. 制定委派计划：明确 AI 的角色与人类的角色。
3. 记录初始计划，为后续的「描述」与「辨别」环节打下基础。

## 第五章：描述（Description）

### 8. 深入解析描述（A closer look at Description）

**描述的本质：**

描述（Description）不仅仅是编写提示词，它是构建一个**高效协作环境**的艺术，确保 AI 能够精准对齐人类的意图。

**描述的三个维度：**

| 维度 | 说明 | 示例 |
|------|------|------|
| **Product（产品描述）** | 定义预期的**输出成果**（格式、受众、风格）。 | “请撰写一篇 500 字的博文，面向初学者介绍区块链。” |
| **Process（过程描述）** | 引导 AI 的**思维路径与处理逻辑**。 | “请先分析现状，再列举优缺点，最后给出建议。” |
| **Performance（表现描述）** | 指定 AI 的**交互风格与行为准则**。 | “语言简洁有力，遇到不确定的信息请主动提问。” |

**核心理念：** 将 AI 视为**交互式合作伙伴**，而非简单的指令接收器。

### 9. 高效提示词技术（Effective prompting techniques）

**提示词工程（Prompt Engineering）** 是一种结合了人类沟通技巧与对模型机制理解的实践艺术。

**六大核心技术：**

| 序号 | 技术名称 | 实践建议 |
|---|------|------|
| 1 | **提供充足的上下文** | 说明背景、目标以及“为什么要这么做”。 |
| 2 | **少样本提示（Examples）** | 提供范例，让 AI 学习预期的输出风格和格式。 |
| 3 | **明确约束条件** | 规定长度、语气、禁忌词等具体要求。 |
| 4 | **任务拆解（Step-by-step）** | 将复杂任务分解，引导 AI 逐步推理。 |
| 5 | **给予思考空间** | 鼓励 AI 在给出答案前先进行内部逻辑梳理（CoT）。 |
| 6 | **角色设定** | 赋予 AI 特定的职业身份或人格特质。 |

**高阶技巧：** 直接邀请 AI 协助你优化和完善提示词！

## 第六章：辨别（Discernment）

### 10. 深入解析辨别（A closer look at Discernment）

**辨别的本质：**

辨别（Discernment）是描述的反馈侧：它要求我们**批判性地评估 AI 的输出是否真正符合预期并具有实用价值**。

**辨别的三个维度：**

| 维度 | 说明 |
|------|------|
| **Product（产品辨别）** | 检查输出内容的准确性、逻辑性及对受众的契合度。 |
| **Process（过程辨别）** | 分析 AI 的推理过程，识别潜在的逻辑漏洞或偏见。 |
| **Performance（表现辨别）** | 评估 AI 的沟通方式和协作态度是否需要调整。 |

**核心原则：**
- 辨别与描述构成了持续的**反馈闭环**。
- 领域专业背景越强，辨别的敏感度与准确度就越高。

### 11. 描述-辨别循环（The Description-Discernment loop）

这是 AI 协作中最核心的迭代过程：

```
描述（Description）—— 传达意图
    ↓
AI 尝试执行
    ↓
辨别（Discernment）—— 评估效果
    ↓
优化描述（Refinement）—— 针对性调整
    ↓
循环迭代，直至达成目标
```

## 第七章：勤勉（Diligence）

### 12. 深入解析勤勉（A closer look at Diligence）

**勤勉的本质：**

勤勉（Diligence）侧重于**合乎伦理、安全且负责任**地使用 AI。

**勤勉的三个支柱：**

| 子能力 | 说明 |
|--------|------|
| **Creation（创作勤勉）** | 思考 AI 生成内容在伦理、原创性及社会影响层面的合理性。 |
| **Transparency（透明勤勉）** | 对外坦诚 AI 在工作流程中所扮演的角色。 |
| **Deployment（部署勤勉）** | 对外发布的最终成果承担验证、核实及担保的全部责任。 |

**勤勉声明示例：**

> “本内容在起草过程中曾参考 [AI 名称] 生成的初稿，后经由本人进行深度核实、修改与润色。本人对内容的最终准确性与观点负责。”

## 第八章：总结与进阶

### 13. 课程总结（Conclusion）

**4D 框架精要：**
- **Delegation**：决定任务归属（谁来做）。
- **Description**：明确协作意图（怎么做）。
- **Discernment**：把控成果质量（做得如何）。
- **Diligence**：坚守伦理底线（是否负责）。

**最终愿景：** 实现**人类智慧与 AI 算力在优势互补基础上的深度对齐**。

## 延伸阅读

> **关联内容**
> - [Teaching AI Fluency](/academy/anthropic-academy/01-ai-fluency-foundations/teaching-ai-fluency/) —— 探讨如何将此框架传授给他人。
> - [AI Fluency for Educators](/academy/anthropic-academy/02-ai-fluency-audiences/ai-fluency-for-educators/) —— 教育场景下的 4D 实践。
> - [AI Fluency for Nonprofits](/academy/anthropic-academy/02-ai-fluency-audiences/ai-fluency-for-nonprofits/) —— 组织场景下的使命驱动 AI 实践。
