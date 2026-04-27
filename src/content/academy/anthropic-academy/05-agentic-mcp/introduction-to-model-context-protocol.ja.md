---
title: "Model Context Protocol 入門"
date: 2026-03-31
category: academy
description: "MCP の基本発想、モデルとツールを接続する枠組み、実務上のメリットを把握するための入門ノートです。"
plainSummary: "MCP をクライアント、サーバー、ツール、リソース、権限の関係として理解し、AI と外部システムを接続する基本を整理します。"
difficulty: "advanced"
coverImage: "/images/academy/anthropic-academy/covers/05-agentic-mcp/introduction-to-model-context-protocol.svg"
tags:
  - "Agents"
lang: ja
academy:
  series: "Anthropic Academy"
  module: "Agents と MCP"
  moduleOrder: 5
  source: "Anthropic Academy"
  sourceUrl: "https://anthropic.skilljar.com/introduction-to-model-context-protocol"
  prerequisites: []
draft: false
---
Model Context Protocol（MCP）は、AI アプリケーションが外部ツールやデータソースに接続するための標準化されたプロトコルです。USB-C のように、クライアントとサーバーが共通の方式で能力をやり取りできるようにします。

## このノートで押さえること

- MCP は AI と外部ツールの M × N 統合を、クライアント + サーバーの組み合わせに変える。
- MCP client は AI 側、MCP server はツールやデータを提供する側として考える。
- Tools、Resources、Prompts はそれぞれ「実行」「参照」「定型文脈」を担う。
- 便利さと同時に、権限、監査、ユーザー承認、失敗時の扱いを設計する必要がある。

## MCP が解く問題

AI アプリがファイル、カレンダー、データベース、GitHub、社内 API に接続するたびに個別実装を作ると、組み合わせが爆発します。MCP はこの統合を標準化し、AI 側とツール側が共通の形式でやり取りできるようにします。

MCP を使うと、新しいツールは MCP server として実装し、対応する AI クライアントから利用できます。AI アプリごとに同じ統合を作り直す必要が減ります。

ただし、標準化は安全性を自動で保証するわけではありません。何を読めるか、何を実行できるか、誰が承認するかを設計します。

## Client / Server / Tool

**MCP client** は Claude Desktop、IDE、エージェント実行環境など、AI 側でツールを使いたいアプリケーションです。

**MCP server** はファイルシステム、データベース、SaaS、社内 API などの能力を MCP 形式で提供します。

**Tool** は実行可能な操作です。ファイルを読む、Issue を作る、SQL を実行する、検索するなど、外部世界に作用するものです。

**Resource** は参照可能な情報、**Prompt** は再利用可能な文脈やテンプレートとして考えると分かりやすくなります。

## 安全に使うための設計

MCP server は便利なほど強い権限を持ちがちです。ファイルシステム server なら読み書き範囲、データベース server なら実行可能なクエリ、GitHub server ならリポジトリ権限を制限します。

ユーザー承認も重要です。AI が提案したツール呼び出しを自動実行するのか、実行前に確認するのかでリスクが変わります。

ログには、いつ、どのツールが、どの引数で、どんな結果になったかを残します。後から説明できることが、Agentic workflow の信頼性を支えます。

## 実務で試すワークフロー

1. 接続したい外部システムを一つ選び、読み取り・書き込み・実行の権限を分ける。
2. 最小 MCP server では、まず読み取り専用 tool から始める。
3. ツール呼び出しログとユーザー承認のルールを先に決める。

## Prompt pack

- この外部 API を MCP server として公開する場合、tools、resources、prompts をどう分けるべきか設計してください。
- 次の MCP tool に必要な権限、入力検証、監査ログ、ユーザー承認を整理してください。
- MCP と通常の API integration の違いを、開発者と非開発者向けに説明してください。

## 自分で確認する

- MCP client と server の役割を説明できる。
- Tool と Resource の違いを説明できる。
- 権限とログを設計してから server を公開している。

## 関連して読む

- [MCP とは何か](../../../ai-basics-for-everyone/what-is-mcp/)
- [Minimal MCP Server](../../../../engineering/ai-developer-core/minimal-mcp-server/)
- [MCP Advanced Topics](../model-context-protocol-advanced-topics/)
