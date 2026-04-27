---
title: "AI Basics for Everyone：Token・料金・モデル選び"
date: 2026-04-27
category: academy
description: "Token とは何か、AI の料金体系、context window の制限、タスクに合ったモデルの選び方を整理します。"
coverImage: "/images/academy/ai-basics-for-everyone/token-cost-model.svg"
difficulty: beginner
plainSummary: "Token は AI がテキストを処理する基本単位で、課金の基準でもあります。Token と context window を理解すると、コスト管理やモデル選びが楽になります。"
tags:
  - "Token"
  - "LLM"
lang: ja
academy:
  series: "AI Basics for Everyone"
  module: "基本概念"
  moduleOrder: 9
  source: "サイト内 Academy / Foundations ガイド"
  prerequisites: []
draft: false
---

## まず一言で

Token は AI がテキストを処理する最小単位です。日本語の漢字 1 文字はおよそ 1〜3 token、英単語 1 語は 1〜4 token 程度です。AI の課金、context の制限、応答速度はすべて token 数に直結します。

## Token とは

AI は文字や単語ではなく token 単位でテキストを扱います。

| テキスト | おおよその token 数 |
| --- | --- |
| 「こんにちは」 | 1〜3 token |
| "Hello world" | 2 token |
| 500 文字のメール | 約 300〜700 token |
| 5000 文字の記事 | 約 3000〜7000 token |

## 料金のしくみ

多くの AI API は「入力 token ＋ 出力 token」で課金します。入力は出力より安く、高性能モデルほど単価が高い傾向です。

個人利用では ChatGPT Plus や Claude Pro のような月額制が分かりやすく、開発者は token 単価を意識するとコスト最適化ができます。

## Context Window とは

モデルが一度に「見える」最大 token 数です。机の広さに例えると、広いほど多くの資料を広げられますが、上限を超えると切り捨てられます。

| モデルタイプ | 典型的な window |
| --- | --- |
| 軽量モデル | 8K〜32K token |
| 主流モデル | 128K〜200K token |
| 長文書モデル | 1M+ token |

## モデルの選び方

| タスクの特徴 | 向いているもの |
| --- | --- |
| 簡単な Q&A・日常会話 | 軽量で高速なモデル |
| 長文分析・複雑な推論 | 高性能モデル＋大きな window |
| コード生成・デバッグ | コードに強い専用モデル |
| 最新情報が必要 | 検索機能付きモデル |
| コスト重視のバッチ処理 | 軽量モデル＋構造化 prompt |

## サイト内で次に読むもの

技術的な詳細は [Token と Context Window](../../../foundations/ai-developer-core/token-context-window/) へ。context の活用法は [Context Window・Memory・Projects とは](../context-window-memory-projects/) で整理しています。

## やってみよう

ChatGPT で短い質問と長い資料付き質問を続けて送り、応答速度の違いを体感してください。さらに「100 文字以内で答えてください」と付けると、出力 token の制御も試せます。

## 実用的な見方

ツールやモデルを選ぶときは、次の 4 点を先に答えてみてください。

1. このタスクにどれくらいの context が必要か。
2. 最強モデルが必要か、十分な性能で足りるか。
3. 一回きりか、繰り返し実行するか。
4. コストはどの程度意識するか。
