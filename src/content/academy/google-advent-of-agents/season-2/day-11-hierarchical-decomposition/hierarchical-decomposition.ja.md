---
title: "Google Advent of Agents S2 Day 11：Hierarchical Decomposition"
date: 2026-05-07
category: academy
description: "大きなタスクを、委任、受入、統合できるタスクツリーに分解する。"
plainSummary: "Season 2 Day 11 を、設計境界、実践タスク、本番リスク、チェックリストに整理したオリジナル講義ノート。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-11-hierarchical-decomposition/cover.svg"
tags:
  - Agent
  - AI Engineering
lang: ja
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 11：Multi-Agent Patterns: Hierarchical Decomposition"
  moduleOrder: 211
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/11"
  prerequisites:
    - "先に読むとよいもの：Google Advent of Agents：エージェント工学の実践マップ"
draft: false
---

![Google Advent of Agents S2 Day 11：Hierarchical Decomposition カバー](/images/academy/google-advent-of-agents/season-2/day-11-hierarchical-decomposition/cover.svg)

**注記：** このページは Google Advent of Agents Season 2 Day 11 の公開テーマを主線にし、Season 1 の関連トピックを補助線として使った学習ノートです。公式翻訳ではなく、本站向けのエージェント工学講義として再構成しています。

## この日の問い

大きなタスクを、委任、受入、統合できるタスクツリーに分解する。

今日の成果物は、上位目標、子タスク、依存関係、完了定義、レビュー点を持つタスクツリーです。読むだけで終わらせず、あとからレビューできる設計メモか lab として残します。

## システムパターン

![Day 11 システムパターン](/images/academy/google-advent-of-agents/season-2/day-11-hierarchical-decomposition/diagram.svg)

この図は、Day 11 のテーマを「入力から成果物、本番リスクまで」の流れとして読むためのものです。重要なのは、機能名を覚えることではなく、どの境界が増え、どの状態を記録し、どこで止められるかを説明できることです。

## 三つの要点

- 階層分解の中心はタスク境界であり、manager Agent に会議させることではない。
- 各子タスクには入力、出力、完了定義が必要である。
- 統合層は依存、矛盾、漏れを確認する。

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

旧いサポートシステムを新基盤へ移行する場合、manager Agent が全計画を書くのではありません。データ移行、権限モデル、統合テスト、ユーザー教育、rollback の五つに分け、各線に owner、成果物、受入基準を持たせます。

## 実装スケッチ

これは完全なコードではありません。公開前に設計メモや README に残す構造化スケッチです。reviewer が境界、状態、受入条件を確認できるようにします。

```yaml
migration_tree:
  data: {owner: data_agent, done: sample_verified}
  auth: {owner: security_agent, done: least_privilege_reviewed}
  rollout: {owner: platform_agent, done: rollback_tested}
```

## ケース分解

- **業務トリガー：** 大規模移行や新規 release は、一つの Agent が一度で計画し切る単発 task ではない。
- **Agent 境界：** 親 Agent は tree 分解、受入基準、依存関係を管理し、子 Agent は自分の範囲だけで artifact を出す。
- **受入証拠：** task tree から owner、依存、blocker、各 leaf task の完了証拠が見える。

## 最小 Lab

移行または調査タスクを三層以内のツリーに分け、各リーフに完了条件を書く。

進め方：

1. 先に境界と失敗時の停止条件を書く。
2. 入力、出力、状態、権限を一枚の表にする。
3. 最小 happy path を実装または疑似コード化する。
4. すぐに失敗経路の eval を一つ足す。
5. 実行ログを見て、人間が後から説明できるか確認する。

## Season 1 で補う背景

Season 1 Day 14 / Day 23：A2A 協調と耐久実行が階層タスクの土台になる。

Season 1 は基礎線、Season 2 は応用と本番化の線です。この日のテーマを読むときは、Season 1 がどの前提を補っているかを押さえると理解しやすくなります。

## 本番化リスク

タスクツリーが深すぎると、状態、予算、責任境界が崩れる。

| リスク | 確認する問い |
| --- | --- |
| 境界が曖昧 | どのコンポーネントが責任を持つか説明できるか。 |
| 権限が広い | 現在のユーザーとタスクに必要な scope だけか。 |
| 観測できない | 失敗時に trace と artifact から原因を追えるか。 |
| eval がない | 次回の品質低下を検知できるか。 |
| 人間が理解できない | 承認や例外処理の理由が UI またはログに残るか。 |

## チェックリスト

- Day 11 のテーマを一文で説明できる。
- 成果物をファイル、図、schema、または checklist として残した。
- Season 1 の補助トピックを把握した。
- 最小 lab に失敗経路を入れた。
- 本番化前の権限、観測、eval リスクを一つ以上言える。

## 参考リソース

- [Advent of Agents Season 2 Day 11](https://adventofagents.com/2026/03/11)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
