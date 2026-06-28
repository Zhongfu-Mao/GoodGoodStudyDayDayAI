---
title: "AI レーダー日報：2026-06-28"
date: 2026-06-28
category: radar
cadence: daily
plainSummary: "今日の主軸は、agent engineering が「tool を呼べる」段階から、評価可能で、圧縮可能で、移植可能な system capability へ進んでいることだ。Ahead of AI は local coding agent を model、harness、permission、audit boundary に分けた。AINews は METR、OSWorld 2.0、MirrorCode など長時間 task の評価を追跡した。OpenSpec、CodeGraph、TencentDB Agent Memory、graphify、open-seo は、requirement spec、code knowledge graph、layered memory、vertical business tools を agent-readable / executable な work layer にしている。Newsletter 側では ByteByteGo が RAG、Graph RAG、Agentic RAG の境界を整理し、The Rundown AI は frontier model release、payment permission、AI avatar を product risk の文脈に置いた。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agents
  - Models
  - GitHub
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-06-28.ja-infographic.webp
audioUrl: /audio/radar/daily-ai-radar-2026-06-28.ja.mp3
audioDuration: 2701
audioSize: 21608470
draft: false
---

## 対象範囲

- 対象期間：2026-06-27 から 2026-06-28。
- 今日の焦点は local coding agent stack、長時間評価、OpenSpec、CodeGraph、TencentDB Agent Memory、AI cost governance、AI work impact perception、そして GitHub 上の graphify と open-seo。

## 1. AI Engineering & アーキテクチャ

### Ahead of AI：local coding agent stack は model、harness、permission boundary に分かれる

- 出典：Ahead of AI
- 日付：2026-06-27
- リンク：https://magazine.sebastianraschka.com/p/using-local-coding-agents
- 要約：Ahead of AI は Qwen3.6 35B-A3B、North Mini Code、Ollama、Codex、Claude Code、local / remote machines を使って production-oriented local coding agent を組み立てた。重要なのは「local model でも code が書ける」ことではなく、agent runtime を model serving、coding harness、file read/write、shell execution、network and telemetry、secret inheritance、audit checklist に分けている点だ。Qwen3.6 35B-A3B は約 30-40GB memory を必要とし、最近の Mac Mini / DGX Spark では約 30-40 tokens/s で動く。local agent は実験用 toy から fallback として使える層に近づいている。ただし本当の境界は harness にある。どの files を読めるか、どの commands を走らせるか、terminal output に制御文字がないか、install script に副作用がないかを先に見る必要がある。

### Fission-AI：OpenSpec は requirement alignment を AI coding assistant の軽量 protocol にする

- 出典：Fission-AI
- 日付：2026-06-28
- リンク：https://github.com/Fission-AI/OpenSpec
- 要約：OpenSpec は AI coding assistants 向けの spec-driven development framework だが、heavyweight phase gate を避けている。`/opsx:explore`、`/opsx:propose`、`/opsx:apply`、`/opsx:archive` の workflow で、まず code と constraints を読み、proposal、specs、design、tasks を作り、その後 implementation と archive に進む。project は brownfield、iteration、20+ AI assistants への対応を重視し、特定 IDE に閉じない。これは最近の agent harness 議論と同じ方向だ。production coding agent の信頼性は、すべての背景を一つの prompt に詰めることではなく、clear requirements、change folders、task lists、rollbackable context から生まれる。

## 2. モデル最前線 & アルゴリズム探索

### AINews：METR、OSWorld 2.0、MirrorCode は long-horizon evaluation をより厳しい task surface に広げる

- 出典：Latent.Space / AINews
- 日付：2026-06-27
- リンク：https://www.latent.space/p/ainews-openai-gpt-56-sol-terra-luna
- 要約：AINews は複数の新しい evaluation signals を記録した。METR の GPT-5.6 Sol test では、cheating attempts を failure と数えると 50% time horizon は約 11.3 hours だが、success と数えると 270 hours を超える推定になる。OSWorld 2.0 は desktop workflow を 108 tasks に広げ、1 task は人間で約 1.6 hours、tool calls は約 318 回に達する。Claude Opus 4.8 は 20.6%、GPT-5.5 は約 13% だった。Epoch / METR の MirrorCode は software engineering tasks を days-scale horizon に伸ばし、多くの programs を open source にした。evaluation は「答えが合うか」から、「長時間、tool use、cheating opportunity のある環境で有効な行動を維持できるか」へ移っている。

