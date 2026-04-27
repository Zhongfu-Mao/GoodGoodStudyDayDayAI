---
title: "AI Basics for Everyone：Eval 是什么，为什么 AI 应用需要评测"
date: 2026-04-27
category: academy
description: "把 eval 解释成 AI 应用的质量系统：测试集、标准、回归和人工复核。"
coverImage: "/images/academy/ai-basics-for-everyone/eval.svg"
difficulty: beginner
plainSummary: "Eval 是让 AI 输出质量可以被重复检查的方法。它把“感觉不错”变成测试集、评分标准、指标和回归检查。"
tags:
  - "Evals"
  - "Quality"
lang: zh
academy:
  series: "AI Basics for Everyone"
  module: "入口概念"
  moduleOrder: 6
  source: "本站 Academy / Foundations 导读"
  prerequisites: []
draft: false
---

## 先用一句话理解

Eval 是 evaluation，也就是评测。它的作用是把“这个 AI 好像挺好用”变成可重复检查的质量标准。

AI 应用和传统软件不太一样。传统软件很多行为是确定的；AI 输出会受模型、prompt、上下文、检索、工具和随机性影响。所以只靠肉眼试几次，很难判断系统是否真的变好了。

## Eval 评什么

| 维度 | 要问的问题 |
| --- | --- |
| 正确性 | 内容是否符合事实或任务要求 |
| 完整性 | 有没有漏掉关键点 |
| 格式 | 是否符合约定结构 |
| 引用 | 是否基于给定资料，不乱编来源 |
| 安全 | 是否越权、泄露或违反边界 |
| 稳定性 | 改 prompt 或模型后有没有退步 |

Eval 不是为了追求漂亮分数，而是为了知道系统在哪些情况下会失败。

## 为什么个人学习也需要 eval 思维

即使你不做 AI 产品，eval 思维也很有用。比如你让 AI 帮你写分享稿，可以自己设一个小检查表：

- 是否符合听众背景？
- 是否有夸大或无法证明的说法？
- 是否覆盖了我承诺要讲的内容？
- 是否有具体例子？
- 是否有下一步行动？

这就是轻量 eval。它让你从“我觉得还行”变成“我知道哪里还不够”。

## AI 应用里的 eval 通常怎么做

一个基本 eval 可以这样开始：

1. 收集 20 到 50 个真实输入。
2. 写清每个输入的理想行为。
3. 定义评分标准。
4. 每次改模型、prompt 或检索策略后重跑。
5. 把失败案例加入下一版测试集。

小规模 eval 也有价值。它会逼你说清楚“好”到底是什么意思。

## 和本站内容怎么接上

先读 [Evals](../../openai-academy/07-building-with-ai/evals/)，理解 AI 应用为什么需要评测。

再读 [Evals、Benchmarks 与产品质量](../../../foundations/ai-developer-core/evals-benchmarks-product-quality/)，把 eval 和 benchmark 的区别讲清楚。

如果你之后做 RAG、Agent 或 coding workflow，eval 会成为判断系统是否可持续迭代的关键。

## 动手试试

选一个你最近让 AI 完成的任务（写邮件、做总结、生成方案等），为它写一个 5 条检查清单。比如：

```text
□ 是否覆盖了我提到的所有要点？
□ 语气是否符合目标读者？
□ 有没有夸大或无法验证的说法？
□ 格式是否可以直接使用？
□ 如果重新生成一次，结果会不会差很多？
```

下次让 AI 帮你做类似任务时，用这个清单检查输出。这就是最轻量的个人 eval。

## 一个实用判断

每次看到“AI 效果很好”的说法，可以追问：

1. 好在哪里？
2. 和什么版本相比？
3. 用什么数据测的？
4. 失败案例是什么？
5. 下次改动后怎么确认没有退步？

能回答这些问题，AI 才真正从演示走向产品。
