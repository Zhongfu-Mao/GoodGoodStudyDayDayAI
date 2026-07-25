---
title: "AIレーダー日報：2026-07-25"
date: 2026-07-25
category: radar
cadence: daily
plainSummary: "今日の主線：AIシステムの競争点は、単体モデルから、ルーティング、評価、マルチモーダル制御、音声ツール、能動 agent、推論ハードウェアの組み合わせへ広がっている。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agents
  - Models
  - Evaluation
  - GitHub
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-07-25.ja-infographic.webp
audioUrl: /audio/radar/daily-ai-radar-2026-07-25.ja.mp3
audioDuration: 909
audioSize: 7271425
draft: false
---

対象期間：2026-07-24 から 2026-07-25（JST）。今日の焦点は、システム層の能力がさらに前面に出ていることだ。モデル選択は router に委ねられ始め、メディア生成には cost、quality、latency の方針が必要になり、open model は context、vision、long-horizon agent capability を新しい規模へ押し上げ、robot control と video world model が合流し始めている。

## 1. AI Engineering & アーキテクチャ

### Cursor Router：コード agent のモデル選択がオンラインルーティング時代に入る

- 出典：Cursor
- 日付：2026-07-22
- リンク：https://cursor.com/blog/router
- 要約：Cursor は Teams と Enterprise 向けに Cursor Router を公開した。各リクエストの前に、context、task complexity、domain、各モデルの振る舞いを分類し、単純な作業はより安いモデルへ、UI 調整、長期 refactor、複雑な reasoning はより適したモデルへ回す。Cursor は、初期 enterprise traffic で品質を下げずに 30% から 50% の cost reduction、online A/B test で 60% savings を得たと説明し、user satisfaction と generated code keep rate を評価信号にしている。重要なのはモデルメニューが増えたことではなく、「どのモデルがこの request を処理するか」が、治理可能で、rollout 可能で、team 単位に設定できる production strategy になったことだ。

### Runway Media Router：メディア生成にも model routing、hard constraints、dry-run が必要になる

- 出典：Runway
- 日付：2026-07-23
- リンク：https://runway.com/news/company-news/introducing-runway-media-router
- 要約：Runway は Runway Dev に Media Router を導入した。一つの endpoint が video、image、audio model を自動選択する。開発者は cost、latency、quality の preference に加え、price cap、allow list、deny list といった hard constraints を設定できる。router は能力や制約を満たさない model を除外し、最終的に使った model と選択理由を返す。dry-run も用意され、本番投入前に routing 結果を確認できる。メディアモデルの品質はテキストより統一しにくいため、この router layer は multimodal application の cost と安定性を制御する基盤になる。

### Daily Dose：LLM 評価は単一スコアから trajectory、judge、安全面へ広がる

- 出典：Daily Dose of Data Science
- 日付：2026-07-24
- リンク：https://blog.dailydoseofds.com/p/11-llm-evaluation-methods
- 要約：Daily Dose は 11 種類の LLM evaluation method を整理している。BLEU、ROUGE、BERTScore などの text similarity metrics から、G-Eval、LLM-as-judge、人間評価、jury-based evaluation、DAG evaluation、trajectory evaluation、multi-turn evaluation、安全評価までを含む。価値は、「モデルが良いか」を複数の production question に分解する点にある。出力は task goal に合っているか、reasoning path は受け入れられるか、long-running agent は本当に作業を完了したか、multi-turn interaction は一貫しているか、安全境界は別に測ったか。Agent system では、単一 benchmark だけでは足りず、trajectory、tool calls、rollback points、人間裁定まで評価対象になる。

## 2. モデル最前線 & アルゴリズム探索

### Black Forest Labs FLUX 3：画像、動画、音声、action prediction を統一する

- 出典：Black Forest Labs
- 日付：2026-07-23
- リンク：https://bfl.ai/blog/flux-3
- 要約：Black Forest Labs は FLUX 3 の early access 版を公開した。統一 architecture の中で image、video、audio、action prediction を共同学習すると説明している。FLUX 3 Video は text-to-video、image-to-video、video-to-video、video/audio continuation、keyframe-to-video、多言語対話、強い typography、多様な style に対応し、native audio 付きで最大 20 秒の生成ができる。BFL はこれを Self-Flow の拡張と位置付け、FLUX 3 Image、robotics action 向け version、open-weight FLUX 3 Dev も予定している。公式の preference evaluation は preliminary claim として読む必要があるが、方向性は明確だ。Multimodal generation は content synthesis から world model と control interface へ進んでいる。

