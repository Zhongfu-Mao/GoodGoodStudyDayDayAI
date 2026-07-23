---
title: "AIレーダー日報：2026-07-23"
date: 2026-07-23
category: radar
cadence: daily
plainSummary: "今日の主線：agent は単発の model call から、controlled context、specialized model、shared workspace、enterprise governance へ移っている。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agents
  - Models
  - Security
  - GitHub
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-07-23.ja-infographic.webp
audioUrl: /audio/radar/daily-ai-radar-2026-07-23.ja.mp3
audioDuration: 1210
audioSize: 9679497
draft: false
---

対象期間：2026-07-22 から 2026-07-23（JST）。今日の焦点は単一 model の飛躍ではない。agent system が production に入ると、model capability、context boundary、identity permission、evaluation、security、organizational workflow が同時に usability を決める。

## 1. AI Engineering & アーキテクチャ

### ByteByteGo：production-grade agent の核心は model を deterministic system に入れること

- 出典：ByteByteGo
- 日付：2026-07-22
- リンク：https://blog.bytebytego.com/p/best-practices-for-building-ai-agents
- 要約：ByteByteGo は production-grade agent を software engineering problem に戻している。context は system が保持し、model は明確な判断点でだけ呼び出す。loop には deterministic boundary と hard stop が必要で、state は長期的に prompt の中へ隠すべきではない。multi-agent も自由に会話する assistant 群ではなく、orchestrator と短命な sub-task として扱う。主眼は unpredictability を下げることにある。permission、state、cost、failure path、human handoff を system design に入れ、強い model がすべての process problem を自動解決するとは考えない。

### Latent.Space：AI cybersecurity は単発の vulnerability から evaluation、specialized model、防御 pipeline へ広がる

- 出典：Latent.Space / AINews
- 日付：2026-07-22
- リンク：https://www.latent.space/p/ainews-ai-cybersecurity-becomes-top
- 要約：Latent.Space は今週の cyber 関連ニュースを一つの枠組みで整理した。evaluation environment security、security task 向け specialized model、automated repair tool、防御側 guardrail が同時に重要になっている。記事は Sakana、Google Cyber、CodeMender などの方向を挙げ、AI security が model refusal や red-team prompt だけでは済まなくなったことを示す。eval isolation、tool permission、vulnerability reproduction、code repair、enterprise defense workflow まで含めて設計する必要がある。engineering team にとって security test platform 自体も high-permission system として扱うべき対象になる。

## 2. モデル最前線 & アルゴリズム探索

### Google：Gemini 3.6 Flash は agent model competition を cost、speed、specialization へ戻す

- 出典：Google
- 日付：2026-07-21
- リンク：https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-6-flash-3-5-flash-lite-3-5-flash-cyber/
- 要約：Google は Gemini 3.6 Flash、3.5 Flash-Lite、3.5 Flash Cyber を発表した。3.6 Flash は capability を保ちながら output token を減らすことを強調し、DeepSWE、MLE Bench、OSWorld-Verified、GDPval-AA v2 などの改善を示した。3.5 Flash-Lite は高い output speed と低価格を重視し、3.5 Flash Cyber は CodeMender などの security use case 向けで、まず government と trusted partner に提供される。この組み合わせは、frontier model competition が「最強の一つの汎用 model」から、latency、price、coding ability、security specialization の product matrix へ分化していることを示す。

### Poolside：Laguna S 2.1 は open weights で long-horizon agentic coding に挑む

- 出典：Poolside
- 日付：2026-07-21
- リンク：https://poolside.ai/blog/introducing-laguna-s-2-1
- 要約：Poolside は Laguna S 2.1 を公開した。これは 118B total parameters、per-token active 8B parameters、1M context を持つ MoE coding model だ。公式の Terminal-Bench 2.1、SWE-Bench Multilingual、SWE-Bench Pro、DeepSWE などの結果は long-horizon agentic coding を意識している。BF16、FP8、INT4、NVFP4、GGUF、MLX、vLLM、SGLang、Ollama などの deployment path も用意されている。重要なのは benchmark だけではない。open weights coding model を long context、deployability、reproducible trajectories へ押し出している点だ。

