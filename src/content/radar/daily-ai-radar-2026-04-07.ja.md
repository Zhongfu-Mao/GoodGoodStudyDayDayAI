---
title: "AI Radar Daily: 2026-04-07"
date: 2026-04-07
category: radar
cadence: daily
tags:
  - Agent
  - Context Engineering
  - Gemma
  - LLMOps
lang: ja
draft: false
---

## 対象範囲

- 対象期間: 過去 72 時間（2026-04-05〜2026-04-07）
- コード例を含む記事を収録。
- 図解を含む記事を収録し、概念整理に向いている。
- AI for Science 系の再現性が高い記事も含む。

# 今日の見立て

- Agent の競争軸は prompt の工夫から harness、記憶、ツール編成へ移りつつある。
- Gemma 4 により、小型マルチモーダルのオープンモデルが実運用ラインに入ってきた。
- 学習と推論の最適化は、依然として最も確実に効くエンジニアリング投資である。

![Agent Harness の構造図](https://substackcdn.com/image/fetch/$s_!FSSm!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1b2a255e-8439-4212-acea-ff62939cc62a_680x379.png)

*代表画像は [The Anatomy of an Agent Harness](https://blog.dailydoseofds.com/p/the-anatomy-of-an-agent-harness) のビジュアルから選定。この図はその日の主線を最もよく表していて、Agent の差はモデル単体ではなく harness 層の設計から生まれつつあることを示している。*

## 注目記事

- **[The Anatomy of an Agent Harness](https://blog.dailydoseofds.com/p/the-anatomy-of-an-agent-harness)**: Anthropic、OpenAI、Perplexity、LangChain を横断しながら、Agent の差がモデルではなく orchestration、memory、tooling の設計から生まれていることを整理した一本。
- **[AINews Gemma 4: The Best Small Multimodal Open Models](https://www.latent.space/p/ainews-gemma-4-the-best-small-multimodal)**: 小型・マルチモーダル・長文脈・Apache 2.0 という組み合わせが、オープンモデルの実運用ラインを一段押し上げたことを確認できる。
- **[What Are Agent Skills and How Agents Use Them?](https://blog.dailydoseofds.com/p/what-are-agent-skills-and-how-agents)**: Agent skill を登録、呼び出し、合成する流れを図解で整理していて、MCP や function calling を頭の中でつなげ直すのに向いている。

## Engineering & Architecture

- **Agent Harness の分解**：Anthropic、OpenAI、Perplexity、LangChain の違いを見ても、重要なのはフレームワーク名より実行環境設計そのものだった。
- **Coding Agent の基本構成**：ツール呼び出し、短期・長期記憶、リポジトリ文脈、タスク編成が標準モジュールとして見え始めている。
- **Context Engineering**：良い prompt を書くこと以上に、情報密度と文脈の供給方法を設計することが重要になった。

## Models & Open Source

- **Gemma 4 の広がり**：軽量・マルチモーダル・オープンライセンスという組み合わせが強い。
- **Attention 系の再確認**：GQA、MLA、疎注意などの理解が、新モデルを読む前提知識になっている。
- **Causal World Model 議論**：相関学習だけでは足りないという問題意識が強まっている。

## Tools & Business

- **学習・推論最適化**：Gradient Checkpointing と KV Cache は引き続き基本技術。
- **LLMOps 事例**：監視、評価、回復手順をどう組むかが本格的なテーマになっている。
- **組織への波及**：ブラウザの役割、ソロ起業、管理職の再定義など、Agent の影響は技術外にも広がっている。

## Follow-up

- Gemma 4 の端末側デプロイ性能を継続観察する。
- Harness Engineering と Context Engineering を今週の主軸として追う。

## 参照記事

### Engineering & Architecture
- [The Anatomy of an Agent Harness](https://blog.dailydoseofds.com/p/the-anatomy-of-an-agent-harness)
- [Components of A Coding Agent](https://magazine.sebastianraschka.com/p/components-of-a-coding-agent)
- [A Guide to Context Engineering for LLMs](https://blog.bytebytego.com/p/a-guide-to-context-engineering-for)
- [MLOps and LLMOps Case Studies](https://blog.dailydoseofds.com/p/mlops-and-llmops-case-studies)
- [Sam Altman's New 'Social Contract' for AI](https://www.therundown.ai/p/sam-altman-new-social-contract-for-ai)

### Models & Research
- [AINews Gemma 4 Crosses 2 Million Downloads](https://www.latent.space/p/ainews-gemma-4-crosses-2-million)
- [AINews Gemma 4: The Best Small Multimodal Open Models](https://www.latent.space/p/ainews-gemma-4-the-best-small-multimodal)
- [A Visual Guide to Attention Variants in Modern LLMs](https://magazine.sebastianraschka.com/p/visual-attention-variants)
- [Moonlake: Causal World Models](https://www.latent.space/p/moonlake)
- [Run Gemma 4 on Intel® Arc™ GPUs Out-Of-the-Box](https://huggingface.co/blog/MatrixYao/intel-gpu)

### Tools & Libraries
- [A Memory-Efficient Technique to Train Large Models](https://blog.dailydoseofds.com/p/a-memory-efficient-technique-to-train-242)
- [What Are Agent Skills and How Agents Use Them?](https://blog.dailydoseofds.com/p/what-are-agent-skills-and-how-agents)
- [Training mRNA Language Models Across 25 Species for $165](https://huggingface.co/blog/OpenMed/training-mrna-models-25-species)
- [KV Caching Explained: Optimizing Transformer Inference Efficiency](https://huggingface.co/blog/not-lain/kv-caching)

### Industry & Business
- [Marc Andreessen: The Death of the Browser & Why "This Time Is Different"](https://www.latent.space/p/pmarca)
- [AI Just Made the Billion-Dollar Solo Founder Real](https://www.therundown.ai/p/ai-just-made-the-billion-dollar-solo-founder-real)
