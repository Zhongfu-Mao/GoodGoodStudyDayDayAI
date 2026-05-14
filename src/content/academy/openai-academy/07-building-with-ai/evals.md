---
title: "OpenAI Academy：Evals 把 AI 质量变成工程资产"
date: 2026-04-25
category: academy
description: "从任务定义、样本集、评分细则、自动评估、人工复核到回归门禁，建立可持续迭代的 AI 应用质量体系。"
plainSummary: "Evals 的价值不是给模型打分，而是把主观的“感觉不错”转成可复现的样本、rubric、失败分类和发布门禁。"
difficulty: intermediate
coverImage: "/images/academy/openai-academy/07-building-with-ai/evals/evals-lab-cover.png"
tags:
  - Evaluation
  - AI Engineering
lang: zh
academy:
  series: "OpenAI Academy"
  module: "07.3 Evals"
  moduleOrder: 103
  source: "OpenAI Academy"
  sourceUrl: "https://academy.openai.com/home/clubs/builders-etkn1/resources/builder-bootcamp-2026-04-22"
  prerequisites:
    - "建议先阅读：OpenAI Academy 笔记：Building with AI"
draft: false
---

# OpenAI Academy：Evals 把 AI 质量变成工程资产

![AI Evals 实验室与质量门禁](/images/academy/openai-academy/07-building-with-ai/evals/evals-lab-cover.png)

AI 应用最危险的一句话是：“我试了一下，感觉挺好。”

这句话不是没价值。手感、直觉、人工试用都是起点。但如果产品要持续迭代，模型要升级，prompt 要修改，RAG 知识库要更新，Agent 工具要扩展，你就需要能回答：

- 新版本是否真的更好？
- 哪些场景变好了，哪些场景变差了？
- 失败是否集中在某类输入？
- 自动评分是否可信？
- 哪些问题必须人工复核？
- 上线前有没有质量门禁？

Evals 的价值不是“评价模型聪不聪明”，而是把质量变成可复现、可比较、可回归的工程资产。

## Eval 从任务定义开始

不要一上来就写评分 prompt。先定义任务。

一个好的任务定义包括：

| 项目 | 问题 |
| --- | --- |
| 用户场景 | 谁在什么情况下使用？ |
| 成功标准 | 什么输出算完成？ |
| 失败成本 | 错了会造成什么影响？ |
| 输入范围 | 系统会遇到哪些正常输入和异常输入？ |
| 输出约束 | 格式、语气、引用、长度、权限边界是什么？ |
| 人工边界 | 哪些判断不能交给自动评分？ |

任务定义不清，eval 分数再漂亮也没有意义。

## 样本集要覆盖真实世界，而不只是理想输入

![Eval 数据集从真实、边界、失败和对抗样本中构建](/images/academy/openai-academy/07-building-with-ai/evals/eval-dataset-design.png)

一个最小可用 eval set 可以从 30 到 100 条样本开始。关键不是数量大，而是结构合理。

| 样本类型 | 目的 |
| --- | --- |
| Happy path | 核心功能是否正常 |
| Edge case | 边界输入是否稳定 |
| Known failure | 历史失败是否修复 |
| Ambiguous input | 是否会澄清或拒答 |
| Adversarial input | 是否越权或被诱导 |
| Real user sample | 是否贴近真实场景 |

只用 happy path 会制造虚假的安全感。真正有价值的 eval set，应该随着失败日志持续增长。

## Rubric：把“好”拆成可判断的维度

Rubric 是评分细则。它让评估不再只靠一句“质量不错”。

以 RAG 回答为例，可以拆成：

| 维度 | 合格标准 |
| --- | --- |
| Correctness | 结论和证据一致 |
| Grounding | 关键结论都有来源支持 |
| Completeness | 回答覆盖问题的核心方面 |
| Refusal | 证据不足时能拒答 |
| Format | 符合产品输出格式 |
| Safety | 不泄露、不越权、不提供危险建议 |

评分可以是 pass/fail，也可以是 1 到 5 分。早期建议先用 pass/fail，因为更容易形成一致判断。

## 自动评估和人工评估要组合

自动评估适合：

- 格式检查。
- JSON schema。
- 是否包含引用。
- 是否拒答。
- 关键词或事实匹配。
- 大规模回归筛查。

