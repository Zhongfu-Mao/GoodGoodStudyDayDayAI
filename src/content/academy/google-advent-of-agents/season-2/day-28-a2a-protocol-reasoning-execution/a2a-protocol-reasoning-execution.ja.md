---
title: "Google Advent of Agents S2 Day 28：A2A Protocol"
date: 2026-05-07
category: academy
description: "推論側と実行側を分離し、異なるサービス型 Agent がプロトコルで協調できるようにする。"
plainSummary: "Season 2 Day 28 を、設計境界、実践タスク、本番リスク、チェックリストに整理したオリジナル講義ノート。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-28-a2a-protocol-reasoning-execution/cover.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: ja
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 28：A2A Protocol"
  moduleOrder: 228
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/28"
  prerequisites:
    - "先に読むとよいもの：Google Advent of Agents：エージェント工学の実践マップ"
draft: false
---

![Google Advent of Agents S2 Day 28：A2A Protocol カバー](/images/academy/google-advent-of-agents/season-2/day-28-a2a-protocol-reasoning-execution/cover.svg)

**注記：** このページは Google Advent of Agents Season 2 Day 28 の公開テーマを主線にし、Season 1 の関連トピックを補助線として使った学習ノートです。公式翻訳ではなく、本站向けのエージェント工学講義として再構成しています。

## この日の問い

推論側と実行側を分離し、異なるサービス型 Agent がプロトコルで協調できるようにする。

今日の成果物は、能力発見、task payload、状態、結果、エラーを含む A2A task contractです。読むだけで終わらせず、あとからレビューできる設計メモか lab として残します。

## システムパターン

![Day 28 システムパターン](/images/academy/google-advent-of-agents/season-2/day-28-a2a-protocol-reasoning-execution/diagram.svg)

この図は、Day 28 のテーマを「入力から成果物、本番リスクまで」の流れとして読むためのものです。重要なのは、機能名を覚えることではなく、どの境界が増え、どの状態を記録し、どこで止められるかを説明できることです。

## 三つの要点

- A2A は別 Agent が実行責任を持つ場面に向く。
- 通常の tool call を A2A に包む必要はない。
- task 状態とエラー意味論がプロトコルの中心である。

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

本部 planner Agent は各地域システムの内部 API を知る必要がありません。A2A で「東京リージョンのデプロイ状態を確認する」タスクを Tokyo deployer Agent に渡し、状態、証拠、エラーを返してもらいます。

## 実装スケッチ

これは完全なコードではありません。公開前に設計メモや README に残す構造化スケッチです。reviewer が境界、状態、受入条件を確認できるようにします。

```yaml
a2a_task:
  target_agent: tokyo_deployer
  task: check_deployment_status
  required_result: [status, evidence, errors]
  caller: global_planner
```

## ケース分解

- **業務トリガー：** cross-team Agent collaboration では、caller が callee の内部 tool や DB を知るべきではない。
- **Agent 境界：** A2A は task、context、required result、error semantics を渡し、execution detail は target Agent 内に残す。
- **受入証拠：** call log が task delegation、target Agent、returned evidence、failure reason を示せる。

## 最小 Lab

planner Agent が deployer Agent へデプロイ検査を委任する payload を設計する。

進め方：

1. 先に境界と失敗時の停止条件を書く。
2. 入力、出力、状態、権限を一枚の表にする。
3. 最小 happy path を実装または疑似コード化する。
4. すぐに失敗経路の eval を一つ足す。
5. 実行ログを見て、人間が後から説明できるか確認する。

## Season 1 で補う背景

Season 1 Day 14 / Day 20 / Day 24：A2A、拡張、A2A-ify Anything。

Season 1 は基礎線、Season 2 は応用と本番化の線です。この日のテーマを読むときは、Season 1 がどの前提を補っているかを押さえると理解しやすくなります。

## 本番化リスク

A2A を乱用すると、単純な関数呼び出しが分散システム問題になる。

| リスク | 確認する問い |
| --- | --- |
| 境界が曖昧 | どのコンポーネントが責任を持つか説明できるか。 |
| 権限が広い | 現在のユーザーとタスクに必要な scope だけか。 |
| 観測できない | 失敗時に trace と artifact から原因を追えるか。 |
| eval がない | 次回の品質低下を検知できるか。 |
| 人間が理解できない | 承認や例外処理の理由が UI またはログに残るか。 |

## Gmail で確認できた強調点

この日の Gmail newsletter では、Python と Go のサービスをまたいで reasoning と execution を分離する点が強調されていました。

公開記事では Gmail 本文や内部リンクを引用せず、テーマの優先度と実務上の角度だけを使います。

## チェックリスト

- Day 28 のテーマを一文で説明できる。
- 成果物をファイル、図、schema、または checklist として残した。
- Season 1 の補助トピックを把握した。
- 最小 lab に失敗経路を入れた。
- 本番化前の権限、観測、eval リスクを一つ以上言える。

## 参考リソース

- [Advent of Agents Season 2 Day 28](https://adventofagents.com/2026/03/28)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
