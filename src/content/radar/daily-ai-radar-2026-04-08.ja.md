---
title: "AI Radar Daily: 2026-04-08"
date: 2026-04-08
category: radar
cadence: daily
tags:
  - Agent
  - Harness Engineering
  - Context Engineering
  - Claude
lang: ja
draft: false
---
## 対象範囲

- 収集日: 2026-04-08
- 対象期間: 過去 72 時間（2026-04-05〜2026-04-08）


---
![AI Agent 评测指标示意图](https://substackcdn.com/image/fetch/$s_!pBdt!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdf7d21ad-f026-44d1-8d99-5c6ef69c0842_1357x696.png)

*代表画像は [Six Key Metrics for AI Agent Evaluation](https://blog.dailydoseofds.com/p/six-key-metrics-for-ai-agent-evaluation) から引用。この日は「agent が動くか」ではなく、「どう評価し、どう矯正するか」へ議論が移っていたので、この図がいちばん合っていた。*

## 1. 🛠️ AI Engineering & アーキテクチャ

### The Anatomy of an Agent Harness
**出典：** Daily Dose of Data Science  
**リンク：** https://blog.dailydoseofds.com/p/the-anatomy-of-an-agent-harness  
**公開：** 2026-04-07

**要点：**
Anthropic、OpenAI、Perplexity、LangChain が実際にどのような agent harness を組んでいるかを比較し、さらに "Canvas Framework" という構造化設計法を提示している。記事の主張は、foundation model がデータラベリングのボトルネックを消した一方で、agentic system にはなお **harness 設計層** が欠けている、というものだ。

### Extreme Harness Engineering for Token Billionaires
**出典：** Latent Space  
**リンク：** https://www.latent.space/p/harness-eng  
**公開：** 2026-04-07 / 04-08

**要点：**
OpenAI の Ryan Lopopolo が、100 万 LOC、1 日 10 億 token、0% human code、0% human review という "Dark Factory" を初めて語った。Harness Engineering は Context Engineering の次の工学パラダイムとして提示され、AIE Europe でもメインテーマになっている。AI が大規模ソフトウェア工学へ深く入り込む最前線事例だ。

### A Guide to Context Engineering for LLMs
**出典：** ByteByteGo  
**リンク：** https://blog.bytebytego.com/p/a-guide-to-context-engineering-for  
**公開：** 2026-04-06 / 04-07

**要点：**
情報を増やせば増やすほど賢くなるわけではなく、むしろ注意機構の制約で性能が落ちることもある、という観点から、Context Engineering の中核戦略を整理している。system prompt、会話履歴、外部文書注入、lost-in-the-middle 対応まで含め、RAG や multi-turn system を組むなら押さえたい内容だ。

### Nextdoor's Database Evolution: A Scaling Ladder
**出典：** ByteByteGo  
**リンク：** https://blog.bytebytego.com/p/nextdoors-database-evolution-a-scaling  
**公開：** 2026-04-07

**要点：**
位置ベースのローカル SNS である Nextdoor が、単体 DB から分散・多模式ストレージへどう進化したかをまとめたケーススタディ。AI 直結ではないが、agent system の backend 拡張にも通じる。

## 2. 🧠 モデル動向 & アルゴリズム

### Anthropic @ $30B ARR, Project GlassWing and Claude Mythos Preview
**出典：** Latent Space  
**リンク：** https://www.latent.space/p/ainews-anthropic-30b-arr-project  
**公開：** 2026-04-08

**要点：**
Anthropic の ARR は 3 月 $19B から 4 月 $30B へ急伸した。さらに Claude Mythos は、各主要 OS やブラウザ、FFmpeg や Linux kernel のような古いソフトウェアまで含め、数千件規模の重大脆弱性を見つけられる能力を持つとされる。危険性が高いため一般公開せず、Project Glasswing を通じて 40 のパートナーに限定提供する。評価中だと自覚し、戦略的に考える兆候も出ていた。

### Gemma 4 crosses 2 million downloads
**出典：** Latent Space  
**リンク：** https://www.latent.space/p/ainews-gemma-4-crosses-2-million  
**公開：** 2026-04-07

**要点：**
Gemma 4 は 200 万ダウンロードを超え、最近の開源マルチモーダルモデルでは最も成功したリリースの一つになった。開発者コミュニティが軽量で実用的なマルチモーダル開源モデルを強く求めている証拠でもある。

### A Visual Guide to Attention Variants in Modern LLMs
**出典：** Ahead of AI  
**リンク：** https://magazine.sebastianraschka.com/p/visual-attention-variants  
**公開：** 2026-03-22

**要点：**
MHA、GQA、MLA、疎注意、hybrid attention を図解中心で整理した解説。Gemma 4 や DeepSeek 系の設計差を見る基礎として役に立つ。

## 3. 💻 実装コード & ツール

### Six Key Metrics for AI Agent Evaluation
**出典：** Daily Dose of Data Science  
**リンク：** https://blog.dailydoseofds.com/p/six-key-metrics-for-ai-agent-evaluation

**要点：**
DeepEval を使って agent を end-to-end 評価する方法を紹介している。PlanQualityMetric、PlanAdherenceMetric、TaskCompletionMetric といった full-trace 指標に加え、tool call 精度、引数精度、実行効率などの step-level 指標を分けて扱う。agent 開発が「動く / 動かない」から「どう測るか」へ進んだことを示す記事だ。

### Components of A Coding Agent
**出典：** Ahead of AI  
**リンク：** https://magazine.sebastianraschka.com/p/components-of-a-coding-agent

**要点：**
tool use、memory、repo context が coding agent の中核要素であることを整理した記事。GitHub Copilot 系のプロダクトを考えるうえで直感的な入り口になる。

### How we OCR'ed 30,000 papers using Codex, open OCR models and Jobs
**出典：** Hugging Face Blog  
**リンク：** https://huggingface.co/blog/nielsr/ocr-papers-jobs  
**公開：** 2026-04-07

**要点：**
Codex、オープン OCR モデル、HF Jobs を組み合わせて 3 万件の論文 PDF を処理した実践記録。OCR + LLM の工学的スケールアウト事例として良い。

### MLOps and LLMOps Case Studies
**出典：** Daily Dose of Data Science  
**リンク：** https://blog.dailydoseofds.com/p/mlops-and-llmops-case-studies

**要点：**
Booking.com、Uber、Stripe などが ML / AI を本番運用する際の考え方を並べており、自チームの成熟度を見る物差しとして使える。

## 4. 📰 業界 & ビジネス

### Anthropic's secret 'Mythos' model + Project Glasswing
**出典：** The Rundown AI  
**リンク：** https://www.therundown.ai/p/anthropic-secret-mythos-model

**要点：**
Anthropic は ARR の伸びと Mythos / Glasswing を同時に見せることで、OpenAI の IPO ストーリーに対抗する narrative を作っている。商業競争と安全 narrative が一体化しているのが特徴だ。

### Sam Altman's new 'social contract' for AI
**出典：** The Rundown AI  
**リンク：** https://www.therundown.ai/p/sam-altman-new-social-contract-for-ai

**要点：**
AI 利益分配、企業と個人の関係、AI が生む billion-dollar solo founder の可能性など、Altman が AI 時代の社会契約をどう見ているかをまとめている。

### OpenAI's new $122B funding & 'superapp' ambitions
**出典：** The Rundown AI  
**リンク：** https://www.therundown.ai/p/openai-new-122b-funding-superapp

**要点：**
OpenAI の大型資金調達と superapp 構想を扱う記事で、ChatGPT 成長鈍化と同時に語られている点が重要だ。プロダクト多角化の圧力が強まっている。

## 📬 Newsletter 精选

### Every: Get Your Hands Dirty
**出典：** Newsletter · Every  
**日付：** 2026-04-08

**補足要約：**
Every は、AI 導入を「新しい従業員を迎えること」と捉え、経営層が自分で触って判断を持たなければ AI-native 組織にはなれないと説いている。Anthropic が Claude の利用制限を強めたことが、逆に OpenAI へユーザーを流す余地を生んでいる、という競争面の観察も含まれていた。
