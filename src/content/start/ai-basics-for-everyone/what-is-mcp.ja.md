---
title: "AI Basics for Everyone：MCP とは何か、AI が外部ツールとつながる標準規格"
date: 2026-04-27
category: start
description: "AI と外部ツールを接続するオープンプロトコル「MCP」を、USB-C の例えを用いて分かりやすく解説します。"
coverImage: "/images/start/ai-basics-for-everyone/cards/mcp-concept-card.ja.svg"
difficulty: beginner
plainSummary: "MCP（Model Context Protocol）は、AI が外部のツールやデータに標準化された方法で接続するためのプロトコルです。USB-C のように、一つの規格で多様なツールとの連携を可能にします。"
tags:
  - "MCP"
  - "Agent"
lang: ja
academy:
  series: "AI Basics for Everyone"
  module: "基本概念"
  moduleOrder: 10
  source: "サイト内 Start / Engineering ガイド"
  prerequisites: []
draft: false
---

## まず一言で

MCP（Model Context Protocol）は、AI モデルが外部のツール、データソース、サービスに統一された手法でアクセスするための「オープンプロトコル（標準規格）」です。USB-C が異なる機器同士を一本のケーブルでつなぐように、MCP は AI と多様なツールを共通の規格で接続します。

## なぜ MCP が必要なのか

MCP が登場する前は、AI アプリケーションが特定のツール（カレンダー、データベース、ファイルシステムなど）を利用するたびに、個別の接続コードを書く必要がありました。

| 課題 | MCP 以前 | MCP 以降 |
| --- | --- | --- |
| **開発コスト** | 3 つの AI × 5 つのツール ＝ 15 通りの実装が必要 | 各 AI とツールが MCP に対応するだけで連携可能 |
| **拡張性** | ツールを追加するたびに、すべての AI 側の修正が必要 | 新しいツールは MCP を一度実装するだけで全 AI から利用可能 |
| **管理** | 権限管理やアクセスログの形式がバラバラ | プロトコル層で統一的な管理が可能 |

複雑な組み合わせ（M × N 問題）を、シンプルな接続（M + N）に変えるのが MCP の最大の価値です。

## USB-C の例えで理解する

- **AI モデル** ＝ ノート PC
- **外部ツール** ＝ モニター、外付け HDD、キーボード
- **MCP** ＝ USB-C という共通規格

USB-C が普及する前は、機器ごとに専用のコネクタやケーブルが必要でした。現在、USB-C ケーブル一本あればあらゆる周辺機器がつながるのと同様に、MCP は AI と無数のツールを一つの仕組みでつなぎます。

## 一般ユーザーへのメリット

プログラミングをしないユーザーにとっても、MCP はすでに利便性を高めています。

- **シームレスな連携**：Claude Desktop などで Google Drive や Notion を接続する機能の裏側では、MCP が動いています。
- **マルチタスクの実現**：AI エージェントが「ウェブで検索し、ファイルを読み込み、カレンダーに登録する」といった一連の動作を同時に行えるのも、MCP による連携のおかげです。
- **エコシステムの拡大**：新しい便利なツールが MCP に対応すれば、お気に入りの AI アシスタントからすぐにそのツールを使えるようになります。

## サイト内で次に読むもの

[Introduction to Model Context Protocol](/academy/anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/)：MCP の全体設計とアーキテクチャについて詳しく解説しています。

[Minimal MCP Server](/engineering/ai-developer-core/minimal-mcp-server/)：実際に MCP サーバーを構築するための最小限の実装例を確認できます。

## やってみよう

Claude Desktop を使用している場合は、設定画面（Settings）の「MCP」項目を確認してみてください。ファイルシステムなどのツールが接続されていれば、ローカルファイルの読み取りを依頼してみましょう。「ツールを使用中（Using tool...）」という表示が出れば、それが MCP が機能している瞬間です。

## 実用的な見方

「100 以上の外部ツールと統合」を謳う AI 製品を見かけた際は、以下のポイントをチェックしてみてください。

1. **標準化**：その統合は MCP のような標準プロトコルに基づいているか、それとも独自の個別実装か。
2. **拡張性**：新しいツールを追加したい場合、どれくらいの開発工数がかかるか。
3. **透明性**：ツール呼び出しの際、適切な権限管理と実行ログが提供されているか。
4. **疎結合**：一つのツールを無効化しても、システム全体の安定性に影響を与えないか。
