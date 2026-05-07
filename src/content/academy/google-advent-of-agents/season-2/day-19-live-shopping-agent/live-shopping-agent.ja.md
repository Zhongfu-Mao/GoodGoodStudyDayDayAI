---
title: "Google Advent of Agents S2 Day 19：Live Shopping Agent ケース"
date: 2026-05-07
category: academy
description: "マルチモーダル、リアルタイム対話、商取引操作を高制約ケースとして分析する。"
plainSummary: "Season 2 Day 19 を、設計境界、実践タスク、本番リスク、チェックリストに整理したオリジナル講義ノート。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-19-live-shopping-agent/cover.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: ja
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 19：Live Shopping Agent"
  moduleOrder: 219
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/19"
  prerequisites:
    - "先に読むとよいもの：Google Advent of Agents：エージェント工学の実践マップ"
draft: false
---

![Google Advent of Agents S2 Day 19：Live Shopping Agent ケース カバー](/images/academy/google-advent-of-agents/season-2/day-19-live-shopping-agent/cover.svg)

**注記：** このページは Google Advent of Agents Season 2 Day 19 の公開テーマを主線にし、Season 1 の関連トピックを補助線として使った学習ノートです。公式翻訳ではなく、本站向けのエージェント工学講義として再構成しています。

## この日の問い

マルチモーダル、リアルタイム対話、商取引操作を高制約ケースとして分析する。

今日の成果物は、意図、商品証拠、推薦、確認、購入境界を含む commerce agent risk mapです。読むだけで終わらせず、あとからレビューできる設計メモか lab として残します。

## システムパターン

![Day 19 システムパターン](/images/academy/google-advent-of-agents/season-2/day-19-live-shopping-agent/diagram.svg)

この図は、Day 19 のテーマを「入力から成果物、本番リスクまで」の流れとして読むためのものです。重要なのは、機能名を覚えることではなく、どの境界が増え、どの状態を記録し、どこで止められるかを説明できることです。

## 三つの要点

- Commerce Agent の中心は推薦ではなく、安全な操作境界である。
- リアルタイム・マルチモーダル入力は再現可能な状態へ入れる。
- 購入、支払い、個人データには明示承認が必要。

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

Shopping Agent は商品比較や違いの説明を自動で行えますが、購入は自動化しません。価格、在庫、返品条件、推薦理由、リスクを示し、ユーザーの明示承認後に支払いまたは注文 tool へ進みます。

## 実装スケッチ

これは完全なコードではありません。公開前に設計メモや README に残す構造化スケッチです。reviewer が境界、状態、受入条件を確認できるようにします。

```yaml
commerce_boundary:
  auto_allowed: [compare_products, explain_tradeoffs]
  approval_required: [add_to_cart, purchase, save_payment]
  show_before_approval: [price, return_policy, risk]
```

## ケース分解

- **業務トリガー：** shopping は Agent に向いているが、お金、在庫、返品、privacy により自動化は高リスクになる。
- **Agent 境界：** Agent は比較と説明はできるが購入は自動化せず、payment、order、address save は approval に入れる。
- **受入証拠：** 購入前画面に price、risk、reason、alternative、ユーザー確認 record が表示される。

## 最小 Lab

Shopping Agent に、推薦は自動、購入は承認必須という操作境界を設計する。

進め方：

1. 先に境界と失敗時の停止条件を書く。
2. 入力、出力、状態、権限を一枚の表にする。
3. 最小 happy path を実装または疑似コード化する。
4. すぐに失敗経路の eval を一つ足す。
5. 実行ログを見て、人間が後から説明できるか確認する。

## Season 1 で補う背景

Season 1 Day 12 / Day 21：マルチモーダル Agent とケース学習が体験背景になる。

Season 1 は基礎線、Season 2 は応用と本番化の線です。この日のテーマを読むときは、Season 1 がどの前提を補っているかを押さえると理解しやすくなります。

## 本番化リスク

推薦と購入の境界が混ざると、Agent はユーザーの決定権を越える。

| リスク | 確認する問い |
| --- | --- |
| 境界が曖昧 | どのコンポーネントが責任を持つか説明できるか。 |
| 権限が広い | 現在のユーザーとタスクに必要な scope だけか。 |
| 観測できない | 失敗時に trace と artifact から原因を追えるか。 |
| eval がない | 次回の品質低下を検知できるか。 |
| 人間が理解できない | 承認や例外処理の理由が UI またはログに残るか。 |

## チェックリスト

- Day 19 のテーマを一文で説明できる。
- 成果物をファイル、図、schema、または checklist として残した。
- Season 1 の補助トピックを把握した。
- 最小 lab に失敗経路を入れた。
- 本番化前の権限、観測、eval リスクを一つ以上言える。

## 参考リソース

- [Advent of Agents Season 2 Day 19](https://adventofagents.com/2026/03/19)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
