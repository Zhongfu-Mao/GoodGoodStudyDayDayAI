---
title: "AIレーダー日報：2026-05-10"
date: 2026-05-10
category: radar
cadence: daily
plainSummary: "本日は、Agent runtime、安全監査パイプライン、医療向け multi-agent RAG、ソフトウェア再構築 benchmark、ロボット継続学習、個人向け音声 workflow に注目します。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agent
  - Evaluation
  - RAG
lang: ja
coverImage: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/images/radar/daily-ai-radar-2026-05-10.ja-infographic.webp
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-05-10.ja.mp3
audioDuration: 885
audioSize: 7079582
draft: false
---

## 対象期間

- 対象期間：2026-05-07 から 2026-05-10 まで。

## カバー画像メモ

今日の主軸は「Agent がモデル性能からシステム責任へ移っている」ことです。ブラウザ安全性、医療判断、個人デスクトップ、音声配信、完全なソフトウェア再構築 benchmark が、Agent をより現実の環境へ押し出しています。重要なのは賢さだけでなく、制約、検証、追跡、既存 workflow への組み込みです。

## 1. AI Engineering & アーキテクチャ

### Claude Code vs. OpenClaw は 2 種類の Agent runtime を見せる

- 来源：ByteByteGo
- 日付：2026-05-09
- リンク：https://blog.bytebytego.com/p/ep214-claude-code-vs-openclaw-5-design
- 要約：ByteByteGo は Claude Code と OpenClaw を system scope、runtime、extension、memory、routing の 5 軸で比較しています。Claude Code は短命な task process に近く、OpenClaw は常駐 daemon、gateway、per-session queue により Slack、Discord、WhatsApp などの長時間入口に向いています。この比較は coding agent の差を、モデル性能ではなく runtime、queue、memory boundary、plugin registry の設計問題として捉え直しています。

### Firefox は agentic security harness を脆弱性 lifecycle に接続した

- 来源：Mozilla Hacks
- 日付：2026-05-08
- リンク：https://hacks.mozilla.org/2026/05/behind-the-scenes-hardening-firefox/
- 要約：Mozilla は Claude Mythos Preview などを使った Firefox hardening の詳細を公開しました。モデルの報告をそのまま maintainer に渡すのではなく、agentic harness が再現可能な testcase を作り、重複排除、triage、修正、release まで既存の security bug lifecycle に接続します。Firefox 150 関連では Claude Mythos Preview が 271 件の bug を特定し、4 月全体では 423 件の security bug が修正されました。

### Perplexity Personal Computer は個人 Agent をローカルファイルとアプリ層へ押し出す

- 来源：TechCrunch / Perplexity
- 日付：2026-05-07
- リンク：https://techcrunch.com/2026/05/07/perplexitys-personal-computer-is-now-available-everyone-on-mac/
- 要約：Perplexity の Personal Computer は Mac ユーザー向けに一般提供され、Agent がローカルファイル、native app、connector、web を横断して個人の multi-step workflow を処理することを狙っています。OpenClaw 系の local agent と同じ流れにありますが、クラウド worker の能力を実際の作業端末に近づけ、Perplexity 側の controlled environment と Comet browser で一部の安全境界を作る点が特徴です。

### AI Engineering 文化は prompt 技術から人間と Agent の共通ビジョン管理へ移る

- 来源：Every
- 日付：2026-05-08
- リンク：https://every.to/thesis/the-culture-of-ai-engineering
- 要約：Every の記事は AI Engineering を単なる toolchain ではなく、組織文化の問題として扱っています。人間、Agent、自動化された workflow が同じ product vision に沿って動くには、spec、feedback、境界条件、review rhythm が文化的な interface になります。multi-agent engineering で顕在化している governance、memory、authority の問題と同じ方向の議論です。

## 2. モデル最前線 & アルゴリズム探索

### OncoAgent は dual-tier model、Corrective RAG、HITL で腫瘍臨床判断を支援する

- 来源：Hugging Face Blog
- 日付：2026-05-09
- リンク：https://huggingface.co/blog/lablab-ai-amd-developer-hackathon/oncoagent-official-paper
- 要約：OncoAgent は open-source かつ privacy-preserving な腫瘍臨床意思決定支援システムです。8-node LangGraph topology、4 段階 Corrective RAG、3 層 Reflexion safety validator、mandatory HITL gate を組み合わせています。症例複雑度に応じて 9B speed model と 27B reasoning model を切り替え、QLoRA + Unsloth で 266,854 件の腫瘍症例を AMD MI300X 上で学習する設計です。

### ロボット継続学習は GRPO、LoRA、大規模 VLA model の組み合わせへ向かう

- 来源：The Batch / DeepLearning.AI
- 日付：2026-05-08
- リンク：公開版リンクなし
- 要約：The Batch は、robotics 向け vision-language-action model の継続学習手法を紹介しています。大きな pretrained model で忘却余地を下げ、LoRA で weight update を抑え、on-policy GRPO で task learning を行う構成です。LIBERO simulation task では平均成功率 81.2%、旧タスクの忘却は約 0.3 percentage point に抑えられ、robot post-training では軽量適応とオンライン報酬の組み合わせが重要になりそうです。

### Nvidia の AI-assisted chip design は RL がハードウェア探索空間へ入ることを示す

