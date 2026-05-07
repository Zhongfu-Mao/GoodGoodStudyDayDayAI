---
title: "Google Advent of Agents：エージェント工学の実践マップ"
date: 2026-05-06
category: academy
description: "Google Cloud Advent of Agents を、ADK 入門から MCP/A2A、デプロイ、観測、評価、安全までをつなぐ AI Academy の実践ルートとして再構成します。"
plainSummary: "本ページは Advent of Agents の日別翻訳ではなく、公式サイトと Gmail のシリーズメールをもとに、図解つきのエージェント工学マップとして整理したものです。"
difficulty: intermediate
coverImage: "/images/academy/google-advent-of-agents/covers/00-overview/google-advent-of-agents-overview.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: ja
academy:
  series: "Google Advent of Agents"
  module: "00 学習ルート全体"
  moduleOrder: 120
  source: "Google Cloud Advent of Agents"
  sourceUrl: "https://adventofagents.com/"
  prerequisites:
    - "事前学習の推奨：AI Basics for Everyone：Agent とは何か"
    - "事前学習の推奨：MCP とは何か"
draft: false
---

![Google Advent of Agents 学習ルートカバー](/images/academy/google-advent-of-agents/covers/00-overview/google-advent-of-agents-overview.svg)

**注記：** 本ページは Google Cloud の Advent of Agents 公式サイト、公式ドキュメントへのリンク、そして Gmail に届いた `[Advent of Agents]` シリーズメールをもとに整理したものです。公式翻訳でも、日別コンテンツの転載でもありません。本サイトでは、元資料をもとに独自の学習ノート、アーキテクチャ図、チェックリスト、復習用の問いとして再構成します。

## なぜ独立した Academy 大類にするのか

OpenAI Academy は、ChatGPT や Codex を中心とした製品活用、業務ワークフロー、タスク完遂に強みがあります。Anthropic Academy は、AI Fluency、Claude との協働、MCP、Agentic Workflow の考え方に強みがあります。

一方で Google Advent of Agents の価値は、エージェントを「会話機能」ではなく、運用されるべきソフトウェアシステムとして扱う点にあります。

このシリーズが扱う問いは、かなり実務的です。

- ローカルで書いた Agent を、どうやってスケールする実行環境に出すのか。
- コンテキスト、メモリ、スキル、ツール、状態をどう分けるのか。
- MCP、A2A、A2UI は、それぞれどの層の相互運用性を解決するのか。
- 本番投入前に、軌跡テスト、Rubric 評価、ログ追跡、安全フィルタをどう用意するのか。
- 1 回の会話ではなく、1 万件の処理、複数 Agent、複数サービスに広がったとき、境界をどう引くのか。

この位置づけは、本サイトの AI Academy に第三の柱を作ります。

| 学習元 | 強い焦点 | 本サイトでの整理 |
| --- | --- | --- |
| OpenAI Academy | ChatGPT、Codex、製品化されたタスク遂行 | ツール活用、ワークフロー、構築入門 |
| Anthropic Academy | Claude、MCP、協働フレーム、AI Fluency | 人間と AI の協働、プロトコルの考え方、Agentic な働き方 |
| Google Advent of Agents | ADK、Agent Engine、A2A、本番運用、観測と評価 | エージェント工学の図解、実践ルート、本番化チェックリスト |

## 全体スタック図

![Agent engineering stack](/images/academy/google-advent-of-agents/diagrams/agent-engineering-stack.svg)

この図は本サイトによる再構成です。公式サイトは Day 1、Day 2、Day 3 というカレンダー形式ですが、学習コンテンツとしては次の五層に分けたほうが理解しやすくなります。

1. **Build core**：ADK、Gemini、ツール、Session、Artifact、コード実行。Agent をどう実装するか。
2. **Shape context**：Skills、長期記憶、Context caching / compaction、Rewind。Agent をどう見失わせないか。
3. **Connect systems**：MCP、Managed tools、API Registry、A2A、A2UI。外部システムや他の Agent とどう接続するか。
4. **Operate reliably**：Agent Engine、Cloud Run、Batch、Durable execution、Identity propagation。長く動くシステムとしてどう運用するか。
5. **Govern quality**：Observability、Evalsets、Rubric scoring、Guardrails、Model Armor。品質、安全性、説明可能性をどう保つか。

## 二つのシーズンをどう読むか

Advent of Agents は、大きく二つのまとまりとして読めます。