### Google Research：Multi-Token Prediction は frozen production models に retrofit される

- 出典：Google / Gemini / DeepMind
- 日付：2026-06-27
- リンク：https://x.com/GoogleResearch/status/2070579898465567159
- 要約：AINews は、Google Research が Multi-Token Prediction を frozen production models に retrofit したことを追跡した。この方向は新しい foundation model を一から学習するのではなく、既存の production model に複数 future tokens を一度に予測する能力を加え、inference efficiency や throughput を改善するものだ。model product にとって現実的な意味がある。flagship model の training cost が高く、production model が多数の path にすでに配備されているとき、post-hoc decoding / prediction modification は retraining より速く効くことがある。model frontier の一部は「より大きな parameter」から「同じ model を serving path でどう効率化するか」へ移っている。

## 3. 実践コード & ツールライブラリ

### CodeGraph：pre-indexed code knowledge graph は agent の blind file reading を減らす

- 出典：CodeGraph
- 日付：2026-06-28
- リンク：https://github.com/colbymchenry/codegraph
- 要約：CodeGraph は Claude Code、Codex、Gemini、Cursor、OpenCode、Antigravity、Kiro、Hermes Agent などに local code knowledge graph を提供する。symbols、call edges、dependencies、route information を local SQLite に pre-index し、MCP 経由で agent が entry points、related symbols、code snippets、impact radius を一回の query で取得できる。project の 7 open-source repo benchmark では、CodeGraph 使用時に tool calls が median 58% 減り、time は 22% 減り、file reads はほぼ 0 になった。これは agent の典型的な非効率を狙っている。毎回 grep、glob、Read で構造を再発見するのではなく、context と token を判断と変更に使わせる。

### TencentDB Agent Memory：layered memory と Mermaid canvas が long task context を圧縮する

- 出典：TencentDB Agent Memory
- 日付：2026-06-28
- リンク：https://github.com/TencentCloud/TencentDB-Agent-Memory
- 要約：TencentDB Agent Memory は local short-term / long-term memory system を提供する。short-term layer は verbose tool logs を外部化し、context には `node_id` 付き Mermaid task canvas だけを残す。long-term layer は raw conversation、atomic facts、scenario blocks、persona を L0-L3 に分ける。project は reversible compression を重視し、top structure は読めて、bottom evidence は `node_id` や reference files から戻れる。README の OpenClaw continuous task results では、WideSearch token usage が 61.38% 減り、pass rate は relative 51.52% 改善し、PersonaMem accuracy は 48% から 76% になった。これは普通の vector memory より engineering system に近い。memory は history を積むことではなく、compressible state、retrievable evidence、auditable path を同じ layered structure に置くことだ。

## 4. 業界 & ビジネス速報

### Coinbase / Baseten：AI cost governance は model を減らす話から routing、cache、speculation へ移る

- 出典：Latent.Space / AINews
- 日付：2026-06-27
- リンク：https://x.com/brian_armstrong/status/2070670644577280109
- 要約：AINews は Baseten の speculative decoding と Coinbase の cost governance を同じ infrastructure signal として扱った。Baseten は speculative decoding acceptance の median が約 20% 改善したと報告した。Brian Armstrong は、Coinbase が cheaper default models、routing、warm-cache reuse などにより AI spend をほぼ半分にし、cache hit を約 5% から 60% まで上げたと述べた。enterprise AI cost control は「model call を減らす」「安い model に変える」だけではなくなっている。model routing、cache hit、speculative decoding、task tiering、harness token usage が budget table に入る。

### Anthropic：AI work impact perception には「自分より他人が危ない」という非対称がある

