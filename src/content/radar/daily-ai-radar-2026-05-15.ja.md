---
title: "AI レーダー日報：2026-05-15"
date: 2026-05-15
category: radar
cadence: daily
plainSummary: "今日は Codex モバイル版と Windows サンドボックス、GitHub Copilot App、LangSmith Engine、CoreWeave Sandboxes、Abridge の臨床インテリジェンス、Toto 2.0、Goodfire の機構解釈、Hermes Agent と llama.cpp 推論高速化リポジトリを追います。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agent
  - Infrastructure
  - Healthcare
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-05-15.ja-infographic.webp
audioUrl: /audio/radar/daily-ai-radar-2026-05-15.ja.mp3
audioDuration: 1103
audioSize: 8826652
draft: false
---

## 対象範囲

- 対象期間：2026-05-14 から 2026-05-15 まで。
- 本稿は固定の六つの区分で整理する：AI Engineering & アーキテクチャ、モデル最前線 & アルゴリズム探索、実践コード & ツールライブラリ、業界 & ビジネス速報、GitHub 人気 repo & トレンド追跡、📬 Newsletter 精選。

## 1. AI Engineering & アーキテクチャ

### OpenAI が Codex を ChatGPT モバイルに持ち込み、リモート Agent セッションは単一開発機から離れ始めた

- 出典：OpenAI
- 日付：2026-05-14
- リンク：https://openai.com/index/work-with-codex-from-anywhere/
- 要約：OpenAI は Codex を ChatGPT iOS / Android アプリに組み込み、ユーザーがスマートフォンから実行中スレッドを確認し、コマンドを承認し、モデルを切り替え、スクリーンショット、ターミナル出力、diff、テスト結果を見られるようにした。Codex は引き続きローカル PC、Mac mini、devbox、管理されたリモート環境で実行され、ファイル、認証情報、権限は元のマシンに残り、安全な relay でセッション状態を同期する。coding agent の体験は、端末の前で操作するものから、複数マシンとタスクを任せて要所で判断するものへ移っている。

### Codex の Windows サンドボックスは、Agent 安全境界を OS とネットワーク層に置く必要を示した

- 出典：OpenAI
- 日付：2026-05-13
- リンク：https://openai.com/index/building-codex-windows-sandbox/
- 要約：OpenAI は Codex の Windows サンドボックス実装を復盤した。チームは AppContainer、Windows Sandbox、Mandatory Integrity Control、非昇格の ACL / restricted token 方式を検討したが、ネットワーク隔離と実際の開発ワークフローとの両立が足りず、最終的に専用 sandbox ユーザー、restricted token、runner binary、Windows Firewall を組み合わせた。Agent が shell、Git、Python、package manager を実行できるなら、安全性はプロンプトや環境変数だけではなく、OS principal、ACL、ネットワーク規則で支える必要がある。

### LangSmith Engine と SmithDB は Agent 観測を「失敗発見、修正生成、評価追加」の閉ループへ進めた

- 出典：LangChain
- 日付：2026-05-14
- リンク：https://www.langchain.com/blog/interrupt-2026-overview
- 要約：LangChain は Interrupt 2026 で LangSmith Engine、SmithDB、Managed Deep Agents、Context Hub、LLM Gateway、Sandboxes、Fleet 更新を発表した。LangSmith Engine は本番 traces を監視し、失敗をクラスタリングし、根本原因を診断し、コード修正と eval coverage を提案する。SmithDB は深くネストした span、長時間イベント、マルチモーダル trace、大量クエリを前提にした agent trace データベースだ。Agent observability は呼び出しログから本番改善ループへ進んでいる。

### CoreWeave Sandboxes は RL、Agent ツール利用、モデル評価の隔離実行レイヤーを製品化した

- 出典：CoreWeave
- 日付：2026-05-14
- リンク：https://www.coreweave.com/news/coreweave-sandboxes-launches-to-accelerate-reinforcement-learning-agent-tool-use-and-model-evaluation
- 要約：CoreWeave は Sandboxes を発表し、強化学習、Agent tool use、モデル評価向けの隔離実行環境を提供する。顧客自身の CoreWeave Kubernetes Service クラスターで動かす方法と、Weights & Biases serverless runtime から使う方法があり、各 sandbox は既定で隔離された仮想環境として動き、活動ログは W&B run view に統合される。モデル生成コードやツール呼び出しが増えるほど、企業には拡張可能で監査可能な実行レイヤーが必要になる。