| シーズン | 公式での形 | 本サイトでの扱い |
| --- | --- | --- |
| Season 2：2026 年 3 月 | 31 日間。Skills、Memory、Multi-Agent、Workspace / Gemini Enterprise、プロトコル、安全、デプロイ、観測を深掘り。 | 公開学習ルートの主線として扱う。Day 1 は入口、Day 2-31 は 30 本のオリジナル工学講義にする。 |
| Season 1：2025 年 12 月 | 25 日間。最初の ADK Agent から Agent Engine、MCP、A2A、観測、安全、Agent Designer まで。 | 補助線として扱う。各 Season 2 記事の前提知識、背景比較、本番化の補足に使う。 |

つまり、このサイトでは二季をすべて日別翻訳するわけではありません。また Season 2 を数本の総論に圧縮するだけにも戻しません。**Season 2 の 30 日間の前進感を残しながら、各日をオリジナルの工学講義として書き直します。**

## Season 2 の主線

Day 1 は入口、Day 2-31 は主線記事です。各日で、ディレクトリ、schema、図、tool contract、eval、trace、デプロイメモ、安全境界のような具体的成果物を残すことを目指します。

31 日間の主線はすべて追加済みです。

| Day | 記事 | 読後の成果物 |
| ---: | --- | --- |
| 1 | [学習マップと工学の主線](/ja/academy/google-advent-of-agents/season-2/day-01-season-2-learning-map/season-2-learning-map/) | 学習ロードマップ。 |
| 2 | [ADK で保守できる Agent を作る](/ja/academy/google-advent-of-agents/season-2/day-02-adk-agents-gemini-pro/adk-agents-gemini-pro/) | 最小 ADK Agent ディレクトリ。 |
| 3 | [Flash-Lite、コスト、タスク分層](/ja/academy/google-advent-of-agents/season-2/day-03-flash-lite-cost-task-layering/flash-lite-cost-task-layering/) | モデルルーティング表。 |
| 4 | [MCP Server をツール境界にする](/ja/academy/google-advent-of-agents/season-2/day-04-mcp-server-tool-boundary/mcp-server-tool-boundary/) | 最小 MCP tool spec。 |
| 5 | [長期記憶と取り消せる事実](/ja/academy/google-advent-of-agents/season-2/day-05-long-term-recall-memory-plugins/long-term-recall-memory-plugins/) | memory policy。 |
| 6 | [ADK Skills と必要時ロード](/ja/academy/google-advent-of-agents/season-2/day-06-adk-skills-progressive-disclosure/adk-skills-progressive-disclosure/) | Skill 一覧。 |
| 7 | [Skill 設計パターン](/ja/academy/google-advent-of-agents/season-2/day-07-skill-design-patterns/skill-design-patterns/) | SKILL.md テンプレート。 |
| 8 | [Sequential Agents](/ja/academy/google-advent-of-agents/season-2/day-08-sequential-agents/sequential-agents/) | 五段 pipeline。 |
| 9 | [Coordinator / Dispatcher](/ja/academy/google-advent-of-agents/season-2/day-09-coordinator-dispatcher-agents/coordinator-dispatcher-agents/) | ルーティング表。 |
| 10 | [Parallel Fanout と状態統合](/ja/academy/google-advent-of-agents/season-2/day-10-parallel-fanout-state-interpolation/parallel-fanout-state-interpolation/) | fanout schema。 |
| 11 | [Hierarchical Decomposition](/ja/academy/google-advent-of-agents/season-2/day-11-hierarchical-decomposition/hierarchical-decomposition/) | タスクツリー。 |
| 12 | [Generator-Critic ループ](/ja/academy/google-advent-of-agents/season-2/day-12-generator-critic-loop/generator-critic-loop/) | critic rubric。 |
| 13 | [Iterative Refinement](/ja/academy/google-advent-of-agents/season-2/day-13-iterative-refinement/iterative-refinement/) | refinement loop。 |
| 14 | [Human in the Loop](/ja/academy/google-advent-of-agents/season-2/day-14-human-in-the-loop/human-in-the-loop/) | approval payload。 |
| 15 | [Agentic RAG と Grounding](/ja/academy/google-advent-of-agents/season-2/day-15-agentic-rag-vector-search/agentic-rag-vector-search/) | RAG contract。 |
| 16 | [Multiagent Triage 開発スキル](/ja/academy/google-advent-of-agents/season-2/day-16-adk-dev-skills-multiagent-triage/adk-dev-skills-multiagent-triage/) | triage board。 |
| 17 | [Workspace とノーコード Agent](/ja/academy/google-advent-of-agents/season-2/day-17-workspace-gemini-enterprise-no-code/workspace-gemini-enterprise-no-code/) | no-code checklist。 |
| 18 | [企業ワークベンチ内の ADK Agent](/ja/academy/google-advent-of-agents/season-2/day-18-workspace-gemini-enterprise-adk-agents/workspace-gemini-enterprise-adk-agents/) | enterprise integration map。 |
| 19 | [Live Shopping Agent ケース](/ja/academy/google-advent-of-agents/season-2/day-19-live-shopping-agent/live-shopping-agent/) | commerce risk map。 |
| 20 | [ADK Agent Harness](/ja/academy/google-advent-of-agents/season-2/day-20-adk-agent-harness/adk-agent-harness/) | harness runbook。 |
| 21 | [Agent Protocols 全景](/ja/academy/google-advent-of-agents/season-2/day-21-agent-protocols-guide/agent-protocols-guide/) | protocol boundary matrix。 |
| 22 | [ADK Evaluation](/ja/academy/google-advent-of-agents/season-2/day-22-adk-evaluation/adk-evaluation/) | evalset。 |
| 23 | [Model Armor と安全ファイアウォール](/ja/academy/google-advent-of-agents/season-2/day-23-model-armor/model-armor/) | safety gate map。 |
| 24 | [Batch Processing と Agent Orchestrator](/ja/academy/google-advent-of-agents/season-2/day-24-batch-processing-agent-orchestrator/batch-processing-agent-orchestrator/) | batch job schema。 |
| 25 | [Agent Deployment](/ja/academy/google-advent-of-agents/season-2/day-25-agent-deployment-agent-engine-cloud-run/agent-deployment-agent-engine-cloud-run/) | deployment checklist。 |
| 26 | [Authentication と ID 伝播](/ja/academy/google-advent-of-agents/season-2/day-26-authentication-identity-propagation/authentication-identity-propagation/) | identity flow。 |
| 27 | [Scion と隔離型オーケストレーション](/ja/academy/google-advent-of-agents/season-2/day-27-scion-isolated-agent-orchestration/scion-isolated-agent-orchestration/) | isolation map。 |
| 28 | [A2A Protocol](/ja/academy/google-advent-of-agents/season-2/day-28-a2a-protocol-reasoning-execution/a2a-protocol-reasoning-execution/) | A2A task contract。 |
| 29 | [ApiRegistry と動的ツール治理](/ja/academy/google-advent-of-agents/season-2/day-29-api-registry-dynamic-tools/api-registry-dynamic-tools/) | registry-backed tool flow。 |
| 30 | [Observability と階層 tracing](/ja/academy/google-advent-of-agents/season-2/day-30-observability-hierarchical-tracing/observability-hierarchical-tracing/) | trace schema。 |
| 31 | [A2UI、A2A、対話型 Agent](/ja/academy/google-advent-of-agents/season-2/day-31-a2ui-a2a-interactive-microapps/a2ui-a2a-interactive-microapps/) | interactive payload spec。 |


