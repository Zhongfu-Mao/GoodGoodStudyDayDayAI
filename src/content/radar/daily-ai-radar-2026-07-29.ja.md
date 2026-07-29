---
title: "AIレーダー日報：2026-07-29"
date: 2026-07-29
category: radar
cadence: daily
plainSummary: "今日の主線：agent system は汎用生成能力から、検証可能で統治でき、具体的な workload に最適化された infrastructure へ移っている。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agents
  - Models
  - Open Source
  - GitHub
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-07-29.ja-infographic.webp
representativeImageSource: https://blog.google/innovation-and-ai/technology/developers-tools/expanding-managed-agents-gemini-api-3-6-flash-hooks/
audioUrl: /audio/radar/daily-ai-radar-2026-07-29.ja.mp3
audioDuration: 1016
audioSize: 8125734
draft: false
---

対象期間：2026-07-28 〜 2026-07-29（JST）。今日の変化は単に model が増えたことではない。Agent system は検証可能性、runtime governance、domain workload を中心に再び層分けされ始めた。Scientific software には external benchmark と長期 maintenance responsibility が必要で、managed agent には hooks と budget limit が必要になる。Search system は既存 data asset に応じて LLM の組み込み深度を変え、security model は routing によって日常 task の大半を担う。

---
![Gemini API Managed Agents: 3.6 Flash, hooks, and more](https://storage.googleapis.com/gweb-uniblog-publish-prod/images/unnamed_2_vNnOv20.width-1300.png)

*代表画像は [Gemini API Managed Agents: 3.6 Flash, hooks, and more](https://blog.google/innovation-and-ai/technology/developers-tools/expanding-managed-agents-gemini-api-3-6-flash-hooks/) から。本文で明示的に指定した代表シグナルとして掲載しています。*
## 1. AI Engineering & アーキテクチャ

### Scientific computing の coding agent：実装が速くなるほど verification と stewardship が bottleneck になる

- 出典：OpenAI
- 日付：2026-07-28
- リンク：https://openai.com/index/scientific-computing-agentic-ai
- 要約：OpenAI は life science を中心とする 8 件の agent-assisted scientific computing project をまとめた。5 件は Codex のみ、3 件は Codex と Claude Code を併用し、legacy build system の更新、language migration、GPU-native redesign まで扱う。Agent は境界の明確な実装を高速に進められるが、scientific validity を信頼できる形で判断できない。最も強い acceptance は exact output agreement、既存 tool との parity、統計的挙動、simulated data の既知回答に依存した。実装 cost が下がるほど、researcher の役割は goal definition、task decomposition、verification、stewardship に移る。Upstream coordination と maintenance owner のない rewrite は、次の abandoned software になり得る。

### 3 社の food-search architecture：LLM を runtime のどこまで入れるかは既存 data asset が決める

- 出典：ByteByteGo
- 日付：2026-07-28
- リンク：https://blog.bytebytego.com/p/why-doordash-instacart-and-uber-eats
- 要約：ByteByteGo は DoorDash、Instacart、Uber Eats が LLM を search に組み込んだ異なる経路を比較した。DoorDash は既存 knowledge graph を活かし、LLM に offline で attribute を補わせ、online では query を分解して graph の候補概念から選ばせる。これにより system が知らない label の生成を防ぎ、記事によれば popular-dish carousel の trigger rate は約 30% 上がった。Instacart は「protein」の意味が一般知識と実際の user behavior で違うため proprietary behavior data が必要になり、Uber Eats は別の層で semantic understanding と retrieval を組み合わせた。重要なのは model 名より、taxonomy、behavior data、latency constraint に合わせて batch、query understanding、retrieval、ranking のどこへ LLM を置くかである。

## 2. モデル最前線 & アルゴリズム探索

### Kimi K3：2.8T parameters、104B active の open-weight multimodal agent model

- 出典：Moonshot AI
- 日付：2026-07-28
- リンク：https://huggingface.co/moonshotai/Kimi-K3
- 要約：Moonshot は Kimi K3 の weights と technical material を公開した。2.8T-parameter MoE で、各 token は 104B parameters と 16/896 experts を active にし、Kimi Delta Attention、Attention Residuals、Stable LatentMoE を採用する。Text、image、約 100 万 token context に対応し、長時間 coding、tool orchestration、end-to-end knowledge work を狙う。Attention kernels と一部 agent infrastructure も公開された。Open weights は frontier に近づいたが、downloadable は easy-to-deploy を意味しない。2.8T total parameters には重い inference infrastructure が必要で、official benchmark、license、serving cost の独立検証も欠かせない。

### MAI-Cyber-1-Flash：専用 security model が通常 task の 90% を処理し、難問を routing する

- 出典：The Rundown AI
- 日付：2026-07-28
- リンク：https://www.therundown.ai/p/moonshot-lets-history-largest-open-model-loose
- 要約：Microsoft は MAI-Cyber-1-Flash を code-heavy な compact security model と位置づけ、100 超の agents を持つ MDASH vulnerability discovery and remediation system に統合した。Routing は最大 90% の task を同 model に任せ、約 10% の難しい task を高価な model に渡す。Microsoft は統合 system が CyberGym で 96%、Mythos より 12 points 高く、従来の最良 MDASH 構成より cost を 50% 削減したとする。Vendor evaluation ではあるが、domain agent の競争単位が単独 model ではなく、specialized model、historical security data、expert-tuned harness、sandbox、audit control の組み合わせであることを示す。

## 3. 実践コード & ツールライブラリ

### Gemini API Managed Agents：hooks、token budget、scheduled trigger が managed runtime に入る

- 出典：Google DeepMind
- 日付：2026-07-28
- リンク：https://blog.google/innovation-and-ai/technology/developers-tools/expanding-managed-agents-gemini-api-3-6-flash-hooks/
- 要約：Gemini Interactions API の Managed Agents は Gemini 3.6 Flash を default にし、environment hooks、model selection、free tier、total-token budget、scheduled trigger を追加した。`.agents/hooks.json` は tool call の前後で command または HTTP handler を実行し、危険な write の deny、automatic lint、audit、image verification に使える。`max_total_tokens` に達すると task は incomplete として安全に止まり、environment は追加 budget で続行できる。Scheduled trigger は agent、sandbox、prompt、cron を persistent resource に束ねる。Managed agent は cloud loop から、policy insertion、cost guardrail、lifecycle management を備えた runtime に変わりつつある。

### ChatGPT Work と Codex：harness は共有しても knowledge work には別の artifact と default permission が要る

- 出典：Latent.Space
- 日付：2026-07-28
- リンク：https://www.latent.space/p/chatgpt-work
- 要約：Latent.Space は OpenAI core product engineering lead の Akshay Nathan に、Codex と ChatGPT Work が共有する agent harness と、knowledge-work 側で異なる UX、Git visibility、artifact、sandbox default を聞いた。記事では両者が合計 1,000 万 users に達し、Codex の knowledge worker は約 20% で developer より速く増えている。Non-engineer が委任する対象は repository だけでなく、documents、spreadsheets、slides、Sites、Slack、long-term memory に広がる。Code generation は基盤能力にすぎず、persistent computer、subagents、plugins、approval boundary を理解できる interface にまとめ、commits や tokens ではなく final artifact quality で成果を測ることが product の中心課題になる。

## 4. 業界 & ビジネス速報

### 継続追跡｜Anthropic：open weights の一律禁止に反対し、chips、distillation、共通 safety test を重視

- 出典：Anthropic
- 日付：2026-07-28
- リンク：https://www.anthropic.com/news/position-open-weights-models
- 要約：Open-weight letter と Kimi K3 を巡る議論を受け、Dario Amodei は Anthropic が open-weight model を category として禁止するよう主張したことはないと明言した。Dangerous capability を持たない open model は businesses、developers、researchers に公共的価値を持つと認めつつ、policy focus を advanced chips の流出防止、industrial-scale distillation の抑止、十分に強い open / closed model への mandatory safety test に置く。一方で「openness は必ず defense を強める」という前提には同意せず、bio と cyber には attacker-defender asymmetry があり得るとする。論点は open versus closed から capability threshold、supply chain、verifiable risk control へ移った。

### Cursor Start：India-local pricing は model mix を cost-control instrument に変える

- 出典：TechCrunch
- 日付：2026-07-27
- リンク：https://techcrunch.com/2026/07/27/cursor-makes-its-biggest-india-push-yet-ahead-of-spacex-acquisition-with-localized-pricing/
- 要約：Cursor は India で月額 ₹649、約 7 ドルの Start plan を開始した。20 ドルの Pro より安く、local currency と UPI に対応する。Composer 2.5、Grok 4.5、cloud agents、MCP、hooks、skills は含むが、OpenAI / Anthropic frontier models、Bugbot、Automations、SDK は含まない。Cursor によると India はすでに第 3 位の market で、users は 1 年で 3 倍超に増えた。Low-price plan が持続可能なのは third-party frontier API より自社 model を中心にするためでもある。AI coding の地域展開では、「どの model を含めるか」が機能表ではなく pricing、margin、market-entry strategy になっている。

## 5. GitHub 人気 repo & トレンド追跡

### ECC：agent coding workflow を cross-harness engineering system として配布

- 出典：GitHub Trending / affaan-m
- 日付：2026-07-29
- リンク：https://github.com/affaan-m/ECC
- 要約：ECC は今日 GitHub Trending で約 636 stars を獲得し、累計 23 万超となった。Plan、test、implement、review、verify、memory、continuous improvement を installable な agent engineering system にまとめ、67 agents、281 skills、94 compatibility commands、hooks、rules、memory、AgentShield scanning を含む。Claude Code、Codex、Cursor、OpenCode、Gemini などに対応する一方、同じ harness に複数 install path を重ねないよう明確に警告する。高い伸びは、team が one-off prompt ではなく、workflow persistence、context control、cross-tool portability を担う operation layer を求めていることを示す。

### speech-to-speech：OpenAI Realtime-compatible protocol で local voice agent を組み立てる

- 出典：GitHub Trending / Hugging Face
- 日付：2026-07-29
- リンク：https://github.com/huggingface/speech-to-speech
- 要約：Hugging Face の speech-to-speech は今日約 227 stars、累計 7,300 超を獲得した。VAD → STT → LLM → TTS の 4-stage pipeline で low-latency voice agent を構築し、各 stage を交換可能にして OpenAI Realtime-compatible WebSocket API で公開する。Default は Silero VAD、Parakeet TDT、OpenAI-compatible LLM、Qwen3-TTS で、vLLM、llama.cpp、Transformers、Apple Silicon の MLX path にも対応する。数千台の Reachy Mini robots の conversation backend として production 利用されている。Common protocol によって hosted と fully local deployment を同じ client contract に置き、voice agent の model / hardware migration cost を下げる。

## 📬 Newsletter 精選

### Every：Opus 5 を扱う鍵は complete brief、clear finish line、artifact review

- 出典：Every
- 日付：2026-07-29
- リンク：https://every.to/context-window/taming-opus-5
- 要約：Every team は Claude Opus 5 の追加テストで、interaction が冗長で管理しにくく、ときに judgmental tone を示す一方、最初に全材料と completion condition を渡し、独立して batch work をさせ、最後に artifact だけを評価すると結果が改善することを見いだした。旧 model 向け agent instructions の audit も勧める。古い scaffold が新 model の妨げになる可能性があり、output style は説明を短くできても file overwrite permission や fact-check の代わりにはならない。より強い long-task model は frequent micromanagement に向くとは限らず、interface は逐次 chat から task contract、blocking question、deliverable acceptance へ移る必要がある。

### Daily Dose：追加 LLM なしで 8 万件の agent trajectory から review-worthy sample を選ぶ

- 出典：Daily Dose of Data Science
- 日付：2026-07-29
- リンク：https://arxiv.org/abs/2604.00356
- 要約：Daily Dose は deterministic signal による agent-trajectory triage を紹介した。Interaction layer は user rephrase、correction、agent repetition、abandonment、success confirmation を検出し、execution layer は進展しない tool call と loop、environment layer は rate limit や context overflow などの exhaustion を記録する。論文の τ-bench 100-sample annotation では signal-based sampling の informativeness は 82% で、length filtering の 74%、random sampling の 54% を上回り、informative trajectory 当たりの efficiency は 1.52 倍になった。Online behavior を変えず evaluator model も不要なため、continuous human-review queue と post-training data の構築に向く。
