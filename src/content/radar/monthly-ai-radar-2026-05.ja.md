---
title: "AI レーダー月報：2026年5月"
date: 2026-06-01
category: radar
cadence: monthly
plainSummary: "AI レーダー月報：2026年5月：今月の AI は Agent runtime、enterprise knowledge permissions、Codex workflow、Google I/O、evaluation and recovery、inference economics、RAG data layer、organization adoption、governance boundaries を軸に動きました。Focus は model capability から runnable, auditable, reusable production systems へ移っています。"
difficulty: intermediate
tags:
  - Agent
  - AI Engineering
  - Evaluation
  - AI Infrastructure
lang: ja
coverImage: /images/radar/monthly-ai-radar-2026-05.ja-infographic.webp
audioUrl: /audio/radar/monthly-ai-radar-2026-05.ja.mp3?v=monthly
audioDuration: 1100
audioSize: 8803037
deckUrl: /decks/radar/monthly-ai-radar-2026-05.ja.pdf
draft: false
---

## 本期範囲

- 月：2026-05
- 期間：2026-05-01 〜 2026-05-31
- 対象週報：5 本。2026-04-27 〜 2026-05-03 は cross-month weekly として月初 signal を補います。
- 対象日報：2026-05-01 〜 2026-05-31 の各号

## 月次概観

2026年5月の AI 変化は一文で言えます。**Agent は “model capability showcase” から “production system building” へ移りました。** 月初は GPT-Realtime、Claude Code、OpenClaw、OncoAgent、ProgramBench が model and agent capability boundary を扱いました。中旬には LangChain、GitHub Copilot、CoreWeave Sandboxes、enterprise RAG permissions、inference infrastructure が runtime、isolation、permissions、observability に焦点を移しました。Google I/O 後は Gemini、Antigravity、Managed Agents、WebMCP、AgentCore、Strands、Nova Sonic、Open Agent Leaderboard が platform competition を前面に出しました。月末には DoorDash、Codex、Braintrust、Tax AI、Every compound engineering、agent crash recovery が “recover, evaluate, deliver, accumulate” を中心 question にしました。

今月の重要な見方は、model news に見えるものの多くが system boundary の話だということです。誰が runtime を持つのか、誰が evaluation を定義するのか、誰が context interface を設計するのか、誰が feedback を reusable workflow に変えるのか。その答えが agent era の long-term advantage を決めます。

## 月次主線

### 1. Agent runtime は infrastructure competition の中心になった

5月に繰り返し出てきた言葉は runtime、sandbox、memory、state、gateway、trace、checkpoint です。Claude Code、OpenClaw、LangChain platform stack、CoreWeave Sandboxes、Google Managed Agents、AWS AgentCore、Warp Oz は同じ方向を指します。Agent の product shape は chat box ではなく、execution environment、permissions、state、collaboration interface を持つ runtime system です。