## 横断記事の使い方

先に作った横断記事は、主線を読んだ後の復習に回します。

| 本サイトのモジュール | 対応する Advent テーマ | 読後に作れるもの |
| --- | --- | --- |
| 01 ADK と Agent プロジェクト骨格 | Hello World with YAML、Gemini + ADK、Agent Starter Pack、ADK 多言語テンプレート | 最小 ADK Agent と、プロジェクト構造の理解。 |
| 02 コンテキスト、メモリ、Skills | ADK Layers、Big Context、Memory Plugins、ADK Skills、Skill Design Patterns | Context / Memory / Skill の分層設計図。 |
| 03 ツールとプロトコル相互運用 | MCP Servers、Google Managed MCP、A2A、A2UI、API Registry、Agent Protocols | MCP / A2A / A2UI の境界比較表。 |
| 04 Multi-Agent オーケストレーション | Sequential、Coordinator、Parallel Fanout、Hierarchical、Generator-Critic、Human in the Loop | Multi-Agent パターン選択の判断表。 |
| 05 デプロイ、観測、安全の制御面 | Source-based deployment、Agent Engine、Cloud Run、Batch、Durable execution、Authentication、Production Observability、ADK Evaluation、Model Armor | ローカル Agent から本番実行環境への経路図と、CI で使える評価・安全・追跡チェックリスト。 |

## Gmail のメールをどう使うか

Gmail に届いた `[Advent of Agents]` メールは、本文を転載するための材料ではありません。編集上のシグナルとして使います。

- 各日で公式チームが強調したい三つのポイントを確認できる。
- 公式サイトのカードだけでは見えにくい「その日の狙い」を補える。
- どのテーマを長文記事にし、どのテーマを総覧で扱うか判断しやすくなる。

