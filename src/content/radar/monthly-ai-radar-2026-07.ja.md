---
title: "AIレーダー月報：2026年7月"
date: 2026-08-01
category: radar
cadence: monthly
plainSummary: "AIレーダー月報 2026年7月：Agent engineering は model call から recoverable、verifiable、governable な runtime system へ進み、model competition は outcome cost、open weights、inference efficiency、physical AI、organization adoption によって再定義された。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agents
  - Evaluation
  - GitHub
lang: ja
coverImage: /images/radar/monthly-ai-radar-2026-07.ja-infographic.webp
audioUrl: /audio/radar/monthly-ai-radar-2026-07.ja.mp3?v=monthly
audioDuration: 935
audioSize: 7483749
deckUrl: /decks/radar/monthly-ai-radar-2026-07.ja.pdf
draft: false
---

## 対象範囲

- 月：2026-07
- 期間：2026-07-01 ~ 2026-07-31
- 対象週報：完全な週報 2 本。2026-07-06 ~ 2026-07-12、2026-07-13 ~ 2026-07-19
- 対象日報：2026-07-01 から 2026-07-31 の全号。月初、7 月 20 日以降、独立週報がない期間は日報で補完

## 月間サマリー

2026 年 7 月の主線は一文にできる。**Agent competition は「model が task を完了できるか」から「system が controlled cost で verifiable outcome を継続 delivery できるか」へ移った。** 月初の data plane、SPEC.md、governance toolkit、realtime voice、browser / terminal interfaces は runtime と control plane の輪郭を作った。月中の routing、cache、verifier、agentic RL、open weights、realtime interaction は capability、cost、evaluation を一つの engineering line に統合した。月末の deterministic orchestration、ontology、idempotency、managed agents、physical AI、skill supply chain は recovery、permission、semantic constraint、organizational reuse の重要性をさらに明確にした。

最大の変化は benchmark winner ではなく measurement axis である。Token price は依然重要だが、team は useful work per dollar、successful task、human intervention、recovery time、evaluation evidence、side-effect boundary を重視し始めた。Model、harness、data、tool、permission、organization process は別々に procurement / optimization しにくくなっている。

## 月間主要テーマ

### 1. Agent runtime は recoverable、measurable、governable な段階へ

Plano、Modal、Google Agents CLI、12-Factor Agents、Gemini API Managed Agents、OpenWorker、Swamp Workflow は、production-grade agent が LLM step を含む software system に近いことを示す。Task には explicit state、permission、budget、retry、stop condition、human approval、recovery path が必要だ。Coordination logic を deterministic code に戻すことは model capability を弱めず、token usage と unpredictable surface を減らす。

