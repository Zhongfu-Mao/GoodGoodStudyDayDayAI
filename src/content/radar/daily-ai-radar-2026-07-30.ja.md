---
title: "AIレーダー日報：2026-07-30"
date: 2026-07-30
category: radar
cadence: daily
plainSummary: "今日の主線：model の score、cost、risk は harness、inference infrastructure、監査可能な workflow に強く左右される。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agents
  - Models
  - Open Source
  - GitHub
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-07-30.ja-infographic.webp
representativeImageSource: https://blog.bytebytego.com/p/how-chatgpt-optimizes-its-agent-loop
audioUrl: /audio/radar/daily-ai-radar-2026-07-30.ja.mp3
audioDuration: 1005
audioSize: 8041515
draft: false
---

対象期間：2026-07-29 〜 2026-07-30（JST）。今日の重要な変化は、単一 model が leaderboard を更新したことではない。Model 外側の system layer が実結果を決め始めている。同じ model でも reasoning state と compaction の設定で score は約 3 倍変わり、kernel と speculative decoding で inference cost は下がる。Code review と cryptanalysis には専用 context、verification workflow、人間の責任境界が必要になる。

---
![How ChatGPT Optimizes its Agent Loop: Harness, API, and Inference](https://substackcdn.com/image/fetch/$s_!VkzQ!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa4314ac2-a739-4ae7-ab1d-2bc1bae512db_1695x2048.png)

*代表画像は [How ChatGPT Optimizes its Agent Loop: Harness, API, and Inference](https://blog.bytebytego.com/p/how-chatgpt-optimizes-its-agent-loop) から。本文で明示的に指定した代表シグナルとして掲載しています。*
## 1. AI Engineering & アーキテクチャ

### ChatGPT agent loop の 3 層最適化：harness、API、inference を一体で設計する

- 出典：ByteByteGo
- 日付：2026-07-29
- リンク：https://blog.bytebytego.com/p/how-chatgpt-optimizes-its-agent-loop
- 要約：ByteByteGo は ChatGPT agent loop の効率を 3 層に分けた。Harness は persistent WebSocket、stable prompt prefix、deferred tool discovery、Code Mode で round trip と context expansion を減らす。API は追加分だけを incremental tokenization し、safety checks を並列化する。Inference は cache-aware routing、KV-cache management、speculative decoding、prefill / decode separation を使う。重要なのは 1 層の局所最適化ではない。Prefix の再利用性を保ち、対応 cache を持つ worker に request を送り、model、protocol、server scheduling を協調させることである。

### ARC-AGI-3 の約 3 倍差：benchmark は model と harness を同時に測っている

- 出典：OpenAI
- 日付：2026-07-29
- リンク：https://openai.com/index/how-two-settings-tripled-our-arc-agi-3-scores
- 要約：OpenAI は GPT-5.6 Sol の ARC-AGI-3 public set を再検証した。Generic agent harness は 13.3% RHAE だったが、reasoning state を保持し compaction を有効にすると 38.3% へ上がり、output tokens は約 6 分の 1 になった。元の設定は action ごとに private reasoning を捨て、history を rolling truncation していた。Responses API の previous response ID と compaction が長い sequence の重要 context を維持した。推定 human average の 48% には届かないが、agent benchmark は state management、history truncation、tools、token budget を公開しなければ weight 単体の score と解釈できない。

## 2. モデル最前線 & アルゴリズム探索

### GPT-5.6 の efficiency stack：model が自分の production serving を最適化する

- 出典：OpenAI
- 日付：2026-07-29
- リンク：https://openai.com/index/gpt-5-6-frontier-intelligence-efficiency
- 要約：OpenAI は GPT-5.6 の効率向上を model、inference、harness の共同最適化として説明した。Sol は routing、load balancing、GPU kernel、forward pass の分析に使われ、kernel 改善は end-to-end serving cost を約 20% 減らしたという。改良した draft / speculator model は token-generation efficiency を 15% 超高め、FpSan などで numerical correctness を検証した。Sol max が AA Coding Agent Index で Claude Fable 5 を半分未満の cost で上回るという数字は vendor benchmark として独立検証が必要だが、frontier model を自身の inference infrastructure 改善へ投入する経路は定量化され始めた。

### Claude Mythos Preview が HAWK と reduced-round AES の新しい attack を発見

- 出典：Anthropic
- 日付：2026-07-29
- リンク：https://www.anthropic.com/research/discovering-cryptographic-weaknesses
- 要約：Anthropic は Claude Mythos Preview が約 60 時間の semi-autonomous research で、post-quantum signature 候補 HAWK の新しい lattice symmetry を見つけたと報告した。HAWK-256 の想定 key-recovery cost は 2^64 から実演可能な 2^38 へ下がった。別の autonomous scaffold は 7-round AES-128 に対する既存 attack を 200〜800 倍高速化した。各結果の API cost は約 10 万ドルで、cryptography researchers による検証と coordinated disclosure を経た。HAWK は未配備で full AES-128 も破られておらず production impact はない。信号は、frontier model が algorithm-level research に参加できても sandbox、literature、compute tools、responsible disclosure、expert verification が不可欠な点にある。

## 3. 実践コード & ツールライブラリ

### 6 種類の LLM deployment format：portability を保ち、latency budget が必要とするときだけ下層へ

- 出典：Daily Dose of Data Science
- 日付：2026-07-29
- リンク：https://blog.dailydoseofds.com/p/6-llm-deployment-formats-in-production
- 要約：記事は raw weights、GGUF、ONNX、MLX、TensorRT などの deployment layer を比較した。safetensors は training framework の汎用 weights、GGUF は llama.cpp / Ollama の single-file local deployment、ONNX は hardware に応じた runtime execution、MLX は Apple unified memory、TensorRT は特定 NVIDIA GPU 向けに compile した engine に適する。Lower layer ほど常に良いわけではない。Throughput と latency の改善と引き換えに portability を失い、compile と maintenance cost が増える。安全な default は latency SLO を満たす最も高い layer に留まり、measurement が必要性を示した場合だけ下へ進むことだ。

### Codex Security CLI：vulnerability discovery、validation、fix を local / CI へ

- 出典：OpenAI / GitHub
- 日付：2026-07-29
- リンク：https://github.com/openai/codex-security
- 要約：OpenAI は `@openai/codex-security` CLI と TypeScript SDK を公開した。Repository scan、security finding の検証、複数 run 間の tracking、fix 支援を行い、API key で CI にも組み込める。Quick path は install 後の `scan .` で、GPT-5.6 Terra と reasoning effort も指定できる。Node.js 22.13+ / 24.x / 26.x、Python 3.10+、Codex Security access が必要だ。Agentic security review を scriptable pipeline へ持ち込む一方、scan permission、secret exposure、false-positive handling、automatic fix の merge gate は repository policy で制御すべきである。

## 4. 業界 & ビジネス速報

### Pacing the Frontier：frontier lab の従業員が「制御可能な減速」機構を求める

- 出典：Pacing the Frontier / The Rundown AI
- 日付：2026-07-29
- リンク：https://www.pacingthefrontier.com/
- 要約：OpenAI、Anthropic、Google、Meta などの 1,000 人超が共同声明に署名し、autonomous AI R&D が制御不能な速さへ進む場合に、国際社会が意図的に開発を遅らせられる technical / governance mechanism を事前に作るよう求めた。即時 pause を要求する文書ではなく、monitoring、threshold、coordination、verifiable execution を準備する提案で、OpenAI と Anthropic も支持した。議論は「加速か停止か」から、誰が threshold crossing を判断するか、複数主体がどう同時に動くか、企業の自主宣言に依存せず減速をどう検証するかへ移る。

### AI が financial services へ：provenance、simulation、skill governance が production の条件

- 出典：Latent.Space
- 日付：2026-07-29
- リンク：https://www.latent.space/p/ainews-ai-is-eating-finance-aie-nyc
- 要約：Latent.Space は金融機関の agent deployment lessons をまとめた。FactSet は AI skills に ownership、search、evals、audits、governance が必要だとし、Nubank は simulation を agent evaluation と release mechanism に使う。Kepler は financial research answer に provenance、reconciliation、review を要求し、Morgan Stanley や Fidelity の例は trusted experiment environment、memory、permissions、prompt-injection defense に焦点を置く。共通の moat は memo generation ではなく、data、action、historical state、uncertainty を追跡可能にし、人間が final financial truth に責任を持てることだ。

### UAE court が AI platform を導入：文書は生成しても judgment は裁判官に残す

- 出典：The Rundown AI
- 日付：2026-07-29
- リンク：https://www.therundown.ai/p/1000-frontier-staffers-ask-for-an-ai-brake-pedal
- 要約：The Rundown は UAE が 9 月から 18 カ月かけて court AI platform を配備すると報じた。System は case files を読み、関連法と precedents を検索し、documents と legal analysis を作る。Staff が内容を検証し、最終 ruling は judge が行う。Agent を司法裁量の代替ではなく、高リスクの administrative / research layer に置く構成である。今後見るべき指標は error correction path、evidence provenance の可視性、appeal right、model / data audit、language と case type ごとの bias になる。

## 5. GitHub 人気 repo & トレンド追跡

### jcode：Rust と memory graph で coding-agent の local resource usage を抑える

- 出典：GitHub Trending / 1jehuang
- 日付：2026-07-30
- リンク：https://github.com/1jehuang/jcode
- 要約：jcode は GitHub Trending で当日約 640 stars を獲得し、累計 1.35 万超となった。Rust 製 coding-agent harness で、memory graph による semantic recall を備える。README の自己測定では local embedding mode が 1 session で約 27.8 MB PSS、10 sessions で約 117 MB、Codex CLI は約 140 MB / 334.8 MB、time-to-first-frame は約 14 ms とされる。特定環境の project-reported benchmark であり一般化はできないが、agent が常駐、並列化、memory accumulation するほど、harness の memory curve と startup latency が product capability の一部になる方向を示す。

### FlashKDA：Kimi Delta Attention の高性能 kernel を CUTLASS へ

- 出典：GitHub Trending / Moonshot AI
- 日付：2026-07-30
- リンク：https://github.com/MoonshotAI/FlashKDA
- 要約：FlashKDA は Kimi Delta Attention の CUTLASS CUDA kernels と、PyTorch / FLA backend integration、correctness tests を提供する。現時点で CUDA 12.9+、SM90+ GPU、PyTorch 2.4+ が必要で、一般的な local device ではなく Hopper-class production inference を対象にする。GitHub Trending では当日約 91 stars を獲得した。Linear-attention variant を採用する team にとって paper operator を検証可能な kernel へ移す参考になる一方、architecture の利得は実際の GPU、sequence length、batch、numerical tolerance ごとに benchmark し直す必要がある。

## 📬 Newsletter 精選

### Every：Slack thread を再開可能な Claude Code session にする

- 出典：Every
- 日付：2026-07-29
- リンク：https://every.to/context-window/what-if-slack-was-your-ai-command-center
- 要約：Every は Slack-first の agent workflow を示した。各 project は 1 channel に対応し、top-level post が新しい Claude Code session を始め、thread reply が同じ session を再開する。Thread は task、context、collaboration log を同時に担う。Agent は screenshot を thread に返して review を求められ、channel ごとに model を割り当て、unread flag を notification として使える。Permissions、concurrent conflict、long-term memory は残るが、既存 communication surface を agent control plane にすると IDE、terminal、collaboration tool 間の切り替えを減らせる。

### DeepLearning.AI：code-review agent は risk triage 後に specialized reviewer を呼ぶ

- 出典：DeepLearning.AI
- 日付：2026-07-29
- リンク：https://www.deeplearning.ai/short-courses/ai-code-review/
- 要約：DeepLearning.AI と Qodo の AI Code Review short course は reviewer を PR 作成前に置き、task context と repository context を重視する。Chunking、embeddings、vector search で context engine を作り、risk triage 後に security、codebase pattern などを specialized agents へ振り分け、1 つの general model に全観点を任せない。Comment generation より重要なのは author agent から独立した second judgment chain を作る点だが、rule priority、false positive handling、merge responsibility は最終的に team が定義しなければならない。
