---
title: "Google Advent of Agents S2 Day 18：企業ワークベンチ内の ADK Agent"
date: 2026-05-07
category: academy
description: "コード型 ADK Agent を企業ワークベンチへ接続し、工学的治理も保つ。"
plainSummary: "Season 2 Day 18 を、設計境界、実践タスク、本番リスク、チェックリストに整理したオリジナル講義ノート。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-18-workspace-gemini-enterprise-adk-agents/cover.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: ja
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 18：Workspace & Gemini Enterprise: ADK agents"
  moduleOrder: 218
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/18"
  prerequisites:
    - "先に読むとよいもの：Google Advent of Agents：エージェント工学の実践マップ"
draft: false
---

![Google Advent of Agents S2 Day 18：企業ワークベンチ内の ADK Agent カバー](/images/academy/google-advent-of-agents/season-2/day-18-workspace-gemini-enterprise-adk-agents/cover.svg)

**注記：** このページは Google Advent of Agents Season 2 Day 18 の公開テーマを主線にし、Season 1 の関連トピックを補助線として使った学習ノートです。公式翻訳ではなく、本站向けのエージェント工学講義として再構成しています。

## この日の問い

コード型 ADK Agent を企業ワークベンチへ接続し、工学的治理も保つ。

今日の成果物は、入口、ID、ツール、ログ、owner、サポート経路を持つ enterprise integration mapです。読むだけで終わらせず、あとからレビューできる設計メモか lab として残します。

## システムパターン

![Day 18 システムパターン](/images/academy/google-advent-of-agents/season-2/day-18-workspace-gemini-enterprise-adk-agents/diagram.svg)

この図は、Day 18 のテーマを「入力から成果物、本番リスクまで」の流れとして読むためのものです。重要なのは、機能名を覚えることではなく、どの境界が増え、どの状態を記録し、どこで止められるかを説明できることです。

## 三つの要点

- 企業入口はデプロイの終点ではなく、ユーザー接点である。
- ADK Agent にも version、ログ、サポート責任が必要。
- Workspace 文脈は権限とデータ境界で制御する。

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

ADK Agent を企業ワークベンチに出すと、それは開発者ツールではなく社員入口になります。owner、サポート窓口、version、ユーザー ID 伝播、障害通知を補う必要があります。

## 実装スケッチ

これは完全なコードではありません。公開前に設計メモや README に残す構造化スケッチです。reviewer が境界、状態、受入条件を確認できるようにします。

```yaml
enterprise_agent:
  owner: platform_team
  support: #agent-support
  version: 1.0.0
  identity: end_user_oauth
  incident_notice: status_page
```

## ケース分解

- **業務トリガー：** 開発者が作った ADK Agent が企業 workspace に入ると、実ユーザーと実権限に向き合う。
- **Agent 境界：** wrapper layer は identity propagation、version note、support、incident notice、deprecation を扱う。
- **受入証拠：** ユーザーは owner、用途、data boundary を見られ、管理者は version ごとに rollback できる。

## 最小 Lab

ADK Agent をローカル開発から企業入口へ出すリリースチェックリストを設計する。

進め方：

1. 先に境界と失敗時の停止条件を書く。
2. 入力、出力、状態、権限を一枚の表にする。
3. 最小 happy path を実装または疑似コード化する。
4. すぐに失敗経路の eval を一つ足す。
5. 実行ログを見て、人間が後から説明できるか確認する。

## Season 1 で補う背景

Season 1 Day 19 / Day 4 / Day 5：登録、デプロイ、観測が企業接続の基礎になる。

Season 1 は基礎線、Season 2 は応用と本番化の線です。この日のテーマを読むときは、Season 1 がどの前提を補っているかを押さえると理解しやすくなります。

## 本番化リスク

企業入口に接続してもサポート経路がなければ、問題は最終ユーザーへ落ちる。

| リスク | 確認する問い |
| --- | --- |
| 境界が曖昧 | どのコンポーネントが責任を持つか説明できるか。 |
| 権限が広い | 現在のユーザーとタスクに必要な scope だけか。 |
| 観測できない | 失敗時に trace と artifact から原因を追えるか。 |
| eval がない | 次回の品質低下を検知できるか。 |
| 人間が理解できない | 承認や例外処理の理由が UI またはログに残るか。 |

## チェックリスト

- Day 18 のテーマを一文で説明できる。
- 成果物をファイル、図、schema、または checklist として残した。
- Season 1 の補助トピックを把握した。
- 最小 lab に失敗経路を入れた。
- 本番化前の権限、観測、eval リスクを一つ以上言える。

## 参考リソース

- [Advent of Agents Season 2 Day 18](https://adventofagents.com/2026/03/18)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
