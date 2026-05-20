---
title: "AI レーダー日報：2026-05-20"
date: 2026-05-20
category: radar
cadence: daily
plainSummary: "今日は Google I/O が Gemini 3.5、Search、Workspace、personal Agent を「action」寄りの product layer に押し出し、OpenAI と Google は content provenance で cross-platform watermarking に接続しました。GitHub、AWS、Databricks、Hugging Face は Agent の code fix、memory、tool calling、governance、open retrieval stack を補強しています。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agent
  - Developer Tools
  - Governance
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-05-20.ja-infographic.webp
audioUrl: /audio/radar/daily-ai-radar-2026-05-20.ja.mp3
audioDuration: 1178
audioSize: 9424751
draft: false
---

## 対象範囲

- 対象期間：2026-05-19 〜 2026-05-20。

---
![I/O 2026: Welcome to the agentic Gemini era](https://storage.googleapis.com/gweb-uniblog-publish-prod/images/SundarKeynote-hero.max-600x600.format-webp.webp)

*代表画像は [I/O 2026: Welcome to the agentic Gemini era](https://blog.google/innovation-and-ai/sundar-pichai-io-2026/) から。この記事の主線を最もよく表す元シグナルとして選んでいます。*

## 代表画像の説明

今日の主線は「AI product が answer から action へ進んでいる」ことです。Google I/O は Gemini 3.5 Flash を Search、Workspace、Gemini app、Antigravity、enterprise Agent platform に入れ、long-horizon task、tool calling、generative UI、personal context を前面に出しました。OpenAI の content provenance update は、生成 media が日常的な creation に入った後、platform 間で検証可能な signal を共有する必要があることを示しています。GitHub、AWS、Databricks、Hugging Face の signal はより engineering 側です。Agent は review feedback を修正し、memory を保持し、code で tools を orchestrate し、policy で制約され、より安い geospatial model と強い reranker も必要になります。

## 1. Google I/O と action-oriented Gemini product layer

### Google I/O 2026 は Gemini の主線を agentic era と明確に位置づけた

- 出典：Google
- 日付：2026-05-19
- リンク：https://blog.google/innovation-and-ai/sundar-pichai-io-2026/
- 要約：Google は I/O 2026 で、今年の主線を「agentic Gemini era」と位置づけました。公式によると、AI Overviews は monthly active users が 25 億を超え、AI Mode は launch から 1 年で 10 億 monthly active users を超え、Gemini app は 9 億 monthly active users を超えました。Model API は毎分約 190 億 tokens を処理し、過去 12 か月で 375 以上の Google Cloud customers がそれぞれ 1 兆 tokens 以上を処理しています。発表は TPU 8t / 8i、Gemini 3.5、Antigravity、Search agents、Docs Live、Gemini for Science まで広がります。Google は model、chip、search、workspace、developer platform、vertical science tools を一つの action chain として接続しようとしています。

### Gemini 3.5 Flash は Agent と coding を中心に置き、複数入口の default model になった

- 出典：Google
- 日付：2026-05-19
- リンク：https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5/
- 要約：Google は Gemini 3.5 series を発表し、まず 3.5 Flash を release しました。位置づけは「frontier intelligence with action」です。公式は Terminal-Bench 2.1 で 76.2%、GDPval-AA で 1656 Elo、MCP Atlas で 83.6%、CharXiv Reasoning で 84.2% とし、output speed は他の frontier models の約 4 倍だと説明しています。3.5 Flash は Gemini app、AI Mode、Google Antigravity、Gemini API、Android Studio、Gemini Enterprise Agent Platform、Gemini Enterprise に入り、3.5 Pro は来月予定です。重要なのは単一 benchmark ではなく、高速 model を long-horizon Agent、code migration、multi-subagent collaboration、multimodal UI generation に直接結びつけている点です。

### Google Workspace は voice work、Google Pics、AI Inbox、Gemini Spark を追加した

- 出典：Google
- 日付：2026-05-19
- リンク：https://blog.google/products-and-platforms/products/workspace/workspace-updates/
- 要約：Google Workspace は work flow 寄りの AI 機能をまとめて発表しました。Mail inbox は voice question で必要な情報を検索し、Docs Live は口頭の brain dump を document に整理し、Keep は voice を structured notes や lists に変換します。Google Pics は Nano Banana model を使った controllable image generation / editing tool で、object segmentation、image 内 text editing、translation、Slides / Drive integration、collaborative canvas を扱います。AI Inbox には personalized draft replies、related file access、task management が入り、Gemini Spark は 24/7 personal Agent として Workspace preview に入ります。Office AI は「一段落を書く」から「context を理解し、materials を整理し、app 内で action を始める」段階へ進んでいます。

### Google Search は AI Mode を強化し、information Agent、generative UI、personal context を入れた

- 出典：Google
- 日付：2026-05-19
- リンク：https://blog.google/products-and-platforms/products/search/search-io-2026/
- 要約：Google は Search の AI Mode を Gemini 3.5 Flash に upgrade し、search box を 25 年ぶりの大きな redesign として AI-native にしました。より長い natural language input、AI suggestions、text、image、file、video、browser tabs などの multimodal input を扱えます。Search agents はまず information agents から始まり、web、news、social、finance、shopping、sports data を 24/7 で monitor し、条件に合ったときに synthesized update を送ります。Search は booking agent も広げ、Antigravity と Gemini 3.5 Flash の agentic coding capabilities を使って interactive UI、simulations、tables、charts、ongoing mini apps を question に応じて生成します。Search は answer page から personal task orchestration entry へ変わりつつあります。

## 2. Provenance、security、developer platform

### OpenAI は C2PA、SynthID、public verification tool による multi-layer provenance を出した

- 出典：OpenAI
- 日付：2026-05-19
- リンク：https://openai.com/index/advancing-content-provenance
- 要約：OpenAI は content provenance の強化を発表しました。C2PA Conforming Generator Product となり、Google DeepMind と協力して ChatGPT、Codex、OpenAI API で生成された images に SynthID invisible watermark を入れ、Content Credentials や SynthID signal を確認できる public verification tool も preview します。OpenAI は detection が完全ではないことも明示し、metadata や watermark が検出されない場合でも、その image が AI generated ではないと断定しません。この update の意味は、生成 media governance が単一 platform の label から、cross-platform standard、durable watermark、public verification tool の組み合わせへ移っていることです。

### GitHub は Copilot code review feedback の修正を cloud agent に渡せるようにした

- 出典：GitHub Changelog
- 日付：2026-05-19
- リンク：https://github.blog/changelog/2026-05-19-easily-apply-copilot-code-review-feedback-with-copilot-cloud-agent
- 要約：GitHub は Copilot code review の Implement suggestion を Fix with Copilot に変更し、handoff 前の dialog を追加しました。Developer は change を current pull request に直接適用するか、branch を target にした新しい pull request を開くかを選べます。Model selection と additional instructions も指定できます。Copilot PR Overview の batch entry も Fix batch with Copilot になり、複数の review comments を選んで Copilot cloud agent にまとめて渡せます。Code review は、人が suggestion を一つずつ処理する workflow から、platform が review feedback を reviewable agent task にまとめる workflow へ進んでいます。

### Gemini 3.5 Flash は GitHub Copilot に GA で入り、enterprise admin の明示的 enablement が必要になる

- 出典：GitHub Changelog
- 日付：2026-05-19
- リンク：https://github.blog/changelog/2026-05-19-gemini-3-5-flash-is-generally-available-for-github-copilot
- 要約：GitHub は Gemini 3.5 Flash を Copilot に rollout し始めました。対象は Copilot Pro、Pro+、Business、Enterprise users です。GitHub は early testing で near-Pro coding quality、Flash-tier speed / cost、strong tool use、fast response、high cache efficiency を確認し、fast iterative agentic coding workflow に向くと説明しています。Launch 時の premium request multiplier は 14x で、pricing は変更される可能性があります。Model は VS Code、Visual Studio、JetBrains、Xcode、Eclipse に入ります。Business / Enterprise admins は Copilot settings で policy を enable する必要があり、model availability は enterprise developer platform governance の対象になっています。

### GitHub は Dependabot と code scanning の OIDC private registry auth を拡張した

- 出典：GitHub Changelog
- 日付：2026-05-19
- リンク：https://github.blog/changelog/2026-05-19-expanded-oidc-support-for-dependabot-and-code-scanning
- 要約：GitHub は Dependabot と code scanning の OIDC authentication を拡張し、organization-level private registry configuration で Cloudsmith と Google Artifact Registry を追加しました。既存の AWS CodeArtifact、Azure DevOps Artifacts、JFrog Artifactory と合わせて、organization admins は cloud identity provider から short-lived credentials を動的に取得できます。これは long-lived secrets を dependency update や code scanning workflow に置かないための変更です。Supply chain security では、automated fix と scanning が private package ecosystem に深く入るほど、credential lifecycle を static secret に任せられなくなります。

## 3. Agent runtime、memory、tool calling

### Amazon Nova Sonic は voice Agent の 3 つの engineering pattern を示した

- 出典：AWS
- 日付：2026-05-19
- リンク：https://aws.amazon.com/blogs/machine-learning/scalable-voice-agent-design-with-amazon-nova-sonic-multi-agent-tools-and-session-segmentation/
- 要約：AWS は Amazon Nova Sonic、Amazon Bedrock AgentCore、Strands BidiAgent を使い、scalable voice Agent architecture を 3 pattern で示しました。Direct tool pattern、sub-agent / agent-as-tool pattern、session segmentation です。記事は voice Agent の難所を real-time audio、low latency、tool count、session isolation、prompt boundary、permission boundary に分解しています。Low-latency use case では Nova Sonic が AgentCore Gateway 経由で MCP tools を直接呼び、複雑な business logic は sub-agent に委任し、多段階 workflow は authentication、account management、consultation などの短い prompt と少ない tools に分割します。Voice Agent は text chatbot に speech wrapper を付ける話ではなく、real-time system design の問題です。

### Kiro CLI は MCP 経由で Amazon Bedrock AgentCore Memory に接続し、cross-session memory を補う

- 出典：AWS
- 日付：2026-05-19
- リンク：https://aws.amazon.com/blogs/machine-learning/extending-conversational-memory-in-kiro-cli-using-amazon-bedrock-agentcore-memory/
- 要約：AWS は Kiro CLI 用の custom MCP server を実装し、Amazon Bedrock AgentCore Memory に接続して、command-line Agent が cross-session conversation context を保存 / 検索できるようにする方法を示しました。構成は AgentCore Memory、MCP server、Kiro CLI の 3 層です。Tools は conversation search、session storage、complete conversation retrieval、session list、stats、config、delete を含みます。Retrieval は semantic search を先に試し、semantic processing がまだ終わっていない場合に event-level content scan へ切り替えます。Developer Agent を長く使うには、毎回ゼロから context を渡すのではなく、managed、cleanable、isolated memory layer が必要です。

### AWS は Programmatic Tool Calling で multi-tool Agent の token、latency、accuracy cost を下げる

- 出典：AWS
- 日付：2026-05-19
- リンク：https://aws.amazon.com/blogs/machine-learning/implementing-programmatic-tool-calling-on-amazon-bedrock/
- 要約：AWS は Programmatic Tool Calling を紹介しました。Model が tool を一つずつ round trip で呼ぶのではなく、Python code を生成し、sandbox 内で複数 tools を parallel に呼び、filtering / aggregation を行い、final result だけを model context に返します。Bedrock での実装は 3 つです。ECS 上の self-hosted Docker sandbox、AgentCore Code Interpreter の managed solution、Anthropic SDK-compatible proxy です。Expense audit task では PTC が token consumption を 87-92% 減らし、複数 model が PTC mode で正答しました。大量 data、多数 tool calls、正確な aggregation、raw data を context に入れたくない enterprise Agent に向いた pattern です。

## 4. Agent governance、retrieval、open models

### Databricks Unity AI Gateway は guardrails、cost controls、payload logging、MCP service policies を追加した

- 出典：Databricks
- 日付：2026-05-19
- リンク：https://www.databricks.com/blog/whats-new-unity-ai-gateway-service-policies-guardrails-observability-and-cost-controls-ai
- 要約：Databricks は Unity AI Gateway の runtime governance を拡張し、4 種類の beta capability を追加しました。LLM guardrails、cost controls、MCP payload logging、MCP service policies です。Guardrails は model と prompt で real-time policy を定義し、input、output、または both に適用できます。Cost controls は token、user、endpoint ごとに attribution し、per-user alerts と hard budget limits をサポートします。Payload logging は model calls と MCP interactions の request / response を Unity Catalog managed system tables に保存します。Service policies は agent identity、user context、request parameters に基づいて tool calls を制御します。Agent governance は static permission から、各 model call / tool call の runtime interception へ進んでいます。

### Databricks は Unity Catalog で MCP tool calls を fine-grained permission と audit に入れた

- 出典：Databricks
- 日付：2026-05-19
- リンク：https://www.databricks.com/blog/stop-rogue-ai-how-unity-catalog-secures-your-agent-actions
- 要約：Databricks は MCP tool governance の問題を詳しく説明しました。MCP server は `push_files`、`delete_file`、`merge_pull_request`、`execute_query`、`drop_table` などを同時に expose することがありますが、default authorization は all-or-nothing になりがちで、incident 後の trace も不足します。Unity Catalog は external MCP を register / govern でき、service policy は SQL function として actor と context を受け取り allow / deny を返します。Unity AI Gateway は every tool call の前に policy を enforce し、payload logging は tool name、arguments、result、user identity、allowed / denied を記録します。これは「Agent に権限はあるが、その action は許すべきではない」という gray zone を data governance に取り込む model です。

### OlmoEarth v1.1 は shorter token sequence で remote sensing model の compute cost を 3 分の 1 に近づけた

- 出典：Hugging Face
- 日付：2026-05-19
- リンク：https://huggingface.co/blog/allenai/olmoearth-v1-1
- 要約：Ai2 は Hugging Face で remote sensing / Earth observation 向けの OlmoEarth v1.1 を公開しました。v1.1 の中心は transformer input の token sequence length を短くすることです。Sentinel-2 multi-resolution imagery で resolution ごとに分けていた tokens を少ない tokens に統合しつつ、pretraining recipe を調整して performance drop を避けています。公式は、v1 に近い performance を保ちながら compute cost を最大 3x 削減できると説明し、Base、Tiny、Nano weights と training code を公開しています。Geography、climate、agriculture、forest monitoring 向け foundation model では、global-scale inference cost が大きな bottleneck になります。

### Ettin Reranker は 17M から 1B までの open cross-encoder reranker family を出した

- 出典：Hugging Face
- 日付：2026-05-19
- リンク：https://huggingface.co/blog/ettin-reranker
- 要約：Hugging Face は Ettin Reranker family を公開しました。17M、32M、68M、150M、400M、1B の 6 つの Sentence Transformers CrossEncoder rerankers で、Johns Hopkins の Ettin ModernBERT encoders を基盤にしています。Training は mixedbread-ai/mxbai-rerank-large-v2 scores を使った pointwise MSE distillation で、data と recipe も公開されています。Models は最大 8K tokens の context を扱え、retrieve-then-rerank pattern に向きます。安価な embedder で top-K candidates を retrieve し、cross-encoder で並べ替える形です。RAG、enterprise search、Agent memory では、reranker が answer quality を上げる低摩擦 component になっています。

## 📬 Newsletter 精選

### Latent Space は frontier lab preparation を pretraining、kernel、Agent eval capability に落とした

- 出典：Latent Space
- 日付：2026-05-19
- リンク：https://www.latent.space/p/ainews-how-to-land-a-job-at-a-frontier
- 要約：Latent Space の AINews は Vlad Feinberg の記事をきっかけに、frontier lab に入る準備をかなり具体的に扱っています。焦点は「AI を使える」ではなく、pretraining、Chinchilla scaling、dense vs MoE、JAX、Pallas kernel、ragged dot、kernel fusion、measurable forward-pass speedup まで掘れることです。同じ能力 map に Agent work も置かれています。Autoresearch、AlphaEvolve、eval、verification surface、decomposition は実務能力になっています。Newsletter signal としては、今日の Google / GitHub / AWS / Databricks の主線と一致します。希少なのは model、system、tool、evaluation、performance constraints をつなげられる人です。
