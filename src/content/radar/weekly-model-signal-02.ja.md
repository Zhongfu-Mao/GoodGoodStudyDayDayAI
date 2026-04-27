---
title: "週間モデル動向：RAG 検索と Agent 編成"
date: 2026-04-08
category: radar
cadence: weekly
description: "今週の注目：RAG 検索品質の新ベンチマーク、Agent ツール呼び出しチェーンのオブザーバビリティの進展。"
difficulty: beginner
plainSummary: "今週のシグナル：RAG 検索精度の新しい評価基準が登場し、Agent のツール呼び出しに標準化された追跡・デバッグツールが出始めています。"
tags:
  - Agent
  - RAG
lang: ja
coverImage: /images/radar/weekly-model-signal-02-infographic.png
draft: false
---

## 今週の注目

### RAG 検索品質：新ベンチマーク

| 次元 | 測定内容 | 代表指標 |
| --- | --- | --- |
| 検索関連性 | 取得文書が質問に関連するか | Recall@K、MRR |
| 回答忠実度 | 生成した答えが取得文書に忠実か | Faithfulness Score |
| 引用正確性 | 引用が正しいソースとパラグラフを指すか | Citation Precision |

主な発見：chunk 戦略がモデル選択よりも検索品質への影響が大きい。hybrid retrieval（ベクトル＋キーワード）で関連性が 15〜20% 向上。

### Agent ツール呼び出し：オブザーバビリティ

- **呼び出しチェーン追跡**：分散トレーシングに似た trace ID でツール呼び出しを串連。
- **コスト帰属**：各ツール呼び出しの token 消費とレイテンシを個別記録。
- **失敗リプレイ**：失敗時の完全な context を保存し、ローカルで再現可能。

## 今週の判断

RAG は「検索できる」から「正確に検索する」へ。Agent のオブザーバビリティは初期段階だが方向は明確。開発初日からログを入れましょう。

## 関連記事

- [RAG Minimum System](../../engineering/ai-developer-core/rag-minimum-system/)
- [Embeddings・ベクトルと RAG](../../foundations/ai-developer-core/embeddings-vector-rag/)
- [Agent Harness](../../engineering/ai-developer-core/agent-harness-logging-approval-replay/)
