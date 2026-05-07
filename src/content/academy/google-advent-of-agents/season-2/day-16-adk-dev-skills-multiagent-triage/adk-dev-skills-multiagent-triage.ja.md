---
title: "Google Advent of Agents S2 Day 16：Multiagent Triage 開発スキル"
date: 2026-05-07
category: academy
description: "複雑な問題をまず triage し、どのツール、Skill、Agent が扱うべきか決める。"
plainSummary: "Season 2 Day 16 を、設計境界、実践タスク、本番リスク、チェックリストに整理したオリジナル講義ノート。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-16-adk-dev-skills-multiagent-triage/cover.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: ja
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 16：ADK Dev Skills: Accelerated Multiagent Triage"
  moduleOrder: 216
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/16"
  prerequisites:
    - "先に読むとよいもの：Google Advent of Agents：エージェント工学の実践マップ"
draft: false
---

![Google Advent of Agents S2 Day 16：Multiagent Triage 開発スキル カバー](/images/academy/google-advent-of-agents/season-2/day-16-adk-dev-skills-multiagent-triage/cover.svg)

**注記：** このページは Google Advent of Agents Season 2 Day 16 の公開テーマを主線にし、Season 1 の関連トピックを補助線として使った学習ノートです。公式翻訳ではなく、本站向けのエージェント工学講義として再構成しています。

## この日の問い

複雑な問題をまず triage し、どのツール、Skill、Agent が扱うべきか決める。

今日の成果物は、症状、証拠、候補原因、担当 Agent、次の操作を持つ triage boardです。読むだけで終わらせず、あとからレビューできる設計メモか lab として残します。

## システムパターン

![Day 16 システムパターン](/images/academy/google-advent-of-agents/season-2/day-16-adk-dev-skills-multiagent-triage/diagram.svg)

この図は、Day 16 のテーマを「入力から成果物、本番リスクまで」の流れとして読むためのものです。重要なのは、機能名を覚えることではなく、どの境界が増え、どの状態を記録し、どこで止められるかを説明できることです。

## 三つの要点

- Triage の目的は問題を狭めることで、即修正ではない。
- 推測より先に証拠を状態へ入れる。
- マルチエージェント分担は異なる証拠面に対応する。

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

本番 Agent が時々失敗する場合、すぐ修正 Agent にコード変更させません。triage Agent が証拠を model output、tool error、外部依存 timeout に分けます。責任面が分かってから専門 Agent に渡します。

## 実装スケッチ

これは完全なコードではありません。公開前に設計メモや README に残す構造化スケッチです。reviewer が境界、状態、受入条件を確認できるようにします。

```yaml
triage:
  symptom: intermittent_failure
  evidence_groups: [model_output, tool_error, dependency_timeout]
  next_owner: platform_agent
```

## ケース分解

- **業務トリガー：** 本番障害は prompt、tool、network、permission、data が混ざることが多く、すぐ code 修正すると誤爆する。
- **Agent 境界：** Triage Agent が先に証拠を分類し、責任面を絞ってから対応する修正 Agent に渡す。
- **受入証拠：** 障害 report に symptom、evidence、hypothesis、除外項目、next owner が出る。

## 最小 Lab

失敗した Agent run を使い、ログ、ツールエラー、モデル出力を三種類の証拠に分ける。

進め方：

1. 先に境界と失敗時の停止条件を書く。
2. 入力、出力、状態、権限を一枚の表にする。
3. 最小 happy path を実装または疑似コード化する。
4. すぐに失敗経路の eval を一つ足す。
5. 実行ログを見て、人間が後から説明できるか確認する。

## Season 1 で補う背景

Season 1 Day 6 / Day 7：開発環境とコード実行が triage の操作基盤になる。

Season 1 は基礎線、Season 2 は応用と本番化の線です。この日のテーマを読むときは、Season 1 がどの前提を補っているかを押さえると理解しやすくなります。

## 本番化リスク

証拠分類のない triage は、複数 Agent が同時に推測するだけになる。

| リスク | 確認する問い |
| --- | --- |
| 境界が曖昧 | どのコンポーネントが責任を持つか説明できるか。 |
| 権限が広い | 現在のユーザーとタスクに必要な scope だけか。 |
| 観測できない | 失敗時に trace と artifact から原因を追えるか。 |
| eval がない | 次回の品質低下を検知できるか。 |
| 人間が理解できない | 承認や例外処理の理由が UI またはログに残るか。 |

## チェックリスト

- Day 16 のテーマを一文で説明できる。
- 成果物をファイル、図、schema、または checklist として残した。
- Season 1 の補助トピックを把握した。
- 最小 lab に失敗経路を入れた。
- 本番化前の権限、観測、eval リスクを一つ以上言える。

## 参考リソース

- [Advent of Agents Season 2 Day 16](https://adventofagents.com/2026/03/16)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
