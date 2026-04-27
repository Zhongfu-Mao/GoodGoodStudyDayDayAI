---
title: "Google Cloud Vertex AI で Claude を使う"
date: 2026-03-31
category: academy
description: "Vertex AI から Claude を使う際の導入イメージと、GCP ワークロードとの組み合わせ方を整理したノートです。"
plainSummary: "Vertex AI 経由で Claude を使うときのプロジェクト設定、SDK、IAM、リージョン、監査と評価の勘所を整理します。"
difficulty: "advanced"
coverImage: "/images/academy/anthropic-academy/covers/04-developer-tools/claude-with-google-cloud-s-vertex-ai.svg"
tags:
  - "開発者"
lang: ja
academy:
  series: "Anthropic Academy"
  module: "開発者向けツールと実装"
  moduleOrder: 4
  source: "Anthropic Academy"
  sourceUrl: "https://anthropic.skilljar.com/claude-with-google-cloud-vertex-ai"
  prerequisites: []
draft: false
---
Google Cloud の Vertex AI で Claude を使う場合、モデル呼び出しは Google Cloud のプロジェクト、IAM、リージョン、監査、請求の中に入ります。既存の GCP 運用に Claude を組み込みたいチームに向いた選択肢です。

## このノートで押さえること

- Vertex AI では GCP project、location、service account、IAM を前提にクライアントを作る。
- モデル利用可否、リージョン、SDK のバージョンを環境ごとに確認する。
- Cloud Logging、Monitoring、IAM Conditions など既存の GCP 管理機能と合わせて設計する。
- プロンプト品質、構造化出力、eval はクラウド基盤に関係なく必要である。

## Vertex AI で使う意味

既に Google Cloud を利用している組織では、Vertex AI から Claude を呼ぶことで、認証、課金、監査、ネットワーク、データ基盤を既存の運用に寄せられます。

BigQuery、Cloud Storage、Cloud Run、Cloud Functions などと組み合わせる場合も、同じプロジェクト境界で管理しやすくなります。

ただし Anthropic API と同じコードがそのまま動くわけではありません。SDK、モデル指定、リージョン、エラー処理の差分を理解します。

## 実装の基本

まず GCP project と location を決め、必要な API を有効化し、service account に最小権限を付与します。ローカル開発と本番実行では認証方法を分けるのが安全です。

SDK では、モデル名、最大トークン、temperature、メッセージ、システム指示を指定します。レスポンス形式は SDK のバージョンで変わることがあるため、薄い wrapper を作ると移行しやすくなります。

Vertex AI 経由でも、アプリケーション側では入力検証、出力検証、再試行、タイムアウト、ログを設計します。

## GCP 運用で見るポイント

IAM では、呼び出し元の service account を用途ごとに分けます。開発、検証、本番、バッチ処理を同じ権限にしないことが重要です。

Cloud Logging には、プロンプト全文ではなく、リクエスト ID、モデル、用途、レイテンシ、エラー種別、評価結果を残します。機密情報のログ混入を避けます。

BigQuery や Cloud Storage と連携する場合、AI に渡すデータの範囲、保持期間、アクセス権を明確にします。

## 読者向け補足：GCP の運用と一体で考える

Vertex AI で Claude を使う場合、既存の GCP プロジェクト、サービスアカウント、監査ログ、データ基盤と接続しやすいことが大きな利点です。BigQuery、Cloud Run、Workflows、Secret Manager と組み合わせると、生成 AI 機能を既存の運用標準に乗せやすくなります。

ただし、LLM 呼び出しは通常の REST API よりも失敗の種類が多くなります。quota、latency、出力形式の揺れ、リージョン差、provider 側のモデル更新を前提に、観測と回帰テストを用意します。

| 観点 | 確認すること |
| --- | --- |
| Identity | service account、権限境界、鍵管理 |
| Runtime | Cloud Run か batch か、timeout と再試行 |
| Data | BigQuery、GCS、PII の扱い |
| Observability | request id、latency、token、error reason |

### ミニ演習

GCP 上の既存データを使って FAQ 生成を行う想定で、入力データ、Secret 管理、ログ、評価データ、失敗時の人間確認フローを設計します。

## 実務で試すワークフロー

1. GCP project、location、service account、利用モデルを一覧化する。
2. Claude 呼び出し wrapper を作り、SDK 固有の差分をアプリ本体から隔離する。
3. Cloud Logging とアプリ側 eval を分け、品質と運用状態を両方追う。

## Prompt pack

- Vertex AI で Claude を使う本番アプリの設計レビュー項目を、IAM、ログ、データ境界、評価に分けてください。
- この Anthropic API サンプルを Vertex AI 前提に移植する際の差分を説明してください。
- BigQuery の分析結果を Claude に渡すアプリで、入力データの最小化と監査をどう設計すべきか整理してください。

## 自分で確認する

- service account の権限が用途ごとに分かれている。
- SDK 差分を wrapper で吸収している。
- ログに機密データを残さない方針がある。

## 関連して読む

- [Building with the Claude API](../building-with-the-claude-api/)
- [Cloud & Infra](../../../../engineering/cloud-infra-02/)
