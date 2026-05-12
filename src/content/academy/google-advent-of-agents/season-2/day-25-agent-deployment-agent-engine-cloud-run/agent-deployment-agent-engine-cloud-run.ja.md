---
title: "Google Advent of Agents S2 Day 25：Agent Deployment"
date: 2026-05-07
category: academy
description: "ローカル Agent を Agent Engine または Cloud Run へ出し、リリース、rollback、health check を補う。"
plainSummary: "Season 2 Day 25 を、設計境界、実践タスク、本番リスク、チェックリストに整理したオリジナル講義ノート。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-25-agent-deployment-agent-engine-cloud-run/cover.svg"
tags:
  - Agent
  - AI Engineering
lang: ja
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 25：Agent Deployment"
  moduleOrder: 225
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/25"
  prerequisites:
    - "先に読むとよいもの：Google Advent of Agents：エージェント工学の実践マップ"
draft: false
---

![Google Advent of Agents S2 Day 25：Agent Deployment カバー](/images/academy/google-advent-of-agents/season-2/day-25-agent-deployment-agent-engine-cloud-run/cover.svg)

**注記：** このページは Google Advent of Agents Season 2 Day 25 の公開テーマを主線にし、Season 1 の関連トピックを補助線として使った学習ノートです。公式翻訳ではなく、本站向けのエージェント工学講義として再構成しています。

## この日の問い

ローカル Agent を Agent Engine または Cloud Run へ出し、リリース、rollback、health check を補う。

今日の成果物は、環境、設定、鍵、health check、rollback、ログを含む deployment checklistです。読むだけで終わらせず、あとからレビューできる設計メモか lab として残します。

## システムパターン

![Day 25 システムパターン](/images/academy/google-advent-of-agents/season-2/day-25-agent-deployment-agent-engine-cloud-run/diagram.svg)

この図は、Day 25 のテーマを「入力から成果物、本番リスクまで」の流れとして読むためのものです。重要なのは、機能名を覚えることではなく、どの境界が増え、どの状態を記録し、どこで止められるかを説明できることです。

## 三つの要点

- デプロイは起動成功ではなく、rollback、観測、サポート可能性である。
- health check は最小 Agent task を走らせる。
- 設定と鍵を prompt やコードへ隠さない。

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

Agent のデプロイでは `/healthz` だけでは足りません。最小タスクを走らせ、model、読み取り専用 tool、ログ書き込み、禁止 tool のブロックを確認します。これが通って初めてリリース候補です。

## 実装スケッチ

これは完全なコードではありません。公開前に設計メモや README に残す構造化スケッチです。reviewer が境界、状態、受入条件を確認できるようにします。

```yaml
health_check:
  model_ping: required
  readonly_tool_call: required
  log_write: required
  forbidden_tool_blocked: required
```

## ケース分解

- **業務トリガー：** Agent が local で動いても、cloud 上の identity、network、logging、tool permission が正しいとは限らない。
- **Agent 境界：** deployment verification は process health だけでなく、最小の real task を含める。
- **受入証拠：** release record に version、environment、health task result、rollback command、monitoring entry が残る。

## 最小 Lab

ローカル ADK Agent に、デプロイ前チェックリストと最小 health check task を書く。

進め方：

1. 先に境界と失敗時の停止条件を書く。
2. 入力、出力、状態、権限を一枚の表にする。
3. 最小 happy path を実装または疑似コード化する。
4. すぐに失敗経路の eval を一つ足す。
5. 実行ログを見て、人間が後から説明できるか確認する。

## Season 1 で補う背景

Season 1 Day 4 / Day 23：source deployment と durable agents がデプロイの基礎になる。

Season 1 は基礎線、Season 2 は応用と本番化の線です。この日のテーマを読むときは、Season 1 がどの前提を補っているかを押さえると理解しやすくなります。

## 本番化リスク

HTTP 200 だけを見る Agent は、起動してもタスクが使えない可能性がある。

| リスク | 確認する問い |
| --- | --- |
| 境界が曖昧 | どのコンポーネントが責任を持つか説明できるか。 |
| 権限が広い | 現在のユーザーとタスクに必要な scope だけか。 |
| 観測できない | 失敗時に trace と artifact から原因を追えるか。 |
| eval がない | 次回の品質低下を検知できるか。 |
| 人間が理解できない | 承認や例外処理の理由が UI またはログに残るか。 |

## Gmail で確認できた強調点

この日の Gmail newsletter では、Vertex AI Agent Engine と Cloud Run のデプロイ経路が強調されていました。

公開記事では Gmail 本文や内部リンクを引用せず、テーマの優先度と実務上の角度だけを使います。

## チェックリスト

- Day 25 のテーマを一文で説明できる。
- 成果物をファイル、図、schema、または checklist として残した。
- Season 1 の補助トピックを把握した。
- 最小 lab に失敗経路を入れた。
- 本番化前の権限、観測、eval リスクを一つ以上言える。

## 参考リソース

- [Advent of Agents Season 2 Day 25](https://adventofagents.com/2026/03/25)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
