---
title: "Claude on Amazon Bedrock：AWS 環境での実装と運用"
date: 2026-03-31
category: academy
description: "AWS 上で Claude を利用する際の位置付け、接続方法、運用上のベストプラクティスを整理した開発者向けガイドです。"
plainSummary: "Amazon Bedrock 経由で Claude を使用する際の認証（IAM）、リージョン特性、監査、コスト管理、および実装上の相違点を整理します。"
difficulty: "advanced"
coverImage: "/images/academy/anthropic-academy/covers/04-developer-tools/claude-with-amazon-bedrock.svg"
tags:
  - "開発者"
  - "AWS"
lang: ja
academy:
  series: "Anthropic Academy"
  module: "開発者向けツールと実装"
  moduleOrder: 4
  source: "Anthropic Academy"
  sourceUrl: "https://anthropic.skilljar.com/claude-with-amazon-bedrock"
  prerequisites: []
draft: false
---
Amazon Bedrock を介して Claude を利用する場合、Anthropic API と同じモデルを使用する場合でも、認証（IAM）、ネットワーク構成、監査ログ、請求、および開発パラダイムは AWS のエコシステムに準拠します。このノートでは、Bedrock 上で Claude アプリケーションを構築する際の実務上の相違点と運用のポイントを整理します。

## このノートのポイント

- **AWS ガバナンスへの統合**：IAM、CloudTrail、VPC、KMS などの AWS 標準機能を活用したセキュリティ設計が前提となります。
- **実装上の差異**：モデル ID の命名規則や、推論設定（Inference Profile）など、Anthropic API とは異なる Bedrock 固有の仕様を理解する必要があります。
- **エンタープライズ要件の充足**：権限分離、ネットワーク境界の保護、詳細な監査ログなど、企業環境で求められる運用要件への対応を重視します。
- **一貫したモデル品質**：プロンプト設計や評価の重要性は共通ですが、Bedrock 経由での呼び出しに最適化されたハンドリングが求められます。

## なぜ Amazon Bedrock を選択するのか

既に AWS を基盤としている組織にとって、Bedrock の採用は、既存の **IAM 権限管理、CloudTrail による監査、統合請求、閉域網接続（VPC Endpoint）** などの運用標準に Claude をそのまま乗せられるという大きなメリットがあります。

Bedrock は単なる「Claude の別入り口」ではなく、**「AWS のマネージドサービスとして統合された生成 AI 基盤」**です。そのため、Anthropic API のドキュメントにあるモデル名やリクエスト例をそのまま適用できないケースがある点に注意が必要です。

## 実装における主要な相違点

- **認証とクライアント初期化**：API キーではなく AWS 認証情報（Credentials）とリージョン指定を使用します。環境（開発・ステージング・本番）に応じた適切な IAM ロールの割り当てが不可欠です。
- **モデル ID とリージョン**：モデル ID は `us.anthropic.claude-3-5-sonnet-20241022-v2:0` のような形式をとり、利用可能なモデルはリージョンによって異なります。
- **SDK と例外処理**：AWS SDK (Boto3 等) の例外クラスとしてエラーをハンドリングします。スロットリング、権限不足、モデルの有効化状況などを個別に識別し、適切にロギングする必要があります。

## 運用とガバナンスの設計

プロダクション環境では、以下の観点での設計が重要になります。

1. **最小権限原則（PoLP）**：特定のモデルやアクションのみを許可する IAM ポリシーを作成し、開発者・CI/CD・アプリケーション実行環境の権限を分離します。
2. **監査とトレーサビリティ**：CloudTrail で API 呼び出し履歴を監視し、必要に応じて CloudWatch Logs に詳細な実行ログを出力します。※機密情報の漏洩を防ぐため、ログの保持ポリシーとマスキングを検討してください。
3. **データ保護**：VPC エンドポイントによる通信の閉域化や、KMS によるデータの暗号化を、組織のセキュリティ基準に合わせて設定します。

## 読者向け補足：Bedrock における「運用の境界」

Bedrock を利用する真の価値は、モデルそのものの能力に加え、AWS の堅牢なガバナンスフレームワークを活用できる点にあります。データ所在地（Data Residency）の管理や組織全体のコスト配分など、エンタープライズ特有の要件を技術的に解決できます。

一方で、プラットフォーム固有の抽象化レイヤー（Converse API 等）を利用する際は、障害発生時の切り分けが難しくならないよう、プロバイダー固有のエラーメッセージやレイテンシ情報を十分に記録する設計を推奨します。

| 設計項目 | Bedrock 環境でのチェックポイント |
| --- | --- |
| **セキュリティ** | IAM ロールの分離、最小権限、環境間のアクセス制御 |
| **可用性** | リージョンごとのクォータ（Quota）、推論設定の最適化 |
| **可観測性** | Request ID の追跡、CloudWatch によるメトリクス監視 |
| **コスト** | 推論プロファイルごとのコスト集計、コスト配分タグの活用 |

### ミニ演習

社内向けのドキュメント要約サービスを Bedrock で構築する想定で、開発・検証・本番それぞれの環境における IAM ロールの定義、記録すべき監査ログ項目、および月次のコストレビュー方法を整理してみましょう。

## 実務ワークフローの提案

1. **環境確認**：対象リージョンで必要な Claude モデルが有効化（Model Access）されているか確認する。
2. **権限設計**：最小権限の IAM ポリシーを作成し、実行環境ごとに認証情報を分離する。
3. **ロギングの実装**：呼び出しラッパーに、AWS 固有のエラー種別、レイテンシ、トークン消費量、およびコスト推定値を記録するロジックを組み込む。

## Prompt pack

- 「Bedrock で Claude を本番利用するために必要な IAM 権限、ロギング、ネットワーク構成、コスト管理の統合チェックリストを作成してください。」
- 「既存の Anthropic API 実装を Bedrock へ移行する際の技術的な差分（認証、モデル ID 体系、レスポンス構造）を詳細に説明してください。」
- 「エンタープライズ環境で Bedrock 版 Claude を用いた RAG を構築する際の、データ保護と監査に関するレビュー項目を整理してください。」

## 関連リソース

- [Token・Cost・Model Choice](../../../ai-basics-for-everyone/what-is-token-cost-model-choice/)
- [Cloud & Infra](../../../../engineering/cloud-infra-02/)
