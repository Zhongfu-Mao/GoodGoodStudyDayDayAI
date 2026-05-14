---
title: "Model Context Protocol 入門：ツール接続をプロトコル問題にする"
date: 2026-03-31
category: academy
description: "client、server、tools、resources、prompts、transport、権限、ガバナンスから MCP を理解し、個別ツール統合を使い捨てコードにしない。"
plainSummary: "MCP は Agent と外部ツール、リソース、prompt の接続を標準化する。魔法の層ではなく、権限、version、監査、ガバナンスが必要な工程 interface である。"
difficulty: advanced
coverImage: "/images/academy/anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/mcp-protocol-hub-cover.png"
tags:
  - Agent
  - MCP
lang: ja
academy:
  series: "Anthropic Academy"
  module: "Agent と MCP"
  moduleOrder: 5
  source: "Anthropic Academy"
  sourceUrl: "https://anthropic.skilljar.com/introduction-to-model-context-protocol"
  prerequisites:
    - "Python プログラミング基礎"
    - "JSON と HTTP request / response 基礎"
draft: false
---

# Model Context Protocol 入門：ツール接続をプロトコル問題にする

![MCP protocol hub が model、tool、data source を接続する](/images/academy/anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/mcp-protocol-hub-cover.png)

Agent を作り始めると、すぐに同じ問題に当たります。モデルは外部世界へアクセスする必要があります。

必要になるものです。

- GitHub issue を読む。
- データベースを問い合わせる。
- 文書を検索する。
- 内部 API を呼ぶ。
- デザインを読む。
- ログを読む。
- 既存業務システムを使う。

各アプリが各ツールに対して schema、認証、呼び出し、エラー処理を個別に実装すると、統合コストはすぐに膨らみます。Model Context Protocol（MCP）の価値はここにあります。モデルアプリと外部ツールの接続を標準化します。

一言でいうと：

**MCP は tools、resources、prompts を統一プロトコルで AI client に公開する。**

## MCP が解くのは「呼べるか」ではなく N 対 M 統合

プロトコルがない場合、N 個の AI client と M 個の tool があると、N × M の adapter が生まれがちです。

プロトコルがあると、client は MCP を理解し、tool 側は MCP Server を実装します。接続複雑度が下がります。

| 役割 | 責任 |
| --- | --- |
| MCP Client | AI アプリや Agent 環境内で server 能力を発見し呼び出す |
| MCP Server | tools、resources、prompts を公開し、実外部システムへ接続する |
| Tool | issue 検索、ファイル操作、検索などの実行 action |
| Resource | 文書、ファイル、DB record などの読み取り対象 |
| Prompt | 再利用可能な prompt template や task entry |
| Transport | client と server の通信方式。stdio、HTTP など |

MCP の焦点は単一ツールではありません。ツールがどう発見され、説明され、呼び出され、結果を返すかです。

## tools、resources、prompts を分ける

![MCP server 境界、tools、resources、permission layer](/images/academy/anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/mcp-server-boundaries.png)

多くの統合は、すべてを tool と呼ぶことで混乱します。

MCP 的な考え方では次のように分けます。

| 種類 | 向くもの | リスク |
| --- | --- | --- |
| Tool | action や計算を実行する | 副作用があり、権限が必要 |
| Resource | 既存内容を読む | access control とデータマスキングが必要 |
| Prompt | 再利用 task template を提供する | version 管理と適用範囲が必要 |

例です。

- `list_pull_requests` は tool。
- `repo://owner/name/README.md` は resource。
- `review_pr_prompt` は prompt。

種類を分けると、権限と監査も明確になります。

## Transport はデプロイ方式を決める

MCP は複数の transport で動けます。現在の標準的な transport は主に次の二つです。

| Transport | 向く場面 |
| --- | --- |
| stdio | ローカルツール、CLI 統合、開発環境 |
| Streamable HTTP | remote server、チーム共有、クラウドデプロイ |

ローカル stdio は始めやすいですが、Streamable HTTP はチーム共有サービスに近いです。古い HTTP with SSE は legacy transport であり、WebSocket は custom transport として設計できますが、標準 transport として扱うべきではありません。transport を選ぶときは次を考えます。

- server はどこで動くか。
- 認証は誰が担当するか。
- ログはどこに残るか。
- version をどう上げるか。
- 接続元をどう制限するか。

プロトコルが統一されても、デプロイ複雑度は消えません。より明確な場所に移るだけです。

## 権限とガバナンスは後付けしない

MCP server が実システムにつながった瞬間、それは開発ツールではなく Agent の能力境界になります。

設計すべき項目です。

- どの client が接続できるか。
- どのユーザーがどの tool を呼べるか。
- tool 引数を検証するか。
- 書き込み tool に確認を入れるか。
- 出力に機密情報がないか。
- 各呼び出しに audit log があるか。
- server version の変更は互換か。

MCP server を「モデルの裏口」にしないことです。内部 API と同じように統制します。

## ケース：GitHub MCP Server

目標：Agent が GitHub プロジェクトを支援できるようにする。

能力分解：

- Resource：repository README、issue 本文、PR diff。
- Tool：issue 一覧、コメント作成、CI 状態読み取り。
- Prompt：PR review template、release note template。

権限方針：

- デフォルトは read-only。
- コメント、label 変更、issue close は確認が必要。
- merge、branch 削除はデフォルト無効。
- すべての tool call は repo、対象、user、time、result を記録する。

これなら Agent は効率よく協働できますが、無制限に repository を操作しません。

![MCP governance risk map：permission、version、audit、data boundary](/images/academy/anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/mcp-governance-risks.png)

## よくあるアンチパターン

**アンチパターン 1：MCP を万能 plugin system と考える。**

MCP は接続標準を解きます。権限、安全、データ品質、製品 workflow は自動では解けません。

**アンチパターン 2：すべてを書き込み tool にする。**

まず resource と read-only tool を分けます。書き込み能力は遅く開くほど安全です。

**アンチパターン 3：server に version と owner がない。**

複数 Agent が依存し始めると、version 変更は本番リスクになります。

**アンチパターン 4：audit log がない。**

Agent が外部システムを呼んだら、誰が、いつ、なぜ、何を呼んだか追跡できる必要があります。

## MCP Server 設計テンプレート

```md
### Server

名前：
owner：
実行場所：
transport：
認証方式：

### Capabilities

Tools：
Resources：
Prompts：

### Permissions

デフォルト権限：
確認が必要な tool：
禁止 action：
機密フィールド処理：

### Operations

ログ項目：
version 方針：
error code：
rate limit：
rollback：
```

## チェックリスト

- tool、resource、prompt を明確に分けているか？
- server に owner と version 方針があるか？
- 書き込み tool はデフォルトで確認を必要にしているか？
- tool の入出力は構造化されているか？
- 各呼び出しの audit 情報を記録しているか？
- remote server に認証と access control があるか？
- 失敗と timeout の扱いがあるか？

## さらに読む

- [Agent Skills 入門](./introduction-to-agent-skills/)：再利用 workflow を Agent が発見できる能力にする。
- [MCP Advanced Topics](./model-context-protocol-advanced-topics/)：より複雑なデプロイ、認証、ガバナンスを理解する。
- [OpenAI Academy：信頼できる AI Agents を構築する](../../openai-academy/07-building-with-ai/agents/)：MCP を Agent システムアーキテクチャへ戻して考える。

## 参考

- [Model Context Protocol Introduction](https://modelcontextprotocol.io/introduction)
- [Anthropic MCP documentation](https://docs.anthropic.com/en/docs/mcp)
- [MCP specification](https://spec.modelcontextprotocol.io/)
