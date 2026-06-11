---
title: "AI レーダー日報：2026-06-11"
date: 2026-06-11
category: radar
cadence: daily
plainSummary: "今日の主線は、frontier capability が検証可能で、governable で、実運用に入る system capability へ収束していることです。OpenAI の black hole simulation case と LSEG case は AI engineering が scientific computing と regulated enterprise workflow に入り始めたことを示します。Daily Dose は GRPO によって structured output を reward function で訓練できることを示し、from-scratch post-training codebase は SFT、RM、PPO、DPO、GRPO を readable implementation に分解します。同時に、老范の 1260H 分析、OpenAI と Oracle の cloud commitment partnership、Tolaria、Hivemind、Claude HowTo は、AI の影響が supply-chain compliance、procurement path、knowledge-base desktop tools、agent memory、workflow learning に広がっていることを示します。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agents
  - Model Evaluation
  - GitHub
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-06-11.ja-infographic.webp
audioUrl: /audio/radar/daily-ai-radar-2026-06-11.ja.mp3
audioDuration: 1044
audioSize: 8355821
draft: false
---

## 対象範囲

- 対象期間：2026-06-10 から 2026-06-11 まで。
- 今日は GRPO structured-output training、scientific computing における Codex、enterprise AI distribution、supply-chain compliance、AI-first knowledge base、agent shared memory、Claude Code workflow learning を中心に整理します。

## 1. AI Engineering & アーキテクチャ

### Codex は black hole plasma simulation に入り、AI を testable scientific computing に使う

- 出典：OpenAI
- 日付：2026-06-11
- リンク：https://openai.com/index/using-codex-to-simulate-black-holes/
- 要約：OpenAI は、University of Arizona の astrophysicist Chi-kwan Chan が Codex を使い、black hole plasma simulation の candidate numerical algorithms を導出・実装している事例を紹介しました。難点は、black hole 近傍の hot diffuse plasma では大量の charged particles が magnetic field に沿って高速に螺旋運動するため、traditional simulation が極小 timestep に縛られることです。Chan の team は Codex に mathematical transformation と numerical scheme を提案させ、known solutions、physical interpretability、repeat testing で結果を選別します。この case の価値は「AI が物理法則を自動発見する」ことではなく、model-generated ideas を testable、reproducible、inspectable scientific workflow に入れることです。

### LSEG は generative AI を financial data workflow に埋め込みつつ governance を残す

- 出典：OpenAI / LSEG
- 日付：2026-06-11
- リンク：https://openai.com/index/lseg/
- 要約：London Stock Exchange Group は ChatGPT Enterprise と OpenAI API を使い、product、engineering、research、operations teams を支援しています。狙いは single task automation ではなく、financial data analysis、product prototyping、customer delivery cycles の短縮です。OpenAI の case study によると、LSEG は数週間で数千人の employees に tools を展開し、一部 product release cycles を 3-6 months から約 2 weeks へ、customer delivery を request から production まで約 4 weeks へ短縮しました。同時に、model evaluation、human-in-the-loop review、data privacy、security controls を初期から組み込みました。Regulated industry における AI adoption は、chat interface の購入ではなく、workflow redesign と embedded governance の組み合わせになっています。

## 2. モデル最前線 & アルゴリズム探索

### Train LLM From Scratch は post-training pipeline を readable PyTorch implementation に分解する

- 出典：GitHub Trending / Train LLM From Scratch
- 日付：2026-06-10
- リンク：https://github.com/FareedKhan-dev/train-llm-from-scratch
- 要約：`FareedKhan-dev/train-llm-from-scratch` は、Transformer と small LLM training を from scratch で実装する repository で、最近は post-training flow も追加しています。SFT、Reward Model、PPO、DPO、GRPO / RLVR を、`trl`、`peft`、`transformers` の high-level wrappers に頼らず実装します。README は training path を Base → SFT → RM → PPO / DPO → GRPO と整理し、Alpaca、Dolly、Anthropic HH-RLHF、UltraFeedback、GSM8K など public datasets を使います。成熟した training framework を置き換えるより、post-training mechanisms を learner が層ごとに確認できる code として示す価値があります。

### GRPO は structured output を「JSON らしさ」から「code で正しさを判定できる」へ進める

- 出典：Daily Dose of Data Science
- 日付：2026-06-10
- リンク：https://blog.dailydoseofds.com/p/training-an-llm-to-generate-reliable
- 要約：Daily Dose は、Qwen3-8B に invoice JSON extraction を学習させる例で、structured output の鍵が prompt や SFT だけではなく、「correctness」を reward function として書くことにあると説明します。実験では、JSON として parse できない output は 0、parse できるが schema に合わない output は 0.5、parse できて schema に合う output は 1.0 と評価します。Model は Fireworks H200 training environment で GRPO により複数候補を比較し、高得点 output を強化します。記事の結果では、Qwen3-8B の schema-valid rate は 50 held-out prompts で 62% から 82% へ上がり、同じ eval の GPT-4.1 58% を上回りました。SQL、API responses、tool calls、lintable code など、programmatic scoring が可能な tasks に向いた pattern です。

## 3. 実践コード & ツールライブラリ

### Tolaria は Markdown knowledge base を AI-first desktop workspace にする

- 出典：GitHub Trending / Tolaria
- 日付：2026-06-11
- リンク：https://github.com/refactoringhq/tolaria
- 要約：`refactoringhq/tolaria` は macOS、Windows、Linux 向けの desktop app で、Markdown knowledge bases を管理します。Project は files-first、git-first、offline-first、AI-first を掲げ、personal second brain、company docs as AI context、OpenClaw、Codex、Gemini など assistants の memory and procedures を対象にしています。Codex / Gemini / Claude Code 向けの setup paths と AGENTS file support もあります。この project の signal は、AI workflow の knowledge-base layer が、単なる editor や cloud note から、local files、version control、agent context、procedure specs の組み合わせへ進んでいることです。

