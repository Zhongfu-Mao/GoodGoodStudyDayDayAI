---
title: "AI Basics for Everyone：Agent とは何か、なぜ重要なのか"
date: 2026-04-27
category: academy
description: "Agent を流行語ではなく、目標、状態、tool、手順、権限、検証を持つ workflow として整理します。"
coverImage: "/images/academy/ai-basics-for-everyone/agent.svg"
difficulty: beginner
plainSummary: "Agent はただ会話する bot ではなく、目標に向けて tool を使い、手順を進め、結果を確認する AI workflow です。"
tags:
  - "AI/Agents"
lang: ja
academy:
  series: "AI Basics for Everyone"
  module: "基本概念"
  moduleOrder: 4
  source: "サイト内 Academy / Engineering ガイド"
  prerequisites: []
draft: false
---

## まず一言で

Agent は、目標に向けて tool を使い、複数ステップで進み、結果を観察して調整する AI workflow です。ただ会話が上手いのではなく、行動し、確認し、タスクを前へ進めます。

普通の chat assistant は質問に答えます。Agent は workflow を走らせます。

## Agent に必要な要素

| 要素 | 役割 |
| --- | --- |
| Goal | 何を達成するか |
| State | 進捗、既知情報、中間成果物 |
| Tools | browser、file、API、database、code 実行など |
| Policy | 自分で進める場面と、人に聞く場面 |
| Feedback | 結果をどう確認し、修正するか |

Tool がなければ chat に近く、state がなければ同じことを繰り返しやすくなります。権限境界がなければ危険で、検証がなければ「忙しそうに見えるだけ」になります。

## なぜみんな Agent と言うのか

AI の価値が、文章を生成するだけでなく、作業を進める方向に移っているからです。実際の仕事は、検索、判断、実行、修正、検証、共有がつながっています。

Agent の考え方は、その流れに AI を入れるものです。AI が助言するだけでなく、一定の範囲で仕事を進めます。

## Agent が不要な場合

すべての作業に agent は必要ありません。一回の回答、要約、書き換えで済むなら、普通の chat で十分です。

Agent に向く作業は、次の特徴を持ちます。

- 複数ステップがある。
- Tool が必要。
- 中間結果によって次の手順が変わる。
- 進捗を記録する必要がある。
- 成功基準を定義できる。

成功基準が言えないなら、まだ agent 化しない方が安全です。

## サイト内で次に読むもの

[Building Agents](../../openai-academy/07-building-with-ai/agents/) で、tool、handoff、guardrail、eval がどう組み合わさるかを学べます。

[Introduction to Subagents](../../anthropic-academy/05-agentic-mcp/introduction-to-subagents/) では、複雑な作業を役割ごとの小さな agent に分ける考え方が見えます。

工程寄りに理解したい場合は、[Agent の state、tool、feedback loop](../../../foundations/ai-developer-core/agent-state-tools-feedback-loop/) と [Agent Harness](../../../engineering/ai-developer-core/agent-harness-logging-approval-replay/) が次の入口です。

## やってみよう

ChatGPT（Code Interpreter をオンにして）で次を送ってみてください。

```text
最近 12 か月の各月の日数が正しいか分析してください。
まず計画を立て、コードで検証し、結果をまとめてください。
```

AI が「計画 → コード実行 → 結果確認 → まとめ」の流れで動くかを観察してください。これが「目標 → ツール → 検証」の Agent ループの最小例です。

## 実用的な見方

ある製品が本当に agent なのかを見るには、次を聞きます。

1. どんな tool を使えるのか。
2. 進捗や状態をどう管理するのか。
3. いつ人に確認するのか。
4. 結果が正しいことをどう確かめるのか。

これらが曖昧なら、普通の chat を agent と呼んでいるだけかもしれません。