## 2. モデル最前線 & アルゴリズム探索

### Datadog Toto 2.0 は時系列基盤モデルも scaling era に入り始めたことを示した

- 出典：Datadog
- 日付：2026-05-14
- リンク：https://www.datadoghq.com/blog/ai/toto-2/
- 要約：Datadog は 4M から 2.5B パラメータまでの open-weights 時系列予測モデル群 Toto 2.0 を発表し、重みと分散 u-μP training library を Apache 2.0 ライセンスで公開した。Datadog は Toto 2.0 が BOOM、GIFT-Eval、TIME で上位になり、各モデルサイズが一つ小さいサイズより改善していると説明している。block decoding などで長い予測窓も改善しており、基盤モデル路線が observability、金融、エネルギー、天気などの時系列タスクへ広がっている。

### Goodfire は Llama 3.1 8B の中に操作可能な「幾何学的計算機」を見つけた

- 出典：Goodfire
- 日付：2026-05-14
- リンク：https://www.goodfire.ai/research/a-geometric-calculator
- 要約：Goodfire は Llama 3.1 8B が「August の 6 か月後は何月か」といった問いにどう答えるかを調べ、モデルが月を数字へ写像し、activation space の中で Fourier features による円形表現を使い、mod 演算に近い加算を行ってから月へ戻していることを示した。steering によりこの内部加算モジュールが最終出力に影響することも確認しており、機構解釈は関連 neuron を探す段階から、介入可能で再利用される計算モジュールを特定する段階へ進んでいる。

### Zyphra ZAYA1-8B は小さな活性パラメータ、高効率、AMD 訓練スタックに賭けている

- 出典：Zyphra
- 日付：2026-05-05
- リンク：https://www.zyphra.com/our-work/zaya1-8b
- 要約：Zyphra は ZAYA1-8B を発表した。これは総 8B パラメータ、活性パラメータ 10 億未満の MoE reasoning model で、AMD MI300x クラスター上で訓練され、Apache 2.0 ライセンスで公開されている。Compressed Convolutional Attention、改良 router、learned residual scaling、大規模 post-training / RL により、数学、コード、指示追従で高いパラメータ効率を狙う。Markovian RSA は並列生成、再帰的集約、固定長 context window を組み合わせる test-time compute 手法だ。

## 3. 実践コード & ツールライブラリ

### GitHub Copilot App は Agent 開発を issue、ブランチ、diff、検証、PR のデスクトップ閉ループにした

- 出典：GitHub
- 日付：2026-05-14
- リンク：https://github.blog/changelog/2026-05-14-github-copilot-app-is-now-available-in-technical-preview/
- 要約：GitHub Copilot App が技術プレビューに入り、GitHub-native desktop experience として位置付けられた。issue、PR、prompt、過去セッションから作業を開始し、各セッションは独立したブランチ、ファイル、会話、タスク状態を持つ。ユーザーは一時停止と再開、複数プロジェクトでの並行作業、計画と diff の確認、コマンド実行とプレビュー確認を行い、最後は PR review、checks、Agent Merge を通じて変更を着地させる。coding agent は IDE plugin だけでなく、レビューと長期セッションを中心にしたワークベンチへ広がっている。

### Prime Intellect は自己改善 Agent の訓練フローを端から端までのプラットフォームにした

- 出典：Prime Intellect
- 日付：2026-05-15
- リンク：https://www.primeintellect.ai/
- 要約：Prime Intellect は、agentic models を訓練、評価、デプロイ、継続改善する open stack として自社プラットフォームを位置付けている。hosted evaluations、RL environments、managed training workflows、serverless / dedicated inference、production data を fine-tuning に戻す閉ループまでを扱う。LangSmith Engine、CoreWeave Sandboxes と並べると、Prime Intellect は training / post-training workflow、LangSmith は production trace からの修正提案、CoreWeave は隔離実行層に寄っている。

## 4. 業界 & ビジネス速報

### Abridge は ambient scribe から臨床インテリジェンス層へ進み、鍵は文脈と評価にある

- 出典：Latent.Space / Abridge
- 日付：2026-05-14
- リンク：https://www.latent.space/p/abridge
- 要約：Abridge は臨床記録から入り、臨床意思決定支援、prior authorization、payer / provider / pharma workflows、診察前後の real-time Agent へ製品を広げている。インタビューでは、今年 8000 万件以上の医患対話を支援し、250 の複雑な米国医療システム、28 以上の言語、50 以上の専門科をカバーする見込みだと語られている。技術課題は EHR data、保険者 policy、医学文献、病院固有ガイドライン、clinician、LLM judge、第三者評価、専門科別 eval から成る安全な展開プロセスにある。

