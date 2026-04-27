---
title: "AI Basics for Everyone：AI、モデル、LLM とは何か"
date: 2026-04-27
category: academy
description: "AI、モデル、大規模言語モデルの関係を、最初に混乱しない粒度で整理します。"
coverImage: "/images/academy/ai-basics-for-everyone/ai-model-llm.svg"
difficulty: beginner
plainSummary: "AI は認知的な作業を機械に担わせる広い領域、モデルは訓練された能力の中心、LLM は言語やテキストを扱うことに強いモデルです。"
tags:
  - "LLM"
lang: ja
academy:
  series: "AI Basics for Everyone"
  module: "基本概念"
  moduleOrder: 1
  source: "サイト内 Academy / Foundations ガイド"
  prerequisites: []
draft: false
---

## まず一言で

AI は、人間の認知に近い作業を機械に担わせる広い領域です。モデルは、その中で訓練されて特定の能力を持つ中心部分です。LLM は大規模言語モデルで、文章、会話、コード、構造化された言葉の処理を得意とします。

この 3 つはよく一緒に語られますが、階層が違います。

| 言葉 | 近いイメージ | 最初に覚えること |
| --- | --- | --- |
| AI | 分野全体 | 理解、生成、判断、計画を機械で扱う |
| モデル | 能力の中心 | 入力に対して有用そうな出力を生成する |
| LLM | モデルの一種 | 言語、対話、コードに強い |

## なぜ LLM は賢く見えるのか

LLM は大量のデータで訓練され、言葉、知識、パターン、推論らしい流れの関係を学びます。prompt を渡すと、現在の context に基づいて次に続く内容を生成します。

だから便利である一方、間違いも起こります。LLM は「もっともらしい文章」を作るのが得意ですが、すべての文が正しい、最新である、実行可能であるとは限りません。

## 日常利用での捉え方

LLM は「答えを出す機械」よりも、「考える、整理する、下書きを作る相手」と捉える方が安定します。

最初に任せやすい作業は次のようなものです。

- 長い文章を構造化して要約する。
- 目的に合わせて複数案を出す。
- メール、説明文、学習メモを書き直す。
- 問題を解く前に、不足情報を洗い出す。

逆に、根拠のない事実判断、高リスクな医療・法律・金融判断、最新情報、厳密な計算は、そのまま信じない方が安全です。

## サイト内で次に読むもの

まずは [AI Fundamentals](../../openai-academy/01-ai-fundamentals/ai-fundamentals/) を読むだけで十分です。AI が何に使えるのか、どんな注意点があるのかをつかめます。

モデルの内部に少し踏み込みたい場合は、[Transformer と Attention](../../../foundations/ai-developer-core/transformer-attention-developer-view/) に進むと、「モデルは魔法ではない」という感覚が持ちやすくなります。

## 実用的な見方

AI 製品の紹介を見たら、まず次の 3 つを確認してみてください。

1. どの種類のモデルを使っているのか。
2. そのモデルはどんな context や tool を見られるのか。
3. 出力は retrieval、eval、人の review で支えられているのか。

この 3 つが見えると、デモ動画だけを見るよりずっと現実に近い理解になります。
