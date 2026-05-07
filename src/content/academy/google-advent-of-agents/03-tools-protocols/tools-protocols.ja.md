---
title: "Google Advent of Agents：ツールとプロトコルの境界"
date: 2026-05-06
category: academy
description: "MCP、API Registry、A2A、A2UI、Agent Protocols を、エージェントシステムの相互運用境界として整理する。"
plainSummary: "この図解ノートでは、ツール接続、企業 API、他エージェント、対話 UI を同じ層に混ぜないための設計観点をまとめる。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/covers/03-tools-protocols.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: ja
academy:
  series: "Google Advent of Agents"
  module: "03 ツールとプロトコルの相互運用"
  moduleOrder: 123
  source: "Google Cloud Advent of Agents"
  sourceUrl: "https://adventofagents.com/2026/03/21"
  prerequisites:
    - "先に読むとよいもの：Google Advent of Agents：コンテキスト、メモリ、Skills の分層"
draft: false
---

![ツールとプロトコルの境界カバー](/images/academy/google-advent-of-agents/covers/03-tools-protocols.svg)

**注記：** このページは Advent of Agents の MCP Servers、Google Managed MCP、Cloud API Registry、A2A、A2UI、Agent Protocols などの公開トピックを、学習用に再構成したものです。日別記事の翻訳ではなく、「エージェントが外部世界につながるとき、どの境界を分けるべきか」を扱います。

## 解きたい問題

多くのエージェント実装は、最初はひとつの「ツール一覧」から始まります。

天気 API、データベース、社内承認、UI フォーム、別チームのエージェント、企業 API まで、すべてを同じ function calling 層に入れると、後から境界が崩れます。

- ツール呼び出しとエージェントへの委任が区別できない。
- 企業 API の承認、権限、監査が prompt や説明文に散らばる。
- ユーザーに選択や入力を求めたいとき、テキストだけでは状態が残らない。
- 別チームのエージェントと安定して協調できない。
- セキュリティレビューで「何にアクセスできるのか」を説明しにくい。

MCP、A2A、A2UI、API Registry は、略語を増やすためではなく、接続の責任を分けるための設計語彙です。

## 境界図

![エージェントプロトコル境界図](/images/academy/google-advent-of-agents/diagrams/tools-protocol-boundaries.svg)

まずは次のように分けると理解しやすくなります。

| 境界 | 解く問題 | それで解かないこと |
| --- | --- | --- |
| MCP | ツール、リソース、プロンプトをエージェントに接続する。 | 複数エージェント間のタスク契約や企業承認をすべて担うものではない。 |
| API Registry | 承認済みの企業 API を、発見可能で監査可能な形で提供する。 | エージェントの推論や状態管理の代替ではない。 |
| A2A | あるエージェントが別のエージェントにタスクを渡す。 | 通常の関数呼び出しや単純な API 呼び出しの代替ではない。 |
| A2UI | エージェントが対話可能な UI payload を返す。 | バックエンドの権限管理やツール実行の代替ではない。 |
| Policy / Guardrails | 呼び出し前後の承認、遮断、脱敏、記録を行う。 | prompt に書くだけの注意書きでは足りない。 |

本番システムでは、ひとつの万能プロトコルではなく、複数の境界を組み合わせることが多くなります。

## MCP：ツール層として見る

MCP は、エージェントが外部のツール、リソース、プロンプトを共通の形で利用するための境界です。

向いている対象は次のようなものです。

- ファイル、Git、テスト、検索、ブラウザなどの開発ツール。
- ドキュメント、カレンダー、チケット、ナレッジベースなどの業務システム。
- 読み取り専用の検索、取得、要約、エクスポート。
- 再利用できる prompt、schema、運用手順。

MCP の価値は、ツール能力を特定のモデルや単一アプリから切り出せることです。同じツールを複数のクライアントで使いやすくなり、権限やログも考えやすくなります。

ただし、すべてを MCP に入れる必要はありません。別のエージェントが独自の状態と完了基準を持つなら A2A、ユーザーに編集や承認を求めるなら A2UI、企業の承認済み API を扱うなら Registry と Policy の役割が大きくなります。

## API Registry：企業 API を治理する入口

個人プロジェクトではツール関数を直接書いてもよいかもしれません。企業ではそうはいきません。

エージェントが BigQuery、CRM、財務、顧客データに触れるなら、問題は「API を呼べるか」ではなくなります。

