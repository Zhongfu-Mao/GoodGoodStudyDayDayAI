---
title: "AI レーダー日報：2026-05-03"
date: 2026-05-03
category: radar
cadence: daily
plainSummary: "本日の AI レーダーでは、agent runtime の本番化、ReaLM-Retrieve と OCR-Memory による検索・記憶設計、DeepSeek V4 Pro と Grok 4.3 のモデル動向、さらに Kimi K2.6、GPT-5.5 の幻覚評価、Robotaxi のクラウド依存リスクを整理します。"
difficulty: intermediate
tags:
  - Agent
  - Evaluation
  - Open Models
  - AI Engineering
lang: ja
coverImage: "/images/radar/daily-ai-radar-2026-05-03.ja-infographic.webp"
audioUrl: "/audio/radar/daily-ai-radar-2026-05-03.ja.mp3"
audioDuration: 828
audioSize: 6627768
draft: false
---

---
![EP213: MCP vs Skills, Clearly Explained](https://substackcdn.com/image/fetch/$s_!7jIm!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5632abfa-88b9-4f40-8feb-13b4a7c6e1ce_2484x3002.png)

*代表画像は [EP213: MCP vs Skills, Clearly Explained](https://blog.bytebytego.com/p/ep213-mcp-vs-skills-clearly-explained) から。この記事の主線を最もよく表す元シグナルとして選んでいます。*
## 対象範囲

- 対象期間：2026-04-30 から 2026-05-03 まで。

## カバー画像（アイキャッチ）の解説

今日のカバー画像は「Agent ランタイムのコントロールパネル」を想定します。左側に MCP、Skills、権限、人間の介入ポイントを置き、中央に検索、記憶、持続実行、長文脈性能を重ね、右側にオープンモデル、評価曲線、現実世界のシステム障害を配置します。単なるモデル順位ではなく、「モデル能力をランタイムとガバナンスで受け止める」構図が合います。

## 1. AI Engineering & アーキテクチャ

### MCP と Skills の切り分けは Agent プラットフォーム設計の基本論点になっている

- 出典：ByteByteGo
- 日付：2026-05-02
- リンク：https://blog.bytebytego.com/p/ep213-mcp-vs-skills-clearly-explained
- 要約：ByteByteGo は MCP と Skills を、Agent 拡張の別レイヤーとして整理している。MCP はリアルタイムなシステムやデータにつなぐ client-server 型のプロトコルで、JSON-RPC、schema、独立した runtime を前提にする一方、Skills は Agent が必要時に読み込む知識パッケージで、手順、参照資料、ローカル処理の再利用に向く。プラットフォームチームにとって重要なのは、接続、権限、再利用可能な作業知識を分けて設計することだ。

### ReaLM-Retrieve は検索を前処理ではなく推論中の操作にする

- 出典：Latent Space / AINews
- 日付：2026-05-02
- リンク：https://www.latent.space/p/ainews-ai-engineer-worlds-fair-autoresearch
- 要約：ReaLM-Retrieve は、reasoning model が回答前に一度だけ情報を詰め込むのではなく、推論の途中で必要に応じて検索する設計を提案している。報告では標準的な RAG より F1 が 10.1 ポイント高く、固定間隔の検索より呼び出し回数を 47% 減らし、検索あたりのオーバーヘッドも 3.2 倍低いとされ、長い調査 Agent や多段ツール利用に応用しやすい。

### OCR-Memory は長期 Agent の記憶劣化を画像化された軌跡で補う

- 出典：Latent Space / AINews
- 日付：2026-05-02
- リンク：https://www.latent.space/p/ainews-ai-engineer-worlds-fair-autoresearch
- 要約：OCR-Memory は GUI / Web 操作の長い軌跡を、索引付きの画像として保存し、必要な時に過去の可視状態を正確に取り出す。テキスト要約を繰り返して情報を失うのではなく、画面そのものを記憶対象にする発想で、Mind2Web と AppWorld の厳しい文脈制限下で強い結果を示している。

### LangGraph と Cloudflare は Agent runtime をデモから持続実行へ進めている

- 出典：Latent Space / AINews
- 日付：2026-05-02
- リンク：https://www.latent.space/p/ainews-ai-engineer-worlds-fair-autoresearch
- 要約：LangChain / LangGraph は、複数ユーザー運用に必要なデータ分離、委任された認証情報、operator RBAC、人間の介入、pause/resume 可能な実行を強調している。Cloudflare Dynamic Workflows も Agent plan に durable execution を持ち込み、実運用の差別化点が sandbox、checkpoint、権限、監査、失敗復旧へ移っていることを示している。

## 2. モデル最前線 & アルゴリズム探索

### DeepSeek V4 Pro はオープンウェイト coding agent を閉源フロンティアに近づける

- 出典：Latent Space / AINews
- 日付：2026-05-02
- リンク：https://www.latent.space/p/ainews-ai-engineer-worlds-fair-autoresearch
- 要約：DeepSeek V4 Pro は、多段の coding agent 用途で Codex や Claude Code に近い手応えを示したオープンウェイトモデルとして紹介されている。1M context、CSA/HCA hybrid attention、KV cache を 10% まで削減する設計、長文脈で約 4 倍低い推論 FLOPs は、オープンモデルがチャット用途から実際の Agent harness へ進みつつあることを示す。

### Grok 4.3 は agentic タスクと価格効率を伸ばしたが、信頼性指標はまだ不安定

- 出典：Latent Space / AINews
- 日付：2026-05-02
- リンク：https://www.latent.space/p/ainews-ai-engineer-worlds-fair-autoresearch
- 要約：Grok 4.3 は Artificial Analysis Intelligence Index で 53 に達し、Grok 4.20 から 4 ポイント上昇しつつ、入力と出力の価格をそれぞれ約 40% / 60% 下げた。一方で non-hallucination 指標は 8 ポイント低下し、Vending-Bench のような長期行動評価にも後退が見られるため、コスト改善だけでは本番採用の根拠にならない。

### Recursive Multi-Agent Systems は latent 通信で Agent 間の文章コストを下げる

- 出典：Latent Space / AINews
- 日付：2026-05-02
- リンク：https://www.latent.space/p/ainews-ai-engineer-worlds-fair-autoresearch
- 要約：Recursive Multi-Agent Systems は、Agent 同士が自然言語メッセージを大量に交換する代わりに、共有された latent recursive computation を通じて協調する。9 つの benchmark で平均精度 8.3% 向上、速度 1.2x から 2.4x、token 使用量 34.6% から 75.6% 削減という結果は、多 Agent 協調の通信コストを下げる方向として重要だ。

### Meta FAIR の自己改善型 pretraining は後訓練モデルをデータ修正器として使う

- 出典：Latent Space / AINews
- 日付：2026-05-02
- リンク：https://www.latent.space/p/ainews-ai-engineer-worlds-fair-autoresearch
- 要約：Meta FAIR の手法は、強い post-trained model に pretraining データの続きをより安全で高品質な文に書き換えさせ、その後の rollout を評価させる。報告では factuality が相対 36.2%、safety が 18.5% 改善し、生成品質で最大 86.3% の win rate が示されており、pretraining データパイプラインにモデル自身を組み込む流れを示している。

## 3. 実践コード & ツールライブラリ

### Prompt injection 防御はモデル層とシステム層の組み合わせになってきた

- 出典：ByteByteGo
- 日付：2026-05-02
- リンク：https://blog.bytebytego.com/p/ep213-mcp-vs-skills-clearly-explained
- 要約：ByteByteGo は prompt injection 対策を、Spotlighting や Instruction Hierarchy のようなモデル層と、最小権限ツール、人間の確認、planner/executor 分離のようなシステム層に分けている。実装上の要点は、単一の防御に頼らず、不可信コンテンツの読解、機密性の高いツール呼び出し、高影響操作の間に複数の隔離点を置くことだ。

### PFlash は speculative prefill で長文脈ローカル推論のコストを下げようとしている

- 出典：Latent Space / AINews
- 日付：2026-05-02
- リンク：https://www.latent.space/p/ainews-ai-engineer-worlds-fair-autoresearch
- 要約：PFlash は小さな drafter model で長い prompt 内の重要 token / span を選び、27B の対象モデルには保持した部分だけを prefill させる。RTX 3090、128K context で llama.cpp より 10 倍速いという C++/CUDA 実装が報告された一方、圧縮による損失や 4090 での OOM も指摘されており、再現検証が必要な長文脈高速化の候補として見るべきだ。

### Qwen-Scope は Sparse Autoencoders を Qwen 3.5 の可解釈性ツールチェーンに持ち込む

- 出典：Latent Space / AINews
- 日付：2026-05-02
- リンク：https://www.latent.space/p/ainews-ai-engineer-worlds-fair-autoresearch
- 要約：Qwen チームは Qwen 3.5 の 2B から 35B MoE までを対象にした Sparse Autoencoders 群、Qwen-Scope を公開した。feature steering、surgical ablation、モデルデバッグ、データセット分析に使えるため、オープンモデルの可解釈性が論文デモから実際のデバッグツールへ近づいている。

## 4. 業界 & ビジネス速報

### 武漢の Apollo Go 事故は強クラウド依存 Robotaxi の単一障害点を露呈した

- 出典：老范講故事
- 日付：2026-05-03
- リンク：https://lukefan.com/2026/05/03/wuhan-baidu-apollo-go-robotaxi-cloud-failure/
- 要約：老范は、武漢での Apollo Go 大規模停止を、強くクラウドに依存した自動運転の都市レベルの信頼危機として捉えている。中央制御や通信が揺らぐと、車両が安全に路肩へ寄せられず、自己復旧も遠隔接管も効かない可能性があるため、Robotaxi の競争軸は走行距離や注文数から、オフライン時の自救、車端自治、現場救援、透明な事後検証へ移っている。

### AI Engineer World’s Fair の新 track は工程化テーマの収束を映している

- 出典：Latent Space / AINews
- 日付：2026-05-02
- リンク：https://www.latent.space/p/ainews-ai-engineer-worlds-fair-autoresearch
- 要約：AI Engineer World’s Fair は Autoresearch、Memory、World Models、Agentic Commerce、Vertical AI、Robotics などの track を追加した。イベント募集そのものは業界情報だが、AI engineering コミュニティの関心が、単なるモデル呼び出しから研究自動化、長期記憶、支払い・データ市場、垂直領域への実装へ収束していることを示している。

## 📬 Newsletter 精選

### GPT-5.5 は客観ベンチの強さと高い幻覚率を同時に見る必要がある

- 出典：The Batch
- 日付：2026-05-01
- リンク：公開版リンクなし
- 要約：継続追跡：The Batch は、GPT-5.5 が Artificial Analysis Intelligence Index、ARC-AGI-2、Terminal-Bench 2.0、OSWorld-Verified などの客観評価で強い一方、AA-Omniscience Index は 20 にとどまり、Gemini 3.1 Pro Preview や Claude Opus 4.7 を下回ると整理している。本番利用では最高スコアだけでなく、abstention、幻覚率、主観的な使いやすさをモデル切り替え戦略に入れる必要がある。

### Kimi K2.6 はオープンウェイトモデルをより長時間の agent swarm へ押し上げた

- 出典：The Batch
- 日付：2026-05-01
- リンク：公開版リンクなし
- 要約：The Batch は Kimi K2.6 を、1T parameters / 32B active の vision-language MoE として紹介し、256K context、98K 出力、native INT4、preserve thinking、agent swarm を特徴に挙げている。特に coordinator がタスクを分解し、最大 300 の並列 subagents と 4,000 step の実行を扱える点、さらに 12 時間超の coding 最適化例は、オープンウェイトモデルの長期自律性が明確に伸びていることを示す。

### AlphaEvolve で行動から戦略を逆算する手法は LLM 判断の解釈に使える

- 出典：The Batch
- 日付：2026-05-01
- リンク：公開版リンクなし
- 要約：The Batch が取り上げた UT Austin / Google の研究は、じゃんけんの行動記録から可解釈な Python 予測器を合成し、人間、Gemini 2.5、GPT-5.1、GPT-OSS の戦略差を比較した。Gemini 2.5 Pro/Flash と GPT-5.1 は系列パターンをより保ち、GPT-OSS と人間は直近手に寄る傾向があり、行動からコードを合成して意思決定を説明する評価方法として使える。
