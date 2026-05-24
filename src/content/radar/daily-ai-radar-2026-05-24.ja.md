---
title: "AI レーダー日報：2026-05-24"
date: 2026-05-24
category: radar
cadence: daily
plainSummary: "今日は AI product competition が model 本体から agent、harness、evaluation、commerce protocol、managed infrastructure へさらに上がっている流れに注目します。Latent.Space は model labs becoming agent labs を主線に置き、Google I/O の information agents、Universal Cart、Workspace voice workflows、Running Guide は agent を consumer と accessibility に広げ、AWS は OpenAI-compatible SageMaker endpoint、multimodal evaluation、bidirectional voice streaming で production foundation を補強しています。"
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

- 対象期間：2026-05-23 〜 2026-05-24。あわせて 2026-05-20 〜 2026-05-22 の未採用だが signal value が高い official releases も補足します。

---
![AINews All Model Labs are now Agent Labs](https://substackcdn.com/image/fetch/$s_!TLyU!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F348d0573-16b0-46d0-a852-ccaae2b6ff4f_1122x534.png)

*代表画像は [[AINews] All Model Labs are now Agent Labs](https://www.latent.space/p/ainews-all-model-labs-are-now-agent) から。この記事の主線を最もよく表す元シグナルとして選んでいます。*

## 1. Agent products、model economics、runtime protocols

### Latent.Space は model labs が agent labs になりつつあると見ており、競争軸は「model as product」から model + harness + workflow に移っている

- 出典：Latent.Space
- 日付：2026-05-23
- リンク：https://www.latent.space/p/ainews-all-model-labs-are-now-agent
- 要約：Latent.Space は AINews で最近の signal を「model labs are becoming agent labs」と整理しました。OpenAI executive による model alone is no longer the product という趣旨の発言、AI21 が agents に pivot していること、DeepSeek が初めて harness team を作っていることなどから、competition surface は single model capability から model、harness、workflow、UI、memory、economics の組み合わせへ広がっていると述べています。同時に、新しい closed ecosystem risk も指摘しています。もし model と proprietary harness が一緒に post-train されるなら、model provider は value を open API や interchangeable model interface ではなく自社 agent product により強く集約できます。

### DeepSeek-V4-Pro の 75% permanent discount は inference economics を agent product design の中心へ押し戻した

- 出典：Latent.Space
- 日付：2026-05-23
- リンク：https://www.latent.space/p/ainews-all-model-labs-are-now-agent
- 要約：AINews は DeepSeek-V4-Pro の 75% permanent discount をその日の strongest market signal と位置づけています。Community estimates として、V4-Pro の first-party pricing は input 100 万 tokens あたり 0.435 ドル、output 100 万 tokens あたり 0.87 ドル、cached input 0.0036 ドル、blended cost は約 0.18 ドルとされています。Intelligence / runtime cost では Pareto frontier に入るという見方です。Agent products にとってこれは単なる price cut ではありません。Long-running tasks、retries、tool calls、browser loops、multi-agent collaboration は token cost を増幅するため、model price curve は常時実行できる workflows を直接変えます。

### MCP release candidate、managed sandboxes、agent memory layers は runtime protocols の標準化が速く進んでいることを示す

- 出典：Latent.Space
- 日付：2026-05-23
- リンク：https://www.latent.space/p/ainews-all-model-labs-are-now-agent
- 要約：AINews は agent runtime infrastructure の複数 signal をまとめています。MCP 2026-07-28 release candidate は protocol を stateless にし、handshake と session ID をなくして、any request can hit any server instance という形にしました。Gemini Managed Agents、CoreWeave Sandboxes、Cloudsail はそれぞれ managed Linux environment、RL / eval sandbox、Cloudflare per-task sandbox の方向から execution layer を補っています。Hermes、AI-Q、gBrain などは skills、key management、shared memory を composable layers にしています。Agent systems は one-off chat や script call から、scalable、auditable、reusable runtime protocol へ向かっています。

## 2. Google I/O 後の consumer agents と commerce protocols

### Google I/O 2026 は Gemini 3.5 Flash、Gemini Omni、Antigravity、Managed Agents を同じ agent-first platform narrative に置いた

- 出典：Google
- 日付：2026-05-20
- リンク：https://blog.google/innovation-and-ai/technology/ai/google-io-2026-all-our-announcements/
- 要約：Google の I/O 2026 roundup は 100 items を列挙していますが、中心線は Gemini 3.5 Flash、Gemini Omni、Google Antigravity、AI Studio、Managed Agents、WebMCP を同じ platform story に入れた点です。Gemini 3.5 Flash は long-horizon agentic tasks に向く fast model と位置づけられ、Antigravity 2.0 は desktop app、CLI、SDK、subagents、hooks、async task management を追加しました。Managed Agents は 1 回の API call で remote Linux environment、code execution、file management、web browsing を agent に与えます。Google は model、IDE、API、managed execution environment、open tool protocols を agent-first developer surface として束ねています。

### Universal Cart、AP2、UCP は agentic commerce を search recommendation から payment と merchant systems へ進めた

- 出典：Google
- 日付：2026-05-20
- リンク：https://blog.google/products-and-platforms/products/shopping/shopping-updates-google-marketing-live/
- 要約：Google は Universal Cart、Agent Payments Protocol、Universal Commerce Protocol の update を発表しました。Universal Cart は Search、Gemini などの entry points をまたいで動き、UCP は Google Pay による Google 内 checkout、または merchant site への cart transfer を可能にします。Nike、Sephora、Target、Ulta Beauty、Walmart、Wayfair、一部 Shopify merchants が early features に参加します。Google は UCP-powered checkout を YouTube Shopping ads、Direct Offers、hotel booking、local food delivery にも広げる計画です。Agentic commerce の難所は「商品を探す」だけではなく、payments、merchant of record、promotions、brand visibility、cross-platform checkout protocols にあります。

### Ask Advisor は Google Ads、Analytics、Merchant Center の複数 marketing agents を continuous collaboration interface にまとめる

- 出典：Google
- 日付：2026-05-20
- リンク：https://blog.google/products/ads-commerce/ask-advisor/
- 要約：Google は Ask Advisor を発表しました。これは Google Ads、Google Analytics、Google Marketing Platform、Merchant Center をまたぐ unified AI collaborator です。たとえば user が “find new customers for my hair care products” と言うと、system は Merchant Center から product details を取り、Google Ads で campaign launch を支援します。Ads と Analytics の data を使って performance を説明し、next actions も勧めます。Ask Advisor は現在 English-language accounts 向け beta です。これは単一 assistant ではなく、複数 product 内 agent を continuous context で接続し、marketing team が goals、data、actions を複数 console 間で手作業移動しなくてよくする方向です。

### Google AI Mode は月間 10 億 users を超え、search behavior は keywords から long questions、planning、decision support へ移っている

- 出典：Google
- 日付：2026-05-19
- リンク：https://blog.google/products-and-platforms/products/search/ai-mode-us-insights/
- 要約：Google によると AI Mode は globally で monthly active users が 10 億を超え、launch 以来 queries は quarter ごとに 2 倍以上になっています。U.S. usage では、6 分の 1 以上の searches が voice または images を使い、image searches は month-over-month で 40% 以上成長しています。AI Mode の average query は traditional Search の 3 倍の長さで、planning related queries は過去 6 か月で overall AI Mode queries より 80% 速く増え、brainstorming queries も overall より 30% 速く増えています。AI Search は results page の summary replacement ではなく、multimodal input、long questions、planning tasks、decision support へ search entry point を広げています。

### Google Workspace は Gmail Live、Docs Live、Keep、Pics、AI Inbox、Gemini Spark を voice-first workflow としてつなげた

- 出典：Google
- 日付：2026-05-19
- リンク：https://blog.google/products-and-platforms/products/workspace/workspace-updates/
- 要約：Google Workspace は Google AI subscribers と Workspace business customers 向けに一連の new features を発表しました。Gmail Live は voice で inbox information を聞けるようにし、Docs Live は voice brainstorm を document draft に整理し、Keep は spoken notes を organized notes and lists に変換します。Google Pics は object segmentation、text editing、translation、Workspace integration を提供し、AI Inbox は Plus / Pro users に広がり personalized replies、file access、task management を追加します。Gemini Spark は 24/7 personal AI agent として Workspace apps に接続されます。AI は本文を書く補助だけではなく、inbox、docs、notes、images、daily planning の間の operation layer になっています。

### Running Guide agent は on-device multimodal agent が accessibility で low-latency safety path を必要とすることを示した

- 出典：Google / Google DeepMind
- 日付：2026-05-20
- リンク：https://blog.google/innovation-and-ai/models-and-research/google-deepmind/running-guide-agent/
- 要約：Google は Running Guide agent を紹介しました。Chest-mounted Pixel 10 Pro と audio feedback を使い、blind and low-vision athletes がより independently に走れるようにする agent です。System は dual-path architecture を採用します。On-device segmentation は Pixel 10 custom silicon 上で offline に動き、low-latency STOP alerts と steering cues を返します。Gemma 4 E4B は more complex multimodal scene understanding を担当し、Smarter Frame Selection により high-entropy frames だけを分析します。Planner、Coach、Break の 3 agents に分かれ、weather / Maps / starting line calibration、mid-run risk-tiered alerts、rest intervals を処理します。Accessibility agents では長い回答ではなく、low latency、on-device reliability、strict risk hierarchy、hardware form factor が鍵です。

## 3. AWS production infrastructure: compatible APIs、evaluation、voice streaming

### SageMaker AI は OpenAI-compatible endpoints をサポートし、owned models を OpenAI SDK、LangChain、Strands Agents から直接使えるようにした

- 出典：AWS
- 日付：2026-05-20
- リンク：https://aws.amazon.com/blogs/machine-learning/announcing-openai-compatible-api-support-for-amazon-sagemaker-ai-endpoints/
- 要約：AWS は SageMaker AI real-time inference endpoints が OpenAI-compatible API をサポートすると発表しました。OpenAI SDK、LangChain、Strands Agents を使っている applications は base URL を SageMaker endpoint の `/openai/v1` path に向け、time-limited bearer token で owned models を呼び出せます。Custom SigV4 client や streaming logic rewrite は不要です。SageMaker は inference components もサポートし、複数 model が 1 つの endpoint を共有しつつ independent resource allocation を持てます。Enterprise agent stack にとって、public API から owned GPU、data residency、private model へ移る friction を下げながら、common OpenAI-compatible interface を保てる点が重要です。

### Strands Evals は 4 つの multimodal judges を追加し、image-to-text evaluation を text proxy から image grounding へ進めた

- 出典：AWS
- 日付：2026-05-20
- リンク：https://aws.amazon.com/blogs/machine-learning/multimodal-evaluators-mllm-as-a-judge-for-image-to-text-tasks-in-strands-evals/
- 要約：AWS は Strands Evals SDK に 4 つの multimodal LLM-as-a-judge evaluators を追加しました。Overall Quality、Correctness、Faithfulness、Instruction Following です。これらは image、query、model response、optional reference answer を multimodal judge に渡し、image-grounded score と reasoning を返します。対象は captioning、visual QA、chart interpretation、document extraction、OCR、screenshot summarization です。Article は text-only judge が、存在しない button、誤った chart trend、invoice field hallucination を検出できないと説明します。Multimodal agents が production に入るなら、evaluation も original visual input を見られる必要があります。

### SageMaker AI と vLLM Realtime API は managed real-time speech transcription architecture を構成した

- 出典：AWS
- 日付：2026-05-20
- リンク：https://aws.amazon.com/blogs/machine-learning/build-real-time-voice-applications-with-amazon-sagemaker-ai-and-vllm/
- 要約：AWS は SageMaker AI bidirectional streaming と vLLM Realtime API を組み合わせ、Mistral の Voxtral-Mini-4B-Realtime-2602 を real-time speech transcription に使う方法を示しました。Architecture は HTTP/2 event stream で client と SageMaker runtime を接続し、SageMaker が container 内 WebSocket へ自動 bridge します。Container 内の FastAPI bridge は `/invocations-bidirectional-stream` を vLLM の `/v1/realtime` に forward します。Client は 16 kHz mono PCM16 を base64 chunks として streaming し、server は `transcription.delta` を real time に返します。この pattern は voice agents、live captioning、contact center analytics、accessibility tools に向いており、full audio upload 後に処理する request-response latency を避けられます。

## 4. Open retrieval、agent evaluation、reproducible systems

### Hugging Face は Ettin Reranker series を公開し、retrieval reranking の speed、quality、training recipe をまとめて open にした

- 出典：Hugging Face
- 日付：2026-05-19
- リンク：https://huggingface.co/blog/ettin-reranker
- 要約：Hugging Face は 6 つの Sentence Transformers CrossEncoder rerankers を公開しました。17M、32M、68M、150M、400M、1B の sizes があり、Johns Hopkins Ettin ModernBERT encoders をベースにし、8K context をサポートします。Training recipe は mixedbread-ai/mxbai-rerank-large-v2 からの distillation で、models、約 143M の `(query, document, score)` training data、training script が公開されています。17M model は MTEB と NanoBEIR で 33M MiniLM reranker を上回り、32M model は 568M bge-reranker-v2-m3 を上回り、1B model は 1.54B teacher にほぼ追いつきました。RAG と agent memory systems では、reranker は単なる ranking component ではなく、context quality、latency、cost を決める control point です。

### IBM Research と Hugging Face は Open Agent Leaderboard を出し、単体 model ではなく full agent system を評価する

- 出典：Hugging Face / IBM Research
- 日付：2026-05-18
- リンク：https://huggingface.co/blog/ibm-research/open-agent-leaderboard
- 要約：IBM Research は Hugging Face で Open Agent Leaderboard を公開しました。これは inner model だけではなく full agent systems を比較する leaderboard です。Exgentic framework を使い、SWE-Bench Verified、BrowseComp+、AppWorld、tau2-Bench Airline & Retail、tau2-Bench Telecom などを task、context、actions という protocol に統一し、success rate と average cost per task の両方を報告します。初期 results は、同じ model でも agent wrapper が違えば quality と cost が変わること、failed runs は successful runs より 20% から 54% 高くなり得ること、tool shortlisting が複数 model で performance を改善することを示しています。Agent evaluation は model leaderboard から planning、memory、tool use、context management、failure recovery の system comparison へ移っています。

## 📬 Newsletter 精選

- Latent.Space AINews：本期は 3 つの theme signals を提供しました。model labs becoming agent labs、DeepSeek inference price curve、MCP / sandbox / memory などの agent runtime infrastructure です。
