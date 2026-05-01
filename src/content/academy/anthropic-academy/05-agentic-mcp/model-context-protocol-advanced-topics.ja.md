---
title: "Model Context Protocol 応用：高度な統合と運用のプラクティス"
date: 2026-03-31
category: academy
description: "MCP を実運用へ広げるときに出てくる設計論点や、安全性・拡張性の観点を整理した応用ノートです。"
plainSummary: "MCP の Sampling、Resources、Prompts、動的ツール、権限境界などの進んだ設計論点を実務向けに整理します。"
difficulty: "advanced"
coverImage: "/images/academy/anthropic-academy/covers/05-agentic-mcp/model-context-protocol-advanced-topics.svg"
tags:
  - "Agents"
  - "MCP"
lang: ja
academy:
  series: "Anthropic Academy"
  module: "Agents と MCP"
  moduleOrder: 5
  source: "Anthropic Academy"
  sourceUrl: "https://anthropic.skilljar.com/model-context-protocol-advanced-topics"
  prerequisites: []
draft: false
---
MCP の基礎を習得した次のステップは、単にツールを増やすことではなく、「どこまで動的に構成し、どこで人間の承認を挟み、どのように機密情報を保護するか」といった、設計と運用の最適化です。このノートでは、MCP の高度な機能を実装・運用の観点から整理します。

## このノートのポイント

- **多角的な文脈共有**：Sampling、Resources、Prompts を活用し、単純な Tool Call を超えた高度な生成と文脈共有を実現する。
- **動的制御のトレードオフ**：動的 Tools は拡張性に優れるが、発見可能性（Discoverability）、権限管理、監査の複雑さが増大する。
- **セキュリティ・バイ・デザイン**：MCP Server は最小限の機能から始め、権限境界と監査ログを最優先で設計する。
- **実運用への必須要件**：ユーザー承認フロー、入出力のバリデーション、エラーからの回復（リカバリ）メカニズムを構築する。

## 高度な機能（Core Features）の活用

MCP は **Tools**（外部アクション）、**Resources**（参照可能なデータ）、**Prompts**（再利用可能な文脈テンプレート）の 3 本柱で構成されます。多くの開発者は Tools から着手しますが、Resources と Prompts を適切に組み合わせることで、AI に渡すトークン量を節約しつつ、精度の高いコンテキスト制御が可能になります。

**Sampling** は、Server 側から Client に対してモデル生成を依頼する高度なパターンです。Client → Server という通常のフローとは逆の相互作用が発生するため、責任の所在とコスト管理を明確にする必要があります。

## 動的ツールと発見可能性（Discoverability）

ツールを動的に増減できる設計は、ユーザーやプロジェクトの状況に応じて AI の能力を最適化できるため非常に強力です。しかし、AI が「今どのツールを使えるのか」を正確に把握できなくなるリスクも孕んでいます。

ツールの**説明文（Description）**は、AI にとっての「ユーザーインターフェース」です。
- 期待する入力パラメータと型（Schema）
- 制約事項と動作の副作用
- 失敗時の挙動とエラーメッセージ
- 逆に「使うべきではない場面」
これらを詳細かつ明確に記述することが、AI の誤動作を防ぐ最大の鍵となります。

## 本番運用における論点

実運用環境の MCP では、以下の実装が不可欠です。

1. **厳格なバリデーション**：AI から渡された引数を決して盲信せず、外部 API やシステムに渡す前に必ず型チェックとサニタイズを行います。
2. **段階的な承認フロー**：操作の危険度（Impact）に応じて承認レベルを分けます。
   - **参照系（Read）**：自動実行
   - **更新系（Write）**：ユーザーへの確認通知
   - **破壊系・外部送信（Delete/Send）**：明示的な人間による承認
3. **監査ログと観測性**：誰が、いつ、どのツールを、どのような引数で実行したかをすべて記録し、問題発生時のトレーサビリティを確保します。

## 読者向け補足：発見性と制御のバランス

MCP の高度な設計では、動的 Tool、Resource、Prompt、さらに Transport や Sampling を駆使します。利便性が高まるほど、AI が「発見」し実行できる範囲が広がるため、**発見性（Discoverability）と制御（Control）のバランス**が重要になります。

| 論点 | 設計上の問い |
| --- | --- |
| **Dynamic Tools** | ツールのラインナップが変更されるトリガーは明確か |
| **Resources** | どの情報を「読み取り専用」として分離すべきか |
| **Prompts** | 共通の思考プロセス（テンプレート）を誰がメンテナンスするか |
| **Transport** | ローカル実行とリモート実行、どちらに信頼の境界を置くか |
| **Approval** | 自動化のメリットがリスクを上回る境界線はどこか |

### ミニ演習

既存の MCP Server に「書き込み系ツール」を追加すると想定してください。そのツールの Description、Input Schema、危険度レベル、承認ルール、および監査ログの項目を設計してみましょう。特に、AI が「勘違い」して誤用しそうな曖昧な表現がないか精査してください。

## 実務で試すワークフロー

1. **機能の分類**：既存ツールの役割を「読み取り」「書き込み」「外部送信」に分類し、リスクを可視化する。
2. **ガードレールの設置**：各ツールに入力検証、権限チェック、ログ出力、承認要求を組み込む。
3. **コンテキストの最適化**：Resources と Prompts を活用し、ツールに渡す不要な文脈を最小化する。

## Prompt pack

- 「この MCP Server のツール定義をレビューし、権限境界、説明文の明確さ、承認フローの妥当性について改善案を提示してください。」
- 「Resources と Prompts を活用して、次の MCP ワークフローにおけるコンテキスト設計を再構築してください。」
- 「MCP Server を本番環境で安全に運用するための監査ログスキーマと、異常検知の指針を提案してください。」

## 関連リソース

- [MCP とは何か](../../../ai-basics-for-everyone/what-is-mcp/)
- [Introduction to Model Context Protocol](../introduction-to-model-context-protocol/)
- [Minimal MCP Server](../../../../engineering/ai-developer-core/minimal-mcp-server/)
