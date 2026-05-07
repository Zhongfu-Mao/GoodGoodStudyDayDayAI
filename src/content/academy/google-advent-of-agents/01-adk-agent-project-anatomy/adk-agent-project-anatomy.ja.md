---
title: "Google Advent of Agents：ADK Agent プロジェクトの骨格"
date: 2026-05-06
category: academy
description: "最小 ADK Agent から出発し、root_agent、model、tools、state、runtime、checks、デプロイ経路を分解して、Agent 工学プロジェクトの最初の地図を作ります。"
plainSummary: "この図解ノートは Advent of Agents の Hello World、Gemini + ADK、Agent Starter Pack まわりのテーマを、日別要約ではなく ADK プロジェクト解剖として再構成します。"
difficulty: intermediate
coverImage: "/images/academy/google-advent-of-agents/covers/01-adk-agent-project-anatomy.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: ja
academy:
  series: "Google Advent of Agents"
  module: "01 ADK と Agent プロジェクト骨格"
  moduleOrder: 121
  source: "Google Cloud Advent of Agents"
  sourceUrl: "https://adventofagents.com/2025/12/02"
  prerequisites:
    - "事前学習の推奨：Google Advent of Agents：エージェント工学の実践マップ"
draft: false
---

![ADK Agent プロジェクト骨格カバー](/images/academy/google-advent-of-agents/covers/01-adk-agent-project-anatomy.svg)

**注記：** 本ページは Google Advent of Agents の Hello World、Gemini + ADK、Agent Starter Pack に関する公開資料と、ADK 公式ドキュメントの入口をもとに整理したものです。公式 Quickstart の代替ではありません。本サイトでは、最初の Agent を動かしたあとに、その中のどこが本番化の境界になるのかを理解することを重視します。

## このページが扱う問題

多くの Agent チュートリアルは、まず「質問に答える Demo」を作らせます。それ自体は良い出発点ですが、Agent を単なる prompt とモデルの組み合わせだと誤解しやすくなります。

ADK の重要性は、Agent を実行可能なプロジェクトとして扱う点にあります。

- `root_agent` が入口として定義される。
- モデル選択と instruction の境界がある。
- tools があり、それぞれ読み取り・書き込み範囲を持つ。
- session、artifact、memory などの状態面がある。
- ローカル runtime があり、対話や実行を観察できる。
- Agent Engine や Cloud Run につながるデプロイ経路がある。
- 評価、ログ、人間のレビューによって信頼性を確認する。

最初の日にコマンドだけ覚えても、これらの境界が見えていなければ、後で MCP、A2A、観測、安全を足すときに混乱します。

## プロジェクト骨格図

![ADK Agent プロジェクト解剖図](/images/academy/google-advent-of-agents/diagrams/adk-agent-project-anatomy.svg)

最小 Agent を分解すると、おおよそ六つのブロックになります。

| ブロック | 役割 | 初学者が見落としやすいリスク |
| --- | --- | --- |
| `root_agent` | モデル、instruction、tools、行動境界をまとめる入口。 | すべてのルールを巨大な文章に詰め込み、後からテストや分層ができなくなる。 |
| `model` | 推論能力、コスト、速度、コンテキスト、tool calling の振る舞いを決める。 | 動いたモデルが、そのまま本番に適するとは限らない。 |
| `tools` | Agent が外部システムを読み取る、または操作するための能力。 | 権限が広すぎる、失敗時の返し方が不明確。 |
| `state` | session、artifact、memory など実行中に蓄積される文脈資産。 | 長い会話履歴を、信頼できる記憶と勘違いする。 |
| `runtime` | ローカル実行、デバッグ、API サーバー、UI playground。 | 最終回答だけ見て、イベントや tool call を見ない。 |
| `checks` | eval、ログ、人間のレビュー、回帰ケース。 | Demo が一度成功しただけで安定していると思い込む。 |

このページの中心となる考え方は、**最小 Agent もすでにシステムである**ということです。

## Hello World から工学プロジェクトへ

Advent of Agents の初期テーマは、最小設定または最小コードから始まります。この順序は正しいですが、学習の焦点は「動いた」で止めるべきではありません。

最初のプロジェクトは三つの層で見ると理解しやすくなります。

| 層 | 学習の焦点 | 成果物 |
| --- | --- | --- |
| 設定層 | Agent、モデル、依存関係をどう宣言しているか。 | 入口ファイルと依存ファイルを指摘できる。 |
| 行動層 | Agent は何をすべきで、何をしてはいけないか。 | レビュー可能な instruction。 |
| 実行層 | どう起動し、観察し、再現し、止めるか。 | ローカル実行コマンドとログ観察の手順。 |