- 誰がこの API をエージェント利用として承認したのか。
- どのユーザー、ロール、環境で利用できるのか。
- パラメータや出力に制限が必要か。
- ログを最終ユーザーまで追跡できるか。
- API schema が変わったとき、どう検知するか。

API Registry は、これらをツールディレクトリの層で扱うための考え方です。エージェントはすべてを prompt に覚え込むのではなく、実行時に承認済みの定義を取得します。

## A2A：相手が実行責任を持つとき

A2A を使う判断基準は単純です。相手が独自の状態、推論、ツール境界、完了基準を持つなら、ただの tool ではなくエージェントとして扱う価値があります。

向いている例：

- 研究エージェントに信頼できる出典調査を依頼する。
- プラットフォームエージェントにデプロイ計画を作らせる。
- Python サービスのエージェントと Go サービスのエージェントを協調させる。
- 別チームが管理するエージェントを発見し、タスクを渡す。

天気 API、ファイル読み取り、SQL クエリ、ローカルコマンドは通常のツールで十分です。ツールをエージェント化しすぎると、責任境界がむしろ曖昧になります。

## A2UI：テキストでは足りない対話

エージェントが複数案の比較、承認、編集、並べ替えを求める場面では、長いテキストだけでは弱くなります。

A2UI は、エージェントが UI として描画でき、状態を返せる payload を出すための境界です。

向いている場面：

- 複数のデプロイ案からひとつ選ぶ。
- 実行予定のツール呼び出しを一覧で承認する。
- 分析結果をフィルタ可能な表として出す。
- Gemini Enterprise のようなワークベンチに小さな対話アプリを埋め込む。

重要なのは見た目だけではありません。ユーザーがどの選択肢を選んだか、どの値を変えたか、何を拒否したかが、後続の状態として扱えることです。

## 設計例

「日本地域の先週の売上異常を分析し、地域マネージャー向けの行動案を作る」エージェントを考えます。

| ステップ | 境界 | 理由 |
| --- | --- | --- |
| 利用できるデータセットを取得する | API Registry | 管理者が承認したデータ源だけを使う。 |
| 集計データを問い合わせる | MCP または Registry-backed tool | これはツール呼び出し。 |
| 異常原因を専門エージェントに説明させる | A2A | 相手に独自の分析責任がある。 |
| 行動案を比較表示する | A2UI | ユーザーの編集と承認が必要。 |
| 最終メールを送る | Tool + Policy | 高リスク操作なので認可と監査が必要。 |

障害が起きたときも、schema の問題なのか、権限の問題なのか、サブエージェントの推論なのか、UI 状態の問題なのかを切り分けやすくなります。

## 概念コード

```python
approved_tools = api_registry.discover(
    user={"id": "u_123", "region": "jp"},
    purpose="sales_analysis",
)

sales_summary = mcp_client.call_tool(
    name="query_sales_summary",
    arguments={"week": "last_week", "region": "jp"},
)

root_cause = a2a_client.delegate(
    agent="anomaly_explainer",
    task={"summary": sales_summary, "required_output": "ranked_causes"},
)

ui_payload = a2ui.render_choice_panel(
    title="Choose actions",
    options=root_cause["recommended_actions"],
)
```

実装の形は違っても、発見、呼び出し、委任、UI 返却を混ぜないことが大切です。

## 復習タスク

自分のエージェントについて、接続境界表を作ってみます。

1. 呼び出す外部能力をすべて列挙する。
2. それが tool、企業 API、別エージェント、UI interaction のどれかを分類する。
3. 権限、ログ、失敗処理を書く。
4. いま一つの関数層に混ざっているものを見つける。
5. 最もリスクの高い能力を policy-gated tool にする。
6. 承認操作をテキストではなく構造化 UI payload として設計する。

## チェックリスト

- MCP、A2A、A2UI、API Registry の違いを説明できる。
- すべての外部能力を tool と呼ばない。
- 企業 API には schema、所有者、権限、監査が必要だとわかる。
- A2A を使うべき相手と普通の関数でよい相手を分けられる。
- ユーザー承認を A2UI payload として設計できる。
- ツール呼び出し前後の policy gate を描ける。

## 参考リソース

- [Advent of Agents](https://adventofagents.com/)
- [Season 2: Developer's Guide to AI Agent Protocols](https://adventofagents.com/2026/03/21)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [A2A Protocol](https://github.com/a2aproject/A2A)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
- [Agent Starter Pack](https://github.com/GoogleCloudPlatform/agent-starter-pack)
