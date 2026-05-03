---
title: "AI Academy ルート：エンジニアのための AI 活用ロードマップ"
date: 2026-04-27
category: academy
description: "Codex / Claude Code から MCP、Agents、RAG、Evals、Production、Context Engineering まで、エンジニアが AI をシステムとして組み込むための実践的ルートです。"
coverImage: "/images/academy/learning-routes/engineering-route.svg"
difficulty: intermediate
plainSummary: "本ルートはエンジニアを対象としています。AI coding、MCP、Agent、RAG、Evals、本番環境の最適化、そして Context Engineering を一つの堅牢な実践ルートとして統合します。"
tags:
  - "AI Engineering"
lang: ja
academy:
  series: "AI Academy Learning Routes"
  module: "ロール別ルート"
  moduleOrder: 2
  source: "サイト内 AI Academy / Engineering ルート"
  prerequisites:
    - "先に読むとよいもの：AI Basics for Everyone"
draft: false
---

## このルートの対象読者

すでにエンジニアリングのバックグラウンドをお持ちであれば、「AI にコードを書かせる」という単発の利用で終わらせるのはもったいないです。本ルートの目標は、AI を**「新しい開発の共同作業者」**であり、かつ**「システムを構成する重要なコンポーネント」**として深く理解することにあります。

このルートを修了した際、以下の 4 つの問いにエンジニアとして答えられる状態を目指します。

1. AI Coding ツールを実際の開発リポジトリ（Repo）にどう組み込み、運用するか。
2. ツール利用、権限管理、ログ、承認フロー、リプレイメカニズムをどう設計するか。
3. RAG、Agent、Evals はそれぞれどのようなエンジニアリング上の課題を解決するのか。
4. どこまでが「プロダクト機能」で、どこからが単なる「プロンプトによるデモ」なのか。

## フェーズ 1：AI Coding の実プロジェクトへの導入

まずは Codex を通じて、AI との協働の基礎を固めます。

- [Codex Quickstart](../../openai-academy/05-codex/quickstart/)：基本的なワークフローを把握する。
- [Codex App](../../openai-academy/05-codex/codex-app/)：ローカルワークスペース、タスク実行、検証のサイクルを理解する。
- [Better Prompts](../../openai-academy/05-codex/better-prompts/)：プロンプトを「エンジニアリングタスク」として記述する手法。

続いて [Claude Code in Action](../../anthropic-academy/04-developer-tools/claude-code-in-action/) を読み、異なるアプローチを持つ Coding Agent のワークフローと比較検討します。

**注目すべき点**：AI が単にコードを書けるか否かではなく、**コンテキストを正確に読み取り**、**変更範囲を適切に制御**し、**検証を自動実行**した上で、**レビュー可能な Diff** を残せるかという点に注目してください。

## フェーズ 2：ツールプロトコルと制御境界の設計

次に、AI モデルと外部ツールの架け橋となる MCP（Model Context Protocol）を学びます。

- [MCP とは何か](/start/ai-basics-for-everyone/what-is-mcp/)：プロトコルの実装に入る前に、MCP が標準化しようとしている課題の本質をつかむ。
- [Introduction to Model Context Protocol](../../anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/)：モデルがツールやデータソースへ標準的に接続するための設計思想。
- [MCP Advanced Topics](../../anthropic-academy/05-agentic-mcp/model-context-protocol-advanced-topics/)：複雑な権限管理、機能記述（Capability Description）、高度なインテグレーション。
- [Minimal MCP Server](../../../engineering/ai-developer-core/minimal-mcp-server/)：最小限の実装を通じて、システムの境界線を理解する。

**注目すべき点**：MCP の本質は、単に連携ツールを増やすことではなく、**ツール利用を「記述可能」「承認可能」「監査可能」にする**ことにあります。

## フェーズ 3：Agent、RAG、Evals の統合的理解

以下の 3 要素は独立したバズワードではなく、一つのシステムとして捉える必要があります。

| テーマ | 推奨コンテンツ | 解決すべきエンジニアリング上の課題 |
| --- | --- | --- |
| **Agent** | [Building Agents](../../openai-academy/07-building-with-ai/agents/) + [Agent State / Tools / Feedback Loop](../../../foundations/ai-developer-core/agent-state-tools-feedback-loop/) | 複数ステップのタスク推進、状態の中断、検証メカニズム |
| **RAG** | [RAG](../../openai-academy/07-building-with-ai/rag/) + [RAG Minimum System](../../../engineering/ai-developer-core/rag-minimum-system/) | 外部データに基づいた信頼性の高い知識補完システムの構築 |
| **Evals** | [Evals](../../openai-academy/07-building-with-ai/evals/) + [Evals / Benchmarks / Product Quality](../../../foundations/ai-developer-core/evals-benchmarks-product-quality/) | システムの改善を定量的・客観的に測定する評価体系の確立 |

実際のプロダクト開発では、RAG には Eval による評価が不可欠であり、Agent には明確なツール境界が必要で、その境界の運用にはログと承認フローが欠かせません。

## フェーズ 4：デモから本番運用（Production）へ

最後に、AI 機能を長期運用可能な「システム」へと昇華させます。

- [Production Optimization](../../openai-academy/07-building-with-ai/production-optimization/)：レイテンシ、コスト、信頼性、モニタリングの最適化。
- [Context Engineering とは何か](/start/ai-basics-for-everyone/what-is-context-engineering/)：コンテキストを重要なプロダクト・リソースとして扱う視点。
- [Context Engineering Playbook](../../../engineering/ai-developer-core/context-engineering-playbook/)：コンテキスト管理をプロンプトのテクニックから「システム設計」へと引き上げる。
- [Agent Harness](../../../engineering/ai-developer-core/agent-harness-logging-approval-replay/)：Agent の振る舞いを追跡（Trace）、レビュー、リプレイ可能にする基盤。

このフェーズの理解が、AI 機能を一過性のデモで終わらせるか、**長期的に維持・メンテナンス可能なシステム**にできるかの分水嶺となります。

## 推奨されるアウトプット

本ルートの学習を終えたら、以下の資産を自身のプロジェクトに残すことをお勧めします。

- **AI Coding ワークフロー・テンプレート**：要件定義、探索、実装、自動検証、レビューの各ステップを定義したもの。
- **最小構成の MCP またはツール利用デモ**：権限設定とログ出力が明確に定義されているもの。
- **RAG / Agent 用の評価チェックリスト**：回答の正確性、引用の妥当性、失敗パターン、人間による介入ポイントを含むもの。

エンジニア向けルートの核心は、新しい用語を追いかけることではなく、**AI の能力をメンテナンス可能、検証可能、そしてロールバック可能なシステムの中に正しく配置すること**にあります。
