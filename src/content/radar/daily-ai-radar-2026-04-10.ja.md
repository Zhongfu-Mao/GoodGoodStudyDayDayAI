---
title: "AI Radar Daily: 2026-04-10"
date: 2026-04-10
category: radar
cadence: daily
tags:
  - Agent
  - Harness Engineering
  - Context Engineering
  - OpenClaw
lang: ja
draft: false
---
## 対象範囲

- データ期間: 2026-04-07〜2026-04-10（過去 72 時間）
- 参照ソース: Latent Space · ByteByteGo · Ahead of AI（Sebastian Raschka）· Hugging Face Blog · The Rundown AI · Daily Dose of Data Science

---
![Extreme Harness Engineering 主题视觉图](https://substackcdn.com/image/fetch/$s_!5TXE!,w_1200,h_600,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-video.s3.amazonaws.com%2Fvideo_upload%2Fpost%2F193478192%2Fbac92fb4-46a2-4c8a-b189-083c263423fd%2Ftranscoded-1775581604.png)

*代表画像は [Extreme Harness Engineering](https://www.latent.space/p/harness-eng) から引用。この日の本丸が「実行環境・workspace・承認フローこそ新しい能力層になる」という話だったので、先頭にはこの絵が最も自然だった。*

## 1. 🛠️ AI Engineering & アーキテクチャ

### Extreme Harness Engineering: 100 万行、0% 人間コード、0% 人手レビュー
**出典：** Latent Space  
**リンク：** https://www.latent.space/p/harness-eng

OpenAI Frontier の Ryan Lopopolo は、小さなエンジニアリングチームが 5 カ月で 100 万行を超える beta product を構築し、そのあいだ **人間が 1 行もコードを書かず、merge 前 review も 0%** だったことを明かした。エンジニアは PR と CI workflow を通じて Codex Agent を誘導し、アプリ本体、ドキュメント、CI、observability、toolchain まで全部 agent に書かせている。これを支えているのが "Harness Engineering" であり、現時点で最も極端な AI-native software engineering の公開例だ。

### Latent Space AINews: Anthropic の商業加速と Claude Mythos 登場
**出典：** Latent Space  
**リンク：** https://www.latent.space/s/ainews

4 月 6 日から 7 日にかけての AINews は、Anthropic の ARR 急伸と Claude Mythos Preview を中心に回っている。商業面では Anthropic が年内 $90B ARR に達する可能性まで語られ、能力面では Mythos と Glasswing が次の frontier race の主役候補として扱われている。

### ByteByteGo EP201: AI がソフトウェア開発へ入ってきた 3 つの波
**出典：** ByteByteGo  
**リンク：** https://blog.bytebytego.com/p/ep201-the-evolution-of-ai-in-software

ソフトウェア開発における AI の進化を、汎用 LLM → コーディング特化 LLM → agentic coding tool の 3 段階で整理した記事。現在の coding tool がどの段に立っているかを掴むのに向いており、Harness Engineering の実例ともよく噛み合う。

## 2. 🧠 モデル動向 & アルゴリズム

### Gemma 4: 真のマルチモーダル + on-device 開源モデル
**出典：** Hugging Face Blog  
**リンク：** https://huggingface.co/blog/gemma4

Gemma 4 は Apache 2.0 で公開され、E4B MoE と 31B Dense を中心に、画像・テキスト・音声入力を扱える。局所 sliding window attention と global attention を交互に積み、長文脈効率と依存関係保持を両立している。llama.cpp、MLX、WebGPU、Rust などにも広く載っており、端側マルチモーダル開源モデルの本命の一つになった。

### Raschka: Jan-Feb 2026 の開源 LLM 10 本を俯瞰する
**出典：** Ahead of AI  
**リンク：** https://magazine.sebastianraschka.com/p/a-dream-of-spring-for-open-weight

2026 年初頭の重要な開源 LLM 10 本を見渡し、依然として自己回帰 Transformer が主流でありながら、GQA から MLA や線形注意混合への移行が始まっていることを示す。長文脈効率と推論コストの圧縮が、設計の主動機になっている。

### Meta Superintelligence Labs が Muse Spark を出荷
**出典：** The Rundown AI  
**リンク：** https://www.therundown.ai/p/meta-superintelligence-labs-ships-its-first-model

Alexandr Wang 率いる MSL が、音声・画像・テキストを扱う多模態モデル Muse Spark を公開した。複数 agent の「contemplating mode」を備え、推論では Opus 4.6 や GPT 5.4 に近い一方、コーディングや ARC-AGI 2 はまだ追い込み中とされる。閉源で出してきた点も大きい。

### AlphaGenome: 非コード DNA を計算対象に変える
**出典：** The Batch @ DeepLearning.AI  
**リンク：** https://www.deeplearning.ai/the-batch/googles-alphagenome-interprets-dna-that-regulates-genetic-expression/

ゲノムの 98% を占める「非コード領域」をモデル化し、遺伝子発現制御を読む方向の進展。大モデルの表現学習が、単なる研究支援を超えて生命科学の核心問題へ入ってきたシグナルとして重要だ。

### Walrus: 世界モデルが科学計算の側を変え始める
**出典：** The Batch @ DeepLearning.AI  
**リンク：** https://www.deeplearning.ai/the-batch/a-dynamic-fluids-model-appears-to-solve-transformers-pixellation-problem/

世界モデル的な発想が、動画や agent だけでなく、流体・気体・プラズマなどの科学シミュレーションへ広がっていることを示すトピック。高い産業価値を持つ科学計算へ、world model の方法論が流れ込んでいる。

## 3. 💻 実装コード & ツール

### OpenClaw: 2026 年 GitHub で最も伸びた開源 AI プロジェクト
**出典：** ByteByteGo  
**リンク：** https://blog.bytebytego.com/p/top-ai-github-repositories-in-2026

OpenClaw は、ローカルで動く個人 AI assistant / gateway として、WhatsApp、Telegram、Slack、Discord、Signal、iMessage など 50 以上の統合を持つ。Web 操作、form fill、shell command、code execution、スマートホーム制御までこなす一方、権限が広く skill repository 監査も甘いというセキュリティ上の懸念がある。

### LLMOps シリーズ: multi-turn evals と context engineering
**出典：** Daily Dose of Data Science  
**リンク：** https://blog.dailydoseofds.com/p/multi-turn-evals-for-llm-apps

multi-turn consistency、tool use eval、tracing、red teaming のような対話系評価に加え、容量制約のもとで有効信号密度を最大化する context engineering までを高密度に扱うシリーズ。prod LLM app を改善したい人にはかなり実践的だ。

### Anthropic が Claude Managed Agents ベータを公開
**出典：** The Rundown AI  
**リンク：** https://www.therundown.ai/

Anthropic は Claude Managed Agents のパブリックベータを出し、Notion、Rakuten、Asana、Sentry などが先行利用者として名を連ねた。OpenAI の Codex platform と真っ向から競る、agent engineering 民主化の一手と見てよい。

## 4. 📰 業界 & ビジネス

### Claude Mythos Preview + Project Glasswing
**出典：** The Rundown AI / Latent Space  
**リンク：** https://www.anthropic.com/glasswing

Anthropic は Claude Mythos Preview を、サイバーセキュリティ防御用途のみに限定して Glasswing 経由で提供し始めた。主要 OS やブラウザ、重要ソフトウェアにまたがる大量の 0-day 脆弱性を見つけられるとされ、すぐに一般公開しないという判断自体が大きなニュースになっている。

### ByteByteGo: 2026 年 AI の 5 大トレンド
**出典：** ByteByteGo  
**リンク：** https://blog.bytebytego.com/p/whats-next-in-ai-five-trends-to-watch

持続型 Agent、信頼性と安全性、physical AI、test-time scaling、小型開源モデルの実用化という 5 本柱で整理している。戦略レベルの俯瞰に向いている。

*⚠️ 取得補足:*

今回の取得時点では Chrome 拡張が未接続で、Cowork サンドボックス側の外向きネットワーク制限もあり、内容の一部は WebSearch fallback で補った。そのため Daily Dose of DS や ByteByteGo の一部記事は、厳密な発行時刻に若干の誤差がある可能性がある。
