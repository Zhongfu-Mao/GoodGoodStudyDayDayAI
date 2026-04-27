---
title: "Agentic Workflows 講座：状態マシンとタスク分割"
date: 2026-04-09
category: academy
description: "シンプルな状態マシンで複雑なタスクを実行可能なステップに分割する方法：plan-act-review ループ、分岐処理、人間チェックポイント。"
difficulty: intermediate
plainSummary: "Agentic workflow はモデルに自由にやらせることではなく、タスクを明確な状態・遷移ルール・停止条件に分解し、各ステップを観測・巻き戻しできるようにすることです。"
tags:
  - Agent
  - LLM
lang: ja
draft: false
---

## なぜ状態マシンが必要か

AI Agent に複数ステップのタスクを任せると、明確なフレームワークがなければ脱線、重複操作、完了済みステップの忘却が起きやすくなります。状態マシンはタスクを離散的なフェーズに分け、各フェーズに入力・出力・遷移条件を明示します。

最小の状態マシンは 3 つの状態だけです。

```ts
const steps = ['plan', 'act', 'review'];
```

- **Plan**：タスク目標と現在の情報を読み、実行計画を出力。
- **Act**：計画に沿ってツールを呼び出すかコンテンツを生成。
- **Review**：出力が目標に合うか確認し、完了・継続・ロールバックを判断。

## 実システムへの拡張

| 状態 | 役割 | 遷移条件 |
| --- | --- | --- |
| `init` | リクエスト解析、スコープ確認 | 確認完了 → `plan` |
| `plan` | 実行ステップのリスト生成 | 計画完了 → `act` |
| `act` | 現ステップの実行 | ステップ完了 → `review` |
| `review` | 実行結果の確認 | OK → 次の `act`、NG → `retry`、全完了 → `done` |
| `retry` | 方針修正と再試行 | 成功 → `review`、上限超 → `escalate` |
| `escalate` | 人間レビューへ転送 | 人間確認 → `act` or `done` |
| `done` | 最終結果を出力 | 終了状態 |

すべての遷移はログに記録してください。ログのない遷移はブラックボックスです。

## タスク分割の原則

1. 各サブタスクに独立した検証基準を持たせる。
2. サブタスク間の依存関係を明示する。
3. 出力は次のサブタスクの入力になる。構造化形式で受け渡す。
4. 失敗したサブタスクは独立してリトライ可能にする。

## 人間チェックポイント

重要な境界では Agent を止めて人間に確認を求めます。

- 外部操作（メール送信、コードコミット、データ変更）の前。
- コストが閾値を超えた時。
- 連続リトライが 2 回を超えた時。
- 不可逆操作が含まれる時。

## サイト内で次に読むもの

Agent の構成要素の基本は [Agent = state・tool・feedback loop](../../foundations/ai-developer-core/agent-state-tools-feedback-loop/) で整理しています。

状態遷移のログと回放は [Agent Harness](../../engineering/ai-developer-core/agent-harness-logging-approval-replay/) を参照してください。
