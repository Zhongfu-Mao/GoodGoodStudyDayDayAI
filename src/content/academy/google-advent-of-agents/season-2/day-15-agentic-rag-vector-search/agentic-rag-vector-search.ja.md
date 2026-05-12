---
title: "Google Advent of Agents S2 Day 15：Agentic RAG と Grounding"
date: 2026-05-07
category: academy
description: "検索を付録資料ではなく、Agent が計画、検証、引用できる能力にする。"
plainSummary: "Season 2 Day 15 を、設計境界、実践タスク、本番リスク、チェックリストに整理したオリジナル講義ノート。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-15-agentic-rag-vector-search/cover.svg"
tags:
  - Agent
  - AI Engineering
lang: ja
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 15：Grounding with ADK: Agentic RAG with Vector Search 2.0"
  moduleOrder: 215
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/15"
  prerequisites:
    - "先に読むとよいもの：Google Advent of Agents：エージェント工学の実践マップ"
draft: false
---

![Google Advent of Agents S2 Day 15：Agentic RAG と Grounding カバー](/images/academy/google-advent-of-agents/season-2/day-15-agentic-rag-vector-search/cover.svg)

**注記：** このページは Google Advent of Agents Season 2 Day 15 の公開テーマを主線にし、Season 1 の関連トピックを補助線として使った学習ノートです。公式翻訳ではなく、本站向けのエージェント工学講義として再構成しています。

## この日の問い

検索を付録資料ではなく、Agent が計画、検証、引用できる能力にする。

今日の成果物は、検索意図、フィルタ条件、引用形式、結果なし処理を持つ RAG contractです。読むだけで終わらせず、あとからレビューできる設計メモか lab として残します。

## システムパターン

![Day 15 システムパターン](/images/academy/google-advent-of-agents/season-2/day-15-agentic-rag-vector-search/diagram.svg)

この図は、Day 15 のテーマを「入力から成果物、本番リスクまで」の流れとして読むためのものです。重要なのは、機能名を覚えることではなく、どの境界が増え、どの状態を記録し、どこで止められるかを説明できることです。

## 三つの要点

- Agentic RAG はいつ何を検索し、証拠をどう使うかに注目する。
- 結果なしも結果であり、勝手に作ってはいけない。
- 引用と反証は類似度スコアより品質に近い。

## 設計の型

| 設計項目 | 確認すること |
| --- | --- |
| 境界 | この能力は prompt、tool、skill、memory、Agent、UI、policy のどれか。 |
| 入出力 | 下流が依存できる schema と、人間が読める artifact は何か。 |
| 状態 | 一時状態、長期記憶、監査ログをどう分けるか。 |
| 権限 | 誰の identity で、どの scope のツールを呼ぶか。 |
| 評価 | happy path、失敗経路、拒否ケースをどうテストするか。 |
| 観測 | どの trace、span、artifact を残すか。 |

## 公開レベルのケース

規程 Q&A Agent は類似度検索だけでは不十分です。質問が定義、手順、例外のどれかを判断し、支持証拠と反証を検索します。根拠がなければ、信頼できそうな回答を作らず「資料不足」と返します。

## 実装スケッチ

これは完全なコードではありません。公開前に設計メモや README に残す構造化スケッチです。reviewer が境界、状態、受入条件を確認できるようにします。

```yaml
retrieval_plan:
  intent: exception_policy
  positive_evidence: required
  counter_evidence: required
  no_evidence_behavior: refuse_to_infer
```

## ケース分解

- **業務トリガー：** 規程、法務、技術サポート Q&A は vector similarity だけでは危険で、関連段落を答えと誤認しやすい。
- **Agent 境界：** Agent は質問 type を判断し、支持証拠と反証を検索し、必要なら clarification または推論拒否を行う。
- **受入証拠：** 回答には evidence、適用条件、答えられない場合の停止理由を付ける。

## 最小 Lab

QA Agent に、事実検索、反証検索、背景補足検索の三種類を設計する。

進め方：

1. 先に境界と失敗時の停止条件を書く。
2. 入力、出力、状態、権限を一枚の表にする。
3. 最小 happy path を実装または疑似コード化する。
4. すぐに失敗経路の eval を一つ足す。
5. 実行ログを見て、人間が後から説明できるか確認する。

## Season 1 で補う背景

Season 1 Day 8 / Day 10：コンテキスト管理と圧縮が検索結果の使われ方を決める。

Season 1 は基礎線、Season 2 は応用と本番化の線です。この日のテーマを読むときは、Season 1 がどの前提を補っているかを押さえると理解しやすくなります。

## 本番化リスク

出典と信頼度のない検索結果は、幻覚を grounded answer に見せかける。

| リスク | 確認する問い |
| --- | --- |
| 境界が曖昧 | どのコンポーネントが責任を持つか説明できるか。 |
| 権限が広い | 現在のユーザーとタスクに必要な scope だけか。 |
| 観測できない | 失敗時に trace と artifact から原因を追えるか。 |
| eval がない | 次回の品質低下を検知できるか。 |
| 人間が理解できない | 承認や例外処理の理由が UI またはログに残るか。 |

## チェックリスト

- Day 15 のテーマを一文で説明できる。
- 成果物をファイル、図、schema、または checklist として残した。
- Season 1 の補助トピックを把握した。
- 最小 lab に失敗経路を入れた。
- 本番化前の権限、観測、eval リスクを一つ以上言える。

## 参考リソース

- [Advent of Agents Season 2 Day 15](https://adventofagents.com/2026/03/15)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
