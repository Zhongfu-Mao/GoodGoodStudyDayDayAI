---
title: "AI Basics for Everyone：Eval とは何か、なぜ AI アプリに必要なのか"
date: 2026-04-27
category: academy
description: "Eval を、AI の品質を再現可能に確認するためのテストセット、rubric、回帰確認として整理します。"
coverImage: "/images/academy/ai-basics-for-everyone/eval.svg"
difficulty: beginner
plainSummary: "Eval は AI の出力品質を繰り返し確認する方法です。「なんとなく良い」をテストセット、基準、指標、回帰確認に変えます。"
tags:
  - "Evals"
  - "Quality"
lang: ja
academy:
  series: "AI Basics for Everyone"
  module: "基本概念"
  moduleOrder: 6
  source: "サイト内 Academy / Foundations ガイド"
  prerequisites: []
draft: false
---

## まず一言で

Eval は evaluation、つまり評価です。AI が「なんとなく良さそう」に見える状態を、繰り返し確認できる品質基準に変えるための仕組みです。

AI アプリは従来のソフトウェアと少し違います。出力は model、prompt、context、retrieval、tool、ランダム性に影響されます。数回試しただけでは、本当に良くなったのか判断しにくいのです。

## Eval は何を見るのか

| 観点 | 問い |
| --- | --- |
| 正確性 | 事実やタスク要件に合っているか |
| 完全性 | 重要点を落としていないか |
| 形式 | 指定した構造になっているか |
| 引用 | 与えた資料に基づいているか |
| 安全性 | 権限や方針を越えていないか |
| 安定性 | model や prompt を変えても退化していないか |

Eval はきれいな点数のためではなく、どこで失敗するかを知るためにあります。

## 個人利用にも eval 思考は役立つ

AI アプリを作っていなくても、eval 思考は使えます。たとえば AI に共有文を書いてもらうなら、次のような確認表を持てます。

- 読者の背景に合っているか。
- 大げさな表現や証明できない主張がないか。
- 約束した内容をカバーしているか。
- 具体例があるか。
- 次に何をしてほしいかが明確か。

これも軽い eval です。「よさそう」から「どこが足りないか」に変わります。

## AI アプリでの基本形

小さな eval は次のように始められます。

1. 実際の入力を 20 から 50 件集める。
2. それぞれの理想的なふるまいを書く。
3. 採点基準を定義する。
4. model、prompt、retrieval を変えたら再実行する。
5. 失敗例を次のテストセットに加える。

小さくても価値があります。「良い」とは何かを明文化できるからです。

## サイト内で次に読むもの

[Evals](../../openai-academy/07-building-with-ai/evals/) で、AI アプリになぜ評価が必要なのかを学べます。

[Evals、Benchmarks、Product Quality](../../../foundations/ai-developer-core/evals-benchmarks-product-quality/) では、eval と benchmark の違いを整理しています。

RAG、Agent、coding workflow に進むほど、eval は継続的な改善の中心になります。

## 実用的な見方

「AI の効果が高い」と言われたら、次を聞きます。

1. 何が良いのか。
2. どの版と比べているのか。
3. どんなデータで測ったのか。
4. 失敗例は何か。
5. 次に変更した時、退化していないとどう確認するのか。

これに答えられて初めて、AI はデモからプロダクトに近づきます。