### FLUX-mimic：video world model が工場 robot control に直接入り始める

- 出典：mimic robotics
- 日付：2026-07-23
- リンク：https://www.mimicrobotics.com/blog/introducing-flux-mimic
- 要約：mimic robotics と Black Forest Labs は FLUX-mimic preview を発表した。FLUX 3 backbone と robot learning system を組み合わせた Video-Action Model だ。mimic は、soft-body kitting task で task-specific fine-tuning なしに 95% success rate を達成し、adapted pi0.5 の 55%、flow-matching baseline の 70% を上回ったと説明している。Audi と実工場 task の testing も進めている。技術上の要点は、video model が次フレームを予測するだけでなく、action decoder を接続し、人間 video、wearable demonstrations、teleoperation data から robot の sample efficiency を高めることだ。

### Kimi K3：open 3T-class model が long context、MoE、agentic coding を新規模へ押し上げる

- 出典：Kimi
- 日付：2026-07-25
- リンク：https://www.kimi.com/blog/kimi-k3
- 要約：Kimi は Kimi K3 を公開した。2.8T parameter の open 3T-class model として、native vision、1M token context、Kimi Delta Attention、Attention Residuals、Stable LatentMoE を備える。MoE では 896 experts のうち 16 を activate し、Quantile Balancing、Per-Head Muon、Gated MLA、MXFP4/MXFP8 quantization-aware training などの組み合わせで training と inference efficiency を上げる。公式 case study は long-horizon coding、GPU kernel optimization、MiniTriton compiler、chip design、scientific computation reproduction、interactive research report を含む。主な signal は一つの leaderboard ではなく、open model が long-horizon software engineering と knowledge work の system-level competition に入ったことだ。

## 3. 実践コード & ツールライブラリ

### QwenCloud：Qwen3.7 Flash が vision understanding と multimodal agent execution を強化

- 出典：QwenCloud
- 日付：2026-07-25
- リンク：https://docs.qwencloud.com/changelog/models
- 要約：QwenCloud の model changelog に `qwen3.7-flash` と `qwen3.7-flash-2026-07-15` が追加された。3.6-Flash から multimodal understanding と agent execution を全面的に強化した native vision-language Flash series だ。ログでは、より強い universal object recognition、real-world perception、spatial intelligence、Search Agent と CI Agent 向けの end-to-end task execution stability、multimodal coding の改善が強調されている。Application developer にとって Flash line の意味は、vision understanding、screen operation、code generation、低 latency を高頻度 interactive workflow に組み込めることだ。

### Qwen-Audio 3.0 TTS：音声ツールは方言、style tag、低 latency version を重視し始める

- 出典：QwenCloud
- 日付：2026-07-14
- リンク：https://docs.qwencloud.com/developer-guides/speech/realtime-streaming
- 要約：QwenCloud は `qwen-audio-3.0-tts-plus` と `qwen-audio-3.0-tts-flash` を提供開始した。更新ログでは、より多くの minority languages と Chinese dialects、強化された instruction following、fine-grained tag control、音質と表現力の向上が説明されている。Plus は professional quality scenario、Flash は low-latency real-time interaction を対象にする。Content tools、customer support、voice agent、multilingual product にとって、TTS の競争は「読めるか」から、controllable style、realtime performance、dialect coverage、composable API へ移っている。

## 4. 業界 & ビジネス速報

### Cognition が Poke を買収：能動的 personal agent が Devin 側の cloud agent 路線へ入る

- 出典：Cognition
- 日付：2026-07-23
- リンク：https://cognition.com/blog/interaction
- 要約：Cognition は The Interaction Company of California、つまり Poke の開発チームを買収した。Poke は text message の中にいる personal agent で、自分から message を送り、follow-up する。Cognition は、過去三か月で Poke users と 1 億件以上の message が交換され、Apple Messages で native texting が承認された唯一の AI agent だと説明している。Poke users は現行 product をそのまま使い続けられ、今後 Cognition の model と infrastructure が組み合わされる。この買収は、Devin の software engineering agent と能動 personal assistant をつなぎ、agent product の競争が always-on、proactive reach、work/life cross-context へ広がっていることを示す。

### Etched：推論ハードウェアは chip 競争から rack、software、manufacturing co-design へ進む

