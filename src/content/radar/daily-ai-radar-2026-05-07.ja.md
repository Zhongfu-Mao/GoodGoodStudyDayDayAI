---
title: "AI レーダー日報：2026-05-07"
date: 2026-05-07
category: radar
cadence: daily
plainSummary: "今日の AI レーダーは、セルフホスト型 Deep Research スタック、オンライン RL における vLLM V1 移行の正しさ、Gemma 4 / llama.cpp の MTP 推論高速化、ASR の非公開評価セット、そしてモデル企業が API から企業導入・垂直ワークフローへ広がる動きに注目します。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agent
  - AI Infrastructure
  - Evaluation
lang: ja
coverImage: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/images/radar/daily-ai-radar-2026-05-07.ja-infographic.webp
audioUrl: "https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-05-07.ja.mp3"
audioDuration: 890
audioSize: 7124095
draft: false
---

## 対象期間

- 対象期間：2026-05-04 から 2026-05-07 まで。

---
![Build a Deep Researcher That Beats OpenAI, Gemini, and Perplexity](https://substackcdn.com/image/fetch/$s_!ndas!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F34fbc4d4-b55d-4ad2-ba3a-5f86f1255424_680x380.png)

*代表画像は [Build a Deep Researcher That Beats OpenAI, Gemini, and Perplexity](https://blog.dailydoseofds.com/p/build-a-deep-researcher-that-beats) から。この記事の主線を最もよく表す元シグナルとして選んでいます。*

## カバー画像メモ

今日のカバーは「AI エンジニアリングの階層図」として描くと分かりやすい。下層には vLLM、MTP drafter、SGLang、Decoupled DiLoCo などの推論・学習基盤、中層には Onyx、CrewAI、agent harness、observability feedback loop のような監査可能な実装フレーム、上層には企業導入会社、金融・医療ワークフロー、豆包の課金階層を置く構図。モデル能力が、統制でき、課金でき、納品できる業務システムへ再包装されている流れを表す。

## 1. AI Engineering & アーキテクチャ

### Onyx + CrewAI + Voxtral によるセルフホスト型 Deep Research スタック

- 出典：Daily Dose of Data Science
- 日付：2026-05-06
- リンク：https://blog.dailydoseofds.com/p/build-a-deep-researcher-that-beats
- 要約：この記事は Onyx、CrewAI、Voxtral を組み合わせ、完全にオープンソースで自前運用できる deep researcher を構成している。狙いは、クエリ、社内文書インデックス、権限同期、監査を自社インフラ内に留めることだ。Onyx は hybrid retrieval、RRF reranking、文脈拡張、引用統合を担い、CrewAI は Flow によって Researcher、Analyst、Report Writer を分離し、Voxtral は音声入力とレポート読み上げを加える。単なる代替ツールではなく、規制産業や機密性の高い知識業務向けの監査可能な構成として重要。

### vLLM V1 移行は、オンライン RL ではまずバックエンドの正しさを直すべきだと示した

- 出典：Hugging Face / ServiceNow AI
- 日付：2026-05-06
- リンク：https://huggingface.co/blog/ServiceNow-AI/correctness-before-corrections
- 要約：ServiceNow AI は PipelineRL を vLLM V0 から V1 に移行した際の train-inference mismatch を詳しく整理した。rollout logprobs の意味、prefix caching、async scheduling、inflight weight update、`fp32 lm_head` が policy ratio、KL、clip rate、reward に影響する。重要なのは、まず推論バックエンドを参照実装に合わせ、その後で truncated importance sampling などの目的関数側の補正を検討するという順序だ。

### Agent harness の品質がプロダクト差別化要因になっている

- 出典：Latent Space
- 日付：2026-05-06
- リンク：https://www.latent.space/p/ainews-silicon-valley-gets-serious
- 要約：Latent Space は coding agent の差を、モデル単体の性能ではなく Model-Harness-Task fit として整理している。同じモデルでも instructions、tools、context packing、measurement loop が違えば挙動は大きく変わる。ACP 的な分離も重要になりつつあり、CLI、TUI、GUI、IDE の前面は入れ替えられても、下層の harness、タスク状態、権限、評価ループは一貫している必要がある。

### Agent observability は trace からフィードバック駆動の改善ループへ進む

- 出典：Latent Space
- 日付：2026-05-06
- リンク：https://www.latent.space/p/ainews-silicon-valley-gets-serious
- 要約：LangChain まわりの議論では、trace だけでは本番 agent の改善には足りないという見方が強まっている。直接・間接・生成型のフィードバックを各実行に結び付け、「データ収集 → エラー抽出 → 失敗コンポーネントの特定 → 修正 → テスト」の循環を回す必要がある。Raindrop Triage のような agent 挙動調査ツールは、可観測性がログ閲覧から継続改善システムへ変わっていることを示している。

## 2. モデル最前線 & アルゴリズム探索

### Open ASR Leaderboard が非公開データセットで benchmaxxing に対抗

- 出典：Hugging Face
- 日付：2026-05-06
- リンク：https://huggingface.co/blog/open-asr-leaderboard-private-data
- 要約：Hugging Face は Open ASR Leaderboard に、Appen と DataoceanAI が提供する非公開の英語 ASR テストセットを追加した。scripted / conversational speech、多様なアクセントを含むが、デフォルトの Average WER は引き続き公開データのみで計算される。個別 split の点数は出さず、provider average、scripted/conversational、US/non-US などの集約指標で見せる設計は、透明性とテスト汚染対策を両立するための現実的な折衷案になっている。

### Gemma 4 MTP drafter が speculative decoding をオープンスタックへ押し出す

- 出典：Latent Space / Google
- 日付：2026-05-06
- リンク：https://www.latent.space/p/ainews-silicon-valley-gets-serious
- 要約：Google は Gemma 4 multi-token prediction drafter を公開し、出力品質を保ったままデコード速度を最大 2〜3 倍高めることを狙っている。注目点はエコシステム対応の速さで、Transformers、vLLM、MLX、SGLang、Ollama、AI Edge が素早く接続している。speculative-style decoding が研究テクニックから、モデル公開時の標準付属機能へ移りつつある。

### ProgramBench は「ゼロから完全なリポジトリを生成する」難しさを露出した

- 出典：Latent Space / Meta
- 日付：2026-05-06
- リンク：https://www.latent.space/p/ainews-silicon-valley-gets-serious
- 要約：Meta の ProgramBench は 200 タスクで構成され、starter code もインターネットもない状態から、SQLite、FFmpeg、PHP compiler のような大きめのソフトウェア成果物を executable spec に沿って生成させる。厳格な「全テスト合格」指標では最高モデルでも accuracy は 0%。平均的に一部テストを通すことと、実際に納品できるシステムを作ることの間に大きな差があることを示している。

### Long-horizon agentic RL のボトルネックは reward から horizon 管理へ移りつつある

- 出典：Latent Space
- 日付：2026-05-06
- リンク：https://www.latent.space/p/ainews-silicon-valley-gets-serious
- 要約：本号では LLM 時代の RL environment frameworks、Forge / ROLL / Slime / Seer などの agentic RL システム、Microsoft の goal horizon 研究が並んでいる。共通する信号は、長いタスクでの失敗はモデル容量だけでは説明できず、環境並列、rollout latency、TITO consistency、prefix-tree merge、global KV cache、macro action 設計が重要になるという点だ。

## 3. 実装コード & ツールライブラリ

### llama.cpp が MTP beta に対応し、Qwen3.x 推論で 2 倍超のスループットを狙う

- 出典：Latent Space / llama.cpp
- 日付：2026-05-06
- リンク：https://github.com/ggml-org/llama.cpp/pull/22673
- 要約：llama.cpp の MTP beta PR により、Qwen3.x の MTP コンポーネントを同一 GGUF から独立モデルとして読み込み、専用の context / KV cache を持たせられるようになる。コミュニティのテストでは、3 draft tokens で steady-state acceptance が約 75%、Qwen3.6 27B / 35B-A3B で baseline の 2 倍を超える token generation が報告されている。安定化すれば、ローカル推論とサーバー側推論スタックの速度差を縮める大きな更新になる。

### Cursor CI Agent と Devin for Security が agent ワークフローを実運用イベントへ接続

- 出典：Latent Space / Cursor / Cognition
- 日付：2026-05-06
- リンク：https://www.latent.space/p/ainews-silicon-valley-gets-serious
- 要約：Cursor は GitHub を監視して CI 失敗を自動修正する agents を発表し、Cognition は脆弱性修正とコードレビューに向けた Devin for Security を出した。重要なのは「新しいコード補助」ではなく、CI の赤信号、セキュリティ警告、悪意ある依存、修正 PR、承認フローといった本番イベントが agent の操作単位になっていることだ。

### RadixArk が SGLang と Miles を軸に、オープンな本番 AI Infra に賭ける

- 出典：Latent Space
- 日付：2026-05-06
- リンク：https://www.latent.space/p/ainews-silicon-valley-gets-serious
- 要約：RadixArk は SGLang 推論スタックと Miles 大規模 RL / post-training システムを軸に、1 億ドルの seed を発表した。狙いは単体の推論 API ではなく、scheduling、KV-cache 管理、rollout、kernel、多ハードウェア対応、学習と推論の協調といった、各チームが何度も自作してきた基盤能力を本番品質でまとめることにある。

## 4. 業界 & ビジネス速報

### 豆包が 68 / 200 / 500 元の課金をテストし、中国 AI の無料時代に階層化圧力がかかる

- 出典：老范讲故事
- 日付：2026-05-07
- リンク：https://lukefan.com/2026/05/07/bytedance-doubao-ai-subscription-pricing/
- 要約：記事は豆包の App Store ページに現れた 68、200、500 元のサブスクリプションを、中国 AI アシスタントが無料獲得から階層型運営へ移る兆候として見ている。複雑なタスク、PPT、データ分析、動画生成のような高コスト機能が先に増値機能へ分離される可能性が高い。豆包が 3.45 億 MAU の入口優位を持つため、ByteDance は「高い知能には料金が発生する」というユーザー認識を先に作り、競合に課金判断を迫る立場にある。

### 継続追跡：Anthropic と OpenAI はモデル企業から企業導入会社へ拡張している

- 出典：Latent Space
- 日付：2026-05-06（前回収録：2026-05-06）
- リンク：https://www.latent.space/p/ainews-silicon-valley-gets-serious
- 要約：昨日の「企業 Agent の難所は文脈、権限、引き継ぎである」という流れに対し、本号はより明確な資本と組織形態を補足している。Anthropic と Blackstone、Hellman & Friedman、Goldman Sachs の企業サービス JV は約 15 億ドル規模、OpenAI の The Deployment Company には複数の PE が参加している。新しいシグナルは、モデルラボが API 販売だけでなく、業務プロセス改造、文脈接続、変更管理、業界データの循環まで抱えに行っていることだ。

### 金融、医療、プロアクティブ助手がモデル企業の垂直化実験場になる

- 出典：Latent Space / Anthropic / Perplexity
- 日付：2026-05-06
- リンク：https://www.latent.space/p/ainews-silicon-valley-gets-serious
- 要約：Anthropic は pitch generation、valuation review、KYC screening、month-end close を含む金融サービス向け agent templates を公開し、FactSet、S&P Global、Morningstar などのデータ源に接続した。Perplexity は Professional Finance workflows と専門医療情報へのアクセスを広げている。垂直化の本質は「業界に詳しいチャット」ではなく、許諾データ、固定タスクテンプレート、監査可能な出力、反復可能なワークフローをまとめて製品化することにある。