- **主な根拠**：
  - [Claude Code vs. OpenClaw](https://blog.bytebytego.com/)
  - [LangChain Interrupt 2026 overview](https://blog.langchain.com/)
  - [Google I/O 2026 announcements](https://blog.google/innovation-and-ai/technology/ai/google-io-2026-all-our-announcements/)
  - [Amazon Nova Sonic voice agent design](https://aws.amazon.com/blogs/machine-learning/scalable-voice-agent-design-with-amazon-nova-sonic-multi-agent-tools-and-session-segmentation/)

- **問い**：Agent runtime は cloud functions や containers のような standard layer になるのか、それとも IDE、cloud vendors、model companies がそれぞれ定義し続けるのか。

### 2. Evaluation は model leaderboard から system audit へ移った

ProgramBench、DELEGATE-52、OfficeQA Pro、Open Agent Leaderboard、ITBench-AA、DoorDash LLM evaluation、OpenAI third-party evaluations、Strands multimodal judges、code evaluators は、single model score の authority を弱めました。Real question は、この agent がどの harness で動くか、tools はどう呼ばれるか、failure cost はいくらか、trace は再現可能か、人間はどこで介入するかです。

- **主な根拠**：
  - [Open Agent Leaderboard](https://huggingface.co/blog/ibm-research/open-agent-leaderboard)
  - [OpenAI third-party evaluations](https://openai.com/index/third-party-evaluations/)
  - [DoorDash LLM evaluation](https://careersatdoordash.com/blog/how-doordash-built-a-testing-system-to-evaluate-llms/)
  - [Microsoft DELEGATE-52](https://www.microsoft.com/en-us/research/)

- **問い**：Enterprise agent procurement は benchmark summary だけでなく、harness、cost、failure examples、recovery path を要求するようになるのか。

### 3. Codex and coding agents entered organization delivery workflow

5月の Codex narrative は “code assistant” から “engineering workflow entry” へ変わりました。Mobile、Windows sandbox、function-specific templates、Cisco、Endava、Braintrust、OpenAI customer loops、GitHub Copilot App / Memory / metrics / routing、Cursor habits report は、coding agent value が organization system の中で測られ始めたことを示します。Build logs、cross-repository fixes、review、team rules、delivery method が重要です。

- **主な根拠**：
  - [OpenAI Codex](https://openai.com/codex/)
  - [Braintrust Codex workflow](https://www.braintrust.dev/)
  - [GitHub Copilot metrics API](https://github.blog/)
  - [Cursor developer habits report](https://www.cursor.com/)

- **問い**：Coding agent の main battlefield は IDE 入口なのか、それとも CI、issues、reviews、preview、knowledge base を含む engineering operating system なのか。

### 4. RAG and data layer became permissions, input quality, and context budget problems

5月の RAG discussion は明確です。Vector search alone is not enough. EnterpriseRAG-Bench、Graphiti、Unity Catalog lineage、Amazon Quick S3 ACL、CockroachDB C-SPANN、Airtable Omni、PaddleOCR、Ettin Reranker、RAG / Graph RAG / Agentic RAG、liteparse、backend context engineering は、RAG を data system problem にしました。Permissions、lineage、document parsing、relationship structure、context budget、verifiable citations が必要です。

- **主な根拠**：
  - [CockroachDB vector indexing](https://www.cockroachlabs.com/blog/vector-search-indexing/)
  - [RAG vs. Graph RAG vs. Agentic RAG](https://www.dailydoseofds.com/p/rag-vs-graph-rag-vs-agentic-rag)
  - [PaddleOCR Transformers backend](https://huggingface.co/blog/PaddlePaddle/paddleocr-transformers)
  - [InsForge](https://github.com/InsForge/InsForge)

- **問い**：RAG platform moat は model API から来るのか、それとも enterprise data permissions、input cleaning、citation verification、context compression から来るのか。

### 5. Inference economics and tool calling changed agent product shape

Realtime voice、programmatic tool calling、DeepSeek price cut、OpenAI-compatible endpoints、vLLM + Mooncake、SageMaker streaming は同じことを示します。Agent が常時動けるかどうかは model quality だけでなく、unit task cost、latency、cache、tool calling、sandbox execution、media asset storage に依存します。Tool calling も “model calls APIs step by step” から “model writes program, sandbox executes deterministically” へ動いています。

- **主な根拠**：
  - [Programmatic Tool Calling on Amazon Bedrock](https://aws.amazon.com/blogs/machine-learning/implementing-programmatic-tool-calling-on-amazon-bedrock/)
  - [SageMaker AI and vLLM realtime voice](https://aws.amazon.com/blogs/machine-learning/build-real-time-voice-applications-with-amazon-sagemaker-ai-and-vllm/)
  - [DeepSeek pricing discussion](https://www.latent.space/)
  - [vLLM and Mooncake](https://blog.vllm.ai/)

- **問い**：Long-task agent の cost advantage は cheaper models から来るのか、それとも deterministic work を context window の外へ出すことから来るのか。

### 6. Multimodal and physical-world AI raised the responsibility boundary

Google Health、OncoAgent、Running Guide agent、Boston Children’s Hospital、Rosalind Biodefense、Reachy Mini、Figure、GridSFM、realtime voice stack は、AI が screen assistant から healthcare、accessibility、robotics、public health、voice interaction へ入っていることを示します。Key は demo ではなく low latency、safe interruption、risk tiers、human-in-the-loop、trusted developers、operational responsibility です。

- **主な根拠**：
  - [Running Guide agent](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/running-guide-agent/)
  - [Boston Children’s Hospital and OpenAI](https://openai.com/)
  - [Rosalind Biodefense](https://openai.com/)
  - [OncoAgent](https://huggingface.co/blog/)

- **問い**：High-responsibility domains は general agent platforms を採用するのか、それとも vertical, closed, strongly audited systems を形成するのか。

### 7. Organization adoption returned from automation fantasy to method building

Every の After Automation、Cheap Competence、Gas City、Compound Engineering、The Batch の Forward Deployed Engineer、Cursor habits report、Codex customer stories は同じことを示します。AI adoption の key は “one agent per employee” ではなく、problem framing、quality review、responsibility allocation、rule accumulation、failure review です。AI Engineer は long-term role、Forward Deployed Engineer は transition role に近いです。

- **主な根拠**：
  - [After Automation](https://every.to/context-window/)
  - [Compound Engineering Gets an Upgrade](https://every.to/context-window/compound-engineering-gets-an-upgrade)
  - [Inside the 100-agent Software Factory](https://every.to/context-window/inside-the-100-agent-software-factory)
  - [The Batch](https://www.deeplearning.ai/the-batch/)

- **問い**：Enterprises は agents を software procurement として扱うのか、それとも organization workflow redesign として扱うのか。

### 8. Governance, media, capital, and Chinese industry narratives need layered reading

OpenAI and Brazil media partnership、OpenAI election safeguards、OpenAI Foundation、Anthropic valuation narrative、Claude Opus 4.8、Apple Siri potentially using Gemini、DeepSeek financing rumors、semiconductor ecosystem narratives、Pope AI ethics stance made May business news dense. Read them in layers: product entry, governance boundary, capital narrative, industry sentiment.

- **主な根拠**：
  - [OpenAI election integrity](https://openai.com/index/2026-election-integrity/)
  - [OpenAI and Grupo Folha / UOL](https://openai.com/)
  - [The Rundown AI](https://www.therundown.ai/)
  - [老范讲故事](https://www.youtube.com/@laofan)

- **問い**：Model companies は media distribution layer、public infrastructure、developer platform、regulated enterprise を同時に担うのか。

## 継続追跡

### Agent recovery：rerun から decision scene recovery へ
Agent crash recovery は 5月の最重要 engineering question の一つです。Long-running agent は tool trace、context、decision chain、plan、verified assumptions を保存する必要があり、checkpoint、branch、human review、event log が runtime default になります。

### Evaluation ledger：evaluation cost, failure examples, harness become assets
Evaluation は launch前 test ではなく continuous operation ledger になりました。Success rate、unit task cost、retry、human intervention、model routing が product metrics に入ります。

### Data permissions：enterprise RAG starts with permissions, not embeddings
Enterprise knowledge agents の core difficulty は asset discovery、access control、lineage、document parsing、context compression です。これらを agent-usable interface にできる platform が production に近づきます。

### Organization memory：methods become plugins and templates
Compound engineering、Codex workflow、Cursor habits、Copilot metrics は、teams が experience を templates、plugins、review policies、automated checks に保存していくことを示します。

## 主要リソース索引

- **Agent runtime**：Claude Code, OpenClaw, LangChain, Google Managed Agents, AWS AgentCore, Warp Oz.
- **Evaluation**：ProgramBench, DELEGATE-52, Open Agent Leaderboard, ITBench-AA, DoorDash LLM evaluation, OpenAI third-party evaluations.
- **Data & RAG**：CockroachDB C-SPANN, EnterpriseRAG-Bench, Graphiti, Unity Catalog lineage, PaddleOCR, liteparse, Agentic RAG.
- **Coding agents**：Codex, GitHub Copilot, Cursor habits, Braintrust, Cisco, Endava.
- **Organization**：After Automation, Compound Engineering, AI Forward Deployed Engineer, Gas City.
- **Governance**：OpenAI election safeguards, Rosalind Biodefense, OpenAI media partnerships, Anthropic valuation narrative.

## アセット索引

- **Audio Overview**: /audio/radar/monthly-ai-radar-2026-05.ja.mp3
- **Slide Deck**: /decks/radar/monthly-ai-radar-2026-05.ja.pdf
- **Infographic**: /images/radar/monthly-ai-radar-2026-05.ja-infographic.webp

## 月内週報ナビ

- [AI レーダー週報：2026-04-27 〜 2026-05-03](/ja/radar/weekly-ai-radar-2026-04-27-to-2026-05-03/)
- [AI レーダー週報：2026-05-04 〜 2026-05-10](/ja/radar/weekly-ai-radar-2026-05-04-to-2026-05-10/)
- [AI レーダー週報：2026-05-11 〜 2026-05-17](/ja/radar/weekly-ai-radar-2026-05-11-to-2026-05-17/)
- [AI レーダー週報：2026-05-18 〜 2026-05-24](/ja/radar/weekly-ai-radar-2026-05-18-to-2026-05-24/)
- [AI レーダー週報：2026-05-25 〜 2026-05-31](/ja/radar/weekly-ai-radar-2026-05-25-to-2026-05-31/)
