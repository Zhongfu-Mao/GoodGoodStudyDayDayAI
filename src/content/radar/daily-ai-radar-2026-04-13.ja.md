---
title: "AI Radar Daily: 2026-04-13"
date: 2026-04-13
category: radar
cadence: daily
tags:
  - Agent
  - Diffusion LLM
  - GLM
  - Perplexity
lang: ja
draft: false
---

## 対象範囲

- 対象期間: 過去 72 時間（2026-04-11〜2026-04-13）

# 今日の見立て

- Advisor、Parlant、Harness という語が並ぶことで、Agent の設計パターンがかなり見えやすくなった。
- Diffusion LLM や GLM-5.1 は、次のオープンモデル像がまだ固定されていないことを示している。
- 製品側では Perplexity、Anthropic、Microsoft がそれぞれ別の入口を押さえにきている。

![Diffusion LLM の構造図](https://substackcdn.com/image/fetch/$s_!rddo!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F39b9145f-83f4-4fe2-8ee5-1bef29956a35_2263x1504.png)

*代表画像は [The Anatomy of Diffusion LLMs](https://blog.dailydoseofds.com/p/the-anatomy-of-diffusion-llms) のビジュアルから選定。この図は、その日のモデル探索テーマをよく表していて、オープン陣営が Transformer 一辺倒ではない生成経路を試していることを示している。*

## 注目記事

- **[The Anatomy of Diffusion LLMs](https://blog.dailydoseofds.com/p/the-anatomy-of-diffusion-llms)**: Transformer 以外の生成経路を押さえる入門として分かりやすく、open model 側の探索がまだ固まり切っていないことも見えてくる。
- **[Build Agents That Don't Fail in Production](https://blog.dailydoseofds.com/p/build-agents-that-dont-fail-in-production)**: Parlant を例にしながら、state、recovery、authority まわりを production-ready に組む視点が継続して重要だと再確認できる。
- **[Qwen Code v0.14.x 加入 Agent 编排原语](https://www.latent.space/p/ainews-ai-engineer-europe-2026)**: coding agent の道具立てが completion 中心から orchestration primitive 中心へ寄っているのがよく分かる。

## Engineering & Architecture

- **Advisor を一等設計に**：小型モデルが実行し、大型モデルが要所だけ助言する設計は実務的。
- **Parlant と本番 Agent**：状態、回復、権限設計の重要性がより明確になった。
- **Monolith / Microservices / Serverless**：Agent システムもアーキテクチャ選定から逃れられない。
- **Harness 層の固定化**：文脈、プロトコル、技能、記憶、承認が同一レイヤとして見え始めている。

## Models & Open Source

- **Diffusion LLM**：生成経路の再設計として注目。
- **Mythos / Muse Spark / GLM-5.1**：それぞれ gate 付き先端、再出発する研究所、新しい中国系オープンモデルの代表格。

## Tools & Ecosystem

- **llama.cpp OCR、Qwen Code、Unsloth Studio**：本地・可組合せ・非専門家向けという方向が強い。
- **ClawBench / MirrorCode**：評価が現実の作業フローに近づいている。

## Industry

- **Anthropic ARR、Claude for Word、Perplexity pivot**：AI の入口争いがはっきりしてきた。
- **Spotify と API 設計の話**：結局は従来のソフトウェア工学が勝負を決める。

## Follow-up

- GLM-5.1、Qwen Code、ClawBench の動きを継続して見たい。

## 参照記事

### Engineering & Architecture
- [Advisor 模式成为 Agent 一等设计模式](https://blog.dailydoseofds.com/p/advisor-strategy-in-agents)
- [构建不会在生产环境失败的 Agent — Parlant 框架](https://blog.dailydoseofds.com/p/build-agents-that-dont-fail-in-production)
- [Agent Harness 层正在固化为核心抽象](https://www.latent.space/p/ainews-ai-engineer-europe-2026)
- [ByteByteGo: 单体 vs 微服务 vs Serverless](https://blog.bytebytego.com/p/ep210-monolithic-vs-microservices)
- [Claude Mythos Preview — "自 GPT-2 以来首个太危险而不发布的模型"](https://www.latent.space/p/ainews-anthropic-30b-arr-project)
- [Meta Superintelligence Labs 发布 Muse Spark](https://www.latent.space/p/ainews-meta-superintelligence-labs)

### Tools & Libraries
- [llama.cpp 支持多种 OCR 模型本地运行](https://huggingface.co/blog/ggml-org/using-ocr-models-with-llama-cpp)
- [Qwen Code v0.14.x 加入 Agent 编排原语](https://www.latent.space/p/ainews-ai-engineer-europe-2026)
- [Unsloth Studio — 零代码微调 LLM 的本地 GUI](https://blog.dailydoseofds.com/p/advisor-strategy-in-agents)

### Industry & Business
- [Anthropic ARR 一个月内从 $19B 跃至 $30B](https://www.latent.space/p/ainews-anthropic-30b-arr-project)
- [Claude for Word 进入 Beta](https://www.latent.space/p/ainews-ai-engineer-europe-2026)
- [Perplexity 全面转向 Agent 战略](https://www.therundown.ai/p/perplexity-agent-pivot-is-on-the-money)
- [Spotify 每周向 6.75 亿用户发布而不崩溃的秘密](https://blog.bytebytego.com/p/how-spotify-ships-to-675-million)
- [API 开发中的 Cross-Cutting Concerns](https://blog.bytebytego.com/p/must-know-cross-cutting-concerns)
