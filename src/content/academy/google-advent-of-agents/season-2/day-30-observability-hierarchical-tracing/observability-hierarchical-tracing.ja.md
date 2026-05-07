---
title: "Google Advent of Agents S2 Day 30：Observability と階層 tracing"
date: 2026-05-07
category: academy
description: "trace、span、artifact、replay で Agent の中間軌跡を見えるようにする。"
plainSummary: "Season 2 Day 30 を、設計境界、実践タスク、本番リスク、チェックリストに整理したオリジナル講義ノート。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-30-observability-hierarchical-tracing/cover.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: ja
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 30：Observability"
  moduleOrder: 230
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/30"
  prerequisites:
    - "先に読むとよいもの：Google Advent of Agents：エージェント工学の実践マップ"
draft: false
---

![Google Advent of Agents S2 Day 30：Observability と階層 tracing カバー](/images/academy/google-advent-of-agents/season-2/day-30-observability-hierarchical-tracing/cover.svg)

**注記：** このページは Google Advent of Agents Season 2 Day 30 の公開テーマを主線にし、Season 1 の関連トピックを補助線として使った学習ノートです。公式翻訳ではなく、本站向けのエージェント工学講義として再構成しています。

## この日の問い

trace、span、artifact、replay で Agent の中間軌跡を見えるようにする。

今日の成果物は、request、planning、tool call、sub-agent、approval、output の trace schemaです。読むだけで終わらせず、あとからレビューできる設計メモか lab として残します。

## システムパターン

![Day 30 システムパターン](/images/academy/google-advent-of-agents/season-2/day-30-observability-hierarchical-tracing/diagram.svg)

この図は、Day 30 のテーマを「入力から成果物、本番リスクまで」の流れとして読むためのものです。重要なのは、機能名を覚えることではなく、どの境界が増え、どの状態を記録し、どこで止められるかを説明できることです。

## 三つの要点

- 最終回答だけでは十分なログではない。
- trace はツール選択、引数、結果、承認を覆う。
- Replay は事故復盤を工学的操作に変える。

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

Agent が誤ったデプロイ提案をしたとき、trace はどの runbook を読んだか、どの tool を呼んだか、どの sub-agent が誤信号を出したか、ユーザー承認があったかを答えられるべきです。

## 実装スケッチ

これは完全なコードではありません。公開前に設計メモや README に残す構造化スケッチです。reviewer が境界、状態、受入条件を確認できるようにします。

```yaml
trace:
  request_span: user_goal
  retrieval_span: runbook_sources
  tool_span: deployment_status
  subagent_span: risk_review
  approval_span: user_decision
```

## ケース分解

- **業務トリガー：** multi-agent system が失敗したとき、final answer だけでは retrieval、tool、sub-agent、approval のどこが原因か分からない。
- **Agent 境界：** Trace は request、retrieval、tool、sub-agent、approval、output を階層的に記録する。
- **受入証拠：** incident review が一つの request id から full path、latency、error、user action を追える。

## 最小 Lab

複数ツールの Agent run について span 階層を描き、各 span の入力出力を書く。

進め方：

1. 先に境界と失敗時の停止条件を書く。
2. 入力、出力、状態、権限を一枚の表にする。
3. 最小 happy path を実装または疑似コード化する。
4. すぐに失敗経路の eval を一つ足す。
5. 実行ログを見て、人間が後から説明できるか確認する。

## Season 1 で補う背景

Season 1 Day 5：Production Observability が直接の基礎になる。

Season 1 は基礎線、Season 2 は応用と本番化の線です。この日のテーマを読むときは、Season 1 がどの前提を補っているかを押さえると理解しやすくなります。

## 本番化リスク

trace のない Agent 事故は推測でしか調べられない。

| リスク | 確認する問い |
| --- | --- |
| 境界が曖昧 | どのコンポーネントが責任を持つか説明できるか。 |
| 権限が広い | 現在のユーザーとタスクに必要な scope だけか。 |
| 観測できない | 失敗時に trace と artifact から原因を追えるか。 |
| eval がない | 次回の品質低下を検知できるか。 |
| 人間が理解できない | 承認や例外処理の理由が UI またはログに残るか。 |

## Gmail で確認できた強調点

この日の Gmail newsletter では、OpenTelemetry、Arize Phoenix、階層 tracing、span replay が強調されていました。

公開記事では Gmail 本文や内部リンクを引用せず、テーマの優先度と実務上の角度だけを使います。

## チェックリスト

- Day 30 のテーマを一文で説明できる。
- 成果物をファイル、図、schema、または checklist として残した。
- Season 1 の補助トピックを把握した。
- 最小 lab に失敗経路を入れた。
- 本番化前の権限、観測、eval リスクを一つ以上言える。

## 参考リソース

- [Advent of Agents Season 2 Day 30](https://adventofagents.com/2026/03/30)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
