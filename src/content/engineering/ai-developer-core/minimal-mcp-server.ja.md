---
title: "AI Developer Core：最小 MCP Server を書く"
date: 2026-04-26
category: engineering
description: "ツール境界とプロトコルの心的モデルから、読み取り専用の最小 MCP server を設計する。"
difficulty: intermediate
plainSummary: "MCP の価値はモデルにボタンを増やすことではありません。外部ツールとデータを統一プロトコルで Agent に公開し、権限、入力、出力、失敗を明確にすることです。"
tags:
  - "AI Developer Core"
  - "MCP"
  - "Agent"
lang: ja
draft: false
---

# なぜ読み取り専用から始めるのか

MCP は Agent が外部ツールやデータ源へ接続するための仕組みである。開発者にとっての価値は、ツール名、入力、出力、書き込み有無、失敗時の表現を標準化できることにある。

第一版は読み取り専用がよい。リスクが低く、プロトコル境界を学びやすく、あとから approval を足しやすい。

## 実際の小さな場面を選ぶ

現在のサイトを題材に、`site_content_search` server を考える。ツールは二つでよい。

- `list_recent_posts(category, limit)`：最近の記事を列挙する。
- `search_posts(query, category)`：title、tags、本文要約を検索する。

この二つだけで、Agent はサイト内容を把握できる。ファイルシステム全体を読む必要はない。

## ツール設計の原則

ツール名は動作として読めるものにする。`run_rg` より `search_posts` のほうがモデルには理解しやすい。

入力 schema は狭くする。`category` は enum、`limit` は上限付き、`query` は長さ制限付きにする。

出力は構造化する。配列なら、各項目に `title`、`path`、`date`、`tags`、`snippet` を持たせる。単なる連結テキストにしない。

エラーは区別する。結果なし、引数不正、内部失敗は別の状態として返す。

## 権限境界

読み取り専用 server でも、読めるディレクトリ、読めないファイル、本文全文を返すか、draft や local file を返すかを明確にする。境界が明確なツールほど、安全に許可しやすい。

将来書き込みツールを追加するなら、別の権限層にする。ファイル書き込み、削除、commit、メール送信、有料 API 呼び出しは、読み取り検索と同じ扱いにしない。

## 実験目標

この実験の目標は、小さく明確な読み取り専用 tool service を作ることだ。Agent はサイト内容を検索できるが、任意のファイルにはアクセスできない。完成物は次の通り。

- MCP server の入口。
- 二つの読み取り専用 tool 定義。
- 入出力サンプル。
- 権限境界の説明。
- 越権テスト。

大切なのはコード量ではなく境界である。良い tool は、モデルにとって使いやすく、人間にとって制御しやすい。

## Tool 契約

`list_recent_posts` は次のように設計できる。

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

`search_posts` は全文ではなく snippet を返す。第一版で全文読み取りを開けないほうがよい。大量本文を文脈へ押し込むのを防ぎ、draft や private file の漏洩リスクも下げられる。

## ディレクトリ境界

読み取りを許すのは `src/content` の公開 collection、つまり `academy`、`engineering`、`foundations`、`radar` に限定する。`_sources`、`.local.md`、`.env`、`.git`、`scripts/local`、build cache は返さない。ローカルで読めることと、tool が公開すべきことは別である。

安全境界は prompt ではなく server 側に書く。Prompt で「読まないで」と言うだけでは弱い。そもそも越権能力を tool が提供しないことが大切だ。

## 越権テスト

次のようなテストを用意する。

- 公開記事タイトルの検索は成功する。
- `_sources` の要求は拒否される。
- `.env` の要求は拒否される。
- `limit` に 999 を渡すと、上限で拒否または切り詰める。
- `category` に任意 path を渡すと、schema で拒否する。

これにより、tool が単なる `grep` の薄い wrapper ではなく、境界を持つ製品 interface であることを確認できる。

## チェックリスト

- tool は読み取り専用か。
- 入力には enum と長さ制限があるか。
- 出力は構造化され、全文を漏らさないか。
- エラーは no_results、invalid_input、forbidden、internal_error に分かれるか。
- 越権テストがあるか。
- tool 呼び出しごとに引数と結果件数を記録しているか。

## 試すこと

ローカル読み取り専用 MCP server を作り、`src/content` の記事を検索できるようにする。その Agent に「foundations の AI Developer Core 記事をすべて見つけ、読む順番を作る」と依頼する。ツール返却データだけを使い、隠しファイルを読まないか確認する。

書き込み能力を後で足すなら、別 server または別権限層にする。たとえば `suggest_article_patch` は diff を提案するだけにし、実際の書き込みは人間承認を必須にする。

## 関連基礎

- [MCP とは何か](../../../academy/ai-basics-for-everyone/what-is-mcp/)：実装前に protocol の役割をつかむ。
- [Introduction to Model Context Protocol](../../../academy/anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/)：Anthropic Academy の MCP 入門。
- [Agent = 状態、ツール、フィードバックループ](../../../foundations/ai-developer-core/agent-state-tools-feedback-loop/)：tool boundary と stop condition を理解する。

## 参考

- [Anthropic Engineering](https://www.anthropic.com/engineering)
- [OpenAI Agents SDK](https://platform.openai.com/docs/guides/agents-sdk/)
- [Google Agent Development Kit](https://adk.dev/)
- [Microsoft AI Agents for Beginners](https://github.com/microsoft/ai-agents-for-beginners)
