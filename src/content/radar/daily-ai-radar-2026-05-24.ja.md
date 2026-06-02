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

### ByteByteGo は RAG と agents の境界を engineering の基本問題に戻した

- 出典：ByteByteGo
- 日付：2026-05-23
- リンク：https://blog.bytebytego.com/p/ep216-rags-vs-agents
- 要約：ByteByteGo の EP216 は、RAG と agents を四つの step で区別しました。RAG は one retrieval と one generation で、answer が documents にある時に向いています。Agent は runtime で tool を選び、action を実行し、result を読み、また reasoning する loop です。この item を残す理由は、「いつ RAG、いつ agent か」を slogan ではなく、cost、debuggability、error propagation、tool boundary の問題として整理しているからです。Enterprise knowledge systems の失敗は、model が弱いだけでなく、retrieval problem を agent problem と誤分類したり、action problem を one-shot generation に押し込めたりするところから起きます。

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

### 老范讲故事は Google I/O の問題を技術不足ではなく入口の分散だと見た

- 出典：老范讲故事
- 日付：2026-05-24
- リンク：https://lukefan.com/2026/05/24/google-io-gemini-antigravity-agent-reliability/
- 要約：老范は Google I/O 2026 を振り返り、Google の問題は technology ではなく product line の分散だと見ました。Gemini 3.5 Flash の reliability、Gemini Spark の cloud workflow potential、Antigravity 2.0 の entry-point problem、Workspace と AI Studio など複数 surface の競合を一つの story として扱っています。この Chinese industry view は official release では見えにくい点を補います。Agent era の競争は features の数ではなく、user が信頼して継続利用でき、組織内の入口同士が衝突しない default workspace を作れるかにかかっています。

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

### Every：Cheap Competence, New Frontier

- 出典：Every
- 日付：2026-05-24
- リンク：https://every.to/context-window/cheap-competence-new-frontier
- 要約：Every は “cheap competence” を今週の線として扱い、automation が増えるほど人間は models に渡す new frame を見つける必要があると論じた。After Automation、Google I/O、Stainless、100-agent software factory、AI と entry-level work の変化をまとめ、agent が組織に入った後の human judgment、organizational interface、career path を補助線として示している。
