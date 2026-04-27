---
title: "Amazon Bedrock で Claude を使う"
date: 2026-03-31
category: academy
description: "AWS 上で Claude を利用するときの位置づけ、接続方法、運用上の観点を整理したメモです。"
plainSummary: "Amazon Bedrock 経由で Claude を使うときのモデル ID、推論設定、IAM、監査、運用上の違いを整理します。"
difficulty: "advanced"
coverImage: "/images/academy/anthropic-academy/covers/04-developer-tools/claude-with-amazon-bedrock.svg"
tags:
  - "開発者"
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
Amazon Bedrock で Claude を使う場合、Anthropic API と同じモデルを使う場面でも、認証、モデル ID、リージョン、IAM、監査、ネットワーク、請求の考え方が AWS 側に寄ります。このノートでは、Bedrock で Claude アプリを作るときの実務上の差分を整理します。

## このノートで押さえること

- Bedrock では AWS の IAM、リージョン、監査ログ、ネットワーク境界を前提に設計する。
- モデル ID や inference profile は、Anthropic API のモデル名とは別物として扱う。
- エンタープライズ環境では、権限分離、CloudTrail、VPC、KMS などの運用要件が重要になる。
- アプリ側のプロンプト設計、評価、エラー処理は通常の Claude API と同じく必要である。

## Bedrock を選ぶ理由

既に AWS を使っている組織では、Bedrock を使うことで IAM、CloudTrail、請求、ネットワーク、データガバナンスを既存の運用に乗せやすくなります。

一方で、Anthropic API のドキュメントに書かれたモデル名やリクエスト例をそのまま使えないことがあります。Bedrock 固有のモデル ID、リージョン、SDK の呼び出し方を確認します。

つまり Bedrock は「Claude の別 UI」ではなく、AWS の管理面に Claude を組み込む選択肢です。

## 実装で注意する差分

クライアント作成では AWS credentials と region が必要です。ローカル開発、CI、本番で認証方法が違うため、環境ごとの設定を分けます。

モデル呼び出しでは、モデル ID、inference profile、最大トークン、temperature、stop sequence などを明示します。利用可能なモデルはリージョンによって変わることがあります。

レスポンス形式やエラー形式も、AWS SDK の例外として扱う必要があります。レート制限、権限不足、モデル未有効化、リージョン違いを区別してログに残します。

## 運用とガバナンス

本番利用では、誰がどのモデルを呼べるかを IAM で制御します。開発者、アプリケーション、CI、運用者の権限を分けると事故を減らせます。

CloudTrail やアプリログで、呼び出し量、失敗率、レイテンシ、コストを追跡します。ただしプロンプト本文に機密情報が含まれる可能性があるため、ログの粒度は慎重に設計します。

企業内 RAG や社内文書処理では、S3、KMS、VPC endpoint、データ保持ポリシーと合わせて検討します。

## 読者向け補足：Bedrock で見る運用境界

Bedrock で Claude を使う価値は、モデル API だけではなく、AWS の既存ガバナンスに乗せられることです。IAM、VPC、CloudWatch、組織の請求管理、監査ログ、データ所在地の考え方と組み合わせて、エンタープライズの運用境界を作れます。

一方で、Anthropic 直 API と同じつもりで実装すると、モデル名、リージョン、認証、quota、ログの見え方でつまずきます。抽象化レイヤーを作る場合も、provider ごとの差分を隠しすぎず、障害調査に必要な情報を残します。

| 設計項目 | Bedrock で確認すること |
| --- | --- |
| 権限 | IAM role、最小権限、環境別の分離 |
| リージョン | 利用可能モデル、データ要件、latency |
| ログ | request id、latency、token、error code |
| ガードレール | 入力制限、出力制限、監査フロー |

### ミニ演習

社内向け要約 API を Bedrock で作る想定で、dev/staging/prod の IAM role、ログ項目、月次 cost review、障害時の fallback を一枚にまとめます。

## 実務で試すワークフロー

1. 使うリージョンで対象 Claude モデルが有効か確認する。
2. 最小 IAM 権限の実行ロールを作り、開発・本番で credentials を分ける。
3. モデル呼び出し wrapper に、AWS エラー種別、レイテンシ、トークン、コスト推定を記録する。

## Prompt pack

- Bedrock で Claude を本番利用するための IAM、ログ、ネットワーク、コスト管理チェックリストを作ってください。
- この Anthropic API 実装を Bedrock 版へ移植する場合の差分を、認証、モデル ID、レスポンス処理に分けて説明してください。
- 社内文書 RAG を Bedrock で構築する場合のセキュリティレビュー項目を整理してください。

## 自分で確認する

- モデル ID とリージョンを環境ごとに管理できている。
- IAM 権限が広すぎない。
- AWS 側の監査ログとアプリ側の評価ログを分けて設計している。

## 関連して読む

- [Token・Cost・Model Choice](../../../ai-basics-for-everyone/what-is-token-cost-model-choice/)
- [Cloud & Infra](../../../../engineering/cloud-infra-02/)
