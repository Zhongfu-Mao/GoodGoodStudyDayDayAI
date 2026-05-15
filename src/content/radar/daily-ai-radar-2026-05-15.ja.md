---
title: "AI レーダー日報：2026-05-15"
date: 2026-05-15
category: radar
cadence: daily
plainSummary: "今日は Codex のモバイル対応と Windows サンドボックス、GitHub Copilot App、LangSmith Engine、CoreWeave Sandboxes、Abridge の臨床インテリジェンス、そして Toto 2.0、Goodfire の機構解釈、ZAYA1-8B に注目します。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agent
  - Infrastructure
  - Healthcare
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-05-15.ja-infographic.webp
audioUrl: /audio/radar/daily-ai-radar-2026-05-15.ja.mp3
audioDuration: 678
audioSize: 5421329
draft: false
---

## 本期范围

- 対象期間：2026-05-14 から 2026-05-15 まで。

---
![GitHub Copilot app is now available in technical preview - GitHub Changelog](https://github.blog/wp-content/uploads/2026/05/592092890-963e7db5-6624-424c-ae06-58e77761491f.jpg)

*代表画像は [GitHub Copilot app is now available in technical preview - GitHub Changelog](https://github.blog/changelog/2026-05-14-github-copilot-app-is-now-available-in-technical-preview/) から。この記事の主線を最もよく表す元シグナルとして選んでいます。*

## 代表图说明

今日の主線は、「AI Agent がコードを書く補助役から、長時間稼働し、複数デバイスで操作でき、システム境界に制御される実行レイヤーへ移行している」という流れです。OpenAI は Codex をモバイルとリモート環境に広げ、GitHub は issue / PR を入口にする Copilot デスクトップアプリを出し、LangChain と CoreWeave は本番 trace、自己改善、隔離実行環境を補っています。同時に、Abridge、Datadog、Goodfire、Zyphra はもう一つの線を示しています。AI システムの強みは、モデル単体だけでなく、文脈、評価、実行基盤、そしてモデル内部機構の理解から生まれるようになっています。

## 1. AI Engineering & 架构

### OpenAI が Codex を ChatGPT モバイルに持ち込み、リモート Agent セッションは単一開発機から離れ始めた

- 来源：OpenAI
- 日期：2026-05-14
- 链接：https://openai.com/index/work-with-codex-from-anywhere
- 摘要：OpenAI は Codex を ChatGPT モバイルアプリのプレビューに追加し、ユーザーがスマートフォンから実行中セッションを確認し、コマンドを承認し、モデルを切り替え、スクリーンショット、ターミナル出力、diff、テスト結果を確認できるようにした。さらに Codex はローカル PC、Mac mini、管理されたリモート環境など複数のマシンに接続でき、安全な relay により開発機をインターネットに公開せずにセッション状態を同期する。この発表は、coding agent の体験が「端末の前で操作するもの」から「複数のマシンとタスクを任せ、重要な判断だけ随時介入するもの」へ移っていることを示している。

### Codex の Windows サンドボックスは、Agent 安全性がプロンプトと環境変数だけでは成立しないことを示した

- 来源：OpenAI
- 日期：2026-05-13
- 链接：https://openai.com/index/building-codex-windows-sandbox
- 摘要：OpenAI は Codex の Windows サンドボックス設計で直面した制約を説明した。Codex は既定で広く読み取り、ワークスペース内だけに書き込み、オフラインまたは制御されたネットワークで動く必要があるが、Windows の既存機構はこの形にそのまま合わない。最終的にチームは独立したサンドボックスユーザー、ACL、専用 runner、ファイアウォールルールを組み合わせ、実ユーザープロセスと制限付きコマンド実行主体を分離した。結論は明確だ。Agent にコードを実行させるなら、権限境界は OS とネットワーク層に置く必要があり、「ネットにつながない」「ここに書かない」をモデルの振る舞いだけに任せてはいけない。

### GitHub Copilot App は Agent 開発を issue、ブランチ、diff、検証、PR のデスクトップ閉ループにした

- 来源：GitHub
- 日期：2026-05-14
- 链接：https://github.blog/changelog/2026-05-14-github-copilot-app-is-now-available-in-technical-preview/
- 摘要：GitHub Copilot App が技術プレビューに入り、GitHub-native desktop experience として位置付けられた。issue、PR、prompt、過去セッションから作業を開始し、各セッションは独立したブランチ、ファイル、会話、タスク状態を持つ。ユーザーは一時停止と再開、複数プロジェクトでの並行作業、計画と diff の確認、コマンド実行とプレビュー確認を行い、最後は PR review、checks、Agent Merge を通じて変更を着地させる。Codex モバイルと同じく、coding agent の形は IDE プラグインだけでなく、リポジトリオブジェクト、レビュー、長期セッションを中心にしたワークベンチへ広がっている。

### LangSmith Engine と SmithDB は Agent 観測を「失敗発見、修正生成、評価追加」の閉ループへ進めた

- 来源：LangChain
- 日期：2026-05-14
- 链接：https://www.langchain.com/blog/interrupt-2026-overview
- 摘要：LangChain は Interrupt 2026 で LangSmith Engine、SmithDB、Managed Deep Agents、Context Hub、LLM Gateway などを発表した。LangSmith Engine は本番 traces を監視し、失敗をクラスタリングし、根本原因を診断し、コード修正と eval coverage を提案する。SmithDB は Agent observability 向けのデータベースで、深くネストした span、長時間にわたるイベント、マルチモーダル trace、大量クエリを前提にしている。チームにとっての意味は、Agent の観測が「呼び出しログを残す」段階から、本番改善サイクルの一部へ進んでいるということだ。

### CoreWeave Sandboxes は RL、Agent ツール呼び出し、モデル評価の隔離実行レイヤーを製品化した

- 来源：CoreWeave
- 日期：2026-05-14
- 链接：https://www.coreweave.com/news/coreweave-sandboxes-launches-to-accelerate-reinforcement-learning-agent-tool-use-and-model-evaluation
- 摘要：CoreWeave は Sandboxes を発表し、強化学習、Agent のツール利用、モデル評価のための隔離実行環境を提供する。入口は二つあり、顧客自身の CoreWeave Kubernetes Service クラスターで動かす方法と、Weights & Biases の serverless runtime から使う方法がある。各 sandbox は既定で隔離された仮想環境で動き、活動ログは W&B run view に直接統合される。この方向は重要だ。モデル訓練と Agent 評価では、モデルが生成したコード、コマンド、ツール呼び出しが大量に走るため、企業には各チームの脆い自作基盤ではなく、拡張可能で監査可能な実行レイヤーが必要になる。

## 2. 模型前沿 & 算法探索

### Datadog Toto 2.0 は時系列基盤モデルも scaling era に入り始めたことを示した

- 来源：Datadog
- 日期：2026-05-14
- 链接：https://www.datadoghq.com/blog/ai/toto-2/
- 摘要：Datadog は 4M から 2.5B パラメータまでの open-weights 時系列予測モデル群 Toto 2.0 を発表し、重みと分散 u-μP 訓練ライブラリを Apache 2.0 ライセンスで公開した。Datadog は Toto 2.0 が BOOM、GIFT-Eval、TIME で上位になり、各モデルサイズが一つ小さいサイズより改善していると説明している。また contiguous patch masking により、予測をより並列に実行し、長い予測窓のレイテンシを下げる。これは、基盤モデル路線がテキスト、画像、コードから observability、金融、エネルギー、天気などの時系列タスクへ広がっていることを示す。ただし実価値は、汚染制御、長期予測の安定性、下流業務指標に依存する。

### Goodfire は Llama 3.1 8B の中に操作可能な「幾何学的計算機」を見つけた

- 来源：Goodfire
- 日期：2026-05-14
- 链接：https://www.goodfire.ai/research/a-geometric-calculator
- 摘要：Goodfire は Llama 3.1 8B が「August の 6 か月後は何月か」といった問いにどう答えるかを調べ、モデルが月を数字へ写像し、activation space の中で Fourier features による円形表現を使い、mod 演算に近い加算を行ってから月へ戻していることを示した。さらに steering により、この内部加算モジュールが最終出力に実際に影響していることを確認し、同じモジュールが複数の addition-like task で再利用される様子も示した。重要なのは月の問題そのものではなく、機構解釈が「関連 neuron を見つける」段階から「介入可能で再利用される内部計算モジュールを特定する」段階へ進んでいる点だ。

### Zyphra ZAYA1-8B は小さな活性パラメータ、高効率、AMD 訓練スタックに賭けている

- 来源：Zyphra
- 日期：2026-05-05
- 链接：https://www.zyphra.com/post/zaya1-8b
- 摘要：Zyphra は ZAYA1-8B を発表した。これは総 8B パラメータ、活性パラメータは 10 億未満の MoE reasoning model で、AMD MI300x クラスター上で訓練され、Apache 2.0 ライセンスで公開されている。公式は Compressed Convolutional Attention、改良 router、learned residual scaling、大規模 post-training / RL により、数学、コード、指示追従などで高いパラメータ効率を得たと説明している。さらに Markovian RSA により、並列生成、再帰的集約、固定長 context window を組み合わせる。これは、総パラメータを増やすだけでなく、活性パラメータ、FLOP、test-time compute あたりの出力を高める別路線を示している。

## 3. 垂直场景 & 产品落地

### Abridge は ambient scribe から臨床インテリジェンス層へ進み、鍵は文脈と評価にある

- 来源：Latent Space / Abridge
- 日期：2026-05-14
- 链接：https://www.latent.space/p/abridge
- 摘要：Abridge は臨床記録から入り、臨床意思決定支援、prior authorization、payer / provider / pharma ワークフロー、診察前後のリアルタイム Agent へ製品を広げている。インタビューでは、今年 8000 万件以上の医患対話を支援し、250 の複雑な米国医療システム、28 以上の言語、50 以上の専門科をカバーする見込みだと語られている。技術課題は EHR データ、保険者ポリシー、医学文献、病院固有のガイドライン、そして clinician、LLM judge、第三者評価、専門科別 eval から成る安全な展開プロセスにある。この事例は、垂直 AI の本当の壁がモデルだけでなく、高品質な文脈、ドメインワークフロー、プライバシー準拠、継続評価にあることを示している。

### Figure の Helix-02 長時間自律仕分けデモは、ロボット評価を短い動画から uptime へ押し出した

- 来源：Figure AI / Interesting Engineering
- 日期：2026-05-14
- 链接：https://interestingengineering.com/ai-robotics/figure-ai-humanoids-24-hour-autonomous-run
- 摘要：Figure は Helix-02 を軸に、荷物仕分け向けの長時間自律稼働を示した。報道によれば、3 台のロボットが 24 時間テストで約 2.8 万個の荷物を処理した。数秒のハイライト動画に比べると、このような長時間稼働は物流や製造が本当に見る指標に近い。つまり throughput、失敗からの復帰、例外処理、充電と保守のリズム、遠隔介入の境界である。もちろん外部からはより透明な統計と第三者検証が必要だが、評価の語り口が「一度できるか」から「一勤務を安定してこなせるか」へ移ること自体が重要な変化だ。

### Prime Intellect Lab は自己改善 Agent の訓練フローを端から端までのプラットフォームにした

- 来源：Prime Intellect
- 日期：2026-05-07
- 链接：https://www.primeintellect.ai/
- 摘要：Prime Intellect は Lab を self-improving agents の訓練プラットフォームとして位置付け、タスク定義、評価環境、reward signal、trace review、adapter deployment、inference までを扱うとしている。これは LangSmith Engine や CoreWeave Sandboxes と並べて見ると分かりやすい。Prime Intellect は訓練と post-training workflow、LangSmith は本番 trace から修正提案、CoreWeave は隔離実行レイヤーに寄っている。Agent engineering はより明確な階層を持ち始めている。モデルの外側に、環境、評価、報酬、軌跡、ガバナンス、デプロイの連鎖が必要になる。

## 📬 Newsletter 精选

### Latent Space は Codex、Copilot App、VS Code Agents、Claude Code 論争を同じ製品線としてつないだ

- 来源：Latent Space
- 日期：2026-05-15
- 链接：https://www.latent.space/p/ainews-everything-is-conductor
- 摘要：Latent Space の今日の AINews は、複数の coding-agent 関連イベントを同じ枠組みに置いた。OpenAI Codex のモバイル対応とリモート環境、GitHub Copilot App、VS Code Agents、Nous / Hermes の Codex runtime 統合、そして Claude Code の第三者 wrapper とサブスクリプション利用境界をめぐる議論である。観察は「Everything is Conductor」だ。各社は、複数の Agent workstream を並行管理し、状態、diff、検証、公開出口を持つインターフェースを作っている。開発者にとっては、今後の選定軸がモデル性能だけでなく、セッション可搬性、課金透明性、BYOK / provider abstraction、組織ガバナンスにも広がる。

### Daily Dose は Claude Code `/goal` で、長時間 Agent セッションには判定可能な目標が必要だと示した

- 来源：Daily Dose of Data Science
- 日期：2026-05-14
- 链接：https://blog.dailydoseofds.com/p/claude-codes-goal-command
- 摘要：Daily Dose は Claude Code の `/goal` コマンドを紹介した。ユーザーが判定可能な目標を与えると、Claude Code は evaluator model が会話 transcript から目標達成を判断するまで作業を続ける。記事は、目標は「関連テストが通る、lint がきれい、CHANGELOG が更新済み」のように具体的であるべきで、「アプリを production-ready にする」のように曖昧ではいけないと強調する。また evaluator 自身はツールを実行せず、ファイルも読まず、会話に提示された証拠だけを判断する。この模式は他の Agent ワークフローにも移植しやすい。長時間自動化を信頼できるものにするには、目標、検証コマンド、制約、停止条件を明確に書く必要がある。
