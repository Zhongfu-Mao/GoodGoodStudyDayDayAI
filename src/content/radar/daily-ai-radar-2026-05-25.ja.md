---
title: "AI レーダー日報：2026-05-25"
date: 2026-05-25
category: radar
cadence: daily
plainSummary: "今日の signal は 3 層に集まっています。Deep Research と vector indexing は agent / retrieval systems をより engineering-driven な architecture へ押し上げ、AlphaProof Nexus と Mythos は verifiable mathematics と vulnerability discovery を進め、Bumblebee、ONNX、public result repos は AI risk、evaluation、research workflows を runnable systems に落としています。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agent
  - Evaluation
  - Infrastructure
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-05-25.ja-infographic.webp
audioUrl: /audio/radar/daily-ai-radar-2026-05-25.ja.mp3
audioDuration: 986
audioSize: 7890841
draft: false
---

## 対象範囲

- 対象期間：2026-05-24 〜 2026-05-25。あわせて今週まだ参照価値のある public engineering / industry signals も補足します。

## 1. AI Engineering & アーキテクチャ

### Onyx の Deep Research lessons は、strong agent architecture が coordinator により多くの tools を渡すことではないと示す

- 出典：Onyx / Daily Dose of Data Science
- 日付：2026-05-25
- リンク：https://onyx.app/blog/building-the-best-deep-research
- 要約：Daily Dose of DS は Onyx Deep Research architecture を当日の主線にしました。高く評価された research agent は、orchestrator に web search をさせず、task decomposition に集中させ、self-contained briefs を research agents に渡します。Onyx の公式 post も、agent の要点は tool を増やすことではなく、prompt、context、task boundary を明確にすることだと説明しています。長い research workflow では、coordinator が早く答え始めることを防ぎ、multi-hop summarization の歪みを減らし、citation cleanup や dedupe を deterministic steps に寄せることが設計上の鍵です。

### CockroachDB の C-SPANN は vector index を distributed SQL 内の ordinary table data として扱う

- 出典：Cockroach Labs / ByteByteGo
- 日付：2026-05-25
- リンク：https://www.cockroachlabs.com/blog/cspann-real-time-indexing-billions-vectors
- 要約：ByteByteGo は CockroachDB が distributed SQL の中で real-time vector indexing をどう作ったかを解説しました。公開設計である C-SPANN は、vector index を独立した in-memory service にせず、partition、centroid、vector data を ordinary key-value rows として保存し、既存の range split、rebalance、replication、multi-region、transactional consistency を利用します。RAG、agent memory、multi-tenant semantic search では、ANN algorithm だけでなく updates、sharding、hot spots、permissions、data locality を database system にどう組み込むかが本当の難所です。

## 2. モデル最前線 & アルゴリズム探索

### AlphaProof Nexus は Lean feedback で 9 つの Erdős problems を解き、mathematical agents を verifiable proof search へ進めた

- 出典：Google / DeepMind / arXiv
- 日付：2026-05-21
- リンク：https://arxiv.org/abs/2605.22763
- 要約：The Rundown AI は Google DeepMind の AlphaProof Nexus を headline として扱いました。公開論文によると、この agentic formal proof search framework は Gemini で Lean proofs を生成し、compiler feedback で反復し、9 つの open Erdős problems と 44 の OEIS conjectures を解きました。重要なのは「model が数学を解く」という曖昧な claim ではなく、Lean が result を machine-checkable proof object にすることです。Mathematical research agents の評価軸は、自然言語推論が説得的かどうかから、検証可能な artifact を出せるかへ移っています。

### Daily Dose of DS は ONNX で model portability を説明し、training framework と production runtime の分離を示した

- 出典：Daily Dose of Data Science
- 日付：2026-05-25
- リンク：https://www.dailydoseofds.com/mlops-crash-course-part-10/
- 要約：Daily Dose of DS は ONNX を production ML の bridge として説明しました。Training は PyTorch や TensorFlow で行われても、deployment は C++ service、mobile device、GPU runtime、CPU-only environment になることがあります。ONNX は model を framework-agnostic computation graph、standard operators、explicit tensor shapes、metadata、weights として保存し、ONNX Runtime が graph optimization と backend execution を担当します。AI systems が production に入ると、model file format、operator coverage、numerical drift、custom ops、hardware execution backend は model quality と同じくらい重要になります。

## 3. 実践コード & ツールライブラリ

### Project Glasswing の初期結果は、AI security capability を vulnerability discovery から verification、disclosure、patching process へ広げた

- 出典：Anthropic / The Rundown AI
- 日付：2026-05-22
- リンク：https://www.anthropic.com/research/glasswing-initial-update
- 要約：The Rundown AI は Claude Mythos が Project Glasswing で多くの high / critical vulnerabilities を見つけたことを取り上げました。Anthropic の公開 update は、新しい bottleneck が discovery ではなく verification、disclosure、patching になりつつあると述べています。Open-source project scanning、independent triage、partner defense examples も示されています。Engineering teams にとっての論点は、security discovery を model に丸投げすることではなく、auditable triage、patch priority、false-positive handling、responsible disclosure を workflow として持つことです。

### Perplexity は Bumblebee を open source 化し、developer machines の supply-chain exposure を read-only scan する

