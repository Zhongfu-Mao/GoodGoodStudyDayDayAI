---
title: "AI レーダー日報：2026-05-24"
date: 2026-05-24
category: radar
cadence: daily
plainSummary: "今日は model labs が agent labs へ移る流れ、Google I/O 後の consumer agents と commerce protocols、RL と harness engineering が AI engineering の基礎に戻っていること、open rerankers と agent leaderboard の evaluation infrastructure、そして Opik / Exgentic など GitHub projects の agent optimization と reproducibility に注目します。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agent
  - Infrastructure
  - Multimodal
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-05-24.ja-infographic.webp
audioUrl: /audio/radar/daily-ai-radar-2026-05-24.ja.mp3
audioDuration: 1259
audioSize: 10074051
draft: false
---

## 対象範囲

- 対象期間：2026-05-23 〜 2026-05-24。あわせて 2026-05-19 〜 2026-05-22 の未採用だが signal value が高い public releases も補足します。

## 1. AI Engineering & アーキテクチャ

### Latent.Space は model labs が agent labs になりつつあると見ており、競争軸は model から model + harness + workflow に移っている

- 出典：Latent.Space
- 日付：2026-05-23
- リンク：https://www.latent.space/p/ainews-all-model-labs-are-now-agent
- 要約：Latent.Space は AINews で最近の signal を「model labs are becoming agent labs」と整理しました。AI21 の agents pivot、DeepSeek の harness team、model providers が workflow / UI / memory / economics を強調し始めていることから、competition surface は single model capability から model と harness の組み合わせへ広がっています。追うべき論点は closed ecosystem risk です。Model と proprietary harness が一緒に post-train されるなら、provider は value を open API や interchangeable model interface ではなく自社 agent product に寄せられます。

### Google I/O 2026 は Gemini、Antigravity、AI Studio、Managed Agents を agent-first developer surface として束ねた

- 出典：Google
- 日付：2026-05-20
- リンク：https://blog.google/innovation-and-ai/technology/ai/google-io-2026-all-our-announcements/
- 要約：Google の I/O 2026 roundup は多くの releases を列挙していますが、中心線は Gemini、Google Antigravity、AI Studio、Managed Agents、WebMCP を同じ agent-first platform story に置いたことです。Managed Agents は 1 回の API call で remote Linux environment、code execution、file management、web browsing を agent に与え、Antigravity は desktop app、CLI、SDK、subagents、hooks、async task management を広げています。Google は model、IDE、API、managed execution environment、open tool protocols を developer surface として束ねています。

## 2. モデル最前線 & アルゴリズム探索

### Daily Dose of DS は Function Approximation in RL で、RL が AI engineering の基礎に戻っている理由を説明した

- 出典：Daily Dose of Data Science
- 日付：2026-05-24
- リンク：https://www.dailydoseofds.com/rl-course-part-5
- 要約：Daily Dose of DS は RL series の Part 5 を公開し、function approximation が table-based value function をどう置き換えるかを扱いました。Gradient Monte Carlo、semi-gradient TD、bootstrapping、off-policy learning、Mountain Car implementation を含みます。Email はこれを LLM post-training の文脈に置き、RLHF、constitutional AI、GRPO、agent optimization により、reward signals、policy optimization、exploration、credit assignment の理解が AI engineering の基本になりつつあると説明しています。

### Hugging Face は Ettin Reranker series を公開し、retrieval reranking の speed、quality、training recipe を open にした

- 出典：Hugging Face
- 日付：2026-05-19
- リンク：https://huggingface.co/blog/ettin-reranker
- 要約：Hugging Face は 6 つの Sentence Transformers CrossEncoder rerankers を公開しました。17M から 1B までの sizes があり、Johns Hopkins Ettin ModernBERT encoders をベースにし、8K context をサポートします。Models、約 143M の training data、training scripts も公開されています。Small models は MTEB と NanoBEIR でより大きい旧 rerankers を上回り、1B model は teacher に近づきました。RAG と agent memory systems では、reranker は peripheral component ではなく、context quality、latency、cost を決める control point です。

## 3. 実践コード & ツールライブラリ

### Google Workspace は Gmail Live、Docs Live、Keep、Pics、AI Inbox、Gemini Spark を voice-first workflow としてつなげた

- 出典：Google
- 日付：2026-05-19
- リンク：https://blog.google/products-and-platforms/products/workspace/workspace-updates/
- 要約：Google Workspace は Google AI subscribers と Workspace business customers 向けに new features を発表しました。Gmail Live は voice で inbox information を聞けるようにし、Docs Live は voice brainstorm を document draft に整理し、Keep は spoken notes を notes and lists に変換します。Google Pics は object segmentation、text editing、translation、Workspace integration を提供し、AI Inbox は Plus / Pro users に広がり、Gemini Spark は 24/7 personal AI agent として Workspace apps に接続されます。AI は本文作成補助だけではなく、inbox、docs、notes、images、daily planning の operation layer になっています。

### Running Guide agent は on-device multimodal agent が accessibility で low-latency safety path を必要とすることを示した

- 出典：Google / Google DeepMind
- 日付：2026-05-20
- リンク：https://blog.google/innovation-and-ai/models-and-research/google-deepmind/running-guide-agent/
- 要約：Google は Running Guide agent を紹介しました。Chest-mounted Pixel 10 Pro と audio feedback を使い、blind and low-vision runners を支援します。System は dual-path architecture を採用し、on-device segmentation が low-latency STOP alerts と steering cues を返し、Gemma 4 E4B が more complex multimodal scene understanding を担当します。Accessibility agents に必要なのは長い回答ではなく、low latency、on-device reliability、strict risk hierarchy、hardware form factor です。

