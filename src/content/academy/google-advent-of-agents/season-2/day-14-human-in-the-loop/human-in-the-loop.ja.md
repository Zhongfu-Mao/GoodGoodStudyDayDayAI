---
title: "Google Advent of Agents S2 Day 14：Human in the Loop"
date: 2026-05-07
category: academy
description: "人間承認を曖昧な「よいですか」ではなく、レビュー可能なシステムノードにする。"
plainSummary: "Season 2 Day 14 を、設計境界、実践タスク、本番リスク、チェックリストに整理したオリジナル講義ノート。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-14-human-in-the-loop/cover.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: ja
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 14：Multi-Agent Patterns: Human in the Loop"
  moduleOrder: 214
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/14"
  prerequisites:
    - "先に読むとよいもの：Google Advent of Agents：エージェント工学の実践マップ"
draft: false
---

![Google Advent of Agents S2 Day 14：Human in the Loop カバー](/images/academy/google-advent-of-agents/season-2/day-14-human-in-the-loop/cover.svg)

**注記：** このページは Google Advent of Agents Season 2 Day 14 の公開テーマを主線にし、Season 1 の関連トピックを補助線として使った学習ノートです。公式翻訳ではなく、本站向けのエージェント工学講義として再構成しています。

## この日の問い

人間承認を曖昧な「よいですか」ではなく、レビュー可能なシステムノードにする。

今日の成果物は、操作、影響範囲、取り消し可否、代替案、実行コマンドを含む approval payloadです。読むだけで終わらせず、あとからレビューできる設計メモか lab として残します。

## システムパターン

![Day 14 システムパターン](/images/academy/google-advent-of-agents/season-2/day-14-human-in-the-loop/diagram.svg)

この図は、Day 14 のテーマを「入力から成果物、本番リスクまで」の流れとして読むためのものです。重要なのは、機能名を覚えることではなく、どの境界が増え、どの状態を記録し、どこで止められるかを説明できることです。

## 三つの要点

- HITL は高リスクシステムの能力であり、モデル失敗の補丁ではない。
- 承認前に影響範囲と具体操作を示す。
- 承認結果は状態と監査ログに入れる。

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

Agent が顧客メールを送る場合、承認カードには宛先、件名、本文要約、添付、取り消せない影響、代替操作を出します。ユーザーが承認するのは「送って」ではなく具体 payload です。

## 実装スケッチ

これは完全なコードではありません。公開前に設計メモや README に残す構造化スケッチです。reviewer が境界、状態、受入条件を確認できるようにします。

```yaml
approval:
  action: send_email
  recipient: customer@example.com
  irreversible: true
  alternatives: [save_draft, request_edit]
  execute_only_after: explicit_approval
```

## ケース分解

- **業務トリガー：** メール送信、注文、deploy、data deletion は人間承認が必要だが、承認を自然文一言にしてはいけない。
- **Agent 境界：** 承認 UI は具体 payload、影響範囲、代替操作、rollback 可能性を示し、Agent は明示承認後だけ実行する。
- **受入証拠：** audit log で、ユーザーがどの version の payload を承認したか証明できる。

## 最小 Lab

メール送信またはデプロイ操作の承認カードを設計し、承認後だけツールを呼ぶ。

進め方：

1. 先に境界と失敗時の停止条件を書く。
2. 入力、出力、状態、権限を一枚の表にする。
3. 最小 happy path を実装または疑似コード化する。
4. すぐに失敗経路の eval を一つ足す。
5. 実行ログを見て、人間が後から説明できるか確認する。

## Season 1 で補う背景

Season 1 Day 9 / Day 22：undo、guardrails、承認が HITL の前提になる。

Season 1 は基礎線、Season 2 は応用と本番化の線です。この日のテーマを読むときは、Season 1 がどの前提を補っているかを押さえると理解しやすくなります。

## 本番化リスク

承認情報が不十分なら、人間はブラックボックスに署名しているだけになる。

| リスク | 確認する問い |
| --- | --- |
| 境界が曖昧 | どのコンポーネントが責任を持つか説明できるか。 |
| 権限が広い | 現在のユーザーとタスクに必要な scope だけか。 |
| 観測できない | 失敗時に trace と artifact から原因を追えるか。 |
| eval がない | 次回の品質低下を検知できるか。 |
| 人間が理解できない | 承認や例外処理の理由が UI またはログに残るか。 |

## チェックリスト

- Day 14 のテーマを一文で説明できる。
- 成果物をファイル、図、schema、または checklist として残した。
- Season 1 の補助トピックを把握した。
- 最小 lab に失敗経路を入れた。
- 本番化前の権限、観測、eval リスクを一つ以上言える。

## 参考リソース

- [Advent of Agents Season 2 Day 14](https://adventofagents.com/2026/03/14)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
