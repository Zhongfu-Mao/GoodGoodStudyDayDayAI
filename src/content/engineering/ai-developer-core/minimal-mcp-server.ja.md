---
title: "AI Developer Core：最小 MCP Server を構築する"
date: 2026-04-26
category: engineering
description: "ツール境界とプロトコルのメンタルモデルに基づき、読み取り専用の最小 MCP Server を設計・実装します。"
difficulty: intermediate
plainSummary: "MCP の核心価値はモデルにボタンを増やすことではなく、外部ツールとデータを統一プロトコルで Agent に公開し、権限、入力、出力、失敗を明確に定義することにあります。"
tags:
  - "AI Developer Core"
  - "MCP"
  - "Agent"
lang: ja
draft: false
---

# なぜ読み取り専用から始めるのか

MCP（Model Context Protocol）は、エージェントが外部ツールやデータソースへ安全かつ標準化された方法で接続するための仕組みです。開発者にとっての価値は、単に「新しいフレームワークが増える」ことではなく、ツール名、入力パラメータ、出力形式、書き込み権限の有無、そして失敗時の表現を標準化できる点にあります。

最初のステップとしては、**読み取り専用（Read-only）**の Server を構築することをお勧めします。リスクが低く、プロトコル境界の設計を学びやすいだけでなく、後から承認（Approval）フローを統合する際にも適しています。

## 実際の小さなユースケースを選ぶ

現在のサイトを題材に、`site_content_search` Server を構築してみましょう。以下の2つのツールがあれば十分です。

- `list_recent_posts(category, limit)`：指定したカテゴリの最新記事を列挙する。
- `search_posts(query, category)`：タイトル、タグ、本文の要約を検索する。

これらだけで、エージェントはファイルシステム全体に直接アクセスすることなく、サイトの内容を十分に把握できるようになります。

## ツール設計の原則

**ツール名は「アクション」として定義する**。`run_rg`（ripgrep 実行）のような内部的な名称ではなく、`search_posts` のようにモデルがその役割を直感的に理解できる名称を選びます。

**入力スキーマは最小限に絞る**。`category` は enum（列挙型）にし、`limit` には上限を設け、`query` には長さ制限を課すなど、パラメータの範囲を厳密に定義します。

**出力は構造化する**。リストを返す場合は、各項目に `title`、`path`、`date`、`tags`、`snippet` を持たせます。単なるプレーンテキストの連結にすると、モデルが情報を引用しにくくなります。

**エラーは意味を持たせる**。結果なし、引数不正、内部エラーなどを区別して返します。すべてを汎用的な例外として扱わないようにします。

## 権限の境界

読み取り専用 Server であっても、読み取りを許可するディレクトリ、禁止するファイル、全文を返すか要約に留めるか、下書きやプライベートファイルの扱いなどを明確にします。境界が明確なツールほど、安全に権限を委譲できます。

将来的に書き込みツールを追加する場合は、別の権限レイヤーとして設計します。ファイルの書き込み・削除、コミット、メール送信、有料 API の呼び出しなどは、読み取り専用の検索ツールと同じレベルで扱うべきではありません。

## 実験の目標

この実験のゴールは、小さく明確な境界を持つ読み取り専用ツールサービスを構築することです。エージェントがサイトの内容を検索でき、かつ任意のシステムファイルにはアクセスできない状態を目指します。完成物は以下の通りです。

- MCP Server のエントリーポイント。
- 2つの読み取り専用ツールの定義。
- 入出力のサンプルセット。
- 権限境界の定義ドキュメント。
- 境界を検証するためのテストケース。

重要なのはコードの量ではなく、**境界（Boundary）の設計**です。優れたツールとは、モデルにとって使いやすく、人間にとって制御しやすいものです。

## ツール契約（Tool Contract）

`list_recent_posts` は以下のように設計できます。

```json
{
  "name": "list_recent_posts",
  "input": {
    "category": "academy | engineering | foundations | radar",
    "limit": 5
  },
  "output": {
    "items": [
      {
        "title": "string",
        "path": "string",
        "date": "YYYY-MM-DD",
        "tags": ["string"]
      }
    ]
  }
}
```

`search_posts` は、全文ではなくスニペット（Snippet）を返すようにします。初版では全文読み取りを許可しないことで、モデルが大量の情報を文脈に詰め込むのを防ぎ、機密情報の漏洩リスクも軽減できます。

## ディレクトリの境界

アクセスを許可するのは `src/content` 内の公開コレクション（`academy`、`engineering`、`foundations`、`radar`）に限定します。`_sources`、`.local.md`、`.env`、`.git`、`scripts/local`、ビルドキャッシュなどへのアクセスは厳禁です。ローカル環境で読み取れることと、ツールが公開すべき情報は別物です。

**安全境界は、プロンプトではなく Server 側の実装で担保します**。プロンプトで「読まないでください」と指示するだけでは不十分です。そもそもツールが権限外の操作を提供しないことが最も確実な防御です。

## 境界検証テスト

以下のようなテストケースで安全性を検証します。

- 公開記事タイトルの検索：**成功すること**。
- `_sources` へのアクセス要求：**拒否されること**。
- `.env` ファイルの読み取り要求：**拒否されること**。
- `limit` に 999 を指定：**上限値で制限されるか、エラーになること**。
- `category` に任意のパスを指定：**スキーマ検証で拒否されること**。

これにより、ツールが単なる `grep` のラッパーではなく、境界を管理する製品インターフェースであることを確認できます。

## チェックリスト

- ツールは厳格に読み取り専用（Read-only）となっているか。
- 入力パラメータに enum や長さ制限があるか。
- 出力は構造化され、全文を漏洩させていないか。
- エラーは `no_results`、`invalid_input`、`forbidden`、`internal_error` に分類されているか。
- 境界検証テストを通過しているか。
- ツール呼び出しごとに、引数と結果件数がログに記録されているか。

## 試してみること

ローカル環境で読み取り専用 MCP Server を作成し、`src/content` の記事を検索できるようにします。そのエージェントに「foundations カテゴリの AI Developer Core 記事をすべてリストアップし、推奨される学習順序を作成してください」と依頼してみましょう。エージェントがツールから返されたデータのみを使用し、隠しファイルにアクセスしようとしないか確認します。

将来的に書き込み機能を追加する場合は、別の Server または別の権限レイヤーとして切り分けます。例えば、`suggest_article_patch` は差分（Diff）を提案するのみに留め、実際のファイル更新は常に人間の承認を必須とします。

## 関連基礎

- [MCP とは何か](../../../start/ai-basics-for-everyone/what-is-mcp/)：プロトコルの役割についてのメンタルモデルを構築する。
- [Introduction to Model Context Protocol](../../../academy/anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/)：Anthropic Academy による MCP 入門。
- [Agent = 状態、ツール、フィードバックループ](../../../foundations/ai-developer-core/agent-state-tools-feedback-loop/)：なぜツール境界と終了条件（Stop Condition）が必要なのかを理解する。

## 参考

- [Anthropic Engineering](https://www.anthropic.com/engineering)
- [OpenAI Agents SDK](https://platform.openai.com/docs/guides/agents-sdk/)
- [Google Agent Development Kit](https://adk.dev/)
- [Microsoft AI Agents for Beginners](https://github.com/microsoft/ai-agents-for-beginners)
