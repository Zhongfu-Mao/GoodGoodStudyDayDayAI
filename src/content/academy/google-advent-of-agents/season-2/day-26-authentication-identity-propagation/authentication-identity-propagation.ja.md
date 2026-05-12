---
title: "Google Advent of Agents S2 Day 26：Authentication と ID 伝播"
date: 2026-05-07
category: academy
description: "ツール呼び出しが誰を代表するのかを明確にする。システム、ユーザー、委任ロール、一時権限のどれか。"
plainSummary: "Season 2 Day 26 を、設計境界、実践タスク、本番リスク、チェックリストに整理したオリジナル講義ノート。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-26-authentication-identity-propagation/cover.svg"
tags:
  - Agent
  - AI Engineering
lang: ja
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 26：Authentication"
  moduleOrder: 226
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/26"
  prerequisites:
    - "先に読むとよいもの：Google Advent of Agents：エージェント工学の実践マップ"
draft: false
---

![Google Advent of Agents S2 Day 26：Authentication と ID 伝播 カバー](/images/academy/google-advent-of-agents/season-2/day-26-authentication-identity-propagation/cover.svg)

**注記：** このページは Google Advent of Agents Season 2 Day 26 の公開テーマを主線にし、Season 1 の関連トピックを補助線として使った学習ノートです。公式翻訳ではなく、本站向けのエージェント工学講義として再構成しています。

## この日の問い

ツール呼び出しが誰を代表するのかを明確にする。システム、ユーザー、委任ロール、一時権限のどれか。

今日の成果物は、ログイン、OAuth consent、token scope、tool call、audit log の identity flowです。読むだけで終わらせず、あとからレビューできる設計メモか lab として残します。

## システムパターン

![Day 26 システムパターン](/images/academy/google-advent-of-agents/season-2/day-26-authentication-identity-propagation/diagram.svg)

この図は、Day 26 のテーマを「入力から成果物、本番リスクまで」の流れとして読むためのものです。重要なのは、機能名を覚えることではなく、どの境界が増え、どの状態を記録し、どこで止められるかを説明できることです。

## 三つの要点

- Agent のツール呼び出しは最終ユーザーへ追跡できるべき。
- service account がユーザー権限を迂回してはいけない。
- 認可範囲は最小で、取り消し可能、監査可能にする。

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

Calendar Agent が会議を調べるとき、万能 service account で全員のカレンダーを読むべきではありません。現在ユーザーの consent で calendar.readonly scope だけを使い、audit log に user、tool、scope、reason を残します。

## 実装スケッチ

これは完全なコードではありません。公開前に設計メモや README に残す構造化スケッチです。reviewer が境界、状態、受入条件を確認できるようにします。

```yaml
auth_log:
  user: user_123
  tool: calendar_lookup
  scope: calendar.readonly
  reason: meeting_prep
  consent_id: oauth_abc
```

## ケース分解

- **業務トリガー：** Agent が user の代理で動くとき、すべてを万能 service account にするのが最も危険。
- **Agent 境界：** 各 tool call は現在 user identity、scope、consent、business reason を持ち、service account は限定 backend capability に留める。
- **受入証拠：** audit log が誰が承認し、何を呼び、なぜ呼び、scope を超えたかどうかを答えられる。

## 最小 Lab

ユーザー予定表を読む Agent に、認可 scope、取り消し方法、監査ログ項目を設計する。

進め方：

1. 先に境界と失敗時の停止条件を書く。
2. 入力、出力、状態、権限を一枚の表にする。
3. 最小 happy path を実装または疑似コード化する。
4. すぐに失敗経路の eval を一つ足す。
5. 実行ログを見て、人間が後から説明できるか確認する。

## Season 1 で補う背景

Season 1 Day 22：ID、承認、guardrails が安全境界を作る。

Season 1 は基礎線、Season 2 は応用と本番化の線です。この日のテーマを読むときは、Season 1 がどの前提を補っているかを押さえると理解しやすくなります。

## 本番化リスク

ID が曖昧だと、すべての責任が「Agent がやった」になってしまう。

| リスク | 確認する問い |
| --- | --- |
| 境界が曖昧 | どのコンポーネントが責任を持つか説明できるか。 |
| 権限が広い | 現在のユーザーとタスクに必要な scope だけか。 |
| 観測できない | 失敗時に trace と artifact から原因を追えるか。 |
| eval がない | 次回の品質低下を検知できるか。 |
| 人間が理解できない | 承認や例外処理の理由が UI またはログに残るか。 |

## Gmail で確認できた強調点

この日の Gmail newsletter では、end-user identity propagation、OAuth consent、authenticated tools が強調されていました。

公開記事では Gmail 本文や内部リンクを引用せず、テーマの優先度と実務上の角度だけを使います。

## チェックリスト

- Day 26 のテーマを一文で説明できる。
- 成果物をファイル、図、schema、または checklist として残した。
- Season 1 の補助トピックを把握した。
- 最小 lab に失敗経路を入れた。
- 本番化前の権限、観測、eval リスクを一つ以上言える。

## 参考リソース

- [Advent of Agents Season 2 Day 26](https://adventofagents.com/2026/03/26)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
