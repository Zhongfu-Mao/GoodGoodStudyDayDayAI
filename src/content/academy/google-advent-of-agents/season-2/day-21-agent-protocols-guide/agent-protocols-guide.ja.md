---
title: "Google Advent of Agents S2 Day 21：Agent Protocols 全景"
date: 2026-05-07
category: academy
description: "MCP、A2A、A2UI、AG-UI、AP2 などを略語表ではなく、それぞれの境界に戻す。"
plainSummary: "Season 2 Day 21 を、設計境界、実践タスク、本番リスク、チェックリストに整理したオリジナル講義ノート。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-21-agent-protocols-guide/cover.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: ja
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 21：Developer's Guide to AI Agent Protocols"
  moduleOrder: 221
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/21"
  prerequisites:
    - "先に読むとよいもの：Google Advent of Agents：エージェント工学の実践マップ"
draft: false
---

![Google Advent of Agents S2 Day 21：Agent Protocols 全景 カバー](/images/academy/google-advent-of-agents/season-2/day-21-agent-protocols-guide/cover.svg)

**注記：** このページは Google Advent of Agents Season 2 Day 21 の公開テーマを主線にし、Season 1 の関連トピックを補助線として使った学習ノートです。公式翻訳ではなく、本站向けのエージェント工学講義として再構成しています。

## この日の問い

MCP、A2A、A2UI、AG-UI、AP2 などを略語表ではなく、それぞれの境界に戻す。

今日の成果物は、ツール、Agent 協調、UI、支払い、治理を分ける protocol boundary matrixです。読むだけで終わらせず、あとからレビューできる設計メモか lab として残します。

## システムパターン

![Day 21 システムパターン](/images/academy/google-advent-of-agents/season-2/day-21-agent-protocols-guide/diagram.svg)

この図は、Day 21 のテーマを「入力から成果物、本番リスクまで」の流れとして読むためのものです。重要なのは、機能名を覚えることではなく、どの境界が増え、どの状態を記録し、どこで止められるかを説明できることです。

## 三つの要点

- プロトコルは境界の言語であり、万能解ではない。
- MCP はツール、A2A は Agent 協調、A2UI は対話を扱う。
- 支払いと高リスク操作には追加 policy と承認が必要。

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

経費精算 Agent では MCP、A2A、A2UI、payment policy が同時に出ます。MCP は領収書検索、A2A は財務ルール Agent への委任、A2UI はユーザー確認、支払い関連操作は追加 policy gate です。

## 実装スケッチ

これは完全なコードではありません。公開前に設計メモや README に残す構造化スケッチです。reviewer が境界、状態、受入条件を確認できるようにします。

```yaml
protocol_map:
  receipt_lookup: MCP
  finance_review: A2A
  user_confirmation: A2UI
  payment_action: policy_gate
```

## ケース分解

- **業務トリガー：** 現代 Agent system では MCP、A2A、A2UI、identity、safety policy が同時に出るため、混在時に境界が曖昧になりやすい。
- **Agent 境界：** まず protocol map を描き、tool、collaboration、UI、policy gate をどの protocol が担うか決める。
- **受入証拠：** design doc が各 cross-system call の protocol、identity、state、failure handling を説明できる。

## 最小 Lab

端到端タスクの各接続点を tool、A2A、UI payload、policy gate に分類する。

進め方：

1. 先に境界と失敗時の停止条件を書く。
2. 入力、出力、状態、権限を一枚の表にする。
3. 最小 happy path を実装または疑似コード化する。
4. すぐに失敗経路の eval を一つ足す。
5. 実行ログを見て、人間が後から説明できるか確認する。

## Season 1 で補う背景

Season 1 Day 11 / Day 14 / Day 15 / Day 18：MCP、A2A、A2UI、API Registry の基礎。

Season 1 は基礎線、Season 2 は応用と本番化の線です。この日のテーマを読むときは、Season 1 がどの前提を補っているかを押さえると理解しやすくなります。

## 本番化リスク

プロトコル選択を誤ると、権限、状態、体験が同時に崩れる。

| リスク | 確認する問い |
| --- | --- |
| 境界が曖昧 | どのコンポーネントが責任を持つか説明できるか。 |
| 権限が広い | 現在のユーザーとタスクに必要な scope だけか。 |
| 観測できない | 失敗時に trace と artifact から原因を追えるか。 |
| eval がない | 次回の品質低下を検知できるか。 |
| 人間が理解できない | 承認や例外処理の理由が UI またはログに残るか。 |

## チェックリスト

- Day 21 のテーマを一文で説明できる。
- 成果物をファイル、図、schema、または checklist として残した。
- Season 1 の補助トピックを把握した。
- 最小 lab に失敗経路を入れた。
- 本番化前の権限、観測、eval リスクを一つ以上言える。

## 参考リソース

- [Advent of Agents Season 2 Day 21](https://adventofagents.com/2026/03/21)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
