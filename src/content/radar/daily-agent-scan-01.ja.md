---
title: "AI レーダー：Azure Agent Runtime の新シグナル"
date: 2026-04-01
category: radar
cadence: daily
description: "Azure が Agent Runtime サービスを発表。Agent の状態管理とデプロイをローカルからクラウドホスティングへ移行。"
difficulty: beginner
plainSummary: "Azure Agent Runtime は Agent の実行環境をローカルスクリプトからクラウドホスティングに移し、状態永続化、ツール登録、実行監視を提供します。"
tags:
  - Agent
  - Azure
lang: ja
draft: false
---

## 今日のシグナル

Azure が Agent Runtime のプレビュー版を公開しました。主な変更点は 3 つです。

1. **状態永続化**：会話履歴、タスク進捗、ツール呼び出し記録がクラウドに自動保存。
2. **ツール登録センター**：統一フォーマットでツールを登録し、Agent が自動発見できる。
3. **実行監視**：各実行のツール呼び出しチェーン、token 消費、エラー情報が追跡可能。

## なぜ注目すべきか

| 以前（自前構築） | 以後（プラットフォーム） |
| --- | --- |
| 状態を自前で管理 | 自動永続化 |
| ツール呼び出しロジックを自前実装 | 標準化登録＋自動発見 |
| ログが分散 | 統一実行トレーシング |

## 注視すべき論点

- ツール登録形式は MCP と互換性があるか。
- 状態管理の粒度は複雑な Agent に十分か。
- クラウド実行のレイテンシとコスト。
- Azure OpenAI 以外のモデルのサポート。

## 関連記事

- [Agent = state・tool・feedback loop](../../foundations/ai-developer-core/agent-state-tools-feedback-loop/)
- [Agent Harness](../../engineering/ai-developer-core/agent-harness-logging-approval-replay/)
