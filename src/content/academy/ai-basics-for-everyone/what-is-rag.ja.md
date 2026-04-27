---
title: "AI Basics for Everyone：RAG とは何か、なぜ単なる検索ではないのか"
date: 2026-04-27
category: academy
description: "RAG を、retrieval、context、generation、引用、eval の組み合わせとして説明します。"
coverImage: "/images/academy/ai-basics-for-everyone/rag.svg"
difficulty: beginner
plainSummary: "RAG は AI が先に関連資料を探し、その資料を context に入れて回答する方法です。単なる検索ではなく、検索、引用、生成、評価の組み合わせです。"
tags:
  - "RAG"
lang: ja
academy:
  series: "AI Basics for Everyone"
  module: "基本概念"
  moduleOrder: 5
  source: "サイト内 Academy / Foundations / Engineering ガイド"
  prerequisites: []
draft: false
---

## まず一言で

RAG は Retrieval-Augmented Generation、つまり「検索で補強された生成」です。AI が先に関連資料を探し、その資料を context に入れて回答します。

単なる検索ではありません。検索は資料を見つけるだけですが、RAG は資料の切り方、探し方、引用、回答、評価まで含みます。

## RAG が解く問題

LLM の内部知識は古くなることがあります。また、社内文書、プロジェクト資料、講座メモ、内部手順を最初から知っているわけではありません。RAG は、そうした外部資料を一時的にモデルの前に置く方法です。

向いている場面は次の通りです。

- 社内 knowledge base の Q&A。
- 文書アシスタント。
- 講座資料の検索。
- カスタマーサポート。
- 出典つきの research assistant。

## RAG の構成

| 工程 | 重要な問い |
| --- | --- |
| 資料準備 | どの資料が信頼でき、更新されるか |
| Chunking | どの単位で分けると探しやすいか |
| Retrieval | 本当に関連する断片を見つけられるか |
| Context 注入 | 断片をどうモデルに渡すか |
| Generation | 資料に基づいて答えさせるか |
| Evaluation | 見落とし、誤引用、作り話をどう見つけるか |

RAG の難しさは、vector database を接続することだけではありません。資料品質、検索設計、eval が同じくらい重要です。

## よくある誤解

RAG は自動的にすべての回答を正しくするものではありません。検索が間違えば、回答も間違います。

すべての文書を prompt に詰め込むことでもありません。Context Window には限界があるため、資料を整理する必要があります。

また、RAG は技術だけの問題ではありません。誰がどの資料を見られるかは、権限と governance の問題です。

## サイト内で次に読むもの

[RAG](../../openai-academy/07-building-with-ai/rag/) で、OpenAI Academy の基礎的な整理を読めます。

Embedding、vector、knowledge retrieval を理解したい場合は、[Embeddings、Vector、RAG](../../../foundations/ai-developer-core/embeddings-vector-rag/) に進みます。

小さく作ってみたい場合は、[RAG Minimum System](../../../engineering/ai-developer-core/rag-minimum-system/) が実装寄りの入口です。

## 実用的な見方

Knowledge base AI を見る時は、次を確認します。

1. どの資料を検索しているのか。
2. 資料はどれくらい更新されるのか。
3. 回答に出典があるのか。
4. 見つからない時に「わからない」と言えるのか。
5. Retrieval と回答品質をどう評価しているのか。

この問いは、どのモデルを使っているか以上に信頼性を左右します。
