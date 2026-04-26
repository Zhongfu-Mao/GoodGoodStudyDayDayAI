---
title: "AI Developer Core：Eval、Benchmark 与产品质量"
date: 2026-04-26
category: foundations
description: "区分模型榜单、任务评测和产品评测，建立 AI 应用的评测优先思维。"
difficulty: intermediate
plainSummary: "Benchmark 告诉我们模型在标准任务上的相对能力，eval 告诉我们自己的产品在真实任务上的可靠程度。AI 工程应该从可重复评测开始。"
tags:
  - AI Developer Core
  - Eval
  - Benchmark
  - Quality
lang: zh
draft: false
---

# 为什么不能只看模型榜单

模型 benchmark 很有用，但它回答的是“模型在某组标准题上表现如何”。产品 eval 回答的是另一个问题：“我们的系统在自己的用户、数据、工具、约束和失败成本下表现如何”。这两个问题相关，但不能互相替代。

一个模型在通用榜单上更强，不代表它在你的客服流程、文档检索、代码修改、财务抽取或日文写作中一定更好。AI 应用是系统，不只是模型。prompt、上下文、工具、检索、权限、缓存、UI 和人工反馈都会影响最终质量。

## Eval 的最小形态

最小可用 eval 不需要复杂平台。可以从一个表格开始：

- input：用户问题或任务输入。
- context：系统能看到的材料。
- expected：理想行为或关键判断。
- rubric：通过和失败的标准。
- actual：模型输出。
- label：人工或评审器判断。
- notes：失败原因。

这个表格的价值在于让团队停止凭感觉调 prompt。每次改系统，都用同一批样例跑一遍，看哪些变好、哪些退化。

## 评测要覆盖失败模式

好 eval 不是平均随机抽样，而是主动收集边界情况。比如：无答案问题、冲突文档、恶意输入、格式异常、长上下文、低质量 OCR、工具超时、权限不足、用户表达含糊。

AI 系统最危险的不是简单问题答错，而是在高风险边界条件下自信地错。Eval 的核心任务就是把这些边界条件提前拉到开发环境里。

## LLM-as-a-Judge 怎么用

用模型做评审可以扩大评测规模，但不能无条件相信。更稳的做法是先让领域专家标一小批样例，再让 judge 模仿这个标准，并持续抽查它和人的一致性。Judge 的 prompt、rubric 和示例本身也需要版本管理。

换句话说，LLM-as-a-Judge 是评测系统的一部分，不是把判断责任外包给另一个模型。

## 可做实验

给一个 RAG 或结构化输出任务做 30 条 eval。先人工标注，再写一个 judge prompt，比较 judge 与人工的一致率。然后修改 prompt 或检索策略，观察通过率变化和新增失败类型。

## 参考

- [OpenAI Agent Evals](https://platform.openai.com/docs/guides/agent-evals)
- [OpenAI evaluation flywheel cookbook](https://cookbook.openai.com/examples/evaluation/building_resilient_prompts_using_an_evaluation_flywheel)
- [Hamel Husain: LLM Evals FAQ](https://hamel.dev/blog/posts/evals-faq/)
- [Eugene Yan: An LLM-as-Judge Won't Save The Product](https://eugeneyan.com/writing/eval-process/)
- [Chip Huyen: AI Engineering](https://www.oreilly.com/library/view/ai-engineering/9781098166298/)

