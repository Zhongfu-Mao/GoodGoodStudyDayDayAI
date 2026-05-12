---
title: "Google Advent of Agents S2 Day 13：Iterative Refinement"
date: 2026-05-07
category: academy
description: "Skills、MCP、コード実行、レビュー循環を組み合わせ、収束する改善プロセスにする。"
plainSummary: "Season 2 Day 13 を、設計境界、実践タスク、本番リスク、チェックリストに整理したオリジナル講義ノート。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-13-iterative-refinement/cover.svg"
tags:
  - Agent
  - AI Engineering
lang: ja
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 13：Multi-Agent Patterns: Iterative Refinement"
  moduleOrder: 213
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/13"
  prerequisites:
    - "先に読むとよいもの：Google Advent of Agents：エージェント工学の実践マップ"
draft: false
---

![Google Advent of Agents S2 Day 13：Iterative Refinement カバー](/images/academy/google-advent-of-agents/season-2/day-13-iterative-refinement/cover.svg)

**注記：** このページは Google Advent of Agents Season 2 Day 13 の公開テーマを主線にし、Season 1 の関連トピックを補助線として使った学習ノートです。公式翻訳ではなく、本站向けのエージェント工学講義として再構成しています。

## この日の問い

Skills、MCP、コード実行、レビュー循環を組み合わせ、収束する改善プロセスにする。

今日の成果物は、計画、実行、検証、修正、停止条件を持つ refinement loopです。読むだけで終わらせず、あとからレビューできる設計メモか lab として残します。

## システムパターン

![Day 13 システムパターン](/images/academy/google-advent-of-agents/season-2/day-13-iterative-refinement/diagram.svg)

この図は、Day 13 のテーマを「入力から成果物、本番リスクまで」の流れとして読むためのものです。重要なのは、機能名を覚えることではなく、どの境界が増え、どの状態を記録し、どこで止められるかを説明できることです。

## 三つの要点

- 反復は無限リトライではなく、検証付きの収束プロセスである。
- 各ラウンドで何をなぜ変えたかを書く。
- ツール結果は状態に入り、次の prompt を埋め尽くすべきではない。

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

failing test を直すとき、Agent は各ラウンドで失敗証拠を説明し、最小変更を行い、対象テストを再実行します。通ってから整理します。これで iterative refinement は収束し、広範囲の無秩序な変更を避けられます。

## 実装スケッチ

これは完全なコードではありません。公開前に設計メモや README に残す構造化スケッチです。reviewer が境界、状態、受入条件を確認できるようにします。

```yaml
iteration:
  observe: failing_test_output
  change: minimal_patch
  verify: targeted_test
  stop_when: test_passes
```

## ケース分解

- **業務トリガー：** Agent が bug を直すと、変更範囲が広がりすぎ、どの step で直ったか分からなくなりやすい。
- **Agent 境界：** 各 iteration は証拠観察、最小変更、targeted verification に限定し、通る前に整理 refactor をしない。
- **受入証拠：** commit または run log で、各 round の失敗理由、変更範囲、検証結果を追える。

## 最小 Lab

小さなスクリプト修正で、失敗ログ、修正、テスト、振り返りを順に行う。

進め方：

1. 先に境界と失敗時の停止条件を書く。
2. 入力、出力、状態、権限を一枚の表にする。
3. 最小 happy path を実装または疑似コード化する。
4. すぐに失敗経路の eval を一つ足す。
5. 実行ログを見て、人間が後から説明できるか確認する。

## Season 1 で補う背景

Season 1 Day 7 / Day 8：コード実行とコンテキスト層が反復改善の基礎になる。

Season 1 は基礎線、Season 2 は応用と本番化の線です。この日のテーマを読むときは、Season 1 がどの前提を補っているかを押さえると理解しやすくなります。

## 本番化リスク

テストと停止条件がなければ、反復はランダムな試行錯誤になる。

| リスク | 確認する問い |
| --- | --- |
| 境界が曖昧 | どのコンポーネントが責任を持つか説明できるか。 |
| 権限が広い | 現在のユーザーとタスクに必要な scope だけか。 |
| 観測できない | 失敗時に trace と artifact から原因を追えるか。 |
| eval がない | 次回の品質低下を検知できるか。 |
| 人間が理解できない | 承認や例外処理の理由が UI またはログに残るか。 |

## チェックリスト

- Day 13 のテーマを一文で説明できる。
- 成果物をファイル、図、schema、または checklist として残した。
- Season 1 の補助トピックを把握した。
- 最小 lab に失敗経路を入れた。
- 本番化前の権限、観測、eval リスクを一つ以上言える。

## 参考リソース

- [Advent of Agents Season 2 Day 13](https://adventofagents.com/2026/03/13)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
