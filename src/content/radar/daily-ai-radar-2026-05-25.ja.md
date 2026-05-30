---
title: "AI レーダー日報：2026-05-25"
date: 2026-05-25
category: radar
cadence: daily
plainSummary: "今日の signal は、agent engineering が demo から production へ進むときの基盤に集中しています。Tool calling は code orchestration へ、voice agents は session segmentation と low-latency path へ、memory、evaluation、document parsing、earth observation models、agent harness は運用可能な system layer を補っています。"
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

- 対象期間：2026-05-24 〜 2026-05-25。あわせて 2026-05-18 〜 2026-05-23 の未採用だが signal value が高い engineering releases も補足します。

---
![Agent harness workflow](https://substackcdn.com/image/fetch/$s_!jJ4Z!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2ac4f24e-259e-4837-a547-a696f9eed8a0_680x367.png)

*代表画像は [The Anatomy of an Agent Harness](https://www.dailydoseofds.com/p/the-anatomy-of-an-agent-harness/) から。本日の主線である production-grade agent が prompt だけでなく harness、tools、memory、state、verification loop に依存するという signal を表しています。*

## 1. Agent execution、memory、evaluation

### AWS は Programmatic Tool Calling を紹介し、model-generated code で tool calls を orchestrate する

- 出典：AWS
- 日付：2026-05-19
- リンク：https://aws.amazon.com/blogs/machine-learning/implementing-programmatic-tool-calling-on-amazon-bedrock/
- 要約：AWS は programmatic tool calling を、model が Python code を生成し sandbox 内で複数 tool calls を orchestration し、final result だけを model context に戻す方式として説明しています。実装は self-hosted Docker sandbox、Bedrock AgentCore Code Interpreter、Anthropic SDK compatible proxy の 3 種類です。実験では PTC mode が token usage を 87% から 92% 削減し、test された 8 models すべてで正答した一方、non-PTC mode では Claude family のみが成功しました。重要なのは model replacement ではなく、deterministic loops、filtering、aggregation、error handling を context window の外へ移すことです。

### Amazon Nova Sonic の voice agent design は tools、sub-agents、session segmentation を latency control surface にした

- 出典：AWS
- 日付：2026-05-19
- リンク：https://aws.amazon.com/blogs/machine-learning/scalable-voice-agent-design-with-amazon-nova-sonic-multi-agent-tools-and-session-segmentation/
- 要約：AWS は Amazon Nova Sonic、AgentCore Runtime、AgentCore Gateway、Strands BidiAgent、WebSocket streaming を使った scalable voice agent design を説明しました。Architecture は 3 patterns に分かれます。Gateway tools で low latency を狙う、sub-agent / agent-as-tool で deeper reasoning を扱う、session segmentation で各 phase の prompt と tool surface を小さくする、という整理です。Best practices は small sub-agent models、caching、post-auth prefetch、parallel independent calls、filler phrases、tool count reduction です。Voice agent の production issue は話せるかどうかではなく、per-turn latency、tool surface size、state handoff、error recovery です。

### Kiro CLI が AgentCore Memory に接続し、project と user preferences を retrievable long-term memory にした

- 出典：AWS
- 日付：2026-05-19
- リンク：https://aws.amazon.com/blogs/machine-learning/extending-conversational-memory-in-kiro-cli-using-amazon-bedrock-agentcore-memory/
- 要約：AWS は custom MCP server で Kiro CLI と Amazon Bedrock AgentCore Memory を接続する方法を示しました。Tools は conversation search、store、retrieve、list、stats、config、delete を含みます。Retrieval は 2 stages で、まず memory records を semantic search し、必要なら event-level content を direct scan します。Namespace は user、project、session 単位で構成でき、CLI hooks が session 前に preferences を load し、session 後に memory を write back します。Coding agent にとって、この memory layer は preferences、project conventions、long-term context を chat transcript から切り出す点に価値があります。

### AgentCore の custom code evaluators は agent quality checks を Lambda と CloudWatch に入れる

- 出典：AWS
- 日付：2026-05-18
- リンク：https://aws.amazon.com/blogs/machine-learning/build-custom-code-based-evaluators-in-amazon-bedrock-agentcore/
- 要約：AWS は Bedrock AgentCore の custom code-based evaluators を紹介しました。Lambda を使って trace、tool call、session level で deterministic checks を実行します。Examples は tool response schema、stock price drift、workflow compliance、PII leak です。Evaluations は development、regression、CI で on-demand に実行でき、production traffic を sampling して CloudWatch metrics にも出せます。この流れは、agent evaluation が LLM-as-judge だけでは足りず、versioned、alertable、deployment pipeline friendly な code evaluators を必要とすることを示しています。

## 2. Open models、document parsing、scientific AI

### PaddleOCR 3.5 は Transformers backend をサポートし、Document AI と Hugging Face stack の接続を軽くした

- 出典：Hugging Face / PaddlePaddle
- 日付：2026-05-18
- リンク：https://huggingface.co/blog/PaddlePaddle/paddleocr-transformers
- 要約：PaddleOCR 3.5 は more flexible inference-engine interface を追加しました。Developers は `engine="transformers"` で PP-OCRv5 や PaddleOCR-VL 1.5 などの supported OCR / document parsing models を実行し、`engine_config` で dtype、device、attention implementation を指定できます。PaddleOCR は OCR / document parsing pipeline を管理し続け、Transformers が model loading、experimentation、deployment の backend になります。RAG、document agents、search、automation では、PDF、scans、screenshots、tables、complex layouts の parsing を PyTorch / Transformers workflows に自然につなげられる点が重要です。

### OlmoEarth v1.1 は token design により earth observation model の compute cost を one third に近づけた

- 出典：Hugging Face / Ai2
- 日付：2026-05-19
- リンク：https://huggingface.co/blog/allenai/olmoearth-v1-1
- 要約：Ai2 はより効率的な earth observation models family、OlmoEarth v1.1 を公開しました。中心は Sentinel-2 remote sensing input の token sequence length を減らす設計です。旧方式は timestep と resolution ごとに token を作っていましたが、新 version は pretraining approach を調整し、task performance を維持しながら token count と compute needs を減らします。Article は v1.1 が各 size で v1 より up to 3x cheaper に run できるとし、Base、Tiny、Nano weights と training code を公開しています。AI for science の進歩は larger models だけでなく、physical data structure に合わせた tokenization と efficiency design からも生まれます。

## 3. Agent harness と optimization loop

### Daily Dose of DS は agent harness を model 外側の complete production system と定義した

- 出典：Daily Dose of Data Science
- 日付：2026-05-24
- リンク：https://www.dailydoseofds.com/p/the-anatomy-of-an-agent-harness/
- 要約：Daily Dose of DS は、同じ model でも agent product によって performance が大きく変わる理由を harness で説明しています。Harness は orchestration loop、tools、memory、context management、prompt construction、output parsing、state management、error handling、guardrails、verification loops、subagent orchestration に分解されます。Prompt engineering は内側の一部で、context engineering は model が何を見るかを管理し、harness engineering は tools、state、permissions、recovery、verification、lifecycle を覆います。Production agent の難所は single prompt tuning ではなく、operating-system-like engineering に近づいています。

### Comet Opik は agent optimization を traces、datasets、prompts、experiments の automated loop にする

- 出典：Comet Opik
- 日付：2026-05-24
- リンク：https://www.comet.com/docs/opik/v1/agent_optimization/overview
- 要約：Daily Dose of DS が紹介した Opik agent optimization workflow は、より一般的な方向を示しています。Agent の prompt、workflow step、trace、dataset、evaluation results を同じ optimization system に入れる考え方です。Opik documentation は tracing、LLM-as-judge、heuristic eval metrics、prompt versioning、experiments、automated optimization algorithms を強調しています。Teams にとって価値があるのは一度だけ prompt を良くすることではなく、failed samples を dataset に戻し、新旧 prompts を比較可能にし、agent improvement を replayable engineering process にすることです。

## 📬 Newsletter 精選

### Daily Dose of Data Science：function approximation は RL agent を tabular world から連続状態へ進める

- 出典：Daily Dose of Data Science
- 日付：2026-05-24
- リンク：https://www.dailydoseofds.com/rl-course-part-5
- 要約：RL course part 5 は、tabular methods が state space の爆発に弱い理由と、function approximation が generalization を可能にする理由を説明した。Newsletter 枠では、agentic systems の評価と policy learning を理解する基礎として扱った。

### Every：cheap competence は AI product の frontier を「難問」から大量の小仕事へ動かす

- 出典：Every
- 日付：2026-05-24
- リンク：https://every.to/context-window/cheap-competence-new-frontier
- 要約：Every は、AI の価値が elite performance だけでなく、安価で十分に有能な competence を大量に配ることへ移っていると論じた。本文では、software factory、医療判断、agent deployment といった読み筋を支える経済的背景として扱い、具体的な状況で次に何をすべきかを決める human framing の重要性も示した。

### Every：100-agent software factory は人間の組織設計を agent orchestration の問題へ変える

- 出典：Every
- 日付：2026-05-19
- リンク：https://every.to/context-window/inside-the-100-agent-software-factory
- 要約：Every は Gas City の 100-agent software factory を紹介し、多数の specialized agents を組み合わせた software development の形を描いた。重要なのは agent count ではなく、task decomposition、review、handoff、human oversight をどう設計するかだ。