現時点で確認できたメールは Season 2 の Day 1、Day 22-31 で、評価、安全、バッチ処理、デプロイ、認証、A2A、ApiRegistry、観測、A2UI といった本番化テーマに集中しています。これは後半の実務記事を厚くする上で特に有用です。

## 推奨する読み方

初めてエージェント工学を学ぶなら、公式サイトを Day 1 から Day 56 まで順番にクリックするより、次の順序が実用的です。

1. まず本サイトの Agent 入門と MCP 入門で、概念の境界をつかむ。
2. 次に本シリーズの総覧で、Google ルートがなぜ本番運用寄りなのか理解する。
3. 最小 ADK Agent を一つ動かす。
4. 読み取り専用のツールを一つ追加し、ツール呼び出し、失敗、ログを観察する。
5. Context / Memory / Skill を分け、巨大な Prompt に詰め込まない設計にする。
6. ローカル Agent を実行環境に出し、最低限の観測面を作る。
7. 最後に Evals、Model Armor、認証、Batch、Multi-Agent パターンを補う。

重要なのは、用語をたくさん覚えることではありません。各ステップで、設計図、設定、ログ、評価セット、デプロイメモ、安全境界のような具体的な成果物を残すことです。

## 既存コンテンツとの接続

このシリーズは、既存のページとつながるように設計します。

- [Agent とは何か](/ja/start/ai-basics-for-everyone/what-is-agent/)：概念から実装へ進む入口。
- [MCP とは何か](/ja/start/ai-basics-for-everyone/what-is-mcp/)：ツール連携がなぜ Agent システムの一部なのか理解する。
- [Minimal MCP Server](/ja/engineering/ai-developer-core/minimal-mcp-server/)：プロトコル理解を最小実装に落とす。
- [Agent Harness：ログ、承認、リプレイ](/ja/engineering/ai-developer-core/agent-harness-logging-approval-replay/)：Google の観測・評価・承認テーマを、汎用的な工学パターンに接続する。
- OpenAI Academy の [Building Agents](/ja/academy/openai-academy/07-building-with-ai/agents/)：異なるプラットフォームでの Agent 定義を比較する。
- Anthropic Academy の [Introduction to Subagents](/ja/academy/anthropic-academy/05-agentic-mcp/introduction-to-subagents/)：Subagent と Agent-to-Agent プロトコルの階層差を確認する。

## 本サイトでの標準フォーマット

今後の Google Advent of Agents 記事は、できるだけ同じ型で書きます。

1. **現実の問題**：このテーマはどの実務上の痛みを解くのか。
2. **概念図**：独自の図でコンポーネント関係を示す。
3. **最小実行イメージ**：必要なコマンドや構成だけを残す。
4. **本番化リスク**：デプロイ、権限、観測、コスト、データ安全性を確認する。
5. **横断比較**：OpenAI / Anthropic / 一般的な工学パターンとの関係を説明する。
6. **チェックリスト**：自分の Agent を点検できる形で締める。

## 最初の実践目標

総覧を読んだら、まずは小さな練習から始めます。

> ADK で、読み取り専用ツールを一つ持つ Agent を動かす。質問を受け取り、制限されたツールを呼び出し、構造化された回答を返し、各ツール呼び出しをログに残す。デプロイは後回しでよいが、境界、ログ、失敗時の説明は明確にする。

これは「万能 Agent を作る」よりも安定した練習です。モデルが何を担当し、ツールが何を担当し、システムが成功と失敗をどう判断するのかを明確にできます。

## チェックリスト

- ADK、Agent Engine、Agent Starter Pack がそれぞれどの層にあるか説明できる。
- MCP は tool integration の仕組みであり、Multi-Agent 協働そのものではないと理解している。
- A2A は agent-to-agent protocol であり、すべての内部関数呼び出しの代替ではないと理解している。
- A2UI は Agent が対話的 UI を返すための層だと説明できる。
- 「長いコンテキスト」と「良い記憶」を混同しない。
- 本番投入前に、ログ、評価、権限、安全フィルタを設計する。
- 公式の日別テーマを、自分の工学学習ルートに再構成できる。

## 参考来源

- [Advent of Agents](https://adventofagents.com/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
- [Agent Starter Pack](https://github.com/GoogleCloudPlatform/agent-starter-pack)
- [Vertex AI Agent Engine](https://docs.cloud.google.com/agent-builder/agent-engine/overview)
- [Agent Designer](https://docs.cloud.google.com/agent-builder/agent-designer)
- [Kaggle Introduction to Agents Whitepaper](https://www.kaggle.com/whitepaper-introduction-to-agents)