- 出典：GitHub / Perplexity
- 日付：2026-05-23
- リンク：https://github.com/perplexityai/bumblebee
- 要約：Perplexity は macOS / Linux developer endpoints 向けの read-only scanner である Bumblebee を公開しました。Language package managers、AI agent configs、editor extensions、browser extensions にある known risks を確認しますが、install scripts、package managers、source files、network monitoring は実行しません。この設計は AI development の現実に近いものです。Supply-chain response では SBOM だけでなく、developer local state の lockfiles、manifests、extensions、agent configs が既知の incident に exposed しているかを安全に確認する必要があります。

### ONNX Runtime は model deployment を graph optimization、backend partitioning、execution provider selection の問題にする

- 出典：Daily Dose of Data Science
- 日付：2026-05-25
- リンク：https://onnxruntime.ai/
- 要約：ONNX は intermediate representation であり、実際に production で使うには runtime が graph を実行する必要があります。ONNX Runtime は ONNX graph を読み込み、graph-level optimization を行い、hardware backend に応じて execution を partition します。Daily Dose の記事は、ONNX が万能ではないことも強調しています。Framework ops が完全に map できない場合、execution provider coverage は hardware に依存し、mixed precision は numerical drift を起こし、custom ops は追加 engineering を要求します。「export できる」は「deploy できる」と同義ではありません。

## 4. 業界 & ビジネス速報

### Starbucks は AI inventory counting tool を終了し、visual automation は store execution reliability を先に満たす必要があると示した

- 出典：Restaurant News / Reuters
- 日付：2026-05-21
- リンク：https://www.nrn.com/quick-service/starbucks-is-ending-its-use-of-ai-to-count-inventory
- 要約：Starbucks は North America stores の inventory counting に使っていた AI tool を終了しました。公開報道では、miscounts、mislabeling、front-line workers による manual rechecks が問題として挙げられています。この case は AI deployment の警告です。Enterprise automation は demo accuracy だけでなく、similar SKUs、shelf occlusion、workflow exceptions、worker trust、error-correction cost を通らなければなりません。AI automation が frontline workflow を複雑にするなら、節約された時間は review と rework に吸収されます。

### McKinsey の fee structure adjustment は、AI が billable-hours consulting logic を圧縮していることを示す

- 出典：Times of India / Financial Times
- 日付：2026-05-16
- リンク：https://timesofindia.indiatimes.com/technology/tech-news/mckinsey-is-rethinking-its-pay-structure-because-clients-are-no-longer-paying-for-hours-but/articleshow/131131220.cms
- 要約：McKinsey の partner compensation と client fee structure の見直しに関する報道は、consulting industry が hours-based billing から outcomes-based pricing へ移っていることを示しています。AI が analysis、documents、operations delivery を効率化すると、clients は person-days だけで払うことを受け入れにくくなります。この signal は consulting に限りません。Knowledge services 全体が、models によって execution cost が下がった後、outcomes、value attribution、new incentives、business models をどう定義するかを迫られています。

## 5. GitHub 人気 repo & トレンド追跡

### onnx/onnx：model exchange format continues to serve as the contract layer between training frameworks and runtimes

- 出典：GitHub / ONNX
- 日付：2026-05-25
- リンク：https://github.com/onnx/onnx
- 要約：Daily Dose of DS は当日、ONNX を production model deployment の中心に戻しました。ONNX repository が fifth quadrant に値するのは、intermediate representation が training frameworks、model exchange、optimizers、inference runtimes の contract layer であり続けているためです。Deployment endpoints が増えるほど、teams は weights だけでなく operator set、shape、metadata、version compatibility、execution backends が同じ graph を安定して解釈できるかを追う必要があります。

### google-deepmind/alphaproof-nexus-results：formal-proof agents need public, checkable result repositories

- 出典：GitHub / arXiv
- 日付：2026-05-21
- リンク：https://github.com/google-deepmind/alphaproof-nexus-results
- 要約：AlphaProof Nexus の results repository は、paper に書かれた formal proof search を review / reproduction しやすくします。AI research における重要な engineering signal は、agent output が proofs、code、experiments、security reports であるなら、result は paper narrative や press summary だけでなく、checkable artifacts、scripts、data、version records として残るべきだということです。

## 📬 Newsletter 精選

### ByteByteGo：How CockroachDB Built Vector Indexing at Scale

- 出典：ByteByteGo
- 日付：2026-05-25
- リンク：https://blog.bytebytego.com/p/how-cockroachdb-built-vector-indexing
- 要約：このメールは CockroachDB の vector indexing を例に、vector search が distributed transactional database に入ると、問題が ANN algorithm から sharding、hot spots、incremental updates、quantization、multi-tenancy、regional data locality へ広がることを説明しました。今日の engineering section の system-design background を補います。

### The Rundown AI：Google cracks decades-old math problems

- 出典：The Rundown AI
- 日付：2026-05-25
- リンク：https://www.therundown.ai/
- 要約：The Rundown AI は Google DeepMind の AlphaProof Nexus を当日の headline とし、OpenAI の recent math breakthrough と並べて扱いました。メールから残すべき signal は、mathematical agents の評価が「proof-like answer」から「Lean などで checkable な proof を生成できるか」へ移っていることです。