## 3. 実践コード & ツールライブラリ

### OpenAI Presence：enterprise voice / chat agent は policy、evaluation、handoff rule と結びつく

- 出典：OpenAI
- 日付：2026-07-22
- リンク：https://openai.com/index/introducing-openai-presence/
- 要約：OpenAI は enterprise 向けに trusted voice and chat agents を展開する Presence を発表した。製品は company knowledge、system access、approved action、policy、guardrails、simulation、evaluation、human handoff rule を組み合わせ、launch 後の session、escalation、quality signal を Codex-powered improvement process で扱う。Presence は OpenAI の English phone support に使われ、BBVA、SoftBank、IAG などの enterprise scenario にも進んでいる。変化の核心は、enterprise agent の価値が「会話できる」ことではなく、controlled permission と testable workflow の中で real task を実行できることに移っている点だ。

### Block Buzz：team collaboration tool は agent を identity を持つ working member として扱い始める

- 出典：Block
- 日付：2026-07-21
- リンク：https://block.xyz/inside/introducing-buzz-where-humans-and-agents-work-together
- 要約：Block は open-source collaboration platform Buzz を公開した。Buzz は humans and agents shared workspace を掲げ、Nostr protocol 上で channels、threads、direct messages、voice、media sharing、code repositories、automated workflows を提供する。agent は cryptographic identity、permission、portable history を持ち、同じ workspace で投稿、code review、approved automation、discussion participation を行える。agent infrastructure は「chat window の assistant」から、「organization collaboration system の verifiable participant」へ進んでいる。

### Daily Dose：RAG agent の危険地帯は no answer ではなく partial hit 後の over-answering

- 出典：Daily Dose of Data Science
- 日付：2026-07-22
- リンク：https://blog.dailydoseofds.com/p/karpathy-said-something-youll-regret
- 要約：Daily Dose は Karpathy の agentic engineering に関する指摘を踏まえ、RAG agent の evaluation case を示した。document が question の一部だけをカバーしていると、model は限定的な evidence から full answer を作ってしまいやすい。記事では Google Agents CLI で `corpus_abstention` rubric を作り、回答を grounded answer、correct abstention、ungrounded answer、mixed leakage、wrong abstention などに分類した。33 scenarios では、制約後に 19/33 から 30/33 へ改善し、ungrounded answer は 6 回から 0 回になった。RAG evaluation では「知らない」と「一部だけ知っている」を分けて扱う必要がある。

## 4. 業界 & ビジネス速報

### NTT DATA：Codex は日本の大手 IT services company で 9,000 人規模の organization adoption に入る

- 出典：OpenAI
- 日付：2026-07-22
- リンク：https://openai.com/index/ntt-data/
- 要約：OpenAI は NTT DATA Group の enterprise adoption case を紹介した。同社は ChatGPT Enterprise を基盤に、Codex を約 9,000 名の employees へ広げている。初期の成功例は critical system の complex incident analysis で、以前は 5 名の senior engineers が 3 日かけていた作業を、Codex により 30 分で完了した。NTT DATA は data、system connection、network traffic、sandbox mode、automation level、human review に関する security guideline も整備した。coding agent の enterprise landing は code writing を超え、file organization、Excel data processing、internal system operation、reusable Skills に広がっている。

### The Rundown AI：Anthropic copyright settlement は training data compliance に price anchor を与える

- 出典：The Rundown AI
- 日付：2026-07-22
- リンク：https://www.therundown.ai/p/google-gemini-lineup-has-a-pro-sized-hole
- 要約：The Rundown AI は、Anthropic と book authors group が 15 億ドル規模の copyright settlement に達し、約 48.2 万作品を対象に一作品あたり約 3,000 ドルになると報じた。報道では、以前の fair use 判断が完全に覆ったわけではなく、争点は pirated source data の保持に集中していると説明している。model company にとって training corpus は technical problem だけではなく、contract、source proof、deletion process、auditable record の問題になる。publishing industry にとっても、交渉時に参照できる price range が生まれた。