### Figure の Helix-02 長時間自律仕分けデモは、ロボット評価を短い動画から uptime へ押し出した

- 出典：Interesting Engineering
- 日付：2026-05-14
- リンク：https://interestingengineering.com/ai-robotics/figure-ai-humanoids-24-hour-autonomous-run
- 要約：Figure は Helix-02 を軸に、荷物仕分け向けの長時間自律稼働を示した。報道によれば、3 台のロボットが 24 時間テストで約 2.8 万個の荷物を処理した。数秒のハイライト動画に比べると、このような長時間稼働は物流や製造が本当に見る指標に近い。throughput、失敗からの復帰、例外処理、充電と保守のリズム、遠隔介入の境界である。外部からは透明な統計と第三者検証が必要だが、評価軸が「一度できるか」から「一勤務を安定してこなせるか」へ移っている。

## 5. GitHub 人気 repo & トレンド追跡

### NousResearch/hermes-agent：自己改善 Agent は記憶、技能、多端入口を一つの runtime にまとめ始めた

- 出典：GitHub
- 日付：2026-05-15
- リンク：https://github.com/NousResearch/hermes-agent
- 要約：Latent.Space は AINews で Nous / Hermes Agent と Codex runtime の連携を取り上げた。リポジトリを見ると、Hermes は persistent memory、skill self-improvement、cross-session search、Telegram / Discord / Slack / CLI の多端入口、scheduled automations、subagent parallelism、SSH / Docker / Modal / Daytona などの terminal backend を一つの agent runtime にまとめている。coding agent は単体ツールから、常駐し、移動でき、組み合わせられる個人作業システムへ広がっている。

### AtomicBot-ai/atomic-llama-cpp-turboquant：ローカル推論コミュニティは MTP、NextN、KV 圧縮で速度実験を続けている

- 出典：GitHub
- 日付：2026-05-15
- リンク：https://github.com/AtomicBot-ai/atomic-llama-cpp-turboquant
- 要約：Latent.Space は LocalLLaMA の Multi-Token Prediction、TurboQuant、Qwen / llama.cpp 高速化に関する議論を収録した。対応するリポジトリは llama.cpp fork で、Gemma 4 MTP speculative decoding、Qwen NextN speculative decoding、TurboQuant KV cache / weight compression を掲げている。重要なのは特定の速度数字が確定したことではなく、speculative decoding、低ビット KV、Metal / CUDA / Vulkan / HIP kernel、model-specific draft head を組み合わせる端側最適化が活発化していることだ。

## 📬 Newsletter 精選

### Latent.Space：Everything is Conductor

- 出典：Latent.Space / AINews
- 日付：2026-05-15
- リンク：https://www.latent.space/p/ainews-everything-is-conductor
- 要約：Latent.Space の今日の AINews は、複数の coding-agent 関連イベントを同じ枠組みに置いた。OpenAI Codex のモバイル対応とリモート環境、GitHub Copilot App、VS Code Agents、Nous / Hermes の Codex runtime 統合、そして Claude Code の第三者 wrapper とサブスクリプション利用境界をめぐる議論である。観察は「Everything is Conductor」だ。各社は、複数の Agent workstream を並行管理し、状態、diff、検証、公開出口を持つインターフェースを作っている。開発者にとっては、今後の選定軸がモデル性能だけでなく、セッション可搬性、課金透明性、BYOK / provider abstraction、組織ガバナンスにも広がる。

### Daily Dose：Claude Code `/goal` は長時間 Agent セッションに判定可能な終点を与える

- 出典：Daily Dose of Data Science
- 日付：2026-05-14
- リンク：https://blog.dailydoseofds.com/p/claude-codes-goal-command
- 要約：Daily Dose は Claude Code の `/goal` コマンドを紹介した。ユーザーが判定可能な目標を与えると、Claude Code は evaluator model が会話 transcript から目標達成を判断するまで作業を続ける。記事は、目標は「関連テストが通る、lint がきれい、CHANGELOG が更新済み」のように具体的であるべきで、「アプリを production-ready にする」のように曖昧ではいけないと強調する。また evaluator 自身はツールを実行せず、ファイルも読まず、会話に提示された証拠だけを判断する。長時間自動化を信頼できるものにするには、目標、検証コマンド、制約、停止条件を明確に書く必要がある。
