---
title: "AIレーダー日報：2026-08-02"
date: 2026-08-02
category: radar
cadence: daily
plainSummary: "今日の主線：AI capability は auditable trace、formal verification、model specialization、real-world action を通じ、deliverable かつ governable な system outcome に再構成されている。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agents
  - Models
  - Evaluation
  - GitHub
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-08-02.ja-infographic.webp
representativeImageSource: https://github.com/microsoft/TRELLIS.2
audioUrl: /audio/radar/daily-ai-radar-2026-08-02.ja.mp3
audioDuration: 929
audioSize: 7434430
draft: false
---

対象期間：2026-07-31〜2026-08-02（JST）。今日の signal が示すのは、AI の次段階が model の capability だけでは決まらないということだ。最も価値のある failure を発見し、reasoning result を検証し、異なる capability を適切な model に routing し、calendar、transaction、code、real-world service に触れるときの accountability boundary を残せる system が重要になる。

---
![GitHub - microsoft/TRELLIS.2: Native and Compact Structured Latents for 3D Generation](https://opengraph.githubassets.com/124d889481220009fa5d60df83ad835d9ba75f2eaa88b971bc534c4da8262a4b/microsoft/TRELLIS.2)

*代表画像は [GitHub - microsoft/TRELLIS.2: Native and Compact Structured Latents for 3D Generation](https://github.com/microsoft/TRELLIS.2) から。本文で明示的に指定した代表シグナルとして掲載しています。*
## 1. AI Engineering & アーキテクチャ

### LLM なしで agent traces を選別：behavioral signals で useful review sample rate は 82%へ

- 出典：Daily Dose of Data Science
- 日付：2026-07-28
- リンク：https://blog.dailydoseofds.com/p/serverless-vs-on-prem-vs-edge-deployment
- 要約：8 万件の production agent trajectories から human review 対象を選ぶ方法として、user rephrase、correction、abandonment、success confirmation、tool call が task を進めたか、同じ呼び出しを繰り返したか、rate limit や context overflow などを deterministic scoring する。100 件の τ-bench trajectories では informative rate 82%と報告され、conversation length heuristic の 74%、random sampling の 54%を上回った。Task が成功した会話でも policy violation、inefficient call、unnecessary step を見つけられる。Article が引用する実験だが、cheap always-on sampling layer を先に置き、costly human / model evaluation を high-signal samples に集中させる設計は汎用的である。

### Cambodia scam network を遮断：AI abuse defense は単発 prompt ではなく cross-platform signals が必要

- 出典：OpenAI
- 日付：2026-07-31
- リンク：https://openai.com/index/disrupting-malicious-uses-of-ai-criminal-scam-operation
- 要約：OpenAI は WhatsApp からの lead を起点に、Cambodia を拠点とする scam network を特定し遮断したと公表した。Accounts は romance、investment、gambling、law-enforcement impersonation の scripts、fake identities、forged documents を生成し、translation、recruiting、internal administration にも model を利用していた。Individual content は普通に見えても、risk は account cluster、複数 scam types にまたがる repeated behavior、external-platform evidence に現れる。Vendor disclosure だけでは被害規模を確定できないが、identity graph、behavior sequence、partner threat signals、rapid suspension、law-enforcement evidence sharing を組み合わせ、coerced participants を victim として扱う視点も必要だと分かる。

## 2. モデル最前線 & アルゴリズム探索

### Astra が数学・理論計算機科学の十成果を提示し、Lean certificate で discovery と verification を接続

- 出典：OpenAI
- 日付：2026-08-01
- リンク：https://openai.com/index/ten-advances-in-mathematics
- 要約：OpenAI は internal model Astra が high-dimensional sphere packing、coding theory、non-sofic groups、arithmetic circuit complexity、quantum complexity、lattice cryptography など十の長期問題に新しい結果を出したと発表した。Search に必要な token cost は Sol API price で約 2,000 ドル、結果は human と model が manuscript に整理し、model が各 argument の Lean certificate を作成したという。Mathematics community の個別 review は不可欠だが、conjecture / proof generation → human editing → formal verification という chain は scientific AI を plausible answer から inspectable evidence へ進め、compute cost、readability、formal coverage を同じ評価面に置く。

### AI Mode が answer から real-world action へ：Calendar、在庫確認電話、Canvas、ticketing を一つの Search UI に統合

- 出典：Google
- 日付：2026-07-28
- リンク：https://blog.google/products-and-platforms/products/search/ai-mode-real-world-tips/
- 要約：Google は AI Mode が user opt-in のもと Calendar を参照して lesson を提案し、budget と local stock から gear を探し、店舗に電話して在庫を確認し、Canvas で strategy guide や simulated game を作り、event ticket を検索・予約する例を示した。Independent benchmark ではなく product examples だが、boundary shift は明確だ。Model output は summary に留まらず personal context を読み、services を呼び、transaction を前に進める。Consent、data minimization、price / inventory freshness、final confirmation、reversibility を action layer の default constraint にする必要がある。

## 3. 実践コード & ツールライブラリ

### AI-For-Beginners：12週間24 lessons で symbolic AI、neural networks、ethics、labs を統合

- 出典：GitHub Trending / AI-For-Beginners contributors
- 日付：2026-08-02
- リンク：https://github.com/microsoft/AI-For-Beginners
- 要約：AI-For-Beginners は 12週間・24 lessons の open curriculum で、knowledge representation / reasoning、neural networks、computer vision、text processing、genetic algorithms、multi-agent systems、AI ethics を扱い、quiz、lab、TensorFlow / PyTorch examples、50超の language translations を備える。GitHub Trending では当日約 949 stars、累計約 5.74万 stars。Latest-model quick guide ではなく symbolic AI、optimization、responsible AI を残す foundation path であり、team onboarding では散発的な prompt tips より shared vocabulary と measurable learning progress を作りやすい。

### AI 時代の三つの新習慣：task delivery から leverage、public learning、long-term relationship へ

- 出典：Every
- 日付：2026-07-28
- リンク：https://every.to/p/three-new-habits-for-the-age-of-ai
- 要約：Every の著者は corporate job を離れ AI / product-design business を始めた経験から、busyness と one-off delivery を progress とみなす習慣を手放したと述べる。代わりに reusable workflow を構築し、学びを公開して feedback loop を作り、clients / collaborators との relationship を長期資産として育てる。Controlled study ではなく practitioner reflection だが、agent が one-off output の marginal cost を下げるほど、problem selection、reusable system、taste、trust、outcome ownership が scarce capability になるという指摘は実践的である。

## 4. 業界 & ビジネス速報

### EU AI Act が次段階へ：general-purpose model governance は transparency、safety、provenance に具体化

- 出典：OpenAI
- 日付：2026-07-31
- リンク：https://openai.com/index/advancing-responsible-ai-across-europe
- 要約：OpenAI は EU の GPAI Code of Practice と AI-generated content transparency code を支持し、system cards、external red teaming、Model Spec、Preparedness Framework、Frontier Governance Framework を EU AI Act の次段階に合わせると説明した。Company self-report は regulatory review の代替ではないが、Europe で general-purpose model を deploy する際、transparency、safety evaluation、serious-risk management、content provenance、accountability が voluntary practice から procurement / launch condition へ移ることを示す。Product team は model version、data flow、risk owner、incident response、generated-content labeling を system design に先に入れるべきだ。

### Musk と The Economist の data dispute：AI 時代に最も audit しにくいのは fake number ではなく true number の denominator

- 出典：老范讲故事
- 日付：2026-08-02
- リンク：https://lukefan.com/2026/08/02/elon-musk-economist-data-truth-debate/
- 要約：記事は Musk と The Economist 編集長が aid、death、violence、influence を巡って争った例を解剖し、双方の数字が同時に真でも actual count、counterfactual model、time window、responsibility boundary が異なり得ると指摘する。AI-assisted research は立場を支える data を高速で見つけられるため、cherry-picking risk をむしろ増幅する。Quality analysis は citation を一つ付けるだけでなく、numerator / denominator、time range、observation と projection、confidence interval、data から conclusion までの value judgment を明示すべきである。

### 「AI で production-grade code」を教える instructor 採用：焦点は prompt から spec、verification、security へ

- 出典：ByteByteGo
- 日付：2026-07-31
- リンク：https://blog.bytebytego.com/p/hiring-part-time-instructor-write
- 要約：ByteByteGo は software engineers 向け live cohort course の part-time instructor を募集している。目的は code generation demo ではなく、real work を coding agents に delegate し、executable spec / plan を書き、返された code を verify、review、secure する方法を教えることだ。Large legacy codebase、context management、failure modes、testing、CI/CD、debugging、security review の経験を求める。Job post は market-size data ではないが、AI coding education が prompt introduction から「AI slop を避け、production readiness を証明する」engineering discipline へ移っているという labor signal である。

## 5. GitHub 人気 repo & トレンド追跡

### TRELLIS.2：O-Voxel で open surfaces、non-manifold structure、full PBR materials を表現

- 出典：GitHub Trending / TRELLIS.2 contributors
- 日付：2026-08-02
- リンク：https://github.com/microsoft/TRELLIS.2
- 要約：TRELLIS.2 は 4B-parameter image-to-3D model で、field-free sparse voxel representation の O-Voxel と 16× spatial downsampling の Sparse 3D VAE を使い、base color、roughness、metallic、opacity を持つ複雑な 3D assets を生成する。Project は H100 で 512³ asset 約3秒、1024³ 約17秒と報告し、open surfaces、non-manifold geometry、internal structures に対応するという。Independent reproduction は必要だが、当日約107 stars、累計約9,950 starsを集め、3D generation の競争が appearance preview から topology と renderable material の usability へ進んでいる。

### k-skill：韓国の交通、行政、法律、生活サービスを installable skills に変換

- 出典：GitHub Trending / NomaDamas
- 日付：2026-08-02
- リンク：https://github.com/NomaDamas/k-skill
- 要約：k-skill は韓国ユーザー向け agent skills を集め、SRT / KTX / bus search・booking、Seoul subway / congestion、weather / air quality、Korean law、corporate registry、procurement、real estate、government data などを扱う。API key、login、authentication、payment、manual submission が必要な steps も区別されている。当日約53 stars、累計約6,752 stars。General agent ecosystem の localization は translation だけではなく、official data sources、regional service workflows、permission boundary、明確な human handoff を必要とすることを示す。

## 📬 Newsletter 精選

### Sim、Alpha Vantage MCP、Telegram で stock-research agent workflow を構築

- 出典：Daily Dose of Data Science
- 日付：2026-08-02
- リンク：https://blog.dailydoseofds.com/p/build-a-stock-market-research-agentic-015
- 要約：Daily Dose は Sim の visual workflow、Alpha Vantage MCP、local Docker environment で stock-research agent を作り、output を Telegram に接続する。Example は real-time workflow execution、Ollama local models、tool connections、multiple deployment options を示す。Agent prototype の assembly cost は下がっているが、market data を取得して report を生成できることは investment advice を意味しない。Quote timestamp、corporate actions、source license、reproducible calculations、conflicts of interest、human review を残し、trading action は research workflow から厳格に分離すべきだ。

### 「Fable は CEO」：multi-model system は orchestrator と executor の分業へ

- 出典：Every
- 日付：2026-07-30
- リンク：https://every.to/context-window/fable-as-ceo
- 要約：Every は Anthropic model portfolio を company org chart にたとえ、Fable を CEO、Opus 5 を senior engineer、Sonnet 5 を junior engineer / analyst と表現する。重要なのは擬人化ではなく task specialization だ。Decomposition、judgment、routing を担う orchestrator が batch file operations に最適とは限らず、simple task に最も高価な model を使い続ける必要もない。Model specialization と routing は cost を下げる一方、multi-agent communication が人間に読みにくい shorthand / dialect を生むため、trace、handoff contract、final human-readable report は不可欠である。
