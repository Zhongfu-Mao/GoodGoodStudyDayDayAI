---
title: "AI Radar Daily: 2026-04-10"
date: 2026-04-10
category: radar
cadence: daily
tags:
  - Harness Engineering
  - Gemma
  - OpenClaw
  - Managed Agents
lang: ja
draft: false
---

## 対象範囲

- 対象期間: 過去 72 時間（2026-04-08〜2026-04-10）
- 参照ソース: Latent Space · ByteByteGo · Ahead of AI (Sebastian Raschka) · Hugging Face Blog · The Rundown AI · Daily Dose of Data Science

# 今日の見立て

- 「Extreme Harness Engineering」という表現は過激だが、方向性そのものはかなり本質的だ。
- モデル層とプラットフォーム層の境界が急速に引き直されている。
- ソフトウェア開発フローそのものを AI システム設計として見直す動きが強い。

![Extreme Harness Engineering のビジュアル](https://substackcdn.com/image/fetch/$s_!5TXE!,w_1200,h_600,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-video.s3.amazonaws.com%2Fvideo_upload%2Fpost%2F193478192%2Fbac92fb4-46a2-4c8a-b189-083c263423fd%2Ftranscoded-1775581604.png)

*代表画像は [Extreme Harness Engineering](https://www.latent.space/p/harness-eng) のビジュアルから選定。この図は 4 月 10 日の主線に合っていて、実行環境・作業空間・承認フローが新しい能力層になりつつあることを示している。*

## 注目記事

- **[Extreme Harness Engineering](https://www.latent.space/p/harness-eng)**: 0% human code や 0% human review という刺激的な表現の奥で、本当に重要なのは runtime、workspace、approval flow が能力差を作り始めたことだと分かる。
- **[Gemma 4](https://huggingface.co/blog/gemma4)**: open weight モデルがマルチモーダル、端末実行、長文脈を同時に取りに来ている現実を確認するのにちょうどいい。
- **[Anthropic 推出 Claude Managed Agents 公测](https://www.therundown.ai/)**: platform が「モデル API」ではなく「実行中の Agent」を直接提供し始めた、Agent-as-a-Service の初期形として押さえておきたい。

## Engineering & Architecture

- **Extreme Harness Engineering**：注目すべきは 0% human code ではなく、実行環境、承認、作業空間が能力を拡張している点。
- **AI in Software Development 三段階**：補助から agentic workflow への進化が整理されてきた。

## Models & Open Source

- **Gemma 4**：多モーダル、端末動作、オープンライセンスの組み合わせが強い。
- **Open Weight の春**：オープンモデルは「どれだけ GPT に似ているか」から離れ始めている。
- **Muse Spark**：新しい stack を背負った最初のモデルとして見るべき存在。

## Tools & Platforms

- **OpenClaw の存在感**：Agent プラットフォームを直接比較できる段階に来た。
- **多ターン評価と Context Engineering**：LLMOps の重点は評価の設計にある。
- **Claude Managed Agents**：Agent をサービスとして渡すプラットフォーム競争が本格化している。

## Follow-up

- OpenClaw、Managed Agents、本地 harness の住み分けを継続観察する。

## 参照記事

### Engineering & Architecture
- [Extreme Harness Engineering：1M LOC、0% 人类代码、0% 人工审查](https://www.latent.space/p/harness-eng)
- [Latent Space AINews：Anthropic 商业加速 & Claude Mythos 登场](https://www.latent.space/s/ainews)
- [ByteByteGo EP201：AI 在软件开发中的三次演化浪潮](https://blog.bytebytego.com/p/ep201-the-evolution-of-ai-in-software)
- [Meta Superintelligence Labs 发布首款专有模型 Muse Spark](https://www.therundown.ai/p/meta-superintelligence-labs-ships-its-first-model)

### Models & Research
- [Gemma 4：Google 发布真正多模态 + On-Device 开源模型](https://huggingface.co/blog/gemma4)

### Tools & Libraries
- [OpenClaw：2026 年 GitHub 增长最快开源 AI 项目](https://blog.bytebytego.com/p/top-ai-github-repositories-in-2026)
- [Daily Dose of Data Science：LLMOps 系列 — 多轮评估与上下文工程](https://blog.dailydoseofds.com/p/multi-turn-evals-for-llm-apps)
- [Anthropic 推出 Claude Managed Agents 公测](https://www.therundown.ai/)

### Industry & Business
- [Anthropic 发布 Claude Mythos Preview + Project Glasswing 网络安全专项](https://www.anthropic.com/glasswing)
- [ByteByteGo：2026 年 AI 五大趋势展望](https://blog.bytebytego.com/p/whats-next-in-ai-five-trends-to-watch)