### Open Agent Leaderboard は full agent system を評価し、inner model だけを比べない

- 出典：Hugging Face / IBM Research
- 日付：2026-05-18
- リンク：https://huggingface.co/blog/ibm-research/open-agent-leaderboard
- 要約：IBM Research は Hugging Face で Open Agent Leaderboard を公開しました。これは inner model だけでなく full agent systems を比較する leaderboard です。Exgentic framework は SWE-Bench Verified、BrowseComp+、AppWorld、tau2-Bench Airline / Retail / Telecom などを task、context、actions という protocol に統一し、success rate と average cost per task を同時に報告します。同じ model でも agent wrapper が違えば quality と cost が変わるため、agent evaluation は model leaderboard から planning、memory、tool use、context management、failure recovery の system comparison へ移っています。

## 4. 業界 & ビジネス速報

### Universal Cart、AP2、UCP は agentic commerce を recommendation から payment と merchant systems へ進めた

- 出典：Google
- 日付：2026-05-20
- リンク：https://blog.google/products-and-platforms/products/shopping/shopping-updates-google-marketing-live/
- 要約：Google は Universal Cart、Agent Payments Protocol、Universal Commerce Protocol の update を紹介しました。Universal Cart は Search、Gemini などをまたいで動き、UCP は Google Pay による Google 内 checkout、または merchant site への cart transfer を支えます。今後は YouTube Shopping ads、Direct Offers、hotel booking、local food delivery にも広げる計画です。Agentic commerce の難所は「商品を探す」だけではなく、payments、merchant of record、promotions、brand visibility、cross-platform checkout protocols にあります。

### Google AI Mode は monthly active users が 10 億を超え、search behavior は keywords から long questions、planning、decision support へ移っている

- 出典：Google
- 日付：2026-05-19
- リンク：https://blog.google/products-and-platforms/products/search/ai-mode-us-insights/
- 要約：Google によると AI Mode は globally で monthly active users が 10 億を超え、launch 以来 queries は quarter ごとに doubled しています。U.S. usage では、6 分の 1 以上の searches が voice または images を使い、AI Mode の average query は traditional Search の 3 倍の長さです。Planning related queries は past 6 months で overall より速く伸びています。AI Search は results summary replacement ではなく、multimodal input、long questions、planning tasks、decision support へ search entry point を広げています。

## 5. GitHub 人気 repo & トレンド追跡

### Opik：agent optimization workflow が prompt search、eval dataset、automatic iteration を接続する

- 出典：GitHub / Daily Dose of Data Science
- 日付：2026-05-24
- リンク：https://github.com/comet-ml/opik
- 要約：Daily Dose of DS は Comet Opik の agent optimization workflow を紹介しました。Public repository では、Opik は LLM app observability、evaluation、prompt / agent optimization のための open-source tool です。Initial prompt、eval dataset、automatic iteration、result comparison を同じ loop に置き、agent prompts を intuition-only tuning から外へ出します。Agent tasks が長くなるほど、optimization target は prompt だけでなく harness、tool selection、context pruning、failure recovery strategy に広がります。

### Exgentic：open agent evaluation framework は agent wrapper、model、cost を一緒に再現比較できるようにする

- 出典：GitHub / Hugging Face
- 日付：2026-05-18
- リンク：https://github.com/Exgentic/exgentic
- 要約：Open Agent Leaderboard の背後にある Exgentic framework は公開されています。tau2、AppWorld、BrowseComp+、SWE-Bench などの tasks で agent evaluation を再現し、異なる benchmarks を task、context、actions という protocol に統一します。Agent wrapper、model selection、success rate、cost を同時に比較できる点が重要です。GitHub trend として見る理由は、agent evaluation が leaderboard を読むだけではなく、run、submit、reproduce できる engineering infrastructure になりつつあるからです。

## 📬 Newsletter 精選

### Daily Dose of DS：From prompt to context to harness engineering

- 出典：Daily Dose of Data Science
- 日付：2026-05-24
- リンク：https://www.dailydoseofds.com/p/the-anatomy-of-an-agent-harness/
- 要約：このメールは prompt engineering、context engineering、harness engineering を切り分けた。Prompt は single input、context は multi-step task で何を残すか、harness は action、verification、failure recovery を持つ machine である。Gather、Act、Verify を agent loop の基本構造として置き、agent は API call ではなく runnable system だと説明している。

### Daily Dose of DS：Build an automated Agent optimization workflow

- 出典：Daily Dose of Data Science
- 日付：2026-05-24
- リンク：https://www.comet.com/docs/opik/v1/agent_optimization/overview
- 要約：このメールは Comet Opik の agent optimization workflow も推薦していた。Prompt / agent versions、evaluation dataset、optimizer、result comparison を closed loop にし、agent engineering が「良い prompt を書く」だけではなく、reproducible evaluation と iteration の工程になっていることを補足している。

### Every：Cheap Competence, New Frontier

- 出典：Every
- 日付：2026-05-24
- リンク：https://every.to/context-window/cheap-competence-new-frontier
- 要約：Every は “cheap competence” を今週の線として扱い、automation が増えるほど人間は models に渡す new frame を見つける必要があると論じた。After Automation、Google I/O、Stainless、100-agent software factory、AI と entry-level work の変化をまとめ、agent が組織に入った後の human judgment、organizational interface、career path を補助線として示している。
