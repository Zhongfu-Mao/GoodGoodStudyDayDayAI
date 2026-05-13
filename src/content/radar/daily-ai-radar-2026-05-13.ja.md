---
title: "AIレーダー日報：2026-05-13"
date: 2026-05-13
category: radar
cadence: daily
plainSummary: "今日は Figma のリアルタイムデータ基盤、speculative decoding、Thinking Machines のリアルタイム対話モデル、EMO のモジュール型 MoE、長時間 Agent の信頼性、軽量 tool-calling model に注目します。"
difficulty: intermediate
tags:
  - AI Engineering
  - Inference
  - Agent
  - Model Architecture
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-05-13.ja-infographic.webp
audioUrl: /audio/radar/daily-ai-radar-2026-05-13.ja.mp3
audioDuration: 1086
audioSize: 8692069
draft: false
---

## 対象期間

- 対象期間：2026-05-10 から 2026-05-13 まで。

---
![EMO modular mixture-of-experts overview](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/CPWUSB64LhBEjMI0Rgg6L.png)

*代表画像は [EMO: Pretraining mixture of experts for emergent modularity](https://huggingface.co/blog/allenai/emo) から。この記事の主線を最もよく表す元シグナルとして選んでいます。*

## 代表画像の説明

今日の主線は「AI システムが、単体モデルの能力から、組み合わせ可能で、検証可能で、長時間動かせるエンジニアリング形態へ移っている」です。Figma の CDC パイプライン、LangGraph の増分 checkpoint、speculative decoding、Modal の推論スタックは、スループット、遅延、正しさ、状態管理を解いています。一方で Thinking Machines、EMO、Needle、Every の long-horizon agent 議論は、モデル側でも対話、モジュール化、tool calling、長期信頼性を前提に境界を設計し直していることを示しています。

## 1. AI Engineering & アーキテクチャ

### Figma は数日遅れのデータ同期を near real-time CDC 基盤へ作り替えた

- 出典：ByteByteGo / Figma Engineering
- 日付：2026-05-13
- リンク：https://blog.bytebytego.com/p/how-figma-upgraded-data-pipeline
- 要約：Figma の旧パイプラインは、毎日テーブル全体を S3 / Snowflake にコピーする全量同期でした。プロダクトとデータ量が増えるにつれ、最大テーブルは数日遅れになり、専用 DB replica のコストも大きくなりました。新構成は Amazon RDS snapshot、Kafka CDC stream、Snowflake stored procedure を使った増分同期で、標準は 3 時間ごとの merge、重要領域は分単位まで短縮できます。特に重要なのは独立 validation workflow で、一時 schema を別経路で bootstrap し、同じ CDC 時点にそろえて cell 単位で比較するため、主系の静かな破損を同じ経路の検査で見逃しにくくなっています。

### Daily Dose は Claude から Hugging Face モデルを直接 fine-tune する MCP App を示した

- 出典：Daily Dose of Data Science / mcp-use
- 日付：2026-05-13
- リンク：https://github.com/patchy631/ai-engineering-hub/tree/main/finetune-studio-mcp-app
- 要約：この fine-tuning studio は、HF Hub のモデル / データセット検索、chat template 整形、LoRA rank、quantization、batch size、learning rate、AutoTrain GPU 学習を Claude から操作できる MCP App としてまとめています。基盤には open-source の `mcp-use` SDK が使われ、MCP tool handler と React UI widget を結びつけます。価値は単なる微調整スクリプトではなく、Agent がツールを呼ぶだけでなく、パラメータ設定と学習フィードバックを含む操作パネルをネイティブに扱える設計例である点です。

### LangGraph DeltaChannel は長時間 Agent の状態保存を全量 snapshot から増分イベントへ寄せる

- 出典：Latent Space
- 日付：2026-05-12
- リンク：https://www.latent.space/p/ainews-thinking-machines-native-interaction
- 要約：Latent Space は、LangGraph の DeltaChannel が全状態 checkpoint を置き換え、durable execution、message history、deepagents v0.6 のファイル保存を支える方向に進んでいると整理しています。長時間 Agent では、各ステップで状態全体を保存すると、ストレージ、復旧、再実行のコストがすぐ膨らみます。増分チャネルは event sourcing に近く、長時間動作、復旧、監査が必要な Agent では、prompt 設計以上に重要な状態層になります。

### 推論サービスは「Kubernetes に載せるだけ」ではなく専用 runtime の問題になっている

- 出典：Latent Space / Modal / Perceptron
- 日付：2026-05-13
- リンク：https://www.latent.space/p/ainews-the-end-of-finetuning
- 要約：Latent Space は Modal の見方として、AI inference stack には cold start、GPU checkpoint、cloud-native cache、CRIU、動画入力、structured outputs、hybrid reasoning など専用の処理が必要だと整理しています。Perceptron Mk1 のように、テキストだけでなく動画フレーム、空間オブジェクト、長い文脈を扱うモデルでは、この問題がさらに大きくなります。モデル serving の競争は、モデルそのものだけでなく、runtime、スケジューリング、キャッシュのシステム層へ移っています。

## 2. モデル最前線 & アルゴリズム探索

### Thinking Machines は 276B / 12B active のリアルタイム対話モデルをプレビューした

- 出典：Latent Space / Thinking Machines
- 日付：2026-05-12
- リンク：https://www.latent.space/p/ainews-thinking-machines-native-interaction
- 要約：TML-Interaction-Small は 276B parameters、12B active の MoE で、連続する音声、映像、テキストを native に扱う interaction model として設計されています。これは turn-based LLM に音声層を後付けする発想とは違います。記事では、200ms 単位の time-aligned microturns、割り込み、同時翻訳、視覚的な proactive response、動作カウント、時間位置決めが強調され、TimeSpeak、CueSpeak、RepCount-A、ProactiveVideoQA などの評価も紹介されています。重要なのは、いつ話すか、いつ黙るか、いつ見て先に反応するかがモデル能力になっている点です。

### EMO は文書単位 routing で MoE expert を意味的モジュールへ自然に分化させる

- 出典：Hugging Face Blog / Ai2
- 日付：2026-05-09（時間窓をやや超過）
- リンク：https://huggingface.co/blog/allenai/emo
- 要約：EMO は 14B total、1B active の MoE で、学習時に文書境界を弱い教師信号として使い、同じ文書の token を共有 expert pool 内に route させます。これにより expert は句読点や前置詞のような表層特徴ではなく、意味領域に沿ってまとまりやすくなります。25% の expert だけを残しても平均で約 1 ポイント、12.5% でも約 3 ポイントの低下に抑えられ、同じ構造の標準 MoE より大きく安定します。公開物にはモデル、matched baseline、学習コード、可視化が含まれ、論点は「疎に動く MoE」から「タスクごとに選び、組み合わせ、更新し、解釈できる MoE」へ進んでいます。

### Speculative decoding は二モデル推論テクニックから単一モデル内蔵能力へ向かっている

- 出典：Daily Dose of Data Science
- 日付：2026-05-13
- リンク：https://blog.dailydoseofds.com/p/speculative-decoding-in-llms
- 要約：記事は speculative decoding を三段階で説明しています。小さな draft model が K 個の候補 token を先に生成し、大きな target model が一回の forward で並列検証し、確率分布に基づいて受理、置換、切り捨てを行います。本番では同じ tokenizer の draft / target ペアが 1.5〜3x の speedup を出しやすく、cross-tokenizer も使えますが再エンコードのコストが乗ります。より大きな流れとして、EAGLE、Medusa、LayerSkip、SWIFT などは draft 能力を target model 内部に入れ、追加モデル、追加 VRAM、同一モデル family 制約を減らそうとしています。

### Perceptron Mk1 は動画と embodied reasoning を構造化された空間出力へ押し出す

- 出典：Latent Space / Perceptron
- 日付：2026-05-13
- リンク：https://www.latent.space/p/ainews-the-end-of-finetuning
- 要約：Perceptron Mk1 は frontier video と embodied reasoning 向けのモデルとして紹介され、最大 2 FPS の native video、temporal grounding、多モーダル in-context learning、点、box、多角形、clip といった構造化された空間出力を扱います。これは動画を文章で説明する一般的な VLM とは違い、物理世界の時間、位置、動作を一級の出力型として扱うものです。ロボティクス、動画理解、embodied AI では、評価と product interface が「質問に答える」から「操作可能な空間オブジェクトを返す」へ移っていきます。

## 3. 実践コード & ツールライブラリ

### Needle は 26M parameters で single-shot tool calling routing を行う

- 出典：Latent Space / Cactus Compute
- 日付：2026-05-13
- リンク：https://github.com/cactus-compute/needle
- 要約：Needle は Cactus Compute が公開した MIT license の 26M parameter single-shot tool-calling model で、Gemini 由来の合成データから蒸留されています。構造は Simple Attention Networks、つまり attention と gating を中心にし、MLP / FFN を持たない設計です。作者は tool calling を、大きな知識記憶よりも schema に基づく検索と組み立てに近いタスクと見ています。ローカルの軽量 router として、ツールを使うべきか、どのツールか、大きな LLM に上げるべきかを先に判断し、高価な Agent 呼び出しを減らせる可能性があります。

### Artificial Analysis は coding agent 評価を model から harness + model へ広げた

- 出典：Latent Space / Artificial Analysis
- 日付：2026-05-12
- リンク：https://www.latent.space/p/ainews-thinking-machines-native-interaction
- 要約：新しい Coding Agent Index は SWE-Bench-Pro-Hard-AA、Terminal-Bench v2、SWE-Atlas-QnA を使い、評価対象を基盤モデル単体ではなく Cursor CLI、Codex、Claude Code などの harness と model の組み合わせに広げています。結果では、同じモデルでも harness により cost、token usage、cache hit rate、所要時間が大きく変わります。coding agent の実運用性能は、モデル、コンテキスト構築、ツール戦略、キャッシュ、実行環境の総合設計で決まるという見方が強まっています。

### Qdrant TurboQuant と再現性議論は vector infrastructure に独立評価が必要だと示す

- 出典：Latent Space
- 日付：2026-05-13
- リンク：https://www.latent.space/p/ainews-the-end-of-finetuning
- 要約：Qdrant 1.18 は TurboQuant を導入し、scalar quantization に近い recall を保ちながら約 2x のメモリ削減を狙うと説明されています。一方で Red Hat / vLLM 周辺の調査やコミュニティ議論では、TurboQuant の accuracy、latency、throughput をより慎重に見る流れも出ています。検索基盤では、単一 benchmark だけでは不十分です。RAG と agentic search が本番に入るほど、recall、メモリ、query latency、throughput をデータ分布とハードウェア別に独立再現する必要があります。

## 4. 業界 & ビジネス速報

### OpenAI の fine-tuning 変化は「微調整が標準ツールか」を問い直している

- 出典：Latent Space
- 日付：2026-05-13
- リンク：https://www.latent.space/p/ainews-the-end-of-finetuning
- 要約：Latent Space は OpenAI の fine-tuning API 変更をきっかけに、AI Engineering が「まず fine-tune」から、long prompt、retrieval、tool use、post-training RLFT、専用 open model の組み合わせへ寄っているのではないかと論じています。主張は fine-tuning が消えるという意味ではありません。多くのチームにとっては 80% の場面で最初に選ぶ手段ではなくなる一方、Cursor や Cognition のような上位アプリでは open model RLFT がむしろ深く使われる可能性があります。企業にとっては、どの場面で訓練データ、評価、訓練 / 配備チェーンを持つ価値があり、どの場面で長文 context と tool orchestration の方が安いかを見極める問題になります。

### Jensen Huang の CMU 演説は AI 雇用不安を「生存者型の建設的楽観」に包んだ

- 出典：老范讲故事
- 日付：2026-05-13
- リンク：https://lukefan.com/2026/05/13/jensen-huang-ai-speech-survivor-bias/
- 要約：この記事は Jensen Huang の Carnegie Mellon University 卒業演説をもとに、AI 時代の「恐れず走れ」という楽観の価値と危うさを分解しています。Huang の建設的楽観、Anthropic CEO による entry-level white-collar job 消失への警告、Elon Musk の existential risk、Mo Gawdat の社会リスクを同じ地図に置き、成功者の経験は真実でも不完全だと指摘します。技術者にとっては、AI ツールを学ぶことは必要ですが、成功者の物語を安定した職業経路が残っている証拠と読むのは危険だという警告です。

## 📬 Newsletter 精选

### Every は METR の長時間タスク評価を通じて「16 時間 Agent」を読み違えないよう促す

- 出典：Every
- 日付：2026-05-13
- リンク：https://every.to/context-window/the-fallacy-of-the-16-hour-agent
- 要約：Every は METR の long-horizon agent 評価をめぐる議論を整理し、「人間が何時間かかるタスクか」は難度の代理指標であり、モデルが実際にその時間ずっと安定して走ったという意味ではないと指摘しています。特に 16 時間を超える測定領域はまだ不安定で、50% success rate と 80% success rate の曲線では解釈も変わります。Agent 製品では、きれいな外挿グラフだけでなく、失敗パターン、人間の介入、verifier、タスク定義の強さを見る必要があります。

### The Rundown は Thinking Machines の交互作用モデルを「リアルタイム AI interface」の主信号として扱った

- 出典：The Rundown AI
- 日付：2026-05-12
- リンク：公開版リンクなし
- 要約：The Rundown の今日の主線も Thinking Machines の interaction model で、連続対話、視覚的 proactivity、リアルタイム音声、そして AI がユーザーの次のターンを待つだけではなくなることに注目しています。同じ号では実践ツールガイドも取り上げられており、一般向け newsletter の理解も、モデルパラメータより使えるシーンへ移っています。公開ページを安定して確認できなかったため、この項目は newsletter 内で読める概要だけを扱い、内部リンクは書いていません。

### Daily Dose は t-SNE 図を元データのクラスタ構造として読まないよう再確認した

- 出典：Daily Dose of Data Science
- 日付：2026-05-13
- リンク：https://www.dailydoseofds.com/formulating-and-implementing-the-t-sne-algorithm-from-scratch/
- 要約：Daily Dose は同じ号で、perplexity の例を使い、t-SNE の低次元図における cluster shape、cluster size、軸座標、cluster 間距離を元データ構造として直接解釈してはいけないと説明しています。perplexity は近傍サイズの近似制御であり、値を変えると投影形状は大きく変わり、極端な値では局所構造または大域構造が壊れます。データサイエンスの現場では、可視化は探索に役立っても、定量評価とドメイン解釈の代わりにはなりません。
