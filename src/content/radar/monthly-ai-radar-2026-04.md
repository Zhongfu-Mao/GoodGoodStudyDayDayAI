---
title: "AI 雷达月报：2026 年 4 月（截至 04-19）"
date: 2026-04-19
category: radar
cadence: monthly
tags:
  - Agent
  - Open Models
  - AI Infrastructure
  - Coding Agents
lang: zh
draft: false
---

# 月度结论

四月上半月到中旬，AI 圈最明显的变化不是“又有一个更强模型”，而是三条长期趋势开始同时变得清晰：

1. **Agent 的核心战场上移到运行时**  
   记忆、技能、协议、审批门控、工作区、恢复能力与可观测性，正在共同构成 Harness Engineering 这一层。

2. **模型产品线开始分层**  
   旗舰模型快迭代、门控前沿版、垂直专用模型，这三条线已经能同时看到样板。

3. **产品入口开始真正被重写**  
   IDE、搜索、浏览器、办公软件、本地原生应用，都在被 AI 重新定义。

![Agent Landscape 演进图](https://substack-post-media.s3.amazonaws.com/public/images/acc877e8-071d-4d5c-bcc5-c8dbe50e37c1_2114x1154.png)

*代表图来自 [Evolution of Agent Landscape From 2022-26](https://blog.dailydoseofds.com/p/evolution-of-agent-landscape-from)。用它来做月报代表图最合适，因为 4 月上半月最重要的长期变化，就是 Agent 能力正在整体外移到运行时层。*

## 本月四条主线

## 1. Harness Engineering 成为 2026 年最重要的工程关键词

- 从 Agent Harness、Advisor Strategy，到 Build Agents That Don’t Fail in Production、RIP Pull Requests，这一整串内容都在说明：决定 Agent 上限的越来越不是模型本身，而是运行环境。
- 对团队而言，这意味着以后要重点建设的是工作区隔离、状态持久化、验证流程、审批节点和上下文装配。

## 2. 开源模型生态从“追分数”转向“追完整能力”

- Gemma 4、Qwen 3.6-Plus、GLM-5.1、Nucleus-Image 等信号说明，开源阵营正在同时补多模态、长上下文、on-device 与 coding 能力。
- 许可和生态配套的重要性，已经和 benchmark 分数一样高。

## 3. 工具层最先成熟的方向是 OCR、RAG 和 coding workflow

- llama.cpp OCR、论文 OCR 流水线、Tabular Review、TRL v1.0、Claude Code Slash Commands，这些都属于“离业务最近”的工程能力。
- 如果要挑最有可能率先规模落地的一批能力，我会优先看文档理解、本地多模态与 coding agent workflow。

## 4. 平台、合规和商业模式一起开始收紧

- OpenAI Codex、Windsurf、Perplexity、OpenClaw 都在争 AI 入口。
- Anthropic KYC 则提醒我们，模型平台的使用资格本身也会变成产品能力的一部分。

## 接下来一个月值得重点看什么

- Harness Engineering 会不会从少数文章中的术语，变成行业通用语言。
- 多 Agent IDE 与工作区系统是否会真正改变团队协作形态。
- 垂直专用模型会不会在生命科学、网络安全、金融等高价值场景快速复制。