最小プロジェクトでも、次の五つには答えられるべきです。

1. 入口 Agent はどこか。
2. どのモデルを使っているか。
3. どの tools を呼び出せるか。
4. 状態はどこに置かれるか。
5. 失敗したとき、開発者は何を見るのか。

これに答えられないなら、プロジェクトは「コードが動く」だけであり、「工学的に制御できる」状態ではありません。

## 最小コード骨格

次の例は、ADK プロジェクトの形を理解するための学習用骨格です。実際の API やインストール手順は、常に [ADK 公式 Quickstart](https://google.github.io/adk-docs/get-started/) を確認してください。

```python
from google.adk.agents import Agent


def lookup_public_note(topic: str) -> dict:
    """Return a small, read-only note for a known learning topic."""
    notes = {
        "adk": "ADK organizes agents, tools, runtime, and evaluation surfaces.",
        "mcp": "MCP standardizes how agents connect to external tools.",
        "a2a": "A2A focuses on agent-to-agent interoperability.",
    }
    return {
        "topic": topic,
        "note": notes.get(topic.lower(), "No local note found."),
        "source": "local_read_only_demo",
    }


root_agent = Agent(
    name="academy_guide",
    model="gemini-3.1-pro",
    description="Guide readers through agent engineering concepts.",
    instruction=(
        "Answer as a careful learning guide. Use the lookup_public_note tool "
        "only for the supported public topics. If the topic is unsupported, "
        "say what is missing instead of inventing a source."
    ),
    tools=[lookup_public_note],
)
```

小さな例ですが、重要な設計が含まれています。

- tool は**読み取り専用**で、構造化された辞書を返す。
- instruction は「見つからない場合は不足を認める」と明示している。
- `root_agent` の中で name、model、description、instruction、tools をレビューできる。

これは「万能アシスタントとして何でも答えてください」よりもずっと安定しています。

## ディレクトリをどう読むか

言語、テンプレート、Agent Starter Pack によってディレクトリ構成は変わります。初学者が覚えるべきなのはファイル名そのものではなく、それぞれの役割です。

```text
my-agent/
  agent.py or agent.yaml      # root_agent または Agent 設定の入口
  tools/                      # tool 関数、MCP 接続、外部 API アダプタ
  prompts/ or skills/         # 再利用可能な指示、skill、タスク知識
  evals/                      # 回帰タスク、軌跡テスト、評価ルール
  tests/                      # 通常の単体テストと tool テスト
  pyproject.toml/package.json # 依存関係、スクリプト、実行入口
  README.md                   # 人間向けの境界説明
```

大切なのは、ファイルを追加するたびに「これはどの層に属するのか」と問う習慣です。

| 変更 | 問うべきこと |
| --- | --- |
| tool を追加する | 読み取り専用か、書き込み可能か。失敗時の返却形式は何か。 |
| instruction を変える | 永続ルールか、タスクルールか、一時コンテキストか。 |
| memory を加える | 何を長期保存するのか。ユーザーは撤回できるのか。 |
| deployment を加える | 実行権限、ログ権限、コスト責任は誰にあるのか。 |
| eval を加える | 回答品質、tool trajectory、安全境界のどれを検証しているのか。 |

テンプレートは変わりますが、この境界の問いは変わりません。

## Agent Starter Pack の役割

Agent Starter Pack は、工学的な足場を先に用意するためのものです。価値は数行のコマンドを省くことではなく、早い段階で本番化の論点に触れられる点にあります。

- プロジェクトをどう作り、どう拡張するか。
- 依存関係をどう宣言するか。
- ローカル実行とデプロイスクリプトをどう整理するか。
- 観測、テスト、CI/CD、Terraform などをどう段階的に入れるか。

学習時は、Starter Pack を二つの視点で見るとよいです。

| 視点 | 見るもの | 誤解してはいけないこと |
| --- | --- | --- |
| 初学者 | どうやって素早く動くプロジェクトを得るか。 | テンプレートをブラックボックスの魔法だと思わない。 |
| エンジニア | どの本番化判断が先に固定されているか。 | 生成されたからレビュー不要だと思わない。 |

`uvx agent-starter-pack create ...` のようなコマンドを見たら、覚えるべきはコマンドそのものより、生成されるディレクトリ、スクリプト、設定、デフォルト権限です。

## ローカル実行時に観察するもの

`adk web` や playground を起動すると、つい最終回答だけ見てしまいます。しかし Agent 工学では、次の信号を観察すべきです。

| 信号 | 重要な理由 |
| --- | --- |
| モデルが本当に tool を呼んだか | instruction と tool description が明確か判断できる。 |
| tool 入力が期待通りか | パラメータ解釈、境界条件、注入リスクを見つけられる。 |
| tool 失敗時にどう返すか | Agent が結果を捏造しないか確認できる。 |
| 同じ質問を繰り返したとき安定するか | eval や制約強化が必要か判断できる。 |
| ログから重要な手順を復元できるか | 後続の観測、障害対応の土台になる。 |

最初の Agent の目標は「驚くほど賢い」ではなく、「説明できる」です。なぜその回答になったのかを追える必要があります。

## 最小プロジェクトからデプロイ経路へ

Advent of Agents は早い段階で Source-Based Deployment、Agent Engine、Cloud Run などに進みます。ただし、デプロイを急ぐ前に次の表を埋めるべきです。

| 問い | 最小回答 |
| --- | --- |
| この Agent のユーザーは誰か | 内部学習者、開発者、顧客サポート、自動化タスクなど。 |
| 何を読めるのか | 公開資料、Google Workspace、DB、外部 API など。 |
| 何を書けるのか | 書き込みなし、草稿、チケット、メール、本番システムなど。 |
| 失敗時の影響は何か | 誤回答、コスト増、データ漏えい、誤操作など。 |
| 誰がログを見られるのか | 開発者、管理者、監査担当など。 |
| どうロールバックするのか | tool 停止、バージョン戻し、デプロイ停止、人間への引き継ぎなど。 |

これらの答えがないまま Agent Engine に出すと、曖昧な境界をクラウドに持ち上げるだけになります。

## OpenAI / Anthropic ルートとの比較

| テーマ | OpenAI / Codex 視点 | Anthropic / Claude 視点 | Google ADK 視点 |
| --- | --- | --- | --- |
| 最初のプロジェクト | タスク委任とコード検証から始める。 | 協働、MCP、Skills、Subagents の境界から理解する。 | Agent 定義、tools、runtime、デプロイ経路から始める。 |
| tool calling | 製品化された環境でのタスク完遂を重視する。 | プロトコル、コンテキスト、協働、能力記述を重視する。 | 実行可能なプロジェクト、tool 統合、状態、評価、runtime を重視する。 |
| 本番化 | Codex は開発タスクの完遂ループを重視する。 | Claude Code は開発者協働とワークフロー調整を重視する。 | ADK は Agent をサービスとしてクラウド運用・統治することを重視する。 |

三つのルートは競合しません。成熟した Agent プロジェクトには、明確なタスク定義、良い協働プロトコル、デプロイ可能な runtime、検証可能な品質が必要です。

## 最小実践タスク

このページを読んだら、60 分の練習として次を行います。

1. 公式 ADK Quickstart に沿って最小 Agent を作る。
2. 読み取り専用 tool を一つ追加し、構造化データを返す。
3. instruction に三つの厳格な境界を書く。
4. 三つの質問を投げる：対応テーマ、非対応テーマ、曖昧な意図。
5. tool が呼ばれたか、引数が正しいか、失敗時に正直かを記録する。
6. 結果を小さな表にまとめ、後続 eval の原型にする。

実践記録表：

| テスト質問 | 期待する tool call | 実際の tool call | 回答は正直か | 改善点 |
| --- | --- | --- | --- | --- |
| 対応テーマ | 呼ぶべき | 記入 | 記入 | 記入 |
| 非対応テーマ | 呼ばない、または不足を返す | 記入 | 記入 | 記入 |
| 曖昧なテーマ | 先に確認する、または範囲を説明する | 記入 | 記入 | 記入 |

## チェックリスト

- プロジェクト内の Agent 入口を指摘できる。
- `root_agent` の instruction、model、tools がそれぞれ何を担当するか説明できる。
- 最初の tool は、できるだけ読み取り専用、構造化、失敗説明可能にすべきだと理解している。
- 「ローカルで会話できる」と「デプロイしてよい」を混同しない。
- 一回の実行で、tool call、引数、失敗処理を観察できる。
- デプロイ前に必要な権限、ログ、ロールバックの問いを書ける。
- Starter Pack を工学的な足場として見て、レビュー不要なテンプレートとは見なさない。

## 参考资源

- [Advent of Agents](https://adventofagents.com/)
- [ADK Get started](https://google.github.io/adk-docs/get-started/)
- [ADK Python Quickstart](https://google.github.io/adk-docs/get-started/python/)
- [Agent Starter Pack](https://github.com/GoogleCloudPlatform/agent-starter-pack)
- [Agent Starter Pack Getting Started](https://googlecloudplatform.github.io/agent-starter-pack/guide/getting-started.html)
- [Vertex AI Agent Engine](https://docs.cloud.google.com/agent-builder/agent-engine/overview)
