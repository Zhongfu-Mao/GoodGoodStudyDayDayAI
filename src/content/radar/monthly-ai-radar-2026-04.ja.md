---
title: "AI レーダー月報：2026年4月（04-22 まで）"
date: 2026-04-22
category: radar
cadence: monthly
plainSummary: "AI レーダー月報：2026年4月（04-22 まで）では、月間トレンドをAgent、モデル、インフラ、プロダクト入口の変化として整理します。"
difficulty: intermediate
tags:
  - Agent
  - Open Models
  - AI Infrastructure
  - Coding Agents
lang: ja
coverImage: /images/radar/monthly-ai-radar-2026-04.ja-infographic.png
audioUrl: /audio/radar/monthly-ai-radar-2026-04.ja.mp3?v=monthly
deckUrl: /decks/radar/monthly-ai-radar-2026-04.ja.pdf
draft: false
---

# 月次結論

対象期間を `04-22` まで広げて振り返ると、4 月の AI signal は前半よりもずっと輪郭がはっきりした。覚えておくべきなのは、単に「また強い model が出た」ということではなく、次の四つの長期トレンドが相互に噛み合い始めた点だ。

1. **Agent の主戦場が実質的に runtime へ移った**  
   記憶、技能、プロトコル、承認ゲート、workspace、回復能力、可観測性に加え、zero-secret と deterministic review pipeline まで含めて、2026 年の Agent engineering の中心層が形になった。

2. **Context Engineering が prompt 技巧ではなく system design 能力になった**  
   model がうまく働くかどうかは、backend が schema、state、error、権限境界をどう見せるかに強く依存し始めている。

3. **モデル製品ラインが本当に分層し、出口も増えた**  
   旗艦 model、gate 付き前線版、垂直特化 model、robotics VLA、diffusion LLM、retrieval foundation model が同時に前進し、競争は単一ベンチマークでは測りにくくなった。

4. **プラットフォーム入口、合規制約、資本市場が同時に締まってきた**  
   IDE、検索、design tool、meeting memory、個人用 Agent OS が入口を争う一方、KYC、地域制限、算力投資、供給網再編が競争条件を書き換えている。

