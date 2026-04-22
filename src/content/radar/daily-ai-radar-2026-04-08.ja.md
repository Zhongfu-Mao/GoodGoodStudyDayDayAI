---
title: "AI Radar Daily: 2026-04-08"
date: 2026-04-08
category: radar
cadence: daily
tags:
  - Agent
  - Mythos
  - Evaluation
  - OCR
lang: ja
draft: false
---

## 対象範囲

- 対象期間: 過去 72 時間（2026-04-06〜2026-04-08）
- 取得メモ: 2026-04-08 | 覆盖过去 72 小时 (2026-04-05 ~ 2026-04-08)
- 参照ソース: Daily Dose of Data Science · Latent Space · ByteByteGo · Ahead of AI · Hugging Face Blog · The Rundown AI

# 今日の見立て

- Agent 開発は「動く」から「どう評価し、どう改善するか」の段階に入った。
- Claude Mythos と Glasswing は、最先端モデルの公開方法が二層化し始めたことを示している。
- OCR、評価、運用事例がツール層で最も実用的なテーマになってきた。

![AI Agent 評価指標の図解](https://substackcdn.com/image/fetch/$s_!pBdt!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdf7d21ad-f026-44d1-8d99-5c6ef69c0842_1357x696.png)

*代表画像は [Six Key Metrics for AI Agent Evaluation](https://blog.dailydoseofds.com/p/six-key-metrics-for-ai-agent-evaluation) のビジュアルから選定。この図は、その日の焦点が「動くかどうか」ではなく「どう評価し、どう修正するか」に移ったことを端的に示している。*

## 注目記事

- **[Six Key Metrics for AI Agent Evaluation](https://blog.dailydoseofds.com/p/six-key-metrics-for-ai-agent-evaluation)**: 完了率だけではなく、回復力、tool use quality、stability をどう見るかまで含めて、Agent 評価を実務向けに言語化している。
- **[AINews Anthropic @ $30B ARR, Project GlassWing and Claude Mythos Preview](https://www.latent.space/p/ainews-anthropic-30b-arr-project)**: Claude Mythos と Project Glasswing を通じて、「危険すぎて一般公開しないモデル」という新しい公開戦略の輪郭が見えた日だった。
- **[How we OCR'ed 30,000 papers using Codex, open OCR models and Jobs](https://huggingface.co/blog/nielsr/ocr-papers-jobs)**: きれいではない文書入力を usable な知識へ変換する工程を、Codex と open OCR で大規模に自動化した実践例として参考になる。

## Engineering & Architecture

- **Harness Engineering の可視化**：大規模な agent harness の議論は、実行環境設計が本題になったことを示している。
- **Context Engineering の深化**：文脈の組み立てと情報選別が prompt より重要になった。
- **データベース進化の教訓**：AI システムでも結局は基盤設計がボトルネックになる。

## Models & Evaluation

- **Claude Mythos / Project Glasswing**：安全保障レベルの能力が、公開戦略そのものを変えている。
- **Gemma 4 の継続拡散**：オープンなマルチモーダル小型モデルが本格的に使われ始めている。
- **Agent 評価指標**：完了率、回復力、ツール利用品質のような指標が重要になってきた。

## Tools & Ecosystem

- **論文 OCR パイプライン**：汚い入力を使える知識に変える工程の価値は依然として高い。
- **LLMOps の基礎整備**：評価、観測、運用フローがモデル性能と同じくらい重要。
- **OpenAI の superapp 物語**：単一入口に機能を集約する方向がさらに強まっている。

## Follow-up

- Agent 評価方法を単独テーマとして整理したい。
- Mythos 型の gate 付きモデル公開が標準になるかを見たい。

## 参照記事

### Engineering & Architecture
- [The Anatomy of an Agent Harness](https://blog.dailydoseofds.com/p/the-anatomy-of-an-agent-harness)
- [Extreme Harness Engineering for Token Billionaires: 1M LOC, 1B toks/day, 0% human code, 0% human review](https://www.latent.space/p/harness-eng)
- [A Guide to Context Engineering for LLMs](https://blog.bytebytego.com/p/a-guide-to-context-engineering-for)
- [Nextdoor's Database Evolution: A Scaling Ladder](https://blog.bytebytego.com/p/nextdoors-database-evolution-a-scaling)

### Models & Research
- [AINews Anthropic @ $30B ARR, Project GlassWing and Claude Mythos Preview — first model too dangerous to release since GPT-2](https://www.latent.space/p/ainews-anthropic-30b-arr-project)
- [AINews Gemma 4 crosses 2 million downloads](https://www.latent.space/p/ainews-gemma-4-crosses-2-million)
- [A Visual Guide to Attention Variants in Modern LLMs *(近期热门，5天内)](https://magazine.sebastianraschka.com/p/visual-attention-variants)

### Tools & Libraries
- [Six Key Metrics for AI Agent Evaluation](https://blog.dailydoseofds.com/p/six-key-metrics-for-ai-agent-evaluation)
- [Components of A Coding Agent](https://magazine.sebastianraschka.com/p/components-of-a-coding-agent)
- [How we OCR'ed 30,000 papers using Codex, open OCR models and Jobs](https://huggingface.co/blog/nielsr/ocr-papers-jobs)
- [MLOps and LLMOps Case Studies](https://blog.dailydoseofds.com/p/mlops-and-llmops-case-studies)

### Industry & Business
- [Anthropic's secret 'Mythos' model + Project Glasswing](https://www.therundown.ai/p/anthropic-secret-mythos-model)
- [Sam Altman's new 'social contract' for AI](https://www.therundown.ai/p/sam-altman-new-social-contract-for-ai)
- [OpenAI's new $122B funding & 'superapp' ambitions](https://www.therundown.ai/p/openai-new-122b-funding-superapp)
