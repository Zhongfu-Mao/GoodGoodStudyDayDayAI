---
title: "Google Advent of Agents S2 Day 12：Generator-Critic ループ"
date: 2026-05-07
category: academy
description: "明確な rubric で生成、批評、修正を回し、曖昧な「もっと改善」を避ける。"
plainSummary: "Season 2 Day 12 を、設計境界、実践タスク、本番リスク、チェックリストに整理したオリジナル講義ノート。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-12-generator-critic-loop/cover.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: ja
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 12：Multi-Agent Patterns: Generator-Critic Agent Loop"
  moduleOrder: 212
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/12"
  prerequisites:
    - "先に読むとよいもの：Google Advent of Agents：エージェント工学の実践マップ"
draft: false
---

![Google Advent of Agents S2 Day 12：Generator-Critic ループ カバー](/images/academy/google-advent-of-agents/season-2/day-12-generator-critic-loop/cover.svg)

**注記：** このページは Google Advent of Agents Season 2 Day 12 の公開テーマを主線にし、Season 1 の関連トピックを補助線として使った学習ノートです。公式翻訳ではなく、本站向けのエージェント工学講義として再構成しています。

## この日の問い

明確な rubric で生成、批評、修正を回し、曖昧な「もっと改善」を避ける。

今日の成果物は、事実性、実行可能性、安全性、引用、形式を評価する critic rubricです。読むだけで終わらせず、あとからレビューできる設計メモか lab として残します。

## システムパターン

![Day 12 システムパターン](/images/academy/google-advent-of-agents/season-2/day-12-generator-critic-loop/diagram.svg)

この図は、Day 12 のテーマを「入力から成果物、本番リスクまで」の流れとして読むためのものです。重要なのは、機能名を覚えることではなく、どの境界が増え、どの状態を記録し、どこで止められるかを説明できることです。

## 三つの要点

- critic には rubric が必要で、なければ別の話者にすぎない。
- ループにはスコア、予算、回数、人間レビューなどの停止条件が必要。
- critic の出力は曖昧な助言ではなく具体的な問題であるべき。

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

デプロイ計画では writer が案を作り、critic は rubric に沿って問題を出します。rollback 不足、権限過大、health check が浅い、コスト根拠なし。critic は全文を書き直すのではなく、実行可能な欠陥を出します。

## 実装スケッチ

これは完全なコードではありません。公開前に設計メモや README に残す構造化スケッチです。reviewer が境界、状態、受入条件を確認できるようにします。

```yaml
rubric:
  rollback: required
  least_privilege: required
  health_check: task_level
  cost_evidence: required
```

## ケース分解

- **業務トリガー：** 計画、コード、記事にはレビューが必要だが、rubric のない critic は主観的なコメントになりやすい。
- **Agent 境界：** Generator は生成を担当し、critic は合意済み観点で修正可能な問題だけを出す。最終変更は owner に戻す。
- **受入証拠：** 各 critique が rubric item に対応し、fixed、rejected、人間判断待ちを判定できる。

## 最小 Lab

writer がデプロイ計画を書き、critic が実行可能な問題だけを出し、writer が一度修正する。

進め方：

1. 先に境界と失敗時の停止条件を書く。
2. 入力、出力、状態、権限を一枚の表にする。
3. 最小 happy path を実装または疑似コード化する。
4. すぐに失敗経路の eval を一つ足す。
5. 実行ログを見て、人間が後から説明できるか確認する。

## Season 1 で補う背景

Season 1 Day 5 / Day 22：観測と安全ガードレールが critic に検査信号を与える。

Season 1 は基礎線、Season 2 は応用と本番化の線です。この日のテーマを読むときは、Season 1 がどの前提を補っているかを押さえると理解しやすくなります。

## 本番化リスク

停止条件のない critic loop は品質ではなくコストと幻覚を増やす。

| リスク | 確認する問い |
| --- | --- |
| 境界が曖昧 | どのコンポーネントが責任を持つか説明できるか。 |
| 権限が広い | 現在のユーザーとタスクに必要な scope だけか。 |
| 観測できない | 失敗時に trace と artifact から原因を追えるか。 |
| eval がない | 次回の品質低下を検知できるか。 |
| 人間が理解できない | 承認や例外処理の理由が UI またはログに残るか。 |

## チェックリスト

- Day 12 のテーマを一文で説明できる。
- 成果物をファイル、図、schema、または checklist として残した。
- Season 1 の補助トピックを把握した。
- 最小 lab に失敗経路を入れた。
- 本番化前の権限、観測、eval リスクを一つ以上言える。

## 参考リソース

- [Advent of Agents Season 2 Day 12](https://adventofagents.com/2026/03/12)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