- 来源：The Batch / DeepLearning.AI
- 日付：2026-05-08
- リンク：公開版リンクなし
- 要約：The Batch は Nvidia が reinforcement learning を chip design に使ってきた流れを追っています。NVCell、PrefixRL adder、ChipNeMo などの文脈で重要なのは、AI が engineer の文書作成を助けるだけでなく、巨大な物理設計探索空間から人間が考えにくい回路配置を見つけることです。GPU が AI を訓練し、その AI が次世代 GPU 設計を助けるという再帰的な研究開発 loop が見えます。

### Anthropic Institute は AI-driven R&D と自己改善を正式な研究 agenda に入れた

- 来源：Anthropic
- 日付：2026-05-07
- リンク：https://www.anthropic.com/research/anthropic-institute-agenda
- 要約：Anthropic Institute は研究 agenda を公開し、economic diffusion、threats and resilience、AI systems in the wild、AI-driven R&D を主要領域に置きました。特に AI が次世代 AI system の開発を助ける可能性、AI R&D telemetry、capability jump に対する fire drill、governance boundary を明示的な研究課題にした点が重要です。frontier lab が recursive R&D acceleration を測定・統治すべき現実変数として扱い始めています。

## 3. 実戦コード & ツールライブラリ

### ProgramBench は「black-box から完全な software を再構築する」ことを新しい AI Coding Agent 課題にした

- 来源：老范讲故事
- 日付：2026-05-10
- リンク：https://lukefan.com/2026/05/10/programbench-ai-software-reconstruction-benchmark/
- 要約：ProgramBench は bug fix や function completion ではなく、compiled binary と user document だけを与え、入力出力、edge case、error handling を探索して完全な program を再構築させます。9 モデルは 200 個の実ソフトウェア、248,853 test case で 1 つも完全通過できませんでした。重要なのは失敗そのものではなく、complete software engineering が benchmark 化され、長期計画、behavior exploration、自動テスト、memory management、toolchain coordination が次の競争軸になることです。

### Spotify Save to Spotify CLI は Agent が個人 podcast を直接保存できる導線を作る

- 来源：Spotify
- 日付：2026-05-07
- リンク：https://newsroom.spotify.com/2026-05-07/personal-podcasts-launch/
- 要約：Spotify は Save to Spotify beta tool を公開し、desktop Agent が daily briefing、class note、learning path などを Personal Podcast として生成し、Spotify Library に保存できるようにしました。OpenClaw、Claude Code、OpenAI Codex などの desktop Agent が想定されており、生成音声を単なる file ではなく既存の再生・配信 infrastructure に入れる点が実用的です。tool repository は `https://github.com/spotify/save-to-spotify` です。

### ByteByteGo の eval recipe は production evaluation を task、data、grader に分解する

- 来源：ByteByteGo
- 日付：2026-05-09
- リンク：https://blog.bytebytego.com/p/ep214-claude-code-vs-openclaw-5-design
- 要約：ByteByteGo は production AI evaluation を 3 step に分けています。まず評価したい能力を 1 つ選び、次に input と expected behavior を集め、最後に grader を作ります。code-based grader は決定的な task、model-based grader は主観品質、human grader は高リスク edge case に向きます。RAG、Agent、安全評価を実運用に近づけるには、この粒度で評価設計を分解する必要があります。

## 4. 業界 & ビジネス速報

### Google Health は Fitbit、Health Connect、AI coach を健康入口へ統合する

- 来源：The Rundown AI
- 日付：2026-05-08
- リンク：公開版リンクなし
- 要約：The Rundown は、Google が AI health coach を公開し、Fitbit app、Health Connect、Apple Health、wearable data、米国 medical record を Google Health hub に統合すると報じています。この方向の事業価値は、health Agent が単なる問答ではなく、継続的な身体データ、医療記録、写真認識、wearable hardware の unified context を持つ点にあります。

### AI security と政府契約は model company を高責任 infrastructure へ押し込んでいる

- 来源：The Rundown AI
- 日付：2026-05-08
- リンク：公開版リンクなし
- 要約：The Rundown の quick hits では、OpenAI Trusted Contact、Scale AI の 5 億ドル Pentagon contract、Mozilla による Claude Mythos Preview を使った Firefox security hardening が並んでいます。AI は security、defense、browser、personal risk intervention といった高責任領域へ入っており、能力だけでなく audit trail、human intervention、release governance が同時に問われます。

## 📬 Newsletter 精选

### OpenRouter Fusion は multi-model comparison を低コスト workflow にする

- 来源：The Rundown AI
- 日付：2026-05-08
- リンク：https://openrouter.ai/fusion
- 要約：The Rundown は OpenRouter Fusion を使い、同じ prompt を複数モデルへ同時投入して比較する workflow を紹介しています。Opus、GPT、Grok などを感覚で切り替えるのではなく、同じ入力、side-by-side output、price、latency を残すことで、team 独自の task-level model routing table を作れます。

### 企業の AI adoption の本当の bottleneck は manager support、workflow embedding、data privacy にある

- 来源：The Batch / DeepLearning.AI
- 日付：2026-05-08
- リンク：公開版リンクなし
- 要約：The Batch は Gallup による米国従業員 23,700 人調査を紹介しています。日常的な AI 利用は増えていますが、成果は組織が tool、strategy、manager support を提供しているかに強く依存します。企業導入にとって重要なのは、モデルの有無だけではなく、workflow 改造、管理層の支援、倫理・privacy 懸念、task fit です。
