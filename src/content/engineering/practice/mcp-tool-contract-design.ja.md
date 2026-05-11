---
title: "MCP Tool Contract 設計：入力、出力、エラー、権限"
date: 2026-05-11
category: engineering
description: "MCP を流行語としてではなく、Agent が安全に呼び出せるツール契約として設計するための実践ガイド。"
difficulty: advanced
plainSummary: "MCP ツール設計では、名前、入力 schema、構造化出力、エラー分類、権限レベル、監査フィールドを一つの契約として設計することが重要になる。"
tags:
  - "AI Engineering"
  - "MCP"
  - "Agent"
lang: ja
coverImage: "/images/engineering/practice/mcp-tool-contract-cover.png"
draft: false
---

# MCP Tool Contract 設計：入力、出力、エラー、権限

> 時点メモ：この記事は 2026-05-11 に確認しました。MCP specification、OpenAI Apps SDK、Codex の MCP 対応、各クライアントの挙動は変わるため、導入前に公式情報を再確認してください。

MCP は「モデルにもっとツールをつなぐ仕組み」と理解されがちです。しかし実務で重要なのは、何でもつなぐことではありません。外部能力を、発見可能で、検証可能で、監査可能なツール契約として公開することです。

良い契約は、モデルの推測を減らし、人間の承認を簡単にし、失敗時の回放を可能にします。

![MCP Tool Contract の境界](/images/engineering/practice/mcp-contract-boundary.svg)

## ツール名で能力を絞る

`run_sql`、`read_file`、`execute_shell` のような名前は便利ですが、危険です。モデルにパス、クエリ、フィルタ、形式、権限判断を任せすぎます。

より安全なのは、業務動作に近い名前です。

```json
{
  "name": "search_public_posts",
  "description": "Search published site posts by query and category. Drafts, source notes, local files, and private paths are never returned."
}
```

この名前は、公開記事だけを検索し、任意ファイル検索ではなく、草稿やローカル資料を返さないことを示しています。ツール名はモデルの意思決定に直接影響します。

## 入力 Schema は最初の安全境界

入力はできるだけ狭くします。`category` は enum、`limit` は上限付き、`query` は長さ制限付き、日付は形式固定。パスを自由入力にしないことが重要です。

例：

```json
{
  "category": "engineering | foundations | academy | radar",
  "query": "string, 2-80 chars",
  "limit": "integer, 1-10",
  "locale": "zh | ja"
}
```

これなら `_sources`、`.env`、`.git` へのアクセスをパラメータで作れません。安全は prompt ではなく実装で守るべきです。

## 出力は次の検証に使える形にする

出力が大きな自然文だけだと、次の処理も人間の確認も不安定になります。検索ツールなら、タイトル、カテゴリ、URL、日付、snippet、件数、切り詰め有無を構造化して返します。

全文を返す必要は、最初のバージョンではほとんどありません。必要になったら別ツールにし、権限と長さ制限を上げます。

## エラー分類を安定させる

ツールは内部例外をそのまま返すのではなく、安定したエラー型を返すべきです。

| エラー | 意味 | Agent の対応 |
| --- | --- | --- |
| `invalid_input` | schema 不一致 | 修正して再試行 |
| `forbidden` | 禁止範囲 | 停止して境界を説明 |
| `no_results` | 合法だが結果なし | クエリ調整 |
| `rate_limited` | 一時的制限 | 待機、低頻度化、確認 |
| `internal_error` | 内部失敗 | 記録して代替経路 |

特に `forbidden` は停止信号です。言い換えて再挑戦する対象ではありません。

## 権限は段階的に上げる

最初の MCP Server は読み取り専用で十分です。書き込みが必要になったら、権限を段階化します。

| レベル | 例 | 方針 |
| --- | --- | --- |
| L0 | 公開 index、公開 metadata | 自動許可 |
| L1 | 公開ファイルの読み取り検索 | 自動許可 + ログ |
| L2 | patch 生成、草稿作成、有料 API | 承認必須 |
| L3 | 削除、メール送信、push、本番データ変更 | 強い承認と影響表示 |

書き込みツールは、できれば直接実行ではなく `suggest_patch` のような提案型から始めます。実際の書き込みは Harness が承認後に行います。

## 監査フィールドを残す

各呼び出しには run id、tool name、引数概要、結果件数、権限レベル、所要時間、エラー型、承認結果を残します。secret や非公開本文は記録しません。

監査ログはモデルの思考を見るためではなく、システムの行動を再現するためにあります。

## レイヤーで見る MCP Contract

MCP Tool Contract は五つの境界に分けて考えます。

一つ目は意味の境界です。その tool は何の業務動作を表すのか。`search_public_posts` は業務動作ですが、`grep_any_file` は低レベル権限に近い名前です。前者は監査しやすく、後者は毎回権限判断が必要になります。

