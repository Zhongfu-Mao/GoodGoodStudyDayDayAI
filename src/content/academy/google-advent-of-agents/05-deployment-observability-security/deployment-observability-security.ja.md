---
title: "Google Advent of Agents：デプロイ、観測、安全の制御面"
date: 2026-05-06
category: academy
description: "Agent Engine、Cloud Run、Batch、Durable Execution、ADK Evaluation、Observability、Authentication、Model Armor を、本番制御面として整理する。"
plainSummary: "この図解ノートでは、エージェントを本番に出す前に必要なデプロイ、追跡、評価、認証、安全、耐久実行の観点をまとめる。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/covers/05-deployment-observability-security.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: ja
academy:
  series: "Google Advent of Agents"
  module: "05 デプロイ、観測、安全"
  moduleOrder: 125
  source: "Google Cloud Advent of Agents"
  sourceUrl: "https://adventofagents.com/2026/03/25"
  prerequisites:
    - "先に読むとよいもの：Google Advent of Agents：マルチエージェント編成パターン"
draft: false
---

![デプロイ、観測、安全カバー](/images/academy/google-advent-of-agents/covers/05-deployment-observability-security.svg)

**注記：** このページは Advent of Agents の Source-Based Deployment、Agent Engine、Cloud Run、Batch Processing、Durable Execution、ADK Evaluation、Production Observability、Authentication、Guardrails、Model Armor などを学習用に再構成したものです。製品発表の要約ではなく、「エージェントはいつ本番に出せるのか」を扱います。

## 解きたい問題

エージェントの demo が成功しても、本番システムとして十分とは限りません。

本番では次の問いに答える必要があります。

- どこにデプロイし、どうロールバックするか。
- 各実行の入力、ツール、出力、エラーを追跡できるか。
- 品質低下を CI で止められるか。
- ユーザー ID はツールやバックエンドに伝わるか。
- prompt injection、越権、PII 漏えいをどう防ぐか。
- 長いタスクが失敗したとき、途中から再開できるか。
- 大量タスクを非同期に処理できるか。

Advent of Agents の後半が重要なのは、エージェントを「ツールを呼べるもの」から「デプロイ、観測、評価、治理できるシステム」へ進めているからです。

## 本番制御面

![本番エージェント制御面図](/images/academy/google-advent-of-agents/diagrams/production-agent-control-plane.svg)

本番エージェントの周囲には、少なくとも六つの制御面があります。

| 制御面 | 中心の問い | 代表的な信号 |
| --- | --- | --- |
| Deployment | どこで動き、どう公開し、どう戻すか。 | version、environment、config、health check、rollback。 |
| Observability | 何が起きたかを後から追えるか。 | traces、spans、logs、artifacts、replay。 |
| Evals | 品質低下を公開前に見つけられるか。 | trajectory tests、rubrics、golden tasks、CI gate。 |
| Identity | ツール呼び出しは誰を代表するのか。 | end-user auth、OAuth consent、service account、audit log。 |
| Safety | 入力と出力をどう守るか。 | guardrails、Model Armor、PII redaction、approval。 |
| Durability / Batch | 長時間、大量タスクをどう完了させるか。 | retries、checkpoint、resume、queues、batch jobs。 |

本番化とは、一つのデプロイコマンドを成功させることではありません。これらの制御面に最小回答を持つことです。

## Deployment：ローカルから実行基盤へ

ローカルエージェントは素早い反復に向いています。本番実行基盤は、アクセス可能性、スケール、運用管理のために必要です。

少なくとも次を決めます。

- 実行環境：ローカル、Cloud Run、Agent Engine、batch job、企業ワークベンチ。
- 設定：モデル、ツール、鍵、リージョン、ログレベルをどこに置くか。
- 公開方法：source deployment、container、CI/CD、手動リリース。
- ロールバック：安定版にどう戻すか。
- health check：起動できるだけでなく、最小タスクを完了できるか。

エージェントの health check は HTTP 200 だけでは弱いです。モデル、ツール、ログ、権限を含む小さな実行が必要です。

## Observability：最終回答だけでは足りない

エージェント実行には、中間軌跡があります。

- ユーザー入力。
- 有効になった instruction。
- モデル選択と token 使用。
- ツール呼び出しの引数と結果。
- サブエージェントへの委任。
- 検索ソース。
- 安全遮断。
- ユーザー承認。
- 最終出力。

最終回答だけでは、事故の復旧や改善ができません。

最低限、次を答えられる trace が必要です。

| 問い | 必要な記録 |
| --- | --- |
| なぜこのツールを呼んだか | planning span または選択理由。 |
| ツールは何を返したか | 引数、状態、要約、エラー。 |
| どこが遅かったか | span ごとの時間。 |
| どのサブエージェントが失敗したか | delegation span と結果。 |
| ユーザーは何を承認したか | approval payload と選択。 |

観測は dashboard のためではなく、修正できるシステムにするためのものです。

## Evals：公開前の品質ゲート