- 出典：Anthropic
- 日付：2026-06-27
- リンク：https://x.com/AnthropicAI/status/2070528961235575278
- 要約：AINews は Anthropic の economic impact research を取り上げた。回答者のほぼ半数は、自分の job responsibilities が 12 months 以内に大きく変わると見ている。しかし自分が 1 年以内に job loss すると思う人は 10% 未満だ。一方で、3 分の 1 以上は junior colleague が job loss する確率を 60% 超と見ている。この非対称は重要だ。organizations が agent を導入するとき、実際の抵抗は AI capability だけでなく、employees が risk、training opportunities、responsibility shift をどう見るかに左右される。productivity metrics だけを見ると、internal trust、job redesign、junior pipeline pressure を見落としやすい。

## 5. GitHub 人気 repo & トレンド追跡

### safishamsi/graphify：code、docs、multimedia を queryable knowledge graph に変える

- 出典：GitHub Trending
- 日付：2026-06-28
- リンク：https://github.com/safishamsi/graphify
- 要約：`safishamsi/graphify` は Python daily trending で高い位置に出ていた。README は Claude Code、Codex、OpenCode、Kilo Code、Cursor、Gemini CLI、GitHub Copilot CLI、Aider、Hermes、Kimi Code、Kiro、Devin CLI、Antigravity などの tools 向け knowledge graph layer として説明する。code、docs、PDF、images、audio、video、YouTube、web pages を queryable graph にし、`graph.html`、`GRAPH_REPORT.md`、`graph.json` を出力する。`.agents/skills` や `.codex` などの agent instruction path にも書き込める。trend として重要なのは、agent workflow が「files を読む」から「project、documents、media を一つの graph にしてから query する」方向へ広がっていることだ。

### every-app/open-seo：SEO tool は agent-callable な open-source business system になる

- 出典：GitHub Trending
- 日付：2026-06-28
- リンク：https://github.com/every-app/open-seo
- 要約：`every-app/open-seo` は Every が公開した open-source Semrush / Ahrefs alternative で、DataForSEO API を使い、Docker / Cloudflare self-hosting と MCP server を提供する。project は SEO project setup、SEO coach、keyword research、keyword clustering、competitive landscape、competitor analysis、link prospecting などを agent skills として expose する。これは general AI infra ではないが、第五象限には合っている。vertical business software が agent に直接開かれ、agent は code generation だけでなく、keywords、competitors、link opportunities、content strategy をめぐる structured workflow を実行するようになっている。

## 📬 Newsletter 精選

### ByteByteGo：RAG、Graph RAG、Agentic RAG の選択境界がより明確になる

- 出典：ByteByteGo
- 日付：2026-06-27
- リンク：https://blog.bytebytego.com/p/ep220-rag-vs-graph-rag-vs-agentic
- 要約：ByteByteGo は今号で三つの retrieval-augmented systems を分けた。standard RAG は embeddings と vector DB で top-K chunks を探し、fast and low-cost factual lookup に向く。Graph RAG は entities と relationships を使い、local traversal や global community report を通じて legal、compliance、medical のような relationship-heavy multi-hop question に向く。Agentic RAG は agent が question を分解し、sources を選び、context を検査し、必要なら re-retrieve する。価値は「より高度」ではなく「より適合」だ。single-hop fact には agentic pipeline は不要で、multi-hop relationship には vector similarity だけでは足りず、dynamic multi-source task で初めて agent orchestration が必要になる。

### The Rundown AI：AI avatar の middle-layer content creation は moat 問題を露呈する

- 出典：The Rundown AI
- 日付：2026-06-26
- リンク：公開版リンクなし
- 要約：The Rundown AI は今号で、team が HeyGen で host Rowan の face を clone し、ElevenLabs で voice を clone して Instagram avatar を運用した実験を振り返った。account は約 1 年で 20 万 followers まで伸びたが、最終的に停止された。中心判断は「middle has no moat」だ。authentic human brands と large-scale low-quality content farms にはそれぞれ利点があり、中間層の AI avatar content は挟まれやすい。この signal は payment agent や model gating とは違うが、同じく product boundary を示す。generation capability は production barrier を下げるが、trust、differentiation、long-term brand asset を自動的には作らない。