![Agent Landscape の進化図](https://substack-post-media.s3.amazonaws.com/public/images/acc877e8-071d-4d5c-bcc5-c8dbe50e37c1_2114x1154.png)

*代表画像は [Evolution of Agent Landscape From 2022-26](https://blog.dailydoseofds.com/p/evolution-of-agent-landscape-from) から選定。4 月全体を通して最も象徴的だったのは、Agent 能力が model 本体の中ではなく runtime 層へ外在化していく流れだった。*

## 今月の四つの主線

## 1. Harness Engineering が「硬い runtime 設計言語」になり始めた

- Agent Harness、Advisor Strategy、Build Agents That Don’t Fail in Production に加え、GitHub Agentic Workflow、Hermes Agent、多 Agent orchestration の事例が重なり、「勝負は model 単体ではなく execution environment 設計にある」という認識がかなり固まった。
- ここでいう execution environment には、workspace isolation、state persistence、approval node、context assembly、failure re-planning、さらに **zero-secret runtime** と **deterministic output review** が含まれる。
- 3 月までが「Agent は本当に仕事をするのか」の議論だったとすれば、4 月後半は「Agent をどう安全・安定・長時間にわたって働かせるか」の議論へ移った。

## 2. Context Engineering がコスト・信頼性・UX の交点になった

- `04-21` 前後の一連の記事が示した通り、Agent の token 使用量、エラー回数、成功率は、model の順位より backend が返す情報密度に左右されることが多い。
- Skills、CLI、MCP の三層分業は象徴的で、静的知識を段階的に読み込み、実行結果を構造化して返し、状態確認だけを軽量な interface に切り出す。ここで「文脈」は prompt text だけでなく、schema、state、tool protocol を含むものになった。
- つまり、次に優れた agent product が勝つ場所は、単なる model 選定ではなく **情報構造の設計** になる可能性が高い。

## 3. モデル競争は「誰が強いか」から「誰が完全な製品線を持つか」へ移った

- 旗艦側には Claude Opus 4.7 のような高速反復する主力がある。
- open / regional 陣営では Kimi K2.6、Qwen 3.6、Gemma 4、GLM 5.1 が、coding、多モーダル、長文脈、長時間実行、infra claim をまとめて競い始めた。
- 垂直方向では GPT-Rosalind、TARIO-2、GR00T N1.7 が生命科学や robotics の具体的な足場を作っている。
- さらに Diffusion LLM、DenseOn / LateOn、linear attention、prefill-as-a-service など、推論と検索の下層基盤そのものも急速に置き換わっている。

## 4. AI の入口争いが design、search、meeting、personal system へ全面拡張した

- OpenAI Codex、Windsurf、Perplexity、OpenClaw は coding / search の入口を争っている。
- Claude Design、Canva AI 2.0、Monologue Notes、ambient memory 系プロダクトは、design、文書、会議、長期記憶管理へ競争を押し広げた。
- その一方で、Anthropic KYC、決済制限、DeepSeek の資本構造、Anthropic / Amazon の算力ロック、北京ロボット半マラソン、SpaceX IPO 論争などが、これが単なる技術進化ではなく、プラットフォームと産業構造の再編であることを示している。

## 来月に向けて重点観察したいこと

- zero-secret runtime が一部の先進チームの選択ではなく、IDE / agent platform の標準基線になるか。
- Context Engineering が backend、toolchain、product の共通設計言語として定着するか。
- 多 Agent IDE、design agent、memory agent がいくつかの安定した入口形に収斂していくか。
- 垂直特化 model が生命科学、ロボティクス、セキュリティなど高価値分野で本当に再現可能な商業テンプレートを作れるか。

## 今月のソース

### Runtime & Harness Engineering
- [The Anatomy of an Agent Harness](https://blog.dailydoseofds.com/p/the-anatomy-of-an-agent-harness)
- [Evolution of Agent Landscape From 2022-26](https://blog.dailydoseofds.com/p/evolution-of-agent-landscape-from)
- [Build Agents That Don't Fail in Production](https://blog.dailydoseofds.com/p/build-agents-that-dont-fail-in-production)
- [The Security Architecture of GitHub Agentic Workflow](https://blog.bytebytego.com/p/the-security-architecture-of-github)
- [How We Cut Our Claude Code Token Usage 2.8x!](https://blog.dailydoseofds.com/p/how-we-cut-our-claude-code-token)
- [Extreme Harness Engineering](https://www.latent.space/p/harness-eng)
- [AINews RIP Pull Requests (2005-2026)](https://www.latent.space/p/ainews-rip-pull-requests-2005-2026)
- [AINews: Moonshot Kimi K2.6](https://www.latent.space/p/ainews-moonshot-kimi-k26-the-worlds)

### オープンモデルと最前線プロダクト群
- [AINews Gemma 4: The Best Small Multimodal Open Models](https://www.latent.space/p/ainews-gemma-4-the-best-small-multimodal)
- [AINews Anthropic Claude Opus 4.7](https://www.latent.space/p/ainews-anthropic-claude-opus-47-literally)
- [OpenAI GPT-Rosalind — 首个生命科学专用模型](https://www.therundown.ai/p/openai-superapp-hiding-inside-codex)
- [Nucleus-Image](https://huggingface.co/blog/NucleusAI/nucleus-image)
- [NVIDIA Isaac GR00T N1.7](https://huggingface.co/blog/nvidia/gr00t-n1-7)
- [DenseOn & LateOn](https://huggingface.co/blog/lightonai/denseon-lateon)
- [The Anatomy of Diffusion LLMs](https://blog.dailydoseofds.com/p/the-anatomy-of-diffusion-llms-a1c)
- [Noetik TARIO-2](https://www.latent.space/p/noetik)

### ワークフロー、OCR、RAG
- [Using OCR models with llama.cpp](https://huggingface.co/blog/ggml-org/using-ocr-models-with-llama-cpp)
- [How we OCR'ed 30,000 papers using Codex, open OCR models and Jobs](https://huggingface.co/blog/nielsr/ocr-papers-jobs)
- [Building Harvey-style tabular review from scratch, but better](https://huggingface.co/blog/isaacus/tabular-review)
- [10 Must-use Slash Commands in Claude Code](https://blog.dailydoseofds.com/p/10-must-use-slash-commands-in-claude)
- [OpenAI Codex 超级 App 化](https://www.therundown.ai/p/openai-superapp-hiding-inside-codex)
- [How to Fine-Tune LLMs in 2026](https://blog.dailydoseofds.com/p/how-to-fine-tune-llms-in-2026)

### プラットフォーム境界と市場シグナル
- [Perplexity's agent pivot is on the money](https://www.therundown.ai/p/perplexity-agent-pivot-is-on-the-money)
- [Claude Comes for the Design Stack](https://www.therundown.ai/p/claude-comes-for-the-design-stack)
- [Claude KYC 上线：中国开发者影响解析](https://lukefan.com/2026/04/17/anthropic-claude-selective-kyc-china-user-crackdown/)
- [微软龙虾要来了？CEO 亲自下场，为什么我却不看好？](https://lukefan.com/2026/04/16/microsoft-openclaw-ai-agent-cloud-client-tradeoffs/)
- [Windsurf 2.0 — Agent Command Center](https://windsurf.com)
- [DeepSeek 300M Funding, 10B Valuation](https://lukefan.com/2026/04/20/deepseek-300m-funding-10b-valuation-vie-governance-shift/)
- [北京人形机器人半马](https://lukefan.com/2026/04/21/beijing-humanoid-robot-half-marathon-china-supply-chain/)
- [Sergey Brin commits DeepMind to a Claude catch-up](https://www.therundown.ai/p/sergey-brin-commits-deepmind-to-a-claude-catch-up)