エージェントの回帰は、構文エラーではなく振る舞いのずれとして現れます。

- ツールの順序が変わる。
- 拒否すべき依頼を拒否しない。
- 出典が必要な回答に出典がない。
- サブエージェントの routing が間違う。
- 同じタスクが以前より危険、冗長、根拠不足になる。

そのため eval は最終テキストだけを比較してはいけません。trajectory test や rubric scoring が重要になります。

最小 eval セット：

| テスト | 例 |
| --- | --- |
| Golden task | 指定入力では特定ツールを呼び、必要フィールドを出す。 |
| Negative task | 越権データ要求を拒否する。 |
| Trajectory test | 先に検索し、分析し、生成する。 |
| Rubric score | 事実性、実行可能性、根拠、安全性が閾値を超える。 |
| Regression task | 修正済み bug を固定テストにする。 |

CI に入れる目的は満点ではなく、低品質な回帰を静かに入れないことです。

## Identity：誰の権限で動くのか

ツール呼び出しは、誰を代表しているのでしょうか。

- システム service account か。
- 現在のログインユーザーか。
- 委任されたロールか。
- 承認後の一時権限か。

ここが曖昧だと、エージェントがユーザーの権限を越えてデータに触れたり、監査ログで責任者が分からなくなったりします。

設計時には、ユーザーの認可方法、スコープ、実行時の credential、取り消し、期限、監査ログを決めます。

## Safety：Guardrails と Model Armor

エージェント安全は、「悪いことをしないで」と prompt に書くことでは足りません。

主なリスク：

- prompt injection。
- jailbreak。
- 高リスクツールの乱用。
- PII 漏えい。
- data exfiltration。
- 承認なしの自動化。

Guardrails は複数箇所に置きます。

| 位置 | 役割 |
| --- | --- |
| 入力前 | 悪意ある依頼、機密情報、越権意図を検出する。 |
| ツール前 | 権限、引数、リスク、承認を確認する。 |
| ツール後 | 脱敏、フィルタ、返却フィールド制限を行う。 |
| 出力前 | PII、危険な提案、ポリシー違反を確認する。 |
| 承認前 | 影響範囲、取り消し可否、代替案を示す。 |

Model Armor のような機能は重要な防火壁ですが、権限、ログ、承認と合わせて設計します。

## Durability と Batch

本番エージェントは短い一問一答だけではありません。

- 10,000 件の文書処理。
- 顧客ごとの要約生成。
- 数時間の移行チェック。
- 人間承認後の再開。
- 外部 API の rate limit と retry。

長いタスクには checkpoint、idempotency、retry policy、timeout、resume、batch status が必要です。そうしないと、最後の一件で失敗したときに最初からやり直しになります。

## 本番前チェック

| 観点 | 最小基準 |
| --- | --- |
| タスク境界 | できること、できないこと、承認が必要なことを書く。 |
| デプロイ | version、environment、config、rollback、health check がある。 |
| ツール | 権限、schema、エラー処理、ログがある。 |
| 観測 | 実行 trace と重要 artifact を復元できる。 |
| 評価 | golden、negative、trajectory、regression tests がある。 |
| ID | ツール呼び出しが誰を代表するか説明できる。 |
| 安全 | 入力、ツール、出力、承認に guardrail がある。 |
| 耐久性 | checkpoint、retry、resume、batch status がある。 |

個人プロジェクトでも、この軽量版を持つだけで事故を減らせます。

## 復習タスク

既存の demo エージェントを一つ選びます。

1. デプロイ先を書く。
2. サービス起動だけでない health check task を作る。
3. 一回の実行について trace span を描く。
4. 5 個の eval を作る：正常 2、越権 1、ツール失敗 1、過去 bug 1。
5. 各ツール呼び出しが代表する identity を書く。
6. 最もリスクの高いツールに人間承認点を置く。
7. 5 分を超えるタスクには checkpoint と resume を設計する。

## チェックリスト

- demo 成功と本番可用性を区別できる。
- デプロイ先、設定、ロールバック、health check を説明できる。
- 入力、ツール、サブタスク、承認、出力の trace を描ける。
- 最終テキストだけでなく trajectory を評価できる。
- ツール呼び出しが誰の権限か説明できる。
- guardrails を入力、ツール、出力、承認に配置できる。
- 長いタスクに checkpoint、retry、resume、batch status を設計できる。

## 参考リソース

- [Advent of Agents](https://adventofagents.com/)
- [Season 2: ADK Evaluation](https://adventofagents.com/2026/03/22)
- [Season 2: Model Armor](https://adventofagents.com/2026/03/23)
- [Season 2: Batch Processing](https://adventofagents.com/2026/03/24)
- [Season 2: Agent Deployment](https://adventofagents.com/2026/03/25)
- [Season 2: Authentication](https://adventofagents.com/2026/03/26)
- [Season 2: Observability](https://adventofagents.com/2026/03/30)
- [Vertex AI Agent Engine](https://docs.cloud.google.com/agent-builder/agent-engine/overview)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
