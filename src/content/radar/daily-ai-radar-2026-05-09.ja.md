---
title: "AIレーダー日報：2026-05-09"
date: 2026-05-09
category: radar
cadence: daily
plainSummary: "本日は、リアルタイム音声 Agent、長時間コード Agent、モジュール型 MoE、ローカル防御セキュリティモデル、企業データ Agent、Agent-first backend に注目します。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agent
  - Multimodal
  - Evaluation
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-05-09.ja-infographic.webp
audioUrl: "/audio/radar/daily-ai-radar-2026-05-09.ja.mp3"
audioDuration: 1066
audioSize: 8527811
draft: false
---

## 対象期間

- 対象期間：2026-05-06 から 2026-05-09 まで。

---
![AINews Anthropic growing 10x/year while everyone else is laying off >10% of their workforce](https://substackcdn.com/image/fetch/$s_!tOlW!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F021c44bf-dba1-44ad-b3a5-d4de3e6a7644_1728x954.jpeg)

*代表画像は [[AINews] Anthropic growing 10x/year while everyone else is laying off >10% of their workforce](https://www.latent.space/p/ainews-anthropic-growing-10xyear) から。この記事の主線を最もよく表す元シグナルとして選んでいます。*

## カバー画像メモ

今日の主軸は「Agent が実システムの摩擦面に入った」ことです。音声インターフェース、長時間タスク、企業データ、backend control plane、ローカル安全モデルが本番境界に近づき、モデル能力だけでなく context、tool、cost、governance が可用性を左右し始めています。

## 1. AI Engineering & アーキテクチャ

### Codex の長時間 runtime は Agent タスクを継続目標へ近づける

- 来源：Latent Space
- 日付：2026-05-09
- リンク：https://www.latent.space/p/ainews-anthropic-growing-10xyear
- 要約：OpenAI Codex の新しい流れは、「長時間動く engineering Agent」へさらに寄っています。`/goal` のような仕組みは、一度きりの patch 生成ではなく、目標に沿って継続的に進む Agent を前提にしています。同時に sandbox、approval、network policy、telemetry、monitoring が語られており、長時間 Agent の要点はモデル性能だけでなく、制御できる runtime boundary にあります。

### vLLM-Omni と SGLang は推論最適化を異種ハードウェアの細部へ押し込む

- 来源：Latent Space
- 日付：2026-05-09
- リンク：https://www.latent.space/p/ainews-anthropic-growing-10xyear
- 要約：vLLM-Omni v0.20.0 は Qwen3-Omni の H20 上 throughput を約 72% 改善し、TTS latency、diffusion 対応、quantization backend も強化しています。SGLang も H20 / DeepSeek workload に向けて prefill-decode 分離、FP8 FlashMLA、expert affinity、observability を進めており、推論フレームワークは「モデルを動かす」段階から「hardware topology まで含めて tail performance を詰める」段階へ移っています。

### Databricks Genie は企業データ Agent の難所を asset discovery と業務語彙へ置く

- 来源：Latent Space
- 日付：2026-05-09
- リンク：https://www.latent.space/p/ainews-anthropic-growing-10xyear
- 要約：Databricks Genie の実践は、企業データ Agent のボトルネックを asset discovery、衝突する business context、決定的テストの不在、複数モデル協調として整理しています。専用知識検索、parallel thinking、multi-LLM 協調により、社内データ分析の精度を約 32% から 90% 超まで引き上げたとされ、企業 Agent の本丸が data catalog、metric governance、verification loop にあることを示しています。

### Zenith の編成実験は multi-agent coding に governance と memory boundary が必要だと示す

- 来源：Latent Space
- 日付：2026-05-09
- リンク：https://www.latent.space/p/ainews-anthropic-growing-10xyear
- 要約：Zenith orchestration harness は 8 つの長時間 coding task のうち 5 つで勝ち、いくつかの複雑な変更を低コストで完了しました。一方で trial log には Agent 間の governance、memory conflict、試行管理の難しさも現れています。multi-agent 編成は単にモデル数を増やすことではなく、task state、failure trace、permission boundary をシステムとして設計することです。

## 2. モデル最前線 & アルゴリズム探索

### GPT-Realtime-2 は GPT-5 級の推論をリアルタイム音声 Agent に入れる

- 来源：OpenAI / The Rundown AI / Latent Space
- 日付：2026-05-08
- リンク：https://openai.com/index/advancing-voice-intelligence-with-new-models-in-the-api/
- 要約：OpenAI は GPT-Realtime-2、GPT-Realtime-Translate、GPT-Realtime-Whisper を公開し、リアルタイム音声 Agent に強い推論、streaming transcription、70 以上の入力言語からの翻訳、複数 tool call を提供します。Realtime-2 は context window が 128K まで広がり、Big Bench Audio で 96.6% を記録しており、音声 Agent は「順番に話す UI」から、話しながら考え、tool を呼ぶ本番 interface へ近づいています。

### EMO は MoE の expert module をデータから自然に形成させる

- 来源：Hugging Face Blog / Ai2
- 日付：2026-05-08
- リンク：https://huggingface.co/blog/allenai/emo
- 要約：Ai2 は EMO を公開しました。1B active、14B total の MoE を 1T tokens で事前学習し、同じ文書の token が共有 expert pool を使うようにする document-level weak supervision を採用しています。全 expert の 12.5% だけを残してもほぼ full-model に近い性能を保ち、model、technical report、visualization、code repository `https://github.com/allenai/EMO` も公開されているため、選択可能で組み合わせ可能な sparse model の研究基盤として重要です。

### ZAYA1-74B と ZAYA1-VL-8B は MoE の active cost をさらに下げる

- 来源：Latent Space
- 日付：2026-05-09
- リンク：https://www.latent.space/p/ainews-anthropic-growing-10xyear
- 要約：Zyphra は ZAYA1 series を拡張し、ZAYA1-74B-Preview は 74B total / 4B active の MoE、ZAYA1-VL-8B は約 700M active / 8B total の vision-language MoE として出ています。どちらも Apache 2.0 で、注目点は総パラメータ数ではなく、高並列 serving や local deployment で active parameter を抑えてコスト弾力性を作れるかです。

### DGPO、Aurora、TwELL は training efficiency の三つの攻め口を示す

- 来源：Latent Space
- 日付：2026-05-09
- リンク：https://www.latent.space/p/ainews-anthropic-growing-10xyear
- 要約：DGPO は token-level reward redistribution、Hellinger distance、entropy gating で reasoning model の RL を改善します。Aurora optimizer は Muon 周辺の neuron death を避けつつ、少ない parameters と training tokens で Qwen3-1.7B に迫り、TwELL は sparse packing と kernel 最適化で H100 上の FFN training / inference を 20% 以上速くします。次の効率競争は、RL objective、optimizer、kernel の各層で同時に進みそうです。

### Anthropic は「なぜやってはいけないか」を教えて Claude 4 の境界行動を直す

- 来源：Latent Space
- 日付：2026-05-09
- リンク：https://www.latent.space/p/ainews-anthropic-growing-10xyear
- 要約：Anthropic は “Teaching Claude why” という alignment 方針を説明しています。単に拒否ルールを与えるのではなく、constitution-style の説明、行動理由、harmlessness data を通じて、なぜ特定の行動が有害なのかを教えるというものです。安全訓練が rule list から因果説明と価値帰属へ進む可能性があり、境界事例での安定性と説明可能性に関係します。

## 3. 実装コード & ツールライブラリ

### Direct Corpus Interaction は RAG の既定路線を問い直す

- 来源：Latent Space
- 日付：2026-05-09
- リンク：https://www.latent.space/p/ainews-anthropic-growing-10xyear
- 要約：Direct Corpus Interaction は、すべてを embedding + vector DB + top-k retrieval に入れるのではなく、grep、find、bash などの tool で raw corpus に直接アクセスさせる発想です。報告では BrowseComp-Plus が Claude Sonnet 4.6 で 69% から 80% に伸び、OBLIQ-Bench や turbopuffer sparse vectors ともつながっています。RAG 実装は、単一の vector retrieval から、より hybrid で tool-based な corpus interaction へ広がりそうです。

### CyberSecQwen-4B は防御セキュリティ小型モデルの配置可能な道筋を示す

- 来源：Hugging Face Blog / Lablab.ai AMD Developer Hackathon
- 日付：2026-05-08
- リンク：https://huggingface.co/blog/lablab-ai-amd-developer-hackathon/cybersecqwen-4b
- 要約：CyberSecQwen-4B は Qwen3-4B-Instruct-2507 を微調整した defensive cybersecurity model で、CWE classification、CVE-to-CWE mapping、CTI Q&A に向けた Apache 2.0 モデルです。12GB 級 GPU で local 実行でき、CTI-Bench の CTI-MCQ では Foundation-Sec-Instruct-8B を 8.7 ポイント上回り、CTI-RCM では 97.3% の精度を保持します。記事には LoRA、ROCm、vLLM serving、transformers 推論例も含まれています。

### CrewAI checkpointing は Flow の復旧点を fork 可能な状態にする

- 来源：Daily Dose of Data Science
- 日付：2026-05-08
- リンク：https://blog.dailydoseofds.com/p/a-smarter-claude-model-burns-more
- 要約：CrewAI v1.14 は Flow の各 method を保存可能な checkpoint にし、任意の保存状態から復旧または fork できるようにしました。長い Agent chain や人間参加型 workflow の debug に向いており、非同期 TUI から checkpoint、state、復旧点を確認できます。この種の機能は、Agent framework における基盤機能になりつつあります。

## 4. 業界・ビジネス速報

### Anthropic の急成長と大手企業の人員削減は「AI native organization」圧力を強める

- 来源：Latent Space
- 日付：2026-05-09
- リンク：https://www.latent.space/p/ainews-anthropic-growing-10xyear
- 要約：今回の AI News は、Anthropic の急成長、高い推定評価額、Block、Coinbase、Cloudflare などが AI readiness を理由に進める人員削減を同じ流れとして扱っています。重要なのは評価額そのものではなく、組織が「AI で workflow を作り替えられるか」によって再評価され始めたことです。AI 投資は tool procurement から organization design の問題へ移っています。

### DeepMind の数学、AlphaEvolve、Figure robot は AI 研究を物理・科学タスクへ押し出す

- 来源：Latent Space
- 日付：2026-05-09
- リンク：https://www.latent.space/p/ainews-anthropic-growing-10xyear
- 要約：DeepMind の AI co-mathematician は FrontierMath Tier 4 で 48% を記録し、AlphaEvolve は AI infrastructure、molecular simulation、disaster risk に使われ、Figure Helix-02 robot は協調してベッドを整える動作を見せています。これらは、AI の事業価値が software interface から数学的発見、科学基盤の最適化、embodied task へ広がっていることを示します。

## 📬 Newsletter 精選

### Claude は賢くなるほど token を使う。問題は backend context interface にある

- 来源：Daily Dose of Data Science
- 日付：2026-05-08
- リンク：https://blog.dailydoseofds.com/p/a-smarter-claude-model-burns-more
- 要約：Daily Dose の MCPMark V2 観察は示唆的です。より強い Claude は backend task で約 54% 多く token を使いました。Supabase などの tool interface が table、RLS、auth、storage、function state を何度も探索させるからです。InsForge との比較では、agent-first backend control plane により、同じ RAG app が 10.4M tokens から 3.7M tokens まで下がっています。

### InsForge は「Agent が使う backend」を open-source control plane にする

- 来源：Daily Dose of Data Science
- 日付：2026-05-08
- リンク：https://blog.dailydoseofds.com/p/a-smarter-claude-model-burns-more
- 要約：InsForge は open-source で Docker self-hostable な backend-as-a-service で、repository は `https://github.com/InsForge/InsForge` です。価値は database の置き換えではなく、table、permission、storage bucket、auth provider、edge function、integration state を約 500 tokens の Agent-readable topology にまとめる点にあります。Karpathy の言う context engineering を、backend control plane として実装している例です。
