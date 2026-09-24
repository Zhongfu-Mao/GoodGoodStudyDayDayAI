---
title: "AIレーダー日報：2026-09-24"
date: 2026-09-24
category: radar
cadence: daily
audioUrl: /audio/radar/daily-ai-radar-2026-09-24.ja.mp3
audioDuration: 135
audioSize: 1078314
draft: false
plainSummary: "Claude Opus 5.5、Reka EdgeQ、DigitalOcean Managed Agents、VS Code Agents windowに進展。Step CodeとMentalHealthBenchは実装と評価の新しい入口を示し、Google Beamとウクライナのサイバー防衛計画は応用領域を広げた。UniverとStrandsはGitHubトレンドに登場。"
difficulty: intermediate
tags: [AI Engineering, Agents]
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-09-24.ja-infographic.webp
representativeImageSource: https://www.anthropic.com/claude-opus-5-5
---

> 本号は2026-09-23から2026-09-24（JST）を対象とし、各項目には元の公開日を記しています。GitHub項目の日付はトレンド観測日であり、初回公開日ではありません。

---
![Introducing Claude Opus 5.5](https://www-cdn.anthropic.com/images/4zrzovbb/website/f4d37a1d1f582f53f4e89440062b649b6273a093-1200x630.jpg)

*代表画像は [Anthropic の Claude Opus 5.5 発表ページ](https://www.anthropic.com/claude-opus-5-5) から。モデルの更新と Agent 開発基盤の進展を示す本号の主題に重なります。*

## 1. AI Engineering & アーキテクチャ

### DigitalOceanがManaged Agentsの公開プレビューを開始：Agent実行環境をクラウド基盤へ

- 出典：DigitalOcean / Latent.Space AINews
- 日付：2026-09-22（米国時間；2026-09-23 JST）
- リンク：https://www.digitalocean.com/blog/managed-agents-public-preview
- 要約：DigitalOceanはManaged Agentsの公開プレビューを発表し、Agentのデプロイ、モデル接続、運用管理を一つのクラウド基盤に置く方向を示した。既存のコーディングAgentや独自のAgentワークフローを対象とする。現段階ではプレビュー製品として可用性、権限境界、料金を評価すべきであり、発表だけで本番運用の成熟度は判断できない。

### VS CodeのAgents windowがワークスペースをまたぐAgentセッション管理を提供

- 出典：Visual Studio Code
- 日付：2026-09-22（公開情報；2026-09-23 JST）
- リンク：https://code.visualstudio.com/docs/agents/run/agents-window
- 要約：VS CodeはAgents windowを独立したAgent向けウィンドウとして説明し、複数のワークスペースにわたってセッションを開始、追跡、レビュー、終了できるようにした。プレビュー機能は単一チャット欄から複数タスクの管理画面へと進むものだが、PRコメント、失敗したチェック、競合の解決結果は開発者による差分とテストの確認が必要だ。

## 2. モデル最前線 & アルゴリズム探索

### Claude Opus 5.5公開：Anthropicは複雑な仕事の性能向上と運用費低下を主張

- 出典：Anthropic
- 日付：2026-09-22（米国時間；2026-09-23 JST）
- リンク：https://www.anthropic.com/claude-opus-5-5
- 要約：AnthropicはClaude 5.5ファミリー最初のモデルOpus 5.5を発表し、多くの仕事でFable 5.1と同水準、Opus 5より運用費が約40%低いとする。外部評価者による試験と社内の行動監査にも言及している。ただし性能と費用の数字は主として同社の測定であり、高い推論設定での実際のタスク総費用はトークン使用量と負荷に左右される。

### Reka EdgeQが視覚言語推論をスマートフォンのNPUで実行

- 出典：Reka
- 日付：2026-09-22（公開情報；2026-09-23 JST）
- リンク：https://reka.ai/labs/research/reka-edgeq
- 要約：RekaはSnapdragon 8 EliteのHexagon NPU向けに最適化したEdgeQを紹介し、Samsung S25上で画像理解、動画分析、物体位置特定を実行した。精度だけでなく端末内の遅延、電力消費、GPUを空けられる点を合わせて評価している。速度、電力、ベンチマークの値は同社の測定であり、別の端末や熱条件での再確認が必要だ。

## 3. 実践コード & ツールライブラリ

### Step Codeがオープンソース化：端末の作業ループ、Skills、長期タスク委譲

- 出典：StepFun / GitHub
- 日付：2026-09-22（公開情報；2026-09-23 JST）
- リンク：https://github.com/stepfun-ai/Step-Code
- 要約：StepFunはコードの読み取り、変更、テスト実行まで扱う端末用AgentのStep Codeを公開した。MCP、Agent Skills、プラグイン、複数Agentの構成にも対応し、長期タスク委譲と静的ページ公開の入口もある。リポジトリは試用の出発点になるが、トークン効率や評価順位に関する数字は開発元の報告として扱うべきだ。

### MentalHealthBench公開：メンタルヘルス対話を状況別に評価

- 出典：OpenAI
- 日付：2026-09-23
- リンク：https://openai.com/index/introducing-mentalhealthbench/
- 要約：OpenAIはMentalHealthBenchを公開し、緊急時の応答だけでなく、より幅広く現実的なメンタルヘルス対話で専門家が状況ごとに設定した指針にAIが沿うかを測る。安全研究のためのオープンな基準だが、スコアは臨床評価の代わりにならず、チャットモデルが専門医療の代替として適する証明でもない。

## 4. 業界 & ビジネス速報

### Google Beamが新たに5か国へ拡大：没入型の遠隔会議をオフィス網へ

- 出典：Google
- 日付：2026-09-23
- リンク：https://blog.google/innovation-and-ai/technology/research/google-beam-expansion/
- 要約：Googleは没入型ビデオ会議サービスBeamを新たに5か国へ広げ、Industriousとの提携で体験拠点も拡充すると発表した。初期の実演から顧客とオフィスのネットワークへ進みつつあるが、導入効果は専用機器、設置場所、ネットワーク条件に左右される。一般的なビデオ会議の全面的な代替になったわけではない。

### OpenAIがウクライナにDaybreakへのアクセスを提供：民間インフラのサイバー防衛向け

- 出典：OpenAI
- 日付：2026-09-23
- リンク：https://openai.com/index/openai-extends-cyber-access-to-ukraine-for-civilian-defense/
- 要約：OpenAIはウクライナのデジタル変革省と協力し、民間インフラの許可されたサイバー防衛にDaybreakを使えるようにすると発表した。古いソフトウェアの調査、不審な活動の分析、脆弱性の検証、修正の試験を想定する。発表はアクセス提供と協力計画を示すもので、具体的な防衛効果と導入範囲は独立に確認できない。

## 5. GitHub 人気 repo & トレンド追跡

### Univerがトレンドに登場：文書と表計算を一つの実行環境に埋め込む

- 出典：GitHub Trending / dream-num
- 日付：2026-09-24（トレンド観測）
- リンク：https://github.com/dream-num/univer
- 要約：Univerは表計算、文書、プレゼンテーションを製品に組み込むためのオープンソースSDKを提供する。プラグイン、Canvas描画、数式エンジン、統一APIを備え、オフィス機能をAgent向け実行環境として構成しつつある。READMEではPDFなどを今後の機能としており、導入前に必要なモジュールとライセンスを確認したい。

### Strands harness-sdkがトレンドに登場：Agentループにライフサイクル制御を追加

- 出典：GitHub Trending / strands-agents
- 日付：2026-09-24（トレンド観測）
- リンク：https://github.com/strands-agents/harness-sdk
- 要約：StrandsのPython・TypeScript SDKは、Agentループに加えてターン数とトークンの予算、キャンセル、ツール、構造化出力、セッション、観測、評価を提供する。独自ループを作る際に後から必要になる制御層をまとめた設計であり、モデルの移植性や本番環境での信頼性は利用先で検証する必要がある。

## 📬 Newsletter 精選

### The Rundown：a16zが1年制の起業教育プログラムを計画

- 出典：The Rundown AI
- 日付：2026-09-23
- リンク：https://www.therundown.ai/articles/the-pacing-era-s-first-launch-day
- 要約：The RundownはHorowitz Andreessen Academyの計画を紹介した。初年度は2027年秋に約50人を募集し、従来の学位課程に代わり起業プロジェクト、企業との協働、業界関係者の授業を中心に据える予定だ。まだ初期段階であり、規模、将来の学費、教育成果を確定事項とみなすことはできない。

### Latent.Space：生物セキュリティの防御もAI能力競争の一部に

- 出典：Latent.Space
- 日付：2026-09-23
- リンク：https://www.latent.space/p/bio-security-is-an-ai-arms-race-eric
- 要約：このインタビューは、モデルが生物研究能力を高める一方、防御側のスクリーニングや実験検証をどう追いつかせるかを論じる。取材相手はマルチモーダルなツールと開かれた防御能力を生物安全の仕組みに含めるべきだと主張する。攻防構造に関する見解と研究方向であり、防御体制の有効性が実証されたという意味ではない。

### Daily Dose：MoE推論では重み、専門家の計算、通信を分けて測る

- 出典：Daily Dose of Data Science
- 日付：2026-09-23（米国時間；2026-09-24 JST）
- リンク：https://blog.dailydoseofds.com/p/moe-inference-engineering-clearly
- 要約：記事はトークンの経路に沿ってルーティング、dispatch、専門家ごとの計算、combineを説明し、総パラメータの保存量とトークンごとの実行量を区別する。まず重みとKVキャッシュ容量を測り、次に専門家間の負荷偏りとGPU間通信を見ることを勧める。量子化やtop-k削減は数値や計算経路を変えるため、純粋な実行時最適化とは分ける必要がある。

### ByteByteGo：モデルのカスタマイズにはプロンプト、検索、アダプターもある

- 出典：ByteByteGo
- 日付：2026-09-23（米国時間；2026-09-24 JST）
- リンク：https://blog.bytebytego.com/p/how-to-customize-a-model-to-learn
- 要約：ByteByteGoはプロンプト設計、検索拡張、LoRA/QLoRA、全体の微調整を比べ、タスク上の不足と利用できるデータに応じて選ぶと説く。新しい知識が必要なら重みを変えるより検索が直接的な場合が多い。安定した出力行動や分野固有の技能が必要なら学習を検討し、データ品質、運用費、回帰テストも評価する。
