---
title: "AI Radar Daily: 2026-04-12"
date: 2026-04-12
category: radar
cadence: daily
tags:
  - Agent
  - Harness Engineering
  - OpenClaw
  - Opus
lang: ja
draft: false
---
## 対象範囲

- 取得期間: 2026-04-09〜2026-04-12（過去 72 時間）
- 取得方法: Claude in Chrome のブラウザ操作（navigate + get_page_text + JS 抽出）

---
![llama.cpp OCR 模型支持示意图](https://cdn-thumbnails.huggingface.co/social-thumbnails/blog/ggml-org/using-ocr-models-with-llama-cpp.png)

*代表画像は [Using OCR models with llama.cpp](https://huggingface.co/blog/ggml-org/using-ocr-models-with-llama-cpp) から引用。この日のいちばん実務的なシグナルは、ローカル OCR と軽量マルチモーダルが本当に workflow に入ってきたことだった。*

### 1. 🛠️ AI Engineering & アーキテクチャ

#### Advisor Strategy in Agents
- **出典:** Daily Dose of Data Science
- **リンク:** https://blog.dailydoseofds.com/p/advisor-strategy-in-agents
- **公開:** 2026-04-10/11
- **要点:**
  Anthropic は Claude API に "advisor tool" を追加し、executor として動く Sonnet / Haiku が、難しい判断だけ Opus に相談できるようにした。複雑な推論ポイントだけ高価なモデルに任せ、それ以外は軽いモデルで進めることで、Opus に近い品質を保ちながらコストを大きく下げるという発想だ。多段 agent pipeline の routing とコスト最適化を考えるうえで、かなり実践的な設計パターンになっている。

#### Build Agents That Don't Fail in Production
- **出典:** Daily Dose of Data Science
- **リンク:** https://blog.dailydoseofds.com/p/build-agents-that-dont-fail-in-production
- **公開:** 2026-04-09
- **要点:**
  production-grade な agent を作るための step-by-step ガイドで、tool failure、retry、state persistence、eval 指標といった実務論点をコード付きで整理している。harness 工学のテンプレートとしてかなり使いやすい。

#### Must-Know Cross-Cutting Concerns in API Development
- **出典:** ByteByteGo
- **リンク:** https://blog.bytebytego.com/p/must-know-cross-cutting-concerns
- **公開:** 2026-04-09
- **要点:**
  authentication、logging、rate limiting、input validation といった API の横断的関心事を、標準的な落とし込み方とともに整理した記事。agent / LLM アプリ層の API gateway や middleware 設計に直結する。

#### EP210: Monolithic vs Microservices vs Serverless
- **出典:** ByteByteGo
- **リンク:** https://blog.bytebytego.com/p/ep210-monolithic-vs-microservices
- **公開:** 2026-04-11
- **要点:**
  コードベース、データベース、デプロイ境界の違いを軸に、3 つのアーキテクチャを比較した記事。agentic service 化へ進みたいチームの判断材料になる。

### 2. 🧠 モデル動向 & アルゴリズム

#### Anthropic の Claude advisor tool
- **出典:** Daily Dose of Data Science（Anthropic 公式更新の整理）
- **リンク:** https://blog.dailydoseofds.com/p/advisor-strategy-in-agents
- **公開:** 2026-04-10/11
- **要点:**
  小さい executor モデルが、困難な sub-problem だけ Opus に相談するという API 能力更新。内部 MoE の考え方を API 層へ持ち上げたようなもので、今後の agent framework の routing 戦略に直接影響する。

#### Meta Superintelligence Labs が Muse Spark を公開
- **出典:** Latent Space AINews
- **リンク:** https://www.latent.space/p/ainews-meta-superintelligence-labs
- **公開:** 2026-04-08
- **要点:**
  MSL が新しい技術スタック上で出した最初の frontier model。多 agent モードを持つマルチモーダル推論モデルとして位置づけられており、Gemini / Claude / GPT 系への対抗軸として追う価値がある。

### 3. 💻 実装コード & ツール

#### Using OCR models with llama.cpp
- **出典:** Hugging Face Blog（ngxson @ ggml-org）
- **リンク:** https://huggingface.co/blog/ggml-org/using-ocr-models-with-llama-cpp
- **公開:** 2026-04-10
- **要点:**
  llama.cpp が LightOnOCR、Qianfan-OCR、PaddleOCR-VL、GLM-OCR、Deepseek-OCR、Dots.OCR、HunyuanOCR、さらに LFM2.5-VL-450M、Qwen3-VL-2B、gemma-4-E2B/E4B などをローカル実行できるようになった。4GB VRAM や CPU でも動くため、ローカル文書 RAG や請求書処理に非常に実用的だ。

#### Building Harvey-style Tabular Review from Scratch (but better)
- **出典:** Hugging Face Blog（abdurrahmanbutler @ isaacus）
- **リンク:** https://huggingface.co/blog/isaacus/tabular-review
- **公開:** 2026-04-09
- **要点:**
  法務 / 契約レビュー向けの tabular review アプリを、生成モデルではなく専用の抽出・分類モデルで組み上げた事例。すべての分類結果を元文の span に grounding し、ゼロ hallucination を狙っている。コスト、遅延、精度でも Harvey や Legora を上回る構成を目指しており、合規性の高い場面に参考になる。

### 4. 📰 業界 & ビジネス

#### AI Engineer Europe 2026 回顧
- **出典:** Latent Space
- **リンク:** https://www.latent.space/p/ainews-ai-engineer-europe-2026
- **公開:** 2026-04-10
- **要点:**
  ロンドンでの初回 AI Engineer Europe を振り返る記事。欧州の AI エンジニア生態をざっと掴む入口として使える。

#### Perplexity が銀行口座を接続し、検索から個人金融 agent へ
- **出典:** The Rundown AI
- **リンク:** https://www.therundown.ai/p/perplexity-agent-pivot-is-on-the-money
- **公開:** 2026-04-10
- **要点:**
  Perplexity Computer が Plaid とつながり、1.2 万超の銀行へアクセスできるようになった。自然言語だけで予算、純資産、退職 dashboard を作れるようになり、IRS 連携も相まって ARR が一気に伸びた。検索企業から agentic financial assistant への再定義として、かなり象徴的だ。

#### Hermes Agent vs OpenClaw 実測比較
- **出典:** 老范讲故事
- **リンク:** https://lukefan.com/2026/04/12/hermes-agent-vs-openclaw-lightweight-self-evolving-ai-comparison/
- **公開:** 2026-04-12
- **要点:**
  中国語圏から見た Hermes Agent と OpenClaw の実用比較。代替可能性と限界がどこにあるかを掴む材料になる。

#### Claude Mythos Preview: 公開できないと言われるモデル
- **出典:** 老范讲故事
- **リンク:** https://lukefan.com/2026/04/10/anthropic-claude-mythos-preview-cybersecurity-strategic-release/
- **公開:** 2026-04-10
- **要点:**
  Project GlassWing と Claude Mythos を中国語で整理した記事。サイバー能力と段階的リリース戦略に焦点がある。

#### なぜ大企業は高校生を採り始めたのか
- **出典:** 老范讲故事
- **リンク:** https://lukefan.com/2026/04/09/big-tech-recruiting-high-schoolers-is-college-still-necessary/
- **公開:** 2026-04-09
- **要点:**
  技術記事ではないが、AI 時代における採用若年化と大学の再位置づけを扱っており、人材市場シグナルとして記録価値がある。