## 4. 業界 & ビジネス速報

### 老范：1260H list は AI industry risk を chips から supply-chain compliance へ広げる

- 出典：老范讲故事
- 日付：2026-06-11
- リンク：https://lukefan.com/2026/06/11/pentagon-1260h-china-military-company-list-supply-chain-risks/
- 要約：老范讲故事 は、US Department of Defense の 1260H list を分解し、これが BIS Entity List や OFAC SDN とは異なると説明します。1260H 自体は direct sanctions list ではありませんが、US government procurement、contractor compliance、capital market judgment、supply-chain review に影響します。記事は BYD、CATL、Unitree、DJI などの examples を挙げ、影響が traditional defense industry から batteries、robotics、cloud services、biotech、global supply chains へ広がっていると見ます。AI industry では、hardware、data centers、robots、drones、edge devices の commercialization が model capability だけでなく、geopolitical compliance と procurement rules にも左右されます。

### OpenAI と Oracle は models and Codex を existing cloud commitments に接続する

- 出典：OpenAI
- 日付：2026-06-10
- リンク：https://openai.com/index/openai-on-oracle-cloud/
- 要約：OpenAI と Oracle は、Oracle Cloud Infrastructure customers が今後数週間で eligible Oracle Universal Credits を使い、OpenAI models と Codex に access できるようにすると発表しました。この partnership の焦点は new model ではなく、enterprise AI adoption の procurement friction を下げることです。既に Oracle cloud commitments、compliance processes、budget paths を持つ organizations は、AI access を existing cloud spend and governance framework に入れられます。Enterprise AI distribution は、standalone model API purchase から、existing cloud contracts、procurement relationships、security workflows への embedding へ移っています。

## 5. GitHub 人気 repo & トレンド追跡

### Claude HowTo は Claude Code advanced features を progressive learning path にする

- 出典：GitHub Trending / Claude HowTo
- 日付：2026-06-11
- リンク：https://github.com/luongnv89/claude-howto
- 要約：`luongnv89/claude-howto` は Claude Code 向けの visual tutorial repository で、slash commands、memory、skills、hooks、MCP、subagents、plugins、checkpoints、CLI を扱います。README はこれを feature reference ではなく、Mermaid diagrams、copy-paste templates、10 modules の learning path によって、basic session から agents、hooks、skills、MCP servers を組み合わせる workflow まで進める guide と位置づけます。この popularity は、developer community の需要が「feature があると知る」から「feature を repeatable engineering workflow に組み合わせる」へ移っていることを示します。

### Hivemind は multiple coding agents の work traces を shared memory に統合する

- 出典：GitHub Trending / Hivemind
- 日付：2026-06-11
- リンク：https://github.com/activeloopai/hivemind
- 要約：`activeloopai/hivemind` は “one brain for all your agents” を掲げ、hooks によって Claude Code、OpenClaw、Codex、Cursor、Hermes などの agents から prompt、tool call、response を捕捉し、structured traces として保存します。その後、recurring patterns を reusable `SKILL.md`、retrieval memory、wiki summaries に変換します。README の LoCoMo benchmark では、shared memory によって cost、tokens、turns が減るとされています。Core signal は、agent ecosystem が tool ごとの one-off experience ではなく、cross-tool、searchable、reusable organizational memory を作ろうとしていることです。

## 📬 Newsletter 精選

### Daily Dose of Data Science：code-quality risk と structured-output training

- 出典：Daily Dose of Data Science
- 日付：2026-06-10
- リンク：公開版リンクなし
- 要約：Daily Dose の今号は 2 つの engineering signals を扱います。1 つは、Cursor を導入した 807 GitHub repos を CMU study が matched controls と比較し、first-month code output は増えた一方、static-analysis warnings と code complexity も上がったという点です。もう 1 つは、GRPO で Qwen3-8B に schema-valid JSON を生成させる training example です。前者は agent-written code に deterministic analysis と security checks が必要だと示し、後者は correctness を code で判定できる task なら structured output をより安定した specialized capability に訓練できることを示します。

### Every：Fable 5 をより効果的に使う方法

- 出典：Every
- 日付：2026-06-10
- リンク：https://every.to/context-window/how-to-get-the-most-out-of-fable-5
- 要約：Every の Context Window は、Fable 5 の使い方に注目し、model release の繰り返しに留まりません。Strong model の価値を task boundary、context preparation、async delivery、post-hoc review の中で捉えます。Long-horizon、delegable、verifiable tasks ほど、clear brief と acceptance criteria が必要です。この perspective は Anthropic の capability and safety narrative を補い、everyday engineering team が task assignment をどう設計するかに近い内容です。

### The Rundown AI：Fable、live translation、open-source coding model、farm automation

- 出典：The Rundown AI
- 日付：2026-06-10
- リンク：公開版リンクなし
- 要約：The Rundown AI は、Anthropic Fable、Gemini 3.5 Live Translate、Cohere の North Mini Code、Moonshot の Kimi Work を同じ issue で追っています。また、北海道の農業経営者が ChatGPT と Codex を使い、greenhouse automation、satellite crop tracking、pesticide logs、group-chat bot を構築している story も紹介しています。Frontier models が capability boundary を押し上げる一方で、ordinary users も AI を自分の industry-specific software and automation system に変えていることが見えます。
