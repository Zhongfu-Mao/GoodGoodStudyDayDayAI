---
title: "Google Advent of Agents S2 Day 20：ADK Agent Harness"
date: 2026-05-07
category: academy
description: "harness によって生成、検証、修正、記録を再現可能な開発ループにする。"
plainSummary: "Season 2 Day 20 を、設計境界、実践タスク、本番リスク、チェックリストに整理したオリジナル講義ノート。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-20-adk-agent-harness/cover.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: ja
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 20：ADK Agent Harness"
  moduleOrder: 220
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/20"
  prerequisites:
    - "先に読むとよいもの：Google Advent of Agents：エージェント工学の実践マップ"
draft: false
---

![Google Advent of Agents S2 Day 20：ADK Agent Harness カバー](/images/academy/google-advent-of-agents/season-2/day-20-adk-agent-harness/cover.svg)

**注記：** このページは Google Advent of Agents Season 2 Day 20 の公開テーマを主線にし、Season 1 の関連トピックを補助線として使った学習ノートです。公式翻訳ではなく、本站向けのエージェント工学講義として再構成しています。

## この日の問い

harness によって生成、検証、修正、記録を再現可能な開発ループにする。

今日の成果物は、入力セット、実行コマンド、validator、出力 artifact、失敗処理を持つ harness runbookです。読むだけで終わらせず、あとからレビューできる設計メモか lab として残します。

## システムパターン

![Day 20 システムパターン](/images/academy/google-advent-of-agents/season-2/day-20-adk-agent-harness/diagram.svg)

この図は、Day 20 のテーマを「入力から成果物、本番リスクまで」の流れとして読むためのものです。重要なのは、機能名を覚えることではなく、どの境界が増え、どの状態を記録し、どこで止められるかを説明できることです。

## 三つの要点

- Harness は手動試用を再実行可能なものに変える。
- validator はテキストだけでなく構造、軌跡、リスクを確認する。
- 失敗要約は一回の成功 demo より価値がある。

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

公開前に Agent へ三問だけ手動で聞くのは足りません。Harness は代表タスク 20 個を固定し、prompt、tool、model を変えるたびに実行して、通過率、失敗分類、人間レビュー対象を出します。

## 実装スケッチ

これは完全なコードではありません。公開前に設計メモや README に残す構造化スケッチです。reviewer が境界、状態、受入条件を確認できるようにします。

```yaml
harness_run:
  tasks: 20
  checks: [schema, trajectory, safety, citation]
  report: pass_rate_and_failures.md
```

## ケース分解

- **業務トリガー：** 手動で数問試すだけでは production traffic を代表できず、prompt change の regression も見落としやすい。
- **Agent 境界：** Harness は代表 task、failure task、safety task を固定し、各変更後の最小 regression suite にする。
- **受入証拠：** report が failure type ごとに集計され、人間 review が必要な sample を示す。

## 最小 Lab

Agent に 5 個の固定タスクを与え、結果表と失敗要約を生成する。

進め方：

1. 先に境界と失敗時の停止条件を書く。
2. 入力、出力、状態、権限を一枚の表にする。
3. 最小 happy path を実装または疑似コード化する。
4. すぐに失敗経路の eval を一つ足す。
5. 実行ログを見て、人間が後から説明できるか確認する。

## Season 1 で補う背景

Season 1 Day 5 / Day 22：観測と安全が harness validator の情報源になる。

Season 1 は基礎線、Season 2 は応用と本番化の線です。この日のテーマを読むときは、Season 1 がどの前提を補っているかを押さえると理解しやすくなります。

## 本番化リスク

harness のない Agent 品質は印象でしか判断できない。

| リスク | 確認する問い |
| --- | --- |
| 境界が曖昧 | どのコンポーネントが責任を持つか説明できるか。 |
| 権限が広い | 現在のユーザーとタスクに必要な scope だけか。 |
| 観測できない | 失敗時に trace と artifact から原因を追えるか。 |
| eval がない | 次回の品質低下を検知できるか。 |
| 人間が理解できない | 承認や例外処理の理由が UI またはログに残るか。 |

## チェックリスト

- Day 20 のテーマを一文で説明できる。
- 成果物をファイル、図、schema、または checklist として残した。
- Season 1 の補助トピックを把握した。
- 最小 lab に失敗経路を入れた。
- 本番化前の権限、観測、eval リスクを一つ以上言える。

## 参考リソース

- [Advent of Agents Season 2 Day 20](https://adventofagents.com/2026/03/20)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
