---
title: "AI Basics for Everyone：MCP とは何か、AI が外部ツールとつながる仕組み"
date: 2026-04-27
category: academy
description: "USB-C のたとえで MCP を解説します。AI とツールを標準インターフェースでつなぐオープンプロトコルです。"
coverImage: "/images/academy/ai-basics-for-everyone/mcp.svg"
difficulty: beginner
plainSummary: "MCP は Model Context Protocol の略で、AI が外部ツールやデータに標準化された方法で接続するためのプロトコルです。USB-C のように、一つの規格で多くのツールをつなげます。"
tags:
  - "MCP"
  - "Agent"
lang: ja
academy:
  series: "AI Basics for Everyone"
  module: "基本概念"
  moduleOrder: 10
  source: "サイト内 Academy / Engineering ガイド"
  prerequisites: []
draft: false
---

## まず一言で

MCP（Model Context Protocol）は、AI が外部のツール、データソース、サービスに統一された方法でアクセスするためのオープンプロトコルです。USB-C が機器同士を一本のケーブルでつなぐように、MCP は AI とツールを一つの規格で接続します。

## なぜ MCP が必要なのか

MCP 以前は、AI アプリがツール（カレンダー、DB、ファイルなど）を使うたびに個別のコードが必要でした。

| MCP なし | MCP あり |
| --- | --- |
| 3 つの AI × 5 ツール＝15 通りの実装 | 3 + 5 = 8 個のアダプタ |
| ツール追加のたびに全 AI を修正 | 新ツールは MCP を一度実装するだけ |
| 権限やログがバラバラ | プロトコル層で統一できる |

M × N 問題を M + N に変えるのが MCP の価値です。

## USB-C のたとえ

- **AI モデル** ＝ ノート PC
- **外部ツール** ＝ モニター、HDD、キーボード
- **MCP** ＝ USB-C 規格

USB-C 以前は機器ごとに別のケーブルが必要でした。USB-C が一本で済むように、MCP は AI と多数のツールを一つの仕組みでつなぎます。

## 一般ユーザーへの影響

コードを書かなくても、MCP はすでに体験に影響しています。

- Claude で Google Drive や Notion を接続する裏側は MCP です。
- Agent がウェブ検索、ファイル読み込み、カレンダー操作を同時にできるのも MCP 経由です。
- 新ツールが MCP を実装すれば、既存の AI アシスタントからすぐ使えます。

## サイト内で次に読むもの

[Introduction to Model Context Protocol](../../anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/) で全体設計を理解し、[Minimal MCP Server](../../../engineering/ai-developer-core/minimal-mcp-server/) で最小実装を見られます。

## やってみよう

Claude Desktop を使っている場合、設定画面で MCP サーバーの項目を確認してください。ファイルシステムなどのツールが接続されていれば、ローカルファイルの読み取りを頼んでみましょう。「ツールを使用中」の表示が出れば、MCP が動いている証拠です。

## 実用的な見方

「100 以上のツール統合」を謳う AI 製品を見たら、次を確認してください。

1. 統合は標準プロトコル（MCP）か、個別実装か。
2. 新ツールの追加にどれくらいかかるか。
3. ツール呼び出しに権限管理とログはあるか。
4. 一つのツールを外すと他に影響するか。
