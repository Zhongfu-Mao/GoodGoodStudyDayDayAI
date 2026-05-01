---
title: "OpenAI Academy 笔记：Using Projects in ChatGPT"
date: 2026-04-25
category: academy
description: "深入理解如何将 Projects 作为特定主题的持续上下文容器，高效管理文档、指令及团队协作流程。"
plainSummary: "本笔记将 OpenAI Academy 关于 Projects 的核心内容整理为一套可复用的工作方法，旨在帮助用户通过构建结构化的工作空间实现复杂任务的长期演进。"
difficulty: beginner
coverImage: "https://images.ctfassets.net/kftzwdyauwt9/L0cSoOsBFybec07VSIDJw/27647c6494be7191e0e2168f5bf27044/projects.png?w=3840&q=90&fm=webp"
tags:
  - "AI/Workflow"
lang: zh
academy:
  series: "OpenAI Academy"
  module: "02.7 Projects"
  moduleOrder: 27
  source: "OpenAI Academy"
  sourceUrl: "https://openai.com/academy/projects/"
  prerequisites:
    - "建议先阅读：OpenAI Academy 笔记：Using ChatGPT"
draft: false
---

**说明：** 本文旨在探讨如何将 Projects 构建为持续演进的“任务容器”，而非简单的文件堆放处。

## 解决的核心痛点：从“零碎对话”到“知识沉淀”

常规聊天更适合处理即时性任务，而 Project 则专为持续性、系统性工作设计。通过在 Project 中整合聊天记录、参考文件、定制化指令及历史上下文，用户无需在每次启动新会话时重复解释背景，从而实现工作流的无缝衔接。

## 典型的应用场景分析

| 场景 | 为什么 Projects 是最佳选择 |
| --- | --- |
| **深度研究主题** | 随着研究深入，参考资料与阶段性结论可在此持续累积。 |
| **复杂写作/内容创作** | 确保大纲、草稿、分章节素材及视觉灵感在同一语境下演进。 |
| **系统化学习计划** | 统一管理课程大纲、重点笔记、课后练习及复习进度。 |
| **团队协同办公** | 建立团队共识，确保所有成员基于同一套事实边界与风格指南工作。 |
| **周期性复盘规划** | 沿用固定的周报/月报结构，并自动参考历史记录。 |

## 构建高质量 Project 的三大支柱

1. **核心指令 (Project Instructions)**：清晰定义项目的核心目标、主要受众、风格偏好及负面约束（不该做的事）。
2. **知识库 (Project Files)**：上传关键文档、结构化数据、图片素材或外部参考链接，作为 AI 回答的“唯一事实来源”。
3. **历史脉络 (Workflow Records)**：保留关键的决策点与未决问题，确保后续对话能承接前序工作。

## 协同与进阶：Projects、Custom GPTs 与 Skills 的界限

- **Project**：负责**“上下文管理”**。侧重于某个具体项目的材料、文件和实时状态。
- **Custom GPT**：负责**“角色定义”**。侧重于某种通用的专家身份、预设知识与全局风格。
- **Skill**：负责**“流程规范”**。侧重于具体任务的 SOP 执行标准与输出格式。

**最佳实践建议：** 对于一个长期的研究课题，应首先建立一个 Project；若在执行过程中发现某些输出格式需要高度标准化，则可进一步将其抽离为 Skill。

---

## 体系化学习指南

### 核心目标
- 掌握如何将 Project 构建为具备“长期记忆”的任务中心。
- 学会撰写能够精准驱动项目演进的“核心指令”。
- 建立一套支持团队协作与知识迭代的文档管理规范。

### 推荐操作流
1. **明确使命**：为 Project 撰写一段简短的 Mission Statement。
2. **分层建档**：上传核心材料，并为每份文件标注其在项目中的用途。
3. **定义准则**：明确输出的语气、禁止使用的术语以及必须遵循的合规标准。
4. **增量演进**：在每次对话后，根据新发现更新项目指令或文件库。
5. **定期清理**：移除过时的临时草稿，保持 Project 的上下文清晰。

### 质量控制清单
- [ ] 所有的输出是否均有项目文件作为支撑？
- [ ] 核心指令是否随着项目的变化而得到了同步更新？
- [ ] 团队成员是否共享了最新的输出规范与事实边界？

---
来源参考：https://openai.com/academy/projects/