- 出典：The Rundown AI / Etched
- 日付：2026-07-24
- リンク：https://www.etched.com/progress
- 要約：Etched は frontier inference systems の進捗を更新した。A0 silicon は TSMC N4P から戻り、初の rack-scale product を顧客と検証中で、10 億ドル超の demand を満たす計画だという。同社は low voltage inference と cluster scale memory を二つの柱として説明する。前者は高 throughput inference の thermal limit を下げる狙いで、後者は chip 間共有 memory pool によって decode latency を改善する。Etched は 400 人超の team、累計 8 億ドルの調達、台湾 factory、San Jose の data center、test house、NPI prototyping lab も示している。Inference competition は single-card performance から、chips、racks、cooling、interconnect、scheduling、supply chain の共同設計へ移っている。

## 5. GitHub 人気 repo & トレンド追跡

### Chat2DB：AI database client が SQL workspace、desktop app、MCP support を local-first にまとめる

- 出典：GitHub Trending / OtterMind
- 日付：2026-07-25
- リンク：https://github.com/OtterMind/Chat2DB
- 要約：Chat2DB は AI-powered database client and SQL workspace で、developers、DBAs、analysts、data teams を対象にする。Community edition は local machine 上で動く cross-platform client で、MySQL、PostgreSQL、Oracle、SQL Server、ClickHouse、MongoDB、Redis、SQLite、Snowflake、BigQuery など 30+ data sources を扱える。SQL editing、completion、formatting、execution history、metadata browsing、data import/export、dashboards、charts に加え、ユーザー自身の AI model を接続して SQL の生成、説明、最適化ができる。Open-source CLI と MCP support、安全説明での local single-user boundary と key encryption も重要だ。Database IDE は SQL client から、AI と agent が参加する data workspace へ拡張している。

### Instatic：self-hosted visual CMS が AI agent、publisher、plugin sandbox を一つの Bun server に入れる

- 出典：GitHub Trending / CoreBunch
- 日付：2026-07-25
- リンク：https://github.com/CoreBunch/Instatic
- 要約：Instatic は open-source self-hosted visual CMS で、Webflow、Framer、WordPress の一部 workflow を置き換えることを狙う。Canvas editor、content model、media、auth、forms、plugins、publisher を一つの Bun server に入れ、公開結果は semantic HTML と compact CSS になり、一般的な page は static file として提供される。内蔵 AI agent は canvas 上に real editable nodes を生成でき、Claude、OpenAI、OpenRouter、local Ollama に対応する。Plugin backend は QuickJS-WASM sandbox で動き、network capability などは site owner の許可を要する。AI site builder の次の競争点は screenshot generation ではなく、editable structure、auditable permissions、self-hosted output になりつつある。

## 📬 Newsletter 精選

### Every：Claude Opus 5 は強いが、既存 skills と workflow の再点検が必要になる

- 出典：Every
- 日付：2026-07-24
- リンク：https://every.to/vibe-check/opus-5
- 要約：Every の Vibe Check は、Claude Opus 5 には鮮やかな能力がある一方、最初の一週間では instruction と衝突し、作業完了前に止まり、既存の skills、plugins、compound engineering workflow にうまく馴染まなかったと述べている。公開部分だけでも核心は見える。強い model がそのまま古い workflow に入るとは限らず、チームは複雑すぎる指示を減らし、自動化境界を再調整し、model behavior を system design variable として扱う必要がある。Engineering organization にとって、新モデル評価には benchmark だけでなく workflow compatibility が必要になる。

### Latent.Space / AINews：The Stack v3 が open code model competition を data infrastructure 層へ押し上げる

- 出典：Latent.Space / AINews
- 日付：2026-07-24
- リンク：https://www.latent.space/p/ainews-black-forest-labs-flux-3-multimodal
- 要約：Latent.Space / AINews は The Stack v3 を当日の重要な open-data release と見ている。規模は 114 TB raw data、224M repositories、44B files、770 languages、約 5T deduplicated and filtered tokens。The Stack v2 と比べ、Software Heritage IDs ではなく content inline で提供され、2025 年 8 月までの新しい GitHub recrawl を含み、restrictive licenses の code を除外し、ready-to-train split と full bucket を提供する。この変化は、open code model competition を「誰が weights を持つか」から、「誰が reproducible、filterable、governable data substrate を持つか」へ進める。
