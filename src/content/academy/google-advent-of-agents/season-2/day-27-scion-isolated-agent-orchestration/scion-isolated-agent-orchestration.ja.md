---
title: "Google Advent of Agents S2 Day 27：Scion と隔離型オーケストレーション"
date: 2026-05-07
category: academy
description: "隔離ワークスペース、コンテナ、複数 coding agents で安全な並列開発を探る。"
plainSummary: "Season 2 Day 27 を、設計境界、実践タスク、本番リスク、チェックリストに整理したオリジナル講義ノート。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-27-scion-isolated-agent-orchestration/cover.svg"
tags:
  - Agent
  - AI Engineering
lang: ja
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 27：Scion"
  moduleOrder: 227
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/27"
  prerequisites:
    - "先に読むとよいもの：Google Advent of Agents：エージェント工学の実践マップ"
draft: false
---

![Google Advent of Agents S2 Day 27：Scion と隔離型オーケストレーション カバー](/images/academy/google-advent-of-agents/season-2/day-27-scion-isolated-agent-orchestration/cover.svg)

**注記：** このページは Google Advent of Agents Season 2 Day 27 の公開テーマを主線にし、Season 1 の関連トピックを補助線として使った学習ノートです。公式翻訳ではなく、本站向けのエージェント工学講義として再構成しています。

## この日の問い

隔離ワークスペース、コンテナ、複数 coding agents で安全な並列開発を探る。

今日の成果物は、worktree、権限、共有状態、merge 点、衝突処理を持つ isolation mapです。読むだけで終わらせず、あとからレビューできる設計メモか lab として残します。

## システムパターン

![Day 27 システムパターン](/images/academy/google-advent-of-agents/season-2/day-27-scion-isolated-agent-orchestration/diagram.svg)

この図は、Day 27 のテーマを「入力から成果物、本番リスクまで」の流れとして読むためのものです。重要なのは、機能名を覚えることではなく、どの境界が増え、どの状態を記録し、どこで止められるかを説明できることです。

## 三つの要点

- 並列 coding agents には書き込み範囲の隔離が必要。
- 共有状態が少ないほど merge は制御しやすい。
- 各 agent の出力はレビュー可能、rollback 可能にする。

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

二つの coding agents が同じ repo を並列に触るなら、先に書き込み範囲を分けます。一方は API 層、一方は UI 層。共有ファイルは親 Agent が手動で統合します。そうしないと並列は上書き合戦になります。

## 実装スケッチ

これは完全なコードではありません。公開前に設計メモや README に残す構造化スケッチです。reviewer が境界、状態、受入条件を確認できるようにします。

```yaml
parallel_agents:
  api_worker: {write_scope: src/server/**}
  ui_worker: {write_scope: src/components/**}
  shared_files: require_parent_merge
```

## ケース分解

- **業務トリガー：** parallel Agent は complex task を速くするが、shared workspace は overwrite、leak、責任不明を招く。
- **Agent 境界：** 各 sub-agent に isolated context、write scope、delivery contract を持たせ、shared change は parent Agent が統合する。
- **受入証拠：** final integration record が各 sub-agent の変更、根拠、conflict 有無を説明する。

## 最小 Lab

二つの並列 coding agents の分担を設計し、可書き込み範囲と最終 merge check を決める。

進め方：

1. 先に境界と失敗時の停止条件を書く。
2. 入力、出力、状態、権限を一枚の表にする。
3. 最小 happy path を実装または疑似コード化する。
4. すぐに失敗経路の eval を一つ足す。
5. 実行ログを見て、人間が後から説明できるか確認する。

## Season 1 で補う背景

Season 1 Day 16 / Day 23：フレームワーク間協調と耐久実行が背景になる。

Season 1 は基礎線、Season 2 は応用と本番化の線です。この日のテーマを読むときは、Season 1 がどの前提を補っているかを押さえると理解しやすくなります。

## 本番化リスク

書き込み境界のない並列 agent は互いに上書きし、最後は人間の火消しになる。

| リスク | 確認する問い |
| --- | --- |
| 境界が曖昧 | どのコンポーネントが責任を持つか説明できるか。 |
| 権限が広い | 現在のユーザーとタスクに必要な scope だけか。 |
| 観測できない | 失敗時に trace と artifact から原因を追えるか。 |
| eval がない | 次回の品質低下を検知できるか。 |
| 人間が理解できない | 承認や例外処理の理由が UI またはログに残るか。 |

## Gmail で確認できた強調点

この日の Gmail newsletter では、worktree、container、複数 coding agents による隔離型オーケストレーションが強調されていました。

公開記事では Gmail 本文や内部リンクを引用せず、テーマの優先度と実務上の角度だけを使います。

## チェックリスト

- Day 27 のテーマを一文で説明できる。
- 成果物をファイル、図、schema、または checklist として残した。
- Season 1 の補助トピックを把握した。
- 最小 lab に失敗経路を入れた。
- 本番化前の権限、観測、eval リスクを一つ以上言える。

## 参考リソース

- [Advent of Agents Season 2 Day 27](https://adventofagents.com/2026/03/27)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
