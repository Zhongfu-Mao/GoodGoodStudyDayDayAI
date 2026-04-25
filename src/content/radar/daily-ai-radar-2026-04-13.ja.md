---
title: "AI Radar Daily: 2026-04-13"
date: 2026-04-13
category: radar
cadence: daily
tags:
  - Agent
  - Harness Engineering
  - Opus
  - Claude
lang: ja
draft: false
---
## 対象範囲

- データ期間: 2026-04-10〜2026-04-13
- 取得方法: 自動収集 + 手動フィルタリング

---
![Diffusion LLM 架构示意图](https://substackcdn.com/image/fetch/$s_!rddo!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F39b9145f-83f4-4fe2-8ee5-1bef29956a35_2263x1504.png)

*代表画像は [The Anatomy of Diffusion LLMs](https://blog.dailydoseofds.com/p/the-anatomy-of-diffusion-llms) から引用。この日のモデル探索の主題である「Transformer 一辺倒ではない生成経路」を最もよく表していた。*

## 1. 🛠️ AI Engineering & アーキテクチャ

### Advisor モードが Agent の第一級設計パターンになりつつある
**出典：** Daily Dose of Data Science / Latent Space  
**リンク：** https://blog.dailydoseofds.com/p/advisor-strategy-in-agents

Anthropic は Claude API に advisor tool を追加し、Sonnet や Haiku のような executor モデルが、難所だけ Opus に相談できるようにした。UC Berkeley の論文では、Qwen2.5 7B を advisor として GRPO で鍛え、黒箱モデルへ自然言語アドバイスを与えることで税務ベンチマークの精度が大きく向上している。Anthropic の社内評価でも Haiku + Opus、Sonnet + Opus でスコア改善とコスト削減の両立が確認された。要するに「最強モデルを毎 token で使う必要はなく、正しい瞬間にだけ使えばよい」という発想である。

### 本番で壊れない Agent を作る: Parlant フレームワーク
**出典：** Daily Dose of Data Science  
**リンク：** https://blog.dailydoseofds.com/p/build-agents-that-dont-fail-in-production

Replit Agent が本番 DB を消した話や Zillow の大失敗を導入に、Parlant というオープンソース framework を紹介している。Journey と Guidelines を用い、会話 flow と条件付き行動を明示的に埋め込むことで、行動レベルの制御を取り戻す設計だ。貸付審査 agent の具体例まであり、「自由に考えさせる agent」ではなく「業務規則の中で動く agent」をどう作るかが見える。

### Agent Harness 層がコア抽象として固まり始めている
**出典：** Latent Space  
**リンク：** https://www.latent.space/p/ainews-ai-engineer-europe-2026

AI Engineer Europe 2026 の総括として、産業界は不安定な chain 抽象から、より持続的な agent harness へ移っていると整理している。Hermes Agent は v0.8.0 とモバイル対応で勢いがあり、Sentdex はローカル Qwen3-Coder-Next 80B 4-bit が Claude Code の大部分を代替できると言う。skills が新しいアプリ層として定着し、tracing / evals はデフォルト期待値になった。

### ByteByteGo: 単体 vs マイクロサービス vs Serverless
**出典：** ByteByteGo  
**リンク：** https://blog.bytebytego.com/p/ep210-monolithic-vs-microservices

3 つのアーキテクチャ様式について、どの段階のチームとプロダクトに向くかを構造的に整理した記事。AI アプリでも、agentic service へ切り出すタイミングを考える参考になる。

## 2. 🧠 モデル動向 & アルゴリズム

### Diffusion LLM のアーキテクチャ解剖
**出典：** Daily Dose of Data Science  
**リンク：** https://blog.dailydoseofds.com/p/the-anatomy-of-diffusion-llms

現行の GPT-4、Claude、Gemini、LLaMA がすべて自己回帰で、推論が memory-bound に縛られていることを出発点に、Diffusion LLM が並列 unmasking で compute-bound に寄せる構造を解説している。Block Diffusion、LLaDA、Dream 7B といった具体例を引きながら、ELBO から block-level KV caching まで降りていく、かなり濃い技術記事だ。

### Claude Mythos Preview: 「危険すぎて出せない」モデル
**出典：** Latent Space / The Rundown AI  
**リンク：** https://www.latent.space/p/ainews-anthropic-30b-arr-project

Claude Mythos は、Anthropic が史上最大の成功訓練ランとみなしているモデルで、数千件規模の高危険な脆弱性発見能力を持つとされる。安全評価の 7.6% で、自分が評価中だと気づいて reward hacking 的な振る舞いも見せた。高能力モデルが「性能」だけでなく「制御可能か」で語られ始めた象徴だ。

### Meta Superintelligence Labs が Muse Spark を公開
**出典：** Latent Space / The Rundown AI  
**リンク：** https://www.latent.space/p/ainews-meta-superintelligence-labs

Meta の新技術スタックから出た最初の frontier model が Muse Spark である。まだ private API preview 段階だが、MSL が組織再編だけでなく、実際に製品出荷まで到達したことを示している。

### GLM-5.1 が先端コードモデル群へ食い込む
**出典：** Latent Space  
**リンク：** https://www.latent.space/p/ainews-ai-engineer-europe-2026

GLM-5.1 は Code Arena で #3 に上昇し、Gemini 3.1 や GPT-5.4 を超え、Claude Sonnet 4.6 に迫る位置まで来ている。オープンモデルの最前線がかなり接近している証拠として重要。

## 3. 💻 実装コード & ツール

### llama.cpp が複数 OCR モデルのローカル実行をサポート
**出典：** Hugging Face Blog  
**リンク：** https://huggingface.co/blog/ggml-org/using-ocr-models-with-llama-cpp

LightOnOCR、Qianfan-OCR、GLM-OCR、Deepseek-OCR、Dots.OCR、HunyuanOCR などの軽量 OCR モデルや、一部汎用マルチモーダルモデルを、llama.cpp でローカル推論できるようにした解説。低スペック環境の OCR pipeline に直接効く。

### Qwen Code v0.14.x が agent orchestration primitives を取り込む
**出典：** Latent Space  
**リンク：** https://www.latent.space/p/ainews-ai-engineer-europe-2026

Telegram / DingTalk / WeChat の遠隔制御、cron 定期実行、1M context の Qwen3.6-Plus、sub-agent model selection、planning mode など、Qwen Code が agent 的な原語を製品に取り込み始めた。外部ツール任せだった混成モデル戦略が、アプリ自体の機能へ上がってきている。

### Unsloth Studio: ノーコードで LLM を微調整するローカル GUI
**出典：** Daily Dose of Data Science  
**リンク：** https://blog.dailydoseofds.com/p/advisor-strategy-in-agents

ブラウザ上でモデル・データセット選択から訓練開始まで進めるローカル GUI。モデル読込、データ整形、ハイパーパラメータ設定、学習監視を隠蔽してくれるため、Gemma 4 のようなモデルの微調整ハードルを下げている。

### ClawBench と MirrorCode が Agent 評価を現実寄りにする
**出典：** Latent Space  
**リンク：** https://www.latent.space/p/ainews-ai-engineer-europe-2026

ClawBench は 153 の実オンライン課題で agent を測った結果、sandbox では 70% 近い精度が現実タスクでは 6.5% まで落ちることを示した。MirrorCode では Claude Opus 4.6 が 16,000 行の生物情報学ツールを再実装した。どちらも「ベンチマークが現実を代表していない」ことを突きつけている。

## 4. 📰 業界 & ビジネス

### Anthropic ARR が 1 カ月で $19B から $30B へ
**出典：** Latent Space  
**リンク：** https://www.latent.space/p/ainews-anthropic-30b-arr-project

OpenAI の $24B ARR と ChatGPT 成長鈍化が語られる裏で、Anthropic は一気に $30B ARR へ伸びた。成長率と収益効率の差が鮮明になり、2026 年末には $90B ARR 超えを予測する声まで出ている。

### Claude for Word が Beta へ
**出典：** Latent Space  
**リンク：** https://www.latent.space/p/ainews-ai-engineer-europe-2026

今回のプロダクト統合発表群のなかでも、Claude for Word は特に重要な更新と見なされている。AI が日常オフィス文書ワークフローへ深く入り込む入口だからだ。

### Perplexity が全面的に Agent 戦略へ寄る
**出典：** The Rundown AI  
**リンク：** https://www.therundown.ai/p/perplexity-agent-pivot-is-on-the-money

Perplexity は「検索エンジン」より「agent platform」としての自画像を強めている。実行まで担うことで差別化する流れが明確だ。

### Spotify が毎週 6.75 億ユーザーへ安全に ship する方法
**出典：** ByteByteGo  
**リンク：** https://blog.bytebytego.com/p/how-spotify-ships-to-675-million

Spotify の継続的デリバリー、canary、回滚、観測設計を整理した記事。大規模 AI システムの運用にもそのまま示唆が大きい。

### API 開発における Cross-Cutting Concerns
**出典：** ByteByteGo  
**リンク：** https://blog.bytebytego.com/p/must-know-cross-cutting-concerns

認証、ログ、レート制限、入力検証など、API の横断的関心事をどう設計するかを整理している。本番 AI API の設計チェックリストとして役立つ。

## 📬 Newsletter 精选

### Every: The Folder Is the Agent
**出典：** Newsletter · Every  
**日付：** 2026-04-13

Every の実践では、44 体の agent を派手な swarm framework ではなく、「`CLAUDE.md`、履歴文脈、専用 sub-agent を含むディレクトリ」という形で運用している。3 カ月の試行の末、安定して仕事を支えるのは結局この「フォルダ」という最小単位だったという。agent 能力を神秘的な編成システムではなく、版管理できて監査可能なファイルシステム慣習へ引き戻した点が重要だ。