## 5. GitHub 人気 repo & トレンド追跡

### Kronos：financial K-line にも specialized foundation model が現れた

- 出典：GitHub Trending / shiyu-coder
- 日付：2026-07-23
- リンク：https://github.com/shiyu-coder/Kronos
- 要約：Kronos は financial candlesticks / K-lines 向けの open-source foundation model で、45 を超える global exchanges の data で訓練されている。project は specialized tokenizer で OHLCV などの continuous multi-dimensional market data を hierarchical discrete tokens に量子化し、decoder-only Transformer で autoregressive modeling を行う。mini、small、base などの model と Hugging Face weights も提供されている。time-series model は generic forecasting framework から、domain structure を強く持つ方向へ進んでいる。financial market は普通の table ではなく、tokenization、context length、backtesting、risk constraint を持つ独自の language として扱われ始めている。

### pi-web：coding agent の local session を browser workspace に移す

- 出典：GitHub Trending / agegr
- 日付：2026-07-23
- リンク：https://github.com/agegr/pi-web
- 要約：pi-web は pi coding agent の local Web UI で、local pi session files を読み、session browsing、real-time chat、model configuration、skill management、project file preview、Git worktree switching を提供する。同じ CLI session を browser 上で structured tool calls、Markdown、context usage、cost、system prompt information として確認できる。coding agent tool の自然な進化を示している。command line は execution を担い続けるが、long-running session、branch exploration、file viewing、configuration management は、後から見返しやすい workspace へ移っていく。

### awesome-claude-skills：Skills は Claude ecosystem から general agent workflow format へ広がる

- 出典：GitHub Trending / ComposioHQ
- 日付：2026-07-23
- リンク：https://github.com/ComposioHQ/awesome-claude-skills
- 要約：awesome-claude-skills は Claude Skills、resources、tools を広くまとめる repository で、document processing、code development、data analysis、business marketing、collaboration、system security、app automation まで扱う。project は Skills を Claude.ai の customization package だけでなく、Claude Code、Codex、Cursor、Gemini CLI、Antigravity、Windsurf などの agent が使える reusable workflow instruction package として説明している。MCP が external system connection を担い、tools が concrete action を担うなら、Skills は organization が process、rules、output format を蓄積する lightweight layer になる。

## 📬 Newsletter 精選

### Every：product team は AI で large launch を進め、organizational workflow が productivity の中心になる

- 出典：Every
- 日付：2026-07-22
- リンク：https://every.to/context-window/how-every-s-team-used-ai-to-ship-its-biggest-launch-ever
- 要約：Every は、team が AI を使って大きな product launch を支えた方法を紹介し、Codex playbook、model selection、token cost、team collaboration の具体的な進め方に焦点を当てている。この視点は、今日の agent infrastructure 関連ニュースを補完する。効率は一人が chat window を増やすことではなく、planning、implementation、review、release、reflection を repeatable AI workflow に組み込むことで生まれる。

### AI Valley：Claude Cowork、Qwen-Image-3、Block Buzz は agent UX をさらに外側へ広げる

- 出典：AI Valley
- 日付：2026-07-22
- リンク：https://www.theaivalley.com/p/openai-says-its-ai-went-rogue
- 要約：AI Valley の当日整理には、Claude Cowork、Qwen-Image-3、Block Buzz などの tool news が並んだ。方向性は共通している。agent は IDE や dialog box の中だけに存在しなくなる。user operation を観察し、より複雑な image content を生成し、team collaboration space に入り、independent identity を持って workflow に参加する。product design にとって agent UX の問題は、「入口はどこか」から「permission、identity、memory、collaboration boundary、user trust をどう維持するか」へ移る。
