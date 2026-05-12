---
title: "Google Advent of Agents S2 Day 31：A2UI、A2A、対話型 Agent"
date: 2026-05-07
category: academy
description: "Agent が文字だけでなく、対話可能で状態を返せる micro-app 体験を提供できるようにする。"
plainSummary: "Season 2 Day 31 を、設計境界、実践タスク、本番リスク、チェックリストに整理したオリジナル講義ノート。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-31-a2ui-a2a-interactive-microapps/cover.svg"
tags:
  - Agent
  - AI Engineering
lang: ja
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 31：A2UI & A2A"
  moduleOrder: 231
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/31"
  prerequisites:
    - "先に読むとよいもの：Google Advent of Agents：エージェント工学の実践マップ"
draft: false
---

![Google Advent of Agents S2 Day 31：A2UI、A2A、対話型 Agent カバー](/images/academy/google-advent-of-agents/season-2/day-31-a2ui-a2a-interactive-microapps/cover.svg)

**注記：** このページは Google Advent of Agents Season 2 Day 31 の公開テーマを主線にし、Season 1 の関連トピックを補助線として使った学習ノートです。公式翻訳ではなく、本站向けのエージェント工学講義として再構成しています。

## この日の問い

Agent が文字だけでなく、対話可能で状態を返せる micro-app 体験を提供できるようにする。

今日の成果物は、component、state、event、callback、後続 task を含む interactive payload spec です。読むだけで終わらせず、あとからレビューできる設計メモか lab として残します。

## システムパターン

![Day 31 システムパターン](/images/academy/google-advent-of-agents/season-2/day-31-a2ui-a2a-interactive-microapps/diagram.svg)

この図は、Day 31 のテーマを「入力から成果物、本番リスクまで」の流れとして読むためのものです。重要なのは、機能名を覚えることではなく、どの境界が増え、どの状態を記録し、どこで止められるかを説明できることです。

## 三つの要点

- A2UI は見た目ではなく対話状態を扱う。
- A2A は Agent 協調、A2UI はユーザー対話を扱う。
- UI payload は記録、replay、継続実行できるべき。

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

デプロイ承認を長文で出して「同意」と返信させるのは弱いです。A2UI はリスク表、rollback ボタン、承認ボタン、下書き保存を表示し、ユーザー選択を構造化状態として Agent に返します。

## 実装スケッチ

これは完全なコードではありません。公開前に設計メモや README に残す構造化スケッチです。reviewer が境界、状態、受入条件を確認できるようにします。

```yaml
ui_payload:
  component: deployment_approval_panel
  state: {plan_id: deploy_42, risk: medium}
  actions: [approve, reject, save_draft]
  callback: continue_task
```

## ケース分解

- **業務トリガー：** Agent が user に選択、承認、修正、継続を求めるとき、text chat だけでは state を安定表現しにくい。
- **Agent 境界：** A2UI payload は component、state、event、callback を明確にし、A2A は Agent 間 task flow を担う。
- **受入証拠：** user click が structured event として replay でき、次の Agent task を駆動する。

## 最小 Lab

デプロイ承認 Agent に、案、リスク、ボタン、返却状態を持つ A2UI panel を設計する。

進め方：

1. 先に境界と失敗時の停止条件を書く。
2. 入力、出力、状態、権限を一枚の表にする。
3. 最小 happy path を実装または疑似コード化する。
4. すぐに失敗経路の eval を一つ足す。
5. 実行ログを見て、人間が後から説明できるか確認する。

## Season 1 で補う背景

Season 1 Day 15 / Day 20：A2UI と A2A Extensions が直接の背景になる。

Season 1 は基礎線、Season 2 は応用と本番化の線です。この日のテーマを読むときは、Season 1 がどの前提を補っているかを押さえると理解しやすくなります。

## 本番化リスク

フロントエンドがテキストを推測するだけなら、ユーザー選択は Agent 状態へ安定して入らない。

| リスク | 確認する問い |
| --- | --- |
| 境界が曖昧 | どのコンポーネントが責任を持つか説明できるか。 |
| 権限が広い | 現在のユーザーとタスクに必要な scope だけか。 |
| 観測できない | 失敗時に trace と artifact から原因を追えるか。 |
| eval がない | 次回の品質低下を検知できるか。 |
| 人間が理解できない | 承認や例外処理の理由が UI またはログに残るか。 |

## Gmail で確認できた強調点

この日の Gmail newsletter では、Gemini Enterprise 内の interactive micro-apps が強調されていました。

公開記事では Gmail 本文や内部リンクを引用せず、テーマの優先度と実務上の角度だけを使います。

## チェックリスト

- Day 31 のテーマを一文で説明できる。
- 成果物をファイル、図、schema、または checklist として残した。
- Season 1 の補助トピックを把握した。
- 最小 lab に失敗経路を入れた。
- 本番化前の権限、観測、eval リスクを一つ以上言える。

## 参考リソース

- [Advent of Agents Season 2 Day 31](https://adventofagents.com/2026/03/31)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