- **主要な根拠**：
  - [12-Factor Agents](https://github.com/humanlayer/12-factor-agents)
  - [Gemini API Managed Agents](https://blog.google/innovation-and-ai/technology/developers-tools/expanding-managed-agents-gemini-api-3-6-flash-hooks/)
  - [OpenWorker](https://openworker.com/)
  - [Swamp Workflow](https://www.adamhjk.com/blog/a-practical-guide-to-reducing-token-spend/)

- **注目点**：Agent platform は checkpoint、budget、approval、rollback、audit log を API timeout のような default capability にできるか。

### 2. Evaluation は release 前の score から training / runtime control loop へ

Long-horizon trajectory monitoring、GPT-Red、LLM-as-a-Verifier、ReactBench、SWE-Bench Pro review、Anthropic の real-environment egress incidents は同じ結論を示す。Single answer の correctness は system safety や product usability と同義ではない。Evaluation は full trajectory、real side effect、task definition、environment boundary、human acceptance を観測し、failure sample を training、routing、permission policy に戻す必要がある。

- **主要な根拠**：
  - [OpenAI long-horizon model safety](https://openai.com/index/safety-alignment-long-horizon-models/)
  - [OpenAI GPT-Red](https://openai.com/index/unlocking-self-improvement-gpt-red)
  - [ReactBench](https://github.com/millionco/reactbench)
  - [Anthropic network isolation incident review](https://www.anthropic.com/news/investigating-incidents-cybersecurity-evals)

- **注目点**：Enterprise は high-value agent ごとに、pre-release benchmark ではなく継続更新する evaluation ledger を持てるか。

### 3. Model competition は outcome cost、open weights、inference efficiency で再構成

GPT-5.6 の pricing / serving optimization、Kimi K3 の large open-weight multimodal route、Inkling の MoE、DeepSeek DSpark の speculative decoding、Gemini 3.6 Flash の specialization、reasoning effort / KV cache research は、比較軸を parameters と leaderboard から throughput、latency、context、tool use、total task cost へ広げた。

- **主要な根拠**：
  - [GPT-5.6 price-performance frontier](https://openai.com/index/advancing-the-price-performance-frontier-with-gpt-5-6)
  - [Kimi K3](https://huggingface.co/moonshotai/Kimi-K3)
  - [Thinking Machines Inkling](https://thinkingmachines.ai/news/introducing-inkling/)
  - [DeepSeek DSpark](https://arxiv.org/abs/2607.05147)

- **注目点**：Model routing は token price / average benchmark ではなく cost-per-success、recovery rate、tool reliability を中心にできるか。

### 4. Ontology、memory、idempotency、event log が agent data layer を形成

OpenViking、Graphify、Graphiti、ontology revival、idempotency、event ordering は、agent data problem が「context をどれだけ保存するか」だけではないと示す。System は fact の semantics、freshness、provenance を理解し、retry が side effect を重複させないようにし、人と複数 agent が object、state、event sequence を同じ意味で扱える必要がある。

- **主要な根拠**：
  - [OpenViking](https://github.com/volcengine/OpenViking)
  - [Graphify](https://github.com/Graphify-Labs/graphify)
  - [Ontologies for Agentic Systems](https://www.latent.space/p/ontologies-agentic-systems)
  - [Idempotency guide](https://blog.bytebytego.com/p/a-detailed-guide-to-idempotency-delivery)

- **注目点**：Team agent の core data structure は vector store、knowledge graph、event log、それとも executable constraint を含む composite layer になるか。

### 5. Physical AI が continuous perception、simulation、multi-agent coordination を統合

NVIDIA open model stack、FLUX-mimic、Applied Intuition Dana、Cosmos 3 Edge、Gemini Robotics ER 2 は agent を web / code から robotics、autonomous driving、factory environment に広げた。難所は action を一つ生成することではなく、continuous video から progress を推定し、deviation を検出し、failure から recover し、shared spatial state を維持し、simulation と hardware の間に verifiable chain を作ることだ。

- **主要な根拠**：
  - [NVIDIA open model stack](https://blog.bytebytego.com/p/how-nvidia-builds-open-models-for)
  - [FLUX-mimic](https://www.mimicrobotics.com/blog/introducing-flux-mimic)
  - [Applied Intuition Dana](https://www.appliedintuition.com/blog/dana-new-way-to-build-physical-ai)
  - [Gemini Robotics ER 2](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/gemini-robotics-er-2/)

- **注目点**：Physical AI benchmark は single-action success から long-trajectory recovery、cross-robot collaboration、real-world safety へ移るか。

### 6. Enterprise adoption は seat activation から workflow、責任、組織再設計へ

NTT DATA の large-scale adoption、Univé の governance-first rollout、Google ATLAS の「wide but shallow」usage pattern、occupation-specific request が role boundary を越える研究は、AI adoption が license count と同義ではないことを示す。Value は repeatable workflow、明確な human final accountability、training、privacy / permission design、successful task と role change の長期測定から生まれる。

- **主要な根拠**：
  - [NTT DATA](https://openai.com/index/ntt-data/)
  - [Univé](https://openai.com/index/unive)
  - [Google ATLAS](https://blog.google/innovation-and-ai/technology/research/understanding-the-ai-economy/)
  - [How AI expands work boundaries](https://openai.com/index/how-ai-is-expanding-what-people-do-at-work)

- **注目点**：Organization は seat adoption ではなく workflow retention、quality、human handoff、business outcome で AI を報告するようになるか。

### 7. Skills、MCP、multimodal tools が capability supply chain を形成

Stitch Skills、mcp-use、FineTune Studio、claude-video、OpenWork、OfficeCLI、各種 agent skill project は document、design、video、training、organization knowledge、application operation を installable workflow に変えた。Reuse speed が上がる一方、source review、scope gate、least privilege、version pinning、rollback は software dependency governance と同じく重要になる。

- **主要な根拠**：
  - [Google Stitch Skills](https://github.com/google-labs-code/stitch-skills)
  - [mcp-use](https://github.com/mcp-use/mcp-use)
  - [claude-video](https://github.com/bradautomates/claude-video)
  - [OpenWork](https://github.com/different-ai/openwork)

- **注目点**：Agent capability supply chain は高速 reuse と permission safety の間に verifiable release standard を作れるか。

## 継続トラッキング

### Cost per successful outcome
Model fee、context、routing、tool failure、human intervention、recovery cost を一つの ledger に入れる必要がある。次の cost optimization は inference だけでなく harness、cache、deterministic orchestration、evaluation design でも起きる。

### Evaluation ledger
各 version change は task set、environment、trajectory、failure sample、human acceptance、side effect の記録を残すべきだ。Ledger がなければ model regression、harness regression、environment change を区別できない。

### Side-effect boundary
File、network、payment、publishing、physical device の tool は approval、idempotency、revoke、recovery を first-class capability にする必要がある。Prompt は permission boundary ではない。

### Skill provenance
Skills と MCP は organization capability の distribution format になりつつある。Source、version、dependency、permission、test evidence が production adoption を決める。

## 重要リソース一覧

- **Runtime & governance**：12-Factor Agents, Gemini API Managed Agents, OpenWorker, Swamp Workflow.
- **Evaluation & safety**：GPT-Red, ReactBench, long-horizon monitoring, Anthropic incident review.
- **Models & efficiency**：GPT-5.6, Kimi K3, Inkling, DSpark, Gemini 3.6 Flash.
- **Data & context**：OpenViking, Graphify, ontology, idempotency.
- **Physical AI**：NVIDIA open models, FLUX-mimic, Dana, Gemini Robotics ER 2.
- **Skills & MCP**：Stitch Skills, mcp-use, claude-video, OpenWork.

## アセット索引

- **Audio Overview**: /audio/radar/monthly-ai-radar-2026-07.ja.mp3
- **Slide Deck**: /decks/radar/monthly-ai-radar-2026-07.ja.pdf
- **Infographic**: /images/radar/monthly-ai-radar-2026-07.ja-infographic.webp

## 月内週報ナビゲーション

- [AIレーダー週報：2026-07-06〜2026-07-12](/ja/radar/weekly-ai-radar-2026-07-06-to-2026-07-12/)
- [AIレーダー週報：2026-07-13〜2026-07-19](/ja/radar/weekly-ai-radar-2026-07-13-to-2026-07-19/)
