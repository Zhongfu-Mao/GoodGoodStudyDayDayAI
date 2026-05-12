---
title: "Google Advent of Agents S2 Day 29：ApiRegistry と動的ツール治理"
date: 2026-05-07
category: academy
description: "Agent が管理者承認済み API カタログから動的にツールを発見し、企業 API をすべてハードコードしないようにする。"
plainSummary: "Season 2 Day 29 を、設計境界、実践タスク、本番リスク、チェックリストに整理したオリジナル講義ノート。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-29-api-registry-dynamic-tools/cover.svg"
tags:
  - Agent
  - AI Engineering
lang: ja
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 29：ApiRegistry"
  moduleOrder: 229
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/29"
  prerequisites:
    - "先に読むとよいもの：Google Advent of Agents：エージェント工学の実践マップ"
draft: false
---

![Google Advent of Agents S2 Day 29：ApiRegistry と動的ツール治理 カバー](/images/academy/google-advent-of-agents/season-2/day-29-api-registry-dynamic-tools/cover.svg)

**注記：** このページは Google Advent of Agents Season 2 Day 29 の公開テーマを主線にし、Season 1 の関連トピックを補助線として使った学習ノートです。公式翻訳ではなく、本站向けのエージェント工学講義として再構成しています。

## この日の問い

Agent が管理者承認済み API カタログから動的にツールを発見し、企業 API をすべてハードコードしないようにする。

今日の成果物は、registry、policy、adapter、audit、version を持つ registry-backed tool flowです。読むだけで終わらせず、あとからレビューできる設計メモか lab として残します。

## システムパターン

![Day 29 システムパターン](/images/academy/google-advent-of-agents/season-2/day-29-api-registry-dynamic-tools/diagram.svg)

この図は、Day 29 のテーマを「入力から成果物、本番リスクまで」の流れとして読むためのものです。重要なのは、機能名を覚えることではなく、どの境界が増え、どの状態を記録し、どこで止められるかを説明できることです。

## 三つの要点

- 企業ツールは発見可能、承認可能、監査可能であるべき。
- Registry は policy gate の代替ではない。
- ツール version の変化は Agent と owner に見えるべき。

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

Sales analysis Agent はすべての BigQuery table を内蔵しません。ApiRegistry から管理者承認済み tool 定義を取得し、現在ユーザーと目的で許可された dataset と field だけを見ます。

## 実装スケッチ

これは完全なコードではありません。公開前に設計メモや README に残す構造化スケッチです。reviewer が境界、状態、受入条件を確認できるようにします。

```yaml
registry_query:
  purpose: sales_analysis
  user_role: regional_manager
  returned_tools: [query_sales_summary]
  hidden_fields: [customer_email, payment_id]
```

## ケース分解

- **業務トリガー：** tool が増えると、すべてを prompt や code に固定する方式は permission drift と保守難を生む。
- **Agent 境界：** Agent は registry から現在 task に許可された tool definition を取得し、user role で field を filter する。
- **受入証拠：** Registry が tool version、approver、purpose、hidden fields を記録する。

## 最小 Lab

BigQuery query tool に owner、schema、scope、承認レベルの registry metadata を設計する。

進め方：

1. 先に境界と失敗時の停止条件を書く。
2. 入力、出力、状態、権限を一枚の表にする。
3. 最小 happy path を実装または疑似コード化する。
4. すぐに失敗経路の eval を一つ足す。
5. 実行ログを見て、人間が後から説明できるか確認する。

## Season 1 で補う背景

Season 1 Day 18：Cloud API Registry + ADK が直接の前提になる。

Season 1 は基礎線、Season 2 は応用と本番化の線です。この日のテーマを読むときは、Season 1 がどの前提を補っているかを押さえると理解しやすくなります。

## 本番化リスク

企業 API をハードコードすると、権限、version、owner が制御不能になる。

| リスク | 確認する問い |
| --- | --- |
| 境界が曖昧 | どのコンポーネントが責任を持つか説明できるか。 |
| 権限が広い | 現在のユーザーとタスクに必要な scope だけか。 |
| 観測できない | 失敗時に trace と artifact から原因を追えるか。 |
| eval がない | 次回の品質低下を検知できるか。 |
| 人間が理解できない | 承認や例外処理の理由が UI またはログに残るか。 |

## Gmail で確認できた強調点

この日の Gmail newsletter では、管理者承認済み BigQuery tools を動的に取得する点が強調されていました。

公開記事では Gmail 本文や内部リンクを引用せず、テーマの優先度と実務上の角度だけを使います。

## チェックリスト

- Day 29 のテーマを一文で説明できる。
- 成果物をファイル、図、schema、または checklist として残した。
- Season 1 の補助トピックを把握した。
- 最小 lab に失敗経路を入れた。
- 本番化前の権限、観測、eval リスクを一つ以上言える。

## 参考リソース

- [Advent of Agents Season 2 Day 29](https://adventofagents.com/2026/03/29)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