人工评估适合：

- 复杂判断。
- 语气和可读性。
- 高风险领域。
- 业务策略。
- 用户体验。

模型作为 grader 也很有用，但不要无条件相信。它同样需要校准：抽样人工复核、比较不同 grader、一致性检查、查看评分理由。

## 失败分类比总分更重要

![持续评估、失败回流与回归门禁](/images/academy/openai-academy/07-building-with-ai/evals/regression-gates.png)

总分能告诉你版本好坏，失败分类能告诉你该修哪里。

常见分类：

- 指令未遵循。
- 格式错误。
- 事实错误。
- 引用错误。
- 检索漏召回。
- 工具选择错误。
- 拒答不足。
- 拒答过度。
- 安全边界失败。
- 成本或延迟超限。

每次失败都应该变成下一次 eval 的候选样本。否则同一个问题会反复出现。

## Evals 应该进入发布流程

一次模型或 prompt 改动上线前，至少做三类检查。

1. **Smoke eval**
   - 小样本，几分钟内跑完。
   - 用来发现明显破坏。
2. **Regression eval**
   - 覆盖已知失败和核心场景。
   - 用来判断能否发布。
3. **Deep eval**
   - 大样本、人工复核、成本分析。
   - 用来做版本决策和产品策略。

不同层级不必每次都跑。关键是让发布决策有证据。

## 案例：客服回复生成

目标：根据用户问题和政策文档生成客服回复。

任务定义：

- 不能承诺政策之外的补偿。
- 必须引用相关政策。
- 语气要清楚、尊重、可执行。
- 政策不足时要升级人工。

eval set：

- 20 条常见问题。
- 10 条边界问题。
- 10 条历史失败。
- 5 条诱导越权输入。

rubric：

- 是否遵循政策。
- 是否有引用。
- 是否没有过度承诺。
- 是否正确升级人工。
- 是否语言自然。

发布门禁：

- 政策遵循必须 100%。
- 引用错误必须 0。
- 语言自然度低于阈值时人工复核。

这比“让几个人试用一下”更可维护。

## 常见反模式

**反模式一：只评估最终平均分。**

平均分会掩盖高风险失败。医疗、金融、法律、发布操作等场景要看关键项是否 0 失败。

**反模式二：eval set 永远不变。**

产品变化、用户变化、失败变化，eval set 也要变化。

**反模式三：只用模型打分。**

模型 grader 有用，但需要人工校准和抽样复核。

**反模式四：失败不回流。**

失败如果不进入回归样本，系统会反复犯同样的错。

## Eval 设计模板

```md
## Task

用户：
输入：
输出：
成功标准：
失败成本：

## Dataset

Happy path：
Edge cases：
Known failures：
Adversarial：
Real samples：

## Rubric

| Dimension | Pass Criteria | Critical |
| --- | --- | --- |

## Grading

自动检查：
模型评分：
人工复核：

## Release Gate

必须通过：
可接受波动：
阻断发布：

## Feedback Loop

失败如何分类：
如何进入回归集：
谁负责更新：
```

## 检查清单

- 任务是否有明确成功标准？
- eval set 是否包含真实失败样本？
- rubric 是否能被不同评审者一致理解？
- 自动评分是否经过人工抽样校准？
- 是否记录失败分类，而不只是总分？
- 模型、prompt、RAG、tool 改动是否都会触发回归 eval？
- 发布门禁是否区分关键失败和普通质量波动？

## 继续阅读

- [OpenAI Academy：构建可靠 AI Agents](./agents/)：评估 Agent 的结果和执行路径。
- [OpenAI Academy：RAG 从知识库到可追溯回答](./rag/)：评估检索和生成的不同失败。
- [Eval、Benchmark 与产品质量](../../../foundations/ai-developer-core/evals-benchmarks-product-quality/)：把评测扩展成产品质量体系。

## 参考

- [OpenAI Academy: Builder Bootcamp](https://academy.openai.com/home/clubs/builders-etkn1/resources/builder-bootcamp-2026-04-22)
- [OpenAI Evals Guide](https://platform.openai.com/docs/guides/evals)
- [OpenAI Graders Guide](https://platform.openai.com/docs/guides/graders)
