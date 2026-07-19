---
title: "AIレーダー日報：2026-07-19"
date: 2026-07-19
category: radar
cadence: daily
plainSummary: "本日の主線：agent engineering はモデル能力から、runtime、search、memory、observability、infrastructure governance へ広がっている。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agents
  - Models
  - GitHub
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-07-19.ja-infographic.webp
audioUrl: /audio/radar/daily-ai-radar-2026-07-19.ja.mp3
audioDuration: 1068
audioSize: 8543693
draft: false
---

対象期間：2026-07-18 から 2026-07-19（JST）。本日の主線は、agent engineering がモデル能力そのものから、runtime protocol、sandbox infrastructure、本番観測、追跡可能な memory、search entry point、data center governance といった実システムの境界へ移っていることです。

## 1. AI Engineering & アーキテクチャ

### ByteByteGo：MCP、A2A、ACP は agent 通信の境界を分け始めている

- 出典：ByteByteGo
- 日付：2026-07-18
- リンク：https://blog.bytebytego.com/p/mcp-vs-a2a-vs-acp-how-ai-agents
- 要約：ByteByteGo は MCP、A2A、ACP の役割を整理しました。MCP は主に agent から tool や data source への接続を扱い、A2A は agent 同士の discovery、task negotiation、structured result exchange を扱います。ACP は REST-first な agent communication の提案で、現在は A2A に統合されています。これは単なる API 名の違いではなく、tool integration、cross-agent collaboration、enterprise system integration を別々に設計する必要があるという実装上の区分です。

### Latent.Space AINews：agent sandbox は単なる Kubernetes container ではない

- 出典：Latent.Space / AINews
- 日付：2026-07-18
- リンク：https://www.latent.space/p/ainews-not-much-happened-today-830
- 要約：AINews は ChatGPT Work を支える cloud infrastructure に関する議論を取り上げました。重要なのは、agent sandbox を単なる container scheduling として捉えないことです。長時間タスクには復元可能な state、file system、execution log、permission boundary、network isolation、cost control が必要です。agent cloud の競争点は、モデル呼び出しの入口ではなく、継続実行できる runtime platform へ移っています。

## 2. モデル最前線 & アルゴリズム探索

### Ahead of AI：reasoning effort は UI 設定から訓練・推論の制御量へ移っている

- 出典：Ahead of AI
- 日付：2026-07-18
- リンク：https://magazine.sebastianraschka.com/p/controlling-reasoning-effort-in-llms
- 要約：Sebastian Raschka は reasoning effort の制御方法を整理しました。推論時に計算量を増やす方法、RLVR や preference data で努力水準を学習させる方法、system prompt や continuous control value で low、medium、high の推論強度を切り替える方法があります。重要なのは、effort が単なる「深く考える」UI ではなく、cost、latency、reliability、answer style に影響する model control surface になっていることです。

### The Rundown AI：Mercury 2 は diffusion reasoning をリアルタイム音声 agent へ持ち込む

- 出典：The Rundown AI
- 日付：2026-07-15
- リンク：https://www.rundown.ai/tools/mercury-2
- 要約：The Rundown の tool 欄は、Inception の Mercury 2 をリアルタイム音声 agent 向け diffusion reasoning model として紹介しました。この方向の技術的意味は、低遅延 voice agent が高速な token decoding だけで成立するわけではないという点です。異なる生成機構で reasoning と音声 interaction を扱えるなら、response speed、barge-in、continuous conversation の間で新しい trade-off を作れる可能性があります。

## 3. 実践コード & ツールライブラリ

### Graphiti：agent memory を時間軸付き knowledge graph として構築する

- 出典：GitHub / Daily Dose of Data Science
- 日付：2026-07-19
- リンク：https://github.com/getzep/graphiti
- 要約：Graphiti は agent memory 向けの temporal knowledge graph を構築し、fact、relationship、temporal validity、source evidence を記録します。incremental update、hybrid retrieval、MCP integration も備えています。RAG は関連 fragment を取り出せますが、事実がいつ成立し、後続情報で上書きされたか、複数 entity の関係がどう変化したかを扱いにくい場合があります。memory を vector fragment から追跡可能な graph へ上げることは、長期稼働 agent の重要な方向です。

### wigolo：local-first な agent web intelligence layer

- 出典：GitHub
- 日付：2026-07-19
- リンク：https://github.com/KnockOutEZ/wigolo
- 要約：wigolo は search、fetch、crawl、extract、cache、research、diff、watch を MCP、REST、SDK interface としてまとめ、local cache と local file system を優先して動作します。価値は単なる検索 tool ではなく、agent が頻繁に必要とする web reading、evidence extraction、similar page lookup、change monitoring を統一 runtime layer にする点です。再現可能な research chain を必要とするチームにとって、local cache と source position record は単発の検索結果より重要です。