二つ目はパラメータの境界です。呼び出し側が何を変えられるのかを制限します。query、category、locale、limit、date range はよい候補です。path、SQL、shell command をそのまま渡すと、モデルに判断を任せすぎます。MCP specification では `inputSchema` が有効な JSON Schema object であることが求められます。これは安全の第一線です。

三つ目は結果の境界です。tool は何を、どれだけ返すのか。MCP tool は text、image、audio、resource link、embedded resource、structured content を返せます。Agent にとっては、特に structured content が重要です。自然文から字段を推測する必要が減るからです。

四つ目はエラーの境界です。失敗が回復可能かどうかを分けます。仕様では protocol error と tool execution error が区別されています。前者はリクエスト構造の問題で、後者はモデルがパラメータを変えて回復できる可能性があります。すべてを `internal_error` にすると、Agent は同じ失敗を繰り返しやすくなります。

五つ目は運用の境界です。誰が呼べるか、いつ承認するか、どう rate limit するか、何をログに残すか、どう version を変えるか。MCP は protocol であって、権限設計を自動で完成させるものではありません。

## 実践パス：読み取り専用から始める

MCP を実装する時は、大きな server から始めない方が安全です。まずは読み取り専用で、範囲が狭く、回放できる tool を作ります。

第一段階は index query です。`list_recent_posts`、`search_public_posts`、`get_post_outline` のような tool だけを用意します。公開内容だけを読み、secret、local file、cache、書き込み、有料 API には触りません。この段階で schema、pagination、error type、log field、client の使い心地を確認します。

第二段階は提案型 tool です。`suggest_internal_links`、`suggest_tags`、`suggest_frontmatter_patch` のように、結果は提案として返します。実際のファイル変更は Harness が patch と承認を通して行います。

第三段階で初めて書き込み tool を検討します。草稿作成、index 更新、build trigger、publish API などです。この段階に入る前に、権限レベル、承認、冪等性、rollback、監査ログが必要です。

第四段階は versioning です。複数クライアントが依存した tool は、字段を簡単に壊せません。`tool_name_v2`、optional field、capability detection、migration window を使います。

## 反例：protocol を安全境界だと思い込む

危険な例は万能 file tool です。

```json
{
  "name": "read_file",
  "inputSchema": {
    "type": "object",
    "properties": {
      "path": { "type": "string" }
    },
    "required": ["path"]
  }
}
```

この tool は簡単に見えますが、path 選択をモデルに渡しています。より安全なのは、公開 index だけを読む tool にするか、前の tool が返した resource link だけを受け付ける設計です。

任意 SQL tool も同じです。`execute_sql(query)` は便利ですが、読み取り専用でもデータ漏洩、重い query、業務 filter の迂回が起きます。業務 query に分け、server 側で字段、pagination、権限を固定する方が安全です。

エラーを隠すのも反例です。`Something went wrong` だけでは、Agent は修正も停止もできません。`invalid_input`、`forbidden`、`rate_limited`、`no_results`、`upstream_unavailable` のように分類し、次の行動を示します。

## 現在観測できる状態と確認方法

2026-05-11 時点の MCP Tools specification では、tool は `tools/list` で発見され、`tools/call` で呼び出されます。tool 定義には `name`、`description`、`inputSchema` が含まれ、必要に応じて `outputSchema` を持てます。構造化結果は `structuredContent` に置けます。tool execution error は `isError: true` として返し、モデルの自己修正を助けることができます。安全面では、入力検証、access control、rate limit、出力 sanitization、ユーザー確認、timeout、監査ログが重要とされています。

確認手順は、MCP specification の Server Features / Tools を開き、字段、エラー、security considerations を確認することから始めます。次に対象クライアント、たとえば Codex、Claude Code、ChatGPT Apps SDK が MCP をどう設定し、どう承認し、どう表示するかを確認します。最後に最小 server を作り、巨大 limit、違法 locale、越権 path、空 query、特殊文字でテストします。

## このサイトでの最小構成

このサイト向けの読み取り専用 MCP なら、最初は三つで足ります。

- `list_recent_posts(category, locale, limit)`
- `search_public_posts(query, category, locale, limit)`
- `get_post_outline(url)`

`_sources`、`.local.md`、cache、secret、任意ファイル読み取りは対象外にします。安定したら、内部リンク提案や frontmatter patch 提案を追加できます。

## チェックリスト

- ツール名は業務動作を表しているか。
- 入力 schema は越権を防げるか。
- 出力は構造化され、切り詰め可能か。
- `forbidden` と `no_results` を区別しているか。
- 権限レベルと承認方針があるか。
- 監査に必要な情報だけを残しているか。
- 最初から書き込みを開放していないか。

## 関連記事

- [MCP とは](../../../start/ai-basics-for-everyone/what-is-mcp/)
- [AI Developer Core：最小 MCP Server を作る](../ai-developer-core/minimal-mcp-server/)
- [AIエンジニアリング実践マップ](./ai-engineering-practice-map/)