## 4. 業界 & ビジネス速報

### 老范讲故事：IBM の業績警告と中国信創の本当のリスク

- 出典：老范讲故事
- 日付：2026-07-19
- リンク：https://lukefan.com/2026/07/19/ibm-crash-and-the-future-of-chinese-it-innovation/
- 要約：老范讲故事は IBM の第 2 四半期警告を手がかりに、中国の信創の長期リスクを論じています。IBM への圧力は、特定の国産代替に直接敗れたというより、AI 予算が従来型 server、storage、mainframe migration service を圧迫していることに近いという見立てです。より重要なのは、信創が旧 architecture を置き換えるだけなら短期的な代替はできても、AI-native な system form に迂回される可能性があるという指摘です。

### AI Valley：Cursor は coding agent を office coworker へ広げようとしている可能性がある

- 出典：AI Valley / PYMNTS
- 日付：2026-07-15
- リンク：https://www.pymnts.com/news/artificial-intelligence/2026/cursor-prepares-workplace-ai-agent-to-challenge-claude-cowork-and-chatgpt-work/
- 要約：AI Valley は、Cursor が Sand という general-purpose office agent を開発している可能性を紹介しました。対象は email、spreadsheet、messaging、engineering task です。詳細は今後の確認が必要ですが、coding agent 企業が broader workplace runtime へ拡張しようとしている signal として重要です。コードエディタで培われた context management、file modification、command execution、review workflow は、office document、communication、project flow に移植されつつあります。

## 5. GitHub 人気 repo & トレンド追跡

### LingBot-Map：長動画向け streaming 3D reconstruction foundation model

- 出典：GitHub
- 日付：2026-07-19
- リンク：https://github.com/Robbyant/lingbot-map
- 要約：LingBot-Map は、長動画からリアルタイム 3D reconstruction を行う feed-forward 3D foundation model です。Geometric Context Transformer、pose-reference window、trajectory memory、paged KV cache attention を導入し、長い sequence で空間的一貫性を保ちます。約 20 FPS の streaming 処理も重視しています。視覚モデルのトレンドが、単一 frame の理解から継続的な spatial memory と online world modeling へ移っていることを示しています。

### ai-engineering-from-scratch：AI engineering を実行可能な学習経路に分解する

- 出典：GitHub
- 日付：2026-07-19
- リンク：https://github.com/rohitg00/ai-engineering-from-scratch
- 要約：ai-engineering-from-scratch は、数学、machine learning、LLM、RAG、agents、本番 deployment までを 20 phase、数百 lesson の学習経路に分解し、各 phase で実際の artifact を作る構成です。GitHub で広がっている背景には、developer が model API だけでなく、prompts、skills、agents、MCP、evaluation、deployment を再利用可能な能力としてつなげたいという需要があります。

## 📬 Newsletter 精選

### The Rundown AI：OpenAI 初の hardware は画面なし AI speaker になる可能性がある

- 出典：The Rundown AI / Bloomberg
- 日付：2026-07-15
- リンク：https://www.bloomberg.com/news/articles/2026-07-14/openai-s-first-device-will-be-moveable-screenless-speaker-built-as-ai-companion
- 要約：The Rundown は Bloomberg の報道を引用し、OpenAI と Jony Ive 関連チームの初の device が、画面なし、持ち運び可能、battery powered な AI speaker になる可能性を伝えました。camera、sensor、GPT-powered voice interaction を備えるとされています。この形態は、競争の入口を phone や browser から、家庭や個人空間に常駐する voice interface へ移します。voice model、memory、personalization、smart-home control、device design が同じ product line で語られる理由もここにあります。

### AI Valley：Roblox Build が mobile natural-language creation をゲーム公開経路に接続する

- 出典：AI Valley / Roblox
- 日付：2026-07-17
- リンク：https://about.roblox.com/newsroom/2026/07/build-without-limits-on-roblox
- 要約：AI Valley は Roblox Build に注目しました。Roblox は mobile と Studio に AI creation entry point を追加し、user が text prompt から basic game を生成し、その後 gameplay、scene、character、sound、visual を編集できるようにする計画です。Roblox は playtesting、analytics、experiment agents も今後追加するとしています。焦点は小さなゲームを生成することではなく、creation、testing、analysis、publishing を一般 creator 向けの agent workflow としてつなぐことです。
